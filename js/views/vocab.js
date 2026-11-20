// xie · views/vocab.js — tab từ vựng
// giai đoạn 1: khung + trang trống. thẻ, srs, bộ lọc kho từ làm ở giai đoạn 5.

import { pageHead, emptyState, ASCII_BUNNIES } from '../ui.js';

export function render(view) {
  view.innerHTML = `
    ${pageHead({ title: 'từ vựng', sub: 'sổ của tui · daily · academic' })}
    <div class="page-body">
      ${emptyState({
        art: ASCII_BUNNIES[0],
        kao: '( ˙꒳˙ )',
        title: 'kệ từ đang lắp',
        text: '157 cụm trong sổ của bạn sẽ lên kệ trước, rồi tới daily và academic.',
      })}
    </div>
  `;
}
