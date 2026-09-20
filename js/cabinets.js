/**
 * LOVII Кабинеты ролей — редизайн 2026-09-14 (rep / amb / msp).
 * Переопределяет рендереры dash.js (позднее связывание: cabinets.js грузится после).
 * dash.js остаётся источником helpers: kpiCard, chartCard, repTotals, ambTotals,
 * repRankInfo, rankCardHtml, payoutRowsHtml, revenueModelNote, mspStepsHtml,
 * qrGridHtml, chatListHtml, renderAmbTree и т.д.
 *
 * Канон ( lovii-design 1.16 ):
 *  - один акцент — pink; роль-цвет только в role-pill и мягких тинтах;
 *  - статусы — канон-пары: st-new (pink) / st-wait (gold) / st-active (tiffany) / st-off (grey);
 *  - модальные центрируемые диалоги запрещены — только bottom-sheet;
 *  - деньги — tabular-nums (.tnum).
 */

/* ================= Каркас: шапка кабинета с роль-пилюлей ================= */

const ROLE_PILL_TONE = { tiffany: 't-tiffany', gold: 't-gold', pink: 't-pink', sand: 't-gold' };

function dashHeadHtml(role, sub) {
  const m = roleMeta(role);
  const tone = ROLE_PILL_TONE[m.color] || 't-pink';
  return `
  <div class="dash-head">
    <span class="dash-ava ${tileBg(m.color)}">${m.emoji}</span>
    <div class="dash-title">
      <div class="rp-row"><h1>${esc(m.title)}</h1><span class="role-pill ${tone}"><span class="lv-dot" style="background:currentColor"></span>кабинет</span></div>
      <div class="d">${esc(sub || m.desc)}</div>
    </div>
    <button class="ghost-btn sm" data-action="exit-role">${icon('logout')}Клиент</button>
  </div>`;
}

/* ================= Статусы — канон-пары ================= */

function statusChip(status) {
  const map = {
    active: ['Активна', 'st-active'],
    ready: ['Продажи включены', 'st-active'],
    completed: ['Выполнен', 'st-active'],
    moderation: ['На модерации', 'st-wait'],
    waiting: ['Подключается', 'st-wait'],
    catalog: ['В каталоге', 'st-wait'],
    payment: ['Проверка платежа', 'st-wait'],
    accepted: ['Принят', 'st-wait'],
    preparing: ['Готовится', 'st-wait'],
    handed_to_delivery: ['Передан курьеру', 'st-wait'],
    on_the_way: ['Курьер в пути', 'st-wait'],
    lead: ['Лид', 'st-new'],
    pending_rep: ['Новая заявка', 'st-new'],
    new: ['Новый', 'st-new'],
    rejected: ['Отклонено', 'st-off'],
    cancelled: ['Отменён', 'st-off'],
    offline: ['Offline', 'st-off'],
  };
  const [label, cls] = map[status] || map.active;
  return `<span class="st-chip ${cls}">${status === 'active' ? '<span class="lv-dot" style="background:var(--lv-tiffany)"></span>' : ''}${label}</span>`;
}

/* ================= Action-sheet: общий нижний лист ================= */

function openActionSheet(title, sub, body) {
  document.getElementById('action-title').textContent = title;
  document.getElementById('action-sub').textContent = sub || '';
  document.getElementById('action-body').innerHTML = body;
  document.getElementById('action-overlay').classList.add('open');
  document.getElementById('action-sheet').classList.add('open');
}

function closeActionSheet() {
  const ov = document.getElementById('action-overlay');
  const sh = document.getElementById('action-sheet');
  if (!ov || !sh) return;
  ov.classList.remove('open');
  sh.classList.remove('open');
}

function sheetActionsHtml(buttons) {
  return `<div class="sheet-actions">${buttons
    .map(([action, label, cls, data]) => {
      const d = data
        ? Object.entries(data)
            .map(([k, v]) => `data-${k}="${esc(v)}"`)
            .join(' ')
        : '';
      return `<button class="cta-btn ${cls || 'brand-gradient'}" data-action="${action}" ${d}>${esc(label)}</button>`;
    })
    .join('')}</div>`;
}

/* ================= Представитель: промокод и подписка ================= */

function repInviteCode() {
  return LOVII_CAB.repPromo; // канон BRD §3.1: PP + 4 символа, перепривязок нет
}

function repPromoLink() {
  return location.origin + location.pathname + '#/msp-signup/' + repInviteCode();
}

/** Промокод-карточка: канон-паттерн кода + копирование ссылки регистрации */
function promoStripHtml() {
  return `
  <div class="code-card tone-tiffany">
    <div class="kicker">Промокод для точек</div>
    <div class="code">${esc(repInviteCode())}</div>
    <p>Владелец точки открывает ссылку с промокодом и вводит ИНН — заявка придёт тебе в очередь на «Подключение». Перепривязка точки к другому представителю невозможна.</p>
    <div class="qr-link-row" style="margin:12px 0 0">
      <code>${esc(repPromoLink())}</code>
      <button class="ghost-btn sm" data-action="copy-link" data-link="${esc(repPromoLink())}">${icon('copy')}Ссылка</button>
    </div>
  </div>`;
}

/** Карточка подписки — гейт доли (SZ-042): доля 40% действует, пока активна подписка */
function subCardHtml() {
  const s = LOVII_CAB.repSub;
  return `
  <div class="sub-card">
    <span class="sc-ico">${icon('shield')}</span>
    <div class="sc-mid">
      <div class="sc-t">Подписка представителя · ${esc(s.plan)} ${esc(s.price)}</div>
      <div class="sc-d">Активна до ${esc(s.until)} · доля 40% с подключённых точек действует, пока подписка активна</div>
    </div>
    <button class="ghost-btn sm" data-action="sub-renew">Продлить</button>
  </div>`;
}

function subGateNote() {
  return dashNote('Гейт подписки: если подписка истечёт, доля 40% уходит Компании — деньги за точки продолжат идти, но по нулевой ставке до продления.', 'gold');
}

/** Канон модели (BRD §7.2, FIN_BALANCE_REFERRAL_BRIEF A-2): пул 10% − эквайринг, сплит 40/40/20 */
function revenueModelNote(role) {
  const note = role === 'rep'
    ? 'Модель: пул платформы — 10% от чека минус эквайринг. Сплит пула: компания 40% · ты 40% · амбассадор 20%. Доля считается только с лично подключённых точек; тарифы МСП — «Старт» 0% до 30 000 ₽, «Базовый» 10%, «Про» от 4%.'
    : 'Модель: пул платформы — 10% от чека минус эквайринг. Доля амбассадора — 20% пула branch-wide со всей ветки, за обучение и мотивацию представителей.';
  return dashNote(note, 'gold');
}

/* ================= KPI-карточка-кнопка (связка обзор ↔ вкладка) ================= */

function kpiTap(label, value, { tone = 'pink', action = 'dash-tab', val = 'index', delta, spark } = {}) {
  return `
  <button class="card kpi as-btn" data-action="${action}" data-val="${val}">
    <div class="l">${esc(label)}</div>
    <div class="v">${value}</div>
    <div class="d">${delta != null ? deltaHtml(delta) : ''}${spark || ''}</div>
  </button>`;
}

/* ================= Action-sheet: апрув и возврат заявки (P0 RES-004) ================= */

function openApproveSheet() {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'pending_rep') return;
  const p = lead.point;
  openActionSheet(
    'Открыть витрину точке?',
    `${p.name} · действие необратимо`,
    `
    <div class="review-grid">
      <div><span>Юрлицо</span><b>${esc(lead.legalName || '—')}</b></div>
      <div><span>ИНН</span><b class="tnum">${esc(lead.inn)}</b></div>
      <div><span>Адрес</span><b>${esc(p.address)}</b></div>
    </div>
    <p class="sheet-note">После апрува карточка точки станет видна жителям района (витрина teaser). Дальше владелец оплатит счёт верификации с р/с компании.</p>
    ${sheetActionsHtml([
      ['do-approve', 'Апрувить', 'brand-gradient'],
      ['sheet-close', 'Отмена', 'plain'],
    ])}`
  );
}

function openRejectSheet() {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'pending_rep') return;
  openActionSheet(
    'Вернуть на правку',
    `${lead.point.name} · укажи причину — она уйдёт владельцу точки`,
    `
    <form id="reject-form">
      <label class="f-field reason-field"><span class="lb">Причина возврата</span>
        <textarea name="reason" required placeholder="Например: фото витрины не читается, адрес не совпадает с карточкой юрлица"></textarea>
      </label>
      ${sheetActionsHtml([['sheet-close', 'Отмена', 'plain']])}
      <div style="padding-top:10px"><button class="cta-btn brand-gradient big" type="submit">Вернуть на правку</button></div>
    </form>`
  );
}

/** Возврат заявки — теперь с причиной (dash.js-версия перегружается) */
function returnMspPoint(reason) {
  const lead = ensureMspLead();
  if (!lead || !lead.point || lead.point.status !== 'pending_rep') return;
  lead.point.status = 'draft';
  lead.point.returnReason = (reason || '').trim() || null;
  persist();
  toast('Заявка возвращена', lead.point.returnReason ? `Причина: ${lead.point.returnReason}` : 'Владелец может поправить карточку точки', 'negative');
  renderViewPreserveScroll();
}

/* ================= МСП: контекст юрлица/филиала ================= */

const ORDER_FLOW = {
  pickup: {
    label: 'Самовывоз',
    steps: [['new', 'Новый'], ['accepted', 'Принят'], ['preparing', 'Готовится'], ['ready', 'Готов к выдаче'], ['completed', 'Выдан клиенту']],
    next: { new: ['accepted', 'Принять'], accepted: ['preparing', 'Начать готовить'], preparing: ['ready', 'Готов к выдаче'], ready: ['completed', 'Выдан клиенту'] },
    cancelUntil: ['new', 'accepted'],
  },
  delivery: {
    label: 'Доставка',
    steps: [['new', 'Новый'], ['accepted', 'Принят'], ['preparing', 'Готовится'], ['ready', 'Готов'], ['handed_to_delivery', 'Передан курьеру'], ['on_the_way', 'Курьер в пути'], ['completed', 'Доставлен']],
    next: { new: ['accepted', 'Принять'], accepted: ['preparing', 'Начать готовить'], preparing: ['ready', 'Готов'], ready: ['handed_to_delivery', 'Передать курьеру'] },
    cancelUntil: ['new', 'accepted'],
  },
};

let _ordTab = 'new'; // 'new' | 'work' | 'done' | 'all'

/** МСП-контекст из QR-сценария (точка после верификации) или демо-юрлица */
function mspLeadMode() {
  const lead = ensureMspLead();
  return !!(lead && lead.point && lead.point.status === 'ready');
}

function mspLegals() {
  if (mspLeadMode()) {
    const lead = ensureMspLead();
    return [{ id: 'lead', name: lead.legalName || 'Моя компания', inn: lead.inn, branches: [{ id: 'lead', name: lead.point.name, address: lead.point.address, emoji: lead.point.emoji || '🏪' }] }];
  }
  return LOVII_CAB.legals;
}

function ensureMspCtx() {
  const legals = mspLegals();
  const cur = state.mspCtx;
  const legal = legals.find((l) => l.id === (cur || {}).legalId);
  if (legal && legal.branches.some((b) => b.id === cur.branchId)) return state.mspCtx;
  state.mspCtx = { legalId: legals[0].id, branchId: legals[0].branches[0].id };
  persist();
  return state.mspCtx;
}

function ctxLegal() {
  const legals = mspLegals();
  return legals.find((l) => l.id === (state.mspCtx || {}).legalId) || legals[0];
}

function ctxBranch() {
  const l = ctxLegal();
  return l.branches.find((b) => b.id === (state.mspCtx || {}).branchId) || l.branches[0];
}

function ctxBranchKey() {
  return mspLeadMode() ? 'lead' : ctxBranch().id;
}

function ordersForCtx() {
  return LOVII_CAB.orders.filter((o) => o.branch === ctxBranchKey());
}

function productsForCtx() {
  return LOVII_CAB.products.filter((p) => p.branch === 'all' || p.branch === ctxBranchKey());
}

function orderPill(o) {
  if (o.status === 'completed') {
    return o.delivery === 'delivery'
      ? '<span class="st-chip st-active">Доставлен</span>'
      : '<span class="st-chip st-active">Выдан клиенту</span>';
  }
  return statusChip(o.status);
}

/* ================= МСП: заказы — листы и переходы ================= */

function openOrderSheet(id) {
  const o = ordersForCtx().find((x) => x.id === id) || LOVII_CAB.orders.find((x) => x.id === id);
  if (!o) return;
  const flow = ORDER_FLOW[o.delivery];
  const stepIdx = flow.steps.findIndex(([s]) => s === o.status);
  const timeline = `<div class="timeline-card">${flow.steps
    .map(([s, label], i) => {
      const cls = i < stepIdx ? 'done' : i === stepIdx ? 'active' : '';
      return `<div class="tl-item ${cls}"><b>${esc(label)}</b><span>${i === stepIdx ? esc(o.ts) : ''}</span></div>`;
    })
    .join('')}</div>`;
  const items = `<div class="ord-items">${o.items
    .map((it) => `<div class="ord-item"><span>${it.emoji}</span><span>${esc(it.name)}</span><span class="q">× ${it.qty}</span><span class="s tnum">${priceFmt(it.price * it.qty)}</span></div>`)
    .join('')}</div>`;
  const comment = o.comment ? dashNote(`Комментарий клиента: ${o.comment}`, 'gold') : '';
  const reason = o.cancelReason ? dashNote(`Причина отмены: ${o.cancelReason}`, 'dim') : '';
  const next = flow.next[o.status];
  const canCancel = flow.cancelUntil.includes(o.status);
  const buttons = [];
  if (next) buttons.push(['order-status', next[1], 'brand-gradient', { id: o.id, to: next[0] }]);
  if (canCancel) buttons.push(['order-cancel', 'Отменить заказ', 'plain', { id: o.id }]);
  buttons.push(['sheet-close', 'Закрыть', 'plain']);
  const courierNote = o.delivery === 'delivery' && ['handed_to_delivery', 'on_the_way'].includes(o.status)
    ? dashNote('Дальше ведёт курьер: «Курьер в пути» и «Доставлен» появятся автоматически.', 'tiffany')
    : '';
  openActionSheet(`Заказ ${o.id}`, `${flow.label} · ${esc(o.customer)} · ${esc(o.ts)}`, items + comment + reason + timeline + courierNote + sheetActionsHtml(buttons));
}

function orderTransition(id, to) {
  const o = ordersForCtx().find((x) => x.id === id);
  if (!o) return;
  const flow = ORDER_FLOW[o.delivery];
  const next = flow.next[o.status];
  if (!next || next[0] !== to) {
    toast('Такой статус сейчас недоступен', 'Актуальное действие подсвечено в карточке заказа', 'negative'); // канон честных ошибок (hotfix 421fd0e)
    return;
  }
  o.status = to;
  if (to === 'completed') o.doneTs = 'только что';
  toast(`Заказ ${o.id}: ${flow.steps.find(([s]) => s === to)[1]}`, flow.label);
  renderViewPreserveScroll();
  openOrderSheet(id);
}

function openCancelSheet(id) {
  const o = ordersForCtx().find((x) => x.id === id);
  if (!o) return;
  openActionSheet(
    `Отменить заказ ${o.id}?`,
    'Причина обязательна — клиент получит уведомление',
    `
    <form id="cancel-form" data-id="${esc(id)}">
      <label class="f-field reason-field"><span class="lb">Причина отмены</span>
        <textarea name="reason" required placeholder="Например: товар закончился, точка закрывается раньше"></textarea>
      </label>
      ${sheetActionsHtml([['sheet-close', 'Не отменять', 'plain']])}
      <div style="padding-top:10px"><button class="cta-btn brand-gradient big" type="submit">Отменить заказ</button></div>
    </form>`
  );
}

function cancelOrder(id, reason) {
  const o = ordersForCtx().find((x) => x.id === id);
  if (!o) return;
  o.status = 'cancelled';
  o.cancelReason = (reason || '').trim() || 'Причина не указана';
  closeActionSheet();
  renderViewPreserveScroll();
  toast(`Заказ ${o.id} отменён`, o.cancelReason, 'negative');
}

/* ================= МСП: свитчер юрлица/филиала ================= */

function openCtxSheet() {
  const legals = mspLegals();
  const ctx = ensureMspCtx();
  const rows = legals
    .map((l) => {
      const branches = l.branches
        .map((b) => {
          const active = l.id === ctx.legalId && b.id === ctx.branchId;
          return `
        <button class="district-row ${active ? 'active' : ''}" data-action="ctx-pick" data-legal="${esc(l.id)}" data-branch="${esc(b.id)}">
          <span class="l">
            <span class="ic">${b.emoji || '🏪'}</span>
            <span><span class="nm">${esc(b.name)}</span><span class="mt">${esc(b.address || '')}</span></span>
          </span>
          ${active ? '<span class="lv-dot" style="background:var(--lv-pink)"></span>' : ''}
        </button>`;
        })
        .join('');
      return `<div class="grp-label">${esc(l.name)} · ИНН <span class="tnum">${esc(l.inn)}</span></div>${branches}`;
    })
    .join('');
  openActionSheet('Юрлицо и филиал', 'Обзор, заказы и товары показываются по выбранному филиалу', rows);
}

function pickCtx(legalId, branchId) {
  state.mspCtx = { legalId, branchId };
  persist();
  closeActionSheet();
  renderViewPreserveScroll();
  const l = ctxLegal();
  toast(`Филиал: ${ctxBranch().name}`, l.name);
}

/* ================= ПРЕДСТАВИТЕЛЬ ================= */

function renderRepDash(tab) {
  const profile = state.roles.rep || {};
  const city = profile.city || state.district;
  const head = dashHeadHtml('rep', `${esc(city)} · подключение и поддержка точек`);
  const tabs = dashTabsHtml('rep', tab);
  if (tab === 'chats') return chatListHtml('rep', head, tabs, 'Чаты с точками');
  if (tab === 'connect') return renderRepConnectDash(head, tabs);

  const totals = repTotals();
  const rank = repRankInfo(totals.activePts.length, 1, totals.monthRevenue);
  // В очереди = только точки в процессе подключения (waiting). Offline — не заявка.
  const pending = totals.pts.filter((x) => x.status === 'waiting').length;
  const top = [...totals.activePts]
    .sort((a, b) => b.revenueWeek - a.revenueWeek)
    .map((x) => ({ label: x.name, emoji: x.emoji, value: x.revenueWeek }));
  const toMayor = Math.max(0, 30 - totals.activePts.length);

  if (tab === 'points') {
    const pipeline = totals.pts.filter((x) => x.status !== 'active');
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Мои точки<span class="sub"> · ${totals.pts.length}</span></h2><button class="link-btn" data-go="search">${icon('search')}Найти</button></div>
    <div id="rep-points-chips" class="chips-row">${_repPtsChipsHtml(totals.pts)}</div>
    <div style="padding:8px 16px 4px">
      <div class="search-bar">${icon('search')}<input id="rep-points-search" type="text" placeholder="Поиск по названию или категории…" value="${esc(_repPtsSearch)}" oninput="_repPtsSearch=this.value;_repPtsRefresh()"></div>
    </div>
    <div id="rep-points-sort" style="display:flex;gap:8px;padding:8px 16px 2px;overflow-x:auto">${_repPtsSortHtml()}</div>
    <div id="rep-points-list" style="margin-top:8px">${_repPtsListHtml(totals.pts)}</div>
    <div class="section-head" style="margin-top:20px"><h2>Воронка подключения</h2></div>
    <div class="timeline-card">
      <div class="tl-item done"><b>Лид найден</b><span>7 точек в районе подходят по категории</span></div>
      <div class="tl-item done"><b>Презентация</b><span>2 владельца посмотрели условия</span></div>
      <div class="tl-item active"><b>Документы</b><span>${pipeline.length || 1} точка в подключении</span></div>
      <div class="tl-item"><b>Запуск витрины</b><span>товары, фото, касса и первая акция</span></div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Промокод для новых точек</h2></div>
    ${promoStripHtml()}`;
  }

  if (tab === 'income') {
    const incomeByPoint = totals.activePts.map((x) => ({ label: x.name, emoji: x.emoji, value: x.roleIncome }));
    const avgIncome = Math.round(totals.roleIncome / Math.max(1, totals.activePts.length));
    const catEmojiMap = {};
    CATS.forEach((c) => { catEmojiMap[c.label] = c.emoji; });
    const catMap = {};
    totals.activePts.forEach((p) => { const c = p.category || 'Другое'; catMap[c] = (catMap[c] || 0) + p.roleIncome; });
    const incomeByCategory = Object.entries(catMap)
      .map(([label, value]) => ({ label, emoji: catEmojiMap[label] || '📊', value }))
      .sort((a, b) => b.value - a.value);
    return `
    ${head}${tabs}
    <div class="card kpi-grid">
      ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: 12, accent: true })}
      ${kpiCard('Средний доход/точка', moneyFmt(avgIncome), { spark: sparkSvg(seededSeries('rep-avg-inc', 7, 40000, 80000), 'tiffany') })}
      ${kpiTap('Активные точки', String(totals.activePts.length), { val: 'points', spark: sparkSvg(seededSeries('rep-kpi', 7, 2, 4), 'tiffany') })}
      ${kpiCard('Ближайшая выплата', moneyFmt(totals.roleIncome * 0.46), {})}
    </div>
    ${revenueModelNote('rep')}
    ${subGateNote()}
    ${chartCard('Доход представителя', '6 месяцев, ₽', areaChart({ data: seededSeries('rep-income-6m', 6, 58000, 182000), labels: ['май','июн','июл','авг','сен','окт'], tone: 'tiffany', height: 155 }))}
    <div class="section-head" style="margin-top:20px"><h2>Доход по категориям</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByCategory, { emojiKey: true })}</div>
    <div class="section-head" style="margin-top:20px"><h2>Доход по точкам</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByPoint, { emojiKey: true })}</div>
    <div class="section-head" style="margin-top:20px"><h2>История выплат</h2></div>
    ${payoutRowsHtml('rep-payouts', totals.roleIncome, 'выплата на карту')}`;
  }

  if (tab === 'profile') {
    return `
    ${head}${tabs}
    ${rankCardHtml(rank, 'tiffany')}
    ${promoStripHtml()}
    <div class="list-card" style="margin-top:14px">
      <div class="fin-row"><span class="l">Имя</span><span class="v">${esc(profile.name || LOVII_DASH.user.name)}</span></div>
      <div class="fin-row"><span class="l">Локация</span><span class="v">${esc(city)}</span></div>
      <div class="fin-row"><span class="l">Активные точки</span><span class="v tnum">${totals.activePts.length}</span></div>
      <div class="fin-row"><span class="l">План до «Мэра»</span><span class="v tnum">${Math.max(0, 30 - totals.activePts.length)} точек</span></div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Привилегии статуса</h2></div>
    <div class="chips-row no-scrollbar">
      <span class="tab-btn active">обучение</span><span class="tab-btn active">чат с точками</span><span class="tab-btn active">приоритетные лиды</span><span class="tab-btn active">бейдж в сети</span>
    </div>`;
  }

  // --- Обзор ---
  return `
  ${head}${tabs}
  ${rankCardHtml(rank, 'tiffany')}
  ${subCardHtml()}
  <div class="card kpi-grid">
    ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: 12, accent: true })}
    ${kpiTap('Активные точки', `${totals.activePts.length} / ${totals.pts.length}`, { val: 'points', spark: sparkSvg(seededSeries('rep-kpi', 7, 3, 5), 'tiffany') })}
    ${kpiTap('GMV сети · месяц', moneyFmt(totals.monthRevenue), { val: 'income', delta: 9 })}
    ${
      pending > 0
        ? kpiTap('Заявки в очереди', String(pending), { tone: 'gold', val: 'connect' })
        : kpiCard('Средний доход/точка', moneyFmt(Math.round(totals.roleIncome / Math.max(1, totals.activePts.length))), {})
    }
  </div>
  <div class="next-step-card" data-action="dash-tab" data-val="connect" role="button" tabindex="0">
    <span class="ns-icon">${pending > 0 ? '🔔' : '🚀'}</span>
    <div class="ns-body">
      <div class="ns-title">${pending > 0 ? `${pending} ${pending === 1 ? 'заявка' : 'заявки'} в очереди — апрувь сейчас` : `Покажи QR ещё ${toMayor} ${toMayor === 1 ? 'точке' : 'точкам'} до статуса «Мэр»`}</div>
      <div class="ns-desc">${pending > 0 ? 'Подтверждение заявок ускорит рост сети' : 'Каждая подключённая точка приближает к новому статусу'}</div>
    </div>
    <span class="ns-arrow">${icon('chev-right')}</span>
  </div>
  ${chartCard('Выручка точек по дням', 'неделя, ₽', barsChart({ data: seededSeries('rep-week', 7, 18000, 96000), labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], tone: 'tiffany', height: 130 }))}
  <div class="section-head" style="margin-top:20px"><h2>Топ точек по GMV</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top, { emojiKey: true })}</div>
  <div class="quick-actions-grid">
    <button class="quick-action-card" data-action="dash-tab" data-val="connect">
      <span class="qa-icon">${icon('qr')}</span>
      <span class="qa-title">QR-подключение</span>
      <span class="qa-desc">Подключить новую точку</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="points">
      <span class="qa-icon">${icon('store')}</span>
      <span class="qa-title">Точки</span>
      <span class="qa-desc">Управлять ${totals.pts.length} ${totals.pts.length === 1 ? 'точкой' : 'точками'}</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="income">
      <span class="qa-icon">${icon('wallet')}</span>
      <span class="qa-title">Доход</span>
      <span class="qa-desc">${moneyFmt(totals.roleIncome)} в этом месяце</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="chats">
      <span class="qa-icon">${icon('message')}</span>
      <span class="qa-title">Чаты${unreadTotal('rep') ? ` <span class="qa-badge">${unreadTotal('rep')}</span>` : ''}</span>
      <span class="qa-desc">${unreadTotal('rep') ? `${unreadTotal('rep')} непрочитанных` : 'Все прочитаны'}</span>
    </button>
  </div>`;
}

function renderRepConnectDash(head, tabs) {
  const code = repInviteCode();
  const lead = ensureMspLead();
  const status = lead && lead.point ? lead.point.status : 'draft';
  return `
  ${head}${tabs}
  <div class="connect-hero ink-gradient">
    <div class="connect-copy">
      <div class="kicker">QR-подключение МСП</div>
      <h2>Один понятный маршрут для владельца точки</h2>
      <p>Покажи QR. Владелец вводит только ИНН, дальше — карточка точки, апрув, счёт верификации и каталог.</p>
      <div class="chips"><span class="glass-chip">0 ₽ старт</span><span class="glass-chip">запуск 3 дня</span><span class="glass-chip">90/10 сплит</span></div>
    </div>
    <button class="qr-card" data-go="msp-signup:${code}" aria-label="Открыть регистрацию МСП">
      ${qrGridHtml()}
      <span class="tnum">${esc(code)}</span>
    </button>
  </div>
  <div class="qr-link-row">
    <code>${esc(repPromoLink())}</code>
    <button class="ghost-btn sm" data-action="copy-link" data-link="${esc(repPromoLink())}">${icon('copy')}Ссылка</button>
  </div>
  ${lead ? mspStepsHtml(status) : ''}
  <div class="btn-row">
    <button class="cta-btn brand-gradient" data-go="msp-signup:${code}">Смоделировать скан QR</button>
    <button class="ghost-btn" data-action="reset-msp-demo">Сбросить сценарий</button>
  </div>
  ${trustCuesHtml()}
  ${renderConnectScriptHtml()}
  <div class="section-head" style="margin-top:20px"><h2>Очередь заявок</h2></div>
  ${repMspApplicationHtml()}
  <div class="dash-note tone-tiffany">Порядок демо: QR → ИНН → карточка точки → твой апрув → счёт верификации с р/с → каталог товаров.</div>`;
}

function repMspApplicationHtml() {
  const lead = ensureMspLead();
  if (!lead) {
    return `<div class="empty-state-card">
      <div class="big-emoji">📭</div>
      <h3>Очередь заявок пуста</h3>
      <p>Покажи QR владельцу точки. После ввода ИНН и карточки заявка появится здесь — с подтверждением перед апрувом.</p>
      <button class="cta-btn brand-gradient" data-go="msp-signup:${repInviteCode()}">Смоделировать скан QR</button>
    </div>`;
  }
  const p = lead.point;
  const hasPoint = !!p;
  return `
  <div class="approval-card">
    <div class="approval-head">
      <span class="ri-emoji ${tileBg(hasPoint && p.status !== 'pending_rep' ? 'tiffany' : 'gold')}">${hasPoint ? p.emoji : '🧾'}</span>
      <div class="ri-mid">
        <div class="nm">${hasPoint ? esc(p.name) : 'МСП зарегистрировалось'}${statusChip(hasPoint ? p.status : 'lead')}</div>
        <div class="sb">ИНН <span class="tnum">${esc(lead.inn)}</span> · промокод ${esc(lead.repCode)}</div>
      </div>
    </div>
    <div class="review-grid">
      <div><span>Юрлицо</span><b>${esc(lead.legalName || 'будет уточнено в заявке')}</b></div>
      <div><span>Канал</span><b>${esc(lead.channel || 'ещё не выбран')}</b></div>
      <div><span>Адрес</span><b>${hasPoint ? esc(p.address) : 'точка ещё не добавлена'}</b></div>
      <div><span>Описание</span><b>${hasPoint ? esc(p.about) : 'ждём карточку точки'}</b></div>
    </div>
    ${
      hasPoint && p.status === 'pending_rep'
        ? `<div class="approval-actions"><button class="cta-btn brand-gradient" data-action="confirm-approve">Апрув: показать в каталоге</button><button class="ghost-btn" data-action="reject-open">Вернуть на правку</button></div>`
        : `<div class="approval-actions"><button class="ghost-btn" data-go="msp">Открыть экран МСП</button></div>`
    }
  </div>`;
}

/* ================= АМБАССАДОР ================= */

function renderAmbDash(tab) {
  const profile = state.roles.amb || {};
  const city = profile.city || state.district;
  const head = dashHeadHtml('amb', `${esc(city)} · развитие представителей`);
  const tabs = dashTabsHtml('amb', tab);
  if (tab === 'chats') return chatListHtml('amb', head, tabs, 'Чаты с представителями');

  const totals = ambTotals();
  const top = [...totals.reps].sort((a, b) => b.revenueWeek - a.revenueWeek).map((r) => ({ label: r.name, value: r.revenueWeek }));

  if (tab === 'reps') {
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Мои представители<span class="sub"> · ${totals.reps.length}</span></h2></div>
    <div class="list-card">
      ${totals.reps
        .map(
          (r) => `
      <button class="row-item as-btn" data-action="rep-open" data-id="${esc(r.id)}">
        <span class="ri-emoji ${tileBg('tiffany')}">🤝</span>
        <div class="ri-mid">
          <div class="nm">${esc(r.name)}${deltaHtml(r.growth)}</div>
          <div class="sb">${esc(r.city)} · ${r.points.length} точки · ${r.pointsNames.map((s) => esc(s.name)).join(', ')}</div>
        </div>
        <div class="ri-right"><div class="v tnum">${moneyFmt(r.roleIncome)}</div><span class="sb">доход/мес</span></div>
        ${icon('chev-right', 'chev')}
      </button>`
        )
        .join('')}
    </div>
    ${dashNote('Ветку закрепляет платформа при назначении. Новые представители попадают в структуру через промокоды своих представителей — ввода «кода амбассадора» нет.', 'gold')}
    <div class="section-head" style="margin-top:20px"><h2>Структура</h2></div>
    ${renderAmbTree(totals.reps, totals.totalPoints, totals.weekRevenue)}`;
  }

  if (tab === 'income') {
    const incomeByRep = totals.reps.map((r) => ({ label: r.name, value: r.roleIncome }));
    return `
    ${head}${tabs}
    <div class="card kpi-grid">
      ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: totals.avgGrowth, accent: true })}
      ${kpiCard('Доход LOVII сети', moneyFmt(totals.platformIncome), {})}
      ${kpiCard('Средний доход/предст.', moneyFmt(totals.roleIncome / Math.max(1, totals.reps.length)), {})}
      ${kpiTap('GMV структуры · месяц', moneyFmt(totals.monthRevenue), { val: 'reps', delta: 10 })}
    </div>
    ${revenueModelNote('amb')}
    ${chartCard('Доход амбассадора', '6 месяцев, ₽', areaChart({ data: seededSeries('amb-income-6m', 6, 76000, 226000), labels: ['май','июн','июл','авг','сен','окт'], tone: 'gold', height: 155 }))}
    <div class="section-head" style="margin-top:20px"><h2>Доход по представителям</h2></div>
    <div class="chart-card" style="margin-top:10px">${hbarsHtml(incomeByRep)}</div>
    <div class="section-head" style="margin-top:20px"><h2>История выплат</h2></div>
    ${payoutRowsHtml('amb-payouts', totals.roleIncome, 'кураторская выплата')}`;
  }

  if (tab === 'training') {
    const lessons = [
      { id: 1, emoji: '🎯', title: 'Как объяснить ценность LOVII точке', sub: 'Скрипт первой встречи и возражения', pct: 100, dur: '~15 мин' },
      { id: 2, emoji: '🚀', title: 'Запуск представителя за 7 дней', sub: 'План: районы, лиды, CRM, первые сделки', pct: 74, dur: '~25 мин' },
      { id: 3, emoji: '💡', title: 'Мотивация и контроль качества', sub: 'Еженедельные ритуалы структуры', pct: 48, dur: '~20 мин' },
      { id: 4, emoji: '📊', title: 'Финмодель и статусы', sub: 'Сплит 40/40/20, Мэр и Губернатор', pct: 32, dur: '~18 мин' },
    ];
    const doneCount = lessons.filter((l) => l.pct === 100).length;
    const totalLessons = lessons.length;
    const overallPct = Math.round(lessons.reduce((s, l) => s + l.pct, 0) / totalLessons);
    const statusLabel = (p) => (p === 100 ? 'Пройдено' : p > 0 ? 'В процессе' : 'Начать');
    const statusCls = (p) => (p === 100 ? 'done' : p > 0 ? 'active' : 'pending');
    return `
    ${head}${tabs}
    <div class="mentor-card ink-gradient">
      <div class="kicker">Обучающий трек амбассадора</div>
      <div class="big">Осваивайте инструменты и запускайте точку</div>
      <p>Проходите уроки, применяйте скрипты и шаблоны — каждый шаг приближает вас к первому подключению.</p>
    </div>
    <div class="progress-summary-card">
      <div class="ps-ring">
        <svg viewBox="0 0 56 56" class="progress-ring-svg">
          <circle cx="28" cy="28" r="24" fill="none" stroke="var(--lv-surface)" stroke-width="5"/>
          <circle cx="28" cy="28" r="24" fill="none" stroke="url(#pgGrad)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${overallPct * 1.508} 150.8" transform="rotate(-90 28 28)"/>
          <defs><linearGradient id="pgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0abab5"/><stop offset="100%" stop-color="#f64a8a"/></linearGradient></defs>
        </svg>
        <span class="ps-pct">${overallPct}%</span>
      </div>
      <div class="ps-body">
        <div class="ps-title">Пройдено ${doneCount} из ${totalLessons} уроков</div>
        <div class="ps-sub">${overallPct}% обученности · ${lessons.filter((l) => l.pct > 0 && l.pct < 100).length} в процессе</div>
        <div class="progress" style="margin-top:10px"><span style="width:${overallPct}%"></span></div>
      </div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Уроки</h2></div>
    <div class="list-card">
      ${lessons
        .map(
          (l) => `
      <div class="row-item lesson-row">
        <span class="ri-emoji ${tileBg('gold')}">${l.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(l.title)}</div>
          <div class="sb">Урок ${l.id} · ${esc(l.sub)}</div>
          <div class="lesson-meta"><span class="lesson-dur">${l.dur}</span><div class="mini-progress"><span style="width:${l.pct}%"></span></div><span class="lesson-pct tnum">${l.pct}%</span></div>
        </div>
        <span class="lesson-status ${statusCls(l.pct)}">${statusLabel(l.pct)}</span>
      </div>`
        )
        .join('')}
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Инструменты</h2></div>
    <div class="quick-actions-grid" style="padding-top:0">
      <div class="tool-card"><span class="tc-icon ${tileBg('pink')}">📝</span><div class="tc-title">Скрипт продаж</div><div class="tc-desc">Готовый сценарий разговора с точкой, возражения и ответы</div></div>
      <div class="tool-card"><span class="tc-icon ${tileBg('tiffany')}">📋</span><div class="tc-title">Шаблоны документов</div><div class="tc-desc">Договор, акт, прайс — все бланки в одном месте</div></div>
      <div class="tool-card"><span class="tc-icon ${tileBg('gold')}">🧮</span><div class="tc-title">Калькулятор дохода</div><div class="tc-desc">Рассчитайте заработок представителя и амбассадора</div></div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>План недели</h2></div>
    <div class="timeline-card">
      <div class="tl-item done"><b>Пн · Разбор цифр</b><span>доход, активные точки, проблемные категории</span></div>
      <div class="tl-item active"><b>Ср · Созвон структуры</b><span>помочь с возражениями и документами</span></div>
      <div class="tl-item"><b>Пт · Новые лиды</b><span>выдать коды представителям и зафиксировать план</span></div>
    </div>`;
  }

  const needsHelp = Math.min(totals.reps.length, 2);
  return `
  ${head}${tabs}
  <div class="card kpi-grid">
    ${kpiCard('Доход · месяц', moneyFmt(totals.roleIncome), { delta: totals.avgGrowth, accent: true })}
    ${kpiTap('Представители', String(totals.reps.length), { val: 'reps', spark: sparkSvg(seededSeries('amb-reps', 6, 2, 4), 'tiffany') })}
    ${kpiTap('Точки в структуре', String(totals.totalPoints), { val: 'reps' })}
    ${kpiTap('GMV структуры · месяц', moneyFmt(totals.monthRevenue), { val: 'income', delta: 10 })}
  </div>
  <div class="next-step-card gold" data-action="dash-tab" data-val="training" role="button" tabindex="0">
    <span class="ns-icon">📞</span>
    <div class="ns-body">
      <div class="ns-title">Проведи созвон со структурой — ${needsHelp} ${needsHelp === 1 ? 'представитель нуждается' : 'представителя нуждаются'} в помощи</div>
      <div class="ns-desc">Обзор обученности и точек ускорит рост сети</div>
    </div>
    <span class="ns-arrow">${icon('chev-right')}</span>
  </div>
  <div class="section-head" style="margin-top:20px"><h2>Моя структура</h2></div>
  ${renderAmbTree(totals.reps, totals.totalPoints, totals.weekRevenue)}
  <div class="section-head" style="margin-top:20px"><h2>Топ представителей</h2></div>
  <div class="chart-card" style="margin-top:10px">${hbarsHtml(top)}</div>
  ${chartCard('Рост структуры', '6 месяцев, тыс ₽', areaChart({ data: seededSeries('amb-6m', 6, 380, 900), labels: ['апр', 'май', 'июн', 'июл', 'авг', 'сен'], tone: 'gold', height: 140 }))}
  <div class="quick-actions-grid">
    <button class="quick-action-card" data-action="dash-tab" data-val="reps">
      <span class="qa-icon">${icon('users')}</span>
      <span class="qa-title">Представители</span>
      <span class="qa-desc">${totals.reps.length} ${totals.reps.length === 1 ? 'представитель в структуре' : 'представителя в структуре'}</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="training">
      <span class="qa-icon">${icon('network')}</span>
      <span class="qa-title">Обучение</span>
      <span class="qa-desc">4 урока, 64% пройдено</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="income">
      <span class="qa-icon">${icon('wallet')}</span>
      <span class="qa-title">Доход</span>
      <span class="qa-desc">${moneyFmt(totals.roleIncome)} в этом месяце</span>
    </button>
    <button class="quick-action-card" data-action="dash-tab" data-val="chats">
      <span class="qa-icon">${icon('message')}</span>
      <span class="qa-title">Чаты${unreadTotal('amb') ? ` <span class="qa-badge">${unreadTotal('amb')}</span>` : ''}</span>
      <span class="qa-desc">${unreadTotal('amb') ? `${unreadTotal('amb')} непрочитанных` : 'Все прочитаны'}</span>
    </button>
  </div>`;
}

/* Лист представителя: детали без ухода со списка */
function openRepSheet(id) {
  const r = ambRepRows().find((x) => String(x.id) === String(id));
  if (!r) return;
  openActionSheet(
    r.name,
    `${r.city} · ${r.points.length} ${r.points.length === 1 ? 'точка' : 'точки'} в структуре`,
    `
    <div class="list-card">
      <div class="fin-row"><span class="l">Доход представителя</span><span class="v tnum">${moneyFmt(r.roleIncome)}</span></div>
      <div class="fin-row"><span class="l">GMV · месяц</span><span class="v tnum">${moneyFmt(r.monthRevenue)}</span></div>
      <div class="fin-row"><span class="l">Рост недели</span><span class="v">${deltaHtml(r.growth)}</span></div>
      ${r.pointsNames.map((s) => `<div class="fin-row"><span class="l">${s.emoji} ${esc(s.name)}</span><span class="v">${esc(catLabel(s.category))}</span></div>`).join('')}
    </div>
    ${sheetActionsHtml([['sheet-close', 'Закрыть', 'plain']])}
    <div style="padding-top:10px"><button class="cta-btn brand-gradient big" data-go="chat:r-${esc(r.id)}">${icon('message')}Написать в чат</button></div>`
  );
}

/* ================= ЛОВИ БИЗНЕС (МСП) ================= */

function renderMspCabinet(tab = 'index') {
  const lead = ensureMspLead();
  // Онбординг: lead есть, а точка ещё не верифицирована (включая «карточки нет»)
  const onboarding = !!(lead && (!lead.point || lead.point.status !== 'ready'));
  if (onboarding) return renderMspOnboarding(tab);
  return renderMspOps(tab);
}

/* ---- Режим 1: операционный кабинет (верифицированная точка / демо-сид) ---- */

function mspOpsTabsHtml(active) {
  const tabs = [['index', 'Обзор'], ['orders', 'Заказы'], ['goods', 'Товары'], ['more', 'Ещё']];
  return `<div class="seg dash-tabs msp-tabs" style="margin:14px 16px 0">${tabs
    .map(([id, label]) => `<button class="${active === id ? 'active' : ''}" data-action="msp-tab" data-val="${id}">${label}</button>`)
    .join('')}</div>`;
}

function mspHeadHtml() {
  const legal = ctxLegal();
  const branch = ctxBranch();
  const ctx = ensureMspCtx();
  const switcher = mspLegals().length > 1 || legal.branches.length > 1
    ? `<div class="ctx-bar"><button class="pill-btn" data-action="ctx-open" aria-label="Сменить юрлицо или филиал">
        ${icon('building')}<span class="lbl">${esc(legal.name)} · ${esc(branch.name)}</span>${icon('chev-right', 'chev')}
      </button></div>`
    : '';
  return `
  <div class="dash-head">
    <span class="dash-ava ${tileBg('tiffany')}">${branch.emoji || '🏪'}</span>
    <div class="dash-title">
      <div class="rp-row"><h1>ЛОВИ Бизнес</h1><span class="role-pill t-tiffany"><span class="lv-dot" style="background:currentColor"></span>кабинет</span></div>
      <div class="d">${esc(branch.name)} · ${esc(branch.address || legal.name)}</div>
    </div>
    <button class="ghost-btn sm" data-go="profile">${icon('logout')}Клиент</button>
  </div>${switcher}`;
}

function ordRowHtml(o) {
  return `
  <button class="row-item as-btn" data-action="order-open" data-id="${esc(o.id)}">
    <span class="ri-emoji ${tileBg(o.delivery === 'delivery' ? 'pink' : 'tiffany')}">${o.delivery === 'delivery' ? '🛵' : '🛍️'}</span>
    <div class="ri-mid">
      <div class="nm"><span class="tnum">${esc(o.id)}</span> · ${esc(o.customer)}${orderPill(o)}</div>
      <div class="sb">${esc(o.ts)} · ${esc(o.items.map((i) => i.name).join(', '))}</div>
    </div>
    <div class="ri-right"><div class="v tnum">${moneyFmt(o.total)}</div><span class="sb">${ORDER_FLOW[o.delivery].label}</span></div>
    ${icon('chev-right', 'chev')}
  </button>`;
}

function renderMspOps(tab) {
  const head = mspHeadHtml();
  const tabs = mspOpsTabsHtml(tab);
  const bk = ctxBranchKey();
  const stats = LOVII_CAB.branchStats[bk] || { revenueMonth: 0, avgCheck: 0 };
  const orders = ordersForCtx();
  const activeOrders = orders.filter((o) => ['new', 'accepted', 'preparing', 'ready', 'handed_to_delivery', 'on_the_way'].includes(o.status));
  const newCount = orders.filter((o) => o.status === 'new').length;
  const prods = productsForCtx();
  const demoNote = mspLeadMode()
    ? ''
    : dashNote('Демо-режим: точка уже верифицирована. Полный онбординг — через QR-сценарий в кабинете представителя.', 'tiffany');

  if (tab === 'orders') {
    const groups = {
      new: (o) => o.status === 'new',
      work: (o) => ['accepted', 'preparing', 'ready', 'handed_to_delivery', 'on_the_way'].includes(o.status),
      done: (o) => ['completed', 'cancelled'].includes(o.status),
      all: () => true,
    };
    const labels = { new: 'Новые', work: 'В работе', done: 'Завершены', all: 'Все' };
    const counts = {};
    Object.entries(groups).forEach(([k, fn]) => { counts[k] = orders.filter(fn).length; });
    const rows = orders.filter(groups[_ordTab] || groups.all);
    const seg = `<div class="seg dash-tabs" style="margin:14px 16px 0">${Object.entries(labels)
      .map(([k, l]) => `<button class="${_ordTab === k ? 'active' : ''}" data-action="ord-tab" data-val="${k}">${l}${counts[k] && k === 'new' ? ` <span class="tab-unread">${counts[k]}</span>` : ''}</button>`)
      .join('')}</div>`;
    return `
    ${head}${tabs}
    ${seg}
    <div class="list-card">
      ${rows.length ? rows.map(ordRowHtml).join('') : `<div class="empty-cat"><div class="big-emoji">🧾</div><div class="t">${_ordTab === 'new' ? 'Новых заказов нет' : 'Здесь пока пусто'}</div><p class="d">${_ordTab === 'new' ? 'Новый заказ придёт пушем и ботом — со звуком, пока не примешь' : 'Смените фильтр или дождитесь первых заказов'}</p></div>`}
    </div>
    ${dashNote('Новый заказ: WebPush + бот, звук-луп до принятия, потолок ожидания 60 минут. Отмена — с причиной.', 'gold')}`;
  }

  if (tab === 'goods') {
    const branchLabel = (p) => {
      if (p.branch === 'all') return 'Во всех филиалах';
      const legal = LOVII_CAB.legals.find((l) => l.branches.some((b) => b.id === p.branch));
      const b = legal && legal.branches.find((x) => x.id === p.branch);
      return b ? b.name : 'Филиал';
    };
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Товары на витрине<span class="sub"> · ${prods.length}</span></h2></div>
    <div class="list-card">
      ${prods.length ? prods
        .map(
          (p) => `
      <div class="row-item">
        <span class="ri-emoji ${tileBg('sand')}">${p.emoji}</span>
        <div class="ri-mid">
          <div class="nm">${esc(p.name)}</div>
          <div class="sb tnum">${priceFmt(p.price)} / ${esc(p.unit)} · остаток ${p.stock}</div>
        </div>
        <span class="st-chip ${p.branch === 'all' ? 'st-wait' : 'st-off'}">${esc(branchLabel(p))}</span>
      </div>`
        )
        .join('') : `<div class="empty-cat"><div class="big-emoji">🧺</div><div class="t">Каталог пока пуст</div><p class="d">Заполните товары в b2b-кабинете — они появятся на витрине района</p></div>`}
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Управление каталогом</h2></div>
    <div class="list-card">
      <div class="row-item">
        <span class="ri-emoji ${tileBg('pink')}">🖥️</span>
        <div class="ri-mid"><div class="nm">Кабинет b2b</div><div class="sb">Товары, цены, остатки и фото — на большом экране</div></div>
        <button class="chev-btn" data-action="b2b-open" aria-label="Открыть кабинет b2b">${icon('chev-right')}</button>
      </div>
    </div>
    ${dashNote('В app каталог read-only: добавление и редактирование — в b2b-кабинете (решение владельца 2026-09-11).', 'dim')}`;
  }

  if (tab === 'more') {
    const verCode = mspLeadMode()
      ? 'VER-' + (ensureMspLead().inn || '').slice(-4) + '-7KQ2M3X9'
      : 'VER-1042-7KQ2M3X9';
    return `
    ${head}${tabs}
    <div class="section-head" style="margin-top:20px"><h2>Счёт верификации</h2></div>
    <div class="list-card">
      <div class="fin-row"><span class="l">Сумма</span><span class="v tnum">1 ₽</span></div>
      <div class="fin-row"><span class="l">Назначение платежа</span><span class="v tnum">${esc(verCode)}</span></div>
      <div class="fin-row ok"><span class="l">Статус</span><span class="st-chip st-active">Оплачен, возвращён на р/с</span></div>
    </div>
    ${dashNote('Платёж верификации — возвратный: платформа вернёт 1 ₽ на реквизиты компании после проверки (механика — Т-Банк).', 'tiffany')}
    <div class="section-head" style="margin-top:20px"><h2>Филиал</h2></div>
    <div class="list-card">
      <div class="fin-row"><span class="l">Название</span><span class="v">${esc(ctxBranch().name)}</span></div>
      <div class="fin-row"><span class="l">Юрлицо</span><span class="v">${esc(ctxLegal().name)}</span></div>
      <div class="fin-row"><span class="l">Адрес</span><span class="v">${esc(ctxBranch().address || '—')}</span></div>
    </div>
    <div class="section-head" style="margin-top:20px"><h2>Инструкция b2b</h2></div>
    <div class="mentor-card ink-gradient"><div class="kicker">Ссылка-инструкция</div><div class="big">Управление каталогом — на большом экране</div><p>Авторизация по ссылке из бота, добавление товаров и остатков, публикация на витрине LOVII.</p></div>
    <div class="script-card">
      <div class="kicker">Что дальше</div>
      <ol>
        <li><b>Авторизация.</b> Откройте ссылку-инструкцию из бота MAX или Telegram.</li>
        <li><b>Каталог.</b> Добавьте товары, цены, остатки и фото — бейдж «Во всех филиалах» расставит позиции по точкам.</li>
        <li><b>Публикация.</b> Товары появятся на витрине точки и в поиске района.</li>
      </ol>
    </div>
    <div class="btn-row"><button class="cta-btn brand-gradient" data-action="b2b-open">Открыть кабинет b2b</button></div>`;
  }

  // --- Обзор ---
  const recent = orders.slice(0, 5);
  const next = newCount > 0
    ? { icon: '🔔', title: `${newCount} ${newCount === 1 ? 'новый заказ' : 'новых заказа'} — принять сейчас`, desc: 'Звук напомнит, пока не примешь заказ', val: 'orders' }
    : prods.length === 0
      ? { icon: '🧺', title: 'Заполните каталог', desc: 'Товары появятся на витрине района', val: 'goods' }
      : { icon: '✅', title: 'Все заказы обработаны', desc: 'Новые придут пушем и в бот MAX', val: 'orders' };
  return `
  ${head}${tabs}
  ${demoNote}
  <div class="card kpi-grid">
    ${kpiTap('Активные заказы', String(activeOrders.length), { val: 'orders' })}
    ${kpiCard('Выручка · месяц', moneyFmt(stats.revenueMonth), { delta: 8, accent: true })}
    ${kpiTap('Товары на витрине', String(prods.length), { val: 'goods' })}
    ${kpiCard('Средний чек', priceFmt(stats.avgCheck), {})}
  </div>
  <div class="next-step-card" data-action="msp-tab" data-val="${next.val}" role="button" tabindex="0">
    <span class="ns-icon">${next.icon}</span>
    <div class="ns-body">
      <div class="ns-title">${next.title}</div>
      <div class="ns-desc">${next.desc}</div>
    </div>
    <span class="ns-arrow">${icon('chev-right')}</span>
  </div>
  <div class="section-head" style="margin-top:20px"><h2>Последние заказы</h2><button class="link-btn" data-action="msp-tab" data-val="orders">${icon('chev-right')}Все</button></div>
  <div class="list-card">${recent.length ? recent.map(ordRowHtml).join('') : `<div class="empty-cat"><div class="big-emoji">🧾</div><div class="t">Заказов пока нет</div><p class="d">Первый заказ придёт пушем и в бот</p></div>`}</div>
  <div class="quick-actions-grid">
    <button class="quick-action-card" data-action="msp-tab" data-val="orders">
      <span class="qa-icon">${icon('bag')}</span>
      <span class="qa-title">Заказы</span>
      <span class="qa-desc">${activeOrders.length} в работе</span>
    </button>
    <button class="quick-action-card" data-action="msp-tab" data-val="goods">
      <span class="qa-icon">${icon('package')}</span>
      <span class="qa-title">Товары</span>
      <span class="qa-desc">${prods.length} на витрине</span>
    </button>
    <button class="quick-action-card" data-action="msp-tab" data-val="more">
      <span class="qa-icon">${icon('banknote')}</span>
      <span class="qa-title">Счёт</span>
      <span class="qa-desc">Верификация и реквизиты</span>
    </button>
    <button class="quick-action-card" data-action="msp-tab" data-val="more">
      <span class="qa-icon">${icon('monitor')}</span>
      <span class="qa-title">Инструкция</span>
      <span class="qa-desc">Каталог в b2b</span>
    </button>
  </div>`;
}

/* ---- Режим 2: онбординг (заявка не верифицирована) ---- */

function renderMspOnboarding(tab = 'index') {
  const lead = ensureMspLead();
  const p = lead.point;
  const status = p ? p.status : 'draft';
  const verCode = 'VER-' + (lead.inn || '').slice(-4) + '-7KQ2M3X9';
  const tabs = `<div class="seg dash-tabs msp-tabs" style="margin:14px 16px 0">
    ${[['index','Заявка'], ['catalog','Каталог'], ['pay','Платёж'], ['help','Инструкция']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="msp-tab" data-val="${id}">${label}</button>`).join('')}
  </div>`;
  const head = `
  <div class="dash-head">
    <span class="dash-ava ${tileBg('tiffany')}">🏪</span>
    <div class="dash-title">
      <div class="rp-row"><h1>ЛОВИ Бизнес</h1><span class="role-pill t-gold"><span class="lv-dot" style="background:currentColor"></span>онбординг</span></div>
      <div class="d">ИНН <span class="tnum">${esc(lead.inn)}</span> · ${esc(lead.repCode)}</div>
    </div>
    <button class="ghost-btn sm" data-go="dash:connect">${icon('chev-left')}Представитель</button>
  </div>`;

  if (tab === 'catalog') {
    if (status !== 'ready') {
      return `${head}${tabs}${mspStepsHtml(status)}<div class="empty-state-card"><div class="big-emoji">🧺</div><h3>Каталог товаров пока закрыт</h3><p>Сейчас точка видна в каталоге как карточка района. Товары откроются после апрува представителя, счёта верификации и возврата платежа.</p><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="pay">Посмотреть следующий шаг</button></div>`;
    }
    return `${head}${tabs}${mspStepsHtml(status)}<div class="empty-state-card"><div class="big-emoji">🎉</div><h3>Точка верифицирована</h3><p>Операционный кабинет открыт: заказы, товары и счёт — в разделе «ЛОВИ Бизнес».</p><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="index">Открыть обзор</button></div>`;
  }

  if (tab === 'pay') {
    const canPay = p && p.status === 'catalog';
    return `${head}${tabs}${mspStepsHtml(status)}
    <div class="pay-card">
      <div class="kicker">Счёт верификации · возвратный</div>
      <h2>${canPay ? 'Пора подтвердить реквизиты' : status === 'payment' ? 'Платёж получен, формируем возврат' : 'Этот шаг откроется после апрува представителя'}</h2>
      <div class="pay-row"><span>Сумма</span><b class="tnum">1 ₽</b></div>
      <div class="pay-row"><span>Назначение</span><b class="tnum">${esc(verCode)}</b></div>
      <p>Платёж строго <b>с р/с компании из заявки</b> — так мы связываем счёт и юрлицо. Код ${esc(verCode)} в назначении матчится автоматически. После проверки вернём 1 ₽ на те же реквизиты.</p>
      ${canPay ? `<button class="cta-btn brand-gradient big" data-action="demo-pay">Смоделировать оплату и возврат</button>` : ''}
      <button class="ghost-btn sm" style="margin-top:10px" data-action="pay-refresh">${icon('rotate')}Обновить статус</button>
    </div>
    <div class="checklist-card">
      <div class="cl-row done"><b>Карточка точки</b><span>${p ? esc(p.name) : 'ещё не создана'}</span></div>
      <div class="cl-row ${['catalog','payment','ready'].includes(status) ? 'done' : ''}"><b>Апрув представителя</b><span>точка видна в каталоге района</span></div>
      <div class="cl-row ${status === 'ready' ? 'done' : status === 'payment' ? 'active' : ''}"><b>Платёж и возврат</b><span>проверка реквизитов и автосплиты</span></div>
      <div class="cl-row ${status === 'ready' ? 'done' : ''}"><b>Инструкция</b><span>${status === 'ready' ? 'отправлена в ' + esc(lead.channel || 'выбранный канал') : 'придёт после проверки'}</span></div>
    </div>`;
  }

  if (tab === 'help') {
    return `${head}${tabs}${mspStepsHtml(status)}
    <div class="mentor-card ink-gradient"><div class="kicker">Ссылка-инструкция</div><div class="big">${status === 'ready' ? 'Отправлена в ' + esc(lead.channel || 'канал связи') : 'Откроется после платежа'}</div><p>Владелец проходит авторизацию, добавляет товары, цены и остатки. Каждый товар станет доступен на витрине LOVII именно в этой точке.</p></div>
    <div class="script-card">
      <div class="kicker">Что дальше</div>
      <ol>
        <li><b>Авторизация.</b> Откройте ссылку в ${esc(lead.channel || 'выбранном канале')}.</li>
        <li><b>Каталог.</b> Добавьте товары, цены, остатки и фото.</li>
        <li><b>Публикация.</b> Каждый товар будет виден на странице точки и в общем поиске LOVII.</li>
      </ol>
    </div>`;
  }

  return `${head}${tabs}${mspStepsHtml(status)}
  <div class="status-flow-card">
    <div class="kicker">Текущий этап</div>
    <h2>${esc(mspStatusText(status))}</h2>
    <p>${status === 'draft' ? 'Заполните то, что нужно для появления в каталоге: юрлицо, канал связи, название, адрес, описание и фото.' : 'Система показывает, что уже сделано и какой один следующий шаг нужен сейчас.'}</p>
  </div>
  ${p ? `
    <div class="list-card">
      <div class="row-item"><span class="ri-emoji ${tileBg('tiffany')}">${p.emoji}</span><div class="ri-mid"><div class="nm">${esc(p.name)}${statusChip(p.status)}</div><div class="sb">${esc(p.address)} · ${esc(p.about)}</div></div>${mspPointVisible(p.status) ? `<button class="chev-btn" data-go="store:${p.slug}">${icon('chev-right')}</button>` : ''}</div>
    </div>
  ` : ''}
  ${(!p || p.status === 'draft') ? `
    <form id="msp-point-form">
      <label class="f-field"><span class="lb">Название юрлица</span><input name="legalName" placeholder="ООО «Ржаной дом»" value="${esc(lead.legalName || '')}" required></label>
      <label class="f-field"><span class="lb">Канал для инструкции</span><select name="channel"><option ${lead.channel === 'Telegram' ? 'selected' : ''}>Telegram</option><option ${lead.channel === 'ВКонтакте' ? 'selected' : ''}>ВКонтакте</option><option ${lead.channel === 'MAX' ? 'selected' : ''}>MAX</option></select></label>
      <label class="f-field"><span class="lb">Название точки</span><input name="name" placeholder="Пекарня «Ржаной дом»" required></label>
      <label class="f-field"><span class="lb">Адрес</span><input name="address" placeholder="ул. Рубинштейна, 12" required></label>
      <label class="f-field"><span class="lb">Описание</span><textarea name="about" placeholder="Что продаёте, почему вас любят соседи…" required></textarea></label>
      <label class="f-field"><span class="lb">Фото точки</span><input name="photo" type="file" accept="image/*"></label>
      <div class="dash-note tone-tiffany" style="margin-top:14px">Товаров на этом этапе нет. После апрува представитель публикует карточку точки: фото, адрес, описание и расстояние до клиента.</div>
      <div style="padding:16px 16px 0"><button class="cta-btn brand-gradient big" type="submit">Добавить в каталог</button></div>
    </form>` : ''}
  ${status === 'pending_rep' ? dashNote('Заявка ушла представителю. В демо: кабинет представителя → «Подключение» → «Апрув» — теперь с подтверждением.', 'gold') : ''}
  ${status === 'catalog' ? `<div class="btn-row"><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="pay">Перейти к счёту верификации</button><button class="ghost-btn" data-go="store:${p.slug}">Посмотреть в каталоге</button></div>` : ''}
  ${status === 'ready' ? `<div class="btn-row"><button class="cta-btn brand-gradient" data-action="msp-tab" data-val="catalog">Открыть операционный кабинет</button></div>` : ''}`;
}
