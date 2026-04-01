import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { itemId } = await request.json()
  if (!itemId) {
    return NextResponse.json({ error: 'itemId requis' }, { status: 400 })
  }

  const item = await prisma.shopItem.findUnique({ where: { id: itemId } })
  if (!item) {
    return NextResponse.json({ error: 'Item introuvable' }, { status: 404 })
  }

  if (item.isFree) {
    return NextResponse.json({ error: 'Cet item est gratuit' }, { status: 400 })
  }

  // Check if already owned
  const alreadyOwned = await prisma.userItem.findUnique({
    where: { userId_itemId: { userId: session.user.id, itemId } },
  })
  if (alreadyOwned) {
    return NextResponse.json({ error: 'Item déjà possédé' }, { status: 400 })
  }

  // Check balance
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })
  if (!user || user.currency < item.price) {
    return NextResponse.json({ error: 'Pas assez de coins' }, { status: 400 })
  }

  // Transaction: deduct coins + create ownership
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
    remainingCurrency: updatedUser.currency,
  })
}
