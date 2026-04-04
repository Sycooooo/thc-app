import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — Briefing par date (format YYYY-MM-DD)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ date: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { date } = await params
  const parsed = new Date(date + 'T00:00:00.000Z')

  if (isNaN(parsed.getTime())) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  const briefing = await prisma.briefing.findUnique({
    where: { date: parsed },
  })

  if (!briefing) {
    return NextResponse.json({ error: 'Briefing non trouvé' }, { status: 404 })
  }

  // Trouver le briefing précédent et suivant pour la navigation
  const [prev, next] = await Promise.all([
    prisma.briefing.findFirst({
      where: { date: { lt: parsed } },
      orderBy: { date: 'desc' },
      select: { date: true },
    }),
    prisma.briefing.findFirst({
      where: { date: { gt: parsed } },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
  ])

  return NextResponse.json({
    ...briefing,
    prevDate: prev?.date ?? null,
    nextDate: next?.date ?? null,
  })
}
