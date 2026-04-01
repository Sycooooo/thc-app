'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'

export default function GenerateQuests({ colocId }: { colocId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setResult(null)
    try {
      const data = await api.post(`/api/coloc/${colocId}/generate-quests`)
      setResult(data.message)
      setTimeout(() => {
        setResult(null)
        router.refresh()
      }, 2000)
    } catch (err) {
      setResult(err instanceof Error ? err.message : 'Erreur')
    }
    setLoading(false)
  }

  return (
    <div className="bg-accent-secondary/10 border border-accent-secondary/20 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-accent-secondary">Quêtes de la semaine</p>
          <p className="text-xs text-t-muted mt-0.5">
            Génère automatiquement des tâches pour tous les colocataires
          </p>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <span className="text-sm text-accent-secondary font-medium">{result}</span>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            loading={loading}
            size="sm"
          >
            ⚔️ Générer
          </Button>
        </div>
      </div>
    </div>
  )
}
