// xie · voice.js — giọng nói của thỏ trên trình duyệt.
// tải data/voice.json khi cần (một lần), nhớ lịch sử chống lặp trong localStorage,
// đọc cài đặt "thỏ nói nhiều / vừa / ít". phần chọn câu nằm ở voice-core.js (thuần, có test).

import { pick, emptyHistory, pruneHistory, greetingGroup } from './voice-core.js';
import { readRaw, writeRaw } from './storage.js';
import { saigonHour } from './theme.js';

export const TALK_LEVELS = [
  { id: 'nhieu', label: 'nói nhiều', desc: 'trả lời đúng là hay có thoại' },
  { id: 'vua', label: 'vừa', desc: 'khoảng một phần ba số lần' },
  { id: 'it', label: 'nói ít', desc: 'chủ yếu kaomoji, sự kiện lớn mới nói' },
];

const HISTORY_KEY = 'voice';
const TALK_KEY = 'talk';
const TAPS_KEY = 'taps';

let voicePromise = null;
let tipsPromise = null;
let history = null;
let memoryTalk = null;
let memoryTaps = 0;

function loadJson(path) {
  return fetch(new URL(path, import.meta.url))
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);
}

export function loadVoice() {
  voicePromise ||= loadJson('../data/voice.json');
  return voicePromise;
}

export function loadTips() {
  tipsPromise ||= loadJson('../data/tips.json');
  return tipsPromise;
}

function getHistory() {
  if (history) return history;
  try {
    const saved = JSON.parse(readRaw(HISTORY_KEY) || 'null');
    history = saved && saved.v === 1 ? saved : emptyHistory();
  } catch {
    history = emptyHistory();
  }
  return history;
}

function saveHistory() {
  writeRaw(HISTORY_KEY, JSON.stringify(pruneHistory(getHistory())));
}

export function getTalk() {
  const t = readRaw(TALK_KEY) ?? memoryTalk;
  return TALK_LEVELS.some((l) => l.id === t) ? t : 'vua';
}

export function setTalk(id) {
  if (!TALK_LEVELS.some((l) => l.id === id)) return;
  memoryTalk = id;
  writeRaw(TALK_KEY, id);
}

// đếm số lần chạm thỏ (cho câu "đã chọc tui {n} lần")
export function countTap() {
  const saved = parseInt(readRaw(TAPS_KEY) ?? '', 10);
  const next = (Number.isNaN(saved) ? memoryTaps : saved) + 1;
  memoryTaps = next;
  writeRaw(TAPS_KEY, String(next));
  return next;
}

/**
 * thỏ nói một câu thuộc nhóm. ctx: biến + điều kiện ({ kind, n, word, … }).
 * trả về { text, kao } (text có thể null = lần này chỉ hiện kaomoji), hoặc null nếu chưa tải được.
 */
export async function say(groupId, ctx = {}, opts = {}) {
  const data = await loadVoice();
  if (!data) return null;
  const result = pick(data, groupId, { hour: saigonHour(), ...ctx }, { history: getHistory(), talk: getTalk(), ...opts });
  saveHistory();
  return result;
}

export function greetingNow() {
  return greetingGroup(saigonHour());
}

export async function randomTip() {
  const data = await loadTips();
  const list = data?.tips || [];
  return list.length ? list[Math.floor(Math.random() * list.length)].text : '';
}
