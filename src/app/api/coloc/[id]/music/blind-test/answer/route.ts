import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const BLIND_TEST_XP = 30
const BLIND_TEST_COINS = 3

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId } = await params
  const { roundId, answer } = await request.json()

  const round = await prisma.blindTestRound.findUnique({ where: { id: roundId } })
  if (!round || round.colocId !== colocId) {
    return NextResponse.json({ error: 'Round introuvable' }, { status: 404 })
  }

  const correct = answer === round.trackName

  if (correct) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: BLIND_TEST_XP },
        currency: { increment: BLIND_TEST_COINS },
      },
    })
  }

  return NextResponse.json({
    correct,
    trackName: round.trackName,
    artistName: round.artistName,
    xpEarned: correct ? BLIND_TEST_XP : 0,
    coinsEarned: correct ? BLIND_TEST_COINS : 0,
  })
}
