// Generates the static pages of the Tso Bath & Body owner-review preview.
// Usage: node tools/build.mjs   (writes HTML into the repository root)
// Authority: P3 Design System v2.2.1 (Canva DAHYCk5W3Ds) over P1 Wireframe v1.1 and P2 Colors & Type v1.0.
// Styling lives in assets/css/site.css; behaviour in assets/js/site.js.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = dirname(fileURLToPath(import.meta.url));
const OUT = join(TOOLS, '..');
// GitHub Pages serves 404.html at any depth, so it uses the absolute project path.
const PAGES_BASE = '/tso-bath-body-preview/';
const PREVIEW_URL = 'https://squidbay.github.io/tso-bath-body-preview/';
const ASSET_V = '18';

const OG = {
  title: 'Tso Bath & Body — Soak Well. Live Boldly.',
  description: 'Fizzy surprises. Handmade soaps. Legendary gifts. Handmade in Fort Wayne, Indiana.',
  image: PREVIEW_URL + 'og.png?v=1',
  alt: 'Tso Bath & Body — Soak Well. Live Boldly. General Tso’s Meow emblem on midnight jade.',
};

const PRICE = '$—.—';
const NET_WT = '— oz net wt';

// The four signature products (P1 product set; P3 page 12 states).
const PRODUCTS = [
  { slug: 'fortune-cookie-bath-bomb', name: 'Fortune Cookie Bath Bomb™', collection: 'fortune', type: 'Bath Bomb', category: 'bath-bombs', slot: 'PRD-01', stock: 'in',
    lead: 'A novelty fortune-cookie-inspired bath bomb with a surprise fortune experience.' },
  { slug: 'wonton-in-the-tub', name: 'Wonton’ in the Tub™', collection: 'fortune', type: 'Tallow Soap', category: 'soaps', slot: 'PRD-02', stock: 'low', left: 3,
    tallow: 'Contains beef tallow (animal-derived)',
    lead: 'A Fortune Collection tallow soap, clearly marked.' },
  { slug: 'the-exploding-dumpling', name: 'The Exploding Dumpling™', collection: 'barracks', type: 'Bath Bomb', category: 'bath-bombs', slot: 'PRD-03', stock: 'out',
    lead: 'A Barracks Collection bath bomb. Every soak ends with a Mission Dispatch.' },
  { slug: 'nine-lives-musk', name: 'Nine Lives Musk™', collection: 'barracks', type: 'Tallow Soap', category: 'soaps', slot: 'PRD-04', stock: 'in', tallow: 'Contains beef tallow (animal-derived)',
    lead: 'A Barracks Collection tallow soap, clearly marked.' },
];

const COLLECTIONS = {
  fortune: { name: 'Fortune Collection', short: 'Fortune', slot: 'COL-F-01', line: 'Every soak ends with a fortune.',
    body: 'Playful, giftable bath treats with a surprise fortune. For women, girls and gift shoppers.', cta: 'Explore Fortune', motif: 'blossom-fortune' },
  barracks: { name: 'Barracks Collection', short: 'Barracks', slot: 'COL-B-01', line: 'Every soak ends with a dispatch.',
    body: 'Rugged, mission-ready soap and fizz. For men, boys, veterans and military families.', cta: 'Explore Barracks', motif: 'star-barracks' },
};

const STOCK = {
  in: { cls: 'in', label: 'In stock' },
  low: { cls: 'low', label: 'Low stock' },
  out: { cls: 'out', label: 'Out of stock' },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- icons: genuine P3 SVG paths, provenance metadata stripped for inlining ----
const ICONS = {};
for (const dir of ['ui', 'social', 'ornaments']) {
  for (const f of readdirSync(join(TOOLS, 'src-icons', dir))) {
    if (!f.endsWith('.svg')) continue;
    ICONS[f.replace(/\.svg$/, '')] = readFileSync(join(TOOLS, 'src-icons', dir, f), 'utf8')
      .replace(/<metadata>[\s\S]*?<\/metadata>/g, '')
      .replace(/<title>[\s\S]*?<\/title>/g, '')
      .replace(/\s*xmlns:c2pa="[^"]*"/g, '')
      .replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\s(width|height|role)="[^"]*"/g, ''));
  }
}
function icon(name, cls = 'icon') {
  const svg = ICONS[name];
  if (!svg) throw new Error('missing icon ' + name);
  return svg.replace('<svg ', `<svg class="${cls}" aria-hidden="true" focusable="false" `);
}

// ---- brand artwork (approved PNG masters + P3 WebP derivatives; object-fit contain) ----
const logo = (root, cls = 'logo') => `<picture>
  <source type="image/webp" srcset="${root}assets/brand/tso-bath-body-horizontal-logo-360w.webp 360w, ${root}assets/brand/tso-bath-body-horizontal-logo-540w.webp 540w, ${root}assets/brand/tso-bath-body-horizontal-logo-720w.webp 720w, ${root}assets/brand/tso-bath-body-horizontal-logo-960w.webp 960w" sizes="210px">
  <img class="${cls}" src="${root}assets/brand/tso-bath-body-horizontal-logo.png" alt="Tso Bath &amp; Body — Fort Wayne, Indiana" width="2172" height="724">
</picture>`;
const cat = (root, px, cls = 'cat', alt = '') => `<picture>
  <source type="image/webp" srcset="${root}assets/brand/general-tso-compact-cat-96w.webp 96w, ${root}assets/brand/general-tso-compact-cat-192w.webp 192w, ${root}assets/brand/general-tso-compact-cat-256w.webp 256w, ${root}assets/brand/general-tso-compact-cat-512w.webp 512w" sizes="${px}px">
  <img class="${cls}" src="${root}assets/brand/general-tso-compact-cat.png" alt="${alt}" width="1254" height="1254" loading="lazy" decoding="async">
</picture>`;
const emblem = (root, sizes, cls = 'emblem', eager = false) => `<picture>
  <source type="image/webp" srcset="${root}assets/brand/general-tso-full-emblem-480w.webp 480w, ${root}assets/brand/general-tso-full-emblem-960w.webp 960w, ${root}assets/brand/general-tso-full-emblem-1254w.webp 1254w" sizes="${sizes}">
  <img class="${cls}" src="${root}assets/brand/general-tso-full-emblem.png" alt="General Tso’s Meow™ — the Tso Bath &amp; Body emblem" width="1254" height="1254"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
</picture>`;

// Image slots without final imagery: striped P3 placeholder labelled with the slot ID.
const slot = (id, ratio, label, extra = '') => `<div class="slot" style="aspect-ratio:${ratio}"${extra} role="img" aria-label="${esc(label)} — image to come (${id})"><span class="slot-id">${id}</span></div>`;

// Owner-approved images (2026-10-15, all ten concept slots). Packaging cats in these photos are provisional
// concept art, not a replacement for the logo; the approved emblem PNG covers the generated cat in heroes.
// Slots without an entry keep the striped P3 placeholder.
const PHOTOS = {
  'COL-F-01': { file: 'COL-F-01', w: 1448, half: 724 },
  'COL-B-01': { file: 'COL-B-01', w: 1448, half: 724 },
  'DEMO-01': { file: 'DEMO-01', w: 1448, half: 724 },
  'PRD-01': { file: 'PRD-01-A', w: 1254, half: 627 },
  'PRD-02': { file: 'PRD-02-A', w: 1254, half: 627 },
  'PRD-03': { file: 'PRD-03-A', w: 1254, half: 627 },
  'PRD-04': { file: 'PRD-04-A', w: 1254, half: 627 },
  // Batch 2, owner-approved 2026-10-15. DEMO-03 is the Fortune slip only; the Barracks dispatch stays review-only.
  'DEMO-02': { file: 'DEMO-02', w: 1600, half: 800 },
  'DEMO-03': { file: 'DEMO-03', w: 1600, half: 800 },
  'GIFT-01-F': { file: 'GIFT-01-F', w: 1600, half: 800 },
  'GIFT-01-B': { file: 'GIFT-01-B', w: 1600, half: 800 },
  'GIFT-02': { file: 'GIFT-02', w: 1600, half: 800 },
};
const PHOTO_DIR = PAGES_BASE + 'assets/photos/';
// Images awaiting owner approval (rendered only in the image-review build). Empty: everything shown is approved.
const PENDING = {};
// Image review record (image-review/): REVIEW=true renders the same images labelled CONCEPT.
let REVIEW = false;
const REVIEW_V = 'r8'; // cache key for image-review/ styles only
const REVIEW_IMG = PAGES_BASE + 'image-review/img/';
const _slot = slot;
const slotOrConcept = (id, ratio, label, extra = '') => {
  const pending = !PHOTOS[id] && REVIEW && PENDING[id];
  const c = PHOTOS[id] || (REVIEW && PENDING[id]);
  if (!c) return _slot(id, ratio, label, extra);
  const dir = REVIEW ? REVIEW_IMG : PHOTO_DIR;
  return `<div class="slot ${REVIEW ? 'slot-concept' : 'slot-photo'}" style="aspect-ratio:${ratio}"${extra} data-focus="${id}"><img src="${dir}${c.file}-${c.w}.jpg" srcset="${dir}${c.file}-${c.half}.jpg ${c.half}w, ${dir}${c.file}-${c.w}.jpg ${c.w}w" sizes="(min-width: 1024px) 50vw, 100vw" alt="${esc(label)}${REVIEW ? ` — concept image (${c.file}), not final` : ''}" loading="lazy" decoding="async">${REVIEW ? `<span class="slot-id">${c.file} · ${pending ? 'PENDING APPROVAL' : 'APPROVED'}</span>` : ''}</div>`;
};

// ---- page shell ----
function head({ title, description, root, base }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
${base ? `<base href="${base}">\n` : ''}<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#071719">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Tso Bath &amp; Body">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tso Bath &amp; Body">
<meta property="og:title" content="${esc(OG.title)}">
<meta property="og:description" content="${esc(OG.description)}">
<meta property="og:url" content="${PREVIEW_URL}">
<meta property="og:image" content="${OG.image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(OG.alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(OG.title)}">
<meta name="twitter:description" content="${esc(OG.description)}">
<meta name="twitter:image" content="${OG.image}">
<link rel="icon" type="image/svg+xml" href="${root}favicon.svg?v=${ASSET_V}">
<link rel="icon" href="${root}favicon.ico?v=${ASSET_V}" sizes="16x16 32x32 48x48">
<link rel="apple-touch-icon" href="${root}apple-touch-icon-180.png?v=${ASSET_V}">
<link rel="apple-touch-icon" sizes="167x167" href="${root}apple-touch-icon-167.png?v=${ASSET_V}">
<link rel="apple-touch-icon" sizes="152x152" href="${root}apple-touch-icon-152.png?v=${ASSET_V}">
<link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" href="${root}assets/icons/ios-splash-1290x2796.png">
<link rel="manifest" href="${root}manifest.webmanifest">
<link rel="preload" href="${root}assets/fonts/cormorant-garamond-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/nunito-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${root}assets/fonts/nunito-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}assets/css/site.css?v=${ASSET_V}">
<script src="${root}assets/js/site.js?v=${ASSET_V}" defer></script>
</head>`;
}

const NAV = [
  ['home', 'Home', ''],
  ['bath-bombs', 'Bath Bombs', 'bath-bombs/'],
  ['soaps', 'Soaps', 'soaps/'],
  ['collections', 'Collections', 'collections/'],
  ['our-story', 'Our Story', 'our-story/'],
];

function header({ root, current }) {
  const cur = (k) => (current === k ? ' aria-current="page"' : '');
  const navItems = NAV.map(([k, label, href]) => k === 'collections'
    ? `<li class="has-menu">
          <a href="${root}${href}"${cur(k)} class="nav-link">${label}</a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="col-menu" aria-label="Show collections">${icon('chevron-down', 'icon icon-sm')}</button>
          <ul class="dropdown" id="col-menu" role="list">
            <li><a href="${root}collections/fortune/">Fortune Collection</a></li>
            <li><a href="${root}collections/barracks/">Barracks Collection</a></li>
            <li><a href="${root}gift-sets/">Gift Sets / Bundles</a></li>
          </ul>
        </li>`
    : `<li><a href="${root}${href}"${cur(k)} class="nav-link">${label}</a></li>`).join('\n        ');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="wrap header-row">
    <button class="hdr-btn only-compact" type="button" data-menu-open aria-controls="drawer" aria-expanded="false">${icon('menu')}<span class="hdr-label">Menu</span></button>
    <a class="brand" href="${root}" aria-label="Tso Bath &amp; Body — home">
      <span class="brand-full">${logo(root)}</span>
      <span class="brand-compact">${cat(root, 36, 'cat cat-hdr')}<span class="wordmark">TSO BATH &amp; BODY</span></span>
    </a>
    <nav class="main-nav" aria-label="Main">
      <ul role="list">
        ${navItems}
      </ul>
    </nav>
    <div class="utils">
      <a class="util only-wide" href="${root}search/"${cur('search')}>${icon('search')}<span>Search</span></a>
      <a class="util only-wide" href="${root}help/"${cur('help')}>${icon('help')}<span>Help</span></a>
      <button class="util util-tso only-wide" type="button" data-chat-open aria-label="Ask General Tso, our shopping assistant">${cat(root, 28, 'cat cat-util')}<span>TSO</span></button>
      <a class="util util-bag" href="${root}bag/"${cur('bag')} aria-label="Bag">${icon('bag')}<span class="hdr-label">Bag</span><span class="bag-chip" data-bag-count hidden>0</span></a>
    </div>
  </div>
</header>
<div class="drawer-scrim" data-menu-close hidden></div>
<nav class="drawer" id="drawer" aria-label="Menu" tabindex="-1" hidden>
  <div class="drawer-head">
    <span class="wordmark">TSO BATH &amp; BODY</span>
    <button class="hdr-btn" type="button" data-menu-close aria-label="Close menu">${icon('close')}</button>
  </div>
  <ul class="drawer-list" role="list">
    <li><a href="${root}"${cur('home')}>Home</a></li>
    <li><a href="${root}bath-bombs/"${cur('bath-bombs')}>Bath Bombs</a></li>
    <li><a href="${root}soaps/"${cur('soaps')}>Soaps</a></li>
    <li><a href="${root}collections/"${cur('collections')}>Collections</a>
      <ul role="list" class="drawer-sub">
        <li><a href="${root}collections/fortune/">Fortune Collection</a></li>
        <li><a href="${root}collections/barracks/">Barracks Collection</a></li>
        <li><a href="${root}gift-sets/">Gift Sets / Bundles</a></li>
      </ul>
    </li>
    <li><a href="${root}our-story/"${cur('our-story')}>Our Story</a></li>
    <li><a href="${root}help/"${cur('help')}>Help &amp; Ingredients</a></li>
  </ul>
  <div class="drawer-foot">
    <a class="btn btn-secondary btn-block" href="${root}search/">${icon('search')} Search</a>
    <button class="btn btn-secondary btn-block" type="button" data-chat-open>${cat(root, 24, 'cat cat-inline')} Ask General Tso</button>
  </div>
</nav>`;
}

const SOCIAL = [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['etsy', 'Etsy'], ['pinterest', 'Pinterest'], ['youtube', 'YouTube']];

function footer(root) {
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <picture>
        <source type="image/webp" srcset="${root}assets/brand/tso-bath-body-horizontal-logo-540w.webp 540w, ${root}assets/brand/tso-bath-body-horizontal-logo-720w.webp 720w, ${root}assets/brand/tso-bath-body-horizontal-logo-960w.webp 960w" sizes="460px">
        <img class="foot-logo" src="${root}assets/brand/tso-bath-body-horizontal-logo.png" alt="Tso Bath &amp; Body — General Tso’s Meow™ · Fort Wayne, Indiana" width="2172" height="724" loading="lazy" decoding="async">
      </picture>
      <p>Handmade in Fort Wayne, Indiana. Fizzy surprises. Handmade soaps. Legendary gifts.</p>
      <form class="optin" data-optin novalidate>
        <label class="label" for="optin-email">Email opt-in</label>
        <div class="optin-row">
          <input class="input" id="optin-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" aria-describedby="optin-msg">
          <button class="btn btn-primary" type="submit">Sign up</button>
        </div>
        <p class="field-msg" id="optin-msg" aria-live="polite"></p>
      </form>
      <p class="label">Social</p>
      <ul class="social" role="list">
        ${SOCIAL.map(([k, label]) => `<li><span class="social-btn" role="img" aria-label="${label} (account link to come)" title="${label} — account link to come">${icon(k)}</span></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="footer-cols">
      <div><p class="footer-h">Shop</p><ul role="list">
        <li><a href="${root}bath-bombs/">Bath Bombs</a></li><li><a href="${root}soaps/">Soaps</a></li>
        <li><a href="${root}collections/fortune/">Fortune Collection</a></li><li><a href="${root}collections/barracks/">Barracks Collection</a></li>
        <li><a href="${root}shop/">Shop All</a></li><li><a href="${root}gift-sets/">Gift Sets / Bundles</a></li></ul></div>
      <div><p class="footer-h">Help</p><ul role="list">
        <li><a href="${root}help/#ingredients">Ingredients &amp; Care</a></li><li><a href="${root}help/#shipping">Shipping &amp; Returns</a></li>
        <li><a href="${root}help/#faq">FAQ</a></li><li><a href="${root}help/#contact">Contact</a></li><li><a href="${root}help/#order">Order Information</a></li></ul></div>
      <div><p class="footer-h">Company</p><ul role="list">
        <li><a href="${root}our-story/">Our Story</a></li><li><a href="${root}our-story/#general-tso">Meet General Tso</a></li><li><span class="muted">Wholesale (TBD)</span></li></ul></div>
      <div><p class="footer-h">Legal</p><ul role="list">
        <li><a href="${root}privacy/">Privacy Policy</a></li><li><a href="${root}terms/">Terms of Service</a></li><li><a href="${root}accessibility/">Accessibility</a></li></ul></div>
    </div>
  </div>
  <div class="wrap footer-legal">
    <p>© 2026 Tso Bath &amp; Body · tsobathbody.com</p>
    <p>General Tso’s Meow™ is a trademark of Tso Bath &amp; Body.</p>
  </div>
</footer>`;
}

function chat(root) {
  return `<div class="chat-launch-wrap" data-chat-wrap>
  <button class="chat-launch" type="button" data-chat-open aria-label="Ask General Tso, our shopping assistant" aria-controls="chat" aria-expanded="false">
    ${cat(root, 56, 'cat cat-launch')}<span class="chat-dot" aria-hidden="true"></span><span class="chat-pill" aria-hidden="true">Ask Tso</span>
  </button>
</div>
<section class="chat" id="chat" role="dialog" aria-modal="false" aria-labelledby="chat-title" tabindex="-1" hidden>
  <header class="chat-head">
    ${cat(root, 64, 'cat cat-chat-head')}
    <div><h2 id="chat-title" class="chat-name">General Tso</h2><p class="chat-status">Online · shopping assistant</p></div>
    <button class="hdr-btn" type="button" data-chat-close aria-label="Close chat">${icon('close')}</button>
  </header>
  <div class="chat-log" data-chat-log aria-live="polite">
    <div class="msg msg-bot">${cat(root, 32, 'cat cat-bubble')}<p>Welcome. I can help you pick a gift, compare the two collections, or explain ingredients and shipping. What’s the mission?</p></div>
  </div>
  <div class="chat-chips" data-chat-chips>
    <button class="chip" type="button" data-ask="Gift for her">Gift for her</button>
    <button class="chip" type="button" data-ask="Gift for him">Gift for him</button>
    <button class="chip" type="button" data-ask="Is it 100% tallow?">Is it 100% tallow?</button>
  </div>
  <form class="chat-form" data-chat-form>
    <label class="sr-only" for="chat-input">Message General Tso</label>
    <input class="input" id="chat-input" type="text" autocomplete="off" placeholder="Ask General Tso…">
    <button class="btn btn-primary btn-icon" type="submit" aria-label="Send">${icon('send')}</button>
  </form>
  <p class="chat-note">Public assistant powered by SquidBay. No order access in P1.</p>
</section>
<div class="toast" data-toast role="status" aria-live="polite" hidden></div>`;
}

const page = ({ title, description, root, current, main, bodyClass = '', theme = '' }) => `${head({ title, description, root })}
<body class="${bodyClass}" data-root="${root}">
${header({ root, current })}
<main id="main"${theme ? ` data-theme="${theme}"` : ''}>
${main}
</main>
${footer(root)}
${chat(root)}
</body>
</html>
`;

// ---- components ----
const rule = `<div class="rule" aria-hidden="true">${ICONS['rule-diamond'].replace('<svg ', '<svg preserveAspectRatio="xMidYMid meet" ')}</div>`;
const eyebrow = (text, col) => `<p class="eyebrow${col ? ' eyebrow-' + col : ''}">${col ? icon(COLLECTIONS[col].motif, 'icon icon-motif') : ''}${text}</p>`;
const productUrl = (root, p) => `${root}products/${p.slug}/`;
const typeLabel = (p) => `${COLLECTIONS[p.collection].name.toUpperCase()} · ${p.type.toUpperCase()}`;

function stockLine(p) {
  const s = STOCK[p.stock];
  const label = p.stock === 'low' ? `${s.label} · ${p.left} left` : s.label;
  return `<span class="stock stock-${s.cls}"><span class="dot" aria-hidden="true"></span>${label}</span>`;
}

function productCard(root, p, headingLevel = 3) {
  const h = `h${headingLevel}`;
  const action = p.stock === 'out'
    ? `<button class="btn btn-secondary btn-block" type="button" data-notify="${p.slug}">Notify me</button>`
    : `<button class="btn btn-primary btn-block" type="button" data-add="${p.slug}">Add to Bag</button>`;
  return `<article class="card product-card band-${p.collection}${p.stock === 'out' ? ' is-out' : ''}" data-product="${p.slug}" data-collection="${p.collection}" data-category="${p.category}">
  <a class="card-media" href="${productUrl(root, p)}" tabindex="-1" aria-hidden="true">${slotOrConcept(p.slot, '1 / 1', p.name)}</a>
  <div class="card-body">
    ${eyebrow(`${COLLECTIONS[p.collection].short.toUpperCase()} · ${p.type.toUpperCase()}`, p.collection)}
    <${h} class="card-title"><a href="${productUrl(root, p)}">${p.name}</a></${h}>
    <p class="price">${PRICE} <span class="net">${NET_WT}</span></p>
    <p class="card-meta">Scent: — · ${stockLine(p)}${p.tallow ? `<br><span class="tallow">${icon('cow', 'icon icon-sm')}Crafted with 100% locally farm-raised beef tallow.</span>` : ''}</p>
    ${action}
  </div>
</article>`;
}

const productGrid = (root, list) => `<div class="product-grid">
${list.map((p) => productCard(root, p)).join('\n')}
</div>`;

function collectionCard(root, key) {
  const c = COLLECTIONS[key];
  return `<article class="card collection-card band-${key}">
  ${slotOrConcept(c.slot, '4 / 3', c.name)}
  <div class="card-body">
    ${eyebrow(c.name.toUpperCase(), key)}
    <h3 class="col-title">${c.line}</h3>
    <p>${c.body}</p>
    <a class="btn btn-primary" href="${root}collections/${key}/">${c.cta}</a>
  </div>
</article>`;
}

const crumbs = (root, items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol role="list">${items.map(([label, href], i) => i === items.length - 1
  ? `<li aria-current="page">${label}</li>`
  : `<li><a href="${root}${href}">${label}</a></li>`).join('')}</ol></nav>`;

function filterChips(items, active) {
  return `<div class="chips" role="group" aria-label="Filter products" data-filter>
  ${items.map(([key, label]) => `<button class="chip" type="button" data-filter-key="${key}" aria-pressed="${key === active}">${label}</button>`).join('\n  ')}
</div>`;
}

function listingPage({ root, title, heading, intro, list, chips, current, crumbsList, eyebrowText, collection }) {
  return page({ title: `${title} — Tso Bath & Body`, description: intro, root, current,
    main: `<section class="section page-head${collection ? ' head-' + collection : ''}">
  <div class="wrap">
    ${crumbs(root, crumbsList)}
    ${eyebrow(eyebrowText, collection)}
    <h1>${heading}</h1>
    <p class="lead">${intro}</p>
    ${rule}
  </div>
</section>
<section class="section section-tight" aria-label="${esc(heading)} products">
  <div class="wrap">
    ${chips ? filterChips(chips, 'all') : ''}
    <p class="result-count" data-result-count aria-live="polite">${list.length} ${list.length === 1 ? 'product' : 'products'}</p>
    ${productGrid(root, list)}
    <div class="empty" data-filter-empty hidden>
      ${cat(root, 96, 'cat cat-empty')}
      <p class="empty-title">Nothing here yet.</p>
      <p>Try another filter. <a class="link" href="${root}shop/">Shop all</a></p>
    </div>
  </div>
</section>` });
}

// ---- pages ----
function home() {
  const root = '';
  return page({ title: 'Tso Bath & Body — Soak Well. Live Boldly.', description: OG.description, root, current: 'home', bodyClass: 'home',
    main: `${heroPhoto(root)}
<section class="section" aria-labelledby="sig-h">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Signature products</p>
      <h2 id="sig-h">The first four</h2>
      ${rule}
    </div>
    ${productGrid(root, PRODUCTS)}
    <p class="center section-foot"><a class="link" href="shop/">Shop all ${icon('arrow-right', 'icon icon-sm')}</a></p>
  </div>
</section>
<section class="section section-alt" aria-labelledby="col-h">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Two collections</p>
      <h2 id="col-h">Every soak ends with a message.</h2>
      <p class="lead">Playful, giftable bath treats with a surprise fortune. Full ingredient disclosure for every product; tallow soaps clearly marked.</p>
    </div>
    <div class="collection-grid">
      ${collectionCard(root, 'fortune')}
      ${collectionCard(root, 'barracks')}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="reveal-h">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">The reveal</p>
      <h2 id="reveal-h">A fortune or a Mission Dispatch</h2>
      ${rule}
    </div>
    <ol class="steps" role="list">
      <li>${icon('bubble', 'icon icon-step')}<div><h3>Drop it in</h3>${slotOrConcept('DEMO-01', '4 / 3', 'Bath bomb entering water')}</div></li>
      <li>${icon('bubble', 'icon icon-step')}<div><h3>Let it fizz</h3>${slotOrConcept('DEMO-02', '4 / 3', 'Fizz in tub')}</div></li>
      <li>${icon('bubble', 'icon icon-step')}<div><h3>Read the message</h3>${slotOrConcept('DEMO-03', '4 / 3', 'Reveal card or digital reveal screen')}</div></li>
    </ol>
    <p class="note center">Fortune Collection bath bombs carry a fortune; Barracks Collection bath bombs carry a Mission Dispatch.</p>
  </div>
</section>
<section class="section section-alt story-teaser" aria-labelledby="story-h">
  <div class="wrap story-grid">
    <div class="story-art">${emblem(root, '(min-width: 900px) 420px, 70vw')}</div>
    <div>
      <p class="eyebrow">Our Story</p>
      <h2 id="story-h">Meet <em>General Tso’s Meow™</em></h2>
      <p class="lead">Handmade in Fort Wayne, Indiana. Fizzy surprises. Handmade soaps. Legendary gifts.</p>
      <div class="btn-row">
        <a class="btn btn-secondary" href="our-story/">Our Story</a>
        <button class="btn btn-tertiary" type="button" data-chat-open>Ask General Tso ${icon('arrow-right', 'icon icon-sm')}</button>
      </div>
    </div>
  </div>
</section>` });
}

function collectionsHub() {
  const root = '../';
  return page({ title: 'Collections — Tso Bath & Body', description: 'Fortune and Barracks collections, plus gift sets.', root, current: 'collections',
    main: `<section class="section page-head">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Collections']])}
    <p class="eyebrow">Collections</p>
    <h1>Every soak ends with a message.</h1>
    <p class="lead">Playful, giftable bath treats with a surprise fortune. Full ingredient disclosure for every product; tallow soaps clearly marked.</p>
    ${rule}
  </div>
</section>
<section class="section section-tight">
  <div class="wrap">
    <div class="collection-grid">
      ${collectionCard(root, 'fortune')}
      ${collectionCard(root, 'barracks')}
    </div>
    <div class="giftband">
      <div>
        <p class="eyebrow">Gift Sets / Bundles</p>
        <h2 class="h3">Legendary gifts, ready to give.</h2>
      </div>
      <a class="btn btn-secondary" href="${root}gift-sets/">See gift sets</a>
    </div>
  </div>
</section>` });
}

function collectionPage(key) {
  const c = COLLECTIONS[key];
  const root = '../../';
  const list = PRODUCTS.filter((p) => p.collection === key);
  return listingPage({ root, title: c.name, heading: c.line, intro: c.body, list, current: 'collections', collection: key,
    eyebrowText: c.name.toUpperCase(), crumbsList: [['Home', ''], ['Collections', 'collections/'], [c.name]],
    chips: [['all', 'All'], ['bath-bombs', 'Bath Bombs'], ['soaps', 'Soaps']] });
}

// The Double Happiness Chest (owner brief 2026-10-15): both 12-piece sets in one outer chest.
// Image: the approved GIFT-02 gift-presentation concept, unaltered and uncropped (owner correction).
// GIFT-03 stays reserved for real chest photography. Coming soon — no price, no Add to Bag.
function doubleHappinessChest() {
  const c = PHOTOS['GIFT-02'];
  return `<article class="chest" aria-labelledby="chest-h" data-focus="GIFT-03">
  <figure class="chest-media">
    <img src="${PHOTO_DIR}${c.file}-${c.w}.jpg" srcset="${PHOTO_DIR}${c.file}-${c.half}.jpg ${c.half}w, ${PHOTO_DIR}${c.file}-${c.w}.jpg ${c.w}w" sizes="(min-width: 1024px) 620px, (orientation: landscape) 50vw, 100vw" alt="Tso Bath &amp; Body gift presentation with wrapped Fortune and Barracks gifts, tissue paper and message cards" width="${c.w}" height="1200" loading="lazy" decoding="async">
    <figcaption class="chest-caption">Concept image of our proposed gift presentation. Final 24-piece chest packaging is in development.</figcaption>
  </figure>
  <div class="chest-body">
    <div class="chest-intro">
    <p class="eyebrow chest-eyebrow"><span class="chest-seal" aria-hidden="true">囍</span>Featured · Coming soon</p>
    <h2 id="chest-h" class="chest-title">The Double Happiness Chest</h2>
    <p class="chest-sub"><span lang="zh-Hans">双喜</span> · Signature Couples Gift Set</p>
    <p class="chest-tag">Two collections. One legendary gift.</p>
    <p>A little fortune. A little firepower. One unforgettable gift.</p>
    <p>Includes our complete Fortune and Barracks gift sets: 12 signature bath bombs and 12 artisan soaps, presented together in one premium gift chest.</p>
    </div>
    <div class="chest-details">
    <div class="chest-contents">
      <div class="band-fortune"><p class="eyebrow eyebrow-fortune">${icon('blossom-fortune', 'icon icon-motif')}Fortune Collection</p><ul role="list"><li><b>6</b> Fortune Cookie Bath Bombs™</li><li><b>6</b> Wonton’ in the Tub™ soaps</li></ul></div>
      <div class="band-barracks"><p class="eyebrow eyebrow-barracks">${icon('star-barracks', 'icon icon-motif')}Barracks Collection</p><ul role="list"><li><b>6</b> The Exploding Dumpling™ Bath Bombs</li><li><b>6</b> Nine Lives Musk™ soaps</li></ul></div>
    </div>
    <p class="chest-count">24 pieces · 12 bath bombs + 12 soaps</p>
    <p class="chest-quality">${icon('cow', 'icon icon-sm')}Crafted with 100% locally farm-raised beef tallow.</p>
    <p class="chest-occasion">Perfect for couples, anniversaries, weddings, holidays and special occasions.</p>
    <p class="price">Price pending</p>
    <button class="btn btn-secondary" type="button" disabled>Coming soon</button>
    </div>
  </div>
</article>`;
}

function giftSets() {
  const root = '../';
  const set = (id, col, title) => `<article class="card collection-card band-${col}">
  ${slotOrConcept(id, '4 / 3', title)}
  <div class="card-body">
    ${eyebrow(COLLECTIONS[col].name.toUpperCase() + ' · PROPOSED', col)}
    <h3 class="col-title">${title}</h3>
    <p class="price">${PRICE}</p>
    <button class="btn btn-secondary" type="button" disabled>Coming soon</button>
  </div>
</article>`;
  return page({ title: 'Gift Sets / Bundles — Tso Bath & Body', description: 'Legendary gifts, ready to give.', root, current: 'collections',
    main: `<section class="section page-head">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Collections', 'collections/'], ['Gift Sets / Bundles']])}
    <p class="eyebrow">Gift Sets / Bundles</p>
    <h1>Legendary gifts, ready to give.</h1>
    ${rule}
  </div>
</section>
<section class="section section-tight">
  <div class="wrap">
    <div class="collection-grid">
      ${set('GIFT-01-F', 'fortune', 'Fortune gift set')}
      ${set('GIFT-01-B', 'barracks', 'Barracks gift set')}
    </div>
    ${doubleHappinessChest()}
  </div>
</section>` });
}

function productPage(p) {
  const root = '../../';
  const c = COLLECTIONS[p.collection];
  const max = p.stock === 'out' ? 0 : p.stock === 'low' ? p.left : 10;
  const buy = p.stock === 'out'
    ? `<button class="btn btn-secondary btn-block" type="button" data-notify="${p.slug}">Notify me</button>`
    : `<div class="buy-row">
        <div class="stepper" data-stepper data-max="${max}">
          <button type="button" class="step-btn" data-step="-1" aria-label="Decrease quantity">${icon('minus')}</button>
          <input class="step-val" type="number" inputmode="numeric" min="1" max="${max}" value="1" aria-label="Quantity" data-qty>
          <button type="button" class="step-btn" data-step="1" aria-label="Increase quantity">${icon('plus')}</button>
        </div>
        <button class="btn btn-primary btn-grow" type="button" data-add="${p.slug}" data-add-qty>Add to Bag</button>
      </div>`;
  const related = PRODUCTS.filter((x) => x.slug !== p.slug);
  return page({ title: `${p.name} — Tso Bath & Body`, description: p.lead, root, current: p.category, bodyClass: 'pdp',
    main: `<section class="section section-tight">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], [c.name, `collections/${p.collection}/`], [p.name]])}
    <div class="pdp-grid">
      <div class="gallery" data-gallery>
        <div class="gallery-main">${['main', 'Angle 2', 'In use', 'Reveal', 'Pack'].map((v, i) => `<div class="gallery-slide" data-slide="${i}"${i ? ' hidden' : ''}>${slotOrConcept(`${p.slot}${i ? '-' + 'ABCDE'[i] : ''}`, '1 / 1', `${p.name} — ${i ? v : 'main image'}`)}</div>`).join('')}</div>
        <div class="thumbs" role="group" aria-label="Product images">
          ${['Main', 'Angle 2', 'In use', 'Reveal', 'Pack'].map((v, i) => `<button type="button" class="thumb" data-thumb="${i}" aria-pressed="${i === 0}"><span>${v}</span></button>`).join('\n          ')}
        </div>
      </div>
      <div class="pdp-info band-${p.collection}" data-product="${p.slug}">
        ${eyebrow(typeLabel(p), p.collection)}
        <h1 class="pdp-title">${p.name}</h1>
        <p class="price price-lg">${PRICE} <span class="net">· ${NET_WT}</span></p>
        ${p.tallow ? `<p class="tallow-row">${icon('cow', 'icon')}Crafted with 100% locally farm-raised beef tallow.</p>` : ''}
        <p class="lead">${p.lead}</p>
        <p class="pdp-meta">Scent: —</p>
        <p class="pdp-meta">${stockLine(p)}${p.stock === 'out' ? '' : ' — from verified inventory'}</p>
        ${buy}
        <div class="accordion" data-accordion>
          ${[['Ingredients', `Full ingredient disclosure for every product.${p.tallow ? ` ${p.tallow}.` : ''} The ingredient list is published from approved records.`],
             ['Directions &amp; warnings', 'Directions and warnings are published from approved records.'],
             ['Shipping &amp; returns', 'Ships via UPS. Tso Bath &amp; Body currently ships within the United States only. <a class="link" href="' + root + 'help/#shipping">Shipping &amp; Returns</a>']]
            .map(([q, a], i) => `<div class="acc-item"><h2 class="acc-h"><button type="button" class="acc-btn" aria-expanded="false" aria-controls="acc-${i}">${q}<span class="acc-icon">${icon('plus', 'icon icon-plus')}${icon('minus', 'icon icon-minus')}</span></button></h2><div class="acc-panel" id="acc-${i}" hidden><p>${a}</p></div></div>`).join('\n          ')}
        </div>
        <ul class="assurances" role="list">
          <li>${icon('handmade')}Handmade in Fort Wayne</li>
          <li>${icon('truck')}Ships via UPS</li>
          <li>${icon('lock')}Stripe checkout</li>
        </ul>
      </div>
    </div>
  </div>
</section>
<section class="section section-alt" aria-labelledby="rel-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">More from Tso</p><h2 id="rel-h">You may also like</h2></div>
    <div class="product-grid grid-3">
${related.map((x) => productCard(root, x)).join('\n')}
    </div>
  </div>
</section>
<div class="sticky-buy" data-sticky-buy aria-hidden="true">
  <div class="sticky-inner">
    <div><p class="sticky-name">${p.name}</p><p class="price">${PRICE}</p></div>
    ${p.stock === 'out' ? `<button class="btn btn-secondary" type="button" data-notify="${p.slug}" tabindex="-1">Notify me</button>` : `<button class="btn btn-primary" type="button" data-add="${p.slug}" tabindex="-1">Add to Bag</button>`}
  </div>
</div>` });
}

function ourStory() {
  const root = '../';
  return page({ title: 'Our Story — Tso Bath & Body', description: 'Handmade in Fort Wayne, Indiana. Meet General Tso’s Meow™.', root, current: 'our-story',
    main: `<section class="section page-head">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Our Story']])}
    <p class="eyebrow">Our Story</p>
    <h1>Handmade in Fort Wayne, Indiana.</h1>
    <p class="lead">Fizzy surprises. Handmade soaps. Legendary gifts.</p>
    ${rule}
  </div>
</section>
<section class="section section-tight">
  <div class="wrap story-grid">
    ${slotOrConcept('STORY-01', '3 / 2', 'Founders and General Tso')}
    <div>
      <p class="eyebrow">The makers</p>
      <h2>Soak Well. Live Boldly.</h2>
      <p>Every Tso Bath &amp; Body product is handmade in Fort Wayne, Indiana, with full ingredient disclosure for every product and tallow soaps clearly marked.</p>
    </div>
  </div>
</section>
<section class="section section-alt" id="general-tso" aria-labelledby="gt-h">
  <div class="wrap story-grid">
    <div class="story-art">${emblem(root, '(min-width: 900px) 480px, 80vw')}</div>
    <div>
      <p class="eyebrow">The character</p>
      <h2 id="gt-h">Meet <em>General Tso’s Meow™</em></h2>
      <p>General Tso watches over both collections — a fortune in every Fortune Collection bath bomb, a Mission Dispatch in every Barracks Collection bath bomb.</p>
      <p>He also reports for duty as our shopping assistant.</p>
      <button class="btn btn-primary" type="button" data-chat-open>Ask General Tso</button>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="src-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">How it’s made</p><h2 id="src-h">From ingredients to workshop</h2>${rule}</div>
    <div class="three-up">
      <figure>${slotOrConcept('SRC-01', '3 / 2', 'Ingredients flat-lay')}<figcaption>Ingredients</figcaption></figure>
      <figure>${slotOrConcept('SOAP-01', '16 / 9', 'Lather and texture')}<figcaption>Lather &amp; texture</figcaption></figure>
      <figure>${slotOrConcept('SRC-03', '3 / 2', 'Production workshop')}<figcaption>Workshop</figcaption></figure>
    </div>
  </div>
</section>` });
}

const FAQ = [
  ['How does the fortune / Mission Dispatch reveal work?', 'Fortune Collection bath bombs carry a fortune; Barracks Collection bath bombs carry a Mission Dispatch. Delivery method (card or digital reveal) is a pending decision.'],
  ['Are your soaps vegan?', 'No. The fat base of both our soaps — Nine Lives Musk™ and Wonton’ in the Tub™ — is 100% beef tallow (animal-derived), with no other oils. They share that base and differ only in color and scent. Tallow soaps are always clearly marked.'],
  ['Where are products made?', 'Handmade in Fort Wayne, Indiana.'],
  ['Where do you ship?', 'Tso Bath &amp; Body currently ships within the United States only, via UPS.'],
];

function help() {
  const root = '../';
  const acc = (items, prefix) => `<div class="accordion" data-accordion>
${items.map(([q, a], i) => `  <div class="acc-item"><h3 class="acc-h"><button type="button" class="acc-btn" aria-expanded="false" aria-controls="${prefix}-${i}">${q}<span class="acc-icon">${icon('plus', 'icon icon-plus')}${icon('minus', 'icon icon-minus')}</span></button></h3><div class="acc-panel" id="${prefix}-${i}" hidden><p>${a}</p></div></div>`).join('\n')}
</div>`;
  const tabs = [['ingredients', 'Ingredients &amp; Care'], ['faq', 'FAQ'], ['shipping', 'Shipping &amp; Returns'], ['contact', 'Contact'], ['order', 'Order Information']];
  const panels = {
    ingredients: `<h2>Ingredients &amp; Care</h2>
<p>Full ingredient disclosure for every product; tallow soaps clearly marked.</p>
<table class="table"><caption class="sr-only">Products and tallow disclosure</caption>
<thead><tr><th scope="col">Product</th><th scope="col">Collection</th><th scope="col">Tallow</th></tr></thead>
<tbody>${PRODUCTS.map((p) => `<tr><th scope="row"><a class="link" href="${productUrl(root, p)}">${p.name}</a></th><td>${COLLECTIONS[p.collection].short}</td><td>${p.tallow || '—'}</td></tr>`).join('')}</tbody></table>
<p class="note">Full ingredient lists are published here from approved records.</p>`,
    faq: `<h2>FAQ</h2>${acc(FAQ, 'faq')}`,
    shipping: `<h2>Shipping &amp; Returns</h2>
<div class="banner banner-info">${icon('info')}<p><strong>Shipping scope.</strong> Tso Bath &amp; Body currently ships within the United States only.</p></div>
${acc([['Carrier', 'Orders ship via UPS. UPS Ground · — business days.'], ['Returns', 'Return terms are published here from approved records.']], 'ship')}`,
    contact: `<h2>Contact</h2>
<p>Order issues always reach a person. We reply within — business days.</p>
<form class="form" data-contact novalidate>
  <div class="field"><label class="label" for="c-name">Name (required)</label><input class="input" id="c-name" name="name" autocomplete="name" required></div>
  <div class="field"><label class="label" for="c-email">Email (required)</label><input class="input" id="c-email" name="email" type="email" inputmode="email" autocomplete="email" required></div>
  <div class="field"><label class="label" for="c-msg">Message (required)</label><textarea class="input textarea" id="c-msg" name="message" rows="5" required></textarea></div>
  <button class="btn btn-primary" type="submit">Send message</button>
  <p class="field-msg" data-form-msg aria-live="polite"></p>
</form>`,
    order: `<h2>Order Information</h2>
<p>Payment is completed on Stripe’s secure checkout page; card details never touch tsobathbody.com. Your confirmation email carries your order number (TSO-XXXXXX).</p>
<p>Questions about an order? <a class="link" href="#contact" data-tab-link="contact">Contact us</a> — order issues always escalate to the team.</p>`,
  };
  return page({ title: 'Help & information — Tso Bath & Body', description: 'Ingredients & Care, FAQ, Shipping & Returns, Contact and Order Information.', root, current: 'help', theme: 'light', bodyClass: 'light-main',
    main: `<section class="section page-head">
  <div class="wrap">
    ${crumbs(root, [['Home', ''], ['Help']])}
    <h1>Help &amp; information</h1>
  </div>
</section>
<section class="section section-tight">
  <div class="wrap narrow">
    <div class="tabs" role="tablist" aria-label="Help topics" data-tabs>
      ${tabs.map(([k, l], i) => `<button class="tab" role="tab" type="button" id="tab-${k}" aria-controls="panel-${k}" aria-selected="${i === 0}" data-tab="${k}"${i ? ' tabindex="-1"' : ''}>${l}</button>`).join('\n      ')}
    </div>
    ${tabs.map(([k], i) => `<div class="tab-panel" role="tabpanel" id="panel-${k}" aria-labelledby="tab-${k}" tabindex="0"${i ? ' hidden' : ''}>${panels[k]}</div>`).join('\n    ')}
  </div>
</section>` });
}

function bag() {
  const root = '../';
  return page({ title: 'Bag — Tso Bath & Body', description: 'Your bag.', root, current: 'bag',
    main: `<section class="section section-tight">
  <div class="wrap">
    <ol class="progress" role="list" aria-label="Checkout steps">
      <li aria-current="step"><span>1</span>Bag</li><li><span>2</span>Shipping</li><li><span>3</span>Payment (Stripe)</li><li><span>4</span>Confirmation</li>
    </ol>
    <h1>Bag</h1>
    <div class="banner banner-warning" data-bag-warning hidden>${icon('alert')}<p data-bag-warning-text></p></div>
    <div class="bag-grid" data-bag hidden>
      <ul class="bag-lines" role="list" data-bag-lines></ul>
      <aside class="summary" aria-labelledby="sum-h">
        <h2 id="sum-h" class="h3">Order summary (<span data-bag-items>0</span>)</h2>
        <dl class="sum-list">
          <div><dt>Subtotal</dt><dd>${PRICE}</dd></div>
          <div><dt>Shipping · UPS Ground</dt><dd>${PRICE}</dd></div>
          <div><dt>Tax</dt><dd>${PRICE}</dd></div>
          <div class="sum-total"><dt>Total</dt><dd>${PRICE}</dd></div>
        </dl>
        <a class="btn btn-primary btn-block" href="${root}checkout/">Checkout</a>
        <p class="secure">${icon('lock', 'icon icon-sm')}Secure checkout with Stripe</p>
      </aside>
    </div>
    <div class="empty" data-bag-empty hidden>
      ${cat(root, 96, 'cat cat-empty')}
      <p class="empty-title">Your bag is empty.</p>
      <p>General Tso recommends starting with a bath bomb. <a class="link" href="${root}bath-bombs/">Shop Bath Bombs</a></p>
    </div>
  </div>
</section>` });
}

function checkout() {
  const root = '../';
  return page({ title: 'Checkout — Tso Bath & Body', description: 'Shipping information.', root, current: 'bag', theme: 'light', bodyClass: 'light-main',
    main: `<section class="section section-tight">
  <div class="wrap">
    <ol class="progress" role="list" aria-label="Checkout steps">
      <li class="done"><span>${icon('check', 'icon icon-sm')}</span>Bag</li><li aria-current="step"><span>2</span>Shipping</li><li><span>3</span>Payment (Stripe)</li><li><span>4</span>Confirmation</li>
    </ol>
    <div class="banner banner-error" data-pay-error hidden>${icon('x-circle')}<p><strong>Payment unsuccessful.</strong> Your card was not charged. Stripe reported: [decline reason]. Your bag is saved.</p></div>
    <div class="checkout-grid" data-checkout>
      <form class="form" data-ship-form novalidate>
        <h1 class="h2">Shipping information</h1>
        <div class="field"><label class="label" for="s-email">Email (for order confirmation, required)</label><input class="input" id="s-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required></div>
        <div class="field-row">
          <div class="field"><label class="label" for="s-first">First name (required)</label><input class="input" id="s-first" name="first" autocomplete="given-name" required></div>
          <div class="field"><label class="label" for="s-last">Last name (required)</label><input class="input" id="s-last" name="last" autocomplete="family-name" required></div>
        </div>
        <div class="field"><label class="label" for="s-addr">Address (required)</label><input class="input" id="s-addr" name="address" autocomplete="address-line1" placeholder="Street address" required></div>
        <div class="field-row field-row-3">
          <div class="field"><label class="label" for="s-city">City (required)</label><input class="input" id="s-city" name="city" autocomplete="address-level2" required></div>
          <div class="field"><label class="label" for="s-state">State (required)</label><input class="input" id="s-state" name="state" autocomplete="address-level1" maxlength="2" required></div>
          <div class="field"><label class="label" for="s-zip">ZIP (required)</label><input class="input" id="s-zip" name="zip" autocomplete="postal-code" inputmode="numeric" maxlength="5" required></div>
        </div>
        <div class="field"><label class="label" for="s-country">Country / region</label>
          <select class="input select" id="s-country" name="country" autocomplete="country-name">
            <option value="US" selected>United States</option><option value="CA">Canada</option><option value="MX">Mexico</option><option value="GB">United Kingdom</option><option value="OTHER">Other</option>
          </select></div>
        <fieldset class="field">
          <legend class="label">Shipping method</legend>
          <label class="radio-card"><input type="radio" name="method" value="ups-ground" checked><span>UPS Ground · — business days</span><span class="price">${PRICE}</span></label>
        </fieldset>
        <label class="check"><input type="checkbox" name="optin"><span>Email me news and offers (opt-in)</span></label>
        <p class="note">${icon('lock', 'icon icon-sm')}You’ll complete payment on Stripe’s secure checkout page. Card details never touch tsobathbody.com.</p>
        <button class="btn btn-primary btn-block" type="submit">Continue to payment</button>
        <a class="btn btn-tertiary btn-block" href="${root}bag/">${icon('arrow-left', 'icon icon-sm')} Return to bag</a>
      </form>
      <aside class="summary" aria-labelledby="csum-h">
        <h2 id="csum-h" class="h3">Order summary (<span data-bag-items>0</span>)</h2>
        <ul class="mini-lines" role="list" data-mini-lines></ul>
        <dl class="sum-list">
          <div><dt>Subtotal</dt><dd>${PRICE}</dd></div>
          <div><dt>Shipping · UPS Ground</dt><dd>${PRICE}</dd></div>
          <div><dt>Tax</dt><dd>${PRICE}</dd></div>
          <div class="sum-total"><dt>Total</dt><dd>${PRICE}</dd></div>
        </dl>
      </aside>
    </div>
    <div class="empty" data-checkout-empty hidden>
      <p class="empty-title">Your bag is empty.</p>
      <p><a class="link" href="${root}bath-bombs/">Shop Bath Bombs</a></p>
    </div>
  </div>
</section>
<div class="modal-scrim" data-stripe hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="stripe-h">
    <p class="eyebrow">Step 3 · Payment (Stripe)</p>
    <h2 id="stripe-h" class="h3">Stripe’s secure checkout opens here</h2>
    <p>In the live store you complete payment on Stripe’s page. This preview takes no payment — choose an outcome to see each state.</p>
    <div class="btn-col">
      <button class="btn btn-primary btn-block" type="button" data-pay="ok">Simulate successful payment</button>
      <button class="btn btn-secondary btn-block" type="button" data-pay="fail">Simulate declined payment</button>
      <button class="btn btn-tertiary btn-block" type="button" data-pay="cancel">Cancel</button>
    </div>
  </div>
</div>` });
}

function confirmed() {
  const root = '../';
  return page({ title: 'Order confirmed — Tso Bath & Body', description: 'Payment successful.', root, current: 'bag',
    main: `<section class="section">
  <div class="wrap narrow center">
    <ol class="progress" role="list" aria-label="Checkout steps">
      <li class="done"><span>${icon('check', 'icon icon-sm')}</span>Bag</li><li class="done"><span>${icon('check', 'icon icon-sm')}</span>Shipping</li><li class="done"><span>${icon('check', 'icon icon-sm')}</span>Payment (Stripe)</li><li aria-current="step"><span>4</span>Confirmation</li>
    </ol>
    <div class="confirm-art">${emblem(root, '280px')}</div>
    <div class="banner banner-success">${icon('check-circle')}<p><strong>Payment successful.</strong> Thank you — your order is confirmed. Order <span data-order-no>TSO-XXXXXX</span>.</p></div>
    <h1>Payment successful.</h1>
    <p class="lead">A confirmation email is on its way to <span data-order-email>you@email.com</span>. General Tso salutes you.</p>
    <div class="btn-row center-row">
      <a class="btn btn-primary" href="${root}shop/">Continue shopping</a>
      <a class="btn btn-secondary" href="${root}help/#order">View order information</a>
    </div>
  </div>
</section>` });
}

function search() {
  const root = '../';
  const data = JSON.stringify(PRODUCTS.map((p) => ({ slug: p.slug, name: p.name, collection: COLLECTIONS[p.collection].name, type: p.type })));
  return page({ title: 'Search — Tso Bath & Body', description: 'Search products.', root, current: 'search',
    main: `<section class="section page-head">
  <div class="wrap narrow">
    ${crumbs(root, [['Home', ''], ['Search']])}
    <h1>Search</h1>
    <form class="search-form" role="search" data-search>
      <label class="sr-only" for="q">Search products</label>
      ${icon('search')}
      <input class="input" id="q" name="q" type="search" placeholder="Search bath bombs, soaps, collections" autocomplete="off">
    </form>
  </div>
</section>
<section class="section section-tight" aria-live="polite">
  <div class="wrap">
    <p class="result-count" data-search-count></p>
    <div class="product-grid" data-search-grid>
${PRODUCTS.map((p) => productCard(root, p, 2)).join('\n')}
    </div>
    <div class="empty" data-search-empty hidden>
      <p class="empty-title">No results for “<span data-search-term></span>”.</p>
      <p>Try a collection or product name. <a class="link" href="${root}shop/">Shop all</a></p>
    </div>
  </div>
</section>
<script type="application/json" id="search-data">${data}</script>` });
}

function legal(slug, title) {
  const root = '../';
  return page({ title: `${title} — Tso Bath & Body`, description: title, root, current: '', theme: 'light', bodyClass: 'light-main',
    main: `<section class="section page-head">
  <div class="wrap narrow">
    ${crumbs(root, [['Home', ''], [title]])}
    <h1>${title}</h1>
    <p class="lead">The ${title.toLowerCase()} for tsobathbody.com will be published here before launch.</p>
    <p><a class="link" href="${root}help/#contact">Contact us</a> with any questions.</p>
  </div>
</section>` });
}

function notFound() {
  const root = PAGES_BASE;
  return head({ title: 'Page not found — Tso Bath & Body', description: 'Page not found.', root, base: PAGES_BASE }).replace('</head>', '</head>') + `
<body data-root="${root}">
${header({ root, current: '' })}
<main id="main">
<section class="section">
  <div class="wrap narrow center">
    ${cat(root, 96, 'cat cat-empty')}
    <p class="eyebrow">404</p>
    <h1>This page has gone off duty.</h1>
    <p class="lead">The page you were looking for isn’t here. Try a collection, or ask General Tso.</p>
    <div class="btn-row center-row">
      <a class="btn btn-primary" href="${root}shop/">Shop all</a>
      <a class="btn btn-secondary" href="${root}">Home</a>
    </div>
  </div>
</section>
</main>
${footer(root)}
${chat(root)}
</body>
</html>
`;
}

// ---- write ----
const files = {
  'index.html': home(),
  'shop/index.html': listingPage({ root: '../', title: 'Shop All', heading: 'Shop all', intro: 'Fizzy surprises. Handmade soaps. Legendary gifts.', list: PRODUCTS, current: '',
    eyebrowText: 'SHOP ALL', crumbsList: [['Home', ''], ['Shop All']],
    chips: [['all', 'All'], ['bath-bombs', 'Bath Bombs'], ['soaps', 'Soaps'], ['fortune', 'Fortune'], ['barracks', 'Barracks']] }),
  'bath-bombs/index.html': listingPage({ root: '../', title: 'Bath Bombs', heading: 'Bath Bombs', intro: 'Fizzy surprises. A fortune or a Mission Dispatch in every one.', list: PRODUCTS.filter((p) => p.category === 'bath-bombs'), current: 'bath-bombs',
    eyebrowText: 'BATH BOMBS', crumbsList: [['Home', ''], ['Bath Bombs']], chips: [['all', 'All'], ['fortune', 'Fortune'], ['barracks', 'Barracks']] }),
  'soaps/index.html': listingPage({ root: '../', title: 'Soaps', heading: 'Soaps', intro: 'Handmade soaps. Tallow soaps clearly marked.', list: PRODUCTS.filter((p) => p.category === 'soaps'), current: 'soaps',
    eyebrowText: 'SOAPS', crumbsList: [['Home', ''], ['Soaps']], chips: [['all', 'All'], ['fortune', 'Fortune'], ['barracks', 'Barracks']] }),
  'collections/index.html': collectionsHub(),
  'collections/fortune/index.html': collectionPage('fortune'),
  'collections/barracks/index.html': collectionPage('barracks'),
  'gift-sets/index.html': giftSets(),
  'our-story/index.html': ourStory(),
  'help/index.html': help(),
  'bag/index.html': bag(),
  'checkout/index.html': checkout(),
  'order-confirmed/index.html': confirmed(),
  'search/index.html': search(),
  'privacy/index.html': legal('privacy', 'Privacy Policy'),
  'terms/index.html': legal('terms', 'Terms of Service'),
  'accessibility/index.html': legal('accessibility', 'Accessibility'),
  '404.html': notFound(),
};
for (const p of PRODUCTS) files[`products/${p.slug}/index.html`] = productPage(p);

// Product data for the bag, shared with site.js.
files['assets/js/products.json'] = JSON.stringify(Object.fromEntries(PRODUCTS.map((p) => [p.slug, {
  name: p.name, collection: COLLECTIONS[p.collection].name, key: p.collection, type: p.type, slot: p.slot,
  max: p.stock === 'out' ? 0 : p.stock === 'low' ? p.left : 10, tallow: p.tallow || '',
  img: PHOTOS[p.slot] ? `${PHOTO_DIR}${PHOTOS[p.slot].file}-${PHOTOS[p.slot].half}.jpg` : '',
}])), null, 2) + '\n';

for (const [rel, html] of Object.entries(files)) {
  const out = join(OUT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
console.log(`wrote ${Object.keys(files).length} files`);

function heroPhoto(root) {
  // Moodboard composition (owner, 2026-10-15): the approved compact-cat PNG on a dressed P3 ground
  // (owner-supplied transparent art layers 2026-10-15 in assets/hero/: waves, 福 lantern, blossom branches,
  //  sparkles, gold stage ring — none contains a cat, logo or wordmark; no second wordmark in the hero) — no
  // generated photo, so nothing needs masking. Desktop: cat left, branding + shopping right. Phones:
  // compact cat-led stack (portrait) or side by side (landscape). Artwork is never cropped or filtered.
  const b = `${root}assets/brand/`;
  return `<section class="hero hero-brand" data-focus="HERO">
  <div class="hb-deco" aria-hidden="true">
    <span class="hb-lantern hb-lantern-a"></span><span class="hb-lantern hb-lantern-b"></span>
    <img class="hb-l hb-sparkles" src="${root}assets/hero/sparkles.png" alt="" decoding="async">
    <img class="hb-l hb-wave-left" src="${root}assets/hero/waves-left.png" alt="" decoding="async">
    <img class="hb-l hb-branch-l" src="${root}assets/hero/blossom-branch-left.png" alt="" decoding="async">
    <img class="hb-l hb-branch-r" src="${root}assets/hero/blossom-branch-right.png" alt="" decoding="async">
    <img class="hb-l hb-lantern-fu" src="${root}assets/hero/lantern-fu.png" alt="" decoding="async">
    <span class="hb-waves"></span>
  </div>
  <div class="wrap hb-grid">
    <div class="hb-art">
      <img class="hb-stage" src="${root}assets/hero/stage-glow.png" alt="" aria-hidden="true" decoding="async">
      <img class="hb-cat" src="${b}general-tso-compact-cat.png" srcset="${b}general-tso-compact-cat-256w.webp 256w, ${b}general-tso-compact-cat-512w.webp 512w, ${b}general-tso-compact-cat.png 1254w" sizes="(min-width: 1024px) 440px, (orientation: landscape) 34vh, 180px" alt="General Tso, the Tso Bath &amp; Body cat" width="1254" height="1254" fetchpriority="high">
    </div>
    <div class="hb-copy">
      <p class="eyebrow">TSO BATH &amp; BODY · FORT WAYNE, INDIANA</p>
      <h1 class="display">Soak Well.<br>Live Boldly.</h1>
      <p class="lead">Fizzy surprises. Handmade soaps. Legendary gifts.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${root}bath-bombs/">Shop Bath Bombs</a>
        <a class="btn btn-secondary" href="${root}soaps/">Shop Soaps</a>
      </div>
    </div>
  </div>
</section>
`;
}

REVIEW = true;
const FRAMES = {
  'home': ['', home()],
  'collections-fortune': ['collections/fortune/', collectionPage('fortune')],
  'collections-barracks': ['collections/barracks/', collectionPage('barracks')],
  'gift-sets': ['gift-sets/', giftSets()],
  ...Object.fromEntries(PRODUCTS.map((p) => [`product-${p.slug}`, [`products/${p.slug}/`, productPage(p)]])),
};
REVIEW = false;
const FRAME_HEAD = (orig) => `<base href="${PAGES_BASE}${orig}">
<link rel="stylesheet" href="${PAGES_BASE}image-review/frame.css?v=${REVIEW_V}">
<script>addEventListener('load',()=>{const f=new URLSearchParams(location.search).get('focus');const el=f&&f!=='HERO'&&document.querySelector('[data-focus="'+f+'"]');if(el)el.scrollIntoView({block:'center'});});</script>
`;
for (const [name, [orig, html]] of Object.entries(FRAMES)) {
  const out = join(OUT, 'image-review', 'frames', `${name}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html.replace('<title>', FRAME_HEAD(orig) + '<title>')
    .replace('<meta name="description"', '<meta name="tso-review" content="concept frame — not the storefront">\n<meta name="description"'));
}
console.log(`wrote ${Object.keys(FRAMES).length} review frames`);

// Review page: one section per slot group; each shows the concept as generated, then live frames of the
// real templates at the five test viewports. Static page, not linked from the storefront.
const DEVICES = [
  ['Desktop', 1440, 900], ['iOS Safari · portrait', 402, 874], ['iOS Safari · landscape', 874, 402],
  ['Android Chrome · portrait', 412, 915], ['Android Chrome · landscape', 915, 412],
];
const FULL = { 'HERO-D-01': 1866, 'HERO-P-01': 1108, 'HERO-L-01': 1688 };
const fullOf = (id) => FULL[id] || (id.startsWith('PRD') ? 1254 : /^(DEMO-0[23]|GIFT)/.test(id) ? 1600 : 1448);
const halfOf = (id) => ({ 'HERO-D-01': 933, 'HERO-P-01': 554, 'HERO-L-01': 844 }[id]) || Math.round(fullOf(id) / 2);
const RS = [
  { ids: ['HERO-D-01', 'HERO-P-01', 'HERO-L-01'], title: 'Home hero', frame: 'home', focus: 'HERO',
    files: [['HERO-D-01', '1866×843', '2880×1300', '6c083373797d677c'], ['HERO-P-01', '1108×1420', '1170×1500', '282b8f7b83f0b940'], ['HERO-L-01', '1869×842', '1688×760', 'b2eed7d665273903']],
    notes: ['<strong>Superseded 2026-10-15:</strong> the storefront hero now follows the moodboard composition (approved compact cat on a clean ground) and no longer uses these photos. The frames below show the current hero.',
      'Each hero concept draws its own General Tso. Here the approved full-emblem PNG is placed over that cat, uncropped, on a dark ground — the generated cat is not shown as identity.',
      'Desktop uses HERO-D-01 with the headline over its clear left third. iOS/Android portrait use HERO-P-01 with copy below (P3 HERO-P-01).',
      'Phone landscape uses HERO-L-01, whose cat sits left of centre where the headline would go, so copy is shown below the photo. A HERO-L with a clear left third would let the copy sit over it.',
      'HERO-D-01 is 1866 px wide against a 2880 px target: slightly soft on large retina desktops.'] },
  { ids: ['COL-F-01', 'COL-B-01'], title: 'Collection cards (home + Collections)', frame: 'home', focus: 'COL-F-01',
    files: [['COL-F-01', '1448×1086', '1600×1200', '8ac16d58b85affa1'], ['COL-B-01', '1448×1086', '1600×1200', 'bb219994e086c829']],
    notes: ['Boxes show a generated cat badge: provisional packaging concept, not an approved replacement for the logo.'] },
  { ids: ['DEMO-01'], title: 'The reveal · Drop it in', frame: 'home', focus: 'DEMO-01',
    files: [['DEMO-01', '1448×1086', '1600×1200', '698d25aa5fdceaab']],
    notes: ['Generated cat badge on the box in the background: provisional packaging concept.', 'DEMO-02 and DEMO-03 remain placeholders (DEMO-03 waits on the reveal decision).'] },
  ...PRODUCTS.map((p) => ({ ids: [p.slot + '-A'], title: p.name + ' · main image', frame: `product-${p.slug}`, focus: p.slot,
    files: [[p.slot + '-A', '1254×1254', '2000×2000', { 'PRD-01': '63516dc3b680f2a7', 'PRD-02': 'f73e2c00952497e1', 'PRD-03': 'd1b01e645b8e4221', 'PRD-04': 'e48e30501a3a58cb' }[p.slot]]],
    notes: ['Shown as the product page main image and on every product card. Angles B–E remain placeholders.', 'Generated cat badge on the box: provisional packaging concept, not an approved replacement for the logo.', '1254 px against a 2000 px target: sharp at current display sizes; zoom would need the full export.'] })),
  { batch: 2, ids: ['DEMO-02', 'DEMO-03'], title: 'The reveal · Let it fizz + Read the message', frame: 'home', focus: 'DEMO-02',
    files: [['DEMO-02', '1600×1200', '1600×1200', '5494b46594a035f2'], ['DEMO-03', '1600×1200', '1600×1200', '7258385ad6e22c11'], ['DEMO-03-B', '1600×1200', '1600×1200', '0e82e30455b52b67']],
    notes: ['DEMO-03 slot uses the <strong>Fortune</strong> slip only. DEMO-03-B (Barracks Mission Dispatch) is shown here as a gallery variant and is not placed in any customer scene — the site has no collection-aware reveal yet.',
      'Text printed in the images is not approved copy: DEMO-02’s box reads “Wonton in the Tub” above “Fortune Cookie Bath Bomb” (a soap name on a bath-bomb box); the DEMO-03 boxes carry “WOMEN &amp; GIRLS” / “MEN &amp; BOYS”, gendered labels the claims register did not adopt.',
      'The slip is a proposed waterproof-paper concept, not safety-tested; no claim about the insert is added to the site.',
      'Delivered at 1600×1200 but resampled from smaller renders (per the handoff): no added photographic detail.'] },
  { batch: 2, ids: ['GIFT-01-F', 'GIFT-01-B', 'GIFT-02'], title: 'Gift Sets / Bundles', frame: 'gift-sets', focus: 'GIFT-01-F',
    files: [['GIFT-01-F', '1600×1200', '1600×1200', '1750b2e7c6788b16'], ['GIFT-01-B', '1600×1200', '1600×1200', '375dfcf89eb27df5'], ['GIFT-02', '1600×1200', '1600×1200', 'c4bb05eef5fbd9be']],
    notes: ['<strong>Filenames were swapped in the ZIP</strong>: <code>GIFT-02-Gift-Presentation.jpg</code> shows the Fortune 6 + 6 box and <code>GIFT-01-F-Fortune-6-Bombs-6-Soaps.jpg</code> shows the presentation box. They are placed here by content (sha256 shown is the file actually used in each slot).',
      'The Fortune box prints <strong>“TSO Bath &amp; Body®”</strong>. ® claims a registered trademark; the only mark on record is General Tso’s Meow™. Needs owner confirmation or a corrected render.',
      'Unapproved copy printed on packaging: “Men &amp; Boys Collection”, “Clean guys cause big splashes”, “Rugged · Fiercely clean · Field-tested”, “Rituals for a brighter day”, “A little ritual brightens every day”, “Today’s Fortune: Clean Rituals Brighter Days”, “Good Things Are Waiting Inside”.',
      'Generated cat badges and generated “TSO Bath &amp; Body” lettering on the boxes are provisional packaging concepts, not replacements for the approved logo artwork.',
      'Both sets show six bath bombs and six soaps; sizes, weights and box construction are not final. The page keeps “Coming soon” with no price.'] },
];
const reviewPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>Image Review — Tso Bath &amp; Body</title>
<meta name="theme-color" content="#071719">
<link rel="icon" type="image/svg+xml" href="../favicon.svg?v=${ASSET_V}">
<link rel="stylesheet" href="../assets/css/site.css?v=${ASSET_V}">
<link rel="stylesheet" href="review.css?v=${REVIEW_V}">
</head>
<body class="review">
<header class="rv-head"><div class="wrap">
  <p class="eyebrow">Owner review · not the storefront</p>
  <h1>Website image concepts</h1>
  <p class="lead">Concept images shown inside their real slots on the storefront templates at desktop, iOS and Android sizes. <strong>Batch 1</strong> (ten slots) was approved and installed on 2026-10-15. <strong>Batch 2</strong> (reveal steps and gift sets) was approved and installed the same day.</p>
  <ul class="rv-rules">
    <li><strong>Identity:</strong> the approved General Tso PNG remains the authority. Heroes use the approved emblem in place of the generated cat.</li>
    <li><strong>Packaging:</strong> the cat badges printed on generated boxes are provisional concept imagery, not an approved replacement for the logo.</li>
    <li><strong>Not included:</strong> product angles B–E, SRC/SOAP/STORY slots — they stay placeholders.</li>
    <li>Gold labels mark every concept image inside the frames: <span class="rv-chip">APPROVED</span> on every installed image; anything still awaiting a decision is labelled <span class="rv-chip">PENDING APPROVAL</span>.</li>
  </ul>
  <nav class="rv-toc" aria-label="Slots">${RS.map((r, i) => `<a href="#s${i}">${r.batch === 2 ? '★ ' : ''}${r.ids.join(' · ')}</a>`).join('')}<a href="#devices">Device captures</a></nav>
</div></header>
<main class="wrap">
${RS.map((r, i) => `<section class="rv-slot" id="s${i}">
  <p class="eyebrow">${r.batch === 2 ? 'Batch 2 · approved 2026-10-15 · installed' : 'Batch 1 · approved 2026-10-15 · installed'}</p>
  <h2>${r.title}</h2>
  <div class="rv-table" tabindex="0" role="region" aria-label="Slot details"><table class="rv-meta"><thead><tr><th>Slot</th><th>Generated</th><th>Target</th><th>sha256</th><th>As generated</th></tr></thead><tbody>
  ${r.files.map(([id, g, t, h]) => `<tr><td>${id}</td><td>${g}</td><td>${t}</td><td><code>${h}…</code></td><td><a class="link" href="img/${id}-${fullOf(id)}.jpg">open</a></td></tr>`).join('')}
  </tbody></table></div>
  <div class="rv-raw">${r.files.map(([id]) => `<a href="img/${id}-${fullOf(id)}.jpg"><img src="img/${id}-${halfOf(id)}.jpg" alt="${id} as generated" loading="lazy"><span>${id} as generated</span></a>`).join('')}</div>
  <ul class="rv-notes">${r.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
  <div class="rv-devices">
  ${DEVICES.map(([label, w, h]) => `<figure class="rv-device" style="--w:${w};--h:${h}"><figcaption>${label} <span>${w}×${h}</span></figcaption><div class="rv-screen"><iframe src="frames/${r.frame}.html?focus=${r.focus}" width="${w}" height="${h}" loading="lazy" title="${esc(r.title)} — ${label}"></iframe></div></figure>`).join('\n  ')}
  </div>
  <p class="rv-decision">Owner approved ${r.ids.join(', ')} on 2026-10-15; live on the storefront.${r.ids.includes('DEMO-03') ? ' DEMO-03-B (Barracks dispatch) stays in this gallery only.' : ''}</p>
</section>`).join('\n')}
<section class="rv-slot" id="devices">
  <h2>Device captures</h2>
  <p>Real screenshots from the iOS Simulator (iPhone 17, iOS 26.5, Safari) and the Android emulator (Android 14, Chrome 113), portrait and landscape, of the review frames above — 28 batch-1 and 12 batch-2 captures, taken from the live URL on 2026-10-15.</p>
  ${[['hero', 'Home hero'], ['collections', 'Collection cards'], ['demo', 'Reveal · DEMO-01'], ['prd-01', 'Fortune Cookie Bath Bomb™'], ['prd-02', 'Wonton’ in the Tub™'], ['prd-03', 'The Exploding Dumpling™'], ['prd-04', 'Nine Lives Musk™'], ['demo2', 'Batch 2 · Reveal steps (DEMO-02, DEMO-03 Fortune)'], ['gifts', 'Batch 2 · Gift sets (GIFT-01-F, GIFT-01-B)'], ['gift-02', 'Batch 2 · Gift presentation (GIFT-02)']].map(([k, t]) => `<h3 class="rv-cap-h">${t}</h3>
  <div class="rv-captures">${[['ios', 'portrait', 'iOS Safari · portrait'], ['ios', 'landscape', 'iOS Safari · landscape'], ['android', 'portrait', 'Android Chrome · portrait'], ['android', 'landscape', 'Android Chrome · landscape']].map(([d, o, l]) => `<figure><a href="captures/${d}-${o}-${k}.jpg"><img src="captures/${d}-${o}-${k}.jpg" alt="${t} — ${l}" loading="lazy"></a><figcaption>${l}</figcaption></figure>`).join('')}</div>`).join('\n  ')}
</section>
</main>
<script>
// Fit each frame to its column; frames keep their true CSS viewport size.
function fit(){document.querySelectorAll('.rv-device').forEach((f)=>{const w=+getComputedStyle(f).getPropertyValue('--w');const h=+getComputedStyle(f).getPropertyValue('--h');const s=Math.min(1,f.clientWidth/w);f.style.setProperty('--s',s);f.querySelector('.rv-screen').style.height=(h*s)+'px';});}
addEventListener('resize',fit);fit();
</script>
</body>
</html>
`;
writeFileSync(join(OUT, 'image-review', 'index.html'), reviewPage);
console.log('wrote image-review/index.html');
