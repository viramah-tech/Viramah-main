"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const GREEN = "#1F3A2D";

export default function ConfirmPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/user-onboarding/payment-breakdown");
    }, [router]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "80px 0",
            }}
        >
            <Loader2 size={28} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>
                Redirecting to payment breakdown...
            </p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    );
}
