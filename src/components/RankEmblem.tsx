'use client'

// Emblèmes SVG pour chaque rang. Chaque tier a un visuel unique.

function GlowFilter({ id, color }: { id: string; color: string }) {
  return (
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feFlood floodColor={color} floodOpacity="0.6" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

// Tier 0 — Toz : feuille séchée/cassée, grise et triste
function TozEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <GlowFilter id="glow-toz" color="#6b7280" />
      {/* Feuille cassée */}
      <g filter="url(#glow-toz)" opacity="0.7">
        <path d="M40 12 C30 20, 18 28, 20 42 C22 54, 30 60, 40 68 C50 60, 58 54, 60 42 C62 28, 50 20, 40 12Z" fill="#4b5563" stroke="#6b7280" strokeWidth="1.5" />
        <line x1="40" y1="18" x2="40" y2="62" stroke="#6b7280" strokeWidth="1.5" />
        {/* Craquelures */}
        <line x1="40" y1="30" x2="28" y2="38" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="40" y1="40" x2="54" y2="48" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="32" y1="44" x2="26" y2="52" stroke="#9ca3af" strokeWidth="0.8" />
      </g>
    </svg>
  )
}

// Tier 1 — Shit : bloc pressé marron
function ShitEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <GlowFilter id="glow-shit" color="#92603a" />
      <g filter="url(#glow-shit)">
        {/* Bloc rectangulaire pressé */}
        <rect x="18" y="24" width="44" height="32" rx="4" fill="#7a4f2e" stroke="#92603a" strokeWidth="1.5" />
        <rect x="22" y="28" width="36" height="24" rx="2" fill="#8b5e3c" />
        {/* Texture lignes de presse */}
        <line x1="22" y1="34" x2="58" y2="34" stroke="#6b4423" strokeWidth="0.8" />
        <line x1="22" y1="40" x2="58" y2="40" stroke="#6b4423" strokeWidth="0.8" />
        <line x1="22" y1="46" x2="58" y2="46" stroke="#6b4423" strokeWidth="0.8" />
        {/* Stamp */}
        <circle cx="40" cy="40" r="8" stroke="#a0764e" strokeWidth="1" fill="none" />
        <text x="40" y="43" textAnchor="middle" fontSize="8" fill="#a0764e" fontWeight="bold">S</text>
      </g>
    </svg>
  )
}

// Tier 2 — Beurre : barre dorée lisse
function BeurreEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="beurre-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0d060" />
          <stop offset="50%" stopColor="#d4a843" />
          <stop offset="100%" stopColor="#b8922e" />
        </linearGradient>
        <filter id="glow-beurre" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#d4a843" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-beurre)">
        {/* Barre de beurre */}
        <rect x="14" y="28" width="52" height="24" rx="3" fill="url(#beurre-grad)" stroke="#c9982a" strokeWidth="1.5" />
        {/* Reflet lumineux */}
        <rect x="16" y="30" width="48" height="6" rx="2" fill="#f5e08a" opacity="0.4" />
        {/* Emballage coins */}
        <path d="M14 28 L20 22 L66 22 L66 28" fill="#c9982a" opacity="0.5" />
        <path d="M66 28 L66 22 L72 28" fill="#b8862a" opacity="0.4" />
      </g>
    </svg>
  )
}

// Tier 3 — Skunk : feuille cannabis verte vibrante
function SkunkEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="skunk-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <filter id="glow-skunk" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#22c55e" floodOpacity="0.5" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-skunk)">
        {/* 7 folioles */}
        <ellipse cx="40" cy="30" rx="5" ry="16" fill="url(#skunk-grad)" transform="rotate(0, 40, 40)" />
        <ellipse cx="40" cy="30" rx="5" ry="15" fill="url(#skunk-grad)" transform="rotate(30, 40, 40)" />
        <ellipse cx="40" cy="30" rx="5" ry="15" fill="url(#skunk-grad)" transform="rotate(-30, 40, 40)" />
        <ellipse cx="40" cy="30" rx="4.5" ry="13" fill="url(#skunk-grad)" transform="rotate(55, 40, 40)" />
        <ellipse cx="40" cy="30" rx="4.5" ry="13" fill="url(#skunk-grad)" transform="rotate(-55, 40, 40)" />
        <ellipse cx="40" cy="30" rx="4" ry="10" fill="url(#skunk-grad)" transform="rotate(78, 40, 40)" />
        <ellipse cx="40" cy="30" rx="4" ry="10" fill="url(#skunk-grad)" transform="rotate(-78, 40, 40)" />
        {/* Tige */}
        <line x1="40" y1="42" x2="40" y2="68" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nervures centrales */}
        <line x1="40" y1="16" x2="40" y2="40" stroke="#15803d" strokeWidth="0.8" opacity="0.6" />
      </g>
    </svg>
  )
}

// Tier 4 — Purple Haze : nuage violet psychédélique
function PurpleHazeEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="haze-grad" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
        <filter id="glow-haze" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feFlood floodColor="#a855f7" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-haze)">
        {/* Nuage principal */}
        <circle cx="40" cy="38" r="14" fill="url(#haze-grad)" />
        <circle cx="28" cy="42" r="10" fill="#9333ea" opacity="0.8" />
        <circle cx="52" cy="42" r="10" fill="#9333ea" opacity="0.8" />
        <circle cx="34" cy="32" r="9" fill="#a855f7" opacity="0.7" />
        <circle cx="48" cy="34" r="8" fill="#a855f7" opacity="0.7" />
        {/* Étoiles dans le haze */}
        <circle cx="30" cy="28" r="1" fill="#e9d5ff" />
        <circle cx="52" cy="26" r="1.2" fill="#e9d5ff" />
        <circle cx="40" cy="22" r="0.8" fill="#f3e8ff" />
        <circle cx="22" cy="36" r="0.8" fill="#e9d5ff" />
        <circle cx="58" cy="38" r="1" fill="#f3e8ff" />
        {/* Volutes montantes */}
        <path d="M32 50 Q28 44, 32 38 Q36 32, 32 26" stroke="#c084fc" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M48 50 Q52 44, 48 38 Q44 32, 48 26" stroke="#c084fc" strokeWidth="1" fill="none" opacity="0.5" />
      </g>
    </svg>
  )
}

// Tier 5 — Amnesia : spirale hypnotique néon
function AmnesiaEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="amnesia-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
        <filter id="glow-amnesia" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feFlood floodColor="#ec4899" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-amnesia)">
        {/* Spirale */}
        <path
          d="M40 40 C40 34, 46 34, 46 40 C46 48, 34 48, 34 38 C34 28, 50 28, 50 40 C50 54, 28 54, 28 36 C28 22, 54 22, 54 40 C54 60, 22 60, 22 34"
          stroke="url(#amnesia-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
        {/* Centre — oeil */}
        <circle cx="40" cy="40" r="3" fill="#ec4899" />
        <circle cx="40" cy="40" r="1.5" fill="#fce7f3" />
        {/* Particules autour */}
        <circle cx="20" cy="30" r="1.5" fill="#f9a8d4" opacity="0.7" />
        <circle cx="60" cy="50" r="1.5" fill="#f9a8d4" opacity="0.7" />
        <circle cx="56" cy="24" r="1" fill="#fbcfe8" opacity="0.6" />
        <circle cx="24" cy="56" r="1" fill="#fbcfe8" opacity="0.6" />
      </g>
    </svg>
  )
}

// Tier 6 — OG Kush : couronne + feuille royale
function OGKushEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="og-grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="og-leaf" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <filter id="glow-og" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feFlood floodColor="#f97316" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-og)">
        {/* Couronne */}
        <path d="M20 36 L26 18 L33 30 L40 14 L47 30 L54 18 L60 36 Z" fill="url(#og-grad)" stroke="#ea580c" strokeWidth="1.5" />
        <rect x="20" y="36" width="40" height="6" rx="1" fill="url(#og-grad)" stroke="#ea580c" strokeWidth="1" />
        {/* Gemmes */}
        <circle cx="33" cy="26" r="2" fill="#fbbf24" />
        <circle cx="40" cy="20" r="2.5" fill="#fbbf24" />
        <circle cx="47" cy="26" r="2" fill="#fbbf24" />
        {/* Petite feuille sous la couronne */}
        <ellipse cx="40" cy="54" rx="4" ry="10" fill="url(#og-leaf)" />
        <ellipse cx="40" cy="54" rx="3.5" ry="8" fill="url(#og-leaf)" transform="rotate(25, 40, 54)" />
        <ellipse cx="40" cy="54" rx="3.5" ry="8" fill="url(#og-leaf)" transform="rotate(-25, 40, 54)" />
        <line x1="40" y1="46" x2="40" y2="66" stroke="#15803d" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

// Tier 7 — Double Zéro : "00" diamant, platinum ultime
function DoubleZeroEmblem({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <defs>
        <linearGradient id="dz-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="30%" stopColor="#e8c97a" />
          <stop offset="60%" stopColor="#f5e6b8" />
          <stop offset="100%" stopColor="#d4a843" />
        </linearGradient>
        <linearGradient id="dz-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#fffbeb" stopOpacity="0" />
        </linearGradient>
        <filter id="glow-dz" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feFlood floodColor="#e8c97a" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow-dz)">
        {/* Diamant derrière */}
        <path d="M40 10 L58 30 L40 70 L22 30 Z" fill="url(#dz-grad)" stroke="#d4a843" strokeWidth="1.5" />
        {/* Facettes */}
        <path d="M22 30 L40 10 L58 30" fill="url(#dz-shine)" />
        <line x1="40" y1="10" x2="40" y2="70" stroke="#d4a843" strokeWidth="0.5" opacity="0.4" />
        <line x1="22" y1="30" x2="58" y2="30" stroke="#d4a843" strokeWidth="0.5" opacity="0.4" />
        <line x1="22" y1="30" x2="40" y2="70" stroke="#d4a843" strokeWidth="0.5" opacity="0.3" />
        <line x1="58" y1="30" x2="40" y2="70" stroke="#d4a843" strokeWidth="0.5" opacity="0.3" />
        {/* "00" au centre */}
        <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="900" fill="#78350f" fontFamily="monospace" opacity="0.9">00</text>
        <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fef3c7" fontFamily="monospace" opacity="0.5">00</text>
        {/* Éclats */}
        <circle cx="30" cy="18" r="1" fill="#fef9c3" />
        <circle cx="54" cy="22" r="1.2" fill="#fef9c3" />
        <circle cx="26" cy="44" r="0.8" fill="#fef9c3" />
        <circle cx="56" cy="42" r="0.8" fill="#fef9c3" />
      </g>
    </svg>
  )
}

// === Export principal ===

const EMBLEM_COMPONENTS = [
  TozEmblem,
  ShitEmblem,
  BeurreEmblem,
  SkunkEmblem,
  PurpleHazeEmblem,
  AmnesiaEmblem,
  OGKushEmblem,
  DoubleZeroEmblem,
]

export default function RankEmblem({ tier, size = 80 }: { tier: number; size?: number }) {
  const Component = EMBLEM_COMPONENTS[tier] || TozEmblem
  return <Component size={size} />
}
