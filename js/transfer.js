/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · ЭКРАН «ПЕРЕВОД» (#/transfer)
 *
 * Упрощение (владелец 25.09): нет выбора способа, одно поле адресата;
 * источник выбирается ОДНИМ выпадающим списком (карты/счета кошелька —
 * свайпаются, но отправки у них нет, поэтому переводы = отдельный экран).
 *
 * Исправления 25.09 (второй заход):
 *   • промокод — ровно 6 символов, может быть цифрами ИЛИ буквами;
 *   • калькулятор ТОЧНЫЙ: считает ровно по введённой сумме, без молчаливой
 *     подмены; превышение лимита/остатка — явным сообщением и блокировкой;
 *   • деньги показываем с копейками, где они есть.
 *
 * Правила — зеркало lovii-core TransferService / config/transfers.php:
 *   мин. 100 ₽, макс. 3 000 ₽, неснижаемый остаток 100 ₽
 *   ступени: ≤500 — 0,5% · ≤1000 — 1% · ≤1500 — 1,5% · ≤2000 — 2%
 *            ≤2500 — 2,5% · ≤3000 — 3% · свыше — 3,5%. Business → PAY — 0%.
 * ============================================================ */

const TRANSFER_LIMITS = { min: 10_000, max: 300_000, reserve: 10_000 };
/* Ступени по config/transfers.php (up_to в копейках, percent в долях). */
const TRANSFER_TIERS = [
  { upTo: 50_000, percent: 0.005 },
  { upTo: 100_000, percent: 0.01 },
  { upTo: 150_000, percent: 0.015 },
  { upTo: 200_000, percent: 0.02 },
  { upTo: 250_000, percent: 0.025 },
  { upTo: 300_000, percent: 0.03 },
  { upTo: null, percent: 0.035 },
];
const TRANSFER_COMPANY = { balance: 384_000, title: 'АТМОСФЕРА' };
const TRANSFER_RESOLVED = {
  phone: { name: 'Марина К.', phone: '+7 ••••-••-12' },
  card: { name: 'Игорь В.', phone: '+7 ••••-••-03' },
  promo: { name: 'Сергей П.', phone: '+7 ••••-••-88' },
};

/* mode: 'p2p' — PAY другому; 'to-business' — PAY → свой счёт компании;
   'to-pay' — счёт компании → PAY (0%). */
const transferMirrorUi = { mode: 'p2p', destination: '', amount: '', done: null };

/* Баллы PAY: берём из общего сида витрины (1 балл = 1 ₽). */
function tMirrorPayBalance() {
  return PROFILE_MIRROR_SEED?.wallet?.balance ?? 125_000;
}

/* ---------- Деньги (с копейками, где они есть) ---------- */

function tMirrorMoney(kopecks) {
  const rubles = kopecks / 100;
  const hasKopecks = Math.round(kopecks) % 100 !== 0;
  const text = rubles.toLocaleString('ru-RU', hasKopecks
    ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 });
  return `${text} ₽`;
}

/* ---------- Определение типа адресации (как TransferResolver) ----------
 * Промокод — ровно 6 символов, может быть и цифрами, и буквами.
 * Телефон — 11 цифр. Карта LOVII — 13+ цифр. */
function tMirrorDetect(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return null;
  const compact = text.replace(/[\s-]/g, '');
  const digits = compact.replace(/\D+/g, '');
  const hasLetters = /[A-Za-zА-Яа-я]/.test(text);

  if (hasLetters) return compact.length >= 4 ? { id: 'promo', title: 'Промокод' } : null;
  if (digits.length === 11) return { id: 'phone', title: 'Телефон' };
  if (digits.length >= 13) return { id: 'card', title: 'Карта LOVII PAY' };
  if (digits.length === 6) return { id: 'promo', title: 'Промокод' };
  return null;
}

function tMirrorResolved() {
  const detected = tMirrorDetect(transferMirrorUi.destination);
  if (!detected) return null;
  return { ...detected, ...(TRANSFER_RESOLVED[detected.id] ?? {}) };
}

/* ---------- Точный расчёт по введённой сумме ---------- */

function tMirrorEntered() {
  const value = Number(String(transferMirrorUi.amount).replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

function tMirrorTariffPercent(amountKopecks) {
  const tier = TRANSFER_TIERS.find((t) => t.upTo === null || amountKopecks <= t.upTo) ?? TRANSFER_TIERS.at(-1);
  return tier.percent;
}

/* Комиссия считается ПО ВВЕДЁННОЙ сумме — без подмены. */
function tMirrorQuote() {
  const amount = tMirrorEntered();
  if (amount <= 0) return null;
  if (transferMirrorUi.mode === 'to-pay') return { amount, percent: 0, commission: 0 };
  const percent = tMirrorTariffPercent(amount);
  return { amount, percent, commission: Math.round(amount * percent) };
}

/* Источник для проверки остатка: PAY-баллы или счёт компании. */
function tMirrorSourceBalance() {
  return transferMirrorUi.mode === 'to-pay' ? TRANSFER_COMPANY.balance : tMirrorPayBalance();
}

/* Явная проверка вместо молчаливой подмены суммы. null — всё корректно. */
function tMirrorValidation() {
  const amount = tMirrorEntered();
  if (amount <= 0) return 'Введите сумму';
  const quote = tMirrorQuote();
  const total = amount + (quote ? quote.commission : 0);

  if (amount < TRANSFER_LIMITS.min)
    return `Минимальная сумма — ${TRANSFER_LIMITS.min / 100} ₽`;
  if (amount > TRANSFER_LIMITS.max)
    return `Максимум за раз — ${TRANSFER_LIMITS.max / 100} ₽`;

  const balance = tMirrorSourceBalance();
  if (transferMirrorUi.mode === 'to-pay') {
    if (total > balance) return `На счёте компании недостаточно средств — доступно ${tMirrorMoney(balance)}`;
    return null;
  }
  const available = balance - TRANSFER_LIMITS.reserve;
  if (total > available)
    return `С учётом неснижаемого остатка 100 ₽ доступно ${tMirrorMoney(Math.max(0, available))}`;
  return null;
}

function tMirrorCanSubmit() {
  if (tMirrorValidation() !== null) return false;
  if (transferMirrorUi.mode === 'p2p' && tMirrorResolved() === null) return false;
  return true;
}

/* ---------- Описание и разметка ---------- */

function tMirrorDirectionText() {
  if (transferMirrorUi.mode === 'to-business')
    return `Перевод баллов PAY на счёт компании «${TRANSFER_COMPANY.title}»`;
  if (transferMirrorUi.mode === 'to-pay')
    return `Перевод со счёта компании «${TRANSFER_COMPANY.title}» в баллы PAY — без комиссии`;
  return 'Перевод баллов PAY другому пользователю';
}

function tMirrorRecipientText() {
  const resolved = tMirrorResolved();
  if (!resolved) return null;
  return [resolved.name, resolved.phone].filter(Boolean).join(' · ');
}

function tMirrorCalcHtml() {
  const quote = tMirrorQuote();
  if (!quote) return `<p class="transfer__quote-muted">Введите сумму — покажем, сколько спишется.</p>`;

  const recipient = transferMirrorUi.mode === 'p2p' ? tMirrorRecipientText() : null;
  const total = quote.amount + quote.commission;
  const commissionLine = quote.commission > 0
    ? `Комиссия ${(quote.percent * 100).toFixed(1)}% — <strong>${tMirrorMoney(quote.commission)}</strong> (оператору платформы)`
    : `Комиссия — <strong>0 ₽</strong>`;

  return `
    <p class="transfer__calc-line">Вы переводите <strong>${tMirrorMoney(quote.amount)}</strong>${
      recipient ? ` получателю ${esc(recipient)}` : ''
    }</p>
    <p class="transfer__calc-line">${commissionLine}</p>
    <p class="transfer__calc-total">Спишется всего: <strong>${tMirrorMoney(total)}</strong></p>`;
}

function tMirrorCtaLabel() {
  if (transferMirrorUi.mode === 'to-business') return 'Пополнить счёт компании';
  if (transferMirrorUi.mode === 'to-pay') return 'Зачислить баллы';
  return 'Перевести';
}

function tMirrorSourceOptions() {
  return [
    { id: 'pay', title: 'Личный счёт (PAY)' },
    { id: 'business', title: 'Счёт компании' },
  ];
}

function tMirrorSourceSelect() {
  const current = transferMirrorUi.mode === 'to-pay' ? 'business' : 'pay';
  return `<label class="f-field"><span class="lb">Откуда</span>
    <select data-t-source>
      ${tMirrorSourceOptions().map((o) => `<option value="${o.id}" ${o.id === current ? 'selected' : ''}>${esc(o.title)}</option>`).join('')}
    </select>
  </label>`;
}

function renderTransferMirror() {
  const ui = transferMirrorUi;

  if (ui.done) {
    return `
      <main class="transfer container">
        <section class="transfer__done" data-testid="transfer-done">
          <span class="transfer__done-ico">${icon('check-circle')}</span>
          <p class="transfer__done-title">${esc(ui.done.status)}</p>
          <p class="transfer__done-text">${esc(ui.done.who)}</p>
          <p class="transfer__done-sum">${esc(ui.done.amount)}</p>
        </section>
        <div class="transfer__cta">
          <button type="button" class="cta-btn brand-gradient big" data-t-again data-testid="transfer-again">Сделать ещё перевод</button>
          <button type="button" class="ghost-btn transfer__home" data-go="home" data-testid="transfer-home">На главную</button>
        </div>
      </main>`;
  }

  const validation = tMirrorValidation();
  const showValidation = tMirrorEntered() > 0 && validation !== null;
  const detected = tMirrorDetect(ui.destination);
  const recipient = tMirrorRecipientText();
  const isBusinessSource = ui.mode === 'to-pay';

  return `
    <main class="transfer container">
      <section class="transfer__balance" data-testid="transfer-balance">
        <span class="transfer__bal-ico">${icon('wallet')}</span>
        <div>
          <p class="transfer__balance-label">${isBusinessSource ? 'Счёт компании' : 'Баллы PAY'}</p>
          <p class="transfer__balance-value" data-testid="transfer-balance-value">${tMirrorMoney(tMirrorSourceBalance())}</p>
        </div>
      </section>

      <form class="transfer__form" data-transfer-form novalidate>
        ${ui.mode === 'to-business' ? `
          <p class="transfer__rules">${esc(tMirrorDirectionText())} — по тарифной сетке.</p>
        ` : `
          ${tMirrorSourceSelect()}
          ${isBusinessSource
            ? `<p class="transfer__rules">Только себе: со счёта компании можно перевести лишь в свои баллы PAY — без комиссии.</p>`
            : `
              <label class="f-field"><span class="lb">Телефон, карта или промокод</span>
                <input type="text" data-t-destination value="${mEsc(ui.destination)}"
                  placeholder="+7 926 000-00-00 · 9643 … · AA1234" autocomplete="off">
              </label>
              <p class="transfer__found" ${detected ? '' : 'hidden'}>
                ${detected ? `${icon('check')} ${esc(detected.title)}${recipient ? ` · ${esc(recipient)}` : ''}` : ''}
              </p>
            `}
        `}

        <label class="f-field"><span class="lb">Сумма</span>
          <input type="text" inputmode="numeric" data-t-amount value="${mEsc(ui.amount)}" placeholder="0" autocomplete="off">
        </label>
        <p class="transfer__guidance" ${showValidation ? '' : 'hidden'}>${showValidation ? esc(validation) : ''}</p>

        <section class="transfer__quote" data-testid="transfer-calc">${tMirrorCalcHtml()}</section>

        <div class="transfer__cta">
          <button type="submit" class="cta-btn brand-gradient big" data-t-submit ${tMirrorCanSubmit() ? '' : 'disabled'}>${tMirrorCtaLabel()}</button>
        </div>

        <p class="transfer__rules transfer__self">
          ${ui.mode === 'to-business'
            ? `<button type="button" class="link-btn" data-t-mode="p2p">← Перевод другому пользователю</button>`
            : isBusinessSource
              ? ''
              : `<button type="button" class="link-btn" data-t-mode="to-business">Себе: PAY → счёт компании</button>`}
        </p>
      </form>
    </main>`;
}

/* ---------- Точечное обновление ---------- */

function tMirrorRefresh() {
  const entered = tMirrorEntered();
  const validation = tMirrorValidation();
  const showValidation = entered > 0 && validation !== null;
  const g = document.querySelector('.transfer__guidance');
  if (g) { g.textContent = showValidation ? validation : ''; g.hidden = !showValidation; }

  const calc = document.querySelector('[data-testid="transfer-calc"]');
  if (calc) calc.innerHTML = tMirrorCalcHtml();

  const detected = tMirrorDetect(transferMirrorUi.destination);
  const recipient = tMirrorRecipientText();
  const f = document.querySelector('.transfer__found');
  if (f) {
    f.innerHTML = detected ? `${icon('check')} ${esc(detected.title)}${recipient ? ` · ${esc(recipient)}` : ''}` : '';
    f.hidden = !detected;
  }

  const submit = document.querySelector('[data-t-submit]');
  if (submit) submit.disabled = !tMirrorCanSubmit();
}

function tMirrorReset() {
  transferMirrorUi.mode = 'p2p';
  transferMirrorUi.destination = '';
  transferMirrorUi.amount = '';
  transferMirrorUi.done = null;
}

/* ---------- События ---------- */

document.addEventListener('change', (e) => {
  const select = e.target.closest('[data-t-source]');
  if (!select) return;
  transferMirrorUi.mode = select.value === 'business' ? 'to-pay' : 'p2p';
  transferMirrorUi.amount = '';
  renderViewPreserveScroll();
});

document.addEventListener('click', (e) => {
  const modeBtn = e.target.closest('[data-t-mode]');
  if (modeBtn) {
    transferMirrorUi.mode = modeBtn.dataset.tMode;
    transferMirrorUi.amount = '';
    renderViewPreserveScroll();
    return;
  }

  if (e.target.closest('[data-t-again]')) {
    tMirrorReset();
    renderViewPreserveScroll();
    return;
  }

  const submit = e.target.closest('[data-t-submit]');
  if (!submit) return;
  e.preventDefault();
  if (!tMirrorCanSubmit()) return;

  const quote = tMirrorQuote();
  const commission = quote ? quote.commission : 0;
  const total = (quote ? quote.amount : 0) + commission;
  const who = transferMirrorUi.mode === 'p2p'
    ? (tMirrorRecipientText() ?? 'получателю')
    : transferMirrorUi.mode === 'to-business'
      ? `на счёт компании «${TRANSFER_COMPANY.title}»`
      : 'в баллы PAY';

  const toastText = transferMirrorUi.mode === 'to-pay' ? 'Баллы зачислены'
    : transferMirrorUi.mode === 'to-business' ? 'Счёт компании пополнен' : 'Перевод выполнен';

  toast(toastText, `${tMirrorMoney(total)}${commission ? ` · комиссия ${tMirrorMoney(commission)}` : ''}`, 'financial');

  transferMirrorUi.done = {
    status: toastText,
    who: `${who}${commission ? ` · комиссия ${tMirrorMoney(commission)}` : ''}`,
    amount: `−${tMirrorMoney(total)}`,
  };
  transferMirrorUi.destination = '';
  transferMirrorUi.amount = '';
  renderViewPreserveScroll();
});

document.addEventListener('input', (e) => {
  const input = e.target.closest('[data-t-destination],[data-t-amount]');
  if (!input) return;
  if (input.dataset.tDestination !== undefined) transferMirrorUi.destination = input.value;
  if (input.dataset.tAmount !== undefined) transferMirrorUi.amount = input.value;
  tMirrorRefresh();
});

document.addEventListener('submit', (e) => {
  if (e.target.closest('[data-transfer-form]')) e.preventDefault();
});

/* Вход на экран сбрасывает режим и экран успеха: иначе «залипает» прошлое
   состояние (успех или режим «себе») при возврате на экран. */
let tMirrorLastHash = location.hash;
window.addEventListener('hashchange', () => {
  const entering = location.hash.startsWith('#/transfer') && !tMirrorLastHash.startsWith('#/transfer');
  tMirrorLastHash = location.hash;
  if (entering) tMirrorReset();
});

Object.assign(SCREENS, { transfer: renderTransferMirror });
