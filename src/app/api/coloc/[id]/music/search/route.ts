import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getValidToken } from '@/lib/spotify'

const API_BASE = 'https://api.spotify.com/v1'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  const { id: colocId } = await params

  const membership = await prisma.userColoc.findUnique({
    where: { userId_colocId: { userId: session.user.id, colocId } },
  })
  if (!membership) return NextResponse.json({ error: 'Non autorise' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q) return NextResponse.json([])

  try {
    const token = await getValidToken(session.user.id)
    const res = await fetch(`${API_BASE}/search?type=track&q=${encodeURIComponent(q)}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    if (!data?.tracks?.items) return NextResponse.json([])

    const tracks = data.tracks.items.map((t: { id: string; name: string; artists: { name: string }[]; album: { name: string; images: { url: string }[] }; uri: string; duration_ms: number; preview_url: string | null }) => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map((a: { name: string }) => a.name).join(', '),
      album: t.album.name,
      albumArt: t.album.images?.[1]?.url || t.album.images?.[0]?.url || '',
      uri: t.uri,
      durationMs: t.duration_ms,
      previewUrl: t.preview_url,
    }))
    return NextResponse.json(tracks)
  } catch {
    return NextResponse.json({ error: 'Spotify non connecte' }, { status: 400 })
  }
}
