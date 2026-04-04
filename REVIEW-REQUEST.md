# Review Request — Système de Malus + Mode Vacances

## Summary
Ajout d'un système de pénalités (tâches expirées, inactivité, streak à 0, badge fainéant, rétrogradation de rang) et d'un mode vacances avec vote des colocs.

## Fichiers modifiés

### Schema
- `prisma/schema.prisma` — 7 champs UserColoc, 1 champ AvatarConfig, 2 modèles (PenaltyLog, AwayVote)

### Nouvelles routes API
- `src/app/api/coloc/[id]/away/request/route.ts`
- `src/app/api/coloc/[id]/away/vote/route.ts`
- `src/app/api/coloc/[id]/away/return/route.ts`
- `src/app/api/coloc/[id]/penalties/check/route.ts`

### Routes modifiées
- `src/app/api/tasks/[id]/complete/route.ts` — Multipliers + lazy + avatar restore
- `src/app/api/coloc/[id]/habits/[habitId]/toggle/route.ts` — Multipliers

### Composants
- `src/components/AwayManager.tsx` — NOUVEAU
- `src/components/DashboardHub.tsx` — Badges + pénalités
- `src/components/TaskList.tsx` — Section expirées
- `src/app/coloc/[id]/page.tsx` — Props away/lazy/penalties
- `src/app/profile/page.tsx` — Badges + historique
- `src/app/coloc/[id]/admin/page.tsx` — AwayManager
- `src/lib/quest-generator.ts` — Exclure away
