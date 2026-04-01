import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId, storyId } = await params

  const story = await prisma.musicStory.findUnique({ where: { id: storyId } })
  if (!story || story.colocId !== colocId) {
    return NextResponse.json({ error: 'Story introuvable' }, { status: 404 })
  }
  if (story.userId !== session.user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  await prisma.musicStory.delete({ where: { id: storyId } })
  await pusher.trigger(`coloc-${colocId}`, 'music:story-deleted', { storyId })

  return NextResponse.json({ success: true })
}
