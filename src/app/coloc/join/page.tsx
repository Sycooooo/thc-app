'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import PageAmbiance from '@/components/ui/PageAmbiance'

export default function JoinColocPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Bloquer l'accès si l'utilisateur a déjà une coloc
  useEffect(() => {
    api.get('/api/coloc').then((coloc) => {
      if (coloc) {
        router.replace(`/coloc/${coloc.id}`)
      }
    }).catch(() => {})
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
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
      <div className="card card-glow gradient-border p-8 w-full max-w-sm">
        <Link href="/" className="text-sm text-t-muted hover:text-t-primary mb-6 block transition">
          ← Retour
        </Link>
        <h1 className="font-display text-3xl tracking-wide text-t-primary uppercase mb-2 neon-title">Rejoindre une colocation</h1>
        <p className="text-t-muted text-sm mb-6">
          Demande le code d&apos;invitation à un membre de la coloc.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </main>
  )
}
