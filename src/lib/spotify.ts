import { prisma } from './prisma'

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI!

const SCOPES = [
  'user-read-currently-playing',
  'user-top-read',
  'streaming',
  'user-read-email',
  'user-read-private',
].join(' ')

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'

// === OAuth ===

export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCode(code: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  })
  if (!res.ok) throw new Error('Echec echange code Spotify')
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number; scope: string }>
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error('Echec refresh token Spotify')
  return res.json() as Promise<{ access_token: string; expires_in: number; refresh_token?: string }>
}

export async function getValidToken(userId: string): Promise<string> {
  const account = await prisma.spotifyAccount.findUnique({ where: { userId } })
  if (!account) throw new Error('Spotify non connecte')

  // Token encore valide (marge de 5 min)
  if (account.expiresAt.getTime() > Date.now() + 5 * 60 * 1000) {
    return account.accessToken
  }

  // Refresh
  const data = await refreshAccessToken(account.refreshToken)
  await prisma.spotifyAccount.update({
    where: { userId },
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
    },
  })
  return data.access_token
}

// === API Spotify ===

async function spotifyGet(token: string, path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return null
  if (!res.ok) throw new Error(`Spotify API ${res.status}: ${path}`)
  return res.json()
}

// Profil

export async function getSpotifyProfile(token: string) {
  const data = await spotifyGet(token, '/me')
  return {
    id: data.id as string,
    displayName: (data.display_name || data.id) as string,
    profileUrl: data.external_urls?.spotify as string | null,
  }
}

// Now Playing

export type NowPlayingData = {
  trackName: string
  artistName: string
  albumArt: string
  spotifyUrl: string
  isPlaying: boolean
  progressMs: number
  durationMs: number
}

export async function getCurrentlyPlaying(token: string): Promise<NowPlayingData | null> {
  const data = await spotifyGet(token, '/me/player/currently-playing')
  if (!data || !data.item) return null
  return {
    trackName: data.item.name,
    artistName: data.item.artists.map((a: { name: string }) => a.name).join(', '),
    albumArt: data.item.album.images?.[0]?.url || '',
    spotifyUrl: data.item.external_urls?.spotify || '',
    isPlaying: data.is_playing,
    progressMs: data.progress_ms || 0,
    durationMs: data.item.duration_ms || 0,
  }
}

// Top Artistes

export type TopArtist = {
  id: string
  name: string
  imageUrl: string
  genres: string[]
  spotifyUrl: string
}

export async function getTopArtists(token: string, timeRange = 'short_term', limit = 5): Promise<TopArtist[]> {
  const data = await spotifyGet(token, `/me/top/artists?time_range=${timeRange}&limit=${limit}`)
  if (!data?.items) return []
  return data.items.map((a: { id: string; name: string; images: { url: string }[]; genres: string[]; external_urls: { spotify: string } }) => ({
    id: a.id,
    name: a.name,
    imageUrl: a.images?.[0]?.url || '',
    genres: (a.genres || []).slice(0, 3),
    spotifyUrl: a.external_urls?.spotify || '',
  }))
}

