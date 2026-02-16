import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based route protection proxy with Supabase auth session handling
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // ─── Supabase Auth Session Handling ─────────────────────────
    // Ensure auth cookies are properly forwarded on every request.
    // Without this, Supabase sessions will NOT persist between
    // server requests on Vercel (production), causing sign-in to break.
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Check for Supabase auth cookies and disable caching for authenticated requests
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
        try {
            const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
            const authCookieName = `sb-${projectRef}-auth-token`
            const authCookie = request.cookies.get(authCookieName)
            if (authCookie) {
                // Authenticated request — disable middleware caching
                response.headers.set('x-middleware-cache', 'no-cache')
            }
        } catch {
            // Invalid SUPABASE_URL — skip auth cookie handling
        }
    }

    // TODO: Get session from cookies/headers when Supabase is configured
    const session = null // Placeholder

    // Protected routes configuration
    const protectedRoutes = {
        '/student': 'student',
        '/parent': 'parent',
        '/admin': 'admin',
    }

    // Check if route is protected
    for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
        if (pathname.startsWith(route)) {
            // TODO: Implement actual auth check
            // For now, allow all routes during development
            // if (!session || session.role !== requiredRole) {
            //     return NextResponse.redirect(new URL('/login', request.url))
            // }
        }
    }

    return response
}

export const config = {
    matcher: [
        '/student/:path*',
        '/parent/:path*',
        '/admin/:path*',
        '/room-booking/:path*',
        // Auth-related routes — needed for session handling on Vercel
        '/login',
        '/signup',
        '/auth/:path*',
        '/api/:path*',
    ],
}
