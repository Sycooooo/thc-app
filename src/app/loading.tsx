export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-t-muted text-sm">Chargement...</p>
      </div>
    </div>
  )
}
