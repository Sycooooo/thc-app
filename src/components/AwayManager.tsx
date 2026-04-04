'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'

type Member = {
  userId: string
  username: string
  isAway: boolean
  awayStartDate: string | null
}

type AwayVote = {
  targetId: string
  voterId: string
  approved: boolean
}

export default function AwayManager({
  colocId,
  currentUserId,
  members,
  currentUserIsAway,
  pendingVotes,
}: {
  colocId: string
  currentUserId: string
  members: Member[]
  currentUserIsAway: boolean
  pendingVotes: AwayVote[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  // Demandes en attente : targets avec des votes OU si le user courant a demandé
  const pendingTargets = [...new Set(pendingVotes.map((v) => v.targetId))]
    .filter((targetId) => {
      const member = members.find((m) => m.userId === targetId)
      return member && !member.isAway
    })

  const myRequestPending = requested || pendingTargets.includes(currentUserId)

  async function requestAway() {
    setLoading(true)
    try {
      const data = await api.post(`/api/coloc/${colocId}/away/request`)
      if (data.autoApproved) {
        toast.success('Mode vacances activé !')
      } else {
        toast.success(`Demande envoyée ! ${data.pendingVotes} vote(s) en attente.`)
        setRequested(true)
      }
      router.refresh()
    } catch (err) {
      console.error('Erreur demande away:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la demande')
    }
    setLoading(false)
  }

  async function returnFromAway() {
    setLoading(true)
    try {
      await api.post(`/api/coloc/${colocId}/away/return`)
      toast.success('Bon retour !')
      router.refresh()
    } catch (err) {
      console.error('Erreur retour:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du retour')
    }
    setLoading(false)
  }

  async function vote(targetId: string, approved: boolean) {
    setLoading(true)
    try {
      const data = await api.post(`/api/coloc/${colocId}/away/vote`, { targetId, approved })
      if (data.result === 'approved') {
        toast.success('Vacances approuvées !')
      } else if (data.result === 'rejected') {
        toast.error('Demande refusée.')
      } else {
        toast.success('Vote enregistré !')
      }
      router.refresh()
    } catch (err) {
      console.error('Erreur vote:', err)
      toast.error(err instanceof Error ? err.message : 'Erreur lors du vote')
    }
    setLoading(false)
  }

  const hasAlreadyVoted = (targetId: string) =>
    pendingVotes.some((v) => v.voterId === currentUserId && v.targetId === targetId)

  return (
    <div className="card card-glow p-5">
      <h3 className="font-semibold text-t-primary mb-4">Mode Vacances</h3>

      {/* Statut personnel */}
      {currentUserIsAway ? (
        <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-400 mb-2">Tu es en mode vacances</p>
          <button
            onClick={returnFromAway}
            disabled={loading}
            className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Je suis de retour !
          </button>
        </div>
      ) : myRequestPending ? (
        <div className="bg-amber-500/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-amber-400">Demande de vacances envoyée</p>
          <p className="text-xs text-t-faint mt-1">En attente du vote des colocs...</p>
        </div>
      ) : (
        <button
          onClick={requestAway}
          disabled={loading}
          className="px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-lg text-sm font-medium transition disabled:opacity-50 mb-4"
        >
          {loading ? 'Envoi...' : 'Demander le mode vacances'}
        </button>
      )}

      {/* Votes en attente (pour les AUTRES membres) */}
      {pendingTargets.filter((t) => t !== currentUserId).length > 0 && (
        <div className="space-y-3 mb-4">
          <p className="text-xs text-t-faint font-medium">Demandes en attente</p>
          {pendingTargets.filter((t) => t !== currentUserId).map((targetId) => {
            const member = members.find((m) => m.userId === targetId)
            const voted = hasAlreadyVoted(targetId)
            return (
              <div key={targetId} className="flex items-center justify-between bg-surface-hover rounded-lg p-3">
                <span className="text-sm text-t-primary">{member?.username ?? '?'} demande des vacances</span>
                {voted ? (
                  <span className="text-xs text-green-400">Vote envoyé</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => vote(targetId, true)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-500/15 text-green-400 rounded text-xs font-medium hover:bg-green-500/25 transition disabled:opacity-50"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => vote(targetId, false)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-500/15 text-red-400 rounded text-xs font-medium hover:bg-red-500/25 transition disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Membres away */}
      {members.some((m) => m.isAway) && (
        <div className="mt-4">
          <p className="text-xs text-t-faint font-medium mb-2">En vacances</p>
          <div className="space-y-1">
            {members.filter((m) => m.isAway).map((m) => (
              <div key={m.userId} className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">Away</span>
                <span className="text-sm text-t-primary">{m.username}</span>
                {m.awayStartDate && (
                  <span className="text-xs text-t-faint">
                    depuis le {new Date(m.awayStartDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
