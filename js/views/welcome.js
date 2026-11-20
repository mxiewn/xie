// xie · views/welcome.js — làm quen (onboarding) 5 bước, thỏ dẫn dắt, vuốt qua lại được.
// tên → band mục tiêu → ngày thi (tuỳ chọn) → mục tiêu lượt mỗi ngày → kỹ năng yếu nhất + chủ đề ưu tiên.
// mở lần đầu thì router tự đưa vào đây; trong cài đặt có nút "làm lại phần làm quen" (giữ sẵn dữ liệu cũ).

import { createBunny } from '../bunny.js';
import { createBubble, esc } from '../ui.js';
import { getState, updateProfile, setOnboarded } from '../state.js';
import { say } from '../voice.js';
import { getEquippedSkin } from '../levels.js';
import { TOPICS, SKILLS, GOAL_OPTIONS } from '../topics.js';
import { todayIn, daysBetween, cleanName, isValidDate, NAME_MAX, MAX_TOPICS, BANDS } from '../state-core.js';

const STEPS = [
  { id: 'name', bunny: 'happy', voice: 'hello' },
  { id: 'band', bunny: 'crown', voice: 'band' },
  { id: 'exam', bunny: 'pen', voice: 'exam' },
  { id: 'goal', bunny: 'carrot', voice: 'goal' },
  { id: 'focus', bunny: 'heart', voice: 'focus' },
];

const radio = (name, value, checked, label, desc = '') => `
  <label class="choice">
    <input type="radio" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}>
    <span class="choice-mark" aria-hidden="true"></span>
    <span class="choice-text">
      <span class="choice-label">${label}</span>
      ${desc ? `<span class="choice-desc">${desc}</span>` : ''}
    </span>
  </label>`;

export function render(view) {
  const today = todayIn();
  const draft = { ...getState().profile, topics: [...getState().profile.topics] };
  let step = 0;
  let finishing = false;
  let later = 0;

  view.innerHTML = `
    <section class="welcome">
      <div class="welcome-stage">
        <div class="welcome-bubble"></div>
        <div class="welcome-bunny"></div>
      </div>
      <div class="card card-lace welcome-panel">
        <div class="welcome-progress">
          <span class="welcome-count"></span>
          <div class="welcome-dots" aria-hidden="true">${STEPS.map(() => '<span></span>').join('')}</div>
        </div>
        <form class="welcome-form" novalidate>
          <div class="welcome-step"></div>
          <p class="welcome-error" role="alert" hidden></p>
          <div class="welcome-nav">
            <button type="button" class="btn btn-ghost" data-action="back">quay lại</button>
            <button type="submit" class="btn btn-primary" data-action="next">tiếp</button>
          </div>
        </form>
        <p class="welcome-swipe">vuốt sang trái để đi tiếp, sang phải để quay lại</p>
      </div>
    </section>
  `;

  const bunny = createBunny({ state: 'happy', skin: getEquippedSkin(), label: 'thỏ của xie đang dẫn đường' });
  const bubble = createBubble();
  view.querySelector('.welcome-bunny').append(bunny.node);
  view.querySelector('.welcome-bubble').append(bubble.node);

  const form = view.querySelector('.welcome-form');
  const box = view.querySelector('.welcome-step');
  const error = view.querySelector('.welcome-error');
  const backBtn = view.querySelector('[data-action="back"]');
  const nextBtn = view.querySelector('[data-action="next"]');
  const count = view.querySelector('.welcome-count');
  const dots = [...view.querySelectorAll('.welcome-dots span')];

  let alive = true;
  const speak = async (kind, ctx = {}) => {
    const line = await say('onboarding', { kind, ...ctx }, { forceLine: true });
    if (alive && line) bubble.say(line.text || '', line.kao);
  };

  function stepHtml(id) {
    if (id === 'name') {
      return `
        <h1 class="welcome-title">bạn tên gì?</h1>
        <p class="welcome-hint">tui sẽ gọi bạn bằng tên này. đổi lại trong cài đặt lúc nào cũng được.</p>
        <label class="field">
          <span class="field-label">tên hoặc biệt danh</span>
          <input class="input" name="name" type="text" maxlength="${NAME_MAX}" autocomplete="nickname"
            autocapitalize="off" spellcheck="false" enterkeyhint="next" value="${esc(draft.name)}">
        </label>`;
    }
    if (id === 'band') {
      return `
        <h1 class="welcome-title">band mục tiêu</h1>
        <p class="welcome-hint">tui sẽ chọn từ và câu mẫu theo mức này.</p>
        <div class="choice-list choice-grid" role="radiogroup" aria-label="band mục tiêu">
          ${BANDS.map((b) => radio('band', b, draft.target_band === b, `band ${b.toFixed(1)}`)).join('')}
        </div>`;
    }
    if (id === 'exam') {
      return `
        <h1 class="welcome-title">ngày thi của bạn</h1>
        <p class="welcome-hint">có ngày thi thì trang chủ sẽ đếm ngược. bước này không bắt buộc.</p>
        <label class="field">
          <span class="field-label">ngày thi</span>
          <input class="input" name="exam" type="date" min="${today}" value="${esc(draft.exam_date || '')}">
        </label>
        <p class="welcome-note" data-role="countdown"></p>
        <button type="button" class="btn-link" data-action="no-exam">chưa có ngày thi, để sau</button>`;
    }
    if (id === 'goal') {
      return `
        <h1 class="welcome-title">mỗi ngày bao nhiêu lượt?</h1>
        <p class="welcome-hint">1 lượt là 1 câu trả lời. bài tự viết hay tự nói được tính nhiều lượt hơn.</p>
        <div class="choice-list" role="radiogroup" aria-label="mục tiêu lượt mỗi ngày">
          ${GOAL_OPTIONS.map((g) => radio('goal', g.value, draft.daily_goal === g.value,
            `${g.label}${g.value === 50 ? ' <span class="tag">mặc định</span>' : ''}`, g.desc)).join('')}
        </div>`;
    }
    return `
      <h1 class="welcome-title">học gì trước?</h1>
      <p class="field-label" id="skill-label">kỹ năng bạn thấy yếu nhất</p>
      <div class="choice-list choice-grid" role="radiogroup" aria-labelledby="skill-label">
        ${SKILLS.map((s) => radio('skill', s.id, draft.weak_skill === s.id, s.label, s.desc)).join('')}
      </div>
      <p class="field-label" id="topic-label">chủ đề ưu tiên <span class="field-note">tối đa ${MAX_TOPICS}, không bắt buộc</span></p>
      <div class="chip-list" role="group" aria-labelledby="topic-label">
        ${TOPICS.map((t) => `
          <label class="chip">
            <input type="checkbox" name="topic" value="${t.id}"${draft.topics.includes(t.id) ? ' checked' : ''}>
            <span>${esc(t.label)}</span>
          </label>`).join('')}
      </div>`;
  }

  function syncCountdown() {
    const out = box.querySelector('[data-role="countdown"]');
    if (!out) return;
    const days = draft.exam_date ? daysBetween(today, draft.exam_date) : null;
    out.textContent = days === null ? '' : days === 0 ? 'thi hôm nay luôn' : `còn ${days} ngày nữa`;
  }

  function syncTopicLimit() {
    const boxes = [...box.querySelectorAll('input[name="topic"]')];
    const full = boxes.filter((b) => b.checked).length >= MAX_TOPICS;
    for (const b of boxes) b.disabled = full && !b.checked;
  }

  function bindStep(id) {
    if (id === 'name') {
      const input = box.querySelector('input[name="name"]');
      input.addEventListener('input', () => { draft.name = input.value; hideError(); });
    }
    if (id === 'band') {
      for (const r of box.querySelectorAll('input[name="band"]')) {
        r.addEventListener('change', () => { draft.target_band = Number(r.value); });
      }
    }
    if (id === 'exam') {
      const input = box.querySelector('input[name="exam"]');
      input.addEventListener('input', () => { draft.exam_date = input.value || null; hideError(); syncCountdown(); });
      box.querySelector('[data-action="no-exam"]').addEventListener('click', () => {
        draft.exam_date = null;
        input.value = '';
        go(step + 1);
      });
      syncCountdown();
    }
    if (id === 'goal') {
      for (const r of box.querySelectorAll('input[name="goal"]')) {
        r.addEventListener('change', () => { draft.daily_goal = Number(r.value); });
      }
    }
    if (id === 'focus') {
      for (const r of box.querySelectorAll('input[name="skill"]')) {
        r.addEventListener('change', () => { draft.weak_skill = r.value; hideError(); });
      }
      for (const c of box.querySelectorAll('input[name="topic"]')) {
        c.addEventListener('change', () => {
          draft.topics = [...box.querySelectorAll('input[name="topic"]:checked')].map((x) => x.value);
          syncTopicLimit();
        });
      }
      syncTopicLimit();
    }
  }

  function showError(text) {
    error.textContent = text;
    error.hidden = false;
  }

  function hideError() {
    error.hidden = true;
  }

  // kiểm tra bước hiện tại trước khi đi tiếp. trả về chuỗi lỗi (viết thường) hoặc ''
  function problem(id) {
    if (id === 'name' && !cleanName(draft.name)) return 'nhập tên hoặc biệt danh giúp tui nha';
    if (id === 'exam' && draft.exam_date) {
      if (!isValidDate(draft.exam_date)) return 'ngày thi chưa đúng định dạng';
      if (daysBetween(today, draft.exam_date) < 0) return 'ngày thi phải từ hôm nay trở đi';
    }
    if (id === 'focus' && !draft.weak_skill) return 'chọn một kỹ năng nha';
    return '';
  }

  function showStep(direction = 0) {
    const s = STEPS[step];
    box.innerHTML = stepHtml(s.id);
    box.classList.remove('is-enter-next', 'is-enter-back');
    if (direction) {
      void box.offsetWidth;
      box.classList.add(direction > 0 ? 'is-enter-next' : 'is-enter-back');
    }
    bindStep(s.id);
    hideError();
    count.innerHTML = `bước <b>${step + 1}</b>/${STEPS.length}`;
    dots.forEach((d, i) => { d.className = i < step ? 'is-done' : i === step ? 'is-now' : ''; });
    backBtn.hidden = step === 0;
    nextBtn.textContent = step === STEPS.length - 1 ? 'xong, vào học' : 'tiếp';
    bunny.setState(s.bunny);
    if (direction > 0 && s.id === 'band') speak('named', { name: cleanName(draft.name) });
    else speak(s.voice);
    const first = box.querySelector('input:not([type="checkbox"]):not([type="radio"])');
    if (first && direction) first.focus({ preventScroll: true });
  }

  function go(next) {
    if (finishing || next < 0) return;
    if (next > step) {
      const msg = problem(STEPS[step].id);
      if (msg) { showError(msg); bunny.hop(); return; }
    }
    if (next >= STEPS.length) { finish(); return; }
    const direction = Math.sign(next - step);
    step = next;
    showStep(direction);
  }

  function finish() {
    finishing = true;
    updateProfile({ ...draft, name: cleanName(draft.name) });
    setOnboarded(true);
    nextBtn.disabled = true;
    backBtn.disabled = true;
    bunny.setState('dance');
    speak('done', { name: cleanName(draft.name) });
    later = setTimeout(() => { window.location.hash = '#/home'; }, 1800);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); go(step + 1); });
  backBtn.addEventListener('click', () => go(step - 1));

  // vuốt qua lại (cảm ứng và chuột), bỏ qua khi đang thao tác trong ô nhập
  const panel = view.querySelector('.welcome-panel');
  let start = null;
  panel.addEventListener('pointerdown', (e) => {
    start = e.target.closest('input, select, textarea') ? null : { x: e.clientX, y: e.clientY };
  });
  panel.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(dx < 0 ? step + 1 : step - 1);
  });
  panel.addEventListener('pointercancel', () => { start = null; });

  showStep(0);

  return () => {
    alive = false;
    clearTimeout(later);
    bunny.destroy();
    bubble.destroy();
  };
}
