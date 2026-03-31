'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
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
  mapFrom?: string[]
}

// ============ PLAN DE L'APPARTEMENT ============
// Basé sur le vrai plan : 72.71m² — 11 pièces
// Coordonnées centrées à l'origine (en mètres)

const OX = 5.05
const OZ = 4.20

const ROOMS_3D: Room3D[] = [
  { id: 'loggia', name: 'Loggia', icon: '🌿', cx: 1.11 - OX, cz: 0.57 - OZ, w: 2.22, d: 1.13, color: '#86efac' },
  { id: 'sdb', name: "Salle d'eau", icon: '🚿', cx: 3.30 - OX, cz: 0.90 - OZ, w: 2.00, d: 1.80, color: '#93c5fd', mapFrom: ['sdb'] },
  { id: 'wc', name: 'WC', icon: '🚽', cx: 4.86 - OX, cz: 0.65 - OZ, w: 0.92, d: 1.30, color: '#c4b5fd' },
  { id: 'chambre2', name: 'Chambre 2', icon: '🛏️', cx: 7.27 - OX, cz: 1.38 - OZ, w: 3.53, d: 2.76, color: '#fda4af' },
  { id: 'chambre1', name: 'Chambre 1', icon: '🛏️', cx: 1.65 - OX, cz: 2.62 - OZ, w: 3.30, d: 2.83, color: '#fdba74', mapFrom: ['chambre'] },
  { id: 'couloir', name: 'Couloir', icon: '🚪', cx: 4.35 - OX, cz: 3.00 - OZ, w: 2.10, d: 2.20, color: '#d6d3d1' },
  { id: 'chambre3', name: 'Chambre 3', icon: '🛏️', cx: 7.27 - OX, cz: 4.17 - OZ, w: 3.53, d: 2.63, color: '#fde047' },
  { id: 'balcon', name: 'Balcon', icon: '☀️', cx: 9.60 - OX, cz: 4.17 - OZ, w: 1.00, d: 2.63, color: '#86efac', mapFrom: ['exterieur'] },
  { id: 'buanderie', name: 'Buanderie', icon: '🧺', cx: 1.43 - OX, cz: 4.62 - OZ, w: 2.86, d: 1.03, color: '#d8b4fe' },
  { id: 'cuisine', name: 'Cuisine', icon: '🍳', cx: 2.19 - OX, cz: 6.80 - OZ, w: 4.38, d: 3.20, color: '#fed7aa', mapFrom: ['cuisine'] },
  { id: 'sejour', name: 'Séjour', icon: '🛋️', cx: 6.77 - OX, cz: 7.00 - OZ, w: 4.53, d: 2.80, color: '#bae6fd', mapFrom: ['salon'] },
]

// Murs — segments [x1, z1, x2, z2] en coordonnées plan → centrées
function wp(x1: number, z1: number, x2: number, z2: number): [number, number, number, number] {
  return [x1 - OX, z1 - OZ, x2 - OX, z2 - OZ]
}

const EXT_WALLS: { pts: [number, number, number, number]; h: number }[] = [
  { pts: wp(0, 0, 9.03, 0), h: 2.5 },
  { pts: wp(9.03, 0, 9.03, 2.85), h: 2.5 },
  { pts: wp(9.10, 2.85, 10.10, 2.85), h: 1.0 },
  { pts: wp(10.10, 2.85, 10.10, 5.48), h: 1.0 },
  { pts: wp(10.10, 5.48, 9.10, 5.48), h: 1.0 },
  { pts: wp(9.03, 5.48, 9.03, 8.40), h: 2.5 },
  { pts: wp(9.03, 8.40, 0, 8.40), h: 2.5 },
  { pts: wp(0, 8.40, 0, 0), h: 2.5 },
]

const INT_WALLS: [number, number, number, number][] = [
  wp(2.22, 0, 2.22, 1.80),
  wp(4.30, 0, 4.30, 1.80),
  wp(5.50, 0, 5.50, 5.50),
  wp(3.30, 1.20, 3.30, 4.10),
  wp(4.50, 5.20, 4.50, 8.40),
  wp(9.03, 2.85, 9.03, 5.48),
  wp(0, 1.20, 2.22, 1.20),
  wp(2.30, 1.80, 5.50, 1.80),
  wp(5.50, 2.76, 9.03, 2.76),
  wp(0, 4.03, 3.30, 4.03),
  wp(3.30, 4.10, 5.50, 4.10),
  wp(0, 5.20, 4.50, 5.20),
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
  color = '#e8e0d4',
}: {
  x1: number; z1: number; x2: number; z2: number
  height?: number; thickness?: number; color?: string
}) {
  const dx = x2 - x1
  const dz = z2 - z1
  const length = Math.sqrt(dx * dx + dz * dz) + thickness
  const cx = (x1 + x2) / 2
  const cz = (z1 + z2) / 2
  const angle = Math.atan2(dx, dz)

  return (
    <mesh position={[cx, height / 2, cz]} rotation={[0, angle, 0]} castShadow receiveShadow>
      <boxGeometry args={[thickness, height, length]} />
      <meshStandardMaterial color={color} roughness={0.85} />
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
  const y = isSelected ? 0.18 : 0.05
  const emissiveIntensity = isSelected ? 0.35 : isHovered ? 0.15 : 0

  return (
    <group>
      <mesh
        position={[room.cx, y, room.cz]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(room.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(room.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = 'default'
        }}
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
  selectedRoom,
  hoveredRoom,
  pendingByRoom,
  onSelect,
  onHover,
}: {
  selectedRoom: string | null
  hoveredRoom: string | null
  pendingByRoom: Record<string, number>
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  return (
    <>
      {/* Éclairage */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 8]} intensity={0.8} castShadow />
      <directionalLight position={[-6, 12, -6]} intensity={0.25} />

      {/* Sol */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#c8c0b4" roughness={1} />
      </mesh>

      {/* Pièces (sols colorés) */}
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
          x1={wall.pts[0]}
          z1={wall.pts[1]}
          x2={wall.pts[2]}
          z2={wall.pts[3]}
          height={wall.h}
          thickness={0.15}
          color="#d4ccc0"
        />
      ))}

      {/* Murs intérieurs */}
      {INT_WALLS.map((pts, i) => (
        <WallMesh
          key={`i${i}`}
          x1={pts[0]}
          z1={pts[1]}
          x2={pts[2]}
          z2={pts[3]}
          height={2.0}
          thickness={0.10}
          color="#ece4d8"
        />
      ))}

      {/* Contrôles caméra orbitale */}
      <OrbitControls
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={22}
        enablePan={true}
        panSpeed={0.5}
      />
    </>
  )
}

// ============ COMPOSANT PRINCIPAL ============

export default function InteractiveHouse({
  tasks,
  colocId,
  currentUserId,
}: {
  tasks: Task[]
  colocId: string
  currentUserId: string
}) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <div className="space-y-6">
      {/* Instructions */}
      <div className="text-center">
        <p className="text-t-faint text-sm">
          Tourne la vue avec la souris · Clique sur une pièce ({totalPending} quête{totalPending > 1 ? 's' : ''} en attente)
        </p>
      </div>

      {/* Canvas 3D */}
      <div
        className="rounded-2xl overflow-hidden border border-b"
        style={{ height: 500, background: '#c8c0b4' }}
      >
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

      {/* Panel des tâches de la pièce sélectionnée */}
      {selectedRoomConfig && (
        <div
          className="bg-surface rounded-2xl border border-b p-5 space-y-4"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: selectedRoomConfig.color }}
            >
              {selectedRoomConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-t-primary">{selectedRoomConfig.name}</h3>
              <p className="text-xs text-t-faint">
                {selectedRoomTasks.filter((t) => t.status === 'pending').length} quête(s) en
                attente
              </p>
            </div>
          </div>

          {selectedRoomTasks.length === 0 ? (
            <p className="text-sm text-t-faint text-center py-6">Aucune quête dans cette pièce</p>
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
                      <p
                        className={`text-sm font-medium truncate ${
                          task.status === 'done' ? 'line-through text-t-faint' : 'text-t-primary'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-t-faint truncate">
                          → {task.assignedTo.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                      task.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700'
                        : task.difficulty === 'hard'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {task.difficulty === 'easy' ? '+20' : task.difficulty === 'hard' ? '+100' : '+50'}{' '}
                    XP
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
