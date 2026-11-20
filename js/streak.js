// xie · streak.js — chuỗi ngày (streak), băng giữ chuỗi (freeze) và lịch nơ (spec mục 13).
// thuần javascript, test ở tests/streak.test.js.
//
// chuỗi được TÍNH LẠI từ nhật ký từng ngày (progress.days), không cộng dồn từng lần mở web,
// nên mở web bao nhiêu lần trong ngày hay đổi múi giờ máy cũng ra cùng một kết quả.
//
// luật:
//   - ngày tính theo giờ việt nam (khoá ngày "yyyy-mm-dd" đã là giờ việt nam)
//   - ngày đạt mục tiêu (day.met_at) → chuỗi +1
//   - mỗi lần chuỗi chạm mốc 7 ngày (7, 14, 21…) nhận 1 băng, giữ tối đa 2
//   - ngày đã qua mà không đạt: còn băng thì tự dùng 1 băng (không cộng nhưng giữ chuỗi), hết băng thì chuỗi về 0
//   - hôm nay chưa xong thì chưa tính gì: ngày chưa hết

import { isValidDate, addDays } from './state-core.js';

export const FREEZE_EVERY = 7;
export const MAX_FREEZES = 2;
export const MILESTONES = [7, 30, 100];
export const COMEBACK_DAYS = 3; // đứt chuỗi dài ≥ 3 ngày rồi giữ lại được chuỗi mới 3 ngày → huy hiệu "nối lại chuỗi"

export const isMetDay = (rec) => Boolean(rec && rec.met_at);
export const isStudiedDay = (rec) => Boolean(rec && rec.turns > 0);

/**
 * tính chuỗi từ nhật ký các ngày.
 * trả về:
 *   current   chuỗi hiện tại (tính cả hôm nay nếu hôm nay đã đạt)
 *   longest   kỷ lục
 *   freezes   số băng đang giữ (0–2)
 *   todayMet  hôm nay đã đạt chưa
 *   calendar  { ngày: "met" | "frozen" | "partial" } — nơ hồng / băng tuyết / chấm nhỏ
 *   events    [{ type, date, … }] theo thứ tự thời gian:
 *             milestone (kind m7/m30/m100), freeze_earned, freeze_full, freeze_used, broken, comeback
 */
export function computeStreak(days = {}, today) {
  const res = {
    today,
    current: 0,
    longest: 0,
    freezes: 0,
    todayMet: false,
    metDays: 0,
    frozenDays: 0,
    calendar: {},
    events: [],
    comeback: false,
  };
  if (!isValidDate(today) || !days || typeof days !== 'object') return res;
  const keys = Object.keys(days).filter(isValidDate).sort();
  if (!keys.length || keys[0] > today) return res;

  let streak = 0;
  let freezes = 0;
  let broke = false;
  const push = (e) => res.events.push(e);

  for (let d = keys[0]; d <= today; d = addDays(d, 1)) {
    const rec = days[d];
    if (isMetDay(rec)) {
      streak += 1;
      res.metDays += 1;
      res.longest = Math.max(res.longest, streak);
      res.calendar[d] = 'met';
      if (d === today) res.todayMet = true;
      if (MILESTONES.includes(streak)) push({ type: 'milestone', date: d, streak, kind: `m${streak}` });
      if (streak % FREEZE_EVERY === 0) {
        if (freezes < MAX_FREEZES) {
          freezes += 1;
          push({ type: 'freeze_earned', date: d, streak, freezes });
        } else {
          push({ type: 'freeze_full', date: d, streak, freezes });
        }
      }
      if (broke && streak === COMEBACK_DAYS) {
        res.comeback = true;
        push({ type: 'comeback', date: d, streak });
      }
    } else if (d === today) {
      // ngày chưa hết: chưa dùng băng, chưa đứt chuỗi
      if (isStudiedDay(rec)) res.calendar[d] = 'partial';
    } else if (streak > 0 && freezes > 0) {
      freezes -= 1;
      res.frozenDays += 1;
      res.calendar[d] = 'frozen';
      push({ type: 'freeze_used', date: d, streak, freezes });
    } else {
      if (streak > 0) {
        push({ type: 'broken', date: d, lost: streak, longest: res.longest });
        if (streak >= COMEBACK_DAYS) broke = true;
      }
      streak = 0;
      if (isStudiedDay(rec)) res.calendar[d] = 'partial';
    }
  }

  res.current = streak;
  res.freezes = freezes;
  return res;
}

// sự kiện chuỗi xảy ra trong khoảng (from, to] — dùng để báo "lần mở web tiếp theo"
export function eventsBetween(streak, from, to) {
  return streak.events.filter((e) => (!from || e.date > from) && e.date <= to);
}

// ---------- lịch ----------
// thứ trong tuần, bắt đầu từ thứ hai (0 = thứ hai … 6 = chủ nhật)
export function weekdayIndex(date) {
  const [y, m, d] = date.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

export const WEEKDAY_LABELS = ['t2', 't3', 't4', 't5', 't6', 't7', 'cn'];

// 7 ngày của tuần chứa "today", thứ hai → chủ nhật
export function weekOf(today) {
  const monday = addDays(today, -weekdayIndex(today));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

// lưới tháng: mảng các tuần, mỗi tuần 7 ô { date, inMonth }. month: 1–12
export function monthGrid(year, month) {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const start = addDays(first, -weekdayIndex(first));
  const weeks = [];
  let d = start;
  do {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({ date: d, inMonth: Number(d.slice(5, 7)) === month });
      d = addDays(d, 1);
    }
    weeks.push(week);
  } while (Number(d.slice(5, 7)) === month);
  return weeks;
}

export function shiftMonth(year, month, delta) {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}
