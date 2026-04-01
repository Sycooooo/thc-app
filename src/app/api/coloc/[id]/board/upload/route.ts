import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'
import { notifyColoc } from '@/lib/notifications'
import { pusher } from '@/lib/pusher'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('image') as File
  const color = (formData.get('color') as string) || 'yellow'
  const size = (formData.get('size') as string) || 'normal'
  const content = (formData.get('content') as string) || ''

  if (!file) {
    return NextResponse.json({ error: 'Image manquante' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image trop grande (max 5Mo)' }, { status: 400 })
  }

  // Save file
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(
    path.join(process.cwd(), 'public', 'board-images', filename),
    buffer
  )

  const imageUrl = `/board-images/${filename}`

  // Calculate next position
  const maxPos = await prisma.boardItem.aggregate({
    where: { colocId },
    _max: { position: true },
  })
  const nextPosition = (maxPos._max.position ?? -1) + 1

  const item = await prisma.boardItem.create({
    data: {
      content: content.trim() || file.name,
      type: 'image',
      color,
      size,
      imageUrl,
      position: nextPosition,
      colocId,
      createdById: session.user.id,
    },
    include: { createdBy: { select: { id: true, username: true } } },
  })

  await pusher.trigger(`coloc-${colocId}`, 'new-board-item', item)

  await notifyColoc(
    colocId,
    session.user.id,
    'new_board_item',
    `${item.createdBy.username} a ajouté une image sur le tableau`,
    `/coloc/${colocId}/board`
  )

  return NextResponse.json(item, { status: 201 })
}
