# Architect Brief

## Step 7 — PWA Setup: Make App Installable on Mobile

### Context
L'app doit être installable sur les téléphones des 3 colocs via "Ajouter à l'écran d'accueil". Hébergement local (Mac sur le WiFi). On ajoute juste le minimum pour que les navigateurs reconnaissent l'app comme installable.

### Build Order

1. **Créer `/public/manifest.json`**
   - `name`: "THC App"
   - `short_name`: "THC"
   - `start_url`: "/"
   - `display`: "standalone"
   - `background_color`: "#0a0a14"
   - `theme_color`: "#0a0a14"
   - `icons`: tableau avec icon-192.png et icon-512.png

2. **Créer les icônes**
   - Utiliser une des images Midjourney existantes dans `/public/ranks/` (la plus iconique, genre piatella ou og-kush)
   - La redimensionner en 192x192 et 512x512
   - Sauver dans `/public/icon-192.png` et `/public/icon-512.png`
   - Utiliser `sips` (outil macOS) pour le resize

3. **Modifier `src/app/layout.tsx`**
   - Ajouter dans `<head>` :
     - `<link rel="manifest" href="/manifest.json" />`
     - `<meta name="theme-color" content="#0a0a14" />`
     - `<meta name="apple-mobile-web-app-capable" content="yes" />`
     - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
     - `<link rel="apple-touch-icon" href="/icon-192.png" />`

### Flags
- NE PAS ajouter de service worker
- NE PAS ajouter de mode offline
- NE PAS changer de logique ou de composants
- Changements minimaux : 1 nouveau fichier JSON, 2 icônes, quelques meta tags

### Definition of Done
- [ ] manifest.json créé avec les bonnes valeurs
- [ ] Icônes 192x192 et 512x512 générées
- [ ] Meta tags ajoutés dans layout.tsx
- [ ] L'app propose "Ajouter à l'écran d'accueil" sur mobile
