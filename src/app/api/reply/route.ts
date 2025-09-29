import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_RECENT_TRACKS_URL = 'https://api.spotify.com/v1/me/player/recently-played'
const SPOTIFY_TOP_TRACKS_URL = 'https://api.spotify.com/v1/me/top/tracks'

const QuerySchema = z.object({
  type: z.enum(['recent', 'top']).default('recent'),
})

type Query = z.infer<typeof QuerySchema>

type SpotifyImage = { url: string; width?: number; height?: number }
type SpotifyArtist = { name: string }
type SpotifyAlbum = { name: string; images?: SpotifyImage[] }
type SpotifyTrack = {
  id: string
  name: string
  artists: SpotifyArtist[]
  album: SpotifyAlbum
  preview_url?: string | null
  external_urls?: { spotify?: string }
}
type RecentlyPlayedItem = { played_at: string; track: SpotifyTrack }
type TopTracksResponse = { items?: SpotifyTrack[] }
type RecentlyPlayedResponse = { items?: RecentlyPlayedItem[] }

function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

async function getAccessToken(): Promise<string> {
  const refresh = requiredEnv('SPOTIFY_REFRESH_TOKEN')
  const id = requiredEnv('SPOTIFY_CLIENT_ID')
  const secret = requiredEnv('SPOTIFY_CLIENT_SECRET')

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh,
  })

  const r = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })

  const j: { access_token?: string; error?: unknown; error_description?: string } = await r.json()
  if (!r.ok || !j.access_token) {
    throw new Error(`token_refresh_failed: ${j.error_description ?? j.error ?? r.statusText}`)
  }
  return j.access_token
}

function mapTracks(
  items: SpotifyTrack[] | RecentlyPlayedItem[],
  kind: 'recent' | 'top'
) {
  return (items ?? []).map((it) => {
    const t = (kind === 'recent' ? (it as RecentlyPlayedItem).track : (it as SpotifyTrack))
    return {
      id: t.id,
      name: t.name,
      artist: Array.isArray(t.artists) ? t.artists.map((a) => a.name).join(', ') : '',
      album: t.album?.name,
      image: t.album?.images?.[0]?.url,
      url: t.external_urls?.spotify,
      previewUrl: t.preview_url ?? null,
      played_at: kind === 'recent' ? (it as RecentlyPlayedItem).played_at : null,
    }
  })
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const qInput = { type: url.searchParams.get('type') ?? undefined }
    const parsed = QuerySchema.safeParse(qInput)
    if (!parsed.success) {
      return NextResponse.json(
        { tracks: [], error: 'invalid_query', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { type }: Query = parsed.data

    const access = await getAccessToken()
    const headers = { Authorization: `Bearer ${access}` }

    if (type === 'top') {
      const top: TopTracksResponse = await fetch(
        `${SPOTIFY_TOP_TRACKS_URL}?limit=10&time_range=medium_term`,
        { headers, cache: 'no-store' }
      ).then((r) => r.json())
      return NextResponse.json({ tracks: mapTracks(top.items ?? [], 'top') })
    }

    const recent: RecentlyPlayedResponse = await fetch(
      `${SPOTIFY_RECENT_TRACKS_URL}?limit=10`,
      { headers, cache: 'no-store' }
    ).then((r) => r.json())

    let tracks = mapTracks(recent.items ?? [], 'recent')

    if (tracks.length === 0) {
      const top: TopTracksResponse = await fetch(
        `${SPOTIFY_TOP_TRACKS_URL}?limit=10&time_range=short_term`,
        { headers, cache: 'no-store' }
      ).then((r) => r.json())
      tracks = mapTracks(top.items ?? [], 'top')
    }

    return NextResponse.json({ tracks })
  } catch (err) {
    return NextResponse.json(
      {
        tracks: [],
        error: (err as Error).message,
        note:
          'Ensure SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN are set. This route always uses refresh->access exchange.',
      },
      { status: 200 }
    )
  }
}
