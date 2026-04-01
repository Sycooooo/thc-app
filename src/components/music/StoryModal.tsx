'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { pusherClient } from '@/lib/pusher-client'

type Story = {
  id: string
  trackName: string
  artistName: string
  albumArt: string
  spotifyUrl: string
  caption: string | null
  reactions: Record<string, string[]>
  createdAt: string
  expiresAt: string
  userId: string
  user: { id: string; username: string; avatar: string | null }
}

const REACTION_EMOJIS = ['🔥', '❤️', '😐']

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expiree'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h${m.toString().padStart(2, '0')} restantes`
}

export default function StoryModal({
  story,
  currentUserId,
  colocId,
  onClose,
}: {
  story: Story
  currentUserId: string
  colocId: string
  onClose: () => void
}) {
  const [reactions, setReactions] = useState<Record<string, string[]>>(story.reactions || {})
  const [reacting, setReacting] = useState(false)

  // Pusher temps reel
  useEffect(() => {
    const channel = pusherClient.subscribe(`coloc-${colocId}`)
    channel.bind('music:story-reacted', (data: { storyId: string; reactions: Record<string, string[]> }) => {
      if (data.storyId === story.id) setReactions(data.reactions)
    })
    return () => { channel.unbind('music:story-reacted') }
  }, [colocId, story.id])

  async function toggleReaction(emoji: string) {
    setReacting(true)
    try {
      const data = await api.post(`/api/coloc/${colocId}/music/stories/${story.id}/react`, { emoji })
      setReactions(data.reactions)
    } catch { /* ignore */ }
    setReacting(false)
  }

  async function deleteStory() {
    try {
      await api.delete(`/api/coloc/${colocId}/music/stories/${story.id}`)
      onClose()
    } catch {
      alert('Erreur suppression')
    }
  }

  const total = new Date(story.expiresAt).getTime() - new Date(story.createdAt).getTime()
  const elapsed = Date.now() - new Date(story.createdAt).getTime()
  const progress = Math.min(100, Math.max(0, (elapsed / total) * 100))

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barre progression en haut */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div className="h-full bg-white/60 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              {story.user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white drop-shadow">{story.user.username}</p>
              <p className="text-[10px] text-white/60">{timeLeft(story.expiresAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl cursor-pointer">✕</button>
        </div>

        {/* Pochette */}
        <div className="aspect-square bg-black">
          {story.albumArt ? (
            <img src={story.albumArt} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🎵</div>
          )}
        </div>

        {/* Infos */}
        <div className="bg-surface p-5 space-y-3">
          <div>
            <p className="font-bold text-t-primary text-lg">{story.trackName}</p>
            <p className="text-sm text-t-muted">{story.artistName}</p>
          </div>

          {story.caption && (
            <p className="text-sm text-t-primary italic">&ldquo;{story.caption}&rdquo;</p>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-2">
            {REACTION_EMOJIS.map((emoji) => {
              const users = reactions[emoji] || []
              const hasReacted = users.includes(currentUserId)
              return (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  disabled={reacting}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition cursor-pointer disabled:opacity-50 ${
                    hasReacted
                      ? 'bg-accent/20 border border-accent/40'
                      : 'bg-surface-hover hover:bg-surface border border-transparent'
                  }`}
                >
                  <span>{emoji}</span>
                  {users.length > 0 && <span className="text-xs text-t-muted">{users.length}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={story.spotifyUrl}
              target="_blank"
              rel="noopener"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-full font-bold text-sm transition"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381C8.88 5.82 15.78 6.12 20.1 8.82c.541.3.719 1.02.42 1.56-.299.421-1.02.599-1.439.3z"/></svg>
              Ecouter sur Spotify
            </a>

            {story.userId === currentUserId && (
              <button
                onClick={deleteStory}
                className="px-4 py-2.5 bg-red-500/10 text-red-500 rounded-full text-sm font-medium hover:bg-red-500/20 transition cursor-pointer"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
