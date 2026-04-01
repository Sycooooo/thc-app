'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored !== 'light'
    setDark(isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    setAnimKey((k) => k + 1)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
      className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-b flex items-center justify-center transition-colors text-lg overflow-hidden"
      aria-label={dark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      <motion.span
        key={animKey}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="block"
      >
        {dark ? '☀️' : '🌙'}
      </motion.span>
    </motion.button>
  )
}
