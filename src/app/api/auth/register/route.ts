import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const result = registerSchema.safeParse(await request.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }
  const { username, password } = result.data

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists) {
    return NextResponse.json({ error: 'Identifiant déjà utilisé' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { username, password: hashed },
    select: { id: true, username: true },
  })

  return NextResponse.json(user, { status: 201 })
}
