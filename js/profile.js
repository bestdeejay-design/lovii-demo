/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · ЭКРАН «ПРОФИЛЬ»
 * Прямой перенос ProfileModule.vue (+ ProfileCollapse, PayCard,
 * WalletHistoryList, ProfileCabinets, ProfileFooter) из
 * lovii-app@staging в демо без бекенда: та же структура классов,
 * те же тексты, тот же логический порядок блоков. Данные —
 * статический сид в формате API (копейки, ISO-даты).
 *
 * Источник: origin/staging 938fe42, 2026-09-18.
 * ============================================================ */

/* ---------- Сид данных (формат API стейджа) ---------- */

const PROFILE_MIRROR_SEED = {
  user: {
    name: 'Александра',
    phone: '+7 926 ••••-45-67',
    avatarUrl: '',
    initials: 'А',
  },
  // Рублёвый контур баллов: сумма в копейках (как в API).
  wallet: { balance: 125_000 },
  // Счета → карты карусели. kind: personal | company | nominal.
  // Для витрины скинов в демо добавлены все накопленные карты: PAY/PASS/VIP —
  // личные (по канону «счёт один», номер от account_id, баланс общий),
  // BUSINESS — карта МСП, OPERATOR — номинальный счёт платформы (SZ-043).
  // balance личного на рублёвом контуре — 0 (у клиента рублёвых проводок нет),
  // на карте и в баллах показывается wallet.balance.
  accounts: [
    { kind: 'personal', account_id: 401, title: 'Aleksandra Lovii', balance: 0, skin: 'pay', tag: 'LOVII PAY' },
    { kind: 'personal', account_id: 402, title: 'Aleksandra Lovii', balance: 0, skin: 'pass', tag: 'LOVII PASS' },
    { kind: 'personal', account_id: 403, title: 'Aleksandra Lovii', balance: 0, skin: 'vip', tag: 'LOVII VIP' },
    { kind: 'company', account_id: 512, title: 'АТМОСФЕРА', inn: '7842216839', balance: 0, skin: 'biz', tag: 'LOVII BUSINESS' },
    { kind: 'nominal', account_id: 900, title: 'LOVII · Оператор', balance: 0, skin: 'nominal', tag: 'LOVII OPERATOR' },
  ],
  // Проводки баллового контура (копейки, знак — у adjustment).
  transactions: [
    { id: 1, type: 'earn', amount: 9_500, order_id: 168, created_at: addDays(0, 18, 42) },
    { id: 2, type: 'spend', amount: -12_000, order_id: 167, created_at: addDays(0, 13, 5) },
    { id: 3, type: 'earn', amount: 4_200, order_id: 166, created_at: addDays(0, 9, 31) },
    { id: 4, type: 'spend', amount: -8_600, order_id: 165, created_at: addDays(-1, 19, 12) },
    { id: 5, type: 'refund', amount: 2_400, order_id: 164, created_at: addDays(-1, 12, 48) },
    { id: 6, type: 'earn', amount: 15_300, order_id: 163, created_at: addDays(-1, 10, 2) },
    { id: 7, type: 'spend', amount: -5_000, order_id: 162, created_at: addDays(-2, 20, 15) },
    { id: 8, type: 'earn', amount: 6_100, order_id: 161, created_at: addDays(-2, 15, 27) },
    { id: 9, type: 'adjustment', amount: 500, order_id: null, created_at: addDays(-2, 9, 8) },
  ],
  // Программа уровней: подписка Лови активна → LOVII PASS.
  tierState: { subscribed: true, monthTurnover: 84_500 },
  favorites: [
    { id: 'coffee-daily', name: 'Кофейня «Daily»', emoji: '☕', logoBackgroundColor: '#f4e9dd' },
    { id: 'pyshki', name: 'Пекарня «Слойка»', emoji: '🥐', logoBackgroundColor: '#fdf3d8' },
    { id: 'krasota', name: 'Салон «Красота»', emoji: '💅', logoBackgroundColor: '#ffe9f2' },
    { id: 'grill', name: 'Бургерная «Гриль»', emoji: '🍔', logoBackgroundColor: '#ffe8e0' },
  ],
  // Кабинеты ролей (канон прод-консолидации 2026-09-14).
  cabinets: [
    { key: 'msp', title: 'МСП · точка', note: 'Заявка · Товары · Заказы · Настройки', icon: 'store', tile: 't-tiffany', href: '#/msp' },
    { key: 'representative', title: 'Представитель', note: 'Обзор · Подключение · Точки · Доход', icon: 'users', tile: 't-gold', href: '#/dash/rep' },
    { key: 'ambassador', title: 'Амбассадор', note: 'Обзор · Представители · Обучение', icon: 'sparkles', tile: 't-pink', href: '#/dash/amb' },
    { key: 'owner', title: 'Владелец', note: 'Обзор · Финансы · Структура', icon: 'crown', tile: 't-gold', href: '#/dash/owner' },
    { key: 'investor', title: 'Инвестор', note: 'Рост · Продажи · Доходность', icon: 'trending-up', tile: 't-tiffany', href: '#/dash/investor' },
  ],
  documents: [
    { label: 'Публичная оферта', href: 'https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html' },
    { label: 'Оферта присоединения', href: 'https://axiiom-ru.github.io/lovii/docs/Оферта_присоединения.html' },
    { label: 'Политика обработки ПД', href: 'https://axiiom-ru.github.io/lovii/docs/Политика_обработки_ПД.html' },
  ],
};

function addDays(dayShift, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + dayShift);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

/* ---------- Канон уровней LOVII PAY (pay-tier.ts) ---------- */

const MIRROR_TIERS = [
  { id: 'pay', name: 'LOVII PAY', cond: 'базовый уровень', need: 0, bySub: false, perks: ['Кэшбек баллами 1:1', 'Оплата QR у партнёров', 'Вывод через СБП'] },
  { id: 'pass', name: 'LOVII PASS', cond: 'по подписке Лови', need: 0, bySub: true, perks: ['Мерч Лови', 'Закрытые мероприятия', 'Спец-скидки у МСП'] },
  { id: 'vip', name: 'LOVII VIP', cond: 'оборот от 300 000 ₽', need: 300_000, bySub: false, perks: ['Лимитированный мерч', 'Приоритет в мероприятиях', 'Персональные скидки у МСП', 'Ранний доступ к новинкам'] },
];

// Витрина привилегий статуса (PAY_PRIVILEGES, канон демо).
const MIRROR_PRIVILEGES = [
  { icon: 'gift', title: 'Мерч Лови', sub: 'Эксклюзивные дропы для PASS и VIP', tone: 'pink' },
  { icon: 'ticket', title: 'Закрытые мероприятия', sub: 'Вечера района для своих', tone: 'gold' },
  { icon: 'percent', title: 'Спец-скидки у МСП', sub: 'Свой процент у партнёров района', tone: 'tiffany' },
  { icon: 'clock', title: 'Приоритетная запись', sub: 'Без очереди у 14 точек', tone: 'tiffany' },
  { icon: 'sparkles', title: 'Ранний доступ', sub: 'Новинки и акции на 24 часа раньше', tone: 'gold' },
];

function mirrorTierStatus(state) {
  const index = state.monthTurnover >= MIRROR_TIERS[2].need ? 2 : state.subscribed ? 1 : 0;
  const tier = MIRROR_TIERS[index];
  const next = MIRROR_TIERS[index + 1] || null;

  let progress = 100;
  let hintBefore = 'Максимальный уровень программы — держи его';
  let hintAccent = '';
  let hintAfter = '';

  if (next) {
    if (next.bySub) {
      progress = state.subscribed ? 100 : 0;
      hintBefore = state.subscribed ? 'Подписка Лови активна — уровень ' : 'Оформи подписку Лови — откроется уровень ';
      hintAccent = next.name;
    } else {
      progress = Math.min(100, Math.round((state.monthTurnover / next.need) * 100));
      hintBefore = 'До уровня ';
      hintAccent = next.name;
      hintAfter = ` — обороты ещё ${fmtRub(next.need - state.monthTurnover)} ₽`;
    }
  }

  return {
    tier, index, next, progress, hintBefore, hintAccent, hintAfter,
    levels: MIRROR_TIERS.map((item, i) => ({ id: item.id, name: item.name, state: i === index ? 'cur' : i < index ? 'done' : 'lock' })),
  };
}

// Перки уровня показываются, только если их нет в привилегиях ниже
// (pay-privileges-match: у PASS подписи совпадают дословно → ряд пуст).
function mirrorTierPerks(tier) {
  const privTitles = new Set(MIRROR_PRIVILEGES.map((p) => p.title));
  return (tier.perks || []).filter((perk) => !privTitles.has(perk));
}

/* ---------- Хелперы ---------- */

function mEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

// formatPrice API: копейки → «1 250» (без знака валюты).
function fmtKop(kopecks) {
  return Math.round(Math.abs(kopecks) / 100).toLocaleString('ru-RU');
}
// Целые рубли → «215 500».
function fmtRub(rubles) {
  return Math.round(rubles).toLocaleString('ru-RU');
}

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

/* Номер карты счёта (pay-card.ts, SZ-041): BIN по типу счёта +
   детерминированный хвост FNV-1a + контрольная цифра Луна. */
function fnv1a32(input) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function luhnCheckDigit(base) {
  let sum = 0;
  let double = true;
  for (let i = base.length - 1; i >= 0; i--) {
    let digit = base.charCodeAt(i) - 48;
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return String((10 - (sum % 10)) % 10);
}

function cardNumberFor(account) {
  const bin = account.kind === 'company' ? '96439142' : account.kind === 'nominal' ? '96439000' : '96439138';
  const seed = `${account.kind}:${account.account_id ?? `inn-${account.inn ?? 'none'}`}`;
  const h1 = fnv1a32(seed);
  const h2 = fnv1a32(`${seed}:${h1}`);
  const sevenDigits = String(h1).padStart(10, '0').slice(0, 4) + String(h2).padStart(10, '0').slice(0, 3);
  const base = bin + sevenDigits;
  const tail = sevenDigits + luhnCheckDigit(base);
  return `${bin.slice(0, 4)} ${bin.slice(4)} ${tail.slice(0, 4)} ${tail.slice(4)}`;
}

function cardSkinFor(account) {
  return account.kind === 'company' ? 'biz' : account.kind === 'nominal' ? 'nominal' : 'pay';
}

function cardTagFor(account) {
  return account.kind === 'company' ? 'LOVII BUSINESS' : account.kind === 'nominal' ? 'LOVII OPERATOR' : 'LOVII PAY';
}

function cardBackNote(account) {
  if (account.kind === 'nominal') return 'Единый счёт платформы · через него проходят все расчёты';
  if (account.kind === 'company' && account.inn) return `Счёт компании · ИНН ${account.inn}`;
  return 'Карта программы лояльности LOVII PAY · оплата QR у партнёров';
}

// QR на обороте карты: детерминированная решётка из хэша номера.
function cardQrCells(number) {
  const h = fnv1a32(number);
  let cells = '';
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const edge = y === 0 || y === 8 || x === 0 || x === 8;
      const bit = fnv1a32(`${number}:${x}:${y}`) % 3 === 0;
      if (edge || bit) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  void h;
  return cells;
}

/* ---------- Блоки экрана (разметка 1:1 со стейджем) ---------- */

function mCardBalanceLabel(account) {
  return account.kind === 'company' ? 'Баланс' : account.kind === 'nominal' ? 'Транзит' : 'Баллы';
}

function mPayCard(account, slideCls = 'profile__slide') {
  const num = cardNumberFor(account);
  // Личная карта показывает баланс кошелька (баллы), как на стейдже.
  const bal = account.kind === 'personal' ? PROFILE_MIRROR_SEED.wallet.balance : account.balance;
  // Явный скин из сида (витрина всех карт демо) или канон по типу счёта.
  const skin = account.skin || cardSkinFor(account);
  const tag = account.tag || cardTagFor(account);
  return `
    <div class="${slideCls}">
      <div class="pay-stage">
        <div class="pay-tilt">
          <button type="button" class="paycard skin-${skin}" data-action="pay-flip"
            aria-label="Карта LOVII PAY — нажмите, чтобы перевернуть" data-mir-card-num="${mEsc(num)}">
            <span class="pay-face pay-front">
              <span class="pay-sheen" aria-hidden="true"></span>
              <span class="pay-glare" aria-hidden="true"></span>
              <span class="pay-sweep" aria-hidden="true"></span>
              <span class="pay-top">
                <span class="pay-brand">${tag}</span>
                <span class="pay-chip" aria-hidden="true"></span>
              </span>
              <span class="pay-num">${mEsc(num)}</span>
              <span class="pay-bot">
                <span class="pay-holder">
                  <span class="lbl">Держатель</span>
                  <span class="val">${mEsc(account.title)}</span>
                </span>
                <span class="pay-bal">
                  <span class="lbl">${mCardBalanceLabel(account)}</span>
                  <span class="val">${fmtKop(bal)}&nbsp;${account.kind === 'personal' ? 'б.' : '₽'}</span>
                </span>
              </span>
            </span>
            <span class="pay-face pay-back">
              <span class="pay-sweep" aria-hidden="true"></span>
              <span class="pay-mag" aria-hidden="true"></span>
              <span class="pay-back-mid">
                <span class="pay-qr" aria-hidden="true">
                  <svg viewBox="0 0 9 9" fill="currentColor">${cardQrCells(num)}</svg>
                </span>
                <span class="pay-back-info">
                  <span class="pay-cvv"><span class="lbl">CVV</span><span class="val">•••</span></span>
                  <span class="pay-note">${mEsc(cardBackNote(account))}</span>
                </span>
              </span>
              <span class="pay-back-bot">lovii.ru · поддержка — в чате приложения</span>
            </span>
          </button>
        </div>
      </div>
    </div>`;
}

function mCollapse({ title, subtitle = '', open = false, testid = '', noChev = false, inner }) {
  return `
    <section class="collapse${open ? ' collapse_open' : ''}${noChev ? ' collapse_static' : ''}"${testid ? ` data-testid="${testid}"` : ''}>
      <button type="button" class="collapse__head" aria-expanded="${open}" data-action="mir-collapse"${noChev ? ' tabindex="-1"' : ''}>
        <span class="collapse__text">
          <span class="collapse__title">${title}</span>
          ${subtitle ? `<span class="collapse__sub">${mEsc(subtitle)}</span>` : ''}
        </span>
        ${noChev ? '' : `<span class="collapse__chev" aria-hidden="true">${icon('chev-right')}</span>`}
      </button>
      <div class="collapse__body">
        <div>
          <div class="collapse__inner">${inner}</div>
        </div>
      </div>
    </section>`;
}

// Лента операций (WalletHistoryList): группы по дням, свежие сверху.
const MIRROR_TX_META = {
  earn: { icon: 'coins', tone: 't-gold', label: 'Начисление', note: 'Кэшбэк за заказ' },
  spend: { icon: 'bag', tone: 't-pink', label: 'Покупка', note: 'Оплата баллами' },
  refund: { icon: 'rotate', tone: 't-tiffany', label: 'Возврат', note: 'Возврат кэшбэка' },
  adjustment: { icon: 'percent', tone: 't-tiffany', label: 'Корректировка', note: 'Корректировка баланса' },
};

function isIncomeTx(tx) {
  return tx.type === 'earn' || (tx.type === 'adjustment' && tx.amount > 0);
}

function mHistoryList(transactions, limit = 0) {
  const sorted = [...transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const rows = limit > 0 ? sorted.slice(0, limit) : sorted;

  let html = '';
  let lastLabel = null;
  for (const tx of rows) {
    const meta = MIRROR_TX_META[tx.type] || MIRROR_TX_META.adjustment;
    const label = dayLabel(new Date(tx.created_at).getTime());
    if (label !== lastLabel) {
      html += `<div class="history__day">${label}</div>`;
      lastLabel = label;
    }
    const title = tx.order_id ? `${meta.label} · заказ #${tx.order_id}` : meta.label;
    html += `
      <div class="history__row">
        <span class="history__ico ${meta.tone}">${icon(meta.icon)}</span>
        <div class="history__mid">
          <div class="history__name">${mEsc(title)}</div>
          <div class="history__meta">${meta.note}</div>
        </div>
        <div class="history__sum${isIncomeTx(tx) ? ' history__sum_plus' : ''}">${isIncomeTx(tx) ? '+' : '−'}${fmtKop(tx.amount)} б.</div>
      </div>`;
  }
  return `<div class="history">${html || '<div class="history__empty">По этой категории пока нет операций</div>'}</div>`;
}

function mNavRow({ icon: ico, tile, label, sub, href, badge, switchOn, switchKey }) {
  const mid = sub
    ? `<span class="profile__nav-stack"><span>${label}</span><span class="profile__nav-subtitle">${mEsc(sub)}</span></span>`
    : label;
  const tail = switchOn !== undefined
    ? `<button type="button" class="app-switch${switchOn ? ' on' : ''}" data-action="mir-switch"${switchKey ? ` data-key="${switchKey}"` : ''} aria-label="${mEsc(label)}"><span class="app-switch__knob"></span></button>`
    : badge
      ? `<span class="app-badge app-badge_tertiary app-badge_s">${badge}</span>`
      : icon('chev-right', 'icon');
  const inner = `
    <span class="profile__nav-ico ${tile}">${icon(ico)}</span>
    ${mid}
    ${tail}`;
  if (href) return `<a href="${href}">${inner}</a>`;
  if (switchOn !== undefined) return `<div class="profile__switch-row">${inner}</div>`;
  if (badge) return `<div class="profile__soon-row">${inner}</div>`;
  return `<button type="button" class="profile__settings-row">${inner}</button>`;
}

/* ---------- Экран ---------- */

function renderProfileMirror() {
  const S = PROFILE_MIRROR_SEED;
  // Оповещения — тот же источник, что и «Настройки»: state.settings
  // (до загрузки settings.js на холодном старте — дефолт «вкл»)
  const sState = typeof ensureSettings === 'function'
    ? ensureSettings()
    : { push: { master: true }, consents: { email: true } };
  const pushOn = !!sState.push.master;
  const emailOn = (sState.consents || {}).email !== false;
  const tier = mirrorTierStatus(S.tierState);
  const perks = mirrorTierPerks(tier.tier);
  const monthEarned = S.transactions
    .filter((tx) => new Date(tx.created_at).getMonth() === new Date().getMonth() && isIncomeTx(tx))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthPurchases = S.transactions
    .filter((tx) => new Date(tx.created_at).getMonth() === new Date().getMonth() && !isIncomeTx(tx)).length;

  const cards = `
    <section class="profile__cards" aria-label="Карты и счета">
      <div class="profile__carousel" data-testid="profile-cards">
        ${S.accounts.map((acc) => mPayCard(acc)).join('')}
      </div>
      <div class="profile__card-hints">
        <span class="profile__hint-ico" aria-hidden="true">${icon('rotate')}</span>
        <button type="button" class="profile__hint-btn" data-action="mir-copy-card" data-testid="profile-copy-card">
          ${icon('copy')}
          <span data-mir-copy-label>Скопировать номер</span>
        </button>
      </div>
    </section>`;

  const acct = `
    <div class="acct">
      <div class="acct__main">
        <div class="acct__balance">${fmtKop(S.wallet.balance)}<span class="acct__unit">₽</span></div>
        <div class="acct__lbl">Баланс LOVII PAY · 1 балл = 1 ₽</div>
      </div>
      <div class="acct__stats">
        <div class="acct__stat"><span class="acct__v">${fmtKop(monthEarned)} б.</span><span class="acct__l">Кэшбек за месяц</span></div>
        <div class="acct__stat"><span class="acct__v">${monthPurchases}</span><span class="acct__l">Покупок за месяц</span></div>
        <div class="acct__stat"><span class="acct__v">${S.transactions.length}</span><span class="acct__l">Операций в истории</span></div>
      </div>
      <div class="acct__history">
        <p class="block-cap">История операций<span class="block-cap__sub">последние 8</span></p>
        ${mHistoryList(S.transactions, 8)}
      </div>
      <div class="acct__actions">
        <a class="acct__btn acct__btn_brand" href="#/wallet" data-testid="profile-wallet-entry">${icon('wallet')} Счёт и операции</a>
      </div>
    </div>`;

  const tierHtml = `
    <div class="tier">
      <div class="tier__levels">
        ${tier.levels.map((level) => `
          <span class="tier__level tier__level_${level.state}">
            ${level.state !== 'lock' ? icon('check') : ''}${level.name}
          </span>`).join('')}
      </div>
      <div class="tier__row">
        <span class="tier__name">${icon('crown')} ${tier.tier.name}</span>
        <span class="tier__cond">${tier.tier.cond}</span>
      </div>
      <div class="tier__bar" role="progressbar" aria-valuenow="${tier.progress}" aria-valuemin="0" aria-valuemax="100">
        <span class="tier__fill" style="width:${tier.progress}%"></span>
      </div>
      <p class="tier__next">${tier.hintBefore}${tier.hintAccent ? `<b>${tier.hintAccent}</b>` : ''}${tier.hintAfter}</p>
      <button type="button" class="tier__cta" data-action="mir-subscribe">
        Оформить подписку · 599 ₽/мес
      </button>
      <p class="tier__cta-note">С промокодом Амбассадора — 199 ₽/мес · оплата с внутреннего счёта: LOVII Business, затем LOVII PAY</p>
      ${perks.length ? `<div class="tier__perks" data-testid="profile-tier-perks">${perks.map((perk) => `<span class="tier__perk">${icon('check')} ${mEsc(perk)}</span>`).join('')}</div>` : ''}
      <div class="tier__privs">
        <p class="block-cap">Привилегии статуса<span class="block-cap__sub">всё для VIP</span></p>
        <div class="priv">
          ${MIRROR_PRIVILEGES.map((item) => `
            <div class="priv__card priv__card_${item.tone}">
              <span class="priv__ico">${icon(item.icon)}</span>
              <div class="priv__title">${item.title}</div>
              <div class="priv__sub">${item.sub}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  const favorites = S.favorites.length
    ? `<ul class="fav-list" data-testid="profile-favorites-list">
        ${S.favorites.map((item) => `
          <li class="fav-list__row">
            <a href="#/store/${item.id}" class="fav-list__link">
              <span class="fav-list__logo" style="background-color:${item.logoBackgroundColor}">${item.emoji}</span>
              <span class="fav-list__name">${mEsc(item.name)}</span>
            </a>
            <button type="button" class="fav-heart" aria-label="Убрать из избранного" data-action="mir-fav">${icon('heart')}</button>
          </li>`).join('')}
      </ul>`
    : `<p class="fav-hint">Жми ${icon('heart', 'fav-hint__heart')} на партнёре — он появится здесь</p>`;

  const cabinets = `
    <section class="cabinets">
      <div class="cabinets__list">
        ${S.cabinets.map((row) => `
          ${row.href ? `<a href="${row.href}" class="cabinets__row" data-testid="profile-${row.key}-entry">` : `<div class="cabinets__row" data-testid="profile-${row.key}-entry">`}
            <span class="cabinets__ico ${row.tile}">${icon(row.icon)}</span>
            <div class="cabinets__mid">
              <div class="cabinets__name"><span>${row.title}</span></div>
              <div class="cabinets__note">${row.note}</div>
            </div>
            ${row.href ? '<span class="cabinets__action">Открыть</span>' : ''}
          ${row.href ? '</a>' : '</div>'}`).join('')}
      </div>
    </section>`;

  return `
    <main class="profile container">
      <div class="profile__wrapper">
        <header class="profile__member" data-testid="profile-member-head">
          <span class="profile__ava">${mEsc(S.user.initials)}</span>
          <div class="profile__member-mid">
            <p class="profile__member-name">${mEsc(S.user.name)}</p>
            <p class="profile__member-phone">${mEsc(S.user.phone)}</p>
          </div>
          <button type="button" class="profile__member-edit" aria-label="Редактировать профиль">${icon('edit')}</button>
        </header>

        <div class="profile__blocks">
          ${cards}

          ${mCollapse({ title: 'Счёт LOVII PAY', subtitle: tier.tier.name, open: true, testid: 'profile-collapse-account', inner: acct })}
          ${mCollapse({ title: 'Статус LOVII PAY', subtitle: tier.tier.name, testid: 'profile-collapse-tier', inner: tierHtml })}
          ${mCollapse({ title: 'Избранные МСП', subtitle: String(S.favorites.length), testid: 'profile-collapse-favorites', inner: `${favorites}
            <a href="#/stores" class="ops-link" data-testid="profile-favorites-stores"><span>Открыть витрину района</span>${icon('chev-right')}</a>` })}
          ${mCollapse({ title: 'Кабинеты', subtitle: `${S.cabinets.length} доступно`, open: true, testid: 'profile-collapse-cabinets', inner: cabinets })}

          <div class="profile__nav">
            <section aria-label="Адреса">
              ${mNavRow({ icon: 'pin', tile: 't-tiffany', label: 'Мои адреса', href: '#/addresses' })}
            </section>
          </div>

          <div class="profile__nav">
            <section aria-label="Покупки">
              ${mNavRow({ icon: 'package', tile: 't-pink', label: 'История заказов', href: '#/orders' })}
              ${mNavRow({ icon: 'message', tile: 't-gold', label: 'Отзывы', badge: 'Скоро' })}
              ${mNavRow({ icon: 'users', tile: 't-tiffany', label: 'Пригласить друга', badge: 'Скоро' })}
            </section>
          </div>

          <div class="profile__nav">
            <section>
              ${mNavRow({ icon: 'lock', tile: 't-gold', label: 'Быстрый вход', sub: 'Face ID или ПИН-код' })}
            </section>
          </div>

          <div class="profile__nav">
            <section>
              ${mNavRow({ icon: 'bell', tile: 't-pink', label: 'Push-уведомления', sub: 'Статусы заказов на этом устройстве', switchOn: pushOn, switchKey: 'master' })}
              ${mNavRow({ icon: 'send', tile: 't-tiffany', label: 'Письма о новостях', sub: 'Акции и новинки партнёров — на email', switchOn: emailOn, switchKey: 'email' })}
            </section>
          </div>

          <div class="profile__nav">
            <section>
              ${mNavRow({ icon: 'settings', tile: 't-gold', label: 'Все настройки', href: '#/settings' })}
            </section>
          </div>
        </div>
      </div>

      <footer class="profile-footer">
        <div class="legal-card">
          <div class="legal-card__cap">Документы</div>
          ${S.documents.map((doc) => `
            <a class="legal-card__row" href="${doc.href}" target="_blank" rel="noopener">
              <span>${doc.label}</span>${icon('chev-right')}
            </a>`).join('')}
          <div class="legal-card__cap">Поддержка</div>
          <a class="legal-card__row" href="mailto:support@lovii.ru">
            <span>support@lovii.ru</span>${icon('send')}
          </a>
        </div>
        <p class="profile-footer__note">
          LOVII · AXIIOM · ООО «Аксиома»<br>
          ИНН 7842223709 · ОГРН 1247800067690
        </p>
      </footer>
    </main>`;
}

/* ---------- События (делегирование, как в club.js) ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="mir-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'mir-collapse') {
    const card = el.closest('.collapse');
    if (!card) return;
    const open = card.classList.toggle('collapse_open');
    el.setAttribute('aria-expanded', String(open));
    return;
  }

  if (action === 'mir-switch') {
    // Переключаем НАСТРОЙКУ, а не класс: один источник истины с «Настройками»
    const key = el.dataset.key;
    const on = !el.classList.contains('on');
    el.classList.toggle('on', on);
    if (key === 'master' && typeof togglePush === 'function') {
      togglePush('master').then(() => renderViewPreserveScroll());
    } else if (key === 'email' && typeof ensureSettings === 'function') {
      const st = ensureSettings();
      st.consents = st.consents || {};
      st.consents.email = on;
      if (typeof saveSettings === 'function') saveSettings();
      toast(on ? 'Согласие дано' : 'Согласие отозвано');
    }
    return;
  }

  if (action === 'mir-copy-card') {
    const card = document.querySelector('[data-mir-card-num]');
    if (!card) return;
    const num = card.getAttribute('data-mir-card-num');
    const label = el.querySelector('[data-mir-copy-label]');
    const done = () => {
      if (label) label.textContent = 'Номер скопирован';
      toast('Номер карты скопирован', num);
      setTimeout(() => { if (label) label.textContent = 'Скопировать номер'; }, 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(num.replace(/\s/g, '')).then(done).catch(() => {});
    } else {
      done();
    }
    return;
  }

  if (action === 'mir-subscribe') {
    toast('Демо: подключение подписки', 'На стенде списание идёт с LOVII Business, затем с LOVII PAY');
    return;
  }

  if (action === 'mir-fav') {
    el.classList.toggle('active');
    toast(el.classList.contains('active') ? 'Добавлено в избранное' : 'Убрано из избранного');
  }
});

/* ---------- Регистрация экрана ---------- */

Object.assign(SCREENS, { profile: renderProfileMirror });
