import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PageTransition from '@/components/PageTransition'
import PageAmbiance from '@/components/ui/PageAmbiance'

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

type SectionSummary = {
  type: string
  icon: string
  title: string
  articles: { title: string }[]
}

function formatDate(date: Date) {
  const d = new Date(date)
  return `${DAYS_FR[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_FR[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatDateSlug(date: Date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function scoreColor(score: number) {
  if (score >= 8.5) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  if (score >= 7) return 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  if (score >= 5) return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  return 'text-t-faint border-[var(--border)] bg-[var(--surface)]'
}

export default async function BriefingArchivePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const coloc = await prisma.colocation.findUnique({
    where: { id },
    select: { id: true, name: true },
  })
  if (!coloc) notFound()

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId: id } },
  })
  if (!membership) redirect('/')

  const briefings = await prisma.briefing.findMany({
    orderBy: { date: 'desc' },
    select: { id: true, date: true, score: true, sections: true },
  })

  return (
    <div className="min-h-screen relative z-10" data-room="bureau">
      <PageAmbiance theme="bureau" />
      <header className="glass-header-lofi sticky top-0 z-40 px-6 py-4 flex items-center gap-3">
        <Link href={`/coloc/${id}`} className="text-t-muted hover:text-t-primary transition">
          ←
        </Link>
        <span className="text-xl">📡</span>
        <h1 className="font-display text-2xl tracking-wide text-t-primary uppercase neon-title">Briefings</h1>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <PageTransition>
          <div className="space-y-3">
            {briefings.length === 0 ? (
              <p className="text-center text-t-faint py-12">Aucun briefing disponible</p>
            ) : (
              briefings.map((b) => {
                const sections = b.sections as unknown as SectionSummary[]
                return (
                  <Link key={b.id} href={`/coloc/${id}/briefing/${formatDateSlug(b.date)}`} className="block">
                    <div className="card card-glow p-4 hover:border-accent/30 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-t-primary">{formatDate(b.date)}</span>
                        {b.score > 0 && (
                          <span className={`font-pixel text-[10px] px-2 py-0.5 rounded border ${scoreColor(b.score)}`}>
                            {b.score}/10
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {sections.map((s) => (
                          <div key={s.type} className="flex items-center gap-2">
                            <span className="text-xs">{s.icon}</span>
                            <span className="text-xs text-t-muted truncate">
                              {s.articles[0]?.title || s.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </PageTransition>
      </main>
    </div>
  )
}
