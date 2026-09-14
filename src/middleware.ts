import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // En HTTPS (prod Vercel), Auth.js pose le cookie `__Secure-authjs.session-token` ;
  // sans `secureCookie: true`, getToken cherche le nom non sécurisé et ne trouve rien.
  const secureCookie = request.nextUrl.protocol === 'https:'
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
    cookieName: secureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token',
  })
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublic = pathname === '/'
  const isApi = pathname.startsWith('/api')

  if (!token && !isAuthPage && !isPublic && !isApi) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|backgrounds/|.*\\..*).*)'],
}
