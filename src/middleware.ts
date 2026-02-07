import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/admin', '/dashboard', '/profile', '/settings', '/users'];
const publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if session_id cookie exists
  const sessionId = request.cookies.get('session_id')?.value;
  const hasValidSession = !!sessionId;

  // Protected route without valid session -> redirect to signin
  if (isProtectedRoute && !hasValidSession) {
    const loginUrl = new URL('/signin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Public route with valid session -> redirect to home
  if (isPublicRoute && hasValidSession) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
