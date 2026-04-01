import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import MaisonView from '@/components/maison/MaisonView'
import type { PlacedFurnitureWithItem, InventoryItem, FurnitureShopItem } from '@/types'

export default async function MaisonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  // Verify membership
  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId: id } },
  })
  if (!membership) redirect('/dashboard')

  // Fetch placed furniture
  const placedFurniture = await prisma.placedFurniture.findMany({
    where: { colocId: id },
    include: {
      item: {
        select: {
          id: true, name: true, furnitureCategory: true, modelKey: true,
          widthCm: true, depthCm: true, heightCm: true, colorHex: true, rarity: true,
        },
      },
      placedBy: { select: { id: true, username: true } },
    },
  }) as unknown as PlacedFurnitureWithItem[]

  // Fetch user's owned decoration items + free items for inventory
  const ownedItems = await prisma.userItem.findMany({
    where: { userId: session.user.id, item: { type: 'decoration' } },
    select: { itemId: true },
  })
  const ownedItemIds = ownedItems.map((oi) => oi.itemId)

  const freeDecoItems = await prisma.shopItem.findMany({
    where: { type: 'decoration', isFree: true },
    select: { id: true },
  })
  const freeIds = freeDecoItems.map((fi) => fi.id)
  const allAvailableIds = [...new Set([...ownedItemIds, ...freeIds])]

  const placedByUser = await prisma.placedFurniture.findMany({
    where: { colocId: id, placedById: session.user.id },
    select: { itemId: true },
  })
  const placedItemIds = placedByUser.map((p) => p.itemId)

  const inventoryItems = await prisma.shopItem.findMany({
    where: { id: { in: allAvailableIds }, type: 'decoration' },
    select: {
      id: true, name: true, price: true, rarity: true, isFree: true,
      furnitureCategory: true, modelKey: true,
      widthCm: true, depthCm: true, heightCm: true, colorHex: true,
      roomConstraint: true,
    },
  })

  const inventory: InventoryItem[] = inventoryItems.map((item) => ({
    ...item,
    isPlaced: placedItemIds.includes(item.id),
    canPlaceMore: item.isFree,
  }))

  // All shop decoration items (for the shop tab)
  const allShopItems = await prisma.shopItem.findMany({
    where: { type: 'decoration' },
    select: {
      id: true, name: true, price: true, rarity: true, isFree: true,
      furnitureCategory: true, modelKey: true,
      widthCm: true, depthCm: true, heightCm: true, colorHex: true,
      roomConstraint: true,
    },
  }) as FurnitureShopItem[]

  // User currency
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/coloc/${id}`}
            className="text-t-muted hover:text-t-primary transition"
          >
            ←
          </Link>
          <span className="text-xl">🏠</span>
          <h1 className="font-display text-2xl tracking-wide text-t-primary uppercase neon-title">
            La Maison
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-accent font-bold stat-number">
            {user?.currency ?? 0} 🪙
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* 3D View */}
      <MaisonView
        colocId={id}
        userId={session.user.id}
        initialFurniture={placedFurniture}
        initialInventory={inventory}
        shopItems={allShopItems}
        initialCurrency={user?.currency ?? 0}
      />
    </div>
  )
}
