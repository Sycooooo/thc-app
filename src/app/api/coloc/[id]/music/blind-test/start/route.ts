import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) return NextResponse.json({ error: 'Non autorise' }, { status: 403 })

  // Collecter les tracks depuis les stories des 30 derniers jours
  type TrackCandidate = { trackId: string; trackName: string; artistName: string; sharedById: string }

  const recentStories = await prisma.musicStory.findMany({
    where: { colocId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    select: { trackId: true, trackName: true, artistName: true, userId: true },
  })

  // Dédupliquer par trackId
  const seen = new Set<string>()
  const candidates: TrackCandidate[] = []
  for (const s of recentStories) {
    if (!seen.has(s.trackId)) {
      seen.add(s.trackId)
      candidates.push({
        trackId: s.trackId,
        trackName: s.trackName,
        artistName: s.artistName,
        sharedById: s.userId,
      })
    }
  }

  if (candidates.length < 4) {
    return NextResponse.json({ error: 'Pas assez de stories pour un blind test (minimum 4)' }, { status: 400 })
  }

  // Pioche random
  const idx = Math.floor(Math.random() * candidates.length)
  const chosen = candidates[idx]

  // Creer le round
  const round = await prisma.blindTestRound.create({
    data: {
      colocId,
      trackId: chosen.trackId,
      trackName: chosen.trackName,
      artistName: chosen.artistName,
      previewUrl: `https://open.spotify.com/track/${chosen.trackId}`,
      sharedById: chosen.sharedById,
    },
  })

  // Generer 4 choix (le bon + 3 faux)
  const wrongChoices = candidates
    .filter((c) => c.trackId !== chosen.trackId)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((c) => c.trackName)

  const choices = [chosen.trackName, ...wrongChoices].sort(() => Math.random() - 0.5)

  return NextResponse.json({
    roundId: round.id,
    trackId: chosen.trackId,
    choices,
  })
}
