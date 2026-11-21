// xie · views/word.js — thẻ từ (#/word/<id>).
// mặt trước theo lựa chọn: en → vi, vi → en, ngẫu nhiên (nhớ lựa chọn). chạm để lật.
// mặt sau chia tab. cụm (phrase): nghĩa | ví dụ | cách nói tương tự | ghi chú & câu hỏi.
// từ (word): nghĩa | word form | giới từ & collocation | ngữ cảnh | ví dụ | lỗi hay gặp.
// nghe được từ và từng ví dụ. sổ của tui: chỉ sửa "câu của tôi" và "đã dùng khi nói".
// từ của tui: sửa / xoá. từ xie gợi ý: ẩn / bỏ ẩn.

import { pageHead, esc, showToast } from '../ui.js';
import { topicStyle } from '../topics.js';
import { masteryOf, STAGE_LABELS, dueAt, OUTPUT_PASSES } from '../srs.js';
import { SOURCE_LABELS } from '../vocab-core.js';
import { userFields, isLearning } from '../vocab-state.js';
import { findItem, getVocab, setFront, setUserFields, deleteMyWord, topicsInfo } from '../vocab-store.js';
import { listenButton, wireListen, speak } from '../speech.js';
import { play } from '../sound.js';
import { say } from '../voice.js';

const FRONTS = [['en', 'en → vi'], ['vi', 'vi → en'], ['random', 'ngẫu nhiên']];

const exampleList = (list) => `<ul class="ex-list" role="list">${list.map((e) => `<li class="keep-case" data-say="${esc(e)}"><span>${esc(e)}</span>${listenButton('nghe câu này', 'listen-small')}</li>`).join('')}</ul>`;
const empty = (t = 'chưa có') => `<p class="card-text">${t}</p>`;

function phraseTabs(it) {
  return [
    ['nghia', 'nghĩa', `<p class="back-meaning">${esc(it.meaning_vi)}</p>${it.level ? `<p class="card-text">mức ${esc(it.level)}</p>` : ''}<p class="card-text">dùng cho: ${it.use_for === 'speaking' ? 'nói' : it.use_for === 'writing' ? 'viết' : 'cả nói và viết'}</p>`],
    ['vi-du', 'ví dụ', it.examples.length ? exampleList(it.examples) : empty()],
    ['tuong-tu', 'cách nói tương tự', it.alternatives.length
      ? `<p class="card-text">nhận ra là đủ, không cần thuộc hết</p><ul class="chip-row" role="list">${it.alternatives.map((a) => `<li class="alt-chip keep-case" data-say="${esc(a)}">${esc(a)}${listenButton('nghe', 'listen-small')}</li>`).join('')}</ul>`
      : empty('sổ chưa ghi cách nói tương tự')],
    ['ghi-chu', 'ghi chú', `${it.note ? `<p>${esc(it.note)}</p>` : empty('chưa có ghi chú')}${it.speaking_questions.length ? `<p class="out-label">câu hỏi speaking dùng được</p>${exampleList(it.speaking_questions)}` : ''}`],
  ];
}

function wordTabs(it) {
  const wf = it.word_family;
  const forms = [['noun', 'danh từ'], ['verb', 'động từ'], ['adjective', 'tính từ'], ['adverb', 'trạng từ'], ['negative', 'phủ định']]
    .filter(([k]) => wf[k]?.length).map(([k, l]) => `<li><span class="wf-pos">${l}</span><span class="keep-case">${wf[k].map(esc).join(', ')}</span></li>`).join('');
  const cols = [['verb', 'động từ +'], ['adj', 'tính từ +'], ['noun', '+ danh từ']].filter(([k]) => it.collocations[k].length)
    .map(([k, l]) => `<li><span class="wf-pos">${l}</span><span class="keep-case">${it.collocations[k].map(esc).join(' · ')}</span></li>`).join('');
  const preps = it.prepositions.map((p) => `<li class="keep-case"><b>${esc(p.pattern)}</b>${p.example ? ` — <span data-say="${esc(p.example)}">${esc(p.example)}</span>` : ''}</li>`).join('');
  return [
    ['nghia', 'nghĩa', `<p class="back-meaning">${esc(it.meaning_vi)}</p>${it.ipa ? `<p class="ipa keep-case">${esc(it.ipa)}</p>` : ''}${it.pos ? `<p class="card-text">${esc(it.pos)}</p>` : ''}${it.band_booster ? '<span class="tag">band booster</span>' : ''}`],
    ['word-form', 'word form', forms ? `<ul class="wf-list" role="list">${forms}</ul>` : empty()],
    ['gioi-tu', 'giới từ & collocation', `${preps ? `<ul class="plain-list" role="list">${preps}</ul>` : ''}${cols ? `<ul class="wf-list" role="list">${cols}</ul>` : ''}${!preps && !cols ? empty() : ''}`],
    ['ngu-canh', 'ngữ cảnh', `${it.register ? `<p>${esc(it.register)}</p>` : ''}${it.note ? `<p>${esc(it.note)}</p>` : ''}${it.synonyms.length ? `<p class="out-label">đồng nghĩa</p><ul class="plain-list" role="list">${it.synonyms.map((s) => `<li><b class="keep-case">${esc(s.word)}</b>${s.note ? ` — ${esc(s.note)}` : ''}</li>`).join('')}</ul>` : ''}${it.antonyms.length ? `<p class="out-label">trái nghĩa</p><p class="keep-case">${it.antonyms.map(esc).join(', ')}</p>` : ''}${!it.register && !it.note && !it.synonyms.length ? empty() : ''}`],
    ['vi-du', 'ví dụ', it.examples.length ? exampleList(it.examples) : empty()],
    ['loi', 'lỗi hay gặp', it.common_mistakes_vi.length ? `<ul class="plain-list" role="list">${it.common_mistakes_vi.map((m) => `<li><span class="mk-wrong keep-case">✗ ${esc(m.wrong)}</span><span class="mk-right keep-case">✓ ${esc(m.right)}</span>${m.why ? `<span class="card-text">${esc(m.why)}</span>` : ''}</li>`).join('')}</ul>` : empty()],
  ];
}

function progressText(p) {
  if (!isLearning(p)) return 'chưa học từ này';
  const m = masteryOf(p);
  if (m === 5) return `đã thành output · qua mức 4 ở ${new Set(p.output_days).size} ngày`;
  const due = dueAt(p);
  const when = due <= Date.now() ? 'đến hạn ôn rồi' : `ôn lại ${new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: 'numeric', month: 'numeric' }).format(new Date(due))}`;
  const outNote = m === 4 ? ` · qua mức 4: ${new Set(p.output_days).size}/${OUTPUT_PASSES} ngày` : '';
  return `mức ${m} · ${STAGE_LABELS[m]} · hộp ${p.boxes[p.stage]?.box || 1}/5 · ${when}${outNote}`;
}

export function render(view, { params = [] } = {}) {
  const id = params[0];
  view.innerHTML = `${pageHead({ title: 'thẻ từ', actions: '<a class="btn btn-ghost btn-small" href="#/vocab">kho từ</a>' })}
    <div class="page-body word-body" data-role="body"><p class="card-text">đang tải…</p></div>`;
  const body = view.querySelector('[data-role="body"]');
  wireListen(view);
  let alive = true;

  findItem(id).then(async (it) => {
    if (!alive) return;
    if (!it) {
      body.innerHTML = '<div class="empty-state"><pre class="kao-art empty-art" aria-hidden="true">(・・ ) ?</pre><p class="empty-text">không tìm thấy từ này</p><a class="btn btn-primary" href="#/vocab">về kho từ</a></div>';
      return;
    }
    const topic = (await topicsInfo()).find((t) => t.id === it.topic);
    const st = topicStyle(it.topic);
    const tabs = it.type === 'word' ? wordTabs(it) : phraseTabs(it);
    const vocab = getVocab();
    let front = vocab.front;
    const uf = userFields(vocab, it);
    const pickSide = () => (front === 'random' ? (Math.random() < 0.5 ? 'en' : 'vi') : front);

    body.innerHTML = `
      <div class="word-meta">
        <span class="topic-chip" style="--tile-bg:var(--t${st.hue});--tile-ink:var(--t${st.hue}-ink)"><span class="kao" aria-hidden="true">${esc(st.icon)}</span>${esc(topic?.label || (it.source === 'mine' ? 'từ của tui' : it.topic))}</span>
        ${it.subgroup ? `<span class="tag">${esc(it.subgroup.toLowerCase())}</span>` : ''}
        <span class="tag">${esc(SOURCE_LABELS[it.source])}</span>
      </div>

      <div class="segmented segmented-fit front-pick" role="radiogroup" aria-label="mặt trước thẻ">
        ${FRONTS.map(([v, l]) => `<label class="segment-choice"><input type="radio" name="front" value="${v}"${v === front ? ' checked' : ''}><span>${l}</span></label>`).join('')}
      </div>

      <div class="flip-card" data-role="flip">
        <button class="flip-face flip-front" type="button" data-act="flip" aria-label="lật thẻ"></button>
        <div class="flip-face flip-back" aria-live="polite">
          <div class="back-head" data-say="${esc(it.phrase)}">
            <p class="word-phrase keep-case">${esc(it.phrase)}</p>
            ${listenButton('nghe cụm này')}
          </div>
          <div class="tabs" role="tablist" aria-label="mặt sau thẻ">
            ${tabs.map(([k, l], i) => `<button class="tab-chip" type="button" role="tab" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${k}">${l}</button>`).join('')}
          </div>
          ${tabs.map(([k, , html], i) => `<div class="tab-panel" role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}"${i ? ' hidden' : ''}>${html}</div>`).join('')}
          <button class="btn-link flip-again" type="button" data-act="flip">lật lại mặt trước</button>
        </div>
      </div>

      <section class="card word-progress">
        <p class="card-text" data-role="progress">${esc(progressText(vocab.items[it.id]))}</p>
        <div class="study-actions">
          <a class="btn btn-primary" href="#/study/word/${encodeURIComponent(it.id)}">${isLearning(vocab.items[it.id]) ? 'luyện từ này' : 'học từ này'}</a>
          ${it.source === 'mine' ? `<a class="btn btn-ghost" href="#/my-word/${encodeURIComponent(it.id)}">sửa</a><button class="btn btn-ghost" type="button" data-act="del">xoá</button>` : ''}
          ${it.source === 'xie' ? `<button class="btn btn-ghost" type="button" data-act="hide">${uf.hidden ? 'bỏ ẩn' : 'ẩn từ này'}</button>` : ''}
        </div>
        <div class="danger-confirm" data-role="del-confirm" hidden>
          <p class="danger-ask">xoá hẳn từ này và tiến độ của nó? bấm thêm một lần nữa.</p>
          <div class="study-actions"><button class="btn btn-danger" type="button" data-act="del-2">xoá hẳn</button><button class="btn btn-ghost" type="button" data-act="del-cancel">thôi</button></div>
        </div>
      </section>

      <section class="card my-card" aria-labelledby="my-title">
        <h2 class="card-title" id="my-title">câu của tôi</h2>
        <textarea class="input keep-case" rows="2" data-role="mine" autocapitalize="sentences" placeholder="câu bạn tự đặt với cụm này">${esc(uf.my_sentence)}</textarea>
        <label class="check"><input type="checkbox" data-role="used"${uf.used_speaking ? ' checked' : ''}><span>đã dùng khi nói</span></label>
      </section>`;

    const flip = body.querySelector('[data-role="flip"]');
    const frontFace = body.querySelector('.flip-front');
    const drawFront = () => {
      const side = pickSide();
      frontFace.innerHTML = side === 'en'
        ? `<span class="front-label">nghĩa là gì?</span><span class="front-main keep-case">${esc(it.phrase)}</span><span class="front-tap">chạm để lật</span>`
        : `<span class="front-label">tiếng anh là gì?</span><span class="front-main">${esc(it.meaning_vi)}</span><span class="front-tap">chạm để lật</span>`;
      if (side === 'en') speak(it.phrase);
    };
    drawFront();
    body.querySelectorAll('[data-act="flip"]').forEach((b) => b.addEventListener('click', () => {
      flip.classList.toggle('is-flipped');
      play('flip');
      if (!flip.classList.contains('is-flipped')) { drawFront(); frontFace.focus(); } else body.querySelector('.flip-back .tab-chip')?.focus({ preventScroll: true });
    }));
    for (const r of body.querySelectorAll('input[name="front"]')) {
      r.addEventListener('change', () => { if (!r.checked) return; front = r.value; setFront(front); flip.classList.remove('is-flipped'); drawFront(); });
    }

    // tab: bấm hoặc phím mũi tên
    const chips = [...body.querySelectorAll('.tab-chip')];
    const select = (k) => {
      for (const c of chips) { const on = c.dataset.tab === k; c.setAttribute('aria-selected', String(on)); c.tabIndex = on ? 0 : -1; }
      for (const p of body.querySelectorAll('.tab-panel')) p.hidden = p.id !== `panel-${k}`;
    };
    chips.forEach((c, i) => {
      c.addEventListener('click', () => select(c.dataset.tab));
      c.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const n = chips[(i + (e.key === 'ArrowRight' ? 1 : chips.length - 1)) % chips.length];
        select(n.dataset.tab);
        n.focus();
      });
    });

    // câu của tôi + đã dùng khi nói
    const saved = async () => { const l = await say('da_luu', { kind: 'saved' }, { forceLine: true }); showToast(l?.text || 'đã lưu', l?.kao || ''); };
    body.querySelector('[data-role="mine"]').addEventListener('change', (e) => { setUserFields(it.id, { my_sentence: e.target.value }); saved(); });
    body.querySelector('[data-role="used"]').addEventListener('change', (e) => { setUserFields(it.id, { used_speaking: e.target.checked }); saved(); });

    body.querySelector('[data-act="hide"]')?.addEventListener('click', (e) => {
      const hidden = !userFields(getVocab(), it).hidden;
      setUserFields(it.id, { hidden });
      e.target.textContent = hidden ? 'bỏ ẩn' : 'ẩn từ này';
      showToast(hidden ? 'đã ẩn, từ này không vào bài học nữa' : 'đã bỏ ẩn');
    });
    const conf = body.querySelector('[data-role="del-confirm"]');
    body.querySelector('[data-act="del"]')?.addEventListener('click', () => { conf.hidden = false; });
    body.querySelector('[data-act="del-cancel"]')?.addEventListener('click', () => { conf.hidden = true; });
    body.querySelector('[data-act="del-2"]')?.addEventListener('click', async () => {
      deleteMyWord(it.id);
      const l = await say('da_luu', { kind: 'deleted' }, { forceLine: true });
      showToast(l?.text || 'đã xoá', l?.kao || '');
      window.location.hash = '#/vocab';
    });
  });

  return () => { alive = false; };
}
