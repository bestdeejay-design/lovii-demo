/* ============================================================
 * ЗЕРКАЛО СТЕЙДЖА · КАБИНЕТЫ ПРЕДСТАВИТЕЛЯ И АМБАССАДОРА
 * Перенос CabinetLayout + RepresentativeOverview/Points/Approvals/
 * Income/Profile и AmbassadorOverview/Reps/Training/Income из
 * lovii-app@staging в демо. Каркас — тот же, что у МСП-кабинета:
 * ролевой хедер + нижний бар разделов, витрина скрыта.
 * Акценты ролей: представитель — gold, амбассадор — tiffany.
 *
 * Источник: origin/staging 1fc7a27, 2026-09-19. v1.
 * ============================================================ */

const rolesUi = { rep: 'overview', amb: 'overview', owner: 'overview', investor: 'growth', ownerPeriod: '30d', investorPeriod: '30d' };

/* ---------- Общий каркас (как у МСП, акцент роли) ---------- */

function rolesShell(role, inner) {
  const CFG = {
    rep: { title: 'Представитель', note: `Открываете бизнесу района выход на Лови · промокод ${REP_SEED.promo}`, icon: 'sparkles', cls: 'rep-cabinet' },
    amb: { title: 'Амбассадор', note: 'Развитие района · обучение представителей', icon: 'sparkles', cls: 'amb-cabinet' },
    owner: { title: 'Владелец', note: 'Платформа целиком · LOVII', icon: 'crown', cls: 'owner-cabinet' },
    investor: { title: 'Инвестор', note: 'Рост и доходность платформы', icon: 'trending-up', cls: 'investor-cabinet' },
  };
  const cfg = CFG[role];
  document.body.classList.add('cabinet-mode');

  const TABS = {
    rep: [['overview', 'Обзор', 'bar-chart'], ['points', 'Торговые точки', 'store'], ['approvals', 'Заявки', 'check-circle'], ['income', 'Доход', 'wallet'], ['profile', 'Профиль', 'user']],
    amb: [['overview', 'Обзор', 'bar-chart'], ['reps', 'Структура', 'users'], ['training', 'Обучение', 'star'], ['income', 'Доход', 'wallet']],
    owner: [['overview', 'Обзор', 'bar-chart'], ['finance', 'Финансы', 'banknote'], ['structure', 'Структура', 'network']],
    investor: [['growth', 'Рост', 'trending-up'], ['sales', 'Продажи', 'bag'], ['money', 'Доходность', 'wallet']],
  };
  const tabs = TABS[role];
  const cur = rolesUi[role];

  return `
    <div class="msp-cabinet ${cfg.cls}">
      <header class="cabinet__head">
        <span class="cabinet__ava" aria-hidden="true">${icon(cfg.icon)}</span>
        <div class="cabinet__titles">
          <h1 class="cabinet__title">${cfg.title}</h1>
          <p class="cabinet__note">${mEsc2(cfg.note)}</p>
        </div>
      </header>

      <main class="cabinet__body container">${inner}</main>

      <nav class="cabinet__bar" aria-label="Разделы кабинета">
        <div class="cabinet__bar-in">
          ${tabs.map(([id, label, ico]) => `
            <button type="button" class="cabinet__bar-link${cur === id ? ' cabinet__bar-link--active' : ''}"
              data-action="roles-tab" data-role="${role}" data-tab="${id}">
              <span class="cabinet__bar-ico">${icon(ico)}</span>
              <span class="cabinet__bar-ind"></span>
              <span class="cabinet__bar-label">${label}</span>
            </button>`).join('')}
        </div>
      </nav>
    </div>`;
}

/* ---------- Сид representative / ambassador ---------- */

const REP_PROMO = 'AA2BTK'; // единый промокод кабинета представителя (совпадает с карточками заявок)

const REP_SEED = {
  promo: REP_PROMO,
  applications: 3,
  activePoints: 2,
  queue: [
    {
      merchant: 'Продукты у дома', legal: 'ООО «Пивоваренная компания «Балтика»»',
      inn: '7802849641', ogrn: '1147847032838',
      point: 'Санкт-Петербург, улица Белы Куна, 1к1',
      phone: '+7 000 000-00-01', promo: REP_PROMO, date: '27 сентября, 16:25', emoji: '🍺',
    },
    {
      merchant: 'Пекарня «Пышка»', legal: 'ООО «АТМОСФЕРА»',
      inn: '7842216839', ogrn: '',
      point: 'Санкт-Петербург',
      phone: '+7 911 928-74-78', promo: REP_PROMO, date: '27 сентября, 01:08', emoji: '🥐',
    },
  ],
  points: [
    { name: 'Пекарня «Пышки»', status: 'Активна', address: 'Столешников пер., 7' },
    { name: 'Салон «Красота»', status: 'Активна', address: 'Столешников пер., 14' },
  ],
};

const AMB_SEED = {
  reps: 4,
  applications: 11,
  training: [
    { name: 'Старт: как работает LOVII', done: true, lessons: '4 урока' },
    { name: 'Промокод и заявки МСП', done: true, lessons: '3 урока' },
    { name: 'Ведение торговой точки после запуска', done: false, lessons: '5 уроков' },
  ],
  repsList: [
    { name: 'Представитель · Тверская', note: '2 активные торговые точки' },
    { name: 'Представитель · Патриаршие', note: '1 активная торговая точка' },
  ],
};

/* ---------- Представитель ---------- */

function repKpi() {
  return `
    <section class="msp-overview__kpi">
      <div class="card role-kpi role-kpi_accent">
        <span class="role-kpi__label">Заявки</span>
        <span class="role-kpi__value">${REP_SEED.applications}</span>
        <span class="role-kpi__sub">по вашему промокоду</span>
      </div>
      <div class="card role-kpi">
        <span class="role-kpi__label">Активные торговые точки</span>
        <span class="role-kpi__value">${REP_SEED.activePoints}</span>
        <span class="role-kpi__sub">подтверждены платформой</span>
      </div>
      <div class="card role-kpi">
        <span class="role-kpi__label">Доход · месяц</span>
        <span class="role-kpi__value">0&nbsp;₽</span>
        <span class="role-kpi__sub">финконтур ещё не подключён</span>
      </div>
      <div class="card role-kpi">
        <span class="role-kpi__label">Уровень</span>
        <span class="role-kpi__value">—</span>
        <span class="role-kpi__sub">откроется с первыми торговыми точками</span>
      </div>
    </section>`;
}

function repOverview() {
  return `
    <div class="rep-overview cabinet-screen">
      ${repKpi()}
      <a href="#/dash/rep" class="card role-next" data-testid="rep-overview-next" data-action="roles-tab" data-role="rep" data-tab="approvals" onclick="return false">
        <span class="role-next__icon">${icon(REP_SEED.queue.length > 0 ? 'check-circle' : 'sparkles')}</span>
        <span class="role-next__body">
          <span class="role-next__title">${REP_SEED.queue.length > 0 ? `${REP_SEED.queue.length} заявки ждут решения` : 'Очередь пуста — новых заявок нет'}</span>
          <span class="role-next__desc">${REP_SEED.queue.length > 0 ? 'Подтвердите заявку — торговая точка получит верификационный счёт' : 'Заявка появится здесь, как только владелец торговой точки введёт ваш промокод'}</span>
        </span>
        <span class="role-next__arrow">${icon('chev-right')}</span>
      </a>
      <section class="card role-card">
        <div class="role-section-head"><h2>Очередь на модерации</h2><span class="role-section-head__sub">${REP_SEED.queue.length}</span></div>
        <div class="msp-orders__list">
          ${REP_SEED.queue.map((q) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${icon('store')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(q.merchant)}</div>
                <div class="sb">${mEsc2(q.legal)}</div>
              </div>
              <span class="role-tag">Ждёт решения</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function repPoints() {
  return `
    <div class="rep-points cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Мои торговые точки</h2><span class="role-section-head__sub">${REP_SEED.points.length}</span></div>
        <div class="msp-orders__list">
          ${REP_SEED.points.map((p) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${icon('store')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(p.name)}</div>
                <div class="sb">${mEsc2(p.address)}</div>
              </div>
              <span class="role-tag">${mEsc2(p.status)}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function repApprovals() {
  const cell = (label, value) => `<div><span>${label}</span><b>${value ? mEsc2(value) : '—'}</b></div>`;
  const card = (a) => `
    <div class="approval-card">
      <div class="approval-head">
        <span class="sr-ico t-tiffany">${icon('store')}</span>
        <div class="ri-mid">
          <div class="nm">${mEsc2(a.merchant)}</div>
          <div class="sb">${mEsc2(a.legal)}</div>
        </div>
      </div>
      <div class="review-grid">
        ${cell('ИНН', a.inn)}
        ${cell('ОГРН', a.ogrn)}
        ${cell('Адрес торговой точки', a.point)}
        ${cell('Контакт', a.phone)}
        ${cell('Промокод', a.promo)}
        ${cell('Подана', a.date)}
      </div>
      <div class="approval-actions">
        <button type="button" class="cta-btn brand-gradient" data-action="rep-approve">Подтвердить</button>
        <button type="button" class="ghost-btn" data-action="rep-reject">Отклонить</button>
      </div>
    </div>`;
  return `
    <div class="rep-approvals cabinet-screen" style="padding-top:6px">
      ${REP_SEED.queue.map(card).join('')}
      <p class="tier__cta-note" style="padding:10px 16px 14px;margin:0">Подтверждение заявки выдаёт верификационный счёт торговой точке.<!-- канон: FINANCIAL_CONTOUR §2 --></p>
    </div>`;
}

function repIncome() {
  return `
    <div class="rep-income cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Доход · месяц</h2></div>
        <div class="card role-kpi role-kpi_accent" style="margin:12px 16px 16px">
          <span class="role-kpi__label">Начислено</span>
          <span class="role-kpi__value">0&nbsp;₽</span>
          <span class="role-kpi__sub">финконтур ещё не подключён — цифры появятся с первым подтверждённым чеком</span>
        </div>
      </section>
    </div>`;
}

function repProfileTab() {
  return `
    <div class="rep-profile cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Роль</h2></div>
        <div class="sf-info-rows" style="padding:12px 16px 16px">
          <div><span>Промокод</span><b>${REP_SEED.promo}</b></div>
          <div><span>Роль</span><b>Представитель</b></div>
          <div><span>Наставник</span><b>Амбассадор · Тверской</b></div>
          <div><span>Доход</span><b>40% от комиссии платформы</b></div>
        </div>
      </section>
    </div>`;
}

/* ---------- Амбассадор ---------- */

function ambOverview() {
  return `
    <div class="amb-overview cabinet-screen">
      <section class="msp-overview__kpi">
        <div class="card role-kpi role-kpi_accent">
          <span class="role-kpi__label">Представители</span>
          <span class="role-kpi__value">${AMB_SEED.reps}</span>
          <span class="role-kpi__sub">в вашей структуре</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Заявки сети</span>
          <span class="role-kpi__value">${AMB_SEED.applications}</span>
          <span class="role-kpi__sub">суммарно по сети</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Доход · месяц</span>
          <span class="role-kpi__value">0&nbsp;₽</span>
          <span class="role-kpi__sub">финконтур ещё не подключён</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Доход</span>
          <span class="role-kpi__value">20%</span>
          <span class="role-kpi__sub">от комиссии сети по BRD</span>
        </div>
      </section>
      <section class="card role-card">
        <div class="role-section-head"><h2>Обучение</h2><button type="button" class="role-link" data-action="roles-tab" data-role="amb" data-tab="training">Открыть</button></div>
        <div class="msp-orders__list">
          ${AMB_SEED.training.map((t) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${t.done ? icon('check-circle') : icon('star')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(t.name)}</div>
                <div class="sb">${t.lessons}</div>
              </div>
              <span class="role-tag">${t.done ? 'Пройден' : 'В работе'}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function ambReps() {
  return `
    <div class="amb-reps cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Структура</h2><span class="role-section-head__sub">${AMB_SEED.repsList.length}</span></div>
        <div class="msp-orders__list">
          ${AMB_SEED.repsList.map((r) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${icon('user')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(r.name)}</div>
                <div class="sb">${mEsc2(r.note)}</div>
              </div>
              <span class="role-tag">Активен</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function ambTraining() {
  return `
    <div class="amb-training cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Программа обучения</h2><span class="role-section-head__sub">${AMB_SEED.training.length}</span></div>
        <div class="msp-orders__list">
          ${AMB_SEED.training.map((t) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${icon('star')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(t.name)}</div>
                <div class="sb">${t.lessons}</div>
              </div>
              <span class="role-tag">${t.done ? 'Пройден' : 'В работе'}</span>
            </div>`).join('')}
        </div>
        <p class="tier__cta-note" style="padding:0 16px 14px">Амбассадор привлекает и обучает представителей, представитель — МСП</p>
      </section>
    </div>`;
}

function ambIncome() {
  return `
    <div class="amb-income cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Доход · месяц</h2></div>
        <div class="card role-kpi role-kpi_accent" style="margin:12px 16px 16px">
          <span class="role-kpi__label">Начислено</span>
          <span class="role-kpi__value">0&nbsp;₽</span>
          <span class="role-kpi__sub">финконтур ещё не подключён</span>
        </div>
      </section>
    </div>`;
}

/* ---------- Рендер и события ---------- */

/* ---------- Владелец: платформа целиком (данные LOVII_DASH) ---------- */

function rolesMoney(n) {
  return Math.round(n).toLocaleString('ru-RU') + ' ₽';
}

function rolesBars(values, labels, accent) {
  const max = Math.max(...values);
  return `
    <div class="roles-bars">
      ${values.map((v, i) => `
        <div class="roles-bars__col">
          <i style="height:${Math.max(6, Math.round((v / max) * 100))}%;background:${accent}"></i>
          <span>${labels ? labels[i] || '' : ''}</span>
        </div>`).join('')}
    </div>`;
}


/* Периоды владельца/инвестора: 30 дней по умолчанию (решение владельца 19.09) */
const ROLES_PERIODS = [
  { id: '30d', label: '30 дней', k: 1 },
  { id: 'week', label: 'Неделя', k: 0.25 },
  { id: 'month', label: 'Текущий месяц', k: 0.9 },
  { id: 'prev', label: 'Прошлый месяц', k: 1.05 },
  { id: 'quarter', label: 'Квартал', k: 2.9 },
  { id: 'all', label: 'За весь период', k: 12.4 },
];

/* Подписок точек нет — есть только LOVII PASS (599/199, цена плавает):
   в финмодель входит СУММА СПИСАНИЙ ЗА ПОДПИСКУ за выбранный период */
const ROLES_PASS_MONTHLY = 191680; // ~320 подписчиков × 599 ₽
const ROLES_GMV_MONTHLY = [
  { name: 'АТМОСФЕРА', gmv: 2800000 },
  { name: 'Grand', gmv: 1820000 },
  { name: 'АКСИОМА', gmv: 0 },
];

function rolesPeriodChipRow(role) {
  const cur = rolesUi[role + 'Period'];
  return `
    <div class="roles-periods">
      ${ROLES_PERIODS.map((p) => `
        <button type="button" class="app-chip${cur === p.id ? ' active' : ''}"
          data-action="roles-period" data-role="${role}" data-period="${p.id}">${p.label}</button>`).join('')}
    </div>`;
}

function rolesFin(role) {
  const period = role === 'owner' ? rolesUi.ownerPeriod : rolesUi.investorPeriod;
  const k = (ROLES_PERIODS.find((p) => p.id === period) || ROLES_PERIODS[0]).k;
  const legals = ROLES_GMV_MONTHLY.map((l) => ({ name: l.name, gmv: Math.round(l.gmv * k) }));
  const gmv = legals.reduce((s, l) => s + l.gmv, 0);
  const commission = Math.round(gmv * 0.1);
  const pass = Math.round(ROLES_PASS_MONTHLY * k);
  const payouts = Math.round(gmv * 0.04);
  const opex = Math.round(LOVII_DASH.finance.opexMonth * k);
  const profit = commission + pass - payouts - opex;
  return { k, legals, gmv, commission, pass, payouts, opex, profit };
}

function ownerOverview() {
  const f = rolesFin('owner');
  const inv = LOVII_DASH.investor;
  return `
    <div class="msp-overview cabinet-screen">
      ${rolesPeriodChipRow('owner')}
      <section class="msp-overview__kpi">
        <div class="card role-kpi role-kpi_accent">
          <span class="role-kpi__label">GMV · период</span>
          <span class="role-kpi__value">${rolesMoney(f.gmv)}</span>
          <span class="role-kpi__sub">оборот всех торговых точек</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Комиссия · 10%</span>
          <span class="role-kpi__value">${rolesMoney(f.commission)}</span>
          <span class="role-kpi__sub">платформа</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">LOVII PASS</span>
          <span class="role-kpi__value">${rolesMoney(f.pass)}</span>
          <span class="role-kpi__sub">списания за подписку</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Прибыль · период</span>
          <span class="role-kpi__value">${rolesMoney(f.profit)}</span>
          <span class="role-kpi__sub">после выплат и OPEX</span>
        </div>
      </section>
      <section class="card role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0"><h2>GMV по месяцам</h2><span class="role-section-head__sub">тыс ₽ · справка</span></div>
        ${rolesBars(inv.gmv.slice(-8), inv.monthLabels.slice(-8), 'var(--lv-pink)')}
      </section>
      <section class="card role-card">
        <div class="role-section-head"><h2>Юрлица · выручка за период</h2>
          <button type="button" class="role-link" data-action="roles-tab" data-role="owner" data-tab="structure">Структура</button>
        </div>
        <div class="msp-orders__list">
          ${f.legals.map((l) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${icon('building')}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(l.name)}</div>
                <div class="sb">суммарная выручка торговых точек</div>
              </div>
              <span class="role-tag">${rolesMoney(l.gmv)}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function ownerFinance() {
  const f = rolesFin('owner');
  const inv = LOVII_DASH.investor;
  const series = inv.gmv.map((g, i) => Math.round((g * 1000 * 0.1 + inv.points[i] * LOVII_DASH.finance.subPerPoint) / 1000));
  const row = (l, v, tone) => `
    <div class="msp-od__item"${tone ? ` style="color:${tone}"` : ''}><span>${l}</span><b>${v}</b></div>`;
  return `
    <div class="msp-overview cabinet-screen">
      ${rolesPeriodChipRow('owner')}
      <section class="card role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0"><h2>Финансы периода</h2><span class="role-section-head__sub">${(ROLES_PERIODS.find((p) => p.id === rolesUi.ownerPeriod) || ROLES_PERIODS[0]).label}</span></div>
        <div style="margin-top:10px">
          ${row('Выручка по торговым точкам (GMV)', rolesMoney(f.gmv))}
          ${row('Комиссия платформы · 10%', '+ ' + rolesMoney(f.commission), 'var(--lv-tiffany-text)')}
          ${row('Списания за подписку LOVII PASS', '+ ' + rolesMoney(f.pass), 'var(--lv-tiffany-text)')}
          ${row('Выплаты представителям · 4%', '− ' + rolesMoney(f.payouts), 'var(--lv-pink-dark)')}
          ${row('OPEX · команда и маркетинг', '− ' + rolesMoney(f.opex), 'var(--lv-pink-dark)')}
        </div>
        <div class="msp-od__total"><span>Прибыль за период</span><b>${rolesMoney(f.profit)}</b></div>
      </section>
      <section class="card role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0"><h2>Прибыль платформы по месяцам</h2><span class="role-section-head__sub">тыс ₽ · справка</span></div>
        ${rolesBars(series.slice(-8), inv.monthLabels.slice(-8), 'var(--lv-gold)')}
      </section>
    </div>`;
}

function ownerStructure() {
  const rows = LOVII_DATA.stores.map((s) => ({
    name: s.name, emoji: s.emoji, region: 'Тверской', status: s.slug === 'master' ? 'offline' : 'active',
  }));
  return `
    <div class="msp-overview cabinet-screen">
      <section class="card role-card">
        <div class="role-section-head"><h2>Торговые точки платформы</h2><span class="role-section-head__sub">${rows.length}</span></div>
        <div class="msp-orders__list">
          ${rows.map((r) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${r.emoji}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(r.name)}</div>
                <div class="sb">${mEsc2(r.region)}</div>
              </div>
              <span class="role-tag" style="${r.status === 'offline' ? 'background:var(--lv-surface);color:var(--lv-dim)' : ''}">${r.status === 'offline' ? 'Оффлайн' : 'Активна'}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

/* ---------- Инвестор: рост и доходность ---------- */

function investorGrowth() {
  const inv = LOVII_DASH.investor;
  const f = rolesFin('investor');
  return `
    <div class="msp-overview cabinet-screen">
      ${rolesPeriodChipRow('investor')}
      <section class="msp-overview__kpi">
        <div class="card role-kpi role-kpi_accent">
          <span class="role-kpi__label">GMV · период</span>
          <span class="role-kpi__value">${rolesMoney(f.gmv)}</span>
          <span class="role-kpi__sub">оборот всех торговых точек</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Пользователи</span>
          <span class="role-kpi__value">${inv.users[inv.users.length - 1].toLocaleString('ru-RU')}</span>
          <span class="role-kpi__sub">всего на платформе</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Торговые точки</span>
          <span class="role-kpi__value">${inv.points[inv.points.length - 1]}</span>
          <span class="role-kpi__sub">на витрине платформы</span>
        </div>
        <div class="card role-kpi">
          <span class="role-kpi__label">Средний чек</span>
          <span class="role-kpi__value">${rolesMoney(inv.avgCheck)}</span>
          <span class="role-kpi__sub">конверсия ${inv.conversion}%</span>
        </div>
      </section>
      <section class="card role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0"><h2>Пользователи по месяцам</h2></div>
        ${rolesBars(inv.users.slice(-8), inv.monthLabels.slice(-8), 'var(--lv-pink)')}
      </section>
    </div>`;
}

function investorSales() {
  const inv = LOVII_DASH.investor;
  return `
    <div class="msp-overview cabinet-screen">
      ${rolesPeriodChipRow('investor')}
      <section class="card role-card">
        <div class="role-section-head"><h2>Топ торговых точек · месяц</h2></div>
        <div class="msp-orders__list">
          ${LOVII_DATA.stores.slice(0, 3).map((s) => `
            <div class="msp-order-row">
              <span class="sr-ico t-gold">${s.emoji}</span>
              <div class="ri-mid">
                <div class="nm">${mEsc2(s.name)}</div>
                <div class="sb">выручка месяца</div>
              </div>
              <span class="role-tag">Активна</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function investorMoney() {
  const f = rolesFin('investor');
  const share = 0.15;
  return `
    <div class="msp-overview cabinet-screen">
      ${rolesPeriodChipRow('investor')}
      <section class="card role-card" style="padding:16px">
        <div class="role-section-head" style="padding:0"><h2>Доходность · период</h2><span class="role-section-head__sub">${(ROLES_PERIODS.find((p) => p.id === rolesUi.investorPeriod) || ROLES_PERIODS[0]).label}</span></div>
        <div style="margin-top:10px">
          <div class="msp-od__item"><span>Прибыль платформы</span><b>${rolesMoney(f.profit)}</b></div>
          <div class="msp-od__item"><span>Доля инвестора · 15%</span><b>${rolesMoney(f.profit * share)}</b></div>
          <div class="msp-od__item"><span>CAPEX платформы</span><b>${rolesMoney(LOVII_DASH.finance.capexTotal)}</b></div>
        </div>
        <div class="msp-od__total"><span>Дивиденды к выплате</span><b>${rolesMoney(f.profit * share)}</b></div>
      </section>
    </div>`;
}

function renderOwnerMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = rolesUi.owner === 'finance' ? ownerFinance()
    : rolesUi.owner === 'structure' ? ownerStructure()
    : ownerOverview();
  return rolesShell('owner', inner);
}

function renderInvestorMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = rolesUi.investor === 'sales' ? investorSales()
    : rolesUi.investor === 'money' ? investorMoney()
    : investorGrowth();
  return rolesShell('investor', inner);
}

function renderRepMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = rolesUi.rep === 'points' ? repPoints()
    : rolesUi.rep === 'approvals' ? repApprovals()
    : rolesUi.rep === 'income' ? repIncome()
    : rolesUi.rep === 'profile' ? repProfileTab()
    : repOverview();
  return rolesShell('rep', inner);
}

function renderAmbMirror() {
  document.body.classList.add('cabinet-mode');
  const inner = rolesUi.amb === 'reps' ? ambReps()
    : rolesUi.amb === 'training' ? ambTraining()
    : rolesUi.amb === 'income' ? ambIncome()
    : ambOverview();
  return rolesShell('amb', inner);
}

document.addEventListener('click', (e) => {
  const tabEl = e.target.closest('[data-action="roles-tab"]');
  if (tabEl) {
    rolesUi[tabEl.dataset.role] = tabEl.dataset.tab;
    renderViewPreserveScroll();
    return;
  }
  const act = e.target.closest('[data-action="rep-approve"], [data-action="rep-reject"]');
  if (act) {
    const isApprove = act.dataset.action === 'rep-approve';
    if (isApprove) toast('Торговая точка подтверждена', 'Выдан счёт верификации', 'positive');
    else toast('Заявка отклонена', 'Владелец получит уведомление', 'negative');
    const card = act.closest('.approval-card');
    if (card) card.remove();
    return;
  }
  const per = e.target.closest('[data-action="roles-period"]');
  if (per) {
    rolesUi[per.dataset.role + 'Period'] = per.dataset.period;
    renderViewPreserveScroll();
  }
});

/* витринные экраны снимают режим кабинета (общая проверка с msp.js) */
new MutationObserver(() => {
  if (!document.querySelector('.msp-cabinet, .rep-cabinet, .amb-cabinet')) {
    document.body.classList.remove('cabinet-mode');
  }
}).observe(document.getElementById('view'), { childList: true });

/* renderDash — function-декларация dash.js: rep/amb забираем в зеркала;
   owner/investor — старые дашборды демо, им проставляем демо-роль,
   чтобы прямой заход открывал кабинет, а не экран «Роли» */
const _oldRenderDash = window.renderDash;
window.renderDash = function (param) {
  if (param === 'rep') return renderRepMirror();
  if (param === 'amb') return renderAmbMirror();
  if (param === 'owner') { if (!state.roles.owner) state.roles.owner = { since: 'демо' }; return renderOwnerMirror(); }
  if (param === 'investor') { if (!state.roles.investor) state.roles.investor = { since: 'демо' }; return renderInvestorMirror(); }
  if (typeof _oldRenderDash === 'function') return _oldRenderDash(param);
  return renderProfileMirror();
};
