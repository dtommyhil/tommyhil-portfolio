import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Scopes for recent plays, now playing, top tracks
const SCOPES = [
  'user-read-recently-played',
  'user-read-currently-playing',
  'user-top-read',
].join(' ')

/** Resolve the exact redirect URI Spotify must see */
function getRedirectUri(req: Request) {
  const forced = process.env.SPOTIFY_REDIRECT_BASE?.trim()
  if (forced) {
    try {
      const u = new URL(forced)
      if (u.pathname === '/api/spotify/callback') return `${u.origin}${u.pathname}`
      return `${u.origin}/api/spotify/callback`
    } catch {
      /* fall through */
    }
  }
  const { origin } = new URL(req.url)
  return `${origin}/api/spotify/callback`
}

function randomState(len = 16) {
  return crypto.randomBytes(len).toString('hex')
}

export async function GET(req: Request) {
  const redirectUri = getRedirectUri(req)
  const state = randomState()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
    scope: SCOPES,
    redirect_uri: redirectUri,
    state,
  })

  const res = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )

  // Only secure over HTTPS / production to avoid invalid_state locally
  const isHttps = new URL(req.url).protocol === 'https:'
  const isProd = process.env.NODE_ENV === 'production'
  res.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: isHttps || isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })

  return res
}
