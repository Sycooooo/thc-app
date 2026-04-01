'use client'

import Link from 'next/link'

export default function DashboardError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🏠</div>
        <h1 className="font-display text-2xl tracking-wide text-t-primary uppercase mb-2">
          Impossible de charger vos colocations
        </h1>
        <p className="text-t-muted text-sm mb-6">
          Vérifiez votre connexion et réessayez.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 text-t-muted hover:text-t-primary transition text-sm"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
