'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/api/auth/register', { username, password })
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="card card-glow gradient-border p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏠</div>
          <h1 className="font-display text-3xl tracking-wide text-t-primary uppercase neon-title">Inscription</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-t-muted mb-1">
              Identifiant
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full px-4 py-2.5 border border-b rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-t-primary bg-input-bg"
              placeholder="choisis un pseudo"
            />
            <p className="text-xs text-t-faint mt-1">3 caractères minimum</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-t-muted mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-b rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-t-primary bg-input-bg"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover disabled:opacity-50 transition"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-t-muted mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
