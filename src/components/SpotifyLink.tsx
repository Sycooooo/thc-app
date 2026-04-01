'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type SpotifyStatus = { linked: boolean; displayName?: string; profileUrl?: string }

export default function SpotifyLink() {
  const [status, setStatus] = useState<SpotifyStatus | null>(null)
  const [unlinking, setUnlinking] = useState(false)

  useEffect(() => {
    api.get('/api/spotify/status').then(setStatus).catch(() => setStatus({ linked: false }))
  }, [])

  async function unlink() {
    setUnlinking(true)
    try {
      await api.post('/api/spotify/unlink')
      setStatus({ linked: false })
    } catch {
      console.error('Erreur deconnexion Spotify')
    }
    setUnlinking(false)
  }

  if (!status) {
    return (
      <div className="card card-glow p-5">
        <p className="text-sm text-t-faint">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="card card-glow p-5">
      {!status.linked ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-t-primary">Connecte ton compte Spotify</p>
            <p className="text-xs text-t-muted mt-0.5">Pour partager ta musique avec tes colocs</p>
          </div>
          <a
            href="/api/spotify/authorize"
            className="flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full text-sm font-bold transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.88 5.82 15.78 6.12 20.1 8.82c.541.3.719 1.02.42 1.56-.299.421-1.02.599-1.439.3z"/></svg>
            Connecter
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.88 5.82 15.78 6.12 20.1 8.82c.541.3.719 1.02.42 1.56-.299.421-1.02.599-1.439.3z"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-t-primary">{status.displayName}</p>
              {status.profileUrl && (
                <a href={status.profileUrl} target="_blank" rel="noopener" className="text-xs text-[#1DB954] hover:underline">
                  Voir le profil Spotify
                </a>
              )}
            </div>
          </div>
          <button
            onClick={unlink}
            disabled={unlinking}
            className="text-xs text-danger hover:text-red-400 transition cursor-pointer disabled:opacity-50"
          >
            {unlinking ? '...' : 'Déconnecter'}
          </button>
        </div>
      )}
    </div>
  )
}
