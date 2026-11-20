// xie · tests/streak.test.js — chuỗi ngày, băng giữ chuỗi, lịch nơ (spec mục 13).
// phần thuần: computeStreak trên nhật ký ngày dựng tay.
// phần ráp nối (đạt lúc 23:59 / 00:01, đổi múi giờ máy, game 25, output 10…) ở tests/progress.test.js.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak, weekOf, monthGrid, shiftMonth, weekdayIndex, MAX_FREEZES } from '../js/streak.js';
import { addDays } from '../js/state-core.js';

const MET = { met_at: 1, turns: 60 };
const PARTIAL = { met_at: null, turns: 20 };

// dựng nhật ký từ chuỗi ký tự: "x" = đạt, "p" = có học chưa đủ, "." = vắng. ngày đầu = start
function log(pattern, start = '2026-11-01') {
  const days = {};
  [...pattern].forEach((c, i) => {
    const d = addDays(start, i);
    if (c === 'x') days[d] = { ...MET };
    if (c === 'p') days[d] = { ...PARTIAL };
  });
  return days;
}

const dayAt = (i, start = '2026-11-01') => addDays(start, i);

test('học liên tục: chuỗi tăng mỗi ngày, kỷ lục theo cùng', () => {
  const days = log('xxxxx');
  const s = computeStreak(days, dayAt(4));
  assert.equal(s.current, 5);
  assert.equal(s.longest, 5);
  assert.equal(s.todayMet, true);
  assert.equal(s.metDays, 5);
  assert.deepEqual(Object.values(s.calendar), ['met', 'met', 'met', 'met', 'met']);
});

test('hôm nay chưa xong: chuỗi vẫn giữ từ hôm qua, chưa dùng băng, chưa đứt', () => {
  const days = log('xxx');
  const s = computeStreak(days, dayAt(3));
  assert.equal(s.current, 3);
  assert.equal(s.todayMet, false);
  assert.equal(s.events.length, 0);
  // hôm nay có học nhưng chưa đủ: lịch hiện chấm nhỏ, chuỗi vẫn 3
  const s2 = computeStreak({ ...days, [dayAt(3)]: { ...PARTIAL } }, dayAt(3));
  assert.equal(s2.current, 3);
  assert.equal(s2.calendar[dayAt(3)], 'partial');
});

test('có học nhưng chưa đủ mục tiêu: ngày đó không cộng, không có băng thì đứt chuỗi', () => {
  const days = log('xxp');
  const s = computeStreak(days, dayAt(3));
  assert.equal(s.current, 0);
  assert.equal(s.longest, 2);
  assert.equal(s.calendar[dayAt(2)], 'partial');
  assert.deepEqual(s.events.map((e) => e.type), ['broken']);
  assert.equal(s.events[0].lost, 2);
});

test('bỏ 1 ngày KHÔNG có băng: chuỗi về 0, ngày sau bắt đầu lại từ 1', () => {
  const days = log('xxx.x');
  const s = computeStreak(days, dayAt(4));
  assert.equal(s.current, 1);
  assert.equal(s.longest, 3);
  assert.equal(s.freezes, 0);
  assert.equal(s.events.find((e) => e.type === 'broken').date, dayAt(3));
});

test('nhận băng ở mốc 7 rồi bỏ 1 ngày CÓ băng: băng tự dùng, chuỗi giữ nguyên, không cộng', () => {
  const days = log('xxxxxxx.x');
  const s = computeStreak(days, dayAt(8));
  assert.equal(s.current, 8); // 7 + 0 (ngày được cứu) + 1
  assert.equal(s.freezes, 0);
  assert.equal(s.calendar[dayAt(7)], 'frozen');
  assert.equal(s.frozenDays, 1);
  assert.deepEqual(s.events.map((e) => e.type), ['milestone', 'freeze_earned', 'freeze_used']);
});

test('ngày có học chưa đủ mà còn băng: băng cứu, lịch hiện băng tuyết', () => {
  const s = computeStreak(log('xxxxxxxpx'), dayAt(8));
  assert.equal(s.current, 8);
  assert.equal(s.calendar[dayAt(7)], 'frozen');
});

test('nhận băng ở mốc 7 và 14, tối đa giữ 2', () => {
  const s14 = computeStreak(log('x'.repeat(14)), dayAt(13));
  assert.equal(s14.freezes, 2);
  assert.deepEqual(
    s14.events.filter((e) => e.type === 'freeze_earned').map((e) => e.streak),
    [7, 14],
  );
  const s7 = computeStreak(log('x'.repeat(7)), dayAt(6));
  assert.equal(s7.freezes, 1);
  const s6 = computeStreak(log('x'.repeat(6)), dayAt(5));
  assert.equal(s6.freezes, 0); // chưa đủ 7 ngày thì chưa có băng
});

test('đủ 2 băng thì mốc 21 không nhận thêm', () => {
  const s = computeStreak(log('x'.repeat(21)), dayAt(20));
  assert.equal(s.freezes, MAX_FREEZES);
  assert.equal(s.events.filter((e) => e.type === 'freeze_earned').length, 2);
  assert.equal(s.events.filter((e) => e.type === 'freeze_full').length, 1);
  // dùng 1 băng thì mốc kế tiếp lại nhận được
  const s2 = computeStreak(log(`${'x'.repeat(21)}.${'x'.repeat(7)}`), dayAt(28));
  assert.equal(s2.current, 28);
  assert.equal(s2.freezes, 2);
});

test('bỏ 2 ngày với 2 băng: cả hai ngày được cứu, chuỗi giữ nguyên', () => {
  const s = computeStreak(log(`${'x'.repeat(14)}..x`), dayAt(16));
  assert.equal(s.current, 15);
  assert.equal(s.freezes, 0);
  assert.equal(s.calendar[dayAt(14)], 'frozen');
  assert.equal(s.calendar[dayAt(15)], 'frozen');
});

test('bỏ 2 ngày với 1 băng: ngày đầu được cứu, ngày sau đứt chuỗi', () => {
  const s = computeStreak(log(`${'x'.repeat(7)}..x`), dayAt(9));
  assert.equal(s.current, 1);
  assert.equal(s.longest, 7);
  assert.equal(s.calendar[dayAt(7)], 'frozen');
  assert.equal(s.calendar[dayAt(8)], undefined);
  assert.deepEqual(s.events.slice(-2).map((e) => e.type), ['freeze_used', 'broken']);
});

test('bỏ 3 ngày với 2 băng: cứu 2 ngày, ngày thứ 3 đứt', () => {
  const s = computeStreak(log(`${'x'.repeat(14)}...x`), dayAt(17));
  assert.equal(s.current, 1);
  assert.equal(s.longest, 14);
  assert.equal(s.frozenDays, 2);
  assert.equal(s.events.at(-1).type, 'broken');
  assert.equal(s.events.at(-1).date, dayAt(16));
});

test('bỏ 3 ngày với 1 băng: cứu 1 ngày rồi đứt', () => {
  const s = computeStreak(log(`${'x'.repeat(7)}...`), dayAt(10));
  assert.equal(s.current, 0);
  assert.equal(s.frozenDays, 1);
  assert.equal(s.events.filter((e) => e.type === 'broken').length, 1);
});

test('đang vắng: các ngày đã qua tự dùng băng, hôm nay chưa tính', () => {
  // đạt 14 ngày rồi vắng hôm qua; hôm nay mở web chưa học gì
  const s = computeStreak(log('x'.repeat(14)), dayAt(15));
  assert.equal(s.current, 14);
  assert.equal(s.freezes, 1);
  assert.equal(s.calendar[dayAt(14)], 'frozen');
});

test('mốc 7 / 30 / 100 có sự kiện milestone đúng loại', () => {
  const s = computeStreak(log('x'.repeat(100)), dayAt(99));
  assert.deepEqual(s.events.filter((e) => e.type === 'milestone').map((e) => e.kind), ['m7', 'm30', 'm100']);
});

test('đứt chuỗi (dài từ 3 ngày) rồi quay lại giữ 3 ngày: có "nối lại chuỗi"', () => {
  const s = computeStreak(log('xxx.xxx'), dayAt(6));
  assert.equal(s.comeback, true);
  assert.equal(s.events.at(-1).type, 'comeback');
  assert.equal(computeStreak(log('xxxx'), dayAt(3)).comeback, false);
  assert.equal(computeStreak(log('xx.xxx'), dayAt(5)).comeback, false); // chuỗi mất mới 2 ngày thì chưa tính
});

test('tính lại nhiều lần (mở web nhiều lần trong ngày) ra cùng kết quả', () => {
  const days = log(`${'x'.repeat(8)}.xp`);
  const a = computeStreak(days, dayAt(10));
  for (let i = 0; i < 5; i++) assert.deepEqual(computeStreak(days, dayAt(10)), a);
});

test('dữ liệu rỗng / hỏng / ngày ở tương lai không làm sập', () => {
  assert.equal(computeStreak({}, '2026-11-20').current, 0);
  assert.equal(computeStreak(null, '2026-11-20').current, 0);
  assert.equal(computeStreak(log('xx'), 'sai').current, 0);
  assert.equal(computeStreak({ 'khong-phai-ngay': MET }, '2026-11-20').current, 0);
  // máy chỉnh đồng hồ lùi: ngày "tương lai" không được tính
  const s = computeStreak(log('xxx', '2026-11-25'), '2026-11-20');
  assert.equal(s.current, 0);
});

test('lịch: tuần bắt đầu thứ hai, lưới tháng đủ ô', () => {
  assert.equal(weekdayIndex('2026-11-16'), 0); // thứ hai
  assert.equal(weekdayIndex('2026-11-22'), 6); // chủ nhật
  assert.deepEqual(weekOf('2026-11-20'), ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22']);
  const nov = monthGrid(2026, 11);
  assert.equal(nov[0][0].date, '2026-10-26');
  assert.equal(nov[0][6].date, '2026-11-01');
  assert.equal(nov.at(-1).at(-1).date, '2026-12-06');
  assert.equal(nov.flat().filter((c) => c.inMonth).length, 30);
  const feb = monthGrid(2027, 2); // tháng 2/2027 bắt đầu thứ hai, kết thúc chủ nhật
  assert.equal(feb.length, 4);
  assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  assert.deepEqual(shiftMonth(2026, 1, -1), { year: 2025, month: 12 });
});
