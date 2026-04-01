export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header skeleton */}
      <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface animate-pulse" />
          <div className="h-7 w-28 rounded bg-surface animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface animate-pulse" />
          <div className="h-4 w-20 rounded bg-surface animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Title + button skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-9 w-56 rounded bg-surface animate-pulse" />
          <div className="h-10 w-40 rounded-xl bg-surface animate-pulse" />
        </div>

        {/* Card skeletons */}
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-44 rounded bg-bg-secondary animate-pulse" />
                  <div className="h-4 w-64 rounded bg-bg-secondary animate-pulse" />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-8 h-8 rounded-full bg-bg-secondary border-2 border-surface animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
