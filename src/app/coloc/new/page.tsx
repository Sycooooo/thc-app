'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import PageAmbiance from '@/components/ui/PageAmbiance'
import PageTransition from '@/components/PageTransition'

type Mode = 'create' | 'join'

export default function NewColocPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [hasColoc, setHasColoc] = useState<boolean | null>(null)

  // Bloquer l'accès si l'utilisateur a déjà une coloc
  useEffect(() => {
    api.get('/api/coloc').then((coloc) => {
      if (coloc) {
        router.replace(`/coloc/${coloc.id}`)
      } else {
        setHasColoc(false)
      }
    }).catch(() => {
      setHasColoc(false)
    })
  }, [router])

  function switchMode(newMode: Mode) {
    setMode(newMode)
    setError('')
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const coloc = await api.post('/api/coloc', { name })
      toast.success('Colocation créée !')
      router.push(`/coloc/${coloc.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur')
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const coloc = await api.post('/api/coloc/join', { inviteCode: code.trim() })
      toast.success('Tu as rejoint la colocation !')
      router.push(`/coloc/${coloc.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Code invalide')
      setError(err instanceof Error ? err.message : 'Code invalide')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <PageAmbiance theme="accueil" />
      <PageTransition>
      <div className="card card-glow gradient-border p-8 w-full max-w-sm">
        {hasColoc === false ? null : (
          <Link href="/" className="text-sm text-t-muted hover:text-t-primary mb-6 block transition">
            ← Retour
          </Link>
        )}
        <h1 className="font-display text-3xl tracking-wide text-t-primary uppercase mb-4 neon-title">
          {mode === 'create' ? 'Nouvelle colocation' : 'Rejoindre une coloc'}
        </h1>

        {/* Onglets Créer / Rejoindre */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => switchMode('create')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'create'
                ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent)]'
                : 'bg-[var(--surface)] text-t-muted hover:text-t-primary border border-[var(--border)]'
            }`}
          >
            Créer
          </button>
          <button
            type="button"
            onClick={() => switchMode('join')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              mode === 'join'
                ? 'bg-[var(--accent)] text-white shadow-[0_0_12px_var(--accent)]'
                : 'bg-[var(--surface)] text-t-muted hover:text-t-primary border border-[var(--border)]'
            }`}
          >
            Rejoindre
          </button>
        </div>

        {/* Formulaire Créer */}
        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4">
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

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
            >
              Créer la colocation
            </Button>
          </form>
        )}

        {/* Formulaire Rejoindre */}
        {mode === 'join' && (
          <>
            <p className="text-t-muted text-sm mb-4">
              Demande le code d&apos;invitation à un membre de la coloc.
            </p>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-t-muted mb-1">
                  Code d&apos;invitation
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-b rounded-lg focus:outline-none focus:ring-2 focus:ring-accent code-text text-t-primary bg-input-bg"
                  placeholder="Colle le code ici"
                />
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                fullWidth
              >
                Rejoindre
              </Button>
            </form>
          </>
        )}
      </div>
      </PageTransition>
    </main>
  )
}
