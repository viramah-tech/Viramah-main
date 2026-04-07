"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    CreditCard, Check, ArrowRight, Loader2, AlertCircle,
    Shield, Zap, Clock, Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { apiFetch } from "@/lib/api";
import {
    StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

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
    booking: {
        icon: Shield,
        color: "#6b4c8a",
        features: [
            "Pay security deposit + registration now",
            "Optional advance payment (credited later)",
            "Choose Full or Two-Part plan after booking",
            "Room reserved immediately",
        ],
        badge: "Reserve First",
    },
};

export default function TrackSelectionPage() {
    const router = useRouter();
    const { token } = useAuth();
    const { state } = useOnboarding();
    const addOns = {
        transport: !!state.step3?.addOns?.find((a: { id: string; enabled: boolean }) => a.id === "transport")?.enabled,
        mess: !!state.step3?.addOns?.find((a: { id: string; enabled: boolean }) => a.id === "lunch")?.enabled,
    };
    const [configs, setConfigs] = useState<ConfigResponse["data"] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [advanceAmount, setAdvanceAmount] = useState(0);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await apiFetch<ConfigResponse>("/api/payment/config");
                setConfigs(res.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load payment configuration");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleSelect = async () => {
        if (!selectedTrack) return;
        setSubmitting(true);
        setError(null);

        try {
            let preview: any;
            if (selectedTrack === "booking") {
                preview = await apiFetch<{ data: { plan: any } }>("/api/payment/plan/booking", {
                    method: "POST",
                    token,
                    body: { advance: advanceAmount, addOns },
                });
            } else {
                preview = await apiFetch<{ data: { plan: any } }>("/api/payment/plan/select-track", {
                    method: "POST",
                    token,
                    body: { trackId: selectedTrack, addOns },
                });
            }
            // The backend no longer persists the plan until first payment.
            // Stash the preview so the confirm page can render + submit it.
            if (typeof window !== "undefined" && preview?.data?.plan) {
                localStorage.setItem("viramah_plan_preview", JSON.stringify(preview.data.plan));
            }
            router.push("/user-onboarding/payment-breakdown");
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
                variants={containerVariants} initial="hidden" animate="visible"
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
        { id: "full", name: "Full Payment", phases: 1 },
        { id: "twopart", name: "Two-Part Payment", phases: 2 },
        { id: "booking", name: "Booking First", phases: 0 },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Payment Track" />
                <StepTitle>Choose your payment plan</StepTitle>
                <StepSubtitle>Select how you would like to pay for your stay at Viramah.</StepSubtitle>
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

                            {/* Advance input for booking track */}
                            {isSelected && track.id === "booking" && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                                    style={{ overflow: "hidden", marginTop: 12, padding: "16px 20px", background: "rgba(107,76,138,0.04)", border: "1px solid rgba(107,76,138,0.15)", borderRadius: 14 }}
                                >
                                    <label style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(31,58,45,0.45)", display: "block", marginBottom: 8 }}>
                                        Optional advance payment (credited to final amount)
                                    </label>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", color: "rgba(31,58,45,0.5)" }}>₹</span>
                                        <input
                                            type="number"
                                            min={0}
                                            step={1000}
                                            placeholder="0"
                                            value={advanceAmount || ""}
                                            onChange={(e) => setAdvanceAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                                            style={{
                                                flex: 1, background: "#fff", border: "1.5px solid rgba(31,58,45,0.15)",
                                                borderRadius: 10, padding: "10px 14px", fontFamily: "var(--font-mono, monospace)",
                                                fontSize: "0.9rem", color: GREEN, outline: "none",
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            )}
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
