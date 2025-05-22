import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })


    if (!session || !session.user.active) {
        return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    // Match all routes except auth pages and API routes
    matcher: ["/((?!sign-in|sign-up|forgot-password|api/auth|_next).*)"],
}
