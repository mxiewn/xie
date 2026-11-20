// xie · router.js
// điều hướng bằng hash (#/home, #/vocab…) để chạy được trên github pages ở đường dẫn con
// mà không cần cấu hình server. mỗi màn là một module trong js/views/, chỉ tải khi mở.

import { emptyState, ASCII_BUNNIES, esc } from './ui.js';
import { say, randomTip, tipLabel } from './voice.js';

const ROUTES = {
  home: { title: 'trang chủ', load: () => import('./views/home.js') },
  vocab: { title: 'từ vựng', load: () => import('./views/vocab.js') },
  practice: { title: 'luyện nói & viết', load: () => import('./views/practice.js') },
  games: { title: 'game', load: () => import('./views/games.js') },
  me: { title: 'tui', load: () => import('./views/me.js') },
  wardrobe: { title: 'tủ đồ của thỏ', tab: 'me', load: () => import('./views/wardrobe.js') },
  lab: { title: 'phòng thử', tab: 'me', load: () => import('./views/lab.js') },
};

const DEFAULT_ROUTE = 'home';

export function parseHash(hash = window.location.hash) {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try { return decodeURIComponent(part); } catch { return part; }
    });
  const name = parts[0] && Object.prototype.hasOwnProperty.call(ROUTES, parts[0]) ? parts[0] : null;
  return { name, params: parts.slice(1) };
}

// đổi phần sau của hash (vd #/practice/grammar) mà không vẽ lại cả màn
export function replaceSubroute(name, ...params) {
  const hash = '#/' + [name, ...params].map(encodeURIComponent).join('/');
  if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
}

function markTabs(nav, name) {
  for (const link of nav.querySelectorAll('[data-route]')) {
    if (link.dataset.route === name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

// lỗi: câu thoại nhóm "trang thái / lỗi" (có câu dự phòng nếu chưa tải được kho thoại)
function renderError(view) {
  view.innerHTML = emptyState({
    art: ASCII_BUNNIES[1],
    kao: '┐(￣ヘ￣)┌',
    title: 'ủa alo, có gì đó sai sai',
    text: 'thử lại giùm tui nha',
    action: '<button class="btn btn-primary" type="button" data-action="reload">thử lại</button>',
  });
  view.querySelector('[data-action="reload"]')?.addEventListener('click', () => window.location.reload());
  say('trang_thai', { kind: 'error' }, { forceLine: true }).then((line) => {
    const title = view.querySelector('.empty-title');
    if (!line?.text || !title) return;
    title.textContent = `${line.text} `;
    const k = document.createElement('span');
    k.className = 'kao';
    k.textContent = line.kao;
    title.append(k);
    view.querySelector('.empty-text')?.remove();
  });
}

// màn hình đang tải (chỉ hiện khi tải lâu): thoại "đang tải" + một mẹo ielts
async function renderLoading(view, isCurrent) {
  const [line, tip] = await Promise.all([say('trang_thai', { kind: 'loading' }, { forceLine: true }), randomTip()]);
  if (!isCurrent()) return;
  view.innerHTML = `
    <div class="loading">
      <pre class="kao-art" aria-hidden="true">${esc(ASCII_BUNNIES[0])}</pre>
      <p>${esc(line?.text || 'đang tải…')} <span class="kao">${esc(line?.kao || '')}</span></p>
      ${tip ? `<p class="loading-tip"><span class="loading-tip-label">${esc(tipLabel(tip))}</span>${esc(tip.text)}</p>` : ''}
    </div>`;
}

export function initRouter({ view, nav }) {
  let cleanup = null;
  let token = 0;
  let firstRender = true;

  const runCleanup = () => {
    if (typeof cleanup === 'function') {
      try { cleanup(); } catch (err) { console.error(err); }
    }
    cleanup = null;
  };

  async function go() {
    const { name, params } = parseHash();
    if (!name) {
      window.location.replace('#/' + DEFAULT_ROUTE);
      return;
    }

    const myToken = ++token;
    const route = ROUTES[name];
    markTabs(nav, route.tab || name);
    document.title = name === DEFAULT_ROUTE ? 'xie' : `${route.title} · xie`;

    let mod;
    const slow = setTimeout(() => renderLoading(view, () => myToken === token && !mod), 300);
    try {
      mod = await route.load();
    } catch (err) {
      console.error(err);
      clearTimeout(slow);
      if (myToken !== token) return;
      runCleanup();
      renderError(view);
      return;
    }
    clearTimeout(slow);
    if (myToken !== token) return;

    runCleanup();
    view.replaceChildren();
    view.dataset.route = name;
    try {
      cleanup = mod.render(view, { params }) || null;
    } catch (err) {
      console.error(err);
      renderError(view);
    }

    window.scrollTo(0, 0);
    if (!firstRender) view.focus({ preventScroll: true });
    firstRender = false;
  }

  window.addEventListener('hashchange', go);
  go();
}
