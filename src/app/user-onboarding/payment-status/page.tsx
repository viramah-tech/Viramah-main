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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
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
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Popup blocker prevented opening the receipt. Please allow popups for this site.");
            return;
        }

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

        const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${p.transactionId || p._id}</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        color: #2E2A26;
                        margin: 40px;
                        line-height: 1.5;
                        background-color: #faf9f6;
                    }
                    .receipt-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #E8E5DF;
                        border-radius: 24px;
                        padding: 45px;
                        background: #fff;
                        box-shadow: 0 10px 30px rgba(31,58,45,0.03);
                        position: relative;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 2px solid #1F3A2D;
                        padding-bottom: 25px;
                        margin-bottom: 30px;
                    }
                    .logo-section h1 {
                        font-family: Georgia, serif;
                        color: #1F3A2D;
                        margin: 0;
                        font-size: 32px;
                        letter-spacing: 0.5px;
                        font-weight: normal;
                    }
                    .logo-section p {
                        margin: 6px 0 0 0;
                        font-size: 9px;
                        text-transform: uppercase;
                        letter-spacing: 3px;
                        color: #D8B56A;
                        font-weight: bold;
                    }
                    .receipt-title {
                        text-align: right;
                    }
                    .receipt-title h2 {
                        margin: 0;
                        color: #1F3A2D;
                        font-size: 22px;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                    }
                    .receipt-title p {
                        margin: 6px 0 0 0;
                        font-family: monospace;
                        font-size: 11px;
                        color: #7A7570;
                    }
                    .details-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 50px;
                        margin-bottom: 40px;
                    }
                    .details-block h3 {
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #7A7570;
                        border-bottom: 1px solid #E8E5DF;
                        padding-bottom: 8px;
                        margin-bottom: 14px;
                        font-weight: bold;
                    }
                    .details-block p {
                        margin: 6px 0;
                        font-size: 13.5px;
                    }
                    .details-block .value {
                        font-weight: 700;
                        color: #1F3A2D;
                    }
                    .table-section {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 40px;
                    }
                    .table-section th {
                        background: #F6F4EF;
                        color: #1F3A2D;
                        text-align: left;
                        padding: 14px 18px;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        border-bottom: 1px solid #E8E5DF;
                        font-weight: bold;
                    }
                    .table-section td {
                        padding: 18px;
                        font-size: 14px;
                        border-bottom: 1px solid #E8E5DF;
                        color: #2E2A26;
                    }
                    .amount-row td {
                        font-size: 18px;
                        font-weight: bold;
                        color: #1F3A2D;
                        background: #fdfdfb;
                    }
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-25deg);
                        font-size: 75px;
                        color: rgba(16, 185, 129, 0.08);
                        border: 6px double rgba(16, 185, 129, 0.08);
                        padding: 8px 25px;
                        font-weight: 800;
                        text-transform: uppercase;
                        pointer-events: none;
                        border-radius: 16px;
                        letter-spacing: 5px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 50px;
                        font-size: 11px;
                        color: #7A7570;
                        border-top: 1px dashed #E8E5DF;
                        padding-top: 25px;
                        line-height: 1.6;
                    }
                    @media print {
                        body {
                            margin: 0;
                            background-color: #fff;
                        }
                        .receipt-container {
                            border: none;
                            box-shadow: none;
                            padding: 0;
                        }
                        .watermark {
                            color: rgba(16, 185, 129, 0.12) !important;
                            border-color: rgba(16, 185, 129, 0.12) !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                    .print-btn-container {
                        text-align: right;
                        margin-bottom: 20px;
                        max-width: 800px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .print-btn {
                        background: #1F3A2D;
                        color: #F6F4EF;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 13px;
                        transition: all 0.2s;
                        letter-spacing: 0.5px;
                    }
                    .print-btn:hover {
                        background: #15271e;
                    }
                </style>
            </head>
            <body>
                <div class="print-btn-container no-print">
                    <button class="print-btn" onclick="window.print()">Print Receipt / Save PDF</button>
                </div>
                <div class="receipt-container">
                    <div class="watermark">PAID</div>
                    <div class="header">
                        <div class="logo-section">
                            <h1>VIRAMAH</h1>
                            <p>Premium Student Living</p>
                        </div>
                        <div class="receipt-title">
                            <h2>PAYMENT RECEIPT</h2>
                            <p>Receipt No: REC-${p._id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="details-block">
                            <h3>PAID BY</h3>
                            <p><span class="value">${user?.basicInfo?.fullName || "Student"}</span></p>
                            <p>User ID: ${user?.basicInfo?.userId || "-"}</p>
                            <p>Email: ${user?.basicInfo?.email || "-"}</p>
                            <p>Phone: ${user?.basicInfo?.phone || "-"}</p>
                        </div>
                        <div class="details-block">
                            <h3>PAID TO</h3>
                            <p><span class="value">VIRAMAH STAY</span></p>
                            <p>Premium Student Living & Hostels</p>
                            <p>Near GLA University</p>
                            <p>Mathura, Uttar Pradesh, India</p>
                        </div>
                    </div>

                    <table class="table-section">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Transaction Ref (UTR)</th>
                                <th>Payment Method</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${catLabel} Settlement</td>
                                <td><code style="font-family: monospace; font-size: 13px; font-weight: bold; color: #1F3A2D;">${p.transactionId || "-"}</code></td>
                                <td style="text-transform: uppercase;">${p.method || "-"}</td>
                                <td style="text-align: right; font-weight: bold;">₹${p.amount.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr class="amount-row">
                                <td colspan="3" style="text-align: right; font-weight: bold; border-top: 2px solid #1F3A2D;">Total Paid:</td>
                                <td style="text-align: right; font-weight: bold; border-top: 2px solid #1F3A2D;">₹${p.amount.toLocaleString('en-IN')}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="details-grid" style="margin-bottom: 20px;">
                        <div class="details-block">
                            <h3>TRANSACTION TIMELINE</h3>
                            <p>Submitted: <span class="value">${dateSubmitted}</span></p>
                            <p>Settled/Approved: <span class="value">${dateSettled}</span></p>
                        </div>
                        <div class="details-block" style="text-align: right; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end;">
                            <div style="border-top: 1px solid #2E2A26; width: 180px; padding-top: 6px; font-size: 11px; text-align: center; color: #7A7570;">
                                Authorized Signatory
                                <br><span style="font-weight: bold; color: #1F3A2D; font-family: Georgia, serif;">VIRAMAH ACCOUNTS</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        This is a computer-generated document and does not require a physical signature.<br>
                        Thank you for staying at Viramah Stay! For queries, contact support@viramahstay.com
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(receiptHtml);
        printWindow.document.close();
    };

    const [actionLoading, setActionLoading] = useState<"extension" | "refund" | "cancel" | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

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
                                <PaymentPill status={payment.status} />
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
