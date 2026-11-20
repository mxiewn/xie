// xie · levels.js
// 9 cấp của thỏ (spec mục 13) và trang phục mở khoá theo từng cấp (tủ đồ của thỏ).
// phụ kiện đi đúng thứ tự spec: nơ → ngọc trai → ren → hoa → vương miện nhỏ
// → vương miện lớn → áo choàng tuyết → vầng trăng sau lưng.
//
// cấp hiện tại: chưa có xp (phần game hoá làm ở giai đoạn 4), nên tạm luôn là cấp 1.
// tới lúc đó chỉ cần sửa currentLevel() là tủ đồ tự mở khoá theo.

import { readRaw, writeRaw } from './storage.js';

export const LEVELS = [
  { level: 1, name: 'bé thỏ con' },
  { level: 2, name: 'thỏ nơ hồng' },
  { level: 3, name: 'thỏ ngọc trai' },
  { level: 4, name: 'thỏ ren trắng' },
  { level: 5, name: 'thỏ hoa anh đào' },
  { level: 6, name: 'thỏ công chúa' },
  { level: 7, name: 'thỏ hoàng gia' },
  { level: 8, name: 'thỏ nữ hoàng tuyết' },
  { level: 9, name: 'thỏ cung trăng' },
];

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

export function currentLevel() {
  return 1;
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
