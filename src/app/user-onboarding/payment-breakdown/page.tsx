"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Receipt, ArrowLeft, Loader2, AlertCircle,
    Check, Minus, Plus, CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
    StepBadge, StepTitle, StepSubtitle, NavButton, SecondaryButton,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

interface BreakdownLine {
    label: string;
    amount: number;
    type: "charge" | "discount" | "credit" | "total";
}

interface PhaseData {
    phaseNumber: number;
    monthsCovered: number;
    status: string;
    finalAmount: number;
    dueDate: string | null;
    breakdown: BreakdownLine[];
    grossRent: number;
    discountAmount: number;
    netRent: number;
    nonRentalTotal: number;
    advanceCreditApplied: number;
    computed?: {
        breakdown: BreakdownLine[];
        finalAmount: number;
    };
}

interface PlanData {
    _id: string;
    planId: string;
    trackId: string;
    chosenTrackId: string | null;
    phases: PhaseData[];
    status: string;
    discountRate: number;
    discountSource: string;
    components: {
        monthlyRent: number;
        totalMonths: number;
        securityDeposit: number;
        registrationCharges: number;
        lunch: { opted: boolean; total: number };
        transport: { opted: boolean; total: number };
    };
    advanceCreditTotal: number;
    advanceCreditRemaining: number;
}

interface PlanResponse {
    data: {
        plan: PlanData;
    };
}

export default function PaymentBreakdownPage() {
    const router = useRouter();
    const { token } = useAuth();
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePhase, setActivePhase] = useState(1);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await apiFetch<PlanResponse>("/api/payment/plan/me", { token });
                const p = res?.data?.plan ?? null;

                if (!p) {
                    setError("No payment plan found. Please select a track first.");
                    return;
                }

                setPlan(p);
                // Default to first pending/unpaid phase
                const firstPending = p.phases?.find(
                    (ph) => ph.status === "pending" || ph.status === "overdue"
                );
                if (firstPending) setActivePhase(firstPending.phaseNumber);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch plan breakdown.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [token]);

    if (loading) {
        return (
            <motion.div
                variants={containerVariants} initial={false} animate="visible"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 0" }}
            >
                <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>
                    Loading your payment breakdown...
                </span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

    if (error || !plan) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ padding: "60px 0", textAlign: "center" }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: 16 }} />
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", color: "#dc2626" }}>
                    {error || "No payment plan found. Please select a track first."}
                </p>
                <button
                    onClick={() => router.push("/user-onboarding/track-selection")}
                    style={{ marginTop: 16, padding: "12px 24px", borderRadius: 10, border: `2px solid ${GREEN}`, background: "transparent", color: GREEN, fontWeight: 600, cursor: "pointer" }}
                >
                    Select Payment Track
                </button>
            </motion.div>
        );
    }

    const currentPhase = plan.phases.find((p) => p.phaseNumber === activePhase);
    const computedPhase = currentPhase?.computed;
    const breakdown: BreakdownLine[] = computedPhase?.breakdown || currentPhase?.breakdown || [];
    const trackLabel =
        plan.trackId === "full" ? "Full Payment" :
        plan.trackId === "twopart" ? "Two-Part Payment" :
        plan.trackId === "booking" ? (plan.chosenTrackId ? `Booking → ${plan.chosenTrackId === "full" ? "Full" : "Two-Part"}` : "Booking") : plan.trackId;

    const canProceed = currentPhase && ["pending", "overdue"].includes(currentPhase.status);

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Receipt} label="Breakdown" />
                <StepTitle>Payment Breakdown</StepTitle>
                <StepSubtitle>Review your line-by-line payment details before proceeding.</StepSubtitle>
            </motion.div>

            {/* Track + Plan Summary */}
            <motion.div variants={itemVariants}>
                <div style={{
                    background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
                    borderRadius: 18, padding: "20px 24px",
                    boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(216,181,106,0.5)" }}>
                            {trackLabel}
                        </span>
                        <span style={{
                            padding: "3px 10px", borderRadius: 999,
                            background: plan.discountRate > 0 ? "rgba(134,239,172,0.15)" : "rgba(255,255,255,0.08)",
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", fontWeight: 700,
                            color: plan.discountRate > 0 ? "#86efac" : "rgba(246,244,239,0.4)",
                        }}>
                            {plan.discountRate > 0 ? `${Math.round(plan.discountRate * 100)}% discount on rent` : "No discount"}
                        </span>
                    </div>

                    {/* Phase tabs */}
                    {plan.phases.length > 1 && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                            {plan.phases.map((phase) => (
                                <button
                                    key={phase.phaseNumber}
                                    onClick={() => setActivePhase(phase.phaseNumber)}
                                    style={{
                                        flex: 1, padding: "10px 14px", borderRadius: 10,
                                        border: `1.5px solid ${activePhase === phase.phaseNumber ? GOLD : "rgba(255,255,255,0.1)"}`,
                                        background: activePhase === phase.phaseNumber ? "rgba(216,181,106,0.1)" : "rgba(255,255,255,0.04)",
                                        cursor: "pointer", transition: "all 0.25s",
                                    }}
                                >
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: activePhase === phase.phaseNumber ? GOLD : "rgba(246,244,239,0.4)", fontWeight: 700, display: "block" }}>
                                        Phase {phase.phaseNumber}
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(246,244,239,0.3)" }}>
                                        {phase.monthsCovered} months · {phase.status}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Big Amount */}
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.6rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        {inr(computedPhase?.finalAmount ?? currentPhase?.finalAmount)}
                    </p>

                    {/* Breakdown Lines */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                        {breakdown.map((line, i) => {
                            const isTotal = line.type === "total";
                            const isGreen = line.type === "discount" || line.type === "credit";
                            return (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8,
                                    ...(isTotal ? { borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10, marginTop: 4 } : {}),
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                                        {isGreen && <Minus size={10} color="#86efac" />}
                                        {!isGreen && !isTotal && <Plus size={10} color="rgba(246,244,239,0.25)" />}
                                        {isTotal && <Check size={12} color={GOLD} strokeWidth={2.5} />}
                                        <span style={{
                                            fontFamily: "var(--font-mono, monospace)",
                                            fontSize: isTotal ? "0.72rem" : "0.64rem",
                                            color: isTotal ? GOLD : isGreen ? "#86efac" : "rgba(246,244,239,0.55)",
                                            fontWeight: isTotal ? 700 : 400,
                                        }}>
                                            {line.label}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: isTotal ? "1.1rem" : "0.7rem",
                                        fontWeight: isTotal ? 700 : isGreen ? 600 : 400,
                                        color: isTotal ? GOLD : isGreen ? "#86efac" : "rgba(246,244,239,0.75)",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {line.amount < 0 ? `−${inr(Math.abs(line.amount))}` : inr(line.amount)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Phase 2 locked note */}
                    {currentPhase?.status === "locked" && (
                        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.05)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.4)" }}>
                                🔒 This phase is locked. It will be unlocked when Phase 1 is paid and the admin sets a due date.
                            </span>
                        </div>
                    )}

                    {currentPhase?.status === "paid" && (
                        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(134,239,172,0.08)", borderRadius: 10, border: "1px solid rgba(134,239,172,0.2)" }}>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "#86efac" }}>
                                ✅ This phase has been paid. No action needed.
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                <SecondaryButton onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                {canProceed && (
                    <NavButton onClick={() => router.push("/user-onboarding/confirm")}>
                        <CreditCard size={16} /> Proceed to Pay
                    </NavButton>
                )}
            </motion.div>
        </motion.div>
    );
}
