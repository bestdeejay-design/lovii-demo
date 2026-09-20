/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · АДРЕСА И РЕДАКТИРОВАНИЕ ПРОФИЛЯ
 * Перенос ProfileAddresses.vue (AddressItem/AddressesEmpty),
 * AddressForm.vue и ProfileEditForm.vue из lovii-app@staging.
 * Адреса хранятся в localStorage (lv_addresses) — без бекенда.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. v1.
 * ============================================================ */

/* ---------- Хранилище адресов ---------- */

const ADDRESSES_DEFAULT = [
  { id: 1, label: 'Дом', street: 'ул. Тверская', house: '12', entrance: '2', floor: '3', apartment: '45', comment: '', current: true },
  { id: 2, label: 'Работа', street: 'Столешников пер.', house: '7', entrance: '', floor: '', apartment: '', comment: '' },
];

const accUi = { form: {} };

function accLoadAddresses() {
  try {
    const raw = JSON.parse(localStorage.getItem('lv_addresses') || 'null');
    if (Array.isArray(raw) && raw.length) return raw;
  } catch { /* приватный режим */ }
  return JSON.parse(JSON.stringify(ADDRESSES_DEFAULT));
}

function accSaveAddresses(list) {
  try { localStorage.setItem('lv_addresses', JSON.stringify(list)); } catch { /* приватный режим */ }
}

/* ---------- Формат адреса (formatAddressLabel@staging) ---------- */

function accAddressLine(a) {
  return `${a.street}, ${a.house}`.trim();
}

function accExtra(a) {
  const parts = [];
  if (a.entrance) parts.push(`подъезд ${a.entrance}`);
  if (a.floor) parts.push(`этаж ${a.floor}`);
  if (a.apartment) parts.push(`кв. ${a.apartment}`);
  return parts.join(' · ');
}

/* ---------- Список адресов (ProfileAddresses) ---------- */

function renderAddressesMirror() {
  const list = accLoadAddresses();
  const rows = list.map((a, i) => `
    <div class="card address-item${a.current ? ' active' : ''}">
      <div class="address-item__info" data-action="acc-select" data-id="${a.id}" role="button" tabindex="0">
        ${a.label ? `<h6>«${mEsc2(a.label)}»</h6>` : ''}
        <p>${mEsc2(accAddressLine(a))}</p>
        ${accExtra(a) ? `<p class="address-item__extra">${mEsc2(accExtra(a))}</p>` : ''}
        ${a.current ? '<p class="address-item__current">Текущий адрес доставки</p>' : ''}
      </div>
      <button type="button" class="address-item__edit" aria-label="Редактировать адрес" data-go="address:${a.id}">${icon('edit')}</button>
    </div>`).join('');

  return `
    <main class="addresses container">
      <div class="addresses__head">
        <h4>Мои адреса</h4>
        <button type="button" class="icon-btn" aria-label="Добавить адрес" data-go="address:new">${icon('plus')}</button>
      </div>
      ${list.length
        ? `<div class="addresses__list">${rows}</div>`
        : `<section class="card cart-empty">
            <div class="cart-empty__content"><span>${icon('pin')}</span><h4>Адресов пока нет</h4><p>Добавьте адрес — доставка по нему появится при оформлении заказа</p></div>
            <div class="cart-empty__action"><a href="#/address:new" class="acct__btn acct__btn_brand" style="min-width:180px">Добавить адрес</a></div>
          </section>`}
    </main>`;
}

/* ---------- Форма адреса (AddressForm) ---------- */

function renderAddressFormMirror(idOrNew) {
  const list = accLoadAddresses();
  const editing = idOrNew !== 'new';
  const a = editing ? (list.find((x) => String(x.id) === String(idOrNew)) || {}) : {};
  const f = { label: '', street: '', house: '', entrance: '', floor: '', apartment: '', intercom: '', comment: '', ...a };

  const field = (label, key, extra = '') => `
    <label class="acc-field">${label}
      <input type="text" value="${mEsc2(f[key] || '')}" data-action="acc-field" data-key="${key}" ${extra}>
    </label>`;

  return `
    <main class="address-form container">
      <div class="acc-map" aria-hidden="true">
        <span class="acc-map__pin">${icon('pin')}</span>
        <span class="acc-map__grid"></span>
      </div>
      <div class="acc-fields">
        ${field('Название адреса', 'label', 'placeholder="Дом, Работа…"')}
        ${field('Город', 'city', 'value="Москва" readonly')}
        ${field('Улица', 'street', 'placeholder="ул. Тверская"')}
        ${field('Дом', 'house', 'placeholder="12"')}
        <div class="acc-two">
          ${field('Подъезд', 'entrance')}
          ${field('Этаж', 'floor')}
        </div>
        <div class="acc-two">
          ${field('Квартира', 'apartment')}
          ${field('Домофон', 'intercom')}
        </div>
        ${field('Комментарий для курьера', 'comment', 'placeholder="Код домофона, где оставить…"')}
      </div>
      <button type="button" class="acct__btn acct__btn_brand" data-action="acc-save" data-edit="${editing ? idOrNew : ''}">
        ${editing ? 'Сохранить адрес' : 'Добавить адрес'}
      </button>
      ${editing ? '<button type="button" class="acc-del" data-action="acc-del" data-id="' + idOrNew + '">Удалить адрес</button>' : ''}
    </main>`;
}

/* ---------- Редактирование профиля (ProfileEditForm) ---------- */

const accProfile = { last_name: 'Lovii', first_name: 'Александра' };

function renderProfileEditMirror() {
  const S = PROFILE_MIRROR_SEED.user;
  return `
    <main class="profile-edit container">
      <section class="profile__member">
        <span class="profile__ava">${mEsc2(S.initials)}</span>
        <div class="profile__member-mid">
          <p class="profile__member-name">${mEsc2(S.name)}</p>
          <p class="profile__member-phone">${mEsc2(S.phone)}</p>
        </div>
      </section>

      <p class="acc-kicker">Личные данные</p>
      <section class="card role-card acc-card">
        <label class="acc-field">Фамилия
          <input type="text" value="${mEsc2(accProfile.last_name)}" data-action="acc-profile" data-key="last_name">
        </label>
        <label class="acc-field">Имя
          <input type="text" value="${mEsc2(accProfile.first_name)}" data-action="acc-profile" data-key="first_name">
        </label>
        <label class="acc-field">E-mail
          <input type="email" placeholder="Добавьте почту для писем" data-action="acc-profile" data-key="email">
        </label>
      </section>

      <section class="card role-card acc-card">
        <div class="role-section-head"><h2>Быстрый вход</h2></div>
        <div style="padding:12px 16px 16px;display:grid;gap:10px">
          <button type="button" class="acct__btn" data-go="settings">${icon('lock')} PIN-код и Face ID — в настройках</button>
        </div>
      </section>

      <button type="button" class="acct__btn acct__btn_brand" data-action="acc-save-profile">Сохранить</button>
    </main>`;
}

/* ---------- События ---------- */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action^="acc-"]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'acc-select') {
    const list = accLoadAddresses().map((a) => ({ ...a, current: String(a.id) === el.dataset.id }));
    accSaveAddresses(list);
    PROFILE_MIRROR_SEED.user.deliveryAddress = list.find((a) => a.current)?.street || '';
    toast('Адрес доставки выбран', el.closest('.address-item')?.querySelector('p')?.textContent);
    renderViewPreserveScroll();
    return;
  }

  if (action === 'acc-save') {
    const list = accLoadAddresses();
    const f = accUi.form;
    const read = (key) => (document.querySelector(`[data-action="acc-field"][data-key="${key}"]`)?.value || '').trim();
    if (el.dataset.edit) {
      const item = list.find((x) => String(x.id) === String(el.dataset.edit));
      if (item) {
        Object.assign(item, {
          label: read('label'), street: read('street'), house: read('house'),
          entrance: read('entrance'), floor: read('floor'), apartment: read('apartment'),
          intercom: read('intercom'), comment: read('comment'),
        });
      }
      accSaveAddresses(list);
      toast('Адрес сохранён');
      go('addresses');
      return;
    }
    const addr = {
      id: Date.now(),
      label: read('label'), street: read('street') || 'ул. Тверская', house: read('house') || '1',
      entrance: read('entrance'), floor: read('floor'), apartment: read('apartment'),
      intercom: read('intercom'), comment: read('comment'), current: false,
    };
    list.push(addr);
    accSaveAddresses(list);
    toast('Адрес добавлен', accAddressLine(addr));
    accUi.form = {};
    go('addresses');
    return;
  }

  if (action === 'acc-del') {
    accSaveAddresses(accLoadAddresses().filter((x) => String(x.id) !== el.dataset.id));
    toast('Адрес удалён');
    go('addresses');
    return;
  }

  if (action === 'acc-save-profile') {
    PROFILE_MIRROR_SEED.user.name = accProfile.first_name || PROFILE_MIRROR_SEED.user.name;
    toast('Профиль сохранён', 'Демо: изменения живут до перезагрузки');
    return;
  }
});

document.addEventListener('input', (e) => {
  const el = e.target.closest('[data-action="acc-field"], [data-action="acc-profile"]');
  if (!el) return;
  if (el.dataset.action === 'acc-field') accUi.form[el.dataset.key] = el.value;
  else accProfile[el.dataset.key] = el.value;
});

/* ---------- Регистрация ---------- */

Object.assign(SCREENS, {
  addresses: renderAddressesMirror,
  address: () => renderAddressFormMirror(state.view.param || 'new'),
  'profile-edit': renderProfileEditMirror,
});
