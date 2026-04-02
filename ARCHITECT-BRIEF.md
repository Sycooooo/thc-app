# Architect Brief — Step 6: Fluidification des Animations

---

## Objectif

Harmoniser et améliorer toutes les animations de l'app. Pas de changement fonctionnel — uniquement du polish visuel.

---

## 6a — Harmoniser les springs dans `src/lib/animations.ts`

Actuellement ~15 combinaisons stiffness/damping différentes hardcodées dans 15+ fichiers. Centraliser en 3 configs nommées :

```ts
// Smooth — transitions de page, entrées de contenu, modales
export const smooth = { type: 'spring', stiffness: 300, damping: 28 }

// Snappy — boutons, toggles, tabs, interactions rapides  
export const snappy = { type: 'spring', stiffness: 500, damping: 30 }

// Bouncy — badges, notifications, éléments ludiques (rank up, shop)
export const bouncy = { type: 'spring', stiffness: 400, damping: 12 }
```

- Garder les presets existants (fadeInUp, scaleIn, etc.) mais mettre à jour leurs transitions pour utiliser ces 3 configs
- NE PAS supprimer les presets existants, juste aligner leurs valeurs

**Fichiers à modifier :** `src/lib/animations.ts` uniquement pour les définitions.

Puis remplacer TOUS les `{ type: 'spring', stiffness: X, damping: Y }` inline dans ces fichiers par l'import de la config appropriée :

| Fichier | Config à utiliser |
|---|---|
| `src/components/TaskList.tsx` | snappy (badges), smooth (listes) |
| `src/components/ThemeToggle.tsx` | bouncy |
| `src/components/NotificationBell.tsx` | snappy (dropdown), bouncy (badge) |
| `src/components/Board.tsx` | smooth |
| `src/components/Expenses.tsx` | smooth |
| `src/components/ui/Button.tsx` | snappy |
| `src/components/RankUpModal.tsx` | bouncy |
| `src/components/Chat.tsx` | snappy |
| `src/components/RankCard.tsx` | smooth |
| `src/components/AddTaskForm.tsx` | smooth |
| `src/components/Shop.tsx` | snappy |
| `src/components/BoardNote.tsx` | smooth |
| `src/components/Calendar.tsx` | smooth (modal), snappy (items) |
| `src/app/register/page.tsx` | smooth (page), bouncy (éléments) |
| `src/app/login/page.tsx` | smooth (page), bouncy (éléments) |

**Règle :** ne jamais écrire `stiffness` ou `damping` en dehors de `animations.ts`.

---

## 6b — Améliorer PageTransition

Fichier : `src/components/PageTransition.tsx`

Actuellement : `duration: 0.4, ease: [0.22, 1, 0.36, 1]` — trop linéaire, pas de personnalité.

Remplacer par :
- Transition spring `smooth` (importée de animations.ts)
- Réduire le y initial de 8 à 6 (plus subtil)
- Ajouter un léger scale : `initial: { opacity: 0, y: 6, scale: 0.995 }` → `animate: { opacity: 1, y: 0, scale: 1 }`

Le composant est déjà utilisé sur 11 pages — ne pas changer l'API (props restent `{ children }`).

---

## 6c — Animer ColocNav

Fichier : `src/components/ColocNav.tsx`

Ajouter Framer Motion pour :

1. **Indicateur actif glissant** — un `motion.div` avec `layoutId="nav-indicator"` positionné derrière l'icône active (background subtil violet). Quand on change de page, l'indicateur glisse vers la nouvelle icône avec transition `snappy`.

2. **Bounce de l'icône active** — wrapper `motion.span` autour de l'icône avec `animate={{ scale: 1.15 }}` quand active, `scale: 1` sinon. Transition `bouncy`.

3. **Badge unread** — remplacer `animate-pulse` CSS par `motion.span` avec `scaleBounce` preset (déjà dans animations.ts).

**Contraintes :**
- Garder `'use client'`
- Le composant reçoit `colocId` et `currentUserId` — ne pas changer les props
- Le Pusher logic ne change pas du tout
- Garder l'accessibilité (`aria-current`, `aria-label`, `role="status"`)

---

## 6d — Améliorer StaggerList

Fichier : `src/components/motion/StaggerList.tsx`

- Utiliser transition `smooth` au lieu de la valeur implicite par défaut
- Réduire le y de 15 à 10 (plus subtil)
- Ajouter un léger scale sur les items : `hidden: { opacity: 0, y: 10, scale: 0.98 }` → `show: { opacity: 1, y: 0, scale: 1 }`

---

## Ordre de build

1. `animations.ts` (6a - définitions) — tout le reste en dépend
2. `PageTransition.tsx` (6b) + `StaggerList.tsx` (6d) — en parallèle
3. `ColocNav.tsx` (6c) — peut se faire en parallèle avec 2
4. Remplacement des inline springs dans tous les composants (6a - suite)

---

## Flags

- NE PAS toucher aux animations CSS (keyframes dans globals.css) — elles sont pour les scènes décoratives, pas les interactions
- NE PAS ajouter d'exit animations sur les pages (contrainte Next.js App Router)
- Vérifier que `prefers-reduced-motion` est toujours respecté (MotionConfig dans Providers.tsx le gère)
- Ne pas installer de nouvelle dépendance

---

## Definition of Done

- [ ] 3 spring configs centralisées dans animations.ts (smooth, snappy, bouncy)
- [ ] Zéro `stiffness`/`damping` inline dans les composants
- [ ] PageTransition spring-based avec micro-scale
- [ ] ColocNav avec indicateur glissant + bounce icône + badge animé
- [ ] StaggerList plus subtil avec scale
- [ ] Aucune fonctionnalité cassée
- [ ] prefers-reduced-motion toujours respecté
