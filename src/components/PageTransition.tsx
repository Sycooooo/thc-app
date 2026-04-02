'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { smooth } from '@/lib/animations'

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={smooth}
    >
      {children}
    </motion.div>
  )
}
