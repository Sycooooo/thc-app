'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { smooth, bouncy } from '@/lib/animations'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'

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
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={smooth}
        className="card card-glow gradient-border p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...bouncy, delay: 0.1 }}
            className="text-4xl mb-3"
          >
            🏠
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl tracking-wide text-t-primary uppercase neon-title"
          >
            Inscription
          </motion.h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
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
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-danger text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
            >
              Créer mon compte
            </Button>
          </motion.div>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-sm text-t-muted mt-6"
        >
          Déjà un compte ?{' '}
          <Link href="/login" className="text-accent font-medium hover:underline">
            Se connecter
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
