# Background Images

Drop custom background images here to replace the default CSS scenes.

## Format
- **Type**: PNG or GIF
- **Resolution**: 1920x1080 recommended
- **Style**: Lofi / aesthetic / cozy vibes

## Naming Convention
| File | Replaces scene |
|------|----------------|
| `salon.png` | SalonScene (gamer living room) |
| `chambre.gif` | ChambreScene (cozy bedroom) |
| `bureau.png` | BureauScene (study desk) |
| `cuisine.png` | CuisineScene (kitchen) |
| `studio.png` | StudioScene (music studio) |
| `profil.png` | ProfilScene (profile page) |
| `accueil.png` | AccueilScene (landing/login) |

## Usage
Pass the image path to `PageAmbiance` via the `backgroundImage` prop:

```tsx
<PageAmbiance theme="salon" backgroundImage="/backgrounds/salon.png" />
```

When `backgroundImage` is provided, the CSS scene is hidden and the image is displayed instead.
