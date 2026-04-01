import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getValidToken } from '@/lib/spotify'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  try {
    const token = await getValidToken(session.user.id)
    return NextResponse.json({ token })
  } catch {
    return NextResponse.json({ error: 'Spotify non connecte' }, { status: 400 })
  }
}
