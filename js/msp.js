/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · КАБИНЕТ МСП (#/msp)
 * Перенос CabinetLayout.vue + MspOverview/MspStarter/MspProducts/
 * MspOrders/MspTeam/MspBranchSettings из lovii-app@staging в демо.
 * Кабинет живёт вне витрины: свой ролевой хедер и свой нижний бар
 * разделов (основные NavBar/хедер скрываются на время кабинета).
 * Данные — статический сид (юрлица, точка, команда) + демо-заказы.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. Ветка v1:
 * «Счёт верификации» (MspPayment) и полные «Настройки точки» — следующим
 * шагом, сейчас настройки точки показаны читабельным списком.
 * ============================================================ */

/* ---------- Сид кабинета (мир владельца: 3 юрлица) ---------- */

const MSP_MIRROR = {
  partners: [
    { name: 'АТМОСФЕРА', inn: '7842216839', slug: 'coffee-daily',
      branch: { name: 'Кофейня «Daily» · Тверская', offers: 7, minOrder: 500, address: 'ул. Тверская, 12' } },
    { name: 'АКСИОМА', inn: '7842223709', branch: null },
    { name: 'Grand', inn: '7841000000', slug: null,
      branch: { name: 'Grand Burger · Арбат', offers: 0, minOrder: 300, address: 'ул. Арбат, 38' } },
  ],
  branch: {
    name: 'Кофейня «Daily» · Тверская',
    offers: 7,
    hours: '09:00–22:00',
    minOrder: 500,
    address: 'ул. Тверская, 12',
  },
  team: [
    { name: 'Александра', role: 'Администратор', note: 'Товары · Заказы · Команда', phone: '+7 926 ••••-45-67' },
    { name: 'Максим', role: 'Сотрудник', note: 'Только заказы', phone: '+7 999 ••••-11-22' },
  ],
};

const mspUi = { tab: 'overview', partner: 0, onSale: {}, payment: 'await' };

/* Настройки точки — персист в localStorage (lv_msp_mirror) */
function mspSettingsState() {
  if (!mspUi.set) {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('lv_msp_mirror') || '{}'); } catch { /* приватный режим */ }
    mspUi.set = {
      open: saved.open !== false,
      sched: saved.sched || {
        пн: { on: true, from: '09:00', to: '22:00' }, вт: { on: true, from: '09:00', to: '22:00' },
        ср: { on: true, from: '09:00', to: '22:00' }, чт: { on: true, from: '09:00', to: '22:00' },
        пт: { on: true, from: '09:00', to: '22:00' }, сб: { on: true, from: '10:00', to: '22:00' },
        вс: { on: false, from: '10:00', to: '20:00' },
      },
      minOrder: saved.minOrder ?? MSP_MIRROR.branch.minOrder,
      address: saved.address || MSP_MIRROR.branch.address,
    };
  }
  return mspUi.set;
}
function mspSaveSettings() {
  try { localStorage.setItem('lv_msp_mirror', JSON.stringify(mspUi.set)); } catch { /* приватный режим */ }
}

function mspActivePartner() {
  return MSP_MIRROR.partners[mspUi.partner] || MSP_MIRROR.partners[0];
}

/* Первый рабочий день недели → подпись «09:00–22:00» для KPI */
function mspScheduleLabel() {
  const sched = mspSettingsState().sched;
  const first = Object.values(sched).find((d) => d.on);
  return first ? `${first.from}–${first.to}` : 'выходной';
}

/* ---------- Хелперы ---------- */

function mEsc2(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// Статусы заказа МСП (order-status.ts@staging): подписи машинных кодов.
const MSP_STATUS = {
  created: 'Оформлен', submitted: 'Отправлен', accepted: 'Принят', preparing: 'Готовится', cooking: 'Готовится',
  ready: 'Готов', delivered: 'Доставлен', handed: 'Выдан клиенту', completed: 'Выполнен', canceled: 'Отменён',
};

function mspOrderStatus(order) {
  return MSP_STATUS[order.status] || 'Выполнен';
}

function mspOrdersOf(branchName) {
  // заказы демо, относящиеся к точке (по имени заведения)
  return oAllOrders().filter((o) => (o.merchant?.name || '').includes('Кофейня'));
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
  const partner = MSP_MIRROR.partners[mspUi.partner];
  return `
    <div class="msp-cabinet">
      <header class="cabinet__head">
        <span class="cabinet__ava" aria-hidden="true">${icon('store')}</span>
        <div class="cabinet__titles">
          <h1 class="cabinet__title">МСП · точка</h1>
          <button type="button" class="cabinet__partner" data-action="msp-partner" aria-label="Сменить юрлицо">
            ${mEsc2(partner.name)} · ИНН ${partner.inn} ${icon('chev-down')}
          </button>
        </div>
      </header>

      <main class="cabinet__body container">${inner}</main>

      <nav class="cabinet__bar" aria-label="Разделы кабинета">
        <div class="cabinet__bar-in">
          ${MSP_TABS.map((t) => `
            <button type="button" class="cabinet__bar-link${mspUi.tab === t.id ? ' cabinet__bar-link--active' : ''}"
              data-action="msp-tab" data-tab="${t.id}" data-testid="cabinet-tab-${t.id}">
              <span class="cabinet__bar-ico">${icon(t.icon)}</span>
              <span class="cabinet__bar-ind"></span>
              <span class="cabinet__bar-label">${t.label}</span>
            </button>`).join('')}
        </div>
      </nav>
    </div>`;
}

/* ---------- Запуск точки (readiness.ts + MspStarter) ---------- */

function mspStarter() {
  const steps = [
    { id: 'showcase', label: 'Витрина опубликована', done: true },
    { id: 'offers', label: 'Товары загружены', done: MSP_MIRROR.branch.offers > 0, hint: `${MSP_MIRROR.branch.offers} позиций в каталоге` },
    { id: 'schedule', label: 'Расписание заполнено', done: true, hint: MSP_MIRROR.branch.hours },
    { id: 'min-order', label: 'Минимальная сумма заказа', done: (mspSettingsState().minOrder || 0) > 0, hint: `${mspSettingsState().minOrder || 500} ₽` },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  return `
    <section class="role-card msp-starter__card">
      <div class="role-section-head"><h2>Запуск точки</h2><span class="role-section-head__sub">${mEsc2(MSP_MIRROR.branch.name)}</span></div>
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
  const orders = mspOrdersOf();
  const active = orders.filter((o) => o.status !== 'done').length;
  const payLabel = mspUi.payment === 'done' ? 'Оплачен' : mspUi.payment === 'verifying' ? 'Идёт комплаенс' : 'Ждёт оплаты';

  /* SZ-050: пустые состояния юрлица — честно, без выдуманных цифр */
  if (!partner.branch) {
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
  return `
    <div class="msp-overview cabinet-screen">
      <section class="role-card" style="padding:12px 16px 12px">
        <div class="msp-order-row" data-action="msp-payment" role="button" style="border:0;padding:0">
          <span class="msp-order-row__ico">${icon('banknote')}</span>
          <div class="msp-order-row__mid">
            <div class="msp-order-row__name">Счёт верификации · 1 ₽</div>
            <div class="msp-order-row__meta">Проверочный платёж с расчётного счёта компании</div>
          </div>
          <span class="role-tag">${payLabel}</span>
        </div>
      </section>
      <section class="msp-overview__kpi">
        <div class="role-kpi role-kpi_accent">
          <span class="role-kpi__label">Товары точки</span>
          <span class="role-kpi__value">${partner.branch.offers}</span>
          <span class="role-kpi__sub">позиций в каталоге</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Заказы в работе</span>
          <span class="role-kpi__value">${active}</span>
          <span class="role-kpi__sub">за последние 30 дней</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Расписание</span>
          <span class="role-kpi__value">${mEsc2(mspScheduleLabel())}</span>
          <span class="role-kpi__sub">регулярное расписание</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Мин. сумма</span>
          <span class="role-kpi__value">${mspSettingsState().minOrder || 0}&nbsp;₽</span>
          <span class="role-kpi__sub">на заказ доставке</span>
        </div>
      </section>

      ${mspStarter()}

      <section class="role-card">
        <div class="role-section-head"><h2>Последние заказы</h2>
          <button type="button" class="role-link" data-action="msp-tab" data-tab="orders">Все заказы</button>
        </div>
        <div class="msp-orders__list">
          ${orders.slice(0, 3).map((o) => `
            <div class="msp-order-row is-link" role="button" tabindex="0" data-action="msp-order" data-id="${o.id}">
              <span class="msp-order-row__ico">${icon('bag')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">Заказ №${oEsc(o.id)} · ${oFmt(o.total)}&nbsp;₽</div>
                <div class="msp-order-row__meta">${oDate(o.createdAt)} · ${o.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}</div>
              </div>
              <span class="role-tag">${mspOrderStatus(o)}</span>
            </div>`).join('') || '<p class="stores__noresult">Заказов пока нет</p>'}
        </div>
      </section>
    </div>`;
}

/* ---------- Товары (MspProducts) ---------- */

function mspProducts() {
  const partner = mspActivePartner();
  if (!partner.branch || !partner.slug) {
    return `<div class="msp-products cabinet-screen"><section class="role-card" style="padding:16px"><p class="role-empty__text" style="margin:0">У этого юрлица пока нет товаров — добавьте первый в каталог точки.</p></section></div>`;
  }
  const goods = sfStoreGoods(partner.slug);
  return `
    <div class="msp-products cabinet-screen">
      ${Object.entries(goods.items).map(([catId, items]) => {
        const cat = goods.cats.find((c) => c.id === catId);
        return `
          <section class="role-card">
            <div class="role-section-head"><h2>${mEsc2(cat ? cat.name : 'Товары')}</h2>
              <span class="role-section-head__sub">${items.length}</span></div>
            <div class="msp-products__list">
              ${items.map((p) => {
                const on = mspUi.onSale[p.id] !== false;
                return `
                  <div class="msp-product-row">
                    <span class="msp-product-row__thumb" style="background-color:${p.bg}"><i class="sf-emoji sf-emoji-xs">${p.e}</i></span>
                    <div class="msp-product-row__mid">
                      <div class="msp-product-row__name">${mEsc2(p.t)}</div>
                      <div class="msp-product-row__meta">${oFmt(p.price)}&nbsp;₽ · ${mEsc2(p.unit || '1 шт')}</div>
                    </div>
                    <button type="button" class="app-switch${on ? ' on' : ''}" aria-label="В продаже" data-action="msp-sale" data-slug="${p.id}"><span class="app-switch__knob"></span></button>
                  </div>`;
              }).join('')}
            </div>
          </section>`;
      }).join('')}
    </div>`;
}

/* ---------- Заказы (MspOrders) ---------- */

function mspOrders() {
  const orders = mspOrdersOf();
  return `
    <div class="msp-orders cabinet-screen">
      <div class="msp-orders__list">
        ${orders.map((o) => `
          <div class="msp-order-row is-link" role="button" tabindex="0" data-action="msp-order" data-id="${o.id}">
            <span class="msp-order-row__ico">${icon('bag')}</span>
            <div class="msp-order-row__mid">
              <div class="msp-order-row__name">Заказ №${oEsc(o.id)} · ${oFmt(o.total)}&nbsp;₽</div>
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

/* ---------- Настройки точки (MspBranchSettings, v1 — чтение) ---------- */

function mspSettings() {
  const st = mspSettingsState();
  const days = Object.keys(st.sched);
  return `
    <div class="msp-settings cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Магазин</h2><span class="role-section-head__sub">видно клиентам</span></div>
        <div style="padding:12px 16px 16px">
          <div class="msp-order-row" style="border:0;padding:0">
            <span class="msp-order-row__ico" style="background:var(--lv-soft-tiffany);color:var(--lv-tiffany-text)">${icon('store')}</span>
            <div class="msp-order-row__mid">
              <div class="msp-order-row__name">Магазин открыт</div>
              <div class="msp-order-row__meta">Выключишь — точка скроется с витрины</div>
            </div>
            <button type="button" class="app-switch${st.open ? ' on' : ''}" data-action="msp-shop"><span class="app-switch__knob"></span></button>
          </div>
        </div>
      </section>

      <section class="role-card">
        <div class="role-section-head"><h2>Точка</h2><span class="role-section-head__sub">${mEsc2(MSP_MIRROR.branch.name)}</span></div>
        <div style="padding:12px 16px 16px;display:grid;gap:10px">
          <label class="sf-search"><input type="text" placeholder="Адрес" value="${mEsc2(st.address)}" data-action="msp-addr"></label>
          <p class="tier__cta-note" style="margin:0">Часы работы по дням · выключенный день = выходной</p>
          <div class="msp-sched">
            ${days.map((d) => {
              const row = st.sched[d];
              return `
                <div class="msp-sched__row">
                  <span class="msp-sched__day">${d}</span>
                  <label class="msp-time">с <input type="time" value="${row.from}" data-action="msp-sched-from" data-day="${d}"></label>
                  <label class="msp-time">до <input type="time" value="${row.to}" data-action="msp-sched-to" data-day="${d}"></label>
                  <button type="button" class="app-switch${row.on ? ' on' : ''}" aria-label="Рабочий день" data-action="msp-sched-day" data-day="${d}"><span class="app-switch__knob"></span></button>
                </div>`;
            }).join('')}
          </div>
          <button type="button" class="role-link" data-action="msp-sched-copyall">Применить понедельник ко всем дням</button>
        </div>
      </section>

      <section class="role-card">
        <div class="role-section-head"><h2>Минимальная сумма заказа</h2></div>
        <div style="padding:12px 16px 16px">
          <div class="sf-search"><input type="number" min="0" placeholder="Рекомендованный минимум — 500 ₽" value="${st.minOrder || ''}" data-action="msp-min"></div>
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
      </section>

      <section class="role-card" style="padding:16px">
        <button type="button" class="acct__btn acct__btn_brand" data-action="msp-paid">Я оплатил, проверьте</button>
        <p class="tier__cta-note">Нажимайте после отправки платежа — дальше ждём подтверждение банка</p>
      </section>`}
    </div>`;
}

/* ---------- Экран ---------- */

/* Статусная машина заказа точки (order-status.ts): подписи переходов */
const MSP_FLOW = ['created', 'submitted', 'accepted', 'preparing', 'ready', 'handed'];
const MSP_FLOW_LABEL = {
  created: 'Клиент оформил заказ', submitted: 'Оплатил и отправил', accepted: 'Точка приняла',
  preparing: 'Готовится', ready: 'Приготовлен', handed: 'Выдан клиенту',
};

function mspOrderIdx(status) {
  return { created: 0, submitted: 1, accepted: 2, cooking: 3, preparing: 3, ready: 4, done: 6, handed: 6 }[status] ?? 0;
}

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

/* уходя с кабинета, вернуть витринный хедер и навигацию */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="msp-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'msp-tab') {
    mspUi.tab = el.dataset.tab;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'msp-sale') {
    mspUi.onSale[el.dataset.slug] = mspUi.onSale[el.dataset.slug] === false ? true : false;
    el.classList.toggle('on');
    toast(mspUi.onSale[el.dataset.slug] === false ? 'Снят с продажи' : 'В продаже');
    return;
  }

  if (action === 'msp-order') {
    mspUi.order = el.dataset.id;
    mspUi.tab = 'order';
    renderViewPreserveScroll();
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
    return;
  }

  if (action === 'msp-payment') {
    mspUi.tab = 'payment';
    renderViewPreserveScroll();
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
      mspSaveSettings();
      if (location.hash === '#/msp') {
        toast('Платёж подтверждён', 'Ваша точка на витрине');
        renderViewPreserveScroll();
      }
    }, 4000);
    return;
  }

  if (action === 'msp-shop') {
    const st = mspSettingsState();
    st.open = !st.open;
    mspSaveSettings();
    el.classList.toggle('on', st.open);
    toast(st.open ? 'Магазин открыт' : 'Магазин скрыт с витрины');
    return;
  }

  if (action === 'msp-day') {
    const st = mspSettingsState();
    st.days[el.dataset.day] = st.days[el.dataset.day] ? 0 : 1;
    el.classList.toggle('active', !!st.days[el.dataset.day]);
    return;
  }

  if (action === 'msp-save') {
    mspSaveSettings();
    toast('Настройки точки сохранены');
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
          <span class="partner-row__state">${p.branch ? '1 точка' : 'нет брендов'}</span>
        </button>`).join('');
    }
    document.getElementById('action-overlay').classList.add('open');
    document.getElementById('action-sheet').classList.add('open');
    return;
  }

  if (action === 'msp-partner-pick') {
    mspUi.partner = Number(el.dataset.i) || 0;
    closeActionSheet();
    renderViewPreserveScroll();
    toast('Юрлицо: ' + (mspActivePartner().name));
    return;
  }

  if (action === 'msp-sched-day') {
    const st = mspSettingsState();
    st.sched[el.dataset.day].on = !st.sched[el.dataset.day].on;
    el.classList.toggle('on', st.sched[el.dataset.day].on);
    mspSaveSettings();
    return;
  }

  if (action === 'msp-sched-copyall') {
    const st = mspSettingsState();
    const mon = st.sched['пн'];
    Object.keys(st.sched).forEach((d) => { st.sched[d] = { ...mon }; });
    mspSaveSettings();
    renderViewPreserveScroll();
    toast('Расписание понедельника применено ко всем дням');
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action^="msp-sched-"]');
  if (!el) return;
  const st = mspSettingsState();
  const day = st.sched[el.dataset.day];
  if (!day) return;
  if (el.dataset.action === 'msp-sched-from') day.from = el.value;
  if (el.dataset.action === 'msp-sched-to') day.to = el.value;
  mspSaveSettings();
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action^="msp-"]');
  if (!el) return;
  const st = mspSettingsState();
  const a = el.dataset.action;
  if (a === 'msp-addr') st.address = el.value;
  if (a === 'msp-min') st.minOrder = Number(el.value) || 0;
  if (a === 'msp-time-from') st.from = el.value;
  if (a === 'msp-time-to') st.to = el.value;
  mspSaveSettings();
});

/* перерисовка витринных экранов снимает режим кабинета */
const _mspObserver = new MutationObserver(() => {
  if (!document.querySelector('.msp-cabinet, .rep-cabinet, .amb-cabinet')) document.body.classList.remove('cabinet-mode');
});
_mspObserver.observe(document.getElementById('view'), { childList: true, subtree: false });

/* renderMspCabinet — function-декларация dash.js, переопределяем глобально */
window.renderMspCabinet = renderMspMirror;
