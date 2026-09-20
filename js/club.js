/**
 * LOVII PAY — профиль лояльности (редизайн 2026-09).
 * ------------------------------------------------------------
 * Терминология канона владельца:
 *   Платформа  — «Лови» (LOVII).
 *   Программа  — LOVII PAY: карта + счёт + баланс. Никаких
 *                «клубов»: сокращение LOVII CLUB (LC) выведено
 *                из продукта по решению владельца.
 *   Карты (канон 2026-09-12) — у клиента ОДИН счёт и ОДИН номер,
 *                меняется только СКИН: LOVII PAY (база, всем при
 *                регистрации) → LOVII PASS (по подписке; статус
 *                представителя LOVII + вывод на карту 0% от 3 000 ₽)
 *                → LOVII VIP (оборот от 300 000 ₽ в месяц).
 *                LOVII BUSINESS — отдельная бизнес-карта, выдаётся
 *                по умолчанию всем МСП, видна в профиле, показывает
 *                операции по счёту точки (секция 6.5).
 *   Привилегии — мерч, мероприятия и спец-скидки у МСП
 *                (повышенный кэшбек НЕ используется).
 *
 * Структура экрана (вместо прежнего «набора функций»):
 *   1. Хедер участника                    5. Статус LOVII PAY (уровни+прогресс)
 *   2. Карта LOVII PAY (3D, flip+tilt)    6. Витрина привилегий
 *   3. Счёт LOVII PAY                     7. Избранные МСП
 *   4. История операций (фильтры)         8. Роли / демо-доступ / установка
 *   5.5 LOVII BUSINESS (карта точки + операции счёта МСП)
 *
 * Переиспользует: esc, priceFmt, icon, tileBg (screens.js),
 * selectors/state/toast (app.js), LOVII_DASH/LOVII_PAY_SEED/LOVII_DATA (data.js).
 * Подключается до dash.js; renderProfile() в dash.js делегирует сюда.
 */

/* ================= Состояние LOVII PAY ================= */

/** Сид mutable-состояния в localStorage (история, избранное МСП). */
function ensurePay() {
  if (!state.pay) {
    state.pay = {
      tx: LOVII_PAY_SEED.txSeed.map((t, i) => ({ id: 'tx' + i, at: Date.now() - t.d * 864e5, ...t })),
      mspFav: [...LOVII_PAY_SEED.mspFavSeed],
    };
    persist();
  }
}

/** Фильтр истории (сессионный): all | in | buy | out */
let _payTxFilter = 'all';

/**
 * Превью скина личной карты (сессионное, демо): null = скин по статусу;
 * 'pay' | 'pass' | 'vip' — превью по клику на уровень в статус-карте.
 * Счёт и номер при этом НЕ меняются — меняется только оформление.
 */
let _paySkinPreview = null;

/**
 * Карусель кошелька (SCR-PROFILE-v1, решение №1 от 2026-09-13):
 * 4 слайда — PAY / PASS / VIP / BUSINESS; под каруселью цветные
 * мини-превью (mini-card) вместо точек-навигации. По канону владельца
 * PAY/PASS/VIP — один счёт и один номер, меняется только оформление;
 * BUSINESS — отдельный счёт точки со своей историей. Выбор карты
 * переключает контекстные блоки «Счёт» и «История» (карта = контекст).
 */
const PAY_SLIDES = ['pay', 'pass', 'vip', 'biz'];
let _paySlide = LOVII_PAY_SEED.currentTier || 'pay';
let _payCtx = _paySlide === 'biz' ? 'biz' : 'personal';
let _bizTxFilter = 'all';

/* ================= Скины карт (канон 2026-09-12) ================= */

/** Скин личной карты: превью демо или скин текущего уровня. */
function paySkin() {
  const id = _paySkinPreview || LOVII_PAY_SEED.currentTier;
  return LOVII_PAY_SEED.cardSkins.find((s) => s.id === id) || LOVII_PAY_SEED.cardSkins[0];
}

/* ================= Карта LOVII PAY: номер ================= */

/**
 * Демо-номер карты. Префикс 9643 — по спецификации стандартов
 * номеров карт лояльности (MII 9 + код страны 643 + код эмитента).
 * Задача генерации номеров готовится отдельно; источник номера —
 * LOVII_PAY_SEED.card в data.js, здесь только сборка и отображение.
 */
function payCardNumber() {
  const c = LOVII_PAY_SEED.card;
  return c.bin + ' ' + c.tail; // 16 цифр, группы 4-4-4-4 (стандарт Visa/Мир)
}

/* ================= Хелперы отображения ================= */

function payTier(id) {
  return LOVII_PAY_SEED.tiers.find((t) => t.id === id) || LOVII_PAY_SEED.tiers[0];
}

function payNextTier(id) {
  const i = LOVII_PAY_SEED.tiers.findIndex((t) => t.id === id);
  return LOVII_PAY_SEED.tiers[i + 1] || null;
}

function txDayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(today) - day(d)) / 864e5);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

const TX_KIND = {
  in:  { icon: 'arrow-down-left', cls: 'in',   label: 'Начисление' },
  buy: { icon: 'arrow-up-right',  cls: 'buy',  label: 'Покупка' },
  out: { icon: 'wallet',          cls: 'out',  label: 'Списание' },
};

function txRowHtml(t) {
  const k = TX_KIND[t.kind] || TX_KIND.buy;
  const sum = t.sum > 0 ? '+' + priceFmt(t.sum) : '−' + priceFmt(Math.abs(t.sum));
  return `
  <div class="tx-row">
    <span class="tx-ico ${k.cls}">${icon(k.icon)}</span>
    <div class="tx-mid">
      <div class="tx-name">${esc(t.title)}</div>
      <div class="tx-meta">${esc(t.note || k.label)}</div>
    </div>
    <div class="tx-sum ${t.sum > 0 ? 'plus' : ''}">${sum}</div>
  </div>`;
}

function txListHtml() {
  const rows = state.pay.tx
    .filter((t) => _payTxFilter === 'all' || t.kind === _payTxFilter)
    .sort((a, b) => b.at - a.at);
  if (!rows.length) {
    return `<div class="dash-note tone-dim">По этой категории пока нет операций</div>`;
  }
  // Группировка по дням: Сегодня / Вчера / дата
  let html = '';
  let lastDay = '';
  rows.forEach((t) => {
    const d = txDayLabel(t.at);
    if (d !== lastDay) {
      html += `<div class="tx-day">${d}</div>`;
      lastDay = d;
    }
    html += txRowHtml(t);
  });
  return html;
}

/** Строка избранного МСП: у привилегированных уровней — намёк на спец-скидку */
function mspRowHtml(slug) {
  const st = selectors.storeBySlug(slug);
  if (!st) return '';
  const dist = selectors.storesRows().find((s) => s.slug === slug);
  const privileged = payTier(LOVII_PAY_SEED.currentTier).id !== 'pay';
  return `
  <div class="row-item">
    <span class="ri-emoji ${tileBg(st.color)}">${st.emoji}</span>
    <div class="ri-mid">
      <div class="nm">${esc(st.name)}</div>
      <div class="sb">${esc(catLabel(st.category))}${dist ? ' · ' + esc(dist.walkMinutes) + ' мин пешком' : ''}${privileged ? ' · спец-скидка' : ''}</div>
    </div>
    <button class="msp-fav" data-action="pay-unfav" data-slug="${esc(slug)}" aria-label="Убрать из избранных МСП">${icon('heart', '', 2, true)}</button>
  </div>`;
}

/** Псевдо-QR для оборота карты (демо-паттерн, детерминированный) */
function payQrSvg() {
  const N = 9, cells = [];
  // finder-паттерны по трём углам + псевдослучайное заполнение (seed 7)
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const f = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
      const on = f ? !((x % 3 === 1 && y % 3 === 1)) : rnd() > 0.52;
      if (on) cells.push(`<rect x="${x}" y="${y}" width="1" height="1" rx="0.18"/>`);
    }
  }
  return `<svg viewBox="0 0 ${N} ${N}" fill="currentColor" aria-hidden="true">${cells.join('')}</svg>`;
}

/* ================= Разметка 3D-карты (личная / бизнес-точки) ================= */

/**
 * Карта программы: flip по тапу, tilt и блики по курсору — общие
 * обработчики. Скин задаётся классом на .paycard (skin-pay/skin-pass/
 * skin-vip/skin-biz); счёт и номер НЕ зависят от скина.
 * Блики: .pay-glare — пятно за курсором; .pay-sweep — живой свип-луч
 * (канон владельца 2026-09-12, прототип lv-card-shine): при hover/tap
 * через карту за ~1.15s пробегает диагональный луч, тонирован под скин.
 * Статус-марка .pay-mark — иконка статуса у чипа (сторис-фактор):
 * PAY — без марки (чистая база) · PASS — сердце · VIP — корона · BUSINESS — домик.
 */

/* Иконка статуса на карте по скину (render через icon()); PAY — без марки */
const PAY_MARKS = { 'skin-pass': 'heart', 'skin-vip': 'crown', 'skin-biz': 'building' };

function payCardHtml(cfg) {
  return `
    <div class="pay-stage">
      <div class="pay-tilt">
        <button class="paycard ${cfg.skinCls}" data-action="pay-flip" aria-label="${esc(cfg.aria)}">
          <span class="pay-face pay-front">
            <span class="pay-sheen" aria-hidden="true"></span>
            <span class="pay-glare" aria-hidden="true"></span>
            <span class="pay-sweep" aria-hidden="true"></span>
            <span class="pay-top">
              <span class="pay-brand">${esc(cfg.tag)}</span>
              ${PAY_MARKS[cfg.skinCls] ? `<span class="pay-mark">${icon(PAY_MARKS[cfg.skinCls], '', 2, true)}</span>` : ''}
              <span class="pay-chip" aria-hidden="true"></span>
            </span>
            <span class="pay-num">${esc(cfg.num)}</span>
            <span class="pay-bot">
              <span class="pay-holder"><span class="lbl">Держатель</span><span class="val">${esc(cfg.holder)}</span></span>
              <span class="pay-bal"><span class="lbl">${esc(cfg.lbl)}</span><span class="val">${esc(cfg.val)}</span></span>
            </span>
          </span>
          <span class="pay-face pay-back">
            <span class="pay-mag" aria-hidden="true"></span>
            <span class="pay-back-mid">
              <span class="pay-qr">${payQrSvg()}</span>
              <span class="pay-back-info">
                <span class="pay-cvv"><span class="lbl">CVV</span><span class="val">•••</span></span>
                <span class="pay-note">${esc(cfg.backNote)}</span>
              </span>
            </span>
            <span class="pay-back-bot">${esc(cfg.backBot)}</span>
            <span class="pay-sweep" aria-hidden="true"></span>
          </span>
        </button>
      </div>
    </div>`;
}

/* ================= LOVII BUSINESS: операции счёта МСП ================= */

/** Расшифровка типов операций по счёту МСП (иконки/подписи/цвета). */
const BIZ_KIND = {
  in:     { icon: 'arrow-down-left', cls: 'in',   label: 'Поступление' },
  client: { icon: 'arrow-up-right',  cls: 'buy',  label: 'Баллы клиентов' },
  out:    { icon: 'wallet',          cls: 'out',  label: 'Выплата' },
};

/** Список операций по счёту МСП (группировка по дням — как в личной истории). */
function bizListHtml(filter) {
  const rows = LOVII_PAY_SEED.biz.opsSeed
    .map((o, i) => ({ id: 'bo' + i, at: Date.now() - o.d * 864e5, ...o }))
    .filter((o) => !filter || filter === 'all' || o.kind === filter)
    .sort((a, b) => b.at - a.at);
  if (!rows.length) {
    return `<div class="dash-note tone-dim">По этой категории пока нет операций</div>`;
  }
  let html = '';
  let lastDay = '';
  rows.forEach((o) => {
    const d = txDayLabel(o.at);
    if (d !== lastDay) {
      html += `<div class="tx-day">${d}</div>`;
      lastDay = d;
    }
    const k = BIZ_KIND[o.kind] || BIZ_KIND.in;
    const sum = o.sum > 0 ? '+' + priceFmt(o.sum) : '−' + priceFmt(Math.abs(o.sum));
    html += `
    <div class="tx-row">
      <span class="tx-ico ${k.cls}">${icon(k.icon)}</span>
      <div class="tx-mid">
        <div class="tx-name">${esc(o.title)}</div>
        <div class="tx-meta">${esc(o.note || k.label)}</div>
      </div>
      <div class="tx-sum ${o.sum > 0 ? 'plus' : ''}">${sum}</div>
    </div>`;
  });
  return html;
}

/* ================= Экран: Профиль (LOVII PAY) ================= */

/** Табы истории под активный контекст (личный счёт / счёт точки). */
function ctxTabsHtml() {
  if (_payCtx === 'biz') {
    return [['all', 'Все'], ['in', 'Поступления'], ['client', 'Баллы клиентов'], ['out', 'Выплаты']]
      .map(([v, l]) => `<button class="tab-btn ${_bizTxFilter === v ? 'active' : ''}" data-action="pay-biz-tab" data-val="${v}">${l}</button>`).join('');
  }
  return [['all', 'Все'], ['in', 'Начисления'], ['buy', 'Покупки'], ['out', 'Списания']]
    .map(([v, l]) => `<button class="tab-btn ${_payTxFilter === v ? 'active' : ''}" data-action="pay-tx-tab" data-val="${v}">${l}</button>`).join('');
}

/** Контекстные блоки «Счёт + История» — переключаются выбором карты в карусели. */
function ctxBlocksHtml(seed, acc) {
  /* баланс без знака ₽: priceFmt уже содержит ₽ — unit добавляем токеном
     (до сборки 38 карточка счёта показывала «₽₽» — наследованный дефект) */
  const numOnly = (n) => n.toLocaleString('ru-RU');
  if (_payCtx === 'biz') {
    const ops = seed.biz.opsSeed;
    const sumKind = (k) => ops.filter((o) => o.kind === k).reduce((s, o) => s + Math.abs(o.sum), 0);
    return `
    <div class="section-head"><h2>Счёт LOVII BUSINESS</h2><span class="sub">${esc(seed.biz.point)}</span></div>
    <div class="acct-card">
      <div class="acct-main">
        <div class="acct-balance">${numOnly(seed.biz.monthTurnover)}<span class="unit">₽</span></div>
        <div class="acct-lbl">Оборот точки за месяц</div>
      </div>
      <div class="acct-stats">
        <div class="as-b"><span class="v">${priceFmt(sumKind('in'))}</span><span class="l">Поступления</span></div>
        <div class="as-b"><span class="v">${priceFmt(sumKind('client'))}</span><span class="l">Баллы клиентов</span></div>
        <div class="as-b"><span class="v">${priceFmt(sumKind('out'))}</span><span class="l">Выплаты и комиссии</span></div>
      </div>
      <div class="acct-actions">
        <button class="acct-btn brand" data-action="pay-biz-payout">${icon('send')} Выплата на счёт</button>
        <button class="acct-btn ghost" data-action="pay-tx-jump">${icon('clock')} История</button>
      </div>
    </div>
    <div class="section-head"><h2>История операций</h2><span class="sub">${esc(seed.biz.name)}</span></div>
    <div class="tx-tabs no-scrollbar">${ctxTabsHtml()}</div>
    <div class="list-card tx-list biz-list" id="tx-list">${bizListHtml(_bizTxFilter)}</div>`;
  }
  const tier = payTier(seed.currentTier);
  return `
    <div class="section-head"><h2>Счёт LOVII PAY</h2><span class="sub">${esc(tier.name)}</span></div>
    <div class="acct-card">
      <div class="acct-main">
        <div class="acct-balance">${numOnly(acc.balance)}<span class="unit">₽</span></div>
        <div class="acct-lbl">Баланс LOVII PAY · 1 балл = 1 ₽</div>
      </div>
      <div class="acct-stats">
        <div class="as-b"><span class="v">${priceFmt(acc.monthEarned)}</span><span class="l">Кэшбек за месяц</span></div>
        <div class="as-b"><span class="v">${acc.monthPurchases}</span><span class="l">Покупки за месяц</span></div>
        <div class="as-b"><span class="v">${priceFmt(acc.withdrawnTotal)}</span><span class="l">Выведено через СБП</span></div>
      </div>
      <div class="acct-actions">
        <button class="acct-btn brand" data-action="pay-withdraw">${icon('send')} ${seed.currentTier === 'pay' ? 'Вывести через СБП' : 'Вывести на карту'}</button>
        <button class="acct-btn ghost" data-action="pay-tx-jump">${icon('clock')} История</button>
      </div>
    </div>
    <div class="section-head"><h2>История операций</h2><span class="sub">${state.pay.tx.length} операций</span></div>
    <div class="tx-tabs no-scrollbar">${ctxTabsHtml()}</div>
    <div class="list-card tx-list" id="tx-list">${txListHtml()}</div>`;
}

function renderPayProfile() {
  ensurePay();
  const u = LOVII_DASH.user;
  const seed = LOVII_PAY_SEED;
  const acc = seed.account;
  const tier = payTier(seed.currentTier);
  const next = payNextTier(seed.currentTier);

  /* Прогресс до следующего уровня: подписка — бинарное условие,
     VIP — оборот по карте (порог 300 000 ₽; период зафиксирован
     владельцем — месяц; беклог lovii_docs/canon/BACKLOG.md §6). */
  let progress = 100;
  let nextLine = 'Максимальный уровень программы — держи его';
  if (next) {
    if (next.bySub) {
      progress = seed.subscribed ? 100 : 0;
      nextLine = seed.subscribed
        ? 'Подписка Лови активна — уровень <b>LOVII PASS</b> открыт'
        : 'Оформи подписку Лови — откроется уровень <b>LOVII PASS</b>';
    } else {
      progress = Math.min(100, Math.round((seed.monthTurnover / next.need) * 100));
      nextLine = `До уровня <b>${esc(next.name)}</b> — обороты ещё ${priceFmt(next.need - seed.monthTurnover)}`;
    }
  }

  /* --- Карусель: 4 слайда. Личные скины показывают ОДИН счёт и номер
         (канон 2026-09-12), BUSINESS — счёт точки. --- */
  const numPersonal = payCardNumber();
  const slideCfg = {
    pay: {
      skinCls: 'skin-pay', tag: 'LOVII PAY', num: numPersonal, holder: seed.card.holder,
      lbl: 'Счёт', val: priceFmt(acc.balance),
      backNote: 'Оплата QR у партнёров Лови',
      backBot: '1 балл = 1 ₽ · баллы не сгорают · счёт один — скины меняются',
      aria: 'Карта LOVII PAY — нажмите, чтобы перевернуть',
    },
    pass: {
      skinCls: 'skin-pass', tag: 'LOVII PASS', num: numPersonal, holder: seed.card.holder,
      lbl: 'Счёт', val: priceFmt(acc.balance),
      backNote: 'Оплата QR у партнёров Лови',
      backBot: 'По подписке Лови · вывод на карту 0% от 3 000 ₽',
      aria: 'Карта LOVII PASS — нажмите, чтобы перевернуть',
    },
    vip: {
      skinCls: 'skin-vip', tag: 'LOVII VIP', num: numPersonal, holder: seed.card.holder,
      lbl: 'Счёт', val: priceFmt(acc.balance),
      backNote: 'Оплата QR у партнёров Лови',
      backBot: 'Оборот от 300 000 ₽ в месяц · лимитированный мерч',
      aria: 'Карта LOVII VIP — нажмите, чтобы перевернуть',
    },
    biz: {
      skinCls: 'skin-biz', tag: 'LOVII BUSINESS', num: seed.biz.card.bin + ' ' + seed.biz.card.tail, holder: seed.biz.card.holder,
      lbl: 'Оборот/мес', val: priceFmt(seed.biz.monthTurnover),
      backNote: 'QR точки — приём оплат и баллов',
      backBot: 'LOVII BUSINESS · выдаётся по умолчанию всем МСП',
      aria: 'Бизнес-карта LOVII BUSINESS — нажмите, чтобы перевернуть',
    },
  };

  /* --- Мини-превью (цветные, вместо точек-навигации): PAY серебро ·
         PASS розовый · VIP чёрное золото · BUSINESS тиффани --- */
  const minis = PAY_SLIDES.map((id) => {
    const sk = seed.cardSkins.find((s) => s.id === id) || seed.cardSkins[0];
    const short = id === 'biz' ? 'БИЗ' : id.toUpperCase(); // БИЗ: тег влезает в узкие колонки (641–800, mini ~59px) без обрезки
    return `<button type="button" class="mini-card skin-${id}${_paySlide === id ? ' active' : ''}" data-action="pay-slide" data-slide="${id}" role="tab" aria-selected="${_paySlide === id}" aria-label="Карта ${esc(sk.tag)}"><span class="mc-chip"></span><span class="mc-tag">${short}</span></button>`;
  }).join('');

  const favRows = state.pay.mspFav.map(mspRowHtml).join('');
  const privTiles = seed.privileges.map((p) => `
    <div class="priv-card t-${p.tone}">
      <span class="pc-ico">${icon(p.icon)}</span>
      <div class="pc-title">${esc(p.title)}</div>
      <div class="pc-sub">${esc(p.sub)}</div>
    </div>`).join('');

  /* --- Роли (перенесено из прежнего профиля без изменений логики) --- */
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

  const demoRows = ['owner', 'investor', 'msp']
    .map((role) => {
      const m = roleMeta(role);
      // msp — собственный маршрут (кабинет ЛОВИ Бизнес), не через renderDash
      const btn = role === 'msp'
        ? `<button class="cta-btn plain" data-go="msp:index">Открыть</button>`
        : `<button class="cta-btn plain" data-action="enter-role" data-role="${role}">Открыть</button>`;
      return `
      <div class="row-item">
        <span class="ri-emoji ${tileBg(m.color)}">${m.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(m.title)}<span class="demo-tag">демо</span></div>
          <div class="sb">${esc(m.desc)}</div>
        </div>
        ${btn}
      </div>`;
    })
    .join('');

  return `
  <div class="lv-enter lv-narrow pay-screen" style="padding-bottom:16px">

    <!-- 1. Хедер участника -->
    <div class="pay-head">
      <span class="prof-ava">${u.avatar}</span>
      <div class="min-w-0">
        <div class="prof-name">${esc(u.name)}</div>
        <div class="prof-phone">${esc(u.phone)}</div>
      </div>
      <span class="pay-badge">${icon('crown', '', 2)} ${esc(tier.name)}</span>
    </div>

    <!-- 1а. Роли и демо-доступ — НАВЕРХУ (владелец заходит в кабинеты сразу,
         без скролла через кошелёк и настройки; фидбек 2026-09-14 «как я узнаю куда идти») -->
    <div class="section-head" style="margin-top:14px"><h2>Роли</h2><span class="sub">кабинеты — новый редизайн</span></div>
    <div class="list-card">${roleRows}</div>

    <div class="section-head" style="margin-top:12px"><h2>Демо-доступ</h2></div>
    <div class="list-card">${demoRows}</div>

    <!-- 2..5. Двухколоночная композиция (на ≥640px): слева кошелёк+счёт,
         справа статус+привилегии. На мобильном порядок тот же — стек. -->
    <div class="pay-cols">
    <div class="pay-col-a">

    <!-- 2. Кошелёк: карусель 4 карт (канон: у клиента один счёт —
         PAY/PASS/VIP показывают один и тот же счёт, меняется только
         оформление; BUSINESS — счёт точки) -->
    <div class="pay-carousel no-scrollbar" id="pay-carousel">
      ${PAY_SLIDES.map((id) => `
      <div class="pay-slide" data-slide="${id}">
        ${payCardHtml(slideCfg[id])}
        <div class="pay-hints">
          <span class="pay-hint">${icon('rotate')} Нажми — карта перевернётся</span>
          <button class="pay-hint as-btn" data-action="pay-copy-num" data-scope="${id === 'biz' ? 'biz' : 'personal'}">${icon('copy')} Скопировать номер</button>
        </div>
      </div>`).join('')}
    </div>
    <div class="pay-minis" role="tablist" aria-label="Карты кошелька">${minis}</div>

    <!-- 3+4. Счёт и история активной карты (карта = контекст) -->
    <div id="ctx-blocks">${ctxBlocksHtml(seed, acc)}</div>

    </div><!-- /pay-col-a -->
    <div class="pay-col-b">

    <!-- 5. Статус LOVII PAY + витрина привилегий -->
    <div class="section-head"><h2>Статус LOVII PAY</h2><span class="sub">${esc(tier.name)}</span></div>
    <div class="tier-card">
      <div class="tier-row">
        <span class="tier-name">${icon('crown')} ${esc(tier.name)}</span>
        <span class="tier-cond">${esc(tier.cond)}</span>
      </div>
      <div class="tier-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <div class="tier-next">${nextLine}</div>
      <div class="tier-perks">${tier.perks.map((p) => `<span class="tp">${icon('check')} ${esc(p)}</span>`).join('')}</div>
    </div>

    <div class="section-head"><h2>Привилегии статуса</h2><a href="#" onclick="return false" style="font-size:12px;color:var(--lv-pink);font-weight:700;text-decoration:none">всё для VIP</a></div>
    <div class="hscroll no-scrollbar priv-scroll">${privTiles}</div>

    </div><!-- /pay-col-b -->
    </div><!-- /pay-cols -->

    <!-- 6. Избранные МСП -->
    <div class="section-head"><h2>Избранные МСП</h2><a data-go="home" style="font-size:12px;color:var(--lv-pink);font-weight:700;text-decoration:none;cursor:pointer">добавить с витрины</a></div>
    ${
      favRows
        ? `<div class="list-card">${favRows}</div>`
        : `<div class="dash-note tone-tiffany" style="margin-top:10px">Жми ♥ на партнёре — он появится здесь</div>`
    }

    <!-- 7. Настройки (SCR-PROFILE-v1): приложение · уведомления · безопасность;
         асинхронно заполняет js/settings.js -->
    <div id="settings-slot"></div>

    <!-- 8. Роли / кабинеты — перенесены наверх (см. 1а) -->

    <p class="dash-note tone-dim" style="margin-top:14px">Демо-режим: без авторизации. Карта и счёт сохраняются в этом браузере.${window.LOVII_BUILD ? ` · <span style="opacity:.55">${window.LOVII_BUILD}</span>` : ''}</p>

    <footer class="prof-legal">
      <nav>
        <a href="https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html" target="_blank" rel="noopener">Публичная Оферта</a>
        <a href="https://axiiom-ru.github.io/lovii/docs/Оферта_присоединения.html" target="_blank" rel="noopener">Оферта присоединения</a>
      </nav>
      <p>LOVII · AXIIOM · ООО «Аксиома»<br>ИНН 7842223709 · ОГРН 1247800067690</p>
    </footer>
  </div>`;
}

/* ================= События LOVII PAY ================= */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="pay-"]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'pay-flip') {
    el.classList.toggle('flipped'); // карта может быть несколько — личная и бизнес-точка
    return;
  }

  if (a === 'pay-slide') {
    // Клик по цветному мини-превью — переход на слайд карусели кошелька
    payGoSlide(el.dataset.slide);
    return;
  }

  if (a === 'pay-biz-tab') {
    // Фильтр истории счёта точки (контекст BUSINESS)
    _bizTxFilter = el.dataset.val;
    const list = document.getElementById('tx-list');
    if (list) list.innerHTML = bizListHtml(_bizTxFilter);
    document.querySelectorAll('.tx-tabs .tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.val === _bizTxFilter);
    });
    return;
  }

  if (a === 'pay-biz-payout') {
    toast('Демо: выплата на расчётный счёт', 'Регистрация · завтра в 10:00', 'financial');
    return;
  }

  if (a === 'pay-copy-num') {
    // Скоуп важен: у личной карты и бизнес-карты разные номера
    const num = el.dataset.scope === 'biz'
      ? LOVII_PAY_SEED.biz.card.bin + ' ' + LOVII_PAY_SEED.biz.card.tail
      : payCardNumber();
    if (navigator.clipboard) navigator.clipboard.writeText(num).catch(() => {});
    toast('Номер карты скопирован', num, 'positive');
    return;
  }

  if (a === 'pay-tx-tab') {
    _payTxFilter = el.dataset.val;
    const list = document.getElementById('tx-list');
    if (list) list.innerHTML = txListHtml();
    document.querySelectorAll('.tx-tabs .tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.val === _payTxFilter);
    });
    return;
  }

  if (a === 'pay-tx-jump') {
    const list = document.getElementById('tx-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (a === 'pay-withdraw') {
    // Канон владельца (2026-09-12): PASS и выше — вывод на карту
    // без комиссий от 3 000 ₽; для базового PAY правила не заданы (беклог).
    if (LOVII_PAY_SEED.currentTier === 'pay') {
      toast('Демо: вывод через СБП', '1 балл = 1 ₽ · правила вывода — задача владельца', 'financial');
    } else {
      toast('Демо: вывод на карту', 'LOVII ' + LOVII_PAY_SEED.currentTier.toUpperCase() + ' · без комиссии от 3 000 ₽', 'financial');
    }
    return;
  }

  if (a === 'pay-unfav') {
    const slug = el.dataset.slug;
    state.pay.mspFav = state.pay.mspFav.filter((s) => s !== slug);
    persist();
    renderViewPreserveScroll();
    toast('МСП убран из избранных');
    return;
  }
});

/* ============ Tilt-эффект и блики карт (3D по курсору) ============ */

function initPayCardFx() {
  bindPayCarousel(); // карусель кошелька: позиция + синхронизация контекста
  const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;
  // карт может быть несколько (личная + бизнес-точка) — вешаем на все стейджи
  document.querySelectorAll('.pay-tilt').forEach((stage) => {
    if (stage.dataset.fxBound) return;
    stage.dataset.fxBound = '1';
    const move = (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      stage.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-(py - 0.5) * 8).toFixed(2) + 'deg');
      // блики следят за курсором (--gx/--gy в % — читает .pay-glare)
      stage.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
      stage.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    };
    const leave = () => {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    };
    stage.addEventListener('pointermove', move);
    stage.addEventListener('pointerleave', leave);
  });
}

// Хук после каждого рендера: существующий рендер вызывает renderView/updateChrome;
// подписываемся на мутации вью, чтобы поднять tilt-эффект без правки app.js
new MutationObserver(() => initPayCardFx()).observe(document.getElementById('view'), { childList: true });

/* ====== Карусель кошелька: свайп, мини-превью, переключение контекста ====== */

let _carouselTimer = null;

/** Геометрия слайда: ширина + gap (для пересчёта индекса по scrollLeft). */
function paySlideStep(carousel) {
  const first = carousel.querySelector('.pay-slide');
  const w = first ? first.getBoundingClientRect().width : carousel.clientWidth || 1;
  const gap = parseFloat(getComputedStyle(carousel).columnGap || getComputedStyle(carousel).gap || 0) || 0;
  return (w || 1) + gap;
}

/** Активный слайд по прокрутке (rounded scrollLeft / шаг). */
function payCarouselIdx(carousel) {
  const idx = Math.round(carousel.scrollLeft / paySlideStep(carousel));
  return Math.max(0, Math.min(PAY_SLIDES.length - 1, idx));
}

function scrollToSlide(carousel, idx, smooth) {
  const left = idx * paySlideStep(carousel);
  if (smooth && typeof carousel.scrollTo === 'function') {
    carousel.scrollTo({ left, behavior: 'smooth' });
  } else {
    carousel.scrollLeft = left;
  }
}

function bindPayCarousel() {
  const c = document.getElementById('pay-carousel');
  if (!c || c.dataset.carouselBound === '1') return;
  c.dataset.carouselBound = '1';
  c.addEventListener('scroll', () => {
    if (_carouselTimer) clearTimeout(_carouselTimer);
    _carouselTimer = setTimeout(() => {
      const id = PAY_SLIDES[payCarouselIdx(c)];
      if (id && id !== _paySlide) {
        _paySlide = id;
        payApplyContext();
      }
    }, 90);
  }, { passive: true });
  // стартовая позиция — активный слайд (после раскладки)
  requestAnimationFrame(() => {
    const idx = PAY_SLIDES.indexOf(_paySlide);
    if (idx > 0) scrollToSlide(c, idx, false);
  });
}

/** Переключение контекста под активную карту + перелистывание карусели. */
function payGoSlide(id) {
  if (!PAY_SLIDES.includes(id) || id === _paySlide) return;
  _paySlide = id;
  payApplyContext();
  const c = document.getElementById('pay-carousel');
  if (c) scrollToSlide(c, PAY_SLIDES.indexOf(id), true);
}

/** Синхронизация мини-превью и контекстных блоков «Счёт + История». */
function payApplyContext() {
  _payCtx = _paySlide === 'biz' ? 'biz' : 'personal';
  document.querySelectorAll('.pay-minis .mini-card').forEach((m) => {
    const on = m.dataset.slide === _paySlide;
    m.classList.toggle('active', on);
    m.setAttribute('aria-selected', String(on));
  });
  const blocks = document.getElementById('ctx-blocks');
  if (blocks) blocks.innerHTML = ctxBlocksHtml(LOVII_PAY_SEED, LOVII_PAY_SEED.account);
}
