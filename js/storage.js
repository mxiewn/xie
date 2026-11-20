// xie · storage.js
// mọi truy cập localStorage đều bọc try/catch (tab ẩn danh, bị chặn, đầy bộ nhớ…).
// mọi key đều có tiền tố "xie:". state đầy đủ + version schema nằm ở state.js / state-core.js.

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

// toàn bộ dữ liệu của xie: { "xie:…": chuỗi }
export function readAll() {
  const out = {};
  try {
    const ls = window.localStorage;
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (key && key.startsWith(PREFIX)) out[key] = ls.getItem(key);
    }
  } catch {
    /* bị chặn thì trả về rỗng */
  }
  return out;
}

export function writeAll(entries) {
  let ok = true;
  for (const [key, value] of Object.entries(entries)) {
    if (!key.startsWith(PREFIX)) continue;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      ok = false;
    }
  }
  return ok;
}

export function clearAll() {
  try {
    const ls = window.localStorage;
    const keys = [];
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    for (const key of keys) ls.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
