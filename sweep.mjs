// Page × viewport sweep: overflow, clipped text, broken images, small targets, console/network errors, fonts.
// Usage: node sweep.mjs <baseURL> <outDir> [--shots]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const [base, outDir] = process.argv.slice(2);
const SHOTS = process.argv.includes('--shots');
mkdirSync(outDir, { recursive: true });
const PAGES = ['', 'shop/', 'bath-bombs/', 'soaps/', 'collections/', 'collections/fortune/', 'collections/barracks/', 'gift-sets/',
  'products/fortune-cookie-bath-bomb/', 'products/wonton-in-the-tub/', 'products/the-exploding-dumpling/', 'products/nine-lives-musk/',
  'our-story/', 'help/', 'bag/', 'checkout/', 'order-confirmed/', 'search/', 'search/?q=lavender', 'privacy/', 'terms/', 'accessibility/', '404.html', 'collections/nothing-here/'];
const VIEWPORTS = [
  ['desktop-1440', 1440, 900, false], ['desktop-1280', 1280, 800, false], ['laptop-1024', 1024, 768, false], ['tablet-768', 768, 1024, true],
  ['iphone-390', 390, 844, true], ['iphone-844-land', 844, 390, true], ['android-412', 412, 915, true], ['android-915-land', 915, 412, true],
  ['small-360', 360, 740, true], ['se-320', 320, 568, true],
];

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const results = [];
for (const [vname, w, h, mobile] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
  // a bag with items so bag/checkout render their filled state
  await ctx.addInitScript(() => { try { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('tso-bag', JSON.stringify({ 'fortune-cookie-bath-bomb': 2, 'nine-lives-musk': 1 })); localStorage.setItem('tso-pill-shown', 'true'); sessionStorage.setItem('seeded', '1'); } } catch (e) {} });
  for (const path of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('response', (r) => { if (r.status() >= 400 && !(path === 'collections/nothing-here/' && r.url().endsWith('nothing-here/'))) errors.push(`http ${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => errors.push('failed ' + r.url()));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const vw = window.innerWidth;
      const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !el.closest('[hidden]'); };
      const clipped = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { if (p === document.body || p === document.documentElement) return false; return true; } } return false; };
      const out = [];
      document.querySelectorAll('body *').forEach((el) => {
        if (!vis(el) || clipped(el)) return;
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 || r.left < -1) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} [${Math.round(r.left)},${Math.round(r.right)}]`);
      });
      const textClip = [];
      document.querySelectorAll('h1,h2,h3,.btn,.wordmark,.price,.chip,.tab,.nav-link,.util,.eyebrow,.card-title,.sticky-name').forEach((el) => {
        if (!vis(el)) return;
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).textOverflow !== 'ellipsis') textClip.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 30)}" ${el.scrollWidth}>${el.clientWidth}`);
      });
      const small = [];
      document.querySelectorAll('a,button,input,select,textarea,[role=tab]').forEach((el) => {
        if (!vis(el) || el.closest('p, .crumbs, .sr-only, td, th, figcaption') || el.classList.contains('skip') || el.type === 'checkbox' || el.type === 'radio') return;
        const r = el.getBoundingClientRect();
        if (r.height < 40 || r.width < 40) small.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && vis(i)).map((i) => i.currentSrc || i.src);
      const hdr = document.querySelector('.site-header .header-row');
      const fixedOverlap = [];
      const launch = document.querySelector('.chat-launch');
      if (launch && vis(launch)) {
        const lr = launch.getBoundingClientRect();
        if (lr.right > vw || lr.bottom > window.innerHeight) fixedOverlap.push('launcher off-screen');
      }
      const collide = [];
      const hdrKids = [...document.querySelectorAll('.header-row .hdr-btn, .header-row .brand .wordmark, .header-row .brand .logo, .header-row .brand .cat-hdr, .main-nav .nav-link, .main-nav .menu-toggle, .utils .util')].filter(vis);
      for (let i = 0; i < hdrKids.length; i++) for (let j = i + 1; j < hdrKids.length; j++) {
        const a = hdrKids[i].getBoundingClientRect(), b = hdrKids[j].getBoundingClientRect();
        if (hdrKids[i].contains(hdrKids[j]) || hdrKids[j].contains(hdrKids[i])) continue;
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) collide.push(`${hdrKids[i].className.baseVal ?? hdrKids[i].className} x ${hdrKids[j].className.baseVal ?? hdrKids[j].className}`);
      }
      return {
        collide,
        hscroll: document.documentElement.scrollWidth > vw,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: out.slice(0, 8), overflowCount: out.length,
        textClip, small: [...new Set(small)].slice(0, 12), smallCount: small.length, broken,
        headerH: hdr ? Math.round(hdr.getBoundingClientRect().height) : null,
        fonts: { display: document.fonts.check('600 20px "Cormorant Garamond"'), body: document.fonts.check('400 16px "Nunito Sans"') },
        title: document.title,
        favicon: [...document.querySelectorAll('link[rel~="icon"]')].map((l) => l.getAttribute('href')).join(' | '),
        fixedOverlap,
      };
    });
    const id = `${vname}__${(path || 'home').replace(/[/?=]+/g, '_').replace(/_$/, '')}`;
    if (SHOTS) await page.screenshot({ path: `${outDir}/${id}.jpg`, type: 'jpeg', quality: 70 });
    const issues = [];
    if (m.collide.length) issues.push(`HEADER COLLISION: ${m.collide.join('; ')}`);
    if (m.hscroll) issues.push(`HSCROLL ${m.scrollWidth}`);
    if (m.overflowCount) issues.push(`overflow(${m.overflowCount}): ${m.overflow.join('; ')}`);
    if (m.textClip.length) issues.push(`textclip: ${m.textClip.join('; ')}`);
    if (m.smallCount) issues.push(`small(${m.smallCount}): ${m.small.join('; ')}`);
    if (m.broken.length) issues.push(`broken img: ${m.broken.join(', ')}`);
    if (!m.fonts.display || !m.fonts.body) issues.push('fonts not loaded');
    if (m.fixedOverlap.length) issues.push(m.fixedOverlap.join(','));
    issues.push(...errors);
    results.push({ viewport: vname, path, headerH: m.headerH, issues });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${outDir}/sweep.json`, JSON.stringify(results, null, 2));
const bad = results.filter((r) => r.issues.length);
console.log(`${results.length} cells, ${results.length - bad.length} clean, ${bad.length} with issues`);
for (const r of bad) console.log(`- ${r.viewport} /${r.path} :: ${r.issues.join(' | ')}`);
const hdr = {}; results.forEach((r) => { hdr[r.viewport] = r.headerH; }); console.log('header heights', JSON.stringify(hdr));
