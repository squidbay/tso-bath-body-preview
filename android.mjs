// Runs page checks + key flows inside the Android emulator's real Chrome via CDP.
// Usage: node android.mjs <cdpURL> <base> <outDir> <label>
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const [cdp, base, outDir, label] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const PAGES = ['', 'shop/', 'bath-bombs/', 'soaps/', 'collections/', 'collections/fortune/', 'collections/barracks/', 'gift-sets/',
  'products/fortune-cookie-bath-bomb/', 'products/wonton-in-the-tub/', 'products/the-exploding-dumpling/', 'products/nine-lives-musk/',
  'our-story/', 'help/', 'bag/', 'checkout/', 'order-confirmed/', 'search/', 'search/?q=lavender', 'privacy/', 'terms/', 'accessibility/', 'collections/nothing-here/'];
const browser = await chromium.connectOverCDP(cdp);
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('tso-bath-body-preview')) || await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const results = [];
const out = (o) => { results.push(o); console.log(`${o.ok ? 'PASS' : 'FAIL'} ${o.name}${o.detail ? ' — ' + o.detail : ''}`); };
const shot = (n) => page.screenshot({ path: `${outDir}/${label}-${n}.jpg`, type: 'jpeg', quality: 65 });

for (const path of (process.env.FLOWS_ONLY ? [] : PAGES)) {
  await page.goto(base + path + (path.includes('?') ? '&' : '?') + 'cb=' + label, { waitUntil: 'load', timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  const m = await page.evaluate(() => {
    const vw = innerWidth; const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('[hidden]'); };
    const hdr = [...document.querySelectorAll('.header-row .hdr-btn, .header-row .wordmark, .header-row .logo, .utils .util')].filter(vis);
    const col = [];
    for (let i = 0; i < hdr.length; i++) for (let j = i + 1; j < hdr.length; j++) {
      if (hdr[i].contains(hdr[j]) || hdr[j].contains(hdr[i])) continue;
      const a = hdr[i].getBoundingClientRect(), b = hdr[j].getBoundingClientRect();
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) col.push(1);
    }
    const l = document.querySelector('.chat-launch'); const lr = l && l.getBoundingClientRect();
    return { vw, vh: innerHeight, hscroll: document.documentElement.scrollWidth > vw, broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && vis(i)).length,
      collide: col.length, fonts: document.fonts.check('600 20px "Cormorant Garamond"') && document.fonts.check('400 16px "Nunito Sans"'),
      launcherIn: !lr || (lr.right <= vw && lr.bottom <= innerHeight), title: document.title };
  });
  const bad = [m.hscroll && 'hscroll', m.broken && `broken ${m.broken}`, m.collide && 'header collision', !m.fonts && 'fonts', !m.launcherIn && 'launcher off-screen'].filter(Boolean);
  out({ name: `${label} /${path} (${m.vw}×${m.vh})`, ok: bad.length === 0, detail: bad.join(', ') });
  if (['', 'products/wonton-in-the-tub/', 'bag/', 'help/', 'checkout/'].includes(path)) await shot((path || 'home').replace(/\W+/g, '_'));
}

// flows
await page.goto(base + 'products/wonton-in-the-tub/?cb=' + label + 'f', { waitUntil: 'load' });
await page.evaluate(() => { localStorage.removeItem('tso-bag'); });
await page.reload({ waitUntil: 'load' });
await page.click('[data-stepper] [data-step="1"]'); await page.click('[data-stepper] [data-step="1"]');
out({ name: `${label} pdp stepper capped at 3`, ok: (await page.inputValue('[data-qty]')) === '3' && await page.isDisabled('[data-stepper] [data-step="1"]') });
await page.click('.pdp-info [data-add-qty]');
await page.waitForSelector('[data-toast]:not([hidden])', { timeout: 5000 });
const tb = await page.locator('[data-toast]').boundingBox(); const vw = await page.evaluate(() => innerWidth);
out({ name: `${label} toast fully on screen`, ok: tb.x >= 0 && tb.x + tb.width <= vw, detail: JSON.stringify(tb) });
await page.waitForTimeout(1800);
out({ name: `${label} bag chip = 3`, ok: (await page.textContent('.util-bag [data-bag-count]')) === '3' });
await shot('pdp-added');
await page.click('.chat-launch');
await page.waitForTimeout(400);
const cb = await page.locator('#chat').boundingBox(); const vh = await page.evaluate(() => innerHeight);
const portrait = vh > vw;
out({ name: `${label} chat ${portrait ? 'full sheet' : '60% right sheet'}`, ok: portrait ? (Math.round(cb.width) === vw) : (Math.abs(cb.width - vw * 0.6) < 2 && Math.round(cb.x + cb.width) === vw), detail: JSON.stringify(cb) });
out({ name: `${label} chat does not pop keyboard (input not focused)`, ok: await page.evaluate(() => document.activeElement.id !== 'chat-input') });
await page.click('[data-ask="Gift for her"]');
await page.waitForSelector('.msg-card', { timeout: 6000 });
out({ name: `${label} chat answers with Fortune suggestions`, ok: /Fortune Collection/.test(await page.textContent('[data-chat-log]')) });
await shot('chat');
await page.click('[data-chat-close]');
await page.click('[data-menu-open]');
await page.waitForTimeout(300);
out({ name: `${label} drawer opens`, ok: await page.isVisible('#drawer') });
await shot('drawer');
await page.click('[data-menu-close].hdr-btn');
out({ name: `${label} drawer closes`, ok: !(await page.isVisible('#drawer')) });
out({ name: `${label} no page errors`, ok: errors.length === 0, detail: errors.slice(0, 3).join(' | ') });
writeFileSync(`${outDir}/${label}.json`, JSON.stringify(results, null, 2));
const f = results.filter((r) => !r.ok).length;
console.log(`${label}: ${results.length - f}/${results.length} PASS`);
await browser.close();
