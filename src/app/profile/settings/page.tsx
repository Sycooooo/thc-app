'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { api } from '@/lib/api'
import Button from '@/components/ui/Button'
import MyAffinities from '@/components/MyAffinities'
import SpotifyLink from '@/components/SpotifyLink'

// === Types ===

type ColocRaw = {
  id: string
  name: string
  members: { userId: string; role: string; user: { id: string } }[]
}
type Coloc = { id: string; name: string; role: string }
type Privacy = { hideStats: boolean; hideOnline: boolean }

// === Notification prefs (localStorage) ===

const NOTIF_SOUND_KEYS = [
  { key: 'sound_chat', label: 'Messages du chat', icon: '💬' },
  { key: 'sound_tasks', label: 'Nouvelles tâches', icon: '📋' },
  { key: 'sound_board', label: 'Tableau (sticky notes)', icon: '📌' },
] as const

const NOTIF_BELL_KEYS = [
  { key: 'bell_task_assigned', label: 'Tâche assignée', icon: '📋' },
  { key: 'bell_task_completed', label: 'Tâche complétée', icon: '✅' },
  { key: 'bell_new_event', label: 'Nouvel événement', icon: '📅' },
  { key: 'bell_new_board_item', label: 'Nouveau post tableau', icon: '📌' },
] as const

function getPrefs(storageKey: string, defaults: Record<string, boolean>): Record<string, boolean> {
  if (typeof window === 'undefined') return defaults
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) return { ...defaults, ...JSON.parse(stored) }
  } catch {}
  return defaults
}

function savePrefs(storageKey: string, prefs: Record<string, boolean>) {
  localStorage.setItem(storageKey, JSON.stringify(prefs))
}

// === Toggle component ===

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        enabled ? 'bg-accent' : 'bg-surface-hover'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// === DND hours ===

function getDndPrefs(): { enabled: boolean; start: string; end: string } {
  if (typeof window === 'undefined') return { enabled: false, start: '23:00', end: '08:00' }
  try {
    const stored = localStorage.getItem('dnd_prefs')
    if (stored) return JSON.parse(stored)
  } catch {}
  return { enabled: false, start: '23:00', end: '08:00' }
}

function saveDndPrefs(prefs: { enabled: boolean; start: string; end: string }) {
  localStorage.setItem('dnd_prefs', JSON.stringify(prefs))
}

// === Main ===

export default function SettingsPage() {
  const router = useRouter()

  // --- Pseudo ---
  const [newUsername, setNewUsername] = useState('')
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleChangeUsername(e: React.FormEvent) {
    e.preventDefault()
    setUsernameMsg(null)
    setUsernameLoading(true)
    try {
      await api.patch('/api/profile/username', { username: newUsername })
      setUsernameMsg({ type: 'success', text: 'Pseudo modifié ! Reconnecte-toi pour voir le changement.' })
      setNewUsername('')
    } catch (err) {
      setUsernameMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' })
    }
    setUsernameLoading(false)
  }

  // --- Mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwMessage(null)
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    setPwLoading(true)
    try {
      await api.post('/api/profile/password', { currentPassword, newPassword })
      setPwMessage({ type: 'success', text: 'Mot de passe modifié' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erreur' })
    }
    setPwLoading(false)
  }

  // --- Notifications sonores ---
  const [soundPrefs, setSoundPrefs] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setSoundPrefs(getPrefs('notif_prefs', { sound_chat: true, sound_tasks: true, sound_board: true }))
  }, [])

  function toggleSound(key: string) {
    const updated = { ...soundPrefs, [key]: !soundPrefs[key] }
    setSoundPrefs(updated)
    savePrefs('notif_prefs', updated)
  }

  // --- Notifications cloche ---
  const [bellPrefs, setBellPrefs] = useState<Record<string, boolean>>({})
  useEffect(() => {
    setBellPrefs(getPrefs('bell_prefs', {
      bell_task_assigned: true,
      bell_task_completed: true,
      bell_new_event: true,
      bell_new_board_item: true,
    }))
  }, [])

  function toggleBell(key: string) {
    const updated = { ...bellPrefs, [key]: !bellPrefs[key] }
    setBellPrefs(updated)
    savePrefs('bell_prefs', updated)
  }

  // --- Ne pas déranger ---
  const [dnd, setDnd] = useState({ enabled: false, start: '23:00', end: '08:00' })
  useEffect(() => {
    setDnd(getDndPrefs())
  }, [])

  function updateDnd(partial: Partial<typeof dnd>) {
    const updated = { ...dnd, ...partial }
    setDnd(updated)
    saveDndPrefs(updated)
  }

  // --- Confidentialité ---
  const [privacy, setPrivacy] = useState<Privacy>({ hideStats: false, hideOnline: false })
  useEffect(() => {
    api.get('/api/profile/privacy').then(setPrivacy).catch(() => {})
  }, [])

  async function togglePrivacy(key: keyof Privacy) {
    const updated = { ...privacy, [key]: !privacy[key] }
    setPrivacy(updated)
    await api.patch('/api/profile/privacy', { [key]: updated[key] }).catch(() => {
      setPrivacy(privacy) // rollback
    })
  }

  // --- Colocations ---
  const [colocs, setColocs] = useState<Coloc[]>([])
  const [leavingId, setLeavingId] = useState<string | null>(null)
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/coloc').then((data: ColocRaw | null) => {
      if (!data) { setColocs([]); return }
      // On doit trouver le rôle de l'utilisateur courant dans la coloc
      fetch('/api/auth/session').then(r => r.json()).then(session => {
        const userId = session?.user?.id
        setColocs([{
          id: data.id,
          name: data.name,
          role: data.members.find(m => m.user.id === userId)?.role || 'member',
        }])
      })
    }).catch(() => {})
  }, [])

  async function handleLeave(colocId: string) {
    if (leaveConfirm !== colocId) {
      setLeaveConfirm(colocId)
      return
    }
    setLeavingId(colocId)
    try {
      await api.post(`/api/coloc/${colocId}/leave`)
      setColocs(colocs.filter((c) => c.id !== colocId))
      setLeaveConfirm(null)
    } catch (err) {
      console.error(err)
    }
    setLeavingId(null)
  }

  // --- Export ---
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/profile')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-coloc-menage-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
    setExporting(false)
  }

  // --- Suppression compte ---
  const [deleteStep, setDeleteStep] = useState(0) // 0=hidden, 1=confirm, 2=type
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (deleteInput !== 'SUPPRIMER') return
    setDeleting(true)
    try {
      await api.delete('/api/profile', { confirmation: 'SUPPRIMER' })
      signOut({ callbackUrl: '/' })
    } catch (err) {
      console.error(err)
    }
    setDeleting(false)
  }

  // --- Cache ---
  const [cacheCleared, setCacheCleared] = useState(false)

  function clearCache() {
    localStorage.clear()
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 2000)
  }

  function resetNotifPrefs() {
    localStorage.removeItem('notif_prefs')
    localStorage.removeItem('bell_prefs')
    localStorage.removeItem('dnd_prefs')
    setSoundPrefs({ sound_chat: true, sound_tasks: true, sound_board: true })
    setBellPrefs({ bell_task_assigned: true, bell_task_completed: true, bell_new_event: true, bell_new_board_item: true })
    setDnd({ enabled: false, start: '23:00', end: '08:00' })
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
        <Link href="/profile" className="text-t-muted hover:text-t-primary transition">←</Link>
        <h1 className="font-display text-2xl tracking-wide text-t-primary uppercase neon-title">Paramètres</h1>
      </header>

      <main className="max-w-lg mx-auto p-6 space-y-5">

        {/* ========== COMPTE ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider">Compte</h2>

        {/* Changer pseudo */}
        <div className="card card-glow p-5">
          <h3 className="font-semibold text-t-primary mb-3">Changer de pseudo</h3>
          <form onSubmit={handleChangeUsername} className="flex gap-2">
            <input
              type="text"
              placeholder="Nouveau pseudo"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              className="flex-1 bg-surface-hover border border-b rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder:text-t-faint focus:outline-none focus:border-accent transition"
            />
            <Button type="submit" loading={usernameLoading} disabled={usernameLoading} size="sm">
              OK
            </Button>
          </form>
          {usernameMsg && (
            <p className={`text-sm mt-2 ${usernameMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {usernameMsg.text}
            </p>
          )}
        </div>

        {/* Changer mot de passe */}
        <div className="card card-glow p-5">
          <h3 className="font-semibold text-t-primary mb-3">Changer le mot de passe</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-surface-hover border border-b rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder:text-t-faint focus:outline-none focus:border-accent transition"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface-hover border border-b rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder:text-t-faint focus:outline-none focus:border-accent transition"
            />
            <input
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-surface-hover border border-b rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder:text-t-faint focus:outline-none focus:border-accent transition"
            />
            {pwMessage && (
              <p className={`text-sm ${pwMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {pwMessage.text}
              </p>
            )}
            <Button type="submit" loading={pwLoading} disabled={pwLoading} className="w-full">
              Modifier le mot de passe
            </Button>
          </form>
        </div>

        {/* ========== NOTIFICATIONS ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Notifications</h2>

        {/* Sons */}
        <div className="card card-glow p-5">
          <h3 className="font-semibold text-t-primary mb-4">Sons</h3>
          <div className="space-y-3">
            {NOTIF_SOUND_KEYS.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-t-primary">{icon} {label}</span>
                <Toggle enabled={!!soundPrefs[key]} onToggle={() => toggleSound(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Types de notifs dans la cloche */}
        <div className="card card-glow p-5">
          <h3 className="font-semibold text-t-primary mb-4">Notifications (cloche)</h3>
          <div className="space-y-3">
            {NOTIF_BELL_KEYS.map(({ key, label, icon }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-t-primary">{icon} {label}</span>
                <Toggle enabled={!!bellPrefs[key]} onToggle={() => toggleBell(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Ne pas déranger */}
        <div className="card card-glow p-5">
          <h3 className="font-semibold text-t-primary mb-4">Ne pas déranger</h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-t-primary">Activer</span>
            <Toggle enabled={dnd.enabled} onToggle={() => updateDnd({ enabled: !dnd.enabled })} />
          </div>
          {dnd.enabled && (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-t-faint mb-1 block">De</label>
                <input
                  type="time"
                  value={dnd.start}
                  onChange={(e) => updateDnd({ start: e.target.value })}
                  className="w-full bg-surface-hover border border-b rounded-lg px-3 py-2 text-sm text-t-primary focus:outline-none focus:border-accent transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-t-faint mb-1 block">À</label>
                <input
                  type="time"
                  value={dnd.end}
                  onChange={(e) => updateDnd({ end: e.target.value })}
                  className="w-full bg-surface-hover border border-b rounded-lg px-3 py-2 text-sm text-t-primary focus:outline-none focus:border-accent transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* ========== COLOCATION ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Colocations</h2>

        <div className="card card-glow p-5">
          {colocs.length === 0 ? (
            <p className="text-sm text-t-faint">Aucune colocation</p>
          ) : (
            <div className="space-y-3">
              {colocs.map((coloc) => (
                <div key={coloc.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-t-primary">{coloc.name}</p>
                    <p className="text-xs text-t-faint">{coloc.role === 'admin' ? 'Admin' : 'Membre'}</p>
                  </div>
                  <button
                    onClick={() => handleLeave(coloc.id)}
                    disabled={leavingId === coloc.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
                      leaveConfirm === coloc.id
                        ? 'bg-red-500 text-white'
                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    {leavingId === coloc.id
                      ? '...'
                      : leaveConfirm === coloc.id
                        ? 'Confirmer ?'
                        : 'Quitter'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========== PRÉFÉRENCES DE TÂCHES ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Préférences de tâches</h2>

        <MyAffinities colocs={colocs.map((c) => ({ id: c.id, name: c.name }))} />

        {/* ========== SPOTIFY ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Spotify</h2>

        <SpotifyLink />

        {/* ========== CONFIDENTIALITÉ ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Confidentialité</h2>

        <div className="card card-glow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-t-primary">Masquer mes stats</p>
              <p className="text-xs text-t-faint">XP, streak et niveau cachés aux autres</p>
            </div>
            <Toggle enabled={privacy.hideStats} onToggle={() => togglePrivacy('hideStats')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-t-primary">Masquer mon statut en ligne</p>
              <p className="text-xs text-t-faint">Les autres ne voient pas quand tu es connecté</p>
            </div>
            <Toggle enabled={privacy.hideOnline} onToggle={() => togglePrivacy('hideOnline')} />
          </div>
        </div>

        {/* ========== DONNÉES ========== */}
        <h2 className="text-xs font-bold text-t-faint uppercase tracking-wider pt-2">Données</h2>

        <div className="card card-glow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-t-primary">Exporter mes données</p>
              <p className="text-xs text-t-faint">Télécharger toutes tes données (JSON)</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleExport} loading={exporting} disabled={exporting}>
              Exporter
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-t-primary">Vider le cache local</p>
              <p className="text-xs text-t-faint">Supprime les préférences locales</p>
            </div>
            <Button size="sm" variant="outline" onClick={clearCache}>
              {cacheCleared ? 'Fait !' : 'Vider'}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-t-primary">Réinitialiser les notifications</p>
              <p className="text-xs text-t-faint">Remet les préférences par défaut</p>
            </div>
            <Button size="sm" variant="outline" onClick={resetNotifPrefs}>
              Reset
            </Button>
          </div>
        </div>

        {/* ========== ZONE DANGER ========== */}
        <h2 className="text-xs font-bold text-red-500 uppercase tracking-wider pt-2">Zone danger</h2>

        {/* Déconnexion */}
        <div className="card p-5">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-center text-red-500 hover:text-red-400 font-medium text-sm transition"
          >
            Se déconnecter
          </button>
        </div>

        {/* Supprimer le compte */}
        <div className="card border-red-500/20 p-5">
          {deleteStep === 0 && (
            <button
              onClick={() => setDeleteStep(1)}
              className="w-full text-center text-red-500/60 hover:text-red-500 text-sm transition"
            >
              Supprimer mon compte
            </button>
          )}
          {deleteStep === 1 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-red-500 font-medium">
                Cette action est irréversible. Toutes tes données seront supprimées.
              </p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={() => setDeleteStep(0)}>
                  Annuler
                </Button>
                <button
                  onClick={() => setDeleteStep(2)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                >
                  Continuer
                </button>
              </div>
            </div>
          )}
          {deleteStep === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-red-500">
                Tape <span className="font-mono font-bold">SUPPRIMER</span> pour confirmer
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full bg-surface-hover border border-red-500/30 rounded-lg px-4 py-2.5 text-sm text-t-primary placeholder:text-t-faint focus:outline-none focus:border-red-500 transition"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDeleteStep(0); setDeleteInput('') }} className="flex-1">
                  Annuler
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== 'SUPPRIMER' || deleting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {deleting ? '...' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
