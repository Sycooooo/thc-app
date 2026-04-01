import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Shop from '@/components/Shop'

export default async function ShopPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Tous les items avatar_part
  const items = await prisma.shopItem.findMany({
    where: { type: 'avatar_part' },
    orderBy: [{ layer: 'asc' }, { price: 'asc' }],
  })

  // Items possédés
  const ownedItems = await prisma.userItem.findMany({
    where: { userId: session.user.id },
    select: { itemId: true },
  })
  const ownedIds = new Set(ownedItems.map((i) => i.itemId))

  // Solde
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currency: true },
  })

  const shopItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    layer: item.layer!,
    spriteName: item.spriteName!,
    rarity: item.rarity,
    isFree: item.isFree,
    owned: item.isFree || ownedIds.has(item.id),
  }))

  return (
    <div className="min-h-screen bg-bg">
      <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
        <Link href="/profile" className="text-t-muted hover:text-t-primary transition">
          ←
        </Link>
        <span className="text-xl">🛒</span>
        <h1 className="font-display text-2xl tracking-wide text-t-primary uppercase neon-title">
          Boutique
        </h1>
      </header>

      <Shop
        initialItems={shopItems}
        initialCurrency={user?.currency ?? 0}
      />
    </div>
  )
}
