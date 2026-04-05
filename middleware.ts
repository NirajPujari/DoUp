import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/auth';

const protectedRoutes = ['/', '/dashboard', '/calendar', '/profile'];
const publicRoutes = ['/login', '/register'];

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/dashboard') || path.startsWith('/calendar') || path.startsWith('/profile');
  const isPublicRoute = publicRoutes.includes(path);

  const session = await getSession();

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
