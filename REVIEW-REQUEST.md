# Review Request — Step 6: Page Transition Animations

## Summary
Added a fade-in + slide-up entrance animation to 11 pages using a `PageTransition` wrapper component powered by Framer Motion. The component already existed at `src/components/PageTransition.tsx` and was already imported by 7 pages — it just had slightly off animation values. Updated the easing curve and slide distance to match spec, then added the wrapper to the 4 remaining pages.

## Component Updated

### `src/components/PageTransition.tsx`
- `y: 20` -> `y: 8` (subtler slide)
- `ease: 'easeOut'` -> `ease: [0.22, 1, 0.36, 1]` (custom cubic bezier, softer deceleration)
- Duration unchanged at 0.4s
- `'use client'` directive present (required for Framer Motion)

## Pages Modified (4 newly wrapped)

### `src/app/page.tsx` (root/home)
- Added `import PageTransition from '@/components/PageTransition'`
- Wrapped content div (after `<PageAmbiance>`, before `</main>`)

### `src/app/profile/page.tsx`
- Added `import PageTransition from '@/components/PageTransition'`
- Wrapped all content inside `<main>` (after header, before `</main>`)

### `src/app/coloc/new/page.tsx`
- Added `import PageTransition from '@/components/PageTransition'`
- Wrapped card content (after `<PageAmbiance>`, before `</main>`)

### `src/app/coloc/join/page.tsx`
- Added `import PageTransition from '@/components/PageTransition'`
- Wrapped card content (after `<PageAmbiance>`, before `</main>`)

## Pages Already Wrapped (7 — no structural changes, animation values updated via component)
- `src/app/coloc/[id]/page.tsx`
- `src/app/coloc/[id]/board/page.tsx`
- `src/app/coloc/[id]/calendar/page.tsx`
- `src/app/coloc/[id]/expenses/page.tsx`
- `src/app/coloc/[id]/menu/page.tsx`
- `src/app/coloc/[id]/music/page.tsx`
- `src/app/coloc/[id]/admin/page.tsx`

## NOT Modified (per brief flags)
- `src/app/coloc/[id]/chat/page.tsx` — has its own scroll/height management
- `src/app/login/page.tsx` — already animated with Framer Motion
- No headers wrapped — only main content
- No `<PageAmbiance>` components wrapped — they are fixed/positioned independently
- No `AnimatePresence` used — only entrance animations (exit not supported well by App Router)
- No logic, state, or data fetching changed in any file

## Total: 11 pages with entrance animation (all except chat and login)

## Verification Checklist
- [ ] `PageTransition` component exists with correct animation values (opacity 0->1, y 8->0, 0.4s, custom ease)
- [ ] 11 pages import and use `<PageTransition>`
- [ ] Chat page has no PageTransition
- [ ] Login page has no PageTransition
- [ ] Headers are outside the PageTransition wrapper in all pages
- [ ] PageAmbiance is outside the PageTransition wrapper in all pages
- [ ] No functionality regressions
