// xie · progress.js — tiến độ học trên trình duyệt (localStorage "xie:progress").
// logic thuần (lượt, chống cày, chuỗi, xp, cấp, huy hiệu) nằm ở progress-core.js.
//
// các giai đoạn sau (từ vựng, luyện viết/nói, game, ngữ pháp) chỉ cần:
//   const result = recordAnswer({ kind, item, correct, ms, words, tags });
//   celebrate(result.events, { bubble, bunny });
// rồi hiện reasonText(result.reason) nếu câu đó không được tính lượt.

import { readRaw, writeRaw } from './storage.js';
import {
  migrateProgress, recordAnswer as coreRecord, summarize, takeNotices as coreTakeNotices,
  syncToday, updateCounters as coreUpdateCounters, voiceContext,
} from './progress-core.js';
import { todayIn } from './state-core.js';
import { getState } from './state.js';
import { setLevelProvider, levelInfo } from './levels.js';
import { say } from './voice.js';
import { showToast, bowConfetti } from './ui.js';

export const PROGRESS_EVENT = 'xie:progress';
const KEY = 'progress';

let cache = null;
let notices = null; // thông báo chuỗi của lần mở web này (dùng băng, đứt chuỗi), giữ tới khi bấm ẩn

export function getProgress() {
  if (cache) return cache;
  let raw = null;
  try {
    raw = JSON.parse(readRaw(KEY) || 'null');
  } catch {
    raw = null; // hỏng thì bắt đầu lại, không làm sập web
  }
  cache = migrateProgress(raw);
  return cache;
}

function persist(next) {
  cache = next;
  writeRaw(KEY, JSON.stringify(next)); // bị chặn thì vẫn giữ trong bộ nhớ cho phiên này
  window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: next }));
  return next;
}

function learnerOpts() {
  const { profile } = getState();
  return { goal: profile.daily_goal, weakSkill: profile.weak_skill };
}

// ghi một câu trả lời. trả về result của progress-core (counted, reason, events…)
export function recordAnswer(event) {
  const { progress, result } = coreRecord(getProgress(), event, { ...learnerOpts(), now: Date.now() });
  persist(progress);
  return result;
}

// số liệu từ giai đoạn sau: setCounters({ output_words: 57 }). trả về sự kiện (lên cấp, huy hiệu)
export function setCounters(patch) {
  const { progress, events } = coreUpdateCounters(getProgress(), patch, todayIn());
  persist(progress);
  return events;
}

// tóm tắt hôm nay: lượt, output, game, chuỗi, lịch, xp, cấp, thử thách
export function getSummary() {
  const opts = learnerOpts();
  const today = todayIn();
  const synced = syncToday(getProgress(), { goal: opts.goal, today, now: Date.now() });
  if (synced.changed) persist(synced.progress);
  return summarize(getProgress(), { ...opts, today });
}

export function currentVoiceContext(summary = getSummary()) {
  return voiceContext(summary);
}

// gọi một lần khi mở web: lấy các sự kiện chuỗi chưa báo
export function loadNotices() {
  const { notices: list, progress } = coreTakeNotices(getProgress(), todayIn());
  if (progress !== getProgress()) persist(progress);
  notices = list;
  return list;
}

export function peekNotices() {
  return notices || [];
}

export function dismissNotices() {
  notices = [];
}

// cấp hiện tại cho tủ đồ (levels.js)
setLevelProvider(() => getProgress().level);

// ---------- ăn mừng ----------
// sự kiện quan trọng nhất lên bong bóng thoại, vài sự kiện phụ thành thông báo nhỏ
const MAIN = ['level_up', 'milestone', 'goal_met', 'freeze_earned', 'streak', 'almost', 'half', 'combo', 'comfort', 'break'];

// sự kiện → [nhóm thoại, ngữ cảnh, dáng thỏ]
export function eventLine(e, name = '') {
  switch (e.type) {
    case 'level_up': return ['len_level', { name, level: levelInfo(e.level).name }, 'crown'];
    case 'milestone': return ['moc_streak', { kind: e.kind, streak: e.streak }, 'heart'];
    case 'goal_met': return ['xong_muc_tieu', { goal: e.goal }, 'carrot'];
    case 'freeze_earned': return ['moc_streak', { kind: 'freeze', streak: e.streak }, 'heart'];
    case 'streak': return ['streak_giu', { streak: e.streak }, 'happy'];
    case 'almost': return ['tien_do', { kind: 'almost', left: e.left }, null];
    case 'half': return ['tien_do', { kind: 'half', left: e.left }, null];
    case 'combo': return ['combo', { n: e.n }, 'dance'];
    case 'comfort': return ['sai_nhieu', {}, 'heart'];
    case 'break': return ['nghi_giai_lao', { minutes: e.minutes }, 'sleep'];
    case 'freeze_used': return ['dung_freeze', {}, 'scarf'];
    case 'broken': return ['mat_streak', { n: e.longest }, 'sad'];
    default: return null;
  }
}

export function sideToast(e) {
  if (e.type === 'badge') return [`huy hiệu mới: ${e.name}`, '(ﾉ´ヮ`)ﾉ*: ･ﾟ'];
  if (e.type === 'challenge_done') return [`xong thử thách hôm nay, +${e.xp} xp`, '٩(ˊᗜˋ*)و ♡'];
  if (e.type === 'freeze_earned') return [`+1 băng giữ chuỗi (đang có ${e.freezes}/2)`, '₍ᐢ. .ᐢ₎🧊'];
  if (e.type === 'freeze_full') return ['đủ 2 băng rồi, cất không nổi nữa', '(⸝⸝ᵕᴗᵕ⸝⸝) ❄︎'];
  return null;
}

/**
 * thỏ phản ứng với các sự kiện sau một câu trả lời.
 * bubble / bunny: bong bóng và thỏ đang hiện (có thể bỏ trống). trả về sự kiện chính đã nói.
 */
export async function celebrate(events = [], { bubble = null, bunny = null } = {}) {
  if (!events.length) return null;
  const name = getState().profile.name;
  const main = MAIN.map((t) => events.find((e) => e.type === t)).find(Boolean) || null;

  const toasts = events
    .filter((e) => e !== main)
    .map(sideToast)
    .filter(Boolean);
  toasts.forEach(([text, kao], i) => setTimeout(() => showToast(text, kao), 600 + i * 2800));

  if (events.some((e) => e.type === 'level_up' || e.type === 'milestone')) bowConfetti();
  if (!main) return null;

  const [group, ctx, pose] = eventLine(main, name);
  if (bunny && pose) {
    bunny.setState(pose);
    bunny.hop();
  }
  const line = await say(group, { ...currentVoiceContext(), ...ctx, name: name || undefined }, { forceLine: true });
  if (bubble && line) bubble.say(line.text || '', line.kao);
  return main;
}
