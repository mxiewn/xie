// xie · bunny.js
// bé thỏ trắng tuyết đeo nơ hồng — svg tự vẽ, nhân vật gốc của xie.
// mọi màu lấy từ var(--bunny-…) trong css/themes.css nên tự đổi theo chế độ sáng/tối:
//   sáng: viền hồng xám, má hồng rõ, bóng dưới chân
//   tối:  quầng sáng nhẹ quanh người + ngôi sao cài trên nơ
// đứng yên thì thở nhẹ và nháy mắt ngẫu nhiên.
// .b-accessory là chỗ gắn phụ kiện level (làm cùng phần game hoá).

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

const STATE_IDS = BUNNY_STATES.map((s) => s.id);

const SVG = `
<svg class="bunny-svg" viewBox="0 0 200 240" aria-hidden="true" focusable="false">
  <ellipse class="b-shadow" cx="100" cy="229" rx="52" ry="7"/>
  <g class="b-rig">
    <g class="b-tail"><circle class="b-fur" cx="146" cy="203" r="11"/></g>

    <g class="b-ear b-ear-l">
      <ellipse class="b-fur" cx="76" cy="44" rx="17" ry="40" transform="rotate(-10 76 44)"/>
      <ellipse class="b-inner" cx="76.6" cy="49" rx="8.4" ry="28" transform="rotate(-10 76.6 49)"/>
    </g>
    <g class="b-ear b-ear-r">
      <ellipse class="b-fur" cx="124" cy="44" rx="17" ry="40" transform="rotate(10 124 44)"/>
      <ellipse class="b-inner" cx="123.4" cy="49" rx="8.4" ry="28" transform="rotate(10 123.4 49)"/>
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
      <g class="b-accessory"></g>
    </g>

    <g class="b-bow">
      <path class="b-bow-tail" d="M67 73 L58 93 L63.5 91 L66 96 L71.5 75 Z"/>
      <path class="b-bow-tail" d="M73 73 L80.5 92.5 L75.5 91.5 L73 96.5 L68.5 75 Z"/>
      <path class="b-bow-loop" d="M70 71 C 58 54, 40 57, 43.5 72 C 46.5 83, 60 81, 70 71 Z"/>
      <path class="b-bow-loop" d="M70 71 C 81 55, 99 57, 96.5 71.5 C 94 83, 80 81, 70 71 Z"/>
      <path class="b-bow-shine" d="M50 66 Q55 61 61 63.5"/>
      <path class="b-bow-shine" d="M80 63 Q86 60 91 63.5"/>
      <path class="b-bow-fold" d="M60.5 74.5 Q65 72.4 68 72.8 M79.5 74.5 Q75 72.4 72 72.8"/>
      <ellipse class="b-bow-knot" cx="70" cy="71.5" rx="6" ry="6.6"/>
      <path class="b-star" d="M84 49 L86 54.25 L91.6 54.5 L87.2 58 L88.7 63.5 L84 60.4 L79.3 63.5 L80.8 58 L76.4 54.5 L82 54.25 Z"/>
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

      <g class="b-scarf" data-show="scarf">
        <path class="p-scarf" d="M116 168 L131 204 Q125 208.5 117.5 207.5 L106 172 Z"/>
        <path class="p-scarf" d="M62 153 Q100 174 138 153 Q141 160 139 166 Q100 186 61 166 Q59 160 62 153 Z"/>
        <path class="p-scarf-stripe" d="M74 160.5 L72.5 171.5 M86 164.6 L85 176 M114 164.6 L115 176 M126 160.5 L127.5 171.5 M112.5 182 L121.5 178.5 M116.8 194 L126 190.5"/>
        <path class="p-scarf-fringe" d="M119.5 208 L119 213 M123.6 208.4 L123.4 213.6 M127.8 207 L128.4 212"/>
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
export function createBunny({ state = 'happy', size = null, label = 'thỏ của xie' } = {}) {
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
  scheduleBlink();

  return {
    node,
    get state() { return node.dataset.state; },
    setState,
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
