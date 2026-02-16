"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

/**
 * AuthGuard — Client-side route protection with role enforcement.
 *
 * Use this inside layout.tsx files to:
 * 1. Show a loading spinner while session is being checked
 * 2. Redirect unauthenticated users to /login
 * 3. Redirect users without the required role to their correct dashboard
 * 4. Render children only when auth + role checks pass
 *
 * The Next.js middleware handles server-side blocking, but this component
 * provides a smooth client-side transition and prevents UI flash.
 *
 * @example
 * // In student/layout.tsx
 * <AuthGuard requiredRoles={["student"]}>
 *     {children}
 * </AuthGuard>
 */

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: UserRole[];
    fallbackRedirect?: string;
}

const ROLE_DASHBOARDS: Record<string, string> = {
    student: "/student/dashboard",
    parent: "/parent/dashboard",
    admin: "/admin/dashboard",
    staff: "/admin/dashboard",
};

export function AuthGuard({
    children,
    requiredRoles,
    fallbackRedirect = "/login",
}: AuthGuardProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        // Not authenticated → redirect to login
        if (!isAuthenticated || !user) {
            router.push(fallbackRedirect);
            return;
        }

        // Role check: user is authenticated but wrong role
        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(user.role)) {
                const correctDashboard = ROLE_DASHBOARDS[user.role] || "/";
                router.push(correctDashboard);
            }
        }
    }, [isLoading, isAuthenticated, user, requiredRoles, fallbackRedirect, router]);

    // Loading state — premium-looking spinner
    if (isLoading) {
        return (
            <div className="min-h-screen bg-sand-light flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw" />
                    <span className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
                        Verifying access...
                    </span>
                </div>
            </div>
        );
    }

    // Not authenticated or wrong role — don't render children (redirect in progress)
    if (!isAuthenticated || !user) {
        return null;
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return null;
    }

    // Auth + role checks passed → render children
    return <>{children}</>;
}
