// Authentication Utilities
// Session management, role checking, RLS helpers

export type UserRole = "student" | "parent" | "admin" | "guest" | "user";

export interface User {
    id: string;
    _id?: string;
    userId?: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
    roomNumber?: string;
    roomType?: string;
    onboardingStatus?: string;
    paymentStatus?: string;
}

export interface Session {
    user: User | null;
    isAuthenticated: boolean;
}

// Get current session from localStorage token
export async function getSession(): Promise<Session> {
    if (typeof window === "undefined") {
        return { user: null, isAuthenticated: false };
    }
    const token = localStorage.getItem("viramah_token");
    if (!token) {
        return { user: null, isAuthenticated: false };
    }
    // Session is valid if token exists; AuthContext handles the actual API call
    return { user: null, isAuthenticated: true };
}

// Check if user has required role
export function hasRole(session: Session, requiredRole: UserRole): boolean {
    if (!session.user) return false;
    // Map 'user' role to 'student' for compatibility
    const userRole = session.user.role === "user" ? "student" : session.user.role;
    return userRole === requiredRole || session.user.role === requiredRole;
}

// Redirect based on role
export function getRoleRedirect(role: UserRole): string {
    switch (role) {
        case "student":
        case "user":
            return "/student/dashboard";
        case "parent":
            return "/parent/dashboard";
        case "admin":
            return "/admin/dashboard";
        default:
            return "/";
    }
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(user?: User | null): boolean {
    return user?.onboardingStatus === "completed";
}
