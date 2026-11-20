// xie · app.js — điểm khởi động
import { initTheme } from './theme.js';
import { initRouter } from './router.js';

initTheme();
initRouter({
  view: document.getElementById('view'),
  nav: document.querySelector('.tab-bar'),
});
