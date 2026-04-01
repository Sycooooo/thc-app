'use client'

import { OrbitControls } from '@react-three/drei'
import { APARTMENT_ENVELOPE } from '@/lib/apartment-geometry'

export default function CameraController() {
  const { centerX, centerZ } = APARTMENT_ENVELOPE

  return (
    <OrbitControls
      target={[centerX, 0, centerZ]}
      minPolarAngle={Math.PI / 8}     // ~22° (nearly top-down)
      maxPolarAngle={Math.PI / 2.8}   // ~64° (max tilt)
      minDistance={5}
      maxDistance={20}
      enablePan={true}
      panSpeed={0.8}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      makeDefault
    />
  )
}
