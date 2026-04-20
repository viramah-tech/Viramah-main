import type { AuthUser } from "@/context/AuthContext";

export type UserRole = "user" | "admin";

export interface Session {
    user: AuthUser | null;
    isAuthenticated: boolean;
}

/** Checks whether a user holds the required role. */
export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
    return !!user && user.role === requiredRole;
}

/** Route a logged-in user to the right landing page based on role + onboarding state. */
export function getRoleRedirect(user: AuthUser | null): string {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.onboarding?.currentStep === "completed") return "/student/dashboard";
    return "/user-onboarding";
}

/** Onboarding is complete when the backend moves the user into the `completed` step. */
export function hasCompletedOnboarding(user: AuthUser | null): boolean {
    return user?.onboarding?.currentStep === "completed";
}
