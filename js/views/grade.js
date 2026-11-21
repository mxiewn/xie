// xie · views/grade.js — câu của tui + "nhờ claude chấm" (#/grade).
// gom câu tự viết thành prompt hoàn chỉnh (band mục tiêu, từ mục tiêu, câu, yêu cầu chấm word form, giới từ,
// collocation, độ tự nhiên, sửa lỗi, bản nâng cấp band 7) → copy vào clipboard.
// mỗi câu: đánh dấu "đã chấm", dán lại câu đã sửa. lọc: hôm nay / chưa chấm / tất cả, theo từ.

import { pageHead, icons, esc, showToast } from '../ui.js';
import { getState } from '../state.js';
import { todayIn } from '../state-core.js';
import { buildGradePrompt } from '../vocab-core.js';
import { getSentences, updateSentence, VOCAB_EVENT } from '../vocab-store.js';
import { shortDate } from '../progress-ui.js';

const VIEWS = [['today', 'hôm nay'], ['ungraded', 'chưa chấm'], ['all', 'tất cả']];
let current = 'today';
let query = '';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function render(view) {
  const today = todayIn();
  view.innerHTML = `
    ${pageHead({ title: 'câu của tui', sub: 'mọi câu bạn tự viết. gom lại nhờ claude chấm', actions: '<a class="btn btn-ghost btn-small" href="#/vocab">kho từ</a>' })}
    <div class="page-body grade-body">
      <section class="card grade-tools">
        <div class="segmented segmented-fit" role="radiogroup" aria-label="xem câu">
          ${VIEWS.map(([k, l]) => `<label class="segment-choice"><input type="radio" name="gview" value="${k}"${k === current ? ' checked' : ''}><span>${l}</span></label>`).join('')}
        </div>
        <label class="field">
          <span class="sr-only">lọc theo từ</span>
          <input class="input" type="search" data-role="q" placeholder="lọc theo từ hoặc chủ đề" value="${esc(query)}" autocapitalize="off" spellcheck="false">
        </label>
      </section>
      <section class="card card-lace prompt-card" aria-labelledby="prompt-title">
        <h2 class="card-title" id="prompt-title"><span class="title-bow">${icons.bow}</span>nhờ claude chấm</h2>
        <p class="card-text" data-role="pcount"></p>
        <textarea class="input prompt-box keep-case" rows="7" readonly data-role="prompt" aria-label="prompt sẽ copy"></textarea>
        <div class="study-actions">
          <button class="btn btn-primary" type="button" data-act="copy">copy prompt</button>
          <a class="btn btn-ghost" href="https://claude.ai/new" target="_blank" rel="noopener">mở claude</a>
        </div>
        <p class="card-text">dán vào claude, đọc nhận xét, rồi bấm "đã chấm" và dán câu đã sửa vào từng câu bên dưới.</p>
      </section>
      <ul class="sentence-list" role="list" data-role="list"></ul>
    </div>`;

  const $ = (s) => view.querySelector(s);
  const listEl = $('[data-role="list"]');
  const promptEl = $('[data-role="prompt"]');
  const pcount = $('[data-role="pcount"]');
  const picked = new Set();
  let touched = false;

  const visible = () => {
    const q = query.trim().toLowerCase();
    return getSentences().list
      .filter((s) => (current === 'today' ? s.date === today : current === 'ungraded' ? !s.graded : true))
      .filter((s) => !q || s.phrase.toLowerCase().includes(q) || s.text.toLowerCase().includes(q) || s.topic.includes(q))
      .slice()
      .reverse();
  };

  const drawPrompt = () => {
    const chosen = getSentences().list.filter((s) => picked.has(s.id));
    promptEl.value = chosen.length ? buildGradePrompt({ band: getState().profile.target_band, sentences: chosen }) : '';
    pcount.textContent = chosen.length ? `${chosen.length} câu trong prompt` : 'chọn câu muốn chấm ở danh sách bên dưới';
    $('[data-act="copy"]').disabled = !chosen.length;
  };

  const draw = () => {
    const list = visible();
    if (!touched) {
      picked.clear();
      for (const s of list) if (!s.graded) picked.add(s.id);
    }
    if (!list.length) {
      listEl.innerHTML = `<li class="empty-state"><pre class="kao-art empty-art" aria-hidden="true">(\\_/)\n( •.•)\n/ >✎</pre><p class="empty-text">${current === 'today' ? 'hôm nay chưa có câu tự viết nào. vào học hôm nay, tới mức 4 là được viết' : 'chưa có câu nào ở đây'}</p><a class="btn btn-primary" href="#/study">học hôm nay</a></li>`;
      drawPrompt();
      return;
    }
    listEl.innerHTML = list.map((s) => `
      <li class="card sentence-item${s.graded ? ' is-graded' : ''}" data-id="${esc(s.id)}">
        <label class="check sentence-pick"><input type="checkbox" data-pick${picked.has(s.id) ? ' checked' : ''}><span class="sr-only">đưa vào prompt</span></label>
        <div class="sentence-main">
          <p class="sentence-meta"><span class="keep-case">${esc(s.phrase)}</span> · ${s.date ? shortDate(s.date) : ''} · ${s.kind === 'spoken' ? 'ý chính khi nói' : 'tự viết'}
            <span class="status-chip ${s.graded ? 'status-ok' : 'status-wait'}">${s.graded ? '✓ đã chấm' : 'chưa chấm'}</span></p>
          <p class="sentence-text keep-case">${esc(s.text)}</p>
          ${s.corrected ? `<p class="sentence-fixed keep-case"><span class="out-label">câu đã sửa</span>${esc(s.corrected)}</p>` : ''}
          <details class="sentence-edit">
            <summary>${s.graded ? 'sửa câu đã chấm' : 'đánh dấu đã chấm'}</summary>
            <label class="field"><span class="field-label">dán câu đã sửa (tuỳ chọn)</span>
              <textarea class="input keep-case" rows="2" data-fixed>${esc(s.corrected)}</textarea></label>
            <div class="study-actions">
              <button class="btn btn-primary btn-small" type="button" data-act="graded">${s.graded ? 'lưu' : 'đã chấm'}</button>
              ${s.graded ? '<button class="btn btn-ghost btn-small" type="button" data-act="ungrade">bỏ đánh dấu</button>' : ''}
            </div>
          </details>
        </div>
      </li>`).join('');
    drawPrompt();
  };

  listEl.addEventListener('change', (e) => {
    const box = e.target.closest('[data-pick]');
    if (!box) return;
    touched = true;
    const id = box.closest('[data-id]').dataset.id;
    if (box.checked) picked.add(id); else picked.delete(id);
    drawPrompt();
  });
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const li = btn.closest('[data-id]');
    const id = li.dataset.id;
    if (btn.dataset.act === 'graded') {
      updateSentence(id, { graded: true, corrected: li.querySelector('[data-fixed]').value.trim() });
      picked.delete(id);
      showToast('đã đánh dấu đã chấm', '(•ᴗ•)♡');
    }
    if (btn.dataset.act === 'ungrade') updateSentence(id, { graded: false });
  });
  for (const r of view.querySelectorAll('input[name="gview"]')) {
    r.addEventListener('change', () => { if (r.checked) { current = r.value; touched = false; draw(); } });
  }
  $('[data-role="q"]').addEventListener('input', (e) => { query = e.target.value; draw(); });
  $('[data-act="copy"]').addEventListener('click', async () => {
    const ok = await copyText(promptEl.value);
    showToast(ok ? 'đã copy prompt, dán vào claude nha' : 'chưa copy được, giữ và chọn chữ trong ô để copy tay', ok ? '(｡•̀ᴗ-)✧' : '(・_・;)');
    if (!ok) { promptEl.focus(); promptEl.select(); }
  });

  draw();
  window.addEventListener(VOCAB_EVENT, draw);
  return () => window.removeEventListener(VOCAB_EVENT, draw);
}
