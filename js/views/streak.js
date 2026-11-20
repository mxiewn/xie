// xie · views/streak.js — lịch nơ (#/streak, mở từ thẻ chuỗi ở trang chủ).
// chuỗi hiện tại, kỷ lục, băng giữ chuỗi, lịch tháng (nơ hồng / băng tuyết / chấm nhỏ), luật giữ chuỗi.

import { pageHead, icons, esc } from '../ui.js';
import { getSummary, PROGRESS_EVENT } from '../progress.js';
import { monthHtml, legendHtml, freezeSlotsHtml } from '../progress-ui.js';
import { shiftMonth, FREEZE_EVERY, MAX_FREEZES } from '../streak.js';
import { GAME_CAP, OUTPUT_MIN } from '../daily-goal.js';

function stat(value, label, extra = '') {
  return `<div class="stat"><span class="stat-value">${value}</span><span class="stat-label">${esc(label)}</span>${extra}</div>`;
}

export function render(view) {
  let sum = getSummary();
  const [y, m] = sum.today.split('-').map(Number);
  let shown = { year: y, month: m };
  // tháng sớm nhất có dữ liệu: không cho lùi xa hơn (tránh lịch trống trơn)
  const firstDay = Object.keys(sum.streak.calendar).sort()[0] || sum.today;
  const earliest = { year: Number(firstDay.slice(0, 4)), month: Number(firstDay.slice(5, 7)) };
  const key = ({ year, month }) => year * 12 + month;

  view.innerHTML = `
    ${pageHead({
      title: 'lịch nơ',
      sub: 'chuỗi ngày, kỷ lục và băng giữ chuỗi',
      actions: '<a class="btn btn-ghost btn-small" href="#/home">quay lại</a>',
    })}
    <div class="page-body streak-body">
      <section class="card card-lace streak-stats" aria-label="tóm tắt chuỗi ngày" data-role="stats"></section>

      <section class="card month-card" aria-labelledby="month-title">
        <div class="month-nav">
          <button class="icon-btn month-prev" type="button" data-action="prev" aria-label="tháng trước">${icons.chevron}</button>
          <h2 class="card-title month-title" id="month-title" aria-live="polite"></h2>
          <button class="icon-btn" type="button" data-action="next" aria-label="tháng sau">${icons.chevron}</button>
        </div>
        <div data-role="month"></div>
        ${legendHtml()}
      </section>

      <section class="card rules-card" aria-labelledby="rules-title">
        <h2 class="card-title" id="rules-title"><span class="title-bow">${icons.bow}</span>luật giữ chuỗi</h2>
        <ul class="rules-list" role="list">
          <li>mỗi ngày làm đủ <b data-role="goal"></b> lượt, trong đó ít nhất ${OUTPUT_MIN} lượt output (tự viết, paraphrase, nói) thì chuỗi +1</li>
          <li>lượt game tính tối đa ${GAME_CAP} cho mục tiêu, xp thì vẫn nhận đủ</li>
          <li>cứ giữ chuỗi tròn ${FREEZE_EVERY} ngày là nhận 1 băng giữ chuỗi, giữ tối đa ${MAX_FREEZES} băng</li>
          <li>ngày nào chưa đủ, băng tự cứu ngày đó: chuỗi không cộng nhưng không đứt. hết băng thì chuỗi về 0</li>
          <li>trả lời lại một câu trong 10 phút, bấm nhanh dưới 1 giây liên tục, hay bài output dưới 5 từ thì không tính lượt</li>
          <li>ngày tính theo giờ việt nam, qua 0 giờ là ngày mới</li>
        </ul>
      </section>
    </div>
  `;

  const $ = (sel) => view.querySelector(sel);
  const prev = $('[data-action="prev"]');
  const next = $('[data-action="next"]');

  const drawStats = () => {
    const s = sum.streak;
    $('[data-role="stats"]').innerHTML = `
      <div class="stat-grid">
        ${stat(s.current, s.current ? 'ngày liền' : 'chuỗi hiện tại')}
        ${stat(s.longest, 'ngày kỷ lục')}
        ${stat(`${s.freezes}/${MAX_FREEZES}`, 'băng đang giữ', freezeSlotsHtml(s.freezes))}
        ${stat(s.metDays, 'ngày đạt mục tiêu')}
      </div>
      <p class="card-text">${esc(s.todayMet ? 'hôm nay đã giữ chuỗi. nơ hôm nay là của bạn.' : `hôm nay: ${sum.status.counted}/${sum.status.goal} lượt, output ${sum.status.output}/${sum.status.outputMin}.`)}</p>`;
    $('[data-role="goal"]').textContent = sum.status.goal;
  };

  const drawMonth = () => {
    $('#month-title').textContent = `tháng ${shown.month} · ${shown.year}`;
    $('[data-role="month"]').innerHTML = monthHtml(sum.streak, shown.year, shown.month, sum.today);
    prev.disabled = key(shown) <= key(earliest);
    next.disabled = key(shown) >= y * 12 + m;
  };

  prev.addEventListener('click', () => { shown = shiftMonth(shown.year, shown.month, -1); drawMonth(); });
  next.addEventListener('click', () => { shown = shiftMonth(shown.year, shown.month, 1); drawMonth(); });

  drawStats();
  drawMonth();

  const refresh = () => { sum = getSummary(); drawStats(); drawMonth(); };
  window.addEventListener(PROGRESS_EVENT, refresh);
  return () => window.removeEventListener(PROGRESS_EVENT, refresh);
}
