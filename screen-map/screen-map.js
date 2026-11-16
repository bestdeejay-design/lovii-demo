/* Карта экранов LOVII — рендер из data.js (window.SCREEN_MAP_DATA) */
(function () {
  'use strict';
  var D = window.SCREEN_MAP_DATA;
  if (!D) return;

  var VP_ORDER = ['mobile', 'fold', 'tablet', 'web'];
  var VP_LABEL = { mobile: 'Мобайл 390', fold: 'Fold 717', tablet: 'Планшет 1024', web: 'Web 1440' };
  var STATUS_LABEL = { implemented: '✅ реализован', stub: '🔶 заглушка', mock: '📋 mock' };
  var STATUS_CLASS = { implemented: 'sm-badge-ok', stub: 'sm-badge-stub', mock: 'sm-badge-mock' };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ---- Тема ---- */
  var tgl = document.getElementById('theme-toggle');
  function themeIcon() {
    tgl.textContent = document.documentElement.dataset.theme === 'dark' ? '☀️' : '🌙';
  }
  tgl.addEventListener('click', function () {
    var cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('lovii_theme', next); } catch (e) { /* noop */ }
    themeIcon();
  });
  themeIcon();

  /* ---- Шапка ---- */
  var modules = {};
  D.routes.forEach(function (r) { modules[r.module] = true; });
  var nModules = Object.keys(modules).length;
  var shoot = D.shoot_date || '';
  document.getElementById('sm-subtitle').textContent =
    D.routes.length + ' экранов · ' + nModules + ' модулей · ' +
    (D.modals.length ? D.modals.length + ' модалок · ' : '') +
    'съёмка ' + shoot.split('-').reverse().join('.') + ' (app-staging)';

  /* ---- Фильтры ---- */
  var state = { role: 'все', module: 'все', status: 'все', q: '' };
  var roles = ['все'].concat(
    D.routes.map(function (r) { return r.role; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort()
  );
  var mods = ['все'].concat(Object.keys(modules).sort());
  var statuses = ['все'].concat(
    D.routes.map(function (r) { return r.status; }).filter(function (v, i, a) { return a.indexOf(v) === i; })
  );

  function chiprow(el, items, key) {
    var label = { role: 'Роль:', module: 'Модуль:', status: 'Статус:' }[key];
    el.innerHTML = '<span class="sm-chiprow-label">' + label + '</span>' + items.map(function (v) {
      var shown = key === 'status' && STATUS_LABEL[v] ? STATUS_LABEL[v] : v;
      return '<button class="sm-chip' + (v === 'все' ? ' on' : '') + '" data-v="' + esc(v) + '">' + esc(shown) + '</button>';
    }).join('');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('.sm-chip');
      if (!b) return;
      state[key] = b.dataset.v;
      el.querySelectorAll('.sm-chip').forEach(function (c) { c.classList.toggle('on', c === b); });
      render();
    });
  }
  chiprow(document.getElementById('f-role'), roles, 'role');
  chiprow(document.getElementById('f-module'), mods, 'module');
  chiprow(document.getElementById('f-status'), statuses, 'status');

  var search = document.getElementById('f-search');
  search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); render(); });

  function match(r) {
    if (state.role !== 'все' && r.role !== state.role) return false;
    if (state.module !== 'все' && r.module !== state.module) return false;
    if (state.status !== 'все' && r.status !== state.status) return false;
    if (state.q) {
      var hay = (r.title || '') + ' ' + r.path + ' ' + r.name + ' ' + r.component;
      if (hay.toLowerCase().indexOf(state.q) === -1) return false;
    }
    return true;
  }

  /* ---- Сетка карточек ---- */
  var grid = document.getElementById('sm-grid');
  var count = document.getElementById('sm-count');

  function stageHref(r) {
    // /business/pending и parent-роуты без карточки — ведём на первую живую дочернюю страницу
    if (r.path === '/business/pending') return 'https://app-staging.lovii.ru/business';
    return 'https://app-staging.lovii.ru' + r.path.replace(/\/$/, '') ;
  }

  function render() {
    var list = D.routes.filter(match);
    count.textContent = 'Показано ' + list.length + ' из ' + D.routes.length;
    grid.innerHTML = list.map(function (r, i) {
      var shots = VP_ORDER.filter(function (vp) { return r.shots && r.shots[vp]; }).map(function (vp) {
        return '<button class="sm-shot" data-idx="' + i + '" data-vp="' + vp + '" aria-label="Открыть ' + VP_LABEL[vp] + '">' +
          '<img loading="lazy" src="' + esc(r.shots[vp]) + '" alt="' + esc(r.title || r.name) + ' — ' + VP_LABEL[vp] + '">' +
          '<span class="sm-shot-label">' + VP_LABEL[vp] + '</span></button>';
      }).join('');
      var badge = '<span class="sm-badge ' + STATUS_CLASS[r.status] + '">' + STATUS_LABEL[r.status] + '</span>';
      var comp = r.screenId ? esc(r.screenId) + ' · ' + esc(r.component) : esc(r.component);
      var stub = r.status !== 'implemented'
        ? '<div class="sm-comp">Заглушка: материалы-заглушки, реальный контент — в бэклоге</div>' : '';
      return '<article class="sm-card" id="card-' + i + '">' +
        '<div class="sm-card-top"><div><h3>' + esc(r.title || r.name) + '</h3>' +
        '<div class="sm-route">' + esc(r.path) + '</div></div>' + badge + '</div>' +
        '<div class="sm-tags"><span class="sm-tag sm-tag-role">' + esc(r.role) + '</span>' +
        '<span class="sm-tag">' + esc(r.module) + '</span></div>' +
        stub +
        '<div class="sm-shots">' + (shots || '<p class="sm-route">Нет скринов (redirect)</p>') + '</div>' +
        '<div class="sm-card-foot"><span class="sm-comp">' + comp + '</span>' +
        '<a class="sm-link" href="' + esc(stageHref(r)) + '" target="_blank" rel="noopener">Открыть на staging ↗</a></div>' +
        '</article>';
    }).join('');
  }
  render();

  /* ---- Лайтбокс ---- */
  var lb = document.getElementById('sm-lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbTabs = document.getElementById('lb-tabs');
  var lbMeta = document.getElementById('lb-meta');
  var cur = { idx: 0, vp: 'mobile' };

  function openLb(idx, vp) {
    cur = { idx: idx, vp: vp };
    drawLb();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
  }
  function drawLb() {
    var r = D.routes.filter(match)[cur.idx];
    if (!r) return;
    var vps = VP_ORDER.filter(function (vp) { return r.shots && r.shots[vp]; });
    if (vps.indexOf(cur.vp) === -1) cur.vp = vps[0];
    lbTitle.textContent = (r.title || r.name) + ' — ' + VP_LABEL[cur.vp];
    lbImg.src = r.shots[cur.vp];
    lbImg.alt = (r.title || r.name) + ' ' + VP_LABEL[cur.vp];
    lbTabs.innerHTML = vps.map(function (vp) {
      return '<button class="sm-lb-tab' + (vp === cur.vp ? ' on' : '') + '" data-vp="' + vp + '">' + VP_LABEL[vp] + '</button>';
    }).join('');
    lbMeta.textContent = (r.meta && r.meta.tool ? r.meta.tool + ' · ' : '') + (r.version || '') +
      ' · ' + stageHref(r);
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.sm-shot');
    if (!b) return;
    openLb(Number(b.dataset.idx), b.dataset.vp);
  });
  lbTabs.addEventListener('click', function (e) {
    var b = e.target.closest('.sm-lb-tab');
    if (!b) return;
    cur.vp = b.dataset.vp;
    drawLb();
  });
  function step(d) {
    var vps = VP_ORDER.filter(function (vp) {
      var r = D.routes.filter(match)[cur.idx];
      return r && r.shots && r.shots[vp];
    });
    var i = vps.indexOf(cur.vp);
    cur.vp = vps[(i + d + vps.length) % vps.length];
    drawLb();
  }
  document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
  document.getElementById('lb-next').addEventListener('click', function () { step(1); });
  document.getElementById('lb-close').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('sm-lb-body')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---- Бэклог ---- */
  document.getElementById('sm-modals').innerHTML = D.modals.map(function (m) {
    return '<li><b>' + esc(m.title) + '</b> — <code>' + esc(m.id) + '</code>, ' + esc(m.status) + '.</li>';
  }).join('');

  var known = [];
  D.orphans.forEach(function (o) { known.push('<li><b>Сирота каталога:</b> ' + esc(o) + '.</li>'); });
  (D.structural || []).forEach(function (s) { known.push('<li>Структурный роут (без своей карточки): <code>' + esc(s) + '</code>.</li>'); });
  known.push('<li><b>APP-P-041</b> AmbassadorTraining — <b>mock</b>: честная заглушка учебных материалов, контент — в бэклоге.</li>');
  known.push('<li><b>APP-P-058</b> fake-terminal — только на dev/staging: маршрута нет в production-сборке (<code>VITE_APP_ENV</code>).</li>');
  (D.notes || []).forEach(function (n) { known.push('<li>' + esc(n) + '</li>'); });
  document.getElementById('sm-known').innerHTML = known.join('');
})();
