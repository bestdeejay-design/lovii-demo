/**
 * LOVII Витрина — рендеры экранов (чистые функции → HTML-строки).
 * Состояние и события — в js/app.js.
 */

/* ================= Общие справочники ================= */

const CATS = [
  { slug: 'all', label: 'Всё рядом', emoji: '🧭' },
  { slug: 'bakery', label: 'Выпечка', emoji: '🥐' },
  { slug: 'coffee', label: 'Кофе', emoji: '☕' },
  { slug: 'flowers', label: 'Цветы', emoji: '🌷' },
  { slug: 'restaurant', label: 'Суши', emoji: '🍣' },
  { slug: 'pizza', label: 'Пицца', emoji: '🍕' },
  { slug: 'grocery', label: 'Продукты', emoji: '🥑' },
  { slug: 'burgers', label: 'Бургеры', emoji: '🍔' },
  { slug: 'pharmacy', label: 'Аптека', emoji: '💊' },
  { slug: 'beauty', label: 'Красота', emoji: '💅' },
  { slug: 'service', label: 'Услуги', emoji: '🧵' },
];

const catLabel = (slug) => {
  const c = CATS.find((x) => x.slug === slug);
  return c ? c.label : slug;
};

const tileBg = (color) =>
  ({
    pink: 'tile-pink',
    tiffany: 'tile-tiffany',
    gold: 'tile-gold',
    sand: 'tile-sand',
  }[color] || 'tile-ink');

const BADGE_MAP = {
  hit: { label: 'Хит', cls: 'badge-hit' },
  new: { label: 'Новинка', cls: 'badge-new' },
  sale: { label: 'Скидка', cls: 'badge-sale' },
  eco: { label: 'Эко', cls: 'badge-eco' },
};

const TAG_LABEL = {
  hit: 'Хит района',
  new: 'Новинка',
  pickup: 'Самовывоз',
  delivery: 'Доставка',
  book: 'По записи',
  eco: 'Эко',
  ecofresh: 'Свежая поставка',
};

function stockLabel(stock) {
  if (stock <= 0) return { label: 'Нет в наличии', cls: 'stock-out' };
  if (stock <= 3) return { label: `Осталось ${stock} шт`, cls: 'stock-low' };
  return { label: 'В наличии', cls: 'stock-ok' };
}

const priceFmt = (n) => n.toLocaleString('ru-RU') + ' ₽';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ================= Карточки ================= */

function storeCardHtml(s) {
  return `
  <div class="store-card-w">
    <button class="btn-card" data-go="store:${s.slug}" aria-label="Открыть ${esc(s.name)}">
      <div class="cover-20 ${tileBg(s.color)}">
        <span class="em">${s.emoji}</span>
        <span class="open-pill ${s.open ? 'on' : 'off'}"><span class="dot"></span>${s.open ? 'Открыто' : 'Закрыто'}</span>
      </div>
      <div class="store-body">
        <div class="store-name-row">
          <div class="min-w-0">
            <div class="store-name">${esc(s.name)}</div>
            <div class="store-sub">${esc(catLabel(s.category))} · ${esc(s.address)}</div>
          </div>
          <span class="rating">${icon('star', '', 2, true)}${s.rating.toFixed(1)}</span>
        </div>
        <div class="store-foot">
          <span class="walk-pill">${icon('footprints')}${s.walkMinutes} мин · ${s.distance}</span>
          <span class="chev">${icon('chev-right')}</span>
        </div>
      </div>
    </button>
  </div>`;
}

function productCardHtml(p) {
  const badge = p.badge ? BADGE_MAP[p.badge] : null;
  const noStock = p.pointsCount === 0;
  const meta = p.isService
    ? `Запись · ${esc(p.storeName || '')}`
    : p.pointsCount > 0
      ? `в ${p.pointsCount > 1 ? p.pointsCount + ' точках' : 'точке'} рядом`
      : 'нет рядом';
  return `
  <button class="product-card ${noStock ? 'disabled' : ''}" data-go="product:${p.slug}" ${noStock ? 'disabled' : ''}>
    <div class="cover-28 ${tileBg(p.storeColor || 'ink')}">
      <span class="em">${p.emoji}</span>
      ${badge ? `<span class="badge-pill ${badge.cls}">${badge.label}</span>` : ''}
      ${p.pointsCount > 0 && p.walkMinutes !== null ? `<span class="walk-mini">${icon('footprints')}${p.walkMinutes} мин</span>` : ''}
    </div>
    <div class="prod-body">
      <div class="prod-name">${esc(p.name)}</div>
      <div class="prod-meta">${meta}</div>
      <div class="price-line">
        <span class="price">${priceFmt(p.price)}</span>
        ${p.oldPrice ? `<span class="old-price">${priceFmt(p.oldPrice)}</span>` : ''}
        <span class="unit">/${esc(p.unit)}</span>
      </div>
    </div>
  </button>`;
}

function promoCardHtml(p) {
  const tone = p.color === 'tiffany' ? 'tone-tiffany' : p.color === 'gold' ? 'tone-gold' : 'tone-pink';
  const dot = p.color === 'tiffany' ? 'background:var(--tiffany)' : p.color === 'gold' ? 'background:var(--gold)' : 'background:var(--pink)';
  return `
  <button class="promo-card ${tone}" data-go="store:${p.storeSlug}">
    <span class="promo-mini"><span class="dot" style="${dot}"></span>Акция</span>
    <div class="promo-title">${esc(p.title)}</div>
    <div class="promo-desc">${esc(p.desc)}</div>
    <div class="promo-timer">${icon('clock')}${esc(p.timer)}</div>
  </button>`;
}

function compactRowHtml(p) {
  return `
  <button class="compact-row" data-go="product:${p.slug}">
    <span class="em-tile ${tileBg(p.storeColor || 'ink')}">${p.emoji}</span>
    <span class="mid">
      <span class="nm">${esc(p.name)}</span>
      <span class="sb">${p.isService ? 'Услуга · ' : ''}${esc(p.storeName || '')}${p.pointsCount > 1 ? ` · ещё в ${p.pointsCount - 1} рядом` : ''}</span>
    </span>
    <span class="right">
      <span class="pr">${priceFmt(p.price)}</span>
      ${p.walkMinutes !== null ? `<span class="wk">${icon('footprints')}${p.walkMinutes} мин</span>` : ''}
    </span>
  </button>`;
}

function qtyHtml(qty, slug, storeSlug) {
  return `
  <span class="qty">
    <button data-action="dec" data-slug="${slug}" data-store="${storeSlug}" aria-label="Убрать одну">−</button>
    <span class="n">${qty}</span>
    <button data-action="inc" data-slug="${slug}" data-store="${storeSlug}" aria-label="Добавить одну">+</button>
  </span>`;
}

/* ================= Экран: Главная ================= */

function renderHome() {
  const d = selectors.districtObj();
  const stores = selectors.storesRows();
  const products = selectors.productRows({ category: state.category, sort: state.sort });
  const promos = LOVII_DATA.promos;
  const nearest = stores[0];
  const goodsCount = products.filter((p) => !p.isService).length;
  const servicesCount = products.filter((p) => p.isService).length;
  const shown = products.filter((p) => (state.kindTab === 'services' ? p.isService : !p.isService));
  const heroOpen = localStorage.getItem('lovii_hero') !== '0';

  return `
  <div class="lv-enter">
    <section class="hero ${heroOpen ? '' : 'collapsed'}" id="hero">
      <button class="hero-tab" type="button" data-action="hero-toggle" aria-expanded="${heroOpen}" aria-controls="hero-body">
        <span class="ht-ico">${icon('pin')}</span>
        <span class="ht-lbl" id="hero-tab-lbl">${heroOpen ? `Ваш район: ${esc(d.name)} · м. ${esc(d.metro)}` : 'Всё нужное — в шаговой доступности'}</span>
        <span class="ht-chev">${icon('chev-down')}</span>
      </button>
      <div class="hero-body" id="hero-body">
        <div class="hero-body-in">
          <h1>Всё нужное — <span class="accent">в шаговой доступности</span></h1>
          <p class="lead">Точки района выкладывают товары и услуги. Мы покажем, <b>где что есть</b> — и сколько идти пешком.</p>
          <div class="stat-row">
            <span class="stat-pill pink">${icon('pin')}${stores.length} точек рядом</span>
            ${nearest ? `<span class="stat-pill tiffany">${icon('footprints')}ближайшая — ${nearest.walkMinutes} мин</span>` : ''}
            <span class="stat-pill gold">${icon('sparkles')}баллы 1:1</span>
          </div>
        </div>
      </div>
      <button class="search-trigger" data-go="search">
        ${icon('search')}
        Найти товар или точку рядом…
      </button>
    </section>

    <section aria-label="Акции" class="section">
      <div class="section-head"><h2>Акции рядом</h2></div>
      <div class="hscroll no-scrollbar">${promos.map(promoCardHtml).join('')}</div>
    </section>

    <section aria-label="Торговые точки" class="section">
      <div class="section-head">
        <h2>Точки рядом</h2>
        <button class="link-btn" data-go="search" data-tab="stores">Все точки ${icon('arrow-right')}</button>
      </div>
      <div class="hscroll no-scrollbar">${stores.slice(0, 8).map(storeCardHtml).join('')}</div>
    </section>

    <section aria-label="Товары и услуги" class="section">
      <div class="cats-sentinel" aria-hidden="true"></div>
      <div class="cats-sticky">
        <div class="cats no-scrollbar" aria-label="Категории">
          ${CATS.map((c) => {
            const active = state.category === c.slug;
            return `<button class="cat-chip ${active ? 'active' : ''}" data-action="category" data-val="${c.slug}"><span class="e">${c.emoji}</span>${c.label}</button>`;
          }).join('')}
        </div>
      </div>

      <div class="section-head" id="catalog-head">
        <h2><span id="kind-title">${state.kindTab === 'goods' ? 'Товары' : 'Услуги'}</span> <span class="sub">рядом с вами</span></h2>
        <div class="sort-group">
          <button class="sort-btn ${state.sort === 'walk' ? 'active' : ''}" data-action="sort" data-val="walk">Ближе</button>
          <button class="sort-btn ${state.sort === 'price' ? 'active' : ''}" data-action="sort" data-val="price">Дешевле</button>
        </div>
      </div>

      <div class="seg">
        <button class="${state.kindTab === 'goods' ? 'active' : ''}" data-action="kind" data-val="goods">Товары · ${goodsCount}</button>
        <button class="${state.kindTab === 'services' ? 'active' : ''}" data-action="kind" data-val="services">Услуги · ${servicesCount}</button>
      </div>

      <div id="home-catalog">${catalogInnerHtml(shown)}</div>
    </section>

    <section aria-label="Лояльность" class="section">
      <div class="loyalty ink-gradient">
        <div class="blob lv-float"></div>
        <div class="kicker">Программа района</div>
        <div class="big">Один балл = <span class="g">1 ₽</span> у всех точек рядом</div>
        <p>Кэшбэк баллами с каждого чека, баллы не сгорают и тратятся у всех участников района.</p>
        <div class="chips">
          <span class="glass-chip">${icon('star', 'g', 2, true)} 1:1</span>
          <span class="glass-chip">${icon('footprints', 't')} ${stores.length} точек</span>
        </div>
      </div>
    </section>
  </div>`;
}

/** Содержимое каталога (сетка или пустой стейт) — общее для рендера и точечного обновления */
function catalogInnerHtml(shown) {
  return shown.length
    ? `<div class="prod-grid">${shown.map(productCardHtml).join('')}</div>`
    : `<div class="empty-cat">
         <div class="big-emoji">${state.kindTab === 'goods' ? '🧺' : '🧵'}</div>
         <div class="t">${state.kindTab === 'goods' ? 'Товаров пока нет' : 'Услуг пока нет'}</div>
         <p class="d">Попробуйте другую категорию — точки района добавляют новое каждый день</p>
       </div>`;
}

/**
 * Точечное обновление каталога без перерисовки страницы:
 * активные чипы, заголовок, счётчики сегмента, сортировка и сама сетка.
 * Страница не дёргается: нет замены DOM выше каталога, нет анимации входа, скролл не сбрасывается.
 */
function refreshHomeCatalog() {
  const grid = document.getElementById('home-catalog');
  if (!grid) { renderView(true); return; }

  const products = selectors.productRows({ category: state.category, sort: state.sort });
  const goodsCount = products.filter((p) => !p.isService).length;
  const servicesCount = products.filter((p) => p.isService).length;
  const shown = products.filter((p) => (state.kindTab === 'services' ? p.isService : !p.isService));

  document.querySelectorAll('.cats-sticky .cat-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.val === state.category);
  });

  const kt = document.getElementById('kind-title');
  if (kt) kt.textContent = state.kindTab === 'goods' ? 'Товары' : 'Услуги';

  const segGoods = document.querySelector('.seg [data-val="goods"]');
  const segServ = document.querySelector('.seg [data-val="services"]');
  if (segGoods) {
    segGoods.classList.toggle('active', state.kindTab === 'goods');
    segGoods.textContent = `Товары · ${goodsCount}`;
  }
  if (segServ) {
    segServ.classList.toggle('active', state.kindTab === 'services');
    segServ.textContent = `Услуги · ${servicesCount}`;
  }

  document.querySelectorAll('.sort-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.val === state.sort);
  });

  grid.innerHTML = catalogInnerHtml(shown);
}

/* ================= Экран: Точка ================= */

function renderStore(slug) {
  const s = selectors.storesRows().find((x) => x.slug === slug);
  if (!s) return nfHtml('Точка не найдена');

  const products = selectors.productRows({ sort: 'walk' })
    .filter((r) => r._availStoreSet.has(slug))
    .map((r) => {
      // цена в этой точке + её цвет для плитки
      const av = r._raw.avail.find((a) => a[0] === slug);
      const delta = av && av[2] ? av[2] : 0;
      return { ...r, price: r._raw.price + delta, storeColor: s.color };
    });

  return `
  <div class="lv-enter" style="padding-bottom:16px">
    <div class="st-cover ${tileBg(s.color)}">
      <span class="em">${s.emoji}</span>
      <span class="open-pill ${s.open ? 'on' : 'off'}"><span class="dot ${s.open ? 'lv-dot' : ''}" style="${s.open ? '' : 'background:#bbb'}"></span>${s.open ? 'Открыто' : 'Закрыто'}</span>
    </div>

    <div class="st-card">
      <div class="st-head">
        <div class="min-w-0">
          <h1>${esc(s.name)}</h1>
          <div class="sub">${esc(catLabel(s.category))} · ${s.isService ? 'услуги' : 'товары'}</div>
        </div>
        <span class="rating-pill">${icon('star', '', 2, true)}${s.rating.toFixed(1)}<span class="rev">· ${s.reviews}</span></span>
      </div>

      <div class="st-chips">
        <span class="info-pill tiffany">${icon('footprints')}${s.walkMinutes} мин пешком · ${s.distance}</span>
        <span class="info-pill plain">${icon('clock')}${esc(s.hours)}</span>
        <span class="info-pill plain">${icon('pin', 'pin')}${esc(s.address)}</span>
      </div>

      <p class="st-about">${esc(s.about)}</p>

      <div class="tag-row">
        ${s.tags
          .filter((t) => TAG_LABEL[t])
          .map((t) => `<span class="tag-pill">${TAG_LABEL[t]}</span>`)
          .join('')}
      </div>
    </div>

    <div class="st-goods">
      <div class="section-head">
        <h2>${icon('package')}Что здесь есть<span class="sub" style="margin-left:2px">· ${products.length}</span></h2>
      </div>
      ${
        products.length
          ? `<div class="prod-grid">${products.map(productCardHtml).join('')}</div>`
          : `<div class="empty-cat" style="padding-top:24px"><p class="d">Витрина этой точки пока заполняется</p></div>`
      }
    </div>
  </div>`;
}

/* ================= Экран: Товар ================= */

function renderProduct(slug) {
  const p = LOVII_DATA.products.find((x) => x.slug === slug);
  if (!p) return nfHtml('Товар не найден');

  const avail = selectors.availRows(p);
  const inStock = avail.filter((a) => a.stock > 0);
  const nearest = inStock[0] || null;
  const badge = p.badge ? BADGE_MAP[p.badge] : null;
  const coverColor = avail[0] ? avail[0].storeColor : 'pink';

  const rows = avail
    .map((a) => {
      const st = stockLabel(a.stock);
      const out = a.stock <= 0;
      const inCart = state.cart.find((c) => c.slug === p.slug && c.storeSlug === a.storeSlug);
      let right;
      if (out) {
        right = `<div class="out-note">Нет в наличии</div>`;
      } else if (state.flashStore === a.storeSlug) {
        right = `<span class="added-pill">${icon('check')}${p.isService ? 'Записаны' : 'Добавлено'}</span>`;
      } else if (inCart) {
        right = qtyHtml(inCart.qty, p.slug, a.storeSlug);
      } else {
        right = `<button class="cta-btn brand-gradient" data-action="add" data-slug="${p.slug}" data-store="${a.storeSlug}">${p.isService ? 'Записаться' : 'В корзину'}</button>`;
      }
      return `
      <div class="avail-card ${out ? 'out' : ''}">
        <div class="avail-row">
          <button class="avail-emoji ${tileBg(a.storeColor)}" data-go="store:${a.storeSlug}" aria-label="Открыть ${esc(a.storeName)}">${a.storeEmoji}</button>
          <div class="avail-mid">
            <button class="avail-name" data-go="store:${a.storeSlug}">${esc(a.storeName)}</button>
            <div class="avail-addr">${esc(a.storeAddress)}</div>
            <div class="avail-tags">
              <span class="walk-text">${icon('footprints')}${a.walkMinutes} мин · ${a.distance}</span>
              <span class="stock-pill ${st.cls}">${st.label}</span>
            </div>
          </div>
          <div class="avail-right">
            <div class="avail-price">${priceFmt(a.price)}</div>
            ${right}
          </div>
        </div>
      </div>`;
    })
    .join('');

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="pd-cover ${tileBg(coverColor)}">
      <span class="em">${p.emoji}</span>
      ${badge ? `<span class="badge-pill ${badge.cls}">${badge.label}</span>` : ''}
      <button class="fav-btn ${state.favorites.includes(p.slug) ? 'on' : ''}" data-action="fav" data-slug="${p.slug}" aria-label="В избранное">${icon('heart', '', 2, state.favorites.includes(p.slug))}</button>
    </div>

    <div class="price-row">
      <span class="price">${priceFmt(p.price)}</span>
      ${p.oldPrice ? `<span class="old-price">${priceFmt(p.oldPrice)}</span>` : ''}
      <span class="unit">/ ${esc(p.unit)}</span>
    </div>
    <h1 class="pd-name">${esc(p.name)}</h1>
    <p class="pd-desc">${esc(p.description)}</p>

    <div class="status-row">
      ${
        nearest
          ? `
        <span class="stat-pill tiffany md">${icon('footprints')}Ближайшая точка — ${nearest.walkMinutes} мин (${nearest.distance})</span>
        <span class="stat-pill pink md">${icon('pin')}Есть в ${inStock.length > 1 ? inStock.length + ' точках' : '1 точке'} рядом</span>`
          : `<span class="stat-pill grey md">Сейчас нет ни в одной точке рядом</span>`
      }
    </div>

    <section class="where-h" aria-label="Где есть рядом">
      <h2>${p.isService ? 'Где записаться' : 'Где есть рядом'}<span class="cnt">· ${avail.length}</span></h2>
      <p class="note">Точки отсортированы по близости к вам. Цена может отличаться на пару рублей.</p>
    </section>
    <div class="avail-list">${rows}</div>
  </div>`;
}

/* ================= Экран: Поиск ================= */

function searchListHtml() {
  const q = state.searchQ.trim();
  const products = selectors.productRows({ q, sort: 'walk' });
  const stores = selectors.storesRows(q);

  if (state.searchTab === 'stores') {
    const hint = q ? `Точки по запросу «${esc(q)}»` : 'Все точки района';
    return `
      <div class="results-hint">${hint}</div>
      <div class="rows">
        ${stores
          .map(
            (s) => `
        <button class="compact-row" data-go="store:${s.slug}">
          <span class="em-tile ${tileBg(s.color)}">${s.emoji}</span>
          <span class="mid">
            <span class="nm">${esc(s.name)}</span>
            <span class="sb">${esc(s.address)} · ${s.open ? 'открыто' : 'закрыто'}</span>
          </span>
          <span class="right"><span class="wk">🚶 ${s.walkMinutes} мин</span></span>
        </button>`
          )
          .join('')}
      </div>
      ${
        stores.length === 0
          ? `<div class="empty-cat"><div class="big-emoji">📍</div><div class="t">Такой точки нет рядом</div><p class="d">Попробуйте другой запрос или район</p></div>`
          : ''
      }`;
  }

  const list = products.filter((p) => (state.searchTab === 'services' ? p.isService : !p.isService));
  const hasServices = products.some((x) => x.isService);
  return `
    <div class="results-hint">${q ? `Нашли ${list.length} по запросу «${esc(q)}»` : 'Популярное рядом'}</div>
    <div class="rows">${list.map(compactRowHtml).join('')}</div>
    ${
      list.length === 0
        ? `<div class="empty-cat"><div class="big-emoji">🔍</div><div class="t">Ничего не нашли</div><p class="d">Попробуйте короче: «хлеб», «кофе» — или поискайте по точкам района</p></div>`
        : ''
    }
    ${state.searchTab === 'products' && hasServices ? `<div class="services-hint">${icon('package')}Ищете услуги? Переключитесь на вкладку «Услуги»</div>` : ''}`;
}

function renderSearch() {
  return `
  <div class="lv-enter lv-narrow">
    <div class="search-bar-wrap">
      <div class="search-bar">
        ${icon('search')}
        <input id="search-input" type="text" value="${esc(state.searchQ)}" placeholder="Круассан, кофе, цветы, стрижка…" aria-label="Поиск товаров и точек" autocomplete="off">
        ${state.searchQ ? `<button class="clear" data-action="clear-q" aria-label="Очистить">${icon('x')}</button>` : ''}
      </div>
      <div class="search-tabs">
        <button class="tab-btn ${state.searchTab === 'products' ? 'active' : ''}" data-action="stab" data-val="products">Товары</button>
        <button class="tab-btn ${state.searchTab === 'services' ? 'active' : ''}" data-action="stab" data-val="services">Услуги</button>
        <button class="tab-btn ${state.searchTab === 'stores' ? 'active' : ''}" data-action="stab" data-val="stores">Точки</button>
      </div>
    </div>
    <div class="results-wrap" id="search-list">${searchListHtml()}</div>
  </div>`;
}

/* ================= Экран: Корзина ================= */

function renderCart() {
  if (state.cart.length === 0) {
    return `
    <div class="lv-enter lv-narrow empty">
      <div class="big-emoji">🛍️</div>
      <h3>Корзина пуста</h3>
      <p>Найдите товар рядом с домом — и заберите его по пути</p>
      <button class="cta-btn brand-gradient" data-go="home">На витрину</button>
    </div>`;
  }

  const byStore = new Map();
  for (const item of state.cart) {
    const list = byStore.get(item.storeSlug) || [];
    list.push(item);
    byStore.set(item.storeSlug, list);
  }
  const total = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cashback = Math.floor(total * 0.05);

  const cards = [...byStore.entries()]
    .map(([storeSlug, items]) => {
      const storeTotal = items.reduce((s, c) => s + c.price * c.qty, 0);
      return `
      <div class="cart-store-card">
        <div class="cart-store-head">
          <span class="walk-pill">${icon('footprints')}${esc(items[0].storeName)}</span>
          <button class="trash" data-action="rm-store" data-store="${storeSlug}" aria-label="Убрать товары точки">${icon('trash')}</button>
        </div>
        ${items
          .map(
            (item) => `
        <div class="cart-item">
          <button class="em-tile tile-ink" data-go="product:${item.slug}">${item.emoji}</button>
          <div class="mid">
            <div class="nm">${esc(item.name)}</div>
            <div class="pr">${priceFmt(item.price)} / ${esc(item.unit)}</div>
          </div>
          ${qtyHtml(item.qty, item.slug, item.storeSlug)}
        </div>`
          )
          .join('')}
        <div class="cart-store-total">
          <span class="l">По этой точке</span>
          <span class="v">${priceFmt(storeTotal)}</span>
        </div>
      </div>`;
    })
    .join('');

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="page-h"><h1>Корзина<span class="cnt">· ${state.cart.length}</span></h1></div>
    <div class="cart-list">${cards}</div>

    <div class="sum-card">
      <div class="sum-row"><span class="l">Товары</span><span class="v">${priceFmt(total)}</span></div>
      <div class="sum-row"><span class="l">Получение — самовывоз</span><span class="v ok">0 ₽</span></div>
      <div class="sum-row"><span class="l">Кэшбэк баллами (5%)</span><span class="v gold">+${cashback} баллов</span></div>
      <div class="sum-div"></div>
      <div class="sum-total"><span class="l">Итого</span><span class="v">${priceFmt(total)}</span></div>

      <button class="cta-btn brand-gradient big" data-action="checkout">Оформить · ${priceFmt(total)}</button>
      <div class="pickup-hint">
        ${icon('pin', 'pin')}Заберёте в точке ${esc(state.cart[0].storeName)} · ${esc(state.district)}
        ${icon('clock', 'clk')}~30 мин
      </div>
    </div>
  </div>`;
}

/* ================= Экран: Заказы ================= */

function orderStatus(o) {
  const age = Date.now() - o.createdAt;
  if (age < 60_000) return { label: 'Готовится', tone: 'pink' };
  if (age < 3_600_000) return { label: 'Можно забрать', tone: 'tiffany' };
  return { label: 'Завершён', tone: 'dim' };
}

function renderOrders() {
  if (state.orders.length === 0) {
    return `
    <div class="lv-enter lv-narrow empty">
      <div class="big-emoji">📦</div>
      <h3>Заказов пока нет</h3>
      <p>Оформите первый заказ — и он появится здесь</p>
      <button class="cta-btn brand-gradient" data-go="home">На витрину</button>
    </div>`;
  }

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="page-h"><h1>Заказы<span class="cnt">· ${state.orders.length}</span></h1></div>
    <div class="orders-list">
      ${state.orders
        .map((o) => {
          const st = orderStatus(o);
          const tone = st.tone === 'pink' ? 'status-pink' : st.tone === 'tiffany' ? 'status-tiffany' : 'status-dim';
          return `
        <div class="order-card">
          <div class="order-head">
            <span class="oid">Заказ ${esc(o.id)}</span>
            <span class="status-pill ${tone}">${st.tone === 'pink' ? '<span class="lv-dot" style="background:var(--pink)"></span>' : ''}${st.label}</span>
          </div>
          <div class="order-meta">${icon('store')}${esc(o.pickupStore)}<span>·</span>${fmtDate(o.createdAt)}</div>
          <div class="item-chips">
            ${o.items
              .map(
                (it, idx) => `
            <span class="item-chip"><span>${it.emoji}</span>${esc(it.name)}<span class="q">×${it.qty}</span></span>`
              )
              .join('')}
          </div>
          <div class="order-foot">
            <span class="l">${icon('package')}Самовывоз из точки</span>
            <span class="v">${priceFmt(o.total)}</span>
          </div>
        </div>`;
        })
        .join('')}
    </div>
  </div>`;
}

/* ================= Вспомогательное ================= */

function nfHtml(title) {
  return `
  <div class="nf lv-enter">
    <div class="big-emoji">🤷</div>
    <div class="t">${title}</div>
    <button class="link" data-action="back">Вернуться назад</button>
  </div>`;
}

const SCREENS = {
  home: renderHome,
  store: renderStore,
  product: renderProduct,
  search: renderSearch,
  cart: renderCart,
  orders: renderOrders,
};
