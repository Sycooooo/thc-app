'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import {
  type RoomDefinition,
  WALL_THICKNESS,
  WALL_HEIGHT,
  RAILING_HEIGHT,
} from '@/lib/apartment-geometry'

type RoomProps = {
  room: RoomDefinition
  isDark: boolean
  isSelected: boolean
  onClick: () => void
}

const FLOOR_MATERIALS: Record<string, { color: string; roughness: number; metalness: number }> = {
  'wood-light': { color: '#d4a574', roughness: 0.8, metalness: 0 },
  'wood-dark': { color: '#8B6F47', roughness: 0.8, metalness: 0 },
  'tile-white': { color: '#e8e4de', roughness: 0.3, metalness: 0.1 },
  'tile-grey': { color: '#b0aba3', roughness: 0.4, metalness: 0.05 },
  'concrete': { color: '#c0bdb8', roughness: 0.9, metalness: 0 },
  'exterior': { color: '#c0bdb8', roughness: 0.9, metalness: 0 },
}

const WALL_COLOR_LIGHT = '#f5f2ed'
const WALL_COLOR_DARK = '#2a2a3d'

type WallSegment = {
  position: [number, number, number]
  size: [number, number, number]
}

export default function Room({ room, isDark, isSelected, onClick }: RoomProps) {
  const { x, z, width, depth, floorType, isExterior, wallOpenings } = room

  const wallHeight = isExterior ? RAILING_HEIGHT : WALL_HEIGHT
  const wallColor = isDark ? WALL_COLOR_DARK : WALL_COLOR_LIGHT
  const floorMat = FLOOR_MATERIALS[floorType] || FLOOR_MATERIALS['wood-light']

  // Center of the room
  const cx = x + width / 2
  const cz = z + depth / 2

  // Build wall segments for each side, subtracting openings
  const walls = useMemo(() => {
    const segments: WallSegment[] = []
    const t = WALL_THICKNESS
    const h = wallHeight

    const sides: Array<{
      side: 'north' | 'south' | 'east' | 'west'
      length: number
      posBase: [number, number, number]
      wallSize: (start: number, end: number) => [number, number, number]
      wallPos: (start: number, end: number) => [number, number, number]
    }> = [
      {
        side: 'north',
        length: width,
        posBase: [x, h / 2, z],
        wallSize: (s, e) => [e - s, h, t],
        wallPos: (s, e) => [x + (s + e) / 2, h / 2, z],
      },
      {
        side: 'south',
        length: width,
        posBase: [x, h / 2, z + depth],
        wallSize: (s, e) => [e - s, h, t],
        wallPos: (s, e) => [x + (s + e) / 2, h / 2, z + depth],
      },
      {
        side: 'west',
        length: depth,
        posBase: [x, h / 2, z],
        wallSize: (s, e) => [t, h, e - s],
        wallPos: (s, e) => [x, h / 2, z + (s + e) / 2],
      },
      {
        side: 'east',
        length: depth,
        posBase: [x + width, h / 2, z],
        wallSize: (s, e) => [t, h, e - s],
        wallPos: (s, e) => [x + width, h / 2, z + (s + e) / 2],
      },
    ]

    for (const { side, length, wallSize, wallPos } of sides) {
      // Get openings on this wall
      const openings = wallOpenings
        .filter((o) => o.wall === side)
        .sort((a, b) => a.offset - b.offset)

      if (openings.length === 0) {
        segments.push({ position: wallPos(0, length), size: wallSize(0, length) })
      } else {
        let cursor = 0
        for (const op of openings) {
          if (op.offset > cursor) {
            segments.push({ position: wallPos(cursor, op.offset), size: wallSize(cursor, op.offset) })
          }
          cursor = op.offset + op.width
        }
        if (cursor < length) {
          segments.push({ position: wallPos(cursor, length), size: wallSize(cursor, length) })
        }
      }
    }

    return segments
  }, [x, z, width, depth, wallHeight, wallOpenings])

  const floorColor = useMemo(() => {
    if (isDark) {
      // Slightly desaturate in dark mode
      const c = new THREE.Color(floorMat.color)
      c.multiplyScalar(0.6)
      return '#' + c.getHexString()
    }
    return floorMat.color
  }, [isDark, floorMat.color])

  return (
    <group>
      {/* Floor plane */}
      <mesh
        position={[cx, 0.01, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={floorColor}
          roughness={floorMat.roughness}
          metalness={floorMat.metalness}
          emissive={isSelected ? (isDark ? '#a855f7' : '#7c3aed') : '#000000'}
          emissiveIntensity={isSelected ? 0.15 : 0}
        />
      </mesh>

      {/* Wall segments */}
      {walls.map((wall, i) => (
        <mesh key={i} position={wall.position} castShadow receiveShadow>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial
            color={wallColor}
            roughness={0.9}
            emissive={isDark ? '#a855f7' : '#000000'}
            emissiveIntensity={isDark ? 0.02 : 0}
          />
        </mesh>
      ))}

      {/* Room label */}
      <Text
        position={[cx, wallHeight + 0.3, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.min(0.22, width * 0.12)}
        color={isDark ? '#94a3b8' : '#64748b'}
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 0.9}
      >
        {room.emoji} {room.label}
      </Text>
    </group>
  )
}
