"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, X, CreditCard } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

interface Phase2Info {
    planId: string;
    phaseNumber: number;
    dueDate: string;
    finalAmount: number;
    status: string;
}

/**
 * Phase2Banner — persistent banner on student dashboard.
 * Shows when Phase 2 is pending/overdue and has a due date.
 * Listens for socket event `payment:phase2_unlocked`.
 */
export default function Phase2Banner() {
    const router = useRouter();
    const { token } = useAuth();
    const [phase2, setPhase2] = useState<Phase2Info | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const checkPhase2 = async () => {
            try {
                const res = await apiFetch<{
                    data: {
                        plan: {
                            _id: string;
                            phases: Array<{
                                phaseNumber: number;
                                status: string;
                                dueDate: string | null;
                                finalAmount: number;
                            }>;
                        };
                    };
                }>("/api/payment/plan/me", { token });

                const plan = res?.data?.plan;
                if (!plan) return;

                const p2 = plan.phases.find(
                    (p) => p.phaseNumber === 2 && ["pending", "overdue"].includes(p.status) && p.dueDate
                );
                if (p2) {
                    setPhase2({
                        planId: plan._id,
                        phaseNumber: 2,
                        dueDate: p2.dueDate!,
                        finalAmount: p2.finalAmount,
                        status: p2.status,
                    });
                }
            } catch {
                // Not critical — fail silently
            }
        };

        checkPhase2();
    }, [token]);

    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        setNow(Date.now());
    }, [phase2]);

    if (!phase2 || dismissed) return null;

    const dueDate = new Date(phase2.dueDate);
    const isOverdue = dueDate.getTime() < now;
    const daysLeft = Math.ceil((dueDate.getTime() - now) / (1000 * 60 * 60 * 24));

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                style={{
                    background: isOverdue
                        ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                        : `linear-gradient(135deg, ${GREEN} 0%, #162b1e 100%)`,
                    borderRadius: 16,
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    boxShadow: "0 4px 20px rgba(31,58,45,0.15)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow accent */}
                <div style={{
                    position: "absolute", top: -20, right: -20,
                    width: 80, height: 80, borderRadius: "50%",
                    background: isOverdue ? "rgba(248,113,113,0.1)" : `rgba(216,181,106,0.08)`,
                    filter: "blur(20px)",
                }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, position: "relative", zIndex: 1 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: isOverdue ? "rgba(248,113,113,0.15)" : "rgba(216,181,106,0.12)",
                        border: `1px solid ${isOverdue ? "rgba(248,113,113,0.25)" : "rgba(216,181,106,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                        {isOverdue
                            ? <AlertCircle size={20} color="#f87171" />
                            : <CreditCard size={20} color={GOLD} />}
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem",
                            fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3,
                        }}>
                            {isOverdue ? "Phase 2 payment is overdue!" : "Your Phase 2 payment is now due"}
                        </p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            color: "rgba(246,244,239,0.55)", margin: "4px 0 0", lineHeight: 1.4,
                        }}>
                            Due: {dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {isOverdue ? ` · ${Math.abs(daysLeft)} days overdue` : daysLeft > 0 ? ` · ${daysLeft} days left` : " · Due today"}
                            {" · "}Amount: {inr(phase2.finalAmount)}
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
                    <button
                        onClick={() => router.push("/user-onboarding/payment-breakdown")}
                        style={{
                            padding: "10px 18px", borderRadius: 10,
                            border: "none",
                            background: isOverdue ? "#dc2626" : GOLD,
                            color: isOverdue ? "#fff" : GREEN,
                            fontFamily: "var(--font-body, sans-serif)",
                            fontSize: "0.8rem", fontWeight: 700,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 6,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Pay Now <ArrowRight size={14} />
                    </button>
                    <button
                        onClick={() => setDismissed(true)}
                        style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.15)",
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <X size={12} color="rgba(255,255,255,0.4)" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
