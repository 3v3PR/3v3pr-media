// ARTE renderer — 3v3PR brand visuals from a JSON spec, one image set per language. Usage: node render.js spec.json outdir
// Needs: RedRose.ttf and logo.png next to this file (or ARTE_ASSETS dir). Chromium via Playwright.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const A = process.env.ARTE_ASSETS || __dirname;
const b64 = f => fs.readFileSync(path.join(A, f)).toString('base64');
const FONT = fs.existsSync(path.join(A, 'RedRose.ttf')) ? `@font-face{font-family:'Red Rose';src:url(data:font/ttf;base64,${b64('RedRose.ttf')}) format('truetype');font-weight:300 700;}` : '';
const LOGO = `data:image/png;base64,${b64('logo.png')}`;
const C = { navy: '#060C17', blue: '#2D5FC2', red: '#FB0120', white: '#FFFFFF', gold: '#F2C230' };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Top-down 3v3 pitch, drawn like the real system: blue inflatable barrier on the long sides, white end barriers
// with a small goal set into each end, flat grass/turf/court floor. No goalkeeper.
const pitch = (w, h, op = .16) => {
  const m = 130, top = 175, bot = 150, pw = w - 2 * m, ph = Math.min(h - top - bot, pw * 1.45), y0 = top + (h - top - bot - ph) / 2;
  const t = 24, gw = 120, cx = w / 2, BL = '#3B8FE0', WH = '#F4F6FA';
  return `<svg class="pitch" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="opacity:${op}">
  <rect x="${m}" y="${y0}" width="${t}" height="${ph}" rx="${t / 2}" fill="${BL}"/>
  <rect x="${m + pw - t}" y="${y0}" width="${t}" height="${ph}" rx="${t / 2}" fill="${BL}"/>
  <rect x="${m}" y="${y0}" width="${pw / 2 - gw / 2 - m + m}" height="${t}" rx="${t / 2}" fill="${WH}"/>
  <rect x="${cx + gw / 2}" y="${y0}" width="${pw / 2 - gw / 2}" height="${t}" rx="${t / 2}" fill="${WH}"/>
  <rect x="${m}" y="${y0 + ph - t}" width="${pw / 2 - gw / 2}" height="${t}" rx="${t / 2}" fill="${WH}"/>
  <rect x="${cx + gw / 2}" y="${y0 + ph - t}" width="${pw / 2 - gw / 2}" height="${t}" rx="${t / 2}" fill="${WH}"/>
  <rect x="${cx - gw / 2 + 6}" y="${y0 - 14}" width="${gw - 12}" height="${t + 14}" fill="none" stroke="${WH}" stroke-width="3"/>
  <rect x="${cx - gw / 2 + 6}" y="${y0 + ph - t}" width="${gw - 12}" height="${t + 14}" fill="none" stroke="${WH}" stroke-width="3"/>
  <line x1="${m + t}" y1="${y0 + ph / 2}" x2="${m + pw - t}" y2="${y0 + ph / 2}" stroke="${WH}" stroke-width="3" stroke-dasharray="14 12"/>
  <circle cx="${cx}" cy="${y0 + ph / 2}" r="${pw * .13}" fill="none" stroke="${WH}" stroke-width="3" stroke-dasharray="14 12"/></svg>`;
};

const frame = (s, inner, W, H) => {
  const accent = s.impact ? C.gold : C.red;
  const foot = s.footer ? `<div class="foot"><span class="bar" style="background:${accent}"></span>${esc(s.footer)}</div>` : '';
  const count = s.count ? `<div class="count">${esc(s.count)}</div>` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT}
  *{margin:0;padding:0;box-sizing:border-box}
  .h1,.q,.body,.it{text-wrap:balance}
  body{width:${W}px;height:${H}px;background:${s.bg === 'blue' ? C.blue : C.navy};color:${C.white};font-family:'Red Rose','DejaVu Sans',sans-serif;position:relative;overflow:hidden}
  .pitch{position:absolute;inset:0}
  .logo{position:absolute;top:56px;right:60px;width:96px}
  .count{position:absolute;top:70px;left:72px;font-size:26px;font-weight:600;letter-spacing:.12em;opacity:.7}
  .wrap{position:absolute;left:72px;right:72px;top:190px;bottom:150px;display:flex;flex-direction:column;justify-content:center}
  .kick{font-size:28px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${accent};margin-bottom:26px}
  .h1{font-size:${s.size || 96}px;line-height:1.02;font-weight:700;letter-spacing:-.01em}
  .h1es{font-size:${Math.round((s.size || 96) * .52)}px;line-height:1.12;font-weight:500;color:#C9D6F2;margin-top:28px}
  .rule{width:120px;height:8px;background:${accent};margin:40px 0}
  .body{font-size:36px;line-height:1.35;font-weight:400}
  .bodyes{font-size:30px;line-height:1.35;color:#C9D6F2;margin-top:14px}
  .item{display:flex;gap:28px;margin:22px 0;align-items:flex-start}
  .num{font-size:54px;font-weight:700;color:${accent};min-width:64px;line-height:1}
  .it{font-size:50px;font-weight:700;line-height:1.15}.ites{font-size:33px;color:#C9D6F2;margin-top:6px;line-height:1.25}
  .q{font-size:62px;line-height:1.12;font-weight:700}.qes{font-size:40px;line-height:1.2;color:#C9D6F2;margin-top:34px;font-weight:500}
  .pill{display:inline-block;background:${accent};color:${C.white};font-weight:700;font-size:40px;padding:24px 46px;border-radius:999px;margin-top:46px;align-self:flex-start}
  .foot{position:absolute;left:72px;right:72px;bottom:64px;font-size:28px;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:20px}
  .bar{display:inline-block;width:44px;height:6px}
  .photo{position:absolute;inset:0;background-size:cover;background-position:center}
  .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,12,23,.15) 0%,rgba(6,12,23,0) 30%,rgba(6,12,23,.35) 58%,rgba(6,12,23,.92) 100%)}
  .wrap.bottom{justify-content:flex-end}
  </style></head><body>${inner}<img class="logo" src="${LOGO}">${count}${foot}</body></html>`;
};

// One language per image (Luis, 2 Nov 2026): every slide is rendered once in English and once in Spanish.
// Per-language fields: en / es for the main text; kicker / kicker_es, footer / footer_es, pill / pill_es, title / title_es, count is shared.
const mono = (s, lang) => {
  const pick = k => lang === 'es' ? (s[k + '_es'] ?? s[k]) : s[k];
  return { ...s, main: s[lang], kicker: pick('kicker'), footer: pick('footer'), pill: pick('pill'), title: pick('title'),
    items: (s.items || []).map(it => it[lang]), html: lang === 'es' ? (s.html_es ?? s.html) : s.html };
};
const kick = s => s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : '';
const L = {
  cover: s => `${s.pitch === false ? '' : pitch(W, H)}<div class="wrap">${kick(s)}<div class="h1">${esc(s.main)}</div></div>`,
  statement: s => `${s.pitch ? pitch(W, H, .1) : ''}<div class="wrap">${kick(s)}<div class="rule" style="margin-top:0"></div><div class="body" style="font-size:${s.size || 58}px;font-weight:700;line-height:1.18">${esc(s.main)}</div></div>`,
  points: s => `<div class="wrap">${s.title ? `<div class="kick">${esc(s.title)}</div>` : ''}${s.items.slice(0, 4).map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="it">${esc(it)}</div></div>`).join('')}</div>`,
  quote: s => `${pitch(W, H, .07)}<div class="wrap">${kick(s)}<div class="q">${esc(s.main)}</div><div class="rule" style="margin-bottom:0"></div></div>`,
  cta: s => `${pitch(W, H, .12)}<div class="wrap"><div class="h1" style="font-size:${s.size || 84}px">${esc(s.main)}</div><div class="pill">${esc(s.pill)}</div></div>`,
  photo: s => `<div class="photo" style="background-position:${s.focus || 'center'};background-image:url(data:image/${path.extname(s.image).slice(1).replace('jpg', 'jpeg')};base64,${fs.readFileSync(s.image).toString('base64')})"></div><div class="shade"></div><div class="wrap bottom">${s.kicker ? `<div class="kick" style="color:#fff;border-left:8px solid ${s.impact ? C.gold : C.red};padding-left:18px">${esc(s.kicker)}</div>` : ''}<div class="h1" style="font-size:${s.size || 84}px">${esc(s.main)}</div></div>`,
  html: s => s.html // custom layout: Arte writes inner HTML using the brand classes and colours above (html / html_es)
};

let W = 1080, H = 1350;
(async () => {
  const [specPath, out = 'out'] = process.argv.slice(2);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  [W, H] = (spec.size || '1080x1350').split('x').map(Number);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const files = [];
  for (const lang of spec.langs || ['en', 'es']) for (const [i, s0] of spec.slides.entries()) {
    if (!L[s0.layout]) throw new Error(`Unknown layout ${s0.layout}`);
    const s = mono(s0, lang);
    await page.setContent(frame(s, L[s.layout](s), W, H).replace('<html>', `<html lang="${lang}">`), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const fmt = spec.format || 'jpg'; // jpg for Instagram/LinkedIn (Instagram publishing accepts JPEG), png for transparency, pdf for print
    const f = path.join(out, `${spec.name || 'post'}-${lang}-${String(i + 1).padStart(2, '0')}.${fmt}`);
    if (fmt === 'pdf') await page.pdf({ path: f, width: `${W}px`, height: `${H}px`, printBackground: true });
    else await page.screenshot({ path: f, type: fmt === 'png' ? 'png' : 'jpeg', ...(fmt === 'png' ? {} : { quality: 92 }) });
    files.push(f);
  }
  await browser.close();
  console.log(JSON.stringify(files));
})().catch(e => { console.error(e); process.exit(1); });
