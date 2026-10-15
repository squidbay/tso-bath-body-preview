import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const pages = ['', 'shop/', 'bath-bombs/', 'soaps/', 'collections/', 'collections/fortune/', 'collections/barracks/', 'search/', 'products/fortune-cookie-bath-bomb/', 'products/wonton-in-the-tub/', 'products/the-exploding-dumpling/', 'products/nine-lives-musk/', 'bag/'];
for (const [n, w, h, m] of [['desktop', 1440, 900, false], ['phone', 390, 844, true]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  await c.addInitScript(() => localStorage.setItem('tso-bag', '{"wonton-in-the-tub":1,"nine-lives-musk":2}'));
  let ok = 0, total = 0; const bad = [];
  for (const path of pages) {
    const p = await c.newPage();
    await p.goto(process.argv[2] + path + '?cb=ph' + Date.now(), { waitUntil: 'networkidle' });
    for (let y = 0; y < 20000; y += 600) { await p.evaluate((yy) => scrollTo(0, yy), y); await p.waitForTimeout(60); if (await p.evaluate((yy) => yy > document.documentElement.scrollHeight, y)) break; }
    await p.waitForLoadState('networkidle');
    const r = await p.evaluate(() => [...document.querySelectorAll('.slot-photo img, .hc-photo, .hc-emblem img')].map((i) => [i.currentSrc.split('/').pop(), i.complete && i.naturalWidth > 0]));
    total += r.length; ok += r.filter((x) => x[1]).length; r.filter((x) => !x[1]).forEach((x) => bad.push(path + ' ' + x[0]));
    await p.close();
  }
  console.log(n, `photos loaded ${ok}/${total}`, bad.slice(0, 5).join(' | '));
  await c.close();
}
await b.close();
