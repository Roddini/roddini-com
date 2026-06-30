import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('admin_session')?.value
  const secret = process.env.ADMIN_SECRET
  const authed = Boolean(session && secret && session === secret)

  if (!authed) {
    // API calls get a 401 (a redirect to an HTML login page is wrong for an API
    // client); page requests redirect to the login screen.
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
