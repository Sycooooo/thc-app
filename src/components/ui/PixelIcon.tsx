'use client'

type IconName = 'tasks' | 'chat' | 'board' | 'calendar' | 'music' | 'menu' | 'expenses' | 'profile' | 'habits' | 'home' | 'admin' | 'settings'

const ICONS: Record<IconName, string[]> = {
  // Checklist — grille 16x16
  tasks: [
    'M2,2 h12 v12 h-12z',          // cadre
    'M4,5 h2 v2 h-2z',             // checkbox 1
    'M8,5.5 h5',                    // ligne 1
    'M4,9 h2 v2 h-2z',             // checkbox 2
    'M8,9.5 h5',                    // ligne 2
  ],
  // Bulle de dialogue
  chat: [
    'M2,2 h12 v8 h-6 l-3,3 v-3 h-3z',
    'M5,5 h2 v2 h-2z',             // dot 1
    'M8,5 h2 v2 h-2z',             // dot 2
    'M11,5 h1 v2 h-1z',            // dot 3
  ],
  // Punaise
  board: [
    'M6,1 h4 v3 h-4z',             // tête
    'M5,4 h6 v2 h-6z',             // base
    'M7,6 h2 v6 h-2z',             // pointe
  ],
  // Calendrier
  calendar: [
    'M2,3 h12 v11 h-12z',          // cadre
    'M2,3 h12 v3 h-12z',           // header
    'M5,1 h1 v3 h-1z',             // attache 1
    'M10,1 h1 v3 h-1z',            // attache 2
    'M4,8 h2 v2 h-2z',             // jour 1
    'M7,8 h2 v2 h-2z',             // jour 2
    'M10,8 h2 v2 h-2z',            // jour 3
    'M4,11 h2 v2 h-2z',            // jour 4
  ],
  // Note de musique
  music: [
    'M4,3 h2 v8 h-2z',             // tige 1
    'M10,1 h2 v8 h-2z',            // tige 2
    'M6,3 h4 v2 h-4z',             // barre
    'M2,11 h4 v2 h-4z',            // note 1
    'M8,9 h4 v2 h-4z',             // note 2
  ],
  // Fourchette + couteau
  menu: [
    'M3,2 h2 v5 h-2z',             // fourchette tête
    'M3.5,7 h1 v5 h-1z',           // fourchette manche
    'M4,2 v2 M3,2 v2',             // dents
    'M10,2 h2 v3 l-1,1 h-1 v6 h-1z', // couteau
  ],
  // Pièce / coin
  expenses: [
    'M4,2 h8 v1 h-8z',             // haut
    'M3,3 h1 v10 h-1z',            // gauche
    'M12,3 h1 v10 h-1z',           // droite
    'M4,13 h8 v1 h-8z',            // bas
    'M7,5 h2 v1 h-2z',             // $ haut
    'M6,6 h2 v1 h-2z',             // $ milieu-haut
    'M7,7 h2 v1 h-2z',             // $ centre
    'M8,8 h2 v1 h-2z',             // $ milieu-bas
    'M7,9 h2 v1 h-2z',             // $ bas
  ],
  // Personnage
  profile: [
    'M6,2 h4 v4 h-4z',             // tête
    'M4,7 h8 v2 h-8z',             // épaules
    'M5,9 h6 v4 h-6z',             // corps
    'M5,13 h2 v1 h-2z',            // pied G
    'M9,13 h2 v1 h-2z',            // pied D
  ],
  // Flamme
  habits: [
    'M7,1 h2 v2 h-2z',             // pointe
    'M6,3 h4 v2 h-4z',             // haut
    'M5,5 h6 v2 h-6z',             // milieu
    'M4,7 h8 v3 h-8z',             // bas large
    'M5,10 h6 v2 h-6z',            // base
    'M6,12 h4 v1 h-4z',            // fond
  ],
  // Maison
  home: [
    'M8,1 l6,5 h-2 v7 h-4 v-4 h-4 v4 h-4 v-7 h-2z', // toit + murs
    'M6,9 h4 v4 h-4z',             // porte
  ],
  // Engrenage
  admin: [
    'M6,1 h4 v2 h-4z',             // dent haut
    'M6,13 h4 v2 h-4z',            // dent bas
    'M1,6 h2 v4 h-2z',             // dent gauche
    'M13,6 h2 v4 h-2z',            // dent droite
    'M5,3 h6 v10 h-6z',            // cercle ext
    'M6,5 h4 v6 h-4z',             // cercle int (vide)
  ],
  // Paramètres
  settings: [
    'M2,4 h5 v2 h-5z',             // slider 1
    'M9,4 h5 v2 h-5z',
    'M2,8 h3 v2 h-3z',             // slider 2
    'M7,8 h7 v2 h-7z',
    'M2,12 h8 v2 h-8z',            // slider 3
    'M12,12 h2 v2 h-2z',
  ],
}

export default function PixelIcon({
  name,
  size = 20,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const paths = ICONS[name]
  if (!paths) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`pixel-art ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={d.includes('v') && !d.includes('h') ? 'currentColor' : undefined}
          stroke="none"
        />
      ))}
    </svg>
  )
}

export type { IconName }
