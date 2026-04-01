import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateWeeklyMenu } from '@/lib/ai'
import { notify } from '@/lib/notifications'

// GET — Récupérer le menu de la semaine (le plus récent ou par weekStart)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get('weekStart')

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const menu = await prisma.weeklyMenu.findFirst({
    where: {
      colocId,
      ...(weekStart ? { weekStart: new Date(weekStart) } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!menu) {
    return NextResponse.json(null)
  }

  return NextResponse.json({
    ...menu,
    meals: JSON.parse(menu.meals),
    shoppingList: menu.shoppingList ? JSON.parse(menu.shoppingList) : null,
  })
}

// POST — Générer un nouveau menu avec l'IA
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  if (!process.env.MISTRAL_API_KEY) {
    const admin = await prisma.userColoc.findFirst({
      where: { colocId, role: 'admin' },
    })
    if (admin) {
      await notify(
        admin.userId,
        colocId,
        'system',
        'La clé API Mistral est manquante. La génération de menus est désactivée. Configure MISTRAL_API_KEY dans les variables d\'environnement.',
        `/coloc/${colocId}/menu`
      )
    }
    return NextResponse.json({ error: 'Clé API Mistral non configurée' }, { status: 503 })
  }

  const body = await request.json()
  const nbPersons = body.nbPersons || 2
  const restrictions = body.restrictions || null
  const budget = body.budget || 'moyen'
  const goal = body.goal || null
  const preferences = body.preferences || null
  const calories = body.calories || null

  try {
    const { meals, shoppingList } = await generateWeeklyMenu(nbPersons, restrictions, budget, goal, preferences, calories)

    // Calculer le lundi de cette semaine
    const now = new Date()
    const day = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
    monday.setHours(0, 0, 0, 0)

    const menu = await prisma.weeklyMenu.create({
      data: {
        weekStart: monday,
        nbPersons,
        restrictions,
        budget,
        meals: JSON.stringify(meals),
        shoppingList: JSON.stringify(shoppingList),
        colocId,
      },
    })

    return NextResponse.json({
      ...menu,
      meals,
      shoppingList,
    }, { status: 201 })
  } catch (err) {
    console.error('Erreur génération menu:', err)
    return NextResponse.json({ error: 'Erreur lors de la génération du menu' }, { status: 500 })
  }
}
