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

  const coloc = await prisma.colocation.findUnique({ where: { inviteCode } })
  if (!coloc) {
    return NextResponse.json({ error: 'Code invalide' }, { status: 404 })
  }

  const existing = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId: coloc.id } },
  })

  if (existing) {
    return NextResponse.json({ error: 'Déjà membre' }, { status: 400 })
  }

  await prisma.userColoc.create({
    data: { userId: session.user.id, colocId: coloc.id },
  })

  return NextResponse.json(coloc)
}
