import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'

function getRedirectUri(req: Request) {
  const forced = process.env.SPOTIFY_REDIRECT_BASE?.trim()
  if (forced) {
    try {
      const u = new URL(forced)
      if (u.pathname === '/api/spotify/callback') return `${u.origin}${u.pathname}`
      return `${u.origin}/api/spotify/callback`
    } catch {}
  }
  const { origin } = new URL(req.url)
  return `${origin}/api/spotify/callback`
}

function basicAuthHeader() {
  const id = process.env.SPOTIFY_CLIENT_ID ?? ''
  const secret = process.env.SPOTIFY_CLIENT_SECRET ?? ''
  if (!id || !secret) throw new Error('Missing SPOTIFY_CLIENT_ID/SECRET')
  const basic = Buffer.from(`${id}:${secret}`).toString('base64')
  return `Basic ${basic}`
}

export async function GET(req: Request) {
  // where to send the user after we’re done
  const home = new URL('/', req.url)

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const returnedState = url.searchParams.get('state')
    if (!code) {
      home.searchParams.set('spotify', 'missing_code')
      return NextResponse.redirect(home)
    }

    // Next 15: cookies() must be awaited
    const jar = await cookies()
    const savedState = jar.get('spotify_oauth_state')?.value
    if (!returnedState || !savedState || returnedState !== savedState) {
      home.searchParams.set('spotify', 'state_error')
      return NextResponse.redirect(home)
    }

    // Exchange code -> tokens (we ignore access_token here; your API will mint one via refresh)
    const redirect_uri = getRedirectUri(req)
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
    })

    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })
    const j = await r.json()

    if (!r.ok) {
      home.searchParams.set('spotify', 'exchange_error')
      // Optional: include a tiny hint for yourself (not the token)
      if (j?.error) home.searchParams.set('reason', String(j.error))
      return NextResponse.redirect(home)
    }

    // If Spotify sends a new refresh_token, you could rotate it manually.
    // We DO NOT expose it in the browser for security.
    // const newRefresh = j.refresh_token as string | undefined
    // (Store it securely if you intend to rotate.)

    // Clear the one-time state cookie
    const res = NextResponse.redirect(
      (() => {
        home.searchParams.set('spotify', 'connected')
        return home.toString()
      })()
    )
    res.cookies.set('spotify_oauth_state', '', { path: '/', maxAge: 0 })
    return res
  } catch (err) {
    const res = NextResponse.redirect(
      (() => {
        home.searchParams.set('spotify', 'callback_exception')
        home.searchParams.set('reason', (err as Error).message ?? 'error')
        return home.toString()
      })()
    )
    // try to clear state cookie even on error
    res.cookies.set('spotify_oauth_state', '', { path: '/', maxAge: 0 })
    return res
  }
}