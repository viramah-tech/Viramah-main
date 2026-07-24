"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    Clock,
    CreditCard,
    Home,
    Loader2,
    RefreshCw,
    XCircle,
    Printer,
    Trash2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { openReceiptWindow } from "@/lib/generateReceiptHtml";
import {
    NavButton,
    SecondaryButton,
    StepBadge,
    StepSubtitle,
    StepTitle,
    containerVariants,
    itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const inr = (n: number | null | undefined) =>
    `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;

const fmtDate = (d: string | null | undefined) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const statusView = {
    UNDER_VERIFICATION: {
        icon: Clock,
        title: "Payment Under Review",
        subtitle: "Your submitted payments are pending admin verification.",
        tone: "#9a7a3a",
        bg: "rgba(216,181,106,0.12)",
    },
    BOOKING_CONFIRMED: {
        icon: CheckCircle2,
        title: "Booking Confirmed",
        subtitle: "Booking payment is approved. Complete remaining dues to finish onboarding.",
        tone: "#14532d",
        bg: "rgba(22,163,74,0.10)",
    },
    FINAL_PAYMENT_PENDING: {
        icon: CreditCard,
        title: "Final Payment Pending",
        subtitle: "Pay remaining room rent, mess, and transport dues.",
        tone: "#14532d",
        bg: "rgba(22,163,74,0.10)",
    },
    FULLY_PAID: {
        icon: Home,
        title: "All Payments Completed",
        subtitle: "Payment dues are cleared. Your account will move to move-in workflow.",
        tone: "#14532d",
        bg: "rgba(22,163,74,0.10)",
    },
    REJECTED: {
        icon: XCircle,
        title: "Payment Rejected",
        subtitle: "A submitted payment was rejected. Please resubmit with valid proof.",
        tone: "#b91c1c",
        bg: "rgba(220,38,38,0.10)",
    },
    CANCELLED: {
        icon: XCircle,
        title: "Booking Cancelled",
        subtitle: "Booking is cancelled as per current lifecycle status.",
        tone: "#b91c1c",
        bg: "rgba(220,38,38,0.10)",
    },
} as const;

function PaymentPill({ status }: { status: "pending" | "approved" | "rejected" }) {
    const cfg =
        status === "approved"
            ? { bg: "rgba(22,163,74,0.1)", color: "#166534" }
            : status === "rejected"
                ? { bg: "rgba(220,38,38,0.1)", color: "#b91c1c" }
                : { bg: "rgba(216,181,106,0.12)", color: "#9a7a3a" };

    return (
        <span
            style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: cfg.bg,
                color: cfg.color,
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 700,
            }}
        >
            {status}
        </span>
    );
}

export default function PaymentStatusPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { payments, summary, booking, timers, isLoading, error, refetch } = useBookingStatus();

    const categoryLabels: Record<string, string> = {
        room_rent: "Room Rent",
        fine: "Fines",
        mess: "Mess Fee",
        transport: "Transport Fee",
        booking: "Booking Payment",
    };

    const handlePrintReceipt = (p: any) => {
        const catLabel = categoryLabels[p.category || "room_rent"] || p.paymentType || "Payment";
        const dateSettled = p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : "-";
        const dateSubmitted = p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : "-";

        const success = openReceiptWindow({
            payerName: user?.basicInfo?.fullName || "Student",
            userId: user?.basicInfo?.userId || "-",
            email: user?.basicInfo?.email || "-",
            phone: user?.basicInfo?.phone || "-",
            description: `${catLabel} Settlement`,
            transactionId: p.transactionId || "-",
            method: p.method || "-",
            amount: p.amount,
            receiptNo: `REC-${p._id.slice(-6).toUpperCase()}`,
            dateSubmitted,
            dateSettled,
        });

        if (!success) {
            alert("Popup blocker prevented opening the receipt. Please allow popups for this site.");
        }
    };

    const [actionLoading, setActionLoading] = useState<"extension" | "refund" | "cancel" | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

    const handleDeletePayment = async (paymentId: string) => {
        if (!confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) {
            return;
        }
        setDeletingPaymentId(paymentId);
        setActionError(null);
        setActionMessage(null);
        try {
            await apiFetch(API.payment.delete(paymentId), {
                method: "DELETE",
            });
            setActionMessage("Payment deleted successfully.");
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to delete payment");
        } finally {
            setDeletingPaymentId(null);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
    // Step-based routing removed - users can move freely
    }, [authLoading, router, user]);

    const view = statusView[booking?.status ?? "UNDER_VERIFICATION"];
    const StatusIcon = view.icon;

    const effectiveTotalRequired = useMemo(() => {
        if (!summary) return 0;
        let req = Number(summary.totalRequired ?? 0);
        if (summary.roomRent?.selectedPlan === "half") {
            const roomTotal = Number(summary.roomRent.total ?? 0);
            const deferred = roomTotal - Math.round(roomTotal * 0.60);
            req -= deferred;
        }
        return req;
    }, [summary]);

    const outstanding = useMemo(() => {
        const paid = Number(summary?.totalPaid ?? 0);
        return Math.max(0, effectiveTotalRequired - paid);
    }, [effectiveTotalRequired, summary?.totalPaid]);

    const canRequestExtension =
        booking?.status === "FINAL_PAYMENT_PENDING" && !booking.extensionRequested;
    const canRequestRefund =
        booking?.status === "FINAL_PAYMENT_PENDING" && !booking.refundRequestedAt;
    const canRequestCancel =
        (booking?.status === "BOOKING_CONFIRMED" || booking?.status === "FINAL_PAYMENT_PENDING") &&
        !booking.cancellationRequestedAt;

    const runAction = async (
        type: "extension" | "refund" | "cancel",
        endpoint: string,
        success: string
    ) => {
        setActionLoading(type);
        setActionError(null);
        setActionMessage(null);
        try {
            await apiFetch(endpoint, {
                method: "POST",
                body: { reason: `Requested from payment status page (${type})` },
            });
            setActionMessage(success);
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    // Only show full-page spinner when there truly is no data to display at all.
    const hasAnyData = payments.length > 0 || summary !== null || booking !== null;
    if (!hasAnyData && (authLoading || isLoading)) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ textAlign: "center", padding: "80px 0" }}>
                <Loader2 size={30} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ marginTop: 10, color: "rgba(31,58,45,0.6)", fontSize: "0.85rem" }}>Loading payment status...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 32 }}>
            <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                <StepBadge icon={CreditCard} label="Payment Status" />
                <StepTitle>{view.title}</StepTitle>
                <StepSubtitle>{view.subtitle}</StepSubtitle>
            </motion.div>

            <motion.div
                variants={itemVariants}
                style={{
                    background: view.bg,
                    border: "1px solid rgba(31,58,45,0.12)",
                    borderRadius: 14,
                    padding: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <StatusIcon size={20} color={view.tone} />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ color: view.tone, fontWeight: 700, fontSize: "0.9rem" }}>
                        Current lifecycle: {booking?.status ?? "UNDER_VERIFICATION"}
                    </span>
                    <span style={{ color: "rgba(31,58,45,0.58)", fontSize: "0.78rem" }}>
                        Deadline: {fmtDate(timers.finalPaymentDeadline ?? undefined)}
                    </span>
                </div>
            </motion.div>

            {booking?.status === "FULLY_PAID" && user?.onboarding?.currentStep !== "completed" && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: "rgba(216,181,106,0.08)",
                        border: "1px solid rgba(216,181,106,0.3)",
                        borderRadius: 14,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Clock size={18} color="#9a7a3a" />
                        <span style={{ color: "#9a7a3a", fontWeight: 700, fontSize: "0.85rem" }}>
                            Awaiting Document Verification
                        </span>
                    </div>
                    <p style={{ margin: 0, color: "rgba(31,58,45,0.7)", fontSize: "0.8rem", lineHeight: 1.4 }}>
                        Your payments are fully cleared! The administration team is now reviewing your uploaded identity documents. Once approved, you will be able to proceed to the move-in steps. Please refresh this page to check status changes.
                    </p>
                </motion.div>
            )}

            {error && (
                <motion.div variants={itemVariants} style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "10px 12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: "0.8rem" }}>{error}</span>
                </motion.div>
            )}

            {actionError && (
                <motion.div variants={itemVariants} style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "10px 12px", color: "#b91c1c", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: "0.8rem" }}>{actionError}</span>
                </motion.div>
            )}

            {actionMessage && (
                <motion.div variants={itemVariants} style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "10px 12px", color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={16} />
                    <span style={{ fontSize: "0.8rem" }}>{actionMessage}</span>
                </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
                <SummaryCard title="Total Required Now" value={inr(effectiveTotalRequired)} />
                <SummaryCard title="Total Approved" value={inr(summary?.totalPaid)} />
                <SummaryCard title="Outstanding" value={inr(outstanding)} />
                <SummaryCard title="Pending Requests" value={String(summary?.totalPending ?? 0)} icon={<CalendarClock size={14} color={GOLD} />} />
            </motion.div>

            <motion.div variants={itemVariants} style={{ background: "#fff", border: "1px solid rgba(31,58,45,0.12)", borderRadius: 14, padding: 14 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(31,58,45,0.5)" }}>
                    Lifecycle Actions
                </p>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
                    <ActionTile label="Request Extension" disabled={!canRequestExtension || actionLoading !== null} onClick={() => runAction("extension", API.payment.extensionRequest, "Extension request submitted.")} loading={actionLoading === "extension"} />
                    <ActionTile label="Request Refund" disabled={!canRequestRefund || actionLoading !== null} onClick={() => runAction("refund", API.payment.refundRequest, "Refund request submitted.")} loading={actionLoading === "refund"} />
                    <ActionTile label="Cancel Booking" disabled={!canRequestCancel || actionLoading !== null} onClick={() => runAction("cancel", API.payment.cancelBooking, "Cancellation request submitted.")} loading={actionLoading === "cancel"} />
                </div>
                <div style={{ marginTop: 10, fontSize: "0.74rem", color: "rgba(31,58,45,0.55)" }}>
                    Extension requested: {booking?.extensionRequested ? "Yes" : "No"} • Refund requested: {booking?.refundRequestedAt ? fmtDate(booking.refundRequestedAt) : "No"} • Cancellation requested: {booking?.cancellationRequestedAt ? fmtDate(booking.cancellationRequestedAt) : "No"}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ background: "#fff", border: "1px solid rgba(31,58,45,0.12)", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(31,58,45,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(31,58,45,0.5)" }}>
                        Payment Requests
                    </p>
                    <button onClick={refetch} style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, color: "rgba(31,58,45,0.5)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem" }}>
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
                {payments.length === 0 ? (
                    <div style={{ padding: 16, color: "rgba(31,58,45,0.5)", fontSize: "0.82rem" }}>
                        No payment requests yet.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {payments.map((payment) => (
                            <div key={payment._id} style={{ padding: 14, borderTop: "1px solid rgba(31,58,45,0.06)", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1.2fr auto", gap: 8, alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: GREEN }}>
                                        {payment.paymentType.replace("_", " ")} {payment.category ? `(${payment.category})` : ""}
                                    </div>
                                    <div style={{ fontSize: "0.72rem", color: "rgba(31,58,45,0.5)" }}>
                                        {payment.transactionId || "No transaction id"}
                                    </div>
                                </div>
                                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem", color: GREEN }}>
                                    {inr(payment.amount)}
                                </div>
                                <div style={{ fontSize: "0.74rem", color: "rgba(31,58,45,0.6)", textTransform: "capitalize" }}>
                                    {payment.method || "-"}
                                </div>
                                <div style={{ fontSize: "0.74rem", color: "rgba(31,58,45,0.6)", display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span>{fmtDate(payment.approvedAt || payment.uploadedAt || undefined)}</span>
                                    {payment.status === 'approved' && (
                                        <button
                                            onClick={() => handlePrintReceipt(payment)}
                                            style={{
                                                border: "none",
                                                background: "none",
                                                cursor: "pointer",
                                                color: "#166534",
                                                fontSize: "0.68rem",
                                                fontFamily: "var(--font-mono, monospace)",
                                                fontWeight: "bold",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                padding: 0,
                                                textAlign: "left",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            <Printer size={12} /> Print Receipt
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
                                    <PaymentPill status={payment.status} />
                                    {(payment.status === "pending" || payment.status === "rejected") && (
                                        <button
                                            onClick={() => handleDeletePayment(payment._id)}
                                            disabled={deletingPaymentId !== null}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: deletingPaymentId !== null ? "not-allowed" : "pointer",
                                                padding: 4,
                                                borderRadius: 6,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#dc2626",
                                                opacity: deletingPaymentId !== null ? 0.4 : 0.8,
                                                transition: "all 0.2s",
                                            }}
                                            title="Delete Payment"
                                        >
                                            {deletingPaymentId === payment._id ? (
                                                <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                                            ) : (
                                                <Trash2 size={13} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                {booking?.status === "REJECTED" ? (
                    <SecondaryButton onClick={() => router.push("/user-onboarding/deposit")}>Back to Booking</SecondaryButton>
                ) : (
                    <div />
                )}
                {(booking?.status === "BOOKING_CONFIRMED" || booking?.status === "FINAL_PAYMENT_PENDING") ? (
                    <NavButton onClick={() => router.push("/user-onboarding/payment-breakdown")}>
                        Continue Payment
                    </NavButton>
                ) : booking?.status === "REJECTED" ? (
                    <NavButton onClick={() => router.push("/user-onboarding/deposit")}>Re-submit Booking</NavButton>
                ) : booking?.status === "FULLY_PAID" ? (
                    user?.onboarding?.currentStep === "completed" ? (
                        <NavButton onClick={() => router.push("/student/move-in")}>View Next Steps</NavButton>
                    ) : (
                        <NavButton onClick={() => refetch()}>
                            Refresh Status
                        </NavButton>
                    )
                ) : (
                    <NavButton onClick={() => refetch()}>Check Again</NavButton>
                )}
            </motion.div>
        </motion.div>
    );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid rgba(31,58,45,0.12)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {icon}
                <span
                    style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.56rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: "rgba(31,58,45,0.45)",
                        fontWeight: 700,
                    }}
                >
                    {title}
                </span>
            </div>
            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.35rem", color: GREEN }}>{value}</span>
        </div>
    );
}

function ActionTile({
    label,
    disabled,
    onClick,
    loading,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    loading: boolean;
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(31,58,45,0.15)",
                background: disabled ? "rgba(31,58,45,0.05)" : "#fff",
                color: disabled ? "rgba(31,58,45,0.35)" : GREEN,
                cursor: disabled ? "not-allowed" : "pointer",
                fontSize: "0.78rem",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
            }}
        >
            {loading && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {label}
        </button>
    );
}
