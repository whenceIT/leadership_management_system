import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/admin', '/dashboard', '/profile', '/settings'];
const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and _next paths
  if (!pathname || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Get cookie safely
  const userId = request.cookies.get('user_id')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected route without user -> redirect to signin
  if (isProtectedRoute && !userId) {
    const loginUrl = new URL('/signin', request.url);
    return NextResponse.rewrite(loginUrl);
  }

  // Public route with user -> redirect to home
  if (isPublicRoute && userId) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.rewrite(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

