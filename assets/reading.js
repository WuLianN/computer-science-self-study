/* 按课程目录自动记录小节书签；由 dock.js 统一加载，无需逐课配置。
 * 每门保留一个位置；首页按最近阅读排序，只展示可见科目。 */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script || window.__readingInjected) return;
  window.__readingInjected = true;
  var root = new URL('../', script.src);
  var key = 'cs-reading-v1:' + root.pathname;
  var path = location.pathname.slice(root.pathname.length);
  var courseDirectory = path.split('/')[0];
  var courseMatch = courseDirectory.match(/-(\d{5})$/);
  var course = courseMatch ? courseMatch[1] : null;
  var homeExpanded = false;
  var homeLimit = 4;

  function clean(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
  function read() {
    try {
      var data = JSON.parse(localStorage.getItem(key));
      if (data && data.version === 1 && data.records && typeof data.records === 'object' && !Array.isArray(data.records)) return data.records;
    } catch (e) {}
    return {};
  }
  function destination(record, code) {
    if (!record || typeof record.path !== 'string' || record.path.length > 600 || typeof record.anchor !== 'string' || !record.anchor || record.anchor.length > 160 || typeof record.section !== 'string' || typeof record.page !== 'string') return null;
    try {
      var url = new URL(record.path, root);
      if (url.protocol !== root.protocol || url.host !== root.host || url.username || url.password || !url.pathname.startsWith(root.pathname) || !url.pathname.endsWith('.html') || url.search || url.hash) return null;
      var directory = url.pathname.slice(root.pathname.length).split('/')[0];
      if (!directory.endsWith('-' + code)) return null;
      url.hash = encodeURIComponent(record.anchor);
      return url;
    } catch (e) { return null; }
  }

  function renderHome() {
    var panel = document.querySelector('[data-reading-home]');
    if (!panel) return;
    var list = panel.querySelector('.reading-home-list');
    var toggle = panel.querySelector('[data-reading-toggle]');
    var records = read();
    var entries = [];
    list.textContent = '';
    document.querySelectorAll('#app > .subject[id^="sub-"]').forEach(function (subject) {
      var code = subject.id.slice(4);
      var record = records[code];
      var url = destination(record, code);
      if (!url) return;
      entries.push({subject:subject, code:code, record:record, url:url});
    });
    entries.sort(function (a, b) {
      function timestamp(entry) {
        return typeof entry.record.updatedAt === 'number' && Number.isFinite(entry.record.updatedAt) ? entry.record.updatedAt : 0;
      }
      return timestamp(b) - timestamp(a);
    });
    if (entries.length <= homeLimit) homeExpanded = false;
    entries.forEach(function (entry, i) {
      var a = document.createElement('a');
      a.className = 'reading-home-link';
      a.href = entry.url.href;
      a.hidden = !homeExpanded && i >= homeLimit;
      var title = document.createElement('b');
      title.textContent = entry.code + ' · ' + clean(entry.subject.querySelector('h2').textContent);
      var detail = document.createElement('span');
      detail.textContent = entry.record.page + ' · ' + entry.record.section;
      a.appendChild(title);
      a.appendChild(detail);
      list.appendChild(a);
    });
    panel.hidden = !list.children.length;
    if (toggle) {
      toggle.hidden = entries.length <= homeLimit;
      toggle.textContent = homeExpanded ? '收起' : '展开其余 ' + (entries.length - homeLimit) + ' 门';
      toggle.setAttribute('aria-expanded', String(homeExpanded));
    }
  }

  if (!course) {
    var toggle = document.querySelector('[data-reading-toggle]');
    if (toggle) toggle.addEventListener('click', function () {
      homeExpanded = !homeExpanded;
      renderHome();
    });
    renderHome();
    document.addEventListener('reading:render', renderHome);
    window.addEventListener('pageshow', renderHome);
    window.addEventListener('storage', function (e) { if (e.key === key || e.key === null) renderHome(); });
    return;
  }
  if (!location.pathname.startsWith(root.pathname) || /^(知识点|真题)\/index\.html$/.test(decodeURI(path.slice(courseDirectory.length + 1)))) return;

  // 旧页面已有的锚点保持不变；少数无锚点的图示页与真题标题补稳定的顺序 ID。
  document.querySelectorAll('.wrap h2').forEach(function (heading, i) {
    if (!heading.id) {
      var id = 'reading-section-' + (i + 1);
      while (document.getElementById(id)) id += '-section';
      heading.id = id;
    }
  });
  var targets = Array.prototype.slice.call(document.querySelectorAll('.wrap h2[id], .wrap details.q[id]'));
  if (!targets.length) return;
  var title = clean(document.querySelector('h1') ? document.querySelector('h1').textContent : document.title);
  var page = title;
  if (/考前抢分/.test(title)) page = '考前抢分';
  else if (/真题详解/.test(title)) {
    var date = title.match(/(\d{4})年(\d{1,2})月/);
    page = (date ? date[1] + '.' + date[2] + ' ' : '') + '真题详解';
  }
  page = page.replace(/^[^0-9A-Za-z\u3400-\u9fff]+/, '').slice(0, 160);
  function label(target) {
    if (target.matches('details.q')) {
      var summary = target.querySelector('summary');
      var question = summary ? (summary.querySelector('.stem') || summary).cloneNode(true) : null;
      if (question) question.querySelectorAll('.toggle,.num,.qno,.opts').forEach(function (el) { el.remove(); });
      return clean('第 ' + target.id.replace(/^q/, '') + ' 题：' + (question ? question.textContent : '')).slice(0, 100);
    }
    return clean(target.textContent).slice(0, 160);
  }

  var previous = read()[course];
  if (!location.hash && destination(previous, course) && previous.path === path && document.getElementById(previous.anchor)) {
    var hero = document.querySelector('header.hero');
    if (hero) {
      var resume = document.createElement('div');
      resume.className = 'reading-resume';
      var link = document.createElement('a');
      link.href = '#' + encodeURIComponent(previous.anchor);
      link.textContent = '继续上次：' + previous.section + ' →';
      resume.appendChild(link);
      hero.insertAdjacentElement('afterend', resume);
    }
  }

  var engaged = false;
  var printing = false;
  var startY = window.scrollY;
  var timer;
  var savedAnchor = null;
  function current() {
    var chosen = null;
    var boundary = Math.min(180, window.innerHeight * 0.25);
    var atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    targets.forEach(function (target) {
      var top = target.getBoundingClientRect().top;
      if (target.getClientRects().length && (top <= boundary || (atEnd && top < window.innerHeight))) chosen = target;
    });
    return chosen;
  }
  function save(target) {
    if (!engaged || printing || window.matchMedia('print').matches || document.visibilityState === 'prerender') return;
    target = target || current();
    if (!target) return;
    try {
      var records = read();
      var stored = records[course];
      // 本次打开后首次阅读也刷新时间；同一位置的连续滚动不反复写入。
      if (savedAnchor === target.id && stored && stored.path === path && stored.anchor === target.id) return;
      records[course] = {path:path, anchor:target.id, page:page, section:label(target), updatedAt:Date.now()};
      localStorage.setItem(key, JSON.stringify({version:1, records:records}));
      savedAnchor = target.id;
    } catch (e) {}
  }
  function schedule() {
    if (Math.abs(window.scrollY - startY) > 24) engaged = true;
    clearTimeout(timer);
    timer = setTimeout(function () { save(); }, 400);
  }
  function followHash() {
    var target;
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return; }
    if (!target) return;
    var section = targets.indexOf(target) >= 0 ? target : null;
    if (!section) {
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING) section = targets[i];
      }
    }
    // defer 脚本在 dock.js 之后执行；等首屏折叠布局稳定后再定位显式锚点。
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var parent = target.parentElement.closest('details');
        if (parent) parent.open = true;
        target.scrollIntoView({block:'start', behavior:'instant'});
        engaged = true;
        save(section);
      });
    });
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('hashchange', followHash);
  window.addEventListener('pagehide', function () { clearTimeout(timer); save(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(timer); save(); } });
  window.addEventListener('beforeprint', function () { save(); printing = true; });
  window.addEventListener('afterprint', function () { printing = false; startY = window.scrollY; });
  if (location.hash) followHash();
})();
