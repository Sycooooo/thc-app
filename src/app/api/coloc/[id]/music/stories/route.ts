import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

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

  const stories = await prisma.musicStory.findMany({
    where: { colocId, expiresAt: { gt: new Date() } },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(stories)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) return NextResponse.json({ error: 'Non autorise' }, { status: 403 })

  // Limite : 1 story active par user par coloc
  // On expire l'ancienne au lieu de la supprimer pour garder l'historique
  const existing = await prisma.musicStory.findFirst({
    where: { userId: session.user.id, colocId, expiresAt: { gt: new Date() } },
  })
  if (existing) {
    await prisma.musicStory.update({
      where: { id: existing.id },
      data: { expiresAt: new Date() },
    })
  }

  const { trackId, trackName, artistName, albumArt, spotifyUrl, caption } = await request.json()

  const story = await prisma.musicStory.create({
    data: {
      trackId,
      trackName,
      artistName,
      albumArt,
      spotifyUrl,
      caption: caption || null,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      userId: session.user.id,
      colocId,
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })

  await pusher.trigger(`coloc-${colocId}`, 'music:new-story', story)

  return NextResponse.json(story, { status: 201 })
}
