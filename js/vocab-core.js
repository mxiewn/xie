// xie · vocab-core.js — lõi từ vựng: chuẩn hoá mục từ, chấm câu gõ, sinh câu hỏi 4 mức,
// chọn từ mới theo tỉ lệ nguồn, từ của ngày, prompt "nhờ claude chấm".
// thuần javascript, test ở tests/vocab.test.js.
//
// schema chung (data/vocab/*.json, spec "nguồn từ vựng"):
//   id, source ("excel" | "xie" | "mine"), track ("daily" | "academic"), topic, subgroup,
//   type ("phrase" | "word"), phrase, alternatives[], meaning_vi, examples[], use_for ("speaking" | "writing" | "both"),
//   note, level (B1/B2/C1 hoặc ""), speaking_questions[]
//   type "word" có thêm: ipa, pos, word_family {noun, verb, adjective, adverb, negative}, prepositions[{pattern, example}],
//   collocations {verb: [], adj: [], noun: []}, register, common_mistakes_vi[{wrong, right, why}],
//   synonyms[{word, note}], antonyms[], band_booster
//   trường nào không chắc thì để rỗng — KHÔNG BỊA.

export const SOURCES = ['excel', 'xie', 'mine'];
export const TRACKS = ['daily', 'academic'];
export const USE_FOR = ['speaking', 'writing', 'both'];
export const TYPES = ['phrase', 'word'];
export const SOURCE_LABELS = { excel: 'sổ của tui', xie: 'xie gợi ý thêm', mine: 'từ của tui' };
export const TRACK_LABELS = { daily: 'daily (speaking)', academic: 'academic (writing)' };

// tỉ lệ từ mới mặc định: 50% sổ của tui, 25% daily, 25% academic (spec)
export const RATIO_PRESETS = {
  can_bang: { label: 'cân bằng', desc: '50% sổ của tui · 25% daily · 25% academic', ratio: { excel: 0.5, daily: 0.25, academic: 0.25 } },
  so_cua_tui: { label: 'nghiêng sổ của tui', desc: '70% sổ của tui · 15% daily · 15% academic', ratio: { excel: 0.7, daily: 0.15, academic: 0.15 } },
  noi: { label: 'nghiêng nói', desc: '40% sổ của tui · 45% daily · 15% academic', ratio: { excel: 0.4, daily: 0.45, academic: 0.15 } },
  viet: { label: 'nghiêng viết', desc: '35% sổ của tui · 15% daily · 50% academic', ratio: { excel: 0.35, daily: 0.15, academic: 0.5 } },
  tu_dong: { label: 'theo kỹ năng yếu', desc: 'tự nghiêng về nhánh hợp kỹ năng yếu nhất', ratio: null },
};

const str = (v) => (typeof v === 'string' ? v.normalize('NFC').trim() : '');
const list = (v) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);

// chuẩn hoá một mục từ (dữ liệu hỏng / thiếu trường vẫn dùng được)
export function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object' || !str(raw.id) || !str(raw.phrase)) return null;
  const item = {
    id: str(raw.id),
    source: SOURCES.includes(raw.source) ? raw.source : 'xie',
    track: TRACKS.includes(raw.track) ? raw.track : 'daily',
    topic: str(raw.topic),
    subgroup: str(raw.subgroup),
    type: TYPES.includes(raw.type) ? raw.type : 'phrase',
    phrase: str(raw.phrase),
    alternatives: list(raw.alternatives),
    meaning_vi: str(raw.meaning_vi),
    examples: list(raw.examples),
    use_for: USE_FOR.includes(raw.use_for) ? raw.use_for : 'both',
    note: str(raw.note),
    level: ['B1', 'B2', 'C1'].includes(raw.level) ? raw.level : '',
    speaking_questions: list(raw.speaking_questions),
  };
  if (raw.seed && typeof raw.seed === 'object') item.seed = { ...raw.seed };
  if (item.type === 'word') {
    const wf = raw.word_family && typeof raw.word_family === 'object' ? raw.word_family : {};
    const col = raw.collocations && typeof raw.collocations === 'object' ? raw.collocations : {};
    Object.assign(item, {
      ipa: str(raw.ipa),
      pos: str(raw.pos),
      word_family: Object.fromEntries(['noun', 'verb', 'adjective', 'adverb', 'negative'].map((k) => [k, list([].concat(wf[k] || []))])),
      prepositions: (Array.isArray(raw.prepositions) ? raw.prepositions : [])
        .map((p) => (typeof p === 'string' ? { pattern: str(p), example: '' } : { pattern: str(p?.pattern), example: str(p?.example) }))
        .filter((p) => p.pattern),
      collocations: { verb: list(col.verb), adj: list(col.adj), noun: list(col.noun) },
      register: str(raw.register),
      common_mistakes_vi: (Array.isArray(raw.common_mistakes_vi) ? raw.common_mistakes_vi : [])
        .map((m) => ({ wrong: str(m?.wrong), right: str(m?.right), why: str(m?.why) }))
        .filter((m) => m.wrong && m.right),
      synonyms: (Array.isArray(raw.synonyms) ? raw.synonyms : [])
        .map((s) => (typeof s === 'string' ? { word: str(s), note: '' } : { word: str(s?.word), note: str(s?.note) }))
        .filter((s) => s.word),
      antonyms: list(raw.antonyms),
      band_booster: raw.band_booster === true,
    });
  }
  return item;
}

// ---------- chấm câu gõ ----------
export function normText(text) {
  return String(text ?? '')
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[.!?,;:"]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// các dạng chấp nhận được của một cụm: bỏ / giữ phần "(…)", bỏ khung "+ v-ing", "…"
export function answerForms(phrase) {
  const base = String(phrase ?? '').replace(/\s*(\+|…|\.\.\.).*$/u, '').trim();
  const forms = new Set();
  const withoutOptional = base.replace(/\s*\([^)]*\)\s*/g, ' ');
  const withOptional = base.replace(/[()]/g, '');
  for (const f of [withoutOptional, withOptional, base]) {
    const n = normText(f);
    if (n) forms.add(n);
  }
  return [...forms];
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export const TYPO_MIN_LENGTH = 6; // từ / cụm dài từ 6 chữ cái thì cho sai 1 ký tự

/**
 * chấm câu gõ. không phân biệt hoa thường. "(sth)" tuỳ chọn. dài thì cho sai 1 ký tự.
 * trả về { ok, exact, typo, viaAlternative, expected }
 */
export function checkTyped(answer, item, { alternativesOk = true } = {}) {
  const a = normText(answer);
  const expected = item.phrase;
  if (!a) return { ok: false, exact: false, typo: false, viaAlternative: false, expected };
  const forms = answerForms(item.phrase);
  if (forms.includes(a)) return { ok: true, exact: true, typo: false, viaAlternative: false, expected };
  const letters = a.replace(/[^\p{L}]/gu, '').length;
  if (letters >= TYPO_MIN_LENGTH && forms.some((f) => levenshtein(a, f) <= 1)) {
    return { ok: true, exact: false, typo: true, viaAlternative: false, expected };
  }
  if (alternativesOk) {
    const alt = item.alternatives.find((x) => answerForms(x).includes(a));
    if (alt) return { ok: true, exact: false, typo: false, viaAlternative: true, expected, alternative: alt };
  }
  return { ok: false, exact: false, typo: false, viaAlternative: false, expected };
}

// gợi ý lần lượt: chữ cái đầu → số ký tự → collocation (với cụm: câu ví dụ đã che)
export function hints(item, blank = null) {
  const main = answerForms(item.phrase)[0] || normText(item.phrase);
  const first = main[0] || '';
  const shape = main.replace(/[^\s'-]/g, '_').replace(/_/g, '_ ').replace(/\s+/g, ' ').trim();
  const out = [`bắt đầu bằng chữ "${first}"`, `${main.replace(/[^\p{L}]/gu, '').length} chữ cái: ${shape}`];
  if (item.type === 'word') {
    const col = [...item.collocations.verb, ...item.collocations.adj, ...item.collocations.noun][0];
    if (col) out.push(`hay đi với: ${col.replace(new RegExp(item.phrase, 'i'), '___')}`);
  } else if (blank) {
    out.push(`trong câu: ${blank.text}`);
  } else if (item.alternatives[0]) {
    out.push(`gần nghĩa với: ${item.alternatives[0]}`);
  }
  return out;
}

// ---------- tìm cụm trong câu ví dụ để đục lỗ ----------
const AUX = new Set(['be', 'am', 'is', 'are', 'was', 'were', 'been', 'being', 'my', 'your', 'their', 'his', 'her', 'a', 'an', 'the', 'sth', 'sb']);
// từ đệm hay chen vào giữa cụm ("feel WAY MORE at ease", "it REALLY comes down to")
const FILLERS = new Set([...AUX, 'really', 'totally', 'so', 'very', 'way', 'more', 'bit', 'quite', 'always', 'just', 'pretty', 'super', 'truly', 'kind', 'sort']);
// động từ bất quy tắc hay gặp → dạng gốc
const IRREGULAR = {
  felt: 'feel', left: 'leave', made: 'make', found: 'find', took: 'take', taken: 'take', kept: 'keep', went: 'go', gone: 'go',
  got: 'get', gotten: 'get', held: 'hold', brought: 'bring', thought: 'think', caught: 'catch', gave: 'give', given: 'give',
  came: 'come', saw: 'see', seen: 'see', knew: 'know', known: 'know', told: 'tell', said: 'say', paid: 'pay', built: 'build',
  spent: 'spend', struck: 'strike', drew: 'draw', drawn: 'draw', led: 'lead', meant: 'mean', ran: 'run', sat: 'sit', stood: 'stand',
  wore: 'wear', worn: 'wear', chose: 'choose', chosen: 'choose', became: 'become', began: 'begin', begun: 'begin', lent: 'lend',
  "wasn't": "isn't", "aren't": "isn't", "weren't": "isn't", "doesn't": "don't", "didn't": "don't",
};
const tokens = (s) => (String(s).match(/[\p{L}\p{N}'-]+/gu) || []);
const tok = (s) => {
  const t = s.toLowerCase().replace(/[’']/g, "'");
  return IRREGULAR[t] || t;
};

// hai từ coi là cùng gốc (boost / boosts / boosted, make / makes…)
function sameStem(a, b) {
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  if (s.length < 3) return false;
  const root = s.replace(/e$/, '');
  return l.startsWith(root) && l.length - root.length <= 3;
}

/**
 * tìm đoạn trong câu ví dụ ứng với cụm (chịu được chia động từ, bỏ "(sth)", "be", "my"…).
 * trả về { text (câu đã che), answer (đoạn bị che, đúng chữ trong câu), sentence } hoặc null
 */
export function findBlank(item, sentence) {
  const core = tokens(String(item.phrase).replace(/\([^)]*\)/g, ' ').replace(/\s*(\+|…|\.\.\.).*$/u, ''))
    .map(tok)
    .filter((t) => !AUX.has(t));
  if (!core.length) return null;
  const words = [...String(sentence).matchAll(/[\p{L}\p{N}'-]+/gu)].map((m) => ({ w: tok(m[0]), i: m.index, len: m[0].length }));
  let best = null;
  // được bắt đầu khớp từ giữa cụm (vd. ví dụ bỏ chữ "when" ở đầu cụm)
  for (let k0 = 0; k0 < core.length; k0++) for (let s = 0; s < words.length; s++) {
    let k = k0;
    let j = s;
    let matched = 0;
    let end = s;
    // khớp lần lượt các từ chính, cho phép chen tối đa 1 từ phụ (vd. "boost MY mood")
    while (k < core.length && j < words.length) {
      if (sameStem(core[k], words[j].w)) {
        matched += 1;
        end = j;
        k += 1;
        j += 1;
      } else if (matched > 0 && FILLERS.has(words[j].w) && j + 1 < words.length && j - end <= 2) {
        j += 1;
      } else {
        break;
      }
    }
    if (matched && (!best || matched > best.matched)) best = { s, end, matched };
  }
  const need = core.length <= 2 ? core.length : Math.ceil(core.length * 0.6);
  if (!best || best.matched < need) return null;
  const from = words[best.s].i;
  const to = words[best.end].i + words[best.end].len;
  const answer = sentence.slice(from, to);
  return { text: `${sentence.slice(0, from)}_____${sentence.slice(to)}`, answer, sentence };
}

export function blankFor(item) {
  for (const ex of item.examples) {
    const b = findBlank(item, ex);
    if (b) return b;
  }
  return null;
}

// ---------- câu hỏi ----------
function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// đáp án nhiễu: ưu tiên cùng chủ đề, không trùng nghĩa / cụm
function distractors(item, pool, field, n, rand) {
  const seen = new Set([normText(item[field])]);
  const same = shuffle(pool.filter((p) => p.id !== item.id && p.topic === item.topic), rand);
  const other = shuffle(pool.filter((p) => p.id !== item.id && p.topic !== item.topic), rand);
  const out = [];
  for (const p of [...same, ...other]) {
    const v = p[field];
    if (!v || seen.has(normText(v))) continue;
    seen.add(normText(v));
    out.push(v);
    if (out.length >= n) break;
  }
  return out;
}

/**
 * sinh câu hỏi cho một từ ở một mức.
 * trả về { stage, kind (loại lượt ở daily-goal), mode, … } — mode:
 *   "choose"  chọn 1 trong options (answer là đáp án đúng)
 *   "type"    gõ ra (chấm bằng checkTyped hoặc so với answer)
 *   "output"  tự viết câu / nói to rồi tự chấm
 */
export function makeQuestion(item, stage, pool = [], { rand = Math.random } = {}) {
  if (stage === 1) {
    const wrong = distractors(item, pool, 'meaning_vi', 3, rand);
    if (wrong.length < 1) return makeQuestion(item, 2, pool, { rand });
    return {
      stage, kind: 'recognition', mode: 'choose', prompt: item.phrase, promptLang: 'en',
      ask: 'cụm này nghĩa là gì?', options: shuffle([item.meaning_vi, ...wrong], rand), answer: item.meaning_vi,
    };
  }
  if (stage === 2) {
    const blank = blankFor(item);
    return {
      stage, kind: 'recall', mode: 'type', prompt: item.meaning_vi, promptLang: 'vi',
      ask: 'gõ ra cụm tiếng anh', context: blank ? blank.text : '', hints: hints(item, blank),
    };
  }
  if (stage === 3) {
    if (item.type === 'word') {
      const q = wordGuided(item, pool, rand);
      if (q) return q;
    }
    const blank = blankFor(item);
    const variants = [];
    if (blank) {
      variants.push({
        stage, kind: 'guided', mode: 'type', prompt: blank.text, promptLang: 'en',
        ask: 'điền cụm vào chỗ trống (chia cho hợp câu)', answer: blank.answer, sentence: blank.sentence, hints: hints(item, null),
      });
    }
    const wrong = distractors(item, pool, 'phrase', 3, rand);
    if (wrong.length >= 2) {
      const context = blank ? blank.text : `${item.meaning_vi}`;
      variants.push({
        stage, kind: 'guided', mode: 'choose', prompt: context, promptLang: blank ? 'en' : 'vi',
        ask: blank ? 'cụm nào hợp chỗ trống?' : 'chọn cụm đúng với ngữ cảnh này', options: shuffle([item.phrase, ...wrong], rand), answer: item.phrase,
        sentence: blank?.sentence || '',
      });
    }
    if (!variants.length) return makeQuestion(item, 2, pool, { rand });
    return variants[Math.floor(rand() * variants.length) % variants.length];
  }
  // mức 4: output
  const modes = item.use_for === 'speaking' ? ['speak'] : item.use_for === 'writing' ? ['write'] : ['write', 'speak'];
  const question = item.speaking_questions[0] || '';
  return {
    stage, kind: 'sentence', mode: 'output', outputModes: modes, prompt: item.phrase, promptLang: 'en',
    ask: modes.includes('write') ? 'tự viết 1 câu của riêng bạn có dùng cụm này' : 'nói to 1 câu trả lời có dùng cụm này',
    question, samples: item.examples,
    checklist: ['đúng dạng từ (word form)', 'đúng giới từ', 'kết hợp từ tự nhiên (collocation)', 'hợp ngữ cảnh'],
  };
}

// bài dùng có hướng dẫn cho type "word": word form, giới từ, collocation, sửa câu sai
function wordGuided(item, pool, rand) {
  const qs = [];
  const forms = Object.entries(item.word_family).filter(([k, v]) => v.length && k !== 'negative');
  if (forms.length >= 2) {
    const [pos, [form]] = forms[Math.floor(rand() * forms.length) % forms.length];
    const ex = item.examples.find((e) => new RegExp(`\\b${form}\\b`, 'i').test(e));
    if (ex) {
      qs.push({
        stage: 3, kind: 'guided', mode: 'type', prompt: ex.replace(new RegExp(`\\b${form}\\b`, 'i'), '_____'), promptLang: 'en',
        ask: `điền dạng đúng của "${item.phrase}" (${pos})`, answer: form, sentence: ex, tag: 'form',
      });
    }
  }
  if (item.prepositions.length) {
    const p = item.prepositions[0];
    const m = p.pattern.match(/\b(to|on|of|in|for|with|at|about|from|by|into)\b/i);
    if (m) {
      const all = ['to', 'on', 'of', 'in', 'for', 'with', 'at', 'about'];
      qs.push({
        stage: 3, kind: 'guided', mode: 'choose', prompt: (p.example || p.pattern).replace(new RegExp(`\\b${m[1]}\\b`, 'i'), '___'), promptLang: 'en',
        ask: 'chọn giới từ đúng', options: shuffle([m[1].toLowerCase(), ...shuffle(all.filter((x) => x !== m[1].toLowerCase()), rand).slice(0, 3)], rand),
        answer: m[1].toLowerCase(), tag: 'prep',
      });
    }
  }
  const cols = [...item.collocations.verb, ...item.collocations.adj, ...item.collocations.noun];
  if (cols.length) {
    const c = cols[Math.floor(rand() * cols.length) % cols.length];
    const other = pool.filter((p) => p.type === 'word' && p.id !== item.id).flatMap((p) => [...p.collocations.verb, ...p.collocations.adj, ...p.collocations.noun]);
    const wrong = shuffle(other, rand).filter((x) => normText(x) !== normText(c)).slice(0, 2);
    if (wrong.length === 2) {
      qs.push({
        stage: 3, kind: 'guided', mode: 'choose', prompt: item.phrase, promptLang: 'en',
        ask: 'kết hợp nào tự nhiên với từ này?', options: shuffle([c, ...wrong], rand), answer: c, tag: 'collocation',
      });
    }
  }
  if (item.common_mistakes_vi.length) {
    const mk = item.common_mistakes_vi[0];
    qs.push({
      stage: 3, kind: 'guided', mode: 'type', prompt: mk.wrong, promptLang: 'en',
      ask: 'câu này sai một chỗ, gõ lại câu đúng', answer: mk.right, why: mk.why, tag: 'fix', keepCase: true,
    });
  }
  return qs.length ? qs[Math.floor(rand() * qs.length) % qs.length] : null;
}

// chấm câu "type" có answer riêng (điền chỗ trống, sửa câu): không phân biệt hoa thường, dài cho sai 1 ký tự
export function checkAgainst(answer, expected) {
  const a = normText(answer);
  const e = normText(expected);
  if (!a) return { ok: false, typo: false };
  if (a === e) return { ok: true, typo: false };
  if (e.replace(/[^\p{L}]/gu, '').length >= TYPO_MIN_LENGTH && levenshtein(a, e) <= 1) return { ok: true, typo: true };
  return { ok: false, typo: false };
}

// câu tự viết có dùng cụm không (cho phép chia động từ, bỏ "(sth)")
export function usesPhrase(sentence, item) {
  if (findBlank(item, sentence)) return true;
  return item.alternatives.some((alt) => findBlank({ ...item, phrase: alt }, sentence));
}

// đếm số từ của câu (luật "bài output dưới 5 từ thì không tính")
export function wordCount(text) {
  return (String(text).match(/[\p{L}\p{N}'-]+/gu) || []).length;
}

// ---------- chọn từ mới ----------
// nhóm nguồn: sổ của tui (excel) / daily do xie tạo / academic do xie tạo. từ của tui luôn được ưu tiên trước
export function bucketOf(item) {
  if (item.source === 'excel') return 'excel';
  if (item.source === 'mine') return 'mine';
  return item.track === 'academic' ? 'academic' : 'daily';
}

export function ratioFor(preset = 'can_bang', weakSkill = null) {
  if (preset !== 'tu_dong') return (RATIO_PRESETS[preset] || RATIO_PRESETS.can_bang).ratio;
  if (weakSkill === 'writing' || weakSkill === 'grammar') return RATIO_PRESETS.viet.ratio;
  if (weakSkill === 'speaking') return RATIO_PRESETS.noi.ratio;
  return RATIO_PRESETS.can_bang.ratio;
}

/**
 * chọn n từ mới chưa học. từ của tui trước, rồi chia theo tỉ lệ nguồn; nhánh nào hết từ thì nhường chỗ.
 * trong mỗi nhánh giữ thứ tự sổ (chủ đề ưu tiên lên trước).
 */
export function pickNew(pool, learned, n, { ratio = RATIO_PRESETS.can_bang.ratio, topics = [] } = {}) {
  if (n <= 0) return [];
  const fresh = pool.filter((it) => !learned[it.id] && !it.hidden);
  const prio = (it) => (topics.includes(it.topic) ? 0 : 1);
  const buckets = { mine: [], excel: [], daily: [], academic: [] };
  for (const it of fresh) buckets[bucketOf(it)].push(it);
  for (const k of Object.keys(buckets)) buckets[k].sort((a, b) => prio(a) - prio(b));
  const out = buckets.mine.slice(0, n);
  let left = n - out.length;
  if (left <= 0) return out.map((x) => x.id);
  const names = ['excel', 'daily', 'academic'];
  const quota = Object.fromEntries(names.map((k) => [k, Math.round(left * (ratio[k] || 0))]));
  // làm tròn cho đủ đúng "left"
  let diff = left - names.reduce((s, k) => s + quota[k], 0);
  for (const k of names) { if (!diff) break; quota[k] += Math.sign(diff); diff -= Math.sign(diff); }
  const taken = Object.fromEntries(names.map((k) => [k, buckets[k].slice(0, Math.max(0, quota[k]))]));
  let spare = left - names.reduce((s, k) => s + taken[k].length, 0);
  for (const k of names) {
    if (spare <= 0) break;
    const extra = buckets[k].slice(taken[k].length, taken[k].length + spare);
    taken[k].push(...extra);
    spare -= extra.length;
  }
  // xen kẽ các nhánh cho phiên học đỡ đơn điệu
  const total = names.reduce((sum, k) => sum + taken[k].length, 0);
  const merged = [];
  for (let i = 0; merged.length < total; i++) {
    for (const k of names) if (taken[k][i]) merged.push(taken[k][i]);
  }
  return [...out, ...merged].map((x) => x.id);
}

// ---------- từ của ngày ----------
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

// cố định trong ngày. ưu tiên từ chưa vào kho output
export function wordOfDay(pool, date, learned = {}, isOutputFn = () => false) {
  const usable = pool.filter((it) => !it.hidden);
  if (!usable.length) return null;
  const notYet = usable.filter((it) => !isOutputFn(learned[it.id]));
  const from = notYet.length ? notYet : usable;
  const sorted = [...from].sort((a, b) => (a.id < b.id ? -1 : 1));
  return sorted[hash(date) % sorted.length];
}

// chủ đề để tải cho từ của ngày (chỉ tải 1 file)
export function topicOfDay(topics, date) {
  if (!topics.length) return null;
  return topics[hash(`topic|${date}`) % topics.length];
}

// ---------- nhờ claude chấm ----------
export function buildGradePrompt({ band = 6.5, sentences = [] }) {
  const lines = sentences.map((s, i) => `${i + 1}. từ / cụm mục tiêu: "${s.phrase}"${s.kind === 'spoken' ? ' (ý chính khi nói)' : ''}\n   câu của tôi: ${s.text}`);
  return [
    `Mình đang ôn IELTS, mục tiêu band ${Number(band).toFixed(1)}. Dưới đây là các câu mình tự viết hôm nay, mỗi câu dùng một từ / cụm mục tiêu.`,
    '',
    lines.join('\n'),
    '',
    'Với từng câu, bạn chấm giúp mình:',
    '1. word form (dạng từ) có đúng không',
    '2. giới từ có đúng không',
    '3. collocation (kết hợp từ) có tự nhiên không',
    '4. độ tự nhiên: người bản xứ có nói / viết như vậy không, hợp văn nói hay văn viết',
    '5. sửa lỗi (nếu có), giải thích ngắn gọn bằng tiếng Việt',
    '6. viết lại một bản nâng cấp band 7 vẫn giữ từ / cụm mục tiêu',
    '',
    'Trả lời theo đúng thứ tự câu, mỗi câu một mục. Cuối cùng cho mình 1 lỗi mình hay lặp lại nhất (nếu có).',
  ].join('\n');
}
