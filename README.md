# QA evidence — Tso Bath & Body preview, 2026-10-15

Live URL: https://squidbay.github.io/tso-bath-body-preview/ — verified at main `81d95af` (Pages build `built`).

| Check | Result |
|---|---|
| Deployed files vs repository (sha256, cache-busted) | 62 / 62 identical |
| Page × viewport sweep (23 pages × 10 viewports: 1440, 1280, 1024, 768, 390, 844 land, 412, 915 land, 360, 320) — horizontal scroll, element overflow, clipped text, header collisions, tap targets ≥ 40 px, broken images, fonts loaded, console/network errors | 230 / 230 clean (`browser-sweep/sweep.json`, one screenshot per cell). The 10 extra cells for `/collections/nothing-here/` are the deliberate 404 page; their only entry is that page's own 404 status. |
| Interaction flows (add to bag, stock limits, notify-me, bag reductions/remove/empty, checkout validation, US-only scope, Stripe success/decline, confirmation, help tabs + deep links + keyboard, accordions, contact/opt-in, search + no results, filters, dropdown, drawer + Escape + focus return, chat answers/escalation/fallback/no HTML injection, chat geometry desktop/portrait/landscape, sticky PDP bar) | 60 / 60 PASS (`flows/flows.json`, state screenshots) |
| iOS Safari, iPhone 17 simulator (iOS 26.5), live URL, portrait | Home, menu drawer, Barracks collection, PDP stepper capped at stock (3) and bag count 3 — pass (`ios-safari/`). Three defects found here were fixed in `81d95af`. |
| iOS Safari landscape (iPhone 17 sim, rotated via Device ▸ Rotate Left) | Home hero, General Tso chat as the 60 % right sheet, product page in two columns clearing the Dynamic Island side — pass (`ios-safari/ios-land-*`). Found: opening chat focused the input and the keyboard covered the landscape sheet → fixed in `92c2064`. |
| Android Chrome 113 on Android 14 emulator (medium_phone, 1080×2400), driven over CDP | Portrait 412×811: 23/23 pages + 9/9 flows. Landscape 915×308: 23/23 pages + 9/9 flows (stepper cap, toast on screen, bag count, chat full sheet / 60 % sheet, no keyboard pop, chat answer, drawer open/close, no page errors). `android-chrome/*.json`, screenshots. |

Scripts: `sweep.mjs`, `flows.mjs` (playwright-core + system Chrome).

## Final re-verification at `92c2064`

62/62 deployed files identical; browser sweep 230/230 clean (+10 cells for the deliberate 404 path, whose only entry is its own 404 status); flows 60/60. See `final-92c2064/`.
