'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'

type FurnitureItemProps = {
  modelKey: string
  widthCm: number
  depthCm: number
  heightCm: number
  colorHex: string
  posX: number
  posZ: number
  rotation: number
  isSelected: boolean
  isDark: boolean
  onClick: (e: ThreeEvent<MouseEvent>) => void
}

// Convert cm to meters for 3D scene
const cm = (v: number) => v / 100

function BedModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const frameH = h * 0.4
  const mattressH = h * 0.6
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, frameH / 2, 0]} castShadow>
        <boxGeometry args={[w, frameH, d]} />
        <meshStandardMaterial color="#8B6F47" roughness={0.7} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
        <boxGeometry args={[w * 0.95, mattressH, d * 0.95]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, frameH + mattressH + 0.04, -d * 0.35]} castShadow>
        <boxGeometry args={[w * 0.4, 0.08, d * 0.15]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
      </mesh>
    </group>
  )
}

function SofaModel({ w, d, h, color, isL }: { w: number; d: number; h: number; color: string; isL?: boolean }) {
  const seatH = h * 0.4
  const backH = h * 0.6
  const armW = d * 0.12
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, seatH / 2, 0]} castShadow>
        <boxGeometry args={[w, seatH, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Back */}
      <mesh position={[0, seatH + backH / 2, -d / 2 + 0.06]} castShadow>
        <boxGeometry args={[w, backH, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-w / 2 + armW / 2, seatH + backH * 0.3, 0]} castShadow>
        <boxGeometry args={[armW, backH * 0.6, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* Right arm */}
      <mesh position={[w / 2 - armW / 2, seatH + backH * 0.3, 0]} castShadow>
        <boxGeometry args={[armW, backH * 0.6, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {/* L-shape extension */}
      {isL && (
        <mesh position={[w / 2 - d * 0.4, seatH / 2, d * 0.4]} castShadow>
          <boxGeometry args={[d * 0.8, seatH, d * 0.6]} />
          <meshStandardMaterial color={color} roughness={0.85} />
        </mesh>
      )}
    </group>
  )
}

function TableModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const topH = 0.04
  const legR = 0.02
  const legH = h - topH
  const lx = w / 2 - 0.05
  const lz = d / 2 - 0.05
  return (
    <group>
      {/* Top */}
      <mesh position={[0, h - topH / 2, 0]} castShadow>
        <boxGeometry args={[w, topH, d]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* 4 Legs */}
      {[[-lx, lz], [lx, lz], [-lx, -lz], [lx, -lz]].map(([px, pz], i) => (
        <mesh key={i} position={[px, legH / 2, pz]} castShadow>
          <cylinderGeometry args={[legR, legR, legH, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function ChairModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  const seatH = h * 0.5
  const backH = h * 0.5
  const legR = 0.015
  const lx = w / 2 - 0.03
  const lz = d / 2 - 0.03
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, seatH, 0]} castShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Back */}
      <mesh position={[0, seatH + backH / 2, -d / 2 + 0.02]} castShadow>
        <boxGeometry args={[w * 0.9, backH, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* 4 Legs */}
      {[[-lx, lz], [lx, lz], [-lx, -lz], [lx, -lz]].map(([px, pz], i) => (
        <mesh key={i} position={[px, seatH / 2, pz]} castShadow>
          <cylinderGeometry args={[legR, legR, seatH, 8]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function PlantModel({ w, h, color }: { w: number; h: number; color: string }) {
  const potH = h * 0.3
  const canopyR = w * 0.6
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, potH / 2, 0]} castShadow>
        <cylinderGeometry args={[w * 0.35, w * 0.45, potH, 12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, potH + canopyR * 0.7, 0]} castShadow>
        <sphereGeometry args={[canopyR, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

function LampModel({ w, h, color }: { w: number; h: number; color: string }) {
  const poleR = 0.015
  const poleH = h * 0.75
  const shadeH = h * 0.25
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[w * 0.4, w * 0.45, 0.04, 12]} />
        <meshStandardMaterial color="#555" roughness={0.5} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.04 + poleH / 2, 0]} castShadow>
        <cylinderGeometry args={[poleR, poleR, poleH, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 0.04 + poleH + shadeH / 2, 0]} castShadow>
        <coneGeometry args={[w * 0.35, shadeH, 12, 1, true]} />
        <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function ShelfModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  return (
    <mesh position={[0, 1.4, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

function RugModel({ w, d, color }: { w: number; d: number; color: string }) {
  return (
    <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[w / 2, 24]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

function ApplianceModel({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  return (
    <mesh position={[0, h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
    </mesh>
  )
}

export default function FurnitureItem3D({
  modelKey,
  widthCm,
  depthCm,
  heightCm,
  colorHex,
  posX,
  posZ,
  rotation,
  isSelected,
  isDark,
  onClick,
}: FurnitureItemProps) {
  const w = cm(widthCm)
  const d = cm(depthCm)
  const h = cm(heightCm)
  const color = colorHex

  const rotY = useMemo(() => (rotation * Math.PI) / 180, [rotation])

  const model = useMemo(() => {
    switch (modelKey) {
      case 'bed-single':
      case 'bed-double':
        return <BedModel w={w} d={d} h={h} color={color} />
      case 'sofa-2seat':
        return <SofaModel w={w} d={d} h={h} color={color} />
      case 'sofa-l-shape':
        return <SofaModel w={w} d={d} h={h} color={color} isL />
      case 'table-coffee':
      case 'table-dining':
      case 'desk':
        return <TableModel w={w} d={d} h={h} color={color} />
      case 'chair-basic':
        return <ChairModel w={w} d={d} h={h} color={color} />
      case 'plant-tall':
      case 'plant-small':
        return <PlantModel w={w} h={h} color={color} />
      case 'lamp-floor':
      case 'lamp-bedside':
        return <LampModel w={w} h={h} color={color} />
      case 'shelf-wall':
        return <ShelfModel w={w} d={d} h={h} color={color} />
      case 'rug-round':
        return <RugModel w={w} d={d} color={color} />
      case 'washer':
      case 'shower':
      default:
        return <ApplianceModel w={w} d={d} h={h} color={color} />
    }
  }, [modelKey, w, d, h, color])

  return (
    <group
      position={[posX, 0, posZ]}
      rotation={[0, rotY, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
    >
      {model}
      {/* Selection outline */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(w, d) * 0.6, Math.max(w, d) * 0.65, 24]} />
          <meshBasicMaterial color={isDark ? '#a855f7' : '#7c3aed'} />
        </mesh>
      )}
    </group>
  )
}
