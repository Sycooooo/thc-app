'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type Story = {
  id: string
  trackName: string
  artistName: string
  albumArt: string
  spotifyUrl: string
  caption: string | null
  reactions: Record<string, string[]>
  createdAt: string
  user: { id: string; username: string; avatar: string | null }
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function StoryHistory({ colocId }: { colocId: string }) {
  const [stories, setStories] = useState<Story[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [open, setOpen] = useState(false)

  async function load(cursor?: string) {
    const url = `/api/coloc/${colocId}/music/stories/history${cursor ? `?cursor=${cursor}` : ''}`
    const data = await api.get(url)
    return data as { stories: Story[]; nextCursor: string | null }
  }

  useEffect(() => {
    load().then((data) => {
      setStories(data.stories)
      setNextCursor(data.nextCursor)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [colocId])

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await load(nextCursor)
      setStories((prev) => [...prev, ...data.stories])
      setNextCursor(data.nextCursor)
    } catch { /* ignore */ }
    setLoadingMore(false)
  }

  if (loading) return null
  if (stories.length === 0) return null

  return (
    <div className="card card-glow p-5 space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <h3 className="font-semibold text-t-primary">Historique des stories</h3>
        <span className="text-t-muted text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="space-y-2">
          {stories.map((story) => {
            const topReaction = Object.entries(story.reactions || {})
              .sort((a, b) => (b[1]?.length || 0) - (a[1]?.length || 0))
              .find(([, users]) => users?.length > 0)

            return (
              <a
                key={story.id}
                href={story.spotifyUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover transition"
              >
                {story.albumArt ? (
                  <img src={story.albumArt} alt="" className="w-11 h-11 rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center text-lg flex-shrink-0">🎵</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-t-primary truncate">{story.trackName}</p>
                  <p className="text-xs text-t-muted truncate">{story.artistName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-t-faint">{story.user.username} · {timeAgo(story.createdAt)}</span>
                    {story.caption && <span className="text-[10px] text-t-faint italic truncate max-w-[120px]">&ldquo;{story.caption}&rdquo;</span>}
                    {topReaction && <span className="text-[10px]">{topReaction[0]} {topReaction[1].length}</span>}
                  </div>
                </div>
              </a>
            )
          })}

          {nextCursor && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2 text-sm text-accent hover:text-accent-hover transition cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? '...' : 'Voir plus'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
