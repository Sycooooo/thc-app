'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function NewColocPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const coloc = await api.post('/api/coloc', { name })
      router.push(`/coloc/${coloc.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="bg-surface rounded-2xl border border-b p-8 w-full max-w-sm" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <Link href="/dashboard" className="text-sm text-t-muted hover:text-t-primary mb-6 block transition">
          ← Retour
        </Link>
        <h1 className="font-display text-3xl tracking-wide text-t-primary uppercase mb-6">Nouvelle colocation</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-t-muted mb-1">
              Nom de la colocation
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-b rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-t-primary bg-input-bg"
              placeholder="Ex: Appart rue de la Paix"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition"
          >
            {loading ? 'Création...' : 'Créer la colocation'}
          </button>
        </form>
      </div>
    </main>
  )
}
