/* LOVII · /tour/ — сторителлинг + лайтбокс. Без библиотек. */
(function () {
  'use strict';
  var DATA = window.TOUR;
  if (!DATA) return;

  /* ---------- рендер глав и карточек ---------- */
  var story = document.getElementById('story');
  var vpLabels = { mobile: 'Телефон', fold: 'Складной', tablet: 'Планшет', web: 'Ноутбук' };
  var html = '';

  DATA.chapters.forEach(function (ch, ci) {
    html += '<section class="chapter" id="' + ch.id + '">' +
      '<div class="chapter__head reveal">' +
        '<p class="chapter__num">Глава ' + (ci + 1) + ' из ' + DATA.chapters.length + '</p>' +
        '<h2 class="chapter__title">' + esc(ch.title) + '</h2>' +
        '<p class="chapter__lead">' + esc(ch.lead) + '</p>' +
      '</div><div class="cards">';
    ch.items.forEach(function (it) {
      var shot = it.shots.mobile || it.shots[Object.keys(it.shots)[0]];
      html += '<figure class="card reveal" tabindex="0" role="button" data-chapter="' + ch.id + '" data-screen="' + it.id + '" aria-label="' + esc(it.title) + ' — открыть просмотр">' +
        '<div class="card__shot">' +
          '<span class="card__zoom" aria-hidden="true">⤢</span>' +
          '<img loading="lazy" decoding="async" src="' + shot + '" alt="' + esc(it.title) + '">' +
        '</div>' +
        '<figcaption class="card__body">' +
          '<p class="card__title">' + esc(it.title) + '</p>' +
          '<p class="card__desc">' + esc(it.desc) + '</p>' +
        '</figcaption></figure>';
    });
    html += '</div></section>';
  });
  story.innerHTML = html;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- появление по скроллу ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- sticky панель прогресса + счётчики ---------- */
  var bar = document.getElementById('stats-bar');
  var hero = document.getElementById('hero');
  var counted = false;
  function onScroll() {
    var past = hero.offsetHeight - 80 < window.scrollY;
    bar.classList.toggle('is-visible', past);
    if (past && !counted) { counted = true; runCounters(); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function runCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var t0 = null, dur = 1100;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        p = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
        el.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- тема ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  themeBtn.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('lovii_theme', next); } catch (e) {}
  });

  /* ---------- лайтбокс ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbTitle = document.getElementById('lb-title');
  var lbDesc = document.getElementById('lb-desc');
  var lbVps = document.getElementById('lb-vps');
  var lbSpinner = document.getElementById('lb-spinner');
  var lbFrame = document.getElementById('lb-frame');

  var flat = [];   // {item, chapter}
  DATA.chapters.forEach(function (ch) {
    ch.items.forEach(function (it) { flat.push({ item: it, chapter: ch }); });
  });
  var cur = -1;
  var vpOrder = ['mobile', 'fold', 'tablet', 'web'];
  var vpIndex = 0;
  var lastFocus = null;

  function renderVpTabs(item) {
    var keys = vpOrder.filter(function (k) { return item.shots[k]; });
    lbVps.innerHTML = keys.map(function (k) {
      return '<button class="lb-vp" type="button" role="tab" data-vp="' + k + '" aria-selected="false">' + vpLabels[k] + '</button>';
    }).join('');
    lbVps.querySelectorAll('.lb-vp').forEach(function (b) {
      b.addEventListener('click', function () { setViewport(keys.indexOf(b.dataset.vp)); });
    });
    return keys;
  }
  var curKeys = [];

  function open(idx) {
    if (idx < 0 || idx >= flat.length) return;
    cur = idx; vpIndex = 0;
    var it = flat[cur].item;
    curKeys = renderVpTabs(it);
    lbTitle.textContent = it.title;
    lbDesc.textContent = it.desc;
    applyShot();
    if (lb.hidden) {
      lastFocus = document.activeElement;
      lb.hidden = false;
      document.body.classList.add('lb-open');
      document.querySelector('.lb-close').focus();
    }
  }
  function applyShot() {
    var it = flat[cur].item;
    var key = curKeys[Math.min(vpIndex, curKeys.length - 1)];
    lbSpinner.hidden = false;
    lbVps.querySelectorAll('.lb-vp').forEach(function (b, i) {
      b.setAttribute('aria-selected', String(i === vpIndex));
    });
    var loaded = function () {
      lbSpinner.hidden = true;
      lbImg.classList.remove('is-swapping');
    };
    lbImg.classList.add('is-swapping');
    lbImg.onload = loaded;
    lbImg.onerror = loaded;
    lbImg.src = it.shots[key];
    lbImg.alt = it.title + ' — ' + vpLabels[key];
    /* если кадр в кэше — onload может не сработать */
    if (lbImg.complete) loaded();
  }
  function setViewport(i) { vpIndex = Math.max(0, Math.min(curKeys.length - 1, i)); applyShot(); }
  function nav(delta) {
    var next = cur + delta;
    if (next < 0) next = flat.length - 1;
    if (next >= flat.length) next = 0;
    open(next);
  }
  function close() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    lbImg.src = '';
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.card').forEach(function (card) {
    function openCard() {
      var id = card.dataset.screen;
      for (var i = 0; i < flat.length; i++) if (flat[i].item.id === id) { open(i); return; }
    }
    card.addEventListener('click', openCard);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
    });
  });
  lb.querySelectorAll('[data-lb-close]').forEach(function (el) { el.addEventListener('click', close); });
  document.querySelector('.lb-arrow--prev').addEventListener('click', function () { nav(-1); });
  document.querySelector('.lb-arrow--next').addEventListener('click', function () { nav(1); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') nav(-1);
    else if (e.key === 'ArrowRight') nav(1);
    else if (e.key === 'ArrowUp') { e.preventDefault(); setViewport(vpIndex - 1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setViewport(vpIndex + 1); }
  });

  /* свайп между экранами (тач) + свайп вверх/вниз = смена устройства */
  var touch = null;
  lbFrame.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, { passive: true });
  lbFrame.addEventListener('touchend', function (e) {
    if (!touch) return;
    var dx = e.changedTouches[0].clientX - touch.x;
    var dy = e.changedTouches[0].clientY - touch.y;
    var dt = Date.now() - touch.t;
    touch = null;
    if (dt > 800) return;
    var adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx > 48 && adx > ady * 1.4) nav(dx < 0 ? 1 : -1);
    else if (ady > 48 && ady > adx * 1.4) setViewport(vpIndex + (dy < 0 ? 1 : -1));
  }, { passive: true });

  /* лёгкий drag мышью на десктопе — по желанию, стрелки и клавиатура основные */
})();
