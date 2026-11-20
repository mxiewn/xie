// xie · views/games.js — tab game
// giai đoạn 1: khung + danh sách game sắp mở. game thật làm ở giai đoạn 7.

import { pageHead, icons, esc } from '../ui.js';

const GAMES = [
  { name: 'bunny hop', kao: '₍ᐢ•ﻌ•ᐢ₎' },
  { name: 'word form ladder', kao: '(ง •_•)ง' },
  { name: 'preposition pop', kao: '(・ω・)ノ' },
  { name: 'collocation match', kao: '(｡･ω･｡)✧' },
  { name: 'sentence unscramble', kao: '(•ㅂ•)و✧' },
  { name: 'upgrade it!', kao: 'ᕙ(•ᴗ•)ᕗ' },
  { name: 'speed spell', kao: '( ˘▽˘)っ🎧' },
  { name: 'spot the trap', kao: '(¬‿¬)' },
  { name: 'carrot rush', kao: '₍ᐢ•ﻌ•ᐢ₎🥕' },
];

export function render(view) {
  view.innerHTML = `
    ${pageHead({ title: 'game', sub: 'ván ngắn 1–3 phút, dùng chính kho từ của bạn' })}
    <div class="page-body">
      <ul class="game-grid" role="list">
        ${GAMES.map((g) => `
          <li class="game-tile" aria-disabled="true">
            <span class="kao game-kao">${esc(g.kao)}</span>
            <span class="game-name">${esc(g.name)}</span>
            <span class="game-lock">${icons.lock}sắp mở</span>
          </li>`).join('')}
      </ul>
    </div>
  `;
}
