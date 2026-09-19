/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · АВТОРИЗАЦИЯ (#/auth)
 * Перенос AuthModule.vue (AuthPhone → AuthCallCoders → AuthMaxLink/
 * Telegram/VK → AuthCode → AuthPromoCode) из lovii-app@staging.
 * Без бекенда: код подтверждения в демо — любые 4 цифры.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. v1.
 * ============================================================ */

const authUi = { step: 'phone', phone: '', channel: '', code: '', resend: 0 };

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

function aStepChannel() {
  return `
    <section class="auth-step">
      <h3>Выберите вариант для отправки кода&nbsp;подтверждения</h3>
      <p class="auth-phone-line">Код придёт на ${aEsc(aPhonePretty(authUi.phone))}</p>
      <div class="auth-channels">
        ${AUTH_CHANNELS.map((c) => `
          <button type="button" class="acct__btn auth-channel${c.live ? '' : ' is-soon'}" data-testid="auth-otp-method"
            data-action="${c.live ? 'auth-channel' : ''}" data-channel="${c.id}" ${c.live ? '' : 'disabled'}>
            <span class="auth-channel-ico">${c.id === 'max' ? 'MAX' : c.id === 'telegram' ? icon('send') : c.id === 'vkontakte' ? 'VK' : icon('phone')}</span>
            ${c.label}${c.live ? '' : '<span class="soon-badge">Скоро</span>'}
          </button>`).join('')}
      </div>
    </section>`;
}

function aStepCode() {
  const hint = AUTH_CHANNEL_HINT[authUi.channel] || '';
  return `
    <section class="auth-step">
      <h3>Введите код подтверждения</h3>
      <p class="auth-phone-line">${AUTH_CHANNEL_HINT[authUi.channel] ? mEsc2(AUTH_CHANNEL_HINT[authUi.channel]) : ''}</p>
      <div class="acc-field">
        <input id="code" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="0000"
          maxlength="4" class="auth-code-input" data-action="auth-code-input">
      </div>
      <p class="auth-note">${icon('rotate')} Новый код можно получить через 30 сек.</p>
    </section>`;
}

function aStepPromo() {
  return `
    <section class="auth-step">
      <h3>Введите промокод, если он есть</h3>
      <div class="acc-field">
        <input type="text" placeholder="6 символов" maxlength="6" data-action="auth-promo-input">
      </div>
      <button type="button" class="acct__btn" data-action="auth-promo-skip">Пропустить</button>
      <p class="auth-note">Промокод представителя открывает доступ к кабинету и привязывает точку к сети</p>
    </section>`;
}

function renderAuthMirror() {
  document.body.classList.add('cabinet-mode-auth');
  const backable = authUi.step !== 'phone';
  const step = authUi.step === 'phone' ? aStepPhone()
    : authUi.step === 'channel' ? aStepChannel()
    : authUi.step === 'code' ? aStepCode()
    : aStepPromo();
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

  if (action === 'auth-back') {
    authUi.step = authUi.step === 'code' ? 'channel' : authUi.step === 'promo' || authUi.step === 'channel' ? 'phone' : 'phone';
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
      toast('Введите номер полностью', '+7 ### ###-##-##');
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
    toast('Код отправлен', aPhonePretty(authUi.phone));
    return;
  }

  if (action === 'auth-promo-skip') {
    go('profile');
    toast('Вы вошли', 'Демо: вход без бекенда');
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action^="auth-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'auth-phone-input') authUi.phone = el.value;
  if (action === 'auth-promo-input') authUi.promo = el.value;

  if (action === 'auth-code-input') {
    if (el.value.length === 4) {
      toast('Проверяем код…', 'Демо: любые 4 цифры подходят');
      authUi.step = 'promo';
      renderViewPreserveScroll();
    }
  }
});

Object.assign(SCREENS, { auth: renderAuthMirror });
