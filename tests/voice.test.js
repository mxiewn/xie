// xie · tests/voice.test.js — chạy: npm test (hoặc node --test tests/*.test.js)
// spec mục 15: "thoại: gọi 100 lần mỗi nhóm, không lặp trong 15 câu gần nhất, câu ghép đọc tự nhiên"

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  pick, emptyHistory, lineProblems, varsAvailable, matchesWhen, greetingGroup, fill,
  RECENT_LIMIT, KAO_RECENT,
} from '../js/voice-core.js';

const voice = JSON.parse(readFileSync(new URL('../data/voice.json', import.meta.url), 'utf8'));
const GROUPS = Object.keys(voice).filter((k) => !k.startsWith('_'));
const SAMPLE = { name: 'mai', streak: 12, n: 7, left: 4, word: 'sustainable', days: 30, level: 'thỏ ngọc trai', minutes: 30, goal: 50 };
const GROUP_HOUR = { chao_sang: 8, chao_trua_chieu: 14, chao_toi_khuya: 21 };

// số ngẫu nhiên có hạt giống, để test lặp lại được
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function contexts(gid) {
  const g = voice[gid];
  const base = { ...SAMPLE, hour: GROUP_HOUR[gid] ?? 10 };
  return g.kinds ? g.kinds.map((kind) => ({ ...base, kind })) : [base];
}

for (const gid of GROUPS) {
  for (const ctx of contexts(gid)) {
    const label = ctx.kind ? `${gid} (${ctx.kind})` : gid;

    test(`${label}: gọi 100 lần không lặp trong ${RECENT_LIMIT} câu gần nhất`, () => {
      const eligible = voice[gid].lines.filter((l) => varsAvailable(l.text, ctx) && matchesWhen(l.when, ctx)).length;
      const windowSize = Math.min(RECENT_LIMIT, eligible - 1);
      const history = emptyHistory();
      const rand = seeded(gid.length * 97 + (ctx.kind || '').length);
      const ids = [];
      for (let i = 0; i < 100; i++) {
        const r = pick(voice, gid, ctx, { history, rand, forceLine: true, now: i * 60_000 });
        assert.ok(r && r.id, 'phải có câu thoại');
        assert.ok(!ids.slice(-windowSize).includes(r.id), `lặp câu "${r.text}" ở lần gọi ${i + 1}`);
        ids.push(r.id);
      }
      if (gid !== 'dem_nguoc' && !ctx.kind) {
        assert.ok(eligible > RECENT_LIMIT, `cần hơn ${RECENT_LIMIT} câu hợp ngữ cảnh, đang có ${eligible}`);
      }
    });

    test(`${label}: câu ghép mảnh vẫn đạt luật viết, không sót biến, kaomoji không lặp ${KAO_RECENT} cái gần nhất`, () => {
      const history = emptyHistory();
      const rand = seeded(1234 + gid.length);
      const kaos = [];
      for (let i = 0; i < 100; i++) {
        const r = pick(voice, gid, ctx, { history, rand, forceLine: true, now: i * 60_000 });
        assert.ok(!/[{}]/.test(r.text), `còn biến chưa điền: "${r.text}"`);
        assert.deepEqual(lineProblems(r.text, 'mix').filter((p) => !p.includes('chữ hoa')), [], `"${r.text}"`);
        assert.ok(!kaos.slice(-KAO_RECENT).includes(r.kao), `lặp kaomoji ${r.kao}`);
        kaos.push(r.kao);
      }
    });
  }
}

test('mật độ thoại: trả lời đúng khoảng 1/3 lần có thoại, chỉnh được nhiều / vừa / ít', () => {
  const ratio = (talk) => {
    const history = emptyHistory();
    const rand = seeded(42);
    let spoken = 0;
    for (let i = 0; i < 3000; i++) {
      if (pick(voice, 'dung', SAMPLE, { history, rand, talk }).text) spoken += 1;
    }
    return spoken / 3000;
  };
  const vua = ratio('vua');
  assert.ok(vua > 0.28 && vua < 0.38, `vừa: ${vua}`);
  assert.ok(ratio('it') < vua && vua < ratio('nhieu'), 'ít < vừa < nhiều');
});

test('sự kiện lớn luôn có thoại', () => {
  const history = emptyHistory();
  for (let i = 0; i < 50; i++) {
    assert.ok(pick(voice, 'len_level', SAMPLE, { history, talk: 'it', now: i }).text);
  }
});

test('nhóm chào theo giờ việt nam, sai giờ thì không chọn', () => {
  assert.equal(greetingGroup(7), 'chao_sang');
  assert.equal(greetingGroup(13), 'chao_trua_chieu');
  assert.equal(greetingGroup(22), 'chao_toi_khuya');
  assert.equal(greetingGroup(3), 'chao_toi_khuya');
  assert.equal(pick(voice, 'chao_sang', { hour: 20 }), null);
});

test('chưa có tên thì bỏ qua câu cần {name}; tên hiển thị viết thường', () => {
  const history = emptyHistory();
  for (let i = 0; i < 60; i++) {
    const r = pick(voice, 'chao_sang', { hour: 8 }, { history, forceLine: true, now: i });
    assert.ok(!r.text.includes('{name}'));
  }
  assert.equal(fill('chào {name}', { name: 'Mai Anh' }), 'chào mai anh');
});
