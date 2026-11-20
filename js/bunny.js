// xie · bunny.js
// bé thỏ trắng tuyết đeo nơ hồng ở cổ — svg tự vẽ, nhân vật gốc của xie.
// mọi màu lấy từ var(--…) trong css/themes.css nên tự đổi theo chế độ sáng/tối:
//   sáng: viền hồng xám, má hồng rõ, bóng dưới chân
//   tối:  quầng sáng nhẹ quanh người + ngôi sao cài chính giữa nơ
// đứng yên thì thở nhẹ và nháy mắt ngẫu nhiên. buồn hoặc ngủ thì tai cụp xuống.
//
// thứ tự lớp (dưới → trên), để không đụng nhau:
//   trăng sau lưng → đuôi → áo choàng → tai đứng → thân → đầu → mặt → tai cụp
//   → phụ kiện cổ → khăn → nơ cổ → phụ kiện đầu → vương miện (trạng thái)
//   → đồ cầm tay (che nơ) → tay → hiệu ứng

import { prefersReducedMotion } from './theme.js';

export const BUNNY_STATES = [
  { id: 'happy', label: 'vui' },
  { id: 'sad', label: 'buồn nhẹ' },
  { id: 'sleep', label: 'ngủ' },
  { id: 'dance', label: 'nhảy múa' },
  { id: 'carrot', label: 'cầm cà rốt' },
  { id: 'heart', label: 'ôm tim' },
  { id: 'crown', label: 'đội vương miện' },
  { id: 'pen', label: 'cầm bút' },
  { id: 'mic', label: 'cầm micro' },
  { id: 'scarf', label: 'quấn khăn' },
];

// trang phục mà svg vẽ được. cấp mở khoá nằm ở js/levels.js
export const BUNNY_SKINS = ['basic', 'ear-bows', 'pearls', 'lace', 'sakura', 'tiara', 'royal', 'snow', 'moon'];

const STATE_IDS = BUNNY_STATES.map((s) => s.id);
const UPRIGHT_EAR_STATES = STATE_IDS.filter((id) => id !== 'sad' && id !== 'sleep').join(' ');

// ---------- hình học ----------
const r2 = (n) => Math.round(n * 100) / 100;
const deg = (d) => (d * Math.PI) / 180;

function starPath(cx, cy, outer, inner) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? outer : inner;
    const a = deg(-90 + i * 36);
    d += `${i ? 'L' : 'M'}${r2(cx + rad * Math.cos(a))} ${r2(cy + rad * Math.sin(a))} `;
  }
  return `${d}Z`;
}

function sparklePath(x, y, s) {
  const k = s * 0.18;
  return `M${x} ${y - s}C${x + k} ${y - k} ${x + k} ${y - k} ${x + s} ${y}C${x + k} ${y + k} ${x + k} ${y + k} ${x} ${y + s}`
    + `C${x - k} ${y + k} ${x - k} ${y + k} ${x - s} ${y}C${x - k} ${y - k} ${x - k} ${y - k} ${x} ${y - s}Z`;
}

function snowflakePath(x, y, s) {
  const dx = r2(s * 0.866);
  const dy = r2(s * 0.5);
  return `M${x} ${y - s}V${y + s}M${x - dx} ${y - dy}L${x + dx} ${y + dy}M${x - dx} ${y + dy}L${x + dx} ${y - dy}`;
}

function pointOnEllipse(cx, cy, rx, ry, angle) {
  return [cx + rx * Math.cos(deg(angle)), cy + ry * Math.sin(deg(angle))];
}

// viền vỏ sò dọc nửa dưới một elip (cổ áo ren, cổ lông)
function scallopCollar({ cx, cy, rx, ry, from, to, n, innerY, bulge = 1.08 }) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(pointOnEllipse(cx, cy, rx, ry, from + ((to - from) * i) / n));
  let d = `M${r2(pts[0][0])} ${r2(pts[0][1])}`;
  for (let i = 1; i <= n; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const rad = r2((Math.hypot(bx - ax, by - ay) / 2) * bulge);
    d += ` A${rad} ${rad} 0 0 0 ${r2(bx)} ${r2(by)}`;
  }
  d += ` Q${cx} ${innerY} ${r2(pts[0][0])} ${r2(pts[0][1])}Z`;
  return d;
}

function pearl(x, y, r) {
  return `<circle class="acc-pearl" cx="${r2(x)}" cy="${r2(y)}" r="${r}"/>`
    + `<circle class="acc-pearl-shine" cx="${r2(x - r * 0.35)}" cy="${r2(y - r * 0.35)}" r="${r2(r * 0.32)}"/>`;
}

function blossom(cx, cy, r) {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse class="acc-petal" cx="${r2(cx)}" cy="${r2(cy - r * 0.55)}" rx="${r2(r * 0.42)}" ry="${r2(r * 0.58)}" transform="rotate(${a} ${r2(cx)} ${r2(cy)})"/>`)
    .join('');
  return `<g>${petals}<circle class="acc-petal-center" cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r * 0.22)}"/></g>`;
}

// nơ satin, tâm ở (0,0). dùng cho nơ cổ và nơ cài tai
function bowShape({ withStar = false } = {}) {
  return `
    <path class="b-bow-tail" d="M-3 1.5 L-12 21.5 L-6.5 19.5 L-4 24.5 L1.5 3.5 Z"/>
    <path class="b-bow-tail" d="M3 1.5 L10.5 21 L5.5 20 L3 25 L-1.5 3.5 Z"/>
    <path class="b-bow-loop" d="M0 -0.5 C-12 -17.5 -30 -14.5 -26.5 0.5 C-23.5 11.5 -10 9.5 0 -0.5 Z"/>
    <path class="b-bow-loop" d="M0 -0.5 C11 -16.5 29 -14.5 26.5 0 C24 11.5 10 9.5 0 -0.5 Z"/>
    <path class="b-bow-shine" d="M-20 -5.5 Q-15 -10.5 -9 -8"/>
    <path class="b-bow-shine" d="M10 -8.5 Q16 -11.5 21 -8"/>
    <path class="b-bow-fold" d="M-9.5 3 Q-5 0.9 -2 1.3 M9.5 3 Q5 0.9 2 1.3"/>
    <ellipse class="b-bow-knot" cx="0" cy="0" rx="6" ry="6.6"/>
    ${withStar ? `<path class="b-star" d="${starPath(0, 0.8, 8, 3.4)}"/>` : ''}`;
}

const miniBow = (x, y, rot) => `<g class="b-bow-mini" transform="translate(${x} ${y}) rotate(${rot}) scale(0.5)">${bowShape()}</g>`;

// ---------- phụ kiện theo cấp ----------
const MOON_PATH = 'M86.44 38.58 A80 80 0 1 0 164.28 159.66 A72 72 0 1 1 86.44 38.58 Z';

const ACC_MOON = `
  <g data-skin="moon">
    <path class="acc-moon-glow" d="${MOON_PATH}"/>
    <path class="acc-moon" d="${MOON_PATH}"/>
    <path class="acc-moon-sparkle" d="${sparklePath(24, 62, 5.5)}"/>
    <path class="acc-moon-sparkle" d="${sparklePath(28, 174, 4)}"/>
    <path class="acc-moon-sparkle" d="${sparklePath(178, 132, 3.6)}"/>
  </g>`;

const ACC_CAPE = `
  <g data-skin="snow">
    <path class="acc-cape" d="M56 146 C40 168 30 198 25 224 Q100 243 175 224 C170 198 160 168 144 146 Z"/>
    <path class="acc-cape-fold" d="M44 182 Q40 204 38 222 M156 182 Q160 204 162 222"/>
    <path class="acc-snow" d="${snowflakePath(49, 166, 4.5)}"/>
    <path class="acc-snow" d="${snowflakePath(151, 166, 4.5)}"/>
    <path class="acc-snow" d="${snowflakePath(36, 206, 5)}"/>
    <path class="acc-snow" d="${snowflakePath(164, 206, 5)}"/>
  </g>`;

const PEARL_STRAND = (() => {
  const [x0, y0, cx, cy, x1, y1] = [64, 156, 100, 240, 136, 156];
  let out = '';
  const n = 17;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = (1 - t) ** 2 * x0 + 2 * t * (1 - t) * cx + t ** 2 * x1;
    const y = (1 - t) ** 2 * y0 + 2 * t * (1 - t) * cy + t ** 2 * y1;
    out += pearl(x, y, 3.5);
  }
  return `${out}${pearl(100, 205.5, 4.8)}`;
})();

const LACE_COLLAR = (() => {
  const shape = { cx: 100, cy: 150, rx: 53, ry: 33, from: 163, to: 17, n: 14 };
  const holes = [];
  for (let i = 0; i < shape.n; i++) {
    const a = shape.from + ((shape.to - shape.from) * (i + 0.5)) / shape.n;
    const [x, y] = pointOnEllipse(shape.cx, shape.cy, shape.rx - 1, shape.ry - 1, a);
    holes.push(`<circle class="acc-lace-hole" cx="${r2(x)}" cy="${r2(y)}" r="1.4"/>`);
  }
  const [sx, sy] = pointOnEllipse(100, 150, 45, 25, 155);
  const [ex, ey] = pointOnEllipse(100, 150, 45, 25, 25);
  return `
    <path class="acc-lace" d="${scallopCollar({ ...shape, innerY: 168 })}"/>
    <path class="acc-lace-stitch" d="M${r2(sx)} ${r2(sy)} A45 25 0 0 0 ${r2(ex)} ${r2(ey)}"/>
    ${holes.join('')}`;
})();

const FUR_COLLAR = `<path class="acc-fur" d="${scallopCollar({ cx: 100, cy: 148, rx: 55, ry: 30, from: 168, to: 12, n: 10, innerY: 163, bulge: 1.3 })}"/>`;

const ACC_NECK = `
  <g class="acc-neck">
    <g data-skin="pearls">${PEARL_STRAND}</g>
    <g data-skin="lace">${LACE_COLLAR}</g>
    <g data-skin="snow">${FUR_COLLAR}</g>
  </g>`;

const SAKURA_WREATH = (() => {
  const [cx, cy, rx, ry] = [100, 110, 54, 48];
  const [sx, sy] = pointOnEllipse(cx, cy, rx, ry, 202);
  const [ex, ey] = pointOnEllipse(cx, cy, rx, ry, 338);
  const leaves = [224, 254, 286, 316].map((a) => {
    const [x, y] = pointOnEllipse(cx, cy, rx, ry, a);
    const tangent = (Math.atan2(ry * Math.cos(deg(a)), -rx * Math.sin(deg(a))) * 180) / Math.PI;
    return `<ellipse class="acc-leaf" cx="${r2(x)}" cy="${r2(y - 2)}" rx="2.6" ry="5.6" transform="rotate(${r2(tangent + 60)} ${r2(x)} ${r2(y - 2)})"/>`;
  });
  const flowers = [[212, 6.5], [240, 7.5], [270, 8.6], [300, 7.5], [328, 6.5]].map(([a, size]) => {
    const [x, y] = pointOnEllipse(cx, cy, rx, ry, a);
    return blossom(x, y, size);
  });
  return `<path class="acc-vine" d="M${r2(sx)} ${r2(sy)} A${rx} ${ry} 0 0 1 ${r2(ex)} ${r2(ey)}"/>${leaves.join('')}${flowers.join('')}`;
})();

const ACC_HEAD = `
  <g class="acc-head">
    <g data-skin="sakura">${SAKURA_WREATH}</g>
    <g data-skin="tiara">
      <path class="acc-gold" d="M84 71 L86 59.5 L93 66 L100 53.5 L107 66 L114 59.5 L116 71 Q100 64.5 84 71 Z"/>
      ${pearl(86, 58.5, 2.5)}${pearl(114, 58.5, 2.5)}${pearl(100, 52, 3.1)}
      <circle class="acc-gem" cx="100" cy="65" r="2.7"/>
    </g>
    <g data-skin="royal">
      <path class="acc-gold" d="M75 72 L72 40 L82 52 L87 33 L94 50 L100 24 L106 50 L113 33 L118 52 L128 40 L125 72 Q100 66 75 72 Z"/>
      <path class="acc-gold-band" d="M75.6 65.5 Q100 60 124.4 65.5"/>
      <circle class="acc-gem-2" cx="86" cy="66.5" r="2.6"/>
      <circle class="acc-gem" cx="100" cy="64.6" r="3.4"/>
      <circle class="acc-gem-2" cx="114" cy="66.5" r="2.6"/>
      ${pearl(72, 39, 2.8)}${pearl(87, 32, 2.8)}${pearl(100, 22.5, 3.4)}${pearl(113, 32, 2.8)}${pearl(128, 39, 2.8)}
    </g>
    <g data-skin="snow">
      <path class="acc-snow acc-snow-clip" d="${snowflakePath(64, 86, 7)}"/>
      <circle class="acc-fur" cx="64" cy="86" r="2.2"/>
    </g>
    <g data-skin="moon">
      <path class="acc-star" d="${starPath(126, 76, 7, 3)}"/>
    </g>
  </g>`;

// ---------- svg ----------
const SVG = `
<svg class="bunny-svg" viewBox="0 0 200 240" aria-hidden="true" focusable="false">
  <ellipse class="b-shadow" cx="100" cy="229" rx="52" ry="7"/>
  <g class="b-rig">
    ${ACC_MOON}
    <g class="b-tail"><circle class="b-fur" cx="146" cy="203" r="11"/></g>
    ${ACC_CAPE}

    <g class="b-ears" data-show="${UPRIGHT_EAR_STATES}">
      <g class="b-ear b-ear-l">
        <ellipse class="b-fur" cx="76" cy="44" rx="17" ry="40" transform="rotate(-10 76 44)"/>
        <ellipse class="b-inner" cx="76.6" cy="49" rx="8.4" ry="28" transform="rotate(-10 76.6 49)"/>
        <g data-skin="ear-bows">${miniBow(79, 60, -10)}</g>
      </g>
      <g class="b-ear b-ear-r">
        <ellipse class="b-fur" cx="124" cy="44" rx="17" ry="40" transform="rotate(10 124 44)"/>
        <ellipse class="b-inner" cx="123.4" cy="49" rx="8.4" ry="28" transform="rotate(10 123.4 49)"/>
        <g data-skin="ear-bows">${miniBow(121, 60, 10)}</g>
      </g>
    </g>

    <g class="b-body">
      <ellipse class="b-fur" cx="78" cy="221" rx="17" ry="9"/>
      <ellipse class="b-fur" cx="122" cy="221" rx="17" ry="9"/>
      <ellipse class="b-fur" cx="100" cy="185" rx="44" ry="38"/>
      <ellipse class="b-belly" cx="100" cy="195" rx="24" ry="19"/>
    </g>

    <g class="b-head">
      <ellipse class="b-fur" cx="100" cy="113" rx="60" ry="51"/>
    </g>

    <g class="b-face">
      <ellipse class="b-cheek" cx="61" cy="133" rx="11" ry="6.5"/>
      <ellipse class="b-cheek" cx="139" cy="133" rx="11" ry="6.5"/>

      <g class="b-eyes-open" data-show="happy sad carrot heart crown pen mic scarf">
        <ellipse class="b-eye" cx="78" cy="117" rx="6.5" ry="8"/>
        <ellipse class="b-eye" cx="122" cy="117" rx="6.5" ry="8"/>
        <circle class="b-shine" cx="80.4" cy="113.6" r="2.5"/>
        <circle class="b-shine" cx="124.4" cy="113.6" r="2.5"/>
        <circle class="b-shine" cx="76" cy="120.6" r="1.1"/>
        <circle class="b-shine" cx="120" cy="120.6" r="1.1"/>
      </g>
      <g data-show="dance">
        <path class="b-eye-line" d="M71 120 Q78 110 85 120"/>
        <path class="b-eye-line" d="M115 120 Q122 110 129 120"/>
      </g>
      <g data-show="sleep">
        <path class="b-eye-line" d="M71 116 Q78 123 85 116"/>
        <path class="b-eye-line" d="M115 116 Q122 123 129 116"/>
      </g>
      <g data-show="sad">
        <path class="b-brow" d="M69.5 105 L85 100.5"/>
        <path class="b-brow" d="M115 100.5 L130.5 105"/>
      </g>

      <path class="b-nose" d="M95.5 126 Q100 122.5 104.5 126 Q102.6 130.4 100 130.8 Q97.4 130.4 95.5 126Z"/>

      <path class="b-mouth" data-show="happy carrot heart crown pen scarf" d="M100 130.8 V133.6 M91.5 133 Q95.8 139.5 100 133.6 Q104.2 139.5 108.5 133"/>
      <g data-show="dance">
        <path class="b-mouth" d="M100 130.8 V133.2"/>
        <path class="b-mouth-in" d="M92.5 133.5 Q100 147 107.5 133.5 Q100 136.2 92.5 133.5Z"/>
      </g>
      <path class="b-mouth" data-show="sad" d="M100 130.8 V134 M93.5 139.8 Q100 133.6 106.5 139.8"/>
      <path class="b-mouth" data-show="sleep" d="M100 130.8 V133.4 M96 135.6 Q100 138.6 104 135.6"/>
      <g data-show="mic">
        <path class="b-mouth" d="M100 130.8 V133"/>
        <ellipse class="b-mouth-in" cx="100" cy="137.6" rx="4" ry="4.6"/>
      </g>
    </g>

    <g class="b-lop" data-show="sad sleep">
      <g class="b-lop-l">
        <ellipse class="b-fur" cx="46" cy="112" rx="15" ry="38" transform="rotate(20 46 112)"/>
        <ellipse class="b-inner" cx="43" cy="120" rx="6.8" ry="25" transform="rotate(20 43 120)"/>
        <g data-skin="ear-bows">${miniBow(57, 84, 20)}</g>
      </g>
      <g class="b-lop-r">
        <ellipse class="b-fur" cx="154" cy="112" rx="15" ry="38" transform="rotate(-20 154 112)"/>
        <ellipse class="b-inner" cx="157" cy="120" rx="6.8" ry="25" transform="rotate(-20 157 120)"/>
        <g data-skin="ear-bows">${miniBow(143, 84, -20)}</g>
      </g>
    </g>

    ${ACC_NECK}

    <g class="b-scarf" data-show="scarf">
      <path class="p-scarf" d="M116 168 L131 204 Q125 208.5 117.5 207.5 L106 172 Z"/>
      <path class="p-scarf" d="M62 153 Q100 174 138 153 Q141 160 139 166 Q100 186 61 166 Q59 160 62 153 Z"/>
      <path class="p-scarf-stripe" d="M74 160.5 L72.5 171.5 M86 164.6 L85 176 M114 164.6 L115 176 M126 160.5 L127.5 171.5 M112.5 182 L121.5 178.5 M116.8 194 L126 190.5"/>
      <path class="p-scarf-fringe" d="M119.5 208 L119 213 M123.6 208.4 L123.4 213.6 M127.8 207 L128.4 212"/>
    </g>

    <g class="b-bow b-bow-neck" transform="translate(100 164) scale(0.92)">${bowShape({ withStar: true })}</g>

    ${ACC_HEAD}

    <g class="b-headwear">
      <g class="b-crown" data-show="crown">
        <g transform="rotate(9 110 56)">
          <path class="p-crown" d="M90 66 L87.5 44 L99 55 L110 38 L121 55 L132.5 44 L130 66 Z"/>
          <path class="p-crown-band" d="M90.6 60.6 H129.4"/>
          <circle class="p-pearl" cx="87.5" cy="43" r="3.4"/>
          <circle class="p-pearl" cx="110" cy="37" r="3.8"/>
          <circle class="p-pearl" cx="132.5" cy="43" r="3.4"/>
          <circle class="p-gem" cx="110" cy="56" r="3.6"/>
        </g>
      </g>
    </g>

    <g class="b-props">
      <g class="b-carrot" data-show="carrot">
        <g transform="rotate(-22 100 190)">
          <path class="p-leaf" d="M99.5 165 C 95 152, 87 148, 82.5 150 C 86 155, 92 161, 98 166 Z"/>
          <path class="p-leaf" d="M100 165 C 99.5 150, 104 143, 108.5 142 C 108 150, 104.5 158, 101.5 166 Z"/>
          <path class="p-leaf" d="M101 166 C 106 155, 114 152, 118.5 154 C 114.5 158, 108.5 162, 102.5 167 Z"/>
          <path class="p-carrot" d="M86 170 C 86 161, 114 161, 114 170 C 113 188, 106 206, 101.2 217 C 100.4 218.6, 99.6 218.6, 98.8 217 C 94 206, 87 188, 86 170 Z"/>
          <path class="p-carrot-line" d="M89.5 180 L96 181.5 M104 190 L110.5 188.5 M91.5 198 L97 199.5 M102.5 207 L106 206"/>
        </g>
      </g>

      <g class="b-heart" data-show="heart">
        <path class="p-heart" d="M100 214 C 68 195, 72 168, 89.5 169.5 C 95.5 170, 98.8 174.5, 100 178 C 101.2 174.5, 104.5 170, 110.5 169.5 C 128 168, 132 195, 100 214 Z"/>
        <path class="p-heart-shine" d="M84 181 Q85.5 175.5 90.5 175"/>
      </g>

      <g class="b-pen" data-show="pen">
        <g transform="rotate(34 124 176)">
          <rect class="p-pen-eraser" x="118.5" y="140" width="11" height="9" rx="3.2"/>
          <rect class="p-pen-band" x="118.5" y="148" width="11" height="4.4"/>
          <rect class="p-pen-body" x="118.5" y="152" width="11" height="40" rx="1.5"/>
          <path class="p-pen-stripe" d="M124 154 V190"/>
          <path class="p-pen-wood" d="M118.5 191.5 H129.5 L124 205 Z"/>
          <path class="p-pen-tip" d="M121.7 199.2 H126.3 L124 205 Z"/>
        </g>
      </g>

      <g class="b-mic" data-show="mic">
        <path class="p-mic-body" d="M120.5 158 L127.5 194 Q131 196.5 134.5 193.5 L128.5 157 Z"/>
        <circle class="p-mic-head" cx="124" cy="148.5" r="11"/>
        <path class="p-mic-line" d="M115 146 H133 M115.5 151.5 H132.5 M124 138 V159"/>
      </g>
    </g>

    <g class="b-arms">
      <ellipse class="b-fur" data-show="happy sad sleep crown scarf pen mic" cx="61" cy="183" rx="10" ry="14" transform="rotate(16 61 183)"/>
      <ellipse class="b-fur" data-show="happy sad sleep crown scarf" cx="139" cy="183" rx="10" ry="14" transform="rotate(-16 139 183)"/>
      <ellipse class="b-fur" data-show="carrot heart" cx="80" cy="186" rx="10.5" ry="13.5" transform="rotate(-38 80 186)"/>
      <ellipse class="b-fur" data-show="carrot heart" cx="120" cy="186" rx="10.5" ry="13.5" transform="rotate(38 120 186)"/>
      <ellipse class="b-fur" data-show="dance" cx="51" cy="156" rx="10" ry="14.5" transform="rotate(-40 51 156)"/>
      <ellipse class="b-fur" data-show="dance" cx="149" cy="156" rx="10" ry="14.5" transform="rotate(40 149 156)"/>
      <ellipse class="b-fur" data-show="pen" cx="134" cy="168" rx="10" ry="13" transform="rotate(30 134 168)"/>
      <ellipse class="b-fur" data-show="mic" cx="131" cy="177" rx="10" ry="13" transform="rotate(-20 131 177)"/>
    </g>

    <g class="b-fx">
      <g class="fx-zzz" data-show="sleep">
        <path class="p-zzz z1" d="M146 46 H156 L146 57 H156"/>
        <path class="p-zzz z2" d="M163 26 H170 L163 34 H170"/>
      </g>
      <g class="fx-notes" data-show="dance">
        <g class="note n1">
          <ellipse class="p-note" cx="166" cy="82" rx="5.2" ry="4" transform="rotate(-20 166 82)"/>
          <path class="p-note-stem" d="M170.6 80.5 V62 L178 59.5"/>
        </g>
        <g class="note n2">
          <ellipse class="p-note" cx="30" cy="104" rx="4.6" ry="3.6" transform="rotate(-20 30 104)"/>
          <path class="p-note-stem" d="M34.2 102.8 V87"/>
        </g>
      </g>
      <g class="fx-snow" data-show="scarf">
        <path class="p-snow" d="M36 70 V82 M30.8 73 L41.2 79 M30.8 79 L41.2 73"/>
        <path class="p-snow" d="M166 92 V101 M162.1 94.2 L169.9 98.8 M162.1 98.8 L169.9 94.2"/>
      </g>
      <path class="p-sparkle" data-show="crown" d="M154 30 Q155 36 161 37 Q155 38 154 44 Q153 38 147 37 Q153 36 154 30Z"/>
      <path class="p-sparkle" data-show="crown heart" d="M40 92 Q40.7 96.3 45 97 Q40.7 97.7 40 102 Q39.3 97.7 35 97 Q39.3 96.3 40 92Z"/>
    </g>
  </g>
</svg>`;

export function bunnyLabel(state) {
  return BUNNY_STATES.find((s) => s.id === state)?.label ?? 'vui';
}

// size (px) bỏ trống thì cỡ thỏ do css quyết định qua --bunny-size (đổi theo màn hình)
export function createBunny({ state = 'happy', size = null, label = 'thỏ của xie', skin = 'basic' } = {}) {
  const node = document.createElement('div');
  node.className = 'bunny';
  if (size) node.style.setProperty('--bunny-size', `${size}px`);
  node.setAttribute('role', 'img');
  node.innerHTML = SVG;

  let alive = true;
  let blinkTimer = 0;
  const timers = new Set();

  const later = (fn, ms) => {
    const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, ms);
    timers.add(id);
    return id;
  };

  function setState(next) {
    const id = STATE_IDS.includes(next) ? next : 'happy';
    node.dataset.state = id;
    node.setAttribute('aria-label', `${label}: ${bunnyLabel(id)}`);
  }

  function setSkin(next) {
    node.dataset.skin = BUNNY_SKINS.includes(next) ? next : 'basic';
  }

  function blink() {
    node.classList.add('is-blink');
    later(() => {
      node.classList.remove('is-blink');
      if (Math.random() < 0.22) {
        later(() => {
          node.classList.add('is-blink');
          later(() => node.classList.remove('is-blink'), 110);
        }, 150);
      }
    }, 120);
  }

  function scheduleBlink() {
    blinkTimer = later(() => {
      const st = node.dataset.state;
      if (st !== 'sleep' && st !== 'dance') blink();
      scheduleBlink();
    }, 2200 + Math.random() * 3800);
  }

  function replay(cls, ms) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    later(() => node.classList.remove(cls), ms);
  }

  setState(state);
  setSkin(skin);
  scheduleBlink();

  return {
    node,
    get state() { return node.dataset.state; },
    get skin() { return node.dataset.skin; },
    setState,
    setSkin,
    hop() {
      if (!prefersReducedMotion()) replay('is-hop', 560);
    },
    // lật người đổi ca: promise xong ở giữa cú lật, lúc đó đổi giao diện là đẹp nhất
    flip() {
      return new Promise((resolve) => {
        if (prefersReducedMotion()) { resolve(); return; }
        replay('is-flip', 720);
        later(resolve, 340);
      });
    },
    setCarrotScale(scale) {
      node.style.setProperty('--carrot-scale', String(scale));
    },
    destroy() {
      alive = false;
      clearTimeout(blinkTimer);
      for (const id of timers) clearTimeout(id);
      timers.clear();
    },
  };
}
