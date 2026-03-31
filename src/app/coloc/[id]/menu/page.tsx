import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Menu from '@/components/Menu'

export default async function MenuPage({
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
  if (!membership) redirect('/dashboard')

  // Charger le menu le plus récent
  const latestMenu = await prisma.weeklyMenu.findFirst({
    where: { colocId: id },
    orderBy: { createdAt: 'desc' },
  })

  const initialMenu = latestMenu ? {
    id: latestMenu.id,
    meals: JSON.parse(latestMenu.meals),
    shoppingList: latestMenu.shoppingList ? JSON.parse(latestMenu.shoppingList) : null,
    nbPersons: latestMenu.nbPersons,
    restrictions: latestMenu.restrictions,
    budget: latestMenu.budget,
  } : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/coloc/${id}`} className="text-gray-500 hover:text-gray-700">
          ←
        </Link>
        <span className="text-xl">🍽️</span>
        <h1 className="text-lg font-bold text-gray-900">{coloc.name} — Menu & Courses</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Menu colocId={id} initialMenu={initialMenu} />
      </main>
    </div>
  )
}
