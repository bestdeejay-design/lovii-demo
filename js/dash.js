/**
 * LOVII Дашборды ролей — профиль, заявки, Store/Rep/Ambassador/Owner/Investor, чаты.
 * Подключается после screens.js (переиспользует esc/priceFmt/tileBg/catLabel/productCardHtml)
 * и до app.js (функции вызываются в рантайме: state, persist, go, toast, selectors).
 * Загружает: профиль (клиент) → заявки на роли → дашборды ролей. Всё демо, без авторизации.
 */

/* ================= Роли: доступ к состоянию ================= */

const ROLE_LIST = ['store', 'rep', 'amb'];

/* ================= Фильтры «Мои точки» (представитель) ================= */
let _repPtsFilter = 'all';   // 'all' | 'waiting' | 'active' | 'rejected'
let _repPtsSearch = '';
let _repPtsSort = 'name';    // 'name' | 'revenue' | 'status'

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
    <span class="dash-ava ${tileBg(m.color)}">${icon(m.icon || 'user')}</span>
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
    rep: [['index', 'Обзор'], ['connect', 'Подключение'], ['points', 'Точки'], ['income', 'Доход'], ['profile', 'Профиль'], ['chats', 'Чаты']],
    amb: [['index', 'Обзор'], ['reps', 'Представители'], ['income', 'Доход'], ['training', 'Обучение'], ['chats', 'Чаты']],
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
    lead: ['Лид', 'st-wait'],
    pending_rep: ['Ждёт представителя', 'st-mod'],
    catalog: ['В каталоге', 'st-active'],
    payment: ['Проверка платежа', 'st-wait'],
    ready: ['Готова к продажам', 'st-active'],
    offline: ['Offline', 'st-off'],
    // статусы заказа — метки из ядра OrderStatus::toBadge
    created: ['Создан', 'st-wait'], submitted: ['Отправлен', 'st-wait'], accepted: ['Принят', 'st-active'],
    preparing: ['Готовится', 'st-mod'], handed_to_delivery: ['Передан курьеру', 'st-mod'],
    on_the_way: ['В пути', 'st-mod'], completed: ['Доставлен', 'st-active'], cancelled: ['Отменён', 'st-off'], failed: ['Ошибка', 'st-off'],
  };
  const [label, cls] = map[status] || map.active;
  return `<span class="st-chip ${cls}">${status === 'active' ? '<span class="lv-dot" style="background:var(--lv-tiffany)"></span>' : ''}${label}</span>`;
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

/**
 * Профиль переехал в редизайн лояльности: LOVII PAY (js/club.js).
 * Старый «список функций» заменён структурой программы:
 * карта + счёт + история + уровни PAY→PASS→VIP + привилегии + избранные МСП.
 */
function renderProfile() {
  return renderPayProfile();
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
      : field('name', 'Как тебя зовут', 'Имя Фамилия') +
        `<label class="f-field"><span class="lb">Район работы</span>
          <select name="city">${LOVII_DATA.districts.map((d) => `<option>${esc(d.name)}</option>`).join('')}</select></label>` +
        (role === 'amb' ? `<label class="f-field"><span class="lb">Опыт (необязательно)</span><textarea name="about" placeholder="Расскажи коротко о своём опыте"></textarea></label>` : '');

  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="apply-head ${tileBg(m.color)}">
      <span class="ah-emoji">${icon('store')}</span>
      <div class="ah-mid">
        <div class="kicker">${esc(m.title)}</div>
        <h1>${esc(titles[role])}</h1>
      </div>
    </div>
    <form id="apply-form" data-role="${role}">
      ${fields}
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
  // Guard: роль есть, а карточки точки нет (старая схема в localStorage) —
  // вежливая заглушка вместо TypeError и пустого экрана. Только токены --lv-*.
  if (!r || !r.point) {
    return `
    <div class="empty">
      <div class="big-emoji">🏪</div>
      <h3>Выберите магазин</h3>
      <p>К панели не привязана торговая точка. Оформите заявку — и дашборд появится здесь.</p>
      <button class="cta-btn brand-gradient" data-go="apply:store">Оформить заявку на точку</button>
    </div>`;
  }
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
  `;

  if (tab === 'goods') {
    const goods = r.goods || [];
    const catalogChips = LOVII_DATA.products
      .filter((x) => !x.isService && !goods.some((g) => g.name === x.name))
      .slice(0, 10)
      .map((x) => `<button class="cat-chip" data-action="add-good" data-slug="${x.slug}"><span class="e">${icon('bag')}</span>${esc(x.name)}</button>`)
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
        <span class="ri-emoji ${tileBg('sand')}">${icon('bag')}</span>
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
  ${dashNote('Касса 54-ФЗ подключается к запуску — чеки формируются автоматически', 'gold')}
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

/* ================= Дашборды: Представитель и Амбассадор ================= */

const LOVII_MODEL = {
  repShare: 0.4,
  ambShare: 0.2,
  weeksInMonth: 4.33,
  tariffs: {
    start: { label: 'Лови Старт', rate: 0, sub: 0, note: '0 ₽ и 0% до 30 000 ₽' },
    basic: { label: 'Лови Базовый', rate: 0.1, sub: 0, note: '0 ₽/мес · 10%' },
    pro: { label: 'Лови Про', rate: 0.06, sub: 2990, note: '2 990 ₽/мес · 4–7%' },
  },
};

function tariffForPoint(slug, status) {
  const map = { daily: 'pro', sloyka: 'basic', flowers: 'pro', master: 'start', forno: 'start' };
  const id = status === 'waiting' ? 'start' : (map[slug] || 'basic');
  return { id, ...LOVII_MODEL.tariffs[id] };
}

function pointEconomics(weekRevenue, share, tariff) {
  const monthRevenue = Math.round(weekRevenue * LOVII_MODEL.weeksInMonth);
  const rateIncome = Math.round(monthRevenue * (tariff.rate || 0));
  const platformIncome = Math.round(rateIncome + (tariff.sub || 0));
  const roleIncome = Math.round(platformIncome * share);
  const aggregatorFeeMin = Math.round(monthRevenue * 0.25);
  const aggregatorFeeMax = Math.round(monthRevenue * 0.4);
  const savedVsAggregators = Math.max(0, aggregatorFeeMin - platformIncome);
  return { monthRevenue, platformIncome, roleIncome, weekIncome: Math.round(roleIncome / LOVII_MODEL.weeksInMonth), aggregatorFeeMin, aggregatorFeeMax, savedVsAggregators };
}

function repPointRows() {
  return LOVII_DASH.repPoints.map((rp) => {
    const st = selectors.storesRows().find((s) => s.slug === rp.slug) || selectors.storeBySlug(rp.slug);
    const tariff = tariffForPoint(rp.slug, rp.status);
    const econ = pointEconomics(rp.revenueWeek, LOVII_MODEL.repShare, tariff);
    return {
      ...rp,
      ...econ,
      tariff,
      name: st ? st.name : rp.slug,
      emoji: st ? st.emoji : '🏪',
      category: st ? catLabel(st.category) : 'Точка',
      address: st ? st.address : '',
      walk: st && st.walkMinutes != null ? st.walkMinutes : null,
      dist: st ? st.distance : '',
      rating: st ? st.rating : null,
      active: rp.status === 'active',
    };
  });
}

function repTotals() {
  const pts = repPointRows();
  const activePts = pts.filter((x) => x.status === 'active');
  const allWeekRevenue = activePts.reduce((s, x) => s + x.revenueWeek, 0);
  const monthRevenue = Math.round(allWeekRevenue * LOVII_MODEL.weeksInMonth);
  const platformIncome = activePts.reduce((s, x) => s + x.platformIncome, 0);
  const roleIncome = activePts.reduce((s, x) => s + x.roleIncome, 0);
  const orders = activePts.reduce((s, x) => s + x.orders, 0);
  const views = activePts.reduce((s, x) => s + x.views, 0);
  const conv = views ? (orders / views) * 100 : 0;
  return { pts, activePts, allWeekRevenue, monthRevenue, platformIncome, roleIncome, orders, views, conv };
}

function repRankInfo(pointsCount, cities = 1, monthRevenue = 0) {
  if (cities >= 3 && pointsCount >= 90 && monthRevenue >= 15000000) {
    return { emoji: '👑', title: 'Цифровой Губернатор', next: 'Максимальный статус', progress: 100, hint: '3+ города · 90+ точек · 15 млн ₽/мес' };
  }
  if (pointsCount >= 30) {
    const govProgress = Math.min(100, Math.round(Math.min(pointsCount / 90, cities / 3, monthRevenue / 15000000) * 100));
    return { emoji: '🥇', title: 'Цифровой Мэр', next: 'Губернатор', progress: govProgress, hint: `${pointsCount}/90 точек · ${cities}/3 города · ${moneyFmt(monthRevenue)}/15 млн ₽` };
  }
  return { emoji: '🥈', title: 'Цифровой Представитель', next: 'Мэр', progress: Math.round((pointsCount / 30) * 100), hint: `${pointsCount}/30 точек до статуса «Мэр»` };
}

function rankCardHtml(rank, tone = 'tiffany') {
  return `
  <div class="rank-card tone-${tone}">
    <div class="rank-top">
      <span class="rank-emoji">${icon('award')}</span>
      <div><div class="rank-kicker">Текущий статус</div><div class="rank-title">${esc(rank.title)}</div></div>
    </div>
    <div class="progress"><span style="width:${Math.max(6, Math.min(100, rank.progress))}%"></span></div>
    <div class="rank-foot"><span>Следующий: ${esc(rank.next)}</span><b>${esc(rank.hint)}</b></div>
  </div>`;
}

function payoutRowsHtml(seed, total, roleLabel) {
  const series = seededSeries(seed, 6, total * 0.16, total * 0.28);
  const labels = ['май', 'июн', 'июл', 'авг', 'сен', 'окт'];
  return `
  <div class="list-card">
    ${series.map((v, i) => `
    <div class="fin-row ${i === series.length - 1 ? 'ok' : ''}">
      <span class="l">${labels[i]} · ${roleLabel}</span>
      <span class="v">${i === series.length - 1 ? '+' : ''}${moneyFmt(v)}</span>
    </div>`).join('')}
  </div>`;
}

function revenueModelNote(role) {
  const share = role === 'rep' ? 'доля представителя по партнёрской модели' : 'доля амбасадора за обучение и мотивацию сети';
  return dashNote(`Тарифы: «Старт» 0 ₽ и 0% до 30 000 ₽, «Базовый» 10%, «Про» 2 990 ₽/мес и 4–7%. Платёж расщепляется автоматически: 90% — точке. В кабинете показана ${share}.`, 'gold');
}

function codeCardHtml(title, code, desc, tone = 'pink') {
  return `
  <div class="code-card tone-${tone}">
    <div class="kicker">${esc(title)}</div>
    <div class="code">${esc(code)}</div>
    <p>${esc(desc)}</p>
  </div>`;
}

function _repPtsFiltered(pts) {
  let f = pts;
  if (_repPtsFilter !== 'all') f = f.filter((x) => x.status === _repPtsFilter);
  if (_repPtsSearch) {
    const q = _repPtsSearch.toLowerCase();
    f = f.filter((x) => x.name.toLowerCase().includes(q) || x.category.toLowerCase().includes(q));
  }
  const cmp = _repPtsSort === 'revenue'
    ? (a, b) => b.revenueWeek - a.revenueWeek
    : _repPtsSort === 'status'
      ? (a, b) => a.status.localeCompare(b.status)
      : (a, b) => a.name.localeCompare(b.name);
  return [...f].sort(cmp);
}

function _repPtsListHtml(pts) {
  const filtered = _repPtsFiltered(pts);
  if (!filtered.length) return `<div class="list-card"><div style="text-align:center;padding:32px 16px;color:var(--lv-dim)"><div style="font-size:32px;margin-bottom:8px">🔍</div><div style="font-size:14px;font-weight:600">Нет точек по фильтру</div></div></div>`;
  return `<div class="list-card">${filtered.map((x) => `
      <div class="row-item">
        <span class="ri-emoji ${tileBg(x.active ? 'tiffany' : 'sand')}">${icon('bag')}</span>
        <div class="ri-mid">
          <div class="nm">${esc(x.name)}${statusChip(x.status)}</div>
          <div class="sb">${esc(x.category)} · ${esc(x.tariff.label)}${x.walk != null ? ' · ' + icon('footprints') + ' ' + x.walk + ' мин' : ''}${x.rating ? ' · ★ ' + x.rating : ''}</div>
        </div>
        <div class="ri-right"><div class="v">${x.active ? moneyFmt(x.revenueWeek) : '—'}</div><span class="sb">GMV/нед.</span></div>
        ${x.status !== 'waiting' ? `<button class="chev-btn" data-go="store:${x.slug}" aria-label="Открыть точку">${icon('chev-right')}</button>` : ''}
      </div>`).join('')}</div>`;
}

function _repPtsChipsHtml(pts) {
  const cnt = (s) => pts.filter((x) => x.status === s).length;
  return [
    ['all', 'Все', pts.length],
    ['waiting', 'Ожидание', cnt('waiting')],
    ['active', 'Активные', cnt('active')],
    ['rejected', 'Отклонено', cnt('rejected')],
  ].map(([key, label, n]) =>
    `<button class="tab-btn ${_repPtsFilter === key ? 'active' : ''}" onclick="_repPtsFilter='${key}';_repPtsRefresh()">${label} <span class="tab-unread">${n}</span></button>`
  ).join('');
}

function _repPtsSortHtml() {
  return [
    ['name', 'По названию'],
    ['revenue', 'По доходу'],
    ['status', 'По статусу'],
  ].map(([key, label]) =>
    `<button class="sort-btn ${_repPtsSort === key ? 'active' : ''}" onclick="_repPtsSort='${key}';_repPtsRefresh()">${label}</button>`
  ).join(' ');
}

function _repPtsRefresh() {
  const totals = repTotals();
  const list = document.getElementById('rep-points-list');
  const chips = document.getElementById('rep-points-chips');
  const sort = document.getElementById('rep-points-sort');
  if (list) list.innerHTML = _repPtsListHtml(totals.pts);
  if (chips) chips.innerHTML = _repPtsChipsHtml(totals.pts);
  if (sort) sort.innerHTML = _repPtsSortHtml();
}

function renderRepDash(tab) {
  const profile = state.roles.rep || {};
  const city = profile.city || state.district;
  const head = dashHeadHtml('rep', `${esc(city)} · подключение и поддержка точек`);
  const tabs = dashTabsHtml('rep', tab);
  if (tab === 'chats') return chatListHtml('rep', head, tabs, 'Чаты с точками');
  if (tab === 'connect') return renderRepConnectDash(head, tabs);

  const totals = repTotals();
  const rank = repRankInfo(totals.activePts.length, 1, totals.monthRevenue);
  const top = [...totals.activePts].sort((a, b) => b.revenueWeek - a.revenueWeek).map((x) => ({ label: x.name, emoji: x.emoji, value: x.revenueWeek }));

  if (tab === 'points') {
    const pipeline = totals.pts.filter((x) => x.status !== 'active');
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Мои точки<span class="sub"> · ${totals.pts.length}</span></h2><button class="link-btn" data-go="search">${icon('search')}Найти</button></div>
    <div id="rep-points-chips" class="chips-row">${_repPtsChipsHtml(totals.pts)}</div>
    <div style="padding:8px 16px 4px">
      <div class="search-bar">${icon('search')}<input id="rep-points-search" type="text" placeholder="Поиск по названию или категории…" value="${esc(_repPtsSearch)}" oninput="_repPtsSearch=this.value;_repPtsRefresh()"></div>
    </div>
    <div id="rep-points-sort" style="display:flex;gap:8px;padding:8px 16px 2px;overflow-x:auto">${_repPtsSortHtml()}</div>
    <div id="rep-points-list" style="margin-top:8px">${_repPtsListHtml(totals.pts)}</div>
    <div class="section-head" style="margin-top:20px"><h2>Воронка подключения</h2></div>
    <div class="timeline-card">
      <div class="tl-item done"><b>Лид найден</b><span>7 точек в районе подходят по категории</span></div>
      <div class="tl-item done"><b>Презентация</b><span>2 владельца посмотрели условия</span></div>
      <div class="tl-item active"><b>Документы</b><span>${pipeline.length || 1} точка в подключении</span></div>
      <div class="tl-item"><b>Запуск витрины</b><span>товары, фото, касса и первая акция</span></div>
    </div>
    ${codeCardHtml('Код представителя', 'REP-' + city.slice(0, 3).toUpperCase() + '-042', 'Передайте код новой точке — она закрепится за вашей локацией.', 'tiffany')}`;
  }

  if (tab === 'income') {
    const incomeByPoint = totals.activePts.map((x) => ({ label: x.name, emoji: x.emoji, value: x.roleIncome }));
    const avgIncome = Math.round(totals.roleIncome / Math.max(1, totals.activePts.length));
    const catEmojiMap = {};
    CATS.forEach(c => { catEmojiMap[c.label] = c.emoji; });
    const catMap = {};
    totals.activePts.forEach(p => { const c = p.category || 'Другое'; catMap[c] = (catMap[c] || 0) + p.roleIncome; });
    const incomeByCategory = Object.entries(catMap)
      .map(([label, value]) => ({ label, emoji: catEmojiMap[label] || '📊', value }))
      .sort((a, b) => b.value - a.value);
    return `
    ${head}${tabs}
    <div class="kpi-grid">
      ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: 12, accent: true })}
      ${kpiCard('Средний доход/точка', moneyFmt(avgIncome), { tone: 'tiffany', spark: sparkSvg(seededSeries('rep-avg-inc', 7, 40000, 80000), 'tiffany') })}
      ${kpiCard('Активные точки', `${totals.activePts.length}`, { tone: 'tiffany', spark: sparkSvg(seededSeries('rep-kpi', 7, 2, 4), 'tiffany') })}
      ${kpiCard('Ближайшая выплата', moneyFmt(totals.roleIncome * 0.46), { tone: 'pink' })}
    </div>
    ${revenueModelNote('rep')}
    ${chartCard('Доход представителя', '6 месяцев, ₽', areaChart({ data: seededSeries('rep-income-6m', 6, 58000, 182000), labels: ['май','июн','июл','авг','сен','окт'], tone: 'tiffany', height: 155 }))}
    <div class="section-head" style="margin-top:20px"><h2>Доход по категориям</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByCategory, { emojiKey: true })}</div>
    <div class="section-head" style="margin-top:20px"><h2>Доход по точкам</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByPoint, { emojiKey: true })}</div>
    <div class="section-head" style="margin-top:20px"><h2>История выплат</h2></div>
    ${payoutRowsHtml('rep-payouts', totals.roleIncome, 'выплата на карту')}`;
  }

  if (tab === 'profile') {
    return `
    ${head}${tabs}
    ${rankCardHtml(rank, 'tiffany')}
    ${codeCardHtml('Код для точек', 'REP-' + city.slice(0, 3).toUpperCase() + '-042', 'Новые партнёры вводят код при подключении. Так система закрепляет точку и доход за представителем.', 'tiffany')}
    <div class="list-card">
      <div class="fin-row"><span class="l">Имя</span><span class="v">${esc(profile.name || LOVII_DASH.user.name)}</span></div>
      <div class="fin-row"><span class="l">Локация</span><span class="v">${esc(city)}</span></div>
      <div class="fin-row"><span class="l">Активные точки</span><span class="v">${totals.activePts.length}</span></div>
      <div class="fin-row"><span class="l">План до «Мэра»</span><span class="v">${Math.max(0, 30 - totals.activePts.length)} точек</span></div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Привилегии статуса</h2></div>
    <div class="chips-row no-scrollbar">
      <span class="tab-btn active">обучение</span><span class="tab-btn active">чат с точками</span><span class="tab-btn active">приоритетные лиды</span><span class="tab-btn active">бейдж в сети</span>
    </div>`;
  }

  const pendingCount = totals.pts.filter((x) => x.status !== 'active').length;
  const toMayor = Math.max(0, 30 - totals.activePts.length);
  return `
  ${head}${tabs}
  ${rankCardHtml(rank, 'tiffany')}
  <div class="kpi-grid">
    ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: 12, accent: true })}
    ${kpiCard('Активные точки', `${totals.activePts.length} / ${totals.pts.length}`, { spark: sparkSvg(seededSeries('rep-kpi', 7, 3, 5), 'tiffany') })}
    ${kpiCard('Конверсия заказов', totals.conv.toFixed(1) + '%', { delta: 0.8, tone: 'gold' })}
    ${kpiCard('GMV сети · месяц', moneyFmt(totals.monthRevenue), { delta: 9, tone: 'pink' })}
  </div>
  <div class="next-step-card" data-action="dash-tab" data-val="connect" role="button" tabindex="0">
    <span class="ns-icon">${pendingCount > 0 ? '🔔' : '🚀'}</span>
    <div class="ns-body">
      <div class="ns-title">${pendingCount > 0 ? `${pendingCount} ${pendingCount === 1 ? 'заявка' : 'заявки'} в очереди — апрувь их сейчас` : `Покажи QR ещё ${toMayor} ${toMayor === 1 ? 'точке' : 'точкам'} до статуса «Мэр»`}</div>
      <div class="ns-desc">${pendingCount > 0 ? 'Подтверждение заявок ускорит рост сети' : 'Каждая подключённая точка приближает к новому статусу'}</div>
    </div>
    <span class="ns-arrow">${icon('chev-right')}</span>
  </div>
  ${chartCard('Выручка точек по дням', 'неделя, ₽', barsChart({ data: seededSeries('rep-week', 7, 18000, 96000), labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], tone: 'tiffany', height: 130 }))}
  <div class="section-head" style="margin-top:20px"><h2>Топ точек по GMV</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top, { emojiKey: true })}</div>
  <div class="quick-actions-grid">
    <button class="quick-action-card" data-action="dash-tab" data-val="connect">
      <span class="qa-icon">${icon('smartphone')}</span>
      <span class="qa-title">QR-подключение</span>
      <span class="qa-desc">Подключить новую точку</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="points">
      <span class="qa-icon">${icon('store')}</span>
      <span class="qa-title">Точки</span>
      <span class="qa-desc">Управлять ${totals.pts.length} ${totals.pts.length === 1 ? 'точкой' : 'точками'}</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="income">
      <span class="qa-icon">${icon('wallet')}</span>
      <span class="qa-title">Доход</span>
      <span class="qa-desc">${moneyFmt(totals.roleIncome)} в этом месяце</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="chats">
      <span class="qa-icon">${icon('message')}</span>
      <span class="qa-title">Чаты${unreadTotal('rep') ? ` <span class="qa-badge">${unreadTotal('rep')}</span>` : ''}</span>
      <span class="qa-desc">${unreadTotal('rep') ? `${unreadTotal('rep')} непрочитанных` : 'Все прочитаны'}</span>
    </button>
  </div>`;
}

/* ================= Дашборд: Амбассадор ================= */

function ambRepRows() {
  return LOVII_DASH.ambReps.map((r) => {
    const weekRevenue = r.revenueWeek;
    const monthRevenue = Math.round(weekRevenue * LOVII_MODEL.weeksInMonth);
    const platformIncome = Math.round(r.points.reduce((sum, slug) => {
      const tariff = tariffForPoint(slug, 'active');
      return sum + (monthRevenue / Math.max(1, r.points.length)) * tariff.rate + tariff.sub;
    }, 0));
    const roleIncome = Math.round(platformIncome * LOVII_MODEL.ambShare);
    return {
      ...r,
      monthRevenue,
      platformIncome,
      roleIncome,
      pointsNames: r.points.map((s) => selectors.storeBySlug(s)).filter(Boolean),
    };
  });
}

function ambTotals() {
  const reps = ambRepRows();
  const weekRevenue = reps.reduce((s, r) => s + r.revenueWeek, 0);
  const monthRevenue = reps.reduce((s, r) => s + r.monthRevenue, 0);
  const totalPoints = reps.reduce((s, r) => s + r.points.length, 0);
  const platformIncome = reps.reduce((s, r) => s + r.platformIncome, 0);
  const roleIncome = reps.reduce((s, r) => s + r.roleIncome, 0);
  const avgGrowth = reps.reduce((s, r) => s + r.growth, 0) / Math.max(1, reps.length);
  return { reps, weekRevenue, monthRevenue, totalPoints, platformIncome, roleIncome, avgGrowth };
}

function renderAmbTree(reps, totalPoints, totalRev) {
  return `
  <div class="tree">
    <div class="tree-row root">
      <span class="t-emoji ${tileBg('gold')}">🚀</span>
      <div class="ri-mid"><div class="nm">Ты · амбасадор</div><div class="sb">${reps.length} представителя · ${totalPoints} точки</div></div>
      <div class="ri-right"><div class="v">${moneyFmt(totalRev)}</div><span class="sb">GMV/нед.</span></div>
    </div>
    <div class="tree-kids">
      ${reps.map((r) => `
      <div class="tree-row">
        <span class="t-emoji ${tileBg('tiffany')}">🤝</span>
        <div class="ri-mid">
          <div class="nm">${esc(r.name)}</div>
          <div class="sb">${esc(r.city)} · ${r.points.length} точки · доход ${moneyFmt(r.roleIncome)}/мес</div>
        </div>
        <div class="ri-right"><div class="v">${moneyFmt(r.revenueWeek)}</div>${deltaHtml(r.growth)}</div>
      </div>
      <div class="tree-kids">
        ${r.pointsNames.map((s) => `
        <div class="tree-row leaf">
          <span class="t-emoji ${tileBg('sand')}">${icon('store')}</span>
          <div class="ri-mid"><div class="nm">${esc(s.name)}</div><div class="sb">${esc(catLabel(s.category))}</div></div>
          <button class="chev-btn" data-go="store:${s.slug}">${icon('chev-right')}</button>
        </div>`).join('')}
      </div>`).join('')}
    </div>
  </div>`;
}

function renderAmbDash(tab) {
  const profile = state.roles.amb || {};
  const city = profile.city || state.district;
  const head = dashHeadHtml('amb', `${esc(city)} · развитие представителей`);
  const tabs = dashTabsHtml('amb', tab);
  if (tab === 'chats') return chatListHtml('amb', head, tabs, 'Чаты с представителями');

  const totals = ambTotals();
  const top = [...totals.reps].sort((a, b) => b.revenueWeek - a.revenueWeek).map((r) => ({ label: r.name, value: r.revenueWeek }));

  if (tab === 'reps') {
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Мои представители<span class="sub"> · ${totals.reps.length}</span></h2></div>
    <div class="list-card">
      ${totals.reps.map((r) => `
      <button class="row-item as-btn" data-go="chat:r-${r.id}">
        <span class="ri-emoji ${tileBg('tiffany')}">🤝</span>
        <div class="ri-mid">
          <div class="nm">${esc(r.name)}${deltaHtml(r.growth)}</div>
          <div class="sb">${esc(r.city)} · ${r.points.length} точки · ${r.pointsNames.map((s) => esc(s.name)).join(', ')}</div>
        </div>
        <div class="ri-right"><div class="v">${moneyFmt(r.roleIncome)}</div><span class="sb">доход/мес</span></div>
        ${icon('chev-right', 'chev')}
      </button>`).join('')}
    </div>
    ${codeCardHtml('Код амбасадора', 'AMB-' + city.slice(0, 3).toUpperCase() + '-777', 'Представитель вводит этот код — и попадает в вашу структуру обучения и мотивации.', 'gold')}
    <div class="section-head" style="margin-top:20px"><h2>Структура</h2></div>
    ${renderAmbTree(totals.reps, totals.totalPoints, totals.weekRevenue)}`;
  }

  if (tab === 'income') {
    const incomeByRep = totals.reps.map((r) => ({ label: r.name, value: r.roleIncome }));
    return `
    ${head}${tabs}
    <div class="kpi-grid">
      ${kpiCard('Доход амбасадора · месяц', moneyFmt(totals.roleIncome), { delta: totals.avgGrowth, accent: true })}
      ${kpiCard('Доход LOVII сети', moneyFmt(totals.platformIncome), { tone: 'gold' })}
      ${kpiCard('Средний доход/предст.', moneyFmt(totals.roleIncome / Math.max(1, totals.reps.length)), { tone: 'tiffany' })}
      ${kpiCard('GMV структуры · месяц', moneyFmt(totals.monthRevenue), { delta: 10, tone: 'pink' })}
    </div>
    ${revenueModelNote('amb')}
    ${chartCard('Доход амбасадора', '6 месяцев, ₽', areaChart({ data: seededSeries('amb-income-6m', 6, 76000, 226000), labels: ['май','июн','июл','авг','сен','окт'], tone: 'gold', height: 155 }))}
    <div class="section-head" style="margin-top:20px"><h2>Доход по представителям</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByRep)}</div>
    <div class="section-head" style="margin-top:20px"><h2>История выплат</h2></div>
    ${payoutRowsHtml('amb-payouts', totals.roleIncome, 'кураторская выплата')}`;
  }

  if (tab === 'training') {
    const lessons = [
      { id: 1, emoji: '🎯', title: 'Как объяснить ценность LOVII точке', sub: 'Скрипт первой встречи и возражения', pct: 100, dur: '~15 мин' },
      { id: 2, emoji: '🚀', title: 'Запуск представителя за 7 дней', sub: 'План: районы, лиды, CRM, первые сделки', pct: 74, dur: '~25 мин' },
      { id: 3, emoji: '💡', title: 'Мотивация и контроль качества', sub: 'Еженедельные ритуалы структуры', pct: 48, dur: '~20 мин' },
      { id: 4, emoji: '📊', title: 'Финмодель и статусы', sub: 'Сплит 40/40/20, Мэр и Губернатор', pct: 32, dur: '~18 мин' },
    ];
    const doneCount = lessons.filter(l => l.pct === 100).length;
    const totalLessons = lessons.length;
    const overallPct = Math.round(lessons.reduce((s, l) => s + l.pct, 0) / totalLessons);
    const statusLabel = (p) => p === 100 ? 'Пройдено' : p > 0 ? 'В процессе' : 'Начать';
    const statusCls = (p) => p === 100 ? 'done' : p > 0 ? 'active' : 'pending';
    return `
    ${head}${tabs}
    <div class="mentor-card ink-gradient">
      <div class="kicker">Обучающий трек амбасадора</div>
      <div class="big">Осваивайте инструменты и запускайте точку</div>
      <p>Проходите уроки, применяйте скрипты и шаблоны — каждый шаг приближает вас к первому подключению.</p>
    </div>
    <div class="progress-summary-card">
      <div class="ps-ring">
        <svg viewBox="0 0 56 56" class="progress-ring-svg">
          <circle cx="28" cy="28" r="24" fill="none" stroke="var(--lv-surface)" stroke-width="5"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke="url(#pgGrad)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${overallPct * 1.508} 150.8" transform="rotate(-90 28 28)"/>
          <defs><linearGradient id="pgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0abab5"/><stop offset="100%" stop-color="#f64a8a"/></linearGradient></defs>
        </svg>
        <span class="ps-pct">${overallPct}%</span>
      </div>
      <div class="ps-body">
        <div class="ps-title">Пройдено ${doneCount} из ${totalLessons} уроков</div>
        <div class="ps-sub">${overallPct}% обученности · ${lessons.filter(l => l.pct > 0 && l.pct < 100).length} в процессе</div>
        <div class="progress" style="margin-top:10px"><span style="width:${overallPct}%"></span></div>
      </div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Уроки</h2></div>
    <div class="list-card">
      ${lessons.map((l) => `
      <div class="row-item lesson-row">
        <span class="ri-emoji ${tileBg('gold')}">${icon('bag')}</span>
        <div class="ri-mid">
          <div class="nm">${esc(l.title)}</div>
          <div class="sb">Урок ${l.id} · ${esc(l.sub)}</div>
          <div class="lesson-meta"><span class="lesson-dur">${l.dur}</span><div class="mini-progress"><span style="width:${l.pct}%"></span></div><span class="lesson-pct">${l.pct}%</span></div>
        </div>
        <span class="lesson-status ${statusCls(l.pct)}">${statusLabel(l.pct)}</span>
      </div>`).join('')}
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Инструменты</h2></div>
    <div class="quick-actions-grid" style="padding-top:0">
      <div class="tool-card">
        <span class="tc-icon ${tileBg('pink')}">📝</span>
        <div class="tc-title">Скрипт продаж</div>
        <div class="tc-desc">Готовый сценарий разговора с точкой, возражения и ответы</div>
      </div>
      <div class="tool-card">
        <span class="tc-icon ${tileBg('tiffany')}">📋</span>
        <div class="tc-title">Шаблоны документов</div>
        <div class="tc-desc">Договор, акт, прайс — все бланки в одном месте</div>
      </div>
      <div class="tool-card">
        <span class="tc-icon ${tileBg('gold')}">🧮</span>
        <div class="tc-title">Калькулятор дохода</div>
        <div class="tc-desc">Рассчитайте заработок представителя и амбасадора</div>
      </div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>План недели</h2></div>
    <div class="timeline-card">
      <div class="tl-item done"><b>Пн · Разбор цифр</b><span>доход, активные точки, проблемные категории</span></div>
      <div class="tl-item active"><b>Ср · Созвон структуры</b><span>помочь с возражениями и документами</span></div>
      <div class="tl-item"><b>Пт · Новые лиды</b><span>выдать коды представителям и зафиксировать план</span></div>
    </div>`;
  }

  const needsHelp = Math.min(totals.reps.length, 2);
  return `
  ${head}${tabs}
  <div class="kpi-grid">
    ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: totals.avgGrowth, accent: true })}
    ${kpiCard('Представители', String(totals.reps.length), { spark: sparkSvg(seededSeries('amb-reps', 6, 2, 4), 'tiffany') })}
    ${kpiCard('Точки в структуре', String(totals.totalPoints), { tone: 'gold' })}
    ${kpiCard('GMV структуры · месяц', moneyFmt(totals.monthRevenue), { delta: 10, tone: 'pink' })}
  </div>
  <div class="next-step-card gold" data-action="dash-tab" data-val="training" role="button" tabindex="0">
    <span class="ns-icon">📞</span>
    <div class="ns-body">
      <div class="ns-title">Проведи созвон с структурой — ${needsHelp} ${needsHelp === 1 ? 'представитель нуждается' : 'представителя нуждаются'} в помощи</div>
      <div class="ns-desc">Обзор обученности и точек ускорит рост сети</div>
    </div>
    <span class="ns-arrow">${icon('chev-right')}</span>
  </div>
  <div class="section-head" style="margin-top:20px"><h2>Моя структура</h2></div>
  ${renderAmbTree(totals.reps, totals.totalPoints, totals.weekRevenue)}
  <div class="section-head" style="margin-top:20px"><h2>Топ представителей</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top)}</div>
  ${chartCard('Рост структуры', '6 месяцев, тыс ₽', areaChart({ data: seededSeries('amb-6m', 6, 380, 900), labels: ['апр', 'май', 'июн', 'июл', 'авг', 'сен'], tone: 'gold', height: 140 }))}
  <div class="quick-actions-grid">
    <button class="quick-action-card" data-action="dash-tab" data-val="reps">
      <span class="qa-icon">${icon('users')}</span>
      <span class="qa-title">Представители</span>
      <span class="qa-desc">${totals.reps.length} ${totals.reps.length === 1 ? 'представитель в структуре' : 'представителя в структуре'}</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="training">
      <span class="qa-icon">${icon('network')}</span>
      <span class="qa-title">Обучение</span>
      <span class="qa-desc">4 урока, 64% пройдено</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="income">
      <span class="qa-icon">${icon('wallet')}</span>
      <span class="qa-title">Доход</span>
      <span class="qa-desc">${moneyFmt(totals.roleIncome)} в этом месяце</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="chats">
      <span class="qa-icon">${icon('message')}</span>
      <span class="qa-title">Чаты${unreadTotal('amb') ? ` <span class="qa-badge">${unreadTotal('amb')}</span>` : ''}</span>
      <span class="qa-desc">${unreadTotal('amb') ? `${unreadTotal('amb')} непрочитанных` : 'Все прочитаны'}</span>
    </button>
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
    ${dashNote('Комиссия 10% с оборота + подписка точек, выплаты представителям 4% от оборота', 'gold')}`;
  }

  if (tab === 'structure') {
    const totalRev = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.reduce((x, r) => x + r.rev, 0), 0);
    const totalReps = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.length, 0);
    const totalPoints = LOVII_DASH.ambassadors.reduce((s, a) => s + a.reps.reduce((x, r) => x + r.points, 0), 0);
    return `
    ${head}${tabs}
    <div class="kpi-grid">
      ${kpiCard('Амбассадоры', String(LOVII_DASH.ambassadors.length), { accent: true })}
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
    ${kpiCard('Амбассадоры', String(LOVII_DASH.ambassadors.length), { tone: 'gold' })}
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
      <span class="ri-emoji ${tileBg('sand')}">${icon('store')}</span>
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
        <span class="ri-emoji ${tileBg('pink')}">${icon('store')}</span>
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
    ${dashNote('Прогноз: экстраполяция текущего роста оборота ~11% в месяц', 'tiffany')}`;
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
        <span class="ri-emoji ${tileBg(role === 'rep' ? 'tiffany' : 'gold')}">${icon('message')}</span>
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
    <div class="chat-sub">${icon('message')} ${esc(desc.sub)}${desc.status && desc.status !== 'active' ? statusChip(desc.status) : ''}</div>
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


/* ================= QR-сценарий подключения торговой точки ================= */

function repInviteCode() {
  const profile = state.roles.rep || {};
  const city = (profile.city || state.district || 'Район').replace(/[^А-Яа-яA-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'LOC';
  return 'REP-' + city + '-042';
}

function ensureMspLead() {
  if (state.mspLead) return state.mspLead;
  // Демо-сид (как ensurePay/ensureChats): точка уже зарегистрирована, чтобы кабинет МСП
  // и экран «Заказы» открывались по прямой ссылке. Живой сценарий по QR остаётся: #/msp-signup/<код>.
  state.mspLead = {
    repCode: 'PP7K2A',
    inn: '7705123456',
    legalName: 'ООО «НОВЫЙ ВКУС»',
    channel: 'Telegram',
    createdAt: Date.now(),
    point: { slug: 'demo-point', name: 'Пекарня на Садовой', status: 'pending_rep', address: 'Садовая 12',
      category: 'bakery', color: 'pink', about: 'Свежая выпечка и кофе у метро', hours: '08:00–21:00' },
    goods: [],
  };
  persist();
  return state.mspLead;
}

function mspPointVisible(status) {
  return ['catalog', 'payment', 'ready'].includes(status);
}

function syncMspStore() {
  const lead = state.mspLead;
  if (!lead || !lead.point || !mspPointVisible(lead.point.status)) return;
  const p = lead.point;
  const d = selectors.districtObj();
  const existing = LOVII_DATA.stores.find((s) => s.slug === p.slug);
  const payload = {
    slug: p.slug,
    name: p.name,
    category: p.category || 'grocery',
    emoji: p.emoji || '🏪',
    color: p.color || 'tiffany',
    rating: p.status === 'ready' ? 4.9 : 5.0,
    reviews: p.status === 'ready' ? 12 : 0,
    address: p.address,
    lat: d.lat + 0.0016,
    lng: d.lng - 0.0011,
    hours: p.hours || '09:00-21:00',
    about: p.about || 'Новая точка района в каталоге LOVII.',
    tags: p.status === 'ready' ? ['pickup', 'delivery', 'new'] : ['new'],
    isService: false,
  };
  if (existing) Object.assign(existing, payload);
  else LOVII_DATA.stores.push(payload);

  if (p.status === 'ready') {
    (lead.goods || []).forEach((g) => {
      const slug = 'msp-' + g.slug;
      const found = LOVII_DATA.products.find((x) => x.slug === slug);
      const prod = {
        slug,
        name: g.name,
        description: `Товар точки «${p.name}». Доступен в районе через LOVII.`,
        emoji: g.emoji,
        category: p.category || 'grocery',
        unit: g.unit,
        price: g.price,
        badge: 'new',
        avail: [[p.slug, g.stock, 0]],
      };
      if (found) Object.assign(found, prod);
      else LOVII_DATA.products.push(prod);
    });
  }
}

function qrGridHtml() {
  const cells = Array.from({ length: 121 }, (_, i) => {
    const x = i % 11, y = Math.floor(i / 11);
    const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    const data = ((x * 7 + y * 11 + x * y) % 5 === 0) || ((x + y) % 7 === 0);
    return `<span class="${finder || data ? 'on' : ''}"></span>`;
  }).join('');
  return `<div class="qr-grid" aria-label="Демо QR-код">${cells}</div>`;
}

function repMspApplicationHtml() {
  const lead = ensureMspLead();
  if (!lead) {
    return `<div class="empty-state-card">
      <div class="big-emoji">📭</div>
      <h3>Очередь заявок пуста</h3>
      <p>Покажите QR владельцу точки. После ввода ИНН и карточки точки заявка появится здесь.</p>
      <button class="cta-btn brand-gradient" data-go="msp-signup:${repInviteCode()}">Смоделировать скан QR</button>
    </div>`;
  }
  const p = lead.point;
  const hasPoint = !!p;
  return `
  <div class="approval-card">
    <div class="approval-head">
      <span class="ri-emoji ${tileBg(hasPoint && p.status !== 'pending_rep' ? 'tiffany' : 'gold')}">${hasPoint ? p.emoji : '🧾'}</span>
      <div class="ri-mid">
        <div class="nm">${hasPoint ? esc(p.name) : 'МСП зарегистрировано'}${statusChip(hasPoint ? p.status : 'lead')}</div>
        <div class="sb">ИНН ${esc(lead.inn)} · код ${esc(lead.repCode)}</div>
      </div>
    </div>
    <div class="review-grid">
      <div><span>Юрлицо</span><b>${esc(lead.legalName || 'будет уточнено в заявке')}</b></div>
      <div><span>Канал</span><b>${esc(lead.channel || 'ещё не выбран')}</b></div>
      <div><span>Адрес</span><b>${hasPoint ? esc(p.address) : 'точка ещё не добавлена'}</b></div>
      <div><span>Описание</span><b>${hasPoint ? esc(p.about) : 'ждём карточку точки'}</b></div>
    </div>
    ${hasPoint && p.status === 'pending_rep' ? `<div class="approval-actions"><button class="cta-btn brand-gradient" data-action="approve-msp-point">Апрув: показать в каталоге</button><button class="ghost-btn" data-action="return-msp-point">Вернуть на правку</button></div>` : `<div class="approval-actions"><button class="ghost-btn" data-go="msp">Открыть экран МСП</button></div>`}
  </div>`;
}

/* Статусы заявки — по канону artifacts/roles-screens-spec.md §Статусы заявки (stepper).
   Система: PartnerApplicationStatus (draft → submitted → awaiting_rep_approval →
   invoice_issued → awaiting_payment → verifying → verified | failed | expired).
   Каждый шаг: свой статус, подсказка «что дальше» и состояние витрины. */
const MSP_APP_ALL = [
  { id: 'draft', label: 'ИНН и карточка', hint: 'Заполните ИНН и карточку точки — это форма заявки', storefront: 'hidden' },
  { id: 'submitted', label: 'Заявка отправлена', hint: 'Заявка отправлена, ждём апрув представителя', storefront: 'hidden' },
  { id: 'awaiting_rep_approval', label: 'Проверяет представитель', hint: 'Представитель проверяет карточку точки', storefront: 'hidden' },
  { id: 'invoice_issued', label: 'Счёт выставлен', hint: 'Счёт 1 ₽, код VER-* — оплатите с расчётного счёта компании', storefront: 'teaser' },
  { id: 'awaiting_payment', label: 'Ожидаем платёж', hint: 'Платёж 1 ₽ по коду VER-* ещё не поступил', storefront: 'teaser' },
  { id: 'verifying', label: 'Проверяем платёж', hint: 'Платёж получен, проверяем реквизиты компании', storefront: 'teaser' },
  { id: 'verified', label: 'Продажи включены', hint: 'Всё готово — каталог открыт, заказы идут', storefront: 'active' },
  { id: 'failed', label: 'Заявка не прошла', hint: 'Проверка не пройдена — исправьте карточку точки и отправьте снова', storefront: 'hidden' },
  { id: 'expired', label: 'Срок истёк', hint: 'Срок заявки истёк — создайте новую, прогресс сохранится', storefront: 'hidden' },
];

const MSP_APP_STEPS = [
  { id: 'draft', label: 'ИНН и карточка', hint: 'Заполните ИНН и карточку точки', storefront: 'hidden' },
  { id: 'submitted', label: 'Заявка отправлена', hint: 'Отправлено, ждём апрув представителя', storefront: 'hidden' },
  { id: 'awaiting_rep_approval', label: 'Проверяет представитель', hint: 'Представитель проверяет карточку точки', storefront: 'hidden' },
  { id: 'invoice_issued', label: 'Счёт выставлен', hint: 'Счёт 1 ₽, код VER-* — оплатите с расчётного счёта компании', storefront: 'teaser' },
  { id: 'awaiting_payment', label: 'Ожидаем платёж', hint: 'Платёж по коду VER-* ещё не поступил', storefront: 'teaser' },
  { id: 'verifying', label: 'Проверяем платёж', hint: 'Платёж получен, проверяем реквизиты', storefront: 'teaser' },
  { id: 'verified', label: 'Продажи включены', hint: 'Готово — каталог и заказы открыты', storefront: 'active' },
];

// Внутренние статусы демки → канонный шаг заявки
const MSP_STATUS_STEP = {
  lead: 'draft', draft: 'draft', moderation: 'awaiting_rep_approval', pending_rep: 'awaiting_rep_approval',
  catalog: 'invoice_issued', payment: 'verifying', waiting: 'verifying', ready: 'verified', active: 'verified', offline: 'verified',
};

function mspStepsHtml(status, compact = false) {
  const app = mspAppStatus(status);
  if (app === 'failed' || app === 'expired') {
    return `<div class="stepper ${compact ? 'compact' : ''} error"><div class="step current"><span>!</span><b>${app === 'expired' ? 'Срок заявки истёк' : 'Заявка не прошла проверку'}</b></div></div>`;
  }
  const idx = Math.max(0, MSP_APP_STEPS.findIndex((x) => x.id === app));
  return `<div class="stepper ${compact ? 'compact' : ''}">${MSP_APP_STEPS.map((x, i) => `<div class="step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span>${i + 1}</span><b>${esc(x.label)}</b></div>`).join('')}</div>`;
}

function mspOldStepsHtml(status, compact = false) {
  const order = ['draft', 'pending_rep', 'catalog', 'payment', 'ready'];
  const labels = {
    draft: 'ИНН и карточка',
    pending_rep: 'Апрув представителя',
    catalog: 'Видна в каталоге',
    payment: 'Платёж и возврат',
    ready: 'Продажи включены',
  };
  const idx = Math.max(0, order.indexOf(status));
  return `<div class="stepper ${compact ? 'compact' : ''}">${order.map((id, i) => `<div class="step ${i <= idx ? 'done' : ''} ${i === idx ? 'current' : ''}"><span>${i + 1}</span><b>${esc(labels[id])}</b></div>`).join('')}</div>`;
}

function trustCuesHtml() {
  return `<div class="trust-cues">
    <span>${icon('check-circle')}90% платежа — точке</span>
    <span>${icon('banknote')}Т-Банк · мультирасчёты</span>
    <span>${icon('percent')}0–10% комиссия</span>
    <span>${icon('clock')}запуск за 3 дня</span>
  </div>`;
}

function renderConnectScriptHtml() {
  return `
  <div class="script-card">
    <div class="kicker">Сценарий у владельца точки</div>
    <ol>
      <li><b>Покажите QR.</b> Владелец сканирует код и открывает форму регистрации LOVII.</li>
      <li><b>ИНН.</b> Владелец вводит ИНН юрлица или ИП — открывается мобильный экран МСП.</li>
      <li><b>Карточка точки.</b> Название, адрес, описание и фото. Товаров пока нет.</li>
      <li><b>Апрув представителя.</b> После одобрения точка видна в каталоге всем пользователям района.</li>
      <li><b>Проверочный платёж.</b> LOVII показывает назначение платежа со спецкодом; после получения автоматически делает возврат.</li>
      <li><b>Каталог товаров.</b> Ссылка-инструкция приходит в VK, Telegram или MAX. После заполнения товары доступны на витрине точки.</li>
    </ol>
  </div>`;
}

function renderRepConnectDash(head, tabs) {
  const code = repInviteCode();
  const lead = ensureMspLead();
  const status = lead && lead.point ? lead.point.status : lead ? 'draft' : 'draft';
  return `
  ${head}${tabs}
  <div class="connect-hero ink-gradient">
    <div class="connect-copy">
      <div class="kicker">QR-подключение МСП</div>
      <h2>Один понятный маршрут для владельца точки</h2>
      <p>Покажите QR. Владелец вводит только ИНН, потом по шагам добавляет карточку точки, платёж и каталог товаров.</p>
      <div class="chips"><span class="glass-chip">0 ₽ старт</span><span class="glass-chip">3 дня запуск</span><span class="glass-chip">90/10 сплит</span></div>
    </div>
    <button class="qr-card" data-go="msp-signup:${code}" aria-label="Открыть регистрацию МСП">
      ${qrGridHtml()}
      <span>${esc(code)}</span>
    </button>
  </div>
  <div class="qr-link-row">
    <code>${esc(location.origin + location.pathname + '#/msp-signup/' + code)}</code>
    <button class="ghost-btn sm" data-action="copy-code" data-code="${esc(code)}">${icon('download')}Код</button>
  </div>
  ${lead ? mspStepsHtml(status) : ''}
  <div class="btn-row">
    <button class="cta-btn brand-gradient" data-go="msp-signup:${code}">Смоделировать скан QR</button>
    <button class="ghost-btn" data-action="reset-msp-demo">Сбросить сценарий</button>
  </div>
  ${trustCuesHtml()}
  ${renderConnectScriptHtml()}
  <div class="section-head" style="margin-top:20px"><h2>Очередь представителя</h2></div>
  ${repMspApplicationHtml()}`;
}

function renderMspSignup(code) {
  const invite = code || repInviteCode();
  return `
  <div class="lv-enter lv-narrow" style="padding-bottom:16px">
    <div class="msp-mobile-head ink-gradient">
      <span class="mh-emoji">📲</span>
      <div><div class="kicker">QR от представителя · ${esc(invite)}</div><h1>Подключение точки к LOVII</h1><p>Начинаем с одного поля — ИНН. Остальное приложение попросит по шагам.</p></div>
    </div>
    <form id="msp-signup-form" data-code="${esc(invite)}">
      <label class="f-field"><span class="lb">ИНН юрлица или ИП</span><input name="inn" inputmode="numeric" pattern="[0-9]{10,12}" placeholder="Например, 7801234567" required autofocus></label>
      <div class="field-help">ИНН нужен, чтобы привязать заявку к юрлицу и подготовить проверочный платёж со спецкодом.</div>
      ${trustCuesHtml()}
      <div style="padding:16px 16px 0"><button class="cta-btn brand-gradient big" type="submit">Открыть экран МСП</button></div>
      <div class="dash-note tone-gold" style="margin-top:14px">Демо не отправляет данные наружу. На следующем экране владелец добавит карточку точки: адрес, описание и фото.</div>
    </form>
  </div>`;
}

function mspAppStatus(status) {
  const lead = state.mspLead;
  if (lead && lead.appStatus) return lead.appStatus;
  return MSP_STATUS_STEP[status] || 'draft';
}

function mspStatusText(status) {
  // Подсказка «что дальше» и состояние витрины — по канонной таблице шагов заявки
  if (status === 'failed' || status === 'expired') {
    return status === 'expired'
      ? 'Срок заявки истёк — создайте новую заявку, прогресс сохранится'
      : 'Проверка не пройдена — исправьте карточку точки и отправьте снова';
  }
  const step = MSP_APP_ALL.find((x) => x.id === mspAppStatus(status)) || MSP_APP_ALL[0];
  return step.hint;
}

function mspStorefrontText(status) {
  if (status === 'failed' || status === 'expired') return { label: 'витрина: hidden', hint: 'точка не видна покупателям' };
  const step = MSP_APP_ALL.find((x) => x.id === mspAppStatus(status)) || MSP_APP_ALL[0];
  const map = { hidden: 'точка не видна покупателям', teaser: 'карточка видна, заказы закрыты', active: 'заказы открыты' };
  return { label: 'витрина: ' + step.storefront, hint: map[step.storefront] };
}

/* ---- МСП: заказы (статусы и переходы — из ядра OrderStatus) ---- */
function mspOrderLabel(status) {
  const m = { created:'Создан', submitted:'Отправлен', accepted:'Принят', preparing:'Готовится', ready:'Готов',
              handed_to_delivery:'Передан курьеру', on_the_way:'В пути', completed:'Доставлен', cancelled:'Отменён', failed:'Ошибка' };
  return m[status] || status;
}
// Переходы — ровно по MspOrderActions (ядро): фильтр по типу исполнения.
//  самовывоз: … → ready → completed («Выдан клиенту»), курьерских шагов нет
//  доставка:  … → ready → handed_to_delivery → on_the_way → completed, минуя нельзя
//  failed — технический статус системы, точке не предлагается
function mspOrderOptions(order) {
  const pickup = order.channel !== 'Доставка';
  const base = {
    created: ['submitted', 'cancelled'],
    submitted: ['accepted', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['handed_to_delivery', 'completed', 'cancelled'],
    handed_to_delivery: ['on_the_way', 'completed'],
    on_the_way: ['completed'],
  }[order.status] || [];
  const labels = { submitted:'Отправить', accepted:'Принять', preparing:'Готовить', ready:'Готов к выдаче',
                   handed_to_delivery:'Передать курьеру', on_the_way:'В пути',
                   completed: pickup ? 'Выдать клиенту' : 'Доставлен', cancelled:'Отменить' };
  let next = base.filter((st) => st !== 'failed' && st !== 'cancelled'); // отмена — отдельной кнопкой
  if (pickup) next = next.filter((st) => !['handed_to_delivery', 'on_the_way'].includes(st));
  else if (order.status !== 'on_the_way') next = next.filter((st) => st !== 'completed');
  return next.map((st) => [st, labels[st]]);
}

// Подпись статуса с учётом типа заказа (OrderBadges::statusBadge)
function mspOrderLabelFor(order, status) {
  if (status === 'completed' && order.channel !== 'Доставка') return 'Выдан клиенту';
  return mspOrderLabel(status);
}
function orderChip(status, order) {
  // цвета — по BadgeColor из ядра: submitted/blue · accepted/brand · preparing/orange · ready|lime
  const cls = { created:'st-wait', submitted:'st-blue', accepted:'st-active', preparing:'st-mod', ready:'st-lime',
                handed_to_delivery:'st-blue', on_the_way:'st-accent', completed:'st-lime', cancelled:'st-off', failed:'st-off' };
  const label = order ? mspOrderLabelFor(order, status) : mspOrderLabel(status);
  return `<span class="st-chip ${cls[status] || 'st-wait'}">${label}</span>`;
}

function ensureMspOrders() {
  if (!state.mspOrders) state.mspOrders = (LOVII_DASH.mspOrders || []).map((o) => JSON.parse(JSON.stringify(o)));
  return state.mspOrders;
}

function renderMspCabinet(tab = 'index') {
  const lead = ensureMspLead();
  if (!lead) return renderMspSignup(repInviteCode());
  const p = lead.point;
  const status = p ? p.status : 'draft';
  const payCode = 'LOVII-' + lead.inn.slice(-4) + '-' + lead.repCode.slice(-3);
  const tabs = `<div class="seg dash-tabs msp-tabs" style="margin:14px 16px 0">
    ${[['index','Заявка'], ['orders','Заказы'], ['catalog','Каталог'], ['pay','Платёж'], ['help','Инструкция']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="msp-tab" data-val="${id}">${label}</button>`).join('')}
  </div>`;
  const head = `
  <div class="dash-head">
    <span class="dash-ava ${tileBg('tiffany')}">${icon('store')}</span>
    <div class="dash-title"><h1>Экран МСП</h1><div class="d">ИНН ${esc(lead.inn)} · ${esc(lead.repCode)}</div></div>
    <button class="ghost-btn sm" data-go="dash:connect">${icon('chev-left')}Представитель</button>
  </div>`;

  if (tab === 'orders') {
    const orders = ensureMspOrders();
    const rows = orders.map((o) => `<button class="row-item as-btn" data-action="msp-order-open" data-id="${o.id}">
      <span class="ri-emoji ${tileBg('sand')}">${icon('bag')}</span>
      <div class="ri-mid"><div class="nm">Заказ №${o.no}${orderChip(o.status, o)}</div><div class="sb">${esc(o.at)} · ${esc(o.channel)} · ${o.items.length} поз.</div></div>
      <div class="ri-right"><div class="v">${moneyFmt(o.total)}</div></div></button>`).join('');
    return `${head}${tabs}
      <div class="section-head" style="margin-top:20px"><h2>Заказы<span class="sub"> · ${orders.length}</span></h2></div>
      <div class="list-card">${rows || '<div class="empty-cat"><div class="t">Заказов пока нет</div><p class="d">Они появятся здесь, когда покупатели оформят заказ.</p></div>'}</div>`;
  }

  if (tab === 'order') {
    const orders = ensureMspOrders();
    const o = orders.find((x) => String(x.id) === String(state.mspOrderId)) || orders[0];
    if (!o) { return `${head}${tabs}${dashNote('Заказ не найден', 'dim')}`; }
    const opts = mspOrderOptions(o);
    const items = o.items.map((i) => `<div class="row-item"><span class="ri-emoji ${tileBg('sand')}">${icon('package')}</span>
      <div class="ri-mid"><div class="nm">${esc(i.name)}</div><div class="sb">${i.qty} × ${moneyFmt(i.price)}</div></div>
      <div class="ri-right"><div class="v">${moneyFmt(i.qty * i.price)}</div></div></div>`).join('');
    const fin = ['completed', 'cancelled', 'failed'].includes(o.status);
    const canCancel = ['created', 'submitted', 'accepted', 'preparing', 'ready'].includes(o.status);
    return `${head}${tabs}
      <div class="section-head" style="margin-top:20px"><h2>Заказ №${o.no}${orderChip(o.status, o)}</h2></div>
      <div class="list-card">${items}</div>
      <div class="dash-note tone-dim">Итого ${moneyFmt(o.total)} · ${esc(o.channel)} · ${esc(o.at)}</div>
      <div class="btn-row">
        ${opts.map(([to, label], i) => `<button class="${i === 0 ? 'cta-btn brand-gradient' : 'ghost-btn'}" data-action="msp-order-set" data-id="${o.id}" data-to="${to}">${icon(i === 0 ? 'check' : 'chev-right')}${label}</button>`).join('')}
        ${canCancel ? `<button class="ghost-btn" data-action="msp-order-cancel" data-id="${o.id}">${icon('x')}Отменить</button>` : ''}
        <button class="ghost-btn" data-action="msp-tab" data-val="orders">${icon('chev-left')}К списку</button>
      </div>`;
  }

  if (tab === 'catalog') {
    if (status !== 'ready') {
      return `${head}${tabs}${mspStepsHtml(status)}<div class="empty-state-card"><div class="big-emoji">🧺</div><h3>Каталог товаров пока закрыт</h3><p>Сейчас точка может быть видна в каталоге только как карточка района. Товары откроются после апрува, проверочного платежа и автоматического возврата.</p><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="pay">Посмотреть следующий шаг</button></div>`;
    }
    const goods = lead.goods || [];
    const chips = LOVII_DASH.storeGoodsSeed.slice(0, 6).filter((g) => !goods.some((x) => x.slug === g.slug)).map((g) => `<button class="cat-chip" data-action="add-msp-good" data-slug="${g.slug}"><span class="e">${icon('bag')}</span>${esc(g.name)}</button>`).join('');
    return `${head}${tabs}${mspStepsHtml(status)}
    <div class="section-head" style="margin-top:20px"><h2>Каталог товаров<span class="sub"> · ${goods.length}</span></h2></div>
    <div class="list-card">${goods.length ? goods.map((g) => `<div class="row-item"><span class="ri-emoji ${tileBg('sand')}">${icon('bag')}</span><div class="ri-mid"><div class="nm">${esc(g.name)}</div><div class="sb">${priceFmt(g.price)} / ${esc(g.unit)} · остаток ${g.stock}</div></div><span class="st-chip st-active">на витрине</span></div>`).join('') : '<div class="empty-cat"><div class="big-emoji">🛍️</div><div class="t">Добавьте первый товар</div><p class="d">После добавления он появится на витрине этой точки.</p></div>'}</div>
    ${chips ? `<div class="section-head" style="margin-top:20px"><h2>Добавить товары</h2></div><div class="cats no-scrollbar" style="padding:10px 16px 4px">${chips}</div>` : dashNote('Все товары уже опубликованы на витрине точки.', 'tiffany')}`;
  }

  if (tab === 'pay') {
    const canPay = p && p.status === 'catalog';
    return `${head}${tabs}${mspStepsHtml(status)}
    <div class="pay-card">
      <div class="kicker">Проверочный платёж и автоматический возврат</div>
      <h2>${canPay ? 'Пора подтвердить реквизиты' : status === 'ready' ? 'Платёж и возврат успешны' : 'Этот шаг откроется после апрува представителя'}</h2>
      <div class="pay-row"><span>Сумма</span><b>1 ₽</b></div>
      <div class="pay-row"><span>Назначение</span><b>${esc(payCode)}</b></div>
      <p>Назначение содержит спецкод заявки. После получения платежа LOVII автоматически формирует возврат. Если цепочка прошла успешно, точка получает доступ к приёму оплаты.</p>
      ${canPay ? `<button class="cta-btn brand-gradient big" data-action="demo-pay">Смоделировать оплату и возврат</button>` : ''}
    </div>
    <div class="checklist-card">
      <div class="cl-row done"><b>Карточка точки</b><span>${p ? esc(p.name) : 'ещё не создана'}</span></div>
      <div class="cl-row ${['catalog','payment','ready'].includes(status) ? 'done' : ''}"><b>Апрув представителя</b><span>точка видна в каталоге района</span></div>
      <div class="cl-row ${status === 'ready' ? 'done' : status === 'payment' ? 'active' : ''}"><b>Платёж и возврат</b><span>проверка реквизитов и автосплитов</span></div>
      <div class="cl-row ${status === 'ready' ? 'done' : ''}"><b>Инструкция</b><span>${status === 'ready' ? 'отправлена в ' + esc(lead.channel || 'выбранный канал') : 'придёт после проверки'}</span></div>
    </div>`;
  }

  if (tab === 'help') {
    return `${head}${tabs}${mspStepsHtml(status)}
    <div class="mentor-card ink-gradient"><div class="kicker">Ссылка-инструкция</div><div class="big">${status === 'ready' ? 'Отправлена в ' + esc(lead.channel || 'канал связи') : 'Откроется после платежа'}</div><p>Владелец проходит авторизацию, добавляет товары, цены и остатки. Каждый товар станет доступен на витрине LOVII именно в этой точке.</p></div>
    <div class="script-card">
      <div class="kicker">Что дальше</div>
      <ol>
        <li><b>Авторизация.</b> Откройте ссылку в ${esc(lead.channel || 'выбранном канале')}.</li>
        <li><b>Каталог.</b> Добавьте товары, цены, остатки и фото.</li>
        <li><b>Публикация.</b> Каждый товар будет виден на странице точки и в общем поиске LOVII.</li>
      </ol>
    </div>`;
  }

  return `${head}${tabs}${mspStepsHtml(status)}
  <div class="status-flow-card">
    <div class="kicker">Текущий этап</div>
    <h2>${esc(mspStatusText(status))}</h2>
    <p class="sf-store">${esc(mspStorefrontText(status).label)} — ${esc(mspStorefrontText(status).hint)}</p>
    <div class="btn-row">
      <button class="cta-btn brand-gradient" data-action="msp-app-next">${icon('check')}Следующий шаг</button>
      <button class="ghost-btn" data-action="msp-app-fail">${icon('x')}Отклонить заявку</button>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Статусы заявки<span class="sub"> · ${MSP_APP_ALL.length}</span></h2></div>
    <div class="chips">
      ${MSP_APP_ALL.map((x) => `<button class="filter-chip ${mspAppStatus(status) === x.id ? 'on' : ''}" data-action="msp-app-set" data-val="${x.id}">${esc(x.label)}</button>`).join('')}
    </div>
    <p>${status === 'draft' ? 'Заполните только то, что нужно для появления в каталоге: юрлицо, канал связи, название, адрес, описание и фото.' : 'Система показывает, что уже сделано и какой один следующий шаг нужен сейчас.'}</p>
  </div>
  ${p ? `
    <div class="list-card">
      <div class="row-item"><span class="ri-emoji ${tileBg('tiffany')}">${icon('store')}</span><div class="ri-mid"><div class="nm">${esc(p.name)}${statusChip(p.status)}</div><div class="sb">${esc(p.address || "")}${p.about ? " · " + esc(p.about) : ""}</div></div>${mspPointVisible(p.status) ? `<button class="chev-btn" data-go="store:${p.slug}">${icon('chev-right')}</button>` : ''}</div>
    </div>
  ` : ''}
  ${(!p || p.status === 'draft') ? `
    <form id="msp-point-form">
      <label class="f-field"><span class="lb">Название юрлица</span><input name="legalName" placeholder="ООО «Ржаной дом»" value="${esc(lead.legalName || '')}" required></label>
      <label class="f-field"><span class="lb">Канал для инструкции</span><select name="channel"><option ${lead.channel === 'Telegram' ? 'selected' : ''}>Telegram</option><option ${lead.channel === 'ВКонтакте' ? 'selected' : ''}>ВКонтакте</option><option ${lead.channel === 'MAX' ? 'selected' : ''}>MAX</option></select></label>
      <label class="f-field"><span class="lb">Название точки</span><input name="name" placeholder="Пекарня «Ржаной дом»" required></label>
      <label class="f-field"><span class="lb">Адрес</span><input name="address" placeholder="ул. Рубинштейна, 12" required></label>
      <label class="f-field"><span class="lb">Описание</span><textarea name="about" placeholder="Что продаёте, почему вас любят соседи…" required></textarea></label>
      <label class="f-field"><span class="lb">Фото точки</span><input name="photo" type="file" accept="image/*"></label>
      <div class="dash-note tone-tiffany" style="margin-top:14px">Товаров на этом этапе нет. После апрува представитель публикует только карточку точки: фото, адрес, описание и расстояние до клиента.</div>
      <div style="padding:16px 16px 0"><button class="cta-btn brand-gradient big" type="submit">Добавить в каталог</button></div>
    </form>` : ''}
  ${status === 'pending_rep' ? dashNote('Заявка отправлена представителю — он проверит карточку и подтвердит подключение', 'gold') : ''}
  ${status === 'catalog' ? `<div class="btn-row"><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="pay">Перейти к проверочному платежу</button><button class="ghost-btn" data-go="store:${p.slug}">Посмотреть в каталоге</button></div>` : ''}
  ${status === 'ready' ? `<div class="btn-row"><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="catalog">Заполнить каталог товаров</button><button class="ghost-btn" data-go="store:${p.slug}">Витрина точки</button></div>` : ''}`;
}

function handleMspSignup(form) {
  const val = (name) => (form.querySelector(`[name="${name}"]`) || {}).value || '';
  const inn = val('inn').replace(/\D/g, '');
  state.mspLead = {
    repCode: form.dataset.code || repInviteCode(),
    inn,
    legalName: '',
    channel: 'Telegram',
    createdAt: Date.now(),
    point: null,
    goods: [],
  };
  persist();
  toast('ИНН принят', 'Открываем экран МСП с заявкой');
  go('msp', 'index');
}

function handleMspPoint(form) {
  const lead = ensureMspLead();
  if (!lead) return;
  const val = (name) => (form.querySelector(`[name="${name}"]`) || {}).value || '';
  lead.legalName = val('legalName').trim() || lead.legalName || 'Моя компания';
  lead.channel = val('channel') || lead.channel || 'Telegram';
  lead.point = {
    slug: 'msp-' + lead.inn.slice(-4),
    name: val('name').trim() || 'Новая точка',
    address: val('address').trim() || 'Адрес района',
    about: val('about').trim() || 'Новая точка района в LOVII.',
    hours: '09:00-21:00',
    emoji: '🥖',
    color: 'tiffany',
    category: 'bakery',
    status: 'pending_rep',
    submittedAt: Date.now(),
  };
  persist();
  toast('Заявка отправлена представителю', 'После апрува точка появится в каталоге');
  renderView();
}

function resetMspDemo() {
  state.mspLead = null;
  persist();
  toast('Сценарий сброшен', 'Можно заново пройти QR-подключение');
  renderView();
}

function returnMspPoint() {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'pending_rep') return;
  lead.point.status = 'draft';
  persist();
  toast('Заявка возвращена', 'Владелец может поправить карточку точки');
  renderViewPreserveScroll();
}

function approveMspPoint() {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'pending_rep') return;
  lead.point.status = 'catalog';
  lead.point.approvedAt = Date.now();
  syncMspStore();
  persist();
  toast('Точка одобрена', 'Карточка уже видна в каталоге района');
  renderViewPreserveScroll();
}

function demoPayMsp() {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'catalog') return;
  lead.point.status = 'payment';
  persist();
  renderViewPreserveScroll();
  toast('Платёж получен', 'Формируем автоматический возврат');
  setTimeout(() => {
    if (!state.mspLead || !state.mspLead.point || state.mspLead.point.status !== 'payment') return;
    state.mspLead.point.status = 'ready';
    state.mspLead.point.readyAt = Date.now();
    state.mspLead.goods = state.mspLead.goods || [];
    syncMspStore();
    persist();
    if (state.view.name === 'msp') renderView();
    toast('Точка готова к продажам', `Инструкция отправлена в ${state.mspLead.channel}`);
  }, 2500);
}

function addMspGood(slug) {
  const lead = ensureMspLead();
  const src = LOVII_DASH.storeGoodsSeed.find((g) => g.slug === slug);
  if (!lead || !lead.point || lead.point.status !== 'ready' || !src) return;
  lead.goods = lead.goods || [];
  if (!lead.goods.some((g) => g.slug === src.slug)) lead.goods.push({ ...src });
  syncMspStore();
  persist();
  renderViewPreserveScroll();
  toast('Товар опубликован', 'Он доступен на витрине точки');
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

