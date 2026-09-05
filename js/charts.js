/**
 * LOVII Дашборды — SVG-графики без библиотек + детерминированные данные.
 * Все графики — чистые функции → SVG/HTML-строки, ширина 100% через viewBox.
 * PRNG с фиксированным сидом: серии не «мигают» между рендерами.
 */

/* ---------- Детерминированный PRNG (mulberry32 + FNV-хеш сида) ---------- */

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let a = hashSeed(seed);
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Стабильная серия длиной n в диапазоне [min, max] (сид — строка) */
function seededSeries(seed, n, min, max) {
  const r = makeRng(seed);
  const out = [];
  let v = (min + max) / 2;
  for (let i = 0; i < n; i++) {
    v += (r() - 0.5) * (max - min) * 0.4;
    v = Math.max(min, Math.min(max, v));
    out.push(Math.round(v));
  }
  // лёгкий восходящий тренд, чтобы графики «жили»
  const lift = (max - min) * 0.25;
  return out.map((x, i) => Math.round(x + (lift * i) / Math.max(1, n - 1)));
}

/* ---------- Форматы ---------- */

function numFmt(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' млн';
  if (Math.abs(n) >= 1e3) {
    const k = n / 1e3;
    return (Math.abs(k) >= 10 ? Math.round(k).toLocaleString('ru-RU') : k.toFixed(1).replace('.', ',')) + ' тыс';
  }
  return String(Math.round(n));
}

function moneyFmt(n) {
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2).replace('.', ',') + ' млн ₽';
  if (Math.abs(n) >= 1e3) return Math.round(n / 1e3).toLocaleString('ru-RU') + ' тыс ₽';
  return priceFmt(Math.round(n));
}

/* ---------- Вертикальные бары ---------- */

let chartUid = 0;

/**
 * bars({ data, labels, tone, height, fmt, emphasis })
 * tone: 'pink' | 'tiffany' | 'gold' | 'ink'
 */
function barsChart({ data, labels = [], tone = 'pink', height = 150, fmt = numFmt }) {
  const W = 320;
  const labelH = labels.length ? 16 : 4;
  const H = height;
  const innerH = H - labelH - 22;
  const pad = 4;
  const gap = 6;
  const max = Math.max(...data) * 1.12 || 1;
  const bw = Math.max(6, (W - pad * 2 - gap * (data.length - 1)) / data.length);
  const uid = 'g' + (++chartUid);
  const gradMap = {
    pink: ['#f64a8a', '#c92a6a'],
    tiffany: ['#0abab5', '#078d89'],
    gold: ['#d4a854', '#b98d3e'],
    ink: ['var(--lv-ch-ink-a)', 'var(--lv-ch-ink-b)'],
  };
  const [c1, c2] = gradMap[tone] || gradMap.pink;
  const labelStep = Math.ceil(data.length / 6);

  const rects = data
    .map((v, i) => {
      const bh = Math.max(3, (v / max) * innerH);
      const x = pad + i * (bw + gap);
      const y = 14 + innerH - bh;
      const last = i === data.length - 1;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="${Math.min(5, bw / 2)}" fill="url(#${uid})" opacity="${last ? 1 : 0.42 + (0.58 * (i + 1)) / data.length}"/>`;
    })
    .join('');

  const lbls = labels.length
    ? labels
        .map((l, i) =>
          i % labelStep === 0 || i === data.length - 1
            ? `<text x="${(pad + i * (bw + gap) + bw / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="9" style="fill:var(--lv-dim)">${esc(l)}</text>`
            : ''
        )
        .join('')
    : '';

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${c1}"/><stop offset="1" style="stop-color:${c2}"/></linearGradient></defs>
    <line x1="0" y1="${14 + innerH + 0.5}" x2="${W}" y2="${14 + innerH + 0.5}" style="stroke:var(--lv-line)" stroke-width="1"/>
    ${rects}${lbls}
  </svg>`;
}

/* ---------- Линия / область (+ пунктирный прогноз) ---------- */

function areaChart({ data, labels = [], forecast = [], tone = 'pink', height = 160, fmt = numFmt, yFmt = numFmt }) {
  const W = 320;
  const H = height;
  const padT = 12;
  const padB = labels.length ? 18 : 6;
  const innerH = H - padT - padB;
  const all = [...data, ...forecast];
  const max = Math.max(...all) * 1.1 || 1;
  const total = data.length + forecast.length;
  const stepX = (W - 8) / Math.max(1, total - 1);
  const uid = 'a' + (++chartUid);
  const gradMap = {
    pink: ['#f64a8a', 'rgba(246,74,138,0.02)'],
    tiffany: ['#0abab5', 'rgba(10,186,181,0.02)'],
    gold: ['#d4a854', 'rgba(212,168,84,0.02)'],
  };
  const [c1, c2] = gradMap[tone] || gradMap.pink;
  const pt = (v, i) => [4 + i * stepX, padT + innerH - (v / max) * innerH];

  const pts = data.map((v, i) => pt(v, i));
  const line = pts.map((p, i) => (i === 0 ? `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` : `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(' ');
  const areaPath = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${padT + innerH} L${pts[0][0].toFixed(1)} ${padT + innerH} Z`;

  let forecastPath = '';
  if (forecast.length) {
    const fpts = [pt(data[data.length - 1], data.length - 1), ...forecast.map((v, i) => pt(v, data.length + i))];
    forecastPath = `<path d="${fpts.map((p, i) => (i === 0 ? `M${p[0].toFixed(1)} ${p[1].toFixed(1)}` : `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`)).join(' ')}" fill="none" stroke="${c1}" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" opacity=".65"/>`;
  }

  // подпись последнего значения
  const lastP = pts[pts.length - 1];
  const lastLbl = `<text x="${Math.min(W - 4, lastP[0]).toFixed(1)}" y="${Math.max(10, lastP[1] - 6).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" style="fill:var(--lv-ink)">${esc(yFmt(data[data.length - 1]))}</text>`;

  const grid = [0.33, 0.66]
    .map((k) => `<line x1="0" y1="${(padT + innerH * k).toFixed(1)}" x2="${W}" y2="${(padT + innerH * k).toFixed(1)}" style="stroke:var(--lv-line-2)" stroke-width="1"/>`)
    .join('');

  const labelStep = Math.ceil(total / 6);
  const lbls = labels.length
    ? labels
        .map(
          (l, i) =>
            i % labelStep === 0 || i === total - 1
              ? `<text x="${(4 + i * stepX).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="9" style="fill:var(--lv-dim)">${esc(l)}</text>`
              : ''
        )
        .join('')
    : '';

  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${c1}" stop-opacity=".25"/><stop offset="1" style="stop-color:${c2}"/></linearGradient></defs>
    ${grid}
    <path d="${areaPath}" fill="url(#${uid})"/>
    <path d="${line}" fill="none" stroke="${c1}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${lastP[0].toFixed(1)}" cy="${lastP[1].toFixed(1)}" r="3.4" fill="${c1}" style="stroke:var(--lv-card)" stroke-width="1.6"/>
    ${forecastPath}${lastLbl}${lbls}
  </svg>`;
}

/* ---------- Горизонтальные бары (топ-5, категории) — HTML ---------- */

const HBAR_TONES = ['pink', 'tiffany', 'gold', 'ink', 'sand', 'pink', 'tiffany', 'gold'];

function hbarsHtml(items, { fmt = moneyFmt, emojiKey = false } = {}) {
  const max = Math.max(...items.map((x) => x.value)) || 1;
  return `<div class="hbars">${items
    .map((x, i) => {
      const tone = HBAR_TONES[i % HBAR_TONES.length];
      const w = Math.max(6, Math.round((x.value / max) * 100));
      return `<div class="hbar-row">
        <span class="hb-em">${emojiKey && x.emoji ? x.emoji : i + 1}</span>
        <span class="hb-mid">
          <span class="hb-top"><span class="hb-lbl">${esc(x.label)}</span><span class="hb-val">${esc(fmt(x.value))}</span></span>
          <span class="hbar-track"><span class="hbar-fill tone-${tone}" style="width:${w}%"></span></span>
        </span>
      </div>`;
    })
    .join('')}</div>`;
}

/* ---------- Спарклайн для KPI ---------- */

function sparkSvg(data, tone = 'pink') {
  const W = 84;
  const H = 26;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * (W - 4) + 2).toFixed(1)},${(H - 3 - ((v - min) / span) * (H - 8)).toFixed(1)}`);
  const colors = { pink: '#f64a8a', tiffany: '#0abab5', gold: '#d4a854', ink: '#1a1a1a' };
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><polyline points="${pts.join(' ')}" fill="none" stroke="${colors[tone] || colors.pink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
