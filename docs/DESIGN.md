# LOVII Design System

> Canonical, source-of-truth design language for the LOVII demo app (fake phone-frame SPA).
> This document MUST match `css/demo.css` exactly. Where the code diverges from a
> recommended convention, the divergence is called out explicitly under
> **"Use this, not that"** and listed in **Known Gaps To Fix**.
>
> Downstream consumers: CSS, JS, UI/UX, and data agents all build from this file.
> It is self-contained — do not infer tokens that are not listed here.

---

## 0. Base Rules (non-negotiable)

These are the project's stated base rules. They override any local convenience in the code.

1. **No gray page backgrounds.** The app page background is `--bg` (`#ffffff`). The only
   "gray" token, `--surface-secondary` (`#F8F8F8`), is a *card fill*, never a page/section
   background. Do not introduce gray page backgrounds.
2. **Spacing follows the home-screen rules.** Horizontal content padding is `16px` everywhere
   (see `--space-*` scale). Do not invent ad-hoc horizontal insets.
3. **Emoji icons are banned.** All icons are Tabler-style SVG `<symbol>` sprites using
   `currentColor`. Emoji currently appear in `.or-emoji`, `.role-icon`, `.store-badge`, and
   `.status-banner .rank-icon` — these are **legacy and must be replaced** (see Known Gaps).
4. **One canonical card radius.** `12px` via `--radius-lg`. The ad-hoc `14px` literals in the
   code are drift and must be unified (see Known Gaps).
5. **One elevation token.** Card shadow is `0 1px 3px var(--shadow)` (soft). The heavier
   `0 2px 12px` shadows on the home-screen cards are legacy and should converge (see Known Gaps).

---

## 1. Design Tokens (every custom property in `demo.css`)

This is the complete, verbatim list of CSS custom properties currently defined in
`css/demo.css` `:root`. **Do not invent tokens that are not in this table.**

### 1.1 Brand / Accent

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--pink` | `#f64a8a` | yes | Primary brand accent |
| `--pink-light` | `rgba(246,74,138,0.12)` | yes | Pink tint (badges, soft fills) |
| `--pink-mid` | `rgba(246,74,138,0.06)` | yes | Faint pink (role-card.active bg) |
| `--pink-dark` | `#c92a6a` | yes | Pink gradient end (banners) |
| `--tiffany` | `#0ABAB5` | yes | Secondary accent (teal) |
| `--tiffany-light` | `rgba(10,186,181,0.10)` | yes | Tiffany tint |
| `--chiffon` | `#F5E6CC` | yes | Gold tint fill (menu-item icon-box) |
| `--sand` | `#E8D5B7` | yes | Gold-family text on chiffon |
| `--gold` | `#D4A854` | yes | Gold accent (grid-item .iw.chiffon, cat-tile.t-gold) |
| `--gold-light` | `rgba(212,168,84,0.12)` | yes | Gold tint |

### 1.2 Shadows (color-only rgba — paired with a blur/offset at use site)

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--shadow-sm` | `rgba(0,0,0,0.04)` | yes | Used as `0 2px 12px var(--shadow-sm)` (top-card) |
| `--shadow` | `rgba(0,0,0,0.06)` | yes | Canonical soft shadow: `0 1px 3px var(--shadow)` |
| `--pink-shadow` | `rgba(246,74,138,0.2)` | yes | Glow on pink icon boxes |
| `--tiffany-shadow` | `rgba(10,186,181,0.2)` | yes | Glow on tiffany icon boxes |
| `--gold-shadow` | `rgba(212,168,84,0.25)` | yes | Glow on gold icon boxes |

### 1.3 On-colored overlays

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--on-pink-text` | `rgba(255,255,255,0.9)` | yes | Text on pink gradient |
| `--on-pink-overlay` | `rgba(255,255,255,0.15)` | yes | Circle bg / timer bg on pink gradient |

### 1.4 Semantic extras

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--star` | `#FBBF24` | **NO** | Dead token — defined, never referenced. Remove. |

### 1.5 Surfaces

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--bg` | `#ffffff` | yes | Page + white card background |
| `--surface` | `#ffffff` | **NO** | Dead token — defined, never referenced as a value. Remove. |
| `--surface-secondary` | `#F8F8F8` | yes (9×) | Light-gray card fill. Allowed as card fill ONLY, never page bg. |
| `--border` | `#EEEEEE` | yes | Hairline border |
| `--border-strong` | `#DDDDDD` | yes | Hover/active border |

### 1.6 Text

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--text-primary` | `#1a1a1a` | yes | Headings, primary text |
| `--text-secondary` | `#888888` | yes | Secondary/meta text |
| `--text-dim` | `#bbbbbb` | yes | Dim labels, inactive nav |

### 1.7 Semantic status

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--success` | `#34D399` | yes | Success text/icon |
| `--success-light` | `rgba(52,211,153,0.12)` | yes | Success tint |
| `--warning` | `#FBBF24` | **NO** | Dead token — defined, never referenced. Remove. |
| `--danger` | `#EF4444` | **NO** | Dead token — defined, never referenced. Remove. |
| `--danger-light` | `rgba(239,68,68,0.12)` | **NO** | Dead token — defined, never referenced. Remove. |

### 1.8 Radii

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--radius-sm` | `6px` | yes | Small chips, price-tag, store-view-toggle |
| `--radius-md` | `10px` | yes | Icon boxes (menu-item, chip), order-row icon-box |
| `--radius-lg` | `12px` | yes | **CANONICAL card radius** |
| `--radius-xl` | `16px` | yes | Banner radius (status-banner, profile-banner) |

### 1.9 Layout

| Token | Value | Used? | Notes |
|---|---|---|---|
| `--header-h` | `44px` | yes | App header height |
| `--nav-h` | `50px` | yes | Bottom nav height |
| `--safe-bottom` | `env(safe-area-inset-bottom, 0px)` | yes | iOS safe area |

---

## 2. Canonical Scales (recommended set + drift corrections)

The code has drifted in four scales. Below is the **recommended canonical set** the team
should converge on, with explicit "use this, not that" guidance.

### 2.1 Radius Scale — **ONE canonical card radius: 12px**

| Purpose | Use | Avoid |
|---|---|---|
| Card / tile / panel | `var(--radius-lg)` = **12px** | `border-radius: 14px` (ad-hoc literal) |
| Banner (gradient blocks) | `var(--radius-xl)` = 16px | — |
| Icon box (32px) | `var(--radius-md)` = 10px | — |
| Small chip / price-tag | `var(--radius-sm)` = 6px | — |
| Pill (buttons, tags, badges) | `border-radius: 100px` | — |

**Use this, not that:** Every card in the code should use `var(--radius-lg)` (12px).
Currently **5 rules hardcode `border-radius: 14px`** (`.top-card`, `.orders-card`,
`.promo-banner`, `.grid-item`, `.balance-card`). These are drift — replace with
`var(--radius-lg)`. See Known Gaps §K2.

### 2.2 Shadow / Elevation Scale — **ONE elevation token**

| Level | Declaration | Use |
|---|---|---|
| Soft (canonical card) | `0 1px 3px var(--shadow)` | `.card`, `.metric-block`, `.stat-block`, `.menu-item`, `.p-order`, `.store-card`, `.search-bar`, `.progress-block` |
| Glow (accent icon box) | `0 4px 10px var(--pink-shadow \| --tiffany-shadow \| --gold-shadow)` | `.grid-item .iw`, `.chip .iw`, `.cat-tile.active` |
| Hover lift | `0 4px 12px var(--shadow)` + `translateY(-1px)` | `.grid-item:hover` |

**Use this, not that:** The home-screen cards (`.top-card`, `.orders-card`, `.balance-card`)
currently use the heavier `0 2px 12px var(--shadow)` (or `var(--shadow-sm)`). This is a
second, inconsistent elevation. Converge all cards to `0 1px 3px var(--shadow)` unless a
deliberate "raised" treatment is approved. See Known Gaps §K3.

### 2.3 Spacing Scale — **recommended `--space-*` tokens**

The code uses raw `px` values consistently. Map them to these recommended tokens so future
work shares one vocabulary:

| Token | Value | Where it appears in code |
|---|---|---|
| `--space-1` | `4px` | `.top-card-divider` margin-top, `.order-row + .order-row` gaps, `.tab-bar` margin, `.chip-row` padding |
| `--space-2` | `8px` | Grid gap, `.card + .card` margin, `.metric-row` gap, `.section-top`, horizontal card padding insets |
| `--space-3` | `12px` | `.card` padding, `.p-order` padding, `.menu-item` padding, `.progress-block` padding |
| `--space-4` | `16px` | **Canonical horizontal content padding** (every screen), `.top-card`/`.orders-card`/`.balance-card` margins |
| `--space-5` | `22px` | `.section-label` top/bottom margin (22px / 12px) |

**Rule:** Horizontal content padding is **always 16px** (`--space-4`). Vertical rhythm uses
`--space-2` (8px) and `--space-3` (12px). Do not introduce other horizontal insets.

### 2.4 Typography Ramp

Base: `font-family: 'Inter', -apple-system, sans-serif;` `font-size: 14px; line-height: 1.4;`
Weights loaded: 400, 500, 600, 700, 800.

| Role | Size | Weight | Color | Example class |
|---|---|---|---|---|
| Display / hero name | `22px` | 700 | `--text-primary` / `--pink` | `.balance-amount`, `.detail-info .name` |
| Section title | `15px` | 700 | `--text-primary` | `.section-label`, `.top-card-title`, `.top-title` |
| Banner strong | `15px` | 700 | white / `--bg` | `.promo-banner .text strong`, `.status-banner .income .val` |
| Body / input | `13px` | 400–600 | `--text-primary` | `.or-name`, `.search-bar input`, `.oname` |
| Sub-body | `11px` | 500–600 | `--text-secondary` | `.table-row .name`, `.menu-item .text .sub`, `.cat-name` |
| Small / meta | `10px` | 500–600 | `--text-secondary` / `--text-dim` | `.top-card-sub`, `.balance-label`, `.or-meta` |
| Tiny / caption | `9px` | 600–700 | `--text-secondary` / accent | `.tag`, `.top-card-timer`, `.grid-item` label |
| Micro badge | `8px` | 700 | accent | `.top-card-badge` |

**Weight convention:** 700 = emphasis/headline, 600 = semibold label, 500 = normal-medium,
400 = body. Buttons: 600. Tags/badges: 600–700.

---

## 3. Icon System

### 3.1 Policy (MANDATORY)

- **All icons are SVG `<symbol>` sprites** rendered via `<svg class="icon"><use href="#i-{name}"/></svg>`.
- **Source:** Tabler Icons (outline, 24×24, `stroke="currentColor"`, `stroke-width="2"`,
  round caps). Repo: `tabler/tabler-icons`, raw: `https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/{name}.svg`.
- **Exception — Sushi:** No major set ships a sushi glyph. `i-sushi` is sourced from
  **Lucide Lab** (`lucide-icons/lucide-lab`, `icons/sushi-2.svg`) — same 24×24 stroke style.
- **Color:** always `currentColor`. Never hardcode `fill`/`stroke` hex in a symbol.
- **Banned:** emoji, hardcoded colors (`fill="#141B34"` etc.), non-24×24 viewBox without normalization.
- **Sprite location:** `#app-sprite` in `index.html`. JS helper: `Icon(name, cls)`.

### 3.2 Size-pairing table (icon size ↔ text size)

Icons are paired to the type size of their context. Use this table — do not free-size.

| Text size | Paired icon size | Class / context |
|---|---|---|
| `12px` | **16px** | `.icon-sm`, `.section-label a`, `.menu-item .arrow`, `.search-bar .icon`, `.chip .icon` |
| `14px` | **20px** | `.icon` (default), `.nav-item` base context |
| `16px` | **24px** | `.icon-lg`, `.profile-banner .avatar .icon` |
| `10–11px` | **14px** | `.top-card-loc .icon`, `.top-card-timer .icon`, `.promo-banner .timer .icon`, `.quick-btn .icon` |
| `22px` tile | **22px** | `.grid-item .iw .icon`, `.nav-item .icon` |
| `26px` tile | **26px** | `.cat-tile .icon` |

> Note: `.nav-item .icon` is 22px (paired to the 9px nav label by visual weight, not the
> 14px rule) — this is intentional and matches the bottom-nav spec.

### 3.3 Available symbols in `#app-sprite` (30 total, current)

Utility: `i-home`, `i-search`, `i-package`, `i-user`, `i-bell` (reserved, unused in nav),
`i-store` (reserved), `i-star`, `i-bar-chart`, `i-users`, `i-building`, `i-zap` (utility,
unused in UI), `i-settings`, `i-map-pin`, `i-shopping-bag`, `i-gift` (defined twice — see
Known Gaps §K5), `i-clock`, `i-wallet`, `i-trending-up`, `i-chevron-right`, `i-chevron-left`,
`i-plus`, `i-check`, `i-arrow-left`, `i-log-out`, `i-bread`, `i-flower`, `i-sushi`,
`i-coffee`, `i-discount`.

### 3.4 SVG sprite convention (a11y)

Each `<symbol>` MUST carry a `<title>` child for accessibility. **Current state: ALL 30
symbols lack `<title>`** — this triggers the pre-existing LSP `noSvgWithoutTitle` warning.
Fix pattern:

```html
<symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <title>Home</title>
  <path .../>
</symbol>
```

See Known Gaps §K4.

---

## 4. Component Library

Every component below is implemented in `demo.css` (+ `js/components.js` where noted).
Class names are the contract — use them as written.

### 4.1 Shell & Layout

#### App Shell `#app`
Flex column, `height: 100dvh`, `max-width: 480px`, centered. Contains header, `#app-content`, `#app-nav`.

#### Header `#app-header`
`height: var(--header-h)` (44px); `padding: 8px 16px`; flex space-between; `background: var(--bg)`.
- `#app-logo` — `height: 28px` (left).
- `.header-actions` — flex, `gap: 12px` (right). Contains `.cart-btn` and `.avatar-wrap`.
- `.avatar-wrap` — `position: relative`.
- `.avatar-icon` — `28×28px`, `border-radius: 8px`, `background: var(--bg)`, `1px solid var(--border)`; inline SVG (person + checkmark).
- `.notif-dot` — `10×10px`, `background: var(--pink)`, `2px solid var(--bg)`, `border-radius: 50%`, absolute `top:-2px; right:-2px`.
- `.cart-btn` — `height: 28px`, `background: var(--pink)`, `border-radius: 8px`, contains `.cart-icon` (22×28px) + `.cart-num` (13px/700, white).

**Rules:** No bell icon in header — logo (left) + cart + avatar (right) only. Logo and avatar equal 28px. 8px edge spacing.

#### Content Area `#app-content`
`flex: 1; overflow-y: auto; padding: 8px 0 0`. InnerHTML swapped on navigation.

#### Bottom Nav `#app-nav` + `.nav-item`
`height: calc(var(--nav-h) + var(--safe-bottom))`; `padding: 4px 0 calc(4px + var(--safe-bottom))`; `border-top: 1px solid var(--border)`; `background: var(--bg)`.
- `.nav-item` — flex column, `gap: 2px`, `font-size: 9px`, `font-weight: 500`, `color: var(--text-dim)`; `.icon` 22×22px.
- `.nav-item.active` — `color: var(--pink)`; icon `color: var(--pink)`.
- Tabs: `home` (`i-home`), `search` (`i-search`), `orders` (`i-package`), `profile` (`i-user`).

#### Splash `#splash`
`position: fixed; inset: 0; z-index: 9999; background: var(--bg)`. `.splash-cover` animates
`slide-cover 1.2s cubic-bezier(0.16,1,0.3,1)`. `.hidden` → opacity 0. JS: `showSplash()`.

### 4.2 Shared UI Components

#### Icons `.icon` / `.icon-sm` / `.icon-lg`
See §3. Base: `.icon` 20×20, `.icon-sm` 16×16, `.icon-lg` 24×24.

#### Card `.card`
`background: var(--surface-secondary)`; `border-radius: var(--radius-lg)`; `padding: 12px`;
`box-shadow: 0 1px 3px var(--shadow)`. `.card + .card { margin-top: 8px }`.
> **Drift note:** `.card` uses `--surface-secondary` (gray) as fill. Per base rule #1 this is
> allowed *only* as a card fill, not a page bg. If a white card is wanted, use `--bg`.

#### Section Label `.section-label`
Flex space-between; `font-size: 15px`, `font-weight: 700`, `color: var(--text-primary)`,
`letter-spacing: -0.2px`; `padding: 0 16px`; `margin: 22px 0 12px` (first-of-type `margin-top: 4px`).
Optional `a` link: `color: var(--pink)`, `font-weight: 600`, `font-size: 12px`.

#### Buttons `.btn` + variants
`display: inline-flex`; `padding: 8px 16px`; `border-radius: 100px`; `font-size: 12px`;
`font-weight: 600`. Variants: `.btn-primary` (`--pink` bg, `--bg` text), `.btn-ghost`
(transparent, `1px solid var(--border)`, `--text-secondary` text), `.btn-tiffany` (`--tiffany`
bg, `--bg` text), `.btn-sm` (`padding: 6px 12px; font-size: 10px; min-height: 36px`),
`.btn-block` (`display: flex; width: 100%`).

#### Tags `.tag` + `.tag-*`
`display: inline-flex`; `padding: 2px 8px`; `border-radius: 100px`; `font-size: 9px`;
`font-weight: 600`. Variants: `.tag-pink` (`--pink-light`/`--pink`), `.tag-tiffany`
(`--tiffany-light`/`--tiffany`), `.tag-success` (`--success-light`/`--success`), `.tag-gray`
(`--surface-secondary` + `1px solid var(--border)` / `--text-secondary`).

#### Badge `.badge` + `.b-*`
`display: inline-flex`; `gap: 4px`; `font-size: 9px`; `font-weight: 700`; `text-transform: uppercase`;
`letter-spacing: 0.4px`; `padding: 3px 8px`; `border-radius: 100px`; `color: #fff`;
`box-shadow: 0 3px 8px rgba(0,0,0,0.18)`. Variants: `.b-pink`, `.b-tiffany`, `.b-gold`, `.b-dark`
(`--text-primary`). Used in `.store-card .cat-badge` and `.product-card .badges`.

### 4.3 Data Display

#### Metric Block `.metric-row` / `.metric-block`
Grid 3 cols, `gap: 8px`, `padding: 0 16px`. `.metric-block`: `background: var(--surface-secondary)`,
`border-radius: var(--radius-lg)`, `padding: 10px`, `box-shadow: 0 1px 3px var(--shadow)`,
text-align center. `.val` 17px/700 (`.pink`/`.tiffany` color), `.lbl` 10px uppercase `--text-secondary`.

#### Stats Grid `.stats-grid-2` / `.stat-block`
Grid 2 cols, `gap: 8px`, `padding: 0 16px`. `.stat-block`: `background: var(--surface-secondary)`,
`border-radius: var(--radius-lg)`, `padding: 10px`, `box-shadow: 0 1px 3px var(--shadow)`.
`.val` 16px/700, `.lbl` 10px uppercase `--text-secondary`.

#### Status Banner `.status-banner`
`margin: 0 16px; padding: 12px`; pink→`--pink-dark` gradient; `border-radius: var(--radius-xl)`;
flex align-center `gap: 10px`. `.rank-icon` 36×36px circle, `background: var(--on-pink-overlay)`,
**currently emoji** (legacy — replace with SVG). `.info .title` 13px/700 white, `.info .sub`
10px opacity 0.8. `.income .val` 15px/700, `.income .lbl` 9px opacity 0.8.

#### Progress Block `.progress-block` / `.bar` / `.bar-fill`
`margin: 8px 16px; padding: 12px`; `background: var(--surface-secondary)`;
`border-radius: var(--radius-lg)`; `box-shadow: 0 1px 3px var(--shadow)`. `.bar` 4px,
`--border` bg, pill; `.bar-fill` `--pink`, transition width 0.3s.

#### Table Row `.table-row` (in `.table-list`)
Flex space-between; `padding: 8px 0`; `border-bottom: 1px solid var(--border)` (last child none).
`.name` 11px/500, `.meta` 10px `--text-secondary`, `.value` 11px/600.

#### Profile Banner `.profile-banner`
`margin: 0 16px; padding: 16px`; pink→`--pink-dark` gradient; `border-radius: var(--radius-xl)`;
text-align center; `color: var(--bg)`. `.avatar` 48×48px circle, `background: var(--on-pink-overlay)`,
`.icon` 24×24px white. `.name` 16px/700, `.sub` 11px opacity 0.8.

### 4.4 Interactive / Navigation

#### Menu Item `.menu-item` (in `.menu-list`)
Flex align-center `gap: 10px`; `padding: 12px`; `background: var(--bg)`; `1px solid var(--border)`;
`border-radius: var(--radius-lg)`; `margin-bottom: 8px`; `box-shadow: 0 1px 3px var(--shadow)`.
`.icon-box` 32×32px, `border-radius: var(--radius-md)`. Variants: `.pink` (`--pink-light` bg,
`--pink` icon), `.tiffany` (`--tiffany-light` bg, `--tiffany` icon), `.chiffon-bg` (`--chiffon`
bg, `--sand` icon), `.dim` (`--tiffany-light` bg, `--tiffany` icon). `.text .title` 13px/500,
`.text .sub` 11px `--text-secondary`. `.arrow` 16×16px `--text-dim`.

#### Quick Actions Bar `.quick-bar` / `.quick-btn`
`.quick-bar` flex `gap: 6px`, `padding: 0 16px`. `.quick-btn` flex:1, `padding: 8px 12px`,
`border-radius: 100px`, `min-height: 36px`, `background: var(--pink-light)`, `font-size: 10px`,
`font-weight: 600`, `color: var(--pink)`, `.icon` 14×14px `--pink`. `.quick-btn.ghost`
(transparent, `1px solid var(--border)`, `--text-secondary`).

#### Tab Bar `.tab-bar` / `.tab-item`
Flex; `padding: 0 16px`; `margin-bottom: 10px`; `border-bottom: 1px solid var(--border)`.
`.tab-item` `padding: 10px 0 8px`, `font-size: 12px`, `font-weight: 500`, `color: var(--text-dim)`,
`border-bottom: 2px solid transparent`. `.tab-item + .tab-item { margin-left: 16px }`.
`.tab-item.active` → `--pink` text + `--pink` bottom border.

#### Search Bar `.search-bar`
Flex align-center `gap: 8px`; `margin: 0 16px 8px`; `padding: 10px 14px`;
`background: var(--surface-secondary)`; `border-radius: var(--radius-lg)`;
`box-shadow: 0 1px 3px var(--shadow)`. `.icon` 16×16px `--text-dim`. `input` 13px, no border.

#### Category Chips `.cat-row` / `.cat-chip` / `.cat-tile`
`.cat-row` flex, `gap: 14px`, `overflow-x: auto`, `padding: 4px 16px 14px`. `.cat-chip` flex
column `gap: 7px`, `width: 64px`. `.cat-tile` 56×56px, `border-radius: var(--radius-lg)`,
`.icon` 26×26px. `.cat-name` 11px/600 `--text-secondary`. Active: `.cat-tile.t-pink/t-tiffany/
t-gold` fills solid accent + `0 4px 10px` glow, icon white, `.cat-name` → `--text-primary`/700.
Tile variants: `.t-pink` (`--pink-light`/`--pink`), `.t-tiffany` (`--tiffany-light`/`--tiffany`),
`.t-gold` (`--gold-light`/`--gold`).

#### Chip `.chip` / `.chip .iw`
`.chip` flex align-center `gap: 6px`; `padding: 8px 14px`; `border-radius: var(--radius-md)`;
`min-height: 32px`; `background: #fff` (hardcoded — see Known Gaps §K1); `1px solid var(--border)`;
`font-size: 11px`, `font-weight: 600`, `--text-primary`. `.chip .iw` 22×22px,
`border-radius: var(--radius-sm)`, variants `.pink`/`.tiffany`/`.chiffon` (solid accent + glow,
white icon). `.chip.active` → `--pink-mid` bg, `--pink` border.

#### Role Card `.role-grid` / `.role-card`
`.role-grid` grid 2 cols, `gap: 8px`, `padding: 0 16px`. `.role-card` flex column `gap: 6px`,
`padding: 14px 8px`, `border-radius: var(--radius-lg)`, `border: 2px solid var(--border)`,
`background: var(--bg)`. `.role-icon` **24px emoji (legacy — replace with SVG)**. `.role-name`
11px/600 `--text-primary`, `.role-desc` 9px `--text-secondary`. `.role-card.active` → `--pink`
border + `--pink-mid` bg.

#### Top Card (location + promo) `.top-card`
`margin: 8px 16px`; `background: var(--bg)`; `1px solid var(--border)`; **`border-radius: 14px`
(drift — should be `--radius-lg`)**; `box-shadow: 0 2px 12px var(--shadow-sm)` (drift — should
be `0 1px 3px var(--shadow)`); `overflow: hidden`. Sub-parts: `.top-card-loc` (11px `--text-dim`,
`.icon` 14×14px, city `span` 600 `--text-primary`), `.top-card-change` (`--pink`, 500, margin-left
auto), `.top-card-divider` (1px `--border`), `.top-card-body` (flex space-between, `padding: 12px
14px 8px`), `.top-card-badge` (8px/700 `--pink` on `--pink-light`, pill, uppercase), `.top-card-title`
(15px/700), `.top-card-sub` (10px `--text-secondary`), `.top-card-timer` (`--pink-light` pill, 9px/600,
`.icon` 12×12px), `.top-card-action`, `.top-card-link` (`--tiffany`, 10px/600, `.icon` 12×12px).

#### Orders Card `.orders-card`
`margin: 0 16px`; `background: var(--bg)`; **`border-radius: 14px` (drift)**; `padding: 4px 14px`;
`box-shadow: 0 2px 12px var(--shadow)` (drift). Contains `.order-row` (flex space-between,
`padding: 13px 0`, divider `1px solid var(--border)` between rows). `.order-row .icon-box` 32×32px,
`border-radius: 10px`, `.pink`/`tiffany` bg + glow, **`.or-emoji` 15px emoji (legacy — replace)**.
`.or-name` 13px/600, `.or-meta` 9px `--text-secondary`, `.or-price` 13px/700, `.right` gap 6px.

#### Balance Card `.balance-card`
`margin: 10px 16px 0`; `padding: 14px 16px`; `background: var(--bg)`; **`border-radius: 14px`
(drift)**; `box-shadow: 0 2px 12px var(--shadow)` (drift); flex space-between. `.balance-label`
10px uppercase `--text-dim`, `.balance-amount` 22px/700 (`.pink` → `--pink`), `.unit` 13px/500
`--text-secondary`, `.balance-sub` 10px `--text-secondary`, `.balance-link` 10px/600 `--tiffany`.

#### Promo Banner `.promo-banner`
`margin: 0 16px`; pink→`--pink-dark` gradient; **`border-radius: 14px` (drift — should be
`--radius-xl` or `--radius-lg`)**; `padding: 12px 14px`; flex space-between. `.text` 11px/500
`--on-pink-text`, `.text strong` 15px/700 `--bg`. `.timer` `--on-pink-overlay` pill, 9px/600
`--bg`, `.icon` 14×14px.

#### Partner Order Card `.p-order`
Flex space-between `gap: 8px`; `padding: 10px`; `background: var(--bg)`; `1px solid var(--border)`;
`border-radius: var(--radius-lg)`; `margin-bottom: 8px`; `box-shadow: 0 1px 3px var(--shadow)`;
`:active` → `--pink` border + `0 2px 8px var(--pink-shadow)`. `.left` (`.store-badge` 40×40px,
`border-radius: 12px`, **`.store-badge` uses 20px emoji (legacy — replace)**; `.store-info`,
`.oname` 13px/600, `.or-meta` 9px `--text-secondary`). `.right` (`.store-eta` 11px/600, `.tag`).
Also `.thumb` 48×48px `border-radius: 12px`.

#### Store Card `.store-grid2 .store-card`
Grid 2 cols (`--store-grid2`), `gap: 10px`. `.store-card` `background: var(--bg)`, `1px solid
var(--border)`, `border-radius: var(--radius-lg)`, `overflow: hidden`, `box-shadow: 0 1px 3px
var(--shadow)`. `.cover` 1:1 `--surface-secondary` bg. `.cat-badge` absolute top/right 8px, pill,
9px/700 uppercase, `color: #fff` (hardcoded), `.b-pink`/`.b-tiffany` bg. `.body` `padding: 10px`,
`.oname` 13px/600, `.eta` 11px/600, `.meta` 9px `--text-secondary`. Toggle: `.store-view-toggle`
34×34px, `border-radius: 9px`, `--surface-secondary` bg, swaps `.ic-list`/`.ic-grid` by
`data-layout`.

#### Product Card `.product-card`
Grid 2 cols (`.product-grid`), `gap: 10px`. `.product-card` flex column, `background: #fff`
(hardcoded — see §K1), `1px solid var(--border)`, `border-radius: var(--radius-lg)`,
`box-shadow: 0 1px 4px var(--shadow)`, `overflow: hidden`. `.media`/`.thumb` 1:1
`--surface-secondary` bg. `.badges` (top-right), `.price-tag` (top-left, `border-radius: 8px`,
`background: rgba(0,0,0,0.45)`, `color: #fff`, 14px/800, `.old` 9px strike), `.caption`
(bottom, `rgba(0,0,0,0.45)`, `.glass-edge` top hairline), `.store` 9px uppercase, `.pname` 13px/600,
`.add-btn` (`--pink` bg, `color: #fff`, pill), `.qty`/`.qty-btn`/`.count` (pink pill stepper).

#### Section Padding Helpers
`.section-pad` (`padding: 0 16px`), `.section-margin` (`margin: 0 16px`), `.section-top`
(`padding-top: 8px`).

#### Top Bar (detail screens) `.top-bar` / `.back-btn` / `.top-title`
`.top-bar` flex `gap: 12px`, `padding: 14px 16px`, sticky top, `background: var(--bg)`,
`border-bottom: 1px solid var(--border)`. `.back-btn` 36×36px circle, `1px solid var(--border)`,
`background: #fff` (hardcoded), 20px `--text-primary`. `.top-title` 15px/600.

#### Product Detail `.product-detail` / `.hero` / `.detail-info`
`.product-detail` `max-width: 520px; margin: 0 auto`. `.hero` 300px, `.hero-img` cover
`--surface-secondary` bg. `.detail-info` `padding: 14px 16px 24px`: `.store` 11px uppercase
`--text-secondary`, `.name` 22px/700, `.price` 20px/700 `--pink`, `.desc` 13px/1.6
`--text-secondary`. `.qty-detail` pink pill stepper. `.add-big` (`--pink` bg, `color: #fff`,
14px/700, `border-radius: var(--radius-lg)`). `.empty-state` centered 14px `--text-secondary`.

---

## 5. Known Gaps To Fix (drift backlog)

These are concrete divergences from the canonical scales above. They are the action items for
the CSS/JS agents before the build agent finishes.

### K1. Hardcoded `#fff` instead of `--bg` token
**16 hardcoded `#fff`/`#ffffff` usages** in component rules (2 more are the `--bg`/`--surface`
token definitions themselves). Replace with `var(--bg)`:
- `.store-grid2 .store-card .cat-badge` (color: #fff)
- `.cat-chip.active .cat-tile.t-pink/.t-tiffany/.t-gold .icon` (color: #fff)
- `.chip` (background: #fff)
- `.chip .iw.pink/.tiffany/.chiffon .icon` (color: #fff)
- `.product-card` (background: #fff)
- `.product-card .price-tag` / `.caption` (color: #fff)
- `.product-card .add-btn` / `.add-big` (color: #fff)
- `.badge` (color: #fff)
- `.cart-num` (color: #fff)
- `.back-btn` (background: #fff)

### K2. 14px radius must become 12px (`--radius-lg`)
5 rules hardcode `border-radius: 14px`: `.top-card`, `.orders-card`, `.promo-banner`,
`.grid-item`, `.balance-card`. Replace with `var(--radius-lg)`.

### K3. Dual elevation — converge to one card shadow
Home-screen cards (`.top-card`, `.orders-card`, `.balance-card`) use `0 2px 12px var(--shadow)`
/ `var(--shadow-sm)`. Canonical card shadow is `0 1px 3px var(--shadow)`. Unify unless a
deliberate raised treatment is approved.

### K4. SVG `<title>` missing on all 30 symbols
Every `<symbol>` in `#app-sprite` lacks a `<title>` child → LSP `noSvgWithoutTitle` warning.
Add `<title>{Name}</title>` inside each symbol (see §3.4).

### K5. Dead tokens to remove
`--surface`, `--warning`, `--danger`, `--danger-light`, `--star` are defined but never
referenced. Remove from `:root` (or wire them in if a future component needs them).

### K6. Emoji icons are banned — replace legacy emoji
Emoji still appear in: `.or-emoji` (order-row icon-box), `.role-icon` (role-card),
`.store-badge` (p-order), `.status-banner .rank-icon`. Replace each with a Tabler SVG symbol
(`Icon(name)`) per §3.1.

### K7. Duplicate `i-gift` symbol
`index.html` defines `i-gift` twice (lines 84 and 98) with different paths. De-duplicate to a
single canonical `i-gift`.

### K8. `--surface-secondary` as card fill
`--surface-secondary` (`#F8F8F8`) is used as the fill for `.card`, `.metric-block`,
`.stat-block`, `.progress-block`, `.search-bar`, `.p-order .store-badge` context, covers, and
`.tag-gray`. This is permitted *only* as a card fill (base rule #1), never a page background.
If white cards are desired for consistency, switch these to `var(--bg)`.

---

## 6. Color Summary (the real design language)

- **Brand pink:** `--pink` `#f64a8a` (primary), with `--pink-light` / `--pink-mid` / `--pink-dark`.
- **Tiffany teal:** `--tiffany` `#0ABAB5` (secondary), with `--tiffany-light`.
- **Gold:** `--gold` `#D4A854` (tertiary, used for "Акции"/"Настройки" accents), with `--gold-light`, `--chiffon`, `--sand`.
- **Neutrals:** `--bg` `#ffffff`, `--surface-secondary` `#F8F8F8` (card fill only), `--border`
  `#EEEEEE`, `--border-strong` `#DDDDDD`, text `--text-primary` `#1a1a1a` / `--text-secondary`
  `#888888` / `--text-dim` `#bbbbbb`.
- **Status:** `--success` `#34D399` (used); `--warning`/`--danger` defined but dead.

Accent assignment (grid menu): Каталог/Бонусы/Города = pink; Заказы/Отчёты/Команда = tiffany;
Акции/Настройки = gold (`.iw.chiffon` maps to `--gold`).
