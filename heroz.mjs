// High-zoom check of the emblem area for every hero variant: renders at 2x and crops around the emblem ground.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const [n, w, h, m] of [['d1440', 1440, 900, false], ['d1024', 1024, 768, false], ['p390', 390, 844, true], ['p412', 412, 915, true], ['l874', 874, 402, true], ['l915', 915, 412, true], ['t768', 768, 1024, true]]) {
  const c = await b.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(process.argv[2] + '?cb=live', { waitUntil: 'networkidle' });
  const e = await p.locator('.hc-emblem').boundingBox();
  const md = await p.locator('.hc-media').boundingBox();
  const pad = e.width * 0.25;
  const clip = { x: Math.max(md.x, e.x - pad), y: Math.max(md.y, e.y - pad), width: 0, height: 0 };
  clip.width = Math.min(md.x + md.width, e.x + e.width + pad) - clip.x; clip.height = Math.min(md.y + md.height, e.y + e.height + pad) - clip.y;
  await p.screenshot({ path: `hz-${n}.jpg`, type: 'jpeg', quality: 80, clip });
  console.log(n, 'scrollY', await p.evaluate(() => scrollY), 'emblem fully inside media:', e.y >= md.y && e.y + e.height <= md.y + md.height && e.x >= md.x && e.x + e.width <= md.x + md.width);
  await c.close();
}
await b.close();
