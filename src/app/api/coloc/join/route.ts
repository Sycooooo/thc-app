import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { joinColocSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const result = joinColocSchema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }
  const { inviteCode } = result.data

  // Contrainte single coloc : vérifier que l'utilisateur n'est membre d'aucune colocation
  const existingMembership = await prisma.userColoc.findFirst({
    where: { userId: session.user.id },
  })
  if (existingMembership) {
    return NextResponse.json({ error: 'Tu fais déjà partie d\'une colocation' }, { status: 403 })
  }

  const coloc = await prisma.colocation.findUnique({ where: { inviteCode } })
  if (!coloc) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 404 })
  }

  await prisma.userColoc.create({
    data: { userId: session.user.id, colocId: coloc.id },
  })

  return NextResponse.json(coloc)
}
