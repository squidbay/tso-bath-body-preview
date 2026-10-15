# QA evidence — Tso Bath & Body preview, 2026-10-15

Live URL: https://squidbay.github.io/tso-bath-body-preview/ — verified at main `81d95af` (Pages build `built`).

| Check | Result |
|---|---|
| Deployed files vs repository (sha256, cache-busted) | 62 / 62 identical |
| Page × viewport sweep (23 pages × 10 viewports: 1440, 1280, 1024, 768, 390, 844 land, 412, 915 land, 360, 320) — horizontal scroll, element overflow, clipped text, header collisions, tap targets ≥ 40 px, broken images, fonts loaded, console/network errors | 230 / 230 clean (`browser-sweep/sweep.json`, one screenshot per cell). The 10 extra cells for `/collections/nothing-here/` are the deliberate 404 page; their only entry is that page's own 404 status. |
| Interaction flows (add to bag, stock limits, notify-me, bag reductions/remove/empty, checkout validation, US-only scope, Stripe success/decline, confirmation, help tabs + deep links + keyboard, accordions, contact/opt-in, search + no results, filters, dropdown, drawer + Escape + focus return, chat answers/escalation/fallback/no HTML injection, chat geometry desktop/portrait/landscape, sticky PDP bar) | 60 / 60 PASS (`flows/flows.json`, state screenshots) |
| iOS Safari, iPhone 17 simulator (iOS 26.5), live URL, portrait | Home, menu drawer, Barracks collection, PDP stepper capped at stock (3) and bag count 3 — pass (`ios-safari/`). Three defects found here were fixed in `81d95af`. |
| iOS landscape, Android Chrome emulator | **Not run.** Free disk fell to 680 MiB with one simulator running and the guard shut it down; the Android emulator needs more. Landscape layout is covered by the 844×390 and 915×412 browser cells above, not by a device run. |

Scripts: `sweep.mjs`, `flows.mjs` (playwright-core + system Chrome).
