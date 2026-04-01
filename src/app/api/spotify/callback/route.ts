import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { exchangeCode, getSpotifyProfile } from '@/lib/spotify'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (error) {
    return NextResponse.redirect(`${baseUrl}/profile/settings?spotify=error`)
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get('spotify_oauth_state')?.value
  const userId = cookieStore.get('spotify_link_user')?.value

  if (!code || !state || state !== savedState || !userId) {
    return NextResponse.redirect(`${baseUrl}/profile/settings?spotify=error`)
  }

  // Nettoyer les cookies
  cookieStore.delete('spotify_oauth_state')
  cookieStore.delete('spotify_link_user')

  try {
    const tokens = await exchangeCode(code)
    const profile = await getSpotifyProfile(tokens.access_token)

    await prisma.spotifyAccount.upsert({
      where: { userId },
      create: {
        userId,
        spotifyUserId: profile.id,
        displayName: profile.displayName,
        profileUrl: profile.profileUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
      update: {
        spotifyUserId: profile.id,
        displayName: profile.displayName,
        profileUrl: profile.profileUrl,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
    })

    return NextResponse.redirect(`${baseUrl}/profile/settings?spotify=linked`)
  } catch (err) {
    console.error('Erreur callback Spotify:', err)
    return NextResponse.redirect(`${baseUrl}/profile/settings?spotify=error`)
  }
}
