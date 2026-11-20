// xie · storage.js
// mọi truy cập localStorage đều bọc try/catch (tab ẩn danh, bị chặn, đầy bộ nhớ…).
// giai đoạn 1 chỉ cần đọc/ghi chuỗi. giai đoạn 3 thêm state đầy đủ + số version schema + nâng cấp.

const PREFIX = 'xie:';

export function readRaw(key) {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function storageKey(key) {
  return PREFIX + key;
}
