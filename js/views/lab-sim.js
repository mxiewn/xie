// xie · views/lab-sim.js — "giả lập ngày học" trong phòng thử (#/lab).
// chạy đúng lõi thật (progress-core: lượt, chống cày, chuỗi, băng, xp, cấp, huy hiệu)
// nhưng trên dữ liệu TẠM trong bộ nhớ: không ghi vào tiến độ thật, tải lại trang là mất.
// dùng để xem bằng mắt khi các bài học thật (giai đoạn 5–8) chưa có.

import { esc, bowConfetti } from '../ui.js';
import { defaultProgress, recordAnswer, summarize, takeNotices, voiceContext } from '../progress-core.js';
import { reasonText, ACTIVITIES } from '../daily-goal.js';
import { addDays, todayIn, DAILY_GOALS } from '../state-core.js';
import { ringHtml, metersHtml, statusLine, weekStripHtml, monthHtml, freezeCountHtml, legendHtml, shortDate } from '../progress-ui.js';
import { levelInfo } from '../levels.js';
import { eventLine, sideToast } from '../progress.js';
import { loadVoice } from '../voice.js';
import { pick, emptyHistory } from '../voice-core.js';
import { getState } from '../state.js';

const VN = (date, time) => Date.parse(`${date}T${time}+07:00`);

const BUTTONS = [
  ['recognition', 'nhận biết đúng', { kind: 'recognition', correct: true }],
  ['recall-wrong', 'nhớ lại sai', { kind: 'recall', correct: false }],
  ['guided', 'giới từ đúng', { kind: 'guided', correct: true, tags: ['prep'] }],
  ['game', 'câu game', { kind: 'game', correct: true }],
  ['sentence', 'tự viết câu · 3', { kind: 'sentence', words: 12, ms: 45_000 }],
  ['p1', 'part 1 · 3', { kind: 'speaking_p1', ms: 30_000 }],
  ['sprint', 'topic sprint · 10', { kind: 'topic_sprint', words: 70, ms: 300_000 }],
  ['p2', 'part 2 · 10', { kind: 'speaking_p2', ms: 180_000 }],
];

const TRICKS = [
  ['repeat', 'trả lời lại câu vừa rồi'],
  ['fast', 'bấm nhanh 2 câu < 1 giây'],
  ['short', 'output 3 từ'],
  ['ten', '+10 câu nhận biết'],
  ['finish', 'làm đủ mục tiêu'],
];

const EVENT_LABEL = {
  half: 'nửa chặng', almost: 'sắp xong', goal_met: 'đạt mục tiêu', streak: 'chuỗi +1', milestone: 'mốc chuỗi',
  freeze_earned: 'nhận băng', freeze_full: 'đủ băng', comeback: 'nối lại chuỗi', combo: 'combo', comfort: 'an ủi',
  break: 'nghỉ giải lao', level_up: 'lên cấp', badge: 'huy hiệu', challenge_done: 'xong thử thách',
  freeze_used: 'băng đã cứu', broken: 'đứt chuỗi',
};

export function simCardHtml() {
  return `
    <section class="card sim-card" aria-labelledby="sim-title">
      <h2 class="card-title" id="sim-title">giả lập ngày học</h2>
      <p class="card-text">chạy đúng luật lượt, chống cày, chuỗi và băng, nhưng trên dữ liệu tạm. tiến độ thật không đổi.</p>
      <div class="sim-top">
        <p class="sim-clock" data-sim="clock"></p>
        <label class="select-row">
          <span>mục tiêu</span>
          <select data-sim="goal">${DAILY_GOALS.map((g) => `<option value="${g}">${g} lượt</option>`).join('')}</select>
        </label>
      </div>
      <div class="sim-panel">
        <div data-sim="ring"></div>
        <div class="sim-info" data-sim="info"></div>
      </div>
      <div class="sim-buttons" role="group" aria-label="trả lời">
        ${BUTTONS.map(([id, label]) => `<button class="btn btn-ghost btn-small" type="button" data-sim-answer="${id}">${esc(label)}</button>`).join('')}
      </div>
      <div class="sim-buttons" role="group" aria-label="thử chống cày và làm nhanh">
        ${TRICKS.map(([id, label]) => `<button class="btn btn-ghost btn-small" type="button" data-sim-trick="${id}">${esc(label)}</button>`).join('')}
      </div>
      <div class="sim-buttons" role="group" aria-label="đổi ngày">
        <button class="btn btn-primary btn-small" type="button" data-sim-day="next">qua ngày mới</button>
        <button class="btn btn-ghost btn-small" type="button" data-sim-day="skip">vắng ngày mai</button>
        <button class="btn btn-ghost btn-small" type="button" data-sim-day="week">đủ 7 ngày liền</button>
        <button class="btn btn-ghost btn-small" type="button" data-sim-day="reset">làm lại</button>
      </div>
      <div data-sim="week"></div>
      <div data-sim="month"></div>
      ${legendHtml()}
      <ol class="sim-log" data-sim="log" aria-live="polite"></ol>
    </section>`;
}

export function mountSim(root) {
  const $ = (sel) => root.querySelector(sel);
  const { profile } = getState();
  const goalSel = $('[data-sim="goal"]');
  goalSel.value = String(profile.daily_goal);

  let voice = null;
  loadVoice().then((d) => { voice = d; });
  const history = emptyHistory();

  let p;
  let date;
  let clock;
  let n;
  let lastItem;
  let log;

  const goal = () => Number(goalSel.value);
  const opts = () => ({ goal: goal(), weakSkill: profile.weak_skill });

  function reset() {
    p = defaultProgress();
    date = todayIn();
    clock = VN(date, '09:00:00');
    n = 0;
    lastItem = null;
    log = [];
  }

  function addLog(text, kind = '') {
    log.unshift({ text, kind });
    log = log.slice(0, 30);
  }

  function speakLine(e) {
    const mapped = eventLine(e, profile.name);
    if (!mapped || !voice) return '';
    const [group, ctx] = mapped;
    const sum = summarize(p, { ...opts(), today: date });
    const r = pick(voice, group, { ...voiceContext(sum), hour: 10, ...ctx, name: profile.name || undefined }, { history, forceLine: true });
    return r ? `${r.text || ''} ${r.kao}` : '';
  }

  function logEvents(events) {
    for (const e of events) {
      const extra = e.type === 'badge' ? `: ${e.name}` : e.type === 'level_up' ? `: cấp ${e.level} · ${levelInfo(e.level).name}` : e.type === 'challenge_done' ? `: ${e.title}` : '';
      const line = speakLine(e) || (e.type === 'badge' ? '' : sideToast(e)?.[0] ?? '');
      addLog(`${EVENT_LABEL[e.type] || e.type}${extra}${line ? ` — ${line}` : ''}`, 'event');
      if (e.type === 'level_up' || e.type === 'milestone') bowConfetti(18);
    }
  }

  function answer(base, { item, gapMs = 5000 } = {}) {
    n += 1;
    clock += gapMs;
    const event = { ms: 3000, ...base, item: item || `sim-${n}`, at: clock };
    const { progress, result } = recordAnswer(p, event, { ...opts(), now: clock });
    p = progress;
    lastItem = event.item;
    const label = ACTIVITIES[event.kind]?.label || event.kind;
    if (result.counted) {
      const mark = event.correct === false ? '✗' : '✓';
      addLog(`${mark} ${label}: +${result.goalTurns} lượt${result.capped ? ' (game đã đủ 25, không cộng lượt)' : ''}, +${result.xp} xp`);
    } else {
      addLog(`không tính · ${label}: ${reasonText(result.reason)}`, 'skip');
    }
    logEvents(result.events);
    return result;
  }

  function finishDay() {
    for (let guard = 0; guard < 400; guard++) {
      const s = summarize(p, { ...opts(), today: date }).status;
      if (s.met) break;
      if (s.outputLeft > 0) answer({ kind: 'sentence', words: 12, ms: 40_000 }, { gapMs: 41_000 });
      else answer({ kind: 'recognition', correct: true });
    }
  }

  function changeDay(days) {
    date = addDays(date, days);
    clock = VN(date, '09:00:00');
    const r = takeNotices(p, date);
    p = r.progress;
    addLog(`— sang ngày ${shortDate(date)} —`, 'day');
    logEvents(r.notices);
  }

  function draw() {
    const sum = summarize(p, { ...opts(), today: date });
    const time = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(clock));
    $('[data-sim="clock"]').textContent = `ngày ${shortDate(date)} · ${time}`;
    $('[data-sim="ring"]').innerHTML = ringHtml(sum.status);
    $('[data-sim="info"]').innerHTML = `
      ${metersHtml(sum.status)}
      <p class="today-status">${esc(statusLine(sum.status))}</p>
      <p class="sim-stats">chuỗi <b>${sum.streak.current}</b> · kỷ lục ${sum.streak.longest} · ${freezeCountHtml(sum.streak.freezes)}</p>
      <p class="sim-stats">${sum.xp} xp · cấp ${sum.level} · ${esc(levelInfo(sum.level).name)} · ${Object.keys(p.badges).length} huy hiệu</p>`;
    $('[data-sim="week"]').innerHTML = weekStripHtml(sum.streak, date);
    const [y, m] = date.split('-').map(Number);
    $('[data-sim="month"]').innerHTML = monthHtml(sum.streak, y, m, date);
    $('[data-sim="log"]').innerHTML = log.map((l) => `<li class="sim-log-${l.kind || 'answer'}">${esc(l.text)}</li>`).join('');
  }

  root.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || !root.contains(btn)) return;
    const a = btn.dataset.simAnswer;
    const t = btn.dataset.simTrick;
    const d = btn.dataset.simDay;
    if (a) answer(BUTTONS.find(([id]) => id === a)[2]);
    if (t === 'repeat') {
      if (lastItem) answer({ kind: 'recognition', correct: true }, { item: lastItem });
    }
    if (t === 'fast') {
      answer({ kind: 'recognition', correct: true, ms: 400 }, { gapMs: 600 });
      answer({ kind: 'recognition', correct: true, ms: 400 }, { gapMs: 600 });
    }
    if (t === 'short') answer({ kind: 'sentence', words: 3, ms: 8000 });
    if (t === 'ten') for (let i = 0; i < 10; i++) answer({ kind: 'recognition', correct: true });
    if (t === 'finish') finishDay();
    if (d === 'next') changeDay(1);
    if (d === 'skip') changeDay(2);
    if (d === 'week') {
      // làm đủ 7 ngày liền, dừng ở ngày thứ 7 (đã xong) để bấm "vắng 1 ngày" là thấy băng cứu
      for (let i = 0; i < 7; i++) {
        if (i) changeDay(1);
        finishDay();
      }
    }
    if (d === 'reset') reset();
    if (a || t || d) draw();
  });
  goalSel.addEventListener('change', draw);

  reset();
  draw();
}
