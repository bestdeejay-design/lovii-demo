/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · ВИТРИНА: ГЛАВНАЯ (#/home) И «ПОИСК» (#/stores)
 * Перенос HomeModule.vue (HomeHero, HomePopular, HomeBanner,
 * HomeNearbyPlaces/NearbyStore) и StoresCatalog.vue (CatalogStore,
 * AppChip) из lovii-app@staging в демо без бекенда.
 * Классы, тексты и структура — 1:1; картинки заменены эмодзи-плитками
 * на подложках (в демо нет фотостока), честные цифры — сид.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-18.
 * ============================================================ */

/* ---------- Сид витрины ---------- */

const VITRINA_MIRROR = {
  // Чипы типов мерчантов (SZ-005) убраны с главной и из «Поиска» —
  // решение владельца 19.09: впереди динамические категории по тегам.
  promos: [
    { title: 'Слойка с вишней −30%', sub: 'ежедневно до 20:00', deadline: 'до закрытия 2 ч', store: 'Пекарня «Слойка»', grad: 'linear-gradient(135deg, #3a2430 0%, #241a20 100%)', accent: '#f2a33c' },
    { title: 'Пицца 2×1 по выходным', sub: 'при заказе от двух', deadline: 'сб–вс', store: 'Пиццерия «Forno»', grad: 'linear-gradient(135deg, #2a3550 0%, #1a2130 100%)', accent: '#4797ff' },
    { title: '−15% на сеты до полуночи', sub: 'промокод МИЯ15', deadline: 'до 23:00', store: 'Суши «Мия»', grad: 'linear-gradient(135deg, #23404a 0%, #16272d 100%)', accent: '#35b6b6' },
    { title: 'Баллы 1:1 у всех точек', sub: 'кэшбэк баллами с каждого чека', deadline: 'всегда', store: 'Все точки района', grad: 'linear-gradient(135deg, #402435 0%, #2a1622 100%)', accent: '#f64a8a' },
  ],
  stores: [
    { id: 'coffee-daily', name: 'Кофейня «Daily»', emoji: '☕', logoBg: '#f4e9dd', open: true, distanceKm: 0.1, minOrder: 0, popular: true,
      products: [{ e: '☕', bg: '#f4e9dd' }, { e: '🥐', bg: '#fdf3d8' }, { e: '🍰', bg: '#ffe9f2' }, { e: '🧃', bg: '#e8f4f4' }] },
    { id: 'pyshki', name: 'Пекарня «Слойка»', emoji: '🥐', logoBg: '#fdf3d8', open: false, distanceKm: 0.17, minOrder: 300, popular: true,
      products: [{ e: '🥐', bg: '#fdf3d8' }, { e: '🥯', bg: '#ffe9f2' }, { e: '🍞', bg: '#f4e9dd' }, { e: '🧁', bg: '#e8f4f4' }] },
    { id: 'krasota', name: 'Салон «Красота»', emoji: '💅', logoBg: '#ffe9f2', open: false, distanceKm: 0.16, minOrder: 0, popular: false,
      products: [{ e: '💅', bg: '#ffe9f2' }, { e: '💄', bg: '#f4e9dd' }, { e: '🧖', bg: '#e8f4f4' }] },
    { id: 'u-doma', name: 'Продукты «У дома»', emoji: '🛒', logoBg: '#e8f4f4', open: true, distanceKm: 0.2, minOrder: 0, popular: true,
      products: [{ e: '🥛', bg: '#e8f4f4' }, { e: '🍎', bg: '#ffe8e0' }, { e: '🧀', bg: '#fdf3d8' }, { e: '🍫', bg: '#f4e9dd' }] },
    { id: 'grill', name: 'Бургерная «Гриль»', emoji: '🍔', logoBg: '#ffe8e0', open: true, distanceKm: 0.3, minOrder: 500, popular: true,
      products: [{ e: '🍔', bg: '#ffe8e0' }, { e: '🍟', bg: '#fdf3d8' }, { e: '🥤', bg: '#e8f4f4' }] },
    { id: 'zdorovie', name: 'Аптека «Здоровье»', emoji: '💊', logoBg: '#eaf7ee', open: true, distanceKm: 0.28, minOrder: 0, popular: false,
      products: [{ e: '💊', bg: '#eaf7ee' }, { e: '🧴', bg: '#e8f4f4' }, { e: '🌡️', bg: '#f4e9dd' }] },
    { id: 'cvety', name: 'Цветы «Бутон»', emoji: '🌸', logoBg: '#f3ecfb', open: true, distanceKm: 0.35, minOrder: 0, popular: false, isTeaser: true,
      products: [{ e: '🌸', bg: '#f3ecfb' }, { e: '💐', bg: '#ffe9f2' }, { e: '🪴', bg: '#eaf7ee' }] },
    { id: 'fitness', name: 'Клуб «Сила»', emoji: '🏋️', logoBg: '#e8eefb', open: true, distanceKm: 0.5, minOrder: 0, popular: false,
      products: [{ e: '🏋️', bg: '#e8eefb' }, { e: '🥊', bg: '#ffe8e0' }, { e: '🧘', bg: '#e8f4f4' }] },
  ],
  // Баннеры «Реклама»: внутренние (платформа) и внешние (рекламодатели).
  // Формат фиксированный: карточка 320×140, не растягивается на весь экран.
  banners: [
    { type: 'internal', grad: 'linear-gradient(120deg, #f64a8a 0%, #b0326b 100%)', title: 'День района · суббота', sub: 'Скидки у 14 точек рядом', href: '#/stores' },
    { type: 'external', grad: 'linear-gradient(120deg, #2a3550 0%, #16202e 100%)', title: 'Кинотеатр «Луна» · премьера', sub: 'Билеты −20% по карте LOVII', href: '#/stores' },
    { type: 'internal', grad: 'linear-gradient(120deg, #35b6b6 0%, #1d7f7f 100%)', title: 'Баллы 1:1 за каждый чек', sub: 'Плати баллами как рублями', href: '#/wallet' },
    { type: 'external', grad: 'linear-gradient(120deg, #f2a33c 0%, #c77b17 100%)', title: 'Приведи МСП — получи 5 000 б.', sub: 'Программа представителей', href: '#/dash/rep' },
  ],
};

/* ---------- Состояние вида ---------- */
const storefrontUi = {
  heroOpen: localStorage.getItem('lovii_hero') !== '0',
  catalogSearch: '',
  bannerIndex: 0,
};

/* ---------- Хелперы ---------- */

function sfEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// formatDistance (distance-helpers.ts): <1 км — метры, иначе запятая.
function sfDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} м` : `${km.toFixed(1).replace('.', ',')} км`;
}

function sfAvailability(store) {
  return store.open ? 'Открыто' : 'Закрыто';
}

/* ---------- Блоки главной ---------- */

function sfHero() {
  const open = storefrontUi.heroOpen;
  const stores = VITRINA_MIRROR.stores;
  const nearest = Math.min(...stores.map((s) => s.distanceKm));
  return `
    <section class="home-hero${open ? '' : ' collapsed'}">
      <button type="button" class="home-hero__tab" aria-expanded="${open}" aria-controls="home-hero-body" data-action="sf-hero-toggle">
        <span class="home-hero__tab-ico" aria-hidden="true">${icon('pin')}</span>
        <span class="home-hero__tab-lbl">Твой район: Тверской · м. Тверская</span>
        <span class="home-hero__tab-chev" aria-hidden="true">${icon('chev-down')}</span>
      </button>
      <div id="home-hero-body" class="home-hero__body">
        <div class="home-hero__body-in">
          <h1>Всё нужное — <span class="accent">в шаговой доступности</span></h1>
          <p class="lead">
            Торговые точки твоего района добавляют в наш каталог товары и услуги. Покажем,
            <b>где что есть, сколько стоит</b> — и сколько идти пешком.
          </p>
          <div class="home-hero__stats">
            <span class="stat-pill pink"><span class="ico">${icon('pin')}</span>${stores.length} точек рядом</span>
            <span class="stat-pill tiffany"><span class="ico">${icon('footprints')}</span>ближайшая — ${sfDistance(nearest)}</span>
            <span class="stat-pill gold"><span class="ico">${icon('sparkles')}</span>баллы 1:1</span>
          </div>
        </div>
      </div>
      <button type="button" class="home-hero__search" data-testid="search-trigger" data-go="stores">
        <span class="ico" aria-hidden="true">${icon('search')}</span>
        Найти товар или точку рядом…
      </button>
    </section>`;
}

function sfPromos() {
  return `
    <section class="home-promos">
      <h3>Акции рядом</h3>
      <div class="home-promos__list">
        ${VITRINA_MIRROR.promos.map((p) => `
          <a href="#/stores" class="promo-card" style="background:${p.grad}">
            <span class="promo-card__badge">Акция</span>
            <b class="promo-card__title">${mEsc2(p.title)}</b>
            <span class="promo-card__sub">${mEsc2(p.sub)}</span>
            <span class="promo-card__foot">
              <span class="promo-card__dl" style="color:${p.accent}">${mEsc2(p.deadline)}</span>
              <span class="promo-card__store">${mEsc2(p.store)}</span>
            </span>
          </a>`).join('')}
      </div>
    </section>`;
}

function sfPopular() {
  const visible = VITRINA_MIRROR.stores.filter((s) => s.popular).slice(0, 8);
  return `
    <section class="home-popular">
      <h3>Популярные заведения</h3>
      <div class="home-popular__list">
        ${visible.map((s) => `
          <a href="#/store/${sfEsc(s.id)}" class="card card--flush card--tap popular-store">
            <span style="background-color:${s.logoBg}"><i class="sf-emoji">${s.emoji}</i></span>
            <h5>${sfEsc(s.name)}</h5>
          </a>`).join('')}
        <a href="#/popular">
          ${icon('search', 'icon')}
          Посмотреть все
        </a>
      </div>
    </section>`;
}

function sfBanner() {
  const i = storefrontUi.bannerIndex % VITRINA_MIRROR.banners.length;
  return `
    <div class="home-banner">
      <div class="home-banner__track" style="transform:translateX(-${i * 100}%)">
        ${VITRINA_MIRROR.banners.map((b) => `
          <div class="home-banner__slide">
            <a href="${b.href}" class="promo-banner" style="background:${b.grad}">
              <b class="promo-banner__title">${sfEsc(b.title)}</b>
              <span class="promo-banner__sub">${sfEsc(b.sub)}</span>
              <span class="promo-banner__cta">Перейти ${icon('arrow-right')}</span>
            </a>
          </div>`).join('')}
      </div>
      <span class="home-banner__ad">
        Реклама
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="5.5" stroke="currentColor"/><path d="M6 5.5V8.5" stroke="currentColor" stroke-linecap="round"/><circle cx="6" cy="3.75" r="0.75" fill="currentColor"/></svg>
      </span>
      <div class="home-banner__dots">
        ${VITRINA_MIRROR.banners.map((b, index) => `
          <span class="home-banner__dot${index === i ? ' active' : ''}"></span>`).join('')}
      </div>
    </div>`;
}

function sfNearby() {
  const stores = VITRINA_MIRROR.stores;
  return `
    <section class="nearby-stores">
      <h3>Возле вас</h3>
      <div class="nearby-stores__list">
        ${stores.map((s) => `
          <a href="#/store/${sfEsc(s.id)}" class="card card--tap nearby-store">
            <div class="nearby-store__products">
              ${s.products.map((p) => `<span style="background-color:${p.bg}"><i class="sf-emoji">${p.e}</i></span>`).join('')}
            </div>
            <div class="nearby-store__info">
              <span style="background-color:${s.logoBg}"><i class="sf-emoji sf-emoji-lg">${s.emoji}</i></span>
              <div class="nearby-store__description">
                <h4>${sfEsc(s.name)}</h4>
                <p class="${s.open ? 'open' : 'close'}">${sfAvailability(s)}</p>
                <span>${s.minOrder > 0 ? `Заказ от: ${s.minOrder.toLocaleString('ru-RU')}&nbsp;₽ | ` : ''}${sfDistance(s.distanceKm)}</span>
              </div>
            </div>
          </a>`).join('')}
      </div>
    </section>`;
}

function renderHomeMirror() {
  return `
    <main class="home container">
      <div class="home-top">
        ${sfHero()}
        ${sfPromos()}
        ${sfPopular()}
        <div class="home-top__banner">${sfBanner()}</div>
      </div>
      ${sfNearby()}
    </main>`;
}

/* ---------- «Поиск» (каталог точек, StoresCatalog) ---------- */

function sfCatalogRow(s) {
  return `
    <div class="card card--tap catalog-store">
      <a href="#/store/${sfEsc(s.id)}" class="catalog-store__link" data-testid="store-card">
        <span class="catalog-store__logo" style="background-color:${s.logoBg}"><i class="sf-emoji">${s.emoji}</i></span>
        <span class="catalog-store__info">
          <h4 class="catalog-store__name">${sfEsc(s.name)}</h4>
          <p class="catalog-store__meta">
            <span class="catalog-store__status ${s.open ? 'is-open' : 'is-closed'}">${sfAvailability(s)}</span>
            <span class="catalog-store__sep" aria-hidden="true">·</span>
            ${sfDistance(s.distanceKm)}
            ${s.minOrder > 0 ? `<span class="catalog-store__sep" aria-hidden="true">·</span>заказ от ${s.minOrder.toLocaleString('ru-RU')}&nbsp;₽` : ''}
          </p>
        </span>
      </a>
      <button type="button" class="fav-heart" aria-label="В избранное" data-action="mir-fav">${icon('heart')}</button>
    </div>`;
}

function renderStoresMirror() {
  const q = storefrontUi.catalogSearch.trim().toLowerCase();
  const filtered = VITRINA_MIRROR.stores.filter((s) => !q || s.name.toLowerCase().includes(q));
  const title = q ? 'Результаты поиска' : 'Все заведения';

  return `
    <main class="stores container">
      <section class="stores__header">
        <div class="sf-search">
          ${icon('search')}
          <input type="text" placeholder="Магазин или товар" value="${sfEsc(storefrontUi.catalogSearch)}" data-action="sf-search">
        </div>
        <button type="button" class="sf-filter-btn" aria-label="Фильтры">
          ${icon('sliders')}
        </button>
      </section>

      <section class="stores__catalog">
        <h4>${title}</h4>
        <div class="stores__list">
          ${filtered.map(sfCatalogRow).join('') || '<p class="stores__noresult">Ничего не нашлось — попробуйте другой запрос</p>'}
        </div>
      </section>
    </main>`;
}

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="sf-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'sf-hero-toggle') {
    storefrontUi.heroOpen = !storefrontUi.heroOpen;
    localStorage.setItem('lovii_hero', storefrontUi.heroOpen ? '1' : '0');
    const hero = el.closest('.home-hero');
    hero.classList.toggle('collapsed', !storefrontUi.heroOpen);
    el.setAttribute('aria-expanded', String(storefrontUi.heroOpen));
    return;
  }

});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="sf-search"]');
  if (!el) return;
  storefrontUi.catalogSearch = el.value;
  const title = document.querySelector('.stores__catalog > h4');
  // Живой фильтр без перерисовки всей страницы: перерисовываем только список.
  const q = storefrontUi.catalogSearch.trim().toLowerCase();
  const filtered = VITRINA_MIRROR.stores.filter((s) => !q || s.name.toLowerCase().includes(q));
  const listEl = document.querySelector('.stores__list');
  if (listEl) listEl.innerHTML = filtered.map(sfCatalogRow).join('') || '<p class="stores__noresult">Ничего не нашлось — попробуйте другой запрос</p>';
  if (title) title.textContent = 'Результаты поиска';
});

// Автолистание баннера (HomeBanner: setInterval)
setInterval(() => {
  if (document.querySelector('.home-banner')) {
    storefrontUi.bannerIndex += 1;
    const track = document.querySelector('.home-banner__track');
    const dots = document.querySelectorAll('.home-banner__dot');
    if (track) {
      const i = storefrontUi.bannerIndex % VITRINA_MIRROR.banners.length;
      track.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === i));
    }
  }
}, 5000);

/* ---------- Товары точек (сид, рубли) ---------- */

const SF_GOODS = {
  'coffee-daily': {
    cats: [
      { id: 'c1', name: 'Кофе', e: '☕', bg: '#f4e9dd' },
      { id: 'c2', name: 'Выпечка', e: '🥐', bg: '#fdf3d8' },
      { id: 'c3', name: 'Десерты', e: '🍰', bg: '#ffe9f2' },
    ],
    items: {
      c1: [
        { id: 'cd1', t: 'Капучино', e: '☕', bg: '#f4e9dd', price: 220, unit: '0,3 л' },
        { id: 'cd2', t: 'Латте', e: '🥛', bg: '#fdf3d8', price: 240, unit: '0,3 л' },
        { id: 'cd3', t: 'Эспрессо', e: '☕', bg: '#ffe9f2', price: 150, unit: '60 мл' },
      ],
      c2: [
        { id: 'cd4', t: 'Круассан с миндалём', e: '🥐', bg: '#fdf3d8', price: 164, unit: '1 шт' },
        { id: 'cd5', t: 'Слойка с вишней', e: '🥯', bg: '#ffe9f2', price: 180, old: 230, unit: '1 шт' },
      ],
      c3: [
        { id: 'cd6', t: 'Чизкейк', e: '🍰', bg: '#ffe9f2', price: 320, unit: '150 г' },
        { id: 'cd7', t: 'Тирамису', e: '🍰', bg: '#f4e9dd', price: 350, unit: '140 г' },
      ],
    },
  },
  'pyshki': {
    cats: [{ id: 'p1', name: 'Выпечка', e: '🥐', bg: '#fdf3d8' }],
    items: {
      p1: [
        { id: 'py1', t: 'Круассан классический', e: '🥐', bg: '#fdf3d8', price: 120, unit: '1 шт' },
        { id: 'py2', t: 'Булочка с корицей', e: '🧁', bg: '#ffe9f2', price: 140, unit: '1 шт' },
        { id: 'py3', t: 'Хлеб бородинский', e: '🍞', bg: '#f4e9dd', price: 95, unit: '400 г' },
      ],
    },
  },
  'u-doma': {
    cats: [{ id: 'g1', name: 'Продукты', e: '🛒', bg: '#e8f4f4' }],
    items: {
      g1: [
        { id: 'ud1', t: 'Молоко 2,5%', e: '🥛', bg: '#e8f4f4', price: 89, unit: '1 л' },
        { id: 'ud2', t: 'Яблоки Гала', e: '🍎', bg: '#ffe8e0', price: 149, unit: '1 кг' },
        { id: 'ud3', t: 'Сыр Гауда', e: '🧀', bg: '#fdf3d8', price: 259, unit: '300 г' },
      ],
    },
  },
  'grill': {
    cats: [{ id: 'b1', name: 'Меню', e: '🍔', bg: '#ffe8e0' }],
    items: {
      b1: [
        { id: 'gr1', t: 'Бургер классический', e: '🍔', bg: '#ffe8e0', price: 390, unit: '1 шт' },
        { id: 'gr2', t: 'Картофель фри', e: '🍟', bg: '#fdf3d8', price: 160, unit: '120 г' },
        { id: 'gr3', t: 'Лимонад домашний', e: '🥤', bg: '#e8f4f4', price: 180, unit: '0,4 л' },
      ],
    },
  },
  'zdorovie': {
    cats: [{ id: 'a1', name: 'Аптечка', e: '💊', bg: '#eaf7ee' }],
    items: {
      a1: [
        { id: 'ap1', t: 'Витамин C', e: '💊', bg: '#eaf7ee', price: 450, unit: '60 таб' },
        { id: 'ap2', t: 'Термометр', e: '🌡️', bg: '#e8f4f4', price: 390, unit: '1 шт' },
      ],
    },
  },
  'fitness': {
    cats: [{ id: 'f1', name: 'Абонементы', e: '🏋️', bg: '#e8eefb' }],
    items: {
      f1: [
        { id: 'fi1', t: 'Разовое посещение', e: '🏋️', bg: '#e8eefb', price: 800, unit: '1 визит' },
        { id: 'fi2', t: 'Месяц без лимита', e: '🥊', bg: '#ffe8e0', price: 4900, unit: '30 дней' },
      ],
    },
  },
  'krasota': {
    cats: [{ id: 's1', name: 'Услуги', e: '💅', bg: '#ffe9f2' }],
    items: {
      s1: [
        { id: 'kr1', t: 'Маникюр', e: '💅', bg: '#ffe9f2', price: 2500, unit: 'услуга' },
        { id: 'kr2', t: 'Стрижка', e: '💇', bg: '#f4e9dd', price: 1800, unit: 'услуга' },
      ],
    },
  },
};

/* Состояние экрана точки */
const storeMirrorUi = { category: null, subCategory: null, search: '' };

function sfFindStore(slug) {
  return VITRINA_MIRROR.stores.find((s) => s.id === slug);
}

function sfStoreGoods(slug) {
  return SF_GOODS[slug] || null;
}

function sfCartQty(slug, storeSlug) {
  const row = (typeof state !== 'undefined' ? state.cart : []).find((c) => c.slug === slug && c.storeSlug === storeSlug);
  return row ? row.qty : 0;
}

/* ---------- Карточка товара (ProductPreview) ---------- */

function sfProductCard(product, storeId) {
  const qty = sfCartQty(product.id, storeId);
  return `
    <a href="#/product/${product.id}" class="product-preview" data-testid="product-card" data-mir-store="${sfEsc(storeId)}">
      <span style="background-color:${product.bg}"><i class="sf-emoji">${product.e}</i></span>
      <div class="product-preview__info">
        <h4>${sfEsc(product.t)}</h4>
        <span>${sfEsc(product.unit || '')}</span>
        <p>${product.price.toLocaleString('ru-RU')}&nbsp;₽${product.old ? ` <del>${product.old.toLocaleString('ru-RU')}&nbsp;₽</del>` : ''}</p>
        ${!qty
          ? `<button type="button" data-testid="product-add" data-action="sf-add" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('cart')}</button>`
          : `<div class="product-preview__counter">
              <button type="button" data-action="sf-dec" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('minus')}</button>
              <span data-testid="product-count">${qty}</span>
              <button type="button" data-action="sf-add" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('plus')}</button>
            </div>`}
      </div>
    </a>`;
}

/* ---------- Экран магазина (StoreModule) ---------- */

function renderStoreMirror(slug) {
  const store = sfFindStore(slug);
  if (!store) return renderHomeMirror();
  const goods = sfStoreGoods(slug);

  const card = `
    <section class="place-card">
      <span style="background-color:${store.logoBg}"><i class="sf-emoji sf-emoji-lg">${store.emoji}</i></span>
      <div class="place-card__info">
        <h3>
          <span>${sfEsc(store.name)}</span>
          <span class="place-card__tools">
            <button type="button" class="fav-pill${store.fav ? ' active' : ''}" aria-label="В избранное" data-action="mir-fav">${icon('heart')}</button>
            <button type="button" aria-label="О заведении" data-action="sf-info">${icon('info')}</button>
          </span>
        </h3>
        <p data-testid="store-card-availability">
          ${sfAvailability(store)} <span>|</span> ${sfDistance(store.distanceKm)}
          ${store.minOrder > 0 ? `<span>|</span> Заказ от: ${store.minOrder.toLocaleString('ru-RU')}&nbsp;₽` : ''}
        </p>
      </div>
    </section>`;

  // SZ-035: точка-тизер — шапка видна, витрина закрыта
  if (store.isTeaser || !goods) {
    return `
      <main class="place container">
        ${card}
        <section class="place__teaser" data-testid="store-teaser-banner">
          <span class="app-badge app-badge_brand app-badge_s">Скоро</span>
          <p>Эта точка скоро откроется на LOVII — товары появятся здесь после полного запуска.</p>
        </section>
      </main>`;
  }

  const catId = storeMirrorUi.category && goods.cats.some((c) => c.id === storeMirrorUi.category)
    ? storeMirrorUi.category : null;
  const cat = catId ? goods.cats.find((c) => c.id === catId) : null;
  const q = storeMirrorUi.search.trim().toLowerCase();
  const all = Object.values(goods.items).flat();
  const items = q
    ? all.filter((p) => p.t.toLowerCase().includes(q))
    : catId ? goods.items[catId] || [] : all;

  return `
    <main class="place container">
      ${card}

      <div class="place-search">
        <div class="sf-search">
          ${icon('search')}
          <input type="text" placeholder="Поиск в заведении" value="${sfEsc(storeMirrorUi.search)}" data-action="sf-store-search">
        </div>
      </div>

      ${!q ? `
        <section class="store-categories">
          <h4>Категории товаров</h4>
          <div class="store-categories__list">
            ${goods.cats.map((c) => `
              <button type="button" class="${c.id === catId ? 'active' : ''}" data-action="sf-cat" data-value="${c.id}">
                <span style="background-color:${c.bg}"><i class="sf-emoji sf-emoji-sm">${c.e}</i>${c.id === catId ? '<b class="sf-cat-check">' + icon('check') + '</b>' : ''}</span>
                ${c.name}
              </button>`).join('')}
          </div>
        </section>` : ''}

      <div class="place-catalog">
        <h3>${q ? 'Результаты поиска' : cat ? sfEsc(cat.name) : 'Популярное'}</h3>
        <div class="place-catalog__list">
          ${items.map((p) => sfProductCard(p, store.id)).join('') || '<p class="stores__noresult">В этой категории пока нет товаров</p>'}
        </div>
      </div>
    </main>`;
}

/* ---------- Экран товара (StoreProduct) ---------- */

function sfFindProduct(slug) {
  for (const [storeId, pack] of Object.entries(SF_GOODS)) {
    for (const list of Object.values(pack.items)) {
      const p = list.find((x) => x.id === slug);
      if (p) return { product: p, storeId, pack };
    }
  }
  return null;
}

function renderProductMirror(slug) {
  const found = sfFindProduct(slug);
  if (!found) return renderHomeMirror();
  const { product, storeId, pack } = found;
  const store = sfFindStore(storeId);
  const qty = sfCartQty(product.id, storeId);
  const similar = Object.values(pack.items).flat().filter((p) => p.id !== product.id).slice(0, 4);

  return `
    <main class="product container">
      <div class="product__image" style="background-color:${product.bg}">
        <button type="button" class="sf-back" data-action="back" aria-label="Назад">${icon('chev-left')}</button>
        <i class="sf-emoji sf-emoji-xl">${product.e}</i>
      </div>

      <section class="product__info">
        <h3>${sfEsc(product.t)}${store ? ` · ${sfEsc(store.name)}` : ''}</h3>
      </section>

      <section class="product__description">
        <button type="button" data-action="sf-desc">
          Детальное описание ${icon('chev-right')}
        </button>
        <article hidden>Свежая позиция витрины «${sfEsc(store ? store.name : '')}». Цена и состав — как у точки на стенде; при заказе баллы начисляются 1:1.</article>
      </section>

      <section class="more-products">
        <h4>Ещё может подойти</h4>
        <div class="more-products__list">
          ${similar.map((p) => sfProductCard(p, storeId)).join('')}
        </div>
      </section>

      <div class="product__action">
        ${!qty
          ? `<button type="button" data-action="sf-add" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('cart')} ${product.price.toLocaleString('ru-RU')}&nbsp;₽ за 1 шт.</button>`
          : `<div class="product__counter">
              <button type="button" data-action="sf-dec" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('minus')}</button>
              <span>${qty}</span>
              <button type="button" data-action="sf-add" data-store="${sfEsc(storeId)}" data-slug="${product.id}">${icon('plus')}</button>
            </div>`}
      </div>
    </main>`;
}


/* ---------- События магазина и товара ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="sf-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'sf-cat') {
    // Клик по активной категории снимает выбор (все товары, «Популярное»)
    storeMirrorUi.category = storeMirrorUi.category === el.dataset.value ? null : el.dataset.value;
    storeMirrorUi.search = '';
    renderViewPreserveScroll();
    return;
  }

  if (action === 'sf-add' || action === 'sf-dec') {
    const item = sfFindProduct(el.dataset.slug);
    const store = sfFindStore(el.dataset.store);
    if (!item) return;
    if (action === 'sf-add') {
      addToCart({ slug: item.product.id, name: item.product.t, emoji: item.product.e, price: item.product.price, storeSlug: el.dataset.store, storeName: store ? store.name : '' }, 1);
    } else {
      changeQty(el.dataset.slug, el.dataset.store, -1);
    }
    renderViewPreserveScroll();
    return;
  }

  if (action === 'sf-info') {
    const storeEl = document.querySelector('.place-card');
    const name = storeEl ? storeEl.querySelector('h3 span')?.textContent : 'О заведении';
    document.getElementById('action-title').textContent = name || 'О заведении';
    document.getElementById('action-sub').textContent = 'Тверской · м. Тверская';
    document.getElementById('action-body').innerHTML = `
      <div class="sf-info-rows">
        <div><span>Часы работы</span><b>09:00 – 22:00</b></div>
        <div><span>Адрес</span><b>ул. Тверская, 12</b></div>
        <div><span>Телефон</span><b>+7 495 000-00-00</b></div>
        <div><span>Доставка</span><b>самовывоз · доставка курьером</b></div>
        <div><span>Баллы</span><b>кэшбэк 1:1 с каждого чека</b></div>
      </div>`;
    document.getElementById('action-overlay').classList.add('open');
    document.getElementById('action-sheet').classList.add('open');
    return;
  }

  if (action === 'sf-desc') {
    const btn = el;
    const article = btn.parentElement.querySelector('article');
    if (!article) return;
    article.hidden = !article.hidden;
    btn.classList.toggle('active', !article.hidden);
    return;
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="sf-store-search"]');
  if (!el) return;
  storeMirrorUi.search = el.value;
  // живой фильтр: перерисовываем только каталог точки
  const slug = location.hash.replace('#/store/', '');
  const goods = sfStoreGoods(slug);
  const catalog = document.querySelector('.place-catalog');
  if (!goods || !catalog) return;
  const q = storeMirrorUi.search.trim().toLowerCase();
  const all = Object.values(goods.items).flat();
  const catId = storeMirrorUi.category && goods.cats.some((c) => c.id === storeMirrorUi.category)
    ? storeMirrorUi.category : null;
  const items = q
    ? all.filter((p) => p.t.toLowerCase().includes(q))
    : catId ? goods.items[catId] || [] : all;
  const listEl = catalog.querySelector('.place-catalog__list');
  if (listEl) {
    listEl.innerHTML = items.map((p) => sfProductCard(p, slug)).join('')
      || '<p class="stores__noresult">В этой категории пока нет товаров</p>';
  }
  const title = catalog.querySelector('h3');
  const cat = catId ? goods.cats.find((c) => c.id === catId) : null;
  if (title) title.textContent = q ? 'Результаты поиска' : (cat ? cat.name : 'Популярное');
});

/* ---------- Смена темы в шапке (просьба владельца 19.09) ---------- */

function sfSyncThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = icon(dark ? 'sun' : 'moon');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#theme-toggle')) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (typeof setThemeChoice === 'function') setThemeChoice(dark ? 'light' : 'dark');
  sfSyncThemeIcon();
  toast(dark ? 'Тёмная тема' : 'Светлая тема');
});

new MutationObserver(sfSyncThemeIcon).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
sfSyncThemeIcon();

/* ---------- Экран «Настройки» (5-я вкладка навигации) ---------- */
/* Контейнер со слотом: содержимое рисует settings.js (renderSettingsHtml)
   через MutationObserver — тема, район, установка, пуши, PIN, выход. */
function renderSettingsMirror() {
  return `<main class="container settings-page"><div id="settings-slot"></div></main>`;
}

/* ---------- Регистрация экранов ---------- */
// «Популярное» (PopularView) на старте зеркала сведено к каталогу точек.
// renderStore/renderProduct — function-декларации screens.js, переопределяем
// глобально: currentScreenHtml вызывает их напрямую с параметром-слагом.
Object.assign(SCREENS, {
  home: renderHomeMirror,
  stores: renderStoresMirror,
  popular: renderStoresMirror,
  settings: renderSettingsMirror,
});
window.renderStore = renderStoreMirror;
window.renderProduct = renderProductMirror;
