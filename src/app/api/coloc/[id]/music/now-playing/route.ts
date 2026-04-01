import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken, getCurrentlyPlaying } from '@/lib/spotify'
import { pusher } from '@/lib/pusher'

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

  try {
    const token = await getValidToken(session.user.id)
    const track = await getCurrentlyPlaying(token)

    await pusher.trigger(`coloc-${colocId}`, 'music:now-playing', {
      userId: session.user.id,
      track,
    })

    return NextResponse.json({ track })
  } catch {
    return NextResponse.json({ track: null })
  }
}
