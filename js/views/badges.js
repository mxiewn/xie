// xie · views/badges.js — huy hiệu (#/badges, thuộc tab tui).
// huy hiệu đã nhận có màu + ngày nhận; chưa nhận thì mờ, kèm tiến độ (vd. 3/7).

import { pageHead, esc } from '../ui.js';
import { getProgress, getSummary, PROGRESS_EVENT } from '../progress.js';
import { BADGES, BADGE_GROUPS, badgeProgress } from '../badges.js';
import { shortDate } from '../progress-ui.js';

function tile(badge, stats, earnedOn) {
  const pr = badgeProgress(badge, stats);
  const earned = Boolean(earnedOn);
  const state = earned ? `nhận ngày ${shortDate(earnedOn)}` : `${pr.value}/${pr.target}`;
  return `
    <li class="badge-tile${earned ? ' is-earned' : ''}" aria-label="${esc(`${badge.name}: ${badge.desc}. ${earned ? state : `chưa nhận, ${state}`}`)}">
      <span class="badge-medal" aria-hidden="true"><span class="kao">${esc(badge.icon)}</span></span>
      <span class="badge-name">${esc(badge.name)}</span>
      <span class="badge-desc">${esc(badge.desc)}</span>
      ${earned
        ? `<span class="badge-date">${esc(state)}</span>`
        : `<span class="mini-bar" aria-hidden="true"><span style="width:${Math.round(pr.ratio * 100)}%"></span></span>
           <span class="badge-date">${esc(state)}</span>`}
    </li>`;
}

export function render(view) {
  view.innerHTML = `
    ${pageHead({
      title: 'huy hiệu',
      sub: 'mỗi cái là một thói quen tốt đã thành hình',
      actions: '<a class="btn btn-ghost btn-small" href="#/me">quay lại</a>',
    })}
    <div class="page-body badges-body" data-role="body"></div>
  `;
  const body = view.querySelector('[data-role="body"]');

  const draw = () => {
    const { stats } = getSummary();
    const earned = getProgress().badges;
    const count = BADGES.filter((b) => earned[b.id]).length;
    body.innerHTML = `
      <p class="badges-count"><span class="badges-num">${count}</span>/${BADGES.length} huy hiệu đã nhận</p>
      ${BADGE_GROUPS.map((g) => `
        <section class="badge-group" aria-labelledby="bg-${g.id}">
          <h2 class="badge-group-title" id="bg-${g.id}">${esc(g.label)}</h2>
          <ul class="badge-grid" role="list">
            ${BADGES.filter((b) => b.group === g.id).map((b) => tile(b, stats, earned[b.id])).join('')}
          </ul>
        </section>`).join('')}`;
  };
  draw();
  window.addEventListener(PROGRESS_EVENT, draw);
  return () => window.removeEventListener(PROGRESS_EVENT, draw);
}
