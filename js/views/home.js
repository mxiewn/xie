// xie · views/home.js — trang chủ
// lời chào theo giờ việt nam, thỏ (có lượt rồi thì cầm cà rốt lớn dần theo tiến độ) + bong bóng thoại, nút đổi sáng/tối,
// vòng tiến độ lượt + thanh output, kế hoạch hôm nay + nút "học hôm nay" + số từ kho output,
// chuỗi ngày + lịch nơ tuần này, báo băng / đứt chuỗi, thử thách hôm nay, từ của ngày, đếm ngược kỳ thi.

import { createBunny } from '../bunny.js';
import { createBubble, icons, skyDecor, esc, randomKao } from '../ui.js';
import { currentTheme, toggleQuick, setMode, saigonHour, THEME_EVENT, THEME_REQUEST } from '../theme.js';
import { getEquippedSkin } from '../levels.js';
import { say, greetingNow, countTap } from '../voice.js';
import { getState, returnGap, examDaysLeft } from '../state.js';
import { getSummary, currentVoiceContext, peekNotices, dismissNotices, PROGRESS_EVENT } from '../progress.js';
import {
  ringHtml, metersHtml, statusLine, weekStripHtml, freezeCountHtml, noticeHtml, challengeHtml,
} from '../progress-ui.js';
import { CHALLENGE_XP } from '../daily-goal.js';
import { todayIn } from '../state-core.js';
import { isOutput } from '../srs.js';
import { todayPlan } from '../vocab-state.js';
import { wordOfDay, topicOfDay } from '../vocab-core.js';
import { vocabStats, topicsInfo, loadTopic, getVocab, VOCAB_EVENT } from '../vocab-store.js';
import { listenButton, wireListen } from '../speech.js';

function greetingFor(hour) {
  if (hour >= 5 && hour < 11) return 'sáng rồi nè';
  if (hour >= 11 && hour < 13) return 'trưa rồi nè';
  if (hour >= 13 && hour < 18) return 'chiều rồi nè';
  if (hour >= 18 && hour < 23) return 'tối rồi nè';
  return 'khuya rồi nè';
}

// kế hoạch hôm nay (spec mục 7): ôn từ đến hạn → từ mới → bài output → minigame → ngữ pháp
function planCard(sum, vs) {
  const steps = todayPlan({
    due: vs.due, newLeft: Math.max(0, vs.newPerDay - vs.newToday), goal: sum.status.goal, weakSkill: getState().profile.weak_skill,
  });
  const label = sum.status.met ? 'học thêm' : vs.due || vs.newToday < vs.newPerDay ? 'học hôm nay' : 'ôn thêm';
  return `
    <section class="card card-lace plan-card" aria-labelledby="plan-title">
      <div class="plan-head">
        <h2 class="card-title" id="plan-title"><span class="title-bow">${icons.bow}</span>kế hoạch hôm nay</h2>
        <p class="plan-output"><span class="plan-output-num">${vs.output}</span> từ trong kho output</p>
      </div>
      <ol class="plan-steps" role="list">
        ${steps.map((st) => `
          <li class="plan-step${st.ready ? '' : ' is-later'}">
            <span class="plan-name">${esc(st.label)}</span>
            <span class="plan-turns">${st.ready ? `~${st.turns} lượt` : st.id === 'games' || st.id === 'grammar' ? 'sắp có' : 'xong'}</span>
          </li>`).join('')}
      </ol>
      <a class="btn btn-primary plan-go" href="#/study">${label}</a>
    </section>`;
}

function wordOfDayCard() {
  return `
    <section class="card wotd-card" aria-labelledby="wotd-title" data-role="wotd">
      <h2 class="card-title" id="wotd-title"><span class="title-bow">${icons.bow}</span>từ của ngày</h2>
      <p class="card-text">đang chọn từ…</p>
    </section>`;
}

// chưa có lượt nào: thỏ chưa cầm cà rốt. từ lượt đầu tiên thì cầm, cà rốt từ nhỏ (0.6) tới to (1.5)
const carrotScale = (ratio) => (0.6 + 0.9 * Math.max(0, Math.min(1, ratio))).toFixed(2);
const restPoseFor = (status) => (status.counted > 0 ? 'carrot' : 'happy');

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
        <h1 class="brand"><span class="brand-bow">${icons.bow}</span>xie<span class="kao brand-kao" aria-hidden="true">${esc(randomKao('hero'))}</span></h1>
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
      <div data-role="plan">${planCard(sum, vocabStats())}</div>
      <div data-role="streak">${streakCard(sum)}</div>
      <div data-role="challenge">${challengeHtml(sum.challenge, sum.challengeProgress, CHALLENGE_XP)}</div>
      ${wordOfDayCard()}
      ${examCard(days)}
    </div>
    </div>
  `;

  // thỏ cầm cà rốt lớn dần theo tiến độ. vừa dùng băng thì quấn khăn, vừa đứt chuỗi thì buồn nhẹ
  let restPose = restPoseFor(sum.status);
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
  const switchTheme = async (target) => {
    if (busy) return;
    busy = true;
    await bunny.flip();
    let theme;
    if (target && target !== currentTheme()) { setMode(target); theme = target; } else theme = target || toggleQuick();
    speak('doi_giao_dien', { kind: theme }, { forceLine: true });
    busy = false;
  };
  toggle.addEventListener('click', () => switchTheme());
  // nút sáng / tối ở thanh menu bên trái (desktop): đang ở trang chủ thì thỏ lật người đổi ca
  const onThemeRequest = (e) => {
    e.preventDefault();
    switchTheme(e.detail?.theme);
  };
  window.addEventListener(THEME_REQUEST, onThemeRequest);

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
    view.querySelector('[data-role="plan"]').innerHTML = planCard(sum, vocabStats());
    bunny.setCarrotScale(carrotScale(sum.status.ratio));
    // vừa có lượt đầu tiên trong ngày thì thỏ cầm cà rốt lên
    const next = restPoseFor(sum.status);
    if (next !== restPose) {
      if (bunny.state === restPose) bunny.setState(next);
      restPose = next;
    }
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

  // từ của ngày: chỉ tải đúng 1 chủ đề trong ngày
  const wotd = view.querySelector('[data-role="wotd"]');
  (async () => {
    const topics = (await topicsInfo()).filter((t) => t.count > 0);
    const today = todayIn();
    const topic = topicOfDay(topics, today);
    const items = topic ? await loadTopic(topic.id) : [];
    const it = wordOfDay(items, today, getVocab().items, isOutput);
    if (!alive) return;
    if (!it) { wotd.querySelector('.card-text').textContent = 'kho từ đang trống'; return; }
    const ex = it.examples[0] || '';
    wotd.innerHTML = `
      <h2 class="card-title" id="wotd-title"><span class="title-bow">${icons.bow}</span>từ của ngày</h2>
      <div class="wotd-word" data-say="${esc(it.phrase)}"><p class="word-phrase keep-case">${esc(it.phrase)}</p>${listenButton('nghe từ của ngày')}</div>
      <p class="word-meaning">${esc(it.meaning_vi)}</p>
      ${ex ? `<p class="word-example keep-case" data-say="${esc(ex)}">${esc(ex)} ${listenButton('nghe câu ví dụ', 'listen-small')}</p>` : ''}
      <p class="exam-line" data-role="wotd-line"></p>
      <a class="btn-link" href="#/word/${encodeURIComponent(it.id)}">xem thẻ từ</a>`;
    const line = await say('tu_moi', { word: it.phrase }, { forceLine: true });
    const el = wotd.querySelector('[data-role="wotd-line"]');
    if (alive && el && line?.text) { el.textContent = `${line.text} `; const k = document.createElement('span'); k.className = 'kao'; k.textContent = line.kao; el.append(k); }
  })();
  wireListen(view);
  window.addEventListener(VOCAB_EVENT, refresh);

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
    window.removeEventListener(THEME_REQUEST, onThemeRequest);
    window.removeEventListener(PROGRESS_EVENT, refresh);
    window.removeEventListener(VOCAB_EVENT, refresh);
    bunny.destroy();
    bubble.destroy();
  };
}
