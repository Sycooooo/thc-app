'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ApartmentModel from './ApartmentModel'
import SceneLighting from './SceneLighting'
import CameraController from './CameraController'
import FurnitureLayer from './FurnitureLayer'
import PlacementGhost from './PlacementGhost'
import FurniturePanel from './FurniturePanel'
import { APARTMENT_ENVELOPE } from '@/lib/apartment-geometry'
import type { PlacedFurnitureWithItem, FurnitureShopItem, InventoryItem } from '@/types'

type MaisonViewProps = {
  colocId: string
  userId: string
  initialFurniture: PlacedFurnitureWithItem[]
  initialInventory: InventoryItem[]
  shopItems: FurnitureShopItem[]
  initialCurrency: number
}

export default function MaisonView({
  colocId,
  userId,
  initialFurniture,
  initialInventory,
  shopItems,
  initialCurrency,
}: MaisonViewProps) {
  // Theme detection
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const html = document.documentElement
    setIsDark(html.classList.contains('dark'))

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains('dark'))
    })
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // State
  const [furniture, setFurniture] = useState(initialFurniture)
  const [inventory, setInventory] = useState(initialInventory)
  const [currency, setCurrency] = useState(initialCurrency)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [placingItem, setPlacingItem] = useState<FurnitureShopItem | null>(null)
  const [placementRotation, setPlacementRotation] = useState(0)
  const [ghostPos, setGhostPos] = useState<{ x: number; z: number } | null>(null)
  const [isBuying, setIsBuying] = useState(false)

  const selectedFurniture = furniture.find((f) => f.id === selectedFurnitureId) || null

  // Handlers
  const handleRoomClick = useCallback((roomId: string) => {
    setSelectedRoom(roomId)
    setSelectedFurnitureId(null)
  }, [])

  const handleFurnitureSelect = useCallback((id: string) => {
    if (placingItem) return
    setSelectedFurnitureId(id)
    setSelectedRoom(null)
  }, [placingItem])

  const handleStartPlacement = useCallback((item: FurnitureShopItem) => {
    setPlacingItem(item)
    setSelectedFurnitureId(null)
    setGhostPos(null)
    setPlacementRotation(0)
  }, [])

  const handleCancelPlacement = useCallback(() => {
    setPlacingItem(null)
    setGhostPos(null)
  }, [])

  const handlePlace = useCallback(
    async (posX: number, posZ: number) => {
      if (!placingItem) return

      // Find which room this position is in
      const { APARTMENT_ROOMS } = await import('@/lib/apartment-geometry')
      const room = APARTMENT_ROOMS.find(
        (r) => posX >= r.x && posX <= r.x + r.width && posZ >= r.z && posZ <= r.z + r.depth
      )
      if (!room) return

      // Check room constraint
      if (placingItem.roomConstraint && placingItem.roomConstraint !== room.id) return

      try {
        const res = await fetch(`/api/coloc/${colocId}/furniture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: placingItem.id,
            roomId: room.id,
            posX,
            posZ,
            rotation: placementRotation,
          }),
        })
        if (!res.ok) return

        const placed: PlacedFurnitureWithItem = await res.json()
        // Add placedBy info since API might not return full shape
        placed.placedBy = placed.placedBy || { id: userId, username: '' }
        setFurniture((prev) => [...prev, placed])

        // Update inventory status
        setInventory((prev) =>
          prev.map((inv) =>
            inv.id === placingItem.id ? { ...inv, isPlaced: true } : inv
          )
        )

        setPlacingItem(null)
        setGhostPos(null)
      } catch (err) {
        console.error('Failed to place furniture:', err)
      }
    },
    [colocId, placingItem, placementRotation, userId]
  )

  const handleBuy = useCallback(
    async (itemId: string) => {
      setIsBuying(true)
      try {
        const res = await fetch('/api/shop/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId }),
        })
        if (!res.ok) return

        const data = await res.json()
        setCurrency(data.remainingCurrency)

        // Add to inventory
        const boughtItem = shopItems.find((i) => i.id === itemId)
        if (boughtItem) {
          setInventory((prev) => [
            ...prev,
            { ...boughtItem, isPlaced: false, canPlaceMore: false },
          ])
        }
      } catch (err) {
        console.error('Failed to buy:', err)
      } finally {
        setIsBuying(false)
      }
    },
    [shopItems]
  )

  const handleRemove = useCallback(
    async (furnitureId: string) => {
      try {
        const res = await fetch(`/api/coloc/${colocId}/furniture`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ furnitureId }),
        })
        if (!res.ok) return

        const removed = furniture.find((f) => f.id === furnitureId)
        setFurniture((prev) => prev.filter((f) => f.id !== furnitureId))
        setSelectedFurnitureId(null)

        // Update inventory status
        if (removed) {
          setInventory((prev) =>
            prev.map((inv) =>
              inv.id === removed.itemId ? { ...inv, isPlaced: false } : inv
            )
          )
        }
      } catch (err) {
        console.error('Failed to remove:', err)
      }
    },
    [colocId, furniture]
  )

  const handleRotate = useCallback(
    async (furnitureId: string) => {
      const f = furniture.find((f) => f.id === furnitureId)
      if (!f) return

      const newRotation = (f.rotation + 90) % 360

      try {
        await fetch(`/api/coloc/${colocId}/furniture`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ furnitureId, rotation: newRotation }),
        })

        setFurniture((prev) =>
          prev.map((f) =>
            f.id === furnitureId ? { ...f, rotation: newRotation } : f
          )
        )
      } catch (err) {
        console.error('Failed to rotate:', err)
      }
    },
    [colocId, furniture]
  )

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (placingItem) handleCancelPlacement()
        else {
          setSelectedFurnitureId(null)
          setSelectedRoom(null)
        }
      }
      if (e.key === 'r' && placingItem) {
        setPlacementRotation((prev) => (prev + 90) % 360)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [placingItem, handleCancelPlacement])

  const { centerX, centerZ } = APARTMENT_ENVELOPE

  return (
    <div className="relative w-full flex-1" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [centerX, 14, centerZ + 6],
          fov: 40,
          near: 0.1,
          far: 100,
        }}
        style={{
          background: isDark ? '#0d0d0d' : '#f5f0e8',
        }}
        onPointerMissed={() => {
          if (!placingItem) {
            setSelectedFurnitureId(null)
            setSelectedRoom(null)
          }
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting isDark={isDark} />
          <CameraController />
          <ApartmentModel
            isDark={isDark}
            selectedRoom={selectedRoom}
            onRoomClick={handleRoomClick}
          />
          <FurnitureLayer
            furniture={furniture}
            selectedId={selectedFurnitureId}
            isDark={isDark}
            onSelect={handleFurnitureSelect}
          />
          {placingItem && (
            <PlacementGhost
              item={placingItem}
              rotation={placementRotation}
              isDark={isDark}
              onPlace={handlePlace}
              onMove={(x, z) => setGhostPos({ x, z })}
              position={ghostPos}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Placement mode indicator */}
      {placingItem && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl bg-accent/90 text-white text-sm font-medium flex items-center gap-3">
          <span>Placez : {placingItem.name}</span>
          <span className="text-xs opacity-70">[R] tourner · [Esc] annuler</span>
        </div>
      )}

      {/* Toggle panel button */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute top-4 right-4 z-10 px-4 py-2 rounded-xl btn-glow bg-surface border border-b text-t-primary text-sm font-medium hover:bg-surface-hover transition"
      >
        🏠 Meubles
      </button>

      {/* Furniture Panel */}
      <FurniturePanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        inventory={inventory}
        shopItems={shopItems}
        currency={currency}
        selectedFurniture={selectedFurniture}
        onStartPlacement={handleStartPlacement}
        onBuy={handleBuy}
        onRemove={handleRemove}
        onRotate={handleRotate}
        isBuying={isBuying}
      />
    </div>
  )
}
