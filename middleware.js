import { NextResponse } from "next/server";

export function middleware(req) {
    const authToken = req.cookies.get("userData");
    const response = NextResponse.next();

    const publicPaths = ["/login", "/register"];
    const isPublicPath = publicPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
        if (authToken) {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return response;
    }

    if (!authToken) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
