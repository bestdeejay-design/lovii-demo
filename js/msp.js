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
    { name: 'АТМОСФЕРА', inn: '7842216839' },
    { name: 'АКСИОМА', inn: '7842223709' },
    { name: 'Grand', inn: '7841000000' },
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

const mspUi = { tab: 'overview', partner: 0, onSale: {} };

/* ---------- Хелперы ---------- */

function mEsc2(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// Статусы заказа МСП (order-status.ts@staging): подписи машинных кодов.
const MSP_STATUS = {
  created: 'Оформлен', submitted: 'Отправлен', accepted: 'Принят', preparing: 'Готовится',
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
  { id: 'products', label: 'Товары', icon: 'package' },
  { id: 'orders', label: 'Заказы', icon: 'bag' },
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
          <p class="cabinet__note">${mEsc2(partner.name)} · ИНН ${partner.inn}</p>
        </div>
        <a class="cabinet__exit" href="#/profile" aria-label="Выйти в профиль клиента" data-testid="cabinet-exit">
          ${icon('logout')}<span>Профиль</span>
        </a>
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
    { id: 'min-order', label: 'Минимальная сумма заказа', done: MSP_MIRROR.branch.minOrder > 0, hint: `${MSP_MIRROR.branch.minOrder} ₽` },
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
  const orders = mspOrdersOf();
  const active = orders.filter((o) => o.status !== 'done').length;
  return `
    <div class="msp-overview">
      <section class="msp-overview__kpi">
        <div class="role-kpi role-kpi_accent">
          <span class="role-kpi__label">Товары точки</span>
          <span class="role-kpi__value">${MSP_MIRROR.branch.offers}</span>
          <span class="role-kpi__sub">позиций в каталоге</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Заказы в работе</span>
          <span class="role-kpi__value">${active}</span>
          <span class="role-kpi__sub">за последние 30 дней</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Расписание</span>
          <span class="role-kpi__value">${mEsc2(MSP_MIRROR.branch.hours)}</span>
          <span class="role-kpi__sub">регулярное расписание</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Мин. сумма</span>
          <span class="role-kpi__value">${MSP_MIRROR.branch.minOrder}&nbsp;₽</span>
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
            <div class="msp-order-row">
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
  const goods = sfStoreGoods('coffee-daily');
  return `
    <div class="msp-products">
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
    <div class="msp-orders">
      <div class="msp-orders__list">
        ${orders.map((o) => `
          <div class="msp-order-row">
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
    <div class="msp-team">
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
  const b = MSP_MIRROR.branch;
  return `
    <div class="msp-settings">
      <section class="role-card">
        <div class="role-section-head"><h2>Настройки точки</h2><span class="role-section-head__sub">${mEsc2(b.name)}</span></div>
        <div class="sf-info-rows" style="padding:0 16px 16px">
          <div><span>Адрес</span><b>${mEsc2(b.address)}</b></div>
          <div><span>Часы работы</span><b>${mEsc2(b.hours)}</b></div>
          <div><span>Минимальная сумма заказа</span><b>${b.minOrder}&nbsp;₽</b></div>
          <div><span>Товаров в каталоге</span><b>${b.offers}</b></div>
          <div><span>Статус точки</span><b>Активна</b></div>
        </div>
      </section>
    </div>`;
}

/* ---------- Экран ---------- */

function renderMspMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = mspUi.tab === 'products' ? mspProducts()
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

  if (action === 'msp-invite') {
    toast('Демо: приглашение по телефону', 'Роль выбирается при приглашении — SZ-047');
  }
});

/* перерисовка витринных экранов снимает режим кабинета */
const _mspObserver = new MutationObserver(() => {
  if (!document.querySelector('.msp-cabinet')) document.body.classList.remove('cabinet-mode');
});
_mspObserver.observe(document.getElementById('view'), { childList: true, subtree: false });

/* renderMspCabinet — function-декларация dash.js, переопределяем глобально */
window.renderMspCabinet = renderMspMirror;
