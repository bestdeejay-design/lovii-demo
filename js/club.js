/**
 * LOVII PAY — профиль лояльности (редизайн 2026-09).
 * ------------------------------------------------------------
 * Терминология канона владельца:
 *   Платформа  — «Лови» (LOVII).
 *   Программа  — LOVII PAY: карта + счёт + баланс. Никаких
 *                «клубов»: сокращение LOVII CLUB (LC) выведено
 *                из продукта по решению владельца.
 *   Уровни     — LOVII PAY (база) → LOVII PASS (действующая
 *                подписка) → LOVII VIP (оборот по карте).
 *   Привилегии — мерч, мероприятия и спец-скидки у МСП
 *                (повышенный кэшбек НЕ используется).
 *
 * Структура экрана (вместо прежнего «набора функций»):
 *   1. Хедер участника                    5. Статус LOVII PAY (уровни+прогресс)
 *   2. Карта LOVII PAY (3D, flip+tilt)    6. Витрина привилегий
 *   3. Счёт LOVII PAY                     7. Избранные МСП
 *   4. История операций (фильтры)         8. Роли / демо-доступ / установка
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
let _payTxPage = 1;
// Свёрнутые по умолчанию блоки профиля. «Кабинеты» не сворачиваются — это навигация.
const _payCollapse = { tx: false, priv: false, fav: false, acc: false, tier: false };

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

function txListHtml(opts = {}) {
  let rows = state.pay.tx
    .filter((t) => _payTxFilter === 'all' || t.kind === _payTxFilter)
    .sort((a, b) => b.at - a.at);
  if (opts.limit) rows = rows.slice(0, opts.limit);
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

/* ================= Экран: Все операции (пагинация по 25) ================= */

const TX_PER_PAGE = 25;

/* Блок профиля с раскрытием на месте: заголовок — шапка той же карточки,
   тело всегда в DOM и раскрывается вниз CSS-переходом (без перерисовки вида). */
function collapseCard(key, title, sub, bodyHtml) {
  const open = !!_payCollapse[key];
  return `<section class="collapse-card${open ? ' is-open' : ''}" data-collapse="${key}">
    <button class="cc-head" data-action="pay-collapse" data-key="${key}" aria-expanded="${open ? 'true' : 'false'}">
      <span class="cc-text">
        <span class="cc-title">${esc(title)}</span>
        ${sub ? `<span class="cc-sub">${esc(sub)}</span>` : ''}
      </span>
      <span class="cc-chev" aria-hidden="true">${icon('chev-right')}</span>
    </button>
    <div class="collapse-body"><div><div class="cc-inner">${bodyHtml}</div></div></div>
  </section>`;
}

function txTabsHtml() {
  return [['all', 'Все'], ['in', 'Начисления'], ['buy', 'Покупки'], ['out', 'Списания']]
    .map(([v, l]) => `<button class="tab-btn ${_payTxFilter === v ? 'active' : ''}" data-action="pay-tx-tab" data-val="${v}">${l}</button>`)
    .join('');
}

function renderAllTx() {
  ensurePay();
  const all = state.pay.tx
    .filter((t) => _payTxFilter === 'all' || t.kind === _payTxFilter)
    .sort((a, b) => b.at - a.at);
  const pages = Math.max(1, Math.ceil(all.length / TX_PER_PAGE));
  if (_payTxPage > pages) _payTxPage = pages;
  const slice = all.slice((_payTxPage - 1) * TX_PER_PAGE, _payTxPage * TX_PER_PAGE);

  let body = '';
  let lastDay = '';
  slice.forEach((t) => {
    const d = txDayLabel(t.at);
    if (d !== lastDay) { body += `<div class="tx-day">${d}</div>`; lastDay = d; }
    body += txRowHtml(t);
  });

  const pager = pages > 1
    ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px 0">
         <button class="cta-btn plain" data-action="pay-tx-page" data-val="${_payTxPage - 1}"${_payTxPage <= 1 ? ' disabled' : ''}>Назад</button>
         <span class="sub" style="font-size:12px;color:var(--lv-dim)">Страница ${_payTxPage} из ${pages}</span>
         <button class="cta-btn plain" data-action="pay-tx-page" data-val="${_payTxPage + 1}"${_payTxPage >= pages ? ' disabled' : ''}>Далее</button>
       </div>`
    : '';

  return `
  <div class="lv-enter lv-narrow pay-screen" style="padding-bottom:16px">
    <div class="section-head"><h2>Все операции</h2><span class="sub">${all.length} операций</span></div>
    <div class="tx-tabs no-scrollbar">${txTabsHtml()}</div>
    <div class="list-card tx-list" id="tx-list">${body || '<div class="dash-note tone-dim">По этой категории пока нет операций</div>'}</div>
    ${pager}
    <div class="dash-note tone-dim" style="margin-top:14px">Операции за всё время · по ${TX_PER_PAGE} на страницу</div>
  </div>`;
}

/** Строка избранного МСП: у привилегированных уровней — намёк на спец-скидку */
function mspRowHtml(slug) {
  const st = selectors.storeBySlug(slug);
  if (!st) return '';
  const dist = selectors.storesRows().find((s) => s.slug === slug);
  const privileged = payTier(LOVII_PAY_SEED.currentTier).id !== 'pay';
  return `
  <div class="row-item">
    <span class="ri-emoji ${tileBg(st.color)}">${icon('store')}</span>
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

/* ================= Экран: Профиль (LOVII PAY) ================= */

function renderPayProfile() {
  ensurePay();
  const u = LOVII_DASH.user;
  const seed = LOVII_PAY_SEED;
  const acc = seed.account;
  const tier = payTier(seed.currentTier);
  const next = payNextTier(seed.currentTier);
  const tierIdx = seed.tiers.findIndex((t) => t.id === seed.currentTier);

  /* Прогресс до следующего уровня: подписка — бинарное условие,
     VIP — оборот по карте (порог 300 000 ₽; период — решение
     владельца, беклог lovii_docs/canon/BACKLOG.md §6). */
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

  /* Полоска уровней: PAY → PASS → VIP (текущий подсвечен) */
  const levelsRow = seed.tiers.map((t, i) => {
    const state = i === tierIdx ? 'cur' : i < tierIdx ? 'done' : 'lock';
    return `<span class="tl ${state}">${i <= tierIdx ? icon('check', '', 2.5) : ''}${esc(t.name)}</span>`;
  }).join('');

  const favRows = state.pay.mspFav.map(mspRowHtml).join('');
  const privTiles = seed.privileges.map((p) => `
    <div class="priv-card t-${p.tone}">
      <span class="pc-ico">${icon(p.icon)}</span>
      <div class="pc-title">${esc(p.title)}</div>
      <div class="pc-sub">${esc(p.sub)}</div>
    </div>`).join('');

  /* --- Кабинеты ролей ---------------------------------------------------------
     Признак роли = промокод (state.roles) или личное назначение владельца.
     Без признака кабинет не открывается — только предпросмотр демо.
     Статус рядом с названием показывает, где мы сейчас работаем. */
  const CABINETS = [
    { role: 'store',    title: 'МСП · точка',   note: 'Заявка · Сотрудники · Товары · Заказы',  tag: 'В работе',     tone: 'work' },
    { role: 'rep',      title: 'Представитель', note: 'Обзор · Подключение · Точки · Доход',     tag: 'В работе',     tone: 'work' },
    { role: 'amb',      title: 'Амбассадор',    note: 'Обзор · Представители · Обучение',        tag: 'Доработка',    tone: 'todo' },
    { role: 'owner',    title: 'Владелец',      note: 'Обзор · Финансы · Структура',             tag: 'Есть решения', tone: 'ready' },
    { role: 'investor', title: 'Инвестор',      note: 'Рост · Продажи · Доходность',             tag: 'Есть решения', tone: 'ready' },
    { role: 'staff',    title: 'Сотрудник точки', note: 'Заказы · товары (администратор)',       tag: 'Новое',        tone: 'work' },
  ];
  const tagTones = {
    work:  ['var(--lv-soft-pink)', 'var(--lv-pink-dark)'],
    ready: ['var(--lv-soft-tiffany)', 'var(--lv-tiffany-text)'],
    todo:  ['var(--lv-soft-gold)', 'var(--lv-gold-text)'],
    lock:  ['var(--lv-grey-soft)', 'var(--lv-dim)'],
  };
  const tagPill = (tone, text) => {
    const [bg, fg] = tagTones[tone] || tagTones.lock;
    return `<span style="font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px;background:${bg};color:${fg};white-space:nowrap">${esc(text)}</span>`;
  };
  let cabinetAssigned = 0;
  const cabinetRows = CABINETS.map((c) => {
    const m = roleMeta(c.role);
    const assigned = c.role === 'owner' || c.role === 'investor' || c.role === 'staff' || !!state.roles[c.role];
    if (assigned) cabinetAssigned++;
    const active = state.activeRole === c.role;
    const right = assigned
      ? `<button class="cta-btn ${active ? 'brand-gradient' : 'plain'}" data-action="enter-role" data-role="${c.role}">${active ? 'Открыто' : 'Открыть'}</button>`
      : `<span style="display:flex;align-items:center;gap:8px">${tagPill('lock', 'Нужен промокод')}<button class="cta-btn plain" data-action="enter-role" data-role="${c.role}">Посмотреть</button></span>`;
    return `
    <div class="row-item"${assigned ? '' : ' style="opacity:.65"'}>
      <span class="ri-emoji ${tileBg(m.color)}">${icon(m.icon || 'user')}</span>
      <div class="ri-mid">
        <div class="nm" style="display:flex;align-items:center;gap:8px">${esc(c.title)} ${tagPill(c.tone, c.tag)}</div>
        <div class="sb">${esc(c.note)}</div>
      </div>
      ${right}
    </div>`;
  }).join('');

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

    <!-- 2..5. Двухколоночная композиция (на ≥640px): слева карта+счёт,
         справа история+статус. На мобильном порядок тот же — колонки стек. -->
    <div class="pay-cols">
    <div class="pay-col-a">

    <!-- 2. Карта LOVII PAY: flip по тапу, tilt по курсору -->
    <div class="pay-stage">
      <div class="pay-carousel no-scrollbar">
        <!-- Личная карта: скин по статусу (pay / pass / vip) -->
        <div class="pay-slide">
          <div class="pay-tilt" id="pay-tilt">
            <button class="paycard skin-${seed.currentTier}" data-num="${payCardNumber()}" data-action="pay-flip" aria-label="Личная карта LOVII PAY — перевернуть">
              <span class="pay-face pay-front">
                <span class="pay-sheen" aria-hidden="true"></span>
                <span class="pay-top">
                  <span class="pay-brand">LOVII&nbsp;PAY</span>
                  <span class="pay-chip" aria-hidden="true"></span>
                </span>
                <span class="pay-num">${payCardNumber()}</span>
                <span class="pay-bot">
                  <span class="pay-holder"><span class="lbl">Держатель</span><span class="val">${esc(seed.card.holder)}</span></span>
                  <span class="pay-bal"><span class="lbl">Баллы</span><span class="val">${priceFmt(acc.balance)}</span></span>
                </span>
              </span>
              <span class="pay-face pay-back">
                <span class="pay-mag" aria-hidden="true"></span>
                <span class="pay-back-mid">
                  <span class="pay-qr">${payQrSvg()}</span>
                  <span class="pay-back-info">
                    <span class="pay-cvv"><span class="lbl">CVV</span><span class="val">•••</span></span>
                    <span class="pay-note">Оплата QR у партнёров Лови</span>
                  </span>
                </span>
                <span class="pay-back-bot">1 балл = 1 ₽ · баллы не сгорают · вывод через СБП</span>
              </span>
            </button>
          </div>
        </div>
        <!-- Бизнес-карта: своя тема — графит + тиффани -->
        <div class="pay-slide">
          <div class="pay-tilt">
            <button class="paycard skin-biz" data-num="9643 9142 1180 4426" data-action="pay-flip" aria-label="Бизнес-карта LOVII BUSINESS — перевернуть">
              <span class="pay-face pay-front">
                <span class="pay-sheen" aria-hidden="true"></span>
                <span class="pay-top">
                  <span class="pay-brand">LOVII&nbsp;BUSINESS</span>
                  <span class="pay-chip" aria-hidden="true"></span>
                </span>
                <span class="pay-num">9643 9142 1180 4426</span>
                <span class="pay-bot">
                  <span class="pay-holder"><span class="lbl">Держатель</span><span class="val">ООО «НАПОЛИ ПИЦЦА»</span></span>
                  <span class="pay-bal"><span class="lbl">Счёт юрлица</span><span class="val">${priceFmt(18400)}</span></span>
                </span>
              </span>
              <span class="pay-face pay-back">
                <span class="pay-mag" aria-hidden="true"></span>
                <span class="pay-back-mid">
                  <span class="pay-qr">${payQrSvg()}</span>
                  <span class="pay-back-info">
                    <span class="pay-cvv"><span class="lbl">CVV</span><span class="val">•••</span></span>
                    <span class="pay-note">Расчёты юрлица · 90% выручки точке</span>
                  </span>
                </span>
                <span class="pay-back-bot">Тема BUSINESS · вывод на расчётный счёт</span>
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="pay-hints">
        <span class="pay-hint pay-hint-ico" aria-hidden="true" title="Нажми — карта перевернётся">${icon('rotate')}</span>
        <button class="pay-hint as-btn" data-action="pay-copy-num">${icon('copy')} Скопировать номер</button>
      </div>
    </div>

    <!-- 3. Счёт LOVII PAY — раскрывается вниз, на месте -->
    ${collapseCard('acc', 'Счёт LOVII PAY', tier.name, `
    <div class="acct-card">
      <div class="acct-main">
        <div class="acct-balance">${priceFmt(acc.balance)}<span class="unit">₽</span></div>
        <div class="acct-lbl">Баланс LOVII PAY · 1 балл = 1 ₽</div>
      </div>
      <div class="acct-stats">
        <div class="as-b"><span class="v">${priceFmt(acc.monthEarned)}</span><span class="l">Кэшбек за месяц</span></div>
        <div class="as-b"><span class="v">${acc.monthPurchases}</span><span class="l">Покупки за месяц</span></div>
        <div class="as-b"><span class="v">${priceFmt(acc.withdrawnTotal)}</span><span class="l">Выведено через СБП</span></div>
      </div>
      <div class="acct-actions">
        <button class="acct-btn brand" data-action="pay-withdraw">${icon('send')} Вывести через СБП</button>
        <button class="acct-btn ghost" data-action="pay-tx-jump">${icon('clock')} История</button>
      </div>
    </div>`)}

    <!-- 4. История операций — раскрывается вниз, на месте -->
    ${collapseCard('tx', 'История операций', 'последние 8',
      `<div class="tx-list" id="tx-list">${txListHtml({ limit: 8 })}</div>` +
        (state.pay.tx.length > 8
          ? `<div style="padding:12px 0 0"><button class="cta-btn plain big" data-action="pay-tx-all">Все операции · ${state.pay.tx.length} ${icon('chev-right')}</button></div>`
          : '')
    )}

    <!-- 5. Статус LOVII PAY: уровни PAY → PASS → VIP -->
    <!-- 5. Статус LOVII PAY — раскрывается вниз, на месте -->
    ${collapseCard('tier', 'Статус LOVII PAY', tier.name, `
    <div class="tier-card">
      <div class="tier-levels">${levelsRow}</div>
      <div class="tier-row">
        <span class="tier-name">${icon('crown')} ${esc(tier.name)}</span>
        <span class="tier-cond">${esc(tier.cond)}</span>
      </div>
      <div class="tier-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <div class="tier-next">${nextLine}</div>
      <div class="tier-perks">${tier.perks.map((p) => `<span class="tp">${icon('check')} ${esc(p)}</span>`).join('')}</div>
    </div>`)}

    <!-- 6. Привилегии статуса — раскрывается вниз, на месте -->
    ${collapseCard('priv', 'Привилегии статуса', 'всё для VIP', `<div class="hscroll no-scrollbar priv-scroll">${privTiles}</div>`)}

    <!-- 7. Избранные МСП — раскрывается вниз, на месте -->
    ${collapseCard('fav', 'Избранные МСП', state.pay.mspFav.length ? String(state.pay.mspFav.length) : '',
      favRows || `<div class="dash-note tone-tiffany">Жми ♥ на партнёре — он появится здесь</div>`
    )}

    </div><!-- /pay-col-a -->
    <div class="pay-col-b">

    <!-- 8. Кабинеты ролей -->
    <div class="section-head" style="margin-top:20px"><h2>Кабинеты</h2><span class="sub">${cabinetAssigned} доступно</span></div>
    <div class="list-card">${cabinetRows}</div>

    <div class="section-head" style="margin-top:20px"><h2>Приложение</h2></div>
    <div class="list-card">
      <button class="row-item install-card-btn" data-action="install-app" aria-label="Установить приложение">
        <span class="ri-emoji ${tileBg('sand')}">📲</span>
        <div class="ri-mid">
          <div class="nm">Установить приложение</div>
          <div class="sb">Иконка Лови на главном экране телефона или рабочем столе компьютера</div>
        </div>
        <span class="cta-btn brand-gradient">Установить</span>
      </button>
    </div>

    </div><!-- /pay-col-b -->
    </div><!-- /pay-cols -->

    <p class="dash-note tone-dim" style="margin-top:14px">Демо-режим: без авторизации. Карта и счёт сохраняются в этом браузере.${window.LOVII_BUILD ? ` · <span style="opacity:.55">${window.LOVII_BUILD}</span>` : ''}</p>

    <footer class="prof-legal">
      <div class="legal-card">
        <div class="lc-cap">Документы</div>
        <a class="lc-row" href="https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html" target="_blank" rel="noopener"><span>Публичная оферта</span>${icon('chev-right')}</a>
        <a class="lc-row" href="https://axiiom-ru.github.io/lovii/docs/Оферта_присоединения.html" target="_blank" rel="noopener"><span>Оферта присоединения</span>${icon('chev-right')}</a>
        <a class="lc-row" href="https://axiiom-ru.github.io/lovii/docs/Политика_обработки_ПД.html" target="_blank" rel="noopener"><span>Политика обработки ПД</span>${icon('chev-right')}</a>
        <div class="lc-cap">Поддержка</div>
        <a class="lc-row" href="mailto:support@lovii.ru"><span>support@lovii.ru</span>${icon('mail')}</a>
      </div>
      <p class="legal-note">LOVII · AXIIOM · ООО «Аксиома»<br>ИНН 7842223709 · ОГРН 1247800067690</p>
    </footer>
  </div>`;
}

/* ================= События LOVII PAY ================= */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="pay-"]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'pay-flip') {
    const card = el.closest('.paycard') || document.querySelector('.paycard');
    if (card) card.classList.toggle('flipped');
    return;
  }

  if (a === 'pay-copy-num') {
    const card = el.closest('.pay-stage') && el.closest('.pay-stage').querySelector('.paycard');
    const num = (card && card.dataset.num) || payCardNumber();
    if (navigator.clipboard) navigator.clipboard.writeText(num).catch(() => {});
    toast('Номер карты скопирован', num);
    return;
  }

  if (a === 'pay-tx-tab') {
    _payTxFilter = el.dataset.val;
    _payTxPage = 1;
    renderViewPreserveScroll();
    return;
  }

  if (a === 'pay-collapse') {
    const k = el.dataset.key;
    if (k && k in _payCollapse) _payCollapse[k] = !_payCollapse[k];
    const card = el.closest('.collapse-card');
    if (card) {
      card.classList.toggle('is-open', !!_payCollapse[k]);
      const head = card.querySelector('.cc-head');
      if (head) head.setAttribute('aria-expanded', _payCollapse[k] ? 'true' : 'false');
    }
    return; /* раскрытие анимирует CSS — вид не перезагружаем */
  }

  if (a === 'pay-tx-all') {
    _payTxFilter = 'all';
    _payTxPage = 1;
    go('tx');
    return;
  }

  if (a === 'pay-tx-page') {
    _payTxPage = Math.max(1, parseInt(el.dataset.val, 10) || 1);
    renderViewPreserveScroll();
    return;
  }

  if (a === 'pay-tx-jump') {
    _payCollapse.tx = true; /* раскрываем историю и подводим к ней, без перерисовки */
    const card = document.querySelector('.collapse-card[data-collapse="tx"]');
    if (card) {
      card.classList.add('is-open');
      const head = card.querySelector('.cc-head');
      if (head) head.setAttribute('aria-expanded', 'true');
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  if (a === 'pay-withdraw') {
    toast('Демо: вывод через СБП', '1 балл = 1 ₽ · без комиссии от 500 ₽');
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

/* ================= Tilt-эффект карты (3D по курсору) ================= */

function initPayCardFx() {
  const stage = document.getElementById('pay-tilt');
  if (!stage) return;
  const fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  const move = (e) => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    stage.style.setProperty('--ry', (px * 10).toFixed(2) + 'deg');
    stage.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
  };
  const leave = () => {
    stage.style.setProperty('--ry', '0deg');
    stage.style.setProperty('--rx', '0deg');
  };
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerleave', leave);
}

// Хук после каждого рендера: существующий рендер вызывает renderView/updateChrome;
// подписываемся на мутации вью, чтобы поднять tilt-эффект без правки app.js
new MutationObserver(() => initPayCardFx()).observe(document.getElementById('view'), { childList: true });
