import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
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
    return NextResponse.json({ error: 'Non membre' }, { status: 403 })
  }

  // Get all decoration items user owns (purchased)
  const ownedItems = await prisma.userItem.findMany({
    where: { userId: session.user.id, item: { type: 'decoration' } },
    select: { itemId: true },
  })
  const ownedItemIds = ownedItems.map((oi) => oi.itemId)

  // Get all free decoration items
  const freeItems = await prisma.shopItem.findMany({
    where: { type: 'decoration', isFree: true },
    select: { id: true },
  })
  const freeItemIds = freeItems.map((fi) => fi.id)

  // All available item IDs = owned + free
  const availableIds = [...new Set([...ownedItemIds, ...freeItemIds])]

  // Get already placed in this coloc by this user
  const placed = await prisma.placedFurniture.findMany({
    where: { colocId, placedById: session.user.id },
    select: { itemId: true },
  })
  const placedItemIds = placed.map((p) => p.itemId)

  // Available to place = available minus already placed (for non-free items)
  // Free items can be placed multiple times
  const inventory = await prisma.shopItem.findMany({
    where: {
      id: { in: availableIds },
      type: 'decoration',
    },
    select: {
      id: true, name: true, furnitureCategory: true, modelKey: true,
      widthCm: true, depthCm: true, heightCm: true, colorHex: true,
      rarity: true, price: true, isFree: true, roomConstraint: true,
    },
  })

  // Mark which ones are already placed (for UI purposes)
  const inventoryWithStatus = inventory.map((item) => ({
    ...item,
    isPlaced: placedItemIds.includes(item.id),
    canPlaceMore: item.isFree, // free items can always be placed again
  }))

  return NextResponse.json(inventoryWithStatus)
}
