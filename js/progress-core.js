// xie · progress-core.js — tiến độ học: nhật ký từng ngày, chống cày, chuỗi ngày, xp, cấp, huy hiệu.
// thuần javascript, không đụng dom hay localStorage → test bằng node (tests/progress.test.js).
// trình duyệt dùng qua js/progress.js.
//
// schema v1 (localStorage key "xie:progress"), key viết snake_case:
// {
//   version: 1,
//   xp: tổng xp,
//   level: cấp đã báo gần nhất (để biết lúc nào "lên level"),
//   days: { "yyyy-mm-dd" (giờ việt nam): ngày học — xem emptyDay() ở daily-goal.js },
//   recent: { id câu hỏi: lúc trả lời được tính (ms) } — chỉ giữ 10 phút gần nhất,
//   run: { fast, combo, wrong, last_at, session_start, break_sent } — nhịp trả lời liên tục,
//   badges: { id: "yyyy-mm-dd" ngày nhận },
//   counters: { my_words, output_words } — số liệu các giai đoạn sau ghi vào,
//   notified_until: "yyyy-mm-dd" — sự kiện chuỗi (dùng băng, đứt chuỗi) tới ngày này đã báo rồi
// }

import { todayIn, hourIn, addDays, isValidDate } from './state-core.js';
import {
  ACTIVITIES, ALMOST_LEFT, BREAK_MINUTES, SESSION_GAP_MS, REPEAT_WINDOW_MS, CHALLENGE_XP,
  emptyDay, normalizeDay, goalStatus, judgeAnswer, answerXp, addToDay, dailyChallenge, challengeProgress,
} from './daily-goal.js';
import { computeStreak, eventsBetween } from './streak.js';
import { levelFor, LEVELS } from './levels.js';
import { BADGES, newlyEarned } from './badges.js';

export const PROGRESS_VERSION = 1;
export const COMBO_STEP = 5; // combo 5, 10, 15… thì thỏ khen
export const WRONG_RUN = 3; // sai 3 câu liền thì thỏ an ủi
export const PREP_DAY_MIN = 5; // "tuần không sai giới từ": mỗi ngày ít nhất 5 câu giới từ
export const PERFECT_DAY_MIN = 30;
export const BIG_GOAL = 120;

const int = (v) => (Number.isInteger(v) && v > 0 ? v : 0);
const num = (v) => (Number.isFinite(v) ? v : null);

export function emptyRun() {
  return { fast: 0, combo: 0, wrong: 0, last_at: null, session_start: null, break_sent: false };
}

export function defaultProgress() {
  return {
    version: PROGRESS_VERSION,
    xp: 0,
    level: 1,
    days: {},
    recent: {},
    run: emptyRun(),
    badges: {},
    counters: { my_words: 0, output_words: 0 },
    notified_until: null,
  };
}

export function normalizeProgress(raw) {
  const base = defaultProgress();
  if (!raw || typeof raw !== 'object') return base;
  const days = {};
  for (const [date, rec] of Object.entries(raw.days || {})) {
    if (isValidDate(date)) days[date] = normalizeDay(rec);
  }
  const recent = {};
  for (const [item, at] of Object.entries(raw.recent || {})) if (Number.isFinite(at)) recent[item] = at;
  const run = raw.run && typeof raw.run === 'object' ? raw.run : {};
  const badges = {};
  for (const [id, date] of Object.entries(raw.badges || {})) {
    if (BADGES.some((b) => b.id === id) && isValidDate(date)) badges[id] = date;
  }
  const c = raw.counters && typeof raw.counters === 'object' ? raw.counters : {};
  return {
    version: PROGRESS_VERSION,
    xp: int(raw.xp),
    level: Number.isInteger(raw.level) && raw.level >= 1 && raw.level <= LEVELS.length ? raw.level : 1,
    days,
    recent,
    run: {
      fast: int(run.fast),
      combo: int(run.combo),
      wrong: int(run.wrong),
      last_at: num(run.last_at),
      session_start: num(run.session_start),
      break_sent: run.break_sent === true,
    },
    badges,
    counters: { my_words: int(c.my_words), output_words: int(c.output_words) },
    notified_until: isValidDate(raw.notified_until) ? raw.notified_until : null,
  };
}

// mỗi bước nhận dữ liệu ở version n, trả về version n + 1 (hiện chỉ có v1)
const MIGRATIONS = {};

export function migrateProgress(raw) {
  if (!raw || typeof raw !== 'object') return defaultProgress();
  let p = raw;
  let v = Number.isInteger(p.version) && p.version >= 1 ? p.version : 1;
  if (v > PROGRESS_VERSION) return normalizeProgress(p);
  while (v < PROGRESS_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) break;
    p = step(p);
    v += 1;
  }
  return normalizeProgress(p);
}

// ---------- thống kê cho cấp + huy hiệu ----------
export function buildStats(progress, today) {
  const streak = computeStreak(progress.days, today);
  const kinds = {};
  let bestDay = 0;
  let bestNight = 0;
  let bestEarly = 0;
  let bigGoalDays = 0;
  let perfectDay = false;
  let bestCombo = 0;
  let challengesDone = 0;
  let prepRun = 0;
  let prepWeek = 0;
  let prev = null;

  for (const date of Object.keys(progress.days).sort()) {
    const d = progress.days[date];
    for (const [k, v] of Object.entries(d.kinds)) {
      const t = kinds[k] || { n: 0, ok: 0 };
      kinds[k] = { n: t.n + v.n, ok: t.ok + v.ok };
    }
    bestDay = Math.max(bestDay, goalStatus(d).counted);
    bestNight = Math.max(bestNight, d.night);
    bestEarly = Math.max(bestEarly, d.early);
    if (d.met_at && d.goal >= BIG_GOAL) bigGoalDays += 1;
    if (d.correct + d.wrong >= PERFECT_DAY_MIN && d.wrong === 0) perfectDay = true;
    bestCombo = Math.max(bestCombo, d.best_combo);
    if (d.flags.challenge) challengesDone += 1;
    const prep = d.tags.prep;
    const goodPrepDay = prep && prep.r >= PREP_DAY_MIN && prep.w === 0;
    prepRun = goodPrepDay ? (prev && addDays(prev, 1) === date && prepRun > 0 ? prepRun + 1 : 1) : 0;
    prepWeek = Math.max(prepWeek, prepRun);
    prev = date;
  }

  const outputWords = progress.counters.output_words;
  return {
    xp: progress.xp,
    level: levelFor({ xp: progress.xp, outputWords, longestStreak: streak.longest }),
    current: streak.current,
    longest: streak.longest,
    metDays: streak.metDays,
    frozenDays: streak.frozenDays,
    comeback: streak.comeback,
    outputWords,
    myWords: progress.counters.my_words,
    kinds,
    bestDay,
    bestNight,
    bestEarly,
    bigGoalDays,
    perfectDay,
    bestCombo,
    challengesDone,
    prepWeek,
    streak,
  };
}

// ---------- ghi một câu trả lời ----------
function cloneProgress(p) {
  return {
    ...p,
    days: { ...p.days },
    recent: { ...p.recent },
    run: { ...p.run },
    badges: { ...p.badges },
    counters: { ...p.counters },
  };
}

function pruneRecent(recent, at) {
  for (const [item, t] of Object.entries(recent)) {
    if (at - t >= REPEAT_WINDOW_MS || t > at + REPEAT_WINDOW_MS) delete recent[item];
  }
}

/**
 * ghi một câu trả lời.
 * event: {
 *   kind: một trong ACTIVITIES (recognition, recall, guided, grammar, trap, game,
 *         sentence, paraphrase, speaking_p1, speaking_p2, speaking_p3, topic_sprint),
 *   item: id câu hỏi (chống trả lời lại trong 10 phút),
 *   correct: true | false | null (null = bài output tự chấm),
 *   ms: thời gian trả lời, words: số từ của bài output, tags: ["prep", …], at: lúc trả lời (ms)
 * }
 * opts: { goal (mục tiêu lượt hiện tại), weakSkill, now }
 * trả về { progress (bản mới, không sửa bản cũ), result }
 * result: { counted, reason, goalTurns, xp, capped, status, streak, level, events: [{ type, … }] }
 */
export function recordAnswer(progress, event, { goal = 50, weakSkill = null, now = Date.now() } = {}) {
  const p = cloneProgress(progress);
  const at = Number.isFinite(event?.at) ? event.at : now;
  const date = todayIn(new Date(at));
  const hour = hourIn(new Date(at));
  const events = [];

  if (!p.notified_until) p.notified_until = addDays(date, -1);

  const prevDay = p.days[date] || emptyDay(goal);
  const before = goalStatus(prevDay, goal);
  const streakBefore = computeStreak(p.days, date);

  // phiên học + thời gian học
  const run = p.run;
  const gap = Number.isFinite(run.last_at) ? at - run.last_at : Infinity;
  const sameSession = gap >= 0 && gap <= SESSION_GAP_MS;
  if (!sameSession) {
    run.session_start = at;
    run.break_sent = false;
  }

  pruneRecent(p.recent, at);
  const verdict = judgeAnswer(event, run, p.recent, at);
  run.fast = verdict.fast;
  run.last_at = at;

  let day = { ...prevDay, goal: prevDay.met_at ? prevDay.goal : goal, answers: prevDay.answers + 1 };
  if (sameSession && gap > 0) day.ms += gap;

  if (!verdict.ok) {
    day.skipped += 1;
    p.days[date] = day;
    const status = goalStatus(day, goal);
    return {
      progress: p,
      result: { counted: false, reason: verdict.reason, goalTurns: 0, xp: 0, capped: false, status, streak: streakBefore, level: p.level, events },
    };
  }

  // combo / sai liền
  if (event.correct === true) {
    run.combo += 1;
    run.wrong = 0;
  } else if (event.correct === false) {
    run.combo = 0;
    run.wrong += 1;
  }

  const xp = answerXp(event);
  const added = addToDay(day, event, { hour, xp, combo: run.combo });
  day = added.day;
  if (event.item) p.recent[event.item] = at;
  p.xp += xp;

  const status = goalStatus(day, goal);
  const act = ACTIVITIES[event.kind];
  const capped = Boolean(act.game) && added.goalTurns < act.turns;

  // tiến độ trong ngày
  if (!day.flags.half && !status.met && status.counted >= Math.ceil(status.goal / 2) && before.counted < Math.ceil(status.goal / 2)) {
    day.flags.half = true;
    events.push({ type: 'half', counted: status.counted, goal: status.goal, left: status.left });
  }
  if (!day.flags.almost && status.left > 0 && status.left <= ALMOST_LEFT) {
    day.flags.almost = true;
    events.push({ type: 'almost', left: status.left, goal: status.goal });
  }

  // đạt mục tiêu
  if (!before.met && status.reached) {
    day.met_at = at;
    day.goal = status.goal;
    events.push({ type: 'goal_met', goal: status.goal });
  }

  // thử thách mỗi ngày
  const challenge = dailyChallenge(date, weakSkill);
  if (!day.flags.challenge && challengeProgress(challenge, day).done) {
    day.flags.challenge = true;
    day.xp += CHALLENGE_XP;
    p.xp += CHALLENGE_XP;
    events.push({ type: 'challenge_done', id: challenge.id, title: challenge.title, xp: CHALLENGE_XP });
  }

  p.days[date] = day;

  // chuỗi ngày: so trước / sau để biết vừa có gì mới hôm nay
  const streakAfter = computeStreak(p.days, date);
  if (streakAfter.todayMet && !streakBefore.todayMet) {
    events.push({ type: 'streak', streak: streakAfter.current });
    for (const e of streakAfter.events.filter((x) => x.date === date)) {
      if (e.type === 'milestone' || e.type === 'freeze_earned' || e.type === 'freeze_full' || e.type === 'comeback') events.push({ ...e });
    }
  }

  // combo, sai liền, nghỉ giải lao
  if (event.correct === true && run.combo >= COMBO_STEP && run.combo % COMBO_STEP === 0) events.push({ type: 'combo', n: run.combo });
  if (event.correct === false && run.wrong === WRONG_RUN) events.push({ type: 'comfort', n: run.wrong });
  const sessionMinutes = Math.floor((at - run.session_start) / 60000);
  if (!run.break_sent && sessionMinutes >= BREAK_MINUTES) {
    run.break_sent = true;
    events.push({ type: 'break', minutes: sessionMinutes });
  }

  // cấp + huy hiệu
  const stats = buildStats(p, date);
  if (stats.level > p.level) {
    events.push({ type: 'level_up', level: stats.level, from: p.level, name: LEVELS[stats.level - 1].name });
    p.level = stats.level;
  }
  for (const id of newlyEarned(stats, p.badges)) {
    p.badges[id] = date;
    events.push({ type: 'badge', id, name: BADGES.find((b) => b.id === id).name });
  }

  return {
    progress: p,
    result: {
      counted: true,
      reason: null,
      goalTurns: added.goalTurns,
      xp: xp + (events.some((e) => e.type === 'challenge_done') ? CHALLENGE_XP : 0),
      capped,
      status: goalStatus(day, goal),
      streak: streakAfter,
      level: p.level,
      events,
    },
  };
}

// đổi mục tiêu giữa ngày: cập nhật mục tiêu của hôm nay, đủ rồi thì ghi đã đạt
export function syncToday(progress, { goal = 50, today = todayIn(), now = Date.now() } = {}) {
  const day = progress.days[today];
  if (!day || day.met_at) return { progress, changed: false };
  const status = goalStatus(day, goal);
  if (day.goal === goal && !status.reached) return { progress, changed: false };
  const next = cloneProgress(progress);
  next.days[today] = { ...day, goal, met_at: status.reached ? now : null };
  return { progress: next, changed: true };
}

// bản tóm tắt cho trang chủ / tab tui
export function summarize(progress, { goal = 50, today = todayIn(), weakSkill = null } = {}) {
  const day = progress.days[today] || emptyDay(goal);
  const stats = buildStats(progress, today);
  const challenge = dailyChallenge(today, weakSkill);
  return {
    today,
    day,
    status: goalStatus(day, day.met_at ? day.goal : goal),
    streak: stats.streak,
    stats,
    challenge,
    challengeProgress: challengeProgress(challenge, day),
    xp: progress.xp,
    level: stats.level,
  };
}

// sự kiện chuỗi của những ngày đã qua mà chưa báo (dùng băng, đứt chuỗi…).
// gọi khi mở web: trả về { notices, progress } — progress đã đánh dấu là báo rồi
export function takeNotices(progress, today = todayIn()) {
  const yesterday = addDays(today, -1);
  if (!progress.notified_until) {
    return { notices: [], progress: Object.keys(progress.days).length ? { ...progress, notified_until: yesterday } : progress };
  }
  if (progress.notified_until >= yesterday) return { notices: [], progress };
  const streak = computeStreak(progress.days, today);
  const notices = eventsBetween(streak, progress.notified_until, yesterday)
    .filter((e) => e.type === 'freeze_used' || e.type === 'broken');
  return { notices, progress: { ...progress, notified_until: yesterday } };
}

// số liệu do các giai đoạn sau ghi vào (vd. số từ trong kho output, số "từ của tui").
// trả về { progress, events } — có thể lên cấp hoặc nhận huy hiệu ngay lúc đó
export function updateCounters(progress, patch = {}, today = todayIn()) {
  const p = cloneProgress(progress);
  for (const [key, value] of Object.entries(patch)) {
    if (key in p.counters && Number.isInteger(value) && value >= 0) p.counters[key] = value;
  }
  const events = [];
  const stats = buildStats(p, today);
  if (stats.level > p.level) {
    events.push({ type: 'level_up', level: stats.level, from: p.level, name: LEVELS[stats.level - 1].name });
    p.level = stats.level;
  }
  for (const id of newlyEarned(stats, p.badges)) {
    p.badges[id] = today;
    events.push({ type: 'badge', id, name: BADGES.find((b) => b.id === id).name });
  }
  return { progress: p, events };
}

// ngữ cảnh cho thoại của thỏ: {streak} {left} {goal} {minutes}, độ chính xác hôm nay
export function voiceContext(summary) {
  const { status, streak } = summary;
  return {
    streak: streak.current,
    left: status.left,
    goal: status.goal,
    minutes: status.minutes,
    accuracy: status.accuracy === null ? undefined : Math.round(status.accuracy * 100),
  };
}
