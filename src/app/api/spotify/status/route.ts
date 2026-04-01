import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  const account = await prisma.spotifyAccount.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true, profileUrl: true, spotifyUserId: true },
  })

  if (!account) {
    return NextResponse.json({ linked: false })
  }

  return NextResponse.json({
    linked: true,
    displayName: account.displayName,
    profileUrl: account.profileUrl,
  })
}
