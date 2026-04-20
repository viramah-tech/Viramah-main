"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, CheckCircle, XCircle, AlertCircle, RefreshCw,
    ArrowRight, RotateCcw, Shield, X, Printer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBookingStatus, type V3Booking } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import BookingTimeline from "@/components/BookingTimeline";
import { getDaysHoursRemaining } from "@/utils/deadlineUtils";
import { containerVariants, itemVariants } from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD  = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── Status Banner Config ──────────────────────────────────────────────────────

const STATUS_CONFIG = {
    pending_approval: {
        icon: Clock, iconColor: GOLD, iconBg: "rgba(216,181,106,0.15)",
        badge: "Under Review", badgeColor: "#9a7a3a",
        badgeBg: "rgba(216,181,106,0.1)", badgeBorder: "rgba(216,181,106,0.25)",
        title: "Your deposit is under review",
        subtitle: "An admin will verify your payment within 24 hours. Your 21-day countdown only starts after approval.",
    },
    active: {
        icon: Shield, iconColor: GREEN, iconBg: "rgba(31,58,45,0.1)",
        badge: "Room Held", badgeColor: GREEN,
        badgeBg: "rgba(31,58,45,0.07)", badgeBorder: "rgba(31,58,45,0.18)",
        title: "Your room is reserved for you",
        subtitle: "Complete your full payment before the deadline to confirm your booking.",
    },
    converted: {
        icon: CheckCircle, iconColor: "#16a34a", iconBg: "rgba(22,163,74,0.1)",
        badge: "Confirmed", badgeColor: "#16a34a",
        badgeBg: "rgba(22,163,74,0.08)", badgeBorder: "rgba(22,163,74,0.2)",
        title: "Payment completed! Your room is confirmed.",
        subtitle: "Booking confirmed. Admin will finalise verification and notify you of move-in details.",
    },
    refunded: {
        icon: RotateCcw, iconColor: GOLD, iconBg: "rgba(216,181,106,0.15)",
        badge: "Refunded", badgeColor: "#9a7a3a",
        badgeBg: "rgba(216,181,106,0.1)", badgeBorder: "rgba(216,181,106,0.2)",
        title: "Deposit refunded — booking cancelled",
        subtitle: "Your refundable deposit has been refunded. Room reservation has been cancelled.",
    },
    expired: {
        icon: XCircle, iconColor: "#dc2626", iconBg: "rgba(220,38,38,0.08)",
        badge: "Expired", badgeColor: "#dc2626",
        badgeBg: "rgba(220,38,38,0.06)", badgeBorder: "rgba(220,38,38,0.18)",
        title: "Booking window has expired",
        subtitle: "Your 21-day payment window has closed. The room has been released. Contact us if you have questions.",
    },
    rejected: {
        icon: XCircle, iconColor: "#dc2626", iconBg: "rgba(220,38,38,0.08)",
        badge: "Payment Rejected", badgeColor: "#dc2626",
        badgeBg: "rgba(220,38,38,0.06)", badgeBorder: "rgba(220,38,38,0.18)",
        title: "Your booking payment was rejected",
        subtitle: "Admin has rejected your payment proof. Please re-submit your booking payment with valid proof.",
    },
} as const;

// ── Live Countdown Timer ──────────────────────────────────────────────────────
// Ticks every second when in "urgent" (red) state, every minute otherwise.

interface TimerColor {
    label: string;
    bg: string;
    border: string;
    numberColor: string;
    labelColor: string;
    dot: string;
}

function getRefundTimerColor(remainingMs: number): TimerColor {
    const hours = remainingMs / (1000 * 60 * 60);
    if (hours <= 0)   return { label: "Window Closed",     bg: "rgba(31,58,45,0.04)",    border: "rgba(31,58,45,0.1)",     numberColor: "rgba(31,58,45,0.35)", labelColor: "rgba(31,58,45,0.35)", dot: "rgba(31,58,45,0.2)" };
    if (hours <= 24)  return { label: "Refund Available",  bg: "rgba(245,158,11,0.06)",  border: "rgba(245,158,11,0.25)",  numberColor: "#d97706",            labelColor: "#92400e",            dot: "#d97706" };
    return              { label: "Refund Available",  bg: "rgba(22,163,74,0.06)",  border: "rgba(22,163,74,0.2)",   numberColor: "#16a34a",            labelColor: "#14532d",            dot: "#16a34a" };
}

function getPaymentTimerColor(remainingMs: number): TimerColor {
    const hours = remainingMs / (1000 * 60 * 60);
    const days  = hours / 24;
    if (hours <= 0)  return { label: "Booking Expired",  bg: "rgba(220,38,38,0.07)", border: "rgba(220,38,38,0.22)", numberColor: "#dc2626", labelColor: "#991b1b", dot: "#dc2626" };
    if (hours <= 24) return { label: "Room Held Until",  bg: "rgba(220,38,38,0.05)", border: "rgba(220,38,38,0.18)", numberColor: "#dc2626", labelColor: "#991b1b", dot: "#dc2626" };
    if (days  <= 5)  return { label: "Room Held Until",  bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.2)", numberColor: "#d97706", labelColor: "#92400e", dot: "#d97706" };
    return               { label: "Room Held Until",  bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.2)", numberColor: "#2563eb", labelColor: "#1e3a8a", dot: "#3b82f6" };
}

function LiveCountdown({
    deadline,
    colorFn,
    helperText,
    action,
}: {
    deadline: string | null | undefined;
    colorFn: (remainingMs: number) => TimerColor;
    helperText?: string;
    action?: React.ReactNode;
}) {
    const [now, setNow] = useState(() => Date.now());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const deadlineMs = deadline ? new Date(deadline).getTime() : 0;
    const remainingMs = Math.max(0, deadlineMs - now);
    const { days, hours, isExpired } = getDaysHoursRemaining(deadline);
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    const colors = colorFn(remainingMs);
    const isUrgentRed = remainingMs > 0 && remainingMs < 24 * 60 * 60 * 1000;

    // Per-second when urgent, per-minute otherwise — clean up on unmount
    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const tick = isUrgentRed ? 1000 : 60_000;
        intervalRef.current = setInterval(() => setNow(Date.now()), tick);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isUrgentRed]);

    return (
        <div
            style={{
                background: colors.bg,
                border: `1.5px solid ${colors.border}`,
                borderRadius: 16,
                padding: "20px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 170,
                boxShadow: isUrgentRed ? "0 0 0 4px rgba(220,38,38,0.06)" : "none",
                transition: "box-shadow 0.4s ease",
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.dot, flexShrink: 0, animation: isUrgentRed ? "pulse 1.5s ease-in-out infinite" : "none" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.18em", color: colors.labelColor, fontWeight: 700 }}>
                    {colors.label}
                </span>
            </div>

            {/* Timer Display */}
            {isExpired ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: colors.numberColor }}>
                        {colors.label}
                    </span>
                </div>
            ) : (
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
                    {days > 0 && (
                        <>
                            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: colors.numberColor, lineHeight: 1 }}>{days}</span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: colors.numberColor, marginRight: 10, opacity: 0.8 }}>d</span>
                        </>
                    )}
                    <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: colors.numberColor, lineHeight: 1 }}>{hours}</span>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: colors.numberColor, marginRight: 10, opacity: 0.8 }}>h</span>
                    <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: colors.numberColor, lineHeight: 1 }}>{minutes}</span>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", color: colors.numberColor, opacity: 0.8 }}>m</span>
                    {isUrgentRed && (
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: colors.labelColor, opacity: 0.6, alignSelf: "flex-end", marginLeft: 4 }}>
                            remaining
                        </span>
                    )}
                </div>
            )}

            {/* Helper text */}
            {helperText && !isExpired && (
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: colors.labelColor, opacity: 0.7, margin: 0, lineHeight: 1.4 }}>
                    {helperText}
                </p>
            )}

            {/* Action */}
            {action}
        </div>
    );
}

// ── Inline CSS for pulsing dot ────────────────────────────────────────────────

const pulseStyle = `
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.75); }
}`;

// ── Refund Confirmation Modal ─────────────────────────────────────────────────

function RefundModal({ onConfirm, onClose, loading, refundableAmount }: { onConfirm: () => void; onClose: () => void; loading: boolean; refundableAmount: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,25,20,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ background: "#fff", borderRadius: 20, maxWidth: 420, width: "100%", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative" }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, display: "flex" }}>
                    <X size={18} color="rgba(31,58,45,0.4)" />
                </button>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                        <AlertCircle size={26} color="#dc2626" />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.5rem", color: GREEN, fontWeight: 400, margin: "0 0 8px" }}>
                        Confirm Refund Request
                    </h2>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "rgba(31,58,45,0.6)", lineHeight: 1.55, margin: 0 }}>
                        Are you sure you want to cancel your room booking? You will receive <strong>{inr(refundableAmount)}</strong> back after admin approval.
                    </p>
                    <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, padding: "10px 14px", marginTop: 12 }}>
                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                            ⚠️ Note: The ₹1,000 registration fee is <strong>non-refundable</strong> and will not be returned.
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(31,58,45,0.15)", background: "#fff", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: "rgba(31,58,45,0.6)", cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm} disabled={loading}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", background: loading ? "rgba(220,38,38,0.3)" : "#dc2626", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        {loading ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                                Requesting…
                            </>
                        ) : "Yes, Request Refund"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DepositStatusPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { booking, timers, isLoading, error, refetch } = useBookingStatus();

    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundSuccess, setRefundSuccess] = useState(false);
    const [extensionLoading, setExtensionLoading] = useState(false);
    const [extensionSuccess, setExtensionSuccess] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleRequestRefund = async () => {
        setRefundLoading(true);
        setActionError(null);
        try {
            await apiFetch<{ data: { refundRequestedAt: string } }>(API.payment.refundRequest, {
                method: "POST",
                body: {
                    reason: "User requested refund from deposit status page",
                },
            });
            setRefundSuccess(true);
            setShowRefundModal(false);
            void refetch();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to submit refund request.";
            setActionError(message);
            setShowRefundModal(false);
        } finally {
            setRefundLoading(false);
        }
    };

    const handleRequestExtension = async () => {
        setExtensionLoading(true);
        setActionError(null);
        try {
            await apiFetch<{ data: { extensionRequested: boolean } }>(API.payment.extensionRequest, {
                method: "POST",
                body: {
                    reason: "User requested deadline extension from deposit status page",
                },
            });
            setExtensionSuccess(true);
            void refetch();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to submit extension request.";
            setActionError(message);
        } finally {
            setExtensionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", flexDirection: "column", gap: 12 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid rgba(31,58,45,0.1)`, borderTopColor: GREEN }} />
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.4)", letterSpacing: "0.08em" }}>
                    Loading your booking status…
                </p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <AlertCircle size={40} color="rgba(220,38,38,0.5)" style={{ margin: "0 auto 16px", display: "block" }} />
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: GREEN, fontWeight: 600, marginBottom: 8 }}>
                    No booking found
                </p>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.45)", marginBottom: 20 }}>
                    {error || "You haven't submitted a booking deposit yet."}
                </p>
                <button onClick={refetch} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid rgba(31,58,45,0.2)`, background: "#fff", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: GREEN, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <RefreshCw size={12} /> Retry
                </button>
            </div>
        );
    }

    const mapBookingStatus = (status: string | undefined): keyof typeof STATUS_CONFIG => {
        switch (status) {
            case "UNDER_VERIFICATION":    return "pending_approval";
            case "BOOKING_CONFIRMED":
            case "FINAL_PAYMENT_PENDING": return "active";
            case "FULLY_PAID":            return "converted";
            case "CANCELLED":             return "expired";
            case "REJECTED":           return "rejected";
            default:                       return "pending_approval";
        }
    };

    const mappedStatus = mapBookingStatus(booking?.status);
    const cfg = STATUS_CONFIG[mappedStatus];
    const StatusIcon = cfg.icon;
    const isActive = booking?.status === "BOOKING_CONFIRMED" || booking?.status === "FINAL_PAYMENT_PENDING";
    const holdStatus = mappedStatus as "pending_approval" | "active" | "converted" | "refunded" | "expired";
    const bookingData: V3Booking | null = booking;

    const holdAdvance = bookingData?.financials?.advanceAmount || 0;
    const holdRefundable = bookingData?.financials?.refundableAmount ?? (15000 + holdAdvance);

    return (
        <>
            {/* Pulse keyframe */}
            <style>{pulseStyle}</style>

            <motion.div
                variants={containerVariants} initial={false} animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 80 }}
            >
                {/* Status Banner */}
                <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                    <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                        style={{ width: 72, height: 72, borderRadius: "50%", background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 8px 28px ${cfg.iconBg}` }}
                    >
                        <StatusIcon size={32} color={cfg.iconColor} />
                    </motion.div>

                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`, marginBottom: 12 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.badgeColor }} />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: cfg.badgeColor, fontWeight: 700 }}>
                            {cfg.badge}
                        </span>
                    </div>

                    <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", color: GREEN, lineHeight: 1.2, fontWeight: 400, margin: "0 0 8px" }}>
                        {cfg.title}
                    </h1>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", color: "rgba(31,58,45,0.55)", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
                        {cfg.subtitle}
                    </p>

                    {error && (
                        <div style={{ marginTop: 12, marginInline: "auto", maxWidth: 460, padding: "10px 12px", borderRadius: 10, background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.28)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <AlertCircle size={14} color="#b45309" />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "#92400e", letterSpacing: "0.02em" }}>
                                Live status refresh issue: {error}
                            </span>
                        </div>
                    )}

                    {booking?.status === "FULLY_PAID" && (
                        <div style={{ marginTop: 16 }}>
                            <button
                                onClick={() => router.push("/user-onboarding/payment-status")}
                                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: GREEN, color: GOLD, fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(31,58,45,0.2)" }}
                            >
                                View Payment Status <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                    {booking?.status === "BOOKING_CONFIRMED" && (
                        <div style={{ marginTop: 16 }}>
                            <button
                                onClick={() => router.push("/user-onboarding/track-selection")}
                                style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: GREEN, color: GOLD, fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(31,58,45,0.2)" }}
                            >
                                Select Your Payment Plan →
                            </button>
                            {timers?.finalPaymentDeadline && (
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.6)", margin: "8px 0 0" }}>
                                    Plan selection deadline:{" "}
                                    {new Date(timers.finalPaymentDeadline).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric",
                                    })}
                                </p>
                            )}
                        </div>
                    )}
                    {booking?.status === "FINAL_PAYMENT_PENDING" && (
                        <div style={{ marginTop: 16 }}>
                            <button
                                onClick={() => router.push("/user-onboarding/payment-breakdown")}
                                style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: GREEN, color: GOLD, fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(31,58,45,0.25)" }}
                            >
                                Complete the Payment <ArrowRight size={14} />
                            </button>
                        </div>
                    )}
                    {booking?.status === "REJECTED" && (
                        <div style={{ marginTop: 16 }}>
                            <button
                                onClick={() => router.push("/user-onboarding/deposit")}
                                style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: "#dc2626", color: "#fff", fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(220,38,38,0.2)" }}
                            >
                                Re-submit Booking Payment
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Timeline */}
                <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", padding: "20px 16px", boxShadow: "0 2px 12px rgba(31,58,45,0.05)" }}>
                    <BookingTimeline
                        currentStatus={holdStatus}
                        depositTotal={booking?.financials?.totalBookingAmount}
                        advanceAmount={booking?.financials?.advanceAmount}
                    />
                </motion.div>

                {/* Refund Success Banner */}
                <AnimatePresence>
                    {refundSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
                            style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}
                        >
                            <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#15803d", fontWeight: 500 }}>
                                Refund request submitted successfully. Our team will review it and update your status.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Extension Success Banner */}
                <AnimatePresence>
                    {extensionSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
                            style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}
                        >
                            <CheckCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#1d4ed8", fontWeight: 500 }}>
                                Deadline extension request submitted. You will be notified once reviewed.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Error Banner */}
                <AnimatePresence>
                    {actionError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }}
                            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}
                        >
                            <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#b91c1c", fontWeight: 500 }}>
                                {actionError}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── DUAL COUNTDOWN TIMERS (always side-by-side on desktop) ── */}
                {isActive && (
                    <motion.div variants={itemVariants}>
                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, marginBottom: 12 }}>
                            Live Countdown
                        </p>

                        {/* Responsive grid: side-by-side on ≥ 480px, stacked below */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: 12,
                            }}
                        >
                            {/* TIMER 1 — Refund Window */}
                            <LiveCountdown
                                deadline={timers?.finalPaymentDeadline}
                                colorFn={getRefundTimerColor}
                                helperText={`You can request a refund of ${inr(holdRefundable)} (Security Deposit${holdAdvance > 0 ? ' + Advance' : ''}) while this timer runs. Note: ₹1,000 registration fee is non-refundable.`}
                                action={
                                    !bookingData?.refundRequestedAt ? (
                                        <button
                                            onClick={() => setShowRefundModal(true)}
                                            style={{ marginTop: 4, padding: "9px 16px", borderRadius: 9, border: "1.5px solid rgba(220,38,38,0.28)", background: "rgba(220,38,38,0.06)", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.78rem", fontWeight: 600, color: "#dc2626", cursor: "pointer", alignSelf: "flex-start" }}
                                        >
                                            Request Refund
                                        </button>
                                    ) : bookingData?.refundRequestedAt ? (
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.45)" }}>
                                            Refund request pending…
                                        </span>
                                    ) : null
                                }
                            />

                            {/* TIMER 2 — Payment Deadline */}
                            <LiveCountdown
                                deadline={timers?.finalPaymentDeadline}
                                colorFn={getPaymentTimerColor}
                                helperText="Complete your full payment before this deadline to confirm your room."
                                action={
                                    booking?.status === "FINAL_PAYMENT_PENDING" ? (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                            {!booking?.extensionRequested ? (
                                                <button
                                                    onClick={handleRequestExtension}
                                                    disabled={extensionLoading}
                                                    style={{ marginTop: 4, padding: "8px 14px", borderRadius: 9, border: "1.5px solid rgba(37,99,235,0.28)", background: "rgba(37,99,235,0.06)", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.74rem", fontWeight: 600, color: "#1d4ed8", cursor: extensionLoading ? "not-allowed" : "pointer", alignSelf: "flex-start" }}
                                                >
                                                    {extensionLoading ? "Requesting extension..." : "Request Deadline Extension"}
                                                </button>
                                            ) : (
                                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.45)" }}>
                                                    Extension request pending…
                                                </span>
                                            )}
                                            <button
                                                onClick={() => router.push("/user-onboarding/payment-breakdown")}
                                                style={{ padding: "9px 16px", borderRadius: 9, border: "none", background: GREEN, fontFamily: "var(--font-body, sans-serif)", fontSize: "0.78rem", fontWeight: 700, color: GOLD, cursor: "pointer", alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 3px 10px rgba(31,58,45,0.15)" }}
                                            >
                                                Proceed to Payment <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    ) : null
                                }
                            />
                        </div>
                    </motion.div>
                )}

                {/* Manual Refresh */}
                <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                    <button
                        onClick={refetch}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(31,58,45,0.12)", background: "#fff", fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.45)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.12em" }}
                    >
                        <RefreshCw size={11} /> Refresh status
                    </button>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.57rem", color: "rgba(31,58,45,0.3)", marginTop: 6 }}>
                        Status auto-refreshes every 30 seconds
                    </p>
                </motion.div>

                {/* Download Deposit Receipt */}
                <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/profile/me.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: "10px 20px", borderRadius: 10,
                            border: "1.5px solid rgba(31,58,45,0.18)",
                            background: "rgba(31,58,45,0.04)",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.65rem", fontWeight: 700,
                            color: GREEN, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: 8,
                            textTransform: "uppercase", letterSpacing: "0.12em",
                            textDecoration: "none",
                        }}
                    >
                        <Printer size={14} /> Download Profile PDF
                    </a>
                </motion.div>

                {/* Referral Banner */}
                {user?.referralCode && (
                    <motion.div
                        variants={itemVariants}
                        style={{
                            background: "linear-gradient(135deg, rgba(31,58,45,0.06) 0%, rgba(216,181,106,0.1) 100%)",
                            border: "1.5px solid rgba(216,181,106,0.3)",
                            borderRadius: 16, padding: "18px 22px",
                            textAlign: "center",
                        }}
                    >
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem",
                            textTransform: "uppercase", letterSpacing: "0.2em",
                            color: "rgba(31,58,45,0.45)", fontWeight: 700, margin: "0 0 8px",
                        }}>
                            Your Referral ID
                        </p>
                        <p style={{
                            fontFamily: "var(--font-display, serif)", fontSize: "1.6rem",
                            color: GREEN, margin: "0 0 10px", letterSpacing: "0.08em",
                            fontWeight: 400,
                        }}>
                            {user.referralCode}
                        </p>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem",
                            color: GOLD, margin: 0, fontWeight: 700,
                        }}>
                            Refer a friend and earn ₹1,000 back!
                        </p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                            color: "rgba(31,58,45,0.4)", margin: "6px 0 0",
                        }}>
                            Share your referral ID with friends during their payment to get ₹1,000 credited.
                        </p>
                    </motion.div>
                )}

                {/* Policy Reminder */}
                <motion.div
                    variants={itemVariants}
                    style={{ background: "rgba(216,181,106,0.07)", border: "1px solid rgba(216,181,106,0.18)", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}
                >
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "#9a7a3a", margin: 0, lineHeight: 1.6 }}>
                        <strong>Policy:</strong> Security deposit (₹15,000) refundable within 7 days · Non-refundable after 7 days{holdAdvance > 0 ? ` · Advance (${inr(holdAdvance)}) always refundable` : ''} · ₹1,000 registration fee never refundable · Room released after 21 days
                    </p>
                </motion.div>
            </motion.div>

            {/* Refund Modal */}
            <AnimatePresence>
                {showRefundModal && (
                    <RefundModal
                        onConfirm={handleRequestRefund}
                        onClose={() => setShowRefundModal(false)}
                        loading={refundLoading}
                        refundableAmount={holdRefundable}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
