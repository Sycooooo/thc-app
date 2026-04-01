import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — Récupérer les affinités de tous les membres
export async function GET(
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

  const affinities = await prisma.memberAffinity.findMany({
    where: { colocId },
  })

  return NextResponse.json(affinities)
}

// POST — Définir une affinité (upsert)
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

  const body = await request.json()
  const category = body.category
  const weight = body.weight
  // Si pas de userId fourni, on modifie ses propres affinités
  const userId = body.userId || session.user.id

  // Un membre ne peut modifier que ses propres affinités, l'admin peut tout modifier
  if (membership.role !== 'admin' && userId !== session.user.id) {
    return NextResponse.json({ error: 'Tu ne peux modifier que tes propres affinités' }, { status: 403 })
  }

  if (!category || weight === undefined) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // weight 0 = supprimer l'affinité
  if (weight === 0) {
    await prisma.memberAffinity.deleteMany({
      where: { userId, colocId, category },
    })
    return NextResponse.json({ success: true })
  }

  const affinity = await prisma.memberAffinity.upsert({
    where: { userId_colocId_category: { userId, colocId, category } },
    update: { weight },
    create: { userId, colocId, category, weight },
  })

  return NextResponse.json(affinity)
}
