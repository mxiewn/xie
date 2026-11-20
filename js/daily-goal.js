// xie · daily-goal.js — mục tiêu lượt mỗi ngày (spec mục 6) + thử thách mỗi ngày (spec mục 13).
// thuần javascript, không đụng dom hay localStorage → test bằng node (tests/daily-goal.test.js).
//
// luật:
//   - 1 lượt = 1 câu trả lời được chấm (nhận biết, nhớ lại, dùng có hướng dẫn, ngữ pháp, game, bẫy người việt)
//   - bài output tính nhiều hơn: tự viết câu 3, paraphrase 5, part 1 3, part 3 5, topic sprint 10, part 2 10
//   - giữ chuỗi khi đủ mục tiêu (≥ 50) VÀ trong đó có ≥ 10 lượt output
//   - lượt game tính tối đa 25 cho mục tiêu (xp vẫn đủ)
//   - chống cày: trả lời lại đúng câu đó trong 10 phút, trả lời nhanh hơn 1 giây liên tục,
//     bài output dưới 5 từ → không tính

import { daysBetween, isValidDate } from './state-core.js';

export const GAME_CAP = 25;
export const OUTPUT_MIN = 10;
export const REPEAT_WINDOW_MS = 10 * 60 * 1000;
export const FAST_MS = 1000;
export const FAST_RUN = 2; // câu nhanh hơn 1 giây thứ 2 liên tiếp trở đi thì không tính
export const MIN_OUTPUT_WORDS = 5;
export const ALMOST_LEFT = 5; // còn ≤ 5 lượt thì thỏ nhắc "sắp xong"
export const SESSION_GAP_MS = 5 * 60 * 1000; // nghỉ quá 5 phút là phiên học mới
export const BREAK_MINUTES = 25; // học liền quá 25 phút thì thỏ nhắc nghỉ
export const WRONG_XP = 1; // sai vẫn có chút xp cho công sức
export const NIGHT_HOURS = [23, 4]; // cú đêm: 23:00 – 3:59
export const EARLY_HOURS = [4, 7]; // chim sớm: 4:00 – 6:59

// loại bài: số lượt, xp khi đúng. xp: output > dùng có hướng dẫn > nhận biết
export const ACTIVITIES = {
  recognition: { label: 'nhận biết', turns: 1, xp: 2 },
  recall: { label: 'nhớ lại', turns: 1, xp: 4 },
  guided: { label: 'dùng có hướng dẫn', turns: 1, xp: 6 },
  grammar: { label: 'ngữ pháp', turns: 1, xp: 5 },
  trap: { label: 'bẫy người việt', turns: 1, xp: 5 },
  game: { label: 'minigame', turns: 1, xp: 3, game: true },
  sentence: { label: 'tự viết câu', turns: 3, xp: 18, output: true },
  paraphrase: { label: 'paraphrase đề', turns: 5, xp: 30, output: true },
  speaking_p1: { label: 'speaking part 1', turns: 3, xp: 18, output: true },
  speaking_p3: { label: 'speaking part 3', turns: 5, xp: 30, output: true },
  topic_sprint: { label: 'topic sprint', turns: 10, xp: 60, output: true },
  speaking_p2: { label: 'speaking part 2', turns: 10, xp: 60, output: true },
};

export const ACTIVITY_IDS = Object.keys(ACTIVITIES);

const REASONS = {
  repeat: 'câu này vừa trả lời trong 10 phút, lần này không tính lượt',
  too_fast: 'trả lời nhanh liên tục dưới 1 giây, lần này không tính lượt',
  too_short: 'bài output dưới 5 từ nên chưa tính lượt',
  unknown: 'loại bài lạ, không tính lượt',
};

export function reasonText(reason) {
  return REASONS[reason] || '';
}

// ---------- một ngày học ----------
export function emptyDay(goal = 50) {
  return {
    goal,
    turns: 0, // lượt hợp lệ (chưa giới hạn game)
    output: 0, // lượt output hợp lệ
    game: 0, // lượt game hợp lệ
    xp: 0,
    answers: 0, // mọi câu trả lời, kể cả câu không tính
    correct: 0,
    wrong: 0,
    skipped: 0, // không tính vì chống cày
    kinds: {}, // { loại: { n: số lần hợp lệ, ok: số lần đúng } }
    tags: {}, // { nhãn: { r: đúng, w: sai } } — vd. "prep" (giới từ)
    best_combo: 0,
    ms: 0, // thời gian học ước lượng
    night: 0,
    early: 0,
    met_at: null, // lúc đạt mục tiêu (ms). đã đạt thì giữ, kể cả khi đổi mục tiêu cao hơn sau đó
    flags: {}, // sự kiện chỉ báo 1 lần mỗi ngày: half, almost, challenge
  };
}

const int = (v) => (Number.isInteger(v) && v > 0 ? v : 0);

export function normalizeDay(raw, fallbackGoal = 50) {
  const base = emptyDay(fallbackGoal);
  if (!raw || typeof raw !== 'object') return base;
  const kinds = {};
  for (const [k, v] of Object.entries(raw.kinds || {})) {
    if (ACTIVITIES[k] && v && typeof v === 'object') kinds[k] = { n: int(v.n), ok: int(v.ok) };
  }
  const tags = {};
  for (const [k, v] of Object.entries(raw.tags || {})) {
    if (/^[a-z_-]{1,24}$/.test(k) && v && typeof v === 'object') tags[k] = { r: int(v.r), w: int(v.w) };
  }
  const flags = {};
  for (const [k, v] of Object.entries(raw.flags || {})) if (v === true) flags[k] = true;
  const day = {
    ...base,
    goal: Number.isInteger(raw.goal) && raw.goal >= 50 ? raw.goal : fallbackGoal,
    kinds,
    tags,
    flags,
    met_at: Number.isFinite(raw.met_at) ? raw.met_at : null,
  };
  for (const key of ['turns', 'output', 'game', 'xp', 'answers', 'correct', 'wrong', 'skipped', 'best_combo', 'ms', 'night', 'early']) {
    day[key] = int(raw[key]);
  }
  return day;
}

// tình hình mục tiêu của một ngày. goal bỏ trống thì dùng mục tiêu đã lưu trong ngày đó
export function goalStatus(day, goal) {
  const d = day || emptyDay(goal);
  const g = Number.isInteger(goal) && goal > 0 ? goal : d.goal || 50;
  const gameCounted = Math.min(d.game, GAME_CAP);
  const counted = d.turns - d.game + gameCounted;
  const left = Math.max(0, g - counted);
  const outputLeft = Math.max(0, OUTPUT_MIN - d.output);
  const reached = counted >= g && d.output >= OUTPUT_MIN;
  const graded = d.correct + d.wrong;
  return {
    goal: g,
    counted,
    left,
    output: d.output,
    outputMin: OUTPUT_MIN,
    outputLeft,
    game: d.game,
    gameCounted,
    gameCap: GAME_CAP,
    reached,
    met: Boolean(d.met_at) || reached,
    ratio: Math.min(1, counted / g),
    studied: d.turns > 0,
    accuracy: graded ? d.correct / graded : null,
    minutes: Math.round(d.ms / 60000),
    xp: d.xp,
  };
}

// ---------- chống cày ----------
// run: { fast, last_at } của người học; recent: { item: lúc trả lời được tính gần nhất }
export function judgeAnswer(event, run = {}, recent = {}, at = Date.now()) {
  const act = ACTIVITIES[event?.kind];
  if (!act) return { ok: false, reason: 'unknown', fast: run.fast || 0 };

  // thời gian trả lời: lấy event.ms, không có thì đo từ câu trước
  const ms = Number.isFinite(event.ms) ? event.ms : Number.isFinite(run.last_at) ? at - run.last_at : Infinity;
  const fast = ms >= 0 && ms < FAST_MS ? (run.fast || 0) + 1 : 0;

  if (act.output && Number.isFinite(event.words) && event.words < MIN_OUTPUT_WORDS) {
    return { ok: false, reason: 'too_short', fast };
  }
  if (event.item && Number.isFinite(recent[event.item]) && at - recent[event.item] >= 0 && at - recent[event.item] < REPEAT_WINDOW_MS) {
    return { ok: false, reason: 'repeat', fast };
  }
  if (fast >= FAST_RUN) return { ok: false, reason: 'too_fast', fast };
  return { ok: true, reason: null, fast };
}

// xp của một câu đã được tính. correct === false: sai (xp nhỏ); null / undefined: bài tự chấm (output)
export function answerXp(event) {
  const act = ACTIVITIES[event?.kind];
  if (!act) return 0;
  return event.correct === false ? WRONG_XP : act.xp;
}

function inHours(hour, [from, to]) {
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

// cộng một câu ĐÃ được tính vào ngày. trả về ngày mới + số lượt tính vào mục tiêu
export function addToDay(day, event, { hour = 12, xp = answerXp(event), combo = 0 } = {}) {
  const act = ACTIVITIES[event.kind];
  const before = goalStatus(day);
  const d = {
    ...day,
    kinds: { ...day.kinds },
    tags: { ...day.tags },
    flags: { ...day.flags },
  };
  d.turns += act.turns;
  if (act.output) d.output += act.turns;
  if (act.game) d.game += act.turns;
  d.xp += xp;
  const k = d.kinds[event.kind] || { n: 0, ok: 0 };
  d.kinds[event.kind] = { n: k.n + 1, ok: k.ok + (event.correct === true || (act.output && event.correct !== false) ? 1 : 0) };
  if (event.correct === true) d.correct += 1;
  if (event.correct === false) d.wrong += 1;
  for (const tag of Array.isArray(event.tags) ? event.tags : []) {
    if (!/^[a-z_-]{1,24}$/.test(tag) || typeof event.correct !== 'boolean') continue;
    const t = d.tags[tag] || { r: 0, w: 0 };
    d.tags[tag] = event.correct ? { r: t.r + 1, w: t.w } : { r: t.r, w: t.w + 1 };
  }
  d.best_combo = Math.max(d.best_combo, combo);
  if (inHours(hour, NIGHT_HOURS)) d.night += act.turns;
  if (inHours(hour, EARLY_HOURS)) d.early += act.turns;
  const after = goalStatus(d);
  return { day: d, goalTurns: after.counted - before.counted };
}

// ---------- thử thách mỗi ngày: xoay vòng, ưu tiên kỹ năng yếu nhất ----------
export const CHALLENGE_XP = 50;
export const CHALLENGE_SKILLS = ['writing', 'speaking', 'grammar', 'vocab'];

export const CHALLENGES = [
  { id: 'viet-3-cau', skill: 'writing', title: 'tự viết 3 câu dùng từ mục tiêu', kind: 'sentence', target: 3 },
  { id: 'sprint-1', skill: 'writing', title: 'chạy xong 1 topic sprint', kind: 'topic_sprint', target: 1 },
  { id: 'paraphrase-2', skill: 'writing', title: 'paraphrase 2 đề task 2', kind: 'paraphrase', target: 2 },
  { id: 'part1-3', skill: 'speaking', title: 'nói to 3 câu part 1', kind: 'speaking_p1', target: 3 },
  { id: 'part2-1', skill: 'speaking', title: 'nói trọn 1 cue card part 2', kind: 'speaking_p2', target: 1 },
  { id: 'part3-2', skill: 'speaking', title: 'trả lời 2 câu part 3 có lý do và ví dụ', kind: 'speaking_p3', target: 2 },
  { id: 'ngu-phap-15', skill: 'grammar', title: 'làm 15 câu ngữ pháp', kind: 'grammar', target: 15 },
  { id: 'ngu-phap-dung-10', skill: 'grammar', title: 'làm đúng 10 câu ngữ pháp', kind: 'grammar', target: 10, correct: true },
  { id: 'bay-10', skill: 'grammar', title: 'né đúng 10 bẫy người việt', kind: 'trap', target: 10, correct: true },
  { id: 'nho-lai-20', skill: 'vocab', title: 'gõ ra 20 từ ở bài nhớ lại', kind: 'recall', target: 20 },
  { id: 'huong-dan-15', skill: 'vocab', title: 'làm 15 câu dùng có hướng dẫn', kind: 'guided', target: 15 },
  { id: 'combo-10', skill: 'vocab', title: 'trả lời đúng 10 câu liền', metric: 'combo', target: 10 },
];

const EPOCH = '2026-01-05'; // một ngày thứ hai bất kỳ, làm mốc đếm vòng xoay

const mod = (a, n) => ((a % n) + n) % n;

// có kỹ năng yếu: 2/3 số ngày là thử thách kỹ năng yếu, ngày còn lại xoay qua 3 kỹ năng kia.
// chưa chọn kỹ năng yếu: xoay đều 4 kỹ năng.
export function dailyChallenge(date, weakSkill = null) {
  const idx = isValidDate(date) ? daysBetween(EPOCH, date) : 0;
  let skill;
  let slot;
  if (CHALLENGE_SKILLS.includes(weakSkill)) {
    const cycle = Math.floor(idx / 3);
    if (mod(idx, 3) === 2) {
      const others = CHALLENGE_SKILLS.filter((s) => s !== weakSkill);
      skill = others[mod(cycle, others.length)];
      slot = Math.floor(cycle / others.length);
    } else {
      skill = weakSkill;
      slot = cycle * 2 + mod(idx, 3);
    }
  } else {
    skill = CHALLENGE_SKILLS[mod(idx, CHALLENGE_SKILLS.length)];
    slot = Math.floor(idx / CHALLENGE_SKILLS.length);
  }
  const pool = CHALLENGES.filter((c) => c.skill === skill);
  return pool[mod(slot, pool.length)];
}

export function challengeProgress(challenge, day) {
  if (!challenge) return null;
  const d = day || emptyDay();
  let value;
  if (challenge.metric === 'combo') value = d.best_combo;
  else value = challenge.correct ? d.kinds[challenge.kind]?.ok || 0 : d.kinds[challenge.kind]?.n || 0;
  return { value: Math.min(value, challenge.target), target: challenge.target, done: value >= challenge.target };
}
