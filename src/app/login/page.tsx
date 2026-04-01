'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="card card-glow gradient-border p-8 w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
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
            Connexion
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
              className="w-full px-4 py-2.5 border border-b rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-t-primary bg-input-bg"
              placeholder="ton_identifiant"
            />
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
              size="md"
            >
              Se connecter
            </Button>
          </motion.div>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-sm text-t-muted mt-6"
        >
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-accent font-medium hover:underline">
            S&apos;inscrire
          </Link>
        </motion.p>
      </motion.div>
    </main>
  )
}
