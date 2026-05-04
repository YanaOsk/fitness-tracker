import { NextRequest, NextResponse } from 'next/server'

const VALID_IDS = new Set([
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
])

export function middleware(req: NextRequest) {
  const userId = req.cookies.get('fit_user')?.value
  const isLoggedIn = userId ? VALID_IDS.has(userId) : false
  const { pathname } = req.nextUrl

  const isPublicRoute = pathname === '/' || pathname.startsWith('/api/auth')

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
