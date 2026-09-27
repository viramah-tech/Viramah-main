"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentOnboardingRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/user-onboarding/terms");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <span className="font-mono text-xs text-[#1F3A2D]/60 animate-pulse">Loading Onboarding Portal...</span>
        </div>
    );
}
