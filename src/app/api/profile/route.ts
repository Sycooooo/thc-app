import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — Exporter toutes les données de l'utilisateur
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      avatar: true,
      xp: true,
      currency: true,
      currentStreak: true,
      longestStreak: true,
      hideStats: true,
      hideOnline: true,
      createdAt: true,
      avatarConfig: true,
      memberships: {
        include: { coloc: { select: { id: true, name: true } } },
      },
      completedTasks: {
        include: { task: { select: { title: true, difficulty: true, category: true } } },
      },
      achievements: {
        include: { achievement: { select: { name: true, icon: true, description: true } } },
      },
      messages: {
        select: { content: true, type: true, createdAt: true, colocId: true },
        orderBy: { createdAt: 'desc' },
      },
      paidExpenses: {
        select: { amount: true, description: true, category: true, createdAt: true },
      },
      scores: {
        include: { coloc: { select: { name: true } } },
      },
      items: {
        include: { item: { select: { name: true, type: true, rarity: true } } },
      },
      notifications: {
        select: { type: true, message: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
  }

  return new NextResponse(JSON.stringify(user, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="export-${user.username}-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}

// DELETE — Supprimer le compte
export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  if (body.confirmation !== 'SUPPRIMER') {
    return NextResponse.json({ error: 'Confirmation requise' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: session.user.id } })

  return NextResponse.json({ success: true })
}
