'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

const OX = 5.05
const OZ = 4.18

function pc(x: number, z: number, w: number, d: number) {
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

const CHAMBRE_IDS = ['chambre1', 'chambre2', 'chambre3']

// ============ MURS ============

function wp(x1: number, z1: number, x2: number, z2: number): [number, number, number, number] {
  return [x1 - OX, z1 - OZ, x2 - OX, z2 - OZ]
}

const EXT_WALLS: { pts: [number, number, number, number]; h: number }[] = [
  { pts: wp(0, 0, 9.10, 0), h: 2.5 },
  { pts: wp(9.10, 0, 9.10, 8.35), h: 2.5 },
  { pts: wp(9.10, 8.35, 0, 8.35), h: 2.5 },
  { pts: wp(0, 8.35, 0, 0), h: 2.5 },
  { pts: wp(9.10, 0, 10.10, 0), h: 1.0 },
  { pts: wp(10.10, 0, 10.10, 8.35), h: 1.0 },
  { pts: wp(10.10, 8.35, 9.10, 8.35), h: 1.0 },
]

const INT_WALLS: [number, number, number, number][] = [
  wp(2.22, 0, 2.22, 1.80),
  wp(4.42, 0, 4.42, 1.80),
  wp(5.50, 0, 5.50, 5.40),
  wp(3.40, 1.13, 3.40, 4.00),
  wp(2.86, 4.00, 2.86, 5.10),
  wp(0, 1.13, 2.22, 1.13),
  wp(2.22, 1.80, 5.50, 1.80),
  wp(5.50, 2.76, 9.10, 2.76),
  wp(0, 4.00, 3.40, 4.00),
  wp(0, 5.10, 2.86, 5.10),
]

// ============ MAPPING ============

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
  viewCenter,
}: {
  x1: number; z1: number; x2: number; z2: number
  height?: number; thickness?: number; color?: string
  viewCenter?: [number, number]
}) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const wallCx = (x1 + x2) / 2
  const wallCz = (z1 + z2) / 2
  const vcx = viewCenter?.[0] ?? 0
  const vcz = viewCenter?.[1] ?? 0

  useFrame(({ camera }) => {
    if (!materialRef.current) return
    const relWx = wallCx - vcx
    const relWz = wallCz - vcz
    const relCx = camera.position.x - vcx
    const relCz = camera.position.z - vcz
    const dot = relWx * relCx + relWz * relCz
    const heightRatio = Math.min(camera.position.y / 14, 1)
    const target = dot > 0 ? 0.06 + heightRatio * 0.84 : 0.92
    materialRef.current.opacity += (target - materialRef.current.opacity) * 0.08
  })

  const dx = x2 - x1
  const dz = z2 - z1
  const length = Math.sqrt(dx * dx + dz * dz) + thickness
  const angle = Math.atan2(dx, dz)

  return (
    <mesh position={[wallCx, height / 2, wallCz]} rotation={[0, angle, 0]} castShadow receiveShadow>
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
  room, isSelected, isHovered, pending, onSelect, onHover, showLabel = true,
}: {
  room: Room3D
  isSelected: boolean
  isHovered: boolean
  pending: number
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  showLabel?: boolean
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
        <meshStandardMaterial color={room.color} emissive={room.color} emissiveIntensity={emissiveIntensity} roughness={0.5} />
      </mesh>

      {showLabel && (
        <Html position={[room.cx, 3.2, room.cz]} center distanceFactor={14} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            background: isSelected ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)',
            color: isSelected ? '#fff' : '#1c1917',
            padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
            backdropFilter: 'blur(8px)',
            boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.1)',
            border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.06)',
          }}>
            <span>{room.icon}</span>
            <span>{room.name}</span>
            {pending > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: 10, fontWeight: 800, minWidth: 16, textAlign: 'center' }}>
                {pending}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

// Murs isolés autour d'une chambre
function ChambreWalls({ room }: { room: Room3D }) {
  const vc: [number, number] = [room.cx, room.cz]
  const h = 2.5
  const t = 0.12
  const halfW = room.w / 2
  const halfD = room.d / 2

  return (
    <group>
      <WallMesh x1={room.cx - halfW} z1={room.cz - halfD} x2={room.cx + halfW} z2={room.cz - halfD} height={h} thickness={t} color="#d4ccc0" viewCenter={vc} />
      <WallMesh x1={room.cx - halfW} z1={room.cz + halfD} x2={room.cx + halfW} z2={room.cz + halfD} height={h} thickness={t} color="#d4ccc0" viewCenter={vc} />
      <WallMesh x1={room.cx - halfW} z1={room.cz - halfD} x2={room.cx - halfW} z2={room.cz + halfD} height={h} thickness={t} color="#d4ccc0" viewCenter={vc} />
      <WallMesh x1={room.cx + halfW} z1={room.cz - halfD} x2={room.cx + halfW} z2={room.cz + halfD} height={h} thickness={t} color="#d4ccc0" viewCenter={vc} />
    </group>
  )
}

// Caméra animée avec transition douce
function AnimatedControls({
  targetPosition,
  targetLookAt,
  minDist,
  maxDist,
}: {
  targetPosition: THREE.Vector3
  targetLookAt: THREE.Vector3
  minDist: number
  maxDist: number
}) {
  const controlsRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useFrame(({ camera }) => {
    camera.position.lerp(targetPosition, 0.04)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt, 0.04)
      controlsRef.current.update()
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={minDist}
      maxDistance={maxDist}
      enablePan={true}
      panSpeed={0.5}
    />
  )
}

// ============ SCÈNE ============

function Scene({
  selectedRoom, hoveredRoom, pendingByRoom, focusedChambre,
  onSelect, onHover,
}: {
  selectedRoom: string | null
  hoveredRoom: string | null
  pendingByRoom: Record<string, number>
  focusedChambre: string | null
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const focusedRoom = focusedChambre ? ROOMS_3D.find((r) => r.id === focusedChambre) : null
  const isFocused = focusedRoom !== null

  const cameraPos = useMemo(
    () =>
      focusedRoom
        ? new THREE.Vector3(focusedRoom.cx + 3, 5, focusedRoom.cz + 3)
        : new THREE.Vector3(0, 14, 10),
    [focusedRoom]
  )
  const lookAt = useMemo(
    () =>
      focusedRoom
        ? new THREE.Vector3(focusedRoom.cx, 0, focusedRoom.cz)
        : new THREE.Vector3(0, 0, 0),
    [focusedRoom]
  )

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 8]} intensity={0.8} castShadow />
      <directionalLight position={[-6, 12, -6]} intensity={0.25} />

      {/* Sol */}
      <mesh position={[0, -0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[25, 25]} />
        <meshStandardMaterial color="#c8c0b4" roughness={1} />
      </mesh>

      {/* === VUE APPARTEMENT === */}
      {!isFocused && (
        <>
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
          {EXT_WALLS.map((wall, i) => (
            <WallMesh key={`e${i}`} x1={wall.pts[0]} z1={wall.pts[1]} x2={wall.pts[2]} z2={wall.pts[3]} height={wall.h} thickness={0.15} color="#d4ccc0" />
          ))}
          {INT_WALLS.map((pts, i) => (
            <WallMesh key={`i${i}`} x1={pts[0]} z1={pts[1]} x2={pts[2]} z2={pts[3]} height={2.0} thickness={0.10} color="#ece4d8" />
          ))}
        </>
      )}

      {/* === VUE CHAMBRE ISOLÉE === */}
      {isFocused && focusedRoom && (
        <>
          <RoomFloor
            room={focusedRoom}
            isSelected={true}
            isHovered={false}
            pending={pendingByRoom[focusedRoom.id] || 0}
            onSelect={() => {}}
            onHover={() => {}}
            showLabel={true}
          />
          <ChambreWalls room={focusedRoom} />
        </>
      )}

      <AnimatedControls
        targetPosition={cameraPos}
        targetLookAt={lookAt}
        minDist={isFocused ? 2 : 4}
        maxDist={isFocused ? 10 : 22}
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
  const [focusedChambre, setFocusedChambre] = useState<string | null>(null)
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

  const totalPending = tasks.filter((t) => t.status === 'pending').length

  // Pièce affichée dans le panel (chambre focusée ou room sélectionnée)
  const activeRoomId = focusedChambre || selectedRoom
  const activeRoomConfig = ROOMS_3D.find((r) => r.id === activeRoomId)
  const activeRoomTasks = activeRoomId
    ? (tasksByRoom[activeRoomId] || []).sort(
        (a, b) => (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0)
      )
    : []

  async function completeTask(taskId: string) {
    await api.patch(`/api/tasks/${taskId}`, { status: 'done' })
    router.refresh()
  }

  function handleSelect(id: string) {
    if (CHAMBRE_IDS.includes(id)) {
      // Clic chambre → zoom isolé
      setFocusedChambre(focusedChambre === id ? null : id)
      setSelectedRoom(null)
    } else {
      // Autre pièce → panel de tâches
      setSelectedRoom(selectedRoom === id ? null : id)
    }
  }

  function handleBack() {
    setFocusedChambre(null)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Bar d'info */}
      <div className="text-center py-2 flex-shrink-0 relative">
        {focusedChambre ? (
          <button
            onClick={handleBack}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-accent font-medium hover:text-accent-hover transition flex items-center gap-1"
          >
            ← Appartement
          </button>
        ) : null}
        <p className="text-t-faint text-xs">
          {focusedChambre
            ? `Vue ${ROOMS_3D.find((r) => r.id === focusedChambre)?.name} · Tourne avec la souris`
            : `Tourne la vue · Clique sur une chambre pour entrer · ${totalPending} quête${totalPending !== 1 ? 's' : ''} en attente`}
        </p>
      </div>

      {/* Canvas 3D */}
      <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-b mx-4" style={{ background: '#c8c0b4' }}>
        {mounted && (
          <Canvas camera={{ position: [0, 14, 10], fov: 45 }} shadows>
            <Scene
              selectedRoom={selectedRoom}
              hoveredRoom={hoveredRoom}
              pendingByRoom={pendingByRoom}
              focusedChambre={focusedChambre}
              onSelect={handleSelect}
              onHover={setHoveredRoom}
            />
          </Canvas>
        )}
      </div>

      {/* Panel des tâches */}
      {activeRoomConfig && (
        <div
          className="flex-shrink-0 mx-4 mt-4 mb-4 bg-surface rounded-2xl border border-b p-4 space-y-3 max-h-64 overflow-y-auto"
          style={{ boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: activeRoomConfig.color }}>
              {activeRoomConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-t-primary">{activeRoomConfig.name}</h3>
              <p className="text-xs text-t-faint">
                {activeRoomTasks.filter((t) => t.status === 'pending').length} quête(s) en attente
              </p>
            </div>
          </div>

          {activeRoomTasks.length === 0 ? (
            <p className="text-sm text-t-faint text-center py-4">Aucune quête dans cette pièce</p>
          ) : (
            <div className="space-y-2">
              {activeRoomTasks.map((task) => (
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
                      <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center text-white text-xs flex-shrink-0">✓</span>
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-t-faint' : 'text-t-primary'}`}>
                        {task.title}
                      </p>
                      {task.assignedTo && <p className="text-xs text-t-faint truncate">→ {task.assignedTo.username}</p>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
                    task.difficulty === 'easy' ? 'bg-green-100 text-green-700' : task.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
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
