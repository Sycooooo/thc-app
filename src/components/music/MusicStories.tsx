'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { pusherClient } from '@/lib/pusher-client'
import StoryModal from './StoryModal'

type Story = {
  id: string
  trackId: string
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

type SearchTrack = {
  id: string
  name: string
  artist: string
  albumArt: string
  uri: string
  previewUrl: string | null
}

export default function MusicStories({
  colocId,
  currentUserId,
  hasSpotify,
}: {
  colocId: string
  currentUserId: string
  hasSpotify: boolean
}) {
  const [stories, setStories] = useState<Story[]>([])
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [caption, setCaption] = useState('')
  const [posting, setPosting] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<SearchTrack | null>(null)

  useEffect(() => {
    api.get(`/api/coloc/${colocId}/music/stories`).then(setStories).catch(() => {})
  }, [colocId])

  // Pusher real-time
  useEffect(() => {
    const channel = pusherClient.subscribe(`coloc-${colocId}`)
    channel.bind('music:new-story', (story: Story) => {
      setStories((prev) => [story, ...prev.filter((s) => s.userId !== story.userId)])
    })
    channel.bind('music:story-deleted', ({ storyId }: { storyId: string }) => {
      setStories((prev) => prev.filter((s) => s.id !== storyId))
    })
    return () => {
      channel.unbind('music:new-story')
      channel.unbind('music:story-deleted')
    }
  }, [colocId])

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const data = await api.get(`/api/coloc/${colocId}/music/search?q=${encodeURIComponent(q)}`)
      setResults(data)
    } catch { setResults([]) }
    setSearching(false)
  }

  async function postStory() {
    if (!selectedTrack) return
    setPosting(true)
    try {
      await api.post(`/api/coloc/${colocId}/music/stories`, {
        trackId: selectedTrack.id,
        trackName: selectedTrack.name,
        artistName: selectedTrack.artist,
        albumArt: selectedTrack.albumArt,
        spotifyUrl: `https://open.spotify.com/track/${selectedTrack.id}`,
        caption: caption.trim() || null,
      })
      setShowAdd(false)
      setSelectedTrack(null)
      setCaption('')
      setQuery('')
      setResults([])
    } catch { alert('Erreur lors du partage') }
    setPosting(false)
  }

  // Regrouper par user (1 story max par user)
  const uniqueStories = stories.reduce<Story[]>((acc, s) => {
    if (!acc.find((x) => x.userId === s.userId)) acc.push(s)
    return acc
  }, [])

  return (
    <div>
      {/* Cercles stories */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Bouton ajouter */}
        {hasSpotify && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center text-accent text-xl hover:border-accent transition">
              +
            </div>
            <span className="text-[10px] text-t-muted">Partager</span>
          </button>
        )}

        {uniqueStories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelectedStory(story)}
            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
          >
            <div
              className="w-16 h-16 rounded-full p-0.5"
              style={{ background: 'linear-gradient(135deg, #1DB954, #a855f7, #f97316)' }}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-bg">
                {story.albumArt ? (
                  <img src={story.albumArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                    {story.user.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-t-muted truncate max-w-[64px]">{story.user.username}</span>
          </button>
        ))}

        {uniqueStories.length === 0 && !hasSpotify && (
          <p className="text-sm text-t-faint py-4">Connecte Spotify dans tes paramètres pour partager un son.</p>
        )}
      </div>

      {/* Modal story */}
      {selectedStory && (
        <StoryModal
          story={selectedStory}
          currentUserId={currentUserId}
          colocId={colocId}
          onClose={() => setSelectedStory(null)}
        />
      )}

      {/* Modal ajouter */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-surface rounded-2xl border border-b w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-t-primary">Partager un son</h3>

            {!selectedTrack ? (
              <>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Rechercher un son..."
                  autoFocus
                  className="w-full px-4 py-2.5 text-sm border border-b rounded-lg text-t-primary bg-input-bg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                />
                {searching && <p className="text-xs text-t-faint">Recherche...</p>}
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {results.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition cursor-pointer text-left"
                    >
                      {track.albumArt && <img src={track.albumArt} alt="" className="w-10 h-10 rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-t-primary truncate">{track.name}</p>
                        <p className="text-xs text-t-muted truncate">{track.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 bg-surface-hover rounded-lg p-3">
                  {selectedTrack.albumArt && <img src={selectedTrack.albumArt} alt="" className="w-12 h-12 rounded" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-t-primary truncate">{selectedTrack.name}</p>
                    <p className="text-xs text-t-muted truncate">{selectedTrack.artist}</p>
                  </div>
                  <button onClick={() => setSelectedTrack(null)} className="text-t-faint hover:text-t-primary text-sm cursor-pointer">✕</button>
                </div>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ajoute un commentaire (optionnel)"
                  maxLength={100}
                  className="w-full px-4 py-2.5 text-sm border border-b rounded-lg text-t-primary bg-input-bg focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
                />
                <button
                  onClick={postStory}
                  disabled={posting}
                  className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg font-bold text-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {posting ? 'Publication...' : 'Publier la story'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
