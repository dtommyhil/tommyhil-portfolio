import { NextResponse } from 'next/server'

export async function GET() {
  const scopes = 'user-read-recently-played user-read-currently-playing user-top-read'
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI
  
  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope: scopes,
    redirect_uri: redirect_uri!,
  })}`

  return NextResponse.redirect(authUrl)
}