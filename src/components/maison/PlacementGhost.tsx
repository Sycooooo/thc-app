'use client'

import { useRef, useCallback } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import type { FurnitureShopItem } from '@/types'

type PlacementGhostProps = {
  item: FurnitureShopItem
  rotation: number
  isDark: boolean
  onPlace: (posX: number, posZ: number) => void
  onMove: (posX: number, posZ: number) => void
  position: { x: number; z: number } | null
}

const SNAP = 0.25 // 25cm grid snap
const cm = (v: number) => v / 100

export default function PlacementGhost({ item, rotation, isDark, onPlace, onMove, position }: PlacementGhostProps) {
  const planeRef = useRef<THREE.Mesh>(null)

  const w = cm(item.widthCm || 50)
  const d = cm(item.depthCm || 50)
  const h = cm(item.heightCm || 50)

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const snappedX = Math.round(e.point.x / SNAP) * SNAP
      const snappedZ = Math.round(e.point.z / SNAP) * SNAP
      onMove(snappedX, snappedZ)
    },
    [onMove]
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (position) {
        onPlace(position.x, position.z)
      }
    },
    [onPlace, position]
  )

  const rotY = (rotation * Math.PI) / 180

  return (
    <group>
      {/* Invisible floor plane for raycasting */}
      <mesh
        ref={planeRef}
        position={[5, 0, 4]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial />
      </mesh>

      {/* Ghost preview */}
      {position && (
        <group position={[position.x, 0, position.z]} rotation={[0, rotY, 0]}>
          <mesh position={[0, h / 2, 0]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial
              color={isDark ? '#a855f7' : '#7c3aed'}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}
