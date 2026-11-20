// xie · nav-today.js — phần riêng của thanh menu bên trái (chỉ hiện trên desktop):
//   - kaomoji ngẫu nhiên sau tên "xie" và trên thẻ cà rốt, đổi cái khác mỗi lần chuyển màn
//   - nút sáng / tối (desktop không đặt nút trong khung thỏ để nắng, trăng có chỗ thoáng)
//   - thẻ "hôm nay": củ cà rốt dài ra theo số lượt, nơ = chuỗi ngày, bông tuyết = số băng đang có.
//     tự cập nhật khi tiến độ hoặc hồ sơ đổi (vd. vừa làm bài, vừa đổi mục tiêu).

import { esc, icons, randomKao } from './ui.js';
import { currentTheme, setMode, THEME_EVENT, THEME_REQUEST } from './theme.js';
import { getSummary, PROGRESS_EVENT } from './progress.js';
import { STATE_EVENT, getState } from './state.js';

// đuôi cà rốt = hình tròn (bán kính bằng nửa bề dày thanh, tâm đặt đúng đầu thanh) + tam giác
// nối từ hai tiếp điểm của hình tròn tới chóp nhọn. nhờ vậy thân → vai tròn → chóp liền một mạch,
// không có mép thẳng. tâm (6, 6), r = 6, chóp (21, 6): cos θ = 6/15 → tiếp điểm (8.4, 0.5) và (8.4, 11.5)
const CARROT_TIP = `
  <circle cx="6" cy="6" r="6"/>
  <path d="M8.4 0.5 21 6 8.4 11.5z"/>
  <path class="carrot-line" d="M9.5 3.6l2.6 1.1M10.2 8.4l2.2-.9"/>`;

function html(sum) {
  const { status, streak } = sum;
  const pct = Math.round(status.ratio * 100);
  const label = status.met ? 'hôm nay xong rồi' : 'hôm nay';
  return `
    <a class="nav-today${status.met ? ' is-met' : ''}" href="#/home" aria-label="${esc(`${label}: ${status.counted} trên ${status.goal} lượt, chuỗi ${streak.current} ngày, số băng đang có ${streak.freezes}`)}">
      <span class="nav-today-head">
        <span>${label}</span>
        <span class="nav-today-num">${status.counted}/${status.goal}</span>
      </span>
      <span class="carrot-track" aria-hidden="true">
        <span class="carrot-fill" style="width:${Math.max(pct, 8)}%">
          <svg class="carrot-tip" viewBox="0 0 22 12" focusable="false">${CARROT_TIP}</svg>
        </span>
        <svg class="carrot-leaf" viewBox="0 0 16 16" focusable="false">
          <ellipse cx="8.5" cy="8" rx="6.5" ry="2.3" transform="rotate(-32 15.5 8)"/>
          <ellipse cx="8.5" cy="8" rx="6.5" ry="2.3" transform="rotate(32 15.5 8)"/>
          <ellipse cx="8" cy="8" rx="7" ry="2.5"/>
        </svg>
      </span>
      <span class="nav-today-meta" aria-hidden="true">
        <span class="nav-chip">${icons.bow}${streak.current} ngày</span>
        <span class="nav-chip nav-chip-ice">${icons.snow}${streak.freezes} băng</span>
      </span>
    </a>`;
}

function themeHtml() {
  const dark = currentTheme() === 'dark';
  return `
    <div class="nav-theme" role="group" aria-label="chế độ sáng hoặc tối">
      <button class="nav-theme-btn" type="button" data-theme-to="light" aria-pressed="${!dark}">${icons.sun}<span>sáng</span></button>
      <button class="nav-theme-btn" type="button" data-theme-to="dark" aria-pressed="${dark}">${icons.moon}<span>tối</span></button>
    </div>`;
}

export function mountNavToday(host) {
  if (!host) return;
  const slot = document.createElement('div');
  slot.className = 'nav-today-slot';
  host.prepend(slot);

  // nút sáng / tối
  const theme = document.createElement('div');
  theme.className = 'nav-theme-slot';
  theme.innerHTML = themeHtml();
  host.prepend(theme);
  const syncTheme = () => {
    const dark = currentTheme() === 'dark';
    for (const b of theme.querySelectorAll('[data-theme-to]')) b.setAttribute('aria-pressed', String((b.dataset.themeTo === 'dark') === dark));
  };
  theme.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-to]');
    if (!btn || btn.dataset.themeTo === currentTheme()) return;
    // trang chủ nhận thì thỏ lật người rồi mới đổi; màn khác thì đổi luôn
    const req = new CustomEvent(THEME_REQUEST, { cancelable: true, detail: { theme: btn.dataset.themeTo } });
    if (window.dispatchEvent(req)) setMode(btn.dataset.themeTo);
  });
  window.addEventListener(THEME_EVENT, syncTheme);

  // kaomoji ngẫu nhiên sau tên web và trên thẻ cà rốt
  const brandKao = document.querySelector('.nav-brand .brand-kao');
  const footKao = host.querySelector('.nav-kao .kao');
  const shuffle = () => {
    if (brandKao) brandKao.textContent = randomKao('nav-brand');
    if (footKao) footKao.textContent = randomKao('nav-foot');
  };
  shuffle();
  window.addEventListener('hashchange', shuffle);
  const draw = () => {
    // chưa làm quen thì chưa có gì để hiện
    if (!getState().onboarded) { slot.replaceChildren(); return; }
    slot.innerHTML = html(getSummary());
  };
  draw();
  window.addEventListener(PROGRESS_EVENT, draw);
  window.addEventListener(STATE_EVENT, draw);
  window.addEventListener('hashchange', draw); // qua ngày mới hay vừa làm quen xong
}
