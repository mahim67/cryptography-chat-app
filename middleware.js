import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/auth-utils";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Static files and API routes that should be skipped
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/api/register',
    '/api/login',
    '/api/health',
    '/api/auth',
    '/static',
    '/images',
    '/icons',
    '/manifest.json'
  ];

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  
  // Check if path should be skipped
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get auth token from cookies or headers
  const authCookie = req.cookies.get("userData");
  const authHeader = req.headers.get("authorization");
  let isAuthenticated = false;
  let userInfo = null;
  let token = null;

  // Try to get token from cookie first, then from header
  if (authCookie) {
    try {
      const userData = JSON.parse(authCookie.value);
      token = userData?.token;
    } catch (error) {
      console.log('Cookie parsing error:', error);
    }
  }
  
  // If no token from cookie, try authorization header
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (token) {
    try {
      // Verify JWT token via API call
      const verification = await verifyJwtToken(token);
      if (verification.valid) {
        isAuthenticated = true;
        userInfo = verification.payload || verification.user;
      } else {
        console.log('Token verification failed:', verification.error);
        // Clear invalid token from response headers
        const response = NextResponse.next();
        response.headers.set('x-auth-error', verification.error || 'Token verification failed');
      }
    } catch (error) {
      console.log('Auth verification error:', error);
      // Set error header for debugging
      const response = NextResponse.next();
      response.headers.set('x-auth-error', error.message || 'Authentication service error');
    }
  }

  // Handle public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    if (isAuthenticated) {
      // Redirect authenticated users away from auth pages
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add user info to headers for server components
  const response = NextResponse.next();
  
  // Add debug headers
  response.headers.set('x-middleware-executed', 'true');
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-has-token', token ? 'true' : 'false');
  response.headers.set('x-is-authenticated', isAuthenticated ? 'true' : 'false');
  
  if (userInfo) {
    response.headers.set('x-user-id', userInfo.id?.toString() || userInfo.userId?.toString() || '');
    response.headers.set('x-user-email', userInfo.email || '');
    response.headers.set('x-user-name', userInfo.name || userInfo.username || '');
    response.headers.set('x-user-role', userInfo.role || 'user');
    response.headers.set('x-auth-token', token);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/register and api/login (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
