# Review Feedback — Step 6: Fluidification des Animations

Date: 2026-04-02
Reviewer: Senior Code Reviewer
Ready for Builder: YES

## Verdict: PASS WITH NOTES

---

## Must Fix

Aucun.

---

## Should Fix

1. **`src/lib/animations.ts` — dead code presets**
   Les presets `fadeInUp` (l.15), `scaleIn` (l.21) sont exportes mais importes nulle part dans le projet. Idem pour les alias de compatibilite `springConfig` (l.38), `snappySpring` (l.40), `bouncySpring` (l.42).
   **Recommandation :** Supprimer ces exports morts ou, si conserves pour usage futur, ajouter un commentaire `// Reserved for future use`. Le brief demandait de "mettre a jour leurs transitions pour utiliser les 3 configs" — comme ils ne sont pas utilises, c'est mineur, mais le brief n'est pas strictement respecte sur ce point.

2. **`src/lib/animations.ts:53` — `staggerItem` sans transition explicite**
   Le preset `staggerItem` (l.52-55) n'a pas de champ `transition`. Il utilise la transition par defaut de Framer Motion (pas une des 3 configs centralisees). Les composants qui l'utilisent (`StaggerList.tsx`) ont leur propre `itemVariants` avec `smooth`, donc pas d'impact reel — mais le preset dans `animations.ts` reste desaligne.
   **Recommandation :** Ajouter `transition: smooth` dans `staggerItem.animate` pour la coherence, ou supprimer le preset s'il est devenu dead code.

---

## Escalate to Architect

Aucun.

---

## Cleared

Step 6 a-d entierement revue et validee :

- **6a** — Les 3 spring configs (`smooth`, `snappy`, `bouncy`) sont correctement definies dans `animations.ts`. Zero occurrence de `stiffness`/`damping` inline dans les composants (grep confirme : uniquement dans `animations.ts`). Les 15 fichiers du brief + login/register importent et utilisent correctement les configs centralisees.
- **6b** — `PageTransition.tsx` utilise la spring `smooth`, les valeurs `y: 6` et `scale: 0.995` sont conformes au brief. Aucune trace de cubic easing. API inchangee (`{ children }`).
- **6c** — `ColocNav.tsx` implemente correctement : `layoutId="nav-indicator"` avec transition `snappy`, bounce icone active (`scale: 1.15`, `bouncy`), badge unread anime avec `motion.span` + `AnimatePresence` + preset `scaleBounce`. L'accessibilite est preservee (`aria-current="page"`, `aria-label="Non lu"`, `role="status"`). Le CSS `animate-pulse` a bien ete remplace. Props et logique Pusher intactes.
- **6d** — `StaggerList.tsx` utilise transition `smooth`, `y: 10`, `scale: 0.98` conformes au brief.
- **TypeScript** — `npx tsc --noEmit` passe sans erreur.
- **globals.css** — Non modifie (confirme par git diff).
- **package.json** — Non modifie, aucune nouvelle dependance.
- **prefers-reduced-motion** — `MotionConfig reducedMotion="user"` toujours en place dans `Providers.tsx`.
