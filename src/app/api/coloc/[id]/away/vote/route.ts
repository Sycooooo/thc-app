import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notify, notifyColoc } from '@/lib/notifications'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const { targetId, approved } = await request.json()

  if (!targetId || typeof approved !== 'boolean') {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  if (targetId === session.user.id) {
    return NextResponse.json({ error: 'Tu ne peux pas voter pour toi-même' }, { status: 400 })
  }

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Enregistrer le vote (upsert)
  await prisma.awayVote.upsert({
    where: { voterId_targetId_colocId: { voterId: session.user.id, targetId, colocId } },
    update: { approved },
    create: { voterId: session.user.id, targetId, colocId, approved },
  })

  // Compter les votes
  const allMembers = await prisma.userColoc.findMany({
    where: { colocId, userId: { not: targetId } },
    select: { userId: true },
  })

  const votes = await prisma.awayVote.findMany({
    where: { targetId, colocId },
  })

  const allApproved = allMembers.length > 0 &&
    allMembers.every((m) => votes.some((v) => v.voterId === m.userId && v.approved))

  const anyRejected = votes.some((v) => !v.approved)

  if (anyRejected) {
    // Nettoyer les votes et notifier le demandeur
    await prisma.awayVote.deleteMany({ where: { targetId, colocId } })
    await notify(targetId, colocId, 'away_rejected', 'Ta demande de vacances a été refusée.')
    return NextResponse.json({ success: true, result: 'rejected' })
  }

  if (allApproved) {
    // Activer le mode away
    await prisma.userColoc.update({
      where: { userId_colocId: { userId: targetId, colocId } },
      data: { isAway: true, awayConfirmed: true, awayStartDate: new Date() },
    })

    // Nettoyer les votes
    await prisma.awayVote.deleteMany({ where: { targetId, colocId } })

    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { username: true },
    })

    await notifyColoc(
      colocId,
      targetId,
      'away_approved',
      `${targetUser?.username ?? 'Un membre'} est maintenant en vacances !`,
      `/coloc/${colocId}`
    )
    await notify(targetId, colocId, 'away_approved', 'Ta demande de vacances a été acceptée ! Bonnes vacances !')

    return NextResponse.json({ success: true, result: 'approved' })
  }

  return NextResponse.json({
    success: true,
    result: 'pending',
    votesReceived: votes.length,
    votesNeeded: allMembers.length,
  })
}
