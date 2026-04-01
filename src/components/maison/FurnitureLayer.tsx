'use client'

import FurnitureItem3D from './FurnitureItem'
import type { PlacedFurnitureWithItem } from '@/types'

type FurnitureLayerProps = {
  furniture: PlacedFurnitureWithItem[]
  selectedId: string | null
  isDark: boolean
  onSelect: (id: string) => void
}

export default function FurnitureLayer({ furniture, selectedId, isDark, onSelect }: FurnitureLayerProps) {
  return (
    <group>
      {furniture.map((f) => (
        <FurnitureItem3D
          key={f.id}
          modelKey={f.item.modelKey || 'washer'}
          widthCm={f.item.widthCm || 50}
          depthCm={f.item.depthCm || 50}
          heightCm={f.item.heightCm || 50}
          colorHex={f.item.colorHex || '#888888'}
          posX={f.posX}
          posZ={f.posZ}
          rotation={f.rotation}
          isSelected={selectedId === f.id}
          isDark={isDark}
          onClick={() => onSelect(f.id)}
        />
      ))}
    </group>
  )
}
