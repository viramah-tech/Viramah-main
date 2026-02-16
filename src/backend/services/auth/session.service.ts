import { createServerClient } from "@/backend/lib/supabase/server";
import { AuthError } from "@/backend/lib/errors";
import type { UserEntity } from "@/backend/types/entities/user.entity";
import type { UserRole } from "@/backend/types/database/enums";

/**
 * Get user session from Supabase auth token.
 * Maps database row to typed UserEntity.
 */
export async function getSession(token: string): Promise<UserEntity | null> {
    const supabase = createServerClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    if (!profile) {
        return null;
    }

    return {
        id: user.id,
        email: user.email ?? "",
        phone: user.phone ?? null,
        role: (user.user_metadata?.role as UserRole) ?? "guest",
        createdAt: user.created_at ?? "",
        profile: {
            id: profile.id,
            fullName: profile.full_name,
            dateOfBirth: profile.date_of_birth,
            avatarUrl: profile.avatar_url,
            kycStatus: profile.kyc_status,
            kycVerifiedAt: profile.kyc_verified_at,
            preferences: profile.preferences,
            isActive: profile.is_active,
        },
    };
}

/**
 * Create or update user profile after authentication.
 */
export async function ensureProfile(userId: string, fullName: string, role: UserRole): Promise<string> {
    const supabase = createServerClient();

    // Check existing profile
    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

    if (existing) {
        return existing.id;
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
            user_id: userId,
            full_name: fullName,
            kyc_status: "pending",
            is_active: true,
        })
        .select("id")
        .single();

    if (error || !newProfile) {
        throw new AuthError("Failed to create user profile", "INTERNAL_ERROR");
    }

    return newProfile.id;
}

/**
 * Invalidate the current session.
 */
export async function signOut(): Promise<void> {
    const supabase = createServerClient();
    await supabase.auth.signOut();
}
