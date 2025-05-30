import { NextResponse } from "next/server";

export function middleware(req) {
    console.log('req.cookies');
    console.log(req.cookies);
    const authToken = req.cookies.get("userData");
    const url = req.nextUrl.clone();

    console.log("🔐 Cookie:", authToken?.value);
    console.log("📍 URL:", url.pathname);

    const publicPaths = ["/login", "/register"];
    const isPublic = publicPaths.includes(url.pathname);

    if (isPublic && authToken) {
        url.pathname = "/";
        return NextResponse.redirect(url);
    }

    if (!isPublic && !authToken) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
