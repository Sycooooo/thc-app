'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

// ============ TYPES ============

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  difficulty: string
  room: string | null
  assignedTo: { id: string; username: string; avatar: string | null } | null
}

type Room3D = {
  id: string
  name: string
  icon: string
  cx: number
  cz: number
  w: number
  d: number
  color: string
  floorY?: number
  mapFrom?: string[]
}

// ============ PLAN DE L'APPARTEMENT (72.71m²) ============
// Coordonnées en mètres depuis le coin haut-gauche du plan
// Puis centrées à l'origine pour Three.js
//
// Layout du plan :
//
//  Loggia | Salle d'eau | WC |  Chambre 2   | B |
//  -------|-------------|    |              | a |
//         |   Couloir   |    |              | l |
//  Ch 1   |   (étroit)  |    |--------------| c |
//         |             |    |  Chambre 3   | o |
//  -------|             |    |              | n |
//  Buand. |             |    |              |   |
//  -------|-------------|----|--------------| f |
//     Entrée / Cuisine  |     Séjour       | u |
//                       |                  | l |
//                       |                  | l |
//  --------------------------------------------|

const OX = 5.05 // demi-largeur totale (avec balcon)
const OZ = 4.18 // demi-profondeur

// Plan coords → centered coords
function pc(x: number, z: number, w: number, d: number): { cx: number; cz: number; w: number; d: number } {
  return { cx: x + w / 2 - OX, cz: z + d / 2 - OZ, w, d }
}

const ROOMS_3D: Room3D[] = [
  { id: 'loggia',    name: 'Loggia',       icon: '🌿', ...pc(0, 0, 2.22, 1.13),       color: '#86efac' },
  { id: 'sdb',       name: "Salle d'eau",  icon: '🚿', ...pc(2.22, 0, 2.20, 1.80),    color: '#93c5fd', mapFrom: ['sdb'] },
  { id: 'wc',        name: 'WC',           icon: '🚽', ...pc(4.42, 0, 0.92, 1.30),    color: '#c4b5fd' },
  { id: 'chambre2',  name: 'Chambre 2',    icon: '🛏️', ...pc(5.50, 0, 3.60, 2.76),    color: '#fda4af' },
  { id: 'chambre1',  name: 'Chambre 1',    icon: '🛏️', ...pc(0, 1.13, 3.40, 2.87),    color: '#fdba74', floorY: 0.04, mapFrom: ['chambre'] },
  { id: 'couloir',   name: 'Couloir',      icon: '🚪', ...pc(3.40, 1.80, 2.10, 3.30), color: '#d6d3d1' },
  { id: 'chambre3',  name: 'Chambre 3',    icon: '🛏️', ...pc(5.50, 2.76, 3.60, 2.63), color: '#fde047' },
  { id: 'balcon',    name: 'Balcon',        icon: '☀️', ...pc(9.10, 0, 1.00, 8.35),    color: '#86efac', mapFrom: ['exterieur'] },
  { id: 'buanderie', name: 'Buanderie',    icon: '🧺', ...pc(0, 4.00, 2.86, 1.10),    color: '#d8b4fe' },
  { id: 'cuisine',   name: 'Cuisine',      icon: '🍳', ...pc(0, 5.10, 5.50, 3.25),    color: '#fed7aa', mapFrom: ['cuisine'] },
  { id: 'sejour',    name: 'Séjour',       icon: '🛋️', ...pc(5.50, 5.10, 3.60, 3.25), color: '#bae6fd', mapFrom: ['salon'] },
]

// ============ MURS ============
// wp() convertit les coordonnées plan → centrées

function wp(x1: number, z1: number, x2: number, z2: number): [number, number, number, number] {
  return [x1 - OX, z1 - OZ, x2 - OX, z2 - OZ]
}

const EXT_WALLS: { pts: [number, number, number, number]; h: number }[] = [
  // Murs extérieurs principaux (h=2.5)
  { pts: wp(0, 0, 9.10, 0), h: 2.5 },         // haut
  { pts: wp(9.10, 0, 9.10, 8.35), h: 2.5 },   // droite bâtiment (façade balcon)
  { pts: wp(9.10, 8.35, 0, 8.35), h: 2.5 },   // bas
  { pts: wp(0, 8.35, 0, 0), h: 2.5 },          // gauche

  // Garde-corps balcon (h=1.0)
  { pts: wp(9.10, 0, 10.10, 0), h: 1.0 },      // haut balcon
  { pts: wp(10.10, 0, 10.10, 8.35), h: 1.0 },  // droite balcon
  { pts: wp(10.10, 8.35, 9.10, 8.35), h: 1.0 },// bas balcon
]

const INT_WALLS: [number, number, number, number][] = [
  // Verticaux
  wp(2.22, 0, 2.22, 1.80),       // Loggia | Salle d'eau
  wp(4.42, 0, 4.42, 1.80),       // Salle d'eau | WC
  wp(5.50, 0, 5.50, 5.40),       // Séparation principale (Ch2/Ch3 | reste) — s'arrête avant cuisine/séjour
  wp(3.40, 1.13, 3.40, 4.00),    // Ch1 droite | Couloir gauche
  wp(2.86, 4.00, 2.86, 5.10),    // Buanderie droite (ferme la buanderie)

  // Horizontaux
  wp(0, 1.13, 2.22, 1.13),       // Bas Loggia
  wp(2.22, 1.80, 5.50, 1.80),    // Bas SdB/WC (haut couloir)
  wp(5.50, 2.76, 9.10, 2.76),    // Ch2 | Ch3
  wp(0, 4.00, 3.40, 4.00),       // Bas Ch1
  wp(0, 5.10, 2.86, 5.10),       // Bas Buanderie
  // PAS de mur entre cuisine et séjour (open plan)
  // PAS de mur en bas du couloir (ouvert sur l'entrée cuisine)
]

// ============ MAPPING TÂCHES → PIÈCES ============

function getRoomIdForTask(taskRoom: string | null): string | null {
  if (!taskRoom) return null
  const direct = ROOMS_3D.find((r) => r.id === taskRoom)
  if (direct) return direct.id
  const mapped = ROOMS_3D.find((r) => r.mapFrom?.includes(taskRoom))
  return mapped?.id || null
}

// ============ COMPOSANTS 3D ============

function WallMesh({
  x1, z1, x2, z2,
  height = 2.0,
  thickness = 0.10,
  color = '#ece4d8',
}: {
  x1: number; z1: number; x2: number; z2: number
  height?: number; thickness?: number; color?: string
}) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const wallCx = (x1 + x2) / 2
  const wallCz = (z1 + z2) / 2

  // Transparence dynamique : murs entre la caméra et le centre deviennent transparents
  useFrame(({ camera }) => {
    if (!materialRef.current) return

    // Produit scalaire : si mur et caméra du même côté du centre → mur bloque la vue
    const dot = wallCx * camera.position.x + wallCz * camera.position.z

    // Facteur hauteur : quand la caméra est haute (vue de dessus), tout est visible
    const heightRatio = Math.min(camera.position.y / 14, 1)

    const targetOpacity = dot > 0
      ? 0.06 + heightRatio * 0.84 // mur devant → transparent quand angle bas
      : 0.92                       // mur derrière → opaque

    materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.08
  })

  const dx = x2 - x1
  const dz = z2 - z1
  const length = Math.sqrt(dx * dx + dz * dz) + thickness
  const cx = (x1 + x2) / 2
  const cz = (z1 + z2) / 2
  const angle = Math.atan2(dx, dz)

  return (
    <mesh position={[cx, height / 2, cz]} rotation={[0, angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[thickness, height, length]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        transparent
        opacity={0.92}
        roughness={0.85}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function RoomFloor({
  room, isSelected, isHovered, pending, onSelect, onHover,
}: {
  room: Room3D
  isSelected: boolean
  isHovered: boolean
  pending: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const baseY = room.floorY ?? 0.05
  const y = isSelected ? baseY + 0.12 : baseY
  const emissiveIntensity = isSelected ? 0.4 : isHovered ? 0.2 : 0

  return (
    <group>
      <mesh
        position={[room.cx, y, room.cz]}
        onClick={(e) => { e.stopPropagation(); onSelect(room.id) }}
        onPointerOver={(e) => { e.stopPropagation(); onHover(room.id); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = 'default' }}
        receiveShadow
      >
        <boxGeometry args={[room.w - 0.06, 0.1, room.d - 0.06]} />
        <meshStandardMaterial
          color={room.color}
          emissive={room.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.5}
        />
      </mesh>

      <Html
        position={[room.cx, 3.2, room.cz]}
        center
        distanceFactor={14}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          style={{
            background: isSelected ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
            color: isSelected ? '#fff' : '#1c1917',
            padding: '3px 8px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(8px)',
            boxShadow: isSelected
              ? '0 4px 16px rgba(0,0,0,0.35)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <span>{room.icon}</span>
          <span>{room.name}</span>
          {pending > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: 10,
                padding: '0 5px',
                fontSize: 10,
                fontWeight: 800,
                minWidth: 16,
                textAlign: 'center',
              }}
            >
              {pending}
            </span>
          )}
        </div>
      </Html>
    </group>
  )
}

function Scene({
  selectedRoom, hoveredRoom, pendingByRoom, onSelect, onHover,
}: {
  selectedRoom: string | null
  hoveredRoom: string | null
  pendingByRoom: Record<string, number>
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 8]} intensity={0.8} castShadow />
      <directionalLight position={[-6, 12, -6]} intensity={0.25} />

      {/* Sol global */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#c8c0b4" roughness={1} />
      </mesh>

      {/* Sols des pièces */}
      {ROOMS_3D.map((room) => (
        <RoomFloor
          key={room.id}
          room={room}
          isSelected={selectedRoom === room.id}
          isHovered={hoveredRoom === room.id}
          pending={pendingByRoom[room.id] || 0}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      {/* Murs extérieurs */}
      {EXT_WALLS.map((wall, i) => (
        <WallMesh
          key={`e${i}`}
          x1={wall.pts[0]} z1={wall.pts[1]} x2={wall.pts[2]} z2={wall.pts[3]}
          height={wall.h}
          thickness={0.15}
          color="#d4ccc0"
        />
      ))}

      {/* Murs intérieurs */}
      {INT_WALLS.map((pts, i) => (
        <WallMesh
          key={`i${i}`}
          x1={pts[0]} z1={pts[1]} x2={pts[2]} z2={pts[3]}
          height={2.0}
          thickness={0.10}
          color="#ece4d8"
        />
      ))}

      {/* Contrôles caméra */}
      <OrbitControls
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={4}
        maxDistance={22}
        enablePan={true}
        panSpeed={0.5}
      />
    </>
  )
}

// ============ COMPOSANT PRINCIPAL ============

export default function InteractiveHouse({
  tasks, colocId, currentUserId,
}: {
  tasks: Task[]
  colocId: string
  currentUserId: string
}) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  // Grouper les tâches par pièce
  const tasksByRoom: Record<string, Task[]> = {}
  for (const task of tasks) {
    const roomId = getRoomIdForTask(task.room)
    if (roomId) {
      if (!tasksByRoom[roomId]) tasksByRoom[roomId] = []
      tasksByRoom[roomId].push(task)
    }
  }

  const pendingByRoom: Record<string, number> = {}
  for (const [roomId, roomTasks] of Object.entries(tasksByRoom)) {
    pendingByRoom[roomId] = roomTasks.filter((t) => t.status === 'pending').length
  }

  const selectedRoomConfig = ROOMS_3D.find((r) => r.id === selectedRoom)
  const selectedRoomTasks = selectedRoom
    ? (tasksByRoom[selectedRoom] || []).sort(
        (a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0)
      )
    : []

  const totalPending = tasks.filter((t) => t.status === 'pending').length

  async function completeTask(taskId: string) {
    await api.patch(`/api/tasks/${taskId}`, { status: 'done' })
    router.refresh()
  }

  function handleSelect(id: string) {
    setSelectedRoom(selectedRoom === id ? null : id)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Instructions */}
      <div className="text-center py-2 flex-shrink-0">
        <p className="text-t-faint text-xs">
          Tourne la vue avec la souris · Clique sur une pièce ({totalPending} quête{totalPending !== 1 ? 's' : ''} en attente)
        </p>
      </div>

      {/* Canvas 3D — prend tout l'espace */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-b mx-4" style={{ background: '#c8c0b4' }}>
        {mounted && (
          <Canvas camera={{ position: [0, 14, 10], fov: 45 }} shadows>
            <Scene
              selectedRoom={selectedRoom}
              hoveredRoom={hoveredRoom}
              pendingByRoom={pendingByRoom}
              onSelect={handleSelect}
              onHover={setHoveredRoom}
            />
          </Canvas>
        )}
      </div>

      {/* Panel des tâches (scroll si nécessaire) */}
      {selectedRoomConfig && (
        <div
          className="flex-shrink-0 mx-4 mt-4 mb-4 bg-surface rounded-2xl border border-b p-4 space-y-3 max-h-64 overflow-y-auto"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: selectedRoomConfig.color }}
            >
              {selectedRoomConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-t-primary">{selectedRoomConfig.name}</h3>
              <p className="text-xs text-t-faint">
                {selectedRoomTasks.filter((t) => t.status === 'pending').length} quête(s) en attente
              </p>
            </div>
          </div>

          {selectedRoomTasks.length === 0 ? (
            <p className="text-sm text-t-faint text-center py-4">Aucune quête dans cette pièce</p>
          ) : (
            <div className="space-y-2">
              {selectedRoomTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    task.status === 'done'
                      ? 'bg-success-bg border-success/20 opacity-50'
                      : 'bg-bg-secondary border-b hover:border-b-hover'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {task.status === 'pending' ? (
                      <button
                        onClick={() => completeTask(task.id)}
                        className="w-6 h-6 rounded-full border-2 border-b-hover hover:border-success hover:bg-success-bg transition flex-shrink-0"
                        title="Marquer comme fait"
                      />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs flex-shrink-0">
                        ✓
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'done' ? 'line-through text-t-faint' : 'text-t-primary'
                      }`}>
                        {task.title}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-t-faint truncate">→ {task.assignedTo.username}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                    task.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : task.difficulty === 'hard'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.difficulty === 'easy' ? '+20' : task.difficulty === 'hard' ? '+100' : '+50'} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
