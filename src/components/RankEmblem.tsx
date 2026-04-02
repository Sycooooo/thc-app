'use client'

// Images Midjourney pour chaque rang.
// Placer les images dans /public/ranks/ avec les noms ci-dessous.

const RANK_IMAGES = [
  '/ranks/pneu.png',
  '/ranks/teu-teu.png',
  '/ranks/fent.png',
  '/ranks/spanli.png',
  '/ranks/static.png',
  '/ranks/white-widow.png',
  '/ranks/og-kush.png',
  '/ranks/piatella.png',
]

export default function RankEmblem({ tier, size = 80 }: { tier: number; size?: number }) {
  const src = RANK_IMAGES[tier] || RANK_IMAGES[0]

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  )
}
