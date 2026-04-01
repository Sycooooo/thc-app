'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RARITY_COLORS } from '@/lib/xp'
import type { InventoryItem, FurnitureShopItem, PlacedFurnitureWithItem } from '@/types'

type FurniturePanelProps = {
  isOpen: boolean
  onClose: () => void
  inventory: InventoryItem[]
  shopItems: FurnitureShopItem[]
  currency: number
  selectedFurniture: PlacedFurnitureWithItem | null
  onStartPlacement: (item: FurnitureShopItem) => void
  onBuy: (itemId: string) => void
  onRemove: (furnitureId: string) => void
  onRotate: (furnitureId: string) => void
  isBuying: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  bed: '🛏️',
  sofa: '🛋️',
  table: '🪑',
  chair: '💺',
  plant: '🌿',
  lamp: '💡',
  shelf: '📚',
  rug: '🟤',
  appliance: '🔧',
}

export default function FurniturePanel({
  isOpen,
  onClose,
  inventory,
  shopItems,
  currency,
  selectedFurniture,
  onStartPlacement,
  onBuy,
  onRemove,
  onRotate,
  isBuying,
}: FurniturePanelProps) {
  const [tab, setTab] = useState<'inventory' | 'shop'>('inventory')

  // Filter shop items that are not free and not already owned
  const ownedIds = new Set(inventory.map((i) => i.id))
  const buyableItems = shopItems.filter((i) => !i.isFree && !ownedIds.has(i.id))

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 right-0 h-full w-80 z-20 flex flex-col"
          style={{ background: 'var(--surface)' }}
        >
          {/* Header */}
          <div className="glass-header px-4 py-3 flex items-center justify-between border-b border-b">
            <h2 className="font-display text-lg tracking-wide text-t-primary uppercase neon-title">
              Meubles
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-accent font-bold">{currency} 🪙</span>
              <button
                onClick={onClose}
                className="text-t-muted hover:text-t-primary transition text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Selected furniture controls */}
          {selectedFurniture && (
            <div className="px-4 py-3 border-b border-b bg-accent/5">
              <p className="text-sm text-t-primary font-medium mb-2">
                {selectedFurniture.item.name}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onRotate(selectedFurniture.id)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-surface hover:bg-surface-hover border border-b transition"
                >
                  🔄 Tourner
                </button>
                <button
                  onClick={() => onRemove(selectedFurniture.id)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-danger/10 text-red-500 hover:bg-danger/20 transition"
                >
                  🗑️ Retirer
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-b">
            <button
              onClick={() => setTab('inventory')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
                tab === 'inventory'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-t-muted hover:text-t-primary'
              }`}
            >
              📦 Inventaire
            </button>
            <button
              onClick={() => setTab('shop')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition ${
                tab === 'shop'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-t-muted hover:text-t-primary'
              }`}
            >
              🛒 Boutique {buyableItems.length > 0 && `(${buyableItems.length})`}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {tab === 'inventory' && (
              <>
                {inventory.length === 0 ? (
                  <p className="text-sm text-t-muted text-center py-8">
                    Aucun meuble disponible.<br />Achetez-en dans la boutique !
                  </p>
                ) : (
                  inventory.map((item) => (
                    <div
                      key={item.id}
                      className="card p-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">
                        {CATEGORY_ICONS[item.furnitureCategory || ''] || '📦'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-t-primary truncate">
                          {item.name}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            RARITY_COLORS[item.rarity] || RARITY_COLORS.common
                          }`}
                        >
                          {item.rarity}
                        </span>
                      </div>
                      <button
                        onClick={() => onStartPlacement(item)}
                        disabled={item.isPlaced && !item.canPlaceMore}
                        className="px-3 py-1.5 text-xs rounded-lg btn-glow bg-accent text-white hover:bg-accent-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {item.isPlaced && !item.canPlaceMore ? 'Placé' : 'Placer'}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}

            {tab === 'shop' && (
              <>
                {buyableItems.length === 0 ? (
                  <p className="text-sm text-t-muted text-center py-8">
                    Tous les meubles ont été achetés !
                  </p>
                ) : (
                  buyableItems.map((item) => (
                    <div
                      key={item.id}
                      className="card p-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">
                        {CATEGORY_ICONS[item.furnitureCategory || ''] || '📦'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-t-primary truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              RARITY_COLORS[item.rarity] || RARITY_COLORS.common
                            }`}
                          >
                            {item.rarity}
                          </span>
                          <span className="text-xs font-mono text-accent font-bold">
                            {item.price} 🪙
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onBuy(item.id)}
                        disabled={currency < item.price || isBuying}
                        className="px-3 py-1.5 text-xs rounded-lg btn-glow bg-accent text-white hover:bg-accent-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {currency < item.price ? '🔒' : 'Acheter'}
                      </button>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
