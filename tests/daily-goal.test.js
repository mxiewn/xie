// xie · tests/daily-goal.test.js — mục tiêu lượt mỗi ngày (spec mục 6) + thử thách mỗi ngày.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITIES, GAME_CAP, OUTPUT_MIN, REPEAT_WINDOW_MS, CHALLENGES, CHALLENGE_SKILLS,
  emptyDay, normalizeDay, goalStatus, judgeAnswer, answerXp, addToDay, dailyChallenge, challengeProgress, reasonText,
} from '../js/daily-goal.js';
import { addDays } from '../js/state-core.js';

function dayWith(events, goal = 50) {
  let d = emptyDay(goal);
  for (const e of events) d = addToDay(d, e).day;
  return d;
}

const many = (n, e) => Array.from({ length: n }, () => ({ ...e }));

test('số lượt mỗi loại bài đúng spec', () => {
  const turns = Object.fromEntries(Object.entries(ACTIVITIES).map(([k, a]) => [k, a.turns]));
  assert.deepEqual(turns, {
    recognition: 1, recall: 1, guided: 1, grammar: 1, trap: 1, game: 1,
    sentence: 3, paraphrase: 5, speaking_p1: 3, speaking_p3: 5, topic_sprint: 10, speaking_p2: 10,
  });
  for (const k of ['sentence', 'paraphrase', 'speaking_p1', 'speaking_p2', 'speaking_p3', 'topic_sprint']) {
    assert.equal(ACTIVITIES[k].output, true, k);
  }
});

test('xp: output > dùng có hướng dẫn > nhận biết; sai vẫn có 1 xp', () => {
  const xp = (kind, correct = true) => answerXp({ kind, correct });
  assert.ok(xp('sentence', null) > xp('guided'));
  assert.ok(xp('guided') > xp('recall'));
  assert.ok(xp('recall') > xp('recognition'));
  assert.equal(xp('recognition', false), 1);
  assert.equal(xp('khong-co'), 0);
});

test('đủ 50 lượt nhưng thiếu output thì chưa đạt; đủ 10 lượt output thì đạt', () => {
  const noOutput = dayWith(many(60, { kind: 'recognition', correct: true }));
  let s = goalStatus(noOutput);
  assert.equal(s.counted, 60);
  assert.equal(s.left, 0);
  assert.equal(s.outputLeft, OUTPUT_MIN);
  assert.equal(s.met, false);

  const withOutput = dayWith([...many(40, { kind: 'recognition', correct: true }), ...many(4, { kind: 'sentence' })]);
  s = goalStatus(withOutput);
  assert.equal(s.counted, 52);
  assert.equal(s.output, 12);
  assert.equal(s.met, true);
});

test('10 lượt output phải nằm TRONG mục tiêu: 41 + 9 output = 50 vẫn chưa đạt', () => {
  const d = dayWith([...many(41, { kind: 'recall', correct: true }), ...many(3, { kind: 'sentence' })]);
  const s = goalStatus(d);
  assert.equal(s.counted, 50);
  assert.equal(s.output, 9);
  assert.equal(s.met, false);
  assert.equal(goalStatus(addToDay(d, { kind: 'speaking_p1' }).day).met, true);
});

test('lượt game tính tối đa 25 cho mục tiêu, xp vẫn đủ', () => {
  const d = dayWith([...many(60, { kind: 'game', correct: true }), ...many(4, { kind: 'sentence' })]);
  const s = goalStatus(d);
  assert.equal(s.game, 60);
  assert.equal(s.gameCounted, GAME_CAP);
  assert.equal(s.counted, 25 + 12);
  assert.equal(s.met, false);
  assert.equal(d.xp, 60 * ACTIVITIES.game.xp + 4 * ACTIVITIES.sentence.xp);
  // câu game thứ 26 không cộng lượt vào mục tiêu
  assert.equal(addToDay(dayWith(many(25, { kind: 'game', correct: true })), { kind: 'game', correct: true }).goalTurns, 0);
});

test('mục tiêu 80 / 120 / 200: đếm theo mục tiêu đang chọn', () => {
  const d = dayWith([...many(70, { kind: 'grammar', correct: true }), ...many(1, { kind: 'topic_sprint' })]);
  assert.equal(goalStatus(d, 50).met, true);
  assert.equal(goalStatus(d, 80).met, true);
  assert.equal(goalStatus(d, 120).met, false);
  assert.equal(goalStatus(d, 120).left, 40);
  assert.equal(goalStatus(d, 200).left, 120);
});

test('đã đạt thì giữ đạt, kể cả khi sau đó đổi mục tiêu cao hơn', () => {
  const d = { ...dayWith(many(5, { kind: 'recall', correct: true })), met_at: 123 };
  assert.equal(goalStatus(d, 200).met, true);
});

test('chống cày: trả lời lại đúng câu đó trong 10 phút thì không tính', () => {
  const t0 = 1_000_000;
  const recent = { 'q-1': t0 };
  assert.equal(judgeAnswer({ kind: 'recall', item: 'q-1', ms: 3000 }, {}, recent, t0 + 60_000).reason, 'repeat');
  assert.equal(judgeAnswer({ kind: 'recall', item: 'q-1', ms: 3000 }, {}, recent, t0 + REPEAT_WINDOW_MS - 1).reason, 'repeat');
  assert.equal(judgeAnswer({ kind: 'recall', item: 'q-1', ms: 3000 }, {}, recent, t0 + REPEAT_WINDOW_MS).ok, true);
  assert.equal(judgeAnswer({ kind: 'recall', item: 'q-2', ms: 3000 }, {}, recent, t0 + 60_000).ok, true);
});

test('chống cày: nhanh hơn 1 giây LIÊN TỤC thì không tính (1 câu nhanh lẻ vẫn tính)', () => {
  let run = { fast: 0 };
  const step = (ms) => {
    const v = judgeAnswer({ kind: 'recognition', ms }, run, {}, 0);
    run = { fast: v.fast };
    return v;
  };
  assert.equal(step(600).ok, true); // biết ngay thì vẫn tính
  assert.equal(step(500).reason, 'too_fast');
  assert.equal(step(400).reason, 'too_fast');
  assert.equal(step(2500).ok, true); // chậm lại là tính tiếp
  assert.equal(step(700).ok, true);
  // không có ms thì đo từ câu trước
  assert.equal(judgeAnswer({ kind: 'recognition' }, { fast: 1, last_at: 10_000 }, {}, 10_400).reason, 'too_fast');
  assert.equal(judgeAnswer({ kind: 'recognition' }, { fast: 1, last_at: 10_000 }, {}, 14_000).ok, true);
});

test('chống cày: bài output dưới 5 từ thì không tính; bài nói không có chữ thì vẫn tính', () => {
  assert.equal(judgeAnswer({ kind: 'sentence', words: 4, ms: 30_000 }).reason, 'too_short');
  assert.equal(judgeAnswer({ kind: 'sentence', words: 5, ms: 30_000 }).ok, true);
  assert.equal(judgeAnswer({ kind: 'speaking_p2', ms: 120_000 }).ok, true);
  assert.equal(judgeAnswer({ kind: 'recall', words: 1, ms: 3000 }).ok, true); // luật 5 từ chỉ cho output
  assert.equal(judgeAnswer({ kind: 'bay-lung-tung' }).reason, 'unknown');
  assert.match(reasonText('repeat'), /10 phút/);
});

test('nhãn câu hỏi (vd. giới từ) đếm đúng / sai riêng; khuya / sáng sớm đếm riêng', () => {
  let d = emptyDay();
  d = addToDay(d, { kind: 'guided', correct: true, tags: ['prep'] }, { hour: 23 }).day;
  d = addToDay(d, { kind: 'guided', correct: false, tags: ['prep'] }, { hour: 2 }).day;
  d = addToDay(d, { kind: 'guided', correct: true, tags: ['prep', 'Sai Nhan'] }, { hour: 5 }).day;
  assert.deepEqual(d.tags, { prep: { r: 2, w: 1 } });
  assert.equal(d.night, 2);
  assert.equal(d.early, 1);
  assert.deepEqual(d.kinds.guided, { n: 3, ok: 2 });
});

test('dữ liệu ngày hỏng được chuẩn hoá', () => {
  const d = normalizeDay({ turns: -3, output: 'x', kinds: { recall: { n: 2, ok: 9.5 }, la: { n: 1 } }, goal: 10, met_at: 'abc', flags: { half: 1, almost: true } });
  assert.equal(d.turns, 0);
  assert.equal(d.output, 0);
  assert.deepEqual(d.kinds, { recall: { n: 2, ok: 0 } });
  assert.equal(d.goal, 50);
  assert.equal(d.met_at, null);
  assert.deepEqual(d.flags, { almost: true });
});

test('thử thách mỗi ngày: cố định theo ngày, ưu tiên kỹ năng yếu (2/3 số ngày), xoay đủ các bài', () => {
  const start = '2026-11-02';
  assert.deepEqual(dailyChallenge('2026-11-20', 'speaking'), dailyChallenge('2026-11-20', 'speaking'));
  for (const weak of CHALLENGE_SKILLS) {
    const picked = Array.from({ length: 90 }, (_, i) => dailyChallenge(addDays(start, i), weak));
    const weakDays = picked.filter((c) => c.skill === weak).length;
    assert.equal(weakDays, 60, `${weak}: ${weakDays}/90 ngày`);
    // mọi thử thách của kỹ năng yếu đều được xoay tới
    const ids = new Set(picked.map((c) => c.id));
    for (const c of CHALLENGES.filter((x) => x.skill === weak)) assert.ok(ids.has(c.id), c.id);
    // các kỹ năng khác vẫn có lượt
    for (const other of CHALLENGE_SKILLS) assert.ok(picked.some((c) => c.skill === other), other);
  }
  const plain = Array.from({ length: 8 }, (_, i) => dailyChallenge(addDays(start, i), null).skill);
  assert.equal(new Set(plain).size, 4);
});

test('tiến độ thử thách đọc từ ngày học', () => {
  const grammar = CHALLENGES.find((c) => c.id === 'ngu-phap-dung-10');
  const d = dayWith([...many(8, { kind: 'grammar', correct: true }), ...many(5, { kind: 'grammar', correct: false })]);
  assert.deepEqual(challengeProgress(grammar, d), { value: 8, target: 10, done: false });
  const combo = CHALLENGES.find((c) => c.metric === 'combo');
  assert.equal(challengeProgress(combo, { ...emptyDay(), best_combo: 12 }).done, true);
});
