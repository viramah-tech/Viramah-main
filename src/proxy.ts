import { NextRequest, NextResponse } from "next/server";

// With a cross-domain API (api.viramahstay.com ≠ viramahstay.com), the session
// cookie (connect.sid) is scoped to api.viramahstay.com and is NOT visible to
// the website's server/middleware. Auth gating is handled client-side —
// protected pages check the session via API call and redirect if unauthorized.
//
// This middleware is intentionally a pass-through. Route protection happens
// in each page's client-side AuthGuard / onboarding context.

export function proxy(req: NextRequest) {
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
