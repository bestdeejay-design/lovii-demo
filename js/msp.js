/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · КАБИНЕТ МСП (#/msp) — v2
 * Вложенность владельца (19.09): ИНН (юрлицо) → мерчанты (бренд + лого)
 * → торговые точки (адрес, часы, мин.сумма, товары). Товары общие в
 * рамках бренда; включение/выключение — на уровне точки или всего бренда.
 * Каркас и статусы — как на стейдже (CabinetLayout, order-status.ts).
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. v2.
 * ============================================================ */

/* ---------- Сид: юрлица → бренды → точки → товары ---------- */

const MSP_MIRROR = {
  partners: [
    {
      name: 'АТМОСФЕРА', inn: '7842216839',
      brands: [
        {
          name: 'Кофейня «Daily»', emoji: '☕', bg: '#f4e9dd',
          points: [
            {
              id: 'dt1', name: 'Daily · Тверская', address: 'ул. Тверская, 12',
              minOrder: 500, open: true,
              products: [
                { id: 'cd1', name: 'Капучино', emoji: '☕', bg: '#f4e9dd', price: 220, unit: '0,3 л', on: true },
                { id: 'cd2', name: 'Латте', emoji: '🥛', bg: '#fdf3d8', price: 240, unit: '0,3 л', on: true },
                { id: 'cd3', name: 'Эспрессo', emoji: '☕', bg: '#ffe9f2', price: 150, unit: '60 мл', on: true },
                { id: 'cd4', name: 'Круассан с миндалём', emoji: '🥐', bg: '#fdf3d8', price: 164, unit: '1 шт', on: true },
                { id: 'cd5', name: 'Слойка с вишней', emoji: '🥯', bg: '#ffe9f2', price: 180, old: 230, unit: '1 шт', on: true },
                { id: 'cd6', name: 'Чизкейк', emoji: '🍰', bg: '#ffe9f2', price: 320, unit: '150 г', on: true },
                { id: 'cd7', name: 'Тирамису', emoji: '🍰', bg: '#f4e9dd', price: 350, unit: '140 г', on: true },
              ],
            },
            {
              id: 'dt2', name: 'Daily · Патриаршие', address: 'Малая Бронная, 4',
              minOrder: 0, open: true,
              products: [
                { id: 'cd1', name: 'Капучино', emoji: '☕', bg: '#f4e9dd', price: 220, unit: '0,3 л', on: true },
                { id: 'cd2', name: 'Латте', emoji: '🥛', bg: '#fdf3d8', price: 240, unit: '0,3 л', on: true },
                { id: 'cd4', name: 'Круассан с миндалём', emoji: '🥐', bg: '#fdf3d8', price: 164, unit: '1 шт', on: true },
              ],
            },
          ],
        },
      ],
    },
    { name: 'АКСИОМА', inn: '7842223709', brands: [] },
    {
      name: 'Grand', inn: '7841000000',
      brands: [
        {
          name: 'Grand Burger', emoji: '🍔', bg: '#ffe8e0',
          points: [
            {
              id: 'gb1', name: 'Grand Burger · Арбат', address: 'ул. Арбат, 38',
              minOrder: 300, open: true,
              products: [
                { id: 'gb1', name: 'Бургер классический', emoji: '🍔', bg: '#ffe8e0', price: 390, unit: '1 шт', on: true },
                { id: 'gb2', name: 'Картофель фри', emoji: '🍟', bg: '#fdf3d8', price: 160, unit: '120 г', on: true },
              ],
            },
          ],
        },
      ],
    },
  ],
  team: [
    { name: 'Александра', role: 'Администратор', note: 'Товары · Заказы · Команда', phone: '+7 926 ••••-45-67' },
    { name: 'Максим', role: 'Сотрудник', note: 'Только заказы', phone: '+7 999 ••••-11-22' },
  ],
};

/* ---------- Состояние вида + персист настроек точек ---------- */

const mspUi = {
  tab: 'overview', partner: 0, brand: 0, point: 0,
  payment: 'await', order: null, saleScope: 'point',
};

const MSP_PERSIST_KEY = 'lv_msp_mirror_v2';

function mspPersist() {
  try {
    const dump = {};
    for (const p of MSP_MIRROR.partners) {
      for (const b of p.brands) {
        for (const pt of b.points) {
          dump[pt.id] = {
            open: pt.open, minOrder: pt.minOrder, address: pt.address,
            products: Object.fromEntries(pt.products.map((x) => [x.id, !!x.on])),
          };
        }
      }
    }
    localStorage.setItem(MSP_PERSIST_KEY, JSON.stringify(dump));
  } catch { /* приватный режим */ }
}

(function mspRestore() {
  try {
    const saved = JSON.parse(localStorage.getItem('lv_msp_mirror_v2') || localStorage.getItem('lv_msp_mirror') || '{}');
    for (const p of MSP_MIRROR.partners) {
      for (const b of p.brands) {
        for (const pt of b.points) {
          const s = saved[pt.id];
          if (!s) continue;
          if (typeof s.open === 'boolean') pt.open = s.open;
          if (typeof s.minOrder === 'number') pt.minOrder = s.minOrder;
          if (typeof s.address === 'string' && s.address) pt.address = s.address;
          if (s.products) for (const pr of pt.products) if (typeof s.products[pr.id] === 'boolean') pr.on = s.products[pr.id];
        }
      }
    }
  } catch { /* приватный режим */ }
})();

/* ---------- Активный контекст: юрлицо → бренд → точка ---------- */

function mspActivePartner() {
  return MSP_MIRROR.partners[mspUi.partner] || MSP_MIRROR.partners[0];
}

function mspActiveBrand() {
  const p = mspActivePartner();
  return p.brands[Math.min(mspUi.brand, p.brands.length - 1)] || null;
}

function mspActivePoint() {
  const b = mspActiveBrand();
  if (!b) return null;
  return b.points[Math.min(mspUi.point, b.points.length - 1)] || b.points[0];
}

/* Расписание точки (по дням; выключенный день = выходной) */
mspUi.scheds = {};

function mspSchedule(pointId) {
  if (!mspUi.scheds[pointId]) {
    mspUi.scheds[pointId] = {
      пн: { on: true, from: '09:00', to: '22:00' }, вт: { on: true, from: '09:00', to: '22:00' },
      ср: { on: true, from: '09:00', to: '22:00' }, чт: { on: true, from: '09:00', to: '22:00' },
      пт: { on: true, from: '09:00', to: '22:00' }, сб: { on: true, from: '10:00', to: '22:00' },
      вс: { on: false, from: '10:00', to: '20:00' },
    };
  }
  return mspUi.scheds[pointId];
}

function mspScheduleLabel(point) {
  const sched = mspSchedule(point ? point.id : 'default');
  const first = Object.values(sched).find((d) => d.on);
  return first ? `${first.from}–${first.to}` : 'выходной';
}

/* ---------- Статусы заказа (order-status.ts) ---------- */

const MSP_STATUS = {
  created: 'Оформлен', submitted: 'Оплачен и отправлен', accepted: 'Принята', preparing: 'Готовится',
  cooking: 'Готовится', ready: 'Приготовлен', delivered: 'Доставлен', handed: 'Выдан клиенту',
  completed: 'Выполнен', canceled: 'Отменён',
};

const MSP_FLOW = ['created', 'submitted', 'accepted', 'preparing', 'ready', 'handed'];
const MSP_FLOW_LABEL = {
  created: 'Клиент оформил заказ', submitted: 'Оплатил и отправил', accepted: 'Точка приняла',
  preparing: 'Готовится', ready: 'Приготовлен', handed: 'Выдан клиенту',
};

function mspOrderIdx(status) {
  return { created: 0, submitted: 1, accepted: 2, cooking: 3, preparing: 3, ready: 4, done: 6, handed: 6 }[status] ?? 0;
}

function mspOrderStatus(order) {
  return MSP_STATUS[order.status] || 'Выполнен';
}

function mspOrdersOf(partnerNamePart) {
  return oAllOrders().filter((o) => (o.merchant?.name || '').includes(partnerNamePart));
}

/* ---------- Каркас кабинета (CabinetLayout) ---------- */

const MSP_TABS = [
  { id: 'overview', label: 'Обзор', icon: 'bar-chart' },
  { id: 'orders', label: 'Заказы', icon: 'bag' },
  { id: 'products', label: 'Товары', icon: 'package' },
  { id: 'team', label: 'Команда', icon: 'users' },
  { id: 'settings', label: 'Точка', icon: 'settings' },
];

function mspShell(inner) {
  const partner = mspActivePartner();
  const brand = mspActiveBrand();
  const point = mspActivePoint();
  const contextNote = brand
    ? `${partner.name} · ${brand.name}${point ? ` · ${point.name}` : ''}`
    : `${partner.name} · ИНН ${partner.inn}`;
  return `
    <div class="msp-cabinet">
      <header class="cabinet__head">
        <span class="cabinet__ava" aria-hidden="true">${icon('store')}</span>
        <div class="cabinet__titles">
          <h1 class="cabinet__title">МСП · точка</h1>
          <button type="button" class="cabinet__partner" data-action="msp-partner" aria-label="Сменить юрлицо">
            ${contextNote} ${icon('chev-down')}
          </button>
        </div>
      </header>

      <main class="cabinet__body container">${inner}</main>

      <nav class="cabinet__bar" aria-label="Разделы кабинета">
        <div class="cabinet__bar-in">
          ${MSP_TABS.map((t) => `
            <button type="button" class="cabinet__bar-link${mspUi.tab === t.id || (mspUi.tab === 'order' && t.id === 'orders') ? ' cabinet__bar-link--active' : ''}"
              data-action="msp-tab" data-tab="${t.id}" data-testid="cabinet-tab-${t.id}">
              <span class="cabinet__bar-ico">${icon(t.icon)}</span>
              <span class="cabinet__bar-ind"></span>
              <span class="cabinet__bar-label">${t.label}</span>
            </button>`).join('')}
        </div>
      </nav>
    </div>`;
}

/* ---------- Запуск точки (readiness) ---------- */

function mspStarter(point) {
  const onProducts = point.products.filter((p) => p.on).length;
  const steps = [
    { id: 'showcase', label: 'Витрина опубликована', done: true },
    { id: 'offers', label: 'Товары загружены', done: onProducts > 0, hint: `${onProducts} позиций в каталоге` },
    { id: 'schedule', label: 'Расписание заполнено', done: Object.values(mspSchedule(point.id)).some((d) => d.on), hint: mspScheduleLabel(point) },
    { id: 'min-order', label: 'Минимальная сумма заказа', done: point.minOrder > 0, hint: `${point.minOrder} ₽` },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  return `
    <section class="role-card msp-starter__card">
      <div class="role-section-head"><h2>Запуск точки</h2><span class="role-section-head__sub">${mEsc2(point.name)}</span></div>
      <div class="msp-starter__progress">
        <span class="msp-starter__progress-label">${doneCount === steps.length ? 'Точка готова к запуску' : `Осталось шагов: ${steps.length - doneCount} из ${steps.length}`}</span>
        <span class="msp-starter__meter" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
          <span class="msp-starter__meter-fill" style="width:${percent}%"></span>
        </span>
      </div>
      <ul class="msp-starter__steps">
        ${steps.map((s) => `
          <li class="msp-starter__step" data-done="${s.done}">
            <span class="msp-starter__step-check">${s.done ? icon('check') : ''}</span>
            <span class="msp-starter__step-label">${s.label}${s.hint ? ` · <b>${mEsc2(s.hint)}</b>` : ''}</span>
          </li>`).join('')}
      </ul>
    </section>`;
}

/* ---------- Обзор (MspOverview) ---------- */

function mspOverview() {
  const partner = mspActivePartner();
  const brand = mspActiveBrand();

  /* SZ-050: пустые состояния юрлица — честно, без выдуманных цифр */
  if (!brand) {
    return `
      <div class="msp-overview cabinet-screen">
        <section class="role-card" style="padding:16px">
          <span class="role-empty__icon" style="background:var(--lv-soft-tiffany);color:var(--lv-tiffany-text)">${icon('store')}</span>
          <span class="role-empty__title">Брендов пока нет</span>
          <p class="role-empty__text">Это юрлицо подтверждено, но в нём ещё нет брендов и торговых точек. Здесь появится первый бренд — вместе с ним в кабинете откроются точки, товары и команда этого юрлица.</p>
          <button type="button" class="acct__btn acct__btn_brand" data-action="msp-invite" style="margin-top:12px">Добавить бренд</button>
        </section>
      </div>`;
  }

  const point = mspActivePoint();
  const orders = mspOrdersOf(brand.name);
  const active = orders.filter((o) => o.status !== 'done').length;
  const onProducts = point.products.filter((p) => p.on).length;

  return `
    <div class="msp-overview cabinet-screen">
      <section class="role-card" style="padding:12px 16px 12px">
        <div class="msp-order-row is-link" role="button" data-action="msp-payment" style="border:0;padding:0">
          <span class="msp-order-row__ico">${icon('banknote')}</span>
          <div class="msp-order-row__mid">
            <div class="msp-order-row__name">Счёт верификации · 1 ₽</div>
            <div class="msp-order-row__meta">Проверочный платёж с расчётного счёта компании</div>
          </div>
          <span class="role-tag">${mspUi.payment === 'done' ? 'Оплачен' : mspUi.payment === 'verifying' ? 'Идёт комплаенс' : 'Ждёт оплаты'}</span>
        </div>
      </section>
      <section class="msp-overview__kpi">
        <div class="role-kpi role-kpi_accent">
          <span class="role-kpi__label">Товары точки</span>
          <span class="role-kpi__value">${onProducts}</span>
          <span class="role-kpi__sub">позиций в каталоге</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Заказы в работе</span>
          <span class="role-kpi__value">${active}</span>
          <span class="role-kpi__sub">за последние 30 дней</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Расписание</span>
          <span class="role-kpi__value">${mEsc2(mspScheduleLabel(point))}</span>
          <span class="role-kpi__sub">регулярное расписание</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Мин. сумма</span>
          <span class="role-kpi__value">${point.minOrder}&nbsp;₽</span>
          <span class="role-kpi__sub">на заказ доставке</span>
        </div>
      </section>

      ${mspStarter(point)}

      <section class="role-card">
        <div class="role-section-head"><h2>Последние заказы</h2>
          <button type="button" class="role-link" data-action="msp-tab" data-tab="orders">Все заказы</button>
        </div>
        <div class="msp-orders__list">
          ${orders.slice(0, 3).map((o) => `
            <div class="msp-order-row is-link" role="button" tabindex="0" data-action="msp-order" data-id="${mEsc2(o.id)}">
              <span class="msp-order-row__ico">${icon('bag')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">Заказ №${mEsc2(o.id)} · ${oFmt(o.total)}&nbsp;₽</div>
                <div class="msp-order-row__meta">${oDate(o.createdAt)} · ${o.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}</div>
              </div>
              <span class="role-tag">${mspOrderStatus(o)}</span>
            </div>`).join('') || '<p class="stores__noresult">Заказов пока нет</p>'}
        </div>
      </section>
    </div>`;
}

/* ---------- Товары: область применения точка / бренд ---------- */

function mspProducts() {
  const brand = mspActiveBrand();
  if (!brand) {
    return `<div class="msp-products cabinet-screen"><section class="role-card" style="padding:16px"><p class="role-empty__text" style="margin:0">У этого юрлица пока нет товаров — добавьте первый в каталог точки.</p></section></div>`;
  }
  const point = mspActivePoint();
  const scope = mspUi.saleScope; // point | brand

  const renderList = (pt) => pt.products.map((p) => `
    <div class="msp-product-row">
      <span class="msp-product-row__thumb" style="background-color:${p.bg}"><i class="sf-emoji sf-emoji-xs">${p.emoji}</i></span>
      <div class="msp-product-row__mid">
        <div class="msp-product-row__name">${mEsc2(p.name)}</div>
        <div class="msp-product-row__meta">${oFmt(p.price)}&nbsp;₽ · ${mEsc2(p.unit || '1 шт')}</div>
      </div>
      <button type="button" class="app-switch${p.on ? ' on' : ''}" aria-label="В продаже"
        data-action="msp-sale" data-point="${pt.id}" data-pid="${p.id}"><span class="app-switch__knob"></span></button>
    </div>`).join('');

  return `
    <div class="msp-products cabinet-screen">
      <section class="role-card" style="padding:12px 16px">
        <div class="seg" role="radiogroup" aria-label="Область применения товаров">
          <button type="button" class="${scope === 'point' ? 'active' : ''}" data-action="msp-sale-scope" data-value="point">Эта точка</button>
          <button type="button" class="${scope === 'brand' ? 'active' : ''}" data-action="msp-sale-scope" data-value="brand">Весь бренд</button>
        </div>
        <p class="tier__cta-note" style="margin:8px 0 0">${scope === 'brand'
          ? 'Переключатели применяются ко всем точкам бренда'
          : `Переключатели применяются только к «${mEsc2(point.name)}»`}</p>
      </section>

      ${brand.points.map((pt) => `
        <section class="role-card">
          <div class="role-section-head"><h2>${mEsc2(pt.name)}</h2>
            <span class="role-section-head__sub">${pt.products.filter((x) => x.on).length} из ${pt.products.length}</span></div>
          <div class="msp-products__list">${renderList(pt)}</div>
        </section>`).join('')}
    </div>`;
}

/* ---------- Заказы точки (MspOrders) ---------- */

function mspOrders() {
  const brand = mspActiveBrand();
  const orders = brand ? mspOrdersOf(brand.name) : [];
  return `
    <div class="msp-orders cabinet-screen">
      <div class="msp-orders__list">
        ${orders.map((o) => `
          <div class="msp-order-row is-link" role="button" tabindex="0" data-action="msp-order" data-id="${mEsc2(o.id)}">
            <span class="msp-order-row__ico">${icon('bag')}</span>
            <div class="msp-order-row__mid">
              <div class="msp-order-row__name">Заказ №${mEsc2(o.id)} · ${oFmt(o.total)}&nbsp;₽</div>
              <div class="msp-order-row__meta">${oDate(o.createdAt)} · ${o.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'} · ${o.items.reduce((s, c) => s + c.qty, 0)} поз.</div>
            </div>
            <span class="role-tag">${mspOrderStatus(o)}</span>
          </div>`).join('') || '<p class="stores__noresult">Заказов пока нет</p>'}
      </div>
    </div>`;
}

/* ---------- Команда (MspTeam, SZ-047) ---------- */

function mspTeam() {
  return `
    <div class="msp-team cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Команда точки</h2><span class="role-section-head__sub">${MSP_MIRROR.team.length}</span></div>
        <div class="msp-team__list">
          ${MSP_MIRROR.team.map((m) => `
            <div class="cabinets__row">
              <span class="cabinets__ico ${m.role === 'Администратор' ? 't-tiffany' : 't-pink'}">${icon(m.role === 'Администратор' ? 'users' : 'user')}</span>
              <div class="cabinets__mid">
                <div class="cabinets__name"><span>${mEsc2(m.name)}</span><span class="cabinets__tag cabinets__tag_ready">${m.role}</span></div>
                <div class="cabinets__note">${mEsc2(m.note)} · ${mEsc2(m.phone)}</div>
              </div>
            </div>`).join('')}
        </div>
        <div style="padding:12px 16px 16px">
          <button type="button" class="acct__btn acct__btn_brand" data-action="msp-invite">${icon('plus')} Пригласить сотрудника</button>
          <p class="tier__cta-note">По телефону · роль выбирается при приглашении (SZ-047)</p>
        </div>
      </section>
    </div>`;
}

/* ---------- Настройки точки (MspBranchSettings): бренд → точка → параметры ---------- */

function mspSettings() {
  const partner = mspActivePartner();
  const brand = mspActiveBrand();
  const multiBrand = partner.brands.length > 1;
  const multiPoint = brand && brand.points.length > 1;

  if (!brand) {
    return `
      <div class="msp-settings cabinet-screen">
        <section class="role-card" style="padding:16px">
          <span class="role-empty__icon" style="background:var(--lv-soft-tiffany);color:var(--lv-tiffany-text)">${icon('store')}</span>
          <span class="role-empty__title">Точек пока нет</span>
          <p class="role-empty__text">У юрлица ${mEsc2(partner.name)} ещё нет брендов и торговых точек — настройки появятся вместе с первой точкой.</p>
        </section>
      </div>`;
  }

  const point = mspActivePoint();
  const sched = mspSchedule(point.id);

  return `
    <div class="msp-settings cabinet-screen">
      ${multiBrand ? `
      <section class="role-card" style="padding:12px 16px">
        <div class="role-section-head" style="padding:0"><h2>Бренд</h2><span class="role-section-head__sub">${partner.brands.length}</span></div>
        <div class="msp-days" style="margin-top:10px">
          ${partner.brands.map((b, i) => `
            <button type="button" class="app-chip${i === mspUi.brand ? ' active' : ''}" data-action="msp-brand" data-i="${i}">${b.emoji} ${mEsc2(b.name)}</button>`).join('')}
        </div>
      </section>` : ''}

      ${multiPoint ? `
      <section class="role-card" style="padding:12px 16px">
        <div class="role-section-head" style="padding:0"><h2>Торговая точка</h2><span class="role-section-head__sub">${brand.points.length}</span></div>
        <div class="msp-days" style="margin-top:10px">
          ${brand.points.map((pt, i) => `
            <button type="button" class="app-chip${i === mspUi.point ? ' active' : ''}" data-action="msp-point" data-i="${i}">${mEsc2(pt.name)}</button>`).join('')}
        </div>
      </section>` : ''}

      <section class="role-card">
        <div class="role-section-head"><h2>Магазин</h2><span class="role-section-head__sub">видно клиентам</span></div>
        <div style="padding:12px 16px 16px">
          <div class="msp-order-row" style="border:0;padding:0">
            <span class="msp-order-row__ico" style="background:var(--lv-soft-tiffany);color:var(--lv-tiffany-text)">${icon('store')}</span>
            <div class="msp-order-row__mid">
              <div class="msp-order-row__name">${mEsc2(point.name)}</div>
              <div class="msp-order-row__meta">Выключишь — точка скроется с витрины</div>
            </div>
            <button type="button" class="app-switch${point.open ? ' on' : ''}" data-action="msp-shop"><span class="app-switch__knob"></span></button>
          </div>
        </div>
      </section>

      <section class="role-card">
        <div class="role-section-head"><h2>Точка</h2><span class="role-section-head__sub">${mEsc2(point.address)}</span></div>
        <div style="padding:12px 16px 16px;display:grid;gap:10px">
          <label class="sf-search"><input type="text" placeholder="Адрес" value="${mEsc2(point.address)}" data-action="msp-addr"></label>
          <p class="tier__cta-note" style="margin:0">Часы работы по дням · выключенный день = выходной</p>
          <div class="msp-sched">
            ${Object.entries(sched).map(([d, row]) => `
              <div class="msp-sched__row">
                <span class="msp-sched__day">${d}</span>
                <label class="msp-time">с <input type="time" value="${row.from}" data-action="msp-sched-from" data-day="${d}"></label>
                <label class="msp-time">до <input type="time" value="${row.to}" data-action="msp-sched-to" data-day="${d}"></label>
                <button type="button" class="app-switch${row.on ? ' on' : ''}" aria-label="Рабочий день" data-action="msp-sched-day" data-day="${d}"><span class="app-switch__knob"></span></button>
              </div>`).join('')}
          </div>
          <button type="button" class="role-link" data-action="msp-sched-copyall">Применить понедельник ко всем дням</button>
        </div>
      </section>

      <section class="role-card">
        <div class="role-section-head"><h2>Минимальная сумма заказа</h2></div>
        <div style="padding:12px 16px 16px">
          <div class="sf-search"><input type="number" min="0" placeholder="Рекомендованный минимум — 500 ₽" value="${point.minOrder || ''}" data-action="msp-min"></div>
          <p class="tier__cta-note">Пусто — работает рекомендованный минимальный чек (500 ₽)</p>
        </div>
      </section>

      <section class="role-card" style="padding:12px 16px 16px">
        <button type="button" class="acct__btn acct__btn_brand" data-action="msp-save">${icon('check')} Сохранить</button>
      </section>
    </div>`;
}

/* ---------- Счёт верификации (MspPayment, FINANCIAL_CONTOUR §2) ---------- */

function mspPayment() {
  const st = mspUi.payment;
  if (st === 'done') {
    return `
      <div class="msp-payment cabinet-screen">
        <section class="role-card" style="padding:16px">
          <span class="role-empty__icon" style="background:var(--lv-soft-tiffany);color:var(--lv-tiffany-text)">${icon('check-circle')}</span>
          <span class="role-empty__title">Ваша точка на витрине</span>
          <p class="role-empty__text">Платёж подтверждён — добавляйте товары и принимайте заказы.</p>
          <button type="button" class="acct__btn acct__btn_brand" data-action="msp-tab" data-tab="overview" style="margin-top:12px">Перейти в магазин</button>
        </section>
      </div>`;
  }
  const verifying = st === 'verifying';
  return `
    <div class="msp-payment cabinet-screen">
      <section class="role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0">
          <h2>Счёт верификации</h2>
          <span class="role-tag">${verifying ? 'Идёт комплаенс' : 'Ждёт оплаты'}</span>
        </div>
        <p class="tier__cta-note" style="margin-top:8px">Проверочный платёж на 1 ₽ с расчётного счёта компании: банк подтверждает, что счёт принадлежит вашей организации, и сумма возвращается на те же реквизиты.</p>
      </section>

      ${verifying ? `
      <section class="role-card" style="padding:16px">
        <div class="msp-order-row" style="border:0;padding:0">
          <span class="role-pulse" aria-hidden="true"></span>
          <div class="msp-order-row__mid">
            <div class="msp-order-row__name">Идёт комплаенс — банк подтверждает платёж</div>
            <div class="msp-order-row__meta">Экран обновится сам, точка станет активной</div>
          </div>
        </div>
      </section>` : `
      <section class="role-card" style="padding:16px">
        <span class="role-field__label">Сумма</span>
        <div class="msp-payment__amount">1 ₽</div>
        <span class="role-field__label">Код назначения платежа</span>
        <button type="button" class="msp-payment__code" data-action="msp-copy-code">
          VER-1042-77 ${icon('copy')}
        </button>
        <p class="tier__cta-note">Нажмите на код, чтобы скопировать</p>
        <div class="sf-info-rows" style="margin-top:10px">
          <div><span>Получатель</span><b>ООО «АКСИОМА»</b></div>
          <div><span>Банк</span><b>Т-Банк · МР-08.26</b></div>
          <div><span>Назначение</span><b>Верификация VER-1042-77</b></div>
        </div>
      </section>`}
    </div>`;
}

/* ---------- Детальный заказ (MspOrderDetail, статусная машина) ---------- */

function renderMspOrderDetail(id) {
  const order = mspOrdersOf().find((o) => o.id === id);
  if (!order) { mspUi.tab = 'orders'; return mspOrders(); }
  const idx = mspOrderIdx(order.status);
  const nextAction = order.status === 'cooking'
    ? { label: 'Заказ готов', next: 'ready' }
    : order.status === 'ready'
      ? { label: 'Выдан клиенту', next: 'done' }
      : null;

  return `
    <div class="msp-od cabinet-screen">
      <section class="role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0">
          <h2>Заказ №${mEsc2(order.id)}</h2>
          <span class="role-tag">${mspOrderStatus(order)}</span>
        </div>
        <p class="msp-od__meta">${oDate(order.createdAt)} · ${order.deliveryType === 'delivery' ? `Доставка · ${mEsc2(order.address || '')}` : 'Самовывоз'}</p>

        <p class="block-cap" style="margin-top:14px">Статус</p>
        <div class="msp-od__flow">
          ${MSP_FLOW.map((st, i) => `
            <div class="msp-od__step ${i < idx ? 'done' : i === idx ? 'cur' : 'todo'}">
              <span class="msp-od__dot">${i < idx ? icon('check') : i === idx ? icon('clock') : ''}</span>
              <span class="msp-od__step-lbl">${MSP_FLOW_LABEL[st]}</span>
            </div>`).join('')}
        </div>

        <p class="block-cap" style="margin-top:16px">Позиции</p>
        <div class="msp-od__items">
          ${order.items.map((it) => `
            <div class="msp-od__item"><span>${mEsc2(it.name)} × ${it.qty}</span><b>${oFmt(it.price * it.qty)}&nbsp;₽</b></div>`).join('')}
        </div>
        <div class="msp-od__total"><span>Итого</span><b>${oFmt(order.total)}&nbsp;₽</b></div>

        ${nextAction ? `
          <button type="button" class="acct__btn acct__btn_brand" style="width:100%;margin-top:14px"
            data-action="msp-advance" data-id="${mEsc2(order.id)}" data-next="${nextAction.next}">${nextAction.label}</button>` : ''}
        <button type="button" class="role-link" style="margin-top:10px" data-action="msp-tab" data-tab="orders">← Все заказы</button>
      </section>
    </div>`;
}

/* ---------- Экран ---------- */

function renderMspMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = mspUi.tab === 'order' ? renderMspOrderDetail(mspUi.order)
    : mspUi.tab === 'payment' ? mspPayment()
    : mspUi.tab === 'products' ? mspProducts()
    : mspUi.tab === 'orders' ? mspOrders()
    : mspUi.tab === 'team' ? mspTeam()
    : mspUi.tab === 'settings' ? mspSettings()
    : mspOverview();
  return mspShell(inner);
}

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="msp-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'msp-tab') {
    mspUi.tab = el.dataset.tab;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-order') {
    mspUi.order = el.dataset.id;
    mspUi.tab = 'order';
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-partner') {
    const title = document.getElementById('action-title');
    const sub = document.getElementById('action-sub');
    const body = document.getElementById('action-body');
    if (title) title.textContent = 'Юрлицо';
    if (sub) sub.textContent = 'Кабинет показывает данные выбранного юрлица';
    if (body) {
      body.innerHTML = MSP_MIRROR.partners.map((p, i) => `
        <button type="button" class="partner-row${i === mspUi.partner ? ' active' : ''}" data-action="msp-partner-pick" data-i="${i}">
          <span class="partner-row__name">${mEsc2(p.name)}<small>ИНН ${p.inn}</small></span>
          <span class="partner-row__state">${p.brands.length ? `${p.brands.length} бренд(а)` : 'нет брендов'}</span>
        </button>`).join('');
    }
    document.getElementById('action-overlay').classList.add('open');
    document.getElementById('action-sheet').classList.add('open');
    return;
  }

  if (action === 'msp-partner-pick') {
    mspUi.partner = Number(el.dataset.i) || 0;
    mspUi.brand = 0;
    mspUi.point = 0;
    closeActionSheet();
    renderViewPreserveScroll();
    toast('Юрлицо: ' + mspActivePartner().name);
    return;
  }

  if (action === 'msp-brand') {
    mspUi.brand = Number(el.dataset.i) || 0;
    mspUi.point = 0;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-point') {
    mspUi.point = Number(el.dataset.i) || 0;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-sale-scope') {
    mspUi.saleScope = el.dataset.value;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-sale') {
    const pointId = el.dataset.point;
    const pid = el.dataset.pid;
    const brandObj = mspActiveBrand();
    if (!brandObj) return;
    let target = null;
    let targetPoint = null;
    for (const pt of brandObj.points) {
      const found = pt.products.find((x) => x.id === pid && pt.id === pointId);
      if (found) { target = found; targetPoint = pt; break; }
    }
    if (!target) return;
    if (mspUi.saleScope === 'brand') {
      for (const pt of brandObj.points) {
        const twin = pt.products.find((x) => x.id === pid);
        if (twin) twin.on = target.on;
      }
      toast('Применено ко всем точкам бренда', target.name);
    } else {
      target.on = !target.on;
      void targetPoint;
    }
    mspPersist();
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-shop') {
    const point = mspActivePoint();
    point.open = !point.open;
    el.classList.toggle('on', point.open);
    mspPersist();
    toast(point.open ? 'Магазин открыт' : 'Магазин скрыт с витрины');
    return;
  }

  if (action === 'msp-sched-day') {
    const point = mspActivePoint();
    const sched = mspSchedule(point.id);
    sched[el.dataset.day].on = !sched[el.dataset.day].on;
    el.classList.toggle('on', sched[el.dataset.day].on);
    return;
  }

  if (action === 'msp-sched-copyall') {
    const point = mspActivePoint();
    const sched = mspSchedule(point.id);
    const mon = sched['пн'];
    Object.keys(sched).forEach((d) => { sched[d] = { ...mon }; });
    renderViewPreserveScroll();
    toast('Расписание понедельника применено ко всем дням');
    return;
  }

  if (action === 'msp-copy-code') {
    const code = 'VER-1042-77';
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).catch(() => {});
    toast('Код скопирован', code);
    return;
  }

  if (action === 'msp-paid') {
    mspUi.payment = 'verifying';
    renderViewPreserveScroll();
    setTimeout(() => {
      mspUi.payment = 'done';
      if (location.hash === '#/msp') {
        toast('Платёж подтверждён', 'Ваша точка на витрине');
        renderViewPreserveScroll();
      }
    }, 4000);
    return;
  }

  if (action === 'msp-advance') {
    const target = (state.orders || []).find((o) => o.id === el.dataset.id) || ORDERS_MIRROR_SEED.find((o) => o.id === el.dataset.id);
    if (target) {
      target.status = el.dataset.next;
      persist();
      toast('Статус: ' + (MSP_FLOW_LABEL[el.dataset.next] || el.dataset.next));
    }
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-invite') {
    toast('Демо: приглашение по телефону', 'Роль выбирается при приглашении — SZ-047');
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="msp-addr"], [data-action="msp-min"], [data-action^="msp-sched-"]');
  if (!el) return;
  const point = mspActivePoint();
  if (!point) return;
  const a = el.dataset.action;
  if (a === 'msp-addr') point.address = el.value;
  if (a === 'msp-min') point.minOrder = Number(el.value) || 0;
  if (a.startsWith('msp-sched-')) {
    const sched = mspSchedule(point.id);
    const day = sched[el.dataset.day];
    if (day) {
      if (a === 'msp-sched-from') day.from = el.value;
      if (a === 'msp-sched-to') day.to = el.value;
    }
  }
  mspPersist();
});

/* витринные экраны снимают режим кабинета */
new MutationObserver(() => {
  if (!document.querySelector('.msp-cabinet, .rep-cabinet, .amb-cabinet')) {
    document.body.classList.remove('cabinet-mode');
  }
}).observe(document.getElementById('view'), { childList: true });

/* renderMspCabinet — function-декларация dash.js, переопределяем глобально */
window.renderMspCabinet = renderMspMirror;
