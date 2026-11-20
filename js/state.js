// xie · state.js — state của người học trên trình duyệt (đọc/ghi localStorage "xie:state").
// logic thuần (schema, nâng cấp, chuẩn hoá) nằm ở state-core.js.

import { readRaw, writeRaw, readAll, writeAll, clearAll } from './storage.js';
import { migrate, recordVisit, buildExport, parseImport, todayIn, daysUntilExam, RETURN_GAP_DAYS } from './state-core.js';
import { TOPIC_IDS } from './topics.js';

export const STATE_EVENT = 'xie:state';
const KEY = 'state';

let cache = null;
let lastGap = null;

export function getState() {
  if (cache) return cache;
  let raw = null;
  try {
    raw = JSON.parse(readRaw(KEY) || 'null');
  } catch {
    raw = null; // dữ liệu hỏng thì bắt đầu lại, không làm sập web
  }
  cache = migrate(raw, TOPIC_IDS);
  return cache;
}

function persist(next) {
  cache = { ...next, updated_at: new Date().toISOString() };
  writeRaw(KEY, JSON.stringify(cache)); // bị chặn thì vẫn giữ trong bộ nhớ cho phiên này
  window.dispatchEvent(new CustomEvent(STATE_EVENT, { detail: cache }));
  return cache;
}

// cập nhật hồ sơ: updateProfile({ name: 'mai' })
export function updateProfile(patch) {
  const s = getState();
  return persist(migrate({ ...s, profile: { ...s.profile, ...patch } }, TOPIC_IDS));
}

export function updateSettings(patch) {
  const s = getState();
  const next = persist(migrate({ ...s, settings: { ...s.settings, ...patch } }, TOPIC_IDS));
  applyFontSize(next.settings.font_size);
  return next;
}

export function setOnboarded(value) {
  return persist({ ...getState(), onboarded: Boolean(value) });
}

// gọi một lần khi mở web: ghi ngày ghé thăm, nhớ số ngày vắng để trang chủ chào "quay lại"
export function registerVisit() {
  const { state, gap } = recordVisit(getState(), todayIn());
  lastGap = gap;
  persist(state);
  return gap;
}

export function returnGap() {
  return lastGap !== null && lastGap >= RETURN_GAP_DAYS ? lastGap : null;
}

export function examDaysLeft() {
  return daysUntilExam(getState(), todayIn());
}

export function applyFontSize(size = getState().settings.font_size) {
  document.documentElement.setAttribute('data-font-size', size);
}

// ---------- xuất / nhập / xoá ----------
export function exportFile() {
  const payload = buildExport(readAll());
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xie-du-lieu-${todayIn()}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importFile(file) {
  const text = await file.text();
  const result = parseImport(text);
  if (!result.ok) return result;
  clearAll();
  if (!writeAll(result.entries)) return { ok: false, error: 'không ghi được dữ liệu, bộ nhớ trình duyệt có thể đã đầy' };
  cache = null;
  return { ok: true };
}

export function wipeAll() {
  clearAll();
  cache = null;
}
