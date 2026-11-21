// xie · vocab-state.js — dữ liệu học từ vựng của người học (thuần, test ở tests/vocab.test.js).
//
// localStorage (mỗi key có version riêng):
//   xie:vocab      { version, items: { id: tiến độ srs + my_sentence, used_speaking, hidden }, new_log: { ngày: [id] }, front }
//   xie:sentences  { version, list: [{ id, item, phrase, text, kind ("written" | "spoken"), date, at, graded, corrected }] }
//   xie:mistakes   { version, list: [{ item, phrase, stage, category, answer, expected, date, at }] }
//   xie:my-words   { version, items: [mục từ source "mine"] }

import { isValidDate } from './state-core.js';
import { newItem, isOutput, isDue, dueList, masteryOf, STAGES } from './srs.js';
import { normalizeItem } from './vocab-core.js';

export const VOCAB_VERSION = 1;
export const FRONTS = ['en', 'vi', 'random'];
export const SENTENCE_MAX = 500;
export const MISTAKE_MAX = 300;
export const MISTAKE_CATEGORIES = {
  nghia: 'nghĩa', word_form: 'word form', gioi_tu: 'giới từ', collocation: 'collocation', ngu_phap: 'ngữ pháp', bay: 'bẫy người việt',
};

const int = (v) => (Number.isInteger(v) && v > 0 ? v : 0);
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const str = (v) => (typeof v === 'string' ? v.normalize('NFC') : '');

// ---------- xie:vocab ----------
export function defaultVocab() {
  return { version: VOCAB_VERSION, items: {}, new_log: {}, front: 'en' };
}

function normalizeProgressItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const stage = STAGES.includes(raw.stage) ? raw.stage : 1;
  const boxes = {};
  for (const s of STAGES) {
    const b = raw.boxes?.[s];
    if (b && typeof b === 'object') {
      boxes[s] = { box: Math.min(5, Math.max(1, int(b.box) || 1)), due: num(b.due), right: int(b.right), wrong: int(b.wrong), last: Number.isFinite(b.last) ? b.last : null };
    }
  }
  if (!boxes[stage]) boxes[stage] = { box: 1, due: 0, right: 0, wrong: 0, last: null };
  const out = {
    stage,
    boxes,
    output_days: (Array.isArray(raw.output_days) ? raw.output_days : []).filter(isValidDate).slice(-10),
    wrong: int(raw.wrong),
    hard: int(raw.hard),
    added: isValidDate(raw.added) ? raw.added : null,
  };
  if (str(raw.my_sentence)) out.my_sentence = str(raw.my_sentence).slice(0, 500);
  if (typeof raw.used_speaking === 'boolean') out.used_speaking = raw.used_speaking;
  if (raw.hidden === true) out.hidden = true;
  if (raw.learning === false) out.learning = false;
  return out;
}

export function migrateVocab(raw) {
  const base = defaultVocab();
  if (!raw || typeof raw !== 'object') return base;
  const items = {};
  for (const [id, it] of Object.entries(raw.items || {})) {
    const n = normalizeProgressItem(it);
    if (n && typeof id === 'string' && id) items[id] = n;
  }
  const new_log = {};
  for (const [d, ids] of Object.entries(raw.new_log || {})) {
    if (isValidDate(d) && Array.isArray(ids)) new_log[d] = ids.filter((x) => typeof x === 'string');
  }
  return { version: VOCAB_VERSION, items, new_log, front: FRONTS.includes(raw.front) ? raw.front : 'en' };
}

// "câu của tôi" + "đã dùng khi nói" trong sổ excel → tiến độ ban đầu (chưa học thì chưa vào srs)
export function userFields(vocab, item) {
  const p = vocab.items[item.id];
  return {
    my_sentence: p?.my_sentence ?? item.seed?.my_sentence ?? '',
    used_speaking: p?.used_speaking ?? item.seed?.used_speaking ?? false,
    hidden: Boolean(p?.hidden),
  };
}

// cập nhật trường của người học (câu của tôi, đã dùng khi nói, ẩn) mà không đụng tiến độ srs
export function setUserFields(vocab, id, patch) {
  const cur = vocab.items[id] || { learning: false, stage: 1, boxes: {}, output_days: [], wrong: 0, hard: 0, added: null };
  const next = { ...cur };
  if ('my_sentence' in patch) {
    const t = str(patch.my_sentence).trim().slice(0, 500);
    if (t) next.my_sentence = t; else delete next.my_sentence;
  }
  if ('used_speaking' in patch) next.used_speaking = Boolean(patch.used_speaking);
  if ('hidden' in patch) { if (patch.hidden) next.hidden = true; else delete next.hidden; }
  return { ...vocab, items: { ...vocab.items, [id]: next } };
}

// từ đã thật sự vào srs (đã học) — mục chỉ có "câu của tôi" thì chưa tính
export const isLearning = (p) => Boolean(p) && p.learning !== false;

export function learnedMap(vocab) {
  return Object.fromEntries(Object.entries(vocab.items).filter(([, p]) => isLearning(p)));
}

// bắt đầu học một từ mới (vào srs, hộp 1 mức 1, đến hạn ngay)
export function startLearning(vocab, id, { now = Date.now(), today }) {
  const cur = vocab.items[id];
  if (isLearning(cur)) return vocab;
  const keep = cur ? { my_sentence: cur.my_sentence, used_speaking: cur.used_speaking, hidden: cur.hidden } : {};
  const fresh = { ...newItem(now, today), ...Object.fromEntries(Object.entries(keep).filter(([, v]) => v !== undefined)) };
  const log = vocab.new_log[today] || [];
  return { ...vocab, items: { ...vocab.items, [id]: fresh }, new_log: { ...vocab.new_log, [today]: log.includes(id) ? log : [...log, id] } };
}

export function newToday(vocab, today) {
  return (vocab.new_log[today] || []).length;
}

export function outputCount(vocab) {
  return Object.values(vocab.items).filter((p) => isLearning(p) && isOutput(p)).length;
}

// thống kê mức thành thạo: { 0: chưa học, 1..4: đang luyện, 5: output }
export function masteryCounts(vocab, ids) {
  const out = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const id of ids) {
    const p = vocab.items[id];
    out[isLearning(p) ? masteryOf(p) : 0] += 1;
  }
  return out;
}

export function dueIds(vocab, now = Date.now(), topicOf = () => '') {
  return dueList(learnedMap(vocab), now, topicOf);
}

export function dueCount(vocab, now = Date.now()) {
  return Object.values(vocab.items).filter((p) => isLearning(p) && !p.hidden && isDue(p, now)).length;
}

// từ hay sai: sai từ 2 lần, hoặc sai nhiều hơn đúng
export function isWeak(p) {
  if (!isLearning(p)) return false;
  const right = Object.values(p.boxes).reduce((s, b) => s + b.right, 0);
  return p.wrong >= 2 || (p.wrong > 0 && p.wrong >= right);
}

// ---------- kế hoạch hôm nay ----------
// ôn từ đến hạn → từ mới → bài output (đủ ≥ 10 lượt) → minigame → ngữ pháp. ước lượng số lượt từng bước
export function todayPlan({ due = 0, newLeft = 0, goal = 50, weakSkill = null, gamesReady = false, grammarReady = false }) {
  const steps = [];
  const reviewTurns = Math.min(due, 40);
  steps.push({ id: 'review', label: `ôn ${due} từ đến hạn`, turns: reviewTurns, ready: due > 0 });
  // mỗi từ mới: thẻ + nhận biết + nhớ lại ≈ 2 lượt
  steps.push({ id: 'new', label: `học ${newLeft} từ mới`, turns: newLeft * 2, ready: newLeft > 0 });
  steps.push({ id: 'output', label: 'tự viết / nói câu với từ đã học', turns: 12, ready: true });
  const used = steps.reduce((s, x) => s + x.turns, 0);
  const left = Math.max(0, goal - used);
  const games = Math.min(25, Math.ceil(left * (weakSkill === 'grammar' ? 0.4 : 0.6)));
  steps.push({ id: 'games', label: 'minigame', turns: games, ready: gamesReady });
  steps.push({ id: 'grammar', label: 'ngữ pháp', turns: Math.max(0, left - games), ready: grammarReady });
  return steps;
}

// ---------- câu của tui ----------
export function defaultSentences() {
  return { version: VOCAB_VERSION, list: [] };
}

export function migrateSentences(raw) {
  const list = (Array.isArray(raw?.list) ? raw.list : [])
    .filter((s) => s && str(s.text) && str(s.id))
    .map((s) => ({
      id: str(s.id), item: str(s.item), phrase: str(s.phrase), text: str(s.text).slice(0, 2000),
      kind: s.kind === 'spoken' ? 'spoken' : 'written', date: isValidDate(s.date) ? s.date : null, at: num(s.at),
      graded: s.graded === true, corrected: str(s.corrected).slice(0, 2000), topic: str(s.topic),
    }));
  return { version: VOCAB_VERSION, list: list.slice(-SENTENCE_MAX) };
}

export function addSentence(store, { item, phrase, text, kind = 'written', topic = '', date, at = Date.now() }) {
  const entry = { id: `s-${at.toString(36)}-${store.list.length}`, item, phrase, text: str(text).trim(), kind, date, at, graded: false, corrected: '', topic };
  return { ...store, list: [...store.list, entry].slice(-SENTENCE_MAX) };
}

export function updateSentence(store, id, patch) {
  return { ...store, list: store.list.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
}

// ---------- sổ lỗi sai ----------
export function defaultMistakes() {
  return { version: VOCAB_VERSION, list: [] };
}

export function migrateMistakes(raw) {
  const list = (Array.isArray(raw?.list) ? raw.list : [])
    .filter((m) => m && str(m.item))
    .map((m) => ({
      item: str(m.item), phrase: str(m.phrase), stage: STAGES.includes(m.stage) ? m.stage : 1,
      category: m.category in MISTAKE_CATEGORIES ? m.category : 'nghia', answer: str(m.answer).slice(0, 300),
      expected: str(m.expected).slice(0, 300), date: isValidDate(m.date) ? m.date : null, at: num(m.at),
    }));
  return { version: VOCAB_VERSION, list: list.slice(-MISTAKE_MAX) };
}

// loại lỗi theo câu hỏi: mức 1–2 = nghĩa; mức 3 theo nhãn câu hỏi
export function categoryFor(question) {
  if (question.tag === 'form') return 'word_form';
  if (question.tag === 'prep') return 'gioi_tu';
  if (question.tag === 'collocation') return 'collocation';
  if (question.tag === 'fix') return 'ngu_phap';
  if (question.stage === 3) return 'collocation';
  return 'nghia';
}

export function addMistake(store, entry) {
  return { ...store, list: [...store.list, entry].slice(-MISTAKE_MAX) };
}

// ---------- từ của tui ----------
export function defaultMyWords() {
  return { version: VOCAB_VERSION, items: [] };
}

export function migrateMyWords(raw) {
  const items = (Array.isArray(raw?.items) ? raw.items : [])
    .map((it) => normalizeItem({ ...it, source: 'mine' }))
    .filter(Boolean);
  return { version: VOCAB_VERSION, items };
}

/**
 * tạo mục "từ của tui" từ form. bắt buộc từ + nghĩa; còn lại tuỳ chọn.
 * trả về { ok, item } hoặc { ok: false, error }
 */
export function makeMyWord({ phrase, meaning, example = '', note = '', use_for = 'both', topic = 'tu-cua-tui' }, { at = Date.now() } = {}) {
  const p = str(phrase).replace(/\s+/g, ' ').trim();
  const m = str(meaning).replace(/\s+/g, ' ').trim();
  if (!p) return { ok: false, error: 'nhập từ hoặc cụm từ nha' };
  if (!m) return { ok: false, error: 'nhập nghĩa tiếng việt nữa nha' };
  if (p.length > 80) return { ok: false, error: 'từ / cụm dài quá, tối đa 80 ký tự' };
  const item = normalizeItem({
    id: `my-${at.toString(36)}`, source: 'mine', track: 'daily', topic, subgroup: '', type: p.includes(' ') ? 'phrase' : 'word',
    phrase: p, alternatives: [], meaning_vi: m, examples: str(example).trim() ? [str(example).trim()] : [], use_for, note: str(note).trim(),
    level: '', speaking_questions: [],
  });
  return { ok: true, item };
}
