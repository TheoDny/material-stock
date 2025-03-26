import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request, {
        // Optionally pass config if cookie name, prefix or useSecureCookies option is customized in auth config.
        cookieName: "session_token",
        cookiePrefix: "better-auth",
        useSecureCookies: true,
    })

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}
// Match all routes except auth pages and API routes
export const config = {
    matcher: ["/((?!sign-in|sign-up|forgot-password|api/auth).*)"], 
}
