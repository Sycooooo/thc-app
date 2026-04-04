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

  if (!membership.isAway) {
    return NextResponse.json({ error: 'Tu n\'es pas en mode vacances' }, { status: 400 })
  }

  await prisma.userColoc.update({
    where: { userId_colocId: { userId: session.user.id, colocId } },
    data: { isAway: false, awayConfirmed: false, awayStartDate: null },
  })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  await notifyColoc(
    colocId,
    session.user.id,
    'away_return',
    `${user?.username ?? 'Un membre'} est de retour de vacances !`,
    `/coloc/${colocId}`
  )

  return NextResponse.json({ success: true })
}
