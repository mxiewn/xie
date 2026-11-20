// xie · ui.js
// helper dựng giao diện dùng chung: escape, icon svg, tiêu đề trang, trang trống, bong bóng thoại.
// svg chỉ dùng class + var(--…) hoặc currentColor, không có mã màu cứng.

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
}

// thỏ ascii nhiều dòng (dùng trong <pre class="kao-art">)
export const ASCII_BUNNIES = [
  '(\\_/)\n( •.•)\n/ >🥕',
  ' /)/)\n( . .)\n( づ♡',
  '(\\(\\\n( -.-)\no_(")(")',
];

// kaomoji ngắn, dễ thương, đứng sau tên "xie" và trên thẻ cà rốt. mỗi lần quay lại màn đổi một cái
export const BRAND_KAOS = [
  '(˶ᵔ ᵕ ᵔ˶)', '₍ᐢ•ﻌ•ᐢ₎ ♡', '૮ ・ﻌ・ა', '(｡•̀ᴗ-)✧', '( ˶ˆᗜˆ˵ )', '(ᵔᴥᵔ)', '(◕ᴗ◕✿)', '(✿◠‿◠)',
  '( ˘ᵕ˘ ) ☾', '(っ˘ڡ˘ς)', 'ʕ•ᴥ•ʔ', '(≧◡≦) ♡', '(๑ᵔ⤙ᵔ๑)', '(˶˃ ᵕ ˂˶)', '( ´ ꒳ ` )ﾉ', '(｡･ω･｡)ﾉ♡',
  '(⸝⸝ᵕᴗᵕ⸝⸝)', '٩(ˊᗜˋ*)و', '( ˙꒳˙ )', '(｡◕‿◕｡)', 'ପ(๑•ᴗ•๑)ଓ', '(っ ᵔ◡ᵔ)っ',
];

const lastPick = {};
// kaomoji ngẫu nhiên, không trùng lần trước của cùng một chỗ (slot)
export function randomKao(slot = 'brand', list = BRAND_KAOS) {
  const pool = list.filter((k) => k !== lastPick[slot]);
  const k = pool[Math.floor(Math.random() * pool.length)];
  lastPick[slot] = k;
  return k;
}

export const DIVIDERS = ['୨୧', 'ʚ♡ɞ', '✧˖°', '‧₊˚✧', '❀˖°', '⋆˙⟡'];

export const icons = {
  sun: `<svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4.4"/>
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5"/>
  </svg>`,
  moon: `<svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2z"/>
    <path class="i-moon-star" d="M17 3.6l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4-1.4-.5 1.4-.5z"/>
  </svg>`,
  bow: `<svg class="i-bow" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
    <path class="i-bow-tail" d="M14.6 13 10.4 21.6l2.6-.8 1.2 2.2 2.3-9.6zM17.4 13l4.2 8.6-2.6-.8-1.2 2.2-2.3-9.6z"/>
    <path class="i-bow-loop" d="M16 12C12.6 6 5.6 4.2 4 8.4s3.4 8.6 12 3.6zM16 12c3.4-6 10.4-7.8 12-3.6s-3.4 8.6-12 3.6z"/>
    <ellipse class="i-bow-knot" cx="16" cy="12" rx="2.6" ry="2.9"/>
  </svg>`,
  heart: `<svg class="i-heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 20.4S3.6 15.6 3.6 9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.4 2.2c0 6-8.4 10.8-8.4 10.8z"/>
  </svg>`,
  lock: `<svg class="i-lock" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="5" y="10.5" width="14" height="10" rx="3"/>
    <path d="M8.4 10.5V8a3.6 3.6 0 0 1 7.2 0v2.5"/>
  </svg>`,
  sparkle: `<svg class="i-sparkle" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 2.8c.7 4.6 2.6 6.5 7.2 7.2-4.6.7-6.5 2.6-7.2 7.2-.7-4.6-2.6-6.5-7.2-7.2 4.6-.7 6.5-2.6 7.2-7.2z"/>
  </svg>`,
  chevron: `<svg class="i-chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="m9.5 6 6 6-6 6"/>
  </svg>`,
  // bé băng giữ chuỗi: bông tuyết 6 cánh
  snow: `<svg class="i-snow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 2.8v18.4M4 7.4l16 9.2M4 16.6l16-9.2"/>
    <path d="M9.6 4.4 12 6.6l2.4-2.2M9.6 19.6 12 17.4l2.4 2.2M4.6 10.4l3.1-1 -.7-3.1M19.4 13.6l-3.1 1 .7 3.1M7 16.8l.7-3.1-3.1-1M17 7.2l-.7 3.1 3.1 1"/>
  </svg>`,
};

// ---------- confetti hình nơ (lên level, mốc chuỗi) ----------
// màu lấy từ biến của chế độ hiện tại; giảm chuyển động thì không bắn
export function bowConfetti(count = 26) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const host = document.getElementById('app') || document.body;
  if (reduce || !host) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < count; i++) {
    const bow = document.createElement('span');
    bow.className = `confetti-bow c${(i % 4) + 1}`;
    bow.style.setProperty('--x', `${Math.round(Math.random() * 100)}vw`);
    bow.style.setProperty('--drift', `${Math.round((Math.random() - 0.5) * 120)}px`);
    bow.style.setProperty('--spin', `${Math.round((Math.random() - 0.5) * 720)}deg`);
    bow.style.setProperty('--delay', `${Math.round(Math.random() * 380)}ms`);
    bow.style.setProperty('--dur', `${1600 + Math.round(Math.random() * 900)}ms`);
    bow.style.setProperty('--size', `${16 + Math.round(Math.random() * 14)}px`);
    bow.innerHTML = `<svg viewBox="0 0 32 24" focusable="false">
      <path d="M16 12C12.6 6 5.6 4.2 4 8.4s3.4 8.6 12 3.6zM16 12c3.4-6 10.4-7.8 12-3.6s-3.4 8.6-12 3.6z"/>
      <path d="M14.6 13 10.4 21.6l2.6-.8 1.2 2.2 2.3-9.6zM17.4 13l4.2 8.6-2.6-.8-1.2 2.2-2.3-9.6z"/>
      <ellipse class="knot" cx="16" cy="12" rx="2.6" ry="2.9"/>
    </svg>`;
    layer.append(bow);
  }
  host.append(layer);
  setTimeout(() => layer.remove(), 3200);
}

// hoa anh đào 5 cánh, dùng lại nhiều chỗ
function blossom(cx, cy, r, cls = '') {
  const petals = [0, 72, 144, 216, 288]
    .map((deg) => `<ellipse class="sakura-petal" cx="${cx}" cy="${cy - r * 0.55}" rx="${(r * 0.42).toFixed(2)}" ry="${(r * 0.58).toFixed(2)}" transform="rotate(${deg} ${cx} ${cy})"/>`)
    .join('');
  return `<g class="sakura ${cls}">${petals}<circle class="sakura-center" cx="${cx}" cy="${cy}" r="${(r * 0.2).toFixed(2)}"/></g>`;
}

function sparkleStar(x, y, s, cls) {
  const d = `M${x} ${y - s}C${x + s * 0.18} ${y - s * 0.18} ${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}C${x + s * 0.18} ${y + s * 0.18} ${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}C${x - s * 0.18} ${y + s * 0.18} ${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}C${x - s * 0.18} ${y - s * 0.18} ${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z`;
  return `<path class="${cls}" d="${d}"/>`;
}

// sao đêm: [trái %, trên %, cỡ px, class]. né góc trên bên trái (chữ chào) và góc phải (trăng)
const NIGHT_STARS = [
  [68, 5, 12, 's1'],
  [6, 40, 14, 's2'],
  [86, 50, 10, 's3'],
  [14, 70, 9, 's4'],
  [78, 76, 13, 's5'],
  [52, 3, 8, 's6'],
  [30, 88, 8, 's7'],
  [3, 26, 6, 'dot d1'],
  [94, 36, 6, 'dot d2'],
  [62, 92, 6, 'dot d3'],
  [24, 56, 5, 'dot d4'],
];

// bầu trời trang chủ: bộ ban ngày và bộ ban đêm KHÁC NHAU, không dùng chung
export function skyDecor() {
  const day = `
    <div class="deco-light sky-day">
      <svg class="sky-sun" viewBox="0 0 80 80" focusable="false">
        <g class="sun-rays">
          ${[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => `<path d="M40 6v9" transform="rotate(${deg} 40 40)"/>`).join('')}
        </g>
        <circle class="sun-core" cx="40" cy="40" r="17"/>
      </svg>
      <svg class="sky-cloud cloud-a" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-b" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-c" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-d" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-e" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-f" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-g" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-sakura" viewBox="0 0 120 90" focusable="false">
        <path class="sakura-branch" d="M120 10C96 18 80 30 66 46S40 74 14 84"/>
        <path class="sakura-branch" d="M86 30c-2 8 0 16 6 22"/>
        ${blossom(64, 44, 11)}
        ${blossom(92, 50, 8)}
        ${blossom(36, 68, 9)}
        ${blossom(104, 18, 7)}
      </svg>
    </div>`;

  const night = `
    <div class="deco-dark sky-night">
      <svg class="sky-moon" viewBox="0 0 80 80" focusable="false">
        <path class="moon-body" d="M52 58A22 22 0 1 1 46 17a17 17 0 1 0 6 41z"/>
      </svg>
      <svg class="sky-cloud cloud-c" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-d" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      <svg class="sky-cloud cloud-f" viewBox="0 0 120 56" focusable="false">
        <path d="M24 48h74a17 17 0 0 0 0-34 21 21 0 0 0-39-6 16 16 0 0 0-26 10A15 15 0 0 0 24 48z"/>
      </svg>
      ${NIGHT_STARS.map(([x, y, px, cls]) => `
        <svg class="sky-star ${cls}" style="left:${x}%;top:${y}%;width:${px}px" viewBox="-1 -1 2 2" focusable="false">
          ${cls.startsWith('dot') ? '<circle class="star-dot" cx="0" cy="0" r="0.45"/>' : sparkleStar(0, 0, 1, 'star')}
        </svg>`).join('')}
      <svg class="sky-sakura sky-sakura-night" viewBox="0 0 120 90" focusable="false">
        ${blossom(64, 44, 10, 'ghost')}
        ${blossom(36, 66, 7, 'ghost')}
        <ellipse class="petal p1" cx="96" cy="70" rx="3" ry="1.8" transform="rotate(-30 96 70)"/>
        <ellipse class="petal p2" cx="20" cy="40" rx="2.4" ry="1.5" transform="rotate(25 20 40)"/>
      </svg>
    </div>`;

  return day + night;
}

export function pageHead({ title, sub = '', actions = '' }) {
  return `
    <header class="page-head">
      <div class="page-head-text">
        <h1 class="page-title">${esc(title)}</h1>
        ${sub ? `<p class="page-sub">${esc(sub)}</p>` : ''}
      </div>
      ${actions ? `<div class="page-actions">${actions}</div>` : ''}
    </header>
    <div class="lace-trim" aria-hidden="true"></div>`;
}

export function emptyState({ art = ASCII_BUNNIES[0], kao = '', title = '', text = '', action = '' } = {}) {
  return `
    <section class="empty-state">
      <pre class="kao-art empty-art" aria-hidden="true">${esc(art)}</pre>
      ${title ? `<h2 class="empty-title">${esc(title)}${kao ? ` <span class="kao">${esc(kao)}</span>` : ''}</h2>` : ''}
      ${text ? `<p class="empty-text">${esc(text)}</p>` : ''}
      ${action ? `<div class="empty-action">${action}</div>` : ''}
    </section>`;
}

// bong bóng thoại cạnh thỏ: tự ẩn sau 3–5 giây, chạm thì ẩn
export function createBubble() {
  const node = document.createElement('div');
  node.className = 'bubble';
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.hidden = true;
  const text = document.createElement('p');
  text.className = 'bubble-text';
  node.append(text);

  let hideTimer = 0;
  let fadeTimer = 0;

  function hide() {
    clearTimeout(hideTimer);
    node.classList.remove('is-shown');
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => { node.hidden = true; }, 200);
  }

  function say(line, kao = '') {
    clearTimeout(hideTimer);
    clearTimeout(fadeTimer);
    text.textContent = line;
    if (kao) {
      const k = document.createElement('span');
      k.className = 'kao';
      k.textContent = kao;
      if (line) text.append(' ');
      text.append(k);
    }
    node.hidden = false;
    node.classList.remove('is-shown');
    void node.offsetWidth; // chạy lại hiệu ứng hiện
    node.classList.add('is-shown');
    const ms = Math.min(5000, Math.max(3000, 2200 + line.length * 55));
    hideTimer = setTimeout(hide, ms);
  }

  node.addEventListener('click', hide);

  return {
    node,
    say,
    hide,
    destroy() {
      clearTimeout(hideTimer);
      clearTimeout(fadeTimer);
    },
  };
}

// thông báo nhỏ ở đáy màn hình (đã lưu, lỗi nhập file…), tự ẩn sau vài giây
let toastTimer = 0;
export function showToast(text, kao = '') {
  let node = document.querySelector('.toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
    document.getElementById('app')?.append(node);
  }
  node.textContent = text;
  if (kao) {
    const k = document.createElement('span');
    k.className = 'kao';
    k.textContent = kao;
    node.append(' ', k);
  }
  node.classList.remove('is-shown');
  void node.offsetWidth;
  node.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('is-shown'), 2600);
}
