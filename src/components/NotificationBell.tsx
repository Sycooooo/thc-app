'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { snappy, bouncy } from '@/lib/animations'
import { api } from '@/lib/api'

type Notification = {
  id: string
  type: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

const TYPE_ICONS: Record<string, string> = {
  task_assigned: '📋',
  task_completed: '✅',
  new_event: '📅',
  new_board_item: '📌',
  quest_generated: '⚔️',
  mention: '💬',
  away_request: '🏖️',
  away_approved: '✈️',
  away_rejected: '❌',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [prevUnread, setPrevUnread] = useState(0)
  const [bellRing, setBellRing] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  // Déclencher le wiggle quand de nouvelles notifs arrivent
  useEffect(() => {
    if (unread > prevUnread && prevUnread >= 0) {
      setBellRing(true)
      setTimeout(() => setBellRing(false), 800)
    }
    setPrevUnread(unread)
  }, [unread])

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getBellPrefs(): Record<string, boolean> {
    try {
      const stored = localStorage.getItem('bell_prefs')
      if (stored) return JSON.parse(stored)
    } catch {}
    return {}
  }

  async function loadNotifications() {
    try {
      const data = await api.get('/api/notifications')
      const bellPrefs = getBellPrefs()
      const typeToKey: Record<string, string> = {
        task_assigned: 'bell_task_assigned',
        task_completed: 'bell_task_completed',
        new_event: 'bell_new_event',
        new_board_item: 'bell_new_board_item',
      }
      const filtered = data.notifications.filter((n: Notification) => {
        const prefKey = typeToKey[n.type]
        if (!prefKey) return true // types non configurables (mention, quest) toujours affichés
        return bellPrefs[prefKey] !== false
      })
      setNotifications(filtered)
      setUnread(filtered.filter((n: Notification) => !n.read).length)
    } catch {
      // silently fail
    }
  }

  async function markRead() {
    if (unread === 0) return
    try {
      await api.post('/api/notifications')
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }

  function handleOpen() {
    setOpen(!open)
    if (!open) markRead()
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "à l'instant"
    if (mins < 60) return `il y a ${mins}min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    return `il y a ${days}j`
  }

  return (
    <div ref={ref} className="relative">
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        className="relative p-2 text-t-muted hover:text-t-primary transition-colors"
        aria-label={unread > 0 ? `Notifications (${unread} non lues)` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <motion.div
          animate={bellRing ? {
            rotate: [0, 14, -12, 10, -8, 5, -3, 0],
            transition: { duration: 0.6 },
          } : {}}
          style={{ transformOrigin: 'top center' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </motion.div>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              role="status"
              aria-live="polite"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={bouncy}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={snappy}
            className="absolute right-0 top-full mt-2 w-80 bg-surface-solid rounded-xl border border-b z-50 max-h-96 overflow-y-auto backdrop-blur-lg"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="p-3 border-b border-b">
              <p className="font-semibold text-t-primary text-sm">Notifications</p>
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-t-faint text-sm">
                Aucune notification
              </div>
            ) : (
              <div>
                {notifications.map((n, i) => (
                  <motion.a
                    key={n.id}
                    href={n.link || '#'}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`block px-3 py-2.5 border-b border-b/50 hover:bg-surface-hover transition ${
                      !n.read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5">{TYPE_ICONS[n.type] || '🔔'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-t-primary">{n.message}</p>
                        <p className="text-xs text-t-faint mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={bouncy}
                          className="w-2 h-2 bg-accent rounded-full mt-1.5 flex-shrink-0"
                        />
                      )}
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
