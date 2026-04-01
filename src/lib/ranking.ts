// === Système de Ranking Compétitif ===
// Progression par saison (60 jours), reset soft entre saisons.
// Inspiré LoL/Valorant, adapté à l'univers Midnight Aesthetic.

// ─── Rangs ───────────────────────────────────────────────

export const RANKS = [
  { tier: 0, name: 'Toz',          icon: '🗑️', color: '#6b7280', glow: 'rgba(107,114,128,0.3)' },
  { tier: 1, name: 'Shit',         icon: '💩', color: '#92603a', glow: 'rgba(146,96,58,0.3)' },
  { tier: 2, name: 'Beurre',       icon: '🧈', color: '#d4a843', glow: 'rgba(212,168,67,0.3)' },
  { tier: 3, name: 'Skunk',        icon: '🌿', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
  { tier: 4, name: 'Purple Haze',  icon: '💜', color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
  { tier: 5, name: 'Amnesia',      icon: '🌀', color: '#ec4899', glow: 'rgba(236,72,153,0.4)' },
  { tier: 6, name: 'OG Kush',      icon: '👑', color: '#f97316', glow: 'rgba(249,115,22,0.4)' },
  { tier: 7, name: 'Double Zéro',  icon: '💎', color: '#e8c97a', glow: 'rgba(232,201,122,0.5)' },
] as const

// Seuils d'XP pour entrer dans chaque rang (cumulatif depuis le début de saison)
// Calibré pour qu'une saison parfaite (toutes ses tâches) → OG Kush (~15500 RP)
// Double Zéro (23000) = toutes ses tâches + moitié de celles d'un autre coloc
export const RANK_THRESHOLDS = [0, 300, 900, 2000, 4000, 7500, 12000, 23000]

// Divisions : IV (bas) → I (haut). Ethereal (tier 7) n'a pas de divisions.
export const DIVISIONS = ['IV', 'III', 'II', 'I'] as const

export const SEASON_DURATION_DAYS = 60

// ─── Types ───────────────────────────────────────────────

export type RankInfo = {
  tier: number
  name: string
  icon: string
  color: string
  glow: string
  division: string | null        // null pour Ethereal
  divisionIndex: number          // 0-3 (IV=0, I=3), -1 pour Ethereal
  label: string                  // "Night Owl III"
  key: string                    // "night_owl_3" (pour la DB)
  points: number                 // points actuels
  pointsForCurrentDiv: number    // seuil de la division actuelle
  pointsForNextDiv: number       // seuil de la prochaine division
  progressPercent: number        // 0-100 vers la prochaine division
  isMaxRank: boolean
}

// ─── Calculs ─────────────────────────────────────────────

export function getRankFromPoints(points: number): RankInfo {
  // Trouver le tier
  let tier = 0
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= RANK_THRESHOLDS[i]) {
      tier = i
      break
    }
  }

  const rank = RANKS[tier]

  // Ethereal (tier 7) — pas de divisions
  if (tier === 7) {
    return {
      ...rank,
      division: null,
      divisionIndex: -1,
      label: 'Ethereal',
      key: 'ethereal',
      points,
      pointsForCurrentDiv: RANK_THRESHOLDS[7],
      pointsForNextDiv: RANK_THRESHOLDS[7],
      progressPercent: 100,
      isMaxRank: true,
    }
  }

  // Calculer la division dans le tier
  const tierStart = RANK_THRESHOLDS[tier]
  const tierEnd = RANK_THRESHOLDS[tier + 1]
  const tierRange = tierEnd - tierStart
  const divisionSize = tierRange / 4

  const pointsInTier = points - tierStart
  const divisionIndex = Math.min(3, Math.floor(pointsInTier / divisionSize))
  const division = DIVISIONS[divisionIndex]

  const divStart = tierStart + divisionIndex * divisionSize
  const divEnd = divisionIndex < 3
    ? tierStart + (divisionIndex + 1) * divisionSize
    : tierEnd

  const progressPercent = divEnd > divStart
    ? Math.min(100, Math.round(((points - divStart) / (divEnd - divStart)) * 100))
    : 100

  const nameSlug = rank.name.toLowerCase().replace(/\s+/g, '_')
  const divNum = divisionIndex + 1

  return {
    ...rank,
    division,
    divisionIndex,
    label: `${rank.name} ${division}`,
    key: `${nameSlug}_${divNum}`,
    points,
    pointsForCurrentDiv: Math.round(divStart),
    pointsForNextDiv: Math.round(divEnd),
    progressPercent,
    isMaxRank: false,
  }
}

// ─── Détection de rank-up ────────────────────────────────

export function detectRankChange(
  oldPoints: number,
  newPoints: number
): { type: 'division_up' | 'tier_up' | 'none'; oldRank: RankInfo; newRank: RankInfo } {
  const oldRank = getRankFromPoints(oldPoints)
  const newRank = getRankFromPoints(newPoints)

  if (newRank.tier > oldRank.tier) {
    return { type: 'tier_up', oldRank, newRank }
  }
  if (newRank.tier === oldRank.tier && newRank.divisionIndex > oldRank.divisionIndex) {
    return { type: 'division_up', oldRank, newRank }
  }
  return { type: 'none', oldRank, newRank }
}

// ─── Saison : Soft Reset ─────────────────────────────────

// Réduit les points de 60% → un joueur Midnight (~10000) repart Dusk Walker (~4000)
export function softResetPoints(points: number): number {
  return Math.floor(points * 0.4)
}

// Récompenses de fin de saison par tier atteint
export const SEASON_REWARDS: Record<number, { type: string; description: string; coins: number }> = {
  0: { type: 'badge',  description: 'Badge Toz',             coins: 0 },
  1: { type: 'badge',  description: 'Badge Shit',            coins: 10 },
  2: { type: 'badge',  description: 'Badge Beurre',          coins: 25 },
  3: { type: 'border', description: 'Bordure Skunk',         coins: 50 },
  4: { type: 'border', description: 'Bordure Purple Haze',   coins: 100 },
  5: { type: 'title',  description: 'Titre "Amnesia"',       coins: 200 },
  6: { type: 'title',  description: 'Titre "OG Kush"',       coins: 400 },
  7: { type: 'title',  description: 'Titre "Double Zéro"',   coins: 1000 },
}

// ─── Tableau complet ─────────────────────────────────────
// Génère le tableau de correspondance rang/division/XP

export function getRankTable(): { rank: string; division: string; xpRequired: number }[] {
  const table: { rank: string; division: string; xpRequired: number }[] = []

  for (let tier = 0; tier < 7; tier++) {
    const rank = RANKS[tier]
    const tierStart = RANK_THRESHOLDS[tier]
    const tierEnd = RANK_THRESHOLDS[tier + 1]
    const divSize = (tierEnd - tierStart) / 4

    for (let d = 0; d < 4; d++) {
      table.push({
        rank: rank.name,
        division: DIVISIONS[d],
        xpRequired: Math.round(tierStart + d * divSize),
      })
    }
  }

  table.push({ rank: 'Ethereal', division: '—', xpRequired: 30000 })
  return table
}
