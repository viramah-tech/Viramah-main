// Authentication Utilities
// Real Supabase authentication — replaces mock user

export type UserRole = "student" | "parent" | "admin" | "staff" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
    profileId?: string;
    avatarUrl?: string | null;
    kycStatus?: string;
}

export interface Session {
    user: User | null;
    isAuthenticated: boolean;
}

// Placeholder: Check if user has required role
export function hasRole(session: Session, requiredRole: UserRole): boolean {
    if (!session.user) return false;
    return session.user.role === requiredRole;
}

// Redirect based on role
export function getRoleRedirect(role: UserRole): string {
    switch (role) {
        case "student":
            return "/student/dashboard";
        case "parent":
            return "/parent/dashboard";
        case "admin":
            return "/admin/dashboard";
        default:
            return "/";
    }
}
