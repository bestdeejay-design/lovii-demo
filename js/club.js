/**
 * LOVII CLUB · LOVII PAY — клубный профиль (редизайн 2026-09).
 * ------------------------------------------------------------
 * Терминология канона владельца:
 *   Платформа — «Лови» · Клуб — LOVII CLUB (LC) · Карта — LOVII PAY.
 *   У LOVII PAY нет «карты жителя»: это карта участника клуба,
 *   которая включает счёт и баланс (1 балл = 1 ₽, вывод через СБП).
 *
 * Структура экрана (вместо прежнего «набора функций»):
 *   1. Клубный хедер участника           5. Статус LC (прогресс уровня)
 *   2. Карта LOVII PAY (3D, flip+tilt)   6. Витрина привилегий клуба
 *   3. Счёт кэшбека                      7. Избранные МСП
 *   4. История операций (фильтры)        8. Роли / демо-доступ / установка
 *
 * Переиспользует: esc, priceFmt, icon, tileBg, productCardHtml (screens.js),
 * selectors/state/toast (app.js), LOVII_DASH/LOVII_CLUB_SEED/LOVII_DATA (data.js).
 * Подключается до dash.js; renderProfile() в dash.js делегирует сюда.
 */

/* ================= Состояние клуба ================= */

/** Сид mutable-состояния клуба в localStorage (история, избранное МСП). */
function ensureClub() {
  if (!state.club) {
    state.club = {
      tx: LOVII_CLUB_SEED.txSeed.map((t, i) => ({ id: 'tx' + i, at: Date.now() - t.d * 864e5, ...t })),
      mspFav: [...LOVII_CLUB_SEED.mspFavSeed],
    };
    persist();
  }
}

/** Фильтр истории (сессионный): all | in | buy | out */
let _clubTxFilter = 'all';

/* ================= Карта LOVII PAY: номер ================= */

/**
 * Демо-номер карты. Префикс (BIN) задаётся константой — задача
 * генерации номеров готовится отдельно; при подключении генератора
 * меняем только эти две строки.
 */
const LOVII_PAY_BIN = '5536 9138';
const LOVII_PAY_TAIL = '4210 7753';

function payCardNumber() {
  return LOVII_PAY_BIN + ' ' + LOVII_PAY_TAIL; // 16 цифр, групп 4-4-4-4 (стандарт Visa/Мир)
}

/* ================= Хелперы отображения ================= */

function clubTier(id) {
  return LOVII_CLUB_SEED.tiers.find((t) => t.id === id) || LOVII_CLUB_SEED.tiers[0];
}

function clubNextTier(id) {
  const i = LOVII_CLUB_SEED.tiers.findIndex((t) => t.id === id);
  return LOVII_CLUB_SEED.tiers[i + 1] || null;
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
  const rows = state.club.tx
    .filter((t) => _clubTxFilter === 'all' || t.kind === _clubTxFilter)
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

/** Кэшбек ставки партнёра из витрины для карты МСП: у Gold — базовая ставка точки */
function mspRowHtml(slug) {
  const st = selectors.storeBySlug(slug);
  if (!st) return '';
  const dist = selectors.storesRows().find((s) => s.slug === slug);
  const cb = clubTier(LOVII_CLUB_SEED.currentTier).cb;
  return `
  <div class="row-item">
    <span class="ri-emoji ${tileBg(st.color)}">${st.emoji}</span>
    <div class="ri-mid">
      <div class="nm">${esc(st.name)}</div>
      <div class="sb">${esc(catLabel(st.category))}${dist ? ' · ' + esc(dist.walkMinutes) + ' мин пешком' : ''} · кэшбек ${String(cb).replace('.', ',')}%</div>
    </div>
    <button class="msp-fav" data-action="club-unfav" data-slug="${esc(slug)}" aria-label="Убрать из избранных МСП">${icon('heart', '', 2, true)}</button>
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

/* ================= Экран: Профиль (LOVII CLUB) ================= */

function renderClubProfile() {
  ensureClub();
  const u = LOVII_DASH.user;
  const acc = LOVII_CLUB_SEED.account;
  const tier = clubTier(LOVII_CLUB_SEED.currentTier);
  const next = clubNextTier(LOVII_CLUB_SEED.currentTier);
  const progress = next ? Math.min(100, Math.round((LOVII_CLUB_SEED.monthSpend / next.need) * 100)) : 100;
  const favRows = state.club.mspFav.map(mspRowHtml).join('');
  const privTiles = LOVII_CLUB_SEED.privileges.map((p) => `
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

  const txTabs = [
    ['all', 'Все'],
    ['in', 'Начисления'],
    ['buy', 'Покупки'],
    ['out', 'Списания'],
  ].map(([v, l]) => `<button class="tab-btn ${_clubTxFilter === v ? 'active' : ''}" data-action="club-tx-tab" data-val="${v}">${l}</button>`).join('');

  return `
  <div class="lv-enter lv-narrow club-screen" style="padding-bottom:16px">

    <!-- 1. Клубный хедер -->
    <div class="club-head">
      <span class="prof-ava">${u.avatar}</span>
      <div class="min-w-0">
        <div class="prof-name">${esc(u.name)}</div>
        <div class="prof-phone">${esc(u.phone)}</div>
      </div>
      <span class="lc-badge">${icon('crown', '', 2)} LC · ${esc(tier.name.replace('LC ', ''))}</span>
    </div>

    <!-- 2. Карта LOVII PAY: flip по тапу, tilt по курсору -->
    <div class="pay-stage">
      <div class="pay-tilt" id="pay-tilt">
        <button class="pay-card" data-action="pay-flip" aria-label="Карта LOVII PAY — нажмите, чтобы перевернуть">
          <span class="pay-face pay-front">
            <span class="pay-sheen" aria-hidden="true"></span>
            <span class="pay-top">
              <span class="pay-brand">LOVII&nbsp;PAY</span>
              <span class="pay-chip" aria-hidden="true"></span>
            </span>
            <span class="pay-num">${payCardNumber()}</span>
            <span class="pay-bot">
              <span class="pay-holder"><span class="lbl">Участник LOVII CLUB</span><span class="val">${esc(u.name.toUpperCase())}</span></span>
              <span class="pay-bal"><span class="lbl">Счёт</span><span class="val">${priceFmt(acc.balance)}</span></span>
            </span>
          </span>
          <span class="pay-face pay-back">
            <span class="pay-mag" aria-hidden="true"></span>
            <span class="pay-back-mid">
              <span class="pay-qr">${payQrSvg()}</span>
              <span class="pay-back-info">
                <span class="pay-cvv"><span class="lbl">CVV</span><span class="val">•••</span></span>
                <span class="pay-note">Оплата QR у партнёров клуба</span>
              </span>
            </span>
            <span class="pay-back-bot">1 балл = 1 ₽ · баллы не сгорают · вывод через СБП</span>
          </span>
        </button>
      </div>
      <div class="pay-hints">
        <span class="pay-hint">${icon('rotate')} Нажми — карта перевернётся</span>
        <button class="pay-hint as-btn" data-action="club-copy-num">${icon('copy')} Скопировать номер</button>
      </div>
    </div>

    <!-- 3. Счёт кэшбека -->
    <div class="section-head"><h2>Счёт кэшбека</h2><span class="sub">${tier.name}</span></div>
    <div class="acct-card">
      <div class="acct-main">
        <div class="acct-balance">${priceFmt(acc.balance)}<span class="unit">₽</span></div>
        <div class="acct-lbl">Баланс LOVII PAY · 1 балл = 1 ₽</div>
      </div>
      <div class="acct-stats">
        <div class="as-b"><span class="v">${priceFmt(acc.monthEarned)}</span><span class="l">Кэшбек за месяц</span></div>
        <div class="as-b"><span class="v">${String(acc.cashback).replace('.', ',')}%</span><span class="l">Ставка клуба</span></div>
        <div class="as-b"><span class="v">${priceFmt(acc.withdrawnTotal)}</span><span class="l">Выведено через СБП</span></div>
      </div>
      <div class="acct-actions">
        <button class="acct-btn brand" data-action="club-withdraw">${icon('send')} Вывести через СБП</button>
        <button class="acct-btn ghost" data-action="club-tx-tab-jump">${icon('clock')} История</button>
      </div>
    </div>

    <!-- 4. История операций -->
    <div class="section-head"><h2>История операций</h2><span class="sub">${state.club.tx.length} операций</span></div>
    <div class="tx-tabs no-scrollbar">${txTabs}</div>
    <div class="list-card tx-list" id="tx-list">${txListHtml()}</div>

    <!-- 5. Статус LC -->
    <div class="section-head"><h2>Статус в клубе</h2><span class="sub">${tier.name}</span></div>
    <div class="tier-card">
      <div class="tier-row">
        <span class="tier-name">${icon('crown')} ${esc(tier.name)}</span>
        <span class="tier-cb">кэшбек ${String(tier.cb).replace('.', ',')}%</span>
      </div>
      <div class="tier-bar" role="progressbar" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      ${
        next
          ? `<div class="tier-next">До уровня <b>${esc(next.name)}</b> — ещё ${priceFmt(next.need - LOVII_CLUB_SEED.monthSpend)} покупок в этом месяце</div>`
          : `<div class="tier-next">Максимальный уровень клуба — держи его</div>`
      }
      <div class="tier-perks">${tier.perks.map((p) => `<span class="tp">${icon('check')} ${esc(p)}</span>`).join('')}</div>
    </div>

    <!-- 6. Витрина привилегий -->
    <div class="section-head"><h2>Привилегии клуба</h2><a href="#" onclick="return false" style="font-size:12px;color:var(--lv-pink);font-weight:700;text-decoration:none">все для Gold</a></div>
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

    <p class="dash-note tone-dim" style="margin-top:14px">Демо-режим: без авторизации. Клуб и карта сохраняются в этом браузере.</p>

    <footer class="prof-legal">
      <nav>
        <a href="https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html" target="_blank" rel="noopener">Публичная Оферта</a>
        <a href="https://axiiom-ru.github.io/lovii/docs/Оферта_присоединения.html" target="_blank" rel="noopener">Оферта присоединения</a>
      </nav>
      <p>LOVII · AXIIOM · ООО «Аксиома»<br>ИНН 7842223709 · ОГРН 1247800067690</p>
    </footer>
  </div>`;
}

/* ================= События LOVII CLUB ================= */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="club-"], [data-action="pay-flip"]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'pay-flip') {
    const card = document.querySelector('.pay-card');
    if (card) card.classList.toggle('flipped');
    return;
  }

  if (a === 'club-copy-num') {
    const num = payCardNumber();
    if (navigator.clipboard) navigator.clipboard.writeText(num).catch(() => {});
    toast('Номер карты скопирован', num);
    return;
  }

  if (a === 'club-tx-tab') {
    _clubTxFilter = el.dataset.val;
    const list = document.getElementById('tx-list');
    if (list) list.innerHTML = txListHtml();
    document.querySelectorAll('.tx-tabs .tab-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.val === _clubTxFilter);
    });
    return;
  }

  if (a === 'club-tx-tab-jump') {
    const list = document.getElementById('tx-list');
    if (list) list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (a === 'club-withdraw') {
    toast('Демо: вывод через СБП', '1 балл = 1 ₽ · без комиссии от 500 ₽');
    return;
  }

  if (a === 'club-unfav') {
    const slug = el.dataset.slug;
    state.club.mspFav = state.club.mspFav.filter((s) => s !== slug);
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
