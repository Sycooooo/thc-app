'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { smooth, snappy, scaleBounce } from '@/lib/animations'
import { api } from '@/lib/api'
import { BLOCK_LABELS, BLOCK_ICONS, DIFFICULTY_LABELS, XP_REWARDS } from '@/lib/xp'
import RankUpModal from '@/components/RankUpModal'

type HabitLog = {
  id: string
  date: string
  completed: boolean
}

type Habit = {
  id: string
  title: string
  description: string | null
  icon: string
  difficulty: string
  block: string
  logs: HabitLog[]
}

type Props = {
  habits: Habit[]
  colocId: string
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400',
  medium: 'bg-amber-500/15 text-amber-400',
  hard: 'bg-red-500/15 text-red-400',
}

const BLOCK_ORDER = ['morning', 'afternoon', 'evening', 'anytime']

const HABIT_SUGGESTIONS = [
  { icon: '⏰', title: 'Se lever tôt', difficulty: 'medium', block: 'morning' },
  { icon: '🧘', title: 'Méditer', difficulty: 'easy', block: 'morning' },
  { icon: '🏃', title: 'Sport / Stretching', difficulty: 'medium', block: 'morning' },
  { icon: '🚿', title: 'Douche froide', difficulty: 'hard', block: 'morning' },
  { icon: '🥣', title: 'Petit-déjeuner sain', difficulty: 'easy', block: 'morning' },
  { icon: '📖', title: 'Lire 20 min', difficulty: 'easy', block: 'evening' },
  { icon: '✍️', title: 'Journaling', difficulty: 'easy', block: 'evening' },
  { icon: '📵', title: 'Pas de réseaux sociaux', difficulty: 'hard', block: 'afternoon' },
  { icon: '🧹', title: 'Ranger sa chambre', difficulty: 'easy', block: 'morning' },
  { icon: '💧', title: 'Boire 2L d\'eau', difficulty: 'medium', block: 'anytime' },
  { icon: '🎯', title: 'Deep work 90 min', difficulty: 'hard', block: 'afternoon' },
  { icon: '🌙', title: 'Couché avant minuit', difficulty: 'medium', block: 'evening' },
  { icon: '🚶', title: 'Marcher 30 min', difficulty: 'easy', block: 'anytime' },
  { icon: '🍳', title: 'Cuisiner un repas', difficulty: 'medium', block: 'anytime' },
  { icon: '🧘‍♂️', title: 'Pas de snooze', difficulty: 'hard', block: 'morning' },
]

function getWeekDays() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  const days = []
  const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({ date: d, label: DAY_NAMES[i], num: d.getDate() })
  }
  return days
}

function isToday(date: Date) {
  const now = new Date()
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
}

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

function getHabitStreak(logs: HabitLog[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedDates = logs
    .filter((l) => l.completed)
    .map((l) => { const d = new Date(l.date); d.setHours(0, 0, 0, 0); return d })
    .sort((a, b) => b.getTime() - a.getTime())

  let streak = 0
  const checkDate = new Date(today)

  for (const logDate of completedDates) {
    if (isSameDay(logDate, checkDate)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default function HabitTracker({ habits: initialHabits, colocId }: Props) {
  const router = useRouter()
  const [habits, setHabits] = useState(initialHabits)
  useEffect(() => { setHabits(initialHabits) }, [initialHabits])
  const [toggling, setToggling] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [managing, setManaging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [popup, setPopup] = useState<{ habitId: string; xp: number; coins: number; streak: number } | null>(null)
  const [rankUp, setRankUp] = useState<{ type: string; newRank: Record<string, unknown> } | null>(null)

  // Form state (create)
  const [newTitle, setNewTitle] = useState('')
  const [newIcon, setNewIcon] = useState('✅')
  const [newDifficulty, setNewDifficulty] = useState('medium')
  const [newBlock, setNewBlock] = useState('anytime')

  // Form state (edit)
  const [editTitle, setEditTitle] = useState('')
  const [editIcon, setEditIcon] = useState('')
  const [editDifficulty, setEditDifficulty] = useState('')
  const [editBlock, setEditBlock] = useState('')

  const weekDays = getWeekDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function isCompletedToday(habit: Habit) {
    return habit.logs.some((l) => {
      const d = new Date(l.date)
      d.setHours(0, 0, 0, 0)
      return isSameDay(d, today) && l.completed
    })
  }

  function getCompletionForDay(date: Date) {
    if (habits.length === 0) return 0
    const completed = habits.filter((h) =>
      h.logs.some((l) => {
        const d = new Date(l.date)
        d.setHours(0, 0, 0, 0)
        return isSameDay(d, date) && l.completed
      })
    ).length
    return completed / habits.length
  }

  async function toggleHabit(habitId: string) {
    setToggling(habitId)
    try {
      const data = await api.post(`/api/coloc/${colocId}/habits/${habitId}/toggle`)

      // Optimistic update
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h
          const todayStr = today.toISOString()
          if (data.completed) {
            return { ...h, logs: [...h.logs, { id: 'temp', date: todayStr, completed: true }] }
          } else {
            return { ...h, logs: h.logs.filter((l) => !isSameDay(new Date(l.date), today)) }
          }
        })
      )

      if (data.completed && data.xpGained) {
        setPopup({ habitId, xp: data.xpGained, coins: data.coinsGained, streak: data.habitStreak })
        if (data.rankUp) setTimeout(() => setRankUp(data.rankUp), 2600)
        setTimeout(() => { setPopup(null); router.refresh() }, 2500)
      }
    } catch (err) {
      console.error('Erreur toggle habit:', err)
    }
    setToggling(null)
  }

  async function createHabit() {
    if (!newTitle.trim()) return
    try {
      await api.post(`/api/coloc/${colocId}/habits`, {
        title: newTitle.trim(),
        icon: newIcon || '✅',
        difficulty: newDifficulty,
        block: newBlock,
      })
      setNewTitle('')
      setNewIcon('✅')
      setNewDifficulty('medium')
      setNewBlock('anytime')
      setShowForm(false)
      router.refresh()
    } catch (err) {
      console.error('Erreur création habit:', err)
    }
  }

  async function deleteHabit(habitId: string) {
    try {
      await api.delete(`/api/coloc/${colocId}/habits`, { habitId })
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      setConfirmDeleteId(null)
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id)
    setEditTitle(habit.title)
    setEditIcon(habit.icon)
    setEditDifficulty(habit.difficulty)
    setEditBlock(habit.block)
  }

  async function saveEdit(habitId: string) {
    if (!editTitle.trim()) return
    try {
      await api.patch(`/api/coloc/${colocId}/habits`, {
        habitId,
        title: editTitle.trim(),
        icon: editIcon || '✅',
        difficulty: editDifficulty,
        block: editBlock,
      })
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? { ...h, title: editTitle.trim(), icon: editIcon || '✅', difficulty: editDifficulty, block: editBlock }
            : h
        )
      )
      setEditingId(null)
    } catch (err) {
      console.error('Erreur édition:', err)
    }
  }

  // Grouper par block
  const grouped = BLOCK_ORDER
    .map((block) => ({
      block,
      label: BLOCK_LABELS[block] ?? block,
      icon: BLOCK_ICONS[block] ?? '📌',
      habits: habits.filter((h) => h.block === block),
    }))
    .filter((g) => g.habits.length > 0)

  return (
    <div className="space-y-4">
      {/* Rank up modal */}
      <AnimatePresence>
        {rankUp && (
          <RankUpModal
            show
            type={rankUp.type as 'tier_up' | 'division_up'}
            newRank={rankUp.newRank as never}
            onClose={() => setRankUp(null)}
          />
        )}
      </AnimatePresence>

      {/* Header avec bouton Gérer */}
      {habits.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => { setManaging(!managing); setEditingId(null); setConfirmDeleteId(null) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              managing
                ? 'bg-accent/30 text-accent'
                : 'bg-surface-hover text-t-primary hover:bg-accent/15'
            }`}
          >
            {managing ? 'Terminé' : 'Gérer'}
          </button>
        </div>
      )}

      {/* Calendrier semaine */}
      <div className="rounded-xl border border-[var(--border)] bg-[#161628]/95 backdrop-blur-lg p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const pct = getCompletionForDay(day.date)
            const isTodayCol = isToday(day.date)
            const isPast = day.date < today
            return (
              <div key={day.num} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] font-medium ${isTodayCol ? 'text-accent' : 'text-t-faint'}`}>
                  {day.label}
                </span>
                <span className={`text-xs font-bold ${isTodayCol ? 'text-accent bg-accent/15 w-7 h-7 rounded-full flex items-center justify-center' : 'text-t-muted'}`}>
                  {day.num}
                </span>
                {/* Barre de complétion */}
                <div className="w-full h-8 bg-[#0a0a14]/40 rounded-sm overflow-hidden flex items-end">
                  {(isPast || isTodayCol) && pct > 0 && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct * 100}%` }}
                      transition={smooth}
                      className={`w-full rounded-sm ${
                        pct === 1 ? 'bg-green-400' : pct >= 0.5 ? 'bg-amber-400' : 'bg-accent'
                      }`}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Blocs d'habitudes */}
      {grouped.map((group) => {
        const completedCount = group.habits.filter((h) => isCompletedToday(h)).length
        return (
          <div key={group.block} className="space-y-2">
            {/* Block header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span>{group.icon}</span>
                <span className="font-semibold text-t-primary text-sm">{group.label}</span>
              </div>
              <span className="text-xs text-t-faint font-medium">
                [{completedCount}/{group.habits.length}]
              </span>
            </div>

            {/* Habit rows */}
            {group.habits.map((habit) => {
              const done = isCompletedToday(habit)
              const streak = getHabitStreak(habit.logs)
              const isEditing = editingId === habit.id

              // Mode édition inline
              if (isEditing) {
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="rounded-lg border border-accent/30 p-4 bg-[#161628]/95 backdrop-blur-xl space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editIcon}
                        onChange={(e) => setEditIcon(e.target.value)}
                        maxLength={4}
                        className="w-14 text-center px-2 py-2 border border-[var(--border)] rounded-lg bg-input-bg text-t-primary text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-input-bg text-t-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-t-muted mb-1">Difficulté</label>
                      <div className="flex gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setEditDifficulty(d)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                              editDifficulty === d
                                ? DIFFICULTY_COLORS[d]
                                : 'border border-[var(--border)] text-t-muted hover:border-accent/30'
                            }`}
                          >
                            {DIFFICULTY_LABELS[d]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-t-muted mb-1">Moment</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BLOCK_ORDER.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setEditBlock(b)}
                            className={`py-1.5 rounded-lg text-xs font-medium transition ${
                              editBlock === b
                                ? 'bg-accent/15 text-accent border border-accent/30'
                                : 'border border-[var(--border)] text-t-muted hover:border-accent/30'
                            }`}
                          >
                            {BLOCK_ICONS[b]} {BLOCK_LABELS[b]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(habit.id)}
                        className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1.5 bg-surface-hover text-t-muted rounded-lg text-sm font-medium hover:text-t-primary transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </motion.div>
                )
              }

              return (
                <motion.div
                  key={habit.id}
                  layout
                  className={`relative rounded-lg border p-3 flex items-center gap-3 transition backdrop-blur-lg ${
                    done
                      ? 'border-green-500/30 bg-[#161628]/95'
                      : 'border-[var(--border)] bg-[#161628]/90'
                  }`}
                >
                  {/* Checkbox (hidden in manage mode) */}
                  {!managing && (
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      disabled={toggling === habit.id}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
                        done
                          ? 'bg-accent border-accent text-white'
                          : 'border-t-faint hover:border-accent'
                      } ${toggling === habit.id ? 'opacity-50' : ''}`}
                    >
                      {done && (
                        <motion.svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={snappy}
                        >
                          <motion.path
                            d="M2 7L5.5 10.5L12 3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </motion.svg>
                      )}
                    </button>
                  )}

                  {/* Icon + Title */}
                  <span className="text-lg">{habit.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-t-primary ${done ? 'line-through' : ''}`}>
                      {habit.title}
                    </p>
                    {habit.description && (
                      <p className="text-xs text-t-faint mt-0.5 truncate">{habit.description}</p>
                    )}
                  </div>

                  {!managing ? (
                    <>
                      {/* Difficulty chip */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[habit.difficulty] ?? ''}`}>
                        {DIFFICULTY_LABELS[habit.difficulty] ?? habit.difficulty}
                      </span>

                      {/* Streak badge */}
                      {streak > 0 && (
                        <motion.span
                          {...scaleBounce}
                          className="text-xs font-bold text-amber-400 flex items-center gap-0.5"
                        >
                          🔥 {streak}
                        </motion.span>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Edit button */}
                      <button
                        onClick={() => startEdit(habit)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent/15 text-accent hover:bg-accent/25 transition"
                      >
                        Modifier
                      </button>

                      {/* Delete with confirmation */}
                      {confirmDeleteId === habit.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded-lg text-xs font-medium text-t-faint hover:text-t-primary transition"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(habit.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          Supprimer
                        </button>
                      )}
                    </>
                  )}

                  {/* XP Popup */}
                  <AnimatePresence>
                    {popup?.habitId === habit.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.8 }}
                        animate={{ opacity: 1, y: -20, scale: 1 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="absolute -top-2 right-4 bg-accent/90 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20"
                      >
                        +{popup.xp} XP {popup.streak > 1 && `🔥${popup.streak}`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )
      })}

      {/* Empty state */}
      {habits.length === 0 && !showForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[#161628]/95 backdrop-blur-lg p-8 text-center text-t-faint">
          <p className="text-2xl mb-2">🔥</p>
          <p className="text-sm">Aucune habitude pour l&apos;instant</p>
          <p className="text-xs mt-1">Crée ta première habitude pour commencer à streak !</p>
        </div>
      )}

      {/* Formulaire ajout */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.button
            key="add-btn"
            onClick={() => setShowForm(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full py-3 border-2 border-dashed border-accent/30 rounded-lg text-t-primary hover:border-accent hover:text-accent transition-colors font-medium bg-[#161628]/95 backdrop-blur-sm"
          >
            + Ajouter une habitude
          </motion.button>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={smooth}
            className="rounded-xl border border-accent/20 p-5 overflow-hidden bg-[#161628]/95 backdrop-blur-xl"
            style={{ boxShadow: 'var(--shadow)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-t-primary">Nouvelle habitude</h3>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                  showSuggestions ? 'bg-accent/15 text-accent' : 'bg-surface-hover text-t-muted hover:text-t-primary'
                }`}
              >
                💡 Idées
              </button>
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={snappy}
                  className="overflow-hidden mb-3"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {HABIT_SUGGESTIONS.map((s) => (
                      <button
                        key={s.title}
                        type="button"
                        onClick={() => {
                          setNewTitle(s.title)
                          setNewIcon(s.icon)
                          setNewDifficulty(s.difficulty)
                          setNewBlock(s.block)
                          setShowSuggestions(false)
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-[#161628]/80 border border-[var(--border)] text-t-muted hover:text-accent hover:border-accent/30 transition"
                      >
                        <span>{s.icon}</span>
                        <span>{s.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {/* Titre + Icône */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  maxLength={4}
                  className="w-14 text-center px-2 py-2.5 border border-[var(--border)] rounded-lg bg-input-bg text-t-primary text-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre de l'habitude"
                  className="flex-1 px-4 py-2.5 border border-[var(--border)] rounded-lg bg-input-bg text-t-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {/* Difficulté */}
              <div>
                <label className="block text-xs font-medium text-t-muted mb-1.5">Difficulté</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                        newDifficulty === d
                          ? DIFFICULTY_COLORS[d]
                          : 'border border-[var(--border)] text-t-muted hover:border-accent/30'
                      }`}
                    >
                      {DIFFICULTY_LABELS[d]} (+{XP_REWARDS[d]} XP)
                    </button>
                  ))}
                </div>
              </div>

              {/* Bloc horaire */}
              <div>
                <label className="block text-xs font-medium text-t-muted mb-1.5">Moment de la journée</label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOCK_ORDER.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setNewBlock(b)}
                      className={`py-2 rounded-lg text-xs font-medium transition ${
                        newBlock === b
                          ? 'bg-accent/15 text-accent border border-accent/30'
                          : 'border border-[var(--border)] text-t-muted hover:border-accent/30'
                      }`}
                    >
                      {BLOCK_ICONS[b]} {BLOCK_LABELS[b]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={createHabit}
                  className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-surface-hover text-t-muted rounded-lg text-sm font-medium hover:text-t-primary transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
