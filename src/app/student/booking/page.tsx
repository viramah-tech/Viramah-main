"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function StudentBookingRedirectPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user?.roomDetails?.status === "assigned" || user?.roomDetails?.status === "checked_in") {
                router.replace("/student/dashboard");
            } else {
                router.replace("/user-onboarding/step-3");
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <span className="font-mono text-xs text-[#1F3A2D]/60 animate-pulse">Loading Room Selection...</span>
        </div>
    );
}
