#!/usr/bin/env node
/* Генератор страницы «Карта экранов LOVII».
 * Читает: ~/LOVII/screen-map-manifest.json, каталоги скринов lovii_docs/screens и карточки канона APP_PAGES.
 * Пишет:  screen-map/data.js + screen-map/shots/{screen-id}-{viewport}.png
 * Rerunnable: повторный запуск пересоздаёт data.js и докладывает недостающие скрины.
 * Запуск: node _tools/gen-screen-map.mjs   (из корня lovii-demo)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const HOME = path.resolve(process.env.HOME || path.join(ROOT, '..'));
const MANIFEST = process.env.MANIFEST || path.join(HOME, 'LOVII/screen-map-manifest.json');
const SCREENS = process.env.SCREENS_DIR || path.join(HOME, 'Projects/lovii_docs/screens');
const APP_PAGES = path.join(HOME, 'Projects/lovii_docs/canon/APP_PAGES');
const OUT_DIR = path.join(ROOT, 'screen-map');
const SHOTS_DIR = path.join(OUT_DIR, 'shots');
const VIEWPORTS = ['mobile', 'fold', 'tablet', 'web'];
const PREFERRED_DATE = '2026-11-16';

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
fs.mkdirSync(SHOTS_DIR, { recursive: true });

function titleFromCard(folder) {
  const f = path.join(APP_PAGES, `${folder}.md`);
  if (!fs.existsSync(f)) return null;
  const first = fs.readFileSync(f, 'utf8').split('\n').find((l) => l.startsWith('# '));
  if (!first) return null;
  return first.replace(/^#\s*/, '').replace(/^APP-[PM]-\d+\s*[—–-]\s*/, '').trim();
}

function latestVersion(folder) {
  const dir = path.join(SCREENS, folder);
  if (!fs.existsSync(dir)) return null;
  const vers = fs.readdirSync(dir).filter((n) => /^v\d+-\d{4}-\d{2}-\d{2}$/.test(n)).sort();
  if (!vers.length) return null;
  const preferred = vers.filter((v) => v.includes(PREFERRED_DATE));
  return { dir: path.join(dir, preferred.length ? preferred[preferred.length - 1] : vers[vers.length - 1]), version: preferred.length ? preferred[preferred.length - 1] : vers[vers.length - 1] };
}

const shots = [];
const missing = [];
const routes = [];
for (const r of manifest.routes) {
  const cid = (r.catalog_ids && r.catalog_ids[0]) || null;
  const entry = {
    path: r.path, name: r.name, component: r.component_file,
    role: r.role, module: r.module, status: r.status,
    auth: r.auth, priority: r.priority_for_shots ?? null,
    screenId: cid || null, title: null, version: null, shots: {},
  };
  if (cid) {
    entry.title = titleFromCard(cid) || cid;
    const ver = latestVersion(cid);
    if (!ver) { missing.push(`${cid}: нет версии скринов`); }
    else {
      entry.version = ver.version;
      const metaPath = path.join(ver.dir, 'meta.json');
      if (fs.existsSync(metaPath)) {
        try { entry.meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { /* noop */ }
      }
      if (entry.meta && entry.meta.title && entry.meta.title !== cid) entry.title = entry.meta.title;
      for (const vp of VIEWPORTS) {
        const src = path.join(ver.dir, `${vp}.png`);
        const dest = `${cid}-${vp}.png`;
        if (fs.existsSync(src)) {
          const destPath = path.join(SHOTS_DIR, dest);
          fs.copyFileSync(src, destPath);
          entry.shots[vp] = `shots/${dest}`;
          shots.push(dest);
        } else missing.push(`${cid}: нет ${vp}.png в ${ver.version}`);
      }
    }
  }
  routes.push(entry);
}

// Модалки из канона APP-M-*
const modals = [];
if (fs.existsSync(APP_PAGES)) {
  for (const f of fs.readdirSync(APP_PAGES).filter((n) => /^APP-M-\d+.*\.md$/.test(n)).sort()) {
    const lines = fs.readFileSync(path.join(APP_PAGES, f), 'utf8').split('\n');
    const title = (lines.find((l) => l.startsWith('# ')) || '').replace(/^#\s*/, '');
    const status = (lines.find((l) => l.includes('Статус:')) || '').replace(/.*Статус:\s*/, '').trim();
    const comp = (lines.find((l) => l.includes('Открытие:')) || '').replace(/.*Открытие:\s*/, '').replace(/`/g, '').trim();
    const parent = (lines.find((l) => l.includes('Родитель:')) || '').replace(/.*Родитель:\s*/, '').replace(/`/g, '').trim();
    modals.push({ id: f.replace(/\.md$/, ''), title, status, component: comp, parent });
  }
}

// Валидация: каждый скрин из data.js должен существовать на диске
const broken = [];
for (const r of routes) for (const vp of VIEWPORTS) {
  const rel = r.shots[vp];
  if (rel && !fs.existsSync(path.join(OUT_DIR, rel))) broken.push(rel);
}

// Уборка: скрины, не относящиеся к текущим данным
const keep = new Set(shots);
for (const f of fs.readdirSync(SHOTS_DIR)) if (!keep.has(f)) fs.unlinkSync(path.join(SHOTS_DIR, f));

const data = {
  generated_at: new Date().toISOString(),
  manifest_generated_at: manifest.generated_at,
  shoot_date: PREFERRED_DATE,
  stats: manifest.stats,
  notes: manifest.notes,
  orphans: manifest.catalog_orphans,
  structural: manifest.structural_routes,
  routes,
  modals,
};

fs.writeFileSync(path.join(OUT_DIR, 'data.js'), `/* Сгенерировано _tools/gen-screen-map.mjs ${data.generated_at} — руками не править */\nwindow.SCREEN_MAP_DATA = ${JSON.stringify(data, null, 1)};\n`, 'utf8');

console.log(`Маршрутов: ${routes.length}, карточек со скринами: ${routes.filter((r) => r.screenId).length}, скринов скопировано: ${shots.length}`);
console.log(`Модалок из канона: ${modals.length}`);
if (missing.length) console.log(`ОТСУТСТВУЮТ:\n  ${missing.join('\n  ')}`);
if (broken.length) { console.error(`БИТЫЕ ССЫЛКИ НА СКРИНЫ:\n  ${broken.join('\n  ')}`); process.exit(1); }
console.log(`OK → ${path.join(OUT_DIR, 'data.js')}`);
