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

// Top-down 3v3 pitch, drawn like the real system: blue inflatable barrier on the long sides with a narrow white halfway band,
// white end barriers with a small goal set into each end, flat grass/turf/court floor, one red ball. No goalkeeper.
// Luis, 13 Nov: no halfway line or centre circle on the floor; the pitch always sits on navy (see claude/arte-kit.md).
const pitch = (w, h, op = .16) => {
  const m = 130, top = 175, bot = 150, pw = w - 2 * m, ph = Math.min(h - top - bot, pw * 1.45), y0 = top + (h - top - bot - ph) / 2;
  const t = 24, gw = 120, cx = w / 2, BL = '#3B8FE0', WH = '#F4F6FA';
  const r = t / 2, X1 = cx - gw / 2, X2 = cx + gw / 2; // corners mitred at 45° (Luis, 13 Nov); rounded ends at the goal gaps
  return `<svg class="pitch" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="opacity:${op}">
  <polygon points="${m},${y0} ${m + t},${y0 + t} ${m + t},${y0 + ph - t} ${m},${y0 + ph}" fill="${BL}"/>
  <polygon points="${m + pw},${y0} ${m + pw - t},${y0 + t} ${m + pw - t},${y0 + ph - t} ${m + pw},${y0 + ph}" fill="${BL}"/>
  <rect x="${m - 2}" y="${y0 + ph / 2 - 4.03}" width="${t + 4}" height="8.07" fill="${WH}"/>
  <rect x="${m + pw - t - 2}" y="${y0 + ph / 2 - 4.03}" width="${t + 4}" height="8.07" fill="${WH}"/>
  <path d="M${m} ${y0} L${X1 - r} ${y0} A${r} ${r} 0 0 1 ${X1 - r} ${y0 + t} L${m + t} ${y0 + t} Z" fill="${WH}"/>
  <path d="M${m + pw} ${y0} L${X2 + r} ${y0} A${r} ${r} 0 0 0 ${X2 + r} ${y0 + t} L${m + pw - t} ${y0 + t} Z" fill="${WH}"/>
  <path d="M${m} ${y0 + ph} L${X1 - r} ${y0 + ph} A${r} ${r} 0 0 0 ${X1 - r} ${y0 + ph - t} L${m + t} ${y0 + ph - t} Z" fill="${WH}"/>
  <path d="M${m + pw} ${y0 + ph} L${X2 + r} ${y0 + ph} A${r} ${r} 0 0 1 ${X2 + r} ${y0 + ph - t} L${m + pw - t} ${y0 + ph - t} Z" fill="${WH}"/>
  <defs><pattern id="net" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 L6 0 M0 0 L0 6" stroke="${WH}" stroke-width=".8" opacity=".75" fill="none"/></pattern></defs>
  <rect x="${cx - gw / 2 + 6}" y="${y0 - 14}" width="${gw - 12}" height="${t + 14}" fill="url(#net)" stroke="${WH}" stroke-width="3"/>
  <rect x="${cx - gw / 2 + 6}" y="${y0 + ph - t}" width="${gw - 12}" height="${t + 14}" fill="url(#net)" stroke="${WH}" stroke-width="3"/>
  <circle cx="${cx + pw * .14}" cy="${y0 + ph * .6}" r="${ph * .015}" fill="${C.red}"/></svg>`;
};

// The LOCKED pitch standard (Luis, 13 Nov 2026), horizontal, for the navy half of split slides. Same drawing as the ARTE canvas:
// 45° mitred corners, white halfway band 2.2% of the side, diamond-mesh goals with the crossbar on the barrier's inner edge, small red ball.
const pitchH = (w = 680) => `<svg width="${w}" height="${Math.round(w * 136 / 228)}" viewBox="-4 0 228 136" style="display:block">
  <polygon points="6,6 214,6 204,16 16,16" fill="${C.blue}"/><polygon points="6,130 214,130 204,120 16,120" fill="${C.blue}"/>
  <rect x="107.43" y="6" width="5.13" height="10" fill="#fff"/><rect x="107.43" y="120" width="5.13" height="10" fill="#fff"/>
  <path d="M6 6 L16 16 L16 45 A5 5 0 0 1 6 45 Z" fill="#F4F6FA"/><path d="M6 130 L16 120 L16 91 A5 5 0 0 0 6 91 Z" fill="#F4F6FA"/>
  <path d="M214 6 L204 16 L204 45 A5 5 0 0 0 214 45 Z" fill="#F4F6FA"/><path d="M214 130 L204 120 L204 91 A5 5 0 0 1 214 91 Z" fill="#F4F6FA"/>
  <defs><pattern id="netH" x="-1" y="52" width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 L2.6 0 M0 0 L0 2.6" stroke="#F4F6FA" stroke-width="0.35" opacity="0.75" fill="none"/></pattern></defs>
  <rect x="-1" y="52" width="17" height="32" rx="2" fill="url(#netH)" stroke="#F4F6FA" stroke-width="2.5"/>
  <rect x="204" y="52" width="17" height="32" rx="2" fill="url(#netH)" stroke="#F4F6FA" stroke-width="2.5"/>
  <circle cx="146" cy="84" r="4.5" fill="${C.red}"/></svg>`;

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
    body.light .count{color:#3A4356;opacity:1}
  </style></head><body class="${s.layout} ${s.tone || ''}${s.layout === 'hook' ? ' light' : ''}">${inner}<img class="logo" src="${LOGO}">${count}${foot}</body></html>`;
};

// One language per image (Luis, 2 Nov 2026): every slide is rendered once in English and once in Spanish.
// Per-language fields: en / es for the main text; kicker / kicker_es, footer / footer_es, pill / pill_es, title / title_es, count is shared.
const mono = (s, lang) => {
  const pick = k => lang === 'es' ? (s[k + '_es'] ?? s[k]) : s[k];
  return { ...s, main: s[lang], kicker: pick('kicker'), footer: pick('footer'), pill: pick('pill'), title: pick('title'),
    items: (s.items || []).map(it => it[lang]), html: lang === 'es' ? (s.html_es ?? s.html) : s.html,
    top: pick('top'), kicker_top: pick('kicker_top'), sub: pick('sub'), name: pick('name'),
    stats: (s.stats || []).map(x => ({ n: x.n, t: x[lang], red: x.red })),
    system: lang === 'es' ? 'Construido por el Reto™' : 'Built Through Challenge™' };
};
const kick = s => s.kicker ? `<div class="kick">${esc(s.kicker)}</div>` : '';
const L = {
  cover: s => `${s.pitch === false ? '' : pitch(W, H)}<div class="wrap">${kick(s)}<div class="h1">${esc(s.main)}</div></div>`,
  statement: s => `${s.pitch ? pitch(W, H, .1) : ''}<div class="wrap">${kick(s)}<div class="rule" style="margin-top:0"></div><div class="body" style="font-size:${s.size || 58}px;font-weight:700;line-height:1.18">${esc(s.main)}</div></div>`,
  points: s => `<div class="wrap">${s.title ? `<div class="kick">${esc(s.title)}</div>` : ''}${s.items.slice(0, 4).map((it, i) => `<div class="item"><div class="num">${i + 1}</div><div class="it">${esc(it)}</div></div>`).join('')}</div>`,
  quote: s => `${pitch(W, H, .07)}<div class="wrap">${kick(s)}<div class="q">${esc(s.main)}</div><div class="rule" style="margin-bottom:0"></div></div>`,
  cta: s => `${pitch(W, H, .12)}<div class="wrap"><div class="h1" style="font-size:${s.size || 84}px">${esc(s.main)}</div><div class="pill">${esc(s.pill)}</div></div>`,
  photo: s => `<div class="photo" style="background-position:${s.focus || 'center'};background-image:url(data:image/${path.extname(s.image).slice(1).replace('jpg', 'jpeg')};base64,${fs.readFileSync(s.image).toString('base64')})"></div><div class="shade"></div><div class="wrap bottom">${s.kicker ? `<div class="kick" style="color:#fff;border-left:8px solid ${s.impact ? C.gold : C.red};padding-left:18px">${esc(s.kicker)}</div>` : ''}<div class="h1" style="font-size:${s.size || 84}px">${esc(s.main)}</div></div>`,
  // === THE CAROUSEL SYSTEM (Luis, 13 Nov 2026): hook → proof → ask. See claude/arte-kit.md. ===
  // HOOK (format D, Contrast): the problem in grey on light, the 3v3PR answer on navy. Fields: kicker_top, top (problem), kicker (default "3v3PR"), en/es (answer).
  hook: s => `<div style="position:absolute;left:0;right:0;top:0;height:600px;background:#E7EAF0;padding:150px 72px 0;display:flex;flex-direction:column;gap:26px">
    ${s.kicker_top ? `<div style="font-size:28px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#6B7487">${esc(s.kicker_top)}</div>` : ''}
    <div class="h1" style="font-size:${s.size_top || 76}px;line-height:1.06;color:#6B7487;white-space:pre-line">${esc(s.top)}</div></div>
    <div style="position:absolute;left:0;right:0;top:600px;bottom:0;background:${C.navy};padding:90px 72px 0;display:flex;flex-direction:column;gap:26px">
    <div style="font-size:28px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${C.red}">${esc(s.kicker || '3v3PR')}</div>
    <div class="h1" style="font-size:${s.size || 92}px;white-space:pre-line">${esc(s.main)}</div></div>
    <div style="position:absolute;left:72px;top:560px;width:80px;height:80px;border-radius:40px;background:${C.red};color:#fff;font-size:44px;font-weight:700;display:flex;align-items:center;justify-content:center">↓</div>`,
  // PROOF (format C, Match facts): kicker + 2×2 number tiles + one line. stats: [{n, en, es, red}] (max 4; red = the number in brand red). Only true format facts.
  facts: s => `<div style="position:absolute;left:72px;right:72px;top:200px;display:flex;flex-direction:column;gap:40px">
    ${s.kicker ? `<div class="kick" style="margin:0">${esc(s.kicker)}</div>` : ''}
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px">${s.stats.slice(0, 4).map(x => `<div style="background:#0E1A2E;border:2px solid #1F3155;border-radius:20px;padding:36px 36px 30px;display:flex;flex-direction:column;gap:14px"><div style="font-size:132px;font-weight:700;line-height:.9;color:${x.red ? C.red : '#fff'}">${esc(x.n)}</div><div style="font-size:34px;font-weight:600;color:#C9D6F2;line-height:1.2">${esc(x.t)}</div></div>`).join('')}</div>
    ${s.main ? `<div class="h1" style="font-size:${s.size || 52}px;line-height:1.1">${esc(s.main)}</div>` : ''}</div>`,
  // PROOF (format B, Principle card): one of the 14 principle lines, word for word. Fields: n (1–14), name/name_es (chapter title), en/es (the line, in quotes).
  principle: s => `<div style="position:absolute;left:110px;right:110px;top:190px;bottom:170px;background:#fff;border-radius:36px;display:flex;flex-direction:column;overflow:hidden;color:${C.navy}">
    <div style="background:${C.blue};color:#fff;padding:40px 56px;display:flex;justify-content:space-between;align-items:center"><div style="font-size:30px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">${esc(s.name)}</div><div style="font-size:64px;font-weight:700;line-height:1">${esc(s.n)}</div></div>
    <div style="flex-grow:1;padding:56px;display:flex;flex-direction:column;justify-content:center;gap:44px"><div class="q" style="font-size:${s.size || 66}px;line-height:1.1">${esc(s.main)}</div><div style="width:110px;height:10px;background:${C.red}"></div></div>
    <div style="padding:0 56px 44px;display:flex;justify-content:space-between;font-size:26px;font-weight:600;color:#3A4356"><div>${esc(s.system)}</div><div>${esc(s.n)} / 14</div></div></div>`,
  // ASK (format C, \"Your field. Our pitch.\" — or format A when tone:\"light\"): 50/50 split, text on blue (or light) top, the locked pitch on navy below, ~70 px gaps.
  // Fields: kicker (light tone only), en/es (headline), sub/sub_es, pill/pill_es (optional). Footer = descriptor or tagline per the brand rules.
  ask: s => {
    const light = s.tone === 'light', ink = light ? C.navy : '#fff';
    return `<div style="position:absolute;left:0;right:0;top:0;height:675px;background:${light ? '#F4F5F7' : C.blue};color:${ink};padding:${light ? 130 : 140}px 72px 70px;display:flex;flex-direction:column;justify-content:center;gap:${light ? 24 : 30}px">
    ${s.kicker ? `<div style="font-size:28px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${light ? C.blue : '#fff'}">${esc(s.kicker)}</div>` : ''}
    <div class="h1" style="font-size:${s.size || 96}px;white-space:pre-line">${esc(s.main)}</div>
    ${light ? `<div style="width:120px;height:10px;flex-shrink:0;background:${C.red}"></div>` : ''}
    ${s.sub ? `<div class="body" style="font-size:${light ? 36 : 40}px;line-height:1.3;color:${light ? '#3A4356' : '#fff'};max-width:880px">${esc(s.sub)}</div>` : ''}
    ${s.pill ? `<div style="align-self:flex-start;background:${light ? C.red : '#fff'};color:${light ? '#fff' : C.navy};font-size:40px;font-weight:700;padding:26px 48px;border-radius:999px">${esc(s.pill)}</div>` : ''}</div>
    <div style="position:absolute;left:0;right:0;top:675px;bottom:0;background:${C.navy};display:flex;justify-content:center;padding-top:70px">${pitchH(680)}</div>`;
  },
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
