'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { pusherClient } from '@/lib/pusher-client'

type NowPlayingData = {
  trackName: string
  artistName: string
  albumArt: string
  spotifyUrl: string
  isPlaying: boolean
  progressMs: number
  durationMs: number
}

type MemberInfo = { id: string; username: string; hasSpotify: boolean }
type ListeningState = Record<string, NowPlayingData | null>

export default function NowPlaying({
  colocId,
  currentUserId,
  members,
  hasSpotify,
}: {
  colocId: string
  currentUserId: string
  members: MemberInfo[]
  hasSpotify: boolean
}) {
  const [listening, setListening] = useState<ListeningState>({})
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  // Broadcast son propre statut toutes les 15s
  useEffect(() => {
    if (!hasSpotify) return

    async function broadcast() {
      try {
        const data = await api.post(`/api/coloc/${colocId}/music/now-playing`)
        setListening((prev) => ({ ...prev, [currentUserId]: data.track }))
      } catch { /* ignore */ }
    }

    broadcast()
    intervalRef.current = setInterval(broadcast, 15000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [colocId, currentUserId, hasSpotify])

  // Ecouter les autres via Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`coloc-${colocId}`)
    channel.bind('music:now-playing', (data: { userId: string; track: NowPlayingData | null }) => {
      setListening((prev) => ({ ...prev, [data.userId]: data.track }))
    })
    return () => { channel.unbind('music:now-playing') }
  }, [colocId])

  const activeListeners = members.filter((m) => listening[m.id]?.isPlaying)

  if (activeListeners.length === 0) return null

  return (
    <div className="card card-glow p-5 space-y-3">
      <h3 className="font-semibold text-t-primary flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1DB954]" />
        </span>
        En ecoute
      </h3>

      <div className="space-y-2">
        {activeListeners.map((member) => {
          const track = listening[member.id]!
          const progress = track.durationMs > 0 ? (track.progressMs / track.durationMs) * 100 : 0

          return (
            <a
              key={member.id}
              href={track.spotifyUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition"
            >
              {track.albumArt && (
                <img src={track.albumArt} alt="" className="w-10 h-10 rounded shadow" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#1DB954] font-medium">{member.username}</span>
                </div>
                <p className="text-sm font-medium text-t-primary truncate">{track.trackName}</p>
                <p className="text-xs text-t-muted truncate">{track.artistName}</p>
                <div className="mt-1 h-1 rounded-full bg-surface-hover overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1DB954] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
