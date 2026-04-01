# Review Request — Step 4: Animated Lofi Scenes

## Summary
Implemented 7 animated CSS/SVG lofi scenes as background layers for each page theme, refactored PageAmbiance to support a two-layer architecture (gradients + scenes), and prepared the system for optional background images.

## Files Created

### Scene Components (`src/components/ui/scenes/`)
- **`SalonScene.tsx`** (93 lines) — Starry window with rain, amber lamp with pulse, couch silhouette, breathing sleeping cat, TV on wall, floating dust
- **`ChambreScene.tsx`** (83 lines) — Moon window with stars, fairy light string with offset-delayed pulses, bedside lamp, bed/blanket/pillow, breathing stuffed animal, wall poster, dust particles
- **`BureauScene.tsx`** (81 lines) — Desk lamp with halo, bookshelf with 3 shelves of colored books, post-its on wall, desk with pencil, laptop/monitor with screen glow, wall clock, coffee mug
- **`CuisineScene.tsx`** (93 lines) — Warm daylight window, coffee cup with 3 rising steam lines, potted plant with leaves, counter with plate, fruit bowl, kitchen shelves with jars, hanging towel, wall clock
- **`StudioScene.tsx`** (101 lines) — 6 floating music notes (fade-up), continuously spinning vinyl record with grooves, 5 LED spots with staggered pulses, speaker cabinet, mixing board with sliders, hanging headphones
- **`ProfilScene.tsx`** (83 lines) — Pulsing golden spotlight, 10 sparkles appearing/disappearing at varied rates, decorative corner ornaments on all 4 corners, expanding radial rings, floating amber particles
- **`AccueilScene.tsx`** (90 lines) — Large window with city skyline (10 buildings + lit windows), twinkling stars, rain drops, street lamp with amber halo, floating dust particles

### Other Created Files
- **`public/backgrounds/README.md`** — Documents image format, naming convention, and usage for future background image replacements

## Files Modified

### `src/components/ui/PageAmbiance.tsx`
- Refactored from single themes object to two-layer architecture:
  - Layer 1: `gradients` (preserved Step 3 gradient overlays) or `backgroundImage` (optional prop)
  - Layer 2: Animated CSS scene component (hidden when backgroundImage is provided)
- Added `backgroundImage?: string` optional prop
- Imported all 7 scene components
- Scene map links each theme key to its scene component

### `src/app/globals.css`
- Added 7 new `@keyframes` animations:
  - `rain` — vertical drop with fade in/out
  - `twinkle` — opacity pulse for stars/lights
  - `steam` — rise + expand + fade for coffee steam
  - `music-float` — float upward with rotation + fade
  - `spin-slow` — continuous 360 rotation for vinyl
  - `breathe` — subtle scaleY for sleeping cat/stuffed animal
  - `sparkle` — scale in/out with opacity for sparkle effects

## NOT Modified
- No page files were touched — all pages already import and use `<PageAmbiance theme="..." />` from Step 3
- The new `backgroundImage` prop is optional and backward-compatible

## Verification
- `tsc --noEmit` — passes clean
- `next build` — passes clean, all routes compile
- All scene files within 80-150 line range
- All animations use `transform` and `opacity` only (GPU accelerated)
- Scene container opacity set between 0.25 and 0.40
- `prefers-reduced-motion` respected via existing global media query in globals.css
