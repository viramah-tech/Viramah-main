import type { UserRole, KycStatus, DietaryPreference, SleepSchedule, NoisePreference } from "../database/enums";

/**
 * User entity — domain representation (not raw DB row).
 * Used in services and API responses.
 */
export interface UserEntity {
    id: string;
    email: string;
    phone: string | null;
    role: UserRole;
    profile: UserProfile | null;
    createdAt: string;
}

export interface UserProfile {
    id: string;
    fullName: string;
    dateOfBirth: string | null;
    avatarUrl: string | null;
    kycStatus: KycStatus;
    kycVerifiedAt: string | null;
    preferences: UserPreferences | null;
    isActive: boolean;
}

export interface UserPreferences {
    dietary: DietaryPreference | null;
    sleep: SleepSchedule | null;
    noise: NoisePreference | null;
}
