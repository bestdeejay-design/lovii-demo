/* Сгенерировано _tools/gen-screen-map.mjs 2026-11-16T07:54:14.747Z — руками не править */
window.SCREEN_MAP_DATA = {
 "generated_at": "2026-11-16T07:54:14.747Z",
 "manifest_generated_at": "2026-11-16T00:00:00Z",
 "shoot_date": "2026-11-16",
 "stats": {
  "total_routes": 58,
  "with_screens": 58,
  "need_shots": 0,
  "orphans": 2,
  "catalog_folders_total": 60,
  "by_role": {
   "клиент": 20,
   "общий": 5,
   "МСП": 15,
   "команда_точки": 4,
   "представитель": 5,
   "амбассадор": 4,
   "владелец_founder": 3,
   "инвестор_founder": 3,
   "служебный": 1
  },
  "by_module": {
   "home": 1,
   "popular-stores": 1,
   "stores-catalog": 1,
   "store": 1,
   "store-product": 1,
   "cart": 1,
   "create-order": 1,
   "profile": 1,
   "profile-balance": 4,
   "profile-edit": 2,
   "profile-orders": 1,
   "profile-order": 1,
   "profile-addresses": 1,
   "address": 2,
   "profile-settings": 1,
   "business": 6,
   "roles-representative": 5,
   "platform": 1,
   "platform-owner": 3,
   "platform-investor": 3,
   "roles-ambassador": 4,
   "roles-msp": 9,
   "roles-team": 4,
   "payment": 2,
   "auth": 1,
   "not-found": 1
  },
  "by_status": {
   "implemented": 57,
   "stub": 0,
   "mock": 1
  }
 },
 "notes": [
  "auth: true = требует сессию (глобальный default-deny гард T-021 или beforeEnter); false = meta.public.",
  "Все компоненты роутов ленивые (() => import(...)), кроме layout-каркасов (MainLayout, CabinetLayout, TeamCabinetLayout).",
  "Каталог: все 60 папок APP-P имеют >=1 версию скринов (append-only, baseline 2026-10-02).",
  "APP-P-031/APP-P-043 (чаты rep/amb) — маршруты удалены (R2, координатор): папки каталога устарели.",
  "APP-P-058 fake-terminal — роут отсутствует в production-сборке (VITE_APP_ENV), жив на dev/staging.",
  "status=mock только у AmbassadorTraining (честная заглушка материалов); остальные маркеры 'заглушка/mock' в коде — placeholder-картинки и формулировки чек-листов, не экраны-заглушки."
 ],
 "orphans": [
  "APP-P-031-rep-chats (нет живого роута: маршрут-сирота «Чаты» представителя удалён, R2 — нет таба, ссылок и бэкенда)",
  "APP-P-043-amb-chats (нет живого роута: маршрут-сирота «Чаты» амбассадора удалён, R2)"
 ],
 "structural": [
  "/stores/:id (безымянный parent StoreView/ProductView)",
  "/profile/orders (host OrdersTwoPane.vue, two-pane R3 §5.3)",
  "/profile/addresses (parent группы адресов)"
 ],
 "routes": [
  {
   "path": "/",
   "name": "HomeView",
   "component": "src/modules/home-module/HomeModule.vue",
   "role": "общий (контент по роли)",
   "module": "home",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-001-home",
   "title": "Главный экран (витрина)",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-001-home-mobile.png",
    "fold": "shots/APP-P-001-home-fold.png",
    "tablet": "shots/APP-P-001-home-tablet.png",
    "web": "shots/APP-P-001-home-web.png"
   },
   "meta": {
    "id": "APP-P-001-home",
    "title": "APP-P-001-home",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/",
    "final_url": "https://app-staging.lovii.ru/",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/popular",
   "name": "PopularView",
   "component": "src/modules/popular-stores/PopularStores.vue",
   "role": "клиент",
   "module": "popular-stores",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-002-popular",
   "title": "Популярное",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-002-popular-mobile.png",
    "fold": "shots/APP-P-002-popular-fold.png",
    "tablet": "shots/APP-P-002-popular-tablet.png",
    "web": "shots/APP-P-002-popular-web.png"
   },
   "meta": {
    "id": "APP-P-002-popular",
    "title": "APP-P-002-popular",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/popular",
    "final_url": "https://app-staging.lovii.ru/popular",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/stores",
   "name": "StoresView",
   "component": "src/modules/stores-catalog/StoresCatalog.vue",
   "role": "клиент",
   "module": "stores-catalog",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-003-stores",
   "title": "Поиск заведений и товаров",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-003-stores-mobile.png",
    "fold": "shots/APP-P-003-stores-fold.png",
    "tablet": "shots/APP-P-003-stores-tablet.png",
    "web": "shots/APP-P-003-stores-web.png"
   },
   "meta": {
    "id": "APP-P-003-stores",
    "title": "APP-P-003-stores",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/stores",
    "final_url": "https://app-staging.lovii.ru/stores",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/stores/:id",
   "name": "StoreView",
   "component": "src/modules/store-module/StoreModule.vue",
   "role": "клиент",
   "module": "store",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-004-store",
   "title": "Заведение (точка)",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-004-store-mobile.png",
    "fold": "shots/APP-P-004-store-fold.png",
    "tablet": "shots/APP-P-004-store-tablet.png",
    "web": "shots/APP-P-004-store-web.png"
   },
   "meta": {
    "id": "APP-P-004-store",
    "title": "APP-P-004-store",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/stores",
    "final_url": "https://app-staging.lovii.ru/stores/4",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/stores/:id/product/:productId",
   "name": "ProductView",
   "component": "src/modules/store-product/StoreProduct.vue",
   "role": "клиент",
   "module": "store-product",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-005-product",
   "title": "Товар",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-005-product-mobile.png",
    "fold": "shots/APP-P-005-product-fold.png",
    "tablet": "shots/APP-P-005-product-tablet.png",
    "web": "shots/APP-P-005-product-web.png"
   },
   "meta": {
    "id": "APP-P-005-product",
    "title": "APP-P-005-product",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/stores/4/product/12",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cart",
   "name": "CartView",
   "component": "src/modules/cart-module/CartModule.vue",
   "role": "клиент",
   "module": "cart",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-006-cart",
   "title": "Корзина",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-006-cart-mobile.png",
    "fold": "shots/APP-P-006-cart-fold.png",
    "tablet": "shots/APP-P-006-cart-tablet.png",
    "web": "shots/APP-P-006-cart-web.png"
   },
   "meta": {
    "id": "APP-P-006-cart",
    "title": "APP-P-006-cart",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cart",
    "final_url": "https://app-staging.lovii.ru/cart",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cart/:id",
   "name": "CartOrderView",
   "component": "src/modules/create-order/CreateOrder.vue",
   "role": "клиент",
   "module": "create-order",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-007-cart-order",
   "title": "Оформление заказа",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-007-cart-order-mobile.png",
    "fold": "shots/APP-P-007-cart-order-fold.png",
    "tablet": "shots/APP-P-007-cart-order-tablet.png",
    "web": "shots/APP-P-007-cart-order-web.png"
   },
   "meta": {
    "id": "APP-P-007-cart-order",
    "title": "APP-P-007-cart-order",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/cart/191",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "корзина с товарами одной точки (честные UI-клики, добор до мин. суммы)"
   }
  },
  {
   "path": "/profile",
   "name": "ProfileView",
   "component": "src/modules/profile-module/ProfileModule.vue",
   "role": "общий (хаб входа)",
   "module": "profile",
   "status": "implemented",
   "auth": false,
   "priority": 1,
   "screenId": "APP-P-008-profile",
   "title": "Профиль (хаб входа)",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-008-profile-mobile.png",
    "fold": "shots/APP-P-008-profile-fold.png",
    "tablet": "shots/APP-P-008-profile-tablet.png",
    "web": "shots/APP-P-008-profile-web.png"
   },
   "meta": {
    "id": "APP-P-008-profile",
    "title": "APP-P-008-profile",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile",
    "final_url": "https://app-staging.lovii.ru/profile",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/wallet",
   "name": "ProfileWalletView",
   "component": "src/modules/profile-balance/ProfileWallet.vue",
   "role": "клиент",
   "module": "profile-balance",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-009-wallet",
   "title": "Счёт и операции",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-009-wallet-mobile.png",
    "fold": "shots/APP-P-009-wallet-fold.png",
    "tablet": "shots/APP-P-009-wallet-tablet.png",
    "web": "shots/APP-P-009-wallet-web.png"
   },
   "meta": {
    "id": "APP-P-009-wallet",
    "title": "APP-P-009-wallet",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/wallet",
    "final_url": "https://app-staging.lovii.ru/profile/wallet",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/wallet/transfer",
   "name": "ProfileTransferView",
   "component": "src/modules/profile-balance/ProfileTransfer.vue",
   "role": "клиент",
   "module": "profile-balance",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-010-transfer",
   "title": "Перевод баллов",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-010-transfer-mobile.png",
    "fold": "shots/APP-P-010-transfer-fold.png",
    "tablet": "shots/APP-P-010-transfer-tablet.png",
    "web": "shots/APP-P-010-transfer-web.png"
   },
   "meta": {
    "id": "APP-P-010-transfer",
    "title": "APP-P-010-transfer",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/wallet/transfer",
    "final_url": "https://app-staging.lovii.ru/profile/wallet/transfer",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/balance",
   "name": "ProfileBalanceView",
   "component": "(redirect -> ProfileWalletView ?tab=points)",
   "role": "клиент",
   "module": "profile-balance",
   "status": "implemented",
   "auth": true,
   "priority": 3,
   "screenId": "APP-P-011-balance-redirect",
   "title": "Редирект «Мои баллы»",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-011-balance-redirect-mobile.png",
    "fold": "shots/APP-P-011-balance-redirect-fold.png",
    "tablet": "shots/APP-P-011-balance-redirect-tablet.png",
    "web": "shots/APP-P-011-balance-redirect-web.png"
   },
   "meta": {
    "id": "APP-P-011-balance-redirect",
    "title": "APP-P-011-balance-redirect",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/balance",
    "final_url": "https://app-staging.lovii.ru/profile/balance",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "redirect /profile/balance -> кошелёк (tab=points)"
   }
  },
  {
   "path": "/profile/operations",
   "name": "ProfileOperationsView",
   "component": "(redirect -> ProfileWalletView ?tab=operations)",
   "role": "клиент",
   "module": "profile-balance",
   "status": "implemented",
   "auth": true,
   "priority": 3,
   "screenId": "APP-P-012-operations-redirect",
   "title": "Редирект «Все операции»",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-012-operations-redirect-mobile.png",
    "fold": "shots/APP-P-012-operations-redirect-fold.png",
    "tablet": "shots/APP-P-012-operations-redirect-tablet.png",
    "web": "shots/APP-P-012-operations-redirect-web.png"
   },
   "meta": {
    "id": "APP-P-012-operations-redirect",
    "title": "APP-P-012-operations-redirect",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/operations",
    "final_url": "https://app-staging.lovii.ru/profile/operations",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "redirect /profile/operations -> кошелёк (tab=operations)"
   }
  },
  {
   "path": "/profile/edit",
   "name": "ProfileEditView",
   "component": "src/modules/profile-edit/ProfileEdit.vue",
   "role": "клиент",
   "module": "profile-edit",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-013-profile-edit",
   "title": "Редактирование профиля",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-013-profile-edit-mobile.png",
    "fold": "shots/APP-P-013-profile-edit-fold.png",
    "tablet": "shots/APP-P-013-profile-edit-tablet.png",
    "web": "shots/APP-P-013-profile-edit-web.png"
   },
   "meta": {
    "id": "APP-P-013-profile-edit",
    "title": "APP-P-013-profile-edit",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/edit",
    "final_url": "https://app-staging.lovii.ru/profile/edit",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/edit/email/verify",
   "name": "EmailVerifyView",
   "component": "src/modules/profile-edit/EmailVerify.vue",
   "role": "клиент",
   "module": "profile-edit",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-014-email-verify",
   "title": "Подтверждение e-mail",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-014-email-verify-mobile.png",
    "fold": "shots/APP-P-014-email-verify-fold.png",
    "tablet": "shots/APP-P-014-email-verify-tablet.png",
    "web": "shots/APP-P-014-email-verify-web.png"
   },
   "meta": {
    "id": "APP-P-014-email-verify",
    "title": "APP-P-014-email-verify",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/edit/email/verify",
    "final_url": "https://app-staging.lovii.ru/profile/edit/email/verify",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/orders",
   "name": "OrdersView",
   "component": "src/modules/profile-orders/OrdersModule.vue (two-pane host OrdersTwoPane.vue)",
   "role": "клиент",
   "module": "profile-orders",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-015-orders",
   "title": "История заказов",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-015-orders-mobile.png",
    "fold": "shots/APP-P-015-orders-fold.png",
    "tablet": "shots/APP-P-015-orders-tablet.png",
    "web": "shots/APP-P-015-orders-web.png"
   },
   "meta": {
    "id": "APP-P-015-orders",
    "title": "APP-P-015-orders",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/orders",
    "final_url": "https://app-staging.lovii.ru/profile/orders",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/orders/:id",
   "name": "OrderView",
   "component": "src/modules/profile-order/ProfileOrder.vue",
   "role": "клиент",
   "module": "profile-order",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-016-order",
   "title": "Заказ",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-016-order-mobile.png",
    "fold": "shots/APP-P-016-order-fold.png",
    "tablet": "shots/APP-P-016-order-tablet.png",
    "web": "shots/APP-P-016-order-web.png"
   },
   "meta": {
    "id": "APP-P-016-order",
    "title": "APP-P-016-order",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/profile/orders/135",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/addresses",
   "name": "AddressesView",
   "component": "src/modules/profile-addresses/ProfileAddresses.vue",
   "role": "клиент",
   "module": "profile-addresses",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-017-addresses",
   "title": "Мои адреса",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-017-addresses-mobile.png",
    "fold": "shots/APP-P-017-addresses-fold.png",
    "tablet": "shots/APP-P-017-addresses-tablet.png",
    "web": "shots/APP-P-017-addresses-web.png"
   },
   "meta": {
    "id": "APP-P-017-addresses",
    "title": "APP-P-017-addresses",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/addresses",
    "final_url": "https://app-staging.lovii.ru/profile/addresses",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/addresses/create",
   "name": "CreateAddressView",
   "component": "src/modules/address/AddressForm.vue (mode=create)",
   "role": "клиент",
   "module": "address",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-018-address-create",
   "title": "Добавление адреса",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-018-address-create-mobile.png",
    "fold": "shots/APP-P-018-address-create-fold.png",
    "tablet": "shots/APP-P-018-address-create-tablet.png",
    "web": "shots/APP-P-018-address-create-web.png"
   },
   "meta": {
    "id": "APP-P-018-address-create",
    "title": "APP-P-018-address-create",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/profile/addresses/create",
    "final_url": "https://app-staging.lovii.ru/profile/addresses/create",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/profile/addresses/edit/:id",
   "name": "EditAddressView",
   "component": "src/modules/address/AddressForm.vue (mode=update)",
   "role": "клиент",
   "module": "address",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-019-address-edit",
   "title": "Редактирование адреса",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-019-address-edit-mobile.png",
    "fold": "shots/APP-P-019-address-edit-fold.png",
    "tablet": "shots/APP-P-019-address-edit-tablet.png",
    "web": "shots/APP-P-019-address-edit-web.png"
   },
   "meta": {
    "id": "APP-P-019-address-edit",
    "title": "APP-P-019-address-edit",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/profile/addresses/edit/65",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/settings",
   "name": "ProfileSettings",
   "component": "src/modules/profile-settings/ProfileSettings.vue",
   "role": "общий",
   "module": "profile-settings",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-020-settings",
   "title": "Настройки",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-020-settings-mobile.png",
    "fold": "shots/APP-P-020-settings-fold.png",
    "tablet": "shots/APP-P-020-settings-tablet.png",
    "web": "shots/APP-P-020-settings-web.png"
   },
   "meta": {
    "id": "APP-P-020-settings",
    "title": "APP-P-020-settings",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/settings",
    "final_url": "https://app-staging.lovii.ru/settings",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/business",
   "name": "BusinessLandingView",
   "component": "src/modules/business-module/BusinessLanding.vue",
   "role": "МСП (вход, нужен промокод репа)",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-021-business-landing",
   "title": "ЛОВИ Бизнес — лендинг подключения точки",
   "version": "v5-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-021-business-landing-mobile.png",
    "fold": "shots/APP-P-021-business-landing-fold.png",
    "tablet": "shots/APP-P-021-business-landing-tablet.png",
    "web": "shots/APP-P-021-business-landing-web.png"
   },
   "meta": {
    "id": "APP-P-021-business-landing",
    "title": "APP-P-021-business-landing",
    "version": "v5-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009990004 (NEW-1, view-only)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/business",
    "final_url": "https://app-staging.lovii.ru/business",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "гейт: у актёра NEW-1 (+79009990004) нет живой заявки МСП — роут ведёт в профиль (честное состояние на 16.11)"
   }
  },
  {
   "path": "/business/apply",
   "name": "BusinessApplyView",
   "component": "src/modules/business-module/BusinessApply.vue",
   "role": "МСП",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-022-business-apply",
   "title": "ЛОВИ Бизнес — форма заявки «Добавить точку»",
   "version": "v5-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-022-business-apply-mobile.png",
    "fold": "shots/APP-P-022-business-apply-fold.png",
    "tablet": "shots/APP-P-022-business-apply-tablet.png",
    "web": "shots/APP-P-022-business-apply-web.png"
   },
   "meta": {
    "id": "APP-P-022-business-apply",
    "title": "APP-P-022-business-apply",
    "version": "v5-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009990004 (NEW-1, view-only)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/business/apply",
    "final_url": "https://app-staging.lovii.ru/business/apply",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "гейт: у актёра NEW-1 нет живой заявки — редирект в профиль"
   }
  },
  {
   "path": "/business/pending",
   "name": "(redirect -> BusinessStatusView)",
   "component": "(redirect)",
   "role": "МСП",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 3,
   "screenId": null,
   "title": null,
   "version": null,
   "shots": {}
  },
  {
   "path": "/business/status",
   "name": "BusinessStatusView",
   "component": "src/modules/business-module/BusinessStatus.vue",
   "role": "МСП",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-023-business-status",
   "title": "ЛОВИ Бизнес — статус заявки",
   "version": "v8-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-023-business-status-mobile.png",
    "fold": "shots/APP-P-023-business-status-fold.png",
    "tablet": "shots/APP-P-023-business-status-tablet.png",
    "web": "shots/APP-P-023-business-status-web.png"
   },
   "meta": {
    "id": "APP-P-023-business-status",
    "title": "APP-P-023-business-status",
    "version": "v8-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009990004 (NEW-1, view-only)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/business/status",
    "final_url": "https://app-staging.lovii.ru/business/status",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "гейт: у актёра NEW-1 нет живой заявки — редирект в профиль"
   }
  },
  {
   "path": "/business/result",
   "name": "BusinessResultView",
   "component": "src/modules/business-module/BusinessResult.vue",
   "role": "МСП",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-024-business-result",
   "title": "ЛОВИ Бизнес — результат заявки",
   "version": "v4-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-024-business-result-mobile.png",
    "fold": "shots/APP-P-024-business-result-fold.png",
    "tablet": "shots/APP-P-024-business-result-tablet.png",
    "web": "shots/APP-P-024-business-result-web.png"
   },
   "meta": {
    "id": "APP-P-024-business-result",
    "title": "APP-P-024-business-result",
    "version": "v4-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009990004 (NEW-1, view-only)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/business/result",
    "final_url": "https://app-staging.lovii.ru/business/result",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "гейт: у актёра NEW-1 нет живой заявки — редирект в профиль"
   }
  },
  {
   "path": "/business/point",
   "name": "MyPointView",
   "component": "(redirect -> MspOverview)",
   "role": "МСП",
   "module": "business",
   "status": "implemented",
   "auth": true,
   "priority": 3,
   "screenId": "APP-P-025-mypoint",
   "title": "Редирект «Моя точка»",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-025-mypoint-mobile.png",
    "fold": "shots/APP-P-025-mypoint-fold.png",
    "tablet": "shots/APP-P-025-mypoint-tablet.png",
    "web": "shots/APP-P-025-mypoint-web.png"
   },
   "meta": {
    "id": "APP-P-025-mypoint",
    "title": "APP-P-025-mypoint",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/business/point",
    "final_url": "https://app-staging.lovii.ru/business/point",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "redirect /business/point -> MspOverview (итоговый экран кабинета МСП, user 51 view-only)"
   }
  },
  {
   "path": "/cabinet/representative",
   "name": "RepresentativeOverview",
   "component": "src/modules/roles-module/representative/RepresentativeOverview.vue",
   "role": "представитель",
   "module": "roles-representative",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-026-rep-overview",
   "title": "Кабинет представителя — Обзор",
   "version": "v4-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-026-rep-overview-mobile.png",
    "fold": "shots/APP-P-026-rep-overview-fold.png",
    "tablet": "shots/APP-P-026-rep-overview-tablet.png",
    "web": "shots/APP-P-026-rep-overview-web.png"
   },
   "meta": {
    "id": "APP-P-026-rep-overview",
    "title": "APP-P-026-rep-overview",
    "version": "v4-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/representative",
    "final_url": "https://app-staging.lovii.ru/cabinet/representative",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/representative/points",
   "name": "RepresentativePoints",
   "component": "src/modules/roles-module/representative/RepresentativePoints.vue",
   "role": "представитель",
   "module": "roles-representative",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-027-rep-points",
   "title": "Кабинет представителя — Мои точки",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-027-rep-points-mobile.png",
    "fold": "shots/APP-P-027-rep-points-fold.png",
    "tablet": "shots/APP-P-027-rep-points-tablet.png",
    "web": "shots/APP-P-027-rep-points-web.png"
   },
   "meta": {
    "id": "APP-P-027-rep-points",
    "title": "APP-P-027-rep-points",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/representative/points",
    "final_url": "https://app-staging.lovii.ru/cabinet/representative/points",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/representative/approvals",
   "name": "RepresentativeApprovals",
   "component": "src/modules/roles-module/representative/RepresentativeApprovals.vue",
   "role": "представитель",
   "module": "roles-representative",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-028-rep-approvals",
   "title": "Кабинет представителя — Заявки (очередь на модерации)",
   "version": "v4-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-028-rep-approvals-mobile.png",
    "fold": "shots/APP-P-028-rep-approvals-fold.png",
    "tablet": "shots/APP-P-028-rep-approvals-tablet.png",
    "web": "shots/APP-P-028-rep-approvals-web.png"
   },
   "meta": {
    "id": "APP-P-028-rep-approvals",
    "title": "APP-P-028-rep-approvals",
    "version": "v4-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/representative/approvals",
    "final_url": "https://app-staging.lovii.ru/cabinet/representative/approvals",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/representative/income",
   "name": "RepresentativeIncome",
   "component": "src/modules/roles-module/representative/RepresentativeIncome.vue",
   "role": "представитель",
   "module": "roles-representative",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-029-rep-income",
   "title": "Кабинет представителя — Доход",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-029-rep-income-mobile.png",
    "fold": "shots/APP-P-029-rep-income-fold.png",
    "tablet": "shots/APP-P-029-rep-income-tablet.png",
    "web": "shots/APP-P-029-rep-income-web.png"
   },
   "meta": {
    "id": "APP-P-029-rep-income",
    "title": "APP-P-029-rep-income",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/representative/income",
    "final_url": "https://app-staging.lovii.ru/cabinet/representative/income",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/representative/profile",
   "name": "RepresentativeProfile",
   "component": "src/modules/roles-module/representative/RepresentativeProfile.vue",
   "role": "представитель",
   "module": "roles-representative",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-030-rep-profile",
   "title": "Кабинет представителя — Профиль",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-030-rep-profile-mobile.png",
    "fold": "shots/APP-P-030-rep-profile-fold.png",
    "tablet": "shots/APP-P-030-rep-profile-tablet.png",
    "web": "shots/APP-P-030-rep-profile-web.png"
   },
   "meta": {
    "id": "APP-P-030-rep-profile",
    "title": "APP-P-030-rep-profile",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/representative/profile",
    "final_url": "https://app-staging.lovii.ru/cabinet/representative/profile",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/platform",
   "name": "CabinetPlatform",
   "component": "src/modules/platform-module/PlatformModule.vue",
   "role": "владелец (founder)",
   "module": "platform",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-032-platform",
   "title": "Кабинет платформы (счета, распределения, реестры)",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-032-platform-mobile.png",
    "fold": "shots/APP-P-032-platform-fold.png",
    "tablet": "shots/APP-P-032-platform-tablet.png",
    "web": "shots/APP-P-032-platform-web.png"
   },
   "meta": {
    "id": "APP-P-032-platform",
    "title": "APP-P-032-platform",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/platform",
    "final_url": "https://app-staging.lovii.ru/cabinet/platform",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/owner",
   "name": "OwnerOverview",
   "component": "src/modules/platform-module/owner/OwnerOverview.vue",
   "role": "владелец (founder)",
   "module": "platform-owner",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-033-owner-overview",
   "title": "Владелец · Обзор",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-033-owner-overview-mobile.png",
    "fold": "shots/APP-P-033-owner-overview-fold.png",
    "tablet": "shots/APP-P-033-owner-overview-tablet.png",
    "web": "shots/APP-P-033-owner-overview-web.png"
   },
   "meta": {
    "id": "APP-P-033-owner-overview",
    "title": "APP-P-033-owner-overview",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/owner",
    "final_url": "https://app-staging.lovii.ru/cabinet/owner",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/owner/finance",
   "name": "OwnerFinance",
   "component": "src/modules/platform-module/owner/OwnerFinance.vue",
   "role": "владелец (founder)",
   "module": "platform-owner",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-034-owner-finance",
   "title": "Владелец · Финансы",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-034-owner-finance-mobile.png",
    "fold": "shots/APP-P-034-owner-finance-fold.png",
    "tablet": "shots/APP-P-034-owner-finance-tablet.png",
    "web": "shots/APP-P-034-owner-finance-web.png"
   },
   "meta": {
    "id": "APP-P-034-owner-finance",
    "title": "APP-P-034-owner-finance",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/owner/finance",
    "final_url": "https://app-staging.lovii.ru/cabinet/owner/finance",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/owner/structure",
   "name": "OwnerStructure",
   "component": "src/modules/platform-module/owner/OwnerStructure.vue",
   "role": "владелец (founder)",
   "module": "platform-owner",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-035-owner-structure",
   "title": "Владелец · Структура",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-035-owner-structure-mobile.png",
    "fold": "shots/APP-P-035-owner-structure-fold.png",
    "tablet": "shots/APP-P-035-owner-structure-tablet.png",
    "web": "shots/APP-P-035-owner-structure-web.png"
   },
   "meta": {
    "id": "APP-P-035-owner-structure",
    "title": "APP-P-035-owner-structure",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/owner/structure",
    "final_url": "https://app-staging.lovii.ru/cabinet/owner/structure",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/investor",
   "name": "InvestorGrowth",
   "component": "src/modules/platform-module/investor/InvestorGrowth.vue",
   "role": "инвестор (founder)",
   "module": "platform-investor",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-036-investor-growth",
   "title": "Инвестор · Рост",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-036-investor-growth-mobile.png",
    "fold": "shots/APP-P-036-investor-growth-fold.png",
    "tablet": "shots/APP-P-036-investor-growth-tablet.png",
    "web": "shots/APP-P-036-investor-growth-web.png"
   },
   "meta": {
    "id": "APP-P-036-investor-growth",
    "title": "APP-P-036-investor-growth",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/investor",
    "final_url": "https://app-staging.lovii.ru/cabinet/investor",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/investor/points",
   "name": "InvestorPoints",
   "component": "src/modules/platform-module/investor/InvestorPoints.vue",
   "role": "инвестор (founder)",
   "module": "platform-investor",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-037-investor-points",
   "title": "Инвестор · Точки",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-037-investor-points-mobile.png",
    "fold": "shots/APP-P-037-investor-points-fold.png",
    "tablet": "shots/APP-P-037-investor-points-tablet.png",
    "web": "shots/APP-P-037-investor-points-web.png"
   },
   "meta": {
    "id": "APP-P-037-investor-points",
    "title": "APP-P-037-investor-points",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/investor/points",
    "final_url": "https://app-staging.lovii.ru/cabinet/investor/points",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/investor/money",
   "name": "InvestorMoney",
   "component": "src/modules/platform-module/investor/InvestorMoney.vue",
   "role": "инвестор (founder)",
   "module": "platform-investor",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-038-investor-money",
   "title": "Инвестор · Доходность",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-038-investor-money-mobile.png",
    "fold": "shots/APP-P-038-investor-money-fold.png",
    "tablet": "shots/APP-P-038-investor-money-tablet.png",
    "web": "shots/APP-P-038-investor-money-web.png"
   },
   "meta": {
    "id": "APP-P-038-investor-money",
    "title": "APP-P-038-investor-money",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/investor/money",
    "final_url": "https://app-staging.lovii.ru/cabinet/investor/money",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/ambassador",
   "name": "AmbassadorOverview",
   "component": "src/modules/roles-module/ambassador/AmbassadorOverview.vue",
   "role": "амбассадор",
   "module": "roles-ambassador",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-039-amb-overview",
   "title": "Амбассадор · Обзор",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-039-amb-overview-mobile.png",
    "fold": "shots/APP-P-039-amb-overview-fold.png",
    "tablet": "shots/APP-P-039-amb-overview-tablet.png",
    "web": "shots/APP-P-039-amb-overview-web.png"
   },
   "meta": {
    "id": "APP-P-039-amb-overview",
    "title": "APP-P-039-amb-overview",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/ambassador",
    "final_url": "https://app-staging.lovii.ru/cabinet/ambassador",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/ambassador/reps",
   "name": "AmbassadorReps",
   "component": "src/modules/roles-module/ambassador/AmbassadorReps.vue",
   "role": "амбассадор",
   "module": "roles-ambassador",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-040-amb-reps",
   "title": "Амбассадор · Структура",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-040-amb-reps-mobile.png",
    "fold": "shots/APP-P-040-amb-reps-fold.png",
    "tablet": "shots/APP-P-040-amb-reps-tablet.png",
    "web": "shots/APP-P-040-amb-reps-web.png"
   },
   "meta": {
    "id": "APP-P-040-amb-reps",
    "title": "APP-P-040-amb-reps",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/ambassador/reps",
    "final_url": "https://app-staging.lovii.ru/cabinet/ambassador/reps",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/ambassador/training",
   "name": "AmbassadorTraining",
   "component": "src/modules/roles-module/ambassador/AmbassadorTraining.vue",
   "role": "амбассадор",
   "module": "roles-ambassador",
   "status": "mock",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-041-amb-training",
   "title": "Амбассадор · Обучение",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-041-amb-training-mobile.png",
    "fold": "shots/APP-P-041-amb-training-fold.png",
    "tablet": "shots/APP-P-041-amb-training-tablet.png",
    "web": "shots/APP-P-041-amb-training-web.png"
   },
   "meta": {
    "id": "APP-P-041-amb-training",
    "title": "APP-P-041-amb-training",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/ambassador/training",
    "final_url": "https://app-staging.lovii.ru/cabinet/ambassador/training",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/ambassador/income",
   "name": "AmbassadorIncome",
   "component": "src/modules/roles-module/ambassador/AmbassadorIncome.vue",
   "role": "амбассадор",
   "module": "roles-ambassador",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-042-amb-income",
   "title": "Амбассадор · Доход",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-042-amb-income-mobile.png",
    "fold": "shots/APP-P-042-amb-income-fold.png",
    "tablet": "shots/APP-P-042-amb-income-tablet.png",
    "web": "shots/APP-P-042-amb-income-web.png"
   },
   "meta": {
    "id": "APP-P-042-amb-income",
    "title": "APP-P-042-amb-income",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/ambassador/income",
    "final_url": "https://app-staging.lovii.ru/cabinet/ambassador/income",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp",
   "name": "MspOverview",
   "component": "src/modules/roles-module/msp/MspOverview.vue",
   "role": "МСП (владелец/админ)",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-044-msp-overview",
   "title": "Кабинет МСП — Обзор («Мой магазин»)",
   "version": "v6-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-044-msp-overview-mobile.png",
    "fold": "shots/APP-P-044-msp-overview-fold.png",
    "tablet": "shots/APP-P-044-msp-overview-tablet.png",
    "web": "shots/APP-P-044-msp-overview-web.png"
   },
   "meta": {
    "id": "APP-P-044-msp-overview",
    "title": "APP-P-044-msp-overview",
    "version": "v6-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/payment",
   "name": "MspPayment",
   "component": "src/modules/roles-module/msp/MspPayment.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-045-msp-payment",
   "title": "МСП — Счёт верификации",
   "version": "v5-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-045-msp-payment-mobile.png",
    "fold": "shots/APP-P-045-msp-payment-fold.png",
    "tablet": "shots/APP-P-045-msp-payment-tablet.png",
    "web": "shots/APP-P-045-msp-payment-web.png"
   },
   "meta": {
    "id": "APP-P-045-msp-payment",
    "title": "APP-P-045-msp-payment",
    "version": "v5-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/payment",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/payment",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/orders",
   "name": "MspOrders",
   "component": "src/modules/roles-module/msp/MspOrders.vue",
   "role": "МСП/команда",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-046-msp-orders",
   "title": "МСП — Заказы точки",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-046-msp-orders-mobile.png",
    "fold": "shots/APP-P-046-msp-orders-fold.png",
    "tablet": "shots/APP-P-046-msp-orders-tablet.png",
    "web": "shots/APP-P-046-msp-orders-web.png"
   },
   "meta": {
    "id": "APP-P-046-msp-orders",
    "title": "APP-P-046-msp-orders",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/orders",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/orders",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/orders/:id",
   "name": "MspOrderDetail",
   "component": "src/modules/roles-module/msp/MspOrderDetail.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-047-msp-order-detail",
   "title": "МСП — Заказ точки (деталь)",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-047-msp-order-detail-mobile.png",
    "fold": "shots/APP-P-047-msp-order-detail-fold.png",
    "tablet": "shots/APP-P-047-msp-order-detail-tablet.png",
    "web": "shots/APP-P-047-msp-order-detail-web.png"
   },
   "meta": {
    "id": "APP-P-047-msp-order-detail",
    "title": "APP-P-047-msp-order-detail",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/orders/120",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/products",
   "name": "MspProducts",
   "component": "src/modules/roles-module/msp/MspProducts.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-048-msp-products",
   "title": "МСП — Товары",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-048-msp-products-mobile.png",
    "fold": "shots/APP-P-048-msp-products-fold.png",
    "tablet": "shots/APP-P-048-msp-products-tablet.png",
    "web": "shots/APP-P-048-msp-products-web.png"
   },
   "meta": {
    "id": "APP-P-048-msp-products",
    "title": "APP-P-048-msp-products",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/products",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/products",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/loyalty",
   "name": "MspLoyalty",
   "component": "src/modules/roles-module/msp/MspLoyalty.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-049-msp-loyalty",
   "title": "МСП — Промо (лояльность)",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-049-msp-loyalty-mobile.png",
    "fold": "shots/APP-P-049-msp-loyalty-fold.png",
    "tablet": "shots/APP-P-049-msp-loyalty-tablet.png",
    "web": "shots/APP-P-049-msp-loyalty-web.png"
   },
   "meta": {
    "id": "APP-P-049-msp-loyalty",
    "title": "APP-P-049-msp-loyalty",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/loyalty",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/loyalty",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/settings",
   "name": "MspBranchSettings",
   "component": "src/modules/roles-module/msp/MspBranchSettings.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-050-msp-branch-settings",
   "title": "МСП — Настройки точки",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-050-msp-branch-settings-mobile.png",
    "fold": "shots/APP-P-050-msp-branch-settings-fold.png",
    "tablet": "shots/APP-P-050-msp-branch-settings-tablet.png",
    "web": "shots/APP-P-050-msp-branch-settings-web.png"
   },
   "meta": {
    "id": "APP-P-050-msp-branch-settings",
    "title": "APP-P-050-msp-branch-settings",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/settings",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/settings",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/team",
   "name": "MspTeam",
   "component": "src/modules/roles-module/msp/MspTeam.vue",
   "role": "МСП (владелец/админ)",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-051-msp-team",
   "title": "МСП — Команда",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-051-msp-team-mobile.png",
    "fold": "shots/APP-P-051-msp-team-fold.png",
    "tablet": "shots/APP-P-051-msp-team-tablet.png",
    "web": "shots/APP-P-051-msp-team-web.png"
   },
   "meta": {
    "id": "APP-P-051-msp-team",
    "title": "APP-P-051-msp-team",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/team",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/team",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/msp/starter",
   "name": "MspStarter",
   "component": "src/modules/roles-module/msp/MspStarter.vue",
   "role": "МСП",
   "module": "roles-msp",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-052-msp-starter",
   "title": "МСП — Запуск точки («Начать»)",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-052-msp-starter-mobile.png",
    "fold": "shots/APP-P-052-msp-starter-fold.png",
    "tablet": "shots/APP-P-052-msp-starter-tablet.png",
    "web": "shots/APP-P-052-msp-starter-web.png"
   },
   "meta": {
    "id": "APP-P-052-msp-starter",
    "title": "APP-P-052-msp-starter",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/msp/starter",
    "final_url": "https://app-staging.lovii.ru/cabinet/msp/starter",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/team",
   "name": "TeamOrders",
   "component": "src/modules/roles-module/team/TeamOrders.vue",
   "role": "команда точки (менеджер/сотрудник/владелец с team_access)",
   "module": "roles-team",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-053-team-orders",
   "title": "Кабинет команды — Заказы",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-053-team-orders-mobile.png",
    "fold": "shots/APP-P-053-team-orders-fold.png",
    "tablet": "shots/APP-P-053-team-orders-tablet.png",
    "web": "shots/APP-P-053-team-orders-web.png"
   },
   "meta": {
    "id": "APP-P-053-team-orders",
    "title": "APP-P-053-team-orders",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/team",
    "final_url": "https://app-staging.lovii.ru/cabinet/team",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/team/orders/:id",
   "name": "TeamOrderDetail",
   "component": "src/modules/roles-module/team/TeamOrderDetail.vue",
   "role": "команда точки",
   "module": "roles-team",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-054-team-order-detail",
   "title": "Команда — Заказ точки (деталь)",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-054-team-order-detail-mobile.png",
    "fold": "shots/APP-P-054-team-order-detail-fold.png",
    "tablet": "shots/APP-P-054-team-order-detail-tablet.png",
    "web": "shots/APP-P-054-team-order-detail-web.png"
   },
   "meta": {
    "id": "APP-P-054-team-order-detail",
    "title": "APP-P-054-team-order-detail",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "(динамический, resolve через UI)",
    "final_url": "https://app-staging.lovii.ru/cabinet/team/orders/120",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/team/products",
   "name": "TeamProducts",
   "component": "src/modules/roles-module/team/TeamProducts.vue",
   "role": "команда точки (только менеджер)",
   "module": "roles-team",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-055-team-products",
   "title": "Команда — Товары",
   "version": "v3-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-055-team-products-mobile.png",
    "fold": "shots/APP-P-055-team-products-fold.png",
    "tablet": "shots/APP-P-055-team-products-tablet.png",
    "web": "shots/APP-P-055-team-products-web.png"
   },
   "meta": {
    "id": "APP-P-055-team-products",
    "title": "APP-P-055-team-products",
    "version": "v3-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/team/products",
    "final_url": "https://app-staging.lovii.ru/cabinet/team/products",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/cabinet/team/team",
   "name": "TeamTeam",
   "component": "src/modules/roles-module/team/TeamTeam.vue",
   "role": "команда точки (только менеджер)",
   "module": "roles-team",
   "status": "implemented",
   "auth": true,
   "priority": 2,
   "screenId": "APP-P-056-team-team",
   "title": "Команда — Команда",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-056-team-team-mobile.png",
    "fold": "shots/APP-P-056-team-team-fold.png",
    "tablet": "shots/APP-P-056-team-team-tablet.png",
    "web": "shots/APP-P-056-team-team-web.png"
   },
   "meta": {
    "id": "APP-P-056-team-team",
    "title": "APP-P-056-team-team",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79119287478 (user 51, view-only — влад. данные не менялись)",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/cabinet/team/team",
    "final_url": "https://app-staging.lovii.ru/cabinet/team/team",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/payment/result",
   "name": "PaymentResultView",
   "component": "src/modules/payment/PaymentResultView.vue",
   "role": "клиент",
   "module": "payment",
   "status": "implemented",
   "auth": true,
   "priority": 1,
   "screenId": "APP-P-057-payment-result",
   "title": "Результат оплаты заказа",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-057-payment-result-mobile.png",
    "fold": "shots/APP-P-057-payment-result-fold.png",
    "tablet": "shots/APP-P-057-payment-result-tablet.png",
    "web": "shots/APP-P-057-payment-result-web.png"
   },
   "meta": {
    "id": "APP-P-057-payment-result",
    "title": "APP-P-057-payment-result",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/payment/result",
    "final_url": "https://app-staging.lovii.ru/payment/result",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/payment/fake",
   "name": "FakeTerminalView",
   "component": "src/modules/payment/FakeTerminalView.vue",
   "role": "служебный (e2e; нет в prod-сборке)",
   "module": "payment",
   "status": "implemented",
   "auth": true,
   "priority": 3,
   "screenId": "APP-P-058-fake-terminal",
   "title": "Тестовый терминал (mock-банк)",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-058-fake-terminal-mobile.png",
    "fold": "shots/APP-P-058-fake-terminal-fold.png",
    "tablet": "shots/APP-P-058-fake-terminal-tablet.png",
    "web": "shots/APP-P-058-fake-terminal-web.png"
   },
   "meta": {
    "id": "APP-P-058-fake-terminal",
    "title": "APP-P-058-fake-terminal",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/payment/fake",
    "final_url": "https://app-staging.lovii.ru/payment/fake",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "служебный роут e2e; на staging присутствует"
   }
  },
  {
   "path": "/auth/by-binding",
   "name": "AuthByBindingView",
   "component": "src/modules/auth-module/AuthByBinding.vue",
   "role": "общий (magic link из Telegram-бота)",
   "module": "auth",
   "status": "implemented",
   "auth": false,
   "priority": 2,
   "screenId": "APP-P-059-auth-by-binding",
   "title": "Вход по magic link",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-059-auth-by-binding-mobile.png",
    "fold": "shots/APP-P-059-auth-by-binding-fold.png",
    "tablet": "shots/APP-P-059-auth-by-binding-tablet.png",
    "web": "shots/APP-P-059-auth-by-binding-web.png"
   },
   "meta": {
    "id": "APP-P-059-auth-by-binding",
    "title": "APP-P-059-auth-by-binding",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/auth/by-binding",
    "final_url": "https://app-staging.lovii.ru/auth/by-binding",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "полный пересъём baseline 02.10 → 16.11"
   }
  },
  {
   "path": "/:pathMatch(.*)*",
   "name": "NotFound",
   "component": "src/modules/not-found/NotFound.vue",
   "role": "общий",
   "module": "not-found",
   "status": "implemented",
   "auth": false,
   "priority": 3,
   "screenId": "APP-P-060-not-found",
   "title": "Страница не найдена",
   "version": "v2-2026-11-16",
   "shots": {
    "mobile": "shots/APP-P-060-not-found-mobile.png",
    "fold": "shots/APP-P-060-not-found-fold.png",
    "tablet": "shots/APP-P-060-not-found-tablet.png",
    "web": "shots/APP-P-060-not-found-web.png"
   },
   "meta": {
    "id": "APP-P-060-not-found",
    "title": "APP-P-060-not-found",
    "version": "v2-2026-11-16",
    "date": "2026-11-16",
    "stand": "app-staging.lovii.ru",
    "app_slice": "staging (текущий на 2026-11-16)",
    "profile": "+79009997009",
    "tool": "Playwright chrome, fullPage @2x: mobile 390×844, fold 717×844, tablet 1024×768, web 1440×900",
    "route": "/__no_such_page__",
    "final_url": "https://app-staging.lovii.ru/__no_such_page__",
    "states": {
     "default.png": "копия mobile.png",
     "mobile.png": "390×844",
     "fold.png": "717×844 (two-pane)",
     "tablet.png": "1024×768",
     "web.png": "1440×900"
    },
    "notes": "404-заглушка"
   }
  }
 ],
 "modals": [
  {
   "id": "APP-M-001-app-lock",
   "title": "APP-M-001 — Блокировка быстрого входа (AppLock)",
   "status": "живая",
   "component": "компонент AppLock — modules/profile-security/components/AppLock.vue; рендерится глобально из App.vue:124 (<AppLock v-if=\"appLocked\" />), import App.vue:13",
   "parent": "глобальный оверлей (App.vue) — поверх любой APP-P, когда включён быстрый вход и приложение заблокировано"
  },
  {
   "id": "APP-M-002-geolocation-map",
   "title": "APP-M-002 — Карта выбора адреса (GeolocationModule)",
   "status": "живая",
   "component": "компонент GeolocationModule — modules/geolocation-module/GeolocationModule.vue; fullscreen-оверлей через <Teleport to=\"body\"> (GeolocationModule.vue:168); точки входа: components/AppHeader.vue:7 (пилюля адреса в шапке) и modules/create-order/components/CreateOrderDeliveryType.vue:8 (шаг доставки чекаута)",
   "parent": "APP-P-001 (шапка — пилюля адреса, доступна на всех страницах с шапкой) и APP-P-007 (выбор адреса доставки на чекауте)"
  },
  {
   "id": "APP-M-003-address-select",
   "title": "APP-M-003 — Выбор адреса доставки (AddressSelectSheet)",
   "status": "живая",
   "component": "компонент AddressSelectSheet — components/AddressSelectSheet.vue; нижняя шторка на базе components/Ui/AppBottomSheet.vue (AddressSelectSheet.vue:4, инстанс :91). Точки входа: components/AppHeader.vue:8 (пилюля адреса), modules/geolocation-module/components/GeolocationSearch.vue:8 (кнопка «из сохранённых» внутри APP-M-002), modules/create-order/components/CreateOrderDeliveryType.vue:9 (чекаут, «карандаш» адреса)",
   "parent": "APP-P-001 (шапка) и APP-P-007 (шаг доставки чекаута); также внутри APP-M-002"
  },
  {
   "id": "APP-M-004-avatar-cropper",
   "title": "APP-M-004 — Кадрирование аватара (AvatarCropper)",
   "status": "живая",
   "component": "компонент AvatarCropper — modules/profile-edit/components/AvatarCropper.vue; нижняя шторка на базе AppBottomSheet (AvatarCropper.vue:2, инстанс :50). Точка входа: modules/profile-edit/components/ProfileEditForm.vue:12",
   "parent": "APP-P-013 (редактирование профиля)"
  },
  {
   "id": "APP-M-005-quick-access",
   "title": "APP-M-005 — Настройка быстрого входа (QuickAccessSheet)",
   "status": "живая",
   "component": "компонент QuickAccessSheet — modules/profile-security/components/QuickAccessSheet.vue; нижняя шторка на базе AppBottomSheet + собственный <Teleport to=\"body\"> (QuickAccessSheet.vue:2, 217). Точка входа: modules/profile-settings/ProfileSettings.vue:27",
   "parent": "APP-P-020 (настройки)"
  },
  {
   "id": "APP-M-006-partner-switcher",
   "title": "APP-M-006 — Свитчер юрлиц (PartnerSwitcher)",
   "status": "живая",
   "component": "компонент PartnerSwitcher — modules/roles-module/components/PartnerSwitcher.vue; нижняя шторка на базе AppBottomSheet (PartnerSwitcher.vue:2, инстанс :60, открывается только если юрлиц больше одного). Точка входа: modules/roles-module/CabinetLayout.vue:4,206 (по meta cabinetPartnerSwitcher)",
   "parent": "APP-P-044 (и другие страницы кабинета МСП в CabinetLayout — шапка кабинета)"
  },
  {
   "id": "APP-M-007-merchant-switcher",
   "title": "APP-M-007 — Свитчер мерчантов/брендов (MerchantSwitcher)",
   "status": "живая",
   "component": "компонент MerchantSwitcher — modules/roles-module/components/MerchantSwitcher.vue; нижняя шторка на базе AppBottomSheet (MerchantSwitcher.vue:4, инстанс :67). Точка входа: modules/roles-module/CabinetLayout.vue:5,222 (по meta cabinetPartnerSwitcher)",
   "parent": "APP-P-044 (и другие страницы кабинета МСП в CabinetLayout)"
  },
  {
   "id": "APP-M-008-branch-switcher",
   "title": "APP-M-008 — Свитчер точек (BranchSwitcher)",
   "status": "живая",
   "component": "компонент BranchSwitcher — modules/roles-module/components/BranchSwitcher.vue; нижняя шторка на базе AppBottomSheet (BranchSwitcher.vue:4, инстанс :73). Точка входа: modules/roles-module/CabinetLayout.vue:6,226 (по meta cabinetPartnerSwitcher)",
   "parent": "APP-P-044 (и другие страницы кабинета МСП в CabinetLayout)"
  },
  {
   "id": "APP-M-009-store-info",
   "title": "APP-M-009 — Информация о заведении (StoreInfoSheet)",
   "status": "живая",
   "component": "компонент StoreInfoSheet — modules/store-module/components/StoreInfoSheet.vue; нижняя шторка на базе AppBottomSheet (StoreInfoSheet.vue:4). Точка входа: modules/store-module/components/StoreCard.vue:4 (StoreCard рендерится на странице заведения — modules/store-module/StoreModule.vue:2)",
   "parent": "APP-P-004 (карточка заведения)"
  }
 ]
};
