'use client'

export default function Error({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">😬</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Oups, quelque chose s&apos;est mal passé
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Pas de panique, ça arrive. Essaie de recharger la page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
