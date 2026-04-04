# ARCHITECT BRIEF — Briefing Stratégique Quotidien

**Date:** 2026-04-04
**Status:** READY FOR BUILDER

---

## Contexte

Le propriétaire du projet reçoit chaque matin à 8h07 un **briefing géopolitique** généré par Claude. C'est un HTML complet avec sections (France, Monde, Histoire, Signaux), articles dépliables, scores, gagnants/perdants, sources. L'objectif est d'intégrer ce briefing dans l'app THC pour que **tous les colocs** puissent le consulter, avec un **historique** des jours précédents.

Les briefings existants sont dans `/Users/solal/Desktop/Fah/Daily/` (7 fichiers HTML).

---

## Phase 1 — Database (Schema Prisma)

### Nouveau modèle `Briefing`

```prisma
model Briefing {
  id        String   @id @default(cuid())
  date      DateTime @unique          // date du briefing (jour, sans heure)
  score     Float                     // score SIA x/10
  rawHtml   String                    // HTML original complet
  sections  Json                      // contenu parsé structuré (voir format ci-dessous)
  sources   Json?                     // [{title, url}]
  evalText  String?                   // texte auto-évaluation
  createdAt DateTime @default(now())
}
```

**Format `sections` JSON :**

```json
[
  {
    "type": "fr",
    "title": "Politique Française & Stratégie",
    "icon": "🇫🇷",
    "articles": [
      {
        "title": "Macron en Corée du Sud...",
        "prose": "Le président...",
        "histBox": "Cette tournée...",
        "winners": "RDC, Zimbabwe...",
        "losers": "Importateurs occidentaux...",
        "impact": "Marchés : ..."
      }
    ]
  }
]
```

---

## Phase 2 — API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/briefings` | POST | Créer un briefing. Body: `{ html: string }`. Parse le HTML, extrait score + sections + sources. |
| `/api/briefings` | GET | Liste tous les briefings (date, score, résumé sections). Trié par date DESC. |
| `/api/briefings/[date]` | GET | Briefing complet par date (format `YYYY-MM-DD`). |

### Parsing HTML → JSON structuré

Le POST reçoit le HTML brut et extrait automatiquement :

1. **Score** : regex sur `SCORE SIA : X.X/10`
2. **Date** : regex sur le `<title>` ou `<h1>` (format "4 avril 2026")
3. **Sections** : itérer les `.section` divs, identifier le type via la classe CSS (`section-fr`, `section-world`, `section-hist`, `section-radar`)
4. **Articles** : dans chaque section, itérer les `<details>` éléments :
   - `title` → contenu du `<summary>`
   - `prose` → contenu du/des `.prose`
   - `histBox` → contenu du `.hist-box` (optionnel)
   - `winners` → contenu du `.wl-winner` (optionnel)
   - `losers` → contenu du `.wl-loser` (optionnel)
   - `impact` → contenu du `.impact-box`
5. **Sources** : itérer les `<a>` dans `.sources-section`
6. **Eval** : texte du `.section-eval`

Utiliser un parser HTML côté serveur : **`cheerio`** (léger, pas de DOM browser).

---

## Phase 3 — Script d'import des briefings existants

Script `scripts/import-briefings.ts` qui :

1. Lit tous les fichiers `briefing-*.html` dans le dossier source
2. Pour chaque fichier, POST vers `/api/briefings` (ou insert direct en DB)
3. Affiche un log de confirmation

---

## Phase 4 — Pages UI

### 4a. Page archive `/coloc/[id]/briefing/page.tsx`

- Header : titre "Briefing Stratégique" avec icône 📡
- Liste des briefings par date (carte par jour) :
  - Date formatée (ex: "Vendredi 4 avril 2026")
  - Score SIA (badge coloré)
  - Aperçu des sections (icônes + premier titre d'article par section)
- Lien vers chaque briefing individuel
- Style lofi cohérent avec le reste de l'app

### 4b. Page briefing individuel `/coloc/[id]/briefing/[date]/page.tsx`

- Header avec date + score + boutons nav (← jour précédent / jour suivant →)
- Rendu **natif React** (pas d'iframe, pas de dangerouslySetInnerHTML) en utilisant les données JSON parsées
- 4 sections avec leur couleur :
  - 🇫🇷 France → `text-blue-400` / `bg-blue-500/10`
  - 🌍 Monde → `text-emerald-400` / `bg-emerald-500/10`
  - 📜 Histoire → `text-amber-400` / `bg-amber-500/10`
  - 📡 Signaux → `text-purple-400` / `bg-purple-500/10`
- Articles dépliables (`<details>` natif ou état React)
- Blocs "Gagnants/Perdants" avec le style lofi (cartes vertes/rouges)
- Bloc "So What" (impact) avec bordure accent
- Section sources en bas
- Auto-évaluation collapsible

---

## Phase 5 — Intégration Dashboard

### DashboardHub.tsx

Ajouter une **carte résumé "Briefing du jour"** en haut du dashboard (avant la carte profil). Elle affiche :

- Icône 📡 + "Briefing du jour" + score SIA
- Liste des enjeux clés : le premier titre de chaque section (🇫🇷 🌍 📜 📡) tronqué
- Clic sur la carte → redirige vers `/coloc/[id]/briefing` (page complète du jour le plus récent)

### coloc/[id]/page.tsx

Ajouter un fetch du dernier briefing dans le Promise.all.

---

## Ordre d'exécution (Build Order)

1. **Phase 1** — `npm install cheerio` + Schema Prisma + migration
2. **Phase 2** — API routes (POST avec parsing, GET liste, GET par date)
3. **Phase 3** — Script d'import des 7 briefings existants
4. **Phase 4** — Pages UI (archive + briefing individuel)
5. **Phase 5** — Carte briefing sur le dashboard

---

## Fichiers impactés

| Fichier | Action |
|---|---|
| `prisma/schema.prisma` | NOUVEAU modèle `Briefing` |
| `src/app/api/briefings/route.ts` | NOUVEAU — POST (create) + GET (list) |
| `src/app/api/briefings/[date]/route.ts` | NOUVEAU — GET par date |
| `src/lib/parse-briefing.ts` | NOUVEAU — parsing HTML → JSON (cheerio) |
| `scripts/import-briefings.ts` | NOUVEAU — import des 7 fichiers existants |
| `src/app/coloc/[id]/briefing/page.tsx` | NOUVEAU — page archive |
| `src/app/coloc/[id]/briefing/[date]/page.tsx` | NOUVEAU — page briefing individuel |
| `src/components/BriefingCard.tsx` | NOUVEAU — rendu d'un briefing complet |
| `src/components/DashboardHub.tsx` | MODIFIER — ajouter carte briefing |
| `src/app/coloc/[id]/page.tsx` | MODIFIER — fetch dernier briefing |

---

## Definition of Done

1. Les 7 briefings existants sont importés en base
2. La page archive liste tous les briefings avec date + score
3. Clic sur un briefing → page détail avec sections, articles dépliables, gagnants/perdants
4. Navigation jour précédent / jour suivant
5. Dashboard affiche la carte briefing avec le score du jour
6. `POST /api/briefings` avec du HTML brut crée un briefing parsé en JSON
7. Style cohérent avec le thème lofi de l'app
8. `npm run build` passe sans erreur
