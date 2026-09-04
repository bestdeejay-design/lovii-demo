# LOVII Design System

> **Version:** 1.0  
> **Status:** Draft  
> **Theme:** Light (primary), Dark (alternative)  
> **Brand accents:** Pink `#f64a8a` · Tiffany `#0ABAB5` · Lemon Chiffon `#F5E6CC`  
> **Reference apps:** Glovo, Grab, Rappi Partners, Яндекс Go, Gojek, Bolt Food

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Grid](#5-spacing--grid)
6. [Elevation & Shadows](#6-elevation--shadows)
7. [Border Radius](#7-border-radius)
8. [Iconography](#8-iconography)
9. [Components](#9-components)
10. [Patterns](#10-patterns)
11. [Screen Templates by Role](#11-screen-templates-by-role)
12. [Dark Theme](#12-dark-theme)
13. [Accessibility](#13-accessibility)
14. [Performance](#14-performance)

---

## 1. Design Principles

| # | Principle | Meaning |
|---|-----------|---------|
| 1 | **Local first** | Каждый элемент говорит: «этот сервис про мой город, мой район, мой магазин» |
| 2 | **Тепло и доверие** | Chiffon-фоны, скругления, мягкие тени — интерфейс не давит, а приглашает |
| 3 | **Три акцента — одна система** | Розовый (энергия), Тиффани (спокойствие), Шифон (тепло). Никаких случайных цветов |
| 4 | **Показать, не рассказать** | Визуальные сценарии вместо списков. Smart feed, контекстные виджеты |
| 5 | **Роль определяет экран** | Клиент, партнёр, представитель, амбасадор — каждый видит только свой инструментарий |
| 6 | **Mobile first** | 375px → 768px → 1440px. Touch-ориентированные интерфейсы |

---

## 2. Brand Identity

### 2.1. Logo

- **Full logo:** `assets/lovii-logo-light.svg` (light bg) / `assets/lovii-logo-black.svg` (dark bg)
- **Icon:** `assets/lovii-icon.svg`
- **Minimum clear space:** height of the letter "Л" around all sides
- **Do not:** stretch, rotate, apply filters, change colors

### 2.2. Brand Icon

The **О with heart** (`cls-6 fill: #f64a8a`) is the primary brand icon element. Used as:

| Usage | Where |
|-------|-------|
| Home tab icon | Bottom navigation — always |
| Loading splash | App launch (future) |
| Empty states | As visual anchor |
| Favicon | Browser tab |

### 2.3. Brand Voice

| Attribute | Expression |
|-----------|-----------|
| Tone | Warm, confident, local |
| Language | Russian (interface), English (code) |
| Pronouns | Ты (informal, friendly) |
| Character | "Свой сервис для своего района" |

---

## 3. Color System

### 3.1. Brand Palette

```
  Pink     #f64a8a   ████████  — основной акцент, энергия
  Tiffany  #0ABAB5   ████████  — вторичный, спокойствие, доверие
  Chiffon  #F5E6CC   ████████  — тёплый фон, бордеры, сэнд
  Sand     #E8D5B7   ████████  — более тёмный шифон для контраста
```

### 3.2. Light Theme

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#FFFFFF` | Основной фон страницы |
| `--surface` | `#FFFFFF` | Карточки, модалки |
| `--surface-secondary` | `#F8F8F8` | Вторичные поверхности (едва отличимый от white) |
| `--border` | `#EEEEEE` | Бордеры карточек, разделители (тонкий серый) |
| `--border-strong` | `#DDDDDD` | Более заметные бордеры |
| `--text-primary` | `#1A1A1A` | Основной текст |
| `--text-secondary` | `#888888` | Подписи, мета-информация |
| `--text-dim` | `#BBBBBB` | Самый бледный текст (плейсхолдеры) |
| `--accent-pink` | `#f64a8a` | Активные состояния, CTA, бейджи |
| `--accent-pink-light` | `rgba(246,74,138,0.12)` | Фон для pink-элементов |
| `--accent-pink-mid` | `rgba(246,74,138,0.06)` | Очень лёгкий розовый фон |
| `--accent-tiffany` | `#0ABAB5` | Вторичные кнопки, ссылки, info |
| `--accent-tiffany-light` | `rgba(10,186,181,0.1)` | Фон для tiffany-элементов |
| `--accent-chiffon` | `#F5E6CC` | **Тёплый акцент** — используется точечно (например, иконка chiffon-обёртки) |
| `--success` | `#34D399` | Зелёный — успех, готово |
| `--success-light` | `rgba(52,211,153,0.12)` | Фон success |
| `--warning` | `#FBBF24` | Жёлтый — внимание |
| `--warning-light` | `rgba(251,191,36,0.12)` | Фон warning |
| `--danger` | `#EF4444` | Красный — ошибка, отмена |
| `--danger-light` | `rgba(239,68,68,0.12)` | Фон danger |

### 3.3. Dark Theme

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#FFFFFF` | `#0A0A0C` |
| `--surface` | `#FFFFFF` | `#1C1C1E` |
| `--surface-secondary` | `#FAF9F7` | `#151517` |
| `--border` | `#F5E6CC` | `#2A2A2C` |
| `--border-strong` | `#E8D5B7` | `#3A3A3C` |
| `--text-primary` | `#1A1A1A` | `#FFFFFF` |
| `--text-secondary` | `#888888` | `#888888` |
| `--text-dim` | `#BBBBBB` | `#555555` |

Accent colours remain the same in both themes. Only backgrounds and text change.

### 3.4. Color Usage Rules

| Element | Rule |
|---------|------|
| **CTA / primary button** | Pink `--accent-pink` |
| **Secondary action** | Tiffany `--accent-tiffany` |
| **Decorative accent** | Chiffon `--accent-chiffon` (иконки, мелкие акценты) |
| **Active tab** | Pink text + pink stroke |
| **Inactive tab** | `--text-dim` |
| **Status: готовится** | Pink tag |
| **Status: в пути** | Tiffany tag |
| **Status: готово** | Success tag |
| **Status: отменён** | Danger tag |
| **Link** | Tiffany, no underline |
| **Error state** | Danger border + message |

### 3.5. 60-30-10 Distribution

| Proportion | Where | Color |
|------------|-------|-------|
| 60% — Background | Page bg, large areas | White / `#0A0A0C` |
| 30% — Surface | Cards, sheets, sections | White / `#1C1C1E` + `#EEEEEE` borders |
| 10% — Accent | CTAs, active states, badges, decorative touches | Pink + Tiffany + Chiffon (точечно) |

---

## 4. Typography

### 4.1. Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 4.2. Type Scale

| Name | Size | Weight | Line Height | Letter-spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| Hero | 28px | 700 | 1.2 | −0.5px | Screen title (rare) |
| H1 | 22px | 700 | 1.25 | −0.3px | Section headers |
| H2 | 18px | 600 | 1.3 | 0 | Card titles |
| H3 | 16px | 600 | 1.35 | 0 | Subheaders |
| Body | 15px | 400 | 1.5 | 0 | Main text |
| Body small | 13px | 500 | 1.4 | 0 | Card body, prices |
| Caption | 12px | 500 | 1.4 | 0 | Labels, tags |
| Caption uppercase | 11px | 600 | 1.3 | 0.5px | Section titles (all caps) |
| Micro | 10px | 500 | 1.3 | 0 | Tab labels, badges |
| Micro bold | 9px | 700 | 1.2 | 0 | Status tags, count badges |

### 4.3. Font Weights

| Weight | Usage |
|--------|-------|
| 400 | Body text |
| 500 | Body text (emphasis), captions |
| 600 | H2, H3, active nav labels |
| 700 | H1, Hero, bold prices, amounts |

### 4.4. Type Rules

- No text smaller than 9px (accessibility)
- All caps only for section titles (caption uppercase)
- Prices always use ruble sign `₽`
- Numbers in amounts: Inter — tabular figures for alignment
- Line-height never below 1.2 for headings, 1.4 for body

---

## 5. Spacing & Grid

### 5.1. Baseline Grid

```
4px  — 1× (icon spacing, micro adjustments)
8px  — 2× (tight padding, chip gaps)
12px — 3× (card inner padding, button padding)
16px — 4× (page margins, card padding)
20px — 5× (section gaps)
24px — 6× (between sections, modal padding)
32px — 8× (screen top padding, large gaps)
48px — 12× (between major blocks)
```

### 5.2. Mobile Grid (375px–428px)

| Property | Value |
|----------|-------|
| Columns | 4 |
| Gutter | 8px |
| Margin | 16px |
| Max content width | 343px (4 cols × 77px + 3 × 8px) |

### 5.3. Tablet Grid (768px–1024px)

| Property | Value |
|----------|-------|
| Columns | 8 |
| Gutter | 12px |
| Margin | 32px |

### 5.4. Desktop Grid (1440px+)

| Property | Value |
|----------|-------|
| Columns | 12 |
| Gutter | 16px |
| Margin | auto (max 1200px) |
| Phone mockup | 393×852px in 40px border-radius frame |

### 5.5. Layout Rules

- **Bottom navigation:** always at bottom, 4 tabs max on phone
- **Header:** sticky, 48px height (including safe area)
- **Cards in grid:** equal height, use flexbox
- **Horizontal scroll:** hide scrollbar (iOS style), snap to item
- **Section spacing:** 24px between sections on main screen

---

## 6. Elevation & Shadows

### 6.1. Elevation Scale

| Level | Light Theme | Dark Theme |
|-------|-------------|------------|
| 0 — Flat | No shadow | No shadow |
| 1 — Card | `0 1px 3px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.3)` |
| 2 — Raised | `0 2px 8px rgba(0,0,0,0.06)` | `0 2px 8px rgba(0,0,0,0.4)` |
| 3 — Modal | `0 8px 32px rgba(0,0,0,0.1)` | `0 8px 32px rgba(0,0,0,0.5)` |
| 4 — Top | `0 12px 40px rgba(0,0,0,0.12)` | `0 12px 40px rgba(0,0,0,0.6)` |

Usage:
- **Level 1:** all cards in grids, order rows
- **Level 2:** promo banners, floating buttons, hover state
- **Level 3:** bottom sheets, modals, dropdowns
- **Level 4:** full-screen overlays, dialogs

### 6.2. Hover/Active Effect

```css
.card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.card:active {
  transform: translateY(0);
  opacity: 0.95;
}
```

---

## 7. Border Radius

### 7.1. Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small tags, badge dots |
| `--radius-md` | 10px | Small cards, icon wraps |
| `--radius-lg` | 12px | Cards, order rows, chips container |
| `--radius-xl` | 16px | Promo banners, bottom sheets |
| `--radius-full` | 100px | Chips, pills, buttons |
| `--radius-phone` | 30px | Phone screen inner radius |

### 7.2. Radius Rules

- Cards: always `--radius-lg` (12px)
- Buttons: always `--radius-full` (pill shape)
- Chips: `--radius-full` (pill shape)
- Bottom sheet top: `--radius-xl` top corners only
- Modal: `--radius-xl`

---

## 8. Iconography

### 8.1. Icon Style

- **Lucide-style** outline: 1.8px stroke, round caps, round joins
- **Stroke-based** — no filled icons (except brand heart)
- **20×20px** standard, **16×16px** small (inline with text)
- **SVG sprite** — all icons in one `<svg style="display:none">` block

### 8.2. Icon Sizes

| Size | Container | Usage |
|------|-----------|-------|
| 16px | — | Inline with text, chips |
| 20px | — | Standard list icons, tab bar |
| 28px | — | Store icons in order rows |
| 32px | — | Grid menu items (icon wrap) |
| 36px | — | Large store icons |
| 22px | — | Navigation icons |

### 8.3. Brand Icon (О with Heart)

| Property | Value |
|----------|-------|
| ViewBox | `160 195 90 100` |
| О fill | `#ffffff` (white, both themes) |
| Heart fill | `#f64a8a` (pink, both themes) |
| Usage | Home tab, favicon, splash |

### 8.4. Icon Inventory

| ID | Icon | Used In |
|----|------|---------|
| `#i-home` | О with heart | Tab bar, Главная |
| `#i-home-dark` | О with heart (white О) | Dark theme tab bar |
| `#i-search` | Search/magnifier | Search bar |
| `#i-cart` | Shopping cart | Cart tab, add to cart |
| `#i-user` | User/profile | Profile tab, chips |
| `#i-bell` | Bell/notification | Header |
| `#i-store` | Store/building | Business chip |
| `#i-package` | Package/order | Orders, Заказы grid |
| `#i-star` | Star | Bonuses, rating |
| `#i-bar-chart` | Bar chart | Analytics, reports |
| `#i-users` | Users/team | Team list |
| `#i-building` | Building/city | Cities grid |
| `#i-zap` | Zap/lightning | Promos, акции |
| `#i-settings` | Gear/settings | Settings |
| `#i-map-pin` | Map pin | Location |
| `#i-shopping-bag` | Shopping bag | Catalog, store orders |
| `#i-gift` | Gift | Promotions, flower orders |
| `#i-clock` | Clock | Time, countdown |
| `#i-wallet` | Wallet | Balance, income |
| `#i-trending-up` | Trending up | Growth charts |
| `#i-chevron-right` | Chevron | Navigation, "more" |

---

## 9. Components

### 9.1. Button — Primary

```
┌──────────────────────┐
│  Войти               │  ← pink bg, white text, 14px/600
└──────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 48px |
| Padding | 16px 24px |
| Radius | 100px (pill) |
| BG | `--accent-pink` |
| Text | White, 14px, 600 |
| Icon | Left, white stroke |
| Hover | `filter: brightness(1.1)` |
| Active | `filter: brightness(0.95)` |
| Disabled | `opacity: 0.4` |
| Full width | Whole container width |

### 9.2. Button — Secondary (Outline)

```
┌──────────────────────┐
│  Отменить             │  ← white bg, sand border, pink text
└──────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 48px |
| Padding | 16px 24px |
| Radius | 100px |
| BG | Transparent / white |
| Border | `1px solid var(--border-strong)` |
| Text | `--accent-pink`, 14px, 600 |
| Hover | `--accent-pink-light` bg |

### 9.3. Button — Small / Ghost

```
  ┌──────────┐
  │ ✚ Товар  │  ← for inline actions, 36px height
  └──────────┘
```

| Property | Value |
|----------|-------|
| Height | 36px |
| Padding | 8px 16px |
| Radius | 100px |
| BG | `--accent-pink-light` / transparent |
| Text | `--accent-pink`, 12px, 600 |

### 9.4. Input

```
  ┌──────────────────────────────┐
  │  Название магазина            │  ← 16px text, placeholder dim
  └──────────────────────────────┘
  ┌──────────────────────────────┐
  │                              │  ← focused: pink border
  └──────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 48px |
| Padding | 14px 16px |
| Radius | 12px |
| Border | `1px solid var(--border)` |
| Focus border | `1px solid var(--accent-pink)` |
| Error border | `1px solid var(--danger)` |
| BG | `--surface` |
| Text | 16px, `--text-primary` |
| Placeholder | `--text-dim` |

### 9.5. Chips (Category Pills)

```
  [ Все ]  [  Пекарни  ]  [  Цветы  ]  [  Химчистка  ]
```

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding | 6px 14px |
| Radius | 100px |
| Default | `--surface-secondary` bg, `--text-secondary` text |
| Active | Pink bg (light) / pink text + underline (dark), bold |
| Gap | 6px |
| Container | Horizontal scroll, no scrollbar |

### 9.6. Bottom Navigation

```
  [ ♥ Главная ]  [ 🔍 Поиск ]  [ 🛒 Корзина ]  [ 👤 Профиль ]
```

| Property | Value |
|----------|-------|
| Height | 56px + safe area bottom |
| Items | 4 max |
| Layout | Flex, space-around |
| Active | Pink text, pink icon stroke |
| Inactive | `--text-dim` text, `--text-dim` stroke |
| Divider | `1px solid var(--border)` |
| Icon size | 20px |
| Label | 9px, 500, centered below icon |

### 9.7. Card

```
  ┌────────────────────────────────┐
  │  Пекарня #23           1 200₽ │
  │  15–25 мин · 1.2 км  [Готовится] │
  └────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Radius | 12px |
| BG | `--surface` |
| Border | `1px solid var(--border)` |
| Padding | 14px |
| Shadow | Level 1 |
| Hover | translateY(-2px) + Level 2 shadow |

### 9.8. Status Tag

```
   [Готовится]  [В пути]  [Готово]  [Отменён]
      pink       tiffany   success    danger
```

| Property | Value |
|----------|-------|
| Height | 20px |
| Padding | 2px 8px |
| Radius | 6px |
| Font | 9px, 700 |
| BG | `--accent-*-light` |
| Text | Matching accent color |

### 9.9. Promo Banner

```
  ┌──────────────────────────────────────┐
  │  −20% на выпечку               [4 ч] │
  │  В Пекарне #23 до конца дня          │
  └──────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Radius | 16px |
| BG | Pink gradient (`--accent-pink` → `#c92a6a`) |
| Text | White |
| Padding | 14px 16px |
| Layout | Two rows: title (16px/700) + subtitle (12px). Right: timer tag |

### 9.10. Segment Control

```
  ┌──────────────────────────────┐
  │ [Клиент] │ [Бизнес] │ [Партнёр] │
  └──────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Height | 36px |
| Radius | 12px (container) / 10px (item) |
| BG | `--accent-chiffon` (container) |
| Active item | White bg, `--text-primary` bold |
| Inactive | `--text-dim` |
| Gap | 4px |
| Inner padding | 3px |
| Icon | 16px, inline with text |

### 9.11. Header

```
  [♡]                             [🔔] [icon]
  Москва
```

| Property | Value |
|----------|-------|
| Height | 48px + top safe area |
| Layout | Left: logo; Right: actions (bell + avatar) |
| Location bar | Below header: map pin + city name + time |
| Font | Location: 11px secondary; City: 13px/600 |

### 9.12. Grid Menu

```
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │ 🛍️  │ │ 📦  │ │ ⭐  │ │ 📊  │
  │Каталог│ │Заказы│ │Бонусы│ │Отчёты│
  └──────┘ └──────┘ └──────┘ └──────┘
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │ 👥  │ │ 🏙️  │ │ ⚡  │ │ ⚙️  │
  │Команда│ │Города│ │Акции │ │Настр.│
  └──────┘ └──────┘ └──────┘ └──────┘
```

| Property | Value |
|----------|-------|
| Columns | 4 |
| Gap | 8px |
| Item height | auto (flex column) |
| Icon wrap | 28×28px (light) / 32×32px (dark), radius 8–10px |
| Icon | 20px |
| Label | 10px, 500, `--text-secondary` |
| Icon BG | `--accent-pink-light`, `--accent-tiffany-light`, or Chiffon |

### 9.13. Bottom Sheet

```
  ┌──────────────────────────────────┐  ← 16px top radius
  │  ───  (drag handle)              │
  │                                  │
  │  Content                         │
  │                                  │
  └──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Radius | 16px top only |
| Shadow | Level 3 |
| BG | `--surface` |
| Drag handle | 32×4px, `--border-strong`, centered |
| Backdrop | `rgba(0,0,0,0.4)` |

### 9.14. Toast

```
  ┌──────────────────────────────────┐
  │ ✓ Товар добавлен в корзину       │  ← 2s, slide up
  └──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Position | Bottom, above nav bar |
| Radius | 12px |
| BG | `--text-primary` (dark bg) |
| Text | White |
| Duration | 2s |
| Animation | slideUp 300ms, opacity fade |
| Icon | 16px left (tiffany for success, pink for info) |

### 9.15. Balance Block

```
  ┌──────────────────────────────────┐
  │  1 250 баллов        Как получить?│
  │  до статуса Digital Representative│
  └──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Layout | Card with two columns |
| Amount | 18px, 700, pink |
| Subtext | 11px, `--text-secondary` |
| Link | 12px, Tiffany |

---

## 10. Patterns

### 10.1. Role-Based Chips

Three roles at the top of the home screen — user can switch between them:

```
  [👤 Клиент]  [🏪 Бизнес]  [🤝 Партнёр]
```

Each role shows a different home screen:
- **Клиент:** catalog, promos, bonus balance, active orders
- **Бизнес:** dashboard with today's metrics, recent orders
- **Партнёр:** network stats, income, team

### 10.2. Order Status Flow

```
  Новый → Подтверждён → Готовится → Готов → Передан → Завершён
  [pink]   [tiffany]     [pink]    [tiffany] [warning] [success]
```

Tags per status:
| Status | Tag | Color |
|--------|-----|-------|
| Новый | `[Новый]` | Pink |
| Подтверждён | `[Подтверждён]` | Tiffany |
| Готовится | `[Готовится]` | Pink |
| Готов | `[Готов]` | Tiffany |
| Передан в доставку | `[В пути]` | Warning |
| Завершён | `[Завершён]` | Success |

### 10.3. Smart Feed (Home Screen)

```
  ┌──────────────────────────────────┐
  │  [Header: Logo + Notifications]   │
  │  Москва                          │
  │  [Клиент | Бизнес | Партнёр]     │
  │                                  │
  │  ┌─── Promo Banner ──────────┐   │
  │  │ −20% на выпечку     [4 ч] │   │
  │  └───────────────────────────┘   │
  │                                  │
  │  ┌─── 4×2 Grid Menu ────────┐   │
  │  │ 🛍 📦 ⭐ 📊               │   │
  │  │ 👥 🏙 ⚡ ⚙               │   │
  │  └───────────────────────────┘   │
  │                                  │
  │  Активные заказы                 │
  │  ┌─ Card ───────────────────┐   │
  │  │ Пекарня #23     1 200₽   │   │
  │  │ 15 мин · 1.2 км [Готов.] │   │
  │  └──────────────────────────┘   │
  │  ┌─ Card ───────────────────┐   │
  │  │ Цветы Fresh     2 300₽   │   │
  │  │ 20 мин · 2.3 км [В пути] │   │
  │  └──────────────────────────┘   │
  │                                  │
  │  [Tab Bar: ♥ | 🔍 | 🛒 | 👤]    │
  └──────────────────────────────────┘
```

### 10.4. Empty States

| State | Visual | Text | Action |
|-------|--------|------|--------|
| No orders | Brand icon | «У вас пока нет заказов» | «Начать покупки» button |
| No stores | Brand icon | «В этом городе пока нет магазинов» | «Пригласить бизнес» link |
| No team | Brand icon | «В вашей команде пока никого нет» | «Добавить» button |
| No data | Brand icon | «Нет данных за этот период» | — |
| Search empty | Search icon | «Ничего не найдено» | «Попробуйте изменить запрос» |

### 10.5. Progressive Disclosure

- **Dashboard:** show metrics first, details on tap
- **Order list:** last 5 active orders visible, «Все заказы» link
- **Team list:** top 5 members, «Показать всех» expand
- **Balance:** show total, hide history behind tap

### 10.6. Transition / Animation

| Event | Animation | Duration | Easing |
|-------|-----------|----------|--------|
| Screen appear | fadeIn | 300ms | ease |
| Card appear | slideUp + fade | 400ms | ease-out |
| Bottom sheet | slideUp from bottom | 300ms | cubic-bezier |
| Tab switch | cross-fade | 200ms | ease |
| Hover | translateY + shadow | 150ms | ease |
| Active press | scale(0.97) | 100ms | ease |
| Toast | slideUp | 300ms | ease-out |
| `prefers-reduced-motion` | All disabled | — | — |

---

## 11. Screen Templates by Role

### 11.1. Клиент (5 screens)

| Screen | Layout | Key Components |
|--------|--------|----------------|
| **Главная** | Header + location + chips + promo banner + grid menu + active orders + tab bar | Smart feed, role chips, promo banner |
| **Каталог** | Search bar + category chips (horizontal) + 2-col store grid | Card grid, chips |
| **Магазин** | Store header + product list (each: name, price, +) | Product cards |
| **Корзина** | Item list (+/−) + total + checkout CTA | Cart rows, primary button |
| **Профиль** | Balance (large) + QR code + order history + favorites | Balance block, order history list |

### 11.2. Партнёр / Торговая точка (5 screens)

| Screen | Layout | Key Components |
|--------|--------|----------------|
| **Дашборд** | Today metrics (3 cards: orders, revenue, new clients) + recent orders + quick actions | Metric cards, order rows, small buttons |
| **Товары** | Search + category filter + product list (edit/active toggle) + FAB "+" | Filter, product rows, ghost button |
| **Заказы** | Tab: Active / History + order cards per status | Tabs, status tags, order cards |
| **Отчёты** | Period selector + bar chart (revenue by day) + export | Chart, period tabs |
| **Настройки** | Store info form + hours + profile edit | Inputs, toggles, save button |

### 11.3. Представитель (4 screens)

| Screen | Layout | Key Components |
|--------|--------|----------------|
| **Дашборд** | Status badge (Rep/Mayor/Gov) + coins counter + metric cards + progress bar | Status badge, balance, progress |
| **Мои точки** | Search + points list (each: name, address, revenue, status) | Card list with metrics |
| **Доход** | Period selector + income chart + transaction history | Chart, transaction list |
| **Профиль** | Status + badge + referral code + stats | Profile card, stats grid |

### 11.4. Амбасадор (4 screens)

| Screen | Layout | Key Components |
|--------|--------|----------------|
| **Дашборд** | Network stats (reps, points, revenue) + top performers | Metric cards, mini leaderboard |
| **Представители** | Search + rep list (name, points, revenue) + tap for detail | Card list with expand |
| **Доход** | Income breakdown by rep + history | Detail chart, list |
| **Обучение** | Materials list + video placeholders | Card list |

### 11.5. Цифровой Мэр / Губернатор

| Screen | Layout | Key Components |
|--------|--------|----------------|
| **Мэр дашборд** | Rep dashboard + badge + privilege badges | Status badge + extended metrics |
| **Губернатор дашборд** | Multi-city map + city cards (each: points, revenue) + total metrics | Map placeholder, city cards |

---

## 12. Dark Theme

### 12.1. Principles

1. **Same accent colors** — Pink, Tiffany, Chiffon stay unchanged
2. **Backgrounds invert** — white → near-black `#0A0A0C`
3. **Surfaces dark** — `#1C1C1E` for cards, `#151517` for secondary
4. **Borders subtle** — `#2A2A2C` instead of Chiffon
5. **Text flips** — black → white
6. **No pure black** — always `#0A0A0C` or `#1C1C1E`, never `#000`
7. **Reduced shadows** — darker bg provides depth
8. **Icons stay white** — O with heart icon uses white О in both themes

### 12.2. Dark Theme Token Mapping

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#FFFFFF` | `#0A0A0C` |
| `--surface` | `#FFFFFF` | `#1C1C1E` |
| `--surface-secondary` | `#F8F8F8` | `#151517` |
| `--border` | `#EEEEEE` | `#2A2A2C` |
| `--border-strong` | `#DDDDDD` | `#3A3A3C` |
| `--text-primary` | `#1A1A1A` | `#FFFFFF` |
| `--text-secondary` | `#888888` | `#888888` |
| `--text-dim` | `#BBBBBB` | `#555555` |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.04)` | `0 1px 3px rgba(0,0,0,0.3)` |
| `--shadow-raised` | `0 2px 8px rgba(0,0,0,0.06)` | `0 2px 8px rgba(0,0,0,0.4)` |

### 12.3. Dark Theme Component Adjustments

| Component | Light | Dark |
|-----------|-------|------|
| Card bg | White | `#1C1C1E` |
| Segment control bg | `#F8F8F8` | `#2A2A2C` |
| Segment active bg | White | `#1C1C1E` |
| Chips active | Pink bg | Pink stroke + pink text, no bg |
| Input bg | White | `#1C1C1E` |
| Card secondary bg | `#F8F8F8` | `#151517` |
| Promo banner | Pink gradient | Pink gradient (same) |

### 12.4. Theme Toggle

- Toggle in settings or long-press on home icon
- Transition: `background-color 0.3s ease`
- Stored in `localStorage('theme')` as `'light'` or `'dark'`
- Applied via `data-theme="dark"` on `<html>` element

---

## 13. Accessibility

### 13.1. Contrast Ratios

| Combination | Ratio | WCAG |
|-------------|-------|------|
| `--text-primary` on `--bg` (light) | 15:1 | AAA ✓ |
| `--text-primary` on `--bg` (dark) | 15:1 | AAA ✓ |
| `--text-secondary` on `--bg` (light) | 5.6:1 | AA ✓ |
| `--text-secondary` on `--bg` (dark) | 4.5:1 | AA ✓ |
| Pink `#f64a8a` on white | 4.8:1 | AA ✓ |
| Pink `#f64a8a` on dark `#0A0A0C` | 6.2:1 | AA ✓ |
| Tiffany `#0ABAB5` on white | 3.0:1 | AA ✗ (use on dark bg or as accent only) |

> **Note:** Tiffany is used as an accent only (not for body text). For text-on-tiffany, always use white.

### 13.2. Touch Targets

| Element | Min size |
|---------|----------|
| Buttons | 44×44px |
| Bottom nav items | 48×48px |
| Chips | 32×32px |
| Close buttons | 44×44px |
| Icon buttons | 44×44px |

### 13.3. Other Requirements

- `aria-label` on all icon-only buttons
- `prefers-reduced-motion` disables all animations
- Focus outlines: 2px solid pink with 2px offset
- Font size respects system settings (rem / user-agent styles)
- All touch targets separated by ≥ 8px gap

---

## 14. Performance

| Requirement | Target |
|-------------|--------|
| TTI | < 2s |
| Lighthouse | ≥ 90 all categories |
| Total page weight | < 100KB (excluding fonts) |
| Requests | < 10 |
| Fonts | Inter (400, 500, 600, 700) — self-hosted preferred |
| Images | None in demo. SVG only |
| Icons | Single SVG sprite |
| State | `localStorage` for theme, cart, auth |
| Build | None — vanilla HTML/CSS/JS, GitHub Pages |

### 14.1. SVG Sprite Strategy

```html
<svg style="display:none">
  <symbol id="i-home" viewBox="...">...</symbol>
  <symbol id="i-search" viewBox="0 0 24 24">...</symbol>
  <!-- All icons here -->
</svg>
```

Usage: `<svg class="icon"><use href="#i-home"/></svg>`

### 14.2. CSS Architecture

- **Custom properties** for all colors, spacing, radii
- **No preprocessor** — native CSS with logical grouping
- **Media queries** only for grid breakpoints
- **`data-theme`** attribute for dark/light switching
- **File size target:** < 15KB compressed

---

*This design system is a living document. Update as new patterns emerge.*
