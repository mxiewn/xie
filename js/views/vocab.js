// xie · views/vocab.js — tab từ vựng (#/vocab): thống kê, nút học, bộ lọc, lưới chủ đề, danh sách từ.
// bộ lọc (spec): nguồn (sổ của tui / xie thêm / từ của tui), nhánh (daily / academic), chủ đề, nhóm con,
// mức thành thạo, chỉ từ hay sai. mỗi chủ đề có icon + màu riêng và tiến độ "x/y đã thành output".

import { pageHead, icons, esc } from '../ui.js';
import { topicStyle } from '../topics.js';
import { masteryOf, isOutput } from '../srs.js';
import { isLearning, isWeak, masteryCounts } from '../vocab-state.js';
import { topicsInfo, loadTopic, loadAll, getVocab, getMyWords, vocabStats, VOCAB_EVENT } from '../vocab-store.js';

// bộ lọc giữ nguyên khi quay lại tab trong cùng phiên
const filters = { source: 'all', track: 'all', topic: 'all', subgroup: 'all', level: 'all', weak: false };

const LEVEL_OPTIONS = [
  ['all', 'mọi mức'], ['0', 'chưa học'], ['1', 'mức 1 · nhận biết'], ['2', 'mức 2 · nhớ lại'],
  ['3', 'mức 3 · dùng có hướng dẫn'], ['4', 'mức 4 · dùng tự do'], ['5', 'đã thành output'],
];

function idsOfTopic(t) {
  if (t.id === 'tu-cua-tui') return getMyWords().items.map((x) => x.id);
  return Array.from({ length: t.count }, (_, i) => `${t.id}-${i + 1}`);
}

function badge(p) {
  if (!isLearning(p)) return '<span class="lv-badge lv-0">chưa học</span>';
  if (isOutput(p)) return '<span class="lv-badge lv-5">✓ output</span>';
  return `<span class="lv-badge lv-${p.stage}">mức ${p.stage}</span>`;
}

function topicTile(t, vocab) {
  const st = topicStyle(t.id);
  const ids = idsOfTopic(t);
  const mc = masteryCounts(vocab, ids);
  const total = ids.length || 1;
  const seg = (n, cls) => (n ? `<span class="${cls}" style="flex:${n}"></span>` : '');
  return `
    <li>
      <button class="topic-tile" type="button" data-topic="${esc(t.id)}" style="--tile-bg:var(--t${st.hue});--tile-ink:var(--t${st.hue}-ink)">
        <span class="topic-icon kao" aria-hidden="true">${esc(st.icon)}</span>
        <span class="topic-name">${esc(t.label)}</span>
        <span class="topic-meta">${mc[5]}/${ids.length} đã thành output</span>
        <span class="mastery-bar" aria-hidden="true" title="">
          ${seg(mc[5], 'mb-5')}${seg(mc[4] + mc[3], 'mb-3')}${seg(mc[2] + mc[1], 'mb-1')}${seg(total - mc[5] - mc[4] - mc[3] - mc[2] - mc[1], 'mb-0')}
        </span>
        <span class="topic-src">${esc(t.source === 'excel' ? 'sổ của tui' : t.id === 'tu-cua-tui' ? 'từ của tui' : t.track)}</span>
      </button>
    </li>`;
}

function rowHtml(it, p) {
  const weak = isWeak(p);
  return `
    <li>
      <a class="word-row" href="#/word/${encodeURIComponent(it.id)}">
        <span class="word-row-main">
          <span class="word-row-phrase keep-case">${esc(it.phrase)}</span>
          <span class="word-row-meaning">${esc(it.meaning_vi)}</span>
        </span>
        <span class="word-row-side">${badge(p)}${weak ? '<span class="weak-dot" title="hay sai">hay sai</span>' : ''}</span>
      </a>
    </li>`;
}

export function render(view) {
  view.innerHTML = `
    ${pageHead({ title: 'từ vựng', sub: 'từ phải thành output: tự viết, tự nói ra được' })}
    <div class="page-body vocab-body">
      <section class="card card-lace vocab-hero" data-role="hero"></section>

      <section class="card filter-card" aria-labelledby="filter-title">
        <h2 class="card-title" id="filter-title"><span class="title-bow">${icons.bow}</span>bộ lọc</h2>
        <div class="filter-grid">
          <label class="select-row"><span>nguồn</span>
            <select data-f="source">
              <option value="all">tất cả</option>
              <option value="excel">sổ của tui</option>
              <option value="xie">xie gợi ý thêm</option>
              <option value="mine">từ của tui</option>
            </select></label>
          <label class="select-row"><span>nhánh</span>
            <select data-f="track">
              <option value="all">tất cả</option>
              <option value="daily">daily (nói)</option>
              <option value="academic">academic (viết)</option>
            </select></label>
          <label class="select-row"><span>chủ đề</span><select data-f="topic"><option value="all">tất cả chủ đề</option></select></label>
          <label class="select-row"><span>nhóm con</span><select data-f="subgroup" disabled><option value="all">tất cả</option></select></label>
          <label class="select-row"><span>mức thành thạo</span>
            <select data-f="level">${LEVEL_OPTIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>
          <label class="check filter-weak"><input type="checkbox" data-f="weak"><span>chỉ từ hay sai</span></label>
        </div>
        <button class="btn-link" type="button" data-act="reset">bỏ lọc</button>
      </section>

      <section class="vocab-content" data-role="content" aria-live="polite"></section>
    </div>`;

  const $ = (s) => view.querySelector(s);
  const heroEl = $('[data-role="hero"]');
  const content = $('[data-role="content"]');
  const sel = (k) => $(`[data-f="${k}"]`);
  let topics = [];
  let token = 0;

  const drawHero = () => {
    const s = vocabStats();
    heroEl.innerHTML = `
      <div class="vocab-stats">
        <p class="vstat"><span class="vstat-num">${s.output}</span><span>từ trong kho output</span></p>
        <p class="vstat"><span class="vstat-num">${s.learning}</span><span>từ đang học</span></p>
        <p class="vstat"><span class="vstat-num">${s.due}</span><span>từ đến hạn ôn</span></p>
      </div>
      <div class="vocab-actions">
        <a class="btn btn-primary" href="#/study">học hôm nay</a>
        <a class="btn btn-ghost" href="#/study/mistakes"${s.mistakes ? '' : ' aria-disabled="true" tabindex="-1" data-off'}>ôn lỗi sai</a>
        <a class="btn btn-ghost" href="#/my-word">thêm từ của tui</a>
        <a class="btn btn-ghost" href="#/grade">nhờ claude chấm</a>
      </div>
      <p class="card-text">từ mới hôm nay: ${s.newToday}/${s.newPerDay}. một từ thành output khi bạn tự dùng đúng nó ở mức 4, hai ngày khác nhau.</p>`;
  };

  const plain = () => filters.topic === 'all' && filters.level === 'all' && !filters.weak && filters.source === 'all' && filters.track === 'all';

  const drawTopicOptions = () => {
    const shown = topics.filter((t) => (filters.source === 'all' || t.source === filters.source || (filters.source === 'mine' && t.id === 'tu-cua-tui'))
      && (filters.track === 'all' || t.track === filters.track));
    sel('topic').innerHTML = `<option value="all">tất cả chủ đề</option>${shown.map((t) => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('')}`;
    if (!shown.some((t) => t.id === filters.topic)) filters.topic = 'all';
    sel('topic').value = filters.topic;
  };

  const passes = (it, p) => {
    if (filters.source !== 'all' && it.source !== filters.source) return false;
    if (filters.track !== 'all' && it.track !== filters.track) return false;
    if (filters.topic !== 'all' && it.topic !== filters.topic && !(filters.topic === 'tu-cua-tui' && it.source === 'mine')) return false;
    if (filters.subgroup !== 'all' && it.subgroup !== filters.subgroup) return false;
    if (filters.level !== 'all') {
      const lv = isLearning(p) ? masteryOf(p) : 0;
      if (String(lv) !== filters.level) return false;
    }
    if (filters.weak && !isWeak(p)) return false;
    return true;
  };

  const draw = async () => {
    const my = ++token;
    drawHero();
    const vocab = getVocab();
    if (plain()) {
      sel('subgroup').disabled = true;
      content.innerHTML = `
        <h2 class="section-title">chủ đề</h2>
        <ul class="topic-grid" role="list">${topics.map((t) => topicTile(t, vocab)).join('')}</ul>
        <p class="legend-line"><span class="mb-dot mb-5"></span>output <span class="mb-dot mb-3"></span>mức 3–4 <span class="mb-dot mb-1"></span>mức 1–2 <span class="mb-dot mb-0"></span>chưa học</p>`;
      return;
    }
    content.innerHTML = '<p class="card-text">đang tải từ…</p>';
    const items = filters.topic === 'all' ? await loadAll() : await loadTopic(filters.topic);
    if (my !== token) return;
    // nhóm con của chủ đề đang chọn
    const subs = [...new Set(items.map((i) => i.subgroup).filter(Boolean))];
    sel('subgroup').disabled = filters.topic === 'all' || !subs.length;
    sel('subgroup').innerHTML = `<option value="all">tất cả</option>${subs.map((x) => `<option value="${esc(x)}">${esc(x.toLowerCase())}</option>`).join('')}`;
    if (!subs.includes(filters.subgroup)) filters.subgroup = 'all';
    sel('subgroup').value = filters.subgroup;

    const list = items.filter((it) => passes(it, vocab.items[it.id]));
    const t = topics.find((x) => x.id === filters.topic);
    const head = t
      ? `<div class="list-head"><h2 class="section-title">${esc(t.label)} · ${list.length} cụm</h2><a class="btn btn-primary btn-small" href="#/study/topic/${encodeURIComponent(t.id)}">học chủ đề này</a></div>`
      : `<h2 class="section-title">${list.length} từ hợp bộ lọc</h2>`;
    if (!list.length) {
      content.innerHTML = `${head}<div class="empty-state"><pre class="kao-art empty-art" aria-hidden="true">( -.-)</pre><p class="empty-text">không có từ nào hợp bộ lọc này</p></div>`;
      return;
    }
    // chia theo nhóm con khi xem một chủ đề
    let body = '';
    if (t && filters.subgroup === 'all' && subs.length) {
      for (const sg of [...subs, '']) {
        const part = list.filter((it) => it.subgroup === sg);
        if (!part.length) continue;
        body += `${sg ? `<h3 class="sub-title">${esc(sg.toLowerCase())}</h3>` : ''}<ul class="word-list" role="list">${part.map((it) => rowHtml(it, vocab.items[it.id])).join('')}</ul>`;
      }
    } else {
      body = `<ul class="word-list" role="list">${list.map((it) => rowHtml(it, vocab.items[it.id])).join('')}</ul>`;
    }
    content.innerHTML = head + body;
  };

  // sự kiện
  for (const k of ['source', 'track', 'topic', 'subgroup', 'level']) {
    sel(k).addEventListener('change', () => {
      filters[k] = sel(k).value;
      if (k === 'topic') filters.subgroup = 'all';
      if (k === 'source' || k === 'track') drawTopicOptions();
      draw();
    });
  }
  sel('weak').addEventListener('change', () => { filters.weak = sel('weak').checked; draw(); });
  $('[data-act="reset"]').addEventListener('click', () => {
    Object.assign(filters, { source: 'all', track: 'all', topic: 'all', subgroup: 'all', level: 'all', weak: false });
    for (const k of ['source', 'track', 'level']) sel(k).value = 'all';
    sel('weak').checked = false;
    drawTopicOptions();
    draw();
  });
  content.addEventListener('click', (e) => {
    const tile = e.target.closest('[data-topic]');
    if (!tile) return;
    filters.topic = tile.dataset.topic;
    sel('topic').value = filters.topic;
    draw();
    content.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  heroEl.addEventListener('click', (e) => { if (e.target.closest('[data-off]')) e.preventDefault(); });

  topicsInfo().then((list) => {
    const mine = getMyWords().items.length;
    topics = [...list, ...(mine ? [{ id: 'tu-cua-tui', label: 'từ của tui', source: 'mine', track: 'daily', count: mine }] : [])];
    sel('source').value = filters.source;
    sel('track').value = filters.track;
    sel('level').value = filters.level;
    sel('weak').checked = filters.weak;
    drawTopicOptions();
    draw();
  });

  const onChange = () => drawHero();
  window.addEventListener(VOCAB_EVENT, onChange);
  return () => window.removeEventListener(VOCAB_EVENT, onChange);
}
