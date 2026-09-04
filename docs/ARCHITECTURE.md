# Architecture — LOVII Demo

> **Status:** Draft (awaiting approval)  
> **Based on:** Screen Map (approved)

---

## 1. File Structure

```
lovii_demo/
├── index.html              # Entry point: base layout + SVG sprite
├── css/
│   └── demo.css            # All styles (design tokens, components, screens)
├── js/
│   ├── demo.js             # Router, state (role/theme), app init
│   ├── data.js             # Mock data: stores, products, orders, users
│   ├── components.js       # Pure functions: card(), button(), chip(), etc.
│   └── screens/
│       ├── home.js         # ♥ Главная (context block per role)
│       ├── search.js       # 🔍 Поиск
│       ├── orders.js       # 📦 Заказы
│       ├── profile.js      # 👤 Профиль + выбор роли
│       ├── partner/        # 🏪 Партнёр (4 экрана)
│       │   ├── dashboard.js
│       │   ├── products.js
│       │   ├── p-orders.js
│       │   └── reports.js
│       ├── rep/            # 🏙️ Представитель (4 экрана)
│       │   ├── dashboard.js
│       │   ├── points.js
│       │   ├── income.js
│       │   └── rep-profile.js
│       └── ambassador/     # 🤝 Амбасадор (4 экрана)
│           ├── dashboard.js
│           ├── reps.js
│           ├── a-income.js
│           └── training.js
├── assets/
│   ├── lovii-icon.svg
│   ├── lovii-logo-black.svg
│   └── lovii-logo-light.svg
├── .omo/
│   ├── SCREEN_MAP.md
│   └── ARCHITECTURE.md
├── CNAME
├── PRD_DEMO.md
├── PROJECT_CONTEXT.md
├── UIUX_BEST_PRACTICES.md
└── COMPETITOR_ANALYSIS.md
```

**17 JS-файлов экранов** — каждый рендерит HTML в контентную область.

---

## 2. Router (hash-based SPA)

**Принцип:** хеш в URL определяет, какой экран показать.

```
#home           → Главная (контекст под роль)
#search         → Поиск
#orders         → Заказы
#profile        → Профиль + выбор роли

#partner        → Дашборд партнёра
#partner/products
#partner/orders
#partner/reports

#rep            → Дашборд представителя
#rep/points
#rep/income
#rep/profile

#ambassador     → Дашборд амбасадора
#ambassador/reps
#ambassador/income
#ambassador/training
```

**Логика роутера:**
```js
function router() {
  const hash = location.hash.slice(1) || 'home'
  const [role, ...rest] = hash.split('/')
  // 1. Определить, какой экран показать
  // 2. Вызвать функцию-screen(hash)
  // 3. Обновить активный таб Bottom Nav
  // 4. Обновить контентную область
}
```

**hashchange** — единственный слушатель.

---

## 3. State

Глобальный объект `LOVII`:

```js
window.LOVII = {
  state: {
    role: 'client',       // 'client' | 'partner' | 'rep' | 'ambassador'
    theme: 'light',       // 'light' | 'dark'
    user: { name, phone }
  },
  setRole(role) { ... },  // сохраняет в localStorage
  setTheme(theme) { ... }
}
```

---

## 4. Base Layout (index.html)

index.html — минимальный каркас:

```html
<body>
  <div id="app">
    <!-- Header (sticky) -->
    <header id="app-header">
      <img class="logo">
      <div class="actions">bell + avatar</div>
    </header>

    <!-- Location bar -->
    <div id="app-location">📍 Москва</div>

    <!-- Content (меняется) -->
    <main id="app-content"></main>

    <!-- Bottom Nav (всегда) -->
    <nav id="app-nav">
      4 таба: Главная, Поиск, Заказы, Профиль
    </nav>
  </div>

  <!-- SVG sprite -->
  <svg style="display:none">...</svg>

  <!-- Скрипты (без сборки, простые теги) -->
  <script src="js/data.js"></script>
  <script src="js/components.js"></script>
  <script src="js/screens/home.js"></script>
  <script src="js/screens/search.js"></script>
  ...
  <script src="js/demo.js"></script>
</body>
```

---

## 5. Screen Function Pattern

Каждый экран — чистая функция, возвращающая HTML:

```js
function screenHome() {
  const role = LOVII.state.role
  const html = `
    <div class="home-page">
      ${role === 'client' ? clientHomeBlock() : ''}
      ${role === 'partner' ? partnerHomeBlock() : ''}
      ...
    </div>
  `
  document.getElementById('app-content').innerHTML = html
  updateNav('home')
}
```

---

## 6. Components (components.js)

Переиспользуемые функции-строители:

```js
function Card(content, opts = {}) {
  return `<div class="card" style="${opts.style || ''}">${content}</div>`
}
function Button(label, opts = {}) {
  return `<button class="btn ${opts.kind || ''}">${label}</button>`
}
function StatusTag(text, color) { ... }
function OrderRow(data) { ... }
function MetricCard(value, label, color) { ... }
function ProgressBar(current, target) { ... }
```

**Каждый компонент = одна CSS-функция.**  
Никаких классов, только функции, возвращающие строку HTML.

---

## 7. Mock Data (data.js)

```js
const MOCK = {
  stores: [
    { id: 1, name: 'Пекарня #23', category: 'bakery', rating: 4.8, orders: 45, revenue: 54000 }
  ],
  orders: [
    { id: 312, store: 'Пекарня #23', amount: 1200, status: 'preparing', items: [...] }
  ],
  products: [
    { id: 1, storeId: 1, name: 'Круассан', price: 190, active: true }
  ],
  user: {
    name: 'Александра',
    phone: '+7 (999) 123-45-67',
    bonusBalance: 1250,
    role: 'client'
  }
}
```

---

## 8. Принципы

1. **Zero сборки** — чистый HTML/CSS/JS, GitHub Pages-ready
2. **Каждый экран = отдельный файл** — легко найти, править, добавлять
3. **state → router → screen → render** — однонаправленный поток
4. **Дизайн-система = CSS-переменные** — единый источник правды
5. **Никаких библиотек** — vanilla JS, своя реализация
6. **Rоли переключаются только через Профиль**

---

**Далее:** после утверждения — создаю файловую структуру и реплейс index.html на каркас с роутером.
