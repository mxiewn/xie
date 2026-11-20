// xie · nav-today.js — thẻ nhỏ "hôm nay" ở chân thanh menu bên trái (chỉ hiện trên desktop).
// trang trí có ý nghĩa: củ cà rốt dài ra theo số lượt, nơ = chuỗi ngày, bông tuyết = số băng đang có.
// tự cập nhật khi tiến độ hoặc hồ sơ đổi (vd. vừa làm bài, vừa đổi mục tiêu).

import { esc, icons } from './ui.js';
import { getSummary, PROGRESS_EVENT } from './progress.js';
import { STATE_EVENT, getState } from './state.js';

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
          <svg class="carrot-tip" viewBox="0 0 20 12" focusable="false"><path d="M0 1.5C6 0 14 3 20 6 14 9 6 12 0 10.5z"/></svg>
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

export function mountNavToday(host) {
  if (!host) return;
  const slot = document.createElement('div');
  slot.className = 'nav-today-slot';
  host.prepend(slot);
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
