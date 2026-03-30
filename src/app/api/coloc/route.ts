import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createColocSchema } from '@/lib/validations'

// Créer une colocation
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const result = createColocSchema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }
  const { name } = result.data

  const coloc = await prisma.colocation.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id,
          role: 'admin',
        },
      },
    },
    include: { members: { include: { user: true } } },
  })

  return NextResponse.json(coloc, { status: 201 })
}

// Lister les colocations de l'utilisateur
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const colocs = await prisma.colocation.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      members: { include: { user: { select: { id: true, username: true, avatar: true } } } },
    },
  })

  return NextResponse.json(colocs)
}
