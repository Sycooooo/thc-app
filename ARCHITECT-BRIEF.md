# Architect Brief

## Step 4 — Animated Lofi Scenes (CSS/SVG) + Image-Ready Backgrounds

### Context
Les ambiances dégradées du Step 3 sont trop subtiles. L'utilisateur veut de vraies scènes visuelles, comme un GIF lofi. On crée des scènes animées en SVG/CSS pur avec des éléments reconnaissables (fenêtre, pluie, lampe, chat, étagères, etc.), tout en préparant le système pour que des images de fond puissent remplacer les scènes CSS plus tard.

### Architecture

Refondre `PageAmbiance.tsx` pour supporter deux layers :
1. **`backgroundImage`** (optionnel) — une image/GIF de fond. Si fournie, elle remplace la scène CSS.
2. **`scene`** — la scène CSS/SVG animée (affichée uniquement si pas de backgroundImage).

Les dégradés du Step 3 restent en fond derrière la scène comme ambiance de base.

### Build Order

1. **Créer `src/components/ui/scenes/` — un dossier de scènes**

   Chaque scène est un composant React qui rend du SVG/CSS animé.

   **`SalonScene.tsx` — Le salon gamer**
   - Fenêtre en haut à droite : rectangle arrondi avec un ciel étoilé (petits points blancs qui clignotent)
   - Pluie animée devant la fenêtre (lignes fines qui tombent, boucle infinie)
   - Lampe à gauche : cercle ambre avec halo pulsant (`animate-warm-pulse`)
   - Silhouette d'un canapé en bas (formes simples CSS)
   - Chat endormi en bas à droite : petit blob arrondi avec deux triangles (oreilles) qui "respire" (scale léger en boucle)

   **`ChambreScene.tsx` — La chambre cozy**
   - Fenêtre plus petite en haut : vue nuit avec lune (cercle blanc)
   - Guirlande lumineuse en haut : ligne horizontale avec petits cercles colorés qui pulsent avec des délais décalés
   - Lampe de chevet : petit cercle chaud en bas à gauche
   - Couverture/lit suggéré : forme douce en bas

   **`BureauScene.tsx` — Le bureau d'étude**
   - Lampe de bureau à gauche : forme angulaire + halo
   - Étagère à droite : rectangles empilés (livres) de couleurs différentes (violets, ambres, roses)
   - Post-its sur le mur : petits carrés colorés inclinés
   - Crayon/stylo sur le bureau : ligne fine inclinée

   **`CuisineScene.tsx` — La cuisine**
   - Tasse de café/thé : forme simple avec de la vapeur animée (3 lignes ondulantes qui montent)
   - Fenêtre avec lumière du jour chaude (dégradé ambre)
   - Plante en pot : tige + feuilles simples

   **`StudioScene.tsx` — Le studio musique**
   - Notes de musique qui flottent et montent lentement (♪ ♫) à des positions et vitesses variées
   - Vinyle qui tourne : cercle avec lignes concentriques, rotation continue lente
   - LEDs/points colorés qui pulsent en haut (simule des spots)
   - Forme d'enceinte/speaker en bas à droite

   **`ProfilScene.tsx` — Le profil**
   - Étoiles/sparkles qui apparaissent et disparaissent aléatoirement autour du centre
   - Cadre décoratif pixelisé autour des bords (coins ornementaux)
   - Spotlight central : grand halo doré qui pulse doucement

   **`AccueilScene.tsx` — Landing / Login**
   - Grande fenêtre centrale en haut : vue nuit avec skyline ville (silhouettes de bâtiments simples)
   - Étoiles qui clignotent dans le ciel
   - Pluie fine animée
   - Lampadaire en bas à droite avec halo ambre
   - Particules de poussière flottantes

   **Règles pour toutes les scènes :**
   - Utiliser des couleurs de la palette CSS variables (`var(--accent)`, etc.) OU des couleurs hardcodées avec opacité faible
   - Toutes les animations via CSS `@keyframes` dans le composant (via Tailwind arbitrary ou classes globales)
   - Tout est positionné en `absolute` dans le container parent
   - Opacité globale de la scène : `opacity-30` à `opacity-40` — visible mais ne gêne pas la lecture
   - Tous les éléments animés doivent respecter `prefers-reduced-motion`
   - Les scènes doivent faire entre 80 et 150 lignes max chacune

2. **Ajouter les keyframes nécessaires dans `globals.css`**
   
   Nouvelles animations à ajouter :
   ```css
   @keyframes rain { 
     0% { transform: translateY(-10px); opacity: 0; }
     10% { opacity: 1; }
     100% { transform: translateY(100vh); opacity: 0; }
   }
   
   @keyframes twinkle {
     0%, 100% { opacity: 0.2; }
     50% { opacity: 1; }
   }
   
   @keyframes steam {
     0% { transform: translateY(0) scaleX(1); opacity: 0.6; }
     100% { transform: translateY(-20px) scaleX(1.5); opacity: 0; }
   }
   
   @keyframes music-float {
     0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
     100% { transform: translateY(-80px) rotate(15deg); opacity: 0; }
   }
   
   @keyframes spin-slow {
     from { transform: rotate(0deg); }
     to { transform: rotate(360deg); }
   }
   
   @keyframes breathe {
     0%, 100% { transform: scaleY(1); }
     50% { transform: scaleY(1.05); }
   }
   
   @keyframes sparkle {
     0%, 100% { opacity: 0; transform: scale(0); }
     50% { opacity: 1; transform: scale(1); }
   }
   ```

3. **Mettre à jour `PageAmbiance.tsx`**
   
   Refactorer pour :
   - Garder les dégradés du Step 3 comme layer de fond
   - Ajouter la scène par-dessus les dégradés
   - Supporter un prop optionnel `backgroundImage?: string` — si fourni, afficher l'image en `object-cover` à la place de la scène CSS
   
   Structure :
   ```tsx
   <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
     {/* Layer 1: Background image OR CSS gradients */}
     {backgroundImage ? (
       <img src={backgroundImage} className="w-full h-full object-cover opacity-25" />
     ) : (
       <>{/* gradients from Step 3 */}</>
     )}
     
     {/* Layer 2: Animated scene (always shown, on top of bg) */}
     {!backgroundImage && <SceneComponent />}
   </div>
   ```

4. **Créer un dossier `public/backgrounds/`**
   
   Créer le dossier et un fichier `README.md` dedans qui explique :
   - Format attendu : PNG ou GIF, 1920x1080 recommandé
   - Nommage : `salon.png`, `chambre.gif`, `bureau.png`, etc.
   - Ces images remplaceront automatiquement les scènes CSS quand fournies

### Flags
- Flag: Les scènes CSS sont un PLACEHOLDER de qualité — pas du code jetable, mais accepter qu'elles seront remplacées par des images
- Flag: Opacité des scènes entre 0.25 et 0.40 — assez visible pour créer un univers, pas assez pour gêner la lecture
- Flag: NE PAS utiliser de bibliothèque d'animation externe — CSS pur + Tailwind arbitrary values
- Flag: Chaque scène doit être un fichier séparé dans `scenes/` pour pouvoir les modifier indépendamment
- Flag: NE PAS modifier la logique des pages — seulement mettre à jour l'import dans PageAmbiance
- Flag: Les animations doivent être performantes (utiliser transform et opacity, pas width/height/top/left)

### Definition of Done
- [ ] 7 scènes visuelles avec des éléments reconnaissables et animés
- [ ] Chaque page affiche sa scène en arrière-plan
- [ ] Les scènes sont visibles (opacité 0.25-0.40) mais n'empêchent pas la lecture
- [ ] Les animations tournent en boucle sans saccade
- [ ] Le système est prêt à recevoir des images de fond (prop backgroundImage)
- [ ] Le dossier public/backgrounds/ existe avec son README
- [ ] Aucune fonctionnalité cassée

---

## Builder Plan
*Builder adds their plan here before building. Architect reviews and approves.*

[Builder writes plan here]

Architect approval: [ ] Approved / [ ] Redirect — see notes below
