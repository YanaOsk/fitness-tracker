import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const pathname = req.nextUrl.pathname

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/')

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (session && pathname === '/') {
    const dest = session.user.setup_complete ? '/dashboard' : '/setup'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  if (
    session &&
    !session.user.setup_complete &&
    pathname !== '/setup' &&
    !isPublicRoute
  ) {
    return NextResponse.redirect(new URL('/setup', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
