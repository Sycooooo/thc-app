'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  difficulty: string
  room: string | null
  assignedTo: { id: string; username: string; avatar: string | null } | null
}

type RoomConfig = {
  id: string
  name: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  color: string
  depth: string
  mapFrom?: string[]
}

const ROOMS: RoomConfig[] = [
  // Rangée du haut
  { id: 'loggia', name: 'Loggia', icon: '🌿', x: 0, y: 0, w: 106, h: 54, color: '#bbf7d0', depth: '#22c55e' },
  { id: 'sdb', name: "Salle d'eau", icon: '🚿', x: 110, y: 0, w: 106, h: 88, color: '#bfdbfe', depth: '#3b82f6', mapFrom: ['sdb'] },
  { id: 'wc', name: 'WC', icon: '🚽', x: 220, y: 0, w: 52, h: 62, color: '#ddd6fe', depth: '#8b5cf6' },
  { id: 'chambre2', name: 'Chambre 2', icon: '🛏️', x: 280, y: 0, w: 176, h: 136, color: '#fecdd3', depth: '#f43f5e' },

  // Rangée du milieu
  { id: 'chambre1', name: 'Chambre 1', icon: '🛏️', x: 0, y: 58, w: 156, h: 140, color: '#fed7aa', depth: '#f97316', mapFrom: ['chambre'] },
  { id: 'couloir', name: 'Couloir', icon: '🚪', x: 160, y: 92, w: 78, h: 110, color: '#e7e5e4', depth: '#78716c' },
  { id: 'chambre3', name: 'Chambre 3', icon: '🛏️', x: 280, y: 140, w: 176, h: 126, color: '#fef08a', depth: '#eab308' },
  { id: 'balcon', name: 'Balcon', icon: '☀️', x: 460, y: 140, w: 52, h: 126, color: '#bbf7d0', depth: '#22c55e', mapFrom: ['exterieur'] },

  // Rangée du bas
  { id: 'buanderie', name: 'Buanderie', icon: '🧺', x: 0, y: 202, w: 130, h: 46, color: '#e9d5ff', depth: '#a855f7' },
  { id: 'cuisine', name: 'Cuisine', icon: '🍳', x: 0, y: 252, w: 234, h: 162, color: '#ffedd5', depth: '#ea580c', mapFrom: ['cuisine'] },
  { id: 'sejour', name: 'Séjour', icon: '🛋️', x: 244, y: 270, w: 212, h: 144, color: '#e0f2fe', depth: '#0ea5e9', mapFrom: ['salon'] },
]

function getRoomIdForTask(taskRoom: string | null): string | null {
  if (!taskRoom) return null
  const direct = ROOMS.find((r) => r.id === taskRoom)
  if (direct) return direct.id
  const mapped = ROOMS.find((r) => r.mapFrom?.includes(taskRoom))
  return mapped?.id || null
}

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
  const router = useRouter()

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

  const activeRoom = hoveredRoom || selectedRoom
  const activeRoomConfig = ROOMS.find((r) => r.id === activeRoom)
  const selectedRoomConfig = ROOMS.find((r) => r.id === selectedRoom)
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

  return (
    <div className="space-y-6">
      {/* En-tête avec info pièce survolée */}
      <div className="text-center h-10 flex items-center justify-center">
        {activeRoomConfig ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeRoomConfig.icon}</span>
            <span className="text-lg font-semibold text-t-primary">
              {activeRoomConfig.name}
            </span>
            {(pendingByRoom[activeRoomConfig.id] || 0) > 0 && (
              <span className="text-sm text-accent-secondary font-medium">
                — {pendingByRoom[activeRoomConfig.id]} quête(s)
              </span>
            )}
          </div>
        ) : (
          <p className="text-t-faint text-sm">
            Clique sur une pièce pour voir ses quêtes ({totalPending} en attente)
          </p>
        )}
      </div>

      {/* Maison isométrique */}
      <div className="flex justify-center overflow-x-auto px-4 pb-6">
        <div
          className="relative flex-shrink-0"
          style={{
            width: 516,
            height: 418,
            transform: 'perspective(1200px) rotateX(25deg)',
            transformOrigin: 'center 60%',
          }}
        >
          {/* Sol / fond de l'appartement */}
          <div
            className="absolute rounded-2xl"
            style={{
              left: -8,
              top: -8,
              width: 532,
              height: 434,
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
            }}
          />

          {/* Pièces */}
          {ROOMS.map((room) => {
            const pending = pendingByRoom[room.id] || 0
            const isSelected = selectedRoom === room.id
            const isHovered = hoveredRoom === room.id

            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
                className="absolute flex flex-col items-center justify-center gap-0.5 outline-none"
                style={{
                  left: room.x,
                  top: room.y,
                  width: room.w,
                  height: room.h,
                  backgroundColor: room.color,
                  borderRadius: 8,
                  border: `2px solid ${isSelected ? room.depth : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: isSelected
                    ? `0 8px 0 ${room.depth}, 0 12px 24px rgba(0,0,0,0.15)`
                    : isHovered
                      ? `0 6px 0 ${room.depth}, 0 8px 16px rgba(0,0,0,0.1)`
                      : `0 4px 0 ${room.depth}, 0 4px 8px rgba(0,0,0,0.05)`,
                  transform: isSelected
                    ? 'translateY(-6px)'
                    : isHovered
                      ? 'translateY(-3px)'
                      : 'translateY(0)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  zIndex: isSelected ? 10 : isHovered ? 5 : 1,
                }}
              >
                <span style={{ fontSize: room.w < 60 ? 16 : room.w < 100 ? 20 : 26 }}>
                  {room.icon}
                </span>
                {room.w >= 90 && (
                  <span
                    className="font-bold leading-tight text-center px-1"
                    style={{ fontSize: room.w < 130 ? 9 : 11, color: '#44403c' }}
                  >
                    {room.name}
                  </span>
                )}

                {/* Badge nombre de quêtes */}
                {pending > 0 && (
                  <span
                    className="absolute flex items-center justify-center font-bold text-white"
                    style={{
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      fontSize: 11,
                      backgroundColor: '#ef4444',
                      borderRadius: '50%',
                      boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                      animation: pending > 0 ? 'pulse 2s infinite' : undefined,
                    }}
                  >
                    {pending}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel des tâches de la pièce sélectionnée */}
      {selectedRoomConfig && (
        <div className="bg-surface rounded-2xl border border-b p-5 space-y-4">
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
            <p className="text-sm text-t-faint text-center py-6">
              Aucune quête dans cette pièce
            </p>
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
                          task.status === 'done'
                            ? 'line-through text-t-faint'
                            : 'text-t-primary'
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
                    {task.difficulty === 'easy'
                      ? '+20'
                      : task.difficulty === 'hard'
                        ? '+100'
                        : '+50'}{' '}
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
