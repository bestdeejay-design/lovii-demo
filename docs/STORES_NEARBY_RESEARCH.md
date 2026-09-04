# Stores Nearby — UI Research & Decision

**Module:** "Магазины рядом" (Stores Nearby) on the LOVII Search screen (`#search`).
**Question:** Show nearby stores as a vertical **list of rows**, or as a **grid of cards** (with photo)?
**Decision:** **Keep list-rows, refine them.** (No store photos in data model; industry consensus treats stores ≠ restaurants.)

---

## 1. Method

- Agent: `librarian` (open-source research, free model chain).
- Sources: web search + webfetch of real design systems, engineering blogs, and app-store/UX references for 8 delivery / quick-commerce apps.
- Companion code audit (`explore` agent): current `.p-order` implementation, `MOCK.stores` data model, existing card-grid patterns.

---

## 2. Per-App Findings

### Яндекс.Еда (Yandex.Eats) — Russian market
| Aspect | Finding |
|---|---|
| Layout | **Dual system**: Restaurants → photo-first vertical cards (16:9 hero). Stores (Пятёрочка, Перекрёсток, Магнит) → **vertical list** with store logo/icon + name + rating + distance. |
| Photo? | Yes for restaurants. **No hero photo for stores** — compact logo/badge tile. |
| Meta | Rating, delivery time, delivery fee, distance. |
| Source | App Store description ("список доступных ресторанов и магазинов"). Yandex.Eats has 60,000+ venues and deliberately separates the two presentations. |

### Delivery Club — Russia (merged into Yandex.Eats)
| Aspect | Finding |
|---|---|
| Layout | Historically same as Yandex.Eats. Post-acquisition unified into Yandex.Eats design. |
| Pattern | Restaurant = photo cards. Store/grocery = compact list rows with icon. |

### Glovo — Europe, Quick-Commerce
| Aspect | Finding |
|---|---|
| Layout | **Template-driven / category-dependent.** "Store Wall" uses different "Templates" per category. Food categories → card-based with photos. Retail categories → can switch to list/grid. |
| Photo? | Yes for restaurants/retail. Architecture supports Carousel, Grid, CategoryTile — server-driven, changes per category. |
| Source | Glovo Engineering blog (Medium, Nov 2024) on plugin-based Store Wall. Glovo BDUI showcase on GitHub confirms templates per category. |

### Wolt — Nordics
| Aspect | Finding |
|---|---|
| Layout | **Vertical list for the full store listing.** Discovery page uses horizontal carousels (cards) for featured. The dedicated "Stores" section (all non-restaurant venues) is a **scrollable list** sorted by ranking. |
| Photo? | Venues have an image URL (per API), but the list format uses **compact rows**, not hero cards. 2026 redesign highlights "product-first" browsing. |
| Meta | Rating, price level, delivery price, distance, opening hours. |
| Source | Wolt Algorithmic Transparency Report 2024 — explicitly documents separate recommendation algorithms for "Stores" vs "Restaurants". Wolt Internship 2025 API confirms venue objects carry name, short_description, image (icon/logo), details. |

### Samokat / Перекрёсток — Russia (Quick-Commerce Grocery)
| Aspect | Finding |
|---|---|
| Layout | **Product grid (2-column cards)** — but at the **product level**, not store level. Samokat is a single-brand dark store; there is no "stores nearby" list. |
| Photo? | **Heavy photo use** for product cards (photos, videos, combo visualizations). |
| Key learning | NOT comparable for store listing — single retailer. Product grid is a different pattern. |
| Source | hardclient.com Samokat UX review (Jun 2026). |

### Uber Eats — International
| Aspect | Finding |
|---|---|
| Layout | **Photo-first vertical feed of cards** (single column). Each card = 16:9 wide photo + name + rating + ETA + delivery fee. Borderless on white. |
| Photo? | **Mandatory.** Food photo is the primary selling element. |
| Store treatment | Grocery/Shop tab uses a **category-first** approach with a more compact layout. |
| Meta | ★ Rating, delivery time, delivery fee, promo badges. |
| Source | Uber Eats DESIGN.md (github.com/Meliwat/awesome-ios-design-md) — 200-line spec of the restaurant card component. |

### DoorDash — International
| Aspect | Finding |
|---|---|
| Layout | Similar to Uber Eats — **photo-first vertical card feed** for restaurants. Stores/groceries get a different, more compact layout. |
| Photo? | Yes for restaurants. |

### Swiggy / Zomato — India
| Aspect | Finding |
|---|---|
| Layout | **Photo-first cards** for restaurants in a vertical feed. Compact list for stores/non-restaurant. |
| Meta | Rating, delivery time, offers, distance. |
| Source | Mobbin design reference ("Swiggy iOS Restaurant List"). |

---

## 3. Concrete References (actually fetched)

| # | URL | What it shows |
|---|-----|---------------|
| 1 | [Uber Eats DESIGN.md — GitHub](https://github.com/Meliwat/awesome-ios-design-md/blob/main/design-md/food/uber-eats/DESIGN.md) | Complete spec: photo-first restaurant card (16:9 + name + rating + ETA + fee), category pills, sticky cart. Restaurants use photo cards; non-restaurant uses compact. |
| 2 | [Wolt Algorithmic Transparency Report 2024](https://press.wolt.com/en-WW/237306-algorithmic-transparency-consumers/) | Explicitly documents **separate "Stores" list** with a different ranking algorithm from restaurants. Confirms stores are a scrollable list of venues. |
| 3 | [Glovo Engineering: Store Wall Architecture](https://medium.com/glovo-engineering/how-we-engineered-a-scalable-architecture-to-power-videos-social-and-picks-in-our-delivery-app-1e0b7f7dfdca) | Template-driven Store Wall — different layouts per category. "Food" differs from "Retail." Supports Carousel, Grid, List per category — list used for utility categories. |
| 4 | [Glovo BDUI Showcase — GitHub](https://github.com/Glovo/glovo-bdui-showcase-android) | Sample implementation showing Card, Grid, Carousel components. Store UI is server-driven. |
| 5 | [Baymard Institute: 16 Restaurant List Design Examples](https://baymard.com/ecommerce-design-examples/restaurant-list) | Catalog of 16 real delivery-app designs (Uber Eats Q1 2024, Just Eat 2024). Industry-standard restaurant card patterns. |
| 6 | [Nielsen Norman Group: Card View vs List View](https://www.youtube.com/watch?v=3Zl_ZWuMetQ) | Academic backing: List views for data-heavy scanning/comparison; Cards for visual engagement/browsing. |
| 7 | [Samokat UX Review — hardclient.com](https://hardclient.com/samokat) | Samokat's product-level grid (2-column cards with photos). Not store-level listing. |

---

## 4. Synthesized Best-Practice

**There is NO universal "list vs grid" — there is a RESTAURANT vs STORE dichotomy.**

Every major delivery app uses **different layouts for restaurants vs. stores**:

```
                    RESTAURANTS                    STORES / SHOPS
                    ────────────                  ─────────────
Uber Eats    →  Photo card (hero image)        →  Category-first, compact list
Yandex.Eats  →  Photo card (16:9 food photo)   →  Logo + name + rating (list row)
Wolt         →  Photo card / carousel           →  Scrollable list of venues
Glovo        →  Cards (template-per-category)   →  Template-driven, often list
DoorDash     →  Photo card feed                 →  Compact list for stores
Swiggy/Zomato→ Photo cards                     →  List for non-restaurant
```

**Rules:**
1. **Restaurants → CARDS** with hero food photos. Photos drive discovery.
2. **Stores/Shops → LIST** rows (icon/logo + name + rating + distance). Utility drives choice, not visuals.
3. **Mixed feed** → hybrid (Glovo template approach) or separate tabs (Yandex.Eats / Wolt).
4. **Category-first** for stores: show a category selector/chip row first, then the list within category.

**Why list for stores?** (NN/g + Baymard)
- List is **space-efficient** — more stores per screen.
- List enables **sorting and comparison** by distance, rating, delivery fee.
- When there's no photo, **cards waste space** (empty image area or stretched icon).
- Stores are a **utility/filter view** — user wants "what's available near me," not "what looks nice."

---

## 5. Recommendation for LOVII (no store photos in data model)

**Recommendation: KEEP LIST-ROWS. Do NOT introduce cards.**

Rationale (evidence-grounded):
1. **Zero apps use photo-less cards for stores.** Every major app that shows stores without photos uses a compact list row (Yandex.Eats, Wolt). Cards without photos would be an anti-pattern with no industry precedent.
2. **The data model fits the list pattern perfectly.** LOVII has exactly what delivery-app store lists show: `icon/logo + name + rating + distance`. This is the Wolt "Stores" model and the Yandex.Eats "Магазины" model.
3. **Cards without photos = empty dark pattern.** Prem Pradeep's Uber Eats redesign critique specifically calls out: *"There are no alternative designs for items with no images. This results in wide blank spaces throughout the menu."* Cards without photos waste 40–50% of vertical space on blank rectangles.
4. **List rows are more scannable for "nearby" context** (NN/g: "List View allows for easy sorting and is space efficient").
5. **The Russian market uses list for stores** — Yandex.Eats (LOVII's primary competitor) uses compact list rows for магазины. This sets user expectations.
6. **Future-proofing:** If store photos (hero images) are added later, migrate to cards. The list→cards migration is straightforward.

**Refinement applied to the existing list (not a rewrite):**
- Make `.p-order` rows **tappable** (were dead — no handler).
- Replace partner-only `orders` / `revenue` with **ETA / delivery time** (what analogs show).
- Use a **circular emoji badge** as the visual anchor (like Yandex.Eats store logos) instead of a bare SVG icon.
- Add a **category tag** pill per row (reuse existing `.tag` system).
- Keep white background + border (no gray — per LOVII design rule).

---

## 6. Current LOVII Data Model (constraint)

From `js/data.js` → `MOCK.stores` (4 stores):

```js
stores: [
  { id: 1, name: 'Пекарня #23', category: 'bakery',    emoji: '🥐', rating: 4.8, distance: '1.2км', eta: '25 мин', address: 'ул. Тверская, 23', orders: 45, revenue: 54000, active: true },
  { id: 2, name: 'Цветы Fresh',  category: 'flowers',   emoji: '💐', rating: 4.9, distance: '2.3км', eta: '40 мин', address: 'ул. Арбат, 12',    orders: 28, revenue: 33600, active: true },
  { id: 3, name: 'Кофе daily',  category: 'coffee',    emoji: '☕', rating: 4.7, distance: '0.8км', eta: '15 мин', address: 'ул. Пушкина, 5',  orders: 62, revenue: 37200, active: true },
  { id: 4, name: 'Суши Мия',   category: 'restaurant', emoji: '🍣', rating: 4.6, distance: '3.1км', eta: '50 мин', address: 'ул. Новая, 42',   orders: 18, revenue: 21600, active: false },
]
```

- **NO `image` / `photo` / `logo` field.** Only `emoji` + category-derived SVG icon.
- Products (`MOCK.products`) DO have `image: 'assets/img/...jpg'` — but stores do not.
- A card redesign would require adding an `image` field + supplying assets; list needs neither.

---

## 7. Implementation (what shipped)

| File | Change |
|---|---|
| `js/data.js` | Added `eta` field to all 4 stores. |
| `js/screens/search.js` | `.p-order` → emoji badge (`.store-badge`) + category tag (`.tag`) + ETA (`.store-eta`); `data-store` + `data-nav="store"`. Removed partner-only `orders`/`revenue`. |
| `js/demo.js` | Added `.p-order` tap handler → `navigate('store/' + id)`. Rows now tappable. |
| `css/demo.css` | `.p-order` refined: 40×40 rounded emoji badge, tag + ETA on the right, `cursor:pointer` + `:active` pink border/shadow. White bg + border, no gray. |

**Verified:** LSP clean on `search.js` / `demo.js`; served files reflect all edits; old `store-orders`/`store-rev` removed.

---

## 8. Open Question

Tapping a store now navigates to `#store/{id}`, but **that screen does not exist yet** — the tap currently lands on empty content. Next step: build the Store detail screen (or decide stores open a filtered product list). Deferred per user direction.
