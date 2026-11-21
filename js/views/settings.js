// xie · views/settings.js — cài đặt (#/settings, thuộc tab tui).
// hồ sơ học (sửa mọi thứ đã chọn lúc làm quen), cỡ chữ, dữ liệu: xuất / nhập / xoá (xoá xác nhận 2 lần).
// học từ vựng: mặt trước thẻ, tỉ lệ nguồn từ mới. giọng đọc en-gb / en-us + tốc độ (ẩn nếu trình duyệt
// không hỗ trợ), âm thanh hiệu ứng, rung.

import { pageHead, icons, esc, showToast } from '../ui.js';
import { getState, updateProfile, updateSettings, setOnboarded, exportFile, importFile, wipeAll, STATE_EVENT } from '../state.js';
import { TOPICS, SKILLS, GOAL_OPTIONS } from '../topics.js';
import { todayIn, daysBetween, cleanName, NAME_MAX, MAX_TOPICS, NEW_WORDS, BANDS, FONT_SIZES, ACCENTS, SPEECH_RATE } from '../state-core.js';
import { RATIO_PRESETS } from '../vocab-core.js';
import { getVocab, setFront } from '../vocab-store.js';
import { speechSupported, speak } from '../speech.js';
import { play, buzz } from '../sound.js';
import { say } from '../voice.js';

const FONT_LABELS = { nho: 'nhỏ', vua: 'vừa', lon: 'lớn' };

async function saved() {
  const line = await say('da_luu', { kind: 'saved' }, { forceLine: true });
  showToast(line?.text || 'đã lưu', line?.kao || '');
}

export function render(view) {
  const today = todayIn();
  const s = getState();
  const p = s.profile;

  view.innerHTML = `
    ${pageHead({
      title: 'cài đặt',
      sub: 'hồ sơ học, hiển thị và dữ liệu',
      actions: '<a class="btn btn-ghost btn-small" href="#/me">quay lại</a>',
    })}
    <div class="page-body settings-body">
      <section class="card settings-card" aria-labelledby="set-profile">
        <h2 class="card-title" id="set-profile"><span class="title-bow">${icons.bow}</span>hồ sơ học</h2>

        <label class="field">
          <span class="field-label">tên gọi</span>
          <input class="input" name="name" type="text" maxlength="${NAME_MAX}" autocomplete="nickname"
            autocapitalize="off" spellcheck="false" value="${esc(p.name)}">
        </label>

        <div class="field">
          <span class="field-label" id="lbl-band">band mục tiêu</span>
          <div class="segmented segmented-fit" role="radiogroup" aria-labelledby="lbl-band">
            ${BANDS.map((b) => `
              <label class="segment-choice">
                <input type="radio" name="band" value="${b}"${p.target_band === b ? ' checked' : ''}>
                <span>band ${b.toFixed(1)}</span>
              </label>`).join('')}
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="set-exam">ngày thi</label>
          <div class="field-row">
            <input class="input" id="set-exam" name="exam" type="date" min="${today}" value="${esc(p.exam_date || '')}">
            <button type="button" class="btn btn-ghost btn-small" data-action="clear-exam">chưa có</button>
          </div>
          <span class="field-note" data-role="exam-note"></span>
        </div>

        <div class="field">
          <span class="field-label" id="lbl-goal">mục tiêu lượt mỗi ngày</span>
          <div class="choice-list choice-grid" role="radiogroup" aria-labelledby="lbl-goal">
            ${GOAL_OPTIONS.map((g) => `
              <label class="choice">
                <input type="radio" name="goal" value="${g.value}"${p.daily_goal === g.value ? ' checked' : ''}>
                <span class="choice-mark" aria-hidden="true"></span>
                <span class="choice-text"><span class="choice-label">${g.label}</span><span class="choice-desc">${g.desc}</span></span>
              </label>`).join('')}
          </div>
        </div>

        <div class="field">
          <span class="field-label" id="lbl-words">số từ mới mỗi ngày</span>
          <div class="stepper" role="group" aria-labelledby="lbl-words">
            <button type="button" class="icon-btn" data-action="words-down" aria-label="bớt một từ">−</button>
            <output class="stepper-value" data-role="words">${p.new_words_per_day}</output>
            <button type="button" class="icon-btn" data-action="words-up" aria-label="thêm một từ">+</button>
          </div>
          <span class="field-note">từ ${NEW_WORDS.min} tới ${NEW_WORDS.max} từ, mặc định ${NEW_WORDS.fallback}</span>
        </div>

        <div class="field">
          <span class="field-label" id="lbl-skill">kỹ năng yếu nhất</span>
          <div class="choice-list choice-grid" role="radiogroup" aria-labelledby="lbl-skill">
            ${SKILLS.map((k) => `
              <label class="choice">
                <input type="radio" name="skill" value="${k.id}"${p.weak_skill === k.id ? ' checked' : ''}>
                <span class="choice-mark" aria-hidden="true"></span>
                <span class="choice-text"><span class="choice-label">${k.label}</span><span class="choice-desc">${k.desc}</span></span>
              </label>`).join('')}
          </div>
        </div>

        <div class="field">
          <span class="field-label" id="lbl-topics">chủ đề ưu tiên <span class="field-note">tối đa ${MAX_TOPICS}</span></span>
          <div class="chip-list" role="group" aria-labelledby="lbl-topics">
            ${TOPICS.map((t) => `
              <label class="chip">
                <input type="checkbox" name="topic" value="${t.id}"${p.topics.includes(t.id) ? ' checked' : ''}>
                <span>${esc(t.label)}</span>
              </label>`).join('')}
          </div>
        </div>
      </section>

      <section class="card settings-card" aria-labelledby="set-display">
        <h2 class="card-title" id="set-display"><span class="title-bow">${icons.bow}</span>hiển thị</h2>
        <div class="field">
          <span class="field-label" id="lbl-font">cỡ chữ</span>
          <div class="segmented segmented-fit" role="radiogroup" aria-labelledby="lbl-font">
            ${FONT_SIZES.map((f) => `
              <label class="segment-choice">
                <input type="radio" name="font" value="${f}"${s.settings.font_size === f ? ' checked' : ''}>
                <span>${FONT_LABELS[f]}</span>
              </label>`).join('')}
          </div>
        </div>
        <p class="card-text">chế độ sáng / tối và thỏ nói nhiều hay ít nằm ở tab <a href="#/me">tui</a>.</p>
      </section>

      <section class="card settings-card" aria-labelledby="set-learn">
        <h2 class="card-title" id="set-learn"><span class="title-bow">${icons.bow}</span>học từ vựng</h2>
        <div class="field">
          <span class="field-label" id="lbl-front">mặt trước thẻ</span>
          <div class="segmented segmented-fit" role="radiogroup" aria-labelledby="lbl-front">
            ${[['en', 'en → vi'], ['vi', 'vi → en'], ['random', 'ngẫu nhiên']].map(([v, l]) => `
              <label class="segment-choice"><input type="radio" name="front" value="${v}"${getVocab().front === v ? ' checked' : ''}><span>${l}</span></label>`).join('')}
          </div>
        </div>
        <div class="field">
          <span class="field-label" id="lbl-ratio">từ mới lấy từ đâu</span>
          <div class="choice-list" role="radiogroup" aria-labelledby="lbl-ratio">
            ${Object.entries(RATIO_PRESETS).map(([k, r]) => `
              <label class="choice">
                <input type="radio" name="ratio" value="${k}"${s.settings.new_ratio === k ? ' checked' : ''}>
                <span class="choice-mark" aria-hidden="true"></span>
                <span class="choice-text"><span class="choice-label">${r.label}${k === 'can_bang' ? ' <span class="tag">mặc định</span>' : ''}</span><span class="choice-desc">${r.desc}</span></span>
              </label>`).join('')}
          </div>
          <span class="field-note">số từ mới mỗi ngày chỉnh ở phần hồ sơ học phía trên</span>
        </div>
      </section>

      <section class="card settings-card" aria-labelledby="set-sound">
        <h2 class="card-title" id="set-sound"><span class="title-bow">${icons.bow}</span>giọng đọc & âm thanh</h2>
        ${speechSupported() ? `
        <div class="field">
          <span class="field-label" id="lbl-accent">giọng đọc</span>
          <div class="segmented segmented-fit" role="radiogroup" aria-labelledby="lbl-accent">
            ${ACCENTS.map((a) => `<label class="segment-choice"><input type="radio" name="accent" value="${a}"${s.settings.speech_accent === a ? ' checked' : ''}><span>${a === 'en-GB' ? 'anh (en-gb)' : 'mỹ (en-us)'}</span></label>`).join('')}
          </div>
        </div>
        <label class="range-row">
          <span>tốc độ đọc: <b data-role="rate">${s.settings.speech_rate.toFixed(2)}</b></span>
          <input type="range" min="${SPEECH_RATE.min}" max="${SPEECH_RATE.max}" step="0.05" value="${s.settings.speech_rate}" data-act="rate">
        </label>
        <button type="button" class="btn btn-ghost btn-small" data-act="try-voice">nghe thử</button>` : ''}
        <label class="check"><input type="checkbox" data-act="sound"${s.settings.sound ? ' checked' : ''}><span>âm thanh hiệu ứng</span></label>
        <label class="check"><input type="checkbox" data-act="vibrate"${s.settings.vibrate ? ' checked' : ''}><span>rung nhẹ (khi máy hỗ trợ)</span></label>
      </section>

      <section class="card settings-card" aria-labelledby="set-data">
        <h2 class="card-title" id="set-data"><span class="title-bow">${icons.bow}</span>dữ liệu</h2>
        <p class="card-text">mọi thứ chỉ lưu trên trình duyệt này. xuất file để sao lưu hoặc chuyển sang máy khác.</p>
        <div class="lab-buttons">
          <button type="button" class="btn btn-primary" data-action="export">xuất dữ liệu</button>
          <label class="btn btn-ghost file-btn">
            nhập dữ liệu
            <input type="file" accept="application/json,.json" data-action="import">
          </label>
        </div>
        <button type="button" class="btn-link" data-action="redo">làm lại phần làm quen</button>

        <div class="danger-zone">
          <p class="danger-title">xoá toàn bộ dữ liệu</p>
          <p class="card-text">xoá hồ sơ, chuỗi ngày, tủ đồ, lịch sử thoại trên trình duyệt này. không lấy lại được.</p>
          <button type="button" class="btn btn-danger" data-action="wipe-1">xoá dữ liệu</button>
          <div class="danger-confirm" hidden>
            <p class="danger-ask">chắc chưa? bấm thêm một lần nữa là xoá hẳn.</p>
            <div class="lab-buttons">
              <button type="button" class="btn btn-danger" data-action="wipe-2">xoá hẳn</button>
              <button type="button" class="btn btn-ghost" data-action="wipe-cancel">thôi, giữ lại</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  const $ = (sel) => view.querySelector(sel);
  const $$ = (sel) => [...view.querySelectorAll(sel)];

  // ---------- hồ sơ ----------
  const nameInput = $('input[name="name"]');
  nameInput.addEventListener('change', () => {
    const name = cleanName(nameInput.value);
    if (!name) { nameInput.value = getState().profile.name; showToast('tên không được để trống nha'); return; }
    updateProfile({ name });
    nameInput.value = name;
    saved();
  });

  for (const r of $$('input[name="band"]')) {
    r.addEventListener('change', () => { updateProfile({ target_band: Number(r.value) }); saved(); });
  }

  const exam = $('input[name="exam"]');
  const examNote = $('[data-role="exam-note"]');
  const syncExam = () => {
    const d = getState().profile.exam_date;
    const days = d ? daysBetween(today, d) : null;
    examNote.textContent = days === null ? 'chưa đặt ngày thi' : days < 0 ? 'ngày thi đã qua, chọn ngày mới nha' : days === 0 ? 'thi hôm nay' : `còn ${days} ngày`;
  };
  exam.addEventListener('change', () => {
    if (exam.value && daysBetween(today, exam.value) < 0) { showToast('ngày thi phải từ hôm nay trở đi'); exam.value = getState().profile.exam_date || ''; return; }
    updateProfile({ exam_date: exam.value || null });
    syncExam();
    saved();
  });
  $('[data-action="clear-exam"]').addEventListener('click', () => {
    exam.value = '';
    updateProfile({ exam_date: null });
    syncExam();
    saved();
  });
  syncExam();

  for (const r of $$('input[name="goal"]')) {
    r.addEventListener('change', () => { updateProfile({ daily_goal: Number(r.value) }); saved(); });
  }

  const words = $('[data-role="words"]');
  const stepWords = (delta) => {
    const next = updateProfile({ new_words_per_day: getState().profile.new_words_per_day + delta });
    words.textContent = next.profile.new_words_per_day;
    saved();
  };
  $('[data-action="words-down"]').addEventListener('click', () => stepWords(-1));
  $('[data-action="words-up"]').addEventListener('click', () => stepWords(1));

  for (const r of $$('input[name="skill"]')) {
    r.addEventListener('change', () => { updateProfile({ weak_skill: r.value }); saved(); });
  }

  const topicBoxes = $$('input[name="topic"]');
  const syncTopics = () => {
    const full = topicBoxes.filter((b) => b.checked).length >= MAX_TOPICS;
    for (const b of topicBoxes) b.disabled = full && !b.checked;
  };
  for (const c of topicBoxes) {
    c.addEventListener('change', () => {
      updateProfile({ topics: topicBoxes.filter((b) => b.checked).map((b) => b.value) });
      syncTopics();
      saved();
    });
  }
  syncTopics();

  // ---------- học từ vựng ----------
  for (const r of view.querySelectorAll('input[name="front"]')) {
    r.addEventListener('change', () => { if (r.checked) { setFront(r.value); saved(); } });
  }
  for (const r of view.querySelectorAll('input[name="ratio"]')) {
    r.addEventListener('change', () => { if (r.checked) { updateSettings({ new_ratio: r.value }); saved(); } });
  }

  // ---------- giọng đọc & âm thanh ----------
  for (const r of view.querySelectorAll('input[name="accent"]')) {
    r.addEventListener('change', () => { if (r.checked) { updateSettings({ speech_accent: r.value }); speak('Hello. This is how I sound.'); } });
  }
  const rate = view.querySelector('[data-act="rate"]');
  rate?.addEventListener('input', () => { view.querySelector('[data-role="rate"]').textContent = Number(rate.value).toFixed(2); });
  rate?.addEventListener('change', () => { updateSettings({ speech_rate: Number(rate.value) }); saved(); });
  view.querySelector('[data-act="try-voice"]')?.addEventListener('click', () => speak('Consistency is the key to a band seven.'));
  view.querySelector('[data-act="sound"]').addEventListener('change', (e) => { updateSettings({ sound: e.target.checked }); if (e.target.checked) play('right'); saved(); });
  view.querySelector('[data-act="vibrate"]').addEventListener('change', (e) => { updateSettings({ vibrate: e.target.checked }); buzz(20); saved(); });

  // ---------- hiển thị ----------
  for (const r of $$('input[name="font"]')) {
    r.addEventListener('change', () => { updateSettings({ font_size: r.value }); saved(); });
  }

  // ---------- dữ liệu ----------
  $('[data-action="export"]').addEventListener('click', () => {
    exportFile();
    showToast('đã tạo file sao lưu', '₍ᐢ. .ᐢ₎📌');
  });

  $('[data-action="import"]').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const result = await importFile(file);
    if (!result.ok) { showToast(result.error, '(・_・;)'); return; }
    showToast('nhập xong, đang tải lại', '(•ᴗ•)♡');
    setTimeout(() => window.location.reload(), 900);
  });

  $('[data-action="redo"]').addEventListener('click', () => {
    setOnboarded(false);
    window.location.hash = '#/welcome';
  });

  const confirmBox = $('.danger-confirm');
  const wipe1 = $('[data-action="wipe-1"]');
  wipe1.addEventListener('click', () => {
    confirmBox.hidden = false;
    wipe1.hidden = true;
    $('[data-action="wipe-cancel"]').focus();
  });
  $('[data-action="wipe-cancel"]').addEventListener('click', () => {
    confirmBox.hidden = true;
    wipe1.hidden = false;
    wipe1.focus();
  });
  $('[data-action="wipe-2"]').addEventListener('click', async () => {
    wipeAll();
    window.location.hash = '#/welcome';
    window.location.reload();
  });

  // đổi ở tab khác thì cập nhật số từ (các ô khác người dùng đang sửa nên để yên)
  const onState = () => { words.textContent = getState().profile.new_words_per_day; };
  window.addEventListener(STATE_EVENT, onState);
  return () => window.removeEventListener(STATE_EVENT, onState);
}
