// xie · views/me.js — tab tui
// hiện có: lối vào tủ đồ của thỏ, cài đặt giao diện (4 chế độ), lối vào phòng thử.
// thống kê, sổ lỗi, câu của tui, cài đặt đầy đủ làm ở các giai đoạn sau.

import { pageHead, icons, esc } from '../ui.js';
import { getMode, setMode, THEME_EVENT } from '../theme.js';
import { createBunny } from '../bunny.js';
import { currentLevel, levelInfo, getEquippedSkin, skinInfo } from '../levels.js';

const MODES = [
  { id: 'system', label: 'theo máy', desc: 'đi theo chế độ sáng/tối của điện thoại' },
  { id: 'light', label: 'sáng · tuyết', desc: 'trắng tuyết, hồng phấn, mây và hoa anh đào' },
  { id: 'dark', label: 'tối · đêm trăng', desc: 'tím than, trăng lưỡi liềm, ren ánh bạc' },
  { id: 'time', label: 'theo giờ', desc: 'tối từ 18:00 đến 6:00, giờ việt nam' },
];

export function render(view) {
  const level = currentLevel();
  const skin = getEquippedSkin();
  view.innerHTML = `
    ${pageHead({ title: 'tui', sub: 'cài đặt và mọi thứ của riêng bạn' })}
    <div class="page-body">
      <a class="card card-link wardrobe-link" href="#/wardrobe">
        <span class="wardrobe-thumb"></span>
        <span class="card-link-text">
          <span class="card-title">tủ đồ của thỏ</span>
          <span class="card-text">cấp ${level} · ${esc(levelInfo(level).name)}</span>
          <span class="card-text">đang mặc: ${esc(skinInfo(skin).name)}</span>
        </span>
        ${icons.chevron}
      </a>

      <section class="card">
        <h2 class="card-title" id="theme-title"><span class="title-bow">${icons.bow}</span>giao diện</h2>
        <div class="choice-list" role="radiogroup" aria-labelledby="theme-title">
          ${MODES.map((m) => `
            <label class="choice">
              <input type="radio" name="theme-mode" value="${m.id}">
              <span class="choice-mark" aria-hidden="true"></span>
              <span class="choice-text">
                <span class="choice-label">${m.label}${m.id === 'system' ? ' <span class="tag">mặc định</span>' : ''}</span>
                <span class="choice-desc">${m.desc}</span>
              </span>
            </label>`).join('')}
        </div>
      </section>

      <a class="card card-link" href="#/lab">
        <span class="card-link-text">
          <span class="card-title">phòng thử của thỏ</span>
          <span class="card-text">xem đủ 10 dáng thỏ, font tiếng việt, kaomoji và bảng màu</span>
        </span>
        ${icons.chevron}
      </a>
    </div>
  `;

  const thumb = createBunny({ state: 'happy', size: 64, skin });
  view.querySelector('.wardrobe-thumb').append(thumb.node);

  const radios = [...view.querySelectorAll('input[name="theme-mode"]')];
  const sync = () => {
    const mode = getMode();
    for (const r of radios) r.checked = r.value === mode;
  };
  sync();

  for (const r of radios) {
    r.addEventListener('change', () => { if (r.checked) setMode(r.value); });
  }

  window.addEventListener(THEME_EVENT, sync);
  return () => {
    window.removeEventListener(THEME_EVENT, sync);
    thumb.destroy();
  };
}
