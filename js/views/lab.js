// xie · views/lab.js — phòng thử (#/lab), không có trên thanh tab.
// dùng để kiểm tra bằng mắt ở cả hai chế độ: 10 dáng thỏ, font tiếng việt ở mọi cỡ,
// kaomoji, thỏ ascii, bảng màu.

import { pageHead, ASCII_BUNNIES, DIVIDERS, esc } from '../ui.js';
import { createBunny, BUNNY_STATES } from '../bunny.js';
import { setMode, currentTheme, THEME_EVENT } from '../theme.js';
import { SKINS } from '../levels.js';
import { loadVoice } from '../voice.js';
import { pick, emptyHistory, RECENT_LIMIT } from '../voice-core.js';

// ngữ cảnh mẫu cho phòng thử: đủ mọi biến, giờ hợp với từng nhóm chào
const SAMPLE_CTX = { name: 'mai', streak: 12, n: 7, left: 4, word: 'sustainable', days: 30, level: 'thỏ ngọc trai', minutes: 30, goal: 50 };
const GROUP_HOUR = { chao_sang: 8, chao_trua_chieu: 14, chao_toi_khuya: 21 };

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
        <label class="select-row">
          <span>mặc thử trang phục</span>
          <select data-action="skin">
            ${SKINS.map((s) => `<option value="${s.id}">cấp ${s.level} · ${esc(s.name)}</option>`).join('')}
          </select>
        </label>
        <ul class="bunny-grid" role="list"></ul>
        <label class="range-row">
          <span>cà rốt lớn dần theo tiến độ</span>
          <input type="range" min="0.6" max="1.5" step="0.05" value="1" data-action="carrot">
        </label>
      </section>

      <section class="card voice-lab">
        <h2 class="card-title">nghe thử thoại</h2>
        <div class="voice-lab-row">
          <label class="select-row">
            <span>nhóm</span>
            <select data-action="voice-group"></select>
          </label>
          <label class="select-row" hidden>
            <span>loại</span>
            <select data-action="voice-kind"></select>
          </label>
        </div>
        <div class="lab-buttons">
          <button class="btn btn-primary" type="button" data-action="voice-say">nói thử</button>
          <button class="btn btn-ghost" type="button" data-action="voice-100">gọi 100 lần</button>
        </div>
        <p class="voice-out" aria-live="polite"></p>
        <p class="voice-stats card-text"></p>
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

  view.querySelector('[data-action="skin"]').addEventListener('change', (e) => {
    for (const b of bunnies) b.setSkin(e.target.value);
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

  // ---------- nghe thử thoại ----------
  const groupSel = view.querySelector('[data-action="voice-group"]');
  const kindSel = view.querySelector('[data-action="voice-kind"]');
  const out = view.querySelector('.voice-out');
  const stats = view.querySelector('.voice-stats');
  let voice = null;
  let labHistory = emptyHistory();

  const ctxFor = (gid) => ({
    ...SAMPLE_CTX,
    hour: GROUP_HOUR[gid] ?? 10,
    kind: voice?.[gid]?.kinds ? kindSel.value : undefined,
  });

  const syncKinds = () => {
    const kinds = voice?.[groupSel.value]?.kinds || [];
    kindSel.innerHTML = kinds.map((k) => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
    kindSel.closest('label').hidden = !kinds.length;
    labHistory = emptyHistory();
    stats.textContent = '';
  };

  loadVoice().then((data) => {
    if (!data) { out.textContent = 'chưa tải được kho thoại'; return; }
    voice = data;
    const ids = Object.keys(data).filter((k) => !k.startsWith('_'));
    groupSel.innerHTML = ids.map((id) => `<option value="${id}">${esc(data[id].label)} (${data[id].lines.length})</option>`).join('');
    syncKinds();
  });
  groupSel.addEventListener('change', syncKinds);
  kindSel.addEventListener('change', () => { labHistory = emptyHistory(); stats.textContent = ''; });

  view.querySelector('[data-action="voice-say"]').addEventListener('click', () => {
    if (!voice) return;
    const r = pick(voice, groupSel.value, ctxFor(groupSel.value), { history: labHistory, forceLine: true });
    out.innerHTML = r ? `${esc(r.text || '')} <span class="kao">${esc(r.kao)}</span>` : 'nhóm này không hợp ngữ cảnh mẫu';
  });

  view.querySelector('[data-action="voice-100"]').addEventListener('click', () => {
    if (!voice) return;
    const gid = groupSel.value;
    const history = emptyHistory();
    const seen = [];
    let repeats = 0;
    for (let i = 0; i < 100; i++) {
      const r = pick(voice, gid, ctxFor(gid), { history, forceLine: true, now: i * 60_000 });
      if (!r?.id) continue;
      if (seen.slice(-RECENT_LIMIT).includes(r.id)) repeats += 1;
      seen.push(r.id);
    }
    const distinct = new Set(seen).size;
    stats.textContent = `100 lần gọi: ${distinct} câu khác nhau, lặp lại trong 15 câu gần nhất: ${repeats} lần`;
  });

  return () => {
    window.removeEventListener(THEME_EVENT, syncSwatches);
    for (const b of bunnies) b.destroy();
  };
}
