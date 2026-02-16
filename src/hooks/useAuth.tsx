"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────
export type UserRole = "student" | "parent" | "admin" | "staff" | "guest";

export interface UserProfile {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
    kycStatus: string;
    isActive: boolean;
}

interface AuthContextType {
    user: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: Fetch profile from Supabase ─────────────────────
async function fetchProfile(supabaseUser: SupabaseUser): Promise<UserProfile | null> {
    console.log("[Auth] Fetching profile for UID:", supabaseUser.id);
    const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, avatar_url, kyc_status, is_active")
        .eq("user_id", supabaseUser.id)
        .single();

    if (error) {
        console.error("[Auth] Error fetching profile:", error.message, error.details);
        return null;
    }

    if (!data) {
        console.error("[Auth] No profile data found for this user");
        return null;
    }

    console.log("[Auth] Profile found:", data.full_name);

    return {
        id: data.id,
        userId: data.user_id,
        fullName: data.full_name,
        email: supabaseUser.email ?? "",
        role: (supabaseUser.user_metadata?.role as UserRole) ?? "student",
        avatarUrl: data.avatar_url,
        kycStatus: data.kyc_status,
        isActive: data.is_active,
    };
}

// ─── Provider Component ──────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load session on mount
    useEffect(() => {
        const initAuth = async () => {
            console.log("[Auth] Initializing...");
            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (currentSession?.user) {
                    console.log("[Auth] Session found, fetching profile...");
                    setSession(currentSession);
                    const profile = await fetchProfile(currentSession.user);
                    setUser(profile);
                    console.log("[Auth] Profile loaded:", profile?.fullName);
                } else {
                    console.log("[Auth] No active session");
                }
            } catch (err) {
                console.error("[Auth] Failed to initialize:", err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                console.log("[Auth] State changed:", event);
                setSession(newSession);

                if (event === "SIGNED_IN" && newSession?.user) {
                    setIsLoading(true); // Keep in loading state while profile is fetched
                    try {
                        const profile = await fetchProfile(newSession.user);
                        setUser(profile);
                        console.log("[Auth] Profile fetched after sign-in:", profile?.fullName);
                    } finally {
                        setIsLoading(false);
                    }
                } else if (event === "SIGNED_OUT") {
                    console.log("[Auth] Signed out");
                    setUser(null);
                    setIsLoading(false);
                } else if (event === "INITIAL_SESSION") {
                    // Handled by initAuth
                } else if (event === "USER_UPDATED") {
                    if (newSession?.user) {
                        const profile = await fetchProfile(newSession.user);
                        setUser(profile);
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Sign up with email/password
    const signUp = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, role },
            },
        });

        if (error) return { error: error.message };

        // The trigger `handle_new_user()` auto-creates the profile row
        return { error: null };
    }, []);

    // Sign in with email/password
    const signIn = useCallback(async (email: string, password: string) => {
        console.log("[Auth] Attempting sign in...");
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("[Auth] Sign in failed:", error.message);
                return { error: error.message };
            }

            if (data.session?.user) {
                console.log("[Auth] Sign in success, fetching profile immediately...");
                setSession(data.session);
                const profile = await fetchProfile(data.session.user);
                setUser(profile);

                if (!profile) {
                    console.warn("[Auth] Sign in worked but profile is missing in the database");
                }
            }

            return { error: null };
        } catch (err) {
            console.error("[Auth] Unexpected error during sign in:", err);
            return { error: "An unexpected error occurred. Please try again." };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Sign in with Google OAuth
    const signInWithGoogle = useCallback(async () => {
        // Use NEXT_PUBLIC_SITE_URL for Vercel deployments, fallback to window.location.origin for local dev
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${siteUrl}/auth/callback?next=/login`,
            },
        });

        if (error) return { error: error.message };
        return { error: null };
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        router.push("/login");
    }, [router]);

    // Refresh profile data
    const refreshProfile = useCallback(async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
            const profile = await fetchProfile(currentUser);
            setUser(profile);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                isAuthenticated: !!user,
                signUp,
                signIn,
                signInWithGoogle,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
