// xie · voice-core.js
// lõi giọng nói của thỏ: chọn câu thoại, ghép mảnh, chống lặp, kiểm tra luật viết.
// thuần javascript, không đụng dom hay localStorage, nên dùng chung được cho
// trình duyệt (js/voice.js), tools/validate.js và tests/voice.test.js.

export const VARIABLES = ['name', 'streak', 'n', 'left', 'word', 'days', 'level', 'minutes', 'goal'];

// nhóm hay hiện (đúng, sai, chạm thỏ, nhắc học): ít nhất 40 câu.
// "chào" chia 3 nhóm theo giờ: cộng lại ít nhất 40 câu, mỗi nhóm ít nhất 20.
// nhóm còn lại: ít nhất 16 câu (spec ghi 15; cần 16 để thật sự không lặp 15 câu gần nhất)
export const FREQUENT_GROUPS = ['dung', 'sai', 'cham_tho', 'nhac_hoc'];
export const GREETING_GROUPS = ['chao_sang', 'chao_trua_chieu', 'chao_toi_khuya'];
export const MIN_LINES_FREQUENT = 40;
export const MIN_LINES_GREETING = 20;
export const MIN_LINES = 16;
export const MIN_KAOMOJI = 20;

export const RECENT_LIMIT = 15; // không hiện lại 15 câu gần nhất của mỗi nhóm
export const FRESH_MS = 7 * 24 * 60 * 60 * 1000; // ưu tiên câu chưa hiện trong 7 ngày
export const KAO_RECENT = 3; // không lặp 3 kaomoji gần nhất
export const TONES = ['genz', 'warm', 'en'];
export const TONE_TARGET = { genz: 0.45, warm: 0.25, en: 0.3 };
export const WHEN_KEYS = ['hour', 'streak', 'n', 'left', 'days', 'minutes', 'goal', 'accuracy', 'kind'];
export const TALK_FACTOR = { nhieu: 1.7, vua: 1, it: 0.5 };

const OPENER_CHANCE = 0.22;
const TAIL_CHANCE = 0.2;

// từ lóng tính vào luật "tối đa 1 từ lóng mỗi câu"
export const SLANG = [
  'khét', 'xịn', 'chuẩn bài', 'out trình', 'ăn trọn', 'gét gô', 'keo', 'khum', 'hông', 'xỉu', 'ủa alo',
  'chill', 'flex', 'real', 'mood', 'green flag', 'ổn áp', 'slay', 'bestie',
  'no cap', 'cook', 'cooking', 'ate', 'era', 'lowkey', 'w',
];

// từ và cụm bị cấm ở bất kỳ đâu (spec mục 4)
export const BANNED = [
  'lầy', 'lầy lội', 'lười', 'kém', 'tệ', 'dở', 'ngu',
  'skibidi', 'rizz', 'sigma', 'gyatt', 'ohio', 'aura', 'đỉnh nóc', 'kịch trần', 'bay phấp phới',
  'chằm zn', 'trẻ trâu', 'keo lì tái châu', 'hết nước chấm',
  'iu iu', 'cục cưng', 'dạ dạ', 'gen z tụi mình',
  'chúc mừng bạn đã hoàn thành nhiệm vụ', 'thành công đến từ nỗ lực',
  'the comeback is stronger than the setback', 'believe in yourself',
  'người khác', 'hơn mọi người',
];

// từ tiếng anh rất hay gặp: dùng để nhận ra câu có tiếng anh
const EN_MARKERS = new Set([
  'the', 'you', 'your', "you're", 'i', "i'm", "i'll", "i've", 'me', 'my', 'is', 'it', "it's", 'this', 'that', "that's",
  'and', 'of', 'in', 'we', "we're", "let's", 'just', 'are', 'was', 'what', 'who', 'how', 'got', 'get', 'now', 'more',
  'with', 'for', 'again', 'today', 'rn', 'ngl', 'lil', 'be', 'yes', 'nah', 'can', 'will', "don't", "can't", 'here', 'there',
]);

const LETTERS = /[\p{L}\p{M}']+/gu;

export function normalize(text) {
  return String(text ?? '').normalize('NFC').toLowerCase();
}

function stripVars(text) {
  return normalize(text).replace(/\{[a-z]+\}/g, ' ');
}

function phraseCount(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const re = new RegExp(`(^|[^\\p{L}\\p{M}])${escaped}(?=$|[^\\p{L}\\p{M}])`, 'gu');
  return (stripVars(text).match(re) || []).length;
}

export function slangCount(text) {
  return SLANG.reduce((sum, s) => sum + phraseCount(text, s), 0);
}

export function bannedFound(text) {
  return BANNED.filter((b) => phraseCount(text, b) > 0);
}

export function englishMarkers(text) {
  return (stripVars(text).match(LETTERS) || []).filter((w) => EN_MARKERS.has(w)).length;
}

export function wordCount(text) {
  return normalize(text)
    .replace(/\{[a-z]+\}/g, 'x')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export function variablesIn(text) {
  return [...String(text).matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
}

const EMOJI = /\p{Extended_Pictographic}/gu;

// kiểm tra một câu theo luật viết của spec. trả về danh sách lỗi (rỗng = đạt)
export function lineProblems(text, tone) {
  const problems = [];
  const t = String(text);
  if (!t.trim()) return ['câu rỗng'];
  if (t !== t.toLowerCase()) problems.push('có chữ hoa');
  for (const v of variablesIn(t)) {
    if (!VARIABLES.includes(v)) problems.push(`biến lạ {${v}}`);
  }
  const banned = bannedFound(t);
  if (banned.length) problems.push(`từ cấm: ${banned.join(', ')}`);
  if (slangCount(t) > 1) problems.push('quá 1 từ lóng');
  if ((t.match(/!/g) || []).length > 1) problems.push('quá 1 dấu chấm than');
  if (/(\p{L})\1{3,}/u.test(normalize(t))) problems.push('kéo dài chữ quá 3 ký tự');
  if ((t.match(EMOJI) || []).length > 1) problems.push('quá 1 emoji');
  if (/(haha|hihi|kkk)[\s.!?…]*$/u.test(normalize(t))) problems.push('kết bằng haha/hihi/kkk');
  const limit = tone === 'en' ? 12 : 14;
  const words = wordCount(t);
  if (words > limit) problems.push(`dài ${words} từ (tối đa ${limit})`);
  if (tone === 'en' && englishMarkers(t) === 0) problems.push('gắn nhãn en nhưng không thấy tiếng anh');
  if ((tone === 'genz' || tone === 'warm') && englishMarkers(t) > 0) problems.push('có tiếng anh nhưng không gắn nhãn en');
  if (tone === 'warm' && slangCount(t) > 0) problems.push('nhãn warm nhưng có từ lóng');
  return problems;
}

// ---------- điều kiện ----------
function inRange(value, range) {
  if (typeof value !== 'number' || Number.isNaN(value)) return false;
  const [min, max] = range;
  if (min !== null && min !== undefined && value < min) return false;
  if (max !== null && max !== undefined && value > max) return false;
  return true;
}

export function matchesWhen(when, ctx = {}) {
  if (!when) return true;
  return Object.entries(when).every(([key, rule]) => {
    if (key === 'kind') return Array.isArray(rule) ? rule.includes(ctx.kind) : rule === ctx.kind;
    if (key === 'hour') {
      const h = ctx.hour;
      if (typeof h !== 'number') return false;
      const [from, to] = rule;
      return from <= to ? h >= from && h < to : h >= from || h < to;
    }
    return inRange(ctx[key], rule);
  });
}

function hasVar(ctx, name) {
  const v = ctx[name];
  return v !== undefined && v !== null && v !== '';
}

export function varsAvailable(text, ctx = {}) {
  return variablesIn(text).every((v) => hasVar(ctx, v));
}

export function fill(text, ctx = {}) {
  return String(text).replace(/\{([a-z]+)\}/g, (_, v) => {
    const value = ctx[v];
    return v === 'name' ? String(value).toLowerCase() : String(value);
  });
}

// ---------- chống lặp ----------
export function lineId(groupId, text) {
  let h = 5381;
  const s = `${groupId}|${text}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function emptyHistory() {
  return { v: 1, recent: {}, seen: {}, kao: {}, frag: {} };
}

function pickRandom(list, rand) {
  return list[Math.floor(rand() * list.length) % list.length];
}

export function talkChance(density = 1, talk = 'vua') {
  if (density >= 1) return 1; // sự kiện lớn: luôn có thoại
  return Math.min(1, density * (TALK_FACTOR[talk] ?? 1));
}

function pickKao(group, groupId, history, rand) {
  const list = group.kaomoji || [];
  if (!list.length) return '';
  const recent = history.kao[groupId] || [];
  const pool = list.filter((k) => !recent.includes(k));
  const kao = pickRandom(pool.length ? pool : list, rand);
  history.kao[groupId] = [...recent, kao].slice(-KAO_RECENT);
  return kao;
}

function withPeriod(text) {
  return /[.?!…]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

function assembledOk(text, tone) {
  return lineProblems(text, tone).length === 0;
}

function chooseFragment(list, groupId, ctx, lastUsed, rand) {
  const pool = (list || []).filter((f) => (f.groups || []).includes(groupId) && varsAvailable(f.text, ctx) && f.text !== lastUsed);
  return pool.length ? pickRandom(pool, rand) : null;
}

// ghép [mở đầu tuỳ chọn] + [thân câu] + [đuôi tiếng anh tuỳ chọn]. chỉ ghép khi câu cho phép và vẫn đạt luật
function compose(data, groupId, line, ctx, history, rand) {
  let text = line.text;
  const join = line.join || '';
  const frags = data._fragments || {};
  if ((join === 'opener' || join === 'both') && rand() < OPENER_CHANCE) {
    const op = chooseFragment(frags.openers, groupId, ctx, history.frag.opener, rand);
    if (op) {
      const candidate = `${op.text} ${text}`;
      if (assembledOk(candidate, line.tone)) {
        text = candidate;
        history.frag.opener = op.text;
      }
    }
  }
  if ((join === 'tail' || join === 'both') && rand() < TAIL_CHANCE) {
    const tail = chooseFragment(frags.tails, groupId, ctx, history.frag.tail, rand);
    if (tail) {
      const candidate = `${withPeriod(text)} ${tail.text}`;
      if (assembledOk(candidate, line.tone === 'en' ? 'en' : 'mix')) {
        text = candidate;
        history.frag.tail = tail.text;
      }
    }
  }
  return text;
}

/**
 * chọn một câu thoại cho tình huống.
 * trả về { group, id, text, kao } — text = null nghĩa là lần này chỉ hiện kaomoji (mật độ thoại).
 * trả về null nếu không có nhóm hoặc ngữ cảnh không khớp điều kiện của nhóm.
 */
export function pick(data, groupId, ctx = {}, opts = {}) {
  const { history = emptyHistory(), now = Date.now(), rand = Math.random, talk = 'vua', forceLine = false } = opts;
  const group = data && data[groupId];
  if (!group || groupId.startsWith('_')) return null;
  if (group.conditions && !matchesWhen(group.conditions, ctx)) return null;

  for (const key of ['recent', 'seen', 'kao', 'frag']) history[key] ||= {};
  const kao = pickKao(group, groupId, history, rand);

  if (!forceLine && rand() >= talkChance(group.density ?? 1, talk)) {
    return { group: groupId, id: null, text: null, kao };
  }

  const eligible = (group.lines || []).filter((l) => varsAvailable(l.text, ctx) && matchesWhen(l.when, ctx));
  if (!eligible.length) return { group: groupId, id: null, text: null, kao };

  const recent = history.recent[groupId] || [];
  const seenAt = (l) => history.seen[lineId(groupId, l.text)] ?? 0;
  let pool = eligible.filter((l) => !recent.includes(lineId(groupId, l.text)));
  if (!pool.length) {
    // nhóm nhỏ hơn 15 câu hợp ngữ cảnh: lấy câu lâu chưa hiện nhất
    const oldest = Math.min(...eligible.map(seenAt));
    pool = eligible.filter((l) => seenAt(l) === oldest);
  }
  const fresh = pool.filter((l) => now - seenAt(l) > FRESH_MS);
  let choices = fresh;
  if (!choices.length) {
    const sorted = [...pool].sort((a, b) => seenAt(a) - seenAt(b));
    choices = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3)));
  }
  const line = pickRandom(choices, rand);
  const id = lineId(groupId, line.text);

  history.recent[groupId] = [...recent.filter((r) => r !== id), id].slice(-RECENT_LIMIT);
  history.seen[id] = now;

  const text = fill(compose(data, groupId, line, ctx, history, rand), ctx);
  return { group: groupId, id, text, kao };
}

// dọn lịch sử cũ cho gọn localStorage
export function pruneHistory(history, now = Date.now(), maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
  for (const [id, at] of Object.entries(history.seen || {})) {
    if (now - at > maxAgeMs) delete history.seen[id];
  }
  return history;
}

// nhóm chào theo giờ việt nam
export function greetingGroup(hour) {
  if (hour >= 5 && hour < 11) return 'chao_sang';
  if (hour >= 11 && hour < 18) return 'chao_trua_chieu';
  return 'chao_toi_khuya';
}
