'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type Artist = {
  id: string
  name: string
  imageUrl: string
  genres: string[]
  spotifyUrl: string
}

type MemberArtists = {
  userId: string
  username: string
  avatar: string | null
  artists: Artist[]
}

export default function TopArtists({ colocId }: { colocId: string }) {
  const [data, setData] = useState<MemberArtists[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    api.get(`/api/coloc/${colocId}/music/top-artists`)
      .then((d: MemberArtists[]) => {
        setData(d)
        // Selectionner le premier avec des artistes
        const first = d.find((m) => m.artists.length > 0)
        if (first) setSelected(first.userId)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [colocId])

  if (loading) return <div className="card card-glow p-5"><p className="text-sm text-t-faint">Chargement des artistes...</p></div>

  const membersWithArtists = data.filter((m) => m.artists.length > 0)
  if (membersWithArtists.length === 0) {
    return (
      <div className="card card-glow p-5">
        <h3 className="font-semibold text-t-primary mb-2">Top Artistes</h3>
        <p className="text-sm text-t-faint">Aucun membre n&apos;a connecte Spotify pour l&apos;instant.</p>
      </div>
    )
  }

  const current = data.find((m) => m.userId === selected)

  return (
    <div className="card card-glow p-5 space-y-4">
      <h3 className="font-semibold text-t-primary">Top Artistes du moment</h3>

      {/* Tabs membres */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {membersWithArtists.map((m) => (
          <button
            key={m.userId}
            onClick={() => setSelected(m.userId)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
              selected === m.userId
                ? 'bg-[#1DB954] text-white'
                : 'bg-surface-hover text-t-muted hover:text-t-primary'
            }`}
          >
            {m.username}
          </button>
        ))}
      </div>

      {/* Artistes du membre selectionne */}
      {current && (
        <div className="space-y-2">
          {current.artists.map((artist, i) => (
            <a
              key={artist.id}
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-hover transition"
            >
              <span className="text-sm font-bold text-t-faint w-5 text-center">{i + 1}</span>
              {artist.imageUrl ? (
                <img src={artist.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm">🎤</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-t-primary">{artist.name}</p>
                {artist.genres.length > 0 && (
                  <p className="text-xs text-t-muted truncate">{artist.genres.join(', ')}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
