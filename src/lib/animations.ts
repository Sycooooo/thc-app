// Presets d'animation Framer Motion réutilisables

// ─── Spring configs centralisées ────────────────────────────────────
// Smooth — transitions de page, entrées de contenu, modales
export const smooth = { type: 'spring' as const, stiffness: 300, damping: 28 }

// Snappy — boutons, toggles, tabs, interactions rapides
export const snappy = { type: 'spring' as const, stiffness: 500, damping: 30 }

// Bouncy — badges, notifications, éléments ludiques (rank up, shop)
export const bouncy = { type: 'spring' as const, stiffness: 400, damping: 12 }

// ─── Presets d'animation ────────────────────────────────────────────

export const buttonTap = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02 },
}

export const buttonPop = {
  whileTap: { scale: 0.93 },
  whileHover: { scale: 1.05 },
  transition: bouncy,
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

// Slide down pour formulaires / dropdowns
export const slideDown = {
  initial: { opacity: 0, height: 0, y: -8 },
  animate: { opacity: 1, height: 'auto', y: 0 },
  exit: { opacity: 0, height: 0, y: -8 },
  transition: snappy,
}

// Wiggle pour attirer l'attention (notification bell)
export const wiggle = {
  animate: {
    rotate: [0, -12, 10, -8, 6, -3, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
}

// Scale bounce pour badges, compteurs
export const scaleBounce = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  transition: bouncy,
}

// Hover lift pour les cards
export const hoverLift = {
  whileHover: { y: -4, transition: smooth },
  whileTap: { y: 0, scale: 0.99 },
}

// Checkbox check animation
export const checkmark = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

// Tab underline indicator
export const tabIndicator = {
  layoutId: 'tab-indicator',
  transition: snappy,
}
