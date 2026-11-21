// xie · tests/vocab.test.js — lõi từ vựng: dữ liệu sổ excel, chấm câu gõ, đục lỗ ví dụ, câu hỏi 4 mức,
// chọn từ mới theo tỉ lệ, từ của ngày, kế hoạch hôm nay, câu của tui, sổ lỗi, từ của tui.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  normalizeItem, checkTyped, answerForms, findBlank, blankFor, makeQuestion, checkAgainst, usesPhrase, hints,
  pickNew, ratioFor, wordOfDay, buildGradePrompt, wordCount, levenshtein,
} from '../js/vocab-core.js';
import {
  migrateVocab, startLearning, newToday, outputCount, masteryCounts, dueIds, isWeak, userFields, setUserFields,
  todayPlan, addSentence, migrateSentences, addMistake, migrateMistakes, categoryFor, makeMyWord, migrateMyWords, learnedMap,
} from '../js/vocab-state.js';
import { review } from '../js/srs.js';

const dir = new URL('../data/vocab/', import.meta.url);
const index = JSON.parse(readFileSync(new URL('index.json', dir), 'utf8'));
const files = readdirSync(dir).filter((f) => f.startsWith('excel-'));
const POOL = files.flatMap((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')).items).map(normalizeItem);
const byId = Object.fromEntries(POOL.map((i) => [i.id, i]));
const T0 = Date.parse('2026-11-20T02:00:00Z');

// số ngẫu nhiên có hạt giống
function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test('sổ của tui: đúng 157 cụm, 12 chủ đề, đủ trường, không trùng id, index khớp', () => {
  assert.equal(POOL.length, 157);
  assert.equal(new Set(POOL.map((i) => i.id)).size, 157);
  const excelTopics = index.topics.filter((t) => t.source === 'excel');
  assert.equal(excelTopics.length, 12);
  assert.equal(excelTopics.reduce((s, t) => s + t.count, 0), 157);
  for (const it of POOL) {
    assert.ok(it.phrase && it.meaning_vi, it.id);
    assert.equal(it.source, 'excel');
    assert.ok(it.examples.length >= 1, `${it.id} thiếu ví dụ`);
  }
});

test('chấm câu gõ: không phân biệt hoa thường, "(sth)" tuỳ chọn, khung "+ v-ing"', () => {
  const item = byId['cam-xuc-so-thich-3']; // be drawn to (sth)
  for (const a of ['be drawn to', 'Be Drawn To', 'be drawn to sth', '  be   drawn to.  ']) assert.equal(checkTyped(a, item).ok, true, a);
  assert.equal(checkTyped('be drawn', item).ok, false);
  assert.deepEqual(answerForms('the thought of + V-ing'), ['the thought of']);
  assert.equal(checkTyped('the thought of', byId['cam-xuc-so-thich-17']).ok, true);
  assert.equal(checkTyped("I’m all about", byId['cam-xuc-so-thich-1']).ok, true); // dấu nháy cong
});

test('chấm câu gõ: cho sai 1 ký tự với cụm dài, không cho với từ ngắn', () => {
  const long = byId['ban-be-giao-tiep-4']; // fear of judgment
  const r = checkTyped('fear of judgement', long);
  assert.equal(r.ok, true);
  assert.equal(r.typo, true);
  assert.equal(checkTyped('fear of judgmnet', long).ok, false); // sai 2 ký tự
  const short = normalizeItem({ id: 'x', phrase: 'calm', meaning_vi: 'bình tĩnh' });
  assert.equal(checkTyped('calf', short).ok, false);
  assert.equal(levenshtein('kitten', 'sitting'), 3);
});

test('gõ cách nói tương tự vẫn tính đúng, nhưng báo cụm chính', () => {
  const item = byId['quan-ao-thoi-trang-1']; // my go-to outfit / a wardrobe staple
  const r = checkTyped('a wardrobe staple', item);
  assert.equal(r.ok, true);
  assert.equal(r.viaAlternative, true);
  assert.equal(r.expected, 'my go-to outfit');
});

test('đục lỗ câu ví dụ: chịu được chia động từ, bỏ be / my / (sth)', () => {
  const cases = {
    'cam-xuc-so-thich-3': 'drawn to', // I've always been drawn to bright colors.
    'cam-xuc-so-thich-9': 'boosts my mood', // A short walk always boosts my mood.
    'hoc-tap-ky-nang-3': 'get the hang of',
    'am-nhac-9': 'strike a chord', // "(with me)" là phần tuỳ chọn, để lộ trong câu
  };
  for (const [id, answer] of Object.entries(cases)) {
    const b = blankFor(byId[id]);
    assert.ok(b, `${id}: không đục lỗ được`);
    assert.equal(b.answer, answer, id);
    assert.ok(b.text.includes('_____'));
  }
  // ví dụ không chứa cụm chính → không đục bừa
  assert.equal(findBlank(byId['kinh-doanh-16'], byId['kinh-doanh-16'].examples[0]), null);
});

test('đục lỗ được phần lớn sổ (≥ 80%)', () => {
  const ok = POOL.filter((it) => blankFor(it)).length;
  assert.ok(ok / POOL.length >= 0.8, `chỉ ${ok}/${POOL.length}`);
});

test('mọi cụm đều sinh đủ câu hỏi 4 mức, câu chọn có đáp án đúng nằm trong lựa chọn', () => {
  const rand = seeded(7);
  for (const it of POOL) {
    for (const stage of [1, 2, 3, 4]) {
      const q = makeQuestion(it, stage, POOL, { rand });
      assert.ok(q && q.mode, `${it.id} mức ${stage}`);
      if (q.mode === 'choose') {
        assert.ok(q.options.includes(q.answer), `${it.id} mức ${stage}`);
        assert.equal(new Set(q.options).size, q.options.length, `${it.id} trùng lựa chọn`);
        assert.ok(q.options.length >= 3);
      }
      if (stage === 4) {
        assert.equal(q.mode, 'output');
        if (it.use_for === 'speaking') assert.deepEqual(q.outputModes, ['speak']);
        if (it.use_for === 'both') assert.deepEqual(q.outputModes, ['write', 'speak']);
      }
    }
  }
});

test('câu hỏi đục lỗ chấm đúng theo đúng chữ trong câu', () => {
  const it = byId['cam-xuc-so-thich-9'];
  const b = blankFor(it);
  assert.equal(checkAgainst('Boosts my mood', b.answer).ok, true);
  assert.equal(checkAgainst('boost my mood', b.answer).ok, true); // sai 1 ký tự, cụm dài
  assert.equal(checkAgainst('lift my mood', b.answer).ok, false);
});

test('gợi ý lần lượt: chữ cái đầu → số chữ cái → câu có chỗ trống', () => {
  const it = byId['hoc-tap-ky-nang-3'];
  const h = hints(it, blankFor(it));
  assert.equal(h.length, 3);
  assert.match(h[0], /"g"/);
  assert.match(h[1], /^\d+ chữ cái/);
  assert.match(h[2], /_____/);
});

test('câu tự viết có dùng cụm (kể cả chia động từ hoặc cách nói tương tự)', () => {
  assert.equal(usesPhrase('Drawing always boosts my mood after school.', byId['cam-xuc-so-thich-9']), true);
  assert.equal(usesPhrase('Listening to music uplifts my mood.', byId['cam-xuc-so-thich-9']), true);
  assert.equal(usesPhrase('I like drawing a lot.', byId['cam-xuc-so-thich-9']), false);
  assert.equal(wordCount("I'm quite into drawing these days."), 6);
});

test('type "word": bài word form, giới từ, collocation, sửa câu sai', () => {
  const word = normalizeItem({
    id: 'w1', type: 'word', phrase: 'beneficial', meaning_vi: 'có lợi', topic: 'education', track: 'academic', source: 'xie',
    examples: ['Regular exercise is beneficial to students.', 'The benefits of reading are clear.'],
    word_family: { noun: 'benefit', verb: 'benefit', adjective: 'beneficial', adverb: 'beneficially' },
    prepositions: [{ pattern: 'beneficial to sb', example: 'Sleep is beneficial to memory.' }],
    collocations: { adj: ['highly beneficial'], verb: ['prove beneficial'] },
    common_mistakes_vi: [{ wrong: 'It is beneficial for to students.', right: 'It is beneficial to students.', why: 'thừa giới từ' }],
  });
  const other = normalizeItem({ id: 'w2', type: 'word', phrase: 'impact', meaning_vi: 'tác động', collocations: { verb: ['have an impact', 'pose a threat'] } });
  const tags = new Set();
  for (let s = 0; s < 60; s++) tags.add(makeQuestion(word, 3, [word, other], { rand: seeded(s) }).tag);
  for (const t of ['form', 'prep', 'collocation', 'fix']) assert.ok(tags.has(t), `thiếu dạng ${t}`);
});

test('chọn từ mới: theo tỉ lệ nguồn, từ của tui trước, nhánh hết từ thì nhường chỗ', () => {
  const mk = (id, source, track) => normalizeItem({ id, source, track, phrase: id, meaning_vi: id, topic: 't' });
  const pool = [
    ...Array.from({ length: 10 }, (_, i) => mk(`e${i}`, 'excel', 'daily')),
    ...Array.from({ length: 10 }, (_, i) => mk(`d${i}`, 'xie', 'daily')),
    ...Array.from({ length: 10 }, (_, i) => mk(`a${i}`, 'xie', 'academic')),
    mk('m0', 'mine', 'daily'),
  ];
  const ids = pickNew(pool, {}, 9, { ratio: ratioFor('can_bang') });
  assert.equal(ids.length, 9);
  assert.equal(ids[0], 'm0');
  const count = (p) => ids.filter((x) => x.startsWith(p)).length;
  assert.equal(count('e'), 4);
  assert.equal(count('d') + count('a'), 4);
  // chỉ có sổ excel (như bây giờ) thì lấy hết từ sổ
  const onlyExcel = pickNew(POOL, {}, 8, { ratio: ratioFor('can_bang') });
  assert.equal(onlyExcel.length, 8);
  // đã học thì không chọn lại
  const learned = Object.fromEntries(onlyExcel.map((id) => [id, {}]));
  assert.equal(pickNew(POOL, learned, 8).some((id) => learned[id]), false);
  assert.deepEqual(ratioFor('tu_dong', 'writing'), ratioFor('viet'));
});

test('từ của ngày: cố định trong ngày, đổi theo ngày, ưu tiên từ chưa vào kho output', () => {
  const a = wordOfDay(POOL, '2026-11-20');
  assert.equal(wordOfDay(POOL, '2026-11-20').id, a.id);
  const days = new Set(Array.from({ length: 10 }, (_, i) => wordOfDay(POOL, `2026-11-${String(10 + i).padStart(2, '0')}`).id));
  assert.ok(days.size >= 8);
  const learned = { [a.id]: { output_days: ['2026-11-01', '2026-11-02'] } };
  assert.notEqual(wordOfDay(POOL, '2026-11-20', learned, (p) => (p?.output_days?.length || 0) >= 2).id, a.id);
  assert.equal(wordOfDay([], '2026-11-20'), null);
});

test('tiến độ học: bắt đầu học, đếm từ mới hôm nay, đến hạn, từ hay sai, kho output', () => {
  let v = migrateVocab(null);
  v = startLearning(v, 'a', { now: T0, today: '2026-11-20' });
  v = startLearning(v, 'b', { now: T0, today: '2026-11-20' });
  v = startLearning(v, 'a', { now: T0, today: '2026-11-20' }); // học lại không tính thêm
  assert.equal(newToday(v, '2026-11-20'), 2);
  assert.deepEqual(dueIds(v, T0).sort(), ['a', 'b']);
  let p = v.items.a;
  for (const g of ['wrong', 'wrong']) p = review(p, 1, g, { now: T0 }).item;
  assert.equal(isWeak(p), true);
  p = { ...p, stage: 4, output_days: ['2026-11-18', '2026-11-20'] };
  v = { ...v, items: { ...v.items, a: p } };
  assert.equal(outputCount(v), 1);
  assert.deepEqual(masteryCounts(v, ['a', 'b', 'c']), { 0: 1, 1: 1, 2: 0, 3: 0, 4: 0, 5: 1 });
});

test('câu của tôi + đã dùng khi nói: lấy từ sổ, sửa được mà không đụng srs', () => {
  const item = { ...byId['am-nhac-1'], seed: { my_sentence: 'câu cũ', used_speaking: false } };
  let v = migrateVocab(null);
  assert.deepEqual(userFields(v, item), { my_sentence: 'câu cũ', used_speaking: false, hidden: false });
  v = setUserFields(v, item.id, { my_sentence: 'I listen to upbeat songs at the gym.', used_speaking: true });
  assert.equal(userFields(v, item).used_speaking, true);
  assert.equal(Object.keys(learnedMap(v)).length, 0); // chưa học thì chưa vào srs
  v = startLearning(v, item.id, { now: T0, today: '2026-11-20' });
  assert.equal(v.items[item.id].my_sentence, 'I listen to upbeat songs at the gym.');
  assert.equal(Object.keys(learnedMap(v)).length, 1);
});

test('kế hoạch hôm nay: đủ các bước theo thứ tự spec, cộng lại đủ mục tiêu', () => {
  const steps = todayPlan({ due: 12, newLeft: 8, goal: 50 });
  assert.deepEqual(steps.map((s) => s.id), ['review', 'new', 'output', 'games', 'grammar']);
  assert.ok(steps.reduce((s, x) => s + x.turns, 0) >= 50);
  assert.ok(steps.find((s) => s.id === 'output').turns >= 10);
  assert.ok(steps.find((s) => s.id === 'games').turns <= 25);
});

test('câu của tui, sổ lỗi, từ của tui: lưu và chuẩn hoá', () => {
  let s = migrateSentences(null);
  s = addSentence(s, { item: 'am-nhac-1', phrase: 'upbeat songs', text: ' I play upbeat songs when I clean. ', date: '2026-11-20', at: T0 });
  assert.equal(s.list[0].text, 'I play upbeat songs when I clean.');
  assert.equal(migrateSentences({ list: [{ id: 'x', text: '' }, { id: 'y', text: 'ok', kind: 'lạ' }] }).list.length, 1);
  let m = migrateMistakes(null);
  m = addMistake(m, { item: 'a', phrase: 'a', stage: 3, category: categoryFor({ stage: 3, tag: 'prep' }), answer: 'x', expected: 'y', date: '2026-11-20', at: T0 });
  assert.equal(m.list[0].category, 'gioi_tu');
  assert.equal(categoryFor({ stage: 1 }), 'nghia');
  assert.equal(makeMyWord({ phrase: '', meaning: 'x' }).ok, false);
  assert.equal(makeMyWord({ phrase: 'x', meaning: '' }).ok, false);
  const w = makeMyWord({ phrase: '  give it a shot ', meaning: 'thử xem sao' }, { at: T0 });
  assert.equal(w.ok, true);
  assert.equal(w.item.source, 'mine');
  assert.equal(w.item.phrase, 'give it a shot');
  assert.equal(migrateMyWords({ items: [w.item, { phrase: '' }] }).items.length, 1);
});

test('prompt nhờ claude chấm có đủ band, từ mục tiêu, câu, các yêu cầu chấm', () => {
  const p = buildGradePrompt({ band: 7, sentences: [{ phrase: 'boost my mood', text: 'Music boosts my mood.' }] });
  for (const s of ['band 7.0', 'boost my mood', 'Music boosts my mood.', 'word form', 'giới từ', 'collocation', 'tự nhiên', 'band 7']) {
    assert.ok(p.includes(s), s);
  }
});
