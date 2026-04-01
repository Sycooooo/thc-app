'use client'

import { OrbitControls } from '@react-three/drei'
import { APARTMENT_ENVELOPE } from '@/lib/apartment-geometry'

export default function CameraController() {
  const { centerX, centerZ } = APARTMENT_ENVELOPE

  return (
    <OrbitControls
      target={[centerX, 0, centerZ]}
      minPolarAngle={0}               // full top-down allowed
      maxPolarAngle={Math.PI / 2.5}   // ~72° max tilt
      minDistance={4}
      maxDistance={22}
      enablePan={true}
      panSpeed={0.8}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      enableDamping
      dampingFactor={0.1}
      makeDefault
    />
  )
}
