'use client'

import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-solid)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </MotionConfig>
  )
}
