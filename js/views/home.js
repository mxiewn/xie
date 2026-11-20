// xie · views/home.js — trang chủ
// giai đoạn 1: lời chào theo giờ việt nam, thỏ + bong bóng thoại, nút đổi sáng/tối.
// vòng 50 lượt, streak, từ của ngày, đếm ngược… sẽ dọn vào ở các giai đoạn sau.
// thoại ở đây là bản tạm, giai đoạn 2 chuyển hết sang data/voice.json.

import { createBunny } from '../bunny.js';
import { createBubble, icons, skyDecor } from '../ui.js';
import { currentTheme, toggleQuick, saigonHour, THEME_EVENT } from '../theme.js';
import { getEquippedSkin } from '../levels.js';

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return 'sáng rồi nè';
  if (hour >= 11 && hour < 13) return 'trưa rồi nè';
  if (hour >= 13 && hour < 18) return 'chiều rồi nè';
  if (hour >= 18 && hour < 23) return 'tối rồi nè';
  return 'khuya rồi nè';
}

const LINES = {
  hello: { text: 'hii, tui là thỏ của xie. nhà mới dọn, ghé chơi trước nha', kao: '(˶ᵔ ᵕ ᵔ˶)ﾉ' },
  toDark: { text: 'đèn tắt. thỏ chuyển sang ca đêm', kao: '( ˘ᵕ˘ ) ☾' },
  toLight: { text: 'đèn bật. thỏ vào ca ngày', kao: '(˶ᵔ ᵕ ᵔ˶)☀︎' },
};

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

  let busy = false;
  toggle.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    await bunny.flip();
    const theme = toggleQuick();
    const line = theme === 'dark' ? LINES.toDark : LINES.toLight;
    bubble.say(line.text, line.kao);
    busy = false;
  });

  view.querySelector('.bunny-btn').addEventListener('click', () => {
    bunny.hop();
    bubble.say(LINES.hello.text, LINES.hello.kao);
  });

  window.addEventListener(THEME_EVENT, syncToggle);
  const helloTimer = setTimeout(() => bubble.say(LINES.hello.text, LINES.hello.kao), 700);

  return () => {
    clearTimeout(helloTimer);
    window.removeEventListener(THEME_EVENT, syncToggle);
    bunny.destroy();
    bubble.destroy();
  };
}
