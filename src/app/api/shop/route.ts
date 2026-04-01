import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET : Liste tous les items de la boutique avec flag "owned"
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Tous les items avatar_part
  const items = await prisma.shopItem.findMany({
    where: { type: 'avatar_part' },
    orderBy: [{ layer: 'asc' }, { price: 'asc' }],
  })

  // Items possédés par le user
  const ownedItems = await prisma.userItem.findMany({
    where: { userId: session.user.id },
    select: { itemId: true },
  })
  const ownedIds = new Set(ownedItems.map((i) => i.itemId))

  // Solde du user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })

  const result = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    layer: item.layer,
    spriteName: item.spriteName,
    rarity: item.rarity,
    isFree: item.isFree,
    owned: item.isFree || ownedIds.has(item.id),
  }))

  return NextResponse.json({
    items: result,
    currency: user?.currency ?? 0,
  })
}
