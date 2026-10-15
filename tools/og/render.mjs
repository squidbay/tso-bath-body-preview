// Renders og.png (1200×630) from card.html with system Chrome.
// Usage: NODE_PATH=<dir containing playwright-core> node tools/og/render.mjs
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.goto('file://' + join(here, 'card.html'));
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
await p.screenshot({ path: join(here, '..', '..', 'og.png') });
await b.close();
