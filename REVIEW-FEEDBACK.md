# Review Feedback — Système de Malus + Mode Vacances

## Verdict: APPROVED

## Checklist

- [x] Schema Prisma : champs UserColoc, AvatarConfig.savedOutfit, PenaltyLog, AwayVote
- [x] Migration appliquée (`prisma db push`)
- [x] Away request/vote/return : auth, membership check, vote unanimité, notifications
- [x] Penalties check : 7 règles (3a, 3c, 3d, 3e, 3f, 3h, 3i), guards anti-doublon
- [x] Task complete : penalty multiplier, away boost, lazy badge reset, avatar restore
- [x] Habit toggle : penalty multiplier, away boost
- [x] Quest generator : filtre `isAway: false`
- [x] Dashboard : section colocs (badges away/fainéant), pénalités récentes
- [x] Profil : badges actifs, tâches non faites, historique 30j
- [x] TaskList : section expirées en rouge avec "-70 XP"
- [x] Admin : AwayManager intégré
- [x] `npm run build` : OK, 0 erreur TypeScript

## Corrections effectuées pendant review

1. **Double-comptage 3h** : `expiredThisWeek` comptait déjà les tâches qu'on venait de marquer expired en 3a. Retiré l'addition de `expiredTasks.length`.
2. **Caractère corrompu** : `Mettre ?? jour` → `Mettre à jour` dans habit toggle.
3. **Prisma.DbNull** : `savedOutfit: null` → `Prisma.DbNull` pour les champs JSON nullable.
4. **PixelAvatar size** : `"xs"` n'existe pas → changé en `"sm"`.

## Notes

- La route `penalties/check` est conçue pour être appelée manuellement (au login ou via cron). Pas de cron automatique configuré — le frontend devra appeler cette route.
- Le mode away est accessible depuis la page admin. Un membre non-admin peut demander le away via cette page (le composant vérifie le userId, pas le rôle).
- Les XP/rankPoints ne descendent jamais en dessous de 0 grâce aux `Math.min()`.
