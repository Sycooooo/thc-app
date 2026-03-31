import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import InteractiveHouse from '@/components/InteractiveHouse'
import NotificationBell from '@/components/NotificationBell'

export default async function MaisonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  const coloc = await prisma.colocation.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, username: true } } },
      },
    },
  })

  if (!coloc) notFound()

  const isMember = coloc.members.some((m) => m.userId === session.user!.id)
  if (!isMember) redirect('/dashboard')

  // Charger toutes les tâches de la coloc avec leur pièce
  const tasks = await prisma.task.findMany({
    where: { colocId: id },
    include: {
      assignedTo: { select: { id: true, username: true, avatar: true } },
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-bg-secondary border-b border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/coloc/${id}`} className="text-t-muted hover:text-t-primary transition">
            ←
          </Link>
          <span className="text-xl">🏠</span>
          <h1 className="text-xl font-bold text-t-primary">Maison</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/coloc/${id}`}
            className="text-xs bg-bg-secondary text-t-muted px-3 py-1.5 rounded-full font-medium hover:bg-surface-hover transition"
          >
            📋 Quêtes
          </Link>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <InteractiveHouse
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            difficulty: t.difficulty,
            room: t.room,
            assignedTo: t.assignedTo,
          }))}
          colocId={id}
          currentUserId={session.user!.id}
        />
      </main>
    </div>
  )
}
