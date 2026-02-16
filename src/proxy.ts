import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Role-based route protection proxy
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

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

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/student/:path*',
        '/parent/:path*',
        '/admin/:path*',
        '/room-booking/:path*',
    ],
}
