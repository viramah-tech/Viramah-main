import { NextRequest, NextResponse } from "next/server";

// Routes that require an authenticated session. Presence of the httpOnly `token`
// cookie is checked — full JWT validity is enforced by the backend on every
// protected API call. This gives us SSR-time gating (no flash of protected
// content) without needing JWT_SECRET in the Edge runtime.
const PROTECTED_PREFIXES = [
    "/user-onboarding",
    "/student",
    "/verify-contact",
];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    // Check for session cookie (express-session uses 'connect.sid' by default)
    const hasSession = Boolean(req.cookies.get("connect.sid")?.value);

    const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
    if (isProtected && !hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Allow users to access the login page even if they have a stale token.
    // Client-side logic or manual logout will handle any token mismatch.
    // const isPublicOnly = ["/login", "/register"].some((p) => pathname.startsWith(p));
    // if (isPublicOnly && hasToken) {
    //     const url = req.nextUrl.clone();
    //     url.pathname = "/user-onboarding/terms";
    //     return NextResponse.redirect(url);
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/user-onboarding/:path*",
        "/student/:path*",
        "/verify-contact/:path*",
        "/login",
        "/register",
    ],
};
