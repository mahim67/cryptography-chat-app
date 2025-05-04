import { NextResponse } from "next/server";

export function middleware(req) {
  const userData = req.cookies.get("userData");
  console.log("Middleware userData:", userData); // Debugging log

  // Allow access to login and register pages without authentication
  const publicPaths = ["/login", "/register"];
  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (userData) {
      // Redirect authenticated users to home page if they try to access login or register
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if user is not authenticated
  if (!userData) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"], // Apply middleware to all routes except public assets
};
