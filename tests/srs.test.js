// xie · tests/srs.test.js — lặp lại ngắt quãng: leitner 5 hộp riêng từng mức, mở mức, kho output.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  newItem, review, isOutput, masteryOf, isDue, dueList, interleave, intervalFor, RETRY_MS, INTERVALS, PROMOTE_AT_BOX,
} from '../js/srs.js';

const DAY = 86_400_000;
const T0 = Date.parse('2026-11-20T02:00:00Z');

test('từ mới: mức 1, hộp 1, đến hạn ngay', () => {
  const it = newItem(T0, '2026-11-20');
  assert.equal(it.stage, 1);
  assert.equal(it.boxes[1].box, 1);
  assert.equal(isDue(it, T0), true);
  assert.equal(masteryOf(it), 1);
  assert.equal(masteryOf(null), 0);
});

test('đúng thì lên hộp và hẹn xa hơn; sai về hộp 1, 10 phút sau ôn lại', () => {
  // mức 4 không mở thêm mức nào nên nhìn rõ hộp lên / xuống
  let it = { ...newItem(T0), stage: 4, boxes: { 4: { box: 2, due: T0, right: 1, wrong: 0, last: null } } };
  let r = review(it, 4, 'right', { now: T0 });
  assert.equal(r.item.boxes[4].box, 3);
  assert.equal(r.item.boxes[4].due, T0 + intervalFor(4, 3));
  r = review(r.item, 4, 'wrong', { now: T0 + DAY });
  assert.equal(r.item.boxes[4].box, 1);
  assert.equal(r.item.boxes[4].due, T0 + DAY + RETRY_MS);
  assert.equal(r.item.wrong, 1);
  assert.equal(isDue(r.item, T0 + DAY + RETRY_MS - 1), false);
  assert.equal(isDue(r.item, T0 + DAY + RETRY_MS), true);
});

test('"khó" thì lùi 1 hộp, quay lại sớm (không quá 1 ngày)', () => {
  const it = { ...newItem(T0), stage: 3, boxes: { 3: { box: 4, due: T0, right: 3, wrong: 0, last: null } } };
  const r = review(it, 3, 'hard', { now: T0 });
  assert.equal(r.item.boxes[3].box, 3);
  assert.ok(r.item.boxes[3].due - T0 <= DAY);
  assert.equal(r.item.hard, 1);
  assert.equal(r.item.stage, 3);
});

test('đi qua lần lượt 4 mức; mỗi mức có hộp riêng', () => {
  let it = newItem(T0);
  let now = T0;
  const passStage = (stage) => {
    let promoted = false;
    for (let i = 0; i < 5 && !promoted; i++) {
      const r = review(it, stage, 'right', { now });
      it = r.item;
      promoted = r.promoted;
      now = it.boxes[stage].due;
    }
    return promoted;
  };
  assert.equal(passStage(1), true);
  assert.equal(it.stage, 2);
  assert.equal(it.boxes[2].box, 1);
  assert.equal(passStage(2), true);
  assert.equal(it.stage, 3);
  assert.equal(passStage(3), true);
  assert.equal(it.stage, 4);
  assert.deepEqual(Object.keys(it.boxes).sort(), ['1', '2', '3', '4']);
  assert.equal(PROMOTE_AT_BOX[3], 3); // mức 3 cần đúng 2 lần
});

test('sai ở mức đang luyện không mở mức mới', () => {
  const r = review(newItem(T0), 1, 'wrong', { now: T0 });
  assert.equal(r.promoted, false);
  assert.equal(r.item.stage, 1);
});

test('kho output: qua mức 4 ít nhất 2 lần ở 2 NGÀY khác nhau', () => {
  let it = { ...newItem(T0), stage: 4, boxes: { 4: { box: 1, due: T0, right: 0, wrong: 0, last: null } } };
  let r = review(it, 4, 'right', { now: T0, today: '2026-11-20' });
  assert.equal(r.output, false);
  r = review(r.item, 4, 'right', { now: T0 + 1000, today: '2026-11-20' }); // cùng ngày: chưa tính
  assert.equal(isOutput(r.item), false);
  r = review(r.item, 4, 'right', { now: T0 + 2 * DAY, today: '2026-11-22' });
  assert.equal(r.output, true);
  assert.equal(isOutput(r.item), true);
  assert.equal(masteryOf(r.item), 5);
  // đã vào kho vẫn ôn thưa
  assert.ok(r.item.boxes[4].due - (T0 + 2 * DAY) >= INTERVALS[4][1]);
  // sai sau này không mất kho
  r = review(r.item, 4, 'wrong', { now: T0 + 30 * DAY, today: '2026-12-20' });
  assert.equal(isOutput(r.item), true);
});

test('ôn từ đến hạn trước, sớm nhất trước, trộn chủ đề', () => {
  const mk = (due) => ({ ...newItem(due), boxes: { 1: { box: 1, due, right: 0, wrong: 0, last: null } } });
  const items = { a1: mk(T0 - 50), a2: mk(T0 - 40), a3: mk(T0 - 30), b1: mk(T0 - 20), b2: mk(T0 - 10), c1: mk(T0 + DAY) };
  const topic = (id) => id[0];
  const due = dueList(items, T0, topic);
  assert.equal(due.includes('c1'), false);
  assert.deepEqual(due, ['a1', 'b1', 'a2', 'b2', 'a3']);
  assert.deepEqual(interleave(['x1', 'x2', 'y1'], (id) => id[0]), ['x1', 'y1', 'x2']);
  const hidden = { ...items, a1: { ...items.a1, hidden: true } };
  assert.equal(dueList(hidden, T0, topic).includes('a1'), false);
});

test('dữ liệu bất biến: review không sửa bản cũ', () => {
  const it = newItem(T0);
  const snap = JSON.stringify(it);
  review(it, 1, 'right', { now: T0 });
  assert.equal(JSON.stringify(it), snap);
});
