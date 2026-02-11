// Authentication Utilities
// Real Supabase auth integration

import { createClient } from '@/lib/supabase/server'
import type { DbUser } from '@/types/database'

export type UserRole = "student" | "parent" | "admin" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
}

export interface Session {
    user: User | null;
    isAuthenticated: boolean;
}

// Get current session from Supabase
export async function getSession(): Promise<Session> {
    try {
        const supabase = await createClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (!authUser) {
            return { user: null, isAuthenticated: false }
        }

        // Fetch user role and profile from database
        const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single<DbUser>()

        // Try to get display name from profile
        let displayName = authUser.email?.split('@')[0] || 'User'

        if (dbUser?.role === 'student') {
            const { data: profile } = await supabase
                .from('student_profiles')
                .select('first_name, last_name')
                .eq('id', authUser.id)
                .single()

            if (profile?.first_name) {
                displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
            }
        } else if (dbUser?.role === 'parent') {
            const { data: profile } = await supabase
                .from('parent_profiles')
                .select('full_name')
                .eq('id', authUser.id)
                .single()

            if (profile?.full_name) {
                displayName = profile.full_name
            }
        }

        const user: User = {
            id: authUser.id,
            email: authUser.email || '',
            name: displayName,
            role: (dbUser?.role as UserRole) || 'student',
            isAuthenticated: true,
        }

        return { user, isAuthenticated: true }
    } catch {
        return { user: null, isAuthenticated: false }
    }
}

// Check if user has required role
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

// Check if user has completed onboarding
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data } = await supabase
            .from('student_profiles')
            .select('onboarding_completed')
            .eq('id', userId)
            .single()

        return data?.onboarding_completed ?? false
    } catch {
        return false
    }
}
