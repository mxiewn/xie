// xie · speech.js — phát âm bằng web speech api (speechSynthesis). spec mục 1:
// chọn giọng en-GB / en-US và tốc độ đọc; trình duyệt không hỗ trợ thì ẩn nút, không báo lỗi.
// KHÔNG dùng micro, không ghi âm, không nhận diện giọng nói.

import { getState } from './state.js';

export function speechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let voices = [];
function loadVoices() {
  if (!speechSupported()) return [];
  voices = window.speechSynthesis.getVoices() || [];
  return voices;
}
if (speechSupported()) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

// giọng hợp accent: đúng mã (en-GB) trước, rồi cùng ngôn ngữ (en-*)
function pickVoice(accent) {
  const list = voices.length ? voices : loadVoices();
  const norm = (l) => String(l || '').replace('_', '-').toLowerCase();
  return list.find((v) => norm(v.lang) === accent.toLowerCase() && v.localService)
    || list.find((v) => norm(v.lang) === accent.toLowerCase())
    || list.find((v) => norm(v.lang).startsWith('en'))
    || null;
}

/** đọc to một câu tiếng anh. trả về true nếu đã đọc */
export function speak(text, { rate, accent } = {}) {
  if (!speechSupported() || !text) return false;
  const s = getState().settings;
  const lang = accent || s.speech_accent || 'en-GB';
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/\([^)]*\)/g, ' '));
    u.lang = lang;
    u.rate = rate || s.speech_rate || 0.9;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  try { if (speechSupported()) window.speechSynthesis.cancel(); } catch { /* bỏ qua */ }
}

// nút loa: trình duyệt không hỗ trợ thì trả về chuỗi rỗng (ẩn hẳn)
export function listenButton(label = 'nghe', cls = '') {
  if (!speechSupported()) return '';
  return `<button class="icon-btn listen-btn ${cls}" type="button" data-speak aria-label="${label}">
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 9.5h3l4.2-3.6v12.2L7.5 14.5h-3z"/><path d="M15.2 9.2a4 4 0 0 1 0 5.6M17.8 6.8a7.4 7.4 0 0 1 0 10.4"/></svg>
  </button>`;
}

// gắn một lần cho cả màn: bấm nút có data-speak thì đọc data-text (hoặc chữ tiếng anh gần nhất)
export function wireListen(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-speak]');
    if (!btn || !root.contains(btn)) return;
    const text = btn.dataset.text || btn.closest('[data-say]')?.dataset.say || '';
    speak(text);
  });
}
