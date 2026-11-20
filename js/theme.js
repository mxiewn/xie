// xie · theme.js
// 4 chế độ: system (theo máy, mặc định) | light | dark | time (tối 18:00–6:00 giờ việt nam).
// đoạn script trong <head> của index.html dùng CÙNG logic để đặt data-theme trước khi css hiển thị.

import { readRaw, writeRaw, storageKey } from './storage.js';

export const THEME_MODES = ['system', 'light', 'dark', 'time'];
export const THEME_EVENT = 'xie:theme';
// xin đổi chế độ (vd. từ thanh menu): màn nào muốn tự làm hiệu ứng thì gọi preventDefault()
export const THEME_REQUEST = 'xie:theme-request';

const KEY = 'theme';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const root = document.documentElement;
const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

let animTimer = 0;
// localStorage bị chặn (tab ẩn danh…) thì vẫn nhớ lựa chọn trong phiên này
let memoryMode = null;

export function saigonHour(now = new Date()) {
  try {
    const text = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', hourCycle: 'h23' }).format(now);
    const hour = parseInt(text, 10);
    return Number.isNaN(hour) ? now.getHours() : hour;
  } catch {
    return now.getHours();
  }
}

export function getMode() {
  const mode = readRaw(KEY) ?? memoryMode;
  return THEME_MODES.includes(mode) ? mode : 'system';
}

export function resolveTheme(mode, { now = new Date(), systemDark = Boolean(darkQuery && darkQuery.matches) } = {}) {
  if (mode === 'light' || mode === 'dark') return mode;
  if (mode === 'time') {
    const hour = saigonHour(now);
    return hour >= 18 || hour < 6 ? 'dark' : 'light';
  }
  return systemDark ? 'dark' : 'light';
}

export function currentTheme() {
  return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function prefersReducedMotion() {
  return Boolean(motionQuery && motionQuery.matches);
}

function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const color = getComputedStyle(root).getPropertyValue('--theme-color').trim();
  if (color) meta.setAttribute('content', color);
}

function apply({ animate = false } = {}) {
  const mode = getMode();
  const theme = resolveTheme(mode);
  const changed = theme !== root.getAttribute('data-theme');

  if (changed && animate && !prefersReducedMotion()) {
    root.classList.add('theme-anim');
    clearTimeout(animTimer);
    animTimer = setTimeout(() => root.classList.remove('theme-anim'), 320);
  }

  root.setAttribute('data-theme', theme);
  root.setAttribute('data-theme-mode', mode);
  root.style.colorScheme = theme;
  syncThemeColor();

  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { mode, theme, changed } }));
  return theme;
}

export function setMode(mode) {
  const next = THEME_MODES.includes(mode) ? mode : 'system';
  memoryMode = next;
  writeRaw(KEY, next);
  return apply({ animate: true });
}

// nút đổi nhanh ở trang chủ: đang sáng thì sang tối và ngược lại
export function toggleQuick() {
  return setMode(currentTheme() === 'dark' ? 'light' : 'dark');
}

export function initTheme() {
  apply();

  if (darkQuery) {
    const onSystemChange = () => { if (getMode() === 'system') apply({ animate: true }); };
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
    else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
  }

  // chế độ "theo giờ": kiểm tra lại mỗi phút và mỗi lần quay lại tab
  setInterval(() => { if (getMode() === 'time') apply({ animate: true }); }, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') apply();
  });

  // đổi ở tab khác thì tab này đổi theo
  window.addEventListener('storage', (event) => {
    if (event.key === storageKey(KEY)) apply({ animate: true });
  });
}
