/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · АВТОРИЗАЦИЯ (#/auth)
 * Перенос AuthModule.vue (AuthPhone → AuthCallCoders → AuthMaxLink/
 * Telegram/VK → AuthCode) из lovii-app@staging.
 * Экран промокода из сценария входа убран (решение владельца 2026-09-21):
 * промокод представителя — часть сценария ролей, а не регистрации.
 * Без бекенда: код подтверждения в демо — любые 4 цифры.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. v1.
 * ============================================================ */

const authUi = { step: 'phone', phone: '', channel: '', code: '' };

const AUTH_CHANNELS = [
  { id: 'max', label: 'MAX', live: true },
  { id: 'telegram', label: 'Telegram', live: true },
  { id: 'vkontakte', label: 'ВКонтакте', live: true },
  { id: 'call', label: 'Звонок', live: false },
];

const AUTH_CHANNEL_HINT = {
  max: 'Код отправлен в бот «Лови» в MAX — откройте чат с ботом и найдите последнее сообщение',
  telegram: 'Код отправлен в бот «Лови» в Telegram',
  vkontakte: 'Код отправлен в сообщество «Лови» во ВКонтакте',
  call: 'Сейчас позвонит автоинформатор — последние 4 цифры номера и есть код',
};

function aEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function aPhonePretty(raw) {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11) return raw;
  return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
}

/* ---------- Шаги ---------- */

function aStepPhone() {
  return `
    <section class="auth-step">
      <h3>Введите ваш номер телефона</h3>
      <div class="acc-field">
        <input type="tel" inputmode="tel" placeholder="+7 ### ###-##-##" data-action="auth-phone-input">
      </div>
      <p class="auth-note">При входе и регистрации вы соглашаетесь с
        <a href="https://axiiom-ru.github.io/lovii/docs/Публичная_оферта.html" target="_blank" rel="noopener">Условиями использования сайта</a> и
        <a href="https://axiiom-ru.github.io/lovii/docs/Политика_обработки_ПД.html" target="_blank" rel="noopener">Политикой обработки персональных данных</a>
      </p>
      <button type="button" class="acct__btn acct__btn_brand" data-action="auth-phone-next">Продолжить</button>
    </section>`;
}

/* Брендовые лого каналов — файлы из приложения (lovii-app@staging → assets/brand) */
const AUTH_CHANNEL_LOGO = {
  max: 'assets/brand/max.svg',
  telegram: 'assets/brand/telegram.svg',
  vkontakte: 'assets/brand/vk.svg',
};

function aStepChannel() {
  return `
    <section class="auth-step">
      <h3>Выберите вариант для отправки кода&nbsp;подтверждения</h3>
      <p class="auth-phone-line">Код придёт на ${aEsc(aPhonePretty(authUi.phone))}</p>
      <div class="auth-channels">
        ${AUTH_CHANNELS.map((c) => `
          <button type="button" class="acct__btn auth-channel${c.live ? '' : ' is-soon'}" data-testid="auth-otp-method"
            data-action="${c.live ? 'auth-channel' : ''}" data-channel="${c.id}" ${c.live ? '' : 'disabled'}>
            <span class="auth-channel-ico${AUTH_CHANNEL_LOGO[c.id] ? ' auth-channel-ico_logo' : ''}">${AUTH_CHANNEL_LOGO[c.id]
              ? `<img src="${AUTH_CHANNEL_LOGO[c.id]}" alt="" width="24" height="24" decoding="async">`
              : icon('phone')}</span>
            ${c.label}${c.live ? '' : '<span class="soon-badge">Скоро</span>'}
          </button>`).join('')}
      </div>
    </section>`;
}

function aStepCode() {
  const hint = AUTH_CHANNEL_HINT[authUi.channel] || '';
  startAuthResendTimer();
  return `
    <section class="auth-step">
      <h3>Введите код подтверждения</h3>
      <p class="auth-phone-line">${hint ? mEsc2(hint) : ''}</p>
      <div class="acc-field">
        <input id="code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="0000"
          pattern="[0-9]*" enterkeyhint="done" autocapitalize="off" spellcheck="false" autofocus
          class="auth-code-input" data-action="auth-code-input">
      </div>
      <p class="auth-note" id="auth-resend">${icon('rotate')}
        <span id="auth-resend-text">Новый код можно получить через ${AUTH_RESEND_SEC} сек.</span>
        <button type="button" class="link-btn" id="auth-resend-btn" data-action="auth-code-resend" hidden>Отправить код повторно</button>
      </p>
      <button type="button" class="link-btn" data-action="auth-code-autofill">Демо: подставить код из «пуша»</button>
    </section>`;
}

/* --- Приём кода: канон приложения (SZ-012 §2.5) ---
   Поле ОДНО, с autocomplete="one-time-code" + inputmode="numeric": этого достаточно, чтобы iOS/Android
   подставили код из сообщения бота (строка «Код: 1234» в тексте — триггер системы). Плюс автофокус
   (без него система подстановку не предлагает), нормализация вставки и авто-отправка на 4-й цифре.
   На Android Chrome дополнительно пробуем WebOTP (SMS) — тихо, если API нет. */
const AUTH_RESEND_SEC = 30;
let authResendTimer = null;
let authResendLeft = AUTH_RESEND_SEC;

function startAuthResendTimer() {
  authResendLeft = AUTH_RESEND_SEC;
  if (authResendTimer) clearInterval(authResendTimer);
  authResendTimer = setInterval(() => {
    authResendLeft = Math.max(0, authResendLeft - 1);
    const txt = document.getElementById('auth-resend-text');
    const btn = document.getElementById('auth-resend-btn');
    if (txt) txt.textContent = authResendLeft > 0
      ? `Новый код можно получить через ${authResendLeft} сек.`
      : 'Код можно запросить повторно';
    if (authResendLeft === 0) {
      if (btn) btn.hidden = false;
      clearInterval(authResendTimer); authResendTimer = null;
    }
  }, 1000);
}

function authCodeFilled(digits) {
  authUi.code = digits;
  if (digits.length !== 4) return;
  // кода достаточно: вход завершается сразу, без экрана промокода (решение владельца 2026-09-21)
  toast('Проверяем код…', 'Демо: любые 4 цифры подходят');
  setTimeout(() => {
    toast('Вы вошли', 'Демо: вход без бекенда', 'positive');
    go('profile');
  }, 450);
}

/* Android Chrome: код из SMS приходит сам (формат «@домен #1234»). Тихо пропускаем, если API нет. */
function authTryWebOtp() {
  if (!('OTPCredential' in window) || !navigator.credentials || !navigator.credentials.get) return;
  const ac = new AbortController();
  navigator.credentials.get({ otp: { transport: ['sms'] }, signal: ac.signal })
    .then((otp) => {
      const code = otp && otp.code ? String(otp.code).replace(/\D/g, '').slice(0, 4) : '';
      if (!code) return;
      const el = document.getElementById('code');
      if (el) el.value = code;
      authCodeFilled(code);
    })
    .catch(() => {});
  setTimeout(() => ac.abort(), 60000);
}

/* Демо-шорткат приёмки: #/auth/phone|channel|code открывает нужный шаг.
   Применяется один раз на каждый заход по ссылке, чтобы не мешать обычному проходу. */
let _authStepKey = null;
function applyAuthStep(step) {
  // неизвестный параметр (например устаревшая ссылка #/auth/promo) возвращает сценарий к началу
  if (!['phone', 'channel', 'code'].includes(step)) { authUi.step = 'phone'; return; }
  const key = location.hash;
  if (_authStepKey === key) return;
  _authStepKey = key;
  if (step !== 'phone') {
    if (!authUi.phone) authUi.phone = '+79119287478'; // номер с полным набором данных
    authUi.channel = authUi.channel || 'sms';
  }
  authUi.step = step;
  if (step === 'code') setTimeout(authTryWebOtp, 0);
}

function renderAuthMirror() {
  document.body.classList.add('cabinet-mode-auth');
  const backable = authUi.step !== 'phone';
  const step = authUi.step === 'phone' ? aStepPhone()
    : authUi.step === 'channel' ? aStepChannel()
    : aStepCode();
  return `
    <div class="auth-screen">
      <header class="auth-head">
        <button type="button" class="sf-back" data-action="${backable ? 'auth-back' : 'auth-home'}" aria-label="${backable ? 'Назад' : 'Закрыть'}">
          ${icon(backable ? 'chev-left' : 'x')}
        </button>
      </header>
      ${step}
    </div>`;
}

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="auth-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'auth-code-autofill') {
    // демонстрация приёма: на устройстве это делает система, здесь — кнопкой
    const input = document.getElementById('code');
    if (input) input.value = '1234';
    authCodeFilled('1234');
    return;
  }

  if (action === 'auth-code-resend') {
    toast('Код отправлен повторно', 'Демо: смотрите «сообщение» от бота');
    startAuthResendTimer();
    const btn = document.getElementById('auth-resend-btn');
    if (btn) btn.hidden = true;
    const txt = document.getElementById('auth-resend-text');
    if (txt) txt.textContent = `Новый код можно получить через ${AUTH_RESEND_SEC} сек.`;
    return;
  }

  if (action === 'auth-back') {
    authUi.step = authUi.step === 'code' ? 'channel' : 'phone';
    renderViewPreserveScroll();
    return;
  }

  if (action === 'auth-home') {
    go('home');
    return;
  }

  if (action === 'auth-phone-next') {
    const digits = (authUi.phone || '').replace(/\D/g, '');
    if (digits.length !== 11) {
      toast('Введите номер полностью', '+7 ### ###-##-##', 'important');
      return;
    }
    authUi.step = 'channel';
    renderViewPreserveScroll();
    return;
  }

  if (action === 'auth-channel') {
    authUi.channel = el.dataset.channel;
    authUi.step = 'code';
    renderViewPreserveScroll();
    authTryWebOtp();
    toast('Код отправлен', aPhonePretty(authUi.phone));
    return;
  }

});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action^="auth-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'auth-phone-input') authUi.phone = el.value;

  if (action === 'auth-code-input') {
    // нормализация: вставка «Код: 1234», пробелы и дефисы превращаются в 4 цифры
    const digits = (el.value || '').replace(/\D/g, '').slice(0, 4);
    if (digits !== el.value) el.value = digits;
    authCodeFilled(digits);
  }
});

Object.assign(SCREENS, { auth: renderAuthMirror });

/* витринные экраны снимают режим авторизации (общий паттерн с msp.js/roles.js):
   иначе body.cabinet-mode-auth прилипает после визита на #/auth
   и прячет шапку (.app-header) на всех последующих экранах до перезагрузки */
new MutationObserver(() => {
  if (!document.querySelector('.auth-screen')) {
    document.body.classList.remove('cabinet-mode-auth');
  }
}).observe(document.getElementById('view'), { childList: true });
