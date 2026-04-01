'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/xp'

type Affinity = { userId: string; category: string; weight: number }
type Coloc = { id: string; name: string }

const WEIGHTS = [
  { value: 0, label: 'Normal', color: 'bg-surface-hover text-t-muted' },
  { value: 1, label: '+', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { value: 2, label: '++', color: 'bg-accent-secondary/15 text-accent-secondary' },
  { value: 3, label: '+++', color: 'bg-accent/15 text-accent' },
]

const categories = Object.keys(CATEGORY_LABELS)

export default function MyAffinities({ colocs }: { colocs: Coloc[] }) {
  const [selected, setSelected] = useState('')
  const [affinities, setAffinities] = useState<Affinity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (colocs.length > 0 && !selected) {
      setSelected(colocs[0].id)
    }
  }, [colocs])

  useEffect(() => {
    if (selected) loadAffinities()
  }, [selected])

  async function loadAffinities() {
    setLoading(true)
    try {
      const data = await api.get(`/api/coloc/${selected}/affinities`)
      setAffinities(data)
    } catch {
      setAffinities([])
    }
    setLoading(false)
  }

  async function toggle(category: string) {
    setSaving(category)
    const current = affinities.find((a) => a.category === category)?.weight ?? 0
    const next = (current + 1) % 4
    try {
      await api.post(`/api/coloc/${selected}/affinities`, { category, weight: next })
      await loadAffinities()
    } catch (err) {
      console.error(err)
    }
    setSaving(null)
  }

  if (colocs.length === 0) return null

  return (
    <div className="card card-glow p-5">
      <h3 className="font-semibold text-t-primary mb-1">Mes préférences de tâches</h3>
      <p className="text-xs text-t-muted mb-4">
        Plus le poids est élevé, plus tu recevras ce type de tâche.
      </p>

      {colocs.length > 1 && (
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full mb-4 px-3 py-2 text-sm border border-b rounded-lg text-t-primary bg-input-bg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {colocs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {loading ? (
        <p className="text-sm text-t-faint text-center py-4">Chargement...</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const w = affinities.find((a) => a.category === cat)?.weight ?? 0
            const style = WEIGHTS[w]
            return (
              <div key={cat} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-t-primary">
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </span>
                <button
                  onClick={() => toggle(cat)}
                  disabled={saving === cat}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer disabled:opacity-50 ${style.color}`}
                >
                  {saving === cat ? '...' : style.label}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
