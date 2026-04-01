// Presets d'animation Framer Motion réutilisables

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

export const buttonTap = {
  whileTap: { scale: 0.97 },
  whileHover: { scale: 1.02 },
}

export const buttonPop = {
  whileTap: { scale: 0.93 },
  whileHover: { scale: 1.05 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
}

export const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
}

export const snappySpring = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
}

export const bouncySpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 15,
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
}

// Slide down pour formulaires / dropdowns
export const slideDown = {
  initial: { opacity: 0, height: 0, y: -8 },
  animate: { opacity: 1, height: 'auto', y: 0 },
  exit: { opacity: 0, height: 0, y: -8 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
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
  transition: { type: 'spring' as const, stiffness: 500, damping: 20 },
}

// Hover lift pour les cards
export const hoverLift = {
  whileHover: { y: -4, transition: { type: 'spring' as const, stiffness: 400, damping: 25 } },
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
  transition: { type: 'spring' as const, stiffness: 500, damping: 35 },
}
