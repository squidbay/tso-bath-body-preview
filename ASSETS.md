# Assets and provenance

Source: the three P3 v2.2.1 handoff ZIPs (`Tso_P3_v2_2_1_part1_icons_tokens_docs_mark.zip`, `…part2_brand_png_large_rasters.zip`, `…part3_static_authority_html.zip`), extracted and merged 2026-10-15. Every file below is byte-identical to its source (verified with `cmp`).

| Installed file | P3 source | sha256 (first 16) |
|---|---|---|
| `favicon.svg` | `07_web_optimized_derivatives/icons/favicon.svg` | `0814ec1ad10b55fc` |
| `favicon.ico` | `07_web_optimized_derivatives/icons/favicon.ico` | `849faae080a1926d` |
| `apple-touch-icon-180.png` | `03_favicons_touch_icons/apple-touch-icon-180.png` | `1fc0fec4260bd027` |
| `apple-touch-icon-167.png` | `03_favicons_touch_icons/apple-touch-icon-167.png` | `80f326738da150f4` |
| `apple-touch-icon-152.png` | `03_favicons_touch_icons/apple-touch-icon-152.png` | `b17f6957e323581c` |
| `assets/icons/android-any-192.png` | `03_favicons_touch_icons/android-any-192.png` | `13a506f6e625e7df` |
| `assets/icons/android-any-512.png` | `03_favicons_touch_icons/android-any-512.png` | `435b822312048e95` |
| `assets/icons/android-maskable-192.png` | `03_favicons_touch_icons/android-maskable-192.png` | `edae02a23fc3fde4` |
| `assets/icons/android-maskable-512.png` | `03_favicons_touch_icons/android-maskable-512.png` | `fc584768fb0e2834` |
| `assets/icons/ios-splash-1290x2796.png` | `03_favicons_touch_icons/splash/ios-splash-1290x2796.png` | `689b20495ff13a4a` |
| `assets/icons/android-splash-1080x2400.png` | `03_favicons_touch_icons/splash/android-splash-1080x2400.png` | `069d728387e9fe3c` |
| `assets/brand/general-tso-compact-cat.png` | `01_brand_artwork_approved_png/general-tso-compact-cat.png` | `5afa1ebf35ea0408` |
| `assets/brand/general-tso-full-emblem.png` | `01_brand_artwork_approved_png/general-tso-full-emblem.png` | `bc2dae360fb377ce` |
| `assets/brand/tso-bath-body-horizontal-logo.png` | `01_brand_artwork_approved_png/tso-bath-body-horizontal-logo.png` | `5cd6395a456d0b92` |
| `assets/brand/general-tso-compact-cat-192w.webp` | `07_web_optimized_derivatives/logos/general-tso-compact-cat-192w.webp` | `fdda6cf9f49d6d58` |
| `assets/brand/general-tso-compact-cat-256w.webp` | `07_web_optimized_derivatives/logos/general-tso-compact-cat-256w.webp` | `6dcb2a26aebba280` |
| `assets/brand/general-tso-compact-cat-512w.webp` | `07_web_optimized_derivatives/logos/general-tso-compact-cat-512w.webp` | `9670791c5987a2e0` |
| `assets/brand/general-tso-compact-cat-96w.webp` | `07_web_optimized_derivatives/logos/general-tso-compact-cat-96w.webp` | `a7ca36aa90fd25d6` |
| `assets/brand/general-tso-full-emblem-1254w.webp` | `07_web_optimized_derivatives/logos/general-tso-full-emblem-1254w.webp` | `65c746a42d1eb398` |
| `assets/brand/general-tso-full-emblem-480w.webp` | `07_web_optimized_derivatives/logos/general-tso-full-emblem-480w.webp` | `0df28d5a82339eac` |
| `assets/brand/general-tso-full-emblem-960w.webp` | `07_web_optimized_derivatives/logos/general-tso-full-emblem-960w.webp` | `ae5548d2a0973186` |
| `assets/brand/tso-bath-body-horizontal-logo-360w.webp` | `07_web_optimized_derivatives/logos/tso-bath-body-horizontal-logo-360w.webp` | `a456e0a795935667` |
| `assets/brand/tso-bath-body-horizontal-logo-540w.webp` | `07_web_optimized_derivatives/logos/tso-bath-body-horizontal-logo-540w.webp` | `b1c074f6eb351f4d` |
| `assets/brand/tso-bath-body-horizontal-logo-720w.webp` | `07_web_optimized_derivatives/logos/tso-bath-body-horizontal-logo-720w.webp` | `d6e3b36f3d2db2ce` |
| `assets/brand/tso-bath-body-horizontal-logo-960w.webp` | `07_web_optimized_derivatives/logos/tso-bath-body-horizontal-logo-960w.webp` | `d7ffd5f9bf08b7bd` |

SVG icons in `tools/src-icons/` are copied unchanged from `02_svg_icons/` (54 ui, 6 social, 7 ornaments).

## Fonts

Self-hosted WOFF2 (latin subset) from Fontsource 5.3.0, SIL Open Font License 1.1 (`assets/fonts/OFL-*.txt`): Cormorant Garamond 600, 700, 500 italic; Nunito Sans 400, 600, 700, 400 italic — the seven cuts P3 page 07 allows.

## Generated here

- `og.png` — OG-01 share card (1200×630) rendered from `tools/og/card.html` using only the approved PNGs, P2 colors and P3 copy.
- `manifest.webmanifest` — per P3 INSTALL notes (any + maskable 192/512, theme and background `#071719`).

## Owner-approved photography (2026-10-15)

`assets/photos/` — JPEG q82 at the generated size and a half-size copy, made with `sips` from the PNGs in `Tso_Bath_Body_Website_Image_Concepts_2026-10-15.zip` (zip sha256 `bff305beb0eda558…`; per-image sha256 in `image-review/`). HERO-L-01 was downsized from 1869 to its 1688 px target; nothing was cropped, recolored or filtered.

| Slot | File | Generated | P3 target |
|---|---|---|---|
| HERO-D-01 | HERO-D-01-1866.jpg / -933 | 1866×843 | 2880×1300 |
| HERO-P-01 | HERO-P-01-1108.jpg / -554 | 1108×1420 | 1170×1500 |
| HERO-L-01 | HERO-L-01-1688.jpg / -844 | 1869×842 | 1688×760 |
| COL-F-01, COL-B-01, DEMO-01 | *-1448.jpg / -724 | 1448×1086 | 1600×1200 |
| PRD-01…04 (main) | PRD-0N-A-1254.jpg / -627 | 1254×1254 | 2000×2000 |

### Batch 2 (approved 2026-10-15)

From `Tso_Bath_Body_New_Images_Claude_Code_Handoff_2026-10-15.zip` (zip sha256 `c1acf87bb2fcaeed…`), 1600×1200 JPEGs used byte-for-byte plus an 800 px copy. **The ZIP's gift files were swapped and are mapped by content:** `GIFT-02-Gift-Presentation.jpg` (sha256 `1750b2e7…`, the Fortune 6 + 6 box) → GIFT-01-F; `GIFT-01-F-Fortune-6-Bombs-6-Soaps.jpg` (`c4bb05ee…`, the presentation box) → GIFT-02. DEMO-02 `5494b465…`, DEMO-03 Fortune slip `7258385a…`, GIFT-01-B `375dfcf8…`. The Barracks dispatch (`0e82e304…`) is in `image-review/` only. Printed packaging copy in these renders (®, gendered labels, taglines) is provisional concept art, not approved site copy.

Still outstanding: product angles B–E, SRC-01…03, SOAP-01, STORY-01.

### Changes 2026-10-15 (owner briefs: mobile hero, moodboard hero, Double Happiness Chest)

- **Home hero** no longer uses HERO-D-01 / HERO-P-01 / HERO-L-01. It shows the approved `general-tso-compact-cat.png` (and its WebP derivatives) plus the approved horizontal lockup on desktop, unaltered, on a CSS ground. The three hero photos stay in `assets/photos/` and in `image-review/` as the approval record.
- **GIFT-03 — The Double Happiness Chest** (24 pieces: the Fortune and Barracks 12-piece sets in one outer chest). Target 1600×1200 (4:3), sRGB JPEG q85. **Photograph pending.** Until it exists, the chest feature shows the approved GIFT-02 gift-presentation image (owner correction 2026-10-15), unaltered and uncropped, with a small caption saying it is a concept of the proposed presentation. The separate Gift Presentation promo block was removed; GIFT-02 appears once on the page. Chest dimensions, inserts, weight and price are not final.
