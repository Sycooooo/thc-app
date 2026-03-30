'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import type { Member } from '@/types'

export default function AddTaskForm({
  colocId,
  members,
}: {
  colocId: string
  members: Member[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: description || null,
        colocId,
        assignedToId: assignedToId || null,
        dueDate: dueDate || null,
        recurrence: recurrence || null,
        difficulty,
      }),
    })

    setTitle('')
    setDescription('')
    setAssignedToId('')
    setDueDate('')
    setRecurrence('')
    setDifficulty('medium')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition font-medium"
      >
        + Ajouter une tâche
      </button>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Nouvelle tâche</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Titre de la tâche"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        />

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optionnel)"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        />

        {/* Difficulté / XP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'easy', label: 'Facile', xp: '+20 XP', color: 'border-green-400 bg-green-50 text-green-700' },
              { value: 'medium', label: 'Moyen', xp: '+50 XP', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
              { value: 'hard', label: 'Difficile', xp: '+100 XP', color: 'border-red-400 bg-red-50 text-red-700' },
            ].map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`py-2 rounded-lg border-2 text-sm font-medium transition ${
                  difficulty === d.value ? d.color + ' border-2' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {d.label}<br />
                <span className="text-xs font-bold">{d.xp}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select
            value={assignedToId}
            onChange={(e) => setAssignedToId(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">Assigner à...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">Pas de récurrence</option>
            <option value="daily">Quotidien</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuel</option>
          </select>
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        />

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}
