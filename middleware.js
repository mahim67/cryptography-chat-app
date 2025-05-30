import { NextResponse } from "next/server";

function isValidToken(authCookie) {
    if (!authCookie || !authCookie.value) {
        return false;
    }
    
    try {
        const userData = JSON.parse(authCookie.value);
        // Check if token exists and has proper structure
        return userData && 
               userData.token && 
               typeof userData.token === 'string' && 
               userData.token.trim().length > 0;
    } catch (error) {
        return false;
    }
}

export function middleware(req) {
    const { pathname } = req.nextUrl;
    
    // Skip middleware for static files and Next.js internals
    if (pathname.startsWith('/_next') || 
        pathname.startsWith('/api') || 
        pathname.includes('.') ||
        pathname === '/favicon.ico') {
        return NextResponse.next();
    }

    const authCookie = req.cookies.get("userData");
    const isAuthenticated = isValidToken(authCookie);
    
    // Add debug headers instead of console.log for production debugging
    const response = NextResponse.next();
    response.headers.set('x-middleware-path', pathname);
    response.headers.set('x-middleware-auth', isAuthenticated.toString());
    response.headers.set('x-middleware-cookie', authCookie ? 'present' : 'missing');

    const publicPaths = ["/login", "/register"];
    
    // Handle public paths (login, register)
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        if (isAuthenticated) {
            const redirectResponse = NextResponse.redirect(new URL("/", req.url));
            redirectResponse.headers.set('x-middleware-action', 'redirect-to-dashboard');
            return redirectResponse;
        }
        response.headers.set('x-middleware-action', 'allow-public');
        return response;
    }

    // Protect all other routes
    if (!isAuthenticated) {
        const redirectResponse = NextResponse.redirect(new URL("/login", req.url));
        redirectResponse.headers.set('x-middleware-action', 'redirect-to-login');
        // Clear any invalid cookie before redirecting
        redirectResponse.cookies.delete('userData');
        return redirectResponse;
    }

    response.headers.set('x-middleware-action', 'allow-protected');
    return response;
}

export const config = {
    matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
