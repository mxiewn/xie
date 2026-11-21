// xie · views/my-word.js — "từ của tui" (#/my-word để thêm, #/my-word/<id> để sửa).
// form thêm từ gặp ngoài đời: bắt buộc từ + nghĩa, còn lại tuỳ chọn. lưu xong tự vào srs.

import { pageHead, icons, esc, showToast } from '../ui.js';
import { makeMyWord } from '../vocab-state.js';
import { normalizeItem } from '../vocab-core.js';
import { getMyWords, saveMyWord } from '../vocab-store.js';
import { celebrate } from '../progress.js';
import { say } from '../voice.js';

export function render(view, { params = [] } = {}) {
  const editId = params[0] || null;
  const existing = editId ? getMyWords().items.find((x) => x.id === editId) : null;
  const v = existing || { phrase: '', meaning_vi: '', examples: [], note: '', use_for: 'both' };

  view.innerHTML = `
    ${pageHead({ title: existing ? 'sửa từ của tui' : 'thêm từ của tui', sub: 'từ hay cụm bạn gặp ngoài đời, lưu xong là vào bài ôn', actions: '<a class="btn btn-ghost btn-small" href="#/vocab">quay lại</a>' })}
    <div class="page-body">
      <form class="card settings-card my-word-form" novalidate>
        <h2 class="card-title"><span class="title-bow">${icons.bow}</span>${existing ? 'sửa' : 'từ mới'}</h2>
        <label class="field">
          <span class="field-label">từ / cụm tiếng anh <span class="req">bắt buộc</span></span>
          <input class="input keep-case" name="phrase" type="text" maxlength="80" autocapitalize="off" autocomplete="off" spellcheck="false" value="${esc(v.phrase)}" required>
        </label>
        <label class="field">
          <span class="field-label">nghĩa tiếng việt <span class="req">bắt buộc</span></span>
          <input class="input" name="meaning" type="text" maxlength="160" autocomplete="off" value="${esc(v.meaning_vi)}" required>
        </label>
        <label class="field">
          <span class="field-label">câu ví dụ (tuỳ chọn)</span>
          <textarea class="input keep-case" name="example" rows="2" autocapitalize="sentences">${esc(v.examples[0] || '')}</textarea>
        </label>
        <label class="field">
          <span class="field-label">ghi chú (tuỳ chọn)</span>
          <input class="input" name="note" type="text" maxlength="200" autocomplete="off" value="${esc(v.note)}">
        </label>
        <div class="field">
          <span class="field-label" id="lbl-use">dùng cho</span>
          <div class="segmented segmented-fit" role="radiogroup" aria-labelledby="lbl-use">
            ${[['speaking', 'nói'], ['writing', 'viết'], ['both', 'cả hai']].map(([k, l]) => `<label class="segment-choice"><input type="radio" name="use" value="${k}"${v.use_for === k ? ' checked' : ''}><span>${l}</span></label>`).join('')}
          </div>
        </div>
        <p class="form-error" data-role="err" role="alert"></p>
        <div class="study-actions"><button class="btn btn-primary" type="submit">${existing ? 'lưu thay đổi' : 'lưu vào kho'}</button></div>
      </form>
    </div>`;

  const form = view.querySelector('form');
  const err = view.querySelector('[data-role="err"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const made = makeMyWord({
      phrase: fd.get('phrase'), meaning: fd.get('meaning'), example: fd.get('example'), note: fd.get('note'), use_for: fd.get('use'),
    });
    if (!made.ok) {
      err.textContent = made.error;
      form.querySelector(made.error.includes('nghĩa') ? '[name="meaning"]' : '[name="phrase"]').focus();
      return;
    }
    const item = existing ? normalizeItem({ ...made.item, id: existing.id }) : made.item;
    const events = saveMyWord(item);
    celebrate(events);
    const l = await say('da_luu', { kind: 'saved' }, { forceLine: true });
    showToast(l?.text || 'đã lưu', l?.kao || '');
    window.location.hash = `#/word/${encodeURIComponent(item.id)}`;
  });
  setTimeout(() => form.querySelector('[name="phrase"]').focus({ preventScroll: true }), 50);
}
