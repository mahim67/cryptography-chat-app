import { NextResponse } from "next/server";

export function middleware(req) {
  const authToken = req.cookies.get("userData");
  const response = NextResponse.next();

  const publicPaths = ["/login", "/register"];
  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (authToken) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return response;
  }

  if (!authToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"], // Apply middleware to all routes except public assets
};
