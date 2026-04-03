'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { smooth, bouncy } from '@/lib/animations'
import { type RankInfo } from '@/lib/ranking'
import RankEmblem from './RankEmblem'

export default function RankUpModal({
  show,
  type,
  newRank,
  onClose,
}: {
  show: boolean
  type: 'division_up' | 'tier_up'
  newRank: RankInfo
  onClose: () => void
}) {
  const isTierUp = type === 'tier_up'

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={smooth}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-surface-solid rounded-2xl p-8 max-w-sm w-full mx-4 text-center overflow-hidden"
            style={{
              boxShadow: `0 0 60px ${newRank.glow}, 0 0 120px ${newRank.glow}`,
              border: `2px solid ${newRank.color}60`,
            }}
          >
            {/* Particules de fond */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.08,
                    ease: 'easeOut',
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: newRank.color }}
                />
              ))}
            </div>

            {/* Contenu */}
            <div className="relative z-10">
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-bold uppercase tracking-widest mb-3"
                style={{ color: newRank.color }}
              >
                {isTierUp ? 'Promotion !' : 'Division Up !'}
              </motion.p>

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...bouncy, delay: 0.3 }}
                className="mb-4 flex justify-center"
              >
                <RankEmblem tier={newRank.tier} size={120} />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-display text-2xl tracking-wide uppercase mb-1"
                style={{
                  color: newRank.color,
                  textShadow: `0 0 30px ${newRank.glow}`,
                }}
              >
                {newRank.label}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-t-faint stat-number"
              >
                {newRank.points} RP
              </motion.p>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onClose}
                className="mt-6 px-6 py-2 rounded-full font-bold text-sm text-white transition hover:brightness-110"
                style={{ backgroundColor: newRank.color }}
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
