/* Сгенерировано tour/_tools/gen-tour.mjs — не править руками. 2026-11-16T12:36:25.478Z */
window.TOUR = {
 "stats": {
  "screens": 59,
  "roles": 4,
  "chapters": 5,
  "cards": 48
 },
 "chapters": [
  {
   "id": "buyer",
   "title": "Покупателю",
   "lead": "От «что рядом?» до оформленного заказа — один путь, без лишних экранов. Витрина района, корзины по точкам, заказы, баллы и переводы. Эквайринг — интеграция: на демо платёж показывает банк-мок.",
   "items": [
    {
     "id": "APP-P-001-home",
     "title": "Витрина района",
     "desc": "Всё вкусное и нужное рядом: покупатель видит точки в шаговой доступности, популярные заведения и живые акции — ещё до входа.",
     "shots": {
      "mobile": "shots/APP-P-001-home-mobile.png",
      "fold": "shots/APP-P-001-home-fold.png",
      "tablet": "shots/APP-P-001-home-tablet.png",
      "web": "shots/APP-P-001-home-web.png"
     },
     "route": "/"
    },
    {
     "id": "APP-P-002-popular",
     "title": "Популярное рядом",
     "desc": "Лучшие заведения района на одном экране — карточная витрина по выбранному адресу доставки.",
     "shots": {
      "mobile": "shots/APP-P-002-popular-mobile.png",
      "fold": "shots/APP-P-002-popular-fold.png",
      "tablet": "shots/APP-P-002-popular-tablet.png",
      "web": "shots/APP-P-002-popular-web.png"
     },
     "route": "/popular"
    },
    {
     "id": "APP-P-003-stores",
     "title": "Каталог точек",
     "desc": "Все точки рядом с поиском, фильтрами и сортировкой. Два вида списка — как удобнее.",
     "shots": {
      "mobile": "shots/APP-P-003-stores-mobile.png",
      "fold": "shots/APP-P-003-stores-fold.png",
      "tablet": "shots/APP-P-003-stores-tablet.png",
      "web": "shots/APP-P-003-stores-web.png"
     },
     "route": "/stores"
    },
    {
     "id": "APP-P-004-store",
     "title": "Витрина точки",
     "desc": "Меню и наличие каждой точки: категории, поиск по товарам, минуты пешком и статус «открыто».",
     "shots": {
      "mobile": "shots/APP-P-004-store-mobile.png",
      "fold": "shots/APP-P-004-store-fold.png",
      "tablet": "shots/APP-P-004-store-tablet.png",
      "web": "shots/APP-P-004-store-web.png"
     },
     "route": "/stores/:id"
    },
    {
     "id": "APP-P-005-product",
     "title": "Карточка товара",
     "desc": "Фото, описание и рекомендации «ещё может подойти» — товар в корзине за один тап.",
     "shots": {
      "mobile": "shots/APP-P-005-product-mobile.png",
      "fold": "shots/APP-P-005-product-fold.png",
      "tablet": "shots/APP-P-005-product-tablet.png",
      "web": "shots/APP-P-005-product-web.png"
     },
     "route": "/stores/:id/product/:productId"
    },
    {
     "id": "APP-P-006-cart",
     "title": "Корзина",
     "desc": "Корзины по каждой точке отдельно: позиции, итоги и платформенный минимум — без сюрпризов на чекауте.",
     "shots": {
      "mobile": "shots/APP-P-006-cart-mobile.png",
      "fold": "shots/APP-P-006-cart-fold.png",
      "tablet": "shots/APP-P-006-cart-tablet.png",
      "web": "shots/APP-P-006-cart-web.png"
     },
     "route": "/cart"
    },
    {
     "id": "APP-P-007-cart-order",
     "title": "Оформление заказа",
     "desc": "Доставка или самовывоз, адрес, оплата баллами и предрасчёт — заказ собирается за минуту.",
     "shots": {
      "mobile": "shots/APP-P-007-cart-order-mobile.png",
      "fold": "shots/APP-P-007-cart-order-fold.png",
      "tablet": "shots/APP-P-007-cart-order-tablet.png",
      "web": "shots/APP-P-007-cart-order-web.png"
     },
     "route": "/cart/:id"
    },
    {
     "id": "APP-P-057-payment-result",
     "title": "Результат оплаты",
     "desc": "Экран после оплаты через банк-мок на staging: квитанция с реквизитами заказа. В продукте заказ, баллы и лояльность; эквайринг подключается интеграцией — на демо платёж показывает банк-мок.",
     "shots": {
      "mobile": "shots/APP-P-057-payment-result-mobile.png",
      "fold": "shots/APP-P-057-payment-result-fold.png",
      "tablet": "shots/APP-P-057-payment-result-tablet.png",
      "web": "shots/APP-P-057-payment-result-web.png"
     },
     "route": "/payment/result"
    },
    {
     "id": "APP-P-008-profile",
     "title": "Профиль",
     "desc": "Хаб покупателя: счета, подписка и настройки входа — код из СМС или мессенджера.",
     "shots": {
      "mobile": "shots/APP-P-008-profile-mobile.png",
      "fold": "shots/APP-P-008-profile-fold.png",
      "tablet": "shots/APP-P-008-profile-tablet.png",
      "web": "shots/APP-P-008-profile-web.png"
     },
     "route": "/profile"
    },
    {
     "id": "APP-P-009-wallet",
     "title": "Кошелёк",
     "desc": "Деньги и баллы на одном экране: баланс, динамика месяца и вся история операций.",
     "shots": {
      "mobile": "shots/APP-P-009-wallet-mobile.png",
      "fold": "shots/APP-P-009-wallet-fold.png",
      "tablet": "shots/APP-P-009-wallet-tablet.png",
      "web": "shots/APP-P-009-wallet-web.png"
     },
     "route": "/profile/wallet"
    },
    {
     "id": "APP-P-010-transfer",
     "title": "Переводы",
     "desc": "Переводы баллов и денег по телефону, промокоду или карте — комиссия рассчитывается при переводе.",
     "shots": {
      "mobile": "shots/APP-P-010-transfer-mobile.png",
      "fold": "shots/APP-P-010-transfer-fold.png",
      "tablet": "shots/APP-P-010-transfer-tablet.png",
      "web": "shots/APP-P-010-transfer-web.png"
     },
     "route": "/profile/wallet/transfer"
    },
    {
     "id": "APP-P-013-profile-edit",
     "title": "Профиль: данные",
     "desc": "Имя, дата рождения и аватар — профиль можно оформить под себя.",
     "shots": {
      "mobile": "shots/APP-P-013-profile-edit-mobile.png",
      "fold": "shots/APP-P-013-profile-edit-fold.png",
      "tablet": "shots/APP-P-013-profile-edit-tablet.png",
      "web": "shots/APP-P-013-profile-edit-web.png"
     },
     "route": "/profile/edit"
    },
    {
     "id": "APP-P-014-email-verify",
     "title": "Подтверждение e-mail",
     "desc": "Код из письма подтверждает почту — она нужна для чеков и уведомлений о заказах.",
     "shots": {
      "mobile": "shots/APP-P-014-email-verify-mobile.png",
      "fold": "shots/APP-P-014-email-verify-fold.png",
      "tablet": "shots/APP-P-014-email-verify-tablet.png",
      "web": "shots/APP-P-014-email-verify-web.png"
     },
     "route": "/profile/edit/email/verify"
    },
    {
     "id": "APP-P-015-orders",
     "title": "Мои заказы",
     "desc": "Каждый заказ — на карточке: статус, состав и сумма. История не теряется.",
     "shots": {
      "mobile": "shots/APP-P-015-orders-mobile.png",
      "fold": "shots/APP-P-015-orders-fold.png",
      "tablet": "shots/APP-P-015-orders-tablet.png",
      "web": "shots/APP-P-015-orders-web.png"
     },
     "route": "/profile/orders"
    },
    {
     "id": "APP-P-016-order",
     "title": "Детали заказа",
     "desc": "Состав, статусы и квитанция. Отмена с причиной — честно и в один шаг.",
     "shots": {
      "mobile": "shots/APP-P-016-order-mobile.png",
      "fold": "shots/APP-P-016-order-fold.png",
      "tablet": "shots/APP-P-016-order-tablet.png",
      "web": "shots/APP-P-016-order-web.png"
     },
     "route": "/profile/orders/:id"
    },
    {
     "id": "APP-P-017-addresses",
     "title": "Адреса доставки",
     "desc": "Сохранённые адреса под рукой — доставка в пару тапов.",
     "shots": {
      "mobile": "shots/APP-P-017-addresses-mobile.png",
      "fold": "shots/APP-P-017-addresses-fold.png",
      "tablet": "shots/APP-P-017-addresses-tablet.png",
      "web": "shots/APP-P-017-addresses-web.png"
     },
     "route": "/profile/addresses"
    },
    {
     "id": "APP-P-018-address-create",
     "title": "Новый адрес",
     "desc": "Выбор точки на карте и заполнение полей адреса — адрес сохраняется в профиле.",
     "shots": {
      "mobile": "shots/APP-P-018-address-create-mobile.png",
      "fold": "shots/APP-P-018-address-create-fold.png",
      "tablet": "shots/APP-P-018-address-create-tablet.png",
      "web": "shots/APP-P-018-address-create-web.png"
     },
     "route": "/profile/addresses/create"
    },
    {
     "id": "APP-P-020-settings",
     "title": "Настройки",
     "desc": "Тема, размер текста, push-уведомления и вход по Face ID — приложение подстраивается под человека.",
     "shots": {
      "mobile": "shots/APP-P-020-settings-mobile.png",
      "fold": "shots/APP-P-020-settings-fold.png",
      "tablet": "shots/APP-P-020-settings-tablet.png",
      "web": "shots/APP-P-020-settings-web.png"
     },
     "route": "/settings"
    }
   ]
  },
  {
   "id": "partner",
   "title": "Партнёру",
   "lead": "Точка подключается за день: заявка с честным таймлайном, кабинет с доской заказов, товары, лояльность, команда и чеки 54-ФЗ. Сотрудник работает в отдельном лёгком кабинете.",
   "items": [
    {
     "id": "APP-P-024-business-result",
     "title": "Точка активна",
     "desc": "Подключение подтверждено — кабинет точки активен и принимает заказы (кадр: verified-кабинет АКСИОМА на стендовых данных).",
     "shots": {
      "mobile": "shots/APP-P-024-business-result-mobile.png",
      "fold": "shots/APP-P-024-business-result-fold.png",
      "tablet": "shots/APP-P-024-business-result-tablet.png",
      "web": "shots/APP-P-024-business-result-web.png"
     },
     "route": "/business/result"
    },
    {
     "id": "APP-P-044-msp-overview",
     "title": "Кабинет партнёра",
     "desc": "Пульс точки: выручка, заказы, следующий шаг запуска — всё главное на одном экране.",
     "shots": {
      "mobile": "shots/APP-P-044-msp-overview-mobile.png",
      "fold": "shots/APP-P-044-msp-overview-fold.png",
      "tablet": "shots/APP-P-044-msp-overview-tablet.png",
      "web": "shots/APP-P-044-msp-overview-web.png"
     },
     "route": "/cabinet/msp"
    },
    {
     "id": "APP-P-045-msp-payment",
     "title": "Верификация счёта",
     "desc": "Счёт на верификацию приходит после заявки на подключение: проверочный рубль подтверждает расчётный счёт.",
     "shots": {
      "mobile": "shots/APP-P-045-msp-payment-mobile.png",
      "fold": "shots/APP-P-045-msp-payment-fold.png",
      "tablet": "shots/APP-P-045-msp-payment-tablet.png",
      "web": "shots/APP-P-045-msp-payment-web.png"
     },
     "route": "/cabinet/msp/payment"
    },
    {
     "id": "APP-P-046-msp-orders",
     "title": "Доска заказов",
     "desc": "Активные и история: партнёр видит каждый заказ точки и его стадию.",
     "shots": {
      "mobile": "shots/APP-P-046-msp-orders-mobile.png",
      "fold": "shots/APP-P-046-msp-orders-fold.png",
      "tablet": "shots/APP-P-046-msp-orders-tablet.png",
      "web": "shots/APP-P-046-msp-orders-web.png"
     },
     "route": "/cabinet/msp/orders"
    },
    {
     "id": "APP-P-047-msp-order-detail",
     "title": "Заказ в работе",
     "desc": "Состав, клиент с кнопкой звонка и смена статуса — заказ ведётся по чётким правилам.",
     "shots": {
      "mobile": "shots/APP-P-047-msp-order-detail-mobile.png",
      "fold": "shots/APP-P-047-msp-order-detail-fold.png",
      "tablet": "shots/APP-P-047-msp-order-detail-tablet.png",
      "web": "shots/APP-P-047-msp-order-detail-web.png"
     },
     "route": "/cabinet/msp/orders/:id"
    },
    {
     "id": "APP-P-048-msp-products",
     "title": "Товары точки",
     "desc": "Добавить, снять с продажи или скрыть с витрины — каталог точки меняется мгновенно.",
     "shots": {
      "mobile": "shots/APP-P-048-msp-products-mobile.png",
      "fold": "shots/APP-P-048-msp-products-fold.png",
      "tablet": "shots/APP-P-048-msp-products-tablet.png",
      "web": "shots/APP-P-048-msp-products-web.png"
     },
     "route": "/cabinet/msp/products"
    },
    {
     "id": "APP-P-049-msp-loyalty",
     "title": "Лояльность",
     "desc": "Конструктор акций: кэшбэк, комбо, счастливые часы — партнёр сам управляет своими предложениями.",
     "shots": {
      "mobile": "shots/APP-P-049-msp-loyalty-mobile.png",
      "fold": "shots/APP-P-049-msp-loyalty-fold.png",
      "tablet": "shots/APP-P-049-msp-loyalty-tablet.png",
      "web": "shots/APP-P-049-msp-loyalty-web.png"
     },
     "route": "/cabinet/msp/loyalty"
    },
    {
     "id": "APP-P-050-msp-branch-settings",
     "title": "Управление точкой",
     "desc": "Расписание, минимальный заказ и радиус доставки (настраивается в b2b) — точка работает по правилам партнёра.",
     "shots": {
      "mobile": "shots/APP-P-050-msp-branch-settings-mobile.png",
      "fold": "shots/APP-P-050-msp-branch-settings-fold.png",
      "tablet": "shots/APP-P-050-msp-branch-settings-tablet.png",
      "web": "shots/APP-P-050-msp-branch-settings-web.png"
     },
     "route": "/cabinet/msp/settings"
    },
    {
     "id": "APP-P-051-msp-team",
     "title": "Команда",
     "desc": "Приглашение сотрудников и роли — доступы выдаёт владелец точки.",
     "shots": {
      "mobile": "shots/APP-P-051-msp-team-mobile.png",
      "fold": "shots/APP-P-051-msp-team-fold.png",
      "tablet": "shots/APP-P-051-msp-team-tablet.png",
      "web": "shots/APP-P-051-msp-team-web.png"
     },
     "route": "/cabinet/msp/team"
    },
    {
     "id": "APP-P-052-msp-starter",
     "title": "Старт точки",
     "desc": "Чек-лист запуска с прогрессом: витрина, товары, расписание — и точка открыта.",
     "shots": {
      "mobile": "shots/APP-P-052-msp-starter-mobile.png",
      "fold": "shots/APP-P-052-msp-starter-fold.png",
      "tablet": "shots/APP-P-052-msp-starter-tablet.png",
      "web": "shots/APP-P-052-msp-starter-web.png"
     },
     "route": "/cabinet/msp/starter"
    },
    {
     "id": "APP-P-053-team-orders",
     "title": "Заказы точки",
     "desc": "Рабочий экран сотрудника: принять заказ и провести по статусам — ничего лишнего.",
     "shots": {
      "mobile": "shots/APP-P-053-team-orders-mobile.png",
      "fold": "shots/APP-P-053-team-orders-fold.png",
      "tablet": "shots/APP-P-053-team-orders-tablet.png",
      "web": "shots/APP-P-053-team-orders-web.png"
     },
     "route": "/cabinet/team"
    },
    {
     "id": "APP-P-054-team-order-detail",
     "title": "Заказ у стойки",
     "desc": "Одна кнопка — следующий шаг заказа: состав, суммы и клиент перед глазами.",
     "shots": {
      "mobile": "shots/APP-P-054-team-order-detail-mobile.png",
      "fold": "shots/APP-P-054-team-order-detail-fold.png",
      "tablet": "shots/APP-P-054-team-order-detail-tablet.png",
      "web": "shots/APP-P-054-team-order-detail-web.png"
     },
     "route": "/cabinet/team/orders/:id"
    },
    {
     "id": "APP-P-055-team-products",
     "title": "Товары у стойки",
     "desc": "Администратор правит каталог своей точки прямо с рабочего места.",
     "shots": {
      "mobile": "shots/APP-P-055-team-products-mobile.png",
      "fold": "shots/APP-P-055-team-products-fold.png",
      "tablet": "shots/APP-P-055-team-products-tablet.png",
      "web": "shots/APP-P-055-team-products-web.png"
     },
     "route": "/cabinet/team/products"
    },
    {
     "id": "APP-P-056-team-team",
     "title": "Смена и доступы",
     "desc": "Состав своей точки глазами администратора — приглашения в рамках своих филиалов.",
     "shots": {
      "mobile": "shots/APP-P-056-team-team-mobile.png",
      "fold": "shots/APP-P-056-team-team-fold.png",
      "tablet": "shots/APP-P-056-team-team-tablet.png",
      "web": "shots/APP-P-056-team-team-web.png"
     },
     "route": "/cabinet/team/team"
    }
   ]
  },
  {
   "id": "rep",
   "title": "Представителю",
   "lead": "Своя территория, свои точки, прозрачный доход: представитель подключает бизнес по промокоду и ведёт заявки до запуска.",
   "items": [
    {
     "id": "APP-P-026-rep-overview",
     "title": "Кабинет представителя",
     "desc": "Показатели, следующий шаг и очередь согласований — работа представителя собирается на одном экране.",
     "shots": {
      "mobile": "shots/APP-P-026-rep-overview-mobile.png",
      "fold": "shots/APP-P-026-rep-overview-fold.png",
      "tablet": "shots/APP-P-026-rep-overview-tablet.png",
      "web": "shots/APP-P-026-rep-overview-web.png"
     },
     "route": "/cabinet/representative"
    },
    {
     "id": "APP-P-027-rep-points",
     "title": "Мои точки",
     "desc": "Точки, подключённые по промокоду: поиск, фильтры и честная сводка «активные / в работе».",
     "shots": {
      "mobile": "shots/APP-P-027-rep-points-mobile.png",
      "fold": "shots/APP-P-027-rep-points-fold.png",
      "tablet": "shots/APP-P-027-rep-points-tablet.png",
      "web": "shots/APP-P-027-rep-points-web.png"
     },
     "route": "/cabinet/representative/points"
    },
    {
     "id": "APP-P-028-rep-approvals",
     "title": "Согласование заявок",
     "desc": "Очередь заявок по промокодам: подтвердить или вернуть на правку. На кадре очередь пуста — заявки появляются по мере подключений.",
     "shots": {
      "mobile": "shots/APP-P-028-rep-approvals-mobile.png",
      "fold": "shots/APP-P-028-rep-approvals-fold.png",
      "tablet": "shots/APP-P-028-rep-approvals-tablet.png",
      "web": "shots/APP-P-028-rep-approvals-web.png"
     },
     "route": "/cabinet/representative/approvals"
    },
    {
     "id": "APP-P-029-rep-income",
     "title": "Доход представителя",
     "desc": "Начисления по модельной разбивке 40/40/20 и прозрачная структура дохода.",
     "shots": {
      "mobile": "shots/APP-P-029-rep-income-mobile.png",
      "fold": "shots/APP-P-029-rep-income-fold.png",
      "tablet": "shots/APP-P-029-rep-income-tablet.png",
      "web": "shots/APP-P-029-rep-income-web.png"
     },
     "route": "/cabinet/representative/income"
    },
    {
     "id": "APP-P-030-rep-profile",
     "title": "Профиль представителя",
     "desc": "Промокод с QR-кодом, статус ранга и привилегии — делиться легко.",
     "shots": {
      "mobile": "shots/APP-P-030-rep-profile-mobile.png",
      "fold": "shots/APP-P-030-rep-profile-fold.png",
      "tablet": "shots/APP-P-030-rep-profile-tablet.png",
      "web": "shots/APP-P-030-rep-profile-web.png"
     },
     "route": "/cabinet/representative/profile"
    }
   ]
  },
  {
   "id": "amb",
   "title": "Амбассадору",
   "lead": "Ветка амбассадора: представители, обучение и доход с прозрачной моделью выплат.",
   "items": [
    {
     "id": "APP-P-039-amb-overview",
     "title": "Кабинет амбассадора",
     "desc": "Сводка ветки: показатели, топ представителей и следующий шаг.",
     "shots": {
      "mobile": "shots/APP-P-039-amb-overview-mobile.png",
      "fold": "shots/APP-P-039-amb-overview-fold.png",
      "tablet": "shots/APP-P-039-amb-overview-tablet.png",
      "web": "shots/APP-P-039-amb-overview-web.png"
     },
     "route": "/cabinet/ambassador"
    },
    {
     "id": "APP-P-040-amb-reps",
     "title": "Мои представители",
     "desc": "Активные промокоды ветки и карточка приглашения с QR — рост команды в один тап.",
     "shots": {
      "mobile": "shots/APP-P-040-amb-reps-mobile.png",
      "fold": "shots/APP-P-040-amb-reps-fold.png",
      "tablet": "shots/APP-P-040-amb-reps-tablet.png",
      "web": "shots/APP-P-040-amb-reps-web.png"
     },
     "route": "/cabinet/ambassador/reps"
    },
    {
     "id": "APP-P-041-amb-training",
     "title": "Обучение",
     "desc": "Трек уроков с прогрессом — материалы для развития ветки.",
     "shots": {
      "mobile": "shots/APP-P-041-amb-training-mobile.png",
      "fold": "shots/APP-P-041-amb-training-fold.png",
      "tablet": "shots/APP-P-041-amb-training-tablet.png",
      "web": "shots/APP-P-041-amb-training-web.png"
     },
     "route": "/cabinet/ambassador/training"
    },
    {
     "id": "APP-P-042-amb-income",
     "title": "Доход амбассадора",
     "desc": "Факт дохода, модель и история выплат — цифры без прикрас.",
     "shots": {
      "mobile": "shots/APP-P-042-amb-income-mobile.png",
      "fold": "shots/APP-P-042-amb-income-fold.png",
      "tablet": "shots/APP-P-042-amb-income-tablet.png",
      "web": "shots/APP-P-042-amb-income-web.png"
     },
     "route": "/cabinet/ambassador/income"
    }
   ]
  },
  {
   "id": "platform",
   "title": "Платформе",
   "lead": "Экономика платформы под контролем: финансы, выплаты, чарджбэк и метрики роста — на реальных данных, с честными пометками.",
   "items": [
    {
     "id": "APP-P-032-platform",
     "title": "Финансы платформы",
     "desc": "Счета оператора и транзит эквайринга: видно, как распределяется каждый платёж.",
     "shots": {
      "mobile": "shots/APP-P-032-platform-mobile.png",
      "fold": "shots/APP-P-032-platform-fold.png",
      "tablet": "shots/APP-P-032-platform-tablet.png",
      "web": "shots/APP-P-032-platform-web.png"
     },
     "route": "/cabinet/platform"
    },
    {
     "id": "APP-P-033-owner-overview",
     "title": "Обзор владельца",
     "desc": "KPI платформы и GMV по месяцам — реальные агрегаты, не витринные цифры.",
     "shots": {
      "mobile": "shots/APP-P-033-owner-overview-mobile.png",
      "fold": "shots/APP-P-033-owner-overview-fold.png",
      "tablet": "shots/APP-P-033-owner-overview-tablet.png",
      "web": "shots/APP-P-033-owner-overview-web.png"
     },
     "route": "/cabinet/owner"
    },
    {
     "id": "APP-P-034-owner-finance",
     "title": "Финансы периода",
     "desc": "Разбивка по операциям и сальдо платформы — с честными пометками, что не входит.",
     "shots": {
      "mobile": "shots/APP-P-034-owner-finance-mobile.png",
      "fold": "shots/APP-P-034-owner-finance-fold.png",
      "tablet": "shots/APP-P-034-owner-finance-tablet.png",
      "web": "shots/APP-P-034-owner-finance-web.png"
     },
     "route": "/cabinet/owner/finance"
    },
    {
     "id": "APP-P-035-owner-structure",
     "title": "Точки платформы",
     "desc": "Выручка каждой точки за период — постранично и наглядно.",
     "shots": {
      "mobile": "shots/APP-P-035-owner-structure-mobile.png",
      "fold": "shots/APP-P-035-owner-structure-fold.png",
      "tablet": "shots/APP-P-035-owner-structure-tablet.png",
      "web": "shots/APP-P-035-owner-structure-web.png"
     },
     "route": "/cabinet/owner/structure"
    },
    {
     "id": "APP-P-036-investor-growth",
     "title": "Метрики роста",
     "desc": "GMV, пользователи, точки и средний чек — рост платформы в динамике.",
     "shots": {
      "mobile": "shots/APP-P-036-investor-growth-mobile.png",
      "fold": "shots/APP-P-036-investor-growth-fold.png",
      "tablet": "shots/APP-P-036-investor-growth-tablet.png",
      "web": "shots/APP-P-036-investor-growth-web.png"
     },
     "route": "/cabinet/investor"
    },
    {
     "id": "APP-P-037-investor-points",
     "title": "Топ точек",
     "desc": "Лидеры по выручке за период — на что опирается рост.",
     "shots": {
      "mobile": "shots/APP-P-037-investor-points-mobile.png",
      "fold": "shots/APP-P-037-investor-points-fold.png",
      "tablet": "shots/APP-P-037-investor-points-tablet.png",
      "web": "shots/APP-P-037-investor-points-web.png"
     },
     "route": "/cabinet/investor/points"
    },
    {
     "id": "APP-P-038-investor-money",
     "title": "Доля инвестора",
     "desc": "Сальдо платформы и дивиденды от доли — прозрачная экономика.",
     "shots": {
      "mobile": "shots/APP-P-038-investor-money-mobile.png",
      "fold": "shots/APP-P-038-investor-money-fold.png",
      "tablet": "shots/APP-P-038-investor-money-tablet.png",
      "web": "shots/APP-P-038-investor-money-web.png"
     },
     "route": "/cabinet/investor/money"
    }
   ]
  }
 ]
};
