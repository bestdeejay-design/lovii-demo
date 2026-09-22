/* ============================================================
 * LOVII Демо · ПРОМО-КОНСТРУКТОР ПАРТНЁРА — кабинет МСП (#/msp)
 *
 * Раздел «Промо»: кэшбэк (умолчание + группы) и акции (сумма чека / комбо).
 * Комбо публикуется ТОВАРОМ на витрину, акции — карточками в промо-блок.
 * Подписи кэшбэка добавляются в корзину и чекаут (мост в orders.js).
 *
 * Демо-прототип к SZ-070/SZ-071. Модель и правила — design/loyalty-constructor/.
 * Грузится ПОСЛЕ msp.js/storefront.js/orders.js: дополняет MSP_TABS, оборачивает
 * рендеры покупателя, мутирует сиды витрины (SF_GOODS / VITRINA_MIRROR.promos).
 * ============================================================ */

const LV_KEY = '***';
const LV_DEF_PCT = 5;        // кэшбэк по умолчанию, %
const LV_MAX = 30;           // потолок кэшбэка, %
const LV_MAX_DISCOUNT = 50;  // потолок скидки, %

const LV_CATS = [
  { id: 'drinks', name: 'Напитки', emojis: ['☕', '🥛', '🥤'] },
  { id: 'food', name: 'Еда и десерты', emojis: ['🥐', '🥯', '🍰', '🥪', '🍔', '🍟'] },
  { id: 'grocery', name: 'Продукты', emojis: ['🛒', '🍎', '🧀'] },
];
const LV_GROUP_PCT = { drinks: 10, food: 7, grocery: 5 };

/* Точка МСП → заведение витрины (демо-мост; в продукте — один merchant_id) */
const LV_STORE_BY_BRAND = {
  'Кофейня «Daily»': 'coffee-daily',
  'AXIIOM Coffee': 'coffee-daily',
  'АКСИОМА Маркет': 'u-doma',
  'Grand Burger': 'grill',
};

const lvUi = { sub: 'list', group: null, rule: null };
const LV = { points: {}, index: null };

/* ---------- Состояние ---------- */

function lvCatOf(pr) {
  const c = LV_CATS.find((x) => x.emojis.includes(pr.emoji));
  return c ? c.id : null;
}

function lvDefaults(pt) {
  const groups = [];
  LV_CATS.forEach((c) => {
    const items = pt.products.filter((p) => lvCatOf(p) === c.id);
    if (!items.length) return;
    groups.push({ id: 'g_' + c.id, name: c.name, cat: c.id, percent: LV_GROUP_PCT[c.id] || LV_DEF_PCT, on: true, add: [], drop: [] });
  });
  const rules = [
    { id: 'r_thr', type: 'threshold', name: '', minSum: 2000, mode: 'gift', addPercent: 2, giftPid: (pt.products[0] || {}).id || null, on: true, published: false },
  ];
  return { def: { percent: LV_DEF_PCT, on: true }, groups, rules };
}

function lvMigrate(st) {
  if (!Array.isArray(st.groups)) st.groups = [];
  if (!Array.isArray(st.rules)) st.rules = [];
  st.groups.forEach((g) => { if (!Array.isArray(g.add)) g.add = []; if (!Array.isArray(g.drop)) g.drop = []; });
  return st;
}

function lvState(pt) {
  if (!LV.points[pt.id]) {
    let saved = null;
    try { saved = (JSON.parse(localStorage.getItem(LV_KEY) || '{}') || {})[pt.id] || null; } catch { /* приватный режим */ }
    LV.points[pt.id] = saved && saved.def ? lvMigrate(saved) : lvDefaults(pt);
  }
  return LV.points[pt.id];
}

function lvSave() {
  try { localStorage.setItem(LV_KEY, JSON.stringify(LV.points)); } catch { /* приватный режим */ }
}

/* ---------- Кэшбэк: процент по позиции ---------- */

function lvInGroup(pt, g, pr) {
  const inCat = !!g.cat && lvCatOf(pr) === g.cat;
  if (g.drop.includes(pr.id)) return false;
  if (g.add.includes(pr.id)) return true;
  return inCat;
}

function lvToggleProduct(pt, g, pr) {
  const was = lvInGroup(pt, g, pr);
  const inCat = !!g.cat && lvCatOf(pr) === g.cat;
  if (was) {
    g.add = g.add.filter((x) => x !== pr.id);
    if (inCat && !g.drop.includes(pr.id)) g.drop.push(pr.id);
  } else {
    g.drop = g.drop.filter((x) => x !== pr.id);
    if (!inCat && !g.add.includes(pr.id)) g.add.push(pr.id);
  }
}

function lvPercentFor(pt, state, pr) {
  for (const g of state.groups) if (g.on && lvInGroup(pt, g, pr)) return g.percent;
  return state.def.on ? state.def.percent : 0;
}

function lvGroupProducts(pt, g) {
  return pt.products.filter((p) => lvInGroup(pt, g, p));
}

function lvSummary(pt, state) {
  const items = pt.products.filter((p) => p.on);
  const inGroups = items.filter((p) => state.groups.some((g) => g.on && lvInGroup(pt, g, p))).length;
  const priceSum = items.reduce((s, p) => s + p.price, 0) || 1;
  const weighted = items.reduce((s, p) => s + p.price * lvPercentFor(pt, state, p), 0) / priceSum;
  return { total: items.length, inGroups, weighted, promos: state.rules.filter((r) => r.on).length };
}

function lvPlural(n, one, few, many) {
  const m10 = n % 10; const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function lvRuleTitle(rule, pt) {
  if (rule.type === 'combo') {
    const items = rule.items.map((id) => pt.products.find((p) => p.id === id)).filter(Boolean);
    return 'Комбо: ' + (items.map((i) => i.name).join(' + ') || 'выберите товары');
  }
  if (rule.type === 'threshold') {
    const sum = oFmt(rule.minSum) + ' ₽';
    return rule.mode === 'gift' ? `Подарок к чеку от ${sum}` : `Кэшбэк +${rule.addPercent}% от ${sum}`;
  }
  return rule.name || 'Акция';
}

function lvRuleMeta(rule, pt) {
  if (rule.type === 'combo') {
    const items = rule.items.map((id) => pt.products.find((p) => p.id === id)).filter(Boolean);
    const sum = items.reduce((s, i) => s + i.price, 0);
    const price = Math.round(sum * (100 - rule.percent) / 100);
    return `${items.length} ${lvPlural(items.length, 'товар', 'товара', 'товаров')} · ${oFmt(price)} ₽ вместо ${oFmt(sum)} ₽`;
  }
  if (rule.type === 'threshold') {
    if (rule.mode === 'gift') {
      const g = pt.products.find((p) => p.id === rule.giftPid);
      return g ? `Подарок: ${g.name}` : 'Подарок не выбран';
    }
    return `Кэшбэк на весь чек +${rule.addPercent}%`;
  }
  return '';
}

/* ---------- Мост на витрину ---------- */

function lvPointsIndex() {
  if (LV.index) return LV.index;
  LV.index = {};
  for (const p of MSP_MIRROR.partners) {
    for (const b of p.brands) {
      const slug = LV_STORE_BY_BRAND[b.name];
      if (slug) for (const pt of b.points) if (!LV.index[slug]) LV.index[slug] = pt;
    }
  }
  return LV.index;
}

function lvPointByStore(slug) { return lvPointsIndex()[slug] || null; }

function lvComboItems(pt, rule) {
  return rule.items.map((id) => pt.products.find((p) => p.id === id)).filter(Boolean);
}

/* Публикация комбо товаром: добавляем оффер в каталог заведения витрины */
function lvPublishCombo(pt, rule) {
  const slug = rule.storeSlug || LV_STORE_BY_BRAND[(mspActiveBrand() || {}).name];
  const pack = slug && typeof SF_GOODS !== 'undefined' ? SF_GOODS[slug] : null;
  if (!pack) return false;
  const items = lvComboItems(pt, rule);
  if (items.length < 2) return false;

  const catKey = Object.keys(pack.items)[0];
  const id = 'combo_' + pt.id + '_' + rule.id;
  const sum = items.reduce((s, i) => s + i.price, 0);
  const price = Math.round(sum * (100 - rule.percent) / 100);
  if (!pack.items[catKey].some((p) => p.id === id)) {
    pack.items[catKey].push({
      id, t: lvRuleTitle(rule, pt), e: items[0].emoji, bg: '#ffe8e0',
      price, old: sum, unit: 'комбо', combo: true, parts: items.map((i) => i.name),
    });
  }
  rule.published = true; rule.productId = id; rule.storeSlug = slug;
  lvPromoCard(rule, pt, 'Комбо со скидкой', `${items.map((i) => i.name).join(' + ')} · −${rule.percent}%`, 'сейчас');
  lvSave();
  return true;
}

/* Публикация акции карточкой в промо-блок главной */
function lvPromoCard(rule, pt, title, sub, deadline) {
  if (typeof VITRINA_MIRROR === 'undefined' || !Array.isArray(VITRINA_MIRROR.promos)) return;
  const key = 'lv_' + pt.id + '_' + rule.id;
  const card = {
    key, title, sub, deadline,
    store: (mspActiveBrand() || {}).name || 'Ваша точка',
    grad: 'linear-gradient(135deg, #402435 0%, #2a1622 100%)', accent: '#f64a8a',
  };
  const i = VITRINA_MIRROR.promos.findIndex((p) => p.key === key);
  if (i >= 0) VITRINA_MIRROR.promos[i] = card; else VITRINA_MIRROR.promos.unshift(card);
}

function lvPublishPromo(pt, rule) {
  if (rule.type === 'combo') return lvPublishCombo(pt, rule);
  const title = rule.mode === 'gift' ? 'Подарок к заказу' : `Кэшбэк +${rule.addPercent}%`;
  const sub = rule.mode === 'gift'
    ? `при чеке от ${oFmt(rule.minSum)} ₽`
    : `на чек от ${oFmt(rule.minSum)} ₽`;
  rule.published = true;
  lvPromoCard(rule, pt, title, sub, `от ${oFmt(rule.minSum)} ₽`);
  lvSave();
  return true;
}

/* ---------- Кэшбэк в корзине/чекауте ---------- */

function lvCartPercent(slug, item) {
  const pt = lvPointByStore(slug);
  if (!pt) return 0;
  const st = lvState(pt);
  const cat = lvCatOf({ emoji: item.emoji });
  if (cat) { const g = st.groups.find((x) => x.on && x.cat === cat); if (g) return g.percent; }
  return st.def.on ? st.def.percent : 0;
}

function lvCartBonus(cart) {
  const pt = lvPointByStore(cart.slug);
  if (!pt) return null;
  const st = lvState(pt);
  let bonus = 0; let any = false;
  for (const it of cart.items) {
    const pct = lvCartPercent(cart.slug, it);
    if (pct > 0) { any = true; bonus += Math.round(it.price * it.qty * pct / 100); }
  }
  let extraPct = 0; const gifts = [];
  for (const r of st.rules.filter((x) => x.on && x.published && x.type === 'threshold')) {
    if (cart.subtotal < r.minSum) continue;
    if (r.mode === 'cashback') extraPct += r.addPercent;
    else { const g = pt.products.find((p) => p.id === r.giftPid); if (g) gifts.push(g); }
  }
  if (extraPct) bonus += Math.round(cart.subtotal * extraPct / 100);
  if (!any && !extraPct && !gifts.length) return null;
  return { bonus, extraPct, gifts };
}

/* Оборачиваем строку корзины: подпись кэшбэка под ценой (разметка корзины: .row-item > .ri-mid > .sb) */
(function lvWrapCartRows() {
  if (typeof window.oCartProductRow !== 'function') return;
  const prev = window.oCartProductRow;
  window.oCartProductRow = function (cart, item) {
    let html = prev.apply(this, arguments);
    const pct = lvCartPercent(cart.slug, item);
    if (pct > 0) {
      const amount = Math.round(item.price * item.qty * pct / 100);
      const cb = `<div class="lv-cb">Кэшбэк ${pct}% · +${oFmt(amount)} балл.</div>`;
      html = html.replace(/(<div class="sb">[\s\S]*?<\/div>)/, `$1${cb}`);
    }
    return html;
  };
})();

/* Строки «кэшбэк/подарок» в блок итогов корзины (перед суммой) и чекаута */
function lvBonusRows(cart) {
  const b = lvCartBonus(cart);
  if (!b) return '';
  let out = '';
  if (b.bonus > 0) out += `<div class="sum-row lv-cb-row"><span>Кэшбэк баллами</span><span class="v">+${oFmt(b.bonus)} балл.</span></div>`;
  b.gifts.forEach((g) => { out += `<div class="sum-row lv-cb-row"><span>Подарок · ${mEsc2(g.name)}</span><span class="v">0 ₽</span></div>`; });
  return out;
}

function lvInjectBonus(html, cart) {
  const rows = lvBonusRows(cart);
  if (!rows) return html;
  if (html.includes('<div class="sum-div"></div>')) {
    return html.replace('<div class="sum-div"></div>', rows + '<div class="sum-div"></div>');
  }
  if (html.includes('<div class="create-order__cta">')) {
    return html.replace('<div class="create-order__cta">', `<section class="card cart-summary">${rows}</section><div class="create-order__cta">`);
  }
  return html;
}

/* Корзина: SCREENS.cart держит ссылку — патчим её напрямую */
(function lvWrapCartScreen() {
  if (typeof SCREENS === 'undefined' || typeof SCREENS.cart !== 'function') return;
  const orig = SCREENS.cart;
  SCREENS.cart = function () {
    const html = orig.apply(this, arguments);
    const carts = oCartGroups();
    if (!carts.length) return html;
    const slug = (state.cartTab && carts.some((c) => c.slug === state.cartTab)) ? state.cartTab : carts[0].slug;
    return lvInjectBonus(html, carts.find((c) => c.slug === slug));
  };
})();

/* Чекаут: SCREENS.checkout вызывает renderCheckoutMirror по имени — оборачиваем функцию */
(function lvWrapCheckoutScreen() {
  if (typeof window.renderCheckoutMirror !== 'function') return;
  const prev = window.renderCheckoutMirror;
  window.renderCheckoutMirror = function (slug) {
    const html = prev.apply(this, arguments);
    const cart = oCartGroups().find((c) => c.slug === slug);
    return cart ? lvInjectBonus(html, cart) : html;
  };
})();

/* ---------- Разметка: список ---------- */

function lvDefaultCard(state) {
  return `
    <section class="role-card">
      <div class="role-section-head"><h2>Кэшбэк по умолчанию</h2><span class="role-section-head__sub">весь заказ</span></div>
      <div class="lv-hero">
        <span class="lv-big">${state.def.percent}%</span>
        <button type="button" class="app-switch${state.def.on ? ' on' : ''}" data-action="lv-def-toggle" aria-label="Кэшбэк включён"><span class="app-switch__knob"></span></button>
      </div>
      <div class="lv-actions" style="padding-top:0">
        <span class="lv-stepper">
          <button type="button" class="lv-step-btn" data-action="lv-def-dec" aria-label="Меньше">−</button>
          <span class="lv-step-val">${state.def.percent}%</span>
          <button type="button" class="lv-step-btn" data-action="lv-def-inc" aria-label="Больше">+</button>
        </span>
      </div>
      <p class="lv-note">Начисляется на весь заказ, если товар не попал в группу. Потолок платформы — ${LV_MAX}%.</p>
    </section>`;
}

function lvGroupsCard(pt, state) {
  const rows = state.groups.map((g) => {
    const n = lvGroupProducts(pt, g).length;
    return `
      <div class="lv-row">
        <button type="button" class="lv-row__main" data-action="lv-open" data-id="${g.id}">
          <span class="lv-row__name">${mEsc2(g.name)}</span>
          <span class="lv-row__meta">${n} ${lvPlural(n, 'товар', 'товара', 'товаров')}${g.on ? '' : ' · выключена'}</span>
        </button>
        <span class="lv-pct">${g.percent}%</span>
        <button type="button" class="app-switch${g.on ? ' on' : ''}" data-action="lv-group-toggle" data-id="${g.id}" aria-label="Группа активна"><span class="app-switch__knob"></span></button>
      </div>`;
  }).join('');

  const body = state.groups.length ? rows
    : `<div class="empty-state-card" style="margin:8px 16px 4px">
         <div class="role-empty__title">Групп пока нет</div>
         <div class="role-empty__text">Создайте группу, чтобы выделить товары своим процентом.</div>
       </div>`;

  return `
    <section class="role-card">
      <div class="role-section-head"><h2>Группы товаров</h2><span class="role-section-head__sub">${state.groups.length} ${lvPlural(state.groups.length, 'группа', 'группы', 'групп')}</span></div>
      <div style="margin-top:10px">${body}</div>
      <div class="lv-actions"><button type="button" class="lv-btn" data-action="lv-add">${icon('plus')} Новая группа</button></div>
    </section>`;
}

function lvPromosCard(pt, state) {
  const rows = state.rules.map((r) => {
    const badge = r.type === 'combo' ? 'Комбо' : (r.mode === 'gift' ? 'Подарок' : 'Сумма чека');
    return `
      <div class="lv-row">
        <button type="button" class="lv-row__main" data-action="lv-rule-open" data-id="${r.id}">
          <span class="lv-row__name">${mEsc2(lvRuleTitle(r, pt))}</span>
          <span class="lv-row__meta">${mEsc2(lvRuleMeta(r, pt))}</span>
        </button>
        ${r.published ? '<span class="lv-pin">На витрине</span>' : `<span class="lv-type">${badge}</span>`}
        <button type="button" class="app-switch${r.on ? ' on' : ''}" data-action="lv-rule-toggle" data-id="${r.id}" aria-label="Акция активна"><span class="app-switch__knob"></span></button>
      </div>`;
  }).join('');

  const body = state.rules.length ? rows
    : `<div class="empty-state-card" style="margin:8px 16px 4px">
         <div class="role-empty__title">Акций пока нет</div>
         <div class="role-empty__text">Комбо, подарок за чек, дополнительный кэшбэк — соберите первое правило.</div>
       </div>`;

  return `
    <section class="role-card">
      <div class="role-section-head"><h2>Акции</h2><span class="role-section-head__sub">${state.rules.length} ${lvPlural(state.rules.length, 'правило', 'правила', 'правил')}</span></div>
      <div style="margin-top:10px">${body}</div>
      <div class="lv-actions"><button type="button" class="lv-btn" data-action="lv-new">${icon('plus')} Новая акция</button></div>
    </section>`;
}

function lvSummaryCard(pt, state) {
  const s = lvSummary(pt, state);
  const avg = (Math.round(s.weighted * 10) / 10).toFixed(1).replace('.', ',');
  return `
    <section class="role-card" style="padding-bottom:0">
      <div class="role-section-head"><h2>Итог по точке</h2><span class="role-section-head__sub">${mEsc2(pt.name)}</span></div>
      <div class="lv-grid">
        <div class="lv-kpi"><div class="lv-kpi__v">${avg}%</div><div class="lv-kpi__l">средний кэшбэк (по цене)</div></div>
        <div class="lv-kpi"><div class="lv-kpi__v">${s.inGroups}/${s.total}</div><div class="lv-kpi__l">позиций в группах</div></div>
        <div class="lv-kpi"><div class="lv-kpi__v">${s.promos}</div><div class="lv-kpi__l">активных акций</div></div>
        <div class="lv-kpi"><div class="lv-kpi__v">${state.rules.filter((r) => r.published).length}</div><div class="lv-kpi__l">на витрине</div></div>
      </div>
      <p class="lv-note">Выплаты — <b>из доли точки</b> (+ комиссия LOVII 25%). Оценка по каталогу точки, без прогноза оборота.</p>
    </section>`;
}

function lvListView(pt, state) {
  return `
    <div class="cabinet-screen">
      <p class="lv-note" style="margin-top:4px">Партнёр сам собирает акции: кэшбэк, порог чека, комбо. Комбо выходит на витрину товаром. Демо к SZ-070/071.</p>
      ${lvDefaultCard(state)}
      ${lvGroupsCard(pt, state)}
      ${lvPromosCard(pt, state)}
      ${lvSummaryCard(pt, state)}
    </div>`;
}

/* ---------- Мастер акции: выбор механики ---------- */

function lvNewView() {
  return `
    <div class="cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Новая акция</h2><button type="button" class="role-link" data-action="lv-back">← Отмена</button></div>
        <div class="lv-mech">
          <button type="button" class="lv-mech__item" data-action="lv-mech" data-mech="threshold">
            <span class="lv-mech__ico">${icon('percent')}</span>
            <span class="lv-mech__t">Сумма чека</span>
            <span class="lv-mech__d">Кэшбэк <b>+N%</b> или <b>подарок</b>, когда чек достиг порога</span>
          </button>
          <button type="button" class="lv-mech__item" data-action="lv-mech" data-mech="combo">
            <span class="lv-mech__ico">${icon('ticket')}</span>
            <span class="lv-mech__t">Комбо</span>
            <span class="lv-mech__d">2+ товара вместе со скидкой — <b>выходит на витрину товаром</b></span>
          </button>
          <button type="button" class="lv-mech__item" data-action="lv-mech" data-mech="group">
            <span class="lv-mech__ico">${icon('gift')}</span>
            <span class="lv-mech__t">Группа товаров</span>
            <span class="lv-mech__d">Свой процент кэшбэка для набора товаров</span>
          </button>
        </div>
      </section>
    </div>`;
}

/* ---------- Редактор группы ---------- */

function lvGroupView(pt, state) {
  const g = state.groups.find((x) => x.id === lvUi.group);
  if (!g) { lvUi.sub = 'list'; return lvListView(pt, state); }
  const members = lvGroupProducts(pt, g);
  const first = members[0] || null;

  const preview = first
    ? `<div class="lv-preview">
         <span class="lv-preview__emoji">${first.emoji}</span>
         <div class="lv-preview__main">
           <div class="lv-preview__name">${mEsc2(first.name)}</div>
           <div class="lv-preview__sub">${oFmt(first.price)} ₽ · +${Math.round(first.price * g.percent / 100)} балл.</div>
         </div>
         <span class="lv-badge">Кэшбэк ${g.percent}%</span>
       </div>`
    : `<p class="lv-note">Добавьте товары или категорию — здесь появится предпросмотр.</p>`;

  const catChips = LV_CATS.map((c) => `
    <button type="button" class="app-chip${g.cat === c.id ? ' active' : ''}" data-action="lv-cat" data-cat="${c.id}">${c.name}</button>`).join('')
    + `<button type="button" class="app-chip${g.cat ? '' : ' active'}" data-action="lv-cat" data-cat="">Без категории</button>`;

  const prods = pt.products.map((p) => `
    <div class="lv-prod">
      <span class="lv-prod__emoji">${p.emoji}</span>
      <div class="lv-prod__main">
        <div class="lv-prod__name">${mEsc2(p.name)}</div>
        <div class="lv-prod__meta">${oFmt(p.price)} ₽${p.on ? '' : ' · снят с продажи'}</div>
      </div>
      <button type="button" class="app-switch${lvInGroup(pt, g, p) ? ' on' : ''}" data-action="lv-prod" data-pid="${p.id}" aria-label="Товар в группе"><span class="app-switch__knob"></span></button>
    </div>`).join('');

  return `
    <div class="cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Группа</h2><button type="button" class="role-link" data-action="lv-back">← К списку</button></div>
        <label class="lv-field"><span class="lb">Название</span><input type="text" maxlength="40" value="${mEsc2(g.name)}" data-action="lv-name"></label>
        <div class="lv-hero" style="padding-top:14px">
          <span class="lv-big">${g.percent}%</span>
          <span class="lv-stepper">
            <button type="button" class="lv-step-btn" data-action="lv-pct-dec" aria-label="Меньше">−</button>
            <span class="lv-step-val">${g.percent}%</span>
            <button type="button" class="lv-step-btn" data-action="lv-pct-inc" aria-label="Больше">+</button>
          </span>
        </div>
        <p class="lv-note">Процент группы переопределяет кэшбэк по умолчанию. Товар важнее категории.</p>
      </section>
      <section class="role-card">
        <div class="role-section-head"><h2>Категория</h2><span class="role-section-head__sub">полка каталога</span></div>
        <div class="lv-chips" style="margin-top:10px">${catChips}</div>
      </section>
      <section class="role-card" style="padding-bottom:0">
        <div class="role-section-head"><h2>Как увидит покупатель</h2></div>
        <div style="margin-top:10px">${preview}</div>
      </section>
      <section class="role-card" style="padding-bottom:0">
        <div class="role-section-head"><h2>Товары</h2><span class="role-section-head__sub">${members.length} в группе</span></div>
        <div style="margin-top:10px">${prods}</div>
        <div class="lv-actions">
          <button type="button" class="lv-btn lv-btn_danger" data-action="lv-del">Удалить группу</button>
          <button type="button" class="lv-btn lv-btn_primary" data-action="lv-save">Готово</button>
        </div>
      </section>
    </div>`;
}

/* ---------- Редактор «Сумма чека» ---------- */

function lvThresholdView(pt, state) {
  const r = state.rules.find((x) => x.id === lvUi.rule);
  if (!r) { lvUi.sub = 'list'; return lvListView(pt, state); }
  const quick = [500, 1000, 2000, 3000].map((s) => `
    <button type="button" class="app-chip${r.minSum === s ? ' active' : ''}" data-action="lv-thr-sum" data-sum="${s}">${oFmt(s)} ₽</button>`).join('');
  const giftList = pt.products.slice(0, 6).map((p) => `
    <button type="button" class="lv-pick${r.giftPid === p.id ? ' is-on' : ''}" data-action="lv-thr-gift" data-pid="${p.id}">
      <span class="lv-prod__emoji">${p.emoji}</span>
      <span class="lv-prod__name">${mEsc2(p.name)}</span>
      <span class="lv-pick__check">${r.giftPid === p.id ? icon('check') : ''}</span>
    </button>`).join('');

  return `
    <div class="cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Акция от суммы чека</h2><button type="button" class="role-link" data-action="lv-back">← К списку</button></div>
        <label class="lv-field"><span class="lb">Порог чека, ₽</span>
          <input type="number" min="0" inputmode="numeric" value="${r.minSum}" data-action="lv-thr-input">
        </label>
        <div class="lv-chips" style="margin-top:10px">${quick}</div>
      </section>

      <section class="role-card">
        <div class="role-section-head"><h2>Награда</h2><span class="role-section-head__sub">когда чек достиг порога</span></div>
        <div class="seg" style="margin:12px 16px 0">
          <button type="button" class="${r.mode === 'gift' ? 'active' : ''}" data-action="lv-thr-mode" data-mode="gift">Подарок</button>
          <button type="button" class="${r.mode === 'cashback' ? 'active' : ''}" data-action="lv-thr-mode" data-mode="cashback">Кэшбэк +N%</button>
        </div>
        ${r.mode === 'cashback' ? `
          <div class="lv-hero" style="padding-top:14px">
            <span class="lv-big">+${r.addPercent}%</span>
            <span class="lv-stepper">
              <button type="button" class="lv-step-btn" data-action="lv-thr-dec" aria-label="Меньше">−</button>
              <span class="lv-step-val">${r.addPercent}%</span>
              <button type="button" class="lv-step-btn" data-action="lv-thr-inc" aria-label="Больше">+</button>
            </span>
          </div>
          <p class="lv-note">Добавляется к кэшбэку заказа, когда чек ≥ порога.</p>
        ` : `
          <p class="lv-note" style="margin-top:12px">Товар-подарок за 0 ₽ при достижении порога.</p>
          <div class="lv-picks">${giftList}</div>
        `}
      </section>

      <section class="role-card" style="padding-bottom:0">
        <div class="role-section-head"><h2>Как увидит покупатель</h2></div>
        <div style="margin-top:10px">
          <div class="lv-preview">
            <span class="lv-preview__emoji">${icon('ticket')}</span>
            <div class="lv-preview__main">
              <div class="lv-preview__name">${mEsc2(lvRuleTitle(r, pt))}</div>
              <div class="lv-preview__sub">В корзине и чекауте: «${r.mode === 'gift' ? 'Подарок при чеке от ' + oFmt(r.minSum) + ' ₽' : 'Кэшбэк +' + r.addPercent + '% с чека'}»</div>
            </div>
          </div>
        </div>
        <div class="lv-actions">
          <button type="button" class="lv-btn lv-btn_danger" data-action="lv-rule-del" data-id="${r.id}">Удалить</button>
          <button type="button" class="lv-btn lv-btn_primary" data-action="lv-publish" data-id="${r.id}">На витрину</button>
        </div>
        ${r.published ? '<p class="lv-note">Опубликовано в промо-блоке на главной.</p>' : ''}
      </section>
    </div>`;
}

/* ---------- Редактор «Комбо» ---------- */

function lvComboView(pt, state) {
  const r = state.rules.find((x) => x.id === lvUi.rule);
  if (!r) { lvUi.sub = 'list'; return lvListView(pt, state); }
  const items = lvComboItems(pt, r);
  const sum = items.reduce((s, i) => s + i.price, 0);
  const price = Math.round(sum * (100 - r.percent) / 100);

  const prods = pt.products.map((p) => {
    const on = r.items.includes(p.id);
    return `
      <div class="lv-prod">
        <span class="lv-prod__emoji">${p.emoji}</span>
        <div class="lv-prod__main">
          <div class="lv-prod__name">${mEsc2(p.name)}</div>
          <div class="lv-prod__meta">${oFmt(p.price)} ₽</div>
        </div>
        <button type="button" class="app-switch${on ? ' on' : ''}" data-action="lv-combo-item" data-pid="${p.id}" aria-label="В комбо"><span class="app-switch__knob"></span></button>
      </div>`;
  }).join('');

  const previewCard = items.length >= 2
    ? `<div class="lv-preview">
         <span class="lv-preview__emoji">${items[0].emoji}</span>
         <div class="lv-preview__main">
           <div class="lv-preview__name">${mEsc2(lvRuleTitle(r, pt))}</div>
           <div class="lv-preview__sub"><del>${oFmt(sum)} ₽</del> · ${oFmt(price)} ₽ · состав: ${mEsc2(items.map((i) => i.name).join(', '))}</div>
         </div>
         <span class="lv-badge">−${r.percent}%</span>
       </div>`
    : `<p class="lv-note">Выберите минимум 2 товара — соберётся комбо.</p>`;

  return `
    <div class="cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Комбо</h2><button type="button" class="role-link" data-action="lv-back">← К списку</button></div>
        <p class="lv-note" style="margin-top:4px">Комбо публикуется <b>товаром</b> на витрину точки: покупатель видит состав и скидку.</p>
        <div class="lv-hero" style="padding-top:14px">
          <span class="lv-big">−${r.percent}%</span>
          <span class="lv-stepper">
            <button type="button" class="lv-step-btn" data-action="lv-combo-dec" aria-label="Меньше">−</button>
            <span class="lv-step-val">${r.percent}%</span>
            <button type="button" class="lv-step-btn" data-action="lv-combo-inc" aria-label="Больше">+</button>
          </span>
        </div>
      </section>

      <section class="role-card" style="padding-bottom:0">
        <div class="role-section-head"><h2>Товары комбо</h2><span class="role-section-head__sub">${items.length} выбрано</span></div>
        <div style="margin-top:10px">${prods}</div>
      </section>

      <section class="role-card" style="padding-bottom:0">
        <div class="role-section-head"><h2>Как увидит покупатель</h2></div>
        <div style="margin-top:10px">${previewCard}</div>
        <div class="lv-actions">
          <button type="button" class="lv-btn lv-btn_danger" data-action="lv-rule-del" data-id="${r.id}">Удалить</button>
          <button type="button" class="lv-btn lv-btn_primary" data-action="lv-publish" data-id="${r.id}">На витрину</button>
        </div>
        ${r.published ? '<p class="lv-note">Комбо опубликовано товаром в каталоге точки + карточкой в промо-блоке.</p>' : ''}
      </section>
    </div>`;
}

/* ---------- Точка входа раздела ---------- */

function mspLoyalty() {
  const pt = mspActivePoint();
  if (!pt) return '';
  const state = lvState(pt);
  if (lvUi.sub === 'group') return lvGroupView(pt, state);
  if (lvUi.sub === 'new') return lvNewView();
  if (lvUi.sub === 'threshold') return lvThresholdView(pt, state);
  if (lvUi.sub === 'combo') return lvComboView(pt, state);
  return lvListView(pt, state);
}

/* ---------- Подключение к кабинету МСП ---------- */

if (typeof MSP_TABS !== 'undefined') {
  MSP_TABS.splice(4, 0, { id: 'loyalty', label: 'Промо', icon: 'gift' });
}

const lvPrevRenderMspCabinet = window.renderMspCabinet;
window.renderMspCabinet = function () {
  if (typeof mspUi !== 'undefined' && mspUi.tab === 'loyalty') {
    document.body.classList.add('cabinet-mode');
    lvUi.sub = lvUi.sub || 'list';
    return mspShell(mspLoyalty());
  }
  return lvPrevRenderMspCabinet.apply(this, arguments);
};

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="lv-"]');
  if (!el) return;
  const pt = mspActivePoint();
  if (!pt) return;
  const state = lvState(pt);
  const action = el.dataset.action;

  /* --- базовый кэшбэк --- */
  if (action === 'lv-def-toggle') { state.def.on = !state.def.on; lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-def-dec') { state.def.percent = Math.max(0, state.def.percent - 1); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-def-inc') { state.def.percent = Math.min(LV_MAX, state.def.percent + 1); lvSave(); renderViewPreserveScroll(); return; }

  /* --- навигация --- */
  if (action === 'lv-new') { lvUi.sub = 'new'; renderViewPreserveScroll(); return; }
  if (action === 'lv-back') { lvUi.sub = 'list'; lvUi.group = null; lvUi.rule = null; renderViewPreserveScroll(); return; }
  if (action === 'lv-open') { lvUi.sub = 'group'; lvUi.group = el.dataset.id; renderViewPreserveScroll(); return; }
  if (action === 'lv-mech' || action === 'lv-add') {
    const mech = action === 'lv-add' ? 'group' : el.dataset.mech;
    if (mech === 'group') {
      const g = { id: 'g' + Date.now(), name: 'Новая группа', cat: null, percent: LV_DEF_PCT, on: true, add: [], drop: [] };
      state.groups.push(g); lvUi.sub = 'group'; lvUi.group = g.id;
    } else {
      const r = mech === 'combo'
        ? { id: 'r' + Date.now(), type: 'combo', items: [], percent: 15, on: true, published: false }
        : { id: 'r' + Date.now(), type: 'threshold', minSum: 2000, mode: 'gift', addPercent: 2, giftPid: (pt.products[0] || {}).id || null, on: true, published: false };
      state.rules.push(r); lvUi.sub = mech; lvUi.rule = r.id;
    }
    lvSave(); renderViewPreserveScroll(); return;
  }
  if (action === 'lv-group-toggle') {
    const g = state.groups.find((x) => x.id === el.dataset.id);
    if (g) { g.on = !g.on; lvSave(); renderViewPreserveScroll(); }
    return;
  }
  if (action === 'lv-rule-open') {
    const r = state.rules.find((x) => x.id === el.dataset.id);
    if (r) { lvUi.sub = r.type; lvUi.rule = r.id; renderViewPreserveScroll(); }
    return;
  }
  if (action === 'lv-rule-toggle') {
    const r = state.rules.find((x) => x.id === el.dataset.id);
    if (r) { r.on = !r.on; lvSave(); renderViewPreserveScroll(); }
    return;
  }

  /* --- редактор группы --- */
  const g = state.groups.find((x) => x.id === lvUi.group);
  if (g) {
    if (action === 'lv-pct-dec') { g.percent = Math.max(0, g.percent - 1); lvSave(); renderViewPreserveScroll(); return; }
    if (action === 'lv-pct-inc') { g.percent = Math.min(LV_MAX, g.percent + 1); lvSave(); renderViewPreserveScroll(); return; }
    if (action === 'lv-cat') { g.cat = el.dataset.cat || null; lvSave(); renderViewPreserveScroll(); return; }
    if (action === 'lv-prod') {
      const pr = pt.products.find((p) => p.id === el.dataset.pid);
      if (pr) { lvToggleProduct(pt, g, pr); lvSave(); renderViewPreserveScroll(); }
      return;
    }
    if (action === 'lv-save') { lvUi.sub = 'list'; lvUi.group = null; if (typeof toast === 'function') toast('Демо: настройки кэшбэка сохранены'); renderViewPreserveScroll(); return; }
    if (action === 'lv-del') {
      state.groups = state.groups.filter((x) => x.id !== g.id);
      lvUi.sub = 'list'; lvUi.group = null; lvSave(); renderViewPreserveScroll(); return;
    }
  }

  /* --- редактор акции --- */
  const r = state.rules.find((x) => x.id === lvUi.rule);
  if (!r) return;
  if (action === 'lv-thr-sum') { r.minSum = Number(el.dataset.sum); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-thr-mode') { r.mode = el.dataset.mode; lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-thr-inc') { r.addPercent = Math.min(LV_MAX, r.addPercent + 1); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-thr-dec') { r.addPercent = Math.max(0, r.addPercent - 1); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-thr-gift') { r.giftPid = el.dataset.pid; lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-combo-item') {
    const pid = el.dataset.pid;
    r.items = r.items.includes(pid) ? r.items.filter((x) => x !== pid) : [...r.items, pid];
    lvSave(); renderViewPreserveScroll(); return;
  }
  if (action === 'lv-combo-inc') { r.percent = Math.min(LV_MAX_DISCOUNT, r.percent + 1); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-combo-dec') { r.percent = Math.max(0, r.percent - 1); lvSave(); renderViewPreserveScroll(); return; }
  if (action === 'lv-publish') {
    const ok = lvPublishPromo(pt, r);
    if (typeof toast === 'function') toast(ok ? 'Демо: акция опубликована на витрине' : 'Демо: выберите минимум 2 товара комбо');
    lvUi.sub = 'list'; lvUi.rule = null; renderViewPreserveScroll(); return;
  }
  if (action === 'lv-rule-del') {
    state.rules = state.rules.filter((x) => x.id !== r.id);
    lvUi.sub = 'list'; lvUi.rule = null; lvSave(); renderViewPreserveScroll(); return;
  }
});

/* Числовые и текстовые поля — без ререндера (не теряем фокус) */
document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="lv-name"], [data-action="lv-thr-input"]');
  if (!el) return;
  const pt = mspActivePoint();
  if (!pt) return;
  const state = lvState(pt);
  if (el.dataset.action === 'lv-name') {
    const g = state.groups.find((x) => x.id === lvUi.group);
    if (g) { g.name = el.value; lvSave(); }
  } else {
    const r = state.rules.find((x) => x.id === lvUi.rule);
    if (r) { r.minSum = Math.max(0, Number(el.value) || 0); lvSave(); }
  }
});
