"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export interface AuthUser {
    _id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    roomNumber: string;
    roomType: string;
    onboardingStatus: string;
    paymentStatus: string;
    documentVerificationStatus: string;
    moveInStatus: string;
    documents: {
        idProof: string;
        addressProof: string;
        photo: string;
    };
    emergencyContact: {
        name: string;
        phone: string;
        relation: string;
    };
    messPackage: string;
    selectedRoomType: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    lastLogin: string;
    createdAt: string;
    // Contact verification
    emailVerified?: boolean;
    phoneVerified?: boolean;
    verification?: {
        emailVerified: boolean;
        emailVerifiedAt: string | null;
        phoneVerified: boolean;
        phoneVerifiedAt: string | null;
    };
    agreements?: {
        termsAccepted: boolean;
        termsAcceptedAt: string | null;
        termsVersion: string | null;
        privacyPolicyAccepted: boolean;
        privacyPolicyAcceptedAt: string | null;
        privacyPolicyVersion: string | null;
    };
    referralCode?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    signup: (name: string, email: string, password: string) => Promise<AuthUser>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (userData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("viramah_token");
        if (storedToken) {
            setToken(storedToken);
        } else {
            setLoading(false);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        const currentToken = token || localStorage.getItem("viramah_token");
        if (!currentToken) {
            setLoading(false);
            return;
        }
        try {
            const res = await apiFetch<{ data: AuthUser }>("/api/public/auth/me", {
                token: currentToken,
            });
            setUser(res.data);
        } catch {
            localStorage.removeItem("viramah_token");
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Fetch user data when token changes
    useEffect(() => {
        if (token) {
            refreshUser();
        }
    }, [token, refreshUser]);

    const login = async (email: string, password: string): Promise<AuthUser> => {
        const res = await apiFetch<{ data: { token: string; user: AuthUser } }>(
            "/api/public/auth/login",
            { method: "POST", body: { email, password } }
        );
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem("viramah_token", newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const signup = async (name: string, email: string, password: string): Promise<AuthUser> => {
        const res = await apiFetch<{ data: { token: string; user: AuthUser } }>(
            "/api/public/auth/register",
            { method: "POST", body: { name, email, password } }
        );
        const { token: newToken, user: newUser } = res.data;
        localStorage.setItem("viramah_token", newToken);
        setToken(newToken);
        setUser(newUser);
        return newUser;
    };

    const logout = () => {
        // Clear user-scoped onboarding data to prevent cross-user leakage
        if (user?._id) {
            localStorage.removeItem(`viramah_onboarding_${user._id}`);
        }
        localStorage.removeItem("viramah_token");
        setToken(null);
        setUser(null);
        apiFetch("/api/public/auth/logout", { method: "POST" }).catch(() => {});
    };

    const updateUser = (userData: Partial<AuthUser>) => {
        setUser((prev) => (prev ? { ...prev, ...userData } : null));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!user && !!token,
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
