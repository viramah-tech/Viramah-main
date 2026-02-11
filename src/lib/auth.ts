// Authentication Utilities
// Session management, role checking, RLS helpers

export type UserRole = "student" | "parent" | "admin" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
}

// Mock user for frontend-only phase
// Toggle role here to test different portals
export const mockUser: User = {
    id: "mock-user-1",
    email: "student@viramah.com",
    name: "Arjun Mehta",
    role: "student", // Change to 'parent' to test parent portal
    isAuthenticated: true,
};

export interface Session {
    user: User | null;
    isAuthenticated: boolean;
}

// Placeholder: Get current session
export async function getSession(): Promise<Session> {
    // TODO: Implement with Supabase auth
    return {
        user: mockUser.isAuthenticated ? mockUser : null,
        isAuthenticated: mockUser.isAuthenticated,
    };
}

// Placeholder: Check if user has required role
export function hasRole(session: Session, requiredRole: UserRole): boolean {
    if (!session.user) return false;
    return session.user.role === requiredRole;
}

// Placeholder: Redirect based on role
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

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
    // TODO: Check from database/localStorage
    return false; // Default: needs to complete room booking flow
}
