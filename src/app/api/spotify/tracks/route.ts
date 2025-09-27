/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_RECENT_TRACKS_URL = 'https://api.spotify.com/v1/me/player/recently-played'
const SPOTIFY_TOP_TRACKS_URL = 'https://api.spotify.com/v1/me/top/tracks'

async function getAccessToken() {
  const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token!,
    }),
  })

  return response.json()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'recent' // 'recent' or 'top'
    
    const { access_token } = await getAccessToken()

    const url = type === 'top' 
      ? `${SPOTIFY_TOP_TRACKS_URL}?limit=10&time_range=medium_term`
      : `${SPOTIFY_RECENT_TRACKS_URL}?limit=10`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    const data = await response.json()

    // Handle different response structures
    const items = data.items || []
    const tracks = items?.map((item: any) => {
      const track = type === 'top' ? item : item.track
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name,
        album: track.album.name,
        image: track.album.images[0]?.url,
        played_at: type === 'recent' ? item.played_at : null,
      }
    }) || []

    return NextResponse.json({ tracks })
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 })
  }
}