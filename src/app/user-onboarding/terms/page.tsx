"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Shield, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight,
    CreditCard, FileText, RefreshCw,
} from "lucide-react";
import BookingTimeline from "@/components/BookingTimeline";
import {
    StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Static Pricing Data (matches PricingConfig + known tariff) ──────────────

const ROOM_TYPES = [
    {
        name: "Studio",
        fullTotal: "₹1,97,390",
        halfInst1: "₹1,09,450",
        halfInst2: "₹83,780",
    },
    {
        name: "Axis Plus Studio",
        fullTotal: "₹1,97,390",
        halfInst1: "₹1,09,450",
        halfInst2: "₹83,780",
    },
    {
        name: "Double Occupancy",
        fullTotal: "₹1,47,520",
        halfInst1: "₹82,520",
        halfInst2: "₹62,500",
    },
    {
        name: "Triple Occupancy",
        fullTotal: "₹1,14,290",
        halfInst1: "₹64,200",
        halfInst2: "₹48,380",
    },
];

const ADD_ONS = [
    { label: "Transport", amount: "₹2,000/month", note: "Both modes" },
    { label: "Mess — Monthly", amount: "₹2,200/month", note: "Both modes" },
    { label: "Mess — Lump Sum", amount: "₹19,000 total", note: "Full pay only" },
];

const POLICY_POINTS = [
    {
        icon: CheckCircle,
        iconColor: "#16a34a",
        text: "Full ₹15,000 refund if you cancel within 7 days of deposit approval.",
        bold: true,
    },
    {
        icon: XCircle,
        iconColor: "#dc2626",
        text: "No refund after 7 days — deposit becomes non-refundable.",
        bold: false,
    },
    {
        icon: Clock,
        iconColor: "#d97706",
        text: "You have 21 days from approval to complete your payment. After this, your room is released and deposit is forfeited.",
        bold: false,
    },
    {
        icon: Shield,
        iconColor: GREEN,
        text: "Your room is held exclusively for you during this 21-day window.",
        bold: false,
    },
];

// ── Countdown CTA ─────────────────────────────────────────────────────────────
const COUNTDOWN_SECONDS = 5;

function ProceedButton({ onClick }: { onClick: () => void }) {
    const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (secondsLeft <= 0) { setReady(true); return; }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [secondsLeft]);

    return (
        <button
            onClick={ready ? onClick : undefined}
            aria-disabled={!ready}
            style={{
                width: "100%",
                padding: "18px 28px",
                borderRadius: 14,
                border: "none",
                background: ready
                    ? `linear-gradient(135deg, ${GREEN} 0%, #162b1e 100%)`
                    : "rgba(31,58,45,0.1)",
                color: ready ? GOLD : "rgba(31,58,45,0.35)",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                cursor: ready ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.4s ease",
                boxShadow: ready ? "0 8px 28px rgba(31,58,45,0.22)" : "none",
            }}
        >
            {ready ? (
                <>
                    I Understand — Proceed to Deposit ₹15,000
                    <ArrowRight size={16} />
                </>
            ) : (
                <>
                    <Clock size={14} />
                    Please read — proceeding in {secondsLeft}s…
                </>
            )}
        </button>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function TermsPage() {
    const router = useRouter();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 40 }}
        >
            {/* Step Header — same pattern as other onboarding steps */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={FileText} label="Before You Book" />
                <StepTitle>Pricing & Booking Terms</StepTitle>
                <StepSubtitle>
                    Please review the room pricing and our deposit policy carefully. Your ₹15,000 security deposit comes before the full payment.
                </StepSubtitle>
            </motion.div>

            {/* How it works — Booking Timeline */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 4px" }}>
                        How the Booking Works
                    </p>
                    <BookingTimeline currentStatus="idle" />
                </FormCard>
            </motion.div>

            {/* Pricing Table */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 16px" }}>
                        Room Pricing — 11-Month Tenure (incl. GST)
                    </p>

                    {/* Column Headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 8, padding: "8px 12px", background: "rgba(31,58,45,0.04)", borderRadius: 8, marginBottom: 4 }}>
                        {["Room Type", "Full Pay", "Half-Pay Inst. 1", "Half-Pay Inst. 2"].map((h) => (
                            <span key={h} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(31,58,45,0.45)", fontWeight: 700 }}>
                                {h}
                            </span>
                        ))}
                    </div>

                    {/* Rows */}
                    {ROOM_TYPES.map((rt, i) => (
                        <div
                            key={rt.name}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                                gap: 8,
                                padding: "12px 12px",
                                borderBottom: i < ROOM_TYPES.length - 1 ? "1px solid rgba(31,58,45,0.06)" : "none",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN }}>
                                {rt.name}
                            </span>
                            <div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", fontWeight: 700, color: GREEN }}>
                                    {rt.fullTotal}
                                </span>
                                <span style={{ display: "block", fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)", marginTop: 2 }}>
                                    40% discount
                                </span>
                            </div>
                            <div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "rgba(31,58,45,0.75)" }}>
                                    {rt.halfInst1}
                                </span>
                                <span style={{ display: "block", fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)", marginTop: 2 }}>
                                    25% off · Months 1–6
                                </span>
                            </div>
                            <div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "rgba(31,58,45,0.75)" }}>
                                    {rt.halfInst2}
                                </span>
                                <span style={{ display: "block", fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)", marginTop: 2 }}>
                                    Months 7–11
                                </span>
                            </div>
                        </div>
                    ))}

                    <div style={{ height: 1, background: "rgba(31,58,45,0.06)", margin: "4px 0" }} />

                    {/* Footnote */}
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.38)", margin: "8px 0 0", lineHeight: 1.5 }}>
                        * Security deposit (₹15,000) is paid separately and credited against your first payment. All totals include registration fee (₹1,000) + GST.
                    </p>
                </FormCard>
            </motion.div>

            {/* Add-ons */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 14px" }}>
                        Optional Add-ons
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {ADD_ONS.map((ao) => (
                            <div key={ao.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(31,58,45,0.03)", borderRadius: 8, border: "1px solid rgba(31,58,45,0.07)" }}>
                                <div>
                                    <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN }}>{ao.label}</span>
                                    <span style={{ display: "block", fontFamily: "var(--font-mono, monospace)", fontSize: "0.57rem", color: "rgba(31,58,45,0.38)", marginTop: 2 }}>{ao.note}</span>
                                </div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", fontWeight: 700, color: GREEN }}>{ao.amount}</span>
                            </div>
                        ))}
                    </div>
                </FormCard>
            </motion.div>

            {/* Cancellation & Refund Policy */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 700, color: "#92400e", margin: 0 }}>
                            Cancellation & Refund Policy
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {POLICY_POINTS.map(({ icon: Icon, iconColor, text, bold }, i) => (
                            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", background: i === 0 ? "rgba(22,163,74,0.04)" : i === 1 ? "rgba(220,38,38,0.04)" : "rgba(31,58,45,0.02)", borderRadius: 8, border: `1px solid ${i === 0 ? "rgba(22,163,74,0.12)" : i === 1 ? "rgba(220,38,38,0.1)" : "rgba(31,58,45,0.06)"}` }}>
                                <Icon size={15} color={iconColor} style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: bold ? "#14532d" : "rgba(31,58,45,0.75)", fontWeight: bold ? 600 : 400, margin: 0, lineHeight: 1.5 }}>
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </FormCard>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <ProceedButton onClick={() => router.push("/user-onboarding/deposit")} />
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.57rem", color: "rgba(31,58,45,0.32)", textAlign: "center", letterSpacing: "0.04em", margin: 0 }}>
                    By proceeding, you acknowledge that you have read and understood the above terms.
                </p>
            </motion.div>
        </motion.div>
    );
}
