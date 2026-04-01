import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ColocNav from '@/components/ColocNav'

export default async function ColocLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params

  return (
    <>
      <div className="pb-14">{children}</div>
      <ColocNav colocId={id} currentUserId={session.user.id} />
    </>
  )
}
