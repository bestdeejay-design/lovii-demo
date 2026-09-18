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

const rolesUi = { rep: 'overview', amb: 'overview' };

/* ---------- Общий каркас (как у МСП, акцент роли) ---------- */

function rolesShell(role, inner) {
  const cfg = role === 'rep'
    ? { title: 'Представитель', note: 'Развитие сети представителей · промокод AA2222', icon: 'sparkles', cls: 'rep-cabinet' }
    : { title: 'Амбассадор', note: 'Развитие района · обучение представителей', icon: 'sparkles', cls: 'amb-cabinet' };
  document.body.classList.add('cabinet-mode');

  const tabs = role === 'rep'
    ? [['overview', 'Обзор', 'bar-chart'], ['points', 'Точки', 'store'], ['approvals', 'Заявки', 'check-circle'], ['income', 'Доход', 'wallet'], ['profile', 'Профиль', 'user']]
    : [['overview', 'Обзор', 'bar-chart'], ['reps', 'Структура', 'users'], ['training', 'Обучение', 'star'], ['income', 'Доход', 'wallet']];
  const cur = role === 'rep' ? rolesUi.rep : rolesUi.amb;

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

const REP_SEED = {
  promo: 'AA2222',
  applications: 3,
  activePoints: 2,
  queue: [
    { name: 'Пекарня «Пышки»', status: 'На модерации' },
    { name: 'Салон «Красота»', status: 'На модерации' },
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
    { name: 'Ведение точки после запуска', done: false, lessons: '5 уроков' },
  ],
  repsList: [
    { name: 'Представитель · Тверская', note: '2 активные точки' },
    { name: 'Представитель · Патриаршие', note: '1 активная точка' },
  ],
};

/* ---------- Представитель ---------- */

function repKpi() {
  return `
    <section class="msp-overview__kpi">
      <div class="role-kpi role-kpi_accent">
        <span class="role-kpi__label">Заявки</span>
        <span class="role-kpi__value">${REP_SEED.applications}</span>
        <span class="role-kpi__sub">по вашему промокоду</span>
      </div>
      <div class="role-kpi">
        <span class="role-kpi__label">Активные точки</span>
        <span class="role-kpi__value">${REP_SEED.activePoints}</span>
        <span class="role-kpi__sub">подтверждены платформой</span>
      </div>
      <div class="role-kpi">
        <span class="role-kpi__label">Доход · месяц</span>
        <span class="role-kpi__value">0&nbsp;₽</span>
        <span class="role-kpi__sub">финконтур ещё не подключён</span>
      </div>
      <div class="role-kpi">
        <span class="role-kpi__label">Уровень</span>
        <span class="role-kpi__value">—</span>
        <span class="role-kpi__sub">откроется с первыми точками</span>
      </div>
    </section>`;
}

function repOverview() {
  return `
    <div class="rep-overview cabinet-screen">
      ${repKpi()}
      <a href="#/dash/rep" class="role-next" data-testid="rep-overview-next" onclick="return false">
        <span class="role-next__icon">${icon(REP_SEED.queue.length > 0 ? 'check-circle' : 'sparkles')}</span>
        <span class="role-next__body">
          <span class="role-next__title">${REP_SEED.queue.length > 0 ? `${REP_SEED.queue.length} заявки ждут решения` : 'Очередь пуста — новых заявок нет'}</span>
          <span class="role-next__desc">${REP_SEED.queue.length > 0 ? 'Подтвердите заявку — точка получит верификационный счёт' : 'Заявка появится здесь, как только владелец точки введёт ваш промокод'}</span>
        </span>
        <span class="role-next__arrow">${icon('chev-right')}</span>
      </a>
      <section class="role-card">
        <div class="role-section-head"><h2>Очередь на модерации</h2><span class="role-section-head__sub">${REP_SEED.queue.length}</span></div>
        <div class="msp-orders__list">
          ${REP_SEED.queue.map((q) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${icon('store')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(q.name)}</div>
                <div class="msp-order-row__meta">${mEsc2(q.status)}</div>
              </div>
              <span class="role-tag">${mEsc2(q.status)}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function repPoints() {
  return `
    <div class="rep-points cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Мои точки</h2><span class="role-section-head__sub">${REP_SEED.points.length}</span></div>
        <div class="msp-orders__list">
          ${REP_SEED.points.map((p) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${icon('store')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(p.name)}</div>
                <div class="msp-order-row__meta">${mEsc2(p.address)}</div>
              </div>
              <span class="role-tag">${mEsc2(p.status)}</span>
            </div>`).join('')}
        </div>
      </section>
    </div>`;
}

function repApprovals() {
  return `
    <div class="rep-approvals cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Заявки по промокоду ${REP_SEED.promo}</h2><span class="role-section-head__sub">${REP_SEED.applications}</span></div>
        <div class="msp-orders__list">
          ${REP_SEED.queue.concat(REP_SEED.points.map((p) => ({ name: p.name, status: 'Одобрена' }))).map((q) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${icon('store')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(q.name)}</div>
                <div class="msp-order-row__meta">${mEsc2(q.status)}</div>
              </div>
              <span class="role-tag">${mEsc2(q.status)}</span>
            </div>`).join('')}
        </div>
        <p class="tier__cta-note" style="padding:0 16px 14px">Подтверждение заявки — верификационный счёт точке (FINANCIAL_CONTOUR §2)</p>
      </section>
    </div>`;
}

function repIncome() {
  return `
    <div class="rep-income cabinet-screen">
      <section class="role-card">
        <div class="role-section-head"><h2>Доход · месяц</h2></div>
        <div class="role-kpi role-kpi_accent" style="margin:12px 16px 16px">
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
      <section class="role-card">
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
        <div class="role-kpi role-kpi_accent">
          <span class="role-kpi__label">Представители</span>
          <span class="role-kpi__value">${AMB_SEED.reps}</span>
          <span class="role-kpi__sub">в вашей структуре</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Заявки сети</span>
          <span class="role-kpi__value">${AMB_SEED.applications}</span>
          <span class="role-kpi__sub">суммарно по сети</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Доход · месяц</span>
          <span class="role-kpi__value">0&nbsp;₽</span>
          <span class="role-kpi__sub">финконтур ещё не подключён</span>
        </div>
        <div class="role-kpi">
          <span class="role-kpi__label">Доход</span>
          <span class="role-kpi__value">20%</span>
          <span class="role-kpi__sub">от комиссии сети по BRD</span>
        </div>
      </section>
      <section class="role-card">
        <div class="role-section-head"><h2>Обучение</h2><button type="button" class="role-link" data-action="roles-tab" data-role="amb" data-tab="training">Открыть</button></div>
        <div class="msp-orders__list">
          ${AMB_SEED.training.map((t) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${t.done ? icon('check-circle') : icon('star')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(t.name)}</div>
                <div class="msp-order-row__meta">${t.lessons}</div>
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
      <section class="role-card">
        <div class="role-section-head"><h2>Структура</h2><span class="role-section-head__sub">${AMB_SEED.repsList.length}</span></div>
        <div class="msp-orders__list">
          ${AMB_SEED.repsList.map((r) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${icon('user')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(r.name)}</div>
                <div class="msp-order-row__meta">${mEsc2(r.note)}</div>
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
      <section class="role-card">
        <div class="role-section-head"><h2>Программа обучения</h2><span class="role-section-head__sub">${AMB_SEED.training.length}</span></div>
        <div class="msp-orders__list">
          ${AMB_SEED.training.map((t) => `
            <div class="msp-order-row">
              <span class="msp-order-row__ico">${icon('star')}</span>
              <div class="msp-order-row__mid">
                <div class="msp-order-row__name">${mEsc2(t.name)}</div>
                <div class="msp-order-row__meta">${t.lessons}</div>
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
      <section class="role-card">
        <div class="role-section-head"><h2>Доход · месяц</h2></div>
        <div class="role-kpi role-kpi_accent" style="margin:12px 16px 16px">
          <span class="role-kpi__label">Начислено</span>
          <span class="role-kpi__value">0&nbsp;₽</span>
          <span class="role-kpi__sub">финконтур ещё не подключён</span>
        </div>
      </section>
    </div>`;
}

/* ---------- Рендер и события ---------- */

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
  const el = e.target.closest('[data-action="roles-tab"]');
  if (!el) return;
  if (el.dataset.role === 'rep') rolesUi.rep = el.dataset.tab;
  else rolesUi.amb = el.dataset.tab;
  renderViewPreserveScroll();
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
  if (param === 'owner' || param === 'investor') {
    if (!state.roles[param]) state.roles[param] = { since: 'демо' };
    state.activeRole = param; // старый рендер идёт по activeRole
    persist();
    return _oldRenderDash(param);
  }
  if (typeof _oldRenderDash === 'function') return _oldRenderDash(param);
  return renderProfileMirror();
};
