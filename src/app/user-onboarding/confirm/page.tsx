"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, ArrowLeft, Upload, X, Building2, Banknote, Smartphone,
    Check, AlertCircle, Camera,
    Loader2, CheckCircle2, ArrowRight, Clock,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldInput, StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants, SecondaryButton,
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── V3 Types ─────────────────────────────────────────────────────────────────

interface PartialPaymentRecord {
    paymentId?: string;
    amount: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    paidAt: string;
    approvedAt?: string;
    utrNumber?: string | null;
}

interface InstallmentRecord {
    installmentNumber: number;
    type: string;
    totalAmount: number;
    amountPaid: number;
    amountRemaining: number;
    status: string;
    dueDate: string | null;
    partialPayments: PartialPaymentRecord[];
}

interface ServicePaymentRecord {
    totalAmount: number | null;
    amountPaid: number;
    status: string;
    payments: PartialPaymentRecord[];
}

interface BookingV3 {
    _id: string;
    bookingId: string;
    status: string;
    selections: {
        roomType?: string;
        roomTypeCode?: string;
        tenure?: number;
        mess?: { selected?: boolean };
        transport?: { selected?: boolean };
    };
    paymentPlan: {
        selectedTrack: string | null;
        selectedAt: string | null;
    };
    installments: InstallmentRecord[];
    servicePayments?: {
        mess?: ServicePaymentRecord;
        transport?: ServicePaymentRecord;
    };
    financials: {
        baseRentPerMonth?: number;
        discountPercentage?: number;
        taxRate?: number;
        grandTotal?: number;
        totalPaid?: number;
    };
    timers?: {
        finalPaymentDeadline?: string | null;
    };
    displayBills?: {
        projectedFinalBill?: {
            fullTenure?: ProjectedTrackBill;
            halfYearly?: ProjectedTrackBill;
        };
    };
}

interface ProjectedTrackBill {
    track: string;
    discountPercent: number;
    roomRent: {
        baseMonthly: number;
        discountedBase: number;
        gstPerMonth: number;
        monthlyTotal: number;
        tenure: number;
        total: number;
    };
    mess?: { monthly?: number; tenure?: number; total?: number } | null;
    transport?: { monthly?: number; tenure?: number; total?: number } | null;
    deductions?: { securityDeposit?: { amount: number; label: string } };
    grandTotal: number;
    totalAfterDeductions: number;
    firstInstallment?: { months: number; totalAmount: number };
    secondInstallment?: { months: number; totalAmount: number };
}

interface InstallmentPageData {
    currentInstallment: {
        number: number;
        totalAmount: number;
        amountPaid: number;
        amountRemaining: number;
        status: string;
        dueDate: string | null;
    };
    paymentHistory: {
        amount: number;
        paidAt: string;
        approvedAt?: string;
        status: string;
        utrNumber?: string | null;
    }[];
    nextPayment: {
        minimumAmount: number;
        maximumAmount: number;
        recommendedAmounts: number[];
    };
    pendingPayments: { amount: number; paidAt: string }[];
}

interface ServiceOption {
    service: string;
    label: string;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    monthlyRate?: number;
    tenure?: number;
    status: string;
    paymentHistory: PartialPaymentRecord[];
}

type PaymentMethod = "UPI" | "BANK_TRANSFER" | "CASH";

// ── Shared BillLine Helper ──────────────────────────────────────────────────

function BillLine({ label, amount, sub, isDeduction, isTotal }: {
    label: string; amount: number; sub?: string; isDeduction?: boolean; isTotal?: boolean;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: isTotal ? "0.68rem" : "0.6rem",
                color: isTotal ? GREEN : "rgba(31,58,45,0.55)", fontWeight: isTotal ? 700 : 400,
            }}>
                {label}{sub && <span style={{ opacity: 0.5, marginLeft: 4 }}>{sub}</span>}
            </span>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: isTotal ? "0.78rem" : "0.65rem",
                fontWeight: isTotal ? 700 : 500,
                color: isDeduction ? "#16a34a" : isTotal ? GREEN : "rgba(31,58,45,0.7)",
            }}>
                {isDeduction ? `−₹${Math.abs(amount).toLocaleString("en-IN")}` : `₹${amount.toLocaleString("en-IN")}`}
            </span>
        </div>
    );
}

// ── Payment History List ────────────────────────────────────────────────────

function PaymentHistoryList({ payments }: {
    payments: { amount: number; paidAt: string; status: string; utrNumber?: string | null }[];
}) {
    if (!payments.length) return null;
    return (
        <div style={{ marginBottom: 14 }}>
            <p style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                textTransform: "uppercase", letterSpacing: "0.12em", color: "#16a34a",
                fontWeight: 700, margin: "0 0 6px",
            }}>Payments Received</p>
            {payments.map((p, i) => (
                <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "7px 0", borderBottom: "1px solid rgba(31,58,45,0.06)",
                }}>
                    <div>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: GREEN, fontWeight: 600,
                        }}>₹{p.amount.toLocaleString("en-IN")}</span>
                        {p.utrNumber && (
                            <span style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.52rem",
                                color: "rgba(31,58,45,0.35)", marginLeft: 8,
                            }}>UTR: {p.utrNumber}</span>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.52rem",
                            color: "rgba(31,58,45,0.35)",
                        }}>{new Date(p.paidAt).toLocaleDateString("en-IN")}</span>
                        <span style={{
                            padding: "2px 7px", borderRadius: 4,
                            background: p.status === "APPROVED" ? "rgba(22,163,74,0.1)" : p.status === "REJECTED" ? "rgba(220,38,38,0.1)" : "rgba(216,181,106,0.15)",
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.48rem", fontWeight: 700,
                            color: p.status === "APPROVED" ? "#15803d" : p.status === "REJECTED" ? "#dc2626" : "#92400e",
                        }}>{p.status === "APPROVED" ? "Approved" : p.status === "REJECTED" ? "Rejected" : "Pending"}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Shared Payment Form ─────────────────────────────────────────────────────

function PaymentForm({
    maxAmount, recommendedAmounts, onSubmit, submitting, error: formError, successMsg,
}: {
    maxAmount: number;
    recommendedAmounts: number[];
    onSubmit: (amount: number, utr: string, receiptUrl: string, method: PaymentMethod) => Promise<void>;
    submitting: boolean;
    error: string | null;
    successMsg?: string | null;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [amount, setAmount] = useState("");
    const [utr, setUtr] = useState("");
    const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
    const [method, setMethod] = useState<PaymentMethod>("UPI");
    const [localError, setLocalError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { setLocalError("File must be under 10 MB"); return; }
        const reader = new FileReader();
        reader.onload = () => {
            setReceipt({ name: f.name, preview: reader.result as string });
            setLocalError(null);
        };
        reader.readAsDataURL(f);
    };

    const handleSubmit = async () => {
        const amt = Number(amount);
        if (!amt || amt < 500) { setLocalError("Minimum payment is ₹500"); return; }
        if (amt > maxAmount) { setLocalError(`Cannot exceed remaining ₹${maxAmount.toLocaleString("en-IN")}`); return; }
        if (!utr.trim()) { setLocalError("UTR / Transaction ID is required"); return; }
        if (!receipt) { setLocalError("Payment receipt is required"); return; }
        setLocalError(null);

        try {
            let receiptUrl = receipt.preview;
            if (receiptUrl.startsWith("data:")) {
                setUploading(true);
                receiptUrl = await uploadFile("receipt", receiptUrl, receipt.name);
                setUploading(false);
            }
            await onSubmit(amt, utr.trim(), receiptUrl, method);
            // On success, clear inputs
            setAmount(""); setUtr(""); setReceipt(null);
        } catch (err) {
            setUploading(false);
            setLocalError(err instanceof Error ? err.message : "Submission failed");
        }
    };

    const displayError = formError || localError;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
            {/* QR + Bank Details */}
            <div style={{
                padding: "14px 16px", background: "#fff",
                border: "1.5px solid rgba(31,58,45,0.1)", borderRadius: 12,
            }}>
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                    textTransform: "uppercase", letterSpacing: "0.15em",
                    color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 10px",
                }}>Payment Details</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <img
                        src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="QR"
                        style={{ width: 110, height: 110, borderRadius: 8, border: "1.5px solid rgba(31,58,45,0.1)" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 160 }}>
                        {([
                            ["Account", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                            ["A/C No.", PAYMENT_CONFIG.BANK_DETAILS.accountNo],
                            ["IFSC", PAYMENT_CONFIG.BANK_DETAILS.ifsc],
                            ["Bank", PAYMENT_CONFIG.BANK_DETAILS.bank],
                            ["UPI", PAYMENT_CONFIG.BANK_DETAILS.upiId],
                        ] as [string, string][]).map(([label, value]) => (
                            <div key={label}>
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.48rem",
                                    textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(31,58,45,0.35)",
                                }}>{label} </span>
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                                    color: GREEN, fontWeight: 600,
                                }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Amount Input */}
            <div>
                <FieldLabel>Amount to Pay (₹)</FieldLabel>
                <FieldInput
                    type="number"
                    placeholder={`Enter amount (max ₹${maxAmount.toLocaleString("en-IN")})`}
                    value={amount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                />
                {recommendedAmounts.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                        {recommendedAmounts.map((a) => (
                            <button key={a} onClick={() => setAmount(String(a))} style={{
                                padding: "4px 10px", borderRadius: 6,
                                border: "1px solid rgba(31,58,45,0.15)", background: "#fff",
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem",
                                color: GREEN, cursor: "pointer",
                            }}>₹{a.toLocaleString("en-IN")}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Method */}
            <div>
                <FieldLabel>Payment Method</FieldLabel>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["UPI", "BANK_TRANSFER", "CASH"] as PaymentMethod[]).map((m) => (
                        <button key={m} onClick={() => setMethod(m)} style={{
                            padding: "8px 14px", borderRadius: 8,
                            border: `1.5px solid ${method === m ? GREEN : "rgba(31,58,45,0.15)"}`,
                            background: method === m ? "rgba(31,58,45,0.06)" : "#fff",
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            fontWeight: method === m ? 700 : 400,
                            color: method === m ? GREEN : "rgba(31,58,45,0.5)", cursor: "pointer",
                        }}>
                            {m === "BANK_TRANSFER" ? "Bank Transfer" : m}
                        </button>
                    ))}
                </div>
            </div>

            {/* UTR */}
            <div>
                <FieldLabel>UTR / Transaction ID</FieldLabel>
                <FieldInput
                    placeholder="Enter UTR or transaction reference"
                    value={utr}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUtr(e.target.value)}
                />
            </div>

            {/* Receipt Upload */}
            <div>
                <FieldLabel>Payment Receipt</FieldLabel>
                {receipt ? (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                        background: "rgba(22,163,74,0.06)", borderRadius: 8,
                        border: "1px solid rgba(22,163,74,0.2)",
                    }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                            color: "#15803d", flex: 1,
                        }}>{receipt.name}</span>
                        <button onClick={() => setReceipt(null)} style={{
                            background: "none", border: "none", cursor: "pointer", padding: 2,
                        }}><X size={14} color="#dc2626" /></button>
                    </div>
                ) : (
                    <button onClick={() => fileRef.current?.click()} style={{
                        width: "100%", padding: "14px", borderRadius: 10,
                        border: "2px dashed rgba(31,58,45,0.2)", background: "rgba(31,58,45,0.02)",
                        cursor: "pointer", fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                        color: "rgba(31,58,45,0.4)", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 8,
                    }}>
                        <Camera size={16} />Upload receipt (JPG/PNG/PDF)
                    </button>
                )}
                <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handleFile} />
            </div>

            {/* Success message */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                            background: "rgba(22,163,74,0.07)", borderRadius: 8,
                            border: "1px solid rgba(22,163,74,0.2)",
                        }}
                    >
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "#15803d", fontWeight: 600,
                        }}>{successMsg}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error */}
            {displayError && (
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                    color: "#dc2626", margin: 0,
                }}>{displayError}</p>
            )}

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={submitting || uploading}
                style={{
                    width: "100%", padding: "14px 20px", borderRadius: 10, border: "none",
                    background: submitting || uploading ? "rgba(31,58,45,0.3)" : GREEN,
                    color: "#fff", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                    fontWeight: 700, cursor: submitting || uploading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
            >
                {submitting || uploading ? (
                    <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />{uploading ? "Uploading…" : "Submitting…"}</>
                ) : (
                    <><ArrowRight size={16} />Pay Now</>
                )}
            </button>
        </div>
    );
}

// ── Service Payment Section ─────────────────────────────────────────────────

function ServicePaymentSection({
    service, title, serviceType, bookingId, onSuccess,
}: {
    service: ServiceOption | null;
    title: string;
    serviceType: string;
    bookingId: string;
    onSuccess: () => void;
}) {
    const { token } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!service) return null;

    const isCompleted = service.status === "COMPLETED";

    const handleSubmit = async (amount: number, utr: string, receiptUrl: string, method: PaymentMethod) => {
        setSubmitting(true); setError(null); setSuccess(null);
        try {
            await apiFetch(`/api/v1/bookings/${bookingId}/services/${serviceType}/pay`, {
                method: "POST", token,
                body: { amount, utrNumber: utr, receiptUrl, paymentMethod: method },
            });
            setSuccess("Payment submitted for approval");
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    const approvedPayments = service.paymentHistory?.filter((p) => p.status === "APPROVED") || [];
    const pendingPayments = service.paymentHistory?.filter((p) => p.status === "PENDING") || [];

    return (
        <motion.div variants={itemVariants}>
            <FormCard>
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                    textTransform: "uppercase", letterSpacing: "0.18em",
                    color: "rgba(31,58,45,0.5)", fontWeight: 700, margin: "0 0 10px",
                }}>{title}</p>

                {/* Progress */}
                <div style={{
                    display: "flex", justifyContent: "space-between", marginBottom: 12,
                    padding: "10px 14px", background: "rgba(31,58,45,0.04)", borderRadius: 8,
                }}>
                    <div>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.5rem",
                            textTransform: "uppercase", color: "rgba(31,58,45,0.4)", margin: 0,
                        }}>Total</p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem",
                            fontWeight: 700, color: GREEN, margin: "2px 0 0",
                        }}>{inr(service.totalAmount)}</p>
                    </div>
                    <div>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.5rem",
                            textTransform: "uppercase", color: "rgba(31,58,45,0.4)", margin: 0,
                        }}>Paid</p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem",
                            fontWeight: 700, color: "#16a34a", margin: "2px 0 0",
                        }}>{inr(service.amountPaid)}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.5rem",
                            textTransform: "uppercase", color: "rgba(31,58,45,0.4)", margin: 0,
                        }}>Remaining</p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem",
                            fontWeight: 700, color: service.amountDue > 0 ? GREEN : "#16a34a",
                            margin: "2px 0 0",
                        }}>{inr(service.amountDue)}</p>
                    </div>
                </div>

                {approvedPayments.length > 0 && (
                    <PaymentHistoryList payments={approvedPayments.map((p) => ({
                        amount: p.amount, paidAt: p.paidAt, status: p.status, utrNumber: p.utrNumber,
                    }))} />
                )}

                {pendingPayments.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                            textTransform: "uppercase", letterSpacing: "0.12em", color: GOLD,
                            fontWeight: 700, margin: "0 0 6px",
                        }}>Awaiting Approval</p>
                        {pendingPayments.map((p, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between", padding: "6px 0",
                                borderBottom: "1px solid rgba(31,58,45,0.06)",
                            }}>
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                                    color: "rgba(31,58,45,0.5)",
                                }}>₹{p.amount.toLocaleString("en-IN")}</span>
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                    color: GOLD,
                                }}>Pending</span>
                            </div>
                        ))}
                    </div>
                )}

                {isCompleted ? (
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                        background: "rgba(22,163,74,0.07)", borderRadius: 8,
                        border: "1px solid rgba(22,163,74,0.2)",
                    }}>
                        <CheckCircle2 size={16} color="#16a34a" />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "#15803d", fontWeight: 600,
                        }}>{title} fully paid</span>
                    </div>
                ) : (
                    <PaymentForm
                        maxAmount={service.amountDue}
                        recommendedAmounts={service.amountDue > 0 ? [service.amountDue] : []}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        error={error}
                        successMsg={success}
                    />
                )}
            </FormCard>
        </motion.div>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ConfirmPage() {
    const router = useRouter();
    const { canAccessStep } = useOnboarding();
    const { token } = useAuth();

    const [booking, setBooking] = useState<BookingV3 | null>(null);
    const [installmentData, setInstallmentData] = useState<InstallmentPageData | null>(null);
    const [services, setServices] = useState<ServiceOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [activeInstallment, setActiveInstallment] = useState(1);

    // Room rent payment state
    const [roomSubmitting, setRoomSubmitting] = useState(false);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [roomSuccess, setRoomSuccess] = useState<string | null>(null);

    const bookingId = booking?._id || null;

    const fetchInstallment = useCallback(async (bId: string, instNum: number) => {
        try {
            const res = await apiFetch<{ data: InstallmentPageData }>(
                `/api/v1/bookings/${bId}/installments/${instNum}`, { token }
            );
            setInstallmentData(res.data);
        } catch {
            // installments may not exist yet
        }
    }, [token]);

    const fetchServices = useCallback(async (bId: string) => {
        try {
            const res = await apiFetch<{ data: { availableServices: ServiceOption[] } }>(
                `/api/v1/bookings/${bId}/services`, { token }
            );
            setServices(res.data.availableServices || []);
        } catch {
            // services may not exist
        }
    }, [token]);

    // Initial load
    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                // 1. Get my booking
                const bookingRes = await apiFetch<{ data: { booking: BookingV3; timers?: unknown; displayBills?: unknown } }>("/api/v1/bookings/my-booking", { token });
                if (cancelled) return;
                const b = bookingRes.data?.booking;
                if (!b) {
                    setPageError("No active booking data found.");
                    return;
                }
                setBooking(b);

                // 2. If track not selected yet, redirect
                if (!b.paymentPlan?.selectedTrack) {
                    router.replace("/user-onboarding/track-selection");
                    return;
                }

                // 3. Fetch installment data
                await fetchInstallment(b._id, 1);

                // 4. Fetch services
                await fetchServices(b._id);
            } catch (err) {
                if (cancelled) return;
                const msg = err instanceof Error ? err.message : "Failed to load payment data";
                if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
                    router.replace("/user-onboarding/track-selection");
                    return;
                }
                setPageError(msg);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [token, router, fetchInstallment, fetchServices]);

    // Access guard
    useEffect(() => {
        if (!canAccessStep(5)) {
            apiFetch("/api/v1/bookings/my-booking", { token }).catch(() => {
                router.replace("/user-onboarding/track-selection");
            });
        }
    }, [canAccessStep, router, token]);

    // Handle installment tab change
    const handleInstallmentTabChange = async (instNum: number) => {
        setActiveInstallment(instNum);
        setRoomSuccess(null);
        setRoomError(null);
        if (bookingId) await fetchInstallment(bookingId, instNum);
    };

    // Room rent submit handler
    const handleRoomPaySubmit = async (amount: number, utr: string, receiptUrl: string, method: PaymentMethod) => {
        if (!bookingId) return;
        setRoomSubmitting(true); setRoomError(null); setRoomSuccess(null);
        try {
            await apiFetch(`/api/v1/bookings/${bookingId}/installments/${activeInstallment}/pay`, {
                method: "POST", token,
                body: { amount, utrNumber: utr, receiptUrl, paymentMethod: method },
            });
            setRoomSuccess("Payment submitted — awaiting admin approval");
            await fetchInstallment(bookingId, activeInstallment);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Submission failed";
            setRoomError(msg);
            throw err; // re-throw so PaymentForm can catch it
        } finally {
            setRoomSubmitting(false);
        }
    };

    // ── Loading state
    if (loading) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 0" }}>
                <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>
                    Loading your payment details...
                </span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

    // ── Error state
    if (pageError) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ padding: "60px 0", textAlign: "center" }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: 16 }} />
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", color: "#dc2626" }}>{pageError}</p>
                <button
                    onClick={() => router.push("/user-onboarding/track-selection")}
                    style={{ marginTop: 16, padding: "12px 24px", borderRadius: 10, border: `2px solid ${GREEN}`, background: "transparent", color: GREEN, fontWeight: 600, cursor: "pointer" }}
                >Select Payment Track</button>
            </motion.div>
        );
    }

    if (!booking) return null;

    const trackKey = booking.paymentPlan?.selectedTrack === "FULL_TENURE" ? "fullTenure" : "halfYearly";
    const projBill = booking.displayBills?.projectedFinalBill?.[trackKey];
    const currentInst = booking.installments?.find((i) => i.installmentNumber === activeInstallment);
    const isInstCompleted = currentInst?.status === "COMPLETED";
    const deadline = booking.timers?.finalPaymentDeadline;

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}
        >
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Final Payment" />
                <StepTitle>Complete your payment</StepTitle>
                <StepSubtitle>
                    {booking.paymentPlan.selectedTrack === "FULL_TENURE"
                        ? "Full Tenure Payment — 11 months (40% discount)"
                        : "Half Yearly Payment — 6 + 5 months (25% discount)"}
                </StepSubtitle>
            </motion.div>

            {/* Deadline Timer */}
            {deadline && (
                <motion.div variants={itemVariants}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
                        background: "rgba(31,58,45,0.04)", borderRadius: 10,
                        border: "1px solid rgba(31,58,45,0.1)",
                    }}>
                        <Clock size={16} color={GREEN} />
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "rgba(31,58,45,0.6)",
                        }}>
                            Payment deadline:{" "}
                            <strong style={{ color: GREEN }}>
                                {new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </strong>
                        </span>
                    </div>
                </motion.div>
            )}

            {/* ── Room Rent Section ── */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <p style={{
                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                        textTransform: "uppercase", letterSpacing: "0.18em",
                        color: "rgba(31,58,45,0.5)", fontWeight: 700, margin: "0 0 12px",
                    }}>
                        Room Rent — {booking.paymentPlan.selectedTrack === "FULL_TENURE" ? "Full Tenure (11 months)" : "Half Yearly"}
                    </p>

                    {/* Bill breakdown */}
                    {projBill && (
                        <div style={{
                            display: "flex", flexDirection: "column", gap: 4, marginBottom: 12,
                            padding: "12px 16px", background: "rgba(31,58,45,0.03)", borderRadius: 10,
                        }}>
                            <BillLine label={`Base monthly rent`} amount={projBill.roomRent.baseMonthly} sub={`× ${projBill.roomRent.tenure} months`} />
                            <BillLine label={`Discount (${projBill.discountPercent}%)`} amount={projBill.roomRent.baseMonthly * projBill.roomRent.tenure - projBill.roomRent.discountedBase * projBill.roomRent.tenure} isDeduction />
                            <BillLine label="GST (12%)" amount={projBill.roomRent.gstPerMonth * projBill.roomRent.tenure} />
                            <BillLine label="— Security Deposit Credit" amount={15000} isDeduction />
                            <div style={{ borderTop: "1px solid rgba(31,58,45,0.08)", paddingTop: 8, marginTop: 4 }}>
                                <BillLine label="Net Room Rent Payable" amount={projBill.totalAfterDeductions} isTotal />
                            </div>
                        </div>
                    )}

                    {/* Installment tabs for half-yearly */}
                    {booking.paymentPlan.selectedTrack === "HALF_YEARLY" && booking.installments.length > 1 && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {booking.installments.map((inst) => (
                                <button
                                    key={inst.installmentNumber}
                                    onClick={() => handleInstallmentTabChange(inst.installmentNumber)}
                                    style={{
                                        flex: 1, padding: "10px 14px", borderRadius: 8,
                                        border: `1.5px solid ${activeInstallment === inst.installmentNumber ? GREEN : "rgba(31,58,45,0.15)"}`,
                                        background: activeInstallment === inst.installmentNumber ? "rgba(31,58,45,0.06)" : "#fff",
                                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                                        fontWeight: activeInstallment === inst.installmentNumber ? 700 : 400,
                                        color: activeInstallment === inst.installmentNumber ? GREEN : "rgba(31,58,45,0.5)",
                                        cursor: "pointer", textAlign: "center",
                                    }}
                                >
                                    Installment {inst.installmentNumber}
                                    {inst.installmentNumber === 1 ? " (6 mo)" : " (5 mo)"}
                                    {inst.status === "COMPLETED" && " ✓"}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Payment progress */}
                    {currentInst && (
                        <div style={{
                            display: "flex", justifyContent: "space-between", marginBottom: 12,
                            padding: "10px 14px", background: "rgba(31,58,45,0.04)", borderRadius: 8,
                        }}>
                            <div>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                    textTransform: "uppercase", letterSpacing: "0.12em",
                                    color: "rgba(31,58,45,0.4)", margin: 0,
                                }}>Total</p>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem",
                                    fontWeight: 700, color: GREEN, margin: "2px 0 0",
                                }}>{inr(currentInst.totalAmount)}</p>
                            </div>
                            <div>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                    textTransform: "uppercase", letterSpacing: "0.12em",
                                    color: "rgba(31,58,45,0.4)", margin: 0,
                                }}>Paid</p>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem",
                                    fontWeight: 700, color: "#16a34a", margin: "2px 0 0",
                                }}>{inr(currentInst.amountPaid)}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                    textTransform: "uppercase", letterSpacing: "0.12em",
                                    color: "rgba(31,58,45,0.4)", margin: 0,
                                }}>Remaining</p>
                                <p style={{
                                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem",
                                    fontWeight: 700, color: currentInst.amountRemaining > 0 ? GREEN : "#16a34a",
                                    margin: "2px 0 0",
                                }}>{inr(currentInst.amountRemaining)}</p>
                            </div>
                        </div>
                    )}

                    {/* Payment history */}
                    {installmentData && installmentData.paymentHistory.length > 0 && (
                        <PaymentHistoryList payments={installmentData.paymentHistory} />
                    )}

                    {/* Pending payments */}
                    {installmentData && installmentData.pendingPayments.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <p style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                textTransform: "uppercase", letterSpacing: "0.12em", color: GOLD,
                                fontWeight: 700, margin: "0 0 6px",
                            }}>Awaiting Approval</p>
                            {installmentData.pendingPayments.map((p, i) => (
                                <div key={i} style={{
                                    display: "flex", justifyContent: "space-between", padding: "6px 0",
                                    borderBottom: "1px solid rgba(31,58,45,0.06)",
                                }}>
                                    <span style={{
                                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem",
                                        color: "rgba(31,58,45,0.5)",
                                    }}>₹{p.amount.toLocaleString("en-IN")}</span>
                                    <span style={{
                                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                                        color: GOLD, fontWeight: 600,
                                    }}>Pending</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pay form — only if not completed */}
                    {!isInstCompleted && currentInst && currentInst.amountRemaining > 0 && (
                        <PaymentForm
                            maxAmount={installmentData?.nextPayment?.maximumAmount || currentInst.amountRemaining}
                            recommendedAmounts={installmentData?.nextPayment?.recommendedAmounts || [currentInst.amountRemaining]}
                            onSubmit={handleRoomPaySubmit}
                            submitting={roomSubmitting}
                            error={roomError}
                            successMsg={roomSuccess}
                        />
                    )}

                    {isInstCompleted && (
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                            background: "rgba(22,163,74,0.07)", borderRadius: 8,
                            border: "1px solid rgba(22,163,74,0.2)",
                        }}>
                            <CheckCircle2 size={16} color="#16a34a" />
                            <span style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                                color: "#15803d", fontWeight: 600,
                            }}>Installment {activeInstallment} fully paid</span>
                        </div>
                    )}
                </FormCard>
            </motion.div>

            {/* ── Mess Payment Section ── */}
            {booking.selections?.mess?.selected && (
                <ServicePaymentSection
                    service={services.find((s) => s.service === "MESS") || null}
                    title="Mess (Lunch)"
                    serviceType="mess"
                    bookingId={booking._id}
                    onSuccess={() => bookingId && fetchServices(bookingId)}
                />
            )}

            {/* ── Transport Payment Section ── */}
            {booking.selections?.transport?.selected && (
                <ServicePaymentSection
                    service={services.find((s) => s.service === "TRANSPORT") || null}
                    title="Transport"
                    serviceType="transport"
                    bookingId={booking._id}
                    onSuccess={() => bookingId && fetchServices(bookingId)}
                />
            )}

            {/* ── All Paid Status ── */}
            {booking.status === "FULLY_PAID" && (
                <motion.div variants={itemVariants}>
                    <div style={{
                        textAlign: "center", padding: "24px 16px",
                        background: "rgba(22,163,74,0.06)", borderRadius: 16,
                        border: "1.5px solid rgba(22,163,74,0.2)",
                    }}>
                        <CheckCircle2 size={32} color="#16a34a" style={{ margin: "0 auto 10px", display: "block" }} />
                        <p style={{
                            fontFamily: "var(--font-display, serif)", fontSize: "1.4rem",
                            color: GREEN, margin: "0 0 6px", fontWeight: 400,
                        }}>All payments complete!</p>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "rgba(31,58,45,0.5)", lineHeight: 1.5, margin: 0,
                        }}>
                            Your room is confirmed. The student dashboard will open after your move-in date.
                            Admin will contact you with move-in instructions.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Services Pending ── */}
            {booking.status === "SERVICES_PENDING" && (
                <motion.div variants={itemVariants}>
                    <div style={{
                        textAlign: "center", padding: "20px 16px",
                        background: "rgba(216,181,106,0.07)", borderRadius: 16,
                        border: "1px solid rgba(216,181,106,0.2)",
                    }}>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            color: "#92400e", lineHeight: 1.5, margin: 0,
                        }}>
                            Room rent fully paid. Please complete the optional service payments above to finalize.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-start" }}>
                <SecondaryButton onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
            </motion.div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    );
}
