import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3, '3 caractères minimum').max(20, '20 caractères maximum'),
})

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const result = schema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { username } = result.data

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing && existing.id !== session.user.id) {
    return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username },
  })

  return NextResponse.json({ success: true, username })
}
