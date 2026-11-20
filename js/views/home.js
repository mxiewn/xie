// xie · views/home.js — trang chủ
// lời chào theo giờ việt nam, thỏ + bong bóng thoại (data/voice.json), nút đổi sáng/tối.
// vòng 50 lượt, streak, từ của ngày, đếm ngược… sẽ dọn vào ở các giai đoạn sau.

import { createBunny } from '../bunny.js';
import { createBubble, icons, skyDecor, esc } from '../ui.js';
import { currentTheme, toggleQuick, saigonHour, THEME_EVENT } from '../theme.js';
import { getEquippedSkin } from '../levels.js';
import { say, greetingNow, countTap } from '../voice.js';
import { getState, returnGap, examDaysLeft } from '../state.js';

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return 'sáng rồi nè';
  if (hour >= 11 && hour < 13) return 'trưa rồi nè';
  if (hour >= 13 && hour < 18) return 'chiều rồi nè';
  if (hour >= 18 && hour < 23) return 'tối rồi nè';
  return 'khuya rồi nè';
}

const SOON = [
  'vòng tiến độ lượt mỗi ngày',
  'streak và lịch nơ',
  'kho từ output',
  'từ của ngày',
];

function examCard(days) {
  if (days === null || days < 0) {
    const passed = days !== null;
    return `
      <a class="card card-link exam-card" href="#/settings">
        <span class="card-link-text">
          <span class="card-title">${passed ? 'ngày thi đã qua' : 'chưa có ngày thi'}</span>
          <span class="card-text">${passed ? 'có lịch thi mới thì cập nhật trong cài đặt nha' : 'đặt ngày thi để tui đếm ngược giùm bạn'}</span>
        </span>
        ${icons.chevron}
      </a>`;
  }
  return `
    <section class="card card-lace exam-card" aria-label="đếm ngược ngày thi">
      <p class="exam-count"><span class="exam-days">${days}</span><span class="exam-unit">${days === 0 ? 'hôm nay thi' : 'ngày nữa tới ngày thi'}</span></p>
      <p class="exam-line" data-role="exam-line"></p>
    </section>`;
}

export function render(view) {
  const hour = saigonHour();
  const { profile } = getState();
  const name = profile.name;
  const days = examDaysLeft();
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
      <p class="greeting">${greetingFor(hour)}, <span class="greeting-name">${esc(name || 'bạn')}</span></p>
      <div class="bunny-stage">
        <div class="bubble-slot"></div>
        <button class="bunny-btn" type="button" aria-label="chạm vào thỏ"></button>
      </div>
      <div class="lace-edge" aria-hidden="true"></div>
    </section>

    <div class="home-side">
    ${examCard(days)}
    <section class="card card-lace soon-card">
      <h2 class="card-title"><span class="title-bow">${icons.bow}</span>nhà mới đang dọn</h2>
      <p class="card-text">mấy món này sẽ lần lượt dọn vào đây:</p>
      <ul class="soon-list" role="list">
        ${SOON.map((item) => `<li>${icons.heart}<span>${item}</span></li>`).join('')}
      </ul>
      <div class="pearls" aria-hidden="true"></div>
    </section>
    </div>
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
  const ctx = name ? { name } : {};
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
    speak('cham_tho', { ...ctx, n: countTap() }, { forceLine: true });
  });

  window.addEventListener(THEME_EVENT, syncToggle);
  // vắng từ 3 ngày trở lên thì chào "quay lại", còn không thì chào theo giờ
  const gap = returnGap();
  const helloTimer = setTimeout(() => {
    if (gap) speak('quay_lai', { ...ctx, days: gap }, { forceLine: true });
    else speak(greetingNow(), ctx, { forceLine: true });
  }, 700);

  const examLine = view.querySelector('[data-role="exam-line"]');
  if (examLine && days > 0) {
    say('dem_nguoc', { days }, { forceLine: true }).then((line) => {
      if (!alive || !line?.text) return;
      examLine.textContent = `${line.text} `;
      const k = document.createElement('span');
      k.className = 'kao';
      k.textContent = line.kao;
      examLine.append(k);
    });
  }

  return () => {
    alive = false;
    clearTimeout(helloTimer);
    window.removeEventListener(THEME_EVENT, syncToggle);
    bunny.destroy();
    bubble.destroy();
  };
}
