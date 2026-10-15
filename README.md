# Tso Bath & Body — Website Preview (owner review)

A static owner-review preview of the proposed tsobathbody.com storefront. This is **not** the production website: there is no payment, no order system and no data collection. It exists so the owner can review the structure, look and behaviour of the site in a real browser and on real phones.

- Preview URL: https://squidbay.github.io/tso-bath-body-preview/
- Every page carries `<meta name="robots" content="noindex, nofollow">`.
- Design authority: **P3 Design System v2.2.1** (Canva `DAHYCk5W3Ds`), built on P1 Wireframe v1.1 and P2 Colors & Type v1.0. See `DESIGN-AUTHORITY.md`.

## Pages

| Path | Page | P1/P3 reference |
|---|---|---|
| `index.html` | Home — hero, signature products, collections, reveal, story teaser | P1-01/02, P3 15 |
| `shop/` | Shop All with filter chips | P1-03/04 |
| `bath-bombs/`, `soaps/` | Category listings | P1-03 |
| `collections/`, `collections/fortune/`, `collections/barracks/` | Collections hub and the two collections | P3 12 |
| `gift-sets/` | Gift Sets / Bundles — Fortune and Barracks 12-piece sets plus the featured **Double Happiness Chest** (GIFT-03, 24 pieces, coming soon, no price) | P3 19 |
| `products/<slug>/` × 4 | Product detail — gallery, stepper, inventory, tallow disclosure, accordions, sticky mobile bar | P1-05, P3 13 |
| `our-story/` (+ `#general-tso`) | Our Story and Meet General Tso | P3 03 |
| `help/` (`#ingredients` `#faq` `#shipping` `#contact` `#order`) | Help Hub, light treatment | P1-09/11, P3 17 |
| `bag/` | Bag — steppers, remove, low-stock reduction, empty state | P1-07, P3 14 |
| `checkout/` | Shipping information, light treatment, validation, US-only scope, Stripe step | P1-08, P3 14 |
| `order-confirmed/` | Payment successful | P3 17 |
| `search/` | Search with no-results state (`?q=`) | P3 17 |
| `privacy/`, `terms/`, `accessibility/` | Legal placeholders | footer |
| `404.html` | Not found (served by Pages for any missing path) | — |

General Tso (P1-12, P3 16) is on every page: launcher bottom-right, the **TSO** header utility on desktop, and links in the menu. Desktop panel 400×640; full-height sheet in phone portrait; 60 % right sheet in phone landscape. Answers come only from approved P3 copy; order questions escalate to the contact form.

## Preview-only behaviour

- **Prices** show `$—.—` and net weight `— oz` exactly as in P3: no prices have been approved.
- **Imagery**: fifteen owner-approved images (2026-10-15, two batches) are installed from `assets/photos/`: collection cards (COL-F/B-01), all three reveal steps (DEMO-01, DEMO-02, DEMO-03 — Fortune slip only), each product's main image (PRD-01…04), and the gift sets (GIFT-01-F, GIFT-01-B, GIFT-02). They are approved concept images, not final product photography; the cat badges printed on their packaging are provisional concept art, not a replacement for the logo. The home hero follows the brand moodboard's website preview (owner, 2026-10-15): the approved compact-cat PNG on a clean Midnight Jade ground — cat left, horizontal lockup + headline + shop buttons right on desktop; compact cat-led layouts on phones. No hero photograph is used, so no generated mascot needs masking. Every other photo position keeps the P3 striped placeholder labelled with its slot ID. The approval record is `image-review/` (https://squidbay.github.io/tso-bath-body-preview/image-review/).
- **Bag** lives in this browser's `localStorage`. Inventory states are demonstration states from P3 page 12 (in stock / low stock · 3 left / out of stock).
- **Checkout** validates and then opens a "Stripe step" dialog. No payment is taken; the dialog lets the reviewer choose a successful or declined outcome to see both states.
- **Forms** (email opt-in, contact, back-in-stock) validate and then say plainly that nothing was sent or stored.
- **Social icons** are shown without links until the account URLs are supplied.
- No third-party scripts, analytics or network requests other than this site's own files.

## Building

`tools/build.mjs` generates every HTML page (plus `assets/js/products.json`) from shared header, footer, chat and component templates:

```bash
node tools/build.mjs
```

- `assets/css/site.css` — all styling. Its token block is copied verbatim from P3 `04_tokens/tokens.css`.
- `assets/js/site.js` — menu, dropdown, bag, steppers, filters, search, tabs, accordions, forms, checkout states, chat.
- `tools/src-icons/` — the P3 SVG icon library (ui, social, ornaments). The build inlines them with only the root `<svg>` tag and provenance metadata changed; path geometry is untouched.
- `tools/og/` — the OG-01 share card source; `og.png` is rendered from it with system Chrome (`NODE_PATH=<dir with playwright-core> node tools/og/render.mjs`).

## Viewing locally

The pages use relative links, so any static server works from the repository root:

```bash
python3 -m http.server 8000
```

The 404 page uses the absolute `/tso-bath-body-preview/` path GitHub Pages serves it from; test it on Pages or under that path.
