import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/contact/admin')) {
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization') || ''
  const [scheme, encoded] = auth.split(' ')
  if (scheme !== 'Basic' || !encoded) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Area"' },
    })
  }

  const [user, pass] = Buffer.from(encoded, 'base64').toString().split(':')

  const expectedUser = process.env.ADMIN_USER || 'admin'
  const expectedPass = process.env.ADMIN_PASS || ''
  if (user !== expectedUser || pass !== expectedPass) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const res = NextResponse.next()
  res.headers.set('x-admin-secret', process.env.ADMIN_SECRET || '')
  return res
}

export const config = {
  matcher: ['/contact/admin/:path*'],
}
