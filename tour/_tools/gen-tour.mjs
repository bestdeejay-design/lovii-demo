#!/usr/bin/env node
/**
 * gen-tour.mjs — генератор презентационной страницы /tour/
 *
 * Читает:
 *   · манифест экранов  (SCREEN_MAP_MANIFEST, по умолчанию ~/LOVII/screen-map-manifest.json)
 *   · скрины            (SCREENS_ROOT,     по умолчанию ~/Projects/lovii_docs/screens)
 *   · tour/descriptions.json — человеческие названия и описания
 *
 * Пишет:
 *   · tour/data.js   — window.TOUR = { chapters, stats }
 *   · tour/shots/{id}-{viewport}.png — копии скринов как есть
 *
 * Запуск: node tour/_tools/gen-tour.mjs   (без зависимостей, rerunnable)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOUR = path.resolve(HERE, '..');
const REPO = path.resolve(TOUR, '..');               // lovii-demo
const WS = path.resolve(REPO, '..');                  // ~/LOVII

const MANIFEST = process.env.SCREEN_MAP_MANIFEST || path.join(WS, 'screen-map-manifest.json');
const SCREENS = process.env.SCREEN_MAP_SCREENS || path.resolve(WS, '..', 'Projects', 'lovii_docs', 'screens');
const DESCR = path.join(TOUR, 'descriptions.json');
const OUT_JS = path.join(TOUR, 'data.js');
const OUT_SHOTS = path.join(TOUR, 'shots');

// Последняя версия скринов (YYYY-MM-DD) — берём самую свежую v*-дату в папке экрана
const PREFERRED_DATE = '2026-11-16';
const VIEWPORTS = [
  { key: 'mobile', label: 'Телефон' },
  { key: 'fold', label: 'Складной' },
  { key: 'tablet', label: 'Планшет' },
  { key: 'web', label: 'Ноутбук' },
];

// ---- Главы сторителлинга: порядок карточек задаёт нарратив -----------------
const CHAPTERS = [
  {
    id: 'buyer', title: 'Покупателю',
    lead: 'От «что рядом?» до оформленного заказа — один путь, без лишних экранов. Витрина района, корзины по точкам, заказы, баллы и переводы. Эквайринг — интеграция: на демо платёж показывает банк-мок.',
    ids: ['APP-P-001-home','APP-P-002-popular','APP-P-003-stores','APP-P-004-store','APP-P-005-product',
          'APP-P-006-cart','APP-P-007-cart-order','APP-P-057-payment-result','APP-P-008-profile',
          'APP-P-009-wallet','APP-P-010-transfer','APP-P-013-profile-edit','APP-P-014-email-verify',
          'APP-P-015-orders','APP-P-016-order','APP-P-017-addresses','APP-P-018-address-create',
          'APP-P-020-settings','APP-P-059-auth-by-binding'],
  },
  {
    id: 'partner', title: 'Партнёру',
    lead: 'Точка подключается за день: заявка с честным таймлайном, кабинет с доской заказов, товары, лояльность, команда и чеки 54-ФЗ. Сотрудник работает в отдельном лёгком кабинете.',
    ids: ['APP-P-021-business-landing','APP-P-022-business-apply','APP-P-023-business-status','APP-P-024-business-result',
          'APP-P-044-msp-overview','APP-P-045-msp-payment','APP-P-046-msp-orders','APP-P-047-msp-order-detail',
          'APP-P-048-msp-products','APP-P-049-msp-loyalty','APP-P-050-msp-branch-settings','APP-P-051-msp-team',
          'APP-P-052-msp-starter','APP-P-053-team-orders','APP-P-054-team-order-detail','APP-P-055-team-products','APP-P-056-team-team'],
  },
  {
    id: 'rep', title: 'Представителю',
    lead: 'Своя территория, свои точки, прозрачный доход: представитель подключает бизнес по промокоду и ведёт заявки до запуска.',
    ids: ['APP-P-026-rep-overview','APP-P-027-rep-points','APP-P-028-rep-approvals','APP-P-029-rep-income','APP-P-030-rep-profile'],
  },
  {
    id: 'amb', title: 'Амбассадору',
    lead: 'Ветка амбассадора: представители, обучение и доход с прозрачной моделью выплат.',
    ids: ['APP-P-039-amb-overview','APP-P-040-amb-reps','APP-P-041-amb-training','APP-P-042-amb-income'],
  },
  {
    id: 'platform', title: 'Платформе',
    lead: 'Экономика платформы под контролем: финансы, выплаты, чарджбэк и метрики роста — на реальных данных, с честными пометками.',
    ids: ['APP-P-032-platform','APP-P-033-owner-overview','APP-P-034-owner-finance','APP-P-035-owner-structure',
          'APP-P-036-investor-growth','APP-P-037-investor-points','APP-P-038-investor-money'],
  },
];

// ---- Read inputs -----------------------------------------------------------
if (!fs.existsSync(MANIFEST)) { console.error('Манифест не найден: ' + MANIFEST); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const descr = JSON.parse(fs.readFileSync(DESCR, 'utf8'));

// catalog_id -> route (берём первый)
const byId = new Map();
for (const r of manifest.routes) {
  for (const cid of r.catalog_ids || []) if (!byId.has(cid)) byId.set(cid, r);
}

function findShotsDir(cid) {
  const dir = path.join(SCREENS, cid);
  if (!fs.existsSync(dir)) return null;
  const versions = fs.readdirSync(dir).filter((n) => /^v\d+-\d{4}-\d{2}-\d{2}$/.test(n))
    .sort((a, b) => {
      const [na, da] = a.slice(1).split('-');
      const [nb, db] = b.slice(1).split('-');
      return da.localeCompare(db) || (Number(na) - Number(nb));
    });
  // Самая свежая дата; среди версий одной даты — наивысший vN
  const exact = [...versions].reverse().find((v) => v.endsWith(PREFERRED_DATE));
  const vdir = exact || versions[versions.length - 1];
  return vdir ? path.join(dir, vdir) : null;
}

fs.mkdirSync(OUT_SHOTS, { recursive: true });

const chapters = [];
let totalScreens = 0;
const missing = [];

for (const ch of CHAPTERS) {
  const items = [];
  for (const cid of ch.ids) {
    const meta = descr[cid];
    if (!meta || meta.skip) continue;
    const route = byId.get(cid);
    const shotsDir = findShotsDir(cid);
    if (!route || !shotsDir) { missing.push(cid); continue; }
    const shots = {};
    let ok = false;
    for (const vp of VIEWPORTS) {
      const src = path.join(shotsDir, vp.key + '.png');
      if (fs.existsSync(src)) {
        const dest = `${cid}-${vp.key}.png`;
        fs.copyFileSync(src, path.join(OUT_SHOTS, dest));
        shots[vp.key] = 'shots/' + dest;
        ok = true;
      }
    }
    if (!ok) { missing.push(cid + ' (нет скринов)'); continue; }
    items.push({ id: cid, title: meta.title, desc: meta.desc, shots, route: route.path });
    totalScreens++;
  }
  chapters.push({ id: ch.id, title: ch.title, lead: ch.lead, items });
}

// Служебные/технические экраны не показываем, но считаем общее число экранов
// по манифесту (все routes, кроме чистых редиректов).
const stats = {
  screens: manifest.routes.length,
  roles: 4,
  chapters: chapters.length,
  cards: totalScreens,
};

const banner = `/* Сгенерировано tour/_tools/gen-tour.mjs — не править руками. ${new Date().toISOString()} */\n`;
fs.writeFileSync(OUT_JS, banner + 'window.TOUR = ' + JSON.stringify({ stats, chapters }, null, 1) + ';\n');

console.log(`Глав: ${chapters.length}, карточек: ${totalScreens}, экранов по манифесту: ${stats.screens}`);
console.log(`Написано: ${path.relative(REPO, OUT_JS)}`);
if (missing.length) console.log('Пропущены (нет скринов): ' + missing.join(', '));
