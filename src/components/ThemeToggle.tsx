'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored !== 'light'
    setDark(isDark)
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg bg-surface hover:bg-surface-hover border border-b flex items-center justify-center transition text-lg"
      title={dark ? 'Mode clair' : 'Mode sombre'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
