import { NextResponse } from 'next/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_RECENT_TRACKS_URL = 'https://api.spotify.com/v1/me/player/recently-played'
const SPOTIFY_TOP_TRACKS_URL = 'https://api.spotify.com/v1/me/top/tracks'

export const dynamic = 'force-dynamic'

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

  const j = await r.json()
  if (!r.ok || !j?.access_token) {
    const reason = (j && (j.error_description || j.error)) || r.statusText
    throw new Error(`token_refresh_failed: ${reason}`)
  }
  return j.access_token as string
}

function mapTracks(items: SpotifyTrack[] | RecentlyPlayedItem[], kind: 'recent' | 'top') {
  const list = (items ?? []).map((it) => {
    const t = (kind === 'recent' ? (it as RecentlyPlayedItem).track : (it as SpotifyTrack)) as SpotifyTrack
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
  return list
}

export async function GET(req: Request) {
  try {
    const kind = (new URL(req.url).searchParams.get('type') || 'recent').toLowerCase() as
      | 'recent'
      | 'top'

    const access = await getAccessToken()
    const headers = { Authorization: `Bearer ${access}` }

    let tracks: unknown[] = []

    if (kind === 'top') {
      const top: TopTracksResponse = await fetch(
        `${SPOTIFY_TOP_TRACKS_URL}?limit=10&time_range=medium_term`,
        { headers, cache: 'no-store' }
      ).then((r) => r.json())
      tracks = mapTracks(top.items ?? [], 'top')
    } else {
      const recent: RecentlyPlayedResponse = await fetch(
        `${SPOTIFY_RECENT_TRACKS_URL}?limit=10`,
        { headers, cache: 'no-store' }
      ).then((r) => r.json())
      tracks = mapTracks(recent.items ?? [], 'recent')

      // Fallback to top tracks if no recent plays found
      if (!Array.isArray(tracks) || tracks.length === 0) {
        const top: TopTracksResponse = await fetch(
          `${SPOTIFY_TOP_TRACKS_URL}?limit=10&time_range=short_term`,
          { headers, cache: 'no-store' }
        ).then((r) => r.json())
        tracks = mapTracks(top.items ?? [], 'top')
      }
    }

    return NextResponse.json({ tracks })
  } catch (err) {
    return NextResponse.json(
      {
        tracks: [],
        error: (err as Error).message,
        note:
          'Ensure SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN are set. ' +
          'This route always uses refresh->access token exchange; no access token env is needed.',
      },
      { status: 200 } // keep 200 so UI can render an empty state gracefully
    )
  }
}