// xie · sound.js — âm thanh hiệu ứng tạo bằng web audio api (không dùng file có bản quyền) + rung nhẹ.
// có nút tắt trong cài đặt (âm thanh / rung). chưa chạm lần nào thì chưa tạo audio (trình duyệt chặn tự phát).

import { getState } from './state.js';

let ctx = null;

function audio() {
  if (!getState().settings.sound) return null;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx ||= new AC();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// một nốt: tần số, lúc bắt đầu (giây), dài, âm lượng, dạng sóng
function tone(ac, freq, at, dur, gain = 0.07, type = 'sine') {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + at);
  g.gain.setValueAtTime(0.0001, ac.currentTime + at);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + dur + 0.02);
}

const SOUNDS = {
  // đúng: hai nốt đi lên, sáng
  right: (ac) => { tone(ac, 784, 0, 0.12); tone(ac, 1175, 0.09, 0.2); },
  // sai: một nốt trầm mềm, không gắt
  wrong: (ac) => { tone(ac, 330, 0, 0.22, 0.05, 'triangle'); tone(ac, 262, 0.12, 0.26, 0.04, 'triangle'); },
  tap: (ac) => tone(ac, 660, 0, 0.06, 0.04),
  flip: (ac) => { tone(ac, 520, 0, 0.07, 0.035); tone(ac, 700, 0.05, 0.08, 0.03); },
  // xong / lên mức: hợp âm rải
  done: (ac) => [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.08, 0.28, 0.055)),
};

export function play(name) {
  const ac = audio();
  if (!ac || !SOUNDS[name]) return;
  try { SOUNDS[name](ac); } catch { /* bỏ qua */ }
}

// rung nhẹ khi máy hỗ trợ
export function buzz(pattern = 18) {
  if (!getState().settings.vibrate) return;
  try { navigator.vibrate?.(pattern); } catch { /* bỏ qua */ }
}

export function feedback(kind) {
  if (kind === 'right') { play('right'); buzz(15); }
  else if (kind === 'wrong') { play('wrong'); buzz([30, 40, 30]); }
  else play(kind);
}
