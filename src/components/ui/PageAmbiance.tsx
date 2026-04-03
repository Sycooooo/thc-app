'use client'

const backgroundImages: Record<string, string> = {
  salon: '/backgrounds/salon.png',
  chambre: '/backgrounds/chambre.png',
  bureau: '/backgrounds/bureau.png',
  cuisine: '/backgrounds/cuisine.png',
  studio: '/backgrounds/studio.png',
  profil: '/backgrounds/profil.png',
  accueil: '/backgrounds/accueil.png',
}

interface PageAmbianceProps {
  theme: string
  backgroundImage?: string
  opacity?: number
}

export default function PageAmbiance({ theme, backgroundImage, opacity = 0.70 }: PageAmbianceProps) {
  const bgImage = backgroundImage ?? backgroundImages[theme]

  if (!bgImage) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <img
        src={bgImage}
        alt=""
        className="w-full h-full object-cover pixel-art"
        style={{ opacity }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/50 via-transparent to-transparent" />
    </div>
  )
}
