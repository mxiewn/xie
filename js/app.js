// xie · app.js — điểm khởi động
import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { getState, registerVisit, applyFontSize } from './state.js';
import { loadNotices } from './progress.js';

initTheme();
applyFontSize();
registerVisit();
loadNotices(); // ngày vắng đã qua: tự dùng băng giữ chuỗi hoặc đứt chuỗi → trang chủ báo một lần

initRouter({
  view: document.getElementById('view'),
  nav: document.querySelector('.tab-bar'),
  // lần đầu mở web: vào phần làm quen trước. làm quen xong thì không quay lại đó nữa
  guard(name) {
    const { onboarded } = getState();
    if (!onboarded && name !== 'welcome') return 'welcome';
    if (onboarded && name === 'welcome') return 'home';
    return null;
  },
});
