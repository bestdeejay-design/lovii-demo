/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · ЭКРАН «СЧЁТ И ОПЕРАЦИИ» (#/wallet)
 * Прямой перенос ProfileWallet.vue (+ LedgerTxRow, PassSubscription,
 * AppSegmentControl) из lovii-app@staging в демо без бекенда.
 * Классы, тексты и логика контуров (деньги/баллы) — 1:1.
 *
 * Источник: origin/staging 938fe42, 2026-09-18.
 * ============================================================ */

function addDaysLocal(dayShift, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + dayShift);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/* Сид подписки LOVII PASS (SZ-056): действующая → карточка статуса. */
const WALLET_MIRROR = {
  subscription: {
    status: 'active',
    price_kopecks: 59_900,
    period_end: (() => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString(); })(),
  },
  // Рублёвый контур демо-клиента: проводок нет (честное пустое состояние).
  ledgerEntries: [
    { id: 'lm1', title: 'Пополнение кошелька · Т-Банк', dir: 'in', amount: 5000, created_at: addDaysLocal(0, 11, 20) },
    { id: 'lm2', title: 'Оплата покупки · Кофейня «Daily»', dir: 'out', amount: 240, created_at: addDaysLocal(-1, 18, 45) },
    { id: 'lm3', title: 'Пополнение · наличными у кассира', dir: 'in', amount: 3000, created_at: addDaysLocal(-2, 13, 10) },
    { id: 'lm4', title: 'Оплата покупки · Пекарня «Слойка»', dir: 'out', amount: 344, created_at: addDaysLocal(-4, 9, 5) },
    { id: 'lm5', title: 'Пополнение кошелька · СБП', dir: 'in', amount: 2000, created_at: addDaysLocal(-6, 20, 40) },
    { id: 'lm6', title: 'Оплата покупки · Бургерная «Гриль»', dir: 'out', amount: 940, created_at: addDaysLocal(-8, 19, 15) },
  ],
};

/* Локальное состояние вида: контур, фильтры, период. */
const walletMirrorUi = { contour: 'money', filter: 'all', period: 'all' };

const WALLET_FILTERS_MIRROR = [
  { value: 'all', label: 'Все' },
  { value: 'in', label: 'Начисления' },
  { value: 'out', label: 'Списания' },
];
const WALLET_PERIODS_MIRROR = [
  { id: 'all', label: 'Всё время' },
  { id: 'month', label: 'Месяц' },
  { id: 'quarter', label: '3 месяца' },
];

function walletDirection(tx) { return isIncomeTx(tx) ? 'in' : 'out'; }

function walletMirrorFeed(list) {
  const now = new Date();
  let rows = list;
  if (walletMirrorUi.filter !== 'all') {
    rows = rows.filter((tx) => (tx.dir || walletDirection(tx)) === walletMirrorUi.filter);
  }
  if (walletMirrorUi.period === 'month') {
    rows = rows.filter((tx) => new Date(tx.created_at).getMonth() === now.getMonth()
      && new Date(tx.created_at).getFullYear() === now.getFullYear());
  } else if (walletMirrorUi.period === 'quarter') {
    const from = Date.now() - 90 * 86_400_000;
    rows = rows.filter((tx) => new Date(tx.created_at).getTime() >= from);
  }
  return rows;
}

function walletMirrorMonth(list) {
  const now = new Date();
  return list.reduce((acc, tx) => {
    const at = new Date(tx.created_at);
    if (at.getMonth() !== now.getMonth() || at.getFullYear() !== now.getFullYear()) return acc;
    acc.count += 1;
    if (isIncomeTx(tx)) acc.earned += tx.amount;
    else acc.spent += Math.abs(tx.amount);
    return acc;
  }, { earned: 0, spent: 0, count: 0 });
}

/* ---------- Блоки ---------- */

function walletMirrorCard(account) {
  return mPayCard(account, 'wallet__slide');
}

/* Подписка LOVII PASS (PassSubscription, живой статус) */
function walletMirrorPass() {
  const sub = WALLET_MIRROR.subscription;
  const isLive = sub && (sub.status === 'active' || sub.status === 'grace_period');
  if (!isLive) return '';
  const ends = new Date(sub.period_end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `
    <section class="pass" data-testid="pass-subscription" aria-label="Подписка LOVII PASS">
      <div class="pass__head">
        <h2 class="pass__brand">LOVII PASS</h2>
        <span class="pass__state" data-testid="pass-state"><svg viewBox="0 0 24 24" style="width:12px;height:12px" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg> активна</span>
      </div>
      <p class="pass__line">Подписка Представителя — до ${ends}</p>
      <p class="pass__meta">${fmtKop(sub.price_kopecks)} ₽/мес · продление — с внутреннего счёта: LOVII Business, затем LOVII PAY</p>
    </section>`;
}

function renderWalletMirror() {
  const S = PROFILE_MIRROR_SEED;
  const isPoints = walletMirrorUi.contour === 'points';
  const selected = S.accounts[walletMirrorUi.slide] || S.accounts[0];
  const pointsAvailable = true;

  const month = isPoints ? walletMirrorMonth(S.transactions) : { earned: 0, spent: 0, count: 0 };
  const balance = isPoints ? S.wallet.balance : (selected?.balance ?? 0);
  const unit = isPoints ? 'б.' : '₽';
  const acctTitle = isPoints ? 'Баллы LOVII PAY'
    : selected?.kind === 'company' ? 'Счёт LOVII BUSINESS'
      : selected?.kind === 'nominal' ? 'Счёт оператора платформы' : 'Счёт LOVII PAY';

  // Лента: баллы — история WalletHistoryList; деньги — проводки ledger.
  const pointsRows = isPoints ? walletMirrorFeed(S.transactions) : [];
  const moneyRows = !isPoints ? walletMirrorFeed(WALLET_MIRROR.ledgerEntries) : [];
  const historyCount = pointsRows.length + moneyRows.length;
  const emptyText = walletMirrorUi.contour === 'money'
    ? (moneyRows.length ? 'По этой категории пока нет операций' : 'Операций пока нет')
    : (S.transactions.length
      ? 'В этом периоде операций нет'
      : 'Пока нет ни одного начисления: кэшбэк приходит за оплаченные заказы — 1 балл = 1 ₽');

  return `
    <main class="wallet container">
      <section class="wallet__head" data-testid="wallet-head">
        <span class="wallet__ava">${mEsc(S.user.initials)}</span>
        <div class="wallet__head-mid">
          <p class="wallet__name">${mEsc(S.user.name)}</p>
          <p class="wallet__phone">${mEsc(S.user.phone)}</p>
        </div>
        <span class="wallet__badge" data-testid="wallet-tier-badge">${icon('crown')} ${mEsc(mirrorTierStatus(S.tierState).tier.name)}</span>
      </section>

      <div class="wallet__cols">
        <div class="wallet__col-a">
          <section class="wallet__carousel" data-testid="wallet-cards" data-mir-carousel>
            ${S.accounts.map((acc) => walletMirrorCard(acc)).join('')}
          </section>

          ${S.accounts.length > 1 ? `
            <div class="wallet__dots" role="tablist" aria-label="Счета">
              ${S.accounts.map((acc, i) => `
                <button type="button" class="wallet__dot${i === walletMirrorUi.slide ? ' wallet__dot_active' : ''}"
                  aria-label="Счёт: ${mEsc(acc.title)}" data-action="mir-dot" data-slide="${i}"></button>`).join('')}
            </div>` : ''}

          <div class="wallet__hints">
            <span class="wallet__hint">${icon('rotate')} Нажми — карта перевернётся</span>
            <button type="button" class="wallet__hint wallet__hint_btn" data-action="mir-copy-card" data-testid="wallet-copy">
              ${icon('copy')} Скопировать номер
            </button>
          </div>

          ${pointsAvailable ? `
            <section class="wallet__contour" aria-label="Контур счёта" data-testid="wallet-contour">
              <div class="seg" role="radiogroup" aria-label="Контур счёта">
                <button type="button" class="${!isPoints ? 'active' : ''}" data-action="mir-contour" data-value="money">Деньги</button>
                <button type="button" class="${isPoints ? 'active' : ''}" data-action="mir-contour" data-value="points">Баллы</button>
              </div>
            </section>` : ''}

          <section class="wallet__acct" data-testid="wallet-account">
            <div class="wallet__sec-head">
              <h2 class="wallet__sec-title">${acctTitle}</h2>
              <span class="wallet__sec-sub">${isPoints ? '1 балл = 1 ₽' : mEsc(selected?.title || '')}</span>
            </div>
            <div class="wallet__acct-card">
              <p class="wallet__acct-balance">${fmtKop(balance)}<span class="wallet__acct-unit">${unit}</span></p>
              <p class="wallet__acct-label">${isPoints ? 'Доступно баллов · 1 балл = 1 ₽' : 'Доступно на счёте'}</p>
              <div class="wallet__acct-stats">
                <div class="wallet__stat"><span class="wallet__stat-v">${fmtKop(month.earned)} ${unit}</span><span class="wallet__stat-l">Начислено за месяц</span></div>
                <div class="wallet__stat"><span class="wallet__stat-v">${fmtKop(month.spent)} ${unit}</span><span class="wallet__stat-l">Списано за месяц</span></div>
                <div class="wallet__stat"><span class="wallet__stat-v">${month.count}</span><span class="wallet__stat-l">Операций за месяц</span></div>
              </div>
            </div>
          </section>

          ${walletMirrorPass()}
        </div>

        <div class="wallet__col-b">
          <section class="wallet__history" data-testid="wallet-feed">
            <div class="wallet__sec-head">
              <h2 class="wallet__sec-title">Операции</h2>
              ${historyCount ? `<span class="wallet__sec-sub">${historyCount}</span>` : ''}
            </div>

            <div class="wallet__tabs" role="tablist" aria-label="Фильтр операций">
              <div class="seg" role="radiogroup" aria-label="Фильтр операций">
                ${WALLET_FILTERS_MIRROR.map((tab) => `
                  <button type="button" class="${walletMirrorUi.filter === tab.value ? 'active' : ''}"
                    data-action="mir-filter" data-value="${tab.value}" data-testid="wallet-tab-${tab.value}">${tab.label}</button>`).join('')}
              </div>
            </div>

            <div class="seg" role="group" aria-label="Период операций">
              ${WALLET_PERIODS_MIRROR.map((p) => `
                <button type="button" class="${walletMirrorUi.period === p.id ? 'active' : ''}"
                  aria-pressed="${walletMirrorUi.period === p.id}"
                  data-action="mir-period" data-value="${p.id}" data-testid="wallet-period-${p.id}">${p.label}</button>`).join('')}
            </div>

            ${isPoints && pointsRows.length ? mHistoryList(pointsRows) : ''}

            ${!isPoints && moneyRows.length ? (() => {
              let html = '';
              let lastDay = null;
              for (const tx of moneyRows) {
                const day = dayLabel(new Date(tx.created_at).getTime());
                if (day !== lastDay) { html += `<p class="wallet__day">${day}</p>`; lastDay = day; }
                html += `
                  <div class="tx-row">
                    <span class="tx-ico ${tx.dir === 'in' ? 'in' : 'out'}">${icon(tx.dir === 'in' ? 'arrow-down-left' : 'cart')}</span>
                    <div class="tx-mid">
                      <div class="tx-name">${mEsc(tx.title)}</div>
                      <div class="tx-meta">${new Date(tx.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div class="tx-sum${tx.dir === 'in' ? ' plus' : ''}">${tx.dir === 'in' ? '+' : '−'}${fmtKop(tx.amount)} ₽</div>
                  </div>`;
              }
              return `<div class="wallet__list">${html}</div>`;
            })() : ''}

            ${historyCount ? '' : `
              <div class="wallet__empty">
                <p>${emptyText}</p>
                ${isPoints && !S.transactions.length ? '<a href="#/stores" class="wallet__empty-link">Сделать заказ</a>' : ''}
              </div>`}

            <p class="wallet__note">
              ${walletMirrorUi.contour === 'money' ? 'Проводки рублёвого счёта' : '1 балл = 1 ₽ · баллы бессрочные'}
              · по 24 на страницу
            </p>
          </section>
        </div>
      </div>
    </main>`;
}

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="mir-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'mir-filter' || action === 'mir-period' || action === 'mir-contour') {
    if (action === 'mir-filter') walletMirrorUi.filter = el.dataset.value;
    if (action === 'mir-period') walletMirrorUi.period = el.dataset.value;
    if (action === 'mir-contour') walletMirrorUi.contour = el.value || el.dataset.value;
    renderViewPreserveScroll();
    return;
  }

  if (action === 'mir-dot') {
    walletMirrorUi.slide = Number(el.dataset.slide) || 0;
    const carousel = document.querySelector('[data-mir-carousel]');
    if (carousel) {
      const width = carousel.clientWidth;
      carousel.scrollTo({ left: width * walletMirrorUi.slide, behavior: 'smooth' });
    }
  }
});

// Синхронизация точек при свайпе карусели
document.addEventListener('scroll', (e) => {
  const carousel = e.target.closest?.('[data-mir-carousel]');
  if (!carousel) return;
  const width = carousel.clientWidth;
  if (!width) return;
  const slide = Math.round(carousel.scrollLeft / width);
  const dots = carousel.parentElement.querySelectorAll('.wallet__dot');
  dots.forEach((d, i) => d.classList.toggle('wallet__dot_active', i === slide));
}, true);

Object.assign(SCREENS, { wallet: renderWalletMirror });
