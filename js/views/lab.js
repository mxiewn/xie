// xie · views/lab.js — phòng thử (#/lab), không có trên thanh tab.
// dùng để kiểm tra bằng mắt ở cả hai chế độ: 10 dáng thỏ, font tiếng việt ở mọi cỡ,
// kaomoji, thỏ ascii, bảng màu.

import { pageHead, ASCII_BUNNIES, DIVIDERS, esc } from '../ui.js';
import { createBunny, BUNNY_STATES } from '../bunny.js';
import { setMode, currentTheme, THEME_EVENT } from '../theme.js';

const VI_TEST = 'ẩn ẵ ậ ữ ỷ ơ ư đ ộ ỡ ặ ừ ẫ';
const VI_TEST_UPPER = 'Ẩn Ẵ Ậ Ữ Ỷ Ơ Ư Đ Ộ Ỡ Ặ Ừ Ẫ';
const SIZES = [12, 14, 16, 18, 20, 24, 32, 40];

const KAO_SAMPLES = [
  '(˶ᵔ ᵕ ᵔ˶)ﾉ', '₍ᐢ•ﻌ•ᐢ₎ ♡', '૮ ・ﻌ・ა', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧', '٩(ˊᗜˋ*)و ♡', '(｡•́︿•̀｡)',
  '(づ ᴗ _ᴗ)づ♡', '( ˘ᵕ˘ ) ☾', '(ᴗ˳ᴗ)ᶻ𝗓𝐰', 'ᕙ( •̀ ᗜ •́ )ᕗ', '₍₍ ◝(•̀ㅂ•́)◟ ⁾⁾', '(っ˘ڡ˘ς)🥕',
  'ヽ(♡‿♡)ノ', '(⸝⸝ᵕᴗᵕ⸝⸝) ❄︎', 'Σ(°△°|||)︴', '┐(￣ヘ￣)┌',
];

const SWATCHES = [
  '--bg', '--surface', '--surface-2', '--surface-tint', '--text', '--text-muted', '--accent-ink',
  '--pink', '--rose', '--primary', '--ok', '--bad', '--pearl', '--moon', '--bunny-outline', '--bunny-cheek',
];

export function render(view) {
  view.innerHTML = `
    ${pageHead({
      title: 'phòng thử của thỏ',
      sub: 'chỗ kiểm tra bằng mắt, không có trên thanh tab',
      actions: `<button class="btn btn-ghost btn-small" type="button" data-action="flip-theme">đổi chế độ</button>`,
    })}
    <div class="page-body lab">
      <section class="card">
        <h2 class="card-title">10 dáng của thỏ</h2>
        <ul class="bunny-grid" role="list"></ul>
        <label class="range-row">
          <span>cà rốt lớn dần theo tiến độ</span>
          <input type="range" min="0.6" max="1.5" step="0.05" value="1" data-action="carrot">
        </label>
      </section>

      <section class="card">
        <h2 class="card-title">chữ tiếng việt</h2>
        <div class="font-test">
          ${SIZES.map((px) => `
            <div class="font-row">
              <span class="font-size-tag">${px}px</span>
              <p class="ft-title" style="font-size:${px}px">${VI_TEST}</p>
              <p class="ft-body" style="font-size:${px}px">${VI_TEST}</p>
              <p class="ft-body ft-bold keep-case" style="font-size:${px}px">${VI_TEST_UPPER}</p>
            </div>`).join('')}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">kaomoji</h2>
        <ul class="kao-grid" role="list">
          ${KAO_SAMPLES.map((k) => `<li><span class="kao">${esc(k)}</span></li>`).join('')}
        </ul>
        <p class="divider-row">${DIVIDERS.map((d) => `<span class="kao">${esc(d)}</span>`).join('')}</p>
        <div class="ascii-row">
          ${ASCII_BUNNIES.map((a) => `<pre class="kao-art">${esc(a)}</pre>`).join('')}
        </div>
      </section>

      <section class="card">
        <h2 class="card-title">bảng màu · <span class="theme-name"></span></h2>
        <ul class="swatch-grid" role="list">
          ${SWATCHES.map((v) => `
            <li class="swatch">
              <span class="swatch-chip" style="background:var(${v})"></span>
              <span class="swatch-name">${v}</span>
              <span class="swatch-value keep-case" data-var="${v}"></span>
            </li>`).join('')}
        </ul>
        <div class="lab-buttons">
          <button class="btn btn-primary" type="button">nút chính</button>
          <button class="btn btn-ghost" type="button">nút phụ</button>
          <span class="status-chip status-ok">✓ đúng</span>
          <span class="status-chip status-bad">✗ sai</span>
        </div>
        <div class="pearls" aria-hidden="true"></div>
      </section>
    </div>
  `;

  const grid = view.querySelector('.bunny-grid');
  const bunnies = BUNNY_STATES.map((s) => {
    const bunny = createBunny({ state: s.id, size: 128 });
    const li = document.createElement('li');
    li.className = 'bunny-cell';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bunny-btn';
    btn.setAttribute('aria-label', `thỏ ${s.label}, chạm để nhún`);
    btn.append(bunny.node);
    btn.addEventListener('click', () => bunny.hop());
    const cap = document.createElement('span');
    cap.className = 'bunny-cap';
    cap.textContent = s.label;
    li.append(btn, cap);
    grid.append(li);
    return bunny;
  });

  const carrotBunny = bunnies[BUNNY_STATES.findIndex((s) => s.id === 'carrot')];
  view.querySelector('[data-action="carrot"]').addEventListener('input', (e) => {
    carrotBunny.setCarrotScale(e.target.value);
  });

  view.querySelector('[data-action="flip-theme"]').addEventListener('click', () => {
    setMode(currentTheme() === 'dark' ? 'light' : 'dark');
  });

  const syncSwatches = () => {
    const styles = getComputedStyle(document.documentElement);
    for (const el of view.querySelectorAll('[data-var]')) {
      el.textContent = styles.getPropertyValue(el.dataset.var).trim();
    }
    view.querySelector('.theme-name').textContent = currentTheme() === 'dark' ? 'đêm trăng' : 'tuyết';
  };
  syncSwatches();
  window.addEventListener(THEME_EVENT, syncSwatches);

  return () => {
    window.removeEventListener(THEME_EVENT, syncSwatches);
    for (const b of bunnies) b.destroy();
  };
}
