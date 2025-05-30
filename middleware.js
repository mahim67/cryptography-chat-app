import { NextResponse } from "next/server";

export function middleware(req) {
    const authToken = req.cookies.get("userData");
    const url = req.nextUrl.clone();

    const publicPaths = ["/login", "/register"];
    const isPublic = publicPaths.includes(url.pathname);

    console.log(`Request for ${url.pathname} with authToken:`, authToken);
    console.log(authToken);
    
    
    if (isPublic && authToken != undefined) {
        console.log('IN');
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
