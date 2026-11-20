#!/usr/bin/env node
// xie · tools/validate.js
// chạy: node tools/validate.js
// kiểm tra:
//   1. mã màu (#hex, rgb, hsl) chỉ được nằm trong css/themes.css
//   2. từng cặp màu chữ/nền đạt WCAG AA ở CẢ HAI chế độ
//   3. kho thoại data/voice.json: json hợp lệ, đủ trường, đủ số lượng câu và kaomoji,
//      không trùng câu, biến {…} hợp lệ, không từ cấm, tối đa 1 từ lóng, không chữ hoa,
//      độ dài, tối đa 1 dấu chấm than, không kéo dài chữ quá 3 ký tự, tỉ lệ giọng 45/25/30,
//      tối đa 15% câu lấy nguyên văn từ câu mẫu trong spec
//   4. kho mẹo data/tips.json: đủ 40 mẹo, không trùng, viết thường, không từ cấm

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VARIABLES, FREQUENT_GROUPS, GREETING_GROUPS, MIN_LINES_FREQUENT, MIN_LINES_GREETING, MIN_LINES, MIN_KAOMOJI, RECENT_LIMIT,
  TONES, TONE_TARGET, WHEN_KEYS, lineProblems, variablesIn, bannedFound, normalize,
} from '../js/voice-core.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const notes = [];

// ---------- 1. mã màu ngoài themes.css ----------
const THEMES_FILE = 'css/themes.css';
const SCAN_DIRS = ['css', 'js', 'data'];
const SCAN_FILES = ['index.html'];
const SCAN_EXT = new Set(['.css', '.js', '.html', '.json', '.svg']);

function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === 'source') continue; // excel gốc, không phải code
      out.push(...walk(p));
    } else if (SCAN_EXT.has(extname(name))) {
      out.push(p);
    }
  }
  return out;
}

const HEX_RE = /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g;
const FN_RE = /\b(?:rgba?|hsla?)\s*\(/g;

const files = [
  ...SCAN_FILES.map((f) => join(root, f)),
  ...SCAN_DIRS.flatMap((d) => walk(join(root, d))),
];

for (const file of files) {
  const rel = relative(root, file).split('\\').join('/');
  if (rel === THEMES_FILE) continue;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  text.split('\n').forEach((line, i) => {
    const hits = [...line.matchAll(HEX_RE), ...line.matchAll(FN_RE)];
    for (const m of hits) {
      errors.push(`${rel}:${i + 1} có mã màu "${m[0].trim()}" nằm ngoài ${THEMES_FILE}`);
    }
  });
}

// ---------- 2. tương phản WCAG AA ----------
const themesCss = readFileSync(join(root, THEMES_FILE), 'utf8');

function readThemeBlock(selectorPattern) {
  const re = new RegExp(`${selectorPattern}[^{]*\\{([^}]*)\\}`);
  const m = themesCss.match(re);
  if (!m) return null;
  const vars = {};
  for (const decl of m[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    vars[decl[1]] = decl[2].trim();
  }
  return vars;
}

function parseColor(value) {
  if (!value) return null;
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const fn = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i);
  if (fn) return { r: +fn[1], g: +fn[2], b: +fn[3], a: fn[4] === undefined ? 1 : +fn[4] };
  return null;
}

// màu có alpha thì trộn lên nền bên dưới
function flatten(color, under) {
  if (color.a >= 1 || !under) return color;
  const mix = (c, u) => Math.round(c * color.a + u * (1 - color.a));
  return { r: mix(color.r, under.r), g: mix(color.g, under.g), b: mix(color.b, under.b), a: 1 };
}

function luminance({ r, g, b }) {
  const lin = (v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [màu chữ, màu nền, mức tối thiểu]. 4.5 = chữ thường AA, 3 = viền/thành phần giao diện
const PAIRS = [
  ['--text', '--bg', 4.5],
  ['--text', '--surface', 4.5],
  ['--text', '--surface-2', 4.5],
  ['--text', '--surface-tint', 4.5],
  ['--text-muted', '--bg', 4.5],
  ['--text-muted', '--surface', 4.5],
  ['--text-muted', '--surface-2', 4.5],
  ['--text-muted', '--surface-tint', 4.5],
  ['--accent-ink', '--bg', 4.5],
  ['--accent-ink', '--surface', 4.5],
  ['--accent-ink', '--surface-2', 4.5],
  ['--accent-ink', '--surface-tint', 4.5],
  ['--on-primary', '--primary', 4.5],
  ['--on-primary', '--primary-hover', 4.5],
  ['--tab-ink', '--tabbar-bg', 4.5],
  ['--tab-active-ink', '--tab-active-bg', 4.5],
  ['--bubble-ink', '--bubble-bg', 4.5],
  ['--ok', '--bg', 4.5],
  ['--ok', '--surface', 4.5],
  ['--ok', '--ok-soft', 4.5],
  ['--bad', '--bg', 4.5],
  ['--bad', '--surface', 4.5],
  ['--bad', '--bad-soft', 4.5],
  ['--focus', '--bg', 3],
  ['--focus', '--surface', 3],
  ['--focus', '--surface-tint', 3],
];

for (const [name, selector] of [['sáng', '\\[data-theme="light"\\]'], ['tối', '\\[data-theme="dark"\\]']]) {
  const vars = readThemeBlock(selector);
  if (!vars) { errors.push(`${THEMES_FILE}: không tìm thấy khối chế độ ${name}`); continue; }
  const base = parseColor(vars['--bg']);
  let worst = Infinity;
  for (const [fgVar, bgVar, min] of PAIRS) {
    const bgRaw = parseColor(vars[bgVar]);
    const fgRaw = parseColor(vars[fgVar]);
    if (!bgRaw || !fgRaw) { errors.push(`chế độ ${name}: thiếu hoặc không đọc được ${fgVar} / ${bgVar}`); continue; }
    // nền có alpha thì trộn lên --surface (nền thẻ) — trường hợp xấu nhất là trộn lên --bg
    const bg = flatten(bgRaw, bgVar === '--tabbar-bg' ? base : flatten(parseColor(vars['--surface']), base));
    const fg = flatten(fgRaw, bg);
    const ratio = contrast(fg, bg);
    worst = Math.min(worst, ratio);
    if (ratio < min) errors.push(`chế độ ${name}: ${fgVar} trên ${bgVar} = ${ratio.toFixed(2)}:1, cần ≥ ${min}:1`);
  }
  notes.push(`chế độ ${name}: ${PAIRS.length} cặp màu, thấp nhất ${worst.toFixed(2)}:1`);
}

// ---------- 3. kho thoại ----------
function readJson(rel) {
  try {
    return JSON.parse(readFileSync(join(root, rel), 'utf8'));
  } catch (err) {
    errors.push(`${rel}: json không hợp lệ hoặc không đọc được (${err.message})`);
    return null;
  }
}

const cleanForCompare = (s) => normalize(s).replace(/[.?!…\s]+$/u, '').trim();

function specSamples() {
  try {
    const spec = readFileSync(join(root, 'docs/spec.md'), 'utf8');
    return new Set([...spec.matchAll(/^- "(.+)"\s*$/gm)].map((m) => cleanForCompare(m[1])));
  } catch {
    return new Set();
  }
}

const voice = readJson('data/voice.json');
if (voice) {
  const groups = Object.entries(voice).filter(([key]) => !key.startsWith('_'));
  const allTexts = new Map();
  const toneCount = Object.fromEntries(TONES.map((t) => [t, 0]));
  const samples = specSamples();
  let total = 0;
  let verbatim = 0;
  let kaoTotal = 0;

  for (const [id, g] of groups) {
    const where = `voice.json › ${id}`;
    if (!/^[a-z0-9_]+$/.test(id)) errors.push(`${where}: tên nhóm phải là snake_case viết thường`);
    if (!g.label || g.label !== g.label.toLowerCase()) errors.push(`${where}: thiếu "label" viết thường`);
    if (g.density !== undefined && !(g.density > 0 && g.density <= 1)) errors.push(`${where}: "density" phải trong (0, 1]`);
    for (const key of Object.keys(g.conditions || {})) {
      if (!WHEN_KEYS.includes(key)) errors.push(`${where}: điều kiện lạ "${key}"`);
    }

    const kao = Array.isArray(g.kaomoji) ? g.kaomoji : [];
    kaoTotal += kao.length;
    if (kao.length < MIN_KAOMOJI) errors.push(`${where}: có ${kao.length} kaomoji, cần ít nhất ${MIN_KAOMOJI}`);
    if (new Set(kao).size !== kao.length) errors.push(`${where}: kaomoji bị trùng trong nhóm`);
    for (const k of kao) {
      if (typeof k !== 'string' || !k.trim() || k !== k.trim()) errors.push(`${where}: kaomoji rỗng hoặc thừa khoảng trắng "${k}"`);
    }

    const lines = Array.isArray(g.lines) ? g.lines : [];
    const min = FREQUENT_GROUPS.includes(id) ? MIN_LINES_FREQUENT : GREETING_GROUPS.includes(id) ? MIN_LINES_GREETING : MIN_LINES;
    if (lines.length < min) errors.push(`${where}: có ${lines.length} câu, cần ít nhất ${min}`);
    if (FREQUENT_GROUPS.includes(id) || GREETING_GROUPS.includes(id)) {
      const plain = lines.filter((l) => !variablesIn(l.text || '').length && !l.when).length;
      if (plain <= RECENT_LIMIT) errors.push(`${where}: chỉ ${plain} câu không cần biến/điều kiện, cần > ${RECENT_LIMIT} để chống lặp khi chưa có dữ liệu`);
    }

    const kinds = g.kinds || null;
    const perKind = {};
    lines.forEach((line, i) => {
      const at = `${where} › câu ${i + 1}`;
      if (!line || typeof line.text !== 'string') { errors.push(`${at}: thiếu "text"`); return; }
      if (!TONES.includes(line.tone)) errors.push(`${at}: "tone" phải là ${TONES.join(' / ')}`);
      if (!(line.cringe === 1 || line.cringe === 2)) errors.push(`${at}: "cringe" phải là 1 hoặc 2 (câu ≥ 3 bị loại)`);
      if (line.join && !['opener', 'tail', 'both'].includes(line.join)) errors.push(`${at}: "join" phải là opener / tail / both`);
      for (const key of Object.keys(line.when || {})) {
        if (!WHEN_KEYS.includes(key)) errors.push(`${at}: điều kiện lạ "${key}"`);
      }
      const k = line.when?.kind;
      if (k !== undefined) {
        for (const one of [].concat(k)) {
          if (!kinds || !kinds.includes(one)) errors.push(`${at}: kind "${one}" không có trong "kinds" của nhóm`);
          perKind[one] = (perKind[one] || 0) + 1;
        }
      }
      for (const problem of lineProblems(line.text, line.tone)) errors.push(`${at} "${line.text}": ${problem}`);
      const key = cleanForCompare(line.text);
      if (allTexts.has(key)) errors.push(`${at}: trùng câu với ${allTexts.get(key)} "${line.text}"`);
      else allTexts.set(key, `${id} › câu ${i + 1}`);
      if (TONES.includes(line.tone)) toneCount[line.tone] += 1;
      if (samples.has(key)) verbatim += 1;
      total += 1;
    });
    if (kinds) {
      for (const one of kinds) {
        if ((perKind[one] || 0) < 2) errors.push(`${where}: kind "${one}" có ${perKind[one] || 0} câu, cần ít nhất 2`);
      }
    }
  }

  const greetTotal = GREETING_GROUPS.reduce((sum, gid) => sum + (voice[gid]?.lines?.length || 0), 0);
  if (greetTotal < MIN_LINES_FREQUENT) errors.push(`voice.json: 3 nhóm chào có tổng ${greetTotal} câu, cần ít nhất ${MIN_LINES_FREQUENT}`);
  for (const gid of [...FREQUENT_GROUPS, ...GREETING_GROUPS]) {
    if (!voice[gid]) errors.push(`voice.json: thiếu nhóm bắt buộc "${gid}"`);
  }

  // mảnh ghép
  const frags = voice._fragments || {};
  for (const type of ['openers', 'tails']) {
    const list = frags[type] || [];
    if (list.length < 6) errors.push(`voice.json › _fragments.${type}: cần ít nhất 6 mảnh, đang có ${list.length}`);
    list.forEach((f, i) => {
      const at = `voice.json › _fragments.${type} ${i + 1}`;
      if (!f || typeof f.text !== 'string') { errors.push(`${at}: thiếu "text"`); return; }
      for (const problem of lineProblems(f.text, 'mix')) errors.push(`${at} "${f.text}": ${problem}`);
      for (const gid of f.groups || []) {
        if (!voice[gid]) errors.push(`${at}: nhóm "${gid}" không tồn tại`);
      }
      if (!(f.groups || []).length) errors.push(`${at}: thiếu "groups"`);
    });
  }

  // tỉ lệ giọng: ~45% việt có chút genz, ~25% việt ấm áp, ~30% có tiếng anh (lệch tối đa 7 điểm)
  const ratio = TONES.map((t) => `${t} ${(toneCount[t] / Math.max(total, 1) * 100).toFixed(0)}%`).join(' · ');
  for (const t of TONES) {
    const share = toneCount[t] / Math.max(total, 1);
    if (Math.abs(share - TONE_TARGET[t]) > 0.07) errors.push(`voice.json: tỉ lệ "${t}" là ${(share * 100).toFixed(0)}%, mục tiêu ${TONE_TARGET[t] * 100}% (±7)`);
  }
  const verbatimShare = verbatim / Math.max(total, 1);
  if (verbatimShare > 0.15) errors.push(`voice.json: ${verbatim} câu lấy nguyên văn từ mẫu (${(verbatimShare * 100).toFixed(0)}%), tối đa 15%`);
  notes.push(`kho thoại: ${groups.length} nhóm, ${total} câu, ${kaoTotal} kaomoji · ${ratio} · ${verbatim} câu nguyên văn từ mẫu (${(verbatimShare * 100).toFixed(1)}%)`);
  notes.push(`biến hỗ trợ: ${VARIABLES.map((v) => `{${v}}`).join(' ')}`);
}

// ---------- 4. kho mẹo ielts ----------
const TIP_GROUPS = ['co-ban', 'so-loi', 'ngoai-le'];
const tips = readJson('data/tips.json');
if (tips) {
  const list = Array.isArray(tips.tips) ? tips.tips : [];
  if (list.length < 40) errors.push(`tips.json: có ${list.length} mẹo, cần ít nhất 40`);
  const seenTips = new Set();
  list.forEach((tip, i) => {
    const at = `tips.json › mẹo ${i + 1}`;
    const text = tip?.text;
    if (typeof text !== 'string' || !text.trim()) { errors.push(`${at}: thiếu "text"`); return; }
    if (text !== text.toLowerCase()) errors.push(`${at}: có chữ hoa`);
    if (text.length > 170) errors.push(`${at}: dài ${text.length} ký tự (tối đa 170)`);
    const banned = bannedFound(text);
    if (banned.length) errors.push(`${at}: từ cấm ${banned.join(', ')}`);
    if (tip.group && !TIP_GROUPS.includes(tip.group)) errors.push(`${at}: group "${tip.group}" phải là ${TIP_GROUPS.join(' / ')}`);
    if (tip.code !== undefined && !/^(l\d{1,2}|dong-tu|cum-tu|khung-cau|cach-hoc)$/.test(tip.code)) errors.push(`${at}: code lạ "${tip.code}"`);
    const key = cleanForCompare(text);
    if (seenTips.has(key)) errors.push(`${at}: trùng mẹo`);
    seenTips.add(key);
  });
  const byGroup = TIP_GROUPS.map((g) => `${g} ${list.filter((t) => t.group === g).length}`).join(' · ');
  notes.push(`kho mẹo: ${list.length} mẹo (${byGroup})`);
}

// ---------- kết quả ----------
for (const n of notes) console.log(`· ${n}`);
console.log(`· đã quét ${files.length} file tìm mã màu`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ hợp lệ');
