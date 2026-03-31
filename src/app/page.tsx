import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🏠</div>
        <h1 className="font-display text-6xl tracking-wide text-t-primary uppercase mb-4">
          THC App
        </h1>
        <p className="text-t-muted mb-8 text-lg">
          Gérez les tâches ménagères avec vos colocataires, sans prise de tête.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent-hover transition"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-surface text-accent border border-accent/30 rounded-xl font-medium hover:bg-surface-hover transition"
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </main>
  )
}
