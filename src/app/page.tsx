import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HomeButtons from './HomeButtons'
import PageAmbiance from '@/components/ui/PageAmbiance'
import PageTransition from '@/components/PageTransition'
import PixelIcon from '@/components/ui/PixelIcon'

export default async function Home() {
  const session = await auth()

  if (session?.user?.id) {
    // Chercher la coloc unique de l'utilisateur
    const membership = await prisma.userColoc.findFirst({
      where: { userId: session.user.id },
    })
    if (membership) {
      redirect(`/coloc/${membership.colocId}`)
    } else {
      redirect('/coloc/new')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative z-10">
      <PageAmbiance theme="accueil" opacity={0.80} />
      <PageTransition>
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <PixelIcon name="home" size={48} className="text-accent" />
        </div>
        <h1 className="mb-2 neon-title">
          <span className="font-pixel text-2xl text-accent">THC</span>
          <span className="font-display text-6xl tracking-wide text-t-primary uppercase ml-2">App</span>
        </h1>
        <p className="font-pixel text-[9px] text-accent/60 mb-3 tracking-wider">
          Coloc &middot; Gamification &middot; Pixel Art
        </p>
        <p className="text-t-muted mb-8 text-lg">
          Gérez les tâches ménagères avec vos colocataires, sans prise de tête.
        </p>
        <HomeButtons />
      </div>
      </PageTransition>
    </main>
  )
}
