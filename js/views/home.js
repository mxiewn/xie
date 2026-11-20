// xie · views/home.js — trang chủ
// lời chào theo giờ việt nam, thỏ + bong bóng thoại (data/voice.json), nút đổi sáng/tối.
// vòng 50 lượt, streak, từ của ngày, đếm ngược… sẽ dọn vào ở các giai đoạn sau.

import { createBunny } from '../bunny.js';
import { createBubble, icons, skyDecor } from '../ui.js';
import { currentTheme, toggleQuick, saigonHour, THEME_EVENT } from '../theme.js';
import { getEquippedSkin } from '../levels.js';
import { say, greetingNow, countTap } from '../voice.js';

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return 'sáng rồi nè';
  if (hour >= 11 && hour < 13) return 'trưa rồi nè';
  if (hour >= 13 && hour < 18) return 'chiều rồi nè';
  if (hour >= 18 && hour < 23) return 'tối rồi nè';
  return 'khuya rồi nè';
}

const SOON = [
  'vòng tiến độ 50 lượt mỗi ngày',
  'streak và lịch nơ',
  'kho từ output',
  'từ của ngày',
  'đếm ngược ngày thi',
];

export function render(view) {
  const hour = saigonHour();
  view.innerHTML = `
    <div class="home-layout">
    <section class="hero">
      <div class="hero-sky" aria-hidden="true">${skyDecor()}</div>
      <div class="hero-top">
        <h1 class="brand">xie <span class="brand-bow">${icons.bow}</span></h1>
        <button class="icon-btn theme-toggle" type="button" data-action="theme">
          ${icons.sun}${icons.moon}
        </button>
      </div>
      <p class="greeting">${greetingFor(hour)}, <span class="greeting-name">bạn</span></p>
      <div class="bunny-stage">
        <div class="bubble-slot"></div>
        <button class="bunny-btn" type="button" aria-label="chạm vào thỏ"></button>
      </div>
      <div class="lace-edge" aria-hidden="true"></div>
    </section>

    <section class="card card-lace soon-card">
      <h2 class="card-title"><span class="title-bow">${icons.bow}</span>nhà mới đang dọn</h2>
      <p class="card-text">mấy món này sẽ lần lượt dọn vào đây:</p>
      <ul class="soon-list" role="list">
        ${SOON.map((item) => `<li>${icons.heart}<span>${item}</span></li>`).join('')}
      </ul>
      <div class="pearls" aria-hidden="true"></div>
    </section>
    </div>
  `;

  const bunny = createBunny({ state: 'happy', skin: getEquippedSkin() });
  const bubble = createBubble();
  view.querySelector('.bunny-btn').append(bunny.node);
  view.querySelector('.bubble-slot').append(bubble.node);

  const toggle = view.querySelector('[data-action="theme"]');
  const syncToggle = () => {
    const dark = currentTheme() === 'dark';
    toggle.setAttribute('aria-label', dark ? 'chuyển sang chế độ sáng' : 'chuyển sang chế độ tối');
    toggle.dataset.theme = dark ? 'dark' : 'light';
  };
  syncToggle();

  let alive = true;
  const speak = async (group, ctx, opts) => {
    const line = await say(group, ctx, opts);
    if (alive && line) bubble.say(line.text || '', line.kao);
  };

  let busy = false;
  toggle.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    await bunny.flip();
    const theme = toggleQuick();
    speak('doi_giao_dien', { kind: theme }, { forceLine: true });
    busy = false;
  });

  view.querySelector('.bunny-btn').addEventListener('click', () => {
    bunny.hop();
    speak('cham_tho', { n: countTap() }, { forceLine: true });
  });

  window.addEventListener(THEME_EVENT, syncToggle);
  const helloTimer = setTimeout(() => speak(greetingNow(), {}, { forceLine: true }), 700);

  return () => {
    alive = false;
    clearTimeout(helloTimer);
    window.removeEventListener(THEME_EVENT, syncToggle);
    bunny.destroy();
    bubble.destroy();
  };
}
