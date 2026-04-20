"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CreditCard,
    Loader2,
    Receipt,
    Upload,
    X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError, apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { uploadPaymentProof } from "@/lib/uploadFile";
import {
    FieldError,
    FieldInput,
    FieldLabel,
    NavButton,
    SecondaryButton,
    SelectionButton,
    StepBadge,
    StepSubtitle,
    StepTitle,
    containerVariants,
    itemVariants,
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

type FinalCategory = "room_rent" | "mess" | "transport" | "security_deposit";
type PaymentMethod = "upi" | "bank_transfer" | "cash";

type Ledger = {
    total?: number;
    paid?: number;
    remaining?: number;
};

type PaymentStatusData = {
    paymentDetails?: any[];
    paymentSummary?: {
        securityDeposit?: Ledger;
        roomRent?: Ledger;
        messFee?: Ledger;
        transportFee?: Ledger;
        grandTotal?: Ledger;
    };
};

type DueItem = {
    category: FinalCategory;
    label: string;
    total: number;
    paid: number;
    remaining: number;
    partialAllowed: boolean;
    isRoomRent: boolean;
    fullDiscountPct?: number;
    halfDiscountPct?: number;
    selectedPlan?: string;
};

function ReceiptUpload({
    file,
    onUpload,
    onRemove,
}: {
    file: { name: string; preview: string } | null;
    onUpload: (f: { name: string; preview: string }) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => onUpload({ name: f.name, preview: reader.result as string });
        reader.readAsDataURL(f);
    };

    return (
        <div>
            <FieldLabel>Payment Receipt / Screenshot</FieldLabel>
            <div style={{ marginTop: 8 }}>
                {file ? (
                    <div style={{ position: "relative", maxWidth: 320, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}` }}>
                        <Image
                            src={file.preview}
                            alt="Receipt"
                            width={1200}
                            height={900}
                            unoptimized
                            style={{ width: "100%", height: "auto", display: "block" }}
                        />
                        <button
                            onClick={onRemove}
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.95)",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <X size={14} color={GREEN} />
                        </button>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(31,58,45,0.85)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                            <Check size={12} color={GOLD} />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>{file.name}</span>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => inputRef.current?.click()}
                        style={{
                            width: "100%",
                            maxWidth: 320,
                            aspectRatio: "4/3",
                            borderRadius: 12,
                            border: "2px dashed rgba(31,58,45,0.25)",
                            background: "rgba(255,255,255,0.55)",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                        }}
                    >
                        <Upload size={22} color="rgba(31,58,45,0.45)" />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.5)" }}>Upload payment proof</span>
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
    );
}

export default function PaymentBreakdownPage() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [statusData, setStatusData] = useState<PaymentStatusData | null>(null);

    const [category, setCategory] = useState<FinalCategory | null>(null);
    const [method, setMethod] = useState<PaymentMethod>("upi");
    const [amount, setAmount] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
    const [attempted, setAttempted] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: PaymentStatusData }>(API.payment.status);
            setStatusData(res?.data ?? null);
            setError(null);
        } catch (err) {
            if (err instanceof ApiError && err.status === 403) {
                setError("Final payment is not available for your current onboarding step yet.");
                return;
            }
            setError(err instanceof Error ? err.message : "Failed to load payment status.");
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace("/login");
            return;
        }

        // Step access restrictions removed - users can move freely
        // const step = user.onboarding?.currentStep;
        // if (step === "review") {
        //     router.replace("/user-onboarding/step-4");
        //     return;
        // }
        // if (step === "booking_payment") {
        //     router.replace("/user-onboarding/deposit");
        //     return;
        // }
        // if (step !== "final_payment" && step !== "completed") {
        //     router.replace("/user-onboarding/step-3");
        //     return;
        // }

        const initialFetchTimer = setTimeout(() => {
            fetchStatus().finally(() => setLoading(false));
        }, 0);

        return () => {
            clearTimeout(initialFetchTimer);
        };
    }, [authLoading, fetchStatus, router, user]);

    const dueItems = useMemo<DueItem[]>(() => {
        const summary = statusData?.paymentSummary;
        const items: DueItem[] = [
            {
                category: "room_rent",
                label: "Room Rent",
                total: Number(summary?.roomRent?.total ?? 0),
                paid: Number(summary?.roomRent?.paid ?? 0),
                remaining: Number(summary?.roomRent?.remaining ?? 0),
                partialAllowed: true,
                isRoomRent: true,
                fullDiscountPct: (summary?.roomRent as any)?.fullPaymentDiscountPct ?? 40,
                halfDiscountPct: (summary?.roomRent as any)?.halfPaymentDiscountPct ?? 25,
                selectedPlan: (summary?.roomRent as any)?.selectedPlan ?? "pending",
            },
            {
                category: "security_deposit",
                label: "Security Deposit",
                total: Number(summary?.securityDeposit?.total ?? 0),
                paid: Number(summary?.securityDeposit?.paid ?? 0),
                remaining: Number(summary?.securityDeposit?.remaining ?? 0),
                partialAllowed: true,
                isRoomRent: false,
            },
            {
                category: "mess",
                label: "Mess Fee",
                total: Number(summary?.messFee?.total ?? 0),
                paid: Number(summary?.messFee?.paid ?? 0),
                remaining: Number(summary?.messFee?.remaining ?? 0),
                partialAllowed: false,
                isRoomRent: false,
            },
            {
                category: "transport",
                label: "Transport Fee",
                total: Number(summary?.transportFee?.total ?? 0),
                paid: Number(summary?.transportFee?.paid ?? 0),
                remaining: Number(summary?.transportFee?.remaining ?? 0),
                partialAllowed: false,
                isRoomRent: false,
            },
        ];
        return items.filter((x) => {
            if (x.remaining <= 0) return false;
            // Exclude if there is a pending payment covering this amount
            const pendingPayments = statusData?.paymentDetails?.filter((p: any) => p.status === "pending" && p.category === x.category);
            const pendingAmount = pendingPayments?.reduce((sum: number, p: any) => sum + (p.amounts?.totalAmount || 0), 0) || 0;
            return (x.remaining - pendingAmount) > 0;
        });
    }, [statusData]);

    useEffect(() => {
        const syncTimer = setTimeout(() => {
            if (!dueItems.length) {
                setCategory(null);
                setAmount("");
                return;
            }
            if (!category || !dueItems.some((d) => d.category === category)) {
                setCategory(dueItems[0].category);
                
                const current = dueItems[0];
                if (current.isRoomRent) {
                    if (current.total === current.remaining) {
                        setAmount(String(current.total)); // Default selection to Full Payment
                    } else {
                        setAmount(String(current.remaining));
                    }
                } else {
                    setAmount(String(current.remaining));
                }
                return;
            }
            const current = dueItems.find((d) => d.category === category);
            if (current && current.isRoomRent) {
                if (current.total === current.remaining) {
                    setAmount(String(current.total)); // Default selection to Full Payment
                } else {
                    setAmount(String(current.remaining));
                }
            } else if (current && !current.partialAllowed) {
                setAmount(String(current.remaining));
            }
        }, 0);

        return () => {
            clearTimeout(syncTimer);
        };
    }, [category, dueItems]);

    const activeDue = dueItems.find((d) => d.category === category) || null;

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!activeDue) errs.category = "No pending dues available.";

        const n = Number(amount);
        if (!Number.isFinite(n) || n <= 0) {
            errs.amount = "Enter a valid payment amount.";
        } else if (activeDue && n > activeDue.remaining) {
            errs.amount = "Amount exceeds outstanding due.";
        } else if (activeDue && !activeDue.partialAllowed && n !== activeDue.remaining) {
            errs.amount = `${activeDue.label} must be paid in full.`;
        }

        if (!transactionId.trim()) errs.transactionId = "Transaction ID is required.";
        if (!receipt) errs.receipt = "Upload payment proof.";
        return errs;
    };

    const handleSubmit = async () => {
        setAttempted(true);
        setError(null);
        setSuccess(null);

        const errs = validate();
        if (Object.keys(errs).length) return;
        if (!activeDue || !category || !receipt) return;

        setSubmitting(true);
        try {
            let proofUrl = receipt.preview;
            if (proofUrl.startsWith("data:")) {
                proofUrl = await uploadPaymentProof(proofUrl, receipt.name);
            }

            let planType = undefined;
            if (category === "room_rent" && activeDue.selectedPlan === "pending") {
                // Determine implicit plan selection by amount if they haven't explicitly set it
                // We'll derive it from the buttons being pushed
                if (Number(amount) > activeDue.total * 0.5) {
                   planType = "full";
                } else {
                   planType = "half";
                }
            }

            await apiFetch(API.payment.final, {
                method: "POST",
                body: {
                    category,
                    method,
                    transactionId: transactionId.trim(),
                    proofUrl,
                    amount: parseFloat(Number(amount).toFixed(2)),
                    ...(planType && { planType }),
                },
            });

            setSuccess("Payment submitted successfully. Waiting for admin verification.");
            setReceipt(null);
            setTransactionId("");
            await refreshUser({ force: true });
            await fetchStatus();
            router.replace("/user-onboarding/payment-status");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const errors = attempted ? validate() : {};

    if (loading) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ textAlign: "center", padding: "80px 0" }}>
                <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontSize: "0.9rem", color: "rgba(31,58,45,0.6)", marginTop: 10 }}>Loading payment breakdown...</p>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

    if (error && !statusData) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ textAlign: "center", padding: "60px 0" }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: 12 }} />
                <p style={{ fontSize: "0.95rem", color: "#dc2626" }}>{error}</p>
                <div style={{ marginTop: 12 }}>
                    <SecondaryButton onClick={() => router.push("/user-onboarding/payment-status")}>Go to Status</SecondaryButton>
                </div>
            </motion.div>
        );
    }

    if (!dueItems.length) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 32 }}>
                <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                    <StepBadge icon={Receipt} label="Final Payment" />
                    <StepTitle>No Pending Final Dues</StepTitle>
                    <StepSubtitle>Your outstanding final payment appears to be cleared.</StepSubtitle>
                </motion.div>
                <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "center" }}>
                    <NavButton onClick={() => router.push("/user-onboarding/payment-status")}>
                        <CreditCard size={16} /> View Payment Status
                    </NavButton>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 32 }}>
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 4 }}>
                <StepBadge icon={Receipt} label="Final Payment" />
                <StepTitle>Complete Final Payment</StepTitle>
                <StepSubtitle>Submit your final payment proof for admin verification.</StepSubtitle>
            </motion.div>

            <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(31,58,45,0.12)", padding: 18 }}>
                <p style={{ margin: 0, fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Outstanding Dues
                </p>
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {dueItems.map((item) => (
                        <button
                            key={item.category}
                            onClick={() => setCategory(item.category)}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                borderRadius: 10,
                                border: `1.5px solid ${category === item.category ? GREEN : "rgba(31,58,45,0.12)"}`,
                                background: category === item.category ? "rgba(31,58,45,0.05)" : "#fff",
                                padding: "12px 14px",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span style={{ color: GREEN, fontSize: "0.88rem", fontWeight: 600 }}>{item.label}</span>
                            <span style={{ color: GREEN, fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}>₹{item.remaining.toLocaleString("en-IN")}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(31,58,45,0.12)", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: 0 }}>
                        Payment Method
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                        <SelectionButton label="UPI" selected={method === "upi"} onClick={() => setMethod("upi")} />
                        <SelectionButton label="Bank" selected={method === "bank_transfer"} onClick={() => setMethod("bank_transfer")} />
                        <SelectionButton label="Cash" selected={method === "cash"} onClick={() => setMethod("cash")} />
                    </div>
                </div>

                {method === "upi" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between", background: "rgba(31,58,45,0.02)", padding: 16, borderRadius: 12, border: "1px dashed rgba(31,58,45,0.15)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" }}>
                    {([
                        ["Account Name", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                        ["UPI ID",       PAYMENT_CONFIG.BANK_DETAILS.upiId],
                    ] as [string, string][]).map(([label, val]) => (
                        <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 100 }}>{label}:</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
                        </div>
                    ))}
                    </div>
                    <div style={{ textAlign: "center", flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Image
                        src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH}
                        alt="UPI QR Code"
                        width={120}
                        height={120}
                        style={{ borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)", objectFit: "contain" }}
                    />
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", marginTop: 6, color: "rgba(31,58,45,0.5)" }}>Scan to Pay</p>
                    </div>
                </div>
                )}

                {method === "bank_transfer" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "rgba(31,58,45,0.02)", padding: 16, borderRadius: 12, border: "1px dashed rgba(31,58,45,0.15)" }}>
                    {([
                    ["Account Name",   PAYMENT_CONFIG.BANK_DETAILS.accountName],
                    ["Account No",     PAYMENT_CONFIG.BANK_DETAILS.accountNo],
                    ["IFSC",           PAYMENT_CONFIG.BANK_DETAILS.ifsc],
                    ["Bank",           PAYMENT_CONFIG.BANK_DETAILS.bank],
                    ] as [string, string][]).map(([label, val]) => (
                    <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 100 }}>{label}:</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
                    </div>
                    ))}
                </div>
                )}

                {method === "cash" && (
                <div style={{ padding: "12px", background: "rgba(216,181,106,0.1)", borderRadius: 8, border: "1px dashed rgba(216,181,106,0.4)" }}>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: GREEN, margin: 0, textAlign: "center" }}>
                    Please deposit the cash at our office. Upload the official Cash Receipt image below as proof of payment.
                    </p>
                </div>
                )}

                {activeDue && activeDue.isRoomRent ? (
                    (() => {
                        const totalRack = activeDue.total;
                        const rawFullDiscounted = Math.round(totalRack * (1 - (activeDue.fullDiscountPct || 40) / 100));
                        const fullTarget = Math.max(0, rawFullDiscounted - activeDue.paid);
                        const discountedTotal = Math.round(totalRack * (1 - (activeDue.halfDiscountPct || 25) / 100));
                        const firstHalfTarget = Math.round(discountedTotal * 0.60);
                        
                        if (activeDue.selectedPlan === "pending" || activeDue.paid < firstHalfTarget) {
                            const remainingForFirstHalf = Math.max(0, firstHalfTarget - activeDue.paid);
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <FieldLabel>Select Your Room Rent Plan</FieldLabel>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                        <button 
                                            onClick={() => setAmount(String(fullTarget))}
                                            style={{ padding: "12px", borderRadius: 10, border: `2px solid ${amount === String(fullTarget) ? GREEN : "rgba(31,58,45,0.15)"}`, background: amount === String(fullTarget) ? "rgba(31,58,45,0.06)" : "#fff", color: amount === String(fullTarget) ? GREEN : "rgba(31,58,45,0.6)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", fontWeight: amount === String(fullTarget) ? 700 : 400, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
                                            type="button"
                                        >
                                            Full Payment ({activeDue.fullDiscountPct}% Off)<br/><span style={{ fontSize: "0.85rem", marginTop: 4, display: "block", color: GREEN, fontWeight: 700 }}>₹{fullTarget.toLocaleString("en-IN")}</span>
                                        </button>
                                        <button 
                                            onClick={() => setAmount(String(remainingForFirstHalf))}
                                            style={{ padding: "12px", borderRadius: 10, border: `2px solid ${amount === String(remainingForFirstHalf) ? GREEN : "rgba(31,58,45,0.15)"}`, background: amount === String(remainingForFirstHalf) ? "rgba(31,58,45,0.06)" : "#fff", color: amount === String(remainingForFirstHalf) ? GREEN : "rgba(31,58,45,0.6)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", fontWeight: amount === String(remainingForFirstHalf) ? 700 : 400, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
                                            type="button"
                                        >
                                            60% Payment ({activeDue.halfDiscountPct}% Off)<br/><span style={{ fontSize: "0.85rem", marginTop: 4, display: "block", color: GREEN, fontWeight: 700 }}>₹{remainingForFirstHalf.toLocaleString("en-IN")}</span>
                                        </button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                                        <FieldLabel htmlFor="final-amount">Partial / Custom Amount (₹)</FieldLabel>
                                        <FieldInput
                                            id="final-amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="e.g. 25000"
                                            hasError={attempted && !!errors.amount}
                                        />
                                        {attempted && errors.amount && <FieldError>{errors.amount}</FieldError>}
                                    </div>
                                </div>
                            );
                        } else {
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <FieldLabel>Room Rent Goal</FieldLabel>
                                    <button 
                                        onClick={() => setAmount(String(activeDue.remaining))}
                                        style={{ width: "100%", padding: "12px", borderRadius: 10, border: `2px solid ${amount === String(activeDue.remaining) ? GREEN : "rgba(31,58,45,0.15)"}`, background: amount === String(activeDue.remaining) ? "rgba(31,58,45,0.06)" : "#fff", color: amount === String(activeDue.remaining) ? GREEN : "rgba(31,58,45,0.6)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", fontWeight: amount === String(activeDue.remaining) ? 700 : 400, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s ease" }}
                                        type="button"
                                    >
                                        Remaining Balance (40%)<br/><span style={{ fontSize: "0.85rem", marginTop: 4, display: "block", color: GREEN, fontWeight: 700 }}>₹{activeDue.remaining.toLocaleString("en-IN")}</span>
                                    </button>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                                        <FieldLabel htmlFor="final-amount">Partial / Custom Amount (₹)</FieldLabel>
                                        <FieldInput
                                            id="final-amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="e.g. 20000"
                                            hasError={attempted && !!errors.amount}
                                        />
                                        {attempted && errors.amount && <FieldError>{errors.amount}</FieldError>}
                                    </div>
                                </div>
                            );
                        }
                    })()
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <FieldLabel htmlFor="final-amount">Amount</FieldLabel>
                        <FieldInput
                            id="final-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            disabled={!!activeDue && !activeDue.partialAllowed}
                            hasError={attempted && !!errors.amount}
                        />
                        {attempted && errors.amount && <FieldError>{errors.amount}</FieldError>}
                        {activeDue && !activeDue.partialAllowed && (
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.45)" }}>
                                {activeDue.label} requires full payment.
                            </span>
                        )}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <FieldLabel htmlFor="final-txn">Transaction ID</FieldLabel>
                    <FieldInput
                        id="final-txn"
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. UTR123456789"
                        hasError={attempted && !!errors.transactionId}
                    />
                    {attempted && errors.transactionId && <FieldError>{errors.transactionId}</FieldError>}
                </div>

                <ReceiptUpload file={receipt} onUpload={setReceipt} onRemove={() => setReceipt(null)} />
                {attempted && errors.receipt && <FieldError>{errors.receipt}</FieldError>}
            </motion.div>

            {error && (
                <motion.div variants={itemVariants} style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 12, padding: "12px 14px", color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={16} />
                    <span style={{ fontSize: "0.84rem" }}>{error}</span>
                </motion.div>
            )}

            {success && (
                <motion.div variants={itemVariants} style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 12, padding: "12px 14px", color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                    <Check size={16} />
                    <span style={{ fontSize: "0.84rem" }}>{success}</span>
                </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/payment-status")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleSubmit} disabled={submitting || !category}>
                    {submitting ? (
                        <>
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CreditCard size={16} /> Submit Payment
                        </>
                    )}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
