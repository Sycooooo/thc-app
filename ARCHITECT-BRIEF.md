# Architect Brief

## Step 6 — Fix: Opacity/Border issues on AddTaskForm & QuestSetup

### Context
Ces deux composants n'ont pas été couverts par le restyle lofi (Steps 5a-5c). Ils utilisent encore les anciens patterns `border-b` (comme couleur de bordure) et `border-b-hover`. Mêmes corrections mécaniques que les steps précédents. CSS uniquement.

### Build Order

1. **AddTaskForm.tsx**
   - Bouton "Ajouter une tâche" (ligne 68) : `border-b-hover` → `border-[var(--border)]`
   - Tous les inputs/selects (lignes 90, 98, 131, 144, 163, 176) : `border border-b` → `border border-[var(--border)]`
   - Boutons difficulté inactifs (ligne 117) : `border-b text-t-muted hover:border-b-hover` → `border-[var(--border)] text-t-muted hover:border-accent/30`

2. **QuestSetup.tsx**
   - Tous les inputs/selects du form custom (lignes 128, 138, 146, 158, 170, 181) : `border border-b` → `border border-[var(--border)]`
   - Template cards inactives (ligne 262) : `rounded-xl` → `rounded-lg`
   - Template cards inactives (ligne 263) : `border-b` → `border-[var(--border)]`

### Flags
- CSS uniquement, NE PAS changer la logique
- NE PAS changer les couleurs fonctionnelles (difficulty colors, green active state)
- Mêmes patterns que Steps 5a-5c

### Definition of Done
- [ ] AddTaskForm : tous les `border-b` remplacés par `border-[var(--border)]`
- [ ] AddTaskForm : hover borders cohérents
- [ ] QuestSetup : tous les `border-b` remplacés par `border-[var(--border)]`
- [ ] QuestSetup : template cards avec `rounded-lg`
- [ ] Aucune fonctionnalité cassée
