/**
 * Generates 1200x630 Open Graph images into public/og/.
 *
 * Run with `npm run og`. The PNGs are committed rather than generated during
 * the Netlify build on purpose: SVG text rasterisation depends on the fonts
 * installed on the build host, so generating once locally keeps what ships
 * identical to what was reviewed.
 *
 * Uses the `sharp` that already comes with Astro - no extra dependency.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { projects } from '../src/data/projects.js';

const W = 1200;
const H = 630;

const C = {
  page: '#FAF9F7',
  ink: '#191613',
  muted: '#5C5651',
  faint: '#7D776D',
  line: '#E4E1DA',
  accent: '#8E361C',
  accentSolid: '#B04525',
  s1: '#eb6834',
};

const SERIF = "Georgia, 'Times New Roman', 'DejaVu Serif', serif";
const SANS = "'Segoe UI', Arial, 'DejaVu Sans', sans-serif";
const MONO = "'Consolas', 'Courier New', 'DejaVu Sans Mono', monospace";

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy wrap by estimated glyph width - good enough at this size. */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** The 11x11 specimen plate, same hash as the site component. */
function plate(x, y, cell, size = 11) {
  const h = (i, j) => {
    let v = (i * 73856093) ^ (j * 19349663);
    v = (v ^ (v >>> 13)) * 1274126177;
    return ((v ^ (v >>> 16)) >>> 0) / 4294967296;
  };
  let out = '';
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const d = Math.abs(i - j);
      const o =
        d === 0 ? 0.78 + 0.22 * h(i, j) : Math.max(0.04, (0.3 / (d * d)) * (0.45 + 0.9 * h(i, j)));
      out += `<rect x="${x + j * cell}" y="${y + i * cell}" width="${cell - 2}" height="${cell - 2}" rx="2" fill="${C.s1}" fill-opacity="${o.toFixed(3)}"/>`;
    }
  }
  return out;
}

function card({ eyebrow, title, meta, kpis = [] }) {
  const lines = wrap(title, 24).slice(0, 3);
  const titleSize = lines.length >= 3 ? 62 : lines.length === 2 ? 72 : 80;
  const startY = 250 - (lines.length - 1) * (titleSize * 0.54);

  const kpiSvg = kpis
    .map((k, i) => {
      const x = 80 + i * 250;
      return `
        <text x="${x}" y="520" font-family="${SERIF}" font-size="44" fill="${C.ink}">${esc(k.value)}</text>
        <text x="${x}" y="552" font-family="${MONO}" font-size="16" fill="${C.faint}" letter-spacing="1.4">${esc(k.label.toUpperCase())}</text>
      `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.page}"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${C.accentSolid}"/>
  ${plate(905, 96, 19)}
  <text x="80" y="118" font-family="${MONO}" font-size="19" fill="${C.accent}" letter-spacing="3.2">${esc(eyebrow.toUpperCase())}</text>
  <line x1="80" y1="146" x2="${kpis.length ? 840 : 840}" y2="146" stroke="${C.line}" stroke-width="2"/>
  ${lines
    .map(
      (l, i) =>
        `<text x="80" y="${startY + i * titleSize * 1.08}" font-family="${SERIF}" font-size="${titleSize}" fill="${C.ink}">${esc(l)}</text>`
    )
    .join('')}
  ${
    kpis.length
      ? (() => { const L = wrap(meta, 62); const k = L.slice(0, 2);
          /* mark the cut so a clipped sentence does not read as broken */
          if (L.length > 2) k[1] = k[1].replace(/[,;:]?$/, '') + ' …';
          return k; })()
          .map(
            (l, i) =>
              `<text x="80" y="${372 + i * 34}" font-family="${SANS}" font-size="24" fill="${C.muted}">${esc(l)}</text>`
          )
          .join('')
      : ''
  }
  ${kpis.length ? kpiSvg : ''}
  <line x1="80" y1="${kpis.length ? 462 : 500}" x2="1120" y2="${kpis.length ? 462 : 500}" stroke="${C.line}" stroke-width="2"/>
  ${
    kpis.length
      ? ''
      : `<text x="80" y="545" font-family="${SANS}" font-size="26" fill="${C.muted}">${esc(meta)}</text>`
  }
  <text x="1120" y="${kpis.length ? 552 : 545}" text-anchor="end" font-family="${MONO}" font-size="19" fill="${C.faint}" letter-spacing="1.6">MRSANDYRA.NETLIFY.APP</text>
</svg>`;
}

const pages = [
  {
    file: 'default',
    eyebrow: 'Data Engineer · Data Scientist',
    title: 'From raw data to deployed intelligence',
    meta: 'Airflow · Kafka · Spark · dbt · TensorFlow — Muhammad Rizky Sandyra',
  },
  {
    file: 'projects',
    eyebrow: 'Portfolio · 12 projects',
    title: 'Twelve systems, with their evidence',
    meta: 'Governed pipelines, the models on top of them, and the analysis out of them',
  },
  {
    file: 'resume',
    eyebrow: 'Curriculum vitae',
    title: 'Muhammad Rizky Sandyra',
    meta: 'Data Engineering · Machine Learning & AI · Analytics & Visualization',
  },
  {
    file: 'contact',
    eyebrow: 'Open to work',
    title: "Let's connect",
    meta: 'Data science, machine learning and analytics roles',
  },
  ...projects.map((p) => ({
    file: p.slug,
    eyebrow: `${p.categories[0]} · case study`,
    title: p.title,
    meta: p.summary,
    kpis: p.kpis,
  })),
];

const outDir = new URL('../public/og/', import.meta.url);
await mkdir(outDir, { recursive: true });

let made = 0;
for (const p of pages) {
  const svg = card(p);
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(new URL(`${p.file}.png`, outDir), png);
  console.log(`  ${p.file}.png  ${(png.length / 1024).toFixed(1)} KB`);
  made++;
}
console.log(`\n${made} OG images written to public/og/`);
