"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CreditCard, Check, ArrowRight,
    Zap, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import {
    StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const TRACK_DETAILS: Record<string, {
    icon: typeof CreditCard;
    color: string;
    features: string[];
    badge: string;
}> = {
    full: {
        icon: Sparkles,
        color: "#1F3A2D",
        features: [
            "11 months rent — paid at once",
            "Security deposit + registration",
            "Optional lunch & transport included",
            "Maximum discount on rent",
        ],
        badge: "Best Value",
    },
    twopart: {
        icon: Zap,
        color: "#b8860b",
        features: [
            "Phase 1: 6 months rent + security + registration",
            "Phase 2: 5 months rent — due later",
            "Optional lunch & transport in Phase 1",
            "Flexible payments",
        ],
        badge: "Flexible",
    },
};

export default function TrackSelectionPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { room } = useOnboarding();

    const [selectedTrack, setSelectedTrack] = useState<"full" | "twopart" | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Keep this route available only for final payment flow.
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login");
            return;
        }

    // Step access restrictions removed - users can move freely through final payment flow
    // const step = user.onboarding?.currentStep;
    // if (step === "final_payment" || step === "completed") return;
    //
    // if (step === "booking_payment") {
    //     router.replace("/user-onboarding/deposit");
    //     return;
    // }
    //
    // if (step === "review") {
    //     router.replace("/user-onboarding/step-4");
    //     return;
    // }
    // router.replace("/user-onboarding/step-3");
    }, [authLoading, router, user]);

    const handleSelect = async () => {
        if (!selectedTrack) return;
        setSubmitting(true);
        try {
            sessionStorage.setItem("viramah_payment_track", selectedTrack);
        } catch {
            // Non-blocking: continue even if sessionStorage is unavailable.
        }
        router.push("/user-onboarding/payment-breakdown");
        setSubmitting(false);
    };

    const tracks = [
        { id: "full",    name: "Full Payment",     phases: 1 },
        { id: "twopart", name: "Two-Part Payment", phases: 2 },
    ];

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Payment Track" />
                <StepTitle>Choose your payment plan</StepTitle>
                <StepSubtitle>Select how you would like to pay for your stay at Viramah.</StepSubtitle>
            </motion.div>

            <motion.div variants={itemVariants}>
                <div style={{
                    background: "linear-gradient(135deg, rgba(31,58,45,0.05) 0%, rgba(216,181,106,0.08) 100%)",
                    border: "1.5px solid rgba(216,181,106,0.3)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", letterSpacing: "0.08em", color: "rgba(31,58,45,0.55)", textTransform: "uppercase" }}>
                        Final Payment Mode
                    </p>
                    <p style={{ margin: 0, fontFamily: "var(--font-body, sans-serif)", fontSize: "0.84rem", color: "rgba(31,58,45,0.75)", lineHeight: 1.5 }}>
                        Select your preferred style for final payment visibility. This choice is local to your session and does not call any legacy payment-plan endpoints.
                    </p>
                    {(room.includeMess || room.includeTransport) && (
                        <p style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.45)" }}>
                            Add-ons from room selection: {room.includeMess ? "Mess " : ""}{room.includeTransport ? "Transport" : ""}
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Track Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {tracks.map((track) => {
                    const details = TRACK_DETAILS[track.id];
                    const Icon = details.icon;
                    const isSelected = selectedTrack === track.id;
                    const discount = track.id === "full" ? 0.4 : 0.25;

                    return (
                        <motion.div
                            key={track.id}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.985 }}
                        >
                            <button
                                onClick={() => setSelectedTrack(track.id as "full" | "twopart")}
                                style={{
                                    width: "100%",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    padding: 0,
                                    border: `2px solid ${isSelected ? details.color : "rgba(31,58,45,0.1)"}`,
                                    borderRadius: 20,
                                    background: isSelected ? `${details.color}08` : "#fff",
                                    boxShadow: isSelected ? `0 8px 32px ${details.color}15` : "0 2px 8px rgba(31,58,45,0.04)",
                                    overflow: "hidden",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {/* Card Header */}
                                <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 14,
                                            background: isSelected ? details.color : "rgba(31,58,45,0.06)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.3s",
                                        }}>
                                            <Icon size={22} color={isSelected ? GOLD : "rgba(31,58,45,0.4)"} />
                                        </div>
                                        <div>
                                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1.05rem", fontWeight: 700, color: GREEN, display: "block" }}>
                                                {track.name}
                                            </span>
                                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.45)", letterSpacing: "0.05em" }}>
                                                {track.phases === 0 ? "Booking + choose later" : `${track.phases} phase${track.phases > 1 ? "s" : ""}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {discount > 0 && (
                                            <span style={{
                                                padding: "4px 10px", borderRadius: 999,
                                                background: "rgba(31,58,45,0.08)",
                                                fontFamily: "var(--font-mono, monospace)",
                                                fontSize: "0.62rem", fontWeight: 700, color: GREEN,
                                            }}>
                                                {Math.round(discount * 100)}% off rent
                                            </span>
                                        )}
                                        <span style={{
                                            padding: "4px 10px", borderRadius: 999,
                                            background: `${details.color}12`,
                                            fontFamily: "var(--font-mono, monospace)",
                                            fontSize: "0.58rem", fontWeight: 700, color: details.color,
                                        }}>
                                            {details.badge}
                                        </span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                                    {details.features.map((f, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <Check size={13} color={isSelected ? details.color : "rgba(31,58,45,0.25)"} strokeWidth={2.5} />
                                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: "rgba(31,58,45,0.65)", lineHeight: 1.4 }}>
                                                {f}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Selection indicator */}
                                <div style={{
                                    padding: "12px 24px",
                                    background: isSelected ? details.color : "rgba(31,58,45,0.03)",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "all 0.3s",
                                }}>
                                    {isSelected ? (
                                        <>
                                            <Check size={14} color={GOLD} strokeWidth={2.5} />
                                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: GOLD, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                                Selected
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                            Tap to select
                                        </span>
                                    )}
                                </div>
                            </button>

                        </motion.div>
                    );
                })}
            </div>

            {/* Confirm Button */}
            <motion.div variants={itemVariants} style={{ paddingTop: 8 }}>
                <button
                    onClick={handleSelect}
                    disabled={!selectedTrack || submitting}
                    style={{
                        width: "100%",
                        padding: "16px 24px",
                        borderRadius: 14,
                        border: "none",
                        background: !selectedTrack ? "rgba(31,58,45,0.15)" : GREEN,
                        color: !selectedTrack ? "rgba(31,58,45,0.3)" : GOLD,
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        cursor: !selectedTrack ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transition: "all 0.3s",
                        boxShadow: selectedTrack ? "0 4px 20px rgba(31,58,45,0.2)" : "none",
                    }}
                >
                    {submitting ? (
                        <>
                            Processing...
                        </>
                    ) : (
                        <>
                            Continue to Payment Breakdown <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </motion.div>
        </motion.div>
    );
}
