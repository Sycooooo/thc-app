import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HomeButtons from './HomeButtons'
import PageAmbiance from '@/components/ui/PageAmbiance'

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
      <PageAmbiance theme="accueil" />
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🏠</div>
        <h1 className="font-display text-6xl tracking-wide text-t-primary uppercase mb-4 neon-title">
          THC App
        </h1>
        <p className="text-t-muted mb-8 text-lg">
          Gérez les tâches ménagères avec vos colocataires, sans prise de tête.
        </p>
        <HomeButtons />
      </div>
    </main>
  )
}
