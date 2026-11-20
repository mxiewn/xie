// xie · tests/state.test.js — lõi state: schema, nâng cấp version, chuẩn hoá, ngày giờ việt nam, xuất/nhập.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION, defaultState, normalize, migrate, isValidDate, todayIn, daysBetween,
  daysUntilExam, recordVisit, buildExport, parseImport, cleanName, MIN_DAILY_GOAL,
} from '../js/state-core.js';
import { TOPIC_IDS } from '../js/topics.js';

test('state mặc định hợp lệ và có số version', () => {
  const s = defaultState();
  assert.equal(s.version, SCHEMA_VERSION);
  assert.equal(s.onboarded, false);
  assert.equal(s.profile.daily_goal, 50);
  assert.equal(s.profile.new_words_per_day, 8);
  assert.deepEqual(normalize(s), { ...s, created_at: normalize(s).created_at, updated_at: normalize(s).updated_at });
});

test('dữ liệu hỏng hoặc rỗng không làm sập, trả về state mặc định', () => {
  for (const bad of [null, undefined, 42, 'abc', [], {}]) {
    const s = migrate(bad);
    assert.equal(s.version, SCHEMA_VERSION);
    assert.equal(s.onboarded, false);
  }
});

test('mục tiêu lượt không bao giờ dưới 50', () => {
  for (const g of [0, -5, 10, 49, '30', null, 'abc']) {
    assert.equal(normalize({ profile: { daily_goal: g } }).profile.daily_goal, MIN_DAILY_GOAL);
  }
  assert.equal(normalize({ profile: { daily_goal: 80 } }).profile.daily_goal, 80);
  assert.equal(normalize({ profile: { daily_goal: 90 } }).profile.daily_goal, 80); // số lạ: về mức gần nhất
  assert.equal(normalize({ profile: { daily_goal: 500 } }).profile.daily_goal, 200);
});

test('chuẩn hoá các trường hồ sơ', () => {
  const s = normalize({
    profile: {
      name: '   Mai    Anh  ', target_band: 8, exam_date: '2026-02-30', new_words_per_day: 99,
      topics: ['education', 'education', 'không-có', 'health', 7], weak_skill: 'math',
    },
    settings: { font_size: 'khổng lồ' },
  }, TOPIC_IDS);
  assert.equal(s.profile.name, 'mai anh');
  assert.equal(s.profile.target_band, 6.5);
  assert.equal(s.profile.exam_date, null);
  assert.equal(s.profile.new_words_per_day, 20);
  assert.deepEqual(s.profile.topics, ['education', 'health']);
  assert.equal(s.profile.weak_skill, null);
  assert.equal(s.settings.font_size, 'vua');
  assert.equal(cleanName('a'.repeat(40)).length, 24);
});

test('nâng cấp từ dữ liệu chưa có version (key camelCase, để phẳng)', () => {
  const s = migrate({ name: 'linh', targetBand: 7, examDate: '2027-03-01', dailyGoal: 120, weakSkill: 'speaking', fontSize: 'lon' });
  assert.equal(s.version, 1);
  assert.equal(s.onboarded, true);
  assert.equal(s.profile.name, 'linh');
  assert.equal(s.profile.target_band, 7);
  assert.equal(s.profile.exam_date, '2027-03-01');
  assert.equal(s.profile.daily_goal, 120);
  assert.equal(s.profile.weak_skill, 'speaking');
  assert.equal(s.settings.font_size, 'lon');
});

test('dữ liệu từ bản mới hơn vẫn đọc được phần quen thuộc', () => {
  const s = migrate({ version: 99, onboarded: true, profile: { name: 'an', daily_goal: 80 }, tinh_nang_moi: {} });
  assert.equal(s.profile.name, 'an');
  assert.equal(s.profile.daily_goal, 80);
});

test('ngày theo giờ việt nam, không phụ thuộc múi giờ máy', () => {
  // 23:59 ngày 1/3 giờ việt nam = 16:59 utc
  assert.equal(todayIn(new Date('2026-03-01T16:59:00Z')), '2026-03-01');
  // 00:01 ngày 2/3 giờ việt nam = 17:01 utc ngày 1/3
  assert.equal(todayIn(new Date('2026-03-01T17:01:00Z')), '2026-03-02');
  assert.equal(daysBetween('2026-02-27', '2026-03-02'), 3);
  assert.equal(daysBetween('2024-02-28', '2024-03-01'), 2); // năm nhuận
  assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
  assert.equal(daysBetween('sai', '2027-01-01'), null);
  assert.equal(isValidDate('2026-02-29'), false);
  assert.equal(isValidDate('2028-02-29'), true);
});

test('đếm ngược ngày thi', () => {
  const s = normalize({ profile: { exam_date: '2026-12-20' } });
  assert.equal(daysUntilExam(s, '2026-11-20'), 30);
  assert.equal(daysUntilExam(s, '2026-12-20'), 0);
  assert.equal(daysUntilExam(s, '2026-12-25'), -5);
  assert.equal(daysUntilExam(defaultState(), '2026-11-20'), null);
});

test('ghi nhận lần ghé thăm: mở nhiều lần trong ngày chỉ tính 1, vắng thì biết bao nhiêu ngày', () => {
  let { state, gap } = recordVisit(defaultState(), '2026-11-01');
  assert.equal(gap, null);
  assert.equal(state.visits.count, 1);
  ({ state, gap } = recordVisit(state, '2026-11-01'));
  assert.equal(gap, 0);
  assert.equal(state.visits.count, 1);
  ({ state, gap } = recordVisit(state, '2026-11-05'));
  assert.equal(gap, 4);
  assert.equal(state.visits.count, 2);
  assert.equal(state.visits.first_day, '2026-11-01');
});

test('xuất rồi nhập lại giữ nguyên dữ liệu, bỏ key lạ, chuẩn hoá hồ sơ', () => {
  const state = JSON.stringify(normalize({ onboarded: true, profile: { name: 'mai', daily_goal: 120 } }));
  const file = JSON.stringify(buildExport({ 'xie:state': state, 'xie:theme': 'dark', 'khac:key': 'x' }));
  const r = parseImport(file);
  assert.equal(r.ok, true);
  assert.deepEqual(Object.keys(r.entries).sort(), ['xie:state', 'xie:theme']);
  assert.equal(JSON.parse(r.entries['xie:state']).profile.daily_goal, 120);
  assert.equal(r.entries['xie:theme'], 'dark');
});

test('nhập file sai thì báo lỗi dễ hiểu, không ghi gì', () => {
  assert.equal(parseImport('không phải json').ok, false);
  assert.equal(parseImport(JSON.stringify({ app: 'khac', data: {} })).ok, false);
  assert.equal(parseImport(JSON.stringify({ app: 'xie', data: { 'khac:a': '1' } })).ok, false);
  assert.equal(parseImport(JSON.stringify({ app: 'xie', data: { 'xie:state': '{hỏng' } })).ok, false);
  const r = parseImport(JSON.stringify({ app: 'xie', data: {} }));
  assert.match(r.error, /^[^A-Z]*$/);
});
