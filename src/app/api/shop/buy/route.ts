import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST : Acheter un item avec des coins
export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { itemId } = await request.json()

  if (!itemId) {
    return NextResponse.json({ error: 'Item requis' }, { status: 400 })
  }

  // Vérifier que l'item existe
  const item = await prisma.shopItem.findUnique({ where: { id: itemId } })
  if (!item) {
    return NextResponse.json({ error: 'Item introuvable' }, { status: 404 })
  }

  // Vérifier que l'item n'est pas déjà gratuit
  if (item.isFree) {
    return NextResponse.json({ error: 'Cet item est gratuit' }, { status: 400 })
  }

  // Vérifier que le user ne possède pas déjà l'item
  const existing = await prisma.userItem.findUnique({
    where: { userId_itemId: { userId: session.user.id, itemId } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Item déjà possédé' }, { status: 400 })
  }

  // Vérifier le solde
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })
  if (!user || user.currency < item.price) {
    return NextResponse.json({ error: 'Pas assez de coins' }, { status: 400 })
  }

  // Transaction : déduire les coins + créer le UserItem
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { currency: { decrement: item.price } },
      select: { currency: true },
    }),
    prisma.userItem.create({
      data: { userId: session.user.id, itemId },
    }),
  ])

  return NextResponse.json({
    success: true,
    currency: updatedUser.currency,
    item: {
      id: item.id,
      name: item.name,
      layer: item.layer,
      spriteName: item.spriteName,
      rarity: item.rarity,
    },
  })
}
