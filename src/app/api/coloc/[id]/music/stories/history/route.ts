import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const take = 20

  const stories = await prisma.musicStory.findMany({
    where: { colocId, expiresAt: { lte: new Date() } },
    include: { user: { select: { id: true, username: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = stories.length > take
  if (hasMore) stories.pop()

  return NextResponse.json({
    stories,
    nextCursor: hasMore ? stories[stories.length - 1].id : null,
  })
}
