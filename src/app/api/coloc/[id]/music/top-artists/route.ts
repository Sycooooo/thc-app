import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken, getTopArtists } from '@/lib/spotify'

export async function GET(
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

  // Recuperer les membres avec Spotify lie
  const members = await prisma.userColoc.findMany({
    where: { colocId },
    include: {
      user: {
        select: { id: true, username: true, avatar: true, spotifyAccount: { select: { id: true } } },
      },
    },
  })

  const results = await Promise.all(
    members.map(async (m) => {
      if (!m.user.spotifyAccount) {
        return { userId: m.user.id, username: m.user.username, avatar: m.user.avatar, artists: [] }
      }
      try {
        const token = await getValidToken(m.user.id)
        const artists = await getTopArtists(token, 'short_term', 5)
        return { userId: m.user.id, username: m.user.username, avatar: m.user.avatar, artists }
      } catch (err) {
        console.error(`Erreur top-artists pour ${m.user.username}:`, err)
        return { userId: m.user.id, username: m.user.username, avatar: m.user.avatar, artists: [] }
      }
    })
  )

  return NextResponse.json(results)
}
