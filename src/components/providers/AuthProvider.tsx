"use client";

import { createContext, useContext } from "react";
import type { User } from "@/lib/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
});

export function AuthProvider({
    children,
    user,
}: {
    children: React.ReactNode;
    user: User | null;
}) {
    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}
