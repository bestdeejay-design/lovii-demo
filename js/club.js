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

  /* --- Роли (перенесено из прежнего профиля без изменений логики) --- */
  const roleRows = ROLE_LIST.map((role) => {
    const m = roleMeta(role);
    const has = state.roles[role];
    const active = state.activeRole === role;
    return `
    <div class="row-item">
      <span class="ri-emoji ${tileBg(m.color)}">${icon(m.icon || 'user')}</span>
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
        <span class="ri-emoji ${tileBg(m.color)}">${icon(m.icon || 'user')}</span>
        <div class="ri-mid">
          <div class="nm">${esc(m.title)}<span class="demo-tag">демо</span></div>
          <div class="sb">${esc(m.desc)}</div>
        </div>
        <button class="cta-btn plain" data-action="enter-role" data-role="${role}">Открыть</button>
      </div>`;
    })
    .join('');

  const txTabs = [
    ['all', 'Все'],
    ['in', 'Начисления'],
    ['buy', 'Покупки'],
    ['out', 'Списания'],
  ].map(([v, l]) => `<button class="tab-btn ${_payTxFilter === v ? 'active' : ''}" data-action="pay-tx-tab" data-val="${v}">${l}</button>`).join('');

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
      <div class="pay-tilt" id="pay-tilt">
        <button class="paycard" data-action="pay-flip" aria-label="Карта LOVII PAY — нажмите, чтобы перевернуть">
          <span class="pay-face pay-front">
            <span class="pay-sheen" aria-hidden="true"></span>
            <span class="pay-top">
              <span class="pay-brand">LOVII&nbsp;PAY</span>
              <span class="pay-chip" aria-hidden="true"></span>
            </span>
            <span class="pay-num">${payCardNumber()}</span>
            <span class="pay-bot">
              <span class="pay-holder"><span class="lbl">Держатель</span><span class="val">${esc(seed.card.holder)}</span></span>
              <span class="pay-bal"><span class="lbl">Счёт</span><span class="val">${priceFmt(acc.balance)}</span></span>
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
      <div class="pay-hints">
        <span class="pay-hint">${icon('rotate')} Нажми — карта перевернётся</span>
        <button class="pay-hint as-btn" data-action="pay-copy-num">${icon('copy')} Скопировать номер</button>
      </div>
    </div>

    <!-- 3. Счёт LOVII PAY -->
    <div class="section-head"><h2>Счёт LOVII PAY</h2><span class="sub">${tier.name}</span></div>
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
    </div>

    </div><!-- /pay-col-a -->
    <div class="pay-col-b">

    <!-- 4. История операций -->
    <div class="section-head"><h2>История операций</h2><span class="sub">${state.pay.tx.length} операций</span></div>
    <div class="tx-tabs no-scrollbar">${txTabs}</div>
    <div class="list-card tx-list" id="tx-list">${txListHtml()}</div>

    <!-- 5. Статус LOVII PAY: уровни PAY → PASS → VIP -->
    <div class="section-head"><h2>Статус LOVII PAY</h2><span class="sub">${tier.name}</span></div>
    <div class="tier-card">
      <div class="tier-levels">${levelsRow}</div>
      <div class="tier-row">
        <span class="tier-name">${icon('crown')} ${esc(tier.name)}</span>
        <span class="tier-cond">${esc(tier.cond)}</span>
      </div>
      <div class="tier-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <div class="tier-next">${nextLine}</div>
      <div class="tier-perks">${tier.perks.map((p) => `<span class="tp">${icon('check')} ${esc(p)}</span>`).join('')}</div>
    </div>

    </div><!-- /pay-col-b -->
    </div><!-- /pay-cols -->

    <!-- 6. Витрина привилегий -->
    <div class="section-head"><h2>Привилегии статуса</h2><a href="#" onclick="return false" style="font-size:12px;color:var(--lv-pink);font-weight:700;text-decoration:none">всё для VIP</a></div>
    <div class="hscroll no-scrollbar priv-scroll">${privTiles}</div>

    <!-- 7. Избранные МСП -->
    <div class="section-head"><h2>Избранные МСП</h2><a data-go="home" style="font-size:12px;color:var(--lv-pink);font-weight:700;text-decoration:none;cursor:pointer">добавить с витрины</a></div>
    ${
      favRows
        ? `<div class="list-card">${favRows}</div>`
        : `<div class="dash-note tone-tiffany" style="margin-top:10px">Жми ♥ на партнёре — он появится здесь</div>`
    }

    <!-- 8. Роли / кабинеты -->
    <div class="section-head" style="margin-top:20px"><h2>Роли</h2></div>
    <div class="list-card">${roleRows}</div>

    <div class="section-head" style="margin-top:20px"><h2>Демо-доступ</h2></div>
    <div class="list-card">${demoRows}</div>

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
    const card = document.querySelector('.paycard');
    if (card) card.classList.toggle('flipped');
    return;
  }

  if (a === 'pay-copy-num') {
    const num = payCardNumber();
    if (navigator.clipboard) navigator.clipboard.writeText(num).catch(() => {});
    toast('Номер карты скопирован', num);
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
