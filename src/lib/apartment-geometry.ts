// Geometry data for the apartment floor plan (72.71m², T4)
// All dimensions in meters. Origin (0,0) = top-left (NW corner)
// X axis = left→right (West→East), Z axis = top→bottom (North→South)

export type FloorType = 'wood-light' | 'wood-dark' | 'tile-white' | 'tile-grey' | 'concrete' | 'exterior'

export type WallOpening = {
  wall: 'north' | 'south' | 'east' | 'west'
  offset: number      // distance from start of wall (meters)
  width: number       // opening width (meters)
  type: 'door' | 'window' | 'arch'
}

export type RoomDefinition = {
  id: string
  label: string
  emoji: string
  x: number
  z: number
  width: number
  depth: number
  floorType: FloorType
  isExterior: boolean
  wallOpenings: WallOpening[]
}

// Wall thickness
export const WALL_THICKNESS = 0.12
// Interior wall height
export const WALL_HEIGHT = 2.6
// Exterior railing height (balcon, loggia)
export const RAILING_HEIGHT = 1.0

export const APARTMENT_ROOMS: RoomDefinition[] = [
  // === Row 1: North ===
  {
    id: 'loggia',
    label: 'Loggia',
    emoji: '🌿',
    x: 0,
    z: 0,
    width: 2.22,
    depth: 1.13,
    floorType: 'exterior',
    isExterior: true,
    wallOpenings: [
      { wall: 'south', offset: 0.5, width: 1.2, type: 'door' },
    ],
  },
  {
    id: 'sdb',
    label: 'Salle d\'eau',
    emoji: '🚿',
    x: 2.22,
    z: 0,
    width: 3.40,
    depth: 1.30,
    floorType: 'tile-white',
    isExterior: false,
    wallOpenings: [
      { wall: 'south', offset: 2.5, width: 0.80, type: 'door' },
    ],
  },
  {
    id: 'wc',
    label: 'WC',
    emoji: '🚽',
    x: 5.62,
    z: 0,
    width: 0.92,
    depth: 1.30,
    floorType: 'tile-grey',
    isExterior: false,
    wallOpenings: [
      { wall: 'south', offset: 0.06, width: 0.70, type: 'door' },
    ],
  },
  {
    id: 'chambre2',
    label: 'Chambre 2',
    emoji: '🛏️',
    x: 6.54,
    z: 0,
    width: 3.53,
    depth: 2.76,
    floorType: 'wood-light',
    isExterior: false,
    wallOpenings: [
      { wall: 'south', offset: 0.2, width: 0.80, type: 'door' },
      { wall: 'north', offset: 1.0, width: 1.2, type: 'window' },
    ],
  },

  // === Row 2: Middle ===
  {
    id: 'chambre1',
    label: 'Chambre 1',
    emoji: '🛏️',
    x: 0,
    z: 1.30,
    width: 2.83,
    depth: 3.40,
    floorType: 'wood-light',
    isExterior: false,
    wallOpenings: [
      { wall: 'east', offset: 2.4, width: 0.80, type: 'door' },
      { wall: 'west', offset: 1.0, width: 1.2, type: 'window' },
    ],
  },
  {
    id: 'couloir',
    label: 'Dégagement',
    emoji: '🚪',
    x: 2.83,
    z: 1.30,
    width: 0.91,
    depth: 5.19,
    floorType: 'wood-dark',
    isExterior: false,
    wallOpenings: [
      // Doors to connected rooms are defined on the room side
    ],
  },
  {
    id: 'chambre3',
    label: 'Chambre 3',
    emoji: '🛏️',
    x: 3.74,
    z: 2.76,
    width: 3.53,
    depth: 2.63,
    floorType: 'wood-light',
    isExterior: false,
    wallOpenings: [
      { wall: 'west', offset: 0.3, width: 0.80, type: 'door' },
      { wall: 'east', offset: 0.8, width: 1.2, type: 'window' },
    ],
  },
  {
    id: 'balcon',
    label: 'Balcon',
    emoji: '☀️',
    x: 7.27,
    z: 2.76,
    width: 1.88,
    depth: 4.74,
    floorType: 'exterior',
    isExterior: true,
    wallOpenings: [
      { wall: 'west', offset: 1.5, width: 1.5, type: 'door' },
    ],
  },

  // === Row 3: South ===
  {
    id: 'buanderie',
    label: 'Buanderie',
    emoji: '🧺',
    x: 0,
    z: 4.70,
    width: 1.03,
    depth: 2.86,
    floorType: 'tile-grey',
    isExterior: false,
    wallOpenings: [
      { wall: 'east', offset: 0.3, width: 0.70, type: 'door' },
    ],
  },
  {
    id: 'cuisine',
    label: 'Entrée Cuisine',
    emoji: '🍳',
    x: 1.03,
    z: 4.70,
    width: 3.36,
    depth: 2.86,
    floorType: 'tile-white',
    isExterior: false,
    wallOpenings: [
      { wall: 'north', offset: 2.2, width: 0.90, type: 'arch' },
      { wall: 'south', offset: 1.5, width: 0.90, type: 'door' },  // front door
    ],
  },
  {
    id: 'sejour',
    label: 'Séjour',
    emoji: '🛋️',
    x: 4.39,
    z: 2.76,
    width: 2.88,
    depth: 4.80,
    floorType: 'wood-light',
    isExterior: false,
    wallOpenings: [
      { wall: 'west', offset: 0.3, width: 0.90, type: 'arch' },
      { wall: 'east', offset: 2.0, width: 1.5, type: 'window' },
      { wall: 'south', offset: 0.8, width: 1.5, type: 'window' },
    ],
  },
]

// Overall apartment envelope (for camera framing)
export const APARTMENT_ENVELOPE = {
  width: 10.07,   // max X extent (including balcon)
  depth: 7.56,    // max Z extent
  centerX: 5.04,
  centerZ: 3.78,
}

// Room ID to label mapping (reusable)
export const ROOM_LABELS: Record<string, string> = Object.fromEntries(
  APARTMENT_ROOMS.map((r) => [r.id, r.label])
)

// Floor type to color mapping
export const FLOOR_COLORS = {
  'wood-light': { color: '#d4a574', roughness: 0.8, metalness: 0 },
  'wood-dark': '#8B6F47',
  'tile-white': { color: '#e8e4de', roughness: 0.3, metalness: 0.1 },
  'tile-grey': { color: '#b0aba3', roughness: 0.4, metalness: 0.05 },
  'concrete': { color: '#c0bdb8', roughness: 0.9, metalness: 0 },
  'exterior': { color: '#c0bdb8', roughness: 0.9, metalness: 0 },
} as const
