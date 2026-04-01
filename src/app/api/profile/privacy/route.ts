import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { hideStats: true, hideOnline: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const data: Record<string, boolean> = {}

  if (typeof body.hideStats === 'boolean') data.hideStats = body.hideStats
  if (typeof body.hideOnline === 'boolean') data.hideOnline = body.hideOnline

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  })

  return NextResponse.json({ success: true })
}
