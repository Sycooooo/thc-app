import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pusher } from '@/lib/pusher'

const ALLOWED_EMOJIS = ['🔥', '❤️', '😐']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; storyId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId, storyId } = await params
  const { emoji } = await request.json()

  if (!ALLOWED_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: 'Emoji invalide' }, { status: 400 })
  }

  const story = await prisma.musicStory.findUnique({ where: { id: storyId } })
  if (!story || story.colocId !== colocId) {
    return NextResponse.json({ error: 'Story introuvable' }, { status: 404 })
  }

  const userId = session.user!.id
  const reactions = (story.reactions as Record<string, string[]>) || {}
  const users = reactions[emoji] || []

  if (users.includes(userId)) {
    // Retirer la reaction
    reactions[emoji] = users.filter((id) => id !== userId)
    if (reactions[emoji].length === 0) delete reactions[emoji]
  } else {
    // Ajouter la reaction
    reactions[emoji] = [...users, userId]
  }

  await prisma.musicStory.update({
    where: { id: storyId },
    data: { reactions },
  })

  await pusher.trigger(`coloc-${colocId}`, 'music:story-reacted', { storyId, reactions })

  return NextResponse.json({ reactions })
}
