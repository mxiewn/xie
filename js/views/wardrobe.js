// xie · views/wardrobe.js — tủ đồ của thỏ (#/wardrobe, thuộc tab tui)
// mỗi cấp mở khoá một bộ đồ. bộ chưa mở vẫn mặc thử để xem được, nhưng chưa chọn được.
// bộ đang mặc hiện ở trang chủ và tab tui.

import { pageHead, createBubble, icons, esc } from '../ui.js';
import { createBunny } from '../bunny.js';
import { SKINS, currentLevel, levelInfo, isSkinUnlocked, getEquippedSkin, equipSkin } from '../levels.js';
import { say } from '../voice.js';

export function render(view) {
  const level = currentLevel();
  let worn = getEquippedSkin();
  let preview = worn;

  view.innerHTML = `
    ${pageHead({
      title: 'tủ đồ của thỏ',
      sub: `bạn đang ở cấp ${level} · ${levelInfo(level).name}`,
      actions: '<a class="btn btn-ghost btn-small" href="#/me">quay lại</a>',
    })}
    <div class="page-body wardrobe-body">
      <section class="card card-lace wardrobe-stage">
        <div class="wardrobe-bubble"></div>
        <div class="wardrobe-model"></div>
        <div class="wardrobe-info">
          <h2 class="wardrobe-name"></h2>
          <p class="wardrobe-desc"></p>
          <button class="btn btn-primary wardrobe-action" type="button"></button>
        </div>
      </section>

      <ul class="outfit-grid" role="list"></ul>
    </div>
  `;

  const model = createBunny({ state: 'happy', size: 176, skin: preview });
  const bubble = createBubble();
  view.querySelector('.wardrobe-model').append(model.node);
  view.querySelector('.wardrobe-bubble').append(bubble.node);

  const nameEl = view.querySelector('.wardrobe-name');
  const descEl = view.querySelector('.wardrobe-desc');
  const action = view.querySelector('.wardrobe-action');
  const grid = view.querySelector('.outfit-grid');

  const minis = SKINS.map((skin) => {
    const unlocked = isSkinUnlocked(skin.id, level);
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `outfit-tile${unlocked ? '' : ' is-locked'}`;
    btn.dataset.id = skin.id;
    btn.innerHTML = `
      <span class="outfit-thumb"></span>
      <span class="outfit-name">${esc(skin.name)}</span>
      <span class="outfit-level">cấp ${skin.level}</span>
      <span class="outfit-worn" aria-hidden="true">${icons.heart}</span>
      <span class="outfit-lock" aria-hidden="true">${icons.lock}</span>`;
    const mini = createBunny({ state: 'happy', size: 78, skin: skin.id, label: `thỏ mặc ${skin.name}` });
    btn.querySelector('.outfit-thumb').append(mini.node);
    btn.addEventListener('click', () => select(skin.id));
    li.append(btn);
    grid.append(li);
    return mini;
  });

  function sync() {
    const skin = SKINS.find((s) => s.id === preview);
    const unlocked = isSkinUnlocked(skin.id, level);
    model.setSkin(skin.id);
    nameEl.textContent = skin.name;
    descEl.textContent = unlocked
      ? skin.desc
      : `${skin.desc}. mở khoá ở cấp ${skin.level} · ${levelInfo(skin.level).name}`;

    if (!unlocked) {
      action.innerHTML = `${icons.lock}<span>đạt cấp ${skin.level} để mở</span>`;
      action.disabled = true;
    } else if (skin.id === worn) {
      action.innerHTML = `${icons.heart}<span>đang mặc</span>`;
      action.disabled = true;
    } else {
      action.innerHTML = '<span>mặc bộ này</span>';
      action.disabled = false;
    }

    for (const btn of grid.querySelectorAll('.outfit-tile')) {
      const id = btn.dataset.id;
      const info = SKINS.find((s) => s.id === id);
      btn.setAttribute('aria-pressed', String(id === preview));
      btn.classList.toggle('is-worn', id === worn);
      const state = !isSkinUnlocked(id, level) ? 'chưa mở' : id === worn ? 'đang mặc' : 'đã mở';
      btn.setAttribute('aria-label', `${info.name}, cấp ${info.level}, ${state}`);
    }
  }

  function select(id) {
    preview = id;
    model.hop();
    sync();
  }

  let danceTimer = 0;
  action.addEventListener('click', () => {
    if (equipSkin(preview)) {
      worn = preview;
      model.setState('dance');
      clearTimeout(danceTimer);
      danceTimer = setTimeout(() => model.setState('happy'), 1400);
      say('da_luu', { kind: 'saved' }, { forceLine: true }).then((line) => {
        if (line && model.node.isConnected) bubble.say(line.text || '', line.kao);
      });
      sync();
    }
  });

  sync();

  return () => {
    clearTimeout(danceTimer);
    model.destroy();
    bubble.destroy();
    for (const m of minis) m.destroy();
  };
}
