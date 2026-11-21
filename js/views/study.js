// xie · views/study.js — phiên học từ vựng (#/study, #/study/mistakes, #/study/word/<id>, #/study/topic/<chủ-đề>).
// kế hoạch: ôn từ đến hạn trước (trộn chủ đề) → từ mới (thẻ giới thiệu rồi hỏi luôn mức 1, mức 2)
// → vài bài output với từ đã tới mức 4. mỗi câu trả lời ghi vào srs + lượt mục tiêu + sổ lỗi + câu của tui.
// sai thì câu đó quay lại sau vài câu (tối đa 2 lần). cuối phiên có tổng kết.

import { pageHead, createBubble, esc, heartBurst, showToast } from '../ui.js';
import { createBunny } from '../bunny.js';
import { getEquippedSkin } from '../levels.js';
import { say } from '../voice.js';
import { getState } from '../state.js';
import { todayIn } from '../state-core.js';
import { celebrate, currentVoiceContext } from '../progress.js';
import { reasonText } from '../daily-goal.js';
import { STAGE_LABELS } from '../srs.js';
import { makeQuestion, checkTyped, checkAgainst, pickNew, ratioFor, usesPhrase, wordCount, SOURCE_LABELS } from '../vocab-core.js';
import { learnedMap, isWeak, isLearning, dueIds } from '../vocab-state.js';
import { loadAll, findItem, getVocab, getMistakes, answer, markHard, startLearning, topicIdOf } from '../vocab-store.js';
import { speak, listenButton, wireListen } from '../speech.js';
import { feedback, play } from '../sound.js';

const MAX_DUE = 30;
const MAX_OUTPUT = 4;
const MAX_ASKS_PER_ITEM = 3;
const RETRY_GAP = 3;

const TITLES = { today: 'học hôm nay', mistakes: 'ôn lỗi sai', word: 'luyện một từ', topic: 'học theo chủ đề' };

// ---------- dựng hàng đợi ----------
async function buildQueue(mode, param) {
  const pool = await loadAll();
  const byId = Object.fromEntries(pool.map((i) => [i.id, i]));
  const vocab = getVocab();
  const { profile, settings } = getState();
  const today = todayIn();
  const learned = learnedMap(vocab);
  const topicOf = (id) => byId[id]?.topic || topicIdOf(id);
  const queue = [];
  const push = (id, intro = false) => { if (byId[id]) queue.push({ id, intro }); };

  if (mode === 'word') {
    const it = byId[param] || (await findItem(param));
    if (it) push(it.id, !isLearning(vocab.items[it.id]));
    return { pool, queue };
  }

  if (mode === 'mistakes') {
    const recent = new Set(getMistakes().list.slice(-80).map((m) => m.item));
    const weak = Object.entries(learned).filter(([id, p]) => isWeak(p) || recent.has(id)).map(([id]) => id);
    for (const id of weak.slice(0, 20)) push(id);
    return { pool, queue };
  }

  const inTopic = (id) => mode !== 'topic' || topicOf(id) === param;
  const due = dueIds(vocab, Date.now(), topicOf).filter(inTopic).slice(0, MAX_DUE);
  const newLeft = Math.max(0, profile.new_words_per_day - (vocab.new_log[today] || []).length);
  const candidates = mode === 'topic' ? pool.filter((i) => i.topic === param) : pool;
  const fresh = pickNew(candidates, learned, newLeft, { ratio: ratioFor(settings.new_ratio, profile.weak_skill), topics: profile.topics });

  // xen kẽ: 2 câu ôn rồi 1 từ mới, cho phiên đỡ đơn điệu
  let d = 0;
  let f = 0;
  while (d < due.length || f < fresh.length) {
    for (let k = 0; k < 2 && d < due.length; k++) push(due[d++]);
    if (f < fresh.length) push(fresh[f++], true);
  }
  // bài output: từ đã tới mức 4 nhưng chưa có trong hàng đợi
  const outputs = Object.entries(learned)
    .filter(([id, p]) => p.stage === 4 && !p.hidden && !queue.some((q) => q.id === id) && inTopic(id))
    .sort((a, b) => (a[1].boxes[4]?.due ?? 0) - (b[1].boxes[4]?.due ?? 0))
    .slice(0, MAX_OUTPUT);
  for (const [id] of outputs) push(id);
  return { pool, queue };
}

// ---------- khung html ----------
function chip(stage) {
  return `<span class="stage-chip stage-${stage}">mức ${stage} · ${STAGE_LABELS[stage]}</span>`;
}

function introHtml(item) {
  const ex = item.examples[0] || '';
  return `
    <div class="study-head"><span class="stage-chip is-new">từ mới</span><span class="tag">${esc(SOURCE_LABELS[item.source] || '')}</span></div>
    <div class="word-big" data-say="${esc(item.phrase)}">
      <p class="word-phrase keep-case">${esc(item.phrase)}</p>
      ${listenButton('nghe cụm này')}
    </div>
    <p class="word-meaning">${esc(item.meaning_vi)}</p>
    ${ex ? `<p class="word-example keep-case" data-say="${esc(ex)}">${esc(ex)} ${listenButton('nghe câu ví dụ', 'listen-small')}</p>` : ''}
    ${item.alternatives.length ? `<p class="word-alts"><span class="alts-label">nhận ra là đủ:</span> <span class="keep-case">${item.alternatives.map(esc).join(' · ')}</span></p>` : ''}
    ${item.note ? `<p class="word-note">${esc(item.note)}</p>` : ''}
    <div class="study-actions"><button class="btn btn-primary" type="button" data-act="intro-done">nhớ rồi, kiểm tra thử</button></div>`;
}

function promptHtml(q) {
  const en = q.promptLang === 'en';
  return `
    <div class="study-head">${chip(q.stage)}</div>
    <div class="q-prompt${en ? ' keep-case' : ''}"${en ? ` data-say="${esc(q.sentence || q.prompt)}"` : ''}>
      <p class="q-text">${esc(q.prompt)}</p>
      ${en ? listenButton('nghe') : ''}
    </div>
    ${q.context ? `<p class="q-context keep-case">${esc(q.context)}</p>` : ''}
    <p class="q-ask">${esc(q.ask)}</p>`;
}

function chooseHtml(q) {
  return `${promptHtml(q)}
    <div class="options" role="group" aria-label="các lựa chọn">
      ${q.options.map((o, i) => `<button class="option${/[a-z]/i.test(o) && q.stage !== 1 ? ' keep-case' : ''}" type="button" data-opt="${i}">${esc(o)}</button>`).join('')}
    </div>
    <div class="q-feedback" data-role="fb" aria-live="polite"></div>
    <div class="study-actions" data-role="next" hidden></div>`;
}

function typeHtml(q) {
  return `${promptHtml(q)}
    <form class="type-form" data-role="type-form" autocomplete="off">
      <input class="input type-input${q.keepCase ? ' keep-case' : ''}" name="answer" type="text" autocapitalize="off" autocorrect="off" spellcheck="false"
        enterkeyhint="done" aria-label="gõ câu trả lời" placeholder="gõ ở đây">
      <p class="q-hint" data-role="hint" aria-live="polite"></p>
      <div class="study-actions">
        <button class="btn btn-primary" type="submit">kiểm tra</button>
        ${q.hints?.length ? '<button class="btn btn-ghost" type="button" data-act="hint">gợi ý</button>' : ''}
        <button class="btn-link" type="button" data-act="giveup">không nhớ</button>
      </div>
    </form>
    <div class="q-feedback" data-role="fb" aria-live="polite"></div>
    <div class="study-actions" data-role="next" hidden></div>`;
}

function outputHtml(q, item) {
  const both = q.outputModes.length > 1;
  return `
    <div class="study-head">${chip(4)}<span class="tag">output</span></div>
    <div class="word-big" data-say="${esc(item.phrase)}">
      <p class="word-phrase keep-case">${esc(item.phrase)}</p>
      ${listenButton('nghe cụm này')}
    </div>
    <p class="word-meaning">${esc(item.meaning_vi)}</p>
    ${q.question ? `<p class="q-context keep-case">${esc(q.question)}</p>` : ''}
    ${both ? `
      <div class="segmented segmented-fit out-modes" role="radiogroup" aria-label="cách làm">
        <label class="segment-choice"><input type="radio" name="out-mode" value="write" checked><span>viết</span></label>
        <label class="segment-choice"><input type="radio" name="out-mode" value="speak"><span>nói to</span></label>
      </div>` : ''}
    <div data-role="out-body"></div>
    <div data-role="out-review" hidden></div>`;
}

function outBodyHtml(mode) {
  if (mode === 'speak') {
    return `
      <p class="q-ask">nói to 1 câu trả lời có dùng cụm này, khoảng 15–20 giây. không ghi âm đâu, cứ nói thoải mái.</p>
      <label class="field">
        <span class="field-label">ghi lại ý chính (tuỳ chọn, để nhờ claude chấm)</span>
        <textarea class="input out-text keep-case" rows="2" autocapitalize="sentences" spellcheck="true"></textarea>
      </label>
      <div class="study-actions"><button class="btn btn-primary" type="button" data-act="out-done">mình nói xong rồi</button></div>`;
  }
  return `
    <p class="q-ask">tự viết 1 câu của riêng bạn có dùng cụm này (từ 5 chữ trở lên)</p>
    <label class="field">
      <span class="sr-only">câu của bạn</span>
      <textarea class="input out-text keep-case" rows="3" autocapitalize="sentences" spellcheck="true" placeholder="viết bằng tiếng anh, viết hoa đầu câu nha"></textarea>
      <span class="field-note" data-role="wc">0 chữ</span>
    </label>
    <div class="study-actions"><button class="btn btn-primary" type="button" data-act="out-done">xong, xem câu mẫu</button></div>`;
}

function outReviewHtml(q, item, text, mode) {
  const warn = mode === 'write' && text && !usesPhrase(text, item) ? `<p class="q-warn">câu này chưa thấy cụm "${esc(item.phrase)}". vẫn chấm được, nhưng nhớ dùng đúng cụm nha.</p>` : '';
  return `
    ${text ? `<div class="out-mine"><p class="out-label">câu của bạn</p><p class="keep-case">${esc(text)}</p></div>` : ''}
    ${warn}
    <div class="out-samples">
      <p class="out-label">câu mẫu tham khảo</p>
      ${q.samples.map((s) => `<p class="keep-case" data-say="${esc(s)}">${esc(s)} ${listenButton('nghe câu mẫu', 'listen-small')}</p>`).join('')}
    </div>
    <fieldset class="checklist">
      <legend class="out-label">tự chấm</legend>
      ${q.checklist.map((c, i) => `<label class="check"><input type="checkbox" data-check="${i}"><span>${esc(c)}</span></label>`).join('')}
    </fieldset>
    <div class="study-actions">
      <button class="btn btn-primary" type="button" data-act="out-pass" disabled>đạt, tính là đã dùng được</button>
      <button class="btn btn-ghost" type="button" data-act="out-fail">chưa ổn, để lần sau</button>
    </div>`;
}

function summaryHtml(s, title) {
  const acc = s.graded ? Math.round((s.right / s.graded) * 100) : null;
  return `
    <div class="summary">
      <h2 class="card-title">${s.asked ? 'xong phiên rồi' : 'hôm nay không còn gì đến hạn'}</h2>
      ${s.asked ? `
      <ul class="summary-stats" role="list">
        <li><span class="sum-num">${s.right}/${s.graded}</span><span>câu đúng${acc !== null ? ` · ${acc}%` : ''}</span></li>
        <li><span class="sum-num">+${s.turns}</span><span>lượt</span></li>
        <li><span class="sum-num">${s.fresh}</span><span>từ mới</span></li>
        <li><span class="sum-num">${s.promoted}</span><span>lần lên mức</span></li>
        <li><span class="sum-num">${s.output}</span><span>từ vào kho output</span></li>
        <li><span class="sum-num">+${s.xp}</span><span>xp</span></li>
      </ul>` : `<p class="card-text">${title === 'ôn lỗi sai' ? 'chưa có từ nào hay sai. ngon.' : 'từ mới hôm nay cũng đủ rồi. muốn học thêm thì tăng số từ mới trong cài đặt.'}</p>`}
      <div class="study-actions">
        ${s.wrote ? '<a class="btn btn-primary" href="#/grade">nhờ claude chấm câu hôm nay</a>' : ''}
        <a class="btn ${s.wrote ? 'btn-ghost' : 'btn-primary'}" href="#/vocab">về kho từ</a>
        <a class="btn btn-ghost" href="#/home">trang chủ</a>
      </div>
    </div>`;
}

// ---------- màn ----------
export function render(view, { params = [] } = {}) {
  const [a, b] = params;
  const mode = a === 'mistakes' ? 'mistakes' : a === 'word' ? 'word' : a === 'topic' ? 'topic' : 'today';
  const title = TITLES[mode];

  view.innerHTML = `
    ${pageHead({ title, sub: 'mỗi câu trả lời đều tính lượt', actions: '<a class="btn btn-ghost btn-small" href="#/vocab">thoát</a>' })}
    <div class="study">
      <div class="study-top">
        <div class="study-bunny"></div>
        <div class="bubble-slot study-bubble"></div>
        <div class="study-progress">
          <div class="mini-bar" role="progressbar" aria-label="tiến độ phiên học" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0"><span style="width:0%"></span></div>
          <p class="study-count" data-role="count">đang chuẩn bị…</p>
        </div>
      </div>
      <section class="card study-card" data-role="card" aria-live="polite"><p class="card-text">đang soạn bài…</p></section>
    </div>`;

  const card = view.querySelector('[data-role="card"]');
  const bar = view.querySelector('.study-progress .mini-bar');
  const countEl = view.querySelector('[data-role="count"]');
  const bunny = createBunny({ state: 'happy', size: 76, skin: getEquippedSkin() });
  const bubble = createBubble();
  view.querySelector('.study-bunny').prepend(bunny.node);
  view.querySelector('.study-bubble').append(bubble.node);
  wireListen(view);

  let alive = true;
  let queue = [];
  let pool = [];
  let pos = 0;
  let total = 0;
  const asks = new Map();
  const stats = { asked: 0, graded: 0, right: 0, turns: 0, xp: 0, fresh: 0, promoted: 0, output: 0, wrote: false };
  const name = getState().profile.name;

  const talk = async (group, ctx = {}, opts = {}) => {
    const line = await say(group, { ...currentVoiceContext(), ...ctx, ...(name ? { name } : {}) }, opts);
    if (alive && line) bubble.say(line.text || '', line.kao);
  };

  const setProgress = () => {
    total = Math.max(total, queue.length);
    const done = Math.min(pos, total);
    bar.querySelector('span').style.width = `${total ? Math.round((done / total) * 100) : 0}%`;
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(done));
    countEl.textContent = total ? `${done}/${total} câu · +${stats.turns} lượt` : '';
  };

  // phản ứng sau mỗi câu: sự kiện lớn (đủ mục tiêu, lên cấp…) ưu tiên, còn lại thoại đúng / sai
  const react = async (rec, correct, item) => {
    stats.turns += rec.result.goalTurns || 0;
    stats.xp += rec.result.xp || 0;
    if (rec.promoted) stats.promoted += 1;
    if (rec.output) stats.output += 1;
    if (!rec.result.counted && rec.result.reason) showToast(reasonText(rec.result.reason), '(・_・;)');
    const main = await celebrate(rec.events, { bubble, bunny });
    if (main || !alive) return;
    if (rec.output) { talk('tu_output', { word: item.phrase }, { forceLine: true }); bunny.setState('heart'); return; }
    if (correct === null) return;
    bunny.setState(correct ? 'happy' : 'sad');
    if (correct) bunny.hop();
    talk(correct ? 'dung' : 'sai', {}, {});
  };

  const next = () => {
    if (!alive) return;
    if (pos >= queue.length) { finish(); return; }
    const entry = queue[pos];
    const item = pool.find((x) => x.id === entry.id);
    if (!item) { pos += 1; next(); return; }
    setProgress();
    bunny.setState('happy');
    if (entry.intro) { showIntro(item); return; }
    const p = getVocab().items[item.id];
    const stage = entry.stage || p?.stage || 1;
    ask(item, makeQuestion(item, stage, pool));
  };

  const advance = () => { pos += 1; next(); };

  // từ mới: thẻ giới thiệu, rồi hỏi mức 1 ngay
  const showIntro = (item) => {
    startLearning(item.id);
    stats.fresh += 1;
    card.innerHTML = introHtml(item);
    talk('tu_moi', { word: item.phrase }, { forceLine: true });
    play('flip');
    card.querySelector('[data-act="intro-done"]').addEventListener('click', () => {
      queue[pos] = { id: item.id, intro: false, stage: 1 };
      next();
    });
    card.querySelector('[data-act="intro-done"]').focus({ preventScroll: true });
  };

  // sau câu đúng ở mức thấp (từ mới trong phiên): hỏi tiếp mức kế, chen sau vài câu
  const maybeFollowUp = (item, rec) => {
    const n = asks.get(item.id) || 0;
    if (rec.promoted && n < MAX_ASKS_PER_ITEM) {
      const p = getVocab().items[item.id];
      if (p.stage <= 2) queue.splice(Math.min(queue.length, pos + 1 + RETRY_GAP), 0, { id: item.id, stage: p.stage });
    }
  };

  const retryLater = (item, stage) => {
    const n = asks.get(item.id) || 0;
    if (n < MAX_ASKS_PER_ITEM) queue.splice(Math.min(queue.length, pos + 1 + RETRY_GAP), 0, { id: item.id, stage });
  };

  const nextButtons = (wrap, { allowHard = false, onHard = null } = {}) => {
    wrap.hidden = false;
    wrap.innerHTML = `
      <button class="btn btn-primary" type="button" data-act="next">tiếp</button>
      ${allowHard ? '<button class="btn btn-ghost" type="button" data-act="hard">khó, cho gặp lại sớm</button>' : ''}`;
    wrap.querySelector('[data-act="next"]').addEventListener('click', advance);
    wrap.querySelector('[data-act="hard"]')?.addEventListener('click', () => { onHard?.(); advance(); });
    wrap.querySelector('[data-act="next"]').focus({ preventScroll: true });
  };

  const explain = (item, q, ok, extra = '') => {
    const ex = item.examples[0];
    return `
      <p class="fb-line ${ok ? 'is-right' : 'is-wrong'}"><span class="fb-icon" aria-hidden="true">${ok ? '✓' : '✗'}</span>${ok ? 'đúng rồi' : 'chưa đúng'}</p>
      ${extra}
      <p class="fb-answer"><span class="keep-case">${esc(q.answer && q.stage !== 1 ? q.answer : item.phrase)}</span> · ${esc(item.meaning_vi)}</p>
      ${q.why ? `<p class="card-text">${esc(q.why)}</p>` : ''}
      ${ex ? `<p class="fb-example keep-case" data-say="${esc(ex)}">${esc(ex)} ${listenButton('nghe câu ví dụ', 'listen-small')}</p>` : ''}`;
  };

  const ask = (item, q) => {
    asks.set(item.id, (asks.get(item.id) || 0) + 1);
    stats.asked += 1;
    const shownAt = performance.now();
    if (q.mode === 'output') { askOutput(item, q); return; }

    card.innerHTML = q.mode === 'choose' ? chooseHtml(q) : typeHtml(q);
    const fb = card.querySelector('[data-role="fb"]');
    const nextWrap = card.querySelector('[data-role="next"]');
    if (q.stage === 1 && q.promptLang === 'en') setTimeout(() => alive && speak(q.prompt), 250);

    const settle = (correct, given, extra, flags = {}) => {
      stats.graded += 1;
      if (correct) stats.right += 1;
      feedback(correct ? 'right' : 'wrong');
      if (correct) heartBurst(card.querySelector('.q-prompt') || card);
      const rec = answer(item, q, { correct, answer: given, ms: Math.round(performance.now() - shownAt), hinted: flags.hinted });
      fb.innerHTML = explain(item, q, correct, extra);
      react(rec, correct, item);
      if (correct) maybeFollowUp(item, rec); else retryLater(item, q.stage);
      let hardDone = false;
      nextButtons(nextWrap, {
        allowHard: correct && !flags.hinted,
        onHard: () => {
          if (hardDone) return;
          hardDone = true;
          markHard(item.id, q.stage);
        },
      });
    };

    if (q.mode === 'choose') {
      const buttons = [...card.querySelectorAll('[data-opt]')];
      buttons.forEach((btn) => btn.addEventListener('click', () => {
        const picked = q.options[Number(btn.dataset.opt)];
        const ok = picked === q.answer;
        for (const x of buttons) {
          x.disabled = true;
          const v = q.options[Number(x.dataset.opt)];
          if (v === q.answer) x.classList.add('is-right');
          else if (x === btn) x.classList.add('is-wrong');
        }
        settle(ok, picked);
      }, { once: true }));
      buttons[0]?.focus({ preventScroll: true });
      return;
    }

    // gõ
    const form = card.querySelector('[data-role="type-form"]');
    const input = form.querySelector('input');
    const hintEl = form.querySelector('[data-role="hint"]');
    let hintStep = 0;
    let done = false;
    setTimeout(() => alive && input.focus({ preventScroll: true }), 60);
    form.querySelector('[data-act="hint"]')?.addEventListener('click', () => {
      if (hintStep >= q.hints.length) return;
      hintEl.textContent = q.hints.slice(0, hintStep + 1).join(' · ');
      hintStep += 1;
      if (hintStep === 1) talk('goi_y', {}, { forceLine: true });
      input.focus();
    });
    const finishType = (given, giveUp = false) => {
      if (done) return;
      done = true;
      let res;
      if (giveUp) res = { ok: false };
      else if (q.answer) res = checkAgainst(given, q.answer);
      else res = checkTyped(given, item);
      let extra = '';
      if (res.typo) extra = '<p class="card-text">gần đúng, sai 1 ký tự thôi. nhìn lại chính tả nha.</p>';
      if (res.viaAlternative) extra = `<p class="card-text">đúng là cách nói tương tự. cụm chính trong sổ là <b class="keep-case">${esc(item.phrase)}</b>.</p>`;
      if (q.tag === 'fix' && res.ok && given.trim() && given.trim()[0] !== given.trim()[0].toUpperCase()) {
        extra += '<p class="card-text">nhớ viết hoa chữ đầu câu nha, ielts chấm cả cái này.</p>';
      }
      input.disabled = true;
      form.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      form.classList.add(res.ok ? 'is-right' : 'is-wrong');
      settle(res.ok, given, extra, { hinted: hintStep > 0 });
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input.value.trim()) { input.focus(); return; }
      finishType(input.value);
    });
    form.querySelector('[data-act="giveup"]').addEventListener('click', () => finishType('', true));
  };

  // mức 4: tự viết hoặc nói to, xem câu mẫu, tự chấm
  const askOutput = (item, q) => {
    card.innerHTML = outputHtml(q, item);
    const body = card.querySelector('[data-role="out-body"]');
    const reviewEl = card.querySelector('[data-role="out-review"]');
    let mode = q.outputModes[0];
    const shownAt = performance.now();

    const drawBody = () => {
      body.innerHTML = outBodyHtml(mode);
      bunny.setState(mode === 'speak' ? 'mic' : 'pen');
      talk(mode === 'speak' ? 'noi_to' : 'tu_viet', {}, { forceLine: true });
      const ta = body.querySelector('textarea');
      const wc = body.querySelector('[data-role="wc"]');
      ta.addEventListener('input', () => { if (wc) wc.textContent = `${wordCount(ta.value)} chữ`; });
      body.querySelector('[data-act="out-done"]').addEventListener('click', () => {
        const text = ta.value.trim();
        if (mode === 'write' && !text) { ta.focus(); return; }
        if (mode === 'write' && text && text[0] !== text[0].toUpperCase()) showToast('nhớ viết hoa chữ đầu câu nha', '(・ω・)ノ');
        card.querySelector('.out-modes')?.remove();
        body.hidden = true;
        reviewEl.hidden = false;
        reviewEl.innerHTML = outReviewHtml(q, item, text, mode);
        const boxes = [...reviewEl.querySelectorAll('[data-check]')];
        const pass = reviewEl.querySelector('[data-act="out-pass"]');
        boxes.forEach((c) => c.addEventListener('change', () => { pass.disabled = !boxes.every((x) => x.checked); }));
        const settleOut = (passed) => {
          reviewEl.querySelectorAll('button, input').forEach((x) => { x.disabled = true; });
          const rec = answer(item, q, { ms: Math.round(performance.now() - shownAt), output: { mode, text, passed } });
          if (mode === 'write' && text) stats.wrote = true;
          if (passed) { feedback('right'); heartBurst(reviewEl); } else play('tap');
          react(rec, passed ? true : null, item);
          const wrap = document.createElement('div');
          wrap.className = 'study-actions';
          reviewEl.append(wrap);
          nextButtons(wrap);
        };
        pass.addEventListener('click', () => settleOut(true));
        reviewEl.querySelector('[data-act="out-fail"]').addEventListener('click', () => settleOut(false));
      });
    };
    for (const r of card.querySelectorAll('input[name="out-mode"]')) {
      r.addEventListener('change', () => { if (r.checked) { mode = r.value; drawBody(); } });
    }
    drawBody();
  };

  const finish = () => {
    pos = queue.length;
    setProgress();
    countEl.textContent = stats.asked ? `xong · +${stats.turns} lượt` : '';
    card.innerHTML = summaryHtml(stats, title);
    if (stats.asked) {
      play('done');
      bunny.setState('dance');
      talk(stats.graded && stats.right === stats.graded && stats.graded >= 5 ? 'diem_tuyet_doi' : 'dung', {}, { forceLine: true });
    } else {
      bunny.setState('sleep');
    }
  };

  buildQueue(mode, b).then((r) => {
    if (!alive) return;
    pool = r.pool;
    queue = r.queue;
    total = queue.length;
    if (!queue.length) { finish(); return; }
    // tổng câu ước chừng: từ mới hỏi thêm 1–2 câu trong phiên
    total = queue.length + queue.filter((q) => q.intro).length;
    next();
  }).catch((err) => {
    console.error(err);
    card.innerHTML = '<p class="card-text">ủa alo, chưa tải được kho từ. thử lại giùm tui nha.</p>';
  });

  return () => {
    alive = false;
    bunny.destroy();
    bubble.destroy();
  };
}
