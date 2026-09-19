/**
 * LOVII — Настройки профиля: приложение, уведомления, безопасность.
 * ------------------------------------------------------------
 * Карточка экрана: docs/SCREEN_PROFILE.md (SCR-PROFILE-v1, аппрув 2026-09-13).
 *
 * Принципы карточки:
 *   • PIN и Face ID живут ТОЛЬКО на устройстве (localStorage), бэкенд
 *     не участвует. Голый PIN не хранится: только SHA-256(соль + PIN).
 *   • Face ID = WebAuthn platform authenticator (реальный API);
 *     доступен только при установленном PIN; на платформах без
 *     поддержки строка скрыта.
 *   • Тема: «системная» по умолчанию. Единый источник выбора —
 *     state.settings.theme ('system' | 'light' | 'dark'); ключ
 *     lovii_theme (легаси, читается инлайн-скриптом <head>) синхронно
 *     выставляется для явного выбора и стирается для системной.
 *   • Уведомления: мастер-свитч запрашивает permission браузера
 *     (Notification API); типы — по канону PUSH_NOTIFICATIONS_SPEC.md.
 *
 * Новые компоненты (канон lovii-design v1.15, раздел 12):
 *   switch-row · seg · pin-pad · lock-screen. Стили — css/lovii.css §9.
 *
 * Подключается ПОСЛЕ app.js (нужны state, persist, toast, applyTheme);
 * разметку секции настроек для профиля отдаёт renderSettingsHtml()
 * (вызывается из club.js в рантайме).
 */

/* ================= Состояние настроек ================= */

const SETTINGS_DEFAULTS = {
  theme: 'system', // system | light | dark (канон SCR-PROFILE-v1: решение №3)
  fontScale: 'normal', // small | normal | large | huge (font-scale.ts@staging)
  motion: 'system', // system | on | off (SZ-030: доступность)
  push: { master: false, orders: true, points: true, promos: true, news: false },
  consents: { email: true }, // согласие на e-mail-рассылку (промо-пуш = push.promos)
  security: { pinHash: null, salt: null, faceId: null },
};

function ensureSettings() {
  const wasLegacyTheme = (() => {
    try { return localStorage.getItem('lovii_theme'); } catch { return null; }
  })();
  if (!state.settings) {
    // миграция легаси-темы (lovii_theme) в lv.settings — SCR-PROFILE §5
    state.settings = JSON.parse(JSON.stringify(SETTINGS_DEFAULTS));
    if (wasLegacyTheme === 'light' || wasLegacyTheme === 'dark') state.settings.theme = wasLegacyTheme;
  } else {
    state.settings.push = { ...SETTINGS_DEFAULTS.push, ...(state.settings.push || {}) };
    state.settings.consents = { ...SETTINGS_DEFAULTS.consents, ...(state.settings.consents || {}) };
    state.settings.security = { ...SETTINGS_DEFAULTS.security, ...(state.settings.security || {}) };
  }
  return state.settings;
}

function saveSettings() {
  persist();
}

/* ================= Тема (system | light | dark) ================= */

function resolvedTheme(choice) {
  if (choice === 'light' || choice === 'dark') return choice;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function setThemeChoice(choice) {
  const s = ensureSettings();
  s.theme = choice;
  // lovii_theme — кэш разрешения для инлайн-скрипта <head> и
  // системного слушателя app.js: явный выбор → значение, системная → ключ стирается
  try {
    if (choice === 'light' || choice === 'dark') localStorage.setItem('lovii_theme', choice);
    else localStorage.removeItem('lovii_theme');
  } catch { /* приватный режим */ }
  applyTheme(resolvedTheme(choice));
  saveSettings();
}

/* ============ Масштаб текста и анимации (перенос из app) ============ */

const FONT_SCALE_OPTIONS = [
  ['small', 'Мелкий', 0.9], ['normal', 'Обычный', 1], ['large', 'Крупный', 1.1], ['huge', 'Большой', 1.2],
];
const MOTION_OPTIONS = [['system', 'Системные'], ['on', 'Включены'], ['off', 'Выключены']];

function applyFontScale(id) {
  const opt = FONT_SCALE_OPTIONS.find(([k]) => k === id) || FONT_SCALE_OPTIONS[1];
  document.documentElement.style.setProperty('--font-scale', String(opt[2]));
}

function reducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

function applyMotion(id) {
  const off = id === 'off' || (id === 'system' && reducedMotion());
  document.documentElement.setAttribute('data-motion', off ? 'off' : 'on');
}

function setFontScale(id) { ensureSettings().fontScale = id; saveSettings(); applyFontScale(id); }
function setMotion(id) { ensureSettings().motion = id; saveSettings(); applyMotion(id); }

// «Системные» анимации живут за prefers-reduced-motion на лету
try {
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
    if (ensureSettings().motion === 'system') applyMotion('system');
  });
} catch { /* старые браузеры */ }

/* ================= Безопасность: PIN ================= */

const PIN_LEN = 4;

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function pinIsSet() {
  const s = ensureSettings();
  return !!(s.security && s.security.pinHash && s.security.salt);
}

/* тайминго-независимое сравнение SHA-256(соль + PIN) с сохранённым хешем */
async function _pinHashEq(hash, pin, salt) {
  const h = await sha256Hex(salt + pin);
  if (h.length !== hash.length) return false;
  let d = 0;
  for (let i = 0; i < h.length; i++) d |= h.charCodeAt(i) ^ hash.charCodeAt(i);
  return d === 0;
}

/* ---- Оверлей PIN / блокировки (компонент lock-screen) ---- */

let pinMode = null; // 'unlock' | 'setup1' | 'setup2' | 'verify' | 'logout'
let pinBuffer = '';
let pinFirst = '';
let pinOnDone = null; // колбэк после успешного verify (смена/отключение PIN)

function lockEl() {
  return document.getElementById('lock-screen');
}

function pinDotsHtml() {
  let dots = '';
  for (let i = 0; i < PIN_LEN; i++) dots += `<span class="pin-dot${i < pinBuffer.length ? ' on' : ''}"></span>`;
  return `<div class="pin-dots" id="pin-dots">${dots}</div>`;
}

function pinPadHtml() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'face'];
  return keys.map((k) => {
    if (k === 'back') return `<button class="pin-key aux" data-action="pin-key" data-k="back" aria-label="Стереть">${icon('delete', '', 2, true)}</button>`;
    if (k === 'face') return `<button class="pin-key aux" data-action="pin-face" aria-label="Войти по Face ID" ${faceIdSet() ? '' : 'hidden'}>${icon('scan-face', '', 2, true)}</button>`;
    return `<button class="pin-key" data-action="pin-key" data-k="${k}">${k}</button>`;
  }).join('');
}

function lockTitle() {
  if (pinMode === 'unlock') return 'Введите PIN-код';
  if (pinMode === 'setup1') return 'Придумайте PIN-код';
  if (pinMode === 'setup2') return 'Повторите PIN-код';
  if (pinMode === 'verify') return 'Подтвердите PIN-код';
  return '';
}

function renderLock() {
  const el = lockEl();
  if (!el) return;
  if (pinMode === 'logout') {
    el.innerHTML = `
    <div class="lock-confirm">
      <div class="lock-logo"><img class="i-light" src="assets/lovii-logo-light.svg" alt="LOVII" width="140"><img class="i-dark" src="assets/logo-dark.svg" alt="LOVII" width="140"></div>
      <h2>Выйти из демо?</h2>
      <p>Сбросит карту, счёт, историю и настройки на этом устройстве</p>
      <div class="lock-actions">
        <button class="acct-btn brand" data-action="set-logout-yes">${icon('logout')} Выйти</button>
        <button class="acct-btn ghost" data-action="pin-cancel">Остаться</button>
      </div>
    </div>`;
    el.hidden = false;
    return;
  }
  const who = (typeof LOVII_DASH !== 'undefined' && LOVII_DASH.user && LOVII_DASH.user.name) || 'Участник Лови';
  const sub = pinMode === 'unlock'
    ? 'Демо: PIN хранится только на этом устройстве'
    : pinMode === 'setup2'
      ? 'Коды должны совпадать'
      : pinMode === 'verify'
        ? 'Для доступа к изменению'
        : '4 цифры · хранится только на устройстве';
  el.innerHTML = `
  <div class="lock-in">
    <div class="lock-logo"><img class="i-light" src="assets/lovii-logo-light.svg" alt="LOVII" width="140"><img class="i-dark" src="assets/logo-dark.svg" alt="LOVII" width="140"></div>
    <div class="lock-name">${esc(who)}</div>
    <h2 class="lock-title">${lockTitle()}</h2>
    ${pinDotsHtml()}
    <div class="lock-sub">${sub}</div>
    <div class="pin-pad">${pinPadHtml()}</div>
    ${pinMode !== 'unlock' ? `<button class="pin-cancel" data-action="pin-cancel">Отмена</button>` : ''}
  </div>`;
  el.hidden = false;
}

function openPinOverlay(mode, onDone) {
  pinMode = mode;
  pinBuffer = '';
  pinFirst = '';
  pinOnDone = onDone || null;
  renderLock();
}

function closePinOverlay() {
  pinMode = null;
  pinBuffer = '';
  pinFirst = '';
  pinOnDone = null;
  const el = lockEl();
  if (el) el.hidden = true;
}

async function pinCommit() {
  if (pinMode === 'unlock' || pinMode === 'verify') {
    const mode = pinMode;
    const ok = await _pinHashEq(state.settings.security.pinHash, pinBuffer, state.settings.security.salt);
    if (ok) {
      const done = pinOnDone;
      closePinOverlay();
      if (mode === 'unlock') toast('Добро пожаловать в Лови');
      if (typeof done === 'function') done();
    } else {
      // shake без перерисовки: точечно гасим точки и перезапускаем анимацию
      // (раньше rerender через 60мс убивал анимацию — карточка SCR-PROFILE §7)
      pinBuffer = '';
      const dots = document.getElementById('pin-dots');
      if (dots) {
        dots.querySelectorAll('.pin-dot').forEach((d) => d.classList.remove('on'));
        dots.classList.remove('err');
        void dots.offsetWidth; // reflow для перезапуска animation
        dots.classList.add('err');
      }
    }
    return;
  }
  if (pinMode === 'setup1') {
    pinFirst = pinBuffer;
    pinBuffer = '';
    pinMode = 'setup2';
    renderLock();
    return;
  }
  if (pinMode === 'setup2') {
    if (pinBuffer === pinFirst) await pinSave();
    else {
      const dots = document.getElementById('pin-dots');
      if (dots) {
        dots.classList.remove('err');
        void dots.offsetWidth;
        dots.classList.add('err');
      }
      pinBuffer = '';
      pinMode = 'setup1';
      pinFirst = '';
      setTimeout(() => { renderLock(); toast('Коды не совпали — начните заново'); }, 60);
    }
  }
}

function renderLockDotsOnly() {
  const el = lockEl();
  const dots = el && el.querySelector('.pin-dots');
  if (!dots) { renderLock(); return; }
  dots.outerHTML = pinDotsHtml();
}

async function pinSave() {
  const s = ensureSettings();
  s.security.salt = randomHex(16);
  s.security.pinHash = await sha256Hex(s.security.salt + pinBuffer);
  saveSettings();
  closePinOverlay();
  renderViewPreserveScroll(); // обновить строки безопасности (статусы)
  toast('PIN-код установлен', 'Теперь он запрашивается при входе в демо');
}

/* ---- Face ID (WebAuthn platform authenticator) ---- */

let _faceAvailable = null;

function faceIdSet() {
  const s = ensureSettings();
  return !!(s.security && s.security.faceId);
}

async function faceAvailable() {
  if (_faceAvailable !== null) return _faceAvailable;
  try {
    _faceAvailable = !!(window.PublicKeyCredential
      && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch {
    _faceAvailable = false;
  }
  return _faceAvailable;
}

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const b = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b + '='.repeat((4 - (b.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0)).buffer;
}

async function faceRegister() {
  try {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: 'LOVII demo' },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'lovii-demo', displayName: 'Демо-участник Лови' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      },
    });
    const s = ensureSettings();
    s.security.faceId = b64url(cred.rawId);
    saveSettings();
    renderViewPreserveScroll();
    toast('Face ID подключён', 'Вход по биометрии с этого устройства');
  } catch (e) {
    toast('Не удалось подключить Face ID', 'Попробуй ещё раз');
  }
}

async function faceUnlock() {
  const s = ensureSettings();
  if (!s.security || !s.security.faceId) return;
  try {
    await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: b64urlDecode(s.security.faceId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    const done = pinOnDone;
    closePinOverlay();
    toast('Вход по Face ID выполнен');
    if (typeof done === 'function') done();
  } catch (e) {
    toast('Face ID не подтвердился', 'Введи PIN-код');
  }
}

/* ================= Уведомления ================= */

function pushSupported() {
  return typeof window.Notification !== 'undefined';
}

function pushGranted() {
  return pushSupported() && Notification.permission === 'granted';
}

async function togglePush(key) {
  const s = ensureSettings();
  if (key === 'master') {
    if (!s.push.master) {
      if (!pushSupported()) { toast('Пуши недоступны', 'Браузер не поддерживает уведомления'); return; }
      let perm = Notification.permission;
      if (perm === 'default') perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        toast('Пуши запрещены', 'Разреши уведомления в настройках браузера');
        return;
      }
      s.push.master = true;
      toast('Уведомления включены', 'Заказы, начисления, акции и новости');
    } else {
      s.push.master = false;
      toast('Уведомления выключены');
    }
  } else {
    if (!s.push.master) return; // мастер выключен — типы не трогаем
    s.push[key] = !s.push[key];
  }
  saveSettings();
  renderViewPreserveScroll();
}

/* ================= Разметка секции «Настройки» ================= */

function switchRow({ ico, icoCls, title, sub, key, on, disabled, action }) {
  return `
  <div class="row-item switch-row">
    <span class="sr-ico ${icoCls || ''}">${icon(ico)}</span>
    <div class="ri-mid">
      <div class="nm">${esc(title)}</div>
      ${sub ? `<div class="sb">${esc(sub)}</div>` : ''}
    </div>
    <span class="lv-switch${on ? ' on' : ''}${disabled ? ' disabled' : ''}" role="switch" aria-checked="${on ? 'true' : 'false'}" ${disabled ? '' : `data-action="${action || 'set-push'}" data-key="${key}"`}></span>
  </div>`;
}

function seg(options, current, action, aria) {
  return `<div class="seg" role="radiogroup" aria-label="${esc(aria)}">${options.map(([v, l]) =>
    `<button type="button" class="${current === v ? 'active' : ''}" data-action="${action}" data-val="${v}" aria-pressed="${current === v}">${l}</button>`).join('')}</div>`;
}
function segTheme() {
  return seg([['system', 'Системная'], ['light', 'Светлая'], ['dark', 'Тёмная']], ensureSettings().theme, 'set-theme', 'Тема приложения');
}

/* Секция настроек вставляется асинхронно: slot в разметке профиля,
   заполнение — через MutationObserver (см. конец файла). */
let _faceOk = false;
let cacheConfirm = false;

async function fillSettingsSlot() {
  const slot = document.getElementById('settings-slot');
  if (!slot || slot.dataset.filled === '1') return;
  slot.dataset.filled = '1';
  slot.innerHTML = await renderSettingsHtml();
}

async function renderSettingsHtml() {
  const s = ensureSettings();
  const face = _faceOk;
  const pushOn = s.push.master;
  const pushDenied = pushSupported() && Notification.permission === 'denied';
  const pushNote = !pushSupported()
    ? 'Браузер не поддерживает уведомления'
    : pushDenied
      ? 'Разреши уведомления в настройках браузера'
      : '';
  const pinSet = pinIsSet();
  return `
  <div class="section-head" style="margin-top:20px"><h2>Настройки</h2><span class="sub">приложение · уведомления · безопасность</span></div>

  <div class="set-sub">Экран</div>
  <div class="list-card">
    <div class="row-item switch-row">
      <span class="sr-ico t-pink">${icon('sun')}</span>
      <div class="ri-mid"><div class="nm">Тема</div><div class="sb">Системная следует настройкам устройства</div></div>
    </div>
    <div class="seg-row">${segTheme()}</div>
    <div class="row-item switch-row">
      <span class="sr-ico t-tiffany">${icon('smartphone')}</span>
      <div class="ri-mid"><div class="nm">Размер текста</div><div class="sb">Крупный — канон стейджа по умолчанию</div></div>
    </div>
    <div class="seg-row">${seg(FONT_SCALE_OPTIONS.map(([v, l]) => [v, l]), s.fontScale || 'normal', 'set-font', 'Размер текста')}</div>
    <div class="row-item switch-row">
      <span class="sr-ico t-gold">${icon('sparkles')}</span>
      <div class="ri-mid"><div class="nm">Анимации</div><div class="sb">Выключите, если движение некомфортно (SZ-030)</div></div>
    </div>
    <div class="seg-row">${seg(MOTION_OPTIONS, s.motion || 'system', 'set-motion', 'Анимации')}</div>
  </div>

  <div class="set-sub">Приложение</div>
  <div class="list-card">
    <button class="row-item switch-row" data-action="open-sheet">
      <span class="sr-ico t-tiffany">${icon('pin')}</span>
      <div class="ri-mid"><div class="nm">Город и район</div><div class="sb">${esc(state.district)} · влияет на витрину и шаговую доступность</div></div>
      <span class="chev">${icon('chev-right', '', 2, true)}</span>
    </button>
    <button class="row-item switch-row" data-action="install-app">
      <span class="sr-ico t-gold">${icon('smartphone')}</span>
      <div class="ri-mid"><div class="nm">Установить приложение</div><div class="sb">Иконка Лови на главном экране устройства</div></div>
      <span class="chev">${icon('chev-right', '', 2, true)}</span>
    </button>
    <button class="row-item switch-row" data-action="clear-cache">
      <span class="sr-ico t-tiffany">${icon('rotate')}</span>
      <div class="ri-mid"><div class="nm">${cacheConfirm ? 'Точно очистить?' : 'Очистить кэш и обновить'}</div><div class="sb">Если приложение работает странно или не обновилось · вход, тема и настройки останутся</div></div>
      <span class="chev">${icon('chev-right', '', 2, true)}</span>
    </button>
    <div class="row-item switch-row">
      <span class="sr-ico t-pink">${icon('info')}</span>
      <div class="ri-mid"><div class="nm">О приложении</div><div class="sb">${window.LOVII_BUILD || 'демо-сборка'} · карточка экрана SCR-PROFILE-v1</div></div>
    </div>
  </div>

  <div class="set-sub">Уведомления</div>
  <div class="list-card">
    ${switchRow({ ico: 'bell', icoCls: 't-pink', title: 'Пуш-уведомления', sub: pushNote || 'Разрешение браузера · прод-канал по PUSH_NOTIFICATIONS_SPEC', key: 'master', on: pushOn, disabled: !pushSupported() })}
    ${pushOn ? `
    ${switchRow({ ico: 'bag', icoCls: 't-tiffany', title: 'Заказы', sub: 'Статусы: готовится, в пути, готов', key: 'orders', on: s.push.orders })}
    ${switchRow({ ico: 'coins', icoCls: 't-gold', title: 'Начисления баллов', sub: 'Кэшбек и бонусы по карте', key: 'points', on: s.push.points })}
    ${switchRow({ ico: 'percent', icoCls: 't-pink', title: 'Акции и новости', sub: 'Промо-пуши и ваши избранные МСП · по согласию', key: 'promos', on: s.push.promos })}
    ` : ''}
    ${switchRow({ ico: 'send', icoCls: 't-tiffany', title: 'E-mail — акции и новости', sub: 'Письма приходят только с согласия · отключить можно здесь же', key: 'email', action: 'set-consent', on: (s.consents || {}).email !== false })}
    <p class="set-hint">Промо-пуши и письма приходят только с согласия — галочка одна, дублирования нет.</p>
  </div>

  <div class="set-sub">Безопасность</div>
  <div class="list-card">
    <button class="row-item switch-row" data-action="set-pin">
      <span class="sr-ico t-gold">${icon('lock')}</span>
      <div class="ri-mid"><div class="nm">PIN-код</div><div class="sb">${pinSet ? 'Установлен · запрашивается при входе' : 'Не установлен · 4 цифры, хранится только на устройстве'}</div></div>
      <span class="chev">${icon('chev-right', '', 2, true)}</span>
    </button>
    ${face ? `
    <button class="row-item switch-row" data-action="set-face" ${pinSet ? '' : 'disabled'}>
      <span class="sr-ico t-tiffany">${icon('scan-face')}</span>
      <div class="ri-mid"><div class="nm">Face ID / отпечаток</div><div class="sb">${pinSet ? (faceIdSet() ? 'Подключён · вход по биометрии' : 'Вход по биометрии устройства') : 'Сначала установи PIN-код'}</div></div>
      <span class="lv-switch${faceIdSet() ? ' on' : ''}${pinSet ? '' : ' disabled'}"></span>
    </button>
    ` : ''}
    <button class="row-item switch-row" data-action="set-logout">
      <span class="sr-ico t-pink">${icon('logout')}</span>
      <div class="ri-mid"><div class="nm">Выйти</div><div class="sb">Сброс демо-состояния на этом устройстве</div></div>
      <span class="chev">${icon('chev-right', '', 2, true)}</span>
    </button>
  </div>`;
}

/* ================= События ================= */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="set-"], [data-action^="pin-"]');
  if (!el) return;
  const a = el.dataset.action;

  if (a === 'set-theme') {
    setThemeChoice(el.dataset.val);
    renderViewPreserveScroll();
    return;
  }

  if (a === 'set-push') { togglePush(el.dataset.key); return; }

  if (a === 'set-font') { setFontScale(el.dataset.val); renderViewPreserveScroll(); return; }
  if (a === 'set-motion') { setMotion(el.dataset.val); renderViewPreserveScroll(); return; }
  if (a === 'set-consent') {
    const key = el.dataset.key;
    const s2 = ensureSettings();
    s2.consents = s2.consents || {};
    s2.consents[key] = s2.consents[key] === false;
    saveSettings();
    toast(s2.consents[key] ? 'Согласие дано' : 'Согласие отозвано');
    renderViewPreserveScroll();
    return;
  }
  if (a === 'clear-cache') {
    if (!cacheConfirm) { cacheConfirm = true; renderViewPreserveScroll(); setTimeout(() => { cacheConfirm = false; renderViewPreserveScroll(); }, 2600); return; }
    const wipe = (async () => {
      try { if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); } } catch { /* нет SW */ }
      try { const regs = await navigator.serviceWorker?.getRegistrations?.(); await Promise.all((regs || []).map((r) => r.unregister())); } catch { /* нет SW */ }
      location.reload();
    })();
    void wipe;
    return;
  }

  if (a === 'set-pin') {
    if (pinIsSet()) openPinOverlay('verify', () => openPinOverlay('setup1'));
    else openPinOverlay('setup1');
    return;
  }

  if (a === 'set-face') {
    if (!pinIsSet()) { toast('Сначала установи PIN-код', 'Face ID работает вместе с PIN'); return; }
    if (faceIdSet()) {
      const s = ensureSettings();
      s.security.faceId = null;
      saveSettings();
      renderViewPreserveScroll();
      toast('Face ID отключён', 'Вход по PIN-коду');
    } else {
      faceRegister();
    }
    return;
  }

  if (a === 'set-logout') { openPinOverlay('logout'); return; }

  if (a === 'set-logout-yes') {
    try { localStorage.removeItem('lovii_vitrina'); localStorage.removeItem('lovii_theme'); } catch { /* no-op */ }
    location.reload();
    return;
  }

  if (a === 'pin-key') {
    const k = el.dataset.k;
    if (k === 'back') pinBuffer = pinBuffer.slice(0, -1);
    else if (pinBuffer.length < PIN_LEN) pinBuffer += k;
    renderLockDotsOnly();
    if (pinBuffer.length === PIN_LEN) setTimeout(pinCommit, 140);
    return;
  }

  if (a === 'pin-face') { faceUnlock(); return; }

  if (a === 'pin-cancel') {
    if (pinMode === 'setup1' || pinMode === 'setup2' || pinMode === 'verify' || pinMode === 'logout') closePinOverlay();
    return;
  }
});

/* ================= Старт ================= */

(function initSettings() {
  ensureSettings();
  applyTheme(resolvedTheme(ensureSettings().theme));
  applyFontScale(ensureSettings().fontScale || 'normal');
  applyMotion(ensureSettings().motion || 'system');
  // холодный старт сразу на #/settings: слот уже в DOM до наблюдателя
  fillSettingsSlot();
  // доступность Face ID — один запрос на сессию (платформа без
  // WebAuthn: строка скрыта, карточка SCR-PROFILE §7)
  faceAvailable().then((ok) => {
    _faceOk = ok;
    const slot = document.getElementById('settings-slot');
    if (slot && slot.dataset.filled === '1') {
      slot.dataset.filled = '';
      fillSettingsSlot(); // дотянуть строку Face ID, если секция уже отрисована
    }
  });
  // заполнение slot в профиле после каждого рендера
  new MutationObserver(() => fillSettingsSlot()).observe(document.getElementById('view'), { childList: true, subtree: true });
  fillSettingsSlot(); // первый рендер уже случился (settings.js грузится после app.js)
  // PIN-лок: установлен → показываем экран блокировки при загрузке (решение №2)
  if (pinIsSet()) openPinOverlay('unlock');
})();
