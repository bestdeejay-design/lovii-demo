# LOVII App — Current State Audit (app.lovii.ru)

**Audit date:** 2026-07-17
**Platform:** Progressive Web App (PWA), Vue 3 + Vite SPA
**Base URL:** https://app.lovii.ru
**API base:** https://api.lovii.ru/api/v1

---

## 0. How the app was accessed (important context)

The app is a **geolocation-gated SPA**. On first load it shows an `init-loader` spinner and calls the browser Geolocation API. In a headless/automated context the geolocation permission prompt **hangs forever**, so the app never renders.

**Bypass used:** Pre-seed `localStorage.deliveryInfo` with a valid delivery address object before every navigation:

```js
localStorage.setItem("deliveryInfo", JSON.stringify({
  address_line: "Москва, ул. Тверская, 1",
  city_name: "Москва", street: "Тверская", house: "1",
  lon: 37.6173, lat: 55.7558
}));
```

This makes the `InitLoader` immediately proceed and the `StartScreen` call `setUserInit()`, unlocking the full app shell. All screens below were captured this way (guest session, no login).

**Auth model:** Phone-number + OTP (SMS/WhatsApp/Telegram). Guest users can browse, search, and add to cart, but **checkout, orders, profile, and addresses all require authentication**.

---

## 1. Route map (from router config)

| Route | Screen | Auth required? |
|-------|--------|----------------|
| `/` | Home / Главная | No (guest OK) |
| `/stores` | Stores catalog / Заведения | No |
| `/stores/:id` | Store page / Торговая точка | No |
| `/stores/:id/product/:productId` | Product page / Товар | No |
| `/popular` | Popular stores grid | No |
| `/cart` | Cart / Корзина | No (empty + add items) |
| `/profile` | Profile (login gate) | Yes |
| `/profile/orders` | Orders | Yes (redirects to /profile if not authed) |
| `/profile/addresses` | Addresses | Yes |
| `/profile/create`, `/profile/edit`, `/profile/edit/:id` | Address create/edit | Yes |
| `/:pathMatch(.*)*` | 404 page | — |

**Note:** There is **no separate `/search` or `/orders` top-level route**. Search is inline on the Stores page. Orders live under `/profile/orders`.

---

## 2. Screen-by-screen documentation

### 2.1 Home / Главная (`/`)

**Layout:**
- **Top header** (`.home-header`): location pill button (map-pin icon + "Москва, ул. Тверская, 1") — tapping opens a location/delivery-point selector.
- **Section "Популярные заведения"** (Popular establishments): horizontal scroll row of `.popular-store` cards (circular logo on brand-colored background + store name). Ends with a "Посмотреть все" (See all) link → `/popular`.
- **Section "Возле вас"** (Near you): vertical list of `.nearby-store` cards. Each shows up to 3 product thumbnail images, store logo, name, open/closed status (`Открыто`/`Закрыто`), minimum order (`Заказ от: X ₽`), and distance (`0.28 км`).
- **Bottom navigation bar** (`.nav-bar`, fixed, 60px): 4 tabs — Главная (Home, active), Заведения (Stores), Корзина (Cart), Профиль (Profile). Icons swap between `*-regular` and `*-fill` states.

**Data shown (sample, Moscow seed):**
- Popular: METRO, Code For Easy, Софтбери, Mybook
- Near you (19 stores): Dev Store (0.28 km, open, min 5₽), METRO (1.71 km, closed), Vpodarok.ru, SoftClub, Kaspersky, GUTENTECH, Литрес, GameRilla, Gamester, PRO32, Terra-codes, Русское лото, Бука, Цифровая Машка, SoftDiscount, etc.

**Interactive features:** Location change, horizontal scroll of popular, tap store → store page, bottom nav routing, cart badge (appears when items added).

**Screenshot:** `lovii-home-full.png`

---

### 2.2 Stores catalog / Заведения (`/stores`)

**Layout:**
- Location pill (same as home header).
- Search input (with search icon) + filter button (slider icon, `.app-icon-button`).
- Heading "Все заведения" (All establishments).
- List of `.catalog-store` cards: logo (brand bg), name + distance + min order, open/closed status.

**Data (Moscow seed returned only 4 — location-filtered):**
METRO (1.71 km), Софтбери (19.19 km), Mybook (22.55 km), Code For Easy (24.52 km).

**Interactive features:** Search input (live, but observed to not filter on the tested queries — may need submit), filter bottom-sheet trigger (slider icon). Tapping a card → store page.

**Screenshot:** `lovii-stores.png`

---

### 2.3 Store page / Торговая точка (`/stores/:id`)

Example: `/stores/1019` (METRO)

**Layout:**
- **Place card** (`.place-card`): large logo on brand bg (rgb(15,68,124) for METRO), store name (h3) with an info (circle_info) button, status line: "Открыто | 1.71 км | Заказ от: 0.00 ₽".
- **Search bar** (`.place-search`): inline input for searching within the store.
- **Catalog** (`.place-catalog`): heading "Популярное" (Popular), grid of `.product-preview` cards.

**Product preview card:** product image, name (h4), weight/volume (e.g. "500 г"), price (with strikethrough old price when discounted, e.g. "422.10 ₽ 562.50"), and an add-to-cart button (cart-fill icon).

**Data:** 24 products in "Популярное" for METRO — groceries (Лук репчатый 18.45₽, chicken breasts, lepeshka, greens, cucumbers, iceberg lettuce, mushrooms, potatoes, peppers, tomatoes, etc.). Discounts shown as old+new price.

**Interactive features:** Add to cart from card, tap card → product page, in-store search.

**Screenshot:** `lovii-store-1019.png`

---

### 2.4 Product page / Товар (`/stores/:id/product/:productId`)

Example: `/stores/1019/product/101` (Лук репчатый)

**Layout:**
- Full-width product image with a back button (chevron_left) overlay top-left.
- Product name (h3).
- **Nutritional params** (`.product__params`): Белки (protein), Углеводы (carbs), Жирность (fat), Ккал (calories) — each shown per 100 g.
- **"Ещё может подойти"** (You might also like) section with an empty list (`.more-products__list`) in this case.
- **Sticky action bar** (`.product__action`): full-width button "18.45 ₽ за 1 шт." (add to cart).

**Interactive features:** Add to cart, back navigation, related products (empty here).

**Screenshot:** `lovii-product-101.png`

---

### 2.5 Cart / Корзина (`/cart`)

**Empty state:**
- Centered icon (cart-regular), "Корзина пуста" (Cart is empty), subtitle "Добавьте товары из заведений, чтобы оформить заказ", and a brand button "К заведениям" (To establishments) → `/stores`.

**Filled state (after adding Лук репчатый):**
- **Store block** (`.cart-info`): METRO logo + name.
- **Cart product** (`.cart-product`): thumbnail, name, price (18.45 ₽), quantity counter (− 1 +).
- **Summary** (`.cart-summary`): "Товары (1) 18.45 ₽", "Итого: 18.45 ₽", and a brand button "Оформить заказ" (Place order).

**Key behavior:** Clicking "Оформить заказ" opens an **auth bottom-sheet** (phone entry) — checkout is auth-gated.

**Screenshots:** `lovii-cart.png` (empty), `lovii-cart-filled.png` (filled)

---

### 2.6 Profile / Профиль (`/profile`)

**Guest state:**
- Icon (login-regular), "Войдите в свой аккаунт" (Log into your account), subtitle "Войдите или зарегистрируйтесь, чтобы добавлять товары и совершать покупки", and an XL brand button "Войти" (Login).

**Authenticated sub-routes** (require login, redirect to /profile if not authed):
- `/profile/orders` — order history
- `/profile/addresses` — saved delivery addresses
- `/profile/create`, `/profile/edit`, `/profile/edit/:id` — address management

These could not be captured (no valid credentials).

**Screenshot:** `lovii-profile.png`

---

### 2.7 Auth / Login flow

**Step 1 — Phone entry** (`/profile` → "Войти"):
- Heading "Введите ваш номер телефона" (Enter your phone number).
- Masked input: `+7 ### ###-##-##` (inputmode tel).
- Consent text: "При входе и регистрации вы соглашаетесь с Условиями использования сайта и Политикой обработки персональных данных".
- Outlined button "Продолжить" (Continue).

**Step 2 — OTP delivery method** (after submitting a phone):
- Heading "Выберете вариант для отправки кода подтверждения" (Choose how to send the confirmation code).
- List of method buttons (`.auth-call-coders__list`) with provider icons (observed: a Telegram-style gradient icon; SMS/WhatsApp likely present).

**Step 3+:** OTP code entry + (for new users) profile completion. Not reachable without a real registered phone + received code.

**Screenshots:** `lovii-auth.png` (phone), `lovii-auth-otp-method.png` (OTP method)

---

### 2.8 Popular stores / Популярные заведения (`/popular`)

- Header with back button (chevron_left) + location pill.
- Heading "Популярные заведения".
- Grid of `.popular-store` cards (logo + name). Tapping → store page.

**Screenshot:** `lovii-popular.png`

---

### 2.9 404 page

- LOVII logo, large "404", "Страница не найдена" (Page not found), "Возможно, она была удалена или вы перешли по неверной ссылке", and a brand button "На главную" (To home).

**Screenshot:** `lovii-orders.png` (this route `/orders` hits the 404 because orders live under `/profile/orders`)

---

## 3. Roles: client / partner / rep / ambassador

**Finding:** The client-facing PWA at `app.lovii.ru` exposes **only the end-customer (client) experience**. There is **no in-app role switcher** and no visible partner/rep/ambassador dashboards within this app.

Evidence:
- The router has no role-specific routes (only `/`, `/stores`, `/cart`, `/profile` + sub-routes).
- The `profile-store` only manages `profile`, `loadProfileInfo`, `updateProfileInfo`, `logout` — no role field surfaced in the client bundle.
- Partner/rep/ambassador dashboards are almost certainly **separate applications** (e.g., a different subdomain or a B2B web portal), not part of `app.lovii.ru`.

**Recommendation for demo:** The partner/rep/ambassador screens will need to be **designed from scratch** (they don't exist in the current client app). The B2B2C model implies: Partner = store/retailer admin, Rep = field/sales rep, Ambassador = referral/marketing agent. None are present in the audited surface.

---

## 4. Design system

**Tech:** Vue 3 SPA, Vite, PWA (service worker `registerSW.js`, `manifest.webmanifest`). Font: **Inter** (woff2). Icons: custom icon font (`icon-*-regular` / `icon-*-fill` pairs). State: Pinia stores (`system-store`, `profile-store`, `cart-store`).

### Colors (CSS custom properties)

| Token group | Key values |
|-------------|-----------|
| **Brand** (primary) | 500 `#7e90c2` (muted slate-blue), 600 `#7282b0`, 700 `#63729a`, 990 `#0d111b` |
| **Accent** | 500 `#ef66ff` (magenta/pink), 400 `#f285ff`, 600 `#d95de8` |
| **Purple** (link) | 500 `#9924ff`, 800 `#6b19b3` (used for links: `--content-active-link`) |
| **Neutral** | 0 `#fff` … 990 `#0a0f12` (text scale) |
| **Grey** | 50 `#ebeced` … 990 `#121314` |
| **Page bg** | `--background-normal-page: var(--basecolors-brand-50)` = `#f6f7fa` (very light blue-grey) |
| **Surface** | `--background-normal-surface: #fff` |
| **Overlay** | `rgba(0,0,0,.33)` |
| **Elevation shadows** | onlight-low `.04`, mid `.08`, high `.08` alpha of `#0d111b` |

Theme is light/dark via `html[data-theme=light|dark]` and `colorMode` in localStorage. Default appears light.

### Typography
- Family: **Inter, sans-serif** (single family, weight-based hierarchy).
- Sizes inferred from component tags: h1 (404 code, large), h2 (page titles like "Популярные заведения"), h3 (section/card titles), h4/h5 (store & product names). Prices use prominent weight.

### Components / patterns observed
- **`.app-button`**: sizes `s/m/l/xl`, colors `brand` (filled) / `outlined` / `secondary`; `loading` & `disabled` states; 0.3s ease-out transitions; 20px icon.
- **`.nav-bar`**: fixed bottom, 60px, flex space-between, 4 equal-width tab links, safe-area-inset for standalone PWA.
- **`.popular-store`**: circular logo (brand bg color per store) + name.
- **`.nearby-store`**: 3 product thumbnails + logo + name + status + min-order + distance.
- **`.product-preview`**: image + name + weight + price (old price strikethrough) + add button.
- **`.cart-product`**: thumbnail + name + price + −/+/counter.
- **`.app-input`**: sizes s/m/l/xl, area with optional icon, used for search & phone (maska mask `+7 ### ###-##-##`).
- **`.app-icon-button`**: circular icon button (used for back, filter, info).
- **`.app-bottom-sheet`** / **`.app-badge`** / **`.app-segment-control`** / **`.app-pagination`**: present in bundle (used for filters, auth sheet, tabs, pagination).
- **Location/delivery drawer** (`.location-drawer`): Yandex Maps geolocation search (`GeolocationSearch` component uses Yandex Maps).

### Layout conventions
- Mobile-first, max content width via `.container`.
- Bottom nav is the primary navigation; no top tab bar.
- Cards use soft elevation shadows, rounded corners, brand-tinted logo backplates.
- Status colors: "Открыто" (open) in a positive color, "Закрыто" (closed) in grey/muted.

---

## 5. What's working vs. missing

### Working (guest + observed)
- ✅ Geolocation-gated home with popular + near-you stores
- ✅ Store catalog with search & filter entry points
- ✅ Store detail with product catalog + discounts
- ✅ Product detail with nutrition facts
- ✅ Cart (add, quantity, summary, empty state)
- ✅ Auth flow (phone → OTP method selection)
- ✅ PWA installability, offline banner component
- ✅ 404 handling
- ✅ Design system (tokens, components) is coherent and production-grade

### Missing / not present in client app
- ❌ **Role dashboards** (partner / rep / ambassador) — do not exist in this app
- ❌ **Orders history** — auth-gated, unverifiable without login
- ❌ **Profile / addresses** — auth-gated
- ❌ **Checkout completion** — gated behind OTP auth
- ❌ **In-app role switcher** — none
- ❌ **Dedicated search results page** — search is inline only; observed not filtering on tested queries (possible bug or requires submit)
- ❌ **Loyalty/points UI** — no visible loyalty, cashback, or tier surfaces in the client (core to a "loyalty platform" — likely B2B/partner-side or not yet built in client)
- ❌ **Favorites/wishlist** — nav has a favorite icon state but no favorites screen observed

---

## 6. Screenshots index (in /Users/best/Projects/lovii_demo)

| File | Screen |
|------|--------|
| `lovii-home-full.png` | Home (full page) |
| `lovii-stores.png` | Stores catalog |
| `lovii-store-1019.png` | Store page (METRO) |
| `lovii-product-101.png` | Product page (Лук репчатый) |
| `lovii-cart.png` | Cart (empty) |
| `lovii-cart-filled.png` | Cart (1 item) |
| `lovii-profile.png` | Profile (login gate) |
| `lovii-auth.png` | Auth — phone entry |
| `lovii-auth-otp-method.png` | Auth — OTP method choice |
| `lovii-popular.png` | Popular stores grid |
| `lovii-orders.png` | 404 (invalid /orders route) |

---

## 7. Recommendations for the demo build

1. **Client app is solid** — reuse its design system (Inter, brand `#7e90c2`, accent `#ef66ff`, bottom nav, card patterns) as the visual baseline for all demo screens.
2. **Build the 3 role dashboards from scratch** — they are absent. Suggested scopes:
   - **Partner** (retailer): store profile, catalog management, orders received, payouts.
   - **Rep** (field): assigned stores, visit tasks, performance KPIs.
   - **Ambassador**: referral links, commission tracking, leaderboard.
3. **Add loyalty surfaces** — points, tiers, cashback are the platform's namesake but invisible in the client; design these for the demo.
4. **Fix/verify search** — confirm whether store search requires a submit action; the inline filter didn't respond to live input in testing.
5. **Mock auth for demo** — since real OTP blocks exploration, the demo should use a mocked/skipped auth to show post-login states (orders, addresses, checkout).
