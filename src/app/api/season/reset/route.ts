import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRankFromPoints, softResetPoints, SEASON_REWARDS } from '@/lib/ranking'

// POST /api/season/reset
// Déclenché par un cron job tous les 60 jours.
// Protégé par un secret dans le header Authorization.
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SEASON_RESET_SECRET || 'season-reset-secret'

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, rankPoints: true, seasonNumber: true },
  })

  const results = []

  for (const user of users) {
    const rank = getRankFromPoints(user.rankPoints)
    const reward = SEASON_REWARDS[rank.tier]

    // Sauvegarder le résultat de la saison
    await prisma.seasonRecord.upsert({
      where: {
        userId_seasonNumber: {
          userId: user.id,
          seasonNumber: user.seasonNumber,
        },
      },
      update: {
        finalRank: rank.key,
        finalPoints: user.rankPoints,
        rewardType: reward?.type || null,
      },
      create: {
        userId: user.id,
        seasonNumber: user.seasonNumber,
        finalRank: rank.key,
        finalPoints: user.rankPoints,
        rewardType: reward?.type || null,
      },
    })

    // Donner les coins de récompense
    if (reward && reward.coins > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currency: { increment: reward.coins } },
      })
    }

    // Soft reset : réduire de 60% et passer à la saison suivante
    const newPoints = softResetPoints(user.rankPoints)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        rankPoints: newPoints,
        seasonNumber: { increment: 1 },
      },
    })

    results.push({
      userId: user.id,
      oldPoints: user.rankPoints,
      finalRank: rank.label,
      newPoints,
      reward: reward?.description,
      coinsAwarded: reward?.coins || 0,
    })
  }

  return NextResponse.json({
    success: true,
    usersProcessed: results.length,
    results,
  })
}
