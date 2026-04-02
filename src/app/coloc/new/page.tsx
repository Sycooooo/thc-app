'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import PageAmbiance from '@/components/ui/PageAmbiance'
import PageTransition from '@/components/PageTransition'

export default function NewColocPage() {
  const router = useRouter()
  const [name, setName] = useState('')
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

  async function handleSubmit(e: React.FormEvent) {
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
        <h1 className="font-display text-3xl tracking-wide text-t-primary uppercase mb-6 neon-title">Nouvelle colocation</h1>

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

          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            fullWidth
          >
            Créer la colocation
          </Button>
        </form>
      </div>
      </PageTransition>
    </main>
  )
}
