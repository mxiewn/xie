// xie · srs.js — lặp lại ngắt quãng (spec mục 8): leitner 5 hộp, theo dõi RIÊNG từng mức thành thạo.
// thuần javascript, test ở tests/srs.test.js.
//
// mỗi từ có "mức đang luyện" (stage 1–4), đi qua lần lượt:
//   1 nhận biết → 2 nhớ lại → 3 dùng có hướng dẫn → 4 dùng tự do (output)
// mỗi mức có hộp leitner riêng: { box 1–5, due (ms), right, wrong, last (ms) }.
//   đúng → lên 1 hộp, hẹn xa hơn. sai → về hộp 1, hẹn lại sau 10 phút. "khó" → lùi 1 hộp, hẹn ngày mai.
//   đúng đủ ở mức đang luyện thì mở mức kế tiếp (mức cũ thôi ôn, mức mới bắt đầu ở hộp 1, đến hạn ngay).
// kho output: từ qua mức 4 ít nhất 2 lần ở 2 ngày khác nhau (spec). từ đã vào kho vẫn ôn thưa (hộp 4–5).

export const STAGES = [1, 2, 3, 4];
export const STAGE_LABELS = { 1: 'nhận biết', 2: 'nhớ lại', 3: 'dùng có hướng dẫn', 4: 'dùng tự do' };
export const MAX_BOX = 5;

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

// khoảng hẹn theo hộp. hộp 1 = trong phiên (10 phút). mức 4 (output) ôn thưa hơn
export const INTERVALS = {
  1: [10 * MIN, 1 * DAY, 2 * DAY, 4 * DAY, 8 * DAY],
  2: [10 * MIN, 1 * DAY, 3 * DAY, 6 * DAY, 12 * DAY],
  3: [10 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 14 * DAY],
  4: [10 * MIN, 2 * DAY, 5 * DAY, 14 * DAY, 30 * DAY],
};
export const RETRY_MS = 10 * MIN;

// cần đúng bao nhiêu lần (lên tới hộp nào) để mở mức kế. mức 1 dễ nên 1 lần là đủ
export const PROMOTE_AT_BOX = { 1: 2, 2: 2, 3: 3 };
export const OUTPUT_PASSES = 2; // qua mức 4 ở 2 ngày khác nhau → vào kho output

export function emptyBox(now = Date.now()) {
  return { box: 1, due: now, right: 0, wrong: 0, last: null };
}

// trạng thái ban đầu của một từ khi mới học
export function newItem(now = Date.now(), today = null) {
  return { stage: 1, boxes: { 1: emptyBox(now) }, output_days: [], wrong: 0, hard: 0, added: today };
}

const clampBox = (b) => Math.max(1, Math.min(MAX_BOX, b));
export const intervalFor = (stage, box) => INTERVALS[stage][clampBox(box) - 1];

/**
 * chấm một lần ôn ở một mức.
 * grade: "right" | "wrong" | "hard" (đúng nhưng phải nhờ gợi ý / bấm khó)
 * today: "yyyy-mm-dd" (giờ việt nam) — dùng để đếm ngày qua mức 4.
 * trả về { item (bản mới), promoted (mở mức mới), output (vừa vào kho output) }
 */
export function review(item, stage, grade, { now = Date.now(), today = null } = {}) {
  const it = { ...item, boxes: { ...item.boxes }, output_days: [...(item.output_days || [])] };
  const cur = { ...(it.boxes[stage] || emptyBox(now)) };
  let promoted = false;
  let output = false;
  const wasOutput = isOutput(it);

  if (grade === 'right') {
    cur.box = clampBox(cur.box + 1);
    cur.right += 1;
    cur.due = now + intervalFor(stage, cur.box);
  } else if (grade === 'hard') {
    cur.box = clampBox(cur.box - 1);
    cur.due = now + Math.min(DAY, intervalFor(stage, cur.box + 1));
    it.hard = (it.hard || 0) + 1;
  } else {
    cur.box = 1;
    cur.wrong += 1;
    cur.due = now + RETRY_MS;
    it.wrong = (it.wrong || 0) + 1;
  }
  cur.last = now;
  it.boxes[stage] = cur;

  if (stage === 4 && grade === 'right' && today && !it.output_days.includes(today)) {
    it.output_days = [...it.output_days, today].slice(-10);
  }

  // mở mức kế tiếp khi mức đang luyện đúng đủ
  if (stage === it.stage && stage < 4 && grade === 'right' && cur.box >= PROMOTE_AT_BOX[stage]) {
    it.stage = stage + 1;
    it.boxes[it.stage] = it.boxes[it.stage] || emptyBox(now);
    promoted = true;
  }
  if (!wasOutput && isOutput(it)) output = true;
  return { item: it, promoted, output };
}

export function isOutput(item) {
  return new Set(item?.output_days || []).size >= OUTPUT_PASSES;
}

// mức thành thạo để hiển thị: 0 chưa học, 1–4 đang luyện, 5 = đã vào kho output
export function masteryOf(item) {
  if (!item) return 0;
  if (isOutput(item)) return 5;
  return item.stage || 1;
}

export function dueAt(item) {
  return item?.boxes?.[item.stage]?.due ?? 0;
}

export function isDue(item, now = Date.now()) {
  return Boolean(item) && dueAt(item) <= now;
}

/**
 * danh sách id đến hạn, sớm nhất trước. topicOf(id) để trộn chủ đề:
 * cùng mức hạn thì xen kẽ chủ đề, không dồn một chủ đề liền một mạch.
 */
export function dueList(items, now = Date.now(), topicOf = () => '') {
  const due = Object.entries(items)
    .filter(([, it]) => isDue(it, now) && !it.hidden)
    .sort((a, b) => dueAt(a[1]) - dueAt(b[1]))
    .map(([id]) => id);
  return interleave(due, topicOf);
}

// xen kẽ chủ đề: lấy lần lượt mỗi chủ đề một từ, giữ thứ tự trong từng chủ đề
export function interleave(ids, topicOf = () => '') {
  const groups = new Map();
  for (const id of ids) {
    const t = topicOf(id);
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(id);
  }
  const out = [];
  const lists = [...groups.values()];
  for (let i = 0; out.length < ids.length; i++) {
    for (const l of lists) if (l[i] !== undefined) out.push(l[i]);
  }
  return out;
}
