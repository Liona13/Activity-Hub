import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Add paths that require authentication
const protectedPaths = [
  '/profile',
  '/activities/create',
  '/activities/edit',
];

// Add paths that are only accessible to non-authenticated users
const authPaths = [
  '/auth/signin',
  '/auth/signup',
];

const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/error',
  '/api/auth/providers',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const path = request.nextUrl.pathname;
  
  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  );
  
  // Check if the current path is an auth page
  const isAuthPath = authPaths.some(authPath => 
    path === authPath
  );

  // Special case for new user flow
  const isNewUserPath = path === '/auth/new-user';
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuth && isProtectedPath) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }

  // If user is authenticated but trying to access auth pages
  if (isAuth && isAuthPath) {
    // Don't redirect from new user page even if authenticated
    if (!isNewUserPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/profile/:path*',
    '/activities/create',
    '/activities/edit/:path*',
    // Auth routes
    '/auth/:path*',
  ],
}; 