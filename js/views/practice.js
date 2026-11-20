// xie · views/practice.js — tab luyện nói & viết
// gồm 4 mục: viết | nói | ngữ pháp | nâng cấp câu (có linking words + bẫy người việt).
// mục đang mở nằm trên hash (#/practice/grammar) để mở thẳng được.

import { pageHead, emptyState, ASCII_BUNNIES, esc } from '../ui.js';
import { replaceSubroute } from '../router.js';

const SECTIONS = [
  {
    id: 'writing',
    label: 'viết',
    kao: '( ˶ˊᵕˋ)✍',
    title: 'bàn viết đang kê',
    text: 'topic sprint 5 phút và paraphrase đề task 2 sẽ ở đây.',
  },
  {
    id: 'speaking',
    label: 'nói',
    kao: '( ˶ˆᗜˆ˵ )🎤',
    title: 'sân khấu đang dựng',
    text: 'speaking part 1, cue card part 2, part 3. nói to, tự tick, không ghi âm.',
  },
  {
    id: 'grammar',
    label: 'ngữ pháp',
    kao: '( ◕ᴗ◕)っ📖',
    title: 'sách ngữ pháp đang đóng',
    text: '13 chủ điểm, 3 dạng bài: trắc nghiệm, tìm lỗi sai, viết lại câu.',
  },
  {
    id: 'upgrade',
    label: 'nâng cấp câu',
    kao: '(｡･ω･｡)✧',
    title: 'xưởng nâng cấp đang mở',
    text: 'nâng cấp từ, linking words, nối câu, và 40 bẫy người việt hay dính.',
  },
];

export function render(view, { params = [] } = {}) {
  let active = SECTIONS.some((s) => s.id === params[0]) ? params[0] : SECTIONS[0].id;

  view.innerHTML = `
    ${pageHead({ title: 'luyện nói & viết', sub: 'chỗ từ vựng biến thành câu của bạn' })}
    <div class="page-body">
      <div class="segmented" role="tablist" aria-label="mục luyện">
        ${SECTIONS.map((s) => `
          <button class="segment" type="button" role="tab" id="seg-${s.id}" data-id="${s.id}"
            aria-controls="practice-panel">${esc(s.label)}</button>`).join('')}
      </div>
      <div class="segment-panel" id="practice-panel" role="tabpanel"></div>
    </div>
  `;

  const tabs = [...view.querySelectorAll('.segment')];
  const panel = view.querySelector('#practice-panel');

  function show(id, { focus = false } = {}) {
    active = id;
    const section = SECTIONS.find((s) => s.id === id);
    for (const tab of tabs) {
      const on = tab.dataset.id === id;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      if (on && focus) tab.focus();
    }
    panel.setAttribute('aria-labelledby', `seg-${id}`);
    panel.innerHTML = emptyState({
      art: ASCII_BUNNIES[1],
      kao: section.kao,
      title: section.title,
      text: section.text,
    });
    replaceSubroute('practice', id);
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => show(tab.dataset.id));
    tab.addEventListener('keydown', (event) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (event.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        event.preventDefault();
        show(next.dataset.id, { focus: true });
      }
    });
  }

  show(active);
}
