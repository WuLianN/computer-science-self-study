/* 全站统一「停靠胶囊」右下角导航：🏠返回首页 + ↑回到顶部
 * 由 AI 生成 · 2026-10-30。纯静态零构建：每页 </body> 前放
 *   <script src="{相对路径}assets/dock.js?v=版本号" defer></script>
 * 即可，无需再手写 .totop 或页尾"回到顶部"链接。
 * 原理：读自身 <script> 的 src（回退到 theme.css 的 link）算出仓库根相对前缀，
 * 因此任意目录深度、file:// 双击打开、GitHub Pages 都能拼出正确的首页链接。
 * 显示：仅窄屏(≤640px)出现，与旧 .totop 一致；样式全在 theme.css 的 .dock
 * （根 index.html 是自包含页，按约定自带内联 .dock 样式；prefix 为空时省略 🏠 只留 ↑）。
 *
 * 本文件同时承载第二个互不依赖的窄屏增强：hero 首屏折叠（见文件末尾 IIFE）。
 * 两者都幂等，视觉一律由 CSS 媒体查询决定，桌面零影响。 */
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

/* ===== hero 首屏折叠（内容取舍：折叠长描述 + 精简 pill/导航链）=====
 * 只在外链 theme.css 的 105 个页面生效；根 index.html 无 header.hero，自动跳过。
 * 零信息丢失：被收纳的内容全在 DOM 里，点一次「展开全文」即可看到。
 * 阈值来自 360px 全站统计：89/105 页描述≥3 行、pill 2–6 枚、导航链最多 6 条。
 * 只在窄屏初始化、用实测行数判定描述是否超 2 行（不按文本长度猜，避免短页误插按钮）；
 * 插完按钮再测一次 hero 高度，净收益 <4px 就整组撤销，保证没有页面因折叠反而变高。
 * 跨 640px 用 matchMedia 重新初始化：桌面完全不加 class、不插按钮，内容原样展示。
 * 逻辑并入本文件而非新建脚本，避免给 105 页再加一行 <script>；两个 IIFE 互不依赖。 */
(function () {
  if (window.__heroFoldInjected) return;
  window.__heroFoldInjected = true;
  var hero = document.querySelector('header.hero');
  if (!hero) return;
  var mq = window.matchMedia('(max-width:640px)');
  var btn = null;

  function reset() {
    if (btn) { btn.remove(); btn = null; }
    hero.classList.remove('hero-compact', 'hero-expanded');
    [].forEach.call(hero.querySelectorAll('.hero-extra'), function (el) { el.classList.remove('hero-extra'); });
  }

  function init() {
    reset();
    if (!mq.matches) return;

    var descs = [].slice.call(hero.querySelectorAll(':scope > p'));
    var pills = [].slice.call(hero.querySelectorAll('.pill'));
    var links = [].slice.call(hero.querySelectorAll('.gotos a, .links a'));
    var longDesc = descs.some(function (p) {
      var lh = parseFloat(getComputedStyle(p).lineHeight) || 19.5;
      return p.getBoundingClientRect().height > lh * 2.2;
    });
    var extras = pills.slice(3).concat(links.slice(4));
    if (!longDesc && !extras.length) return;

    var before = hero.getBoundingClientRect().height;
    extras.forEach(function (el) { el.classList.add('hero-extra'); });

    var n = extras.length;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hero-toggle';
    btn.setAttribute('aria-label', '展开 hero 全文与更多标签导航，共 ' + n + ' 项');
    function sync() {
      var open = hero.classList.contains('hero-expanded');
      btn.textContent = open ? '收起 ▴' : '展开全文' + (n ? ' +' + n : '') + ' ▾';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    var host = hero.querySelector('.gotos, .links') || hero;
    host.appendChild(btn);
    hero.classList.add('hero-compact');
    sync();

    if (hero.getBoundingClientRect().height >= before - 4) { reset(); return; }

    btn.addEventListener('click', function () {
      var open = hero.classList.toggle('hero-expanded');
      hero.classList.toggle('hero-compact', !open);
      sync();
    });
  }

  init();
  if (mq.addEventListener) mq.addEventListener('change', init);
  else if (mq.addListener) mq.addListener(init);
})();
