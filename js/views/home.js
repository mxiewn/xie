// xie · views/home.js — trang chủ
// lời chào theo giờ việt nam, thỏ cầm cà rốt lớn dần theo tiến độ + bong bóng thoại, nút đổi sáng/tối,
// vòng tiến độ lượt + thanh output, chuỗi ngày + lịch nơ tuần này, báo băng / đứt chuỗi,
// thử thách hôm nay, đếm ngược kỳ thi. từ của ngày, kho output, nút "học hôm nay" vào ở giai đoạn 5.

import { createBunny } from '../bunny.js';
import { createBubble, icons, skyDecor, esc } from '../ui.js';
import { currentTheme, toggleQuick, saigonHour, THEME_EVENT } from '../theme.js';
import { getEquippedSkin } from '../levels.js';
import { say, greetingNow, countTap } from '../voice.js';
import { getState, returnGap, examDaysLeft } from '../state.js';
import { getSummary, currentVoiceContext, peekNotices, dismissNotices, PROGRESS_EVENT } from '../progress.js';
import {
  ringHtml, metersHtml, statusLine, weekStripHtml, freezeCountHtml, noticeHtml, challengeHtml,
} from '../progress-ui.js';
import { CHALLENGE_XP } from '../daily-goal.js';

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return 'sáng rồi nè';
  if (hour >= 11 && hour < 13) return 'trưa rồi nè';
  if (hour >= 13 && hour < 18) return 'chiều rồi nè';
  if (hour >= 18 && hour < 23) return 'tối rồi nè';
  return 'khuya rồi nè';
}

const SOON = [
  'kế hoạch hôm nay + nút học hôm nay',
  'từ của ngày',
  'kho từ output',
];

// cà rốt từ nhỏ (0.6) tới to (1.5) theo tiến độ lượt
const carrotScale = (ratio) => (0.6 + 0.9 * Math.max(0, Math.min(1, ratio))).toFixed(2);

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

function todayCard(sum) {
  const { status } = sum;
  return `
    <section class="card card-lace today-card" aria-labelledby="today-title">
      <h2 class="card-title" id="today-title"><span class="title-bow">${icons.bow}</span>hôm nay</h2>
      <div class="today-body">
        ${ringHtml(status)}
        <div class="today-info">
          ${metersHtml(status)}
          <p class="today-status${status.met ? ' is-met' : ''}">${esc(statusLine(status))}</p>
          ${status.xp ? `<p class="today-xp">+${status.xp} xp hôm nay</p>` : ''}
        </div>
      </div>
    </section>`;
}

function streakCard(sum) {
  const { streak, today } = sum;
  const sub = [
    streak.longest ? `kỷ lục ${streak.longest} ngày` : 'chưa có kỷ lục, mở hàng thôi',
    streak.todayMet ? 'hôm nay đã giữ' : streak.current ? 'hôm nay chưa xong' : '',
  ].filter(Boolean).join(' · ');
  return `
    <a class="card streak-card" href="#/streak" aria-label="chuỗi ${streak.current} ngày, xem lịch nơ">
      <div class="streak-head">
        <p class="streak-count"><span class="streak-num">${streak.current}</span><span class="streak-unit">ngày liền</span></p>
        ${freezeCountHtml(streak.freezes)}
      </div>
      <p class="card-text streak-sub">${esc(sub)}</p>
      ${weekStripHtml(streak, today)}
      <span class="streak-more">xem lịch nơ ${icons.chevron}</span>
    </a>`;
}

export function render(view) {
  const hour = saigonHour();
  const { profile } = getState();
  const name = profile.name;
  const days = examDaysLeft();
  let sum = getSummary();
  let notices = peekNotices();

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
      <div class="notice-slot" data-role="notice">${noticeHtml(notices, sum.streak)}</div>
      <div data-role="today">${todayCard(sum)}</div>
      <div data-role="streak">${streakCard(sum)}</div>
      <div data-role="challenge">${challengeHtml(sum.challenge, sum.challengeProgress, CHALLENGE_XP)}</div>
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

  // thỏ cầm cà rốt lớn dần theo tiến độ. vừa dùng băng thì quấn khăn, vừa đứt chuỗi thì buồn nhẹ
  const restPose = 'carrot';
  const noticePose = notices.some((n) => n.type === 'broken') ? 'sad' : notices.length ? 'scarf' : null;
  const bunny = createBunny({ state: noticePose || restPose, skin: getEquippedSkin() });
  bunny.setCarrotScale(carrotScale(sum.status.ratio));
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
  const timers = [];
  const ctx = () => ({ ...currentVoiceContext(sum), ...(name ? { name } : {}) });
  const speak = async (group, extra, opts) => {
    const line = await say(group, { ...ctx(), ...extra }, opts);
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
    if (bunny.state !== restPose) bunny.setState(restPose);
    bunny.hop();
    speak('cham_tho', { n: countTap() }, { forceLine: true });
  });

  // thẻ báo tin: bấm ok thì ẩn cho cả phiên
  const noticeSlot = view.querySelector('[data-role="notice"]');
  noticeSlot.addEventListener('click', (e) => {
    if (!e.target.closest('[data-action="notice-close"]')) return;
    dismissNotices();
    notices = [];
    noticeSlot.replaceChildren();
    if (bunny.state !== restPose) bunny.setState(restPose);
  });

  // tiến độ đổi (vd. tab khác vừa làm bài) thì vẽ lại các thẻ
  const refresh = () => {
    sum = getSummary();
    view.querySelector('[data-role="today"]').innerHTML = todayCard(sum);
    view.querySelector('[data-role="streak"]').innerHTML = streakCard(sum);
    view.querySelector('[data-role="challenge"]').innerHTML = challengeHtml(sum.challenge, sum.challengeProgress, CHALLENGE_XP);
    bunny.setCarrotScale(carrotScale(sum.status.ratio));
  };
  window.addEventListener(PROGRESS_EVENT, refresh);
  window.addEventListener(THEME_EVENT, syncToggle);

  // câu chào: tin chuỗi (băng / đứt) > vắng lâu quay lại > tối rồi mà chưa xong > chào theo giờ
  const gap = returnGap();
  const broken = notices.filter((n) => n.type === 'broken').at(-1);
  timers.push(setTimeout(() => {
    if (broken) speak('mat_streak', { n: sum.streak.longest }, { forceLine: true });
    else if (notices.length) speak('dung_freeze', {}, { forceLine: true });
    else if (gap) speak('quay_lai', { days: gap }, { forceLine: true });
    else if (hour >= 19 && !sum.status.met && (sum.streak.current > 0 || sum.status.studied)) speak('nhac_hoc', {}, { forceLine: true });
    else speak(greetingNow(), {}, { forceLine: true });
  }, 700));

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
    for (const t of timers) clearTimeout(t);
    window.removeEventListener(THEME_EVENT, syncToggle);
    window.removeEventListener(PROGRESS_EVENT, refresh);
    bunny.destroy();
    bubble.destroy();
  };
}
