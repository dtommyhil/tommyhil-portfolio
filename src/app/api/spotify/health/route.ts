// src/app/api/spotify/health/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    hasClientId: Boolean(process.env.SPOTIFY_CLIENT_ID),
    hasClientSecret: Boolean(process.env.SPOTIFY_CLIENT_SECRET),
    hasRefreshToken: Boolean(process.env.SPOTIFY_REFRESH_TOKEN),
    redirectBase: process.env.SPOTIFY_REDIRECT_BASE ?? null,
  })
}
