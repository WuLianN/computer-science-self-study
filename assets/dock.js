/* 全站统一「停靠胶囊」右下角导航：🏠返回首页 + ↑回到顶部
 * 由 AI 生成 · 2026-10-30。纯静态零构建：每页 </body> 前放
 *   <script src="{相对路径}assets/dock.js?v=版本号" defer></script>
 * 即可，无需再手写 .totop 或页尾"回到顶部"链接。
 * 原理：读自身 <script> 的 src（回退到 theme.css 的 link）算出仓库根相对前缀，
 * 因此任意目录深度、file:// 双击打开、GitHub Pages 都能拼出正确的首页链接。
 * 显示：仅窄屏(≤640px)出现，与旧 .totop 一致；样式全在 theme.css 的 .dock。 */
(function () {
  if (window.__dockInjected || document.querySelector('.dock')) { window.__dockInjected = true; return; }

  // 求"相对仓库根"的前缀，如 ''、'../'、'../../'
  function rootPrefix() {
    var s = document.currentScript;
    var raw = s && s.getAttribute('src');
    if (raw) return raw.replace(/assets\/dock\.js.*$/, '');
    var l = document.querySelector('link[href*="assets/theme.css"]');
    if (l && l.getAttribute('href')) return l.getAttribute('href').replace(/assets\/theme\.css.*$/, '');
    return '';
  }

  var prefix = rootPrefix();
  var nav = document.createElement('nav');
  nav.className = 'dock';
  nav.setAttribute('aria-label', '快捷导航');

  // 竖排：先建 ↑（列首，显示在上方），再建 🏠（列尾，常驻右下角角落）。
  // ↑ 默认透明隐藏，滚过阈值才由 .show-top 淡入；🏠 位置始终不变。
  var top = document.createElement('a');
  top.href = '#';
  top.className = 'top';
  top.title = '回到顶部';
  top.setAttribute('aria-label', '回到顶部');
  // 内联 SVG 箭头图标（stroke=currentColor 继承白字，细描边圆角，跨平台一致）取代纯文本 ↑
  top.innerHTML = '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="20" x2="12" y2="6"></line><polyline points="6 12 12 6 18 12"></polyline></svg>';
  top.addEventListener('click', function (e) {
    e.preventDefault();
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  nav.appendChild(top);

  // prefix 为空 = 当前就是仓库根 index.html，首页指向自己，省略 🏠
  if (prefix !== '') {
    var home = document.createElement('a');
    home.href = prefix + 'index.html';
    home.className = 'home';
    home.title = '返回首页';
    home.setAttribute('aria-label', '返回首页');
    home.textContent = '🏠';
    nav.appendChild(home);
  }

  document.body.appendChild(nav);

  // 自动显示/隐藏 ↑：滚过阈值(约 280px 或 0.6 屏高取小)才浮现，回到顶部附近淡出
  var threshold = Math.min(280, Math.max(160, (window.innerHeight || 600) * 0.6));
  function syncTop() {
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    nav.classList.toggle('show-top', y > threshold);
  }
  window.addEventListener('scroll', syncTop, { passive: true });
  window.addEventListener('resize', syncTop, { passive: true });
  syncTop();
  window.__dockInjected = true;
})();
