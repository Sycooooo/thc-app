import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyColoc } from '@/lib/notifications'

export async function POST(
  _request: Request,
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

  if (membership.isAway) {
    return NextResponse.json({ error: 'Déjà en mode vacances' }, { status: 400 })
  }

  // Supprimer d'éventuels anciens votes
  await prisma.awayVote.deleteMany({
    where: { targetId: session.user.id, colocId },
  })

  // Récupérer les autres membres pour vérifier si on est seul
  const otherMembers = await prisma.userColoc.findMany({
    where: { colocId, userId: { not: session.user.id } },
    select: { userId: true },
  })

  // Si seul dans la coloc, activer directement
  if (otherMembers.length === 0) {
    await prisma.userColoc.update({
      where: { userId_colocId: { userId: session.user.id, colocId } },
      data: { isAway: true, awayConfirmed: true, awayStartDate: new Date() },
    })
    return NextResponse.json({ success: true, autoApproved: true })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  await notifyColoc(
    colocId,
    session.user.id,
    'away_request',
    `${user?.username ?? 'Un membre'} demande le mode vacances. Votez !`,
    `/coloc/${colocId}`
  )

  return NextResponse.json({ success: true, pendingVotes: otherMembers.length })
}
