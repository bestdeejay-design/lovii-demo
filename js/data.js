/**
 * LOVII Витрина — демо-данные (порт seed из Next.js-версии).
 * Москва, центр: торговые точки в шаговой доступности.
 * Скорость пешехода ≈ 80 м/мин — по ней считаем «минуты пешком» (js/geo.js).
 *
 * products[*].avail: [storeSlug, stock, priceDelta]
 *   stock      — остаток в точке (0 = нет в наличии)
 *   priceDelta — на сколько цена в точке отличается от базовой, ₽
 */
const LOVII_DATA = {

  // ---- Районы (позиции пользователя) ----
  districts: [
    { name: 'Тверской',     metro: 'Тверская',       lat: 55.7616, lng: 37.6095 },
    { name: 'Арбат',        metro: 'Арбатская',      lat: 55.7522, lng: 37.5946 },
    { name: 'Китай-город',  metro: 'Кузнецкий Мост', lat: 55.7587, lng: 37.6266 },
    { name: 'Патриаршие',   metro: 'Маяковская',     lat: 55.7638, lng: 37.5920 },
    { name: 'Охотный Ряд',  metro: 'Охотный Ряд',    lat: 55.7570, lng: 37.6150 },
  ],

  // ---- Торговые точки ----
  stores: [
    { slug: 'sloyka',   name: 'Пекарня «Слойка»',      category: 'bakery',     emoji: '🥐', color: 'gold',    rating: 4.8, reviews: 214, address: 'Столешников пер., 7',  lat: 55.7601, lng: 37.6103, hours: '08:00-21:00', about: 'Своя выпечка каждые 3 часа: слойки, круассаны и пироги из печи на дровах. Тесто — на закваске, без маргарина.', tags: ['hit', 'pickup'], isService: false },
    { slug: 'daily',    name: 'Кофейня «Daily»',       category: 'coffee',     emoji: '☕', color: 'pink',    rating: 4.7, reviews: 342, address: 'ул. Тверская, 12',     lat: 55.7620, lng: 37.6080, hours: '08:00-22:00', about: 'Спешелти-кофе на двух эспрессо-станциях. Обжарка по вторникам, альтернатива в воронке и на фильтре.', tags: ['hit', 'pickup'], isService: false },
    { slug: 'flowers',  name: 'Цветы «Fresh»',         category: 'flowers',    emoji: '🌷', color: 'tiffany', rating: 4.9, reviews: 128, address: 'Никитский пер., 5',    lat: 55.7585, lng: 37.5980, hours: '09:00-21:00', about: 'Свежие поставки из Голландии и Эквадора дважды в неделю. Соберём букет при тебе за 10 минут.', tags: ['new', 'delivery'], isService: false },
    { slug: 'miya',     name: 'Суши «Мия»',            category: 'restaurant', emoji: '🍣', color: 'tiffany', rating: 4.6, reviews: 189, address: 'Большая Дмитровка, 15', lat: 55.7614, lng: 37.6165, hours: '11:00-23:00', about: 'Японский шеф, рыба с утра с рынка. Рис на красном уксусе, ножи — японские гарды.', tags: ['delivery'], isService: false },
    { slug: 'forno',    name: 'Пиццерия «Forno»',      category: 'pizza',      emoji: '🍕', color: 'gold',    rating: 4.7, reviews: 256, address: 'Камергерский пер., 3', lat: 55.7597, lng: 37.6136, hours: '10:00-23:00', about: 'Неаполитанская пицца из дровяной печи при 480°C. Тесто вызревает 48 часов, мука Caputo.', tags: ['hit', 'pickup', 'delivery'], isService: false },
    { slug: 'udoma',    name: 'Продукты «У дома»',     category: 'grocery',    emoji: '🥑', color: 'tiffany', rating: 4.5, reviews: 96,  address: 'ул. Тверская, 18',     lat: 55.7627, lng: 37.6069, hours: '09:00-23:00', about: 'Свежие овощи, фермерские молочные и всё к ужину в двух минутах от дома. Соберём заказ к выдаче за 15 минут.', tags: ['pickup', 'delivery'], isService: false },
    { slug: 'grill',    name: 'Бургерная «Гриль»',     category: 'burgers',    emoji: '🍔', color: 'pink',    rating: 4.4, reviews: 173, address: 'Газетный пер., 9',     lat: 55.7592, lng: 37.6118, hours: '11:00-00:00', about: 'Мясо сухой выдержки с фермы в Подмосковье, булочки пекут по утрам. Гриль на настоящих углях.', tags: ['pickup', 'delivery'], isService: false },
    { slug: 'health',   name: 'Аптека «Здоровье»',     category: 'pharmacy',   emoji: '💊', color: 'tiffany', rating: 4.8, reviews: 301, address: 'ул. Тверская, 20/1',   lat: 55.7632, lng: 37.6061, hours: '08:00-22:00', about: 'Круглосуточная справочная, подбор аналогов, заказ редких препаратов с доставкой к вечеру.', tags: ['pickup'], isService: false },
    { slug: 'snejinka', name: 'Химчистка «Снежинка»',  category: 'beauty',     emoji: '🧺', color: 'sand',    rating: 4.6, reviews: 84,  address: 'Брюсов пер., 4',       lat: 55.7607, lng: 37.6014, hours: '10:00-20:00', about: 'Бережная чистка пальто, пуховиков и ковров. Аквачистка на швейцарском оборудовании, гарантия 14 дней.', tags: ['book'], isService: true },
    { slug: 'krasota',  name: 'Салон «Красота»',       category: 'beauty',     emoji: '💅', color: 'pink',    rating: 4.9, reviews: 156, address: 'Столешников пер., 14', lat: 55.7606, lng: 37.6114, hours: '10:00-21:00', about: 'Маникюр, педикюр и уход на японских материалах. Стерилизация в сухожаре, мастер с опытом 8+ лет.', tags: ['hit', 'book'], isService: true },
    { slug: 'igla',     name: 'Ателье «Игла»',         category: 'service',    emoji: '🧵', color: 'sand',    rating: 4.7, reviews: 67,  address: 'Пушечная ул., 6',      lat: 55.7609, lng: 37.6180, hours: '10:00-19:00', about: 'Подгонка по фигуре за один день, ремонт одежды любой сложности. Швейный цех при ателье.', tags: ['book'], isService: true },
    { slug: 'shokolad', name: 'Кондитерская «Шоколад»', category: 'bakery',    emoji: '🍫', color: 'gold',    rating: 4.8, reviews: 198, address: 'Кузнецкий Мост, 10',   lat: 55.7590, lng: 37.6200, hours: '09:00-22:00', about: 'Ручной шоколад бельгийского какао, торты на заказ и десерты daily. Дегустация перед праздниками.', tags: ['new', 'ecofresh'], isService: false },
    { slug: 'derevnya', name: 'Молочная «Деревня»',    category: 'grocery',    emoji: '🥛', color: 'tiffany', rating: 4.6, reviews: 112, address: 'Камергерский пер., 6', lat: 55.7600, lng: 37.6131, hours: '08:00-21:00', about: 'Фермерское молоко, сыры и творог из Подмосковья. Утренний привоз ежедневно к 8:00.', tags: ['eco', 'pickup'], isService: false },
    { slug: 'master',   name: 'Ремонт обуви «Мастер»', category: 'service',    emoji: '👞', color: 'sand',    rating: 4.5, reviews: 59,  address: 'Охотный Ряд, 2',       lat: 55.7574, lng: 37.6172, hours: '09:00-19:00', about: 'Замена набоек за 20 минут, растяжка и реставрация обуви. Работаем с брендовой обувью.', tags: ['book'], isService: true },
  ],

  // ---- Товары и услуги ----
  products: [
    // Пекарня / Кондитерская
    { slug: 'cr-almond', name: 'Круассан с миндалём', description: 'Слоёный круассан на французском масле с миндальным кремом и лепестками миндаля.', emoji: '🥐', category: 'bakery', unit: 'шт', price: 149, badge: 'hit', avail: [['sloyka', 12, 0], ['shokolad', 4, 10], ['daily', 3, 15]] },
    { slug: 'sloyka-cherry', name: 'Слойка с вишней', description: 'Хрустящая слойка с кисло-сладкой вишней без косточек. Присыпана сахарной пудрой.', emoji: '🥧', category: 'bakery', unit: 'шт', price: 89, oldPrice: 129, badge: 'sale', avail: [['sloyka', 8, 0], ['shokolad', 6, 5]] },
    { slug: 'bread-borodino', name: 'Хлеб «Бородинский»', description: 'Тёмный ржаной хлеб на закваске с кориандром. Выпекаем каждое утро.', emoji: '🍞', category: 'bakery', unit: 'шт', price: 95, badge: 'eco', avail: [['sloyka', 15, 0], ['udoma', 10, 0], ['derevnya', 7, 5]] },
    { slug: 'eclear', name: 'Эклер шоколадный', description: 'Классический эклер с заварным кремом и глянцевой шоколадной глазурью.', emoji: '🍩', category: 'bakery', unit: 'шт', price: 129, avail: [['sloyka', 9, 0], ['shokolad', 11, 0]] },
    { slug: 'cake-berry', name: 'Пирог с лесными ягодами', description: 'Песочный пирог с черникой, ежевикой и малиной. 600 г, хватит на всю семью.', emoji: '🍰', category: 'bakery', unit: 'шт', price: 590, badge: 'new', avail: [['shokolad', 5, 0], ['sloyka', 2, 20]] },
    { slug: 'choco-truffle', name: 'Шоколад ручной работы, набор', description: 'Набор из 9 трюфелей: малина, солёная карамель, фисташка. Бельгийское какао 70%.', emoji: '🍫', category: 'bakery', unit: 'набор', price: 890, badge: 'hit', avail: [['shokolad', 14, 0]] },
    // Кофейня
    { slug: 'cappuccino', name: 'Капучино 0,3', description: 'Двойной эспрессо и бархатное молоко. Зерно — Бразилия + Эфиопия, обжарка недели.', emoji: '☕', category: 'coffee', unit: '0,3 л', price: 220, badge: 'hit', avail: [['daily', 99, 0]] },
    { slug: 'latte', name: 'Латте на миндальном', description: 'Мягкий латте на миндальном молоке без лактозы. Можно с сиропом на выбор.', emoji: '🥤', category: 'coffee', unit: '0,3 л', price: 260, avail: [['daily', 99, 0]] },
    { slug: 'cheesecake', name: 'Чизкейк Нью-Йорк', description: 'Плотный сливочный чизкейк на песочной основе, с ягодным соусом.', emoji: '🍰', category: 'coffee', unit: 'шт', price: 340, avail: [['daily', 6, 0], ['shokolad', 3, 20]] },
    { slug: 'filter-ethiopia', name: 'Фильтр-кофе Эфиопия', description: 'Лёгкая воронка: ягодные ноты, жасмин и бергамот. Зерно Guji Uraga.', emoji: '🫖', category: 'coffee', unit: '0,25 л', price: 290, badge: 'new', avail: [['daily', 99, 0]] },
    // Цветы
    { slug: 'roses-ecuador', name: 'Розы эквадорские, 5 шт', description: 'Крупные розы высотой 60 см из свежей поставки. Любой цвет при наличии.', emoji: '🌹', category: 'flowers', unit: 'букет', price: 1490, badge: 'hit', avail: [['flowers', 25, 0]] },
    { slug: 'peony-bouquet', name: 'Монобукет из пионовидных роз', description: 'Пышный монобукет в крафтовой упаковке. Соберём при тебе за 10 минут.', emoji: '💐', category: 'flowers', unit: 'букет', price: 3900, badge: 'new', avail: [['flowers', 8, 0]] },
    { slug: 'spring-mix', name: 'Букет «Весна» микс', description: 'Тюльпаны, ранункулюсы и эустомы в нежной гамме. Отлично на день рождения.', emoji: '🌷', category: 'flowers', unit: 'букет', price: 2200, oldPrice: 2600, badge: 'sale', avail: [['flowers', 12, 0]] },
    // Суши
    { slug: 'philadelphia', name: 'Ролл «Филадельфия»', description: 'Лосось, сыр Филадельфия, авокадо и огурец. 8 кусочков, рыба с утренней поставки.', emoji: '🍣', category: 'restaurant', unit: '8 шт', price: 590, badge: 'hit', avail: [['miya', 30, 0]] },
    { slug: 'california', name: 'Ролл «Калифорния»', description: 'Снежный краб, авокадо, огурец и икра тобико. Классика в кунжуте.', emoji: '🍥', category: 'restaurant', unit: '8 шт', price: 490, avail: [['miya', 25, 0]] },
    { slug: 'set-miya', name: 'Сет «Мия» на двоих', description: 'Филадельфия, Калифорния и запечённый ролл с лососем. 24 кусочка, васаби и гари в комплекте.', emoji: '🍱', category: 'restaurant', unit: '24 шт', price: 1590, oldPrice: 1890, badge: 'sale', avail: [['miya', 10, 0]] },
    // Пицца
    { slug: 'pepperoni', name: 'Пицца «Пепперони»', description: 'Неаполитанское тесто, соус сан-марцано, острая салями и моцарелла фиор-ди-латте. 33 см.', emoji: '🍕', category: 'pizza', unit: '33 см', price: 690, badge: 'hit', avail: [['forno', 20, 0]] },
    { slug: 'margarita', name: 'Пицца «Маргарита»', description: 'Томаты, моцарелла, базилик и оливковое масло. Тесто 48-часовой выдержки.', emoji: '🍕', category: 'pizza', unit: '33 см', price: 590, avail: [['forno', 18, 0]] },
    { slug: 'quattro', name: 'Пицца «4 сыра»', description: 'Горгонзола, пармезан, моцарелла и чеддер с грушей на меду.', emoji: '🧀', category: 'pizza', unit: '33 см', price: 790, badge: 'new', avail: [['forno', 9, 0]] },
    // Продукты
    { slug: 'avocado', name: 'Авокадо Хасс, спелое', description: 'Готово к употреблению сегодня. Проверим мягкость при сборке заказа.', emoji: '🥑', category: 'grocery', unit: 'шт', price: 129, badge: 'hit', avail: [['udoma', 40, 0], ['derevnya', 15, 10]] },
    { slug: 'milk', name: 'Молоко фермерское 2,5%', description: 'Утренний привоз из фермы «Деревня». Пастеризованное, срок 5 суток.', emoji: '🥛', category: 'grocery', unit: '1 л', price: 119, badge: 'eco', avail: [['derevnya', 30, 0], ['udoma', 20, 5]] },
    { slug: 'eggs', name: 'Яйца куриные С0', description: 'Фермерские яйца первой категории, 10 шт. Свободный выгул.', emoji: '🥚', category: 'grocery', unit: '10 шт', price: 139, avail: [['udoma', 25, 0], ['derevnya', 18, 0]] },
    { slug: 'brie', name: 'Сыр «Бри» французский', description: 'Мягкий сыр с белой плесенью, 60% жирности. Кусочек 200 г.', emoji: '🧀', category: 'grocery', unit: '200 г', price: 450, badge: 'new', avail: [['derevnya', 8, 0], ['udoma', 4, 15]] },
    { slug: 'coffee-beans', name: 'Кофе зерновой для дома', description: 'Обжарка под турку и гейзерную кофеварку. Упаковка 250 г с клапаном.', emoji: '🫘', category: 'grocery', unit: '250 г', price: 690, avail: [['daily', 15, 0], ['udoma', 6, 30]] },
    { slug: 'tomatoes', name: 'Томаты «Бакинские»', description: 'Сладкие розовые томаты, идеально в салат. Фермерские.', emoji: '🍅', category: 'grocery', unit: 'кг', price: 349, avail: [['udoma', 20, 0]] },
    // Бургерная
    { slug: 'cheeseburger', name: 'Чизбургер «Гриль»', description: 'Котлета сухой выдержки 150 г, чеддер, огурчики и соус на бриоши.', emoji: '🍔', category: 'burgers', unit: 'шт', price: 390, badge: 'hit', avail: [['grill', 40, 0]] },
    { slug: 'fries', name: 'Картофель фри с трюфелем', description: 'Хрустящий картофель с трюфельным маслом и пармезаном. Большая порция.', emoji: '🍟', category: 'burgers', unit: 'порция', price: 240, avail: [['grill', 35, 0]] },
    { slug: 'lemonade', name: 'Лимонад домашний', description: 'Лимон, мята и тростниковый сахар. Варим сами каждый день, 0,4 л.', emoji: '🍋', category: 'burgers', unit: '0,4 л', price: 190, badge: 'eco', avail: [['grill', 22, 0], ['forno', 10, 10]] },
    // Аптека
    { slug: 'vitc', name: 'Витамин C 1000 мг', description: 'Таблетки шипучие, 20 шт. Поддержка иммунитета в сезон.', emoji: '🍊', category: 'pharmacy', unit: 'уп', price: 320, avail: [['health', 30, 0]] },
    { slug: 'plaster', name: 'Пластыри бактерицидные', description: 'Упаковка 20 шт разных размеров. Водостойкие.', emoji: '🩹', category: 'pharmacy', unit: 'уп', price: 150, avail: [['health', 45, 0]] },
    { slug: 'thermometer', name: 'Термометр инфракрасный', description: 'Бесконтактный, результат за 1 секунду. Память на 32 измерения.', emoji: '🌡️', category: 'pharmacy', unit: 'шт', price: 1890, badge: 'new', avail: [['health', 6, 0]] },
    // Услуги
    { slug: 'haircut', name: 'Стрижка женская', description: 'Стрижка любой сложности с мытьём и укладкой. Мастер с опытом 8+ лет.', emoji: '💇', category: 'beauty', unit: 'услуга', price: 2500, badge: 'hit', isService: true, avail: [['krasota', 5, 0]] },
    { slug: 'manicure', name: 'Маникюр гель-лак', description: 'Аппаратный маникюр, покрытие гель-лаком, стерилизация в сухожаре. 1,5 часа.', emoji: '💅', category: 'beauty', unit: 'услуга', price: 2100, oldPrice: 2600, badge: 'sale', isService: true, avail: [['krasota', 4, 0]] },
    { slug: 'coat-clean', name: 'Химчистка пальто', description: 'Бережная аквачистка пальто любой ткани. Гарантия результата 14 дней, 2–3 дня.', emoji: '🧥', category: 'service', unit: 'услуга', price: 1800, isService: true, avail: [['snejinka', 99, 0]] },
    { slug: 'carpet-clean', name: 'Химчистка ковра', description: 'Глубокая чистка ковра до 6 м² с вывозом и доставкой обратно.', emoji: '🧶', category: 'service', unit: 'услуга', price: 2400, badge: 'new', isService: true, avail: [['snejinka', 99, 0]] },
    { slug: 'trousers-hem', name: 'Подшить брюки', description: 'Примерка, подгонка длины с сохранением фабричного шва. Готово за день.', emoji: '👖', category: 'service', unit: 'услуга', price: 800, isService: true, avail: [['igla', 99, 0]] },
    { slug: 'dress-fit', name: 'Подгонка платья по фигуре', description: 'Ушить по бокам, укоротить, перестроить вытачки. Одна примерка.', emoji: '👗', category: 'service', unit: 'услуга', price: 1500, badge: 'hit', isService: true, avail: [['igla', 99, 0]] },
    { slug: 'heels-fix', name: 'Замена набоек', description: 'Оригинальные набойки из полиуретана за 20 минут при тебе.', emoji: '👞', category: 'service', unit: 'услуга', price: 600, isService: true, avail: [['master', 99, 0]] },
    { slug: 'shoes-shine', name: 'Полная реставрация обуви', description: 'Чистка, покраска, восстановление подошвы и фурнитуры. 2–4 дня.', emoji: '✨', category: 'service', unit: 'услуга', price: 1900, badge: 'eco', isService: true, avail: [['master', 99, 0]] },
  ],

  // ---- Акции ----
  promos: [
    { title: 'Слойка с вишней −30%', desc: 'ежедневно до 20:00', timer: 'до закрытия 2 ч', tag: 'sale', storeSlug: 'sloyka', color: 'gold' },
    { title: 'Пицца 2×1 по выходным', desc: 'при заказе от двух', timer: 'сб–вс', tag: 'sale', storeSlug: 'forno', color: 'pink' },
    { title: '−15% на сеты до полуночи', desc: 'промокод МИЯ15', timer: 'до 23:00', tag: 'sale', storeSlug: 'miya', color: 'tiffany' },
    { title: 'Баллы 1:1 у всех точек', desc: 'кэшбэк баллами с каждого чека', timer: 'всегда', tag: 'loyalty', storeSlug: 'daily', color: 'pink' },
  ],
};

/* ============================================================
   Роли и дашборды (демо-данные).
   Любой пользователь — клиент; роли выдаются через профиль:
   store (точка) / rep (представитель) / amb (амбасадор),
   owner и investor — демо-доступ. Всё моковое, детерминированное:
   графики генерирует PRNG с фиксированным сидом (js/charts.js).
   ============================================================ */
const LOVII_DASH = {

  // Демо-профиль клиента (без авторизации)
  user: { name: 'Александра', avatar: '👩🏻', phone: '+7 926 •••-45-67', points: 1250 },

  // Карточки ролей: заголовок, описание, эмодзи, цвет плитки
  roleMeta: {
    store:    { title: 'Торговая точка', short: 'точку',          desc: 'Своя витрина в приложении',      emoji: '🏪', color: 'pink' },
    rep:      { title: 'Представитель',  short: 'представителя',  desc: 'Точки района на связи',          emoji: '🤝', color: 'tiffany' },
    amb:      { title: 'Амбасадор',      short: 'амбасадора',     desc: 'Структура представителей',       emoji: '🚀', color: 'gold' },
    msp:      { title: 'ЛОВИ Бизнес',    short: 'МСП',            desc: 'Заказы, товары и счёт точки',    emoji: '☕', color: 'tiffany' },
    owner:    { title: 'Владелец',       short: 'владельца',      desc: 'Платформа целиком',              emoji: '👑', color: 'sand' },
    investor: { title: 'Инвестор',       short: 'инвестора',      desc: 'Рост и доходность',              emoji: '📈', color: 'tiffany' },
  },

  // ---- Представитель: подключённые точки (статусы: active / waiting / offline) ----
  repPoints: [
    { slug: 'daily',   status: 'active',  revenueWeek: 242800, orders: 341, views: 2540 },
    { slug: 'sloyka',  status: 'active',  revenueWeek: 186400, orders: 214, views: 1980 },
    { slug: 'flowers', status: 'active',  revenueWeek: 158300, orders: 96,  views: 1210 },
    { slug: 'master',  status: 'offline', revenueWeek: 42300,  orders: 51,  views: 640 },
    { slug: 'forno',   status: 'waiting', revenueWeek: 0,      orders: 0,   views: 0 },
  ],

  // ---- Амбасадор: представители и их точки ----
  ambReps: [
    { id: 'rep1', name: 'Марат С.',   city: 'Тверской',     points: ['sloyka', 'daily', 'shokolad'], revenueWeek: 412300, growth: 12 },
    { id: 'rep2', name: 'Ольга В.',   city: 'Арбат',        points: ['flowers', 'forno'],            revenueWeek: 265900, growth: 8 },
    { id: 'rep3', name: 'Дмитрий К.', city: 'Китай-город',  points: ['udoma', 'derevnya', 'grill'],  revenueWeek: 189500, growth: -3 },
  ],

  // ---- Владелец: дерево амбасадоров (структура платформы) ----
  ambassadors: [
    { name: 'Марат С.',  city: 'Тверской',    reps: [ { name: 'Ольга В.',  points: 3, rev: 412300 }, { name: 'Игорь Д.', points: 2, rev: 265900 } ] },
    { name: 'Нина Л.',   city: 'Арбат',       reps: [ { name: 'Пётр А.',   points: 4, rev: 510200 }, { name: 'Ева К.',   points: 2, rev: 188400 }, { name: 'Роман Т.', points: 1, rev: 94600 } ] },
    { name: 'Сергей М.', city: 'Китай-город', reps: [ { name: 'Дина Ф.',   points: 3, rev: 377500 } ] },
  ],

  // Финансы платформы (в месяц, поверх GMV)
  finance: { commissionRate: 0.1, repPayoutRate: 0.04, opexMonth: 420000, capexTotal: 2400000, subPerPoint: 5000 },

  // ---- Инвестор: динамика по месяцам (12 месяцев + прогноз на 3) ----
  investor: {
    monthLabels: ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'],
    users:  [2400, 2900, 3700, 4600, 5800, 7200, 8900, 10800, 13100, 15600, 18300, 21400],
    points: [18, 22, 27, 34, 41, 49, 57, 65, 72, 80, 88, 96],
    gmv:    [890, 1050, 1280, 1560, 1890, 2270, 2690, 3130, 3560, 3960, 4300, 4620], // тыс ₽
    forecastGmv: [5150, 5720, 6360],   // тыс ₽, пунктир
    forecastUsers: [24800, 28600, 32900],
    forecastPoints: [105, 114, 122],
    avgCheck: 890, conversion: 6.8,
    categories: [
      { label: 'Выпечка и кофе', share: 27 },
      { label: 'Продукты',       share: 19 },
      { label: 'Суши и пицца',   share: 16 },
      { label: 'Бургеры',        share: 11 },
      { label: 'Цветы',          share: 10 },
      { label: 'Красота',        share: 9 },
      { label: 'Услуги',         share: 8 },
    ],
    topProducts: ['cr-almond', 'cappuccino', 'philadelphia', 'cheeseburger', 'roses-ecuador'],
  },

  // ---- Товары новой точки по умолчанию (после заявки «Стать точкой») ----
  storeGoodsSeed: [
    { slug: 'g-croissant', name: 'Круассан классический', emoji: '🥐', price: 129, unit: 'шт', stock: 18 },
    { slug: 'g-cappuccino', name: 'Капучино 0,3',         emoji: '☕', price: 199, unit: '0,3 л', stock: 99 },
    { slug: 'g-bowl', name: 'Боул с гранолой',            emoji: '🥣', price: 320, unit: 'шт', stock: 9 },
    { slug: 'g-juice', name: 'Свежевыжатый сок',          emoji: '🧃', price: 260, unit: '0,4 л', stock: 14 },
    { slug: 'g-sandwich', name: 'Сэндвич с лососем',      emoji: '🥪', price: 390, unit: 'шт', stock: 6 },
    { slug: 'g-berry', name: 'Пирог с ягодами',           emoji: '🍰', price: 540, unit: 'шт', stock: 4 },
  ],

  // ---- Чаты: сиды сообщений ----
  chatSeeds: {
    'p-daily':   { unread: 2, msgs: [ ['sys', 'Новый заказ: Капучино ×2 · 440 ₽'], ['them', 'Добрый день! Обжарка пришла, всё выкладываем 👌'], ['sys', 'Новый заказ: Чизкейк Нью-Йорк · 340 ₽'] ] },
    'p-sloyka':  { unread: 0, msgs: [ ['them', 'Слоек с вишней испекли партию к 12:00'], ['me', 'Отлично, добавьте акцию на вечер'], ['them', 'Сделано, витрина обновится сама'] ] },
    'p-flowers': { unread: 1, msgs: [ ['them', 'Пионы приехали, ставим в витрину 💐'] ] },
    'p-master':  { unread: 0, msgs: [ ['sys', 'Точка offline — нет связи с кассой'] ] },
    'p-forno':   { unread: 0, msgs: [ ['sys', 'Заявка на подключение отправлена'] ] },
    'r-rep1':    { unread: 1, msgs: [ ['them', 'Отчёт за неделю отправил, выручка +12%'] ] },
    'r-rep2':    { unread: 0, msgs: [ ['me', 'Как подключение «Forno»?'], ['them', 'Документы подписали, ждём модерацию'] ] },
    'r-rep3':    { unread: 2, msgs: [ ['them', 'У «Гриль» упала выручка, нужна помощь с акцией'], ['sys', 'Новый представитель в структуре: точка «Деревня»'] ] },
    'group':     { unread: 3, msgs: [ ['sys', 'Групповой чат всех представителей'], ['them', 'Коллеги, с 1-го числа новая комиссия 10%'], ['them', 'Спасибо, предупредили точки 🙌'] ] },
  },

  // Автоответы в чатах (демо)
  cannedReplies: [
    'Принял, сделаем к вечеру 💪',
    'Спасибо! Посмотрим и вернёмся с ответом',
    'Уже исправляем — будет готово сегодня',
    'Отлично, тогда ждём поставку',
    'Готово! Загляни в витрину ✅',
    'Понял тебя, договорились',
  ],
};

/* ============================================================
   LOVII PAY — сид данных профиля лояльности
   ------------------------------------------------------------
   Терминология (канон владельца, 2026-09):
   • Платформа  — «Лови» (LOVII)
   • Программа  — LOVII PAY: карта + счёт + баланс. Никаких
                  «клубов» и «карты жителя» — только LOVII PAY.
   • Уровни     — LOVII PAY (база) → LOVII PASS (действующая
                  подписка) → LOVII VIP (оборот от 300 000 ₽).
                  Привилегии — мерч, мероприятия и спец-скидки
                  у МСП (НЕ повышенный кэшбек).
   • 1 балл = 1 ₽, баллы не сгорают, вывод через СБП (canon VISION.md)
   ============================================================ */
const LOVII_PAY_SEED = {

  // ---- Карта LOVII PAY ----
  // Номер по стандарту Visa/Мир: 16 цифр, группировка 4-4-4-4, Лун.
  // Префикс 9643 — по спецификации стандартов номеров карт лояльности:
  //   9    — MII (национальная система, ISO/IEC 7812);
  //   643  — код страны (Россия, ISO 3166-1);
  //   9138 — код эмитента (демо);
  //   4210775 — номер участника в пуле эмитента;
  //   5    — контрольная цифра (алгоритм Луна).
  // Задача генерации номеров готовится отдельно — меняем только эти поля.
  card: {
    bin: '9643 9138',            // ← префикс: 9 + 643 + код эмитента
    tail: '4210 7755',           // ← номер участника + контрольная цифра (Лун: OK)
    holder: 'ALEXANDRA LOVII',   // латиницей — как на платёжных картах
  },

  // ---- Счёт (составляющая LOVII PAY) ----
  account: {
    balance: 1250,        // ₽ — совпадает с баллами профиля (1 балл = 1 ₽)
    monthEarned: 323,     // начислено за месяц, ₽
    monthPurchases: 14,   // покупок по карте за месяц, шт
    withdrawnTotal: 3400, // выведено через СБП за всё время, ₽
  },

  // ---- Уровни программы LOVII PAY ----
  // pay  — базовый уровень, есть у всех;
  // pass — по действующей подписке Лови (bySub, бинарное условие);
  // vip  — по обороту по карте: владелец (2026-09-12) — «базовый
  //        оборот для VIP не менее 300 000 ₽». Период оборота
  //        (месяц / год / накопленный) — вопрос владельца, беклог
  //        lovii_docs/canon/BACKLOG.md §6.
  tiers: [
    { id: 'pay',  name: 'LOVII PAY',  need: 0,     bySub: false, cond: 'базовый уровень',
      perks: ['Кэшбек баллами 1:1', 'Оплата QR у партнёров', 'Вывод через СБП'] },
    { id: 'pass', name: 'LOVII PASS', need: 0,     bySub: true,  cond: 'по подписке Лови',
      perks: ['Мерч Лови', 'Закрытые мероприятия', 'Спец-скидки у МСП'] },
    { id: 'vip',  name: 'LOVII VIP',  need: 300000, bySub: false, cond: 'оборот от 300 000 ₽',
      perks: ['Лимитированный мерч', 'Приоритет в мероприятиях', 'Персональные скидки у МСП', 'Ранний доступ к новинкам'] },
  ],
  currentTier: 'pass',
  subscribed: true,     // действующая подписка Лови (условие LOVII PASS)
  monthTurnover: 118400, // оборот по карте, ₽ (прогресс до LOVII VIP: ~39% от 300 000)

  // ---- Витрина привилегий (мерч · мероприятия · спец-скидки у МСП) ----
  privileges: [
    { icon: 'gift',      title: 'Мерч Лови',              sub: 'Эксклюзивные дропы для PASS и VIP', tone: 'pink' },
    { icon: 'ticket',    title: 'Закрытые мероприятия',   sub: 'Вечера района для своих', tone: 'gold' },
    { icon: 'percent',   title: 'Спец-скидки у МСП',      sub: 'Свой процент у партнёров района', tone: 'tiffany' },
    { icon: 'clock',     title: 'Приоритетная запись',    sub: 'Без очереди у 14 точек', tone: 'tiffany' },
    { icon: 'sparkles',  title: 'Ранний доступ',          sub: 'Новинки и акции на 24 часа раньше', tone: 'gold' },
  ],

  // ---- История операций: kind = in (начисление) | buy (покупка) | out (списание) ----
  txSeed: [
    { d: 0,  kind: 'in',   title: 'Кэшбек · Пекарня «Слойка»',   sum: 38,   note: 'Слойка с вишней, 2 шт' },
    { d: 0,  kind: 'buy',  title: 'Кофейня «Daily»',             sum: -440, note: 'Капучино ×2 · оплата QR' },
    { d: 1,  kind: 'in',   title: 'Бонус «Приведи друга»',       sum: 200,  note: 'Марат по твоей ссылке' },
    { d: 1,  kind: 'out',  title: 'Оплата баллами · Цветы «Fresh»', sum: -250, note: 'Списано 250 баллов' },
    { d: 1,  kind: 'buy',  title: 'Суши «Мия»',                  sum: -1590, note: 'Сет «Мия» на двоих' },
    { d: 2,  kind: 'in',   title: 'Кэшбек · Кофейня «Daily»',    sum: 64,   note: 'Фильтр-кофе и чизкейк' },
    { d: 3,  kind: 'out',  title: 'Вывод через СБП',             sum: -500, note: 'Счёт •• 4567 · зачислено' },
    { d: 4,  kind: 'buy',  title: 'Салон «Красота»',             sum: -2100, note: 'Маникюр · запись 12:00' },
    { d: 5,  kind: 'in',   title: 'Кэшбек · Пиццерия «Forno»',   sum: 95,   note: 'Пицца 33 см' },
    { d: 6,  kind: 'buy',  title: 'Продукты «У дома»',           sum: -860, note: 'Заказ к выдаче' },
    { d: 8,  kind: 'out',  title: 'Оплата баллами · Химчистка «Снежинка»', sum: -1200, note: 'Списано 1 200 баллов' },
    { d: 9,  kind: 'in',   title: 'Кэшбек за неделю',            sum: 126,  note: '4 партнёра района' },
  ],

  // ---- Избранные МСП (slug из LOVII_DATA.stores) ----
  mspFavSeed: ['sloyka', 'daily', 'flowers', 'krasota'],
};

/**
 * LOVII_CAB — сид редизайна кабинетов (2026-09-14, cabinets.js).
 * repPromo — канон BRD §3.1: PP + 4 символа (алфавит 33), перепривязок нет.
 * repSub — гейт подписки представителя (SZ-042): доля 40% действует,
 * пока активна подписка 599/199 ₽; истекла → доля уходит Компании.
 * legals/branches — мульти-юрлица (msp-ds-multibranch §B): юрлицо → филиалы.
 * orders — статус-машина Task 20: самовывоз и доставка, отмена с причиной.
 */
const LOVII_CAB = {
  repPromo: 'PPK7Q2',

  repSub: {
    plan: 'Лови PASS',
    price: '599 ₽/мес',
    until: '12 октября 2026',
    days: 28,
  },

  // МСП: юрлица и филиалы (контекст-свитчер кабинета)
  legals: [
    {
      id: 'l1', name: 'ИП Смирнова А. А.', inn: '7801234567',
      branches: [
        { id: 'b1', name: 'Кофейня «У дома»', address: 'ул. Тверская, 12', emoji: '☕' },
        { id: 'b2', name: 'Кофейня «У дома» · Патриаршие', address: 'Малая Бронная, 4', emoji: '☕' },
      ],
    },
    {
      id: 'l2', name: 'ООО «Свежесть»', inn: '7704455661',
      branches: [
        { id: 'b3', name: 'Гастробар «Свежесть»', address: 'Столешников пер., 7', emoji: '🥗' },
      ],
    },
  ],

  // Оборот за месяц и средний чек по филиалам (демо-числа)
  branchStats: {
    b1: { revenueMonth: 214300, avgCheck: 540 },
    b2: { revenueMonth: 96400, avgCheck: 610 },
    b3: { revenueMonth: 143200, avgCheck: 820 },
    lead: { revenueMonth: 42800, avgCheck: 470 },
  },

  // Товары: branch 'all' = «во всех филиалах» (SZ-013)
  products: [
    { slug: 'p-coffee', name: 'Кофе с собой', emoji: '☕', price: 190, unit: 'шт', stock: 40, branch: 'all' },
    { slug: 'p-croiss', name: 'Круассан классический', emoji: '🥐', price: 140, unit: 'шт', stock: 12, branch: 'all' },
    { slug: 'p-beans', name: 'Флэт уайт, зерно 250 г', emoji: '🫘', price: 890, unit: 'уп', stock: 7, branch: 'b1' },
    { slug: 'p-cheese', name: 'Чизкейк Нью-Йорк', emoji: '🍰', price: 380, unit: 'шт', stock: 5, branch: 'b2' },
    { slug: 'p-sandw', name: 'Сэндвич с индейкой', emoji: '🥪', price: 320, unit: 'шт', stock: 9, branch: 'all' },
    { slug: 'p-lemon', name: 'Лимонад домашний', emoji: '🍋', price: 190, unit: 'шт', stock: 16, branch: 'b3' },
  ],

  // Заказы: statuses new/accepted/preparing/ready/handed_to_delivery/on_the_way/completed/cancelled
  orders: [
    { id: 'L-7421', branch: 'b1', delivery: 'pickup', status: 'new', customer: 'Мария', ts: 'сегодня · 14:05', total: 590, comment: 'Кофе без сахара', items: [ { name: 'Флэт уайт', emoji: '☕', qty: 2, price: 190 }, { name: 'Круассан классический', emoji: '🥐', qty: 1, price: 140 } ] },
    { id: 'L-7420', branch: 'b1', delivery: 'delivery', status: 'new', customer: 'Дмитрий', ts: 'сегодня · 13:58', total: 780, items: [ { name: 'Кофе с собой', emoji: '☕', qty: 1, price: 190 }, { name: 'Сэндвич с индейкой', emoji: '🥪', qty: 2, price: 320 } ] },
    { id: 'L-7418', branch: 'b2', delivery: 'pickup', status: 'preparing', customer: 'Анна', ts: 'сегодня · 13:40', total: 520, items: [ { name: 'Чизкейк Нью-Йорк', emoji: '🍰', qty: 1, price: 380 }, { name: 'Кофе с собой', emoji: '☕', qty: 1, price: 190 } ] },
    { id: 'L-7415', branch: 'b3', delivery: 'delivery', status: 'ready', customer: 'Игорь', ts: 'сегодня · 12:55', total: 380, items: [ { name: 'Лимонад домашний', emoji: '🍋', qty: 2, price: 190 } ] },
    { id: 'L-7411', branch: 'b1', delivery: 'delivery', status: 'handed_to_delivery', customer: 'Ольга', ts: 'сегодня · 12:20', total: 1140, items: [ { name: 'Флэт уайт', emoji: '☕', qty: 3, price: 190 }, { name: 'Круассан классический', emoji: '🥐', qty: 4, price: 140 } ] },
    { id: 'L-7402', branch: 'b2', delivery: 'pickup', status: 'completed', customer: 'Сергей', ts: 'сегодня · 11:35', total: 760, items: [ { name: 'Чизкейк Нью-Йорк', emoji: '🍰', qty: 2, price: 380 } ] },
    { id: 'L-7399', branch: 'b3', delivery: 'pickup', status: 'completed', customer: 'Нина', ts: 'вчера · 19:12', total: 510, items: [ { name: 'Сэндвич с индейкой', emoji: '🥪', qty: 1, price: 320 }, { name: 'Лимонад домашний', emoji: '🍋', qty: 1, price: 190 } ] },
    { id: 'L-7391', branch: 'b1', delivery: 'pickup', status: 'cancelled', customer: 'Гость', ts: 'вчера · 18:04', total: 420, cancelReason: 'Клиент отменил — не успевал к закрытию', items: [ { name: 'Круассан классический', emoji: '🥐', qty: 3, price: 140 } ] },
    { id: 'L-7387', branch: 'b2', delivery: 'delivery', status: 'completed', customer: 'Павел', ts: 'вчера · 17:30', total: 930, items: [ { name: 'Чизкейк Нью-Йорк', emoji: '🍰', qty: 1, price: 380 }, { name: 'Кофе с собой', emoji: '☕', qty: 2, price: 190 }, { name: 'Сэндвич с индейкой', emoji: '🥪', qty: 1, price: 320 } ] },
  ],
};
