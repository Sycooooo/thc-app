'use client'

import { useRef } from 'react'
import { ContactShadows } from '@react-three/drei'
import { APARTMENT_ENVELOPE } from '@/lib/apartment-geometry'

type SceneLightingProps = {
  isDark: boolean
}

export default function SceneLighting({ isDark }: SceneLightingProps) {
  const dirLightRef = useRef(null)
  const { centerX, centerZ } = APARTMENT_ENVELOPE

  if (isDark) {
    return (
      <>
        {/* Dark mode: moody ambient + neon accent lights */}
        <ambientLight intensity={0.15} color="#94a3b8" />

        {/* Purple accent light (top-left) */}
        <pointLight
          position={[1, 4, 1]}
          intensity={8}
          color="#a855f7"
          distance={15}
          decay={2}
        />

        {/* Orange accent light (bottom-right) */}
        <pointLight
          position={[8, 4, 6]}
          intensity={6}
          color="#f97316"
          distance={15}
          decay={2}
        />

        {/* Cyan fill (center) */}
        <pointLight
          position={[centerX, 5, centerZ]}
          intensity={3}
          color="#38bdf8"
          distance={12}
          decay={2}
        />

        <ContactShadows
          position={[centerX, 0, centerZ]}
          opacity={0.3}
          scale={15}
          blur={2}
          far={6}
          color="#000000"
        />
      </>
    )
  }

  return (
    <>
      {/* Light mode: warm natural lighting */}
      <ambientLight intensity={0.5} color="#fff5e6" />

      <directionalLight
        ref={dirLightRef}
        position={[8, 10, -3]}
        intensity={1.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={25}
        shadow-camera-near={1}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.001}
      />

      {/* Soft fill light from opposite side */}
      <directionalLight
        position={[-3, 6, 8]}
        intensity={0.3}
        color="#e8d5c4"
      />

      <ContactShadows
        position={[centerX, 0, centerZ]}
        opacity={0.4}
        scale={15}
        blur={2.5}
        far={6}
        color="#8B7355"
      />
    </>
  )
}
