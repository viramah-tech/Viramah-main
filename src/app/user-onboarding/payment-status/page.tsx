"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Shield, CheckCircle2, Home, Phone, Mail, AlertCircle,
    CreditCard, CalendarClock, FileText, RefreshCw, ChevronDown, ChevronUp, Printer,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { apiFetch } from "@/lib/api";
import { printReceipt } from "@/utils/printReceipt";
import { containerVariants, itemVariants } from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

/** Format INR amounts consistently — never display raw numbers */
const inr = (n: number | null | undefined) =>
    n != null ? `₹${Math.round(n).toLocaleString("en-IN")}` : "—";

/** Format dates consistently */
const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });
};

// ── Status Config ────────────────────────────────────────────────────────────

const STATUS_MAP = {
    pending: {
        icon: Clock,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Payment Under Review",
        subtitle: "We've received your payment proof and it's being verified by our team.",
        badge: "Pending Verification",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    payment_submitted: {
        icon: Clock,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Payment Under Review",
        subtitle: "We've received your payment proof and it's being verified by our team.",
        badge: "Pending Verification",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    doc_verification_pending: {
        icon: Shield,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Document Verification In Progress",
        subtitle: "Payment approved! Your KYC documents are now being reviewed by our team.",
        badge: "Documents Under Review",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    move_in_pending: {
        icon: Home,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Awaiting Move-in Confirmation",
        subtitle: "Documents verified! Your move-in is being processed by our team.",
        badge: "Move-in Pending",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    move_in_approved: {
        icon: Home,
        iconColor: GREEN,
        iconBg: "rgba(31,58,45,0.1)",
        title: "Move-in Approved!",
        subtitle: "Your room is ready. Welcome to the VIRAMAH community!",
        badge: "Approved",
        badgeBg: "rgba(31,58,45,0.08)",
        badgeColor: GREEN,
        badgeBorder: "rgba(31,58,45,0.2)",
    },
};

// ── Payment Record Types ─────────────────────────────────────────────────────

interface PaymentBreakdown {
    roomMonthly?: number | null;
    discountedMonthlyWithGST?: number | null;
    roomRentTotal?: number | null;
    registrationFee?: number | null;
    securityDeposit?: number | null;
    transportTotal?: number | null;
    messTotal?: number | null;
    messIsLumpSum?: boolean;
    discountRate?: number | null;
    subtotal?: number | null;
    flatFees?: number | null;
    referralDeduction?: number | null;
    depositCredited?: number;
    advanceAmount?: number;
    finalAmount?: number | null;
    installmentMonths?: number | null;
    tenureMonths?: number | null;
    _isLegacy?: boolean;
}

interface PaymentRecord {
    _id: string;
    paymentId: string;
    paymentMode: "full" | "half" | "deposit";
    installmentNumber: number;
    amount: number;
    status: "pending" | "approved" | "rejected" | "upcoming";
    dueDate: string | null;
    createdAt: string;
    paidAt?: string | null;
    transactionId: string;
    paymentMethod: string;
    depositCredited: number;
    breakdown: PaymentBreakdown | null;
}

// ── Status Badge Component ────────────────────────────────────────────────────

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    approved: { bg: "rgba(22,163,74,0.08)", color: "#16a34a", border: "rgba(22,163,74,0.2)" },
    pending:  { bg: "rgba(216,181,106,0.12)", color: "#9a7a3a", border: "rgba(216,181,106,0.3)" },
    rejected: { bg: "rgba(220,38,38,0.08)", color: "#dc2626", border: "rgba(220,38,38,0.2)" },
    upcoming: { bg: "rgba(59,130,246,0.08)", color: "#2563eb", border: "rgba(59,130,246,0.2)" },
};

function PaymentStatusBadge({ status }: { status: string }) {
    const c = PAYMENT_STATUS_COLORS[status] || PAYMENT_STATUS_COLORS.pending;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 999,
            background: c.bg, border: `1px solid ${c.border}`,
            fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em",
            color: c.color,
        }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
            {status}
        </span>
    );
}

// ── Payment Record Card ────────────────────────────────────────────────────────

function PaymentCard({ payment, hasAdvance }: { payment: PaymentRecord; hasAdvance: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const b = payment.breakdown;
    const isLegacy = !b || (b as PaymentBreakdown)?._isLegacy;

    const modeLabel = payment.paymentMode === "full" ? "Full Tenure"
        : payment.paymentMode === "half" ? "Half Yearly"
        : "Deposit";

    const installmentLabel = payment.paymentMode === "half"
        ? `Installment ${payment.installmentNumber} of 2`
        : "Full Payment";

    return (
        <motion.div
            layout
            style={{
                background: "#fff", borderRadius: 16,
                border: "1px solid rgba(31,58,45,0.1)",
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(31,58,45,0.06)",
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: "18px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: isLegacy ? "default" : "pointer",
                    gap: 12,
                }}
                onClick={() => !isLegacy && setExpanded(!expanded)}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                            color: "rgba(31,58,45,0.4)", letterSpacing: "0.1em",
                        }}>
                            {payment.paymentId}
                        </span>
                        <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                        <span style={{
                            fontFamily: "var(--font-display, serif)", fontSize: "1.4rem",
                            color: GREEN, lineHeight: 1,
                        }}>
                            {inr(payment.amount)}
                        </span>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            color: "rgba(31,58,45,0.45)",
                        }}>
                            {installmentLabel} · {modeLabel}
                        </span>
                    </div>
                </div>
                {!isLegacy && (
                    <div style={{ flexShrink: 0, color: "rgba(31,58,45,0.3)" }}>
                        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                )}
            </div>

            {/* Meta row */}
            <div style={{
                padding: "0 20px 14px",
                display: "flex", gap: 20, flexWrap: "wrap",
            }}>
                {payment.transactionId && (
                    <MetaItem label="Transaction ID" value={payment.transactionId} />
                )}
                <MetaItem label="Method" value={payment.paymentMethod || "—"} />
                <MetaItem label="Submitted" value={fmtDate(payment.createdAt)} />
                {payment.status === "approved" && (
                    <MetaItem label="Approved" value={fmtDate(payment.paidAt || payment.createdAt)} />
                )}
                {payment.dueDate && payment.status === "upcoming" && (
                    <MetaItem label="Due By" value={fmtDate(payment.dueDate)} />
                )}
            </div>

            {/* Print Receipt Button */}
            <div style={{ padding: "0 20px 14px" }}>
                <button
                    onClick={() => printReceipt({
                        type: "payment",
                        amount: payment.amount,
                        transactionId: payment.transactionId,
                        date: payment.createdAt,
                        status: payment.status,
                        paymentId: payment.paymentId,
                        paymentMode: payment.paymentMode,
                        installmentNumber: payment.installmentNumber,
                        breakdown: b as Record<string, any> || undefined,
                        depositCredited: payment.depositCredited,
                    })}
                    style={{
                        padding: "6px 14px", borderRadius: 8,
                        border: "1.5px solid rgba(31,58,45,0.15)",
                        background: "rgba(31,58,45,0.03)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6rem", fontWeight: 600,
                        color: GREEN, cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 6,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                    }}
                >
                    <Printer size={12} /> Print Receipt
                </button>
            </div>

            {/* Deposit credit banner */}
            {payment.depositCredited > 0 && (
                <div style={{
                    margin: "0 20px 14px",
                    background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.15)",
                    borderRadius: 10, padding: "8px 14px",
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <Shield size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span style={{
                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                        color: "#14532d",
                    }}>
                        {inr(payment.depositCredited)} deposit{(payment.breakdown?.advanceAmount ?? 0) > 0 || hasAdvance ? " (security + advance)" : ""} credited against this payment
                    </span>
                </div>
            )}

            {/* Legacy notice */}
            {isLegacy && (
                <div style={{
                    margin: "0 20px 14px",
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                    color: "rgba(31,58,45,0.4)", fontStyle: "italic",
                }}>
                    Detailed breakdown not available for this record.
                </div>
            )}

            {/* Expandable Breakdown */}
            <AnimatePresence>
                {expanded && b && !isLegacy && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        style={{ overflow: "hidden" }}
                    >
                        <div style={{
                            borderTop: "1px solid rgba(31,58,45,0.06)",
                            padding: "16px 20px",
                            display: "flex", flexDirection: "column", gap: 6,
                        }}>
                            <p style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem",
                                textTransform: "uppercase", letterSpacing: "0.2em",
                                color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 4px",
                            }}>
                                Price Breakdown
                            </p>

                            {b.roomRentTotal != null && b.roomRentTotal > 0 && (
                                <BreakdownRow
                                    label={`Room Rent (${b.installmentMonths ?? "—"} months)`}
                                    value={inr(b.roomRentTotal)}
                                />
                            )}
                            {b.registrationFee != null && b.registrationFee > 0 && (
                                <BreakdownRow label="Registration Fee" value={inr(b.registrationFee)} />
                            )}
                            {b.securityDeposit != null && b.securityDeposit > 0 && (
                                <BreakdownRow label="Security Deposit" value={inr(b.securityDeposit)} />
                            )}
                            {b.transportTotal != null && b.transportTotal > 0 && (
                                <BreakdownRow label="Transport" value={inr(b.transportTotal)} />
                            )}
                            {b.messTotal != null && b.messTotal > 0 && (
                                <BreakdownRow
                                    label={`Mess${b.messIsLumpSum ? " (Lump Sum)" : ""}`}
                                    value={inr(b.messTotal)}
                                />
                            )}

                            {/* Divider */}
                            <div style={{ height: 1, background: "rgba(31,58,45,0.06)", margin: "4px 0" }} />

                            {b.subtotal != null && (
                                <BreakdownRow label="Subtotal" value={inr(b.subtotal)} />
                            )}
                            {b.discountRate != null && b.discountRate > 0 && (
                                <BreakdownRow
                                    label={`Discount (${Math.round(b.discountRate * 100)}%)`}
                                    value={`−${inr((b.subtotal ?? 0) - (b.finalAmount ?? 0) + (b.flatFees ?? 0) + (b.referralDeduction ?? 0) + (b.depositCredited ?? 0))}`}
                                    isDeduction
                                />
                            )}
                            {b.referralDeduction != null && b.referralDeduction > 0 && (
                                <BreakdownRow
                                    label="Referral Bonus"
                                    value={`−${inr(b.referralDeduction)}`}
                                    isDeduction
                                />
                            )}
                            {(b.depositCredited ?? 0) > 0 && (
                                <BreakdownRow
                                    label={`Deposit Credit${(b.advanceAmount ?? 0) > 0 || hasAdvance ? " (security + advance)" : ""}`}
                                    value={`−${inr(b.depositCredited)}`}
                                    isDeduction
                                />
                            )}

                            {/* Final total */}
                            <div style={{ height: 1, background: "rgba(31,58,45,0.1)", margin: "4px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <span style={{
                                    fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem",
                                    fontWeight: 700, color: GREEN,
                                }}>
                                    Total Paid
                                </span>
                                <span style={{
                                    fontFamily: "var(--font-display, serif)", fontSize: "1.2rem",
                                    color: GREEN,
                                }}>
                                    {inr(b.finalAmount ?? payment.amount)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function BreakdownRow({ label, value, isDeduction }: { label: string; value: string; isDeduction?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem",
                color: "rgba(31,58,45,0.5)",
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem",
                fontWeight: 600,
                color: isDeduction ? "#16a34a" : GREEN,
            }}>
                {value}
            </span>
        </div>
    );
}

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                textTransform: "uppercase", letterSpacing: "0.15em",
                color: "rgba(31,58,45,0.35)",
            }}>
                {label}
            </span>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem",
                color: GREEN, fontWeight: 500,
            }}>
                {value}
            </span>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentStatusPage() {
    const { state, setStatus } = useOnboarding();
    const { user, updateUser } = useAuth();

    // AUDIT FIX PS-1: Direct fetch on mount prevents stale context window
    const [freshUser, setFreshUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const fetchFresh = async () => {
            try {
                const res = await apiFetch<{ data: AuthUser }>("/api/public/auth/me");
                setFreshUser(res.data);
            } catch {
                // Fall back to context user — WebSocket will correct
            }
        };
        fetchFresh();
    }, []);

    // Use freshUser if available, fall back to context
    const effectiveUser = freshUser ?? user;

    // Map backend lifecycle fields to onboarding status
    useEffect(() => {
        if (!effectiveUser) return;
        const ps = effectiveUser.paymentStatus;
        const dvs = effectiveUser.documentVerificationStatus;
        const ms = effectiveUser.moveInStatus;

        if (ps === "rejected") {
            setStatus("pending");
        } else if (ps === "approved" && dvs === "approved" && ms === "completed") {
            setStatus("move_in_approved");
        } else if (ps === "approved" && dvs === "approved" && ms === "not_started") {
            setStatus("move_in_pending");
        } else if (ps === "approved" && dvs === "pending") {
            setStatus("doc_verification_pending");
        } else if (ps === "pending") {
            setStatus("payment_submitted");
        }
    }, [effectiveUser?.paymentStatus, effectiveUser?.documentVerificationStatus, effectiveUser?.moveInStatus, setStatus]);

    // Real-time: listen for user updates
    const handleSocketEvent = useCallback((event: string, data: unknown) => {
        if (event === "user:updated" && data) {
            updateUser(data as Partial<AuthUser>);
            setFreshUser(data as AuthUser);
        }
    }, [updateUser]);
    useSocket(user?._id, handleSocketEvent);

    // ── AUDIT FIX PS-2: Fetch payment history + upcoming installments ──────────
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [upcoming, setUpcoming] = useState<PaymentRecord[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState(true);
    const [paymentsError, setPaymentsError] = useState<string | null>(null);

    // ── Fetch deposit hold data for real advance/deposit amounts ──────────────
    const [depositHold, setDepositHold] = useState<{
        depositAmount: number;
        registrationFeePaid: number;
        advanceAmount: number;
        totalPaidAtDeposit: number;
        refundableAmount: number;
    } | null>(null);

    const fetchPayments = useCallback(async () => {
        try {
            setPaymentsLoading(true);
            setPaymentsError(null);
            const [paymentsRes, upcomingRes, depositRes] = await Promise.allSettled([
                // V2: /api/payment/history returns { data: { payments, pagination } }
                apiFetch<{ data: { payments: PaymentRecord[] } }>("/api/payment/history?limit=50"),
                // /upcoming has no V2 equivalent yet — derived from PaymentPlan phases.
                // Kept on legacy V1 endpoint until ported.
                apiFetch<{ data: { installments: PaymentRecord[] } }>("/api/public/payments/upcoming"),
                apiFetch<{ data: { hold: { depositAmount: number; registrationFeePaid: number; advanceAmount: number; totalPaidAtDeposit: number; refundableAmount: number } | null } }>("/api/public/deposits/status"),
            ]);

            if (paymentsRes.status === "fulfilled") {
                setPayments(paymentsRes.value?.data?.payments ?? []);
            }
            if (upcomingRes.status === "fulfilled") {
                setUpcoming(upcomingRes.value?.data?.installments ?? []);
            }
            if (depositRes.status === "fulfilled" && depositRes.value?.data?.hold) {
                const h = depositRes.value.data.hold;
                setDepositHold({
                    depositAmount: h.depositAmount ?? 0,
                    registrationFeePaid: h.registrationFeePaid ?? 0,
                    advanceAmount: h.advanceAmount ?? 0,
                    totalPaidAtDeposit: h.totalPaidAtDeposit ?? 0,
                    refundableAmount: h.refundableAmount ?? 0,
                });
            }
        } catch {
            setPaymentsError("Could not load payment history.");
        } finally {
            setPaymentsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPayments(); }, [fetchPayments]);

    // ── Computed values ─────────────────────────────────────────────────────────
    const statusKey = state.status === "pending" ? "payment_submitted" : state.status;
    const status = STATUS_MAP[statusKey as keyof typeof STATUS_MAP] || STATUS_MAP.payment_submitted;
    const StatusIcon = status.icon;
    const isMoveInApproved = state.status === "move_in_approved";

    // Compute balance summary from actual payment records
    const approvedPayments = payments.filter(p => p.status === "approved");
    const pendingPayments = payments.filter(p => p.status === "pending");
    const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalUpcoming = upcoming.reduce((sum, p) => sum + p.amount, 0);
    const hasPayments = payments.length > 0;

    // Advance amount from actual database hold — no hardcoded thresholds
    const dbAdvanceAmount = depositHold?.advanceAmount ?? 0;
    const hasAdvance = dbAdvanceAmount > 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                display: "flex", flexDirection: "column", gap: 28,
                paddingBottom: 32, minHeight: "60vh",
            }}
        >
            {/* Status Icon + Badge + Title */}
            <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: status.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: `0 8px 32px ${status.iconBg}`,
                    }}
                >
                    <StatusIcon size={36} color={status.iconColor} />
                </motion.div>

                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 16px", borderRadius: 999,
                    background: status.badgeBg, border: `1px solid ${status.badgeBorder}`,
                    marginBottom: 16,
                }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: status.badgeColor }} />
                    <span style={{
                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                        textTransform: "uppercase", letterSpacing: "0.2em",
                        color: status.badgeColor, fontWeight: 700,
                    }}>
                        {status.badge}
                    </span>
                </div>

                <h1 style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    color: GREEN, lineHeight: 1.1, fontWeight: 400, marginBottom: 10,
                }}>
                    {status.title}
                </h1>
                <p style={{
                    fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                    color: "rgba(31,58,45,0.55)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6,
                }}>
                    {status.subtitle}
                </p>
            </motion.div>

            {/* Deposit Credit Summary — sourced from database hold */}
            {depositHold && depositHold.totalPaidAtDeposit > 0 && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: "rgba(22,163,74,0.07)", border: "1px solid rgba(22,163,74,0.2)",
                        borderRadius: 12, padding: "12px 18px",
                        display: "flex", flexDirection: "column", gap: 8,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Shield size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem",
                            color: "#14532d", margin: 0, fontWeight: 500,
                        }}>
                            {inr(depositHold.totalPaidAtDeposit)} paid at booking
                        </p>
                    </div>
                    <div style={{ marginLeft: 26, display: "flex", flexDirection: "column", gap: 3 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(20,83,45,0.6)" }}>
                            Security Deposit: {inr(depositHold.depositAmount)} · Credited against payment
                        </span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(20,83,45,0.6)" }}>
                            Registration Fee: {inr(depositHold.registrationFeePaid)} · Non-refundable
                        </span>
                        {hasAdvance && (
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(20,83,45,0.6)" }}>
                                Advance Payment: {inr(depositHold.advanceAmount)} · Credited against payment
                            </span>
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Payment Summary Cards ──────────────────────────────────────── */}
            {hasPayments && (
                <motion.div variants={itemVariants}>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: 12,
                    }}>
                        <SummaryCard
                            icon={<CheckCircle2 size={16} color="#16a34a" />}
                            label="Total Paid"
                            amount={inr(totalPaid)}
                            bgColor="rgba(22,163,74,0.06)"
                            borderColor="rgba(22,163,74,0.15)"
                            amountColor="#16a34a"
                        />
                        {totalPending > 0 && (
                            <SummaryCard
                                icon={<Clock size={16} color="#9a7a3a" />}
                                label="Under Review"
                                amount={inr(totalPending)}
                                bgColor="rgba(216,181,106,0.08)"
                                borderColor="rgba(216,181,106,0.2)"
                                amountColor="#9a7a3a"
                            />
                        )}
                        {totalUpcoming > 0 && (
                            <SummaryCard
                                icon={<CalendarClock size={16} color="#2563eb" />}
                                label="Remaining"
                                amount={inr(totalUpcoming)}
                                bgColor="rgba(59,130,246,0.06)"
                                borderColor="rgba(59,130,246,0.15)"
                                amountColor="#2563eb"
                            />
                        )}
                    </div>
                </motion.div>
            )}

            {/* ── Payment Records ─────────────────────────────────────────────── */}
            <motion.div variants={itemVariants}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 14,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={16} color="rgba(31,58,45,0.4)" />
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            textTransform: "uppercase", letterSpacing: "0.25em",
                            color: "rgba(31,58,45,0.55)", fontWeight: 700, margin: 0,
                        }}>
                            Payment Records
                        </p>
                    </div>
                    <button
                        onClick={fetchPayments}
                        disabled={paymentsLoading}
                        style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem",
                            color: "rgba(31,58,45,0.4)", background: "none", border: "none",
                            cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.1em",
                        }}
                    >
                        <RefreshCw size={11} /> Refresh
                    </button>
                </div>

                {/* Error banner */}
                {paymentsError && (
                    <div style={{
                        background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
                        borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                        display: "flex", alignItems: "center", gap: 8,
                    }}>
                        <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "#dc2626",
                        }}>
                            {paymentsError}
                        </span>
                    </div>
                )}

                {/* Loading skeleton */}
                {paymentsLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[1, 2].map(i => (
                            <div key={i} style={{
                                background: "#fff", borderRadius: 16,
                                border: "1px solid rgba(31,58,45,0.08)",
                                padding: "20px", height: 80,
                            }}>
                                <div style={{
                                    width: "40%", height: 12, borderRadius: 4,
                                    background: "rgba(31,58,45,0.08)",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                }} />
                                <div style={{
                                    width: "25%", height: 20, borderRadius: 4, marginTop: 10,
                                    background: "rgba(31,58,45,0.06)",
                                    animation: "pulse 1.5s ease-in-out infinite",
                                }} />
                            </div>
                        ))}
                    </div>
                ) : payments.length === 0 ? (
                    /* Empty state */
                    <div style={{
                        background: "rgba(31,58,45,0.03)", borderRadius: 16,
                        border: "1px dashed rgba(31,58,45,0.12)",
                        padding: "32px 20px", textAlign: "center",
                    }}>
                        <CreditCard size={28} color="rgba(31,58,45,0.2)" style={{ margin: "0 auto 12px", display: "block" }} />
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem",
                            color: "rgba(31,58,45,0.4)", margin: 0,
                        }}>
                            No payment records found.
                        </p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            color: "rgba(31,58,45,0.3)", margin: "6px 0 0",
                        }}>
                            If you have submitted a payment, it may take a moment to appear.
                        </p>
                    </div>
                ) : (
                    /* Payment cards */
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {payments
                            .filter(p => p.status !== "upcoming") // upcoming shown separately
                            .map(p => <PaymentCard key={p._id} payment={p} hasAdvance={hasAdvance} />)
                        }
                    </div>
                )}
            </motion.div>

            {/* ── Upcoming Installments (half-pay users) ──────────────────────── */}
            {upcoming.length > 0 && (
                <motion.div variants={itemVariants}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        marginBottom: 14,
                    }}>
                        <CalendarClock size={16} color="rgba(59,130,246,0.5)" />
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            textTransform: "uppercase", letterSpacing: "0.25em",
                            color: "rgba(31,58,45,0.55)", fontWeight: 700, margin: 0,
                        }}>
                            Upcoming Payments
                        </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {upcoming.map(p => (
                            <div key={p._id} style={{
                                background: "rgba(59,130,246,0.04)",
                                border: "1.5px solid rgba(59,130,246,0.15)",
                                borderRadius: 16, padding: "20px",
                            }}>
                                <div style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    marginBottom: 12,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <CalendarClock size={18} color="#2563eb" />
                                        <span style={{
                                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                                            fontWeight: 700, color: GREEN,
                                        }}>
                                            Installment {p.installmentNumber} of 2
                                        </span>
                                    </div>
                                    <PaymentStatusBadge status="upcoming" />
                                </div>

                                <div style={{
                                    display: "flex", gap: 24, flexWrap: "wrap",
                                    alignItems: "baseline",
                                }}>
                                    <div>
                                        <p style={{
                                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                            textTransform: "uppercase", letterSpacing: "0.15em",
                                            color: "rgba(31,58,45,0.4)", margin: "0 0 2px",
                                        }}>
                                            Amount Due
                                        </p>
                                        <span style={{
                                            fontFamily: "var(--font-display, serif)", fontSize: "1.6rem",
                                            color: "#2563eb", lineHeight: 1,
                                        }}>
                                            {inr(p.amount)}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{
                                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                            textTransform: "uppercase", letterSpacing: "0.15em",
                                            color: "rgba(31,58,45,0.4)", margin: "0 0 2px",
                                        }}>
                                            Due By
                                        </p>
                                        <span style={{
                                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                                            color: GREEN, fontWeight: 600,
                                        }}>
                                            {fmtDate(p.dueDate)}
                                        </span>
                                    </div>
                                </div>

                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                                    color: "rgba(59,130,246,0.6)", margin: "14px 0 0", lineHeight: 1.5,
                                }}>
                                    Complete your second installment before the due date to avoid disruption to your accommodation.
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ── Lifecycle Timeline ──────────────────────────────────────────── */}
            <motion.div
                variants={itemVariants}
                style={{
                    background: "#fff", borderRadius: 20,
                    border: "1px solid rgba(31,58,45,0.1)",
                    padding: 32,
                    boxShadow: "0 4px 24px rgba(31,58,45,0.07)",
                }}
            >
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                    textTransform: "uppercase", letterSpacing: "0.25em",
                    color: "rgba(31,58,45,0.55)", fontWeight: 700, marginBottom: 20,
                }}>
                    What happens next
                </p>

                {[
                    {
                        step: "1", title: "Payment Verification",
                        desc: "Our team verifies your payment proof (24-48 hours)",
                        done: ["doc_verification_pending", "move_in_pending", "move_in_approved"].includes(state.status),
                        active: state.status === "payment_submitted" || state.status === "pending",
                    },
                    {
                        step: "2", title: "Document Review",
                        desc: "KYC and identity documents are reviewed",
                        done: ["move_in_pending", "move_in_approved"].includes(state.status),
                        active: state.status === "doc_verification_pending",
                    },
                    {
                        step: "3", title: "Move-in Approval",
                        desc: "Room assignment confirmed and dashboard access granted",
                        done: state.status === "move_in_approved",
                        active: state.status === "move_in_pending",
                    },
                ].map((item, i) => (
                    <div key={i} style={{
                        display: "flex", gap: 16,
                        paddingBottom: i < 2 ? 20 : 0,
                        marginBottom: i < 2 ? 20 : 0,
                        borderBottom: i < 2 ? "1px solid rgba(31,58,45,0.06)" : "none",
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: item.done ? GREEN : item.active ? "rgba(216,181,106,0.15)" : "rgba(31,58,45,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            border: item.active ? `2px solid ${GOLD}` : "none",
                        }}>
                            {item.done ? (
                                <CheckCircle2 size={16} color={GOLD} />
                            ) : (
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                                    fontWeight: 700,
                                    color: item.active ? GOLD : "rgba(31,58,45,0.3)",
                                }}>
                                    {item.step}
                                </span>
                            )}
                        </div>
                        <div>
                            <p style={{
                                fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                                fontWeight: 600,
                                color: item.done || item.active ? GREEN : "rgba(31,58,45,0.4)",
                                margin: 0,
                            }}>
                                {item.title}
                            </p>
                            <p style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                                color: "rgba(31,58,45,0.4)", margin: "4px 0 0",
                                letterSpacing: "0.03em",
                            }}>
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Dashboard access / Move-in */}
            {!isMoveInApproved ? (
                <motion.div variants={itemVariants} style={{
                    background: "rgba(31,58,45,0.04)", border: "1px solid rgba(31,58,45,0.1)",
                    borderRadius: 12, padding: 20, display: "flex", alignItems: "center", gap: 14,
                }}>
                    <Shield size={20} color="rgba(31,58,45,0.4)" />
                    <div>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem",
                            fontWeight: 600, color: GREEN, margin: 0,
                        }}>
                            Dashboard access is restricted
                        </p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "rgba(31,58,45,0.45)", margin: "4px 0 0",
                        }}>
                            Your student dashboard will be enabled after admin verification and move-in approval.
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                    <a href="/student/dashboard" style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "14px 32px",
                        background: "linear-gradient(135deg, #1F3A2D, #162b1e)",
                        color: GOLD, border: "none", borderRadius: 10,
                        fontFamily: "var(--font-mono, monospace)", fontWeight: 700,
                        fontSize: "0.7rem", textTransform: "uppercase",
                        letterSpacing: "0.18em", textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(31,58,45,0.18)",
                        transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                    }}>
                        <Home size={16} /> Go to Dashboard
                    </a>
                </motion.div>
            )}

            {/* Referral Banner */}
            {effectiveUser?.referralCode && (
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
                        {effectiveUser.referralCode}
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

            {/* Contact Info */}
            <motion.div variants={itemVariants} style={{
                textAlign: "center", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8,
            }}>
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                    textTransform: "uppercase", letterSpacing: "0.2em",
                    color: "rgba(31,58,45,0.35)",
                }}>
                    Need help? Contact us
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                    <a href="tel:+919876543210" style={{
                        display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                    }}>
                        <Phone size={14} color="rgba(31,58,45,0.4)" />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem",
                            color: "rgba(31,58,45,0.5)",
                        }}>+91 98765 43210</span>
                    </a>
                    <a href="mailto:support@viramah.com" style={{
                        display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
                    }}>
                        <Mail size={14} color="rgba(31,58,45,0.4)" />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem",
                            color: "rgba(31,58,45,0.5)",
                        }}>support@viramah.com</span>
                    </a>
                </div>
            </motion.div>

            {/* Pulse animation for skeletons */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </motion.div>
    );
}

// ── Summary Card ──────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, amount, bgColor, borderColor, amountColor }: {
    icon: React.ReactNode;
    label: string;
    amount: string;
    bgColor: string;
    borderColor: string;
    amountColor: string;
}) {
    return (
        <div style={{
            background: bgColor, border: `1px solid ${borderColor}`,
            borderRadius: 14, padding: "16px 18px",
            display: "flex", flexDirection: "column", gap: 6,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {icon}
                <span style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    color: "rgba(31,58,45,0.45)", fontWeight: 700,
                }}>
                    {label}
                </span>
            </div>
            <span style={{
                fontFamily: "var(--font-display, serif)", fontSize: "1.5rem",
                color: amountColor, lineHeight: 1,
            }}>
                {amount}
            </span>
        </div>
    );
}
