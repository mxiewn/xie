// xie · vocab-store.js — từ vựng trên trình duyệt: tải dữ liệu từ khi cần, lưu tiến độ học,
// ghi mỗi lần trả lời vào cả srs + lượt mục tiêu (progress) + sổ lỗi + câu của tui.
// logic thuần ở vocab-core.js, vocab-state.js, srs.js.

import { readRaw, writeRaw } from './storage.js';
import { todayIn } from './state-core.js';
import { getState } from './state.js';
import { normalizeItem } from './vocab-core.js';
import {
  migrateVocab, migrateSentences, migrateMistakes, migrateMyWords, startLearning as coreStart, setUserFields as coreSetUser,
  addSentence, updateSentence as coreUpdateSentence, addMistake, categoryFor, outputCount, isLearning,
} from './vocab-state.js';
import { review, newItem } from './srs.js';
import { recordAnswer, setCounters } from './progress.js';

export const VOCAB_EVENT = 'xie:vocab';

// ---------- dữ liệu từ (json tĩnh, tải khi cần) ----------
let indexPromise = null;
const topicPromises = new Map();
const itemCache = new Map();

function fetchJson(path) {
  return fetch(new URL(path, import.meta.url)).then((r) => (r.ok ? r.json() : null)).catch(() => null);
}

export function loadIndex() {
  indexPromise ||= fetchJson('../data/vocab/index.json').then((d) => d || { version: 1, topics: [] });
  return indexPromise;
}

export async function topicsInfo() {
  return (await loadIndex()).topics;
}

export function loadTopic(topicId) {
  if (topicId === 'tu-cua-tui') return Promise.resolve(myWordItems());
  if (!topicPromises.has(topicId)) {
    topicPromises.set(topicId, loadIndex().then(async (index) => {
      const t = index.topics.find((x) => x.id === topicId);
      if (!t) return [];
      const data = await fetchJson(`../data/vocab/${t.file}`);
      const items = (data?.items || []).map(normalizeItem).filter(Boolean);
      for (const it of items) itemCache.set(it.id, it);
      return items;
    }));
  }
  return topicPromises.get(topicId);
}

export async function loadAll() {
  const topics = await topicsInfo();
  const lists = await Promise.all(topics.map((t) => loadTopic(t.id)));
  return [...lists.flat(), ...myWordItems()];
}

// id dạng "<chủ-đề>-<số>" (sổ excel, xie) hoặc "my-…" (từ của tui)
export function topicIdOf(id) {
  if (String(id).startsWith('my-')) return 'tu-cua-tui';
  return itemCache.get(id)?.topic || String(id).replace(/-\d+$/, '');
}

export async function findItem(id) {
  if (itemCache.has(id)) return itemCache.get(id);
  const mine = myWordItems().find((x) => x.id === id);
  if (mine) return mine;
  await loadTopic(topicIdOf(id));
  return itemCache.get(id) || null;
}

export const cachedItem = (id) => itemCache.get(id) || myWordItems().find((x) => x.id === id) || null;

// ---------- localStorage ----------
function readJson(key, migrate) {
  try { return migrate(JSON.parse(readRaw(key) || 'null')); } catch { return migrate(null); }
}

const stores = {
  vocab: { key: 'vocab', migrate: migrateVocab, cache: null },
  sentences: { key: 'sentences', migrate: migrateSentences, cache: null },
  mistakes: { key: 'mistakes', migrate: migrateMistakes, cache: null },
  myWords: { key: 'my-words', migrate: migrateMyWords, cache: null },
};

function get(name) {
  const s = stores[name];
  s.cache ||= readJson(s.key, s.migrate);
  return s.cache;
}

function save(name, value) {
  const s = stores[name];
  s.cache = value;
  writeRaw(s.key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(VOCAB_EVENT, { detail: { store: name } }));
  return value;
}

export const getVocab = () => get('vocab');
export const getSentences = () => get('sentences');
export const getMistakes = () => get('mistakes');
export const getMyWords = () => get('myWords');

function myWordItems() {
  const items = getMyWords().items;
  for (const it of items) itemCache.set(it.id, it);
  return items;
}

// số liệu cho cấp + huy hiệu (kho output, từ của tui)
function syncCounters() {
  return setCounters({ output_words: outputCount(getVocab()), my_words: getMyWords().items.length });
}

export function setFront(front) {
  save('vocab', { ...getVocab(), front });
}

export function setUserFields(id, patch) {
  save('vocab', coreSetUser(getVocab(), id, patch));
}

export function startLearning(id) {
  save('vocab', coreStart(getVocab(), id, { now: Date.now(), today: todayIn() }));
}

// ---------- từ của tui ----------
export function saveMyWord(item) {
  const list = getMyWords().items.filter((x) => x.id !== item.id);
  save('myWords', { ...getMyWords(), items: [...list, item] });
  itemCache.set(item.id, item);
  if (!isLearning(getVocab().items[item.id])) startLearning(item.id); // tự vào srs
  return syncCounters();
}

export function deleteMyWord(id) {
  save('myWords', { ...getMyWords(), items: getMyWords().items.filter((x) => x.id !== id) });
  const v = getVocab();
  const items = { ...v.items };
  delete items[id];
  save('vocab', { ...v, items });
  itemCache.delete(id);
  syncCounters();
}

// ---------- câu của tui ----------
export function updateSentence(id, patch) {
  save('sentences', coreUpdateSentence(getSentences(), id, patch));
}

// ---------- ghi một lần trả lời ----------
/**
 * item: mục từ; question: từ makeQuestion; outcome:
 *   { correct: true | false, hinted, hard, ms, answer (chữ đã gõ / chọn),
 *     output: { mode: "write" | "speak", text, passed } (chỉ mức 4) }
 * trả về { result (progress: lượt, sự kiện…), promoted, output (vừa vào kho), events }
 */
export function answer(item, question, outcome) {
  const now = Date.now();
  const today = todayIn();
  let vocab = getVocab();
  if (!isLearning(vocab.items[item.id])) vocab = coreStart(vocab, item.id, { now, today });
  const before = vocab.items[item.id] || newItem(now, today);

  const out = outcome.output;
  const grade = out ? (out.passed ? 'right' : 'wrong') : outcome.correct ? (outcome.hinted || outcome.hard ? 'hard' : 'right') : 'wrong';
  const r = review(before, question.stage, grade, { now, today });
  vocab = { ...vocab, items: { ...vocab.items, [item.id]: r.item } };
  save('vocab', vocab);

  // lượt mục tiêu + chống cày
  const kind = out ? (out.mode === 'speak' ? 'speaking_p1' : 'sentence') : question.kind;
  const event = {
    kind,
    item: `vocab:${item.id}:${question.stage}${question.tag ? `:${question.tag}` : ''}`,
    correct: out ? null : Boolean(outcome.correct),
    ms: outcome.ms,
    tags: question.tag === 'prep' ? ['prep'] : [],
  };
  if (out && out.mode === 'write') event.words = (String(out.text).match(/[\p{L}\p{N}'-]+/gu) || []).length;
  const result = recordAnswer(event);

  // sổ lỗi
  if (!out && !outcome.correct) {
    save('mistakes', addMistake(getMistakes(), {
      item: item.id, phrase: item.phrase, stage: question.stage, category: categoryFor(question),
      answer: String(outcome.answer || '').slice(0, 300), expected: String(question.answer || item.phrase).slice(0, 300), date: today, at: now,
    }));
  }

  // câu của tui: mọi câu tự viết (và ý chính khi nói, nếu có ghi)
  if (out && String(out.text || '').trim()) {
    save('sentences', addSentence(getSentences(), {
      item: item.id, phrase: item.phrase, text: out.text, kind: out.mode === 'speak' ? 'spoken' : 'written', topic: item.topic, date: today, at: now,
    }));
  }

  const events = [...result.events];
  if (r.output) events.push(...syncCounters());
  return { result, promoted: r.promoted, output: r.output, events, grade };
}

// bấm "khó" sau khi đã trả lời đúng: chỉ lùi hộp srs cho từ quay lại sớm (không tính thêm lượt)
export function markHard(itemId, stage) {
  const v = getVocab();
  const p = v.items[itemId];
  if (!p) return;
  const r = review(p, stage, 'hard', { now: Date.now(), today: todayIn() });
  save('vocab', { ...v, items: { ...v.items, [itemId]: r.item } });
}

// thống kê nhanh cho trang chủ / tab từ vựng
export function vocabStats(now = Date.now()) {
  const v = getVocab();
  const learning = Object.values(v.items).filter(isLearning);
  return {
    output: outputCount(v),
    learning: learning.length,
    due: learning.filter((p) => !p.hidden && (p.boxes?.[p.stage]?.due ?? 0) <= now).length,
    newToday: (v.new_log[todayIn()] || []).length,
    newPerDay: getState().profile.new_words_per_day,
    mistakes: getMistakes().list.length,
  };
}

// lần đầu mở web sau khi có giai đoạn 5: báo số kho output cho tiến độ (cấp, huy hiệu)
export function initVocab() {
  syncCounters();
}
