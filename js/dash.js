/**
 * LOVII Дашборды ролей — профиль, заявки, Store/Rep/Ambassador/Owner/Investor, чаты.
 * Подключается после screens.js (переиспользует esc/priceFmt/tileBg/catLabel/productCardHtml)
 * и до app.js (функции вызываются в рантайме: state, persist, go, toast, selectors).
 * Загружает: профиль (клиент) → заявки на роли → дашборды ролей. Всё демо, без авторизации.
 */

/* ================= Роли: доступ к состоянию ================= */

const ROLE_LIST = ['store', 'rep', 'amb'];

function roleMeta(role) {
  return LOVII_DASH.roleMeta[role] || { title: role, desc: '', emoji: '✨', color: 'pink' };
}

/** Чаты текущего контекста: представитель — точки, амбасадор — представители + группа */
function chatDescriptors(role) {
  if (role === 'rep') {
    return LOVII_DASH.repPoints.map((rp) => {
      const st = selectors.storeBySlug(rp.slug);
      return { id: 'p-' + rp.slug, name: st ? st.name : rp.slug, emoji: st ? st.emoji : '🏪', sub: st ? esc(catLabel(st.category)) : '', status: rp.status };
    });
  }
  if (role === 'amb') {
    const reps = LOVII_DASH.ambReps.map((r) => ({ id: 'r-' + r.id, name: r.name, emoji: '🤝', sub: esc(r.city) + ' · ' + r.points.length + ' точки' }));
    return [{ id: 'group', name: 'Все представители', emoji: '👥', sub: 'Групповой чат' }, ...reps];
  }
  return [];
}

function unreadTotal(role) {
  ensureChats();
  return chatDescriptors(role).reduce((s, c) => s + ((state.chats[c.id] && state.chats[c.id].unread) || 0), 0);
}

function ensureChats() {
  if (state.chats) return;
  const chats = {};
  for (const [id, seed] of Object.entries(LOVII_DASH.chatSeeds)) {
    chats[id] = {
      unread: seed.unread || 0,
      msgs: seed.msgs.map(([from, text], i) => ({ from, text, ts: Date.now() - (seed.msgs.length - i) * 36e5 })),
    };
  }
  state.chats = chats;
}

function chatDescriptor(id) {
  if (id === 'group') return { id, name: 'Все представители', emoji: '👥', sub: 'Групповой чат', status: null };
  if (id.startsWith('p-')) {
    const st = selectors.storeBySlug(id.slice(2));
    const rp = LOVII_DASH.repPoints.find((x) => 'p-' + x.slug === id);
    return { id, name: st ? st.name : id, emoji: st ? st.emoji : '🏪', sub: st ? catLabel(st.category) : '', status: rp ? rp.status : null };
  }
  if (id.startsWith('r-')) {
    const r = LOVII_DASH.ambReps.find((x) => 'r-' + x.id === id);
    return { id, name: r ? r.name : id, emoji: '🤝', sub: r ? r.city : '', status: null };
  }
  return null;
}

function pushChatMessage(id, from, text) {
  ensureChats();
  const chat = state.chats[id] || { unread: 0, msgs: [] };
  chat.msgs.push({ from, text, ts: Date.now() });
  state.chats[id] = chat;
  persist();
}

/* ================= Мелкие строительные блоки ================= */

function dashHeadHtml(role, sub) {
  const m = roleMeta(role);
  return `
  <div class="dash-head">
    <span class="dash-ava ${tileBg(m.color)}">${m.emoji}</span>
    <div class="dash-title">
      <h1>${esc(m.title)}</h1>
      <div class="d">${esc(sub || m.desc)}</div>
    </div>
    <button class="ghost-btn sm" data-action="exit-role">${icon('logout')}Клиент</button>
  </div>`;
}

function dashTabsHtml(role, active) {
  const tabs = {
    store: [['index', 'Обзор'], ['goods', 'Товары'], ['card', 'Точка']],
    rep: [['index', 'Обзор'], ['chats', 'Чаты']],
    amb: [['index', 'Структура'], ['chats', 'Чаты']],
    owner: [['index', 'Обзор'], ['finance', 'Финансы'], ['structure', 'Структура']],
    investor: [['index', 'Рост'], ['sales', 'Продажи'], ['money', 'Доходность']],
  }[role] || [['index', 'Обзор']];
  return `<div class="seg dash-tabs" style="margin:14px 16px 0">${tabs
    .map(([id, label]) => {
      const unread = id === 'chats' ? unreadTotal(role) : 0;
      return `<button class="${active === id ? 'active' : ''}" data-action="dash-tab" data-val="${id}">${label}${unread ? ` <span class="tab-unread">${unread}</span>` : ''}</button>`;
    })
    .join('')}</div>`;
}

function statusChip(status) {
  const map = {
    active: ['Активна', 'st-active'],
    moderation: ['На модерации', 'st-mod'],
    waiting: ['Подключается', 'st-wait'],
    offline: ['Offline', 'st-off'],
  };
  const [label, cls] = map[status] || map.active;
  return `<span class="st-chip ${cls}">${status === 'active' ? '<span class="lv-dot" style="background:var(--tiffany)"></span>' : ''}${label}</span>`;
}

function deltaHtml(pct, { invert = false } = {}) {
  const good = invert ? pct < 0 : pct >= 0;
  const cls = good ? 'delta-up' : 'delta-down';
  const ic = good ? 'trending-up' : 'trending-down';
  const sign = pct >= 0 ? '+' : '−';
  return `<span class="delta ${cls}">${icon(ic)}${sign}${Math.abs(pct).toFixed(0)}%</span>`;
}

function kpiCard(label, value, { delta, invert, spark, tone = 'pink', accent = false } = {}) {
  return `
  <div class="kpi ${accent ? 'accent' : ''}">
    <div class="l">${esc(label)}</div>
    <div class="v">${value}</div>
    <div class="d">${delta != null ? deltaHtml(delta, { invert }) : ''}${spark || ''}</div>
  </div>`;
}

function chartCard(title, sub, inner) {
  return `<div class="chart-card"><div class="cc-head"><b>${esc(title)}</b><span class="sub">${esc(sub)}</span></div>${inner}</div>`;
}

function dashNote(text, tone = 'tiffany') {
  return `<div class="dash-note tone-${tone}">${esc(text)}</div>`;
}

/* ================= Синхронизация точки пользователя с витриной ================= */

function syncUserStore() {
  const r = state.roles && state.roles.store;
  if (!r || !r.point || r.point.status !== 'active') return;
  const p = r.point;
  if (!LOVII_DATA.stores.some((s) => s.slug === p.slug)) {
    const d = selectors.districtObj();
    LOVII_DATA.stores.push({
      slug: p.slug,
      name: p.name,
      category: 'grocery',
      emoji: p.emoji || '🏪',
      color: p.color || 'pink',
      rating: 5.0,
      reviews: 3,
      address: p.address,
      lat: d.lat + 0.0012,
      lng: d.lng + 0.0009,
      hours: p.hours,
      about: p.about || 'Новая точка на витрине LOVII.',
      tags: ['new', 'pickup'],
      isService: false,
    });
  }
  // товары точки — на витрину
  (r.goods || []).forEach((g) => {
    const slug = 'u-' + g.slug;
    if (!LOVII_DATA.products.some((x) => x.slug === slug)) {
      LOVII_DATA.products.push({
        slug,
        name: g.name,
        description: `Товар точки «${p.name}». Свежая витрина района.`,
        emoji: g.emoji,
        category: 'grocery',
        unit: g.unit,
        price: g.price,
        badge: 'new',
        avail: [[p.slug, g.stock, 0]],
      });
    }
  });
}

function approveUserStore(silent) {
  const r = state.roles && state.roles.store;
  if (!r || !r.point || r.point.status !== 'moderation') return;
  r.point.status = 'active';
  syncUserStore();
  persist();
  if (!silent) {
    toast('Точка прошла модерацию', 'Она появилась в витрине района');
    if (state.view.name === 'dash') renderView();
  }
}

/** Проверка авто-модерации: при загрузке молча, в сессии — через 8 сек с тостом */
function moderationCheck(silent) {
  const r = state.roles && state.roles.store;
  if (!r || !r.point || r.point.status !== 'moderation') return;
  if (Date.now() - r.point.appliedAt > 8000) approveUserStore(true);
  else if (!silent) setTimeout(() => approveUserStore(false), 8500 - (Date.now() - r.point.appliedAt));
}

/* ================= Экран: Профиль ================= */

function renderProfile() {
  const u = LOVII_DASH.user;
  const favRows = selectors.productRows({}).filter((p) => state.favorites.includes(p.slug));

  const roleRows = ROLE_LIST.map((role) => {
    const m = roleMeta(role);
    const has = state.roles[role];
    const active = state.activeRole === role;
    return `
    <div class="row-item">
      <span class="ri-emoji ${tileBg(m.color)}">${m.emoji}</span>
      <div class="ri-mid">
        <div class="nm">${esc(m.title)}${has ? '<span class="role-badge">моя роль</span>' : ''}</div>
        <div class="sb">${esc(m.desc)}</div>
      </div>
      ${
        has
          ? `<button class="cta-btn ${active ? 'brand-gradient' : 'plain'}" data-action="enter-role" data-role="${role}">${active ? 'Открыто' : 'Войти как ' + esc(m.short || m.title)}</button>`
          : `<button class="cta-btn brand-gradient" data-go="apply:${role}">Стать</button>`
      }
    </div>`;
  }).join('');

  const demoRows = ['owner', 'investor']
    .map((role) => {
      const m = roleMeta(role);
      return `
      <div class="row-item">
        <span class="ri-emoji ${tileBg(m.color)}">${m.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(m.title)}<span class="demo-tag">демо</span></div>
          <div class="sb">${esc(m.desc)}</div>
        </div>
        <button class="cta-btn plain" data-action="enter-role" data-role="${role}">Открыть</button>
      </div>`;
    })
    .join('');

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="prof-head ink-gradient">
      <span class="prof-ava">${u.avatar}</span>
      <div class="min-w-0">
        <div class="prof-name">${esc(u.name)}</div>
        <div class="prof-phone">${esc(u.phone)}</div>
        <div class="prof-chips">
          <span class="glass-chip">${icon('star', 'g', 2, true)} ${u.points.toLocaleString('ru-RU')} баллов</span>
          ${state.activeRole ? `<span class="glass-chip">${roleMeta(state.activeRole).emoji} в роли</span>` : ''}
        </div>
      </div>
    </div>

    <div class="quick-row">
      <button class="quick" data-go="orders"><span class="v">${state.orders.length}</span><span class="l">Заказы</span></button>
      <button class="quick"><span class="v">${state.favorites.length}</span><span class="l">Избранное</span></button>
      <button class="quick" data-go="home"><span class="v">${selectors.storesRows().length}</span><span class="l">Точки рядом</span></button>
    </div>

    ${
      favRows.length
        ? `<section class="section"><div class="section-head"><h2>Избранное</h2></div>
           <div class="hscroll no-scrollbar">${favRows.map(productCardHtml).join('')}</div></section>`
        : `<div class="dash-note tone-tiffany" style="margin-top:14px">Жмите ♥ на карточке товара — он появится здесь</div>`
    }

    <div class="section-head" style="margin-top:20px"><h2>Роли</h2></div>
    <div class="list-card">${roleRows}</div>

    <div class="section-head" style="margin-top:20px"><h2>Демо-доступ</h2></div>
    <div class="list-card">${demoRows}</div>

    <div class="section-head" style="margin-top:20px"><h2>Приложение</h2></div>
    <div class="list-card">
      <button class="row-item install-card-btn" data-action="install-app" aria-label="Установить приложение">
        <span class="ri-emoji ${tileBg('pink')}">${icon('download')}</span>
        <div class="ri-mid">
          <div class="nm">Установить приложение</div>
          <div class="sb">Иконка LOVII на главном экране телефона или рабочем столе компьютера</div>
        </div>
        <span class="cta-btn brand-gradient">Установить</span>
      </button>
    </div>

    <p class="dash-note tone-dim" style="margin-top:14px">Демо-режим: без авторизации. Роли сохраняются в этом браузере.</p>

    <footer class="prof-legal">
      <nav>
        <a href="https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html" target="_blank" rel="noopener">Публичная Оферта</a>
        <a href="https://axiiom-ru.github.io/lovii/docs/Оферта_присоединения.html" target="_blank" rel="noopener">Оферта присоединения</a>
      </nav>
      <p>LOVII · AXIIOM · ООО «Аксиома»<br>ИНН 7842223709 · ОГРН 1247800067690</p>
    </footer>
  </div>`;
}

/* ================= Экран: Заявка на роль ================= */

function renderApply(role) {
  if (!ROLE_LIST.includes(role)) return renderProfile();
  const m = roleMeta(role);
  const titles = { store: 'Стать точкой', rep: 'Стать представителем', amb: 'Стать амбасадором' };
  const field = (name, label, ph, val = '', req = true) =>
    `<label class="f-field"><span class="lb">${esc(label)}</span><input name="${name}" placeholder="${esc(ph)}" value="${esc(val)}" ${req ? 'required' : ''}></label>`;

  const fields =
    role === 'store'
      ? field('name', 'Название точки', 'Кофейня «У дома»') +
        field('address', 'Адрес', 'ул. Тверская, 15') +
        field('hours', 'Часы работы', '09:00-21:00', '09:00-21:00', false) +
        `<label class="f-field"><span class="lb">Описание</span><textarea name="about" placeholder="Что продаёте, чем полезна точка району…"></textarea></label>`
      : field('name', 'Как вас зовут', 'Имя Фамилия') +
        `<label class="f-field"><span class="lb">Район работы</span>
          <select name="city">${LOVII_DATA.districts.map((d) => `<option>${esc(d.name)}</option>`).join('')}</select></label>` +
        (role === 'amb' ? `<label class="f-field"><span class="lb">Опыт (необязательно)</span><textarea name="about" placeholder="Расскажите коротко о своём опыте"></textarea></label>` : '');

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="apply-head ${tileBg(m.color)}">
      <span class="ah-emoji">${m.emoji}</span>
      <div class="ah-mid">
        <div class="kicker">${esc(m.title)}</div>
        <h1>${esc(titles[role])}</h1>
      </div>
    </div>
    <form id="apply-form" data-role="${role}">
      ${fields}
      <div class="dash-note tone-gold" style="margin:14px 16px 0">${role === 'store' ? 'Точка появится на витрине района сразу после авто-модерации (≈8 секунд в демо)' : 'Заявка одобряется автоматически — это демо'}</div>
      <div style="padding:16px 16px 0"><button class="cta-btn brand-gradient big" type="submit">Отправить заявку</button></div>
      <div style="padding:10px 16px 0"><button class="cta-btn plain big" type="button" data-action="back">Назад</button></div>
    </form>
  </div>`;
}

/* ================= Дашборд: роутер ================= */

function renderDash(tab) {
  const role = state.activeRole;
  const ok = role && (['owner', 'investor'].includes(role) || state.roles[role]);
  if (!ok) {
    toast('Роль ещё не получена', 'Оформите заявку в профиле');
    return renderProfile();
  }
  const t = tab || 'index';
  const body = {
    store: () => renderStoreDash(t),
    rep: () => renderRepDash(t),
    amb: () => renderAmbDash(t),
    owner: () => renderOwnerDash(t),
    investor: () => renderInvestorDash(t),
  }[role]();
  return `<div class="lv-enter" style="padding-bottom:16px">${body}</div>`;
}

/* ================= Дашборд: Торговая точка ================= */

const PERIODS = [
  ['day', 'День'],
  ['week', 'Неделя'],
  ['month', 'Месяц'],
];

function periodSegHtml() {
  return `<div class="seg" style="margin:14px 16px 0">${PERIODS.map(
    ([id, label]) => `<button class="${state.dashPeriod === id ? 'active' : ''}" data-action="period" data-val="${id}">${label}</button>`
  ).join('')}</div>`;
}

function storePeriodData(period) {
  const conf = {
    day: { n: 12, min: 900, max: 5200, labels: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'], orders: 68 },
    week: { n: 7, min: 11000, max: 52000, labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], orders: 342 },
    month: { n: 30, min: 6000, max: 34000, labels: Array.from({ length: 30 }, (_, i) => String(i + 1)), orders: 1428 },
  }[period];
  const series = seededSeries('store-' + period, conf.n, conf.min, conf.max);
  const revenue = series.reduce((s, x) => s + x, 0);
  const delta = seededSeries('dlt-' + period, 2, -10, 26)[1];
  return { ...conf, series, revenue, orders: conf.orders, avg: Math.round(revenue / conf.orders), delta };
}

function renderStoreDash(tab) {
  const r = state.roles.store;
  const p = r.point;
  const head = dashHeadHtml('store', esc(p.name) + ' · ' + esc(p.address));
  const tabs = dashTabsHtml('store', tab);

  const statusBlock = `
  <div class="status-banner">
    ${statusChip(p.status)}
    ${
      p.status === 'moderation'
        ? `<button class="cta-btn plain sm" data-action="approve-store">Одобрить сейчас</button>`
        : `<span class="sb">Точка видна на витрине района</span>`
    }
  </div>
  ${p.status === 'moderation' ? dashNote('Авто-модерация в демо пройдёт через ~8 секунд — потом точка появится в витрине', 'gold') : ''}`;

  if (tab === 'goods') {
    const goods = r.goods || [];
    const catalogChips = LOVII_DATA.products
      .filter((x) => !x.isService && !goods.some((g) => g.name === x.name))
      .slice(0, 10)
      .map((x) => `<button class="cat-chip" data-action="add-good" data-slug="${x.slug}"><span class="e">${x.emoji}</span>${esc(x.name)}</button>`)
      .join('');
    return `
    ${head}${tabs}${statusBlock}
    <div class="section-head" style="margin-top:20px"><h2>Товары точки<span class="sub"> · ${goods.length}</span></h2></div>
    <div class="list-card">
      ${
        goods.length
          ? goods
              .map(
                (g) => `
      <div class="row-item">
        <span class="ri-emoji ${tileBg('sand')}">${g.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(g.name)}</div>
          <div class="sb">${priceFmt(g.price)} / ${esc(g.unit)} · остаток ${g.stock >= 99 ? '∞' : g.stock}</div>
        </div>
        <button class="trash-btn" data-action="rm-good" data-slug="${g.slug}" aria-label="Убрать">${icon('trash')}</button>
      </div>`
              )
              .join('')
          : `<div class="empty-cat"><div class="big-emoji">🧺</div><div class="t">Товаров пока нет</div><p class="d">Добавьте товары из каталога ниже</p></div>`
      }
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Добавить из каталога</h2></div>
    <div class="cats no-scrollbar" style="padding:10px 16px 4px">${catalogChips}</div>
    ${dashNote('Товары точки появляются в витрине и поиске района автоматически', 'tiffany')}`;
  }

  if (tab === 'card') {
    return `
    ${head}${tabs}${statusBlock}
    <form id="card-form" style="padding-bottom:8px">
      <label class="f-field"><span class="lb">Название</span><input name="name" required value="${esc(p.name)}"></label>
      <label class="f-field"><span class="lb">Адрес</span><input name="address" required value="${esc(p.address)}"></label>
      <label class="f-field"><span class="lb">Часы работы</span><input name="hours" value="${esc(p.hours)}"></label>
      <label class="f-field"><span class="lb">Описание</span><textarea name="about">${esc(p.about || '')}</textarea></label>
      <div style="padding:14px 16px 0"><button class="cta-btn brand-gradient big" type="submit">Сохранить карточку</button></div>
    </form>
    ${dashNote('Карточка обновится в витрине района сразу после сохранения', 'tiffany')}`;
  }

  // --- Обзор ---
  const period = state.dashPeriod || 'week';
  const st = storePeriodData(period);
  const cashback = Math.round(st.revenue * 0.05);
  const topGoods = [...(r.goods || [])]
    .map((g) => ({ label: g.name, emoji: g.emoji, value: Math.round((g.price * seededSeries('sale-' + g.slug, 1, 8, 60))[0]) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return `
  ${head}${tabs}${statusBlock}${periodSegHtml()}
  <div class="kpi-grid">
    ${kpiCard('Выручка · ' + (PERIODS.find((x) => x[0] === period) || [])[1], moneyFmt(st.revenue), { delta: st.delta, accent: true })}
    ${kpiCard('Заказы', String(st.orders), { spark: sparkSvg(st.series.slice(-7), 'tiffany') })}
    ${kpiCard('Средний чек', priceFmt(st.avg), { delta: seededSeries('avg-dlt', 2, -6, 12)[1], tone: 'gold' })}
    ${kpiCard('Кэшбэк баллами', '+' + numFmt(cashback), { tone: 'gold' })}
  </div>
  ${chartCard('Выручка', period === 'day' ? 'по часам, ₽' : period === 'week' ? 'по дням недели, ₽' : 'за 30 дней, ₽', barsChart({ data: st.series, labels: st.labels, tone: 'pink', height: 150 }))}
  <div class="section-head" style="margin-top:20px"><h2>Топ-5 товаров</h2></div>
  ${
    topGoods.length
      ? `<div class="chart-card" style="margin-top:10px">${hbarsHtml(topGoods, { fmt: (v) => numFmt(v) + ' шт' })}</div>`
      : `<div class="dash-note tone-dim">Добавьте товары — и здесь появится статистика продаж</div>`
  }
  <div class="btn-row">
    <button class="ghost-btn" data-action="dash-tab" data-val="goods">${icon('package')}Товары</button>
    <button class="ghost-btn" data-action="dash-tab" data-val="card">${icon('edit')}Карточка</button>
  </div>`;
}

/* ================= Дашборд: Представитель ================= */

function renderRepDash(tab) {
  const head = dashHeadHtml('rep', 'Точки района на связи');
  const tabs = dashTabsHtml('rep', tab);

  if (tab === 'chats') return chatListHtml('rep', head, tabs, 'Чаты с точками');

  const pts = LOVII_DASH.repPoints.map((rp) => {
    const st = selectors.storesRows().find((s) => s.slug === rp.slug);
    return { ...rp, name: st ? st.name : rp.slug, emoji: st ? st.emoji : '🏪', walk: st ? st.walkMinutes : null, dist: st ? st.distance : '' };
  });
  const activePts = pts.filter((x) => x.status === 'active');
  const revenue = activePts.reduce((s, x) => s + x.revenueWeek, 0);
  const orders = activePts.reduce((s, x) => s + x.orders, 0);
  const views = activePts.reduce((s, x) => s + x.views, 0);
  const conv = views ? (orders / views) * 100 : 0;
  const growth = 9; // к прошлой неделе (демо)
  const top = [...activePts].sort((a, b) => b.revenueWeek - a.revenueWeek).map((x) => ({ label: x.name, emoji: x.emoji, value: x.revenueWeek }));

  return `
  ${head}${tabs}
  <div class="kpi-grid">
    ${kpiCard('Выручка сети · неделя', moneyFmt(revenue), { delta: growth, accent: true })}
    ${kpiCard('Активные точки', `${activePts.length} / ${pts.length}`, { spark: sparkSvg(seededSeries('rep-kpi', 7, 3, 5), 'tiffany') })}
    ${kpiCard('Конверсия', conv.toFixed(1) + '%', { delta: 0.8, tone: 'gold' })}
    ${kpiCard('Заказы за неделю', numFmt(orders), { delta: 12, tone: 'tiffany' })}
  </div>

  <div class="section-head" style="margin-top:20px"><h2>Мои точки<span class="sub"> · ${pts.length}</span></h2></div>
  <div class="list-card">
    ${pts
      .map(
        (x) => `
    <div class="row-item">
      <span class="ri-emoji ${tileBg('pink')}">${x.emoji}</span>
      <div class="ri-mid">
        <div class="nm">${esc(x.name)}</div>
        <div class="sb">${x.walk != null ? icon('footprints') + ' ' + x.walk + ' мин · ' + esc(x.dist) : ''}</div>
      </div>
      <div class="ri-right">
        <div class="v">${x.status === 'waiting' ? '—' : moneyFmt(x.revenueWeek)}</div>
        ${statusChip(x.status)}
      </div>
      ${x.status !== 'waiting' ? `<button class="chev-btn" data-go="store:${x.slug}" aria-label="Открыть точку">${icon('chev-right')}</button>` : ''}
    </div>`
      )
      .join('')}
  </div>

  <div class="section-head" style="margin-top:20px"><h2>Топ точек по выручке</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top)}</div>

  <div class="btn-row">
    <button class="ghost-btn" data-action="dash-tab" data-val="chats">${icon('message')}Чаты с точками ${unreadTotal('rep') ? `<span class="tab-unread">${unreadTotal('rep')}</span>` : ''}</button>
  </div>
  ${chartCard('Выручка сети по дням', 'неделя, ₽', barsChart({ data: seededSeries('rep-week', 7, 18000, 96000), labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], tone: 'tiffany', height: 130 }))}`;
}

/* ================= Дашборд: Амбасадор ================= */

function renderAmbDash(tab) {
  const head = dashHeadHtml('amb', 'Структура представителей');
  const tabs = dashTabsHtml('amb', tab);

  if (tab === 'chats') return chatListHtml('amb', head, tabs, 'Чаты с представителями');

  const reps = LOVII_DASH.ambReps.map((r) => ({
    ...r,
    pointsNames: r.points.map((s) => selectors.storeBySlug(s)).filter(Boolean),
  }));
  const totalRev = reps.reduce((s, r) => s + r.revenueWeek, 0);
  const totalPoints = reps.reduce((s, r) => s + r.points.length, 0);
  const avgGrowth = reps.reduce((s, r) => s + r.growth, 0) / reps.length;
  const top = [...reps].sort((a, b) => b.revenueWeek - a.revenueWeek).map((r) => ({ label: r.name, value: r.revenueWeek }));

  const tree = `
  <div class="tree">
    <div class="tree-row root">
      <span class="t-emoji ${tileBg('gold')}">🚀</span>
      <div class="ri-mid"><div class="nm">Вы · амбасадор</div><div class="sb">${reps.length} представителя · ${totalPoints} точки</div></div>
      <div class="ri-right"><div class="v">${moneyFmt(totalRev)}</div><span class="sb">за неделю</span></div>
    </div>
    <div class="tree-kids">
      ${reps
        .map(
          (r) => `
      <div class="tree-row">
        <span class="t-emoji ${tileBg('tiffany')}">🤝</span>
        <div class="ri-mid">
          <div class="nm">${esc(r.name)}</div>
          <div class="sb">${esc(r.city)} · ${r.points.length} точки</div>
        </div>
        <div class="ri-right"><div class="v">${moneyFmt(r.revenueWeek)}</div>${deltaHtml(r.growth)}</div>
      </div>
      <div class="tree-kids">
        ${r.pointsNames
          .map(
            (s) => `
        <div class="tree-row leaf">
          <span class="t-emoji ${tileBg('sand')}">${s.emoji}</span>
          <div class="ri-mid"><div class="nm">${esc(s.name)}</div><div class="sb">${esc(catLabel(s.category))}</div></div>
          <button class="chev-btn" data-go="store:${s.slug}">${icon('chev-right')}</button>
        </div>`
          )
          .join('')}
      </div>`
        )
        .join('')}
    </div>
  </div>`;

  return `
  ${head}${tabs}
  <div class="kpi-grid">
    ${kpiCard('Выручка структуры · неделя', moneyFmt(totalRev), { delta: avgGrowth, accent: true })}
    ${kpiCard('Представители', String(reps.length), { spark: sparkSvg(seededSeries('amb-reps', 6, 2, 4), 'tiffany') })}
    ${kpiCard('Точки в структуре', String(totalPoints), { tone: 'gold' })}
    ${kpiCard('Конверсия структуры', '5,4%', { delta: 0.6, tone: 'tiffany' })}
  </div>

  <div class="section-head" style="margin-top:20px"><h2>Моя структура</h2></div>
  ${tree}

  <div class="section-head" style="margin-top:20px"><h2>Топ представителей</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top)}</div>
  ${chartCard('Рост структуры', '6 месяцев, тыс ₽', areaChart({ data: seededSeries('amb-6m', 6, 380, 900), labels: ['апр', 'май', 'июн', 'июл', 'авг', 'сен'], tone: 'gold', height: 140 }))}

  <div class="btn-row">
    <button class="ghost-btn" data-action="dash-tab" data-val="chats">${icon('message')}Чаты ${unreadTotal('amb') ? `<span class="tab-unread">${unreadTotal('amb')}</span>` : ''}</button>
  </div>`;
}

/* ================= Дашборд: Владелец ================= */

function regionOfStore(st) {
  if (REGION_MAP[st.slug]) return REGION_MAP[st.slug];
  let best = LOVII_DATA.districts[0];
  let bestD = Infinity;
  for (const d of LOVII_DATA.districts) {
    const dist = haversineMeters(d.lat, d.lng, st.lat, st.lng);
    if (dist < bestD) {
      bestD = dist;
      best = d;
    }
  }
  return best.name;
}

/* Демо-распределение точек по районам (чтобы у каждого региона были точки) */
const REGION_MAP = {
  daily: 'Тверской', sloyka: 'Тверской', udoma: 'Тверской', health: 'Тверской',
  flowers: 'Арбат', krasota: 'Арбат', snejinka: 'Арбат',
  miya: 'Китай-город', forno: 'Китай-город', shokolad: 'Китай-город', derevnya: 'Китай-город',
  grill: 'Охотный Ряд', master: 'Охотный Ряд', igla: 'Охотный Ряд',
};

function ownerPointsRows() {
  const rows = LOVII_DATA.stores.map((s) => ({
    slug: s.slug,
    name: s.name,
    emoji: s.emoji,
    region: regionOfStore(s),
    status: s.slug === 'master' ? 'offline' : 'active',
    revenueWeek: Math.round(seededSeries('own-' + s.slug, 1, 42000, 340000)[0]),
  }));
  const mine = state.roles.store;
  if (mine && mine.point && mine.point.status === 'active') {
    rows.push({ slug: mine.point.slug, name: mine.point.name, emoji: '🏪', region: regionOfStore({ lat: selectors.districtObj().lat + 0.0012, lng: selectors.districtObj().lng + 0.0009 }), status: 'active', revenueWeek: Math.round(seededSeries('own-my', 1, 20000, 90000)[0]) });
  }
  return rows.sort((a, b) => b.revenueWeek - a.revenueWeek);
}

function platformRevenueSeries() {
  const inv = LOVII_DASH.investor;
  return inv.gmv.map((g, i) => Math.round((g * 1000 * LOVII_DASH.finance.commissionRate + inv.points[i] * LOVII_DASH.finance.subPerPoint) / 1000));
}

function renderOwnerDash(tab) {
  const head = dashHeadHtml('owner', 'Платформа целиком');
  const tabs = dashTabsHtml('owner', tab);
  const inv = LOVII_DASH.investor;

  if (tab === 'finance') {
    const gmv = inv.gmv[inv.gmv.length - 1] * 1000;
    const commission = gmv * LOVII_DASH.finance.commissionRate;
    const subs = inv.points[inv.points.length - 1] * LOVII_DASH.finance.subPerPoint;
    const payouts = gmv * LOVII_DASH.finance.repPayoutRate;
    const opex = LOVII_DASH.finance.opexMonth;
    const profit = commission + subs - payouts - opex;
    const row = (l, v, cls = '') => `<div class="fin-row ${cls}"><span class="l">${l}</span><span class="v">${v}</span></div>`;
    return `
    ${head}${tabs}
    <div class="list-card" style="margin-top:14px">
      ${row('Выручка по точкам (GMV)', moneyFmt(gmv))}
      ${row('Комиссия платформы · 10%', moneyFmt(commission), 'ok')}
      ${row('Подписки точек · ' + inv.points[inv.points.length - 1] + ' × ' + priceFmt(LOVII_DASH.finance.subPerPoint), moneyFmt(subs), 'ok')}
      ${row('Выплаты представителям · 4%', '−' + moneyFmt(payouts), 'neg')}
      ${row('OPEX · команда и маркетинг', '−' + moneyFmt(opex), 'neg')}
    </div>
    <div class="fin-total"><span>Прибыль за месяц</span><span>${moneyFmt(profit)}</span></div>
    ${chartCard('Прибыль платформы по месяцам', '12 месяцев, тыс ₽', barsChart({ data: platformRevenueSeries(), labels: inv.monthLabels, tone: 'gold', height: 140 }))}
    ${dashNote('Демо-финансы: комиссия 10% с GMV + подписка точек, выплаты представителям 4% от GMV', 'gold')}`;
  }

  if (tab === 'structure') {
    const totalRev = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.reduce((x, r) => x + r.rev, 0), 0);
    const totalReps = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.length, 0);
    const totalPoints = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.reduce((x, r) => x + r.points, 0), 0);
    return `
    ${head}${tabs}
    <div class="kpi-grid">
      ${kpiCard('Амбасадоры', String(LOVII_DASH.ambassadors.length), { accent: true })}
      ${kpiCard('Представители', String(totalReps), { tone: 'tiffany' })}
      ${kpiCard('Точки в структуре', String(totalPoints), { tone: 'gold' })}
      ${kpiCard('Выручка структуры · неделя', moneyFmt(totalRev), {})}
    </div>
    <div class="tree" style="margin-top:16px">
      ${LOVII_DASH.ambassadors
        .map(
          (a) => `
      <div class="tree-row root">
        <span class="t-emoji ${tileBg('gold')}">👑</span>
        <div class="ri-mid"><div class="nm">${esc(a.name)}</div><div class="sb">${esc(a.city)} · ${a.reps.length} представителя</div></div>
        <div class="ri-right"><div class="v">${moneyFmt(a.reps.reduce((x, r) => x + r.rev, 0))}</div></div>
      </div>
      <div class="tree-kids">
        ${a.reps
          .map(
            (r) => `
        <div class="tree-row leaf">
          <span class="t-emoji ${tileBg('tiffany')}">🤝</span>
          <div class="ri-mid"><div class="nm">${esc(r.name)}</div><div class="sb">${r.points} точки</div></div>
          <div class="ri-right"><div class="v">${moneyFmt(r.rev)}</div></div>
        </div>`
          )
          .join('')}
      </div>`
        )
        .join('')}
    </div>
    ${dashNote('Фильтр по точкам — на вкладке «Обзор»; экспорт выгрузит CSV со всеми точками', 'dim')}`;
  }

  // --- Обзор ---
  const allRows = ownerPointsRows();
  const regions = ['Все', ...LOVII_DATA.districts.map((d) => d.name).filter((n) => allRows.some((r) => r.region === n))];
  const rows = allRows.filter((r) => state.ownerRegion === 'Все' || !state.ownerRegion || r.region === state.ownerRegion);
  const monthRev = platformRevenueSeries();
  const totalMonth = monthRev[monthRev.length - 1] * 1000;

  return `
  ${head}${tabs}
  <div class="kpi-grid">
    ${kpiCard('Выручка платформы · месяц', moneyFmt(totalMonth), { delta: 11, accent: true })}
    ${kpiCard('Точки на витрине', String(inv.points[inv.points.length - 1]), { spark: sparkSvg(inv.points, 'tiffany') })}
    ${kpiCard('Пользователи', numFmt(inv.users[inv.users.length - 1]), { delta: 17, tone: 'tiffany' })}
    ${kpiCard('Амбасадоры', String(LOVII_DASH.ambassadors.length), { tone: 'gold' })}
  </div>
  ${chartCard('Выручка платформы по месяцам', 'комиссия + подписки, тыс ₽', areaChart({ data: monthRev, labels: inv.monthLabels, tone: 'pink', height: 150 }))}
  <div class="chips-row no-scrollbar">${regions
    .map((r) => `<button class="tab-btn ${state.ownerRegion === r ? 'active' : ''}" data-action="region" data-val="${r}">${esc(r)}</button>`)
    .join('')}</div>
  <div class="section-head" style="margin-top:10px"><h2>Точки<span class="sub"> · ${rows.length}</span></h2>
    <button class="link-btn" data-action="export-csv">${icon('download')}Экспорт CSV</button></div>
  <div class="list-card">
    ${rows
      .map(
        (r) => `
    <div class="row-item">
      <span class="ri-emoji ${tileBg('sand')}">${r.emoji}</span>
      <div class="ri-mid"><div class="nm">${esc(r.name)}</div><div class="sb">${esc(r.region)}</div></div>
      <div class="ri-right"><div class="v">${moneyFmt(r.revenueWeek)}</div>${statusChip(r.status)}</div>
    </div>`
      )
      .join('')}
  </div>`;
}

/* ================= Дашборд: Инвестор ================= */

function renderInvestorDash(tab) {
  const head = dashHeadHtml('investor', 'Рост и доходность платформы');
  const tabs = dashTabsHtml('investor', tab);
  const inv = LOVII_DASH.investor;
  const fin = LOVII_DASH.finance;

  if (tab === 'sales') {
    const cats = inv.categories.map((c) => ({ label: c.label, value: c.share }));
    const tops = inv.topProducts.map((s) => LOVII_DATA.products.find((p) => p.slug === s)).filter(Boolean);
    return `
    ${head}${tabs}
    <div class="kpi-grid">
      ${kpiCard('Средний чек', priceFmt(inv.avgCheck), { delta: 4, accent: true })}
      ${kpiCard('Конверсия платформы', inv.conversion + '%', { delta: 0.7, tone: 'tiffany' })}
      ${kpiCard('GMV · месяц', moneyFmt(inv.gmv[inv.gmv.length - 1] * 1000), { delta: 11, tone: 'gold' })}
      ${kpiCard('Заказов · месяц', numFmt((inv.gmv[inv.gmv.length - 1] * 1000) / inv.avgCheck), {})}
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Выручка по категориям</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(cats, { fmt: (v) => v + '%' })}</div>
    <div class="section-head" style="margin-top:20px"><h2>Топ точки</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(
      ownerPointsRows().slice(0, 3).map((r) => ({ label: r.name, emoji: r.emoji, value: r.revenueWeek * 4 }))
    )}</div>
    <div class="section-head" style="margin-top:20px"><h2>Топ товары</h2></div>
    <div class="list-card">
      ${tops
        .map(
          (p) => `
      <button class="row-item as-btn" data-go="product:${p.slug}">
        <span class="ri-emoji ${tileBg('pink')}">${p.emoji}</span>
        <div class="ri-mid"><div class="nm">${esc(p.name)}</div><div class="sb">${priceFmt(p.price)} / ${esc(p.unit)}</div></div>
        ${icon('chev-right', 'chev')}
      </button>`
        )
        .join('')}
    </div>`;
  }

  if (tab === 'money') {
    const gmv = inv.gmv[inv.gmv.length - 1] * 1000;
    const commission = gmv * fin.commissionRate;
    const subs = inv.points[inv.points.length - 1] * fin.subPerPoint;
    const payouts = gmv * fin.repPayoutRate;
    const profit = commission + subs - payouts - fin.opexMonth;
    const roiYear = Math.round(((profit * 12 - fin.capexTotal) / fin.capexTotal) * 100);
    const payback = Math.ceil(fin.capexTotal / profit);
    const row = (l, v, cls = '') => `<div class="fin-row ${cls}"><span class="l">${l}</span><span class="v">${v}</span></div>`;
    return `
    ${head}${tabs}
    <div class="roi-card ink-gradient">
      <div class="kicker">Доходность платформы</div>
      <div class="big">ROI <span class="g">${roiYear > 0 ? '+' : ''}${roiYear}%</span> за год</div>
      <p>Окупаемость вложений — около ${payback} месяцев при текущей динамике GMV</p>
      <div class="chips">
        <span class="glass-chip">${icon('trending-up')}прогноз +11%/мес</span>
        <span class="glass-chip">${icon('banknote')}прибыль ${moneyFmt(profit)}/мес</span>
      </div>
    </div>
    <div class="list-card" style="margin-top:14px">
      ${row('CAPEX · единовременные затраты', moneyFmt(fin.capexTotal))}
      ${row('OPEX · в месяц', moneyFmt(fin.opexMonth))}
      ${row('Выручка платформы · месяц', moneyFmt(commission + subs), 'ok')}
      ${row('Чистая прибыль · месяц', moneyFmt(profit), 'ok')}
    </div>
    ${chartCard('Прогноз GMV', '12 месяцев + 3 пунктиром, тыс ₽', areaChart({ data: inv.gmv, labels: [...inv.monthLabels, 'пр1', 'пр2', 'пр3'], forecast: inv.forecastGmv, tone: 'tiffany', height: 160, yFmt: (v) => numFmt(v * 1000) + ' ₽' }))}
    <div class="chips-row no-scrollbar" style="padding-top:12px">
      ${inv.forecastGmv.map((v, i) => `<span class="tab-btn active">${['+3 мес', '+6 мес', '+9 мес'][i] || 'прогноз ' + (i + 1)}: ${numFmt(v * 1000)} ₽</span>`).join('')}
    </div>
    ${dashNote('Демо-прогноз: экстраполяция текущего роста GMV ~11% в месяц', 'tiffany')}`;
  }

  // --- Рост ---
  const usersGrowth = Math.round((inv.users[inv.users.length - 1] / inv.users[0] - 1) * 100);
  const pointsGrowth = Math.round((inv.points[inv.points.length - 1] / inv.points[0] - 1) * 100);
  return `
  ${head}${tabs}
  <div class="kpi-grid">
    ${kpiCard('Пользователи', numFmt(inv.users[inv.users.length - 1]), { delta: usersGrowth / 12, accent: true, spark: sparkSvg(inv.users, 'pink') })}
    ${kpiCard('Точки на витрине', String(inv.points[inv.points.length - 1]), { delta: pointsGrowth / 12, spark: sparkSvg(inv.points, 'tiffany') })}
    ${kpiCard('GMV · месяц', moneyFmt(inv.gmv[inv.gmv.length - 1] * 1000), { delta: 11, tone: 'gold' })}
    ${kpiCard('Рост за год', '×' + (inv.users[inv.users.length - 1] / inv.users[0]).toFixed(1).replace('.', ','), {})}
  </div>
  ${chartCard('GMV по месяцам', 'тыс ₽ · пунктир — прогноз', areaChart({ data: inv.gmv, labels: [...inv.monthLabels, 'пр1', 'пр2', 'пр3'], forecast: inv.forecastGmv, tone: 'pink', height: 165, yFmt: (v) => numFmt(v * 1000) + ' ₽' }))}
  ${chartCard('Пользователи по месяцам', 'человек · пунктир — прогноз', areaChart({ data: inv.users, labels: [...inv.monthLabels, 'пр1', 'пр2', 'пр3'], forecast: inv.forecastUsers, tone: 'tiffany', height: 140 }))}
  ${chartCard('Точки на витрине', 'количество', barsChart({ data: inv.points, labels: inv.monthLabels, tone: 'gold', height: 120 }))}`;
}

/* ================= Чаты ================= */

function chatListHtml(role, head, tabs, title) {
  const list = chatDescriptors(role);
  ensureChats();
  return `
  ${head}${tabs}
  <div class="section-head" style="margin-top:20px"><h2>${esc(title)}<span class="sub"> · ${list.length}</span></h2></div>
  <div class="list-card">
    ${list
      .map((c) => {
        const chat = state.chats[c.id] || { msgs: [] };
        const last = chat.msgs[chat.msgs.length - 1];
        const unread = chat.unread || 0;
        return `
      <button class="row-item as-btn" data-go="chat:${c.id}">
        <span class="ri-emoji ${tileBg(role === 'rep' ? 'tiffany' : 'gold')}">${c.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(c.name)}${c.status && c.status !== 'active' ? statusChip(c.status) : ''}</div>
          <div class="sb">${last ? esc(last.text.slice(0, 42)) + (last.text.length > 42 ? '…' : '') : esc(c.sub)}</div>
        </div>
        ${unread ? `<span class="unread">${unread}</span>` : ''}
        ${icon('chev-right', 'chev')}
      </button>`;
      })
      .join('')}
  </div>
  ${dashNote(role === 'rep' ? 'Уведомления о новых заказах точки приходят сюда' : 'Групповой чат и личные чаты с представителями', 'dim')}`;
}

function renderChat(id) {
  const desc = chatDescriptor(id);
  if (!desc) return renderProfile();
  ensureChats();
  const chat = state.chats[id];
  if (chat && chat.unread) {
    chat.unread = 0;
    persist();
  }
  const msgs = (state.chats[id] && state.chats[id].msgs) || [];
  const time = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `
  <div class="chat-screen">
    ${subHeaderHtml(desc.name)}
    <div class="chat-sub">${desc.emoji} ${esc(desc.sub)}${desc.status && desc.status !== 'active' ? statusChip(desc.status) : ''}</div>
    <div class="chat-body" id="chat-body">
      ${msgs
        .map(
          (m) =>
            `<div class="msg ${m.from}">${esc(m.text)}<span class="ts">${m.from === 'sys' ? '' : time(m.ts)}</span></div>`
        )
        .join('')}
    </div>
    <form class="chat-input-bar" id="chat-form" data-chat="${id}">
      <input id="chat-input" type="text" placeholder="Сообщение…" autocomplete="off" aria-label="Сообщение">
      <button class="send-btn brand-gradient" type="submit" aria-label="Отправить">${icon('send')}</button>
    </form>
  </div>`;
}

/* ================= Экспорт CSV ================= */

function exportCsv() {
  const rows = [['Точка', 'Регион', 'Статус', 'Выручка недели, ₽']];
  ownerPointsRows().forEach((r) => rows.push([r.name, r.region, r.status, r.revenueWeek]));
  const total = ownerPointsRows().reduce((s, r) => s + r.revenueWeek, 0);
  rows.push(['ИТОГО', '', '', total]);
  const csv = '\uFEFF' + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lovii-points-export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('Экспорт готов', 'CSV со всеми точками скачан');
}

/* ================= Обработчики форм и ролей ================= */

function handleApply(form) {
  const role = form.dataset.role;
  const val = (name) => (form.querySelector(`[name="${name}"]`) || {}).value || '';
  const m = roleMeta(role);

  if (role === 'store') {
    const name = val('name').trim() || 'Моя точка';
    state.roles.store = {
      point: {
        slug: 'my-point',
        name,
        address: val('address').trim() || 'Центр района',
        hours: val('hours').trim() || '09:00-21:00',
        about: val('about').trim() || 'Новая точка на витрине LOVII — товары к ужину и не только.',
        emoji: '🏪',
        color: 'pink',
        status: 'moderation',
        appliedAt: Date.now(),
      },
      goods: LOVII_DASH.storeGoodsSeed.map((g) => ({ ...g })),
    };
    moderationCheck(false);
    toast('Заявка отправлена', 'Точка на авто-модерации, ~8 секунд');
  } else {
    state.roles[role] = { appliedAt: Date.now(), name: val('name').trim() || LOVII_DASH.user.name, city: val('city') || 'Тверской' };
    toast('Заявка одобрена', `Роль «${m.title}» открыта`);
  }
  state.activeRole = role;
  persist();
  go('dash', 'index');
}

function handleCardSave(form) {
  const r = state.roles.store;
  if (!r || !r.point) return;
  const val = (name) => (form.querySelector(`[name="${name}"]`) || {}).value || '';
  r.point.name = val('name').trim() || r.point.name;
  r.point.address = val('address').trim() || r.point.address;
  r.point.hours = val('hours').trim() || r.point.hours;
  r.point.about = val('about').trim();
  syncUserStore();
  persist();
  toast('Карточка сохранена', 'Изменения уже на витрине района');
  go('dash', 'index');
}

function enterRole(role) {
  if (ROLE_LIST.includes(role) && !state.roles[role]) return;
  state.activeRole = role;
  persist();
  go('dash', 'index');
}

function exitRole() {
  state.activeRole = null;
  persist();
  go('profile');
}

function toggleFavorite(slug) {
  const i = state.favorites.indexOf(slug);
  if (i >= 0) state.favorites.splice(i, 1);
  else state.favorites.push(slug);
  persist();
  renderViewPreserveScroll();
  toast(i >= 0 ? 'Убрано из избранного' : 'Добавлено в избранное');
}

/* ================= Регистрация экранов ================= */

Object.assign(SCREENS, {
  profile: renderProfile,
  apply: renderApply,
  dash: renderDash,
  chat: renderChat,
});

