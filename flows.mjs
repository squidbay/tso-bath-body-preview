// Interaction checks. Usage: node flows.mjs <baseURL> <outDir>
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
const [base, outDir] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const results = [];
const errors = [];
function check(name, ok, detail = '') { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); }
async function ctx(w, h, mobile) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
  await c.addInitScript(() => { try { localStorage.setItem('tso-pill-shown', 'true'); } catch (e) {} });
  return c;
}
async function open(c, path) {
  const p = await c.newPage();
  p.on('pageerror', (e) => errors.push(`${path}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`${path}: ${m.text()}`); });
  await p.goto(base + path, { waitUntil: 'networkidle' });
  return p;
}
const shot = (p, name) => p.screenshot({ path: `${outDir}/${name}.jpg`, type: 'jpeg', quality: 72 });

// ---------- phone portrait ----------
{
  const c = await ctx(390, 844, true);
  let p = await open(c, '');
  await p.click('.product-card [data-add="fortune-cookie-bath-bomb"]');
  check('add: loading state', /Adding/.test(await p.textContent('.product-card [data-add="fortune-cookie-bath-bomb"]')));
  await p.waitForSelector('[data-toast]:not([hidden])');
  check('add: toast "Added to bag · View bag"', /Added to bag/.test(await p.textContent('[data-toast]')));
  check('add: button shows Added', /Added/.test(await p.textContent('.product-card [data-add="fortune-cookie-bath-bomb"]')));
  check('add: bag chip = 1', (await p.textContent('.util-bag [data-bag-count]')) === '1');
  await shot(p, 'phone-add-toast');

  // drawer
  await p.click('[data-menu-open]');
  check('drawer opens', await p.isVisible('#drawer'));
  check('drawer locks scroll', await p.evaluate(() => document.body.classList.contains('locked')));
  await shot(p, 'phone-drawer');
  await p.keyboard.press('Escape');
  check('drawer closes on Escape', !(await p.isVisible('#drawer')));
  check('focus returns to menu button', await p.evaluate(() => document.activeElement.matches('[data-menu-open]')));

  // chat full sheet
  await p.click('.chat-launch');
  const box = await p.locator('#chat').boundingBox();
  check('chat: full-sheet in portrait', box.width === 390 && box.height >= 844 - 1, JSON.stringify(box));
  await p.click('[data-ask="Gift for him"]');
  check('chat: typing indicator', await p.isVisible('.typing'));
  await p.waitForSelector('.msg-card', { timeout: 4000 });
  check('chat: Barracks suggestions', /Barracks Collection, then/.test(await p.textContent('[data-chat-log]')));
  await shot(p, 'phone-chat-barracks');
  await p.fill('#chat-input', 'Where do you ship?'); await p.press('#chat-input', 'Enter');
  await p.waitForFunction(() => /United States only/.test(document.querySelector('[data-chat-log]').textContent), null, { timeout: 4000 });
  check('chat: shipping answer', true);
  await p.fill('#chat-input', 'Is it vegan?'); await p.press('#chat-input', 'Enter');
  await p.waitForFunction(() => /non-tallow bar/.test(document.querySelector('[data-chat-log]').textContent), null, { timeout: 4000 });
  check('chat: ingredient answer', true);
  await p.fill('#chat-input', 'Where is my order?'); await p.press('#chat-input', 'Enter');
  await p.waitForFunction(() => /Handing you to the team/.test(document.querySelector('[data-chat-log]').textContent), null, { timeout: 4000 });
  check('chat: order escalation', true);
  await p.fill('#chat-input', 'Do you sell candles <b>x</b>'); await p.press('#chat-input', 'Enter');
  await p.waitForFunction(() => /approved Tso records/.test(document.querySelector('[data-chat-log]').textContent), null, { timeout: 4000 });
  check('chat: fallback + no HTML injection', (await p.locator('[data-chat-log] b').count()) === 0);
  await shot(p, 'phone-chat-answers');
  await p.keyboard.press('Escape');
  check('chat: closes on Escape', !(await p.isVisible('#chat')));
  await p.close();

  // PDP: stepper, limit, sticky bar
  p = await open(c, 'products/wonton-in-the-tub/');
  await p.click('[data-step="1"]'); await p.click('[data-step="1"]');
  check('pdp: stepper capped at low-stock 3', (await p.inputValue('[data-qty]')) === '3' && await p.isDisabled('[data-stepper] [data-step="1"]'));
  await p.click('.pdp-info [data-add-qty]');
  await p.waitForSelector('[data-toast]:not([hidden])');
  await p.waitForTimeout(1800);
  check('pdp: bag chip = 4 after adding 3', (await p.textContent('.util-bag [data-bag-count]')) === '4');
  await p.click('.pdp-info [data-add-qty]');
  await p.waitForFunction(() => /Only 3 available/.test(document.querySelector('[data-toast]').textContent), null, { timeout: 3000 });
  check('pdp: over-limit add refused with message', true);
  await p.evaluate(() => window.scrollTo(0, 1400)); await p.waitForTimeout(400);
  check('pdp: sticky Add to Bag bar appears after scroll', await p.evaluate(() => document.querySelector('[data-sticky-buy]').classList.contains('show')));
  const lb = await p.locator('.chat-launch').boundingBox(); const sb = await p.locator('[data-sticky-buy]').boundingBox();
  check('pdp: launcher sits above sticky bar', lb.y + lb.height <= sb.y + 1, `launcher bottom ${Math.round(lb.y + lb.height)} bar top ${Math.round(sb.y)}`);
  await shot(p, 'phone-pdp-sticky');
  await p.close();

  // out of stock notify
  p = await open(c, 'products/the-exploding-dumpling/');
  await p.click('.pdp-info [data-notify]');
  await p.click('.notify-form button');
  check('notify: invalid email error', /valid email/.test(await p.textContent('.notify-form')));
  await p.fill('.notify-form input', 'owner@example.com'); await p.click('.notify-form button');
  check('notify: honest not-stored message', /nothing was stored/.test(await p.textContent('.pdp-info')));
  await shot(p, 'phone-notify');
  await p.close();

  // bag: inventory reduction, stepper, remove, empty
  await c.addInitScript(() => { if (location.pathname.endsWith('/bag/') && !sessionStorage.getItem('b')) { sessionStorage.setItem('b', 1); localStorage.setItem('tso-bag', JSON.stringify({ 'wonton-in-the-tub': 5, 'the-exploding-dumpling': 1, 'fortune-cookie-bath-bomb': 1 })); } });
  p = await open(c, 'bag/');
  check('bag: low-stock reduction warning', /quantity reduced from 5/.test(await p.textContent('[data-bag-warning]')));
  check('bag: out-of-stock item removed', /out of stock and was removed/.test(await p.textContent('[data-bag-warning]')));
  check('bag: 2 lines', (await p.locator('.bag-line').count()) === 2);
  check('bag: summary count 4', (await p.textContent('[data-bag-items]')) === '4');
  await shot(p, 'phone-bag-warning');
  await p.click('[data-line="fortune-cookie-bath-bomb"] [data-step="1"]');
  check('bag: stepper updates count', (await p.textContent('[data-bag-items]')) === '5');
  await p.click('[data-remove="fortune-cookie-bath-bomb"]');
  await p.click('[data-remove="wonton-in-the-tub"]');
  check('bag: empty state', await p.isVisible('[data-bag-empty]') && !(await p.isVisible('[data-bag]')));
  check('bag: chip hidden when empty', !(await p.isVisible('.util-bag [data-bag-count]')));
  await shot(p, 'phone-bag-empty');
  await p.close();
  await c.close();
}

// ---------- checkout (phone) ----------
{
  const c = await ctx(390, 844, true);
  await c.addInitScript(() => { if (!sessionStorage.getItem('s')) { sessionStorage.setItem('s', 1); localStorage.setItem('tso-bag', JSON.stringify({ 'nine-lives-musk': 2 })); } });
  let p = await open(c, 'checkout/');
  check('checkout: light theme main', await p.evaluate(() => getComputedStyle(document.querySelector('main')).backgroundColor) === 'rgb(247, 241, 230)');
  check('checkout: mini summary line', /Nine Lives Musk™ × 2/.test(await p.textContent('[data-mini-lines]')));
  await p.click('[data-ship-form] button[type=submit]');
  check('checkout: 7 field errors on empty submit', (await p.locator('.err').count()) === 7, String(await p.locator('.err').count()));
  check('checkout: focus on first invalid', await p.evaluate(() => document.activeElement.id) === 's-email');
  await shot(p, 'phone-checkout-errors');
  await p.fill('#s-email', 'owner@example.com'); await p.fill('#s-first', 'Test'); await p.fill('#s-last', 'Owner');
  await p.fill('#s-addr', '1 Main St'); await p.fill('#s-city', 'Fort Wayne'); await p.fill('#s-state', 'in'); await p.fill('#s-zip', '4680');
  await p.selectOption('#s-country', 'CA');
  await p.click('[data-ship-form] button[type=submit]');
  check('checkout: ZIP 5-digit error', /5-digit ZIP/.test(await p.textContent('[data-ship-form]')));
  check('checkout: US-only shipping error', /ships within the United States only/.test(await p.textContent('[data-ship-form]')));
  check('checkout: state uppercased', (await p.inputValue('#s-state')) === 'IN');
  await shot(p, 'phone-checkout-us-only');
  await p.fill('#s-zip', '46802'); await p.selectOption('#s-country', 'US');
  await p.click('[data-ship-form] button[type=submit]');
  check('checkout: Stripe step modal opens', await p.isVisible('[data-stripe]'));
  await shot(p, 'phone-checkout-stripe');
  await p.click('[data-pay="fail"]');
  check('checkout: declined banner, bag saved', await p.isVisible('[data-pay-error]') && /nine-lives-musk/.test(await p.evaluate(() => localStorage.getItem('tso-bag'))));
  await shot(p, 'phone-checkout-declined');
  await p.click('[data-ship-form] button[type=submit]');
  await Promise.all([p.waitForURL(/order-confirmed/), p.click('[data-pay="ok"]')]);
  check('confirm: order number shown', /^TSO-[A-Z0-9]{6}$/.test(await p.textContent('[data-order-no]')));
  check('confirm: email echoed', (await p.textContent('[data-order-email]')) === 'owner@example.com');
  check('confirm: bag cleared', !(await p.isVisible('.util-bag [data-bag-count]')));
  await shot(p, 'phone-confirmed');
  await p.goto(base + 'checkout/', { waitUntil: 'networkidle' });
  check('checkout: empty-bag state', await p.isVisible('[data-checkout-empty]'));
  await p.close();
  await c.close();
}

// ---------- help, search, filters, forms (desktop) ----------
{
  const c = await ctx(1440, 900, false);
  let p = await open(c, 'help/#shipping');
  check('help: deep link #shipping selects tab', await p.getAttribute('#tab-shipping', 'aria-selected') === 'true' && await p.isVisible('#panel-shipping'));
  await p.click('#tab-faq');
  await p.keyboard.press('ArrowRight');
  check('help: arrow key moves to next tab', await p.evaluate(() => document.activeElement.id) === 'tab-shipping');
  await p.click('#tab-faq');
  await p.click('#panel-faq .acc-btn');
  check('help: accordion opens', await p.isVisible('#faq-0') && /Mission Dispatch/.test(await p.textContent('#faq-0')));
  await p.click('#tab-contact');
  await p.click('[data-contact] button[type=submit]');
  check('contact: 3 errors', (await p.locator('[data-contact] .err').count()) === 3);
  await p.fill('#c-name', 'Owner'); await p.fill('#c-email', 'owner@example.com'); await p.fill('#c-msg', 'Hello');
  await p.click('[data-contact] button[type=submit]');
  check('contact: honest not-sent message', /was not sent/.test(await p.textContent('[data-form-msg]')));
  await shot(p, 'desk-help-contact');
  await p.close();

  p = await open(c, 'search/');
  await p.fill('#q', 'dumpling');
  check('search: "dumpling" → 1 result', (await p.locator('[data-search-grid] [data-product]:visible').count()) === 1);
  await p.fill('#q', 'wonton in the tub');
  check('search: apostrophe-insensitive', (await p.locator('[data-search-grid] [data-product]:visible').count()) === 1);
  await p.fill('#q', 'lavender');
  check('search: no-results state', await p.isVisible('[data-search-empty]') && /No results for “lavender”/.test(await p.textContent('[data-search-empty]')));
  await shot(p, 'desk-search-empty');
  await p.close();

  p = await open(c, 'shop/');
  await p.click('[data-filter-key="barracks"]');
  check('filter: Barracks → 2', (await p.locator('.product-grid [data-product]:visible').count()) === 2 && /2 products/.test(await p.textContent('[data-result-count]')));
  await p.click('[data-filter-key="soaps"]');
  check('filter: Soaps → 2', (await p.locator('.product-grid [data-product]:visible').count()) === 2);
  await p.hover('.has-menu .nav-link');
  check('nav: Collections dropdown on hover', await p.isVisible('#col-menu'));
  await shot(p, 'desk-dropdown');
  await p.mouse.move(700, 600);
  await p.click('.menu-toggle');
  check('nav: dropdown toggles by click', await p.isVisible('#col-menu') && (await p.getAttribute('.menu-toggle', 'aria-expanded')) === 'true');
  await p.keyboard.press('Escape');
  await p.fill('#optin-email', 'nope'); await p.click('[data-optin] button');
  check('optin: invalid email error', /valid email/.test(await p.textContent('#optin-msg')));
  await p.fill('#optin-email', 'owner@example.com'); await p.click('[data-optin] button');
  check('optin: honest not-stored message', /nothing was stored/.test(await p.textContent('#optin-msg')));
  await p.click('.util-tso');
  const cb = await p.locator('#chat').boundingBox();
  check('chat: desktop panel 400×640 bottom-right', Math.round(cb.width) === 400 && Math.round(cb.height) === 640 && Math.round(1440 - cb.x - cb.width) === 24, JSON.stringify(cb));
  await shot(p, 'desk-chat');
  await p.close();
  await c.close();
}

// ---------- landscape chat sheet ----------
{
  const c = await ctx(844, 390, true);
  const p = await open(c, '');
  await p.click('.chat-launch');
  const b = await p.locator('#chat').boundingBox();
  check('chat: landscape right sheet ≈60% width', Math.abs(b.width - 844 * 0.6) < 2 && Math.round(b.x + b.width) === 844, JSON.stringify(b));
  await shot(p, 'land-chat');
  await p.close(); await c.close();
}

await browser.close();
check('no console/page errors during flows', errors.length === 0, errors.slice(0, 5).join(' | '));
writeFileSync(`${outDir}/flows.json`, JSON.stringify({ results, errors }, null, 2));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} PASS`);
