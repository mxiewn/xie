// xie · tests/progress.test.js — ráp nối: ghi câu trả lời → lượt, chuỗi ngày, băng, xp, cấp, huy hiệu, thông báo.
// đủ các tình huống spec mục 13: học liên tục; đạt lúc 23:59 và 00:01; có học nhưng chưa đủ 50;
// bỏ ngày có / không băng; nhận băng ở mốc 7 / 14; đủ 2 băng; đổi múi giờ thiết bị; mở web nhiều lần
// trong ngày; giới hạn 25 lượt game; điều kiện 10 lượt output.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProgress, recordAnswer, summarize, takeNotices, syncToday, migrateProgress, normalizeProgress,
  buildStats, voiceContext,
} from '../js/progress-core.js';
import { addDays, parseImport, buildExport, todayIn } from '../js/state-core.js';
import { levelFor, levelProgress, LEVELS } from '../js/levels.js';
import { BADGES, badgeProgress } from '../js/badges.js';

// thời điểm theo giờ việt nam
const VN = (date, time = '09:00:00') => Date.parse(`${date}T${time}+07:00`);

// người học ảo: ghi câu trả lời cách nhau 4 giây
function learner(progress = defaultProgress(), goal = 50) {
  let p = progress;
  let clock = 0;
  const log = [];
  const api = {
    get p() { return p; },
    at(date, time) { clock = VN(date, time); return api; },
    answer(event) {
      clock += 4000;
      const r = recordAnswer(p, { ms: 3000, at: clock, ...event }, { goal });
      p = r.progress;
      log.push(r.result);
      return r.result;
    },
    // làm đủ mục tiêu: basic câu nhận biết + outputs câu tự viết (3 lượt mỗi câu)
    day(date, { basic = 40, outputs = 4, time = '09:00:00', kind = 'recognition' } = {}) {
      api.at(date, time);
      for (let i = 0; i < basic; i++) api.answer({ kind, item: `${date}-${kind}-${i}`, correct: true });
      for (let i = 0; i < outputs; i++) api.answer({ kind: 'sentence', item: `${date}-s-${i}`, words: 12, correct: null, ms: 40_000 });
      return api;
    },
    log,
  };
  return api;
}

const D0 = '2026-11-01';
const day = (i) => addDays(D0, i);

test('một ngày đủ mục tiêu: có nửa chặng, sắp xong, đạt mục tiêu, chuỗi 1', () => {
  const l = learner().day(D0);
  const types = l.log.flatMap((r) => r.events.map((e) => e.type));
  for (const t of ['half', 'almost', 'goal_met', 'streak']) assert.ok(types.includes(t), `thiếu sự kiện ${t}`);
  assert.equal(types.filter((t) => t === 'goal_met').length, 1);
  const s = summarize(l.p, { today: D0 });
  assert.equal(s.status.met, true);
  assert.equal(s.streak.current, 1);
  assert.ok(l.p.days[D0].met_at);
  const almost = l.log.flatMap((r) => r.events).find((e) => e.type === 'almost');
  assert.ok(almost.left > 0 && almost.left <= 5);
});

test('học liên tục 5 ngày: chuỗi 5', () => {
  const l = learner();
  for (let i = 0; i < 5; i++) l.day(day(i));
  assert.equal(summarize(l.p, { today: day(4) }).streak.current, 5);
});

test('đạt lúc 23:59 và 00:01: hai ngày khác nhau, chuỗi 2', () => {
  const l = learner();
  l.day(D0, { time: '23:50:00', basic: 37 }); // 37 + 12 output = 49 lượt, chưa đủ
  assert.equal(summarize(l.p, { today: D0 }).status.met, false);
  l.at(D0, '23:58:59');
  l.answer({ kind: 'recall', item: 'cuoi-ngay', correct: true }); // 23:59:03 → lượt 50
  assert.equal(summarize(l.p, { today: D0 }).status.met, true);
  // 00:01 hôm sau là ngày mới
  l.day(day(1), { time: '00:01:00' });
  assert.ok(l.p.days[day(1)].met_at);
  assert.equal(summarize(l.p, { today: day(1) }).streak.current, 2);
});

test('có học nhưng chưa đủ 50: lịch hiện chấm nhỏ, hôm sau đứt chuỗi (chưa có băng)', () => {
  const l = learner().day(D0).day(day(1), { basic: 20 });
  const s1 = summarize(l.p, { today: day(1) });
  assert.equal(s1.status.met, false);
  assert.equal(s1.streak.current, 1); // hôm nay chưa hết
  assert.equal(s1.streak.calendar[day(1)], 'partial');
  const s2 = summarize(l.p, { today: day(2) });
  assert.equal(s2.streak.current, 0);
});

test('nhận băng ở mốc 7, bỏ 1 ngày: băng tự dùng và lần mở web sau được báo (một lần)', () => {
  const l = learner();
  for (let i = 0; i < 7; i++) l.day(day(i));
  const ev7 = l.log.flatMap((r) => r.events).map((e) => e.type);
  assert.ok(ev7.includes('milestone') && ev7.includes('freeze_earned'));
  assert.equal(summarize(l.p, { today: day(6) }).streak.freezes, 1);

  // vắng day(7), mở web day(8)
  let r = takeNotices(l.p, day(8));
  assert.deepEqual(r.notices.map((n) => n.type), ['freeze_used']);
  assert.equal(r.notices[0].date, day(7));
  // mở thêm lần nữa trong ngày: không báo lại
  const again = takeNotices(r.progress, day(8));
  assert.equal(again.notices.length, 0);
  const s = summarize(r.progress, { today: day(8) });
  assert.equal(s.streak.current, 7);
  assert.equal(s.streak.freezes, 0);
  assert.equal(s.streak.calendar[day(7)], 'frozen');
});

test('bỏ 1 ngày không có băng: lần mở web sau báo đứt chuỗi, kèm kỷ lục', () => {
  const l = learner().day(D0).day(day(1)).day(day(2));
  const r = takeNotices(l.p, day(4));
  assert.equal(r.notices.length, 1);
  assert.equal(r.notices[0].type, 'broken');
  assert.equal(r.notices[0].lost, 3);
  assert.equal(r.notices[0].longest, 3);
});

test('bỏ 2 ngày với 2 băng (mốc 7 + 14): giữ chuỗi; bỏ 3 ngày: đứt', () => {
  const l = learner();
  for (let i = 0; i < 14; i++) l.day(day(i));
  assert.equal(summarize(l.p, { today: day(13) }).streak.freezes, 2);
  const after2 = takeNotices(l.p, day(16));
  assert.deepEqual(after2.notices.map((n) => n.type), ['freeze_used', 'freeze_used']);
  assert.equal(summarize(l.p, { today: day(16) }).streak.current, 14);
  const after3 = takeNotices(l.p, day(17));
  assert.deepEqual(after3.notices.map((n) => n.type), ['freeze_used', 'freeze_used', 'broken']);
});

test('đủ 2 băng thì mốc 21 không nhận thêm', () => {
  const l = learner();
  for (let i = 0; i < 21; i++) l.day(day(i));
  const s = summarize(l.p, { today: day(20) });
  assert.equal(s.streak.freezes, 2);
  assert.ok(l.log.flatMap((r) => r.events).some((e) => e.type === 'freeze_full'));
});

test('đổi múi giờ thiết bị: ngày vẫn tính theo giờ việt nam', () => {
  const original = process.env.TZ;
  try {
    const results = [];
    for (const tz of ['Asia/Ho_Chi_Minh', 'America/Los_Angeles', 'Europe/London', 'Pacific/Kiritimati']) {
      process.env.TZ = tz;
      const l = learner();
      l.day(D0, { time: '23:30:00' }); // 23:30 giờ việt nam
      l.day(day(1), { time: '06:00:00' });
      results.push(Object.keys(l.p.days).sort().join(','));
      assert.equal(todayIn(new Date(VN(D0, '23:59:00'))), D0, tz);
      assert.equal(todayIn(new Date(VN(day(1), '00:01:00'))), day(1), tz);
    }
    assert.equal(new Set(results).size, 1);
    assert.equal(results[0], `${D0},${day(1)}`);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test('mở web nhiều lần trong ngày: tóm tắt và thông báo không đổi', () => {
  const l = learner().day(D0).day(day(1));
  const a = summarize(l.p, { today: day(1) });
  let p = l.p;
  for (let i = 0; i < 4; i++) {
    const r = takeNotices(p, day(1));
    p = r.progress;
    assert.equal(r.notices.length, 0);
    assert.deepEqual(summarize(p, { today: day(1) }).streak, a.streak);
  }
});

test('giới hạn 25 lượt game: 60 câu game + 12 output chưa đạt 50, xp vẫn đủ', () => {
  const l = learner();
  l.day(D0, { basic: 60, kind: 'game', outputs: 4 });
  const s = summarize(l.p, { today: D0 });
  assert.equal(s.status.counted, 25 + 12);
  assert.equal(s.status.met, false);
  assert.equal(s.day.game, 60);
  const capped = l.log.filter((r) => r.capped).length;
  assert.equal(capped, 35);
  assert.equal(l.log.filter((r) => r.counted).every((r) => r.xp > 0), true);
  // thêm 13 câu nhận biết thì đủ
  for (let i = 0; i < 13; i++) l.answer({ kind: 'recognition', item: `bu-${i}`, correct: true });
  assert.equal(summarize(l.p, { today: D0 }).status.met, true);
});

test('điều kiện 10 lượt output: 60 câu không output chưa đạt, thêm 1 topic sprint thì đạt', () => {
  const l = learner().day(D0, { basic: 60, outputs: 0 });
  assert.equal(summarize(l.p, { today: D0 }).status.met, false);
  assert.equal(summarize(l.p, { today: D0 }).status.outputLeft, 10);
  l.answer({ kind: 'topic_sprint', item: 'ts-1', words: 60, ms: 300_000 });
  assert.equal(summarize(l.p, { today: D0 }).status.met, true);
});

test('chống cày ngay trong luồng ghi: trả lời lại trong 10 phút, nhanh liên tục, output ngắn', () => {
  const l = learner().at(D0, '10:00:00');
  assert.equal(l.answer({ kind: 'recall', item: 'q', correct: true }).counted, true);
  const again = l.answer({ kind: 'recall', item: 'q', correct: true });
  assert.equal(again.counted, false);
  assert.equal(again.reason, 'repeat');
  assert.equal(l.answer({ kind: 'recall', item: 'a', ms: 300, correct: true }).counted, true);
  assert.equal(l.answer({ kind: 'recall', item: 'b', ms: 300, correct: true }).reason, 'too_fast');
  assert.equal(l.answer({ kind: 'sentence', item: 'c', words: 3 }).reason, 'too_short');
  const d = l.p.days[D0];
  assert.equal(d.turns, 2);
  assert.equal(d.skipped, 3);
  assert.equal(d.answers, 5);
  // 10 phút sau thì câu cũ tính lại
  l.at(D0, '10:11:00');
  assert.equal(l.answer({ kind: 'recall', item: 'q', correct: true }).counted, true);
});

test('đổi mục tiêu giữa ngày: hạ xuống mức đã đủ thì ghi đạt; đã đạt thì nâng lên vẫn giữ', () => {
  const l = learner(defaultProgress(), 80).day(D0); // 52 lượt, mục tiêu 80
  assert.equal(summarize(l.p, { today: D0, goal: 80 }).status.met, false);
  const r = syncToday(l.p, { goal: 50, today: D0, now: VN(D0, '12:00:00') });
  assert.equal(r.changed, true);
  assert.ok(r.progress.days[D0].met_at);
  assert.equal(summarize(r.progress, { today: D0, goal: 200 }).status.met, true);
  assert.equal(summarize(r.progress, { today: day(1) }).streak.current, 1);
});

test('combo 5 thì khen, sai 3 câu liền thì an ủi', () => {
  const l = learner().at(D0, '08:00:00');
  const types = () => l.log.at(-1).events.map((e) => e.type);
  for (let i = 0; i < 5; i++) l.answer({ kind: 'recall', item: `c${i}`, correct: true });
  assert.ok(types().includes('combo'));
  for (let i = 0; i < 3; i++) l.answer({ kind: 'recall', item: `w${i}`, correct: false });
  assert.ok(types().includes('comfort'));
  l.answer({ kind: 'recall', item: 'w3', correct: false });
  assert.ok(!types().includes('comfort')); // chỉ an ủi đúng lúc chạm 3 câu
});

test('nghỉ giải lao: học liền một mạch quá 25 phút thì nhắc một lần; nghỉ quá 5 phút là phiên mới', () => {
  let p = defaultProgress();
  let breaks = 0;
  for (let i = 0; i <= 60; i++) {
    const at = VN(D0, '20:00:00') + i * 30_000; // mỗi 30 giây, 30 phút
    const r = recordAnswer(p, { kind: 'recognition', item: `b${i}`, correct: true, ms: 20_000, at });
    p = r.progress;
    const e = r.result.events.find((x) => x.type === 'break');
    if (e) { breaks += 1; assert.ok(e.minutes >= 25); }
  }
  assert.equal(breaks, 1);
  assert.ok(summarize(p, { today: D0 }).status.minutes >= 29);
  // nghỉ 6 phút rồi học tiếp: phiên mới, chưa nhắc lại
  const r = recordAnswer(p, { kind: 'recognition', item: 'sau-nghi', correct: true, ms: 5000, at: VN(D0, '20:36:00') });
  assert.equal(r.result.events.some((e) => e.type === 'break'), false);
  assert.equal(r.progress.run.break_sent, false);
});

test('xp lên cấp có sự kiện level_up; hai bậc cuối cần thêm từ output + kỷ lục chuỗi', () => {
  const l = learner().day(D0);
  const ups = l.log.flatMap((r) => r.events).filter((e) => e.type === 'level_up');
  assert.equal(ups.length, 1);
  assert.equal(ups[0].level, 2);
  assert.equal(ups[0].name, 'thỏ nơ hồng');
  assert.equal(l.p.level, 2);

  assert.equal(levelFor({ xp: 0 }), 1);
  assert.equal(levelFor({ xp: 13_999 }), 7);
  assert.equal(levelFor({ xp: 50_000, outputWords: 299 }), 7);
  assert.equal(levelFor({ xp: 50_000, outputWords: 300 }), 8);
  assert.equal(levelFor({ xp: 50_000, outputWords: 600, longestStreak: 59 }), 8);
  assert.equal(levelFor({ xp: 50_000, outputWords: 600, longestStreak: 60 }), 9);
  const lp = levelProgress({ xp: 14_500, outputWords: 120 });
  assert.equal(lp.level, 7);
  assert.deepEqual(lp.missing.map((m) => m.id), ['output_words']);
  for (const l2 of LEVELS) assert.equal(l2.name, l2.name.toLowerCase());
});

test('huy hiệu: ngày đầu tiên, tuần lễ nơ hồng, được băng cứu', () => {
  const l = learner().day(D0);
  assert.ok(l.p.badges['ngay-dau-tien']);
  for (let i = 1; i < 7; i++) l.day(day(i));
  assert.ok(l.p.badges['chuoi-7']);
  l.day(day(8)); // vắng day(7), băng cứu
  assert.ok(l.p.badges['bang-cuu']);
  const badgeEvents = l.log.flatMap((r) => r.events).filter((e) => e.type === 'badge').map((e) => e.id);
  assert.equal(new Set(badgeEvents).size, badgeEvents.length); // mỗi huy hiệu báo một lần
});

test('danh sách huy hiệu: ít nhất 20, id không trùng, tên viết thường, tiến độ chặn ở mốc', () => {
  assert.ok(BADGES.length >= 20);
  assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length);
  for (const b of BADGES) {
    assert.equal(b.name, b.name.toLowerCase(), b.id);
    assert.equal(b.desc, b.desc.toLowerCase(), b.id);
  }
  const stats = buildStats(learner().day(D0).p, D0);
  const first = badgeProgress(BADGES.find((b) => b.id === 'ngay-dau-tien'), stats);
  assert.deepEqual(first, { value: 1, target: 1, ratio: 1, done: true });
  const week = badgeProgress(BADGES.find((b) => b.id === 'chuoi-7'), stats);
  assert.equal(week.value, 1);
  assert.equal(week.done, false);
});

test('ngữ cảnh thoại có streak, left, goal, phút học, độ chính xác', () => {
  const l = learner().at(D0, '09:00:00');
  for (let i = 0; i < 4; i++) l.answer({ kind: 'recall', item: `v${i}`, correct: i < 3 });
  const ctx = voiceContext(summarize(l.p, { today: D0 }));
  assert.equal(ctx.left, 46);
  assert.equal(ctx.goal, 50);
  assert.equal(ctx.accuracy, 75);
  assert.equal(ctx.streak, 0);
});

test('dữ liệu tiến độ hỏng / bản lạ được chuẩn hoá, xuất rồi nhập lại giữ nguyên', () => {
  for (const bad of [null, 1, 'x', [], {}]) assert.deepEqual(migrateProgress(bad), defaultProgress());
  const p = normalizeProgress({ xp: -5, level: 99, days: { sai: {}, '2026-11-01': { turns: 3 } }, badges: { 'khong-co': '2026-11-01', 'chuoi-7': 'sai' } });
  assert.equal(p.xp, 0);
  assert.equal(p.level, 1);
  assert.deepEqual(Object.keys(p.days), ['2026-11-01']);
  assert.deepEqual(p.badges, {});

  const l = learner().day(D0);
  const file = JSON.stringify(buildExport({ 'xie:progress': JSON.stringify(l.p) }));
  const r = parseImport(file, { 'xie:progress': [migrateProgress, 'phần tiến độ trong file bị hỏng'] });
  assert.equal(r.ok, true);
  assert.deepEqual(JSON.parse(r.entries['xie:progress']), l.p);
  const broken = parseImport(JSON.stringify(buildExport({ 'xie:progress': '{hỏng' })), { 'xie:progress': [migrateProgress, 'phần tiến độ trong file bị hỏng'] });
  assert.equal(broken.ok, false);
  assert.equal(broken.error, 'phần tiến độ trong file bị hỏng');
});

test('ghi câu trả lời không sửa bản cũ (dữ liệu bất biến)', () => {
  const p0 = defaultProgress();
  const snapshot = JSON.stringify(p0);
  recordAnswer(p0, { kind: 'recall', item: 'z', correct: true, at: VN(D0) });
  assert.equal(JSON.stringify(p0), snapshot);
});

test('số liệu giai đoạn sau ghi vào (kho output) có thể mở cấp và huy hiệu', async () => {
  const { updateCounters } = await import('../js/progress-core.js');
  const p = { ...defaultProgress(), xp: 15_000, level: 7 };
  const r = updateCounters(p, { output_words: 320, khong_co: 5, my_words: -1 }, D0);
  assert.equal(r.progress.counters.output_words, 320);
  assert.equal(r.progress.counters.my_words, 0);
  assert.equal(r.progress.level, 8);
  const types = r.events.map((e) => e.type);
  assert.ok(types.includes('level_up'));
  assert.ok(r.events.some((e) => e.type === 'badge' && e.id === 'output-300'));
});
