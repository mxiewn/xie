#!/usr/bin/env node
// xie · tools/validate.js
// chạy: node tools/validate.js
// giai đoạn 1 kiểm tra:
//   1. mã màu (#hex, rgb, hsl) chỉ được nằm trong css/themes.css
//   2. từng cặp màu chữ/nền đạt WCAG AA ở CẢ HAI chế độ
// các giai đoạn sau sẽ thêm: json, thoại, kaomoji, lowercase…

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// ---------- kết quả ----------
for (const n of notes) console.log(`· ${n}`);
console.log(`· đã quét ${files.length} file tìm mã màu`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} lỗi:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ hợp lệ');
