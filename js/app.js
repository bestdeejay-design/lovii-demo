/**
 * LOVII Витрина — ядро: состояние, hash-роутер, селекторы данных, события.
 * Данные — js/data.js, гео — js/geo.js, экраны — js/screens.js.
 */

/* ================= Состояние ================= */

const PERSIST_KEY = 'lovii_vitrina';

/* ================= Тема (светлая/тёмная) ================= */

const THEME_KEY = 'lovii_theme';
const THEME_META = { light: '#f64a8a', dark: '#171219' };

function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const meta = document.getElementById('meta-theme');
  if (meta) meta.setAttribute('content', THEME_META[t]);
}

function toggleTheme() {
  const t = currentTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, t); } catch { /* приватный режим */ }
  applyTheme(t);
  toast(t === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена');
}

// пока пользователь не выбрал тему явно — следим за системной
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', (e) => {
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* no-op */ }
  if (saved !== 'dark' && saved !== 'light') applyTheme(e.matches ? 'dark' : 'light');
});

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(PERSIST_KEY) || '{}');
  } catch {
    return {};
  }
}

const persisted = loadPersisted();

const state = {
  view: { name: 'home', param: null },
  district: persisted.district || 'Тверской',
  cart: persisted.cart || [],
  orders: persisted.orders || [],
  // роли и профиль (localStorage)
  favorites: persisted.favorites || [],
  roles: persisted.roles || {},
  activeRole: persisted.activeRole || null,
  chats: persisted.chats || null, // сид создаёт dash.js (ensureChats)
  // сессионное (не сохраняется)
  category: 'all',
  kindTab: 'goods',
  sort: 'walk',
  searchQ: '',
  searchTab: 'products',
  flashStore: null,
  sheetOpen: false,
  dashPeriod: 'week',
  ownerRegion: 'Все',
};

function persist() {
  try {
    localStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        district: state.district,
        cart: state.cart,
        orders: state.orders,
        favorites: state.favorites,
        roles: state.roles,
        activeRole: state.activeRole,
        chats: state.chats,
      })
    );
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

/* ================= Селекторы данных ================= */

const selectors = {
  districtObj() {
    return LOVII_DATA.districts.find((d) => d.name === state.district) || LOVII_DATA.districts[0];
  },

  storeBySlug(slug) {
    return LOVII_DATA.stores.find((s) => s.slug === slug);
  },

  /** Точки района с дистанцией/минутами/открыто, сортировка по близости */
  storesRows(q) {
    const d = this.districtObj();
    const query = (q || '').trim().toLowerCase();
    return LOVII_DATA.stores
      .map((s) => {
        const meters = haversineMeters(d.lat, d.lng, s.lat, s.lng);
        return {
          ...s,
          meters: Math.round(meters),
          distance: formatDistance(meters),
          walkMinutes: walkingMinutes(meters),
          open: isOpenNow(s.hours),
          productsCount: LOVII_DATA.products.filter((p) => p.avail.some((a) => a[0] === s.slug)).length,
        };
      })
      .filter((s) =>
        query ? s.name.toLowerCase().includes(query) || s.address.toLowerCase().includes(query) || s.category.includes(query) : true
      )
      .sort((a, b) => a.walkMinutes - b.walkMinutes);
  },

  /** Наличие товара по всем точкам, сортировка по близости, цена с дельтой */
  availRows(product) {
    const d = this.districtObj();
    return product.avail
      .map((a) => {
        const st = this.storeBySlug(a[0]);
        if (!st) return null;
        const meters = haversineMeters(d.lat, d.lng, st.lat, st.lng);
        return {
          storeSlug: st.slug,
          storeName: st.name,
          storeEmoji: st.emoji,
          storeColor: st.color,
          storeRating: st.rating,
          storeAddress: st.address,
          storeOpen: isOpenNow(st.hours),
          stock: a[1],
          price: product.price + (a[2] || 0),
          meters: Math.round(meters),
          distance: formatDistance(meters),
          walkMinutes: walkingMinutes(meters),
        };
      })
      .filter(Boolean)
      .sort((x, y) => x.walkMinutes - y.walkMinutes);
  },

  /** Витрина товаров: ближайшая точка с наличием + «в скольких точках рядом» */
  productRows({ q, category, sort } = {}) {
    const query = (q || '').trim().toLowerCase();
    let rows = LOVII_DATA.products.map((p) => {
      const avail = this.availRows(p);
      const inStock = avail.filter((a) => a.stock > 0);
      const nearest = inStock[0] || null;
      return {
        ...p,
        price: nearest ? nearest.price : p.price,
        walkMinutes: nearest ? nearest.walkMinutes : null,
        distance: nearest ? nearest.distance : null,
        pointsCount: inStock.length,
        storeName: nearest ? nearest.storeName : null,
        storeSlug: nearest ? nearest.storeSlug : null,
        storeColor: nearest ? nearest.storeColor : null,
        _raw: p,
        _availStoreSet: new Set(p.avail.map((a) => a[0])),
      };
    });

    if (category && category !== 'all') rows = rows.filter((r) => r.category === category);
    if (query) rows = rows.filter((r) => r.name.toLowerCase().includes(query));

    if (sort === 'price') rows.sort((a, b) => a.price - b.price);
    else rows.sort((a, b) => (a.walkMinutes ?? 99) - (b.walkMinutes ?? 99));

    return rows;
  },
};

/* ================= Навигация ================= */

const navStack = [];

function go(name, param) {
  navStack.push(location.hash || '#/home');
  if (navStack.length > 20) navStack.shift();
  const h = '#/' + name + (param ? '/' + param : '');
  if (location.hash === h) renderView();
  else location.hash = h;
}

function back() {
  const prev = navStack.pop() || '#/home';
  if (location.hash === prev) renderView();
  else location.hash = prev;
}

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [name, param] = h.split('/');
  const known = ['home', 'store', 'product', 'search', 'cart', 'orders', 'profile', 'apply', 'dash', 'chat'];
  return { name: known.includes(name) ? name : 'home', param: param || null };
}

/* ================= Рендер ================= */

function currentScreenHtml() {
  const { name, param } = state.view;
  if (name === 'store' && param) return renderStore(param);
  if (name === 'product' && param) return renderProduct(param);
  if (name === 'apply' && param) return renderApply(param);
  if (name === 'dash') return renderDash(param || 'index');
  if (name === 'chat' && param) return renderChat(param);
  return (SCREENS[name] || renderHome)();
}

function renderView(keepScroll) {
  const { name, param } = parseHash();
  state.view = { name, param };

  const view = document.getElementById('view');
  let html = currentScreenHtml();

  // Подшапка «назад» для вторичных экранов
  let sub = '';
  if (name === 'store' && param) {
    const s = selectors.storeBySlug(param);
    sub = subHeaderHtml(s ? s.name : 'Точка');
  } else if (name === 'product' && param) {
    const p = LOVII_DATA.products.find((x) => x.slug === param);
    sub = subHeaderHtml(p ? p.name : 'Товар');
  } else if (name === 'apply' && param) {
    sub = subHeaderHtml('Заявка на роль');
  }
  if (sub) {
    html = sub + `<div>${html}</div>`;
    // подсшапка sticky top учитывает шапку (56px) — уже в CSS
  }

  // При смене экрана — наверх; при точечных фильтрах (keepScroll) — держим позицию,
  // чтобы выбранная категория/сортировка не сбрасывали прокрутку
  const sy = keepScroll ? window.scrollY : 0;
  view.innerHTML = html;
  window.scrollTo(0, sy);
  updateChrome();
  watchCatsSticky();
}

/* Липкие чипы: тень только в прилипшем состоянии. Сентинел перед плашкой уходит выше линии шапки (56px) → .stuck */
let catsStickyObserver = null;
function watchCatsSticky() {
  if (catsStickyObserver) { catsStickyObserver.disconnect(); catsStickyObserver = null; }
  const bar = document.querySelector('.cats-sticky');
  const sentinel = document.querySelector('.cats-sentinel');
  if (!bar || !sentinel || typeof IntersectionObserver === 'undefined') return;
  catsStickyObserver = new IntersectionObserver((entries) => {
    const e = entries[entries.length - 1];
    bar.classList.toggle('stuck', !e.isIntersecting);
  }, { rootMargin: '-56px 0px 0px 0px', threshold: 0 });
  catsStickyObserver.observe(sentinel);
}

function subHeaderHtml(title) {
  return `
  <div class="subheader">
    <div class="subheader-in">
      <button class="back-btn" data-action="back" aria-label="Назад">${icon('chev-left')}</button>
      <h1>${esc(title)}</h1>
    </div>
  </div>`;
}

function updateChrome() {
  // район в шапке
  const d = selectors.districtObj();
  const lbl = document.getElementById('district-label');
  if (lbl) lbl.textContent = d ? d.name : 'Район';

  // бейджи корзины
  const count = state.cart.reduce((s, c) => s + c.qty, 0);
  ['cart-badge', 'nav-cart-badge'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = count > 0 ? 'flex' : 'none';
    el.textContent = count;
  });

  // активная кнопка навигации (роли подсвечивают «Профиль»)
  const navName = state.view.name;
  const roleScreens = ['profile', 'apply', 'dash', 'chat'];
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const isActive = btn.dataset.nav === 'profile' ? roleScreens.includes(navName) : btn.dataset.nav === navName;
    btn.classList.toggle('active', isActive);
  });
}

/* ================= Тосты ================= */

function toast(msg, desc) {
  const wrap = document.getElementById('toast-wrap');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = esc(msg) + (desc ? `<div class="d">${esc(desc)}</div>` : '');
  wrap.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, 2400);
}

/* ================= Корзина ================= */

function addToCart(item, qty = 1) {
  const cart = [...state.cart];
  const idx = cart.findIndex((c) => c.slug === item.slug && c.storeSlug === item.storeSlug);
  if (idx >= 0) cart[idx] = { ...cart[idx], qty: cart[idx].qty + qty };
  else cart.push({ ...item, qty });
  state.cart = cart;
  persist();
}

function changeQty(slug, storeSlug, delta) {
  state.cart = state.cart
    .map((c) => (c.slug === slug && c.storeSlug === storeSlug ? { ...c, qty: c.qty + delta } : c))
    .filter((c) => c.qty > 0);
  persist();
}

function removeFromStore(storeSlug) {
  state.cart = state.cart.filter((c) => c.storeSlug !== storeSlug);
  persist();
}

function checkout() {
  const first = state.cart[0];
  const order = {
    id: 'L' + Date.now().toString(36).toUpperCase().slice(-6),
    createdAt: Date.now(),
    pickupStore: first.storeName,
    items: state.cart.map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji, qty: c.qty, price: c.price })),
    total: state.cart.reduce((s, c) => s + c.price * c.qty, 0),
  };
  state.orders = [order, ...state.orders];
  state.cart = [];
  persist();
  return order;
}

/* ================= Шит района ================= */

function openSheet() {
  state.sheetOpen = true;
  const overlay = document.getElementById('sheet-overlay');
  const sheet = document.getElementById('district-sheet');
  overlay.classList.add('open');
  sheet.classList.add('open');
  renderSheetRows();
}

function closeSheet() {
  state.sheetOpen = false;
  document.getElementById('sheet-overlay').classList.remove('open');
  document.getElementById('district-sheet').classList.remove('open');
}

function renderSheetRows() {
  const body = document.querySelector('#district-sheet .sheet-body');
  body.innerHTML = LOVII_DATA.districts
    .map(
      (x) => `
    <button class="district-row ${x.name === state.district ? 'active' : ''}" data-action="district" data-name="${esc(x.name)}">
      <span class="l">
        <span class="ic">${icon('pin')}</span>
        <span><span class="nm">${esc(x.name)}</span><span class="mt">м. ${esc(x.metro)}</span></span>
      </span>
      ${x.name === state.district ? '<span class="lv-dot" style="background:var(--pink)"></span>' : ''}
    </button>`
    )
    .join('');
}

/* ================= События ================= */

document.addEventListener('click', (e) => {
  const goEl = e.target.closest('[data-go]');
  const actEl = e.target.closest('[data-action]');

  if (goEl) {
    const [name, param] = goEl.dataset.go.split(':');
    if (name === 'search' && goEl.dataset.tab) state.searchTab = goEl.dataset.tab;
    go(name, param);
    return;
  }
  if (!actEl) return;
  const a = actEl.dataset.action;

  switch (a) {
    case 'open-sheet':
      openSheet();
      break;

    case 'back':
      back();
      break;

    case 'hero-toggle': {
      const hero = document.getElementById('hero');
      if (!hero) break;
      hero.classList.toggle('collapsed');
      const isOpen = !hero.classList.contains('collapsed');
      try { localStorage.setItem('lovii_hero', isOpen ? '1' : '0'); } catch (_) {}
      actEl.setAttribute('aria-expanded', String(isOpen));
      const lbl = document.getElementById('hero-tab-lbl');
      if (lbl) {
        const d = selectors.districtObj();
        lbl.textContent = isOpen
          ? `Ваш район: ${esc(d.name)} · м. ${esc(d.metro)}`
          : 'Всё нужное — в шаговой доступности';
      }
      break;
    }

    case 'district': {
      state.district = actEl.dataset.name;
      persist();
      closeSheet();
      renderView();
      toast(`Район: ${state.district}`, 'Показываем точки в шаговой доступности');
      break;
    }

    case 'category': {
      const val = actEl.dataset.val;
      state.category = state.category === val ? 'all' : val;
      refreshHomeCatalog();
      break;
    }

    case 'kind':
      state.kindTab = actEl.dataset.val;
      refreshHomeCatalog();
      break;

    case 'sort':
      state.sort = actEl.dataset.val;
      refreshHomeCatalog();
      break;

    case 'stab':
      state.searchTab = actEl.dataset.val;
      document.getElementById('search-list').innerHTML = searchListHtml();
      document.querySelectorAll('.tab-btn').forEach((b) => {
        b.classList.toggle('active', b.dataset.val === state.searchTab);
      });
      break;

    case 'clear-q':
      state.searchQ = '';
      renderView();
      break;

    case 'add': {
      const p = LOVII_DATA.products.find((x) => x.slug === actEl.dataset.slug);
      const st = selectors.storeBySlug(actEl.dataset.store);
      if (!p || !st) break;
      const avail = p.avail.find((x) => x[0] === st.slug);
      const price = p.price + (avail && avail[2] ? avail[2] : 0);
      addToCart({ slug: p.slug, name: p.name, emoji: p.emoji, unit: p.unit, price, storeSlug: st.slug, storeName: st.name, isService: !!p.isService });
      state.flashStore = st.slug;
      updateChrome();
      renderViewPreserveScroll();
      toast(p.isService ? 'Записаны — смотрите в корзине' : `В корзине: ${p.name}`, `${st.name} · ${priceFmt(price)}`);
      setTimeout(() => {
        state.flashStore = null;
        if (state.view.name === 'product') renderViewPreserveScroll();
      }, 1600);
      break;
    }

    case 'inc': {
      const p = LOVII_DATA.products.find((x) => x.slug === actEl.dataset.slug);
      const st = selectors.storeBySlug(actEl.dataset.store);
      if (p && st) {
        const avail = p.avail.find((x) => x[0] === st.slug);
        const price = p.price + (avail && avail[2] ? avail[2] : 0);
        addToCart({ slug: p.slug, name: p.name, emoji: p.emoji, unit: p.unit, price, storeSlug: st.slug, storeName: st.name, isService: !!p.isService });
        if (state.view.name === 'cart') renderViewPreserveScroll();
        else renderViewPreserveScroll();
      }
      break;
    }

    case 'dec':
      changeQty(actEl.dataset.slug, actEl.dataset.store, -1);
      renderViewPreserveScroll();
      break;

    case 'rm-store':
      removeFromStore(actEl.dataset.store);
      renderViewPreserveScroll();
      toast('Товары точки убраны');
      break;

    case 'checkout': {
      if (state.cart.length === 0) break;
      const order = checkout();
      toast(`Заказ ${order.id} оформлен`, `${order.pickupStore} · ${priceFmt(order.total)}`);
      go('orders');
      break;
    }

    /* ---- Роли, дашборды, избранное ---- */

    case 'fav':
      toggleFavorite(actEl.dataset.slug);
      break;

    case 'enter-role':
      enterRole(actEl.dataset.role);
      break;

    case 'exit-role':
      exitRole();
      break;

    case 'dash-tab':
      go('dash', actEl.dataset.val);
      break;

    case 'period':
      state.dashPeriod = actEl.dataset.val;
      renderViewPreserveScroll();
      break;

    case 'approve-store':
      approveUserStore(false);
      break;

    case 'rm-good': {
      const r = state.roles.store;
      if (!r) break;
      r.goods = (r.goods || []).filter((g) => g.slug !== actEl.dataset.slug);
      syncUserStore();
      persist();
      renderViewPreserveScroll();
      toast('Товар убран с витрины');
      break;
    }

    case 'add-good': {
      const r = state.roles.store;
      const src = LOVII_DATA.products.find((x) => x.slug === actEl.dataset.slug);
      if (!r || !src) break;
      r.goods = r.goods || [];
      r.goods.push({ slug: 'g-' + src.slug, name: src.name, emoji: src.emoji, price: src.price, unit: src.unit, stock: 10 });
      syncUserStore();
      persist();
      renderViewPreserveScroll();
      toast('Товар добавлен', 'Появится на витрине после одобрения точки');
      break;
    }

    case 'region':
      state.ownerRegion = actEl.dataset.val;
      renderViewPreserveScroll();
      break;

    case 'export-csv':
      exportCsv();
      break;

    case 'theme-toggle':
      toggleTheme();
      break;

    case 'install-app':
      startInstall();
      break;
  }
});

/* ---- Формы: заявка, карточка точки, чат ---- */

document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.id === 'apply-form') {
    e.preventDefault();
    handleApply(f);
  } else if (f.id === 'card-form') {
    e.preventDefault();
    handleCardSave(f);
  } else if (f.id === 'chat-form') {
    e.preventDefault();
    const input = f.querySelector('#chat-input');
    const text = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    const id = f.dataset.chat;
    pushChatMessage(id, 'me', text);
    renderViewPreserveScroll();
    setTimeout(() => {
      ensureChats();
      const canned = LOVII_DASH.cannedReplies[(state.chats[id].msgs.length + id.length) % LOVII_DASH.cannedReplies.length];
      pushChatMessage(id, 'them', canned);
      if (state.view.name === 'chat' && state.view.param === id) renderViewPreserveScroll();
    }, 1400);
  }
});

/** Перерисовать текущий экран, не прыгая к началу страницы */
function renderViewPreserveScroll() {
  const y = window.scrollY;
  const list = document.getElementById('search-list');
  const focused = document.activeElement && document.activeElement.id === 'search-input';
  if (state.view.name === 'search' && list && focused) {
    list.innerHTML = searchListHtml(); // только список — фокус ввода сохраняется
    return;
  }
  document.getElementById('view').innerHTML = currentScreenHtml();
  window.scrollTo(0, y);
  updateChrome();
}

// Поиск: живой ввод
document.addEventListener('input', (e) => {
  if (e.target.id === 'search-input') {
    state.searchQ = e.target.value;
    const list = document.getElementById('search-list');
    if (list) list.innerHTML = searchListHtml();
  }
});

// Оверлеи и Esc закрывают шиты
document.getElementById('sheet-overlay').addEventListener('click', closeSheet);
document.getElementById('install-overlay').addEventListener('click', closeInstallSheet);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (state.sheetOpen) closeSheet();
    closeInstallSheet();
  }
});

// Роутер
window.addEventListener('hashchange', renderView);

/* ================= PWA: установка + service worker ================= */

let deferredPrompt = null;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// Chrome/Edge/Android: браузер сам готов показать диалог установки
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  closeInstallSheet();
  toast('LOVII установлен', 'Ищите иконку на главном экране');
});

async function startInstall() {
  if (isStandalone()) {
    toast('Приложение уже установлено', 'Вы открыли LOVII с иконки');
    return;
  }
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') toast('Готово!', 'Иконка LOVII появится на главном экране');
    else closeInstallSheet();
    return;
  }
  openInstallSheet(); // iOS/десктоп Safari и прочие: пошаговая инструкция
}

function installStepsHtml() {
  const step = (n, t) => `<div class="install-step"><span class="n">${n}</span><span class="t">${t}</span></div>`;
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && 'ontouchend' in document);
  if (iOS) {
    return (
      step(1, `Нажмите кнопку ${icon('share', 'install-ico')} <b>«Поделиться»</b> в Safari`) +
      step(2, `Выберите ${icon('smartphone', 'install-ico')} <b>«На экран “Домой”»</b>`) +
      step(3, 'Нажмите <b>«Добавить»</b> — иконка LOVII появится на главном экране')
    );
  }
  return (
    step(1, `Нажмите ${icon('download', 'install-ico')} <b>значок установки</b> в адресной строке браузера`) +
    step(2, 'Подтвердите <b>«Установить»</b> — появится ярлык на рабочем столе') +
    '<div class="install-note">Если значка нет: меню браузера (⋮ или ⋯) → «Установить приложение LOVII» / «Добавить на главный экран»</div>'
  );
}

function openInstallSheet() {
  document.getElementById('install-body').innerHTML = installStepsHtml();
  document.getElementById('install-overlay').classList.add('open');
  document.getElementById('install-sheet').classList.add('open');
}

function closeInstallSheet() {
  document.getElementById('install-overlay').classList.remove('open');
  document.getElementById('install-sheet').classList.remove('open');
}

// Service worker — офлайн-кэш и установимость (не на localhost-превью)
if ('serviceWorker' in navigator && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// Синхронизировать цвет статус-бара с темой при старте
applyTheme(currentTheme());

// Инициализация ролей: сид чатов, точка пользователя на витрине, авто-модерация
ensureChats();
syncUserStore();
moderationCheck(true);

// Первый рендер
renderView();
