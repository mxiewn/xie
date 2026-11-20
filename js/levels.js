// xie · levels.js
// 9 cấp của thỏ (spec mục 13) và trang phục mở khoá theo từng cấp (tủ đồ của thỏ).
// phụ kiện đi đúng thứ tự spec: nơ → ngọc trai → ren → hoa → vương miện nhỏ
// → vương miện lớn → áo choàng tuyết → vầng trăng sau lưng.
//
// cấp tính từ xp, đi lần lượt từng bậc. hai bậc cuối cần thêm số từ trong kho output
// (và cung trăng cần kỷ lục chuỗi ≥ 60 ngày). xp ước chừng 150–250 mỗi ngày đủ mục tiêu,
// nên cung trăng rơi vào khoảng 4 tháng học đều.
// levelFor / levelProgress là hàm thuần (có test). cấp hiện tại do js/progress.js cung cấp
// qua setLevelProvider (tránh import vòng).

import { readRaw, writeRaw } from './storage.js';

export const LEVELS = [
  { level: 1, name: 'bé thỏ con', xp: 0 },
  { level: 2, name: 'thỏ nơ hồng', xp: 200 },
  { level: 3, name: 'thỏ ngọc trai', xp: 700 },
  { level: 4, name: 'thỏ ren trắng', xp: 1800 },
  { level: 5, name: 'thỏ hoa anh đào', xp: 3500 },
  { level: 6, name: 'thỏ công chúa', xp: 6000 },
  { level: 7, name: 'thỏ hoàng gia', xp: 9500 },
  { level: 8, name: 'thỏ nữ hoàng tuyết', xp: 14000, output_words: 300 },
  { level: 9, name: 'thỏ cung trăng', xp: 20000, output_words: 500, longest_streak: 60 },
];

export const MAX_LEVEL = LEVELS.length;

function requirements(l, { xp = 0, outputWords = 0, longestStreak = 0 } = {}) {
  const list = [{ id: 'xp', label: 'xp', have: xp, need: l.xp }];
  if (l.output_words) list.push({ id: 'output_words', label: 'từ trong kho output', have: outputWords, need: l.output_words });
  if (l.longest_streak) list.push({ id: 'longest_streak', label: 'ngày kỷ lục chuỗi', have: longestStreak, need: l.longest_streak });
  return list;
}

// cấp theo thành tích: { xp, outputWords, longestStreak }. phải qua từng bậc theo thứ tự
export function levelFor(stats = {}) {
  let level = 1;
  for (const l of LEVELS) {
    if (requirements(l, stats).every((r) => r.have >= r.need)) level = l.level;
    else break;
  }
  return level;
}

// tiến độ lên cấp kế: { level, next, ratio, missing: [{ label, have, need }] }
export function levelProgress(stats = {}) {
  const level = levelFor(stats);
  const cur = LEVELS[level - 1];
  const next = LEVELS[level] || null;
  if (!next) return { level, name: cur.name, next: null, ratio: 1, xpInto: 0, xpNeed: 0, missing: [] };
  const xp = stats.xp || 0;
  const xpNeed = next.xp - cur.xp;
  const xpInto = Math.max(0, Math.min(xpNeed, xp - cur.xp));
  const missing = requirements(next, stats).filter((r) => r.have < r.need);
  return { level, name: cur.name, next, ratio: xpNeed ? xpInto / xpNeed : 1, xpInto, xpNeed, missing };
}

export const SKINS = [
  { id: 'basic', level: 1, name: 'nơ cổ hồng', desc: 'chiếc nơ satin quen thuộc ở cổ' },
  { id: 'ear-bows', level: 2, name: 'nơ cài tai', desc: 'thêm hai nơ nhỏ buộc ở tai' },
  { id: 'pearls', level: 3, name: 'chuỗi ngọc trai', desc: 'chuỗi ngọc dài có một hạt ngọc rơi' },
  { id: 'lace', level: 4, name: 'cổ áo ren', desc: 'cổ ren trắng viền vỏ sò' },
  { id: 'sakura', level: 5, name: 'vòng hoa anh đào', desc: 'vòng hoa anh đào đội đầu' },
  { id: 'tiara', level: 6, name: 'vương miện nhỏ', desc: 'tiara ngọc trai của công chúa' },
  { id: 'royal', level: 7, name: 'vương miện lớn', desc: 'vương miện năm cánh gắn đá' },
  { id: 'snow', level: 8, name: 'áo choàng tuyết', desc: 'áo choàng băng, cổ lông, kẹp bông tuyết' },
  { id: 'moon', level: 9, name: 'vầng trăng sau lưng', desc: 'trăng lưỡi liềm sau lưng, kẹp sao trên đầu' },
];

const SKIN_KEY = 'skin';
let memorySkin = null; // localStorage bị chặn thì nhớ trong phiên

export function levelInfo(level) {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

export function skinInfo(id) {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}

let levelProvider = () => 1;

// js/progress.js gọi hàm này lúc khởi động để cấp đi theo xp thật
export function setLevelProvider(fn) {
  if (typeof fn === 'function') levelProvider = fn;
}

export function currentLevel() {
  const level = Number(levelProvider());
  return Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL ? level : 1;
}

export function isSkinUnlocked(id, level = currentLevel()) {
  const skin = SKINS.find((s) => s.id === id);
  return Boolean(skin) && skin.level <= level;
}

export function getEquippedSkin() {
  const id = readRaw(SKIN_KEY) ?? memorySkin;
  return isSkinUnlocked(id) ? id : 'basic';
}

export function equipSkin(id) {
  if (!isSkinUnlocked(id)) return false;
  memorySkin = id;
  writeRaw(SKIN_KEY, id);
  return true;
}
