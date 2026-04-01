import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const userId = session.user.id

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId, colocId } },
  })

  if (!membership) {
    return NextResponse.json({ error: 'Tu ne fais pas partie de cette coloc' }, { status: 404 })
  }

  // Compter les membres restants
  const memberCount = await prisma.userColoc.count({ where: { colocId } })

  if (memberCount === 1) {
    // Dernier membre : supprimer la coloc entièrement
    await prisma.colocation.delete({ where: { id: colocId } })
    return NextResponse.json({ success: true, deleted: true })
  }

  // Si l'utilisateur est admin, transférer le rôle au membre le plus ancien
  if (membership.role === 'admin') {
    const nextAdmin = await prisma.userColoc.findFirst({
      where: { colocId, userId: { not: userId } },
      orderBy: { joinedAt: 'asc' },
    })
    if (nextAdmin) {
      await prisma.userColoc.update({
        where: { id: nextAdmin.id },
        data: { role: 'admin' },
      })
    }
  }

  // Supprimer le membership + le score associé
  await prisma.userColoc.delete({
    where: { userId_colocId: { userId, colocId } },
  })
  await prisma.score.deleteMany({ where: { userId, colocId } })

  return NextResponse.json({ success: true })
}
