"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, ArrowLeft, Upload, X, Building2, Banknote,
    Check, AlertCircle, Camera,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { UploadedFile } from "@/context/OnboardingContext";
import {
    FieldLabel, FieldInput, FieldError, NavButton, SecondaryButton,
    StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Payment Method Card ──────────────────────────────────────

function PaymentMethodCard({
    icon: Icon,
    title,
    description,
    selected,
    onClick,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: "20px 16px",
                borderRadius: 16,
                border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.12)"}`,
                background: selected ? "rgba(31,58,45,0.04)" : "#fff",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: selected ? "0 4px 16px rgba(31,58,45,0.1)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
            }}
        >
            <div
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: selected ? "rgba(31,58,45,0.1)" : "rgba(31,58,45,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon size={22} color={selected ? GREEN : "rgba(31,58,45,0.35)"} />
            </div>
            <div style={{ flex: 1 }}>
                <span
                    style={{
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: selected ? GREEN : "rgba(31,58,45,0.7)",
                        display: "block",
                    }}
                >
                    {title}
                </span>
                <span
                    style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6rem",
                        color: "rgba(31,58,45,0.4)",
                        letterSpacing: "0.05em",
                    }}
                >
                    {description}
                </span>
            </div>
            <div
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.2)"}`,
                    background: selected ? GREEN : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                }}
            >
                {selected && <Check size={12} color={GOLD} strokeWidth={3} />}
            </div>
        </button>
    );
}

// ── Screenshot Upload ────────────────────────────────────────

function ScreenshotUpload({
    file,
    onUpload,
    onRemove,
}: {
    file: UploadedFile | null;
    onUpload: (file: UploadedFile) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hovered, setHovered] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpload({ name: selectedFile.name, preview: reader.result as string });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <div>
            <FieldLabel>Payment Screenshot</FieldLabel>
            <div style={{ marginTop: 8 }}>
                {file ? (
                    <div
                        style={{
                            position: "relative",
                            maxWidth: 300,
                            borderRadius: 12,
                            overflow: "hidden",
                            border: `2px solid ${GREEN}`,
                        }}
                    >
                        <img src={file.preview} alt="Payment screenshot" style={{ width: "100%", height: "auto", display: "block" }} />
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
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            }}
                        >
                            <X size={14} color={GREEN} />
                        </button>
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "rgba(31,58,45,0.85)",
                                backdropFilter: "blur(8px)",
                                padding: "6px 12px",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <Check size={12} color={GOLD} />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>
                                Uploaded: {file.name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => inputRef.current?.click()}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        style={{
                            width: "100%",
                            maxWidth: 300,
                            aspectRatio: "4/3",
                            borderRadius: 12,
                            border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
                            background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            transition: "all 0.25s ease",
                        }}
                    >
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: "#fff",
                                boxShadow: "0 2px 8px rgba(31,58,45,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Camera size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
                        </div>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>
                            Upload payment screenshot
                        </span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.3)" }}>
                            JPG, PNG, or PDF
                        </span>
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function ConfirmPage() {
    const router = useRouter();
    const { state, updatePayment, markStepComplete, canAccessStep, setStatus, getTotalCost } = useOnboarding();
    const { token } = useAuth();
    const { payment, step3 } = state;

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!canAccessStep(5)) {
        router.replace("/user-onboarding/step-4");
        return null;
    }

    const totalCost = getTotalCost();

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!payment.method) errs.method = "Please select a payment method";
        if (!payment.transactionId.trim()) errs.transactionId = "Transaction ID is required";
        if (payment.transactionId.trim().length < 4) errs.transactionId = "Transaction ID must be at least 4 characters";
        if (!payment.screenshot) errs.screenshot = "Payment screenshot is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        setAttempted(true);
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Submit payment to backend
            await apiFetch("/api/public/payments/initiate", {
                method: "POST",
                token,
                body: {
                    amount: totalCost,
                    paymentMethod: payment.method,
                    description: `Onboarding payment - ${step3.selectedRoom?.title || "Room"}`,
                    transactionId: payment.transactionId,
                    receiptUrl: payment.screenshot?.preview || "",
                },
            });

            markStepComplete(5);
            setStatus("payment_submitted");
            router.push("/user-onboarding/payment-status");
        } catch {
            setErrors({ method: "Payment submission failed. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Payment" />
                <StepTitle>Complete your payment</StepTitle>
                <StepSubtitle>
                    Choose a payment method and upload your payment proof to confirm your booking.
                </StepSubtitle>
            </motion.div>

            {/* Amount Due */}
            <motion.div
                variants={itemVariants}
                style={{
                    background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
                    borderRadius: 16,
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
                }}
            >
                <div>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: 0 }}>
                        First Month Payment
                    </p>
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.4rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        ₹{totalCost.toLocaleString()}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.4)", margin: "6px 0 0" }}>
                        {step3.selectedRoom?.title} + Services
                    </p>
                </div>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "rgba(216,181,106,0.15)",
                        border: "1px solid rgba(216,181,106,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CreditCard size={20} color={GOLD} />
                </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <div>
                        <FieldLabel>Select Payment Method</FieldLabel>
                        {attempted && errors.method && <FieldError>{errors.method}</FieldError>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <PaymentMethodCard
                            icon={Building2}
                            title="Bank Transfer"
                            description="NEFT / IMPS / UPI"
                            selected={payment.method === "bank_transfer"}
                            onClick={() => updatePayment({ method: "bank_transfer" })}
                        />
                        <PaymentMethodCard
                            icon={Banknote}
                            title="Cash Deposit"
                            description="Bank counter deposit"
                            selected={payment.method === "cash_deposit"}
                            onClick={() => updatePayment({ method: "cash_deposit" })}
                        />
                    </div>
                </FormCard>
            </motion.div>

            {/* Bank Details Info */}
            <AnimatePresence>
                {payment.method && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                    >
                        <div
                            style={{
                                background: "rgba(216,181,106,0.08)",
                                border: "1px solid rgba(216,181,106,0.2)",
                                borderRadius: 12,
                                padding: 20,
                                display: "flex",
                                gap: 12,
                            }}
                        >
                            <AlertCircle size={18} color={GOLD} style={{ flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>
                                    {payment.method === "bank_transfer" ? "Bank Transfer Details" : "Cash Deposit Instructions"}
                                </p>
                                {payment.method === "bank_transfer" ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Account Name: <strong>VIRAMAH Student Living Pvt Ltd</strong>
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Account No: <strong>1234 5678 9012 3456</strong>
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            IFSC: <strong>SBIN0001234</strong>
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            UPI: <strong>viramah@ybl</strong>
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Deposit at any SBI branch to:
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Account Name: <strong>VIRAMAH Student Living Pvt Ltd</strong>
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Account No: <strong>1234 5678 9012 3456</strong>
                                        </span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
                                            Collect the deposit receipt and upload a photo below.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transaction ID & Screenshot */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="txn-id">Transaction / Reference ID</FieldLabel>
                        <FieldInput
                            id="txn-id"
                            type="text"
                            placeholder="e.g. UTR123456789 or deposit receipt number"
                            value={payment.transactionId}
                            onChange={(e) => updatePayment({ transactionId: e.target.value })}
                            focused={focusedField === "txnId"}
                            hasError={attempted && !!errors.transactionId}
                            onFocus={() => setFocusedField("txnId")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.transactionId && <FieldError>{errors.transactionId}</FieldError>}
                    </div>

                    <div style={{ height: 1, background: "rgba(31,58,45,0.08)" }} />

                    <ScreenshotUpload
                        file={payment.screenshot}
                        onUpload={(f) => updatePayment({ screenshot: f })}
                        onRemove={() => updatePayment({ screenshot: null })}
                    />
                    {attempted && errors.screenshot && <FieldError>{errors.screenshot}</FieldError>}
                </FormCard>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/step-4")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(216,181,106,0.3)", borderTopColor: GOLD }}
                            />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Check size={16} />
                            Submit Payment Proof
                        </>
                    )}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
