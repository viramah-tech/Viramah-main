"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CreditCard, Check, ArrowRight, Loader2, AlertCircle,
    Zap, Sparkles, Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import {
    StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

interface TrackConfig {
    trackId: string;
    name: string;
    discount: number;
    isActive: boolean;
    phases: number;
    description: string;
}

interface ConfigResponse {
    data: {
        tracks: TrackConfig[];
        discountConfigs: Array<{ trackId: string; defaultDiscountRate: number; isActive: boolean }>;
    };
}

interface PlanSummary {
    _id?: string;
    planId?: string;
    trackId: string;
    chosenTrackId: string | null;
}

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
    const { token } = useAuth();
    const { state } = useOnboarding();
    const { bookingId } = state;
    const { booking, isLoading: bookingLoading } = useBookingStatus();

    // V3 Guard: Only allow access when booking is BOOKING_CONFIRMED
    // If no bookingId or booking not confirmed, redirect to deposit flow
    useEffect(() => {
        if (bookingLoading) return; // Wait for status to load
        if (!bookingId) {
            router.replace("/user-onboarding/deposit");
            return;
        }
        // Booking exists but not yet confirmed — send back to status page
        if (booking && booking.status !== "BOOKING_CONFIRMED" && booking.status !== "FINAL_PAYMENT_PENDING") {
            router.replace("/user-onboarding/deposit-status");
        }
    }, [bookingId, booking, bookingLoading, router]);

    const addOns = {
        transport: !!state.step3?.addOns?.find((a: { id: string; enabled: boolean }) => a.id === "transport")?.enabled,
        mess: !!state.step3?.addOns?.find((a: { id: string; enabled: boolean }) => a.id === "lunch")?.enabled,
    };
    const [configs, setConfigs] = useState<ConfigResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Check if user already has an active plan in the DB
                try {
                    const planRes = await apiFetch<{ data: { plan: PlanSummary | null } }>("/api/payment/plan/me", { token });
                    if (planRes?.data?.plan) {
                        // User already has a persisted plan — go to breakdown (NOT /confirm, which creates loops)
                        router.replace("/user-onboarding/payment-breakdown");
                        return;
                    }
                } catch { /* No plan — continue to track selection */ }

                const res = await apiFetch<ConfigResponse>("/api/payment/config");
                setConfigs(res.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load payment configuration");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, [token, router]);

    const handleSelect = async () => {
        if (!selectedTrack) return;
        setSubmitting(true);
        setError(null);

        try {
            await apiFetch<{ data: { plan: PlanSummary } }>("/api/payment/plan/select-track", {
                method: "POST",
                token,
                body: { trackId: selectedTrack, addOns, bookingId },
            });
            router.push("/user-onboarding/confirm");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to select track");
        } finally {
            setSubmitting(false);
        }
    };

    const discountForTrack = (trackId: string): number => {
        if (!configs?.discountConfigs) return trackId === "full" ? 0.40 : trackId === "twopart" ? 0.25 : 0;
        const cfg = configs.discountConfigs.find((c) => c.trackId === trackId);
        return cfg?.isActive ? (cfg.defaultDiscountRate || 0) : 0;
    };

    if (loading) {
        return (
            <motion.div
                variants={containerVariants} initial={false} animate="visible"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 0" }}
            >
                <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>
                    Loading payment options...
                </span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

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

            {/* Booking Credit Banner — explains how the ₹16,180 already paid flows into the plan */}
            <motion.div variants={itemVariants}>
                <div style={{
                    background: "linear-gradient(135deg, rgba(31,58,45,0.05) 0%, rgba(216,181,106,0.08) 100%)",
                    border: "1.5px solid rgba(216,181,106,0.3)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "rgba(31,58,45,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Shield size={18} color={GREEN} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.58rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            color: "rgba(31,58,45,0.5)",
                            fontWeight: 700,
                            margin: "0 0 6px",
                        }}>
                            Booking fee already received — ₹16,180
                        </p>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)",
                            fontSize: "0.82rem",
                            color: "rgba(31,58,45,0.7)",
                            lineHeight: 1.55,
                            margin: 0,
                        }}>
                            <strong style={{ color: GREEN }}>₹1,180</strong> (registration + GST) will be credited to your first installment.{" "}
                            <strong style={{ color: GREEN }}>₹15,000</strong> (security deposit) is held as a refundable balance and is excluded from the amounts below.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Error Banner */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}
                >
                    <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626" }}>{error}</span>
                </motion.div>
            )}

            {/* Track Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {tracks.map((track) => {
                    const details = TRACK_DETAILS[track.id];
                    const Icon = details.icon;
                    const isSelected = selectedTrack === track.id;
                    const discount = discountForTrack(track.id);

                    return (
                        <motion.div
                            key={track.id}
                            variants={itemVariants}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.985 }}
                        >
                            <button
                                onClick={() => setSelectedTrack(track.id)}
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
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
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
