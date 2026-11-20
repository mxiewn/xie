// xie · progress-ui.js — mảnh giao diện của tiến độ, dùng chung cho trang chủ, lịch nơ, tab tui, phòng thử.
// chỉ dựng html từ dữ liệu đã tính (summary của progress-core), không đọc localStorage.
// svg dùng class + var(--…) hoặc currentColor, không có mã màu cứng.

import { esc, icons } from './ui.js';
import { WEEKDAY_LABELS, weekOf, monthGrid } from './streak.js';
import { skillLabel } from './topics.js';

const WEEKDAY_FULL = ['thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy', 'chủ nhật'];
const MARK_TEXT = { met: 'đạt mục tiêu', frozen: 'băng giữ chuỗi đã cứu', partial: 'có học, chưa đủ mục tiêu' };

export const shortDate = (date) => `${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`;

// vòng tiến độ "32/50 lượt"
export function ringHtml(status) {
  const pct = Math.round(status.ratio * 100);
  const label = status.met
    ? `đã xong ${status.counted} trên ${status.goal} lượt hôm nay`
    : `${status.counted} trên ${status.goal} lượt hôm nay`;
  return `
    <div class="goal-ring${status.met ? ' is-met' : ''}" role="img" aria-label="${esc(label)}">
      <svg viewBox="0 0 120 120" focusable="false" aria-hidden="true">
        <circle class="ring-track" cx="60" cy="60" r="51"/>
        <circle class="ring-fill" cx="60" cy="60" r="51" pathLength="100"
          style="stroke-dasharray:${pct} 100"${pct === 0 ? ' data-empty="true"' : ''}/>
      </svg>
      <div class="ring-center" aria-hidden="true">
        ${status.met ? `<span class="ring-bow">${icons.bow}</span>` : ''}
        <span class="ring-num">${status.counted}</span>
        <span class="ring-of">/${status.goal} lượt</span>
      </div>
    </div>`;
}

function meter(label, value, max, note = '') {
  const pct = Math.round(Math.min(1, max ? value / max : 0) * 100);
  return `
    <div class="mini-meter${value >= max ? ' is-full' : ''}">
      <div class="mini-meter-head"><span>${esc(label)}</span><span class="mini-meter-num">${value}/${max}</span></div>
      <div class="mini-bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.min(value, max)}">
        <span style="width:${pct}%"></span>
      </div>
      ${note ? `<p class="mini-meter-note">${esc(note)}</p>` : ''}
    </div>`;
}

export function statusLine(status) {
  if (status.met) return 'xong mục tiêu hôm nay, chuỗi đã giữ';
  if (!status.studied) return `chưa có lượt nào hôm nay. cần ${status.goal} lượt, trong đó ${status.outputMin} lượt output`;
  if (status.left > 0 && status.outputLeft > 0) return `còn ${status.left} lượt, nhớ có thêm ${status.outputLeft} lượt output`;
  if (status.left > 0) return `còn ${status.left} lượt nữa là giữ chuỗi`;
  return `đủ lượt rồi, còn thiếu ${status.outputLeft} lượt output (viết hoặc nói)`;
}

// thanh output 6/10 + thanh game (chỉ hiện khi có chơi game)
export function metersHtml(status) {
  return `
    ${meter('output', status.output, status.outputMin)}
    ${status.game > 0 ? meter('lượt game', status.gameCounted, status.gameCap, status.game > status.gameCap ? `đã chơi ${status.game} lượt, chỉ ${status.gameCap} lượt tính vào mục tiêu, xp vẫn đủ` : '') : ''}`;
}

function markIcon(mark) {
  if (mark === 'met') return `<span class="day-mark mark-met">${icons.bow}</span>`;
  if (mark === 'frozen') return `<span class="day-mark mark-frozen">${icons.snow}</span>`;
  if (mark === 'partial') return '<span class="day-mark mark-partial"><span class="dot"></span></span>';
  return '<span class="day-mark"></span>';
}

function dayLabel(date, mark, today) {
  const wd = WEEKDAY_FULL[(new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7];
  const what = MARK_TEXT[mark] || (date > today ? 'chưa tới' : date === today ? 'hôm nay, chưa xong' : 'không học');
  return `${wd} ${shortDate(date)}: ${what}`;
}

// dải 7 ngày của tuần này, thứ hai → chủ nhật
export function weekStripHtml(streak, today) {
  return `
    <ol class="week-strip" role="list">
      ${weekOf(today).map((date, i) => {
        const mark = streak.calendar[date];
        const cls = ['week-day', date === today ? 'is-today' : '', date > today ? 'is-future' : ''].filter(Boolean).join(' ');
        return `<li class="${cls}" aria-label="${esc(dayLabel(date, mark, today))}">
          <span class="week-label" aria-hidden="true">${WEEKDAY_LABELS[i]}</span>
          ${markIcon(mark)}
        </li>`;
      }).join('')}
    </ol>`;
}

// lịch tháng: nơ hồng = đạt, băng tuyết = được cứu, chấm nhỏ = có học chưa đủ
export function monthHtml(streak, year, month, today) {
  const weeks = monthGrid(year, month);
  return `
    <div class="month" role="table" aria-label="lịch tháng ${month} năm ${year}">
      <div class="month-row month-head" role="row">
        ${WEEKDAY_LABELS.map((w, i) => `<span class="month-wd" role="columnheader" aria-label="${WEEKDAY_FULL[i]}">${w}</span>`).join('')}
      </div>
      ${weeks.map((week) => `
        <div class="month-row" role="row">
          ${week.map(({ date, inMonth }) => {
            if (!inMonth) return '<span class="month-cell is-out" role="cell"></span>';
            const mark = streak.calendar[date];
            const cls = ['month-cell', mark ? `has-${mark}` : '', date === today ? 'is-today' : '', date > today ? 'is-future' : ''].filter(Boolean).join(' ');
            return `<span class="${cls}" role="cell" aria-label="${esc(dayLabel(date, mark, today))}">
              <span class="month-num" aria-hidden="true">${Number(date.slice(8, 10))}</span>
              ${markIcon(mark)}
            </span>`;
          }).join('')}
        </div>`).join('')}
    </div>`;
}

export function legendHtml() {
  return `
    <ul class="legend" role="list">
      <li>${markIcon('met')}<span>đạt mục tiêu</span></li>
      <li>${markIcon('frozen')}<span>băng giữ chuỗi cứu</span></li>
      <li>${markIcon('partial')}<span>có học, chưa đủ</span></li>
    </ul>`;
}

// "số băng đang có: 1" — một con số, dễ đọc hơn kiểu 1/2
export function freezeCountHtml(freezes) {
  return `<span class="freeze-count${freezes ? '' : ' is-empty'}">${icons.snow}<span>số băng đang có: <b>${freezes}</b></span></span>`;
}

// thẻ báo tin chuỗi lúc mở web: dùng băng / đứt chuỗi
export function noticeHtml(notices, streak) {
  if (!notices.length) return '';
  const broken = notices.filter((n) => n.type === 'broken').at(-1);
  const used = notices.filter((n) => n.type === 'freeze_used');
  let title;
  let text;
  let kind;
  if (broken) {
    kind = 'broken';
    title = `chuỗi ${broken.lost} ngày đã dừng hôm ${shortDate(broken.date)}`;
    text = `${used.length ? `băng giữ chuỗi đã cứu ${used.length} ngày nhưng không đủ. ` : ''}kỷ lục ${streak.longest} ngày vẫn là của bạn. hôm nay là ngày 1 mới.`;
  } else {
    kind = 'frozen';
    const days = used.map((n) => shortDate(n.date)).join(', ');
    title = `băng giữ chuỗi đã cứu ngày ${days}`;
    text = streak.freezes
      ? `chuỗi ${streak.current} ngày vẫn còn nguyên. số băng đang có: ${streak.freezes}.`
      : `chuỗi ${streak.current} ngày vẫn còn nguyên. hết băng rồi, giữ chuỗi tròn 7 ngày là có băng mới.`;
  }
  return `
    <section class="card notice-card notice-${kind}" aria-labelledby="notice-title">
      <div class="notice-icon" aria-hidden="true">${kind === 'frozen' ? icons.snow : icons.heart}</div>
      <div class="notice-body">
        <h2 class="notice-title" id="notice-title">${esc(title)}</h2>
        <p class="card-text">${esc(text)}</p>
      </div>
      <button class="btn btn-ghost btn-small notice-close" type="button" data-action="notice-close">ok</button>
    </section>`;
}

const SKILL_HREF = { writing: '#/practice/writing', speaking: '#/practice/speaking', grammar: '#/practice/grammar', vocab: '#/vocab' };

export function challengeHtml(challenge, progress, xp = 50) {
  if (!challenge) return '';
  const pct = Math.round((progress.value / progress.target) * 100);
  return `
    <section class="card challenge-card${progress.done ? ' is-done' : ''}" aria-labelledby="challenge-title">
      <div class="challenge-head">
        <h2 class="card-title" id="challenge-title"><span class="title-bow">${icons.bow}</span>thử thách hôm nay</h2>
        <span class="tag">${esc(skillLabel(challenge.skill))}</span>
      </div>
      <p class="challenge-text">${esc(challenge.title)}</p>
      <div class="mini-bar" role="progressbar" aria-label="tiến độ thử thách" aria-valuemin="0" aria-valuemax="${progress.target}" aria-valuenow="${progress.value}">
        <span style="width:${pct}%"></span>
      </div>
      <p class="challenge-foot">
        <span>${progress.done ? '✓ xong rồi' : `${progress.value}/${progress.target}`}</span>
        <span>${progress.done ? `đã nhận +${xp} xp` : `+${xp} xp khi xong`}</span>
      </p>
      ${progress.done ? '' : `<a class="btn-link" href="${SKILL_HREF[challenge.skill] || '#/home'}">tới chỗ làm thử thách</a>`}
    </section>`;
}

// thanh xp lên cấp kế
export function levelMeterHtml(lp) {
  if (!lp.next) return '<p class="card-text">bậc tối thượng rồi. vầng trăng sau lưng là của bạn.</p>';
  const pct = Math.round(lp.ratio * 100);
  const extra = lp.missing.filter((m) => m.id !== 'xp');
  return `
    <div class="mini-meter">
      <div class="mini-meter-head"><span>tới ${esc(lp.next.name)}</span><span class="mini-meter-num">${lp.xpInto}/${lp.xpNeed} xp</span></div>
      <div class="mini-bar" role="progressbar" aria-label="xp tới cấp ${lp.next.level}" aria-valuemin="0" aria-valuemax="${lp.xpNeed}" aria-valuenow="${lp.xpInto}">
        <span style="width:${pct}%"></span>
      </div>
      ${extra.map((m) => `<p class="mini-meter-note">cần thêm: ${m.have}/${m.need} ${esc(m.label)}</p>`).join('')}
    </div>`;
}
