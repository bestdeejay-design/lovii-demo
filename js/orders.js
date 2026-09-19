/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · КОРЗИНА, ОФОРМЛЕНИЕ ЗАКАЗА, ИСТОРИЯ ЗАКАЗОВ
 * Перенос CartModule.vue (CartInfo/CartProduct/CartEmpty),
 * CreateOrder.vue (DeliveryType/Recipient/Products/Success) и
 * OrdersModule.vue (OrderPreview) из lovii-app@staging в демо.
 * Корзина и заказы живут в демо-состоянии (state.cart / state.orders).
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19.
 * ============================================================ */

/* ---------- Сид истории заказов (витрина выглядит живой) ---------- */

const ORDERS_MIRROR_SEED = [
  {
    id: 'L8K2M4',
    createdAt: Date.now() - 3 * 86_400_000,
    status: 'done',
    deliveryType: 'pickup',
    address: '',
    merchant: { name: 'Кофейня «Daily»', emoji: '☕', bg: '#f4e9dd' },
    items: [
      { slug: 'cd1', name: 'Капучино', emoji: '☕', bg: '#f4e9dd', price: 220, qty: 2 },
      { slug: 'cd4', name: 'Круассан с миндалём', emoji: '🥐', bg: '#fdf3d8', price: 164, qty: 1 },
    ],
    subtotal: 604, total: 604,
  },
  {
    id: 'L7Q9X1',
    createdAt: Date.now() - 9 * 86_400_000,
    status: 'done',
    deliveryType: 'delivery',
    address: 'ул. Тверская, 12',
    merchant: { name: 'Бургерная «Гриль»', emoji: '🍔', bg: '#ffe8e0' },
    items: [
      { slug: 'gr1', name: 'Бургер классический', emoji: '🍔', bg: '#ffe8e0', price: 390, qty: 2 },
      { slug: 'gr2', name: 'Картофель фри', emoji: '🍟', bg: '#fdf3d8', price: 160, qty: 1 },
    ],
    subtotal: 940, total: 940,
  },
];

const ORDER_STATUS = {
  cooking: { label: 'Готовится', color: 'gold' },
  ready: { label: 'Готов к выдаче', color: 'brand' },
  done: { label: 'Выполнен', color: 'tertiary' },
};

/* ---------- Хелперы ---------- */

function oEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function oFmt(n) {
  return Math.round(Math.abs(n)).toLocaleString('ru-RU');
}

function oDate(ts) {
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function oAllOrders() {
  // легаси-заказы старых экранов демо нормализуем к зеркальной форме
  const legacy = (state.orders || []).map((o) => ({
    ...o,
    status: o.status || 'done',
    deliveryType: o.deliveryType || 'pickup',
    address: o.address || '',
    merchant: o.merchant || { name: o.pickupStore || 'Точка', emoji: o.items?.[0]?.emoji || '🛍️', bg: o.items?.[0]?.bg || '#eee' },
    subtotal: o.subtotal ?? o.total,
  }));
  return [...legacy, ...ORDERS_MIRROR_SEED];
}

function oBadge(status) {
  const meta = ORDER_STATUS[status] || ORDER_STATUS.done;
  return `<span class="app-badge app-badge_${meta.color} app-badge_s">${meta.label}</span>`;
}

/* ---------- Корзина (CartModule) ---------- */

function oCartGroups() {
  const map = new Map();
  for (const item of state.cart) {
    if (!map.has(item.storeSlug)) map.set(item.storeSlug, []);
    map.get(item.storeSlug).push(item);
  }
  return [...map.entries()].map(([slug, items]) => {
    const store = sfFindStore(slug);
    return {
      slug,
      store,
      name: store ? store.name : items[0].storeName || 'Точка',
      emoji: store ? store.emoji : '🛍️',
      bg: store ? store.logoBg : '#eee',
      minOrder: store ? store.minOrder : 0,
      items,
      subtotal: items.reduce((s, c) => s + c.price * c.qty, 0),
    };
  });
}

function oCartProductRow(cart, item) {
  return `
    <div class="cart-product">
      <span style="background-color:${item.bg || '#eee'}"><i class="sf-emoji sf-emoji-sm">${item.emoji}</i></span>
      <div class="cart-product__info">
        <h5>${oEsc(item.name)}</h5>
        <p>${oFmt(item.price)}&nbsp;₽</p>
        <div class="cart-product__counter">
          <button type="button" aria-label="Меньше" data-action="o-dec" data-store="${oEsc(cart.slug)}" data-slug="${oEsc(item.slug)}">${icon('minus')}</button>
          <span>${item.qty}</span>
          <button type="button" aria-label="Больше" data-action="sf-add" data-store="${oEsc(cart.slug)}" data-slug="${oEsc(item.slug)}">${icon('plus')}</button>
        </div>
      </div>
    </div>`;
}

function renderCartMirror() {
  const carts = oCartGroups();

  if (!carts.length) {
    return `
      <main class="cart container">
        <section class="cart-empty">
          <div class="cart-empty__content">
            <span>${icon('cart')}</span>
            <h4>Корзина пуста</h4>
            <p>Добавьте товары из заведений, чтобы оформить заказ</p>
          </div>
          <div class="cart-empty__action"><a href="#/stores" class="acct__btn acct__btn_brand" style="min-width:200px">К заведениям</a></div>
        </section>
      </main>`;
  }

  const slug = (state.cartTab && carts.some((c) => c.slug === state.cartTab)) ? state.cartTab : carts[0].slug;
  const cart = carts.find((c) => c.slug === slug);
  const count = cart.items.reduce((s, c) => s + c.qty, 0);
  const blocked = cart.minOrder > 0 && cart.subtotal < cart.minOrder;

  return `
    <main class="cart container">
      ${carts.length > 1 ? `
        <section class="cart__shops">
          ${carts.map((c) => `
            <button type="button" data-testid="cart-tab" class="${c.slug === slug ? 'active' : ''}" data-action="o-cart-tab" data-slug="${oEsc(c.slug)}">
              <span style="background-color:${c.bg}"><i class="sf-emoji sf-emoji-sm">${c.emoji}</i></span>
              <span>${oEsc(c.name)}</span>
            </button>`).join('')}
        </section>` : ''}

      <section class="cart-info">
        <div class="cart-info__store">
          <span style="background-color:${cart.bg}"><i class="sf-emoji sf-emoji-sm">${cart.emoji}</i></span>
          <p>${oEsc(cart.name)}</p>
        </div>
        <div class="cart-info__products">
          ${cart.items.map((it) => oCartProductRow(cart, it)).join('')}
        </div>
      </section>

      <section class="cart-summary">
        <ul>
          <li>Товары (${count}) <span>${oFmt(cart.subtotal)}&nbsp;₽</span></li>
          <li>Доставка <span>по тарифам заведения</span></li>
        </ul>
        <p>Итого: <span>${oFmt(cart.subtotal)}&nbsp;₽</span></p>
        ${blocked ? `<p class="cart-summary__min-order" role="note">Минимальная сумма заказа — ${oFmt(cart.minOrder)}&nbsp;₽. Добавьте ещё на ${oFmt(cart.minOrder - cart.subtotal)}&nbsp;₽</p>` : ''}
        <a href="${blocked ? '' : `#/checkout/${oEsc(cart.slug)}`}" class="acct__btn acct__btn_brand ${blocked ? 'is-disabled' : ''}" ${blocked ? 'aria-disabled="true" data-action="o-min-blocked"' : ''} data-testid="create-order">Оформить заказ</a>
      </section>
    </main>`;
}

/* ---------- Оформление заказа (CreateOrder) ---------- */

const checkoutUi = { deliveryType: 'pickup', comment: '', placed: null };

function renderCheckoutMirror(slug) {
  // после успешного заказа показываем экран успеха, пока корзина пуста
  if (checkoutUi.placed && checkoutUi.placed.slug === slug) return renderOrderSuccess(checkoutUi.placed);
  if (checkoutUi.placed && oCartGroups().some((c) => c.slug === slug)) checkoutUi.placed = null;
  const cart = oCartGroups().find((c) => c.slug === slug);
  if (!cart) { checkoutUi.placed = null; return renderCartMirror(); }
  const store = cart.store;
  const delivery = checkoutUi.deliveryType === 'delivery';
  const fee = delivery ? 0 : 0; // «по тарифам заведения» — в демо без тарифов
  const total = cart.subtotal + fee;

  return `
    <main class="create-order container">
      <section class="create-order-delivery">
        <h5>Способ получения</h5>
        <div class="seg" role="radiogroup" aria-label="Способ получения">
          <button type="button" class="${!delivery ? 'active' : ''}" data-action="o-delivery" data-val="pickup">Самовывоз</button>
          <button type="button" class="${delivery ? 'active' : ''}" data-action="o-delivery" data-val="delivery">Доставка</button>
        </div>
        ${delivery ? `
          <button type="button" class="create-order-delivery__address" data-action="open-sheet">
            <span class="create-order-delivery__address-empty">Выберите адрес доставки</span>
            ${icon('chev-right')}
          </button>`
        : `
          <div class="create-order-delivery__merchant">
            <span style="background-color:${cart.bg}"><i class="sf-emoji sf-emoji-sm">${cart.emoji}</i></span>
            <p>${oEsc(cart.name)}</p>
          </div>`}
      </section>

      <section class="create-order-recipient">
        <h5>Получатель</h5>
        <div class="sf-search"><input type="text" placeholder="Комментарий заведению" data-action="o-comment"></div>
      </section>

      <section class="create-order-products">
        <h5>Товары</h5>
        <div class="cart-info__products">
          ${cart.items.map((it) => oCartProductRow(cart, it)).join('')}
        </div>
      </section>

      <section class="cart-summary">
        <ul>
          <li>Товары (${cart.items.reduce((s, c) => s + c.qty, 0)}) <span>${oFmt(cart.subtotal)}&nbsp;₽</span></li>
          <li>Доставка <span>${delivery ? 'по тарифам заведения' : 'самовывоз'}</span></li>
        </ul>
      </section>

      <div class="create-order__cta">
        <div class="create-order__total">
          <p>Итого</p>
          <span>${oFmt(total)}&nbsp;₽</span>
        </div>
        <button type="button" class="acct__btn acct__btn_brand" data-testid="place-order" data-action="o-place" data-store="${oEsc(slug)}" data-total="${total}" data-delivery="${delivery ? 'delivery' : 'pickup'}">Создать заказ</button>
      </div>
    </main>`;
}

function oPlaceOrder(slug, total, deliveryType) {
  const cart = oCartGroups().find((c) => c.slug === slug);
  if (!cart) return;
  const order = {
    id: 'L' + Date.now().toString(36).toUpperCase().slice(-6),
    createdAt: Date.now(),
    status: 'cooking',
    deliveryType,
    address: deliveryType === 'delivery' ? 'ул. Тверская, 12' : '',
    merchant: { name: cart.name, emoji: cart.emoji, bg: cart.bg },
    items: cart.items.map((c) => ({ slug: c.slug, name: c.name, emoji: c.emoji, bg: c.bg, price: c.price, qty: c.qty })),
    subtotal: cart.subtotal,
    total,
    // легаси-поля старых экранов демо
    pickupStore: cart.name,
  };
  state.orders = [order, ...state.orders];
  state.cart = state.cart.filter((c) => c.slug !== slug);
  persist();
  return order;
}

function oReceipt(order) {
  return `
    <section class="order-receipt" data-testid="order-receipt">
      <header class="order-receipt__head"><h5>Квитанция</h5><p>№ ${oEsc(order.id)}</p></header>
      <dl class="order-receipt__rows">
        <div><dt>Принят</dt><dd>${oDate(order.createdAt)}</dd></div>
        <div><dt>Точка выдачи</dt><dd>${mEsc2(order.merchant.name)}</dd></div>
        <div><dt>Получение</dt><dd>${order.deliveryType === 'delivery' ? `Доставка · ${mEsc2(order.address)}` : 'Самовывоз'}</dd></div>
        ${order.items.map((it) => `<div><dt>${mEsc2(it.name)} × ${it.qty}</dt><dd>${oFmt(it.price * it.qty)}&nbsp;₽</dd></div>`).join('')}
        <div><dt>Итого</dt><dd>${oFmt(order.total)}&nbsp;₽</dd></div>
      </dl>
      <p class="order-receipt__disc">Квитанция не является фискальным документом и подтверждает только приём заказа. Чек будет доступен после оплаты и подтверждения расчёта.</p>
    </section>`;
}

function renderOrderSuccess(order) {
  return `
    <main class="container">
      <section class="cart-empty" style="padding:28px 16px 20px">
        <div class="cart-empty__content">
          <span>${icon('bag')}</span>
          <h4>Заказ создан успешно</h4>
          <p>Вы можете следить за статусом заказа во вкладке «История заказов» в профиле</p>
        </div>
      </section>
      ${oReceipt(order)}
      <div class="cart-empty__action" style="display:grid;gap:8px;padding:16px">
        <a href="#/orders" class="acct__btn acct__btn_brand">История заказов</a>
        <a href="#/home" class="acct__btn">На главную</a>
      </div>
    </main>`;
}

/* ---------- История заказов (OrdersModule + OrderPreview) ---------- */

function oOrderCard(order) {
  const thumbs = order.items.slice(0, 4).map((it) =>
    `<span style="background-color:${it.bg || '#eee'}"><i class="sf-emoji sf-emoji-xs">${it.emoji}</i></span>`).join('');
  return `
    <a href="#/order/${oEsc(order.id)}" class="order-preview" data-testid="order-card">
      <div class="order-preview__header">
        <span class="order-preview__logo" style="background-color:${order.merchant.bg || '#eee'}"><i class="sf-emoji sf-emoji-sm">${order.merchant.emoji || '🛍️'}</i></span>
        <div class="order-preview__info">
          <h5>${oEsc(order.merchant.name)} ${oBadge(order.status || 'done')}</h5>
          <p>Заказ №${oEsc(order.id)} от ${oDate(order.createdAt)}</p>
          <div class="order-preview__address">
            <span class="app-badge app-badge_tertiary app-badge_xs">${order.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}</span>
            ${order.address ? `<p>${oEsc(order.address)}</p>` : ''}
          </div>
        </div>
      </div>
      <div class="order-preview__footer">
        <div class="order-preview__products">${thumbs}</div>
        <p>${oFmt(order.total)}&nbsp;₽</p>
      </div>
    </a>`;
}

function renderOrdersMirror() {
  const orders = oAllOrders().sort((a, b) => b.createdAt - a.createdAt);
  return `
    <main class="orders container">
      ${orders.length ? `<div class="orders__list">${orders.map(oOrderCard).join('')}</div>`
        : `<section class="cart-empty">
            <div class="cart-empty__content"><span>${icon('package')}</span><h4>Заказов пока нет</h4><p>Оформите первый заказ — история появится здесь</p></div>
          </section>`}
    </main>`;
}

/* ---------- Карточка заказа (ProfileOrder, зеркало v1) ---------- */

function renderOrderDetailMirror(id) {
  const order = oAllOrders().find((o) => o.id === id);
  if (!order) return renderOrdersMirror();
  return `
    <main class="orders container">
      <section class="cart-info">
        <div class="cart-info__store">
          <span style="background-color:${order.merchant.bg || '#eee'}"><i class="sf-emoji sf-emoji-sm">${order.merchant.emoji || '🛍️'}</i></span>
          <p>${oEsc(order.merchant.name)} ${oBadge(order.status || 'done')}</p>
        </div>
        <p class="order-detail__meta">Заказ №${oEsc(order.id)} от ${oDate(order.createdAt)} · ${order.deliveryType === 'delivery' ? `Доставка · ${oEsc(order.address || '')}` : 'Самовывоз'}</p>
        <div class="cart-info__products">
          ${order.items.map((it) => `
            <div class="cart-product">
              <span style="background-color:${it.bg || '#eee'}"><i class="sf-emoji sf-emoji-sm">${it.emoji}</i></span>
              <div class="cart-product__info">
                <h5>${oEsc(it.name)}</h5>
                <p>${oFmt(it.price)}&nbsp;₽ × ${it.qty}</p>
              </div>
            </div>`).join('')}
        </div>
      </section>
      <section class="cart-summary">
        <ul><li>Товары (${order.items.reduce((s, c) => s + c.qty, 0)}) <span>${oFmt(order.subtotal ?? order.total)}&nbsp;₽</span></li></ul>
        <p>Итого: <span>${oFmt(order.total)}&nbsp;₽</span></p>
      </section>
    </main>`;
}

/* ---------- События ---------- */

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="o-comment"]');
  if (el) checkoutUi.comment = el.value;
});


document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="o-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'o-cart-tab') {
    state.cartTab = el.dataset.slug;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'o-dec') {
    changeQty(el.dataset.slug, el.dataset.store, -1);
    renderViewPreserveScroll();
    return;
  }

  if (action === 'o-delivery') {
    checkoutUi.deliveryType = el.dataset.val;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'o-place') {
    const order = oPlaceOrder(el.dataset.store, Number(el.dataset.total), el.dataset.delivery);
    if (order) {
      checkoutUi.placed = { ...order, slug: el.dataset.store };
      toast('Заказ оформлен', `№${order.id} · ${oFmt(order.total)} ₽`);
      renderViewPreserveScroll();
    }
    return;
  }

  if (action === 'o-min-blocked') {
    toast('Минимум заказа не набран', 'Добавьте ещё товаров — сумма подскажет, сколько не хватает');
  }
});

Object.assign(SCREENS, {
  cart: renderCartMirror,
  orders: renderOrdersMirror,
  order: () => renderOrderDetailMirror(state.view.param),
  checkout: () => renderCheckoutMirror(state.view.param),
});
