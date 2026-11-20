// xie · state-core.js — dữ liệu người học: schema, nâng cấp version, chuẩn hoá, ngày giờ việt nam.
// thuần javascript, không đụng dom hay localStorage → test được bằng node (tests/state.test.js).
//
// schema v1 (lưu ở localStorage key "xie:state"), key viết snake_case:
// {
//   version: 1, onboarded: bool, created_at: iso, updated_at: iso,
//   profile:  { name, target_band (6.5 | 7), exam_date ("yyyy-mm-dd" | null), daily_goal (50 | 80 | 120 | 200),
//               new_words_per_day (3–20), topics: [id…], weak_skill ("writing" | "speaking" | "grammar" | "vocab" | null) },
//   settings: { font_size ("nho" | "vua" | "lon") },
//   visits:   { first_day, last_day ("yyyy-mm-dd" giờ việt nam), count }
// }
// các key khác giữ riêng: xie:theme, xie:skin, xie:talk, xie:taps, xie:voice.

export const SCHEMA_VERSION = 1;
export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const BANDS = [6.5, 7];
export const DAILY_GOALS = [50, 80, 120, 200];
export const MIN_DAILY_GOAL = 50;
export const WEAK_SKILLS = ['writing', 'speaking', 'grammar', 'vocab'];
export const FONT_SIZES = ['nho', 'vua', 'lon'];
export const NAME_MAX = 24;
export const NEW_WORDS = { min: 3, max: 20, fallback: 8 };
export const MAX_TOPICS = 4;
export const RETURN_GAP_DAYS = 3; // vắng từ 3 ngày trở lên thì thỏ chào "quay lại"

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// ---------- ngày ----------
export function isValidDate(text) {
  const m = DATE_RE.exec(String(text ?? ''));
  if (!m) return false;
  const [y, mo, d] = m.slice(1).map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

// ngày hôm nay theo giờ việt nam, dạng yyyy-mm-dd (không phụ thuộc múi giờ của máy)
export function todayIn(now = new Date(), timeZone = TIME_ZONE) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

export function daysBetween(from, to) {
  if (!isValidDate(from) || !isValidDate(to)) return null;
  const toUtc = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function daysUntilExam(state, today = todayIn()) {
  const exam = state?.profile?.exam_date;
  return exam ? daysBetween(today, exam) : null;
}

// ---------- state mặc định ----------
export function defaultState(now = new Date()) {
  const iso = now.toISOString();
  return {
    version: SCHEMA_VERSION,
    onboarded: false,
    created_at: iso,
    updated_at: iso,
    profile: {
      name: '',
      target_band: 6.5,
      exam_date: null,
      daily_goal: MIN_DAILY_GOAL,
      new_words_per_day: NEW_WORDS.fallback,
      topics: [],
      weak_skill: null,
    },
    settings: { font_size: 'vua' },
    visits: { first_day: null, last_day: null, count: 0 },
  };
}

// ---------- chuẩn hoá: dữ liệu hỏng / sửa tay / bản cũ đều được đưa về giá trị hợp lệ ----------
// tên lưu và hiển thị viết thường (spec: tên người dùng cũng viết thường)
export function cleanName(name) {
  return String(name ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi').slice(0, NAME_MAX);
}

function pickNumber(value, allowed, fallback) {
  const n = Number(value);
  return allowed.includes(n) ? n : fallback;
}

export function normalize(raw, knownTopics = null) {
  const base = defaultState();
  const s = raw && typeof raw === 'object' ? raw : {};
  const p = s.profile && typeof s.profile === 'object' ? s.profile : {};
  const set = s.settings && typeof s.settings === 'object' ? s.settings : {};
  const v = s.visits && typeof s.visits === 'object' ? s.visits : {};

  const goal = Number(p.daily_goal);
  const words = Math.round(Number(p.new_words_per_day));
  let topics = Array.isArray(p.topics) ? [...new Set(p.topics.filter((t) => typeof t === 'string'))] : [];
  if (knownTopics) topics = topics.filter((t) => knownTopics.includes(t));

  return {
    version: SCHEMA_VERSION,
    onboarded: Boolean(s.onboarded),
    created_at: typeof s.created_at === 'string' ? s.created_at : base.created_at,
    updated_at: typeof s.updated_at === 'string' ? s.updated_at : base.updated_at,
    profile: {
      name: cleanName(p.name),
      target_band: pickNumber(p.target_band, BANDS, 6.5),
      exam_date: isValidDate(p.exam_date) ? p.exam_date : null,
      // không cho dưới 50; số lạ thì về mức gần nhất trong danh sách
      daily_goal: DAILY_GOALS.includes(goal)
        ? goal
        : Number.isFinite(goal) && goal > MIN_DAILY_GOAL
          ? DAILY_GOALS.reduce((best, g) => (Math.abs(g - goal) < Math.abs(best - goal) ? g : best), MIN_DAILY_GOAL)
          : MIN_DAILY_GOAL,
      new_words_per_day: Number.isFinite(words) && words > 0
        ? Math.min(NEW_WORDS.max, Math.max(NEW_WORDS.min, words))
        : NEW_WORDS.fallback,
      topics: topics.slice(0, MAX_TOPICS),
      weak_skill: WEAK_SKILLS.includes(p.weak_skill) ? p.weak_skill : null,
    },
    settings: {
      font_size: FONT_SIZES.includes(set.font_size) ? set.font_size : 'vua',
    },
    visits: {
      first_day: isValidDate(v.first_day) ? v.first_day : null,
      last_day: isValidDate(v.last_day) ? v.last_day : null,
      count: Number.isInteger(v.count) && v.count > 0 ? v.count : 0,
    },
  };
}

// ---------- nâng cấp version ----------
// mỗi bước nhận state ở version n, trả về state ở version n + 1.
// bản "0" là dữ liệu chưa có số version (key kiểu camelCase, để phẳng): chuyển sang schema v1.
const MIGRATIONS = {
  0: (s) => ({
    version: 1,
    onboarded: s.onboarded ?? Boolean(s.name),
    created_at: s.created_at ?? s.createdAt,
    profile: {
      name: s.profile?.name ?? s.name,
      target_band: s.profile?.target_band ?? s.targetBand ?? s.band,
      exam_date: s.profile?.exam_date ?? s.examDate,
      daily_goal: s.profile?.daily_goal ?? s.dailyGoal ?? s.goal,
      new_words_per_day: s.profile?.new_words_per_day ?? s.newWordsPerDay,
      topics: s.profile?.topics ?? s.topics,
      weak_skill: s.profile?.weak_skill ?? s.weakSkill,
    },
    settings: { font_size: s.settings?.font_size ?? s.fontSize },
    visits: s.visits,
  }),
};

export function migrate(raw, knownTopics = null) {
  if (!raw || typeof raw !== 'object') return normalize(null, knownTopics);
  let s = raw;
  let v = Number.isInteger(s.version) && s.version >= 0 ? s.version : 0;
  // dữ liệu từ bản mới hơn (vd. nhập file của bản sau): giữ những gì đọc được
  if (v > SCHEMA_VERSION) return normalize(s, knownTopics);
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) return normalize(s, knownTopics);
    s = step(s);
    v += 1;
  }
  return normalize(s, knownTopics);
}

// ghi nhận một lần mở web trong ngày. trả về { state, gap } — gap = số ngày kể từ lần trước (null nếu lần đầu)
export function recordVisit(state, today = todayIn()) {
  const visits = { ...state.visits };
  const gap = visits.last_day ? daysBetween(visits.last_day, today) : null;
  if (visits.last_day !== today) {
    visits.count += 1;
    visits.last_day = today;
  }
  visits.first_day ||= today;
  return { state: { ...state, visits }, gap };
}

// ---------- xuất / nhập ----------
export const EXPORT_APP = 'xie';

export function buildExport(entries, now = new Date()) {
  return { app: EXPORT_APP, schema: SCHEMA_VERSION, exported_at: now.toISOString(), data: entries };
}

// kiểm tra file nhập. trả về { ok: true, entries } hoặc { ok: false, error } (thông báo viết thường)
export function parseImport(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    return { ok: false, error: 'file không phải json hợp lệ' };
  }
  if (!obj || obj.app !== EXPORT_APP || typeof obj.data !== 'object' || obj.data === null) {
    return { ok: false, error: 'file này không phải dữ liệu xuất từ xie' };
  }
  const entries = {};
  for (const [key, value] of Object.entries(obj.data)) {
    if (!key.startsWith('xie:') || typeof value !== 'string') continue;
    entries[key] = value;
  }
  if (!Object.keys(entries).length) return { ok: false, error: 'file không có dữ liệu nào để nhập' };
  if (entries['xie:state']) {
    try {
      entries['xie:state'] = JSON.stringify(migrate(JSON.parse(entries['xie:state'])));
    } catch {
      return { ok: false, error: 'phần hồ sơ trong file bị hỏng' };
    }
  }
  return { ok: true, entries };
}
