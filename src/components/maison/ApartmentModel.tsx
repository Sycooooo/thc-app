'use client'

import Room from './Room'
import { APARTMENT_ROOMS, APARTMENT_ENVELOPE } from '@/lib/apartment-geometry'

type ApartmentModelProps = {
  isDark: boolean
  selectedRoom: string | null
  onRoomClick: (roomId: string) => void
}

export default function ApartmentModel({ isDark, selectedRoom, onRoomClick }: ApartmentModelProps) {
  const { width, depth, centerX, centerZ } = APARTMENT_ENVELOPE

  return (
    <group>
      {/* Base platform (architectural model base) */}
      <mesh
        position={[centerX, -0.05, centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width + 0.8, depth + 0.8]} />
        <meshStandardMaterial
          color={isDark ? '#1a1a2e' : '#e8e4de'}
          roughness={1}
        />
      </mesh>

      {/* Rooms */}
      {APARTMENT_ROOMS.map((room) => (
        <Room
          key={room.id}
          room={room}
          isDark={isDark}
          isSelected={selectedRoom === room.id}
          onClick={() => onRoomClick(room.id)}
        />
      ))}
    </group>
  )
}
