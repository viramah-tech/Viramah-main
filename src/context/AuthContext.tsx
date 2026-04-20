"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { apiFetch, apiGet, apiPost } from "@/lib/api";
import { API, type OnboardingStep } from "@/lib/apiEndpoints";

export interface AuthUser {
    _id: string;
    role: "user" | "admin";
    accountStatus: "pending" | "active" | "suspended" | "blocked";
    basicInfo: {
        userId: string;
        fullName?: string;
        email: string;
        phone: string;
        gender?: "male" | "female" | "other" | null;
        dateOfBirth?: string;
        /** Stored as a plain string on the backend. */
        address?: string;
    };
    profilePhoto?: { url?: string; uploadedAt?: string };
    userIdProof?: {
        idType?: string | null;
        idNumber?: string;
        frontImage?: string;
        backImage?: string;
    };
    guardianDetails?: {
        fullName?: string;
        relation?: string;
        phone?: string;
        alternatePhone?: string;
        idProof?: {
            idType?: string | null;
            idNumber?: string;
            frontImage?: string;
            backImage?: string;
        };
    };
    roomDetails?: {
        roomType?: string | null;
        roomNumber?: string;
        allocationDate?: string;
        status?: "unassigned" | "assigned" | "checked_in" | "checked_out";
        includeMess?: boolean;
        includeTransport?: boolean;
    };
    verification?: {
        emailVerified: boolean;
        phoneVerified: boolean;
        documentVerified: boolean;
    };
    onboarding: {
        currentStep: OnboardingStep;
        startedAt?: string;
        completedAt?: string;
    };
    paymentDetails?: Array<Record<string, unknown>>;
    paymentSummary?: Record<string, unknown>;
    paymentDeadline?: {
        startedAt?: string;
        expiresAt?: string;
        extensionRequested?: boolean;
        extensionGrantedUntil?: string;
    };
    referral?: { code?: string; creditsEarned?: number };
    compliance?: {
        termsAccepted: boolean;
        termsAcceptedAt?: string;
        privacyPolicyAccepted: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    signup: (email: string, phone: string | undefined, password: string, name?: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshUser: (options?: { force?: boolean }) => Promise<AuthUser | null>;
    updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthPayload = { user: AuthUser };



export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const refreshInFlightRef = useRef<Promise<AuthUser | null> | null>(null);



    const refreshUser = useCallback(async (options?: { force?: boolean }): Promise<AuthUser | null> => {
        const force = !!options?.force;
        if (force && refreshInFlightRef.current) {
            try {
                await refreshInFlightRef.current;
            } catch {
                // Ignore prior failure and proceed with a fresh fetch.
            }
        }
        if (!force && refreshInFlightRef.current) return refreshInFlightRef.current;

        const p = (async () => {
            try {
                const { user: fetched } = await apiGet<AuthPayload>(API.auth.me);
                setUser(fetched);
                return fetched;
            } catch {
                setUser(null);
                return null;
            } finally {
                setLoading(false);
            }
        })();

        refreshInFlightRef.current = p;
        try {
            return await p;
        } finally {
            refreshInFlightRef.current = null;
        }
    }, []);

    // Hydrate once on mount — session cookie is already in the browser if logged in.
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email: string, password: string): Promise<AuthUser> => {
        const { user: next } = await apiPost<AuthPayload>(API.auth.login, { email, password });
        setUser(next);
        return next;
    };

    const signup = async (email: string, phone: string | undefined, password: string, name?: string): Promise<AuthUser> => {
        const body: Record<string, string> = { email, password };
        if (phone) body.phone = phone;
        if (name) body.name = name;
        const { user: next } = await apiPost<AuthPayload>(API.auth.register, body);
        setUser(next);
        return next;
    };

    const logout = async (): Promise<void> => {
        try {
            await apiFetch(API.auth.logout, { method: "POST" });
        } catch {
            // ignore — cookie may already be invalid
        }
        if (user?._id) {
            try { localStorage.removeItem(`viramah_onboarding_${user._id}`); } catch { /* ignore */ }
        }
        setUser(null);
    };

    const updateUser = (patch: Partial<AuthUser>) => {
        setUser((prev) => {
            if (!prev) return null;
            const next = { ...prev, ...patch };
            return next;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
