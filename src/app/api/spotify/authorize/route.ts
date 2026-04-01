import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAuthorizationUrl } from '@/lib/spotify'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL))
  }

  const state = crypto.randomUUID()
  const cookieStore = await cookies()

  cookieStore.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  cookieStore.set('spotify_link_user', session.user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return NextResponse.redirect(getAuthorizationUrl(state))
}
