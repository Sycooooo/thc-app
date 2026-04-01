import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import HomeButtons from './HomeButtons'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg p-8">
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
