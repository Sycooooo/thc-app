'use client'

import { useState, useRef } from 'react'
import { api } from '@/lib/api'

type RoundData = {
  roundId: string
  previewUrl: string
  choices: string[]
}

type AnswerResult = {
  correct: boolean
  trackName: string
  artistName: string
  xpEarned: number
  coinsEarned: number
}

export default function BlindTest({ colocId, hasSpotify }: { colocId: string; hasSpotify: boolean }) {
  const [round, setRound] = useState<RoundData | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [answering, setAnswering] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function startRound() {
    setLoading(true)
    setResult(null)
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    try {
      const data = await api.post(`/api/coloc/${colocId}/music/blind-test/start`)
      setRound(data)
      // Jouer l'extrait
      const audio = new Audio(data.previewUrl)
      audio.volume = 0.5
      audio.play()
      audio.onended = () => setPlaying(false)
      audioRef.current = audio
      setPlaying(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur'
      alert(msg.includes('Pas assez') ? 'Pas assez de sons pour un blind test. Partagez plus de stories !' : msg)
    }
    setLoading(false)
  }

  async function submitAnswer(answer: string) {
    if (!round) return
    setAnswering(answer)
    try {
      const data = await api.post(`/api/coloc/${colocId}/music/blind-test/answer`, {
        roundId: round.roundId,
        answer,
      })
      setResult(data)
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlaying(false) }
    } catch { alert('Erreur') }
    setAnswering(null)
  }

  function toggleAudio() {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  if (!hasSpotify) return null

  return (
    <div className="card card-glow p-5 space-y-4">
      <h3 className="font-semibold text-t-primary">Blind Test</h3>

      {!round && !result && (
        <div className="text-center py-4">
          <p className="text-sm text-t-muted mb-4">Devine le titre du morceau et gagne de l&apos;XP !</p>
          <button
            onClick={startRound}
            disabled={loading}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-full font-bold text-sm transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Chargement...' : 'Lancer un Blind Test'}
          </button>
        </div>
      )}

      {round && !result && (
        <div className="space-y-4">
          {/* Player */}
          <div className="flex items-center justify-center gap-3 py-4">
            <button
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white text-2xl shadow-lg hover:bg-accent-hover transition cursor-pointer"
            >
              {playing ? '⏸' : '▶'}
            </button>
            <p className="text-sm text-t-muted">Ecoute l&apos;extrait...</p>
          </div>

          {/* Choix */}
          <div className="grid grid-cols-1 gap-2">
            {round.choices.map((choice) => (
              <button
                key={choice}
                onClick={() => submitAnswer(choice)}
                disabled={answering !== null}
                className="w-full px-4 py-3 text-left text-sm font-medium text-t-primary bg-surface-hover hover:bg-accent/10 hover:text-accent border border-b rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                {answering === choice ? '...' : choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className="text-center py-4 space-y-3">
          <div className={`text-4xl ${result.correct ? 'animate-bounce' : ''}`}>
            {result.correct ? '🎉' : '😅'}
          </div>
          <p className={`text-lg font-bold ${result.correct ? 'text-[#1DB954]' : 'text-danger'}`}>
            {result.correct ? 'Correct !' : 'Rate !'}
          </p>
          <p className="text-sm text-t-primary font-medium">{result.trackName}</p>
          <p className="text-xs text-t-muted">{result.artistName}</p>
          {result.correct && (
            <p className="text-sm font-bold text-accent">+{result.xpEarned} XP  +{result.coinsEarned} 🪙</p>
          )}
          <button
            onClick={startRound}
            disabled={loading}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-full font-bold text-sm transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? '...' : 'Suivant'}
          </button>
        </div>
      )}
    </div>
  )
}
