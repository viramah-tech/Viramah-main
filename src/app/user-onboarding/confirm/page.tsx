"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, ArrowLeft, Upload, X, Building2, Banknote, Smartphone,
    Check, AlertCircle, Camera, Lock,
    Trash2, Loader2, Plus, Minus,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { deleteUploadedFile } from "@/lib/uploadFile";
import type { UploadedFile } from "@/context/OnboardingContext";
import {
    FieldLabel, FieldInput, FieldError, NavButton, SecondaryButton,
    StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── V2 Types ─────────────────────────────────────────────────────────────────

type V2PaymentMethod = "UPI" | "NEFT" | "RTGS" | "IMPS" | "CASH" | "CHEQUE" | "OTHER";

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
    _id?: string;              // absent when this is a preview (not yet persisted)
    planId?: string;
    preview?: boolean;         // true → plan will be created on first payment
    trackSelection?: { trackId: string; addOns?: Record<string, boolean>; advance?: number };
    trackId: string;
    chosenTrackId: string | null;
    phases: PhaseData[];
    status?: string;
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
    bookingAmount?: { finalAmount: number; breakdown: BreakdownLine[] };
}

interface PlanResponse {
    data: {
        plan: PlanData;
        computed?: Array<{
            phaseNumber: number;
            breakdown: BreakdownLine[];
            finalAmount: number;
        }>;
    };
}

const PAYMENT_METHODS: { value: V2PaymentMethod; label: string; icon: typeof Building2; desc: string }[] = [
    { value: "UPI", label: "UPI", icon: Smartphone, desc: "GPay / PhonePe / Paytm" },
    { value: "NEFT", label: "NEFT", icon: Building2, desc: "Bank Transfer (NEFT)" },
    { value: "RTGS", label: "RTGS", icon: Building2, desc: "High-value transfer" },
    { value: "IMPS", label: "IMPS", icon: Building2, desc: "Instant transfer" },
    { value: "CASH", label: "Cash", icon: Banknote, desc: "In-person at office" },
    { value: "CHEQUE", label: "Cheque", icon: CreditCard, desc: "Bank cheque" },
    { value: "OTHER", label: "Other", icon: CreditCard, desc: "Other method" },
];

// ── Screenshot Upload ──────────────────────────────────────────────────────────

function ScreenshotUpload({
    screenshot, onUpload, onRemove, onDeleteFromServer, uploading
}: {
    screenshot: UploadedFile | null; onUpload: (f: UploadedFile) => void; onRemove: () => void;
    onDeleteFromServer?: (fileUrl: string) => Promise<void>; uploading?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hovered, setHovered] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            if (f.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            if (!["image/jpeg", "image/png", "application/pdf"].includes(f.type)) {
                alert("Only JPG, PNG, and PDF formats are supported");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => onUpload({ name: f.name, preview: reader.result as string });
            reader.readAsDataURL(f);
        }
    };

    const isServerFile = screenshot?.preview && !screenshot.preview.startsWith("data:");

    const handleRemove = async () => {
        if (isServerFile && onDeleteFromServer && screenshot) {
            setDeleting(true);
            try {
                await onDeleteFromServer(screenshot.preview);
            } catch (err) {
                console.error("Failed to delete from server:", err);
            } finally {
                setDeleting(false);
            }
        }
        onRemove();
    };

    return (
        <div>
            <FieldLabel>Payment Receipt / Screenshot</FieldLabel>
            <div style={{ marginTop: 8 }}>
                {screenshot ? (
                    <div style={{ position: "relative", maxWidth: 300, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}` }}>
                        {screenshot.preview.startsWith("data:") ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={screenshot.preview} alt="Receipt" style={{ width: "100%", height: "auto", display: "block" }} />
                        ) : (
                            <div style={{ padding: 20, textAlign: "center", background: "rgba(31,58,45,0.03)" }}>
                                <Check size={24} color={GREEN} />
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: GREEN, margin: "8px 0 0" }}>Uploaded to server</p>
                            </div>
                        )}
                        <button onClick={handleRemove} disabled={deleting} title={isServerFile ? "Delete from server" : "Remove"} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: isServerFile ? "rgba(192,57,43,0.95)" : "rgba(255,255,255,0.95)", border: "none", cursor: deleting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                            {deleting ? (
                                <Loader2 size={14} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                            ) : isServerFile ? (
                                <Trash2 size={13} color="#fff" />
                            ) : (
                                <X size={14} color={GREEN} />
                            )}
                        </button>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(31,58,45,0.85)", backdropFilter: "blur(8px)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                            {uploading ? (
                                <><Loader2 size={12} color={GOLD} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>Uploading…</span></>
                            ) : (
                                <><Check size={12} color={GOLD} /><span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>{screenshot.name}</span></>
                            )}
                        </div>
                    </div>
                ) : (
                    <button onClick={() => inputRef.current?.click()} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                        style={{ width: "100%", maxWidth: 300, aspectRatio: "4/3", borderRadius: 12, border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`, background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.25s ease" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(31,58,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Camera size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
                        </div>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>Upload payment screenshot</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.3)" }}>JPG, PNG, or PDF · Max 10MB</span>
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ── V2 Breakdown Panel ────────────────────────────────────────────────────────

function V2BreakdownPanel({
    plan, breakdown, finalAmount, loading, trackLabel
}: {
    plan: PlanData | null; breakdown: BreakdownLine[]; finalAmount: number; loading: boolean; trackLabel: string;
}) {
    if (loading || !plan) {
        return (
            <div style={{ background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 8px 32px rgba(31,58,45,0.25)" }}>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: "0 0 4px" }}>Loading breakdown…</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ width: i % 2 === 0 ? 120 : 160, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite", display: "inline-block" }} />
                            <span style={{ width: 72, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite", display: "inline-block" }} />
                        </div>
                    ))}
                </div>
                <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 8px 32px rgba(31,58,45,0.25)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: 0 }}>
                    {trackLabel}
                </p>
                {plan.discountRate > 0 && (
                    <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(134,239,172,0.15)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", fontWeight: 700, color: "#86efac" }}>
                        {Math.round(plan.discountRate * 100)}% discount
                    </span>
                )}
            </div>

            {/* Big amount */}
            <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.4rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                {inr(finalAmount)}
            </p>

            {/* Line items */}
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
                                    fontSize: isTotal ? "0.72rem" : "0.62rem",
                                    color: isTotal ? GOLD : isGreen ? "#86efac" : "rgba(246,244,239,0.55)",
                                    fontWeight: isTotal ? 700 : 400,
                                }}>
                                    {line.label}
                                </span>
                            </div>
                            <span style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: isTotal ? "1.1rem" : "0.68rem",
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
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ConfirmPage() {
    const router = useRouter();
    const { state, updatePayment, markStepComplete, canAccessStep, setStatus } = useOnboarding();
    const { token } = useAuth();
    const { payment = { method: "" as const, transactionId: "", screenshot: null } } = state;

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // V2 state
    const [plan, setPlan] = useState<PlanData | null>(null);
    const [breakdown, setBreakdown] = useState<BreakdownLine[]>([]);
    const [finalAmount, setFinalAmount] = useState(0);
    const [activePhase, setActivePhase] = useState(1);
    const [planLoading, setPlanLoading] = useState(true);
    const [planError, setPlanError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<V2PaymentMethod | "">("");
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
    // Partial payment — empty string = pay full remaining balance
    const [partialAmount, setPartialAmount] = useState<string>("");

    // Fetch V2 plan on mount
    useEffect(() => {
        let cancelled = false;

        const loadPlan = async () => {
            try {
                const res = await apiFetch<PlanResponse>("/api/payment/plan/me");
                if (cancelled) return;

                const p = res?.data?.plan as PlanData | null;
                if (!p) {
                    throw new Error("No active payment plan found. Please select a track.");
                }

                setPlan(p);

                // Handle Track 3 Booking (no phases yet)
                if (p.trackId === "booking" && !p.chosenTrackId && p.bookingAmount) {
                    const bookingData = p.bookingAmount;
                    setActivePhase(1); // logical default for UI
                    setBreakdown(bookingData.breakdown || []);
                    setFinalAmount(bookingData.finalAmount || 0);
                } else {
                    // Find the first payable phase
                    const payablePhase = p.phases.find(
                        (ph) => ph.status === "pending" || ph.status === "overdue"
                    );
                    const phaseToUse = payablePhase || p.phases[0];
                    if (phaseToUse) {
                        setActivePhase(phaseToUse.phaseNumber);
                        const computedData = phaseToUse.computed || phaseToUse;
                        setBreakdown(computedData.breakdown || []);
                        setFinalAmount(computedData.finalAmount || 0);
                    }
                }
            } catch (err) {
                if (cancelled) return;
                const msg = err instanceof Error ? err.message : "Failed to load payment plan";
                // If 404 or no plan, redirect
                if (msg.includes("404") || msg.toLowerCase().includes("no plan") || msg.toLowerCase().includes("not found")) {
                    router.replace("/user-onboarding/track-selection");
                    return;
                }
                setPlanError(msg);
            } finally {
                if (!cancelled) setPlanLoading(false);
            }
        };

        loadPlan();
        return () => { cancelled = true; };
    }, [router, token]);

    // Access guard — check step completion
    useEffect(() => {
        if (!canAccessStep(5)) {
            // Check if user has a V2 plan (bypass step guard)
            apiFetch("/api/payment/plan/me").catch(() => {
                setRedirecting(true);
                router.replace("/user-onboarding/track-selection");
            });
        }
    }, [canAccessStep, router]);

    if (redirecting) return null;

    const trackLabel =
        plan?.trackId === "full" ? "Full Payment — 11 Months" :
        plan?.trackId === "twopart" ? `Two-Part Payment — Phase ${activePhase}` :
        plan?.trackId === "booking" ? (plan.chosenTrackId ? `Booking → ${plan.chosenTrackId === "full" ? "Full" : "Two-Part"} — Phase ${activePhase}` : "Booking") :
        "Payment";

    const currentPhase = plan?.phases.find((p) => p.phaseNumber === activePhase);
    const isBookingWithoutPhases = plan?.trackId === "booking" && !plan.chosenTrackId;
    const canSubmit = isBookingWithoutPhases 
        ? true 
        : currentPhase && ["pending", "overdue"].includes(currentPhase.status);

    // Upload receipt to V2 endpoint (two-step flow)
    const uploadReceiptToV2 = async (file: UploadedFile): Promise<string> => {
        const authToken = token ?? (typeof window !== "undefined" ? localStorage.getItem("viramah_token") : null);

        // Convert data URL to a File object
        const [header, base64] = file.preview.split(",");
        const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
        const bytes = atob(base64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new File([arr], file.name, { type: mime });

        const formData = new FormData();
        formData.append("receipt", blob);

        const res = await fetch(`${API_BASE}/api/payment/upload-receipt`, {
            method: "POST",
            headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
            body: formData,
            credentials: "include",
        });

        const text = await res.text();
        let data;
        try { data = text ? JSON.parse(text) : {}; } catch { throw new Error("Failed to parse upload response"); }
        if (!res.ok) throw new Error(data?.message || `Upload failed (${res.status})`);
        return data.data.url;
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!paymentMethod) errs.method = "Please select a payment method";
        if (!payment.transactionId.trim()) errs.transactionId = "Transaction ID is required";
        if (!payment.screenshot) errs.screenshot = "Payment receipt is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        setAttempted(true);
        if (!validate()) return;
        if (!plan || !canSubmit) return;

        setSubmitting(true);
        setErrors({});
        try {
            // Onboarding is already confirmed at Step 4 review — no need to re-confirm here.

            // Step 2: Upload receipt to V2 endpoint
            let uploadedReceiptUrl = receiptUrl;
            if (!uploadedReceiptUrl && payment.screenshot) {
                setUploading(true);
                try {
                    uploadedReceiptUrl = await uploadReceiptToV2(payment.screenshot);
                    setReceiptUrl(uploadedReceiptUrl);
                } finally {
                    setUploading(false);
                }
            }

            if (!uploadedReceiptUrl) {
                setErrors({ screenshot: "Receipt upload failed. Please try again." });
                return;
            }

            // Build the submit body.
            // Since the plan is now synced to the database on track selection,
            // we always just submit the planId and phaseNumber.
            const partialNum = partialAmount.trim() === "" ? null : Number(partialAmount);
            if (partialNum != null && (!Number.isFinite(partialNum) || partialNum <= 0)) {
                setErrors({ method: "Amount must be a positive number" });
                return;
            }
            if (partialNum != null && partialNum > finalAmount) {
                setErrors({ method: `Amount cannot exceed remaining balance of ₹${finalAmount}` });
                return;
            }

            const submitBody: Record<string, unknown> = {
                transactionId: payment.transactionId.trim(),
                receiptUrl: uploadedReceiptUrl,
                paymentMethod: paymentMethod,
            };
            if (partialNum != null) submitBody.amount = partialNum;

            submitBody.planId = plan._id;
            if (plan.trackId !== "booking" || plan.chosenTrackId) {
                submitBody.phaseNumber = activePhase;
            }

            await apiFetch("/api/payment/submit", {
                method: "POST",
                token,
                body: submitBody,
            });

            markStepComplete(5);
            setStatus("payment_submitted");
            router.push("/user-onboarding/payment-status");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
            setErrors({ method: message });
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (planLoading) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "80px 0" }}>
                <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>
                    Loading your payment plan...
                </span>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </motion.div>
        );
    }

    // Error state
    if (planError) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ padding: "60px 0", textAlign: "center" }}>
                <AlertCircle size={40} color="#dc2626" style={{ marginBottom: 16 }} />
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", color: "#dc2626" }}>{planError}</p>
                <button
                    onClick={() => router.push("/user-onboarding/track-selection")}
                    style={{ marginTop: 16, padding: "12px 24px", borderRadius: 10, border: `2px solid ${GREEN}`, background: "transparent", color: GREEN, fontWeight: 600, cursor: "pointer" }}
                >
                    Select Payment Track
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Payment" />
                <StepTitle>Complete your payment</StepTitle>
                <StepSubtitle>Review your breakdown, upload payment proof, and submit for approval.</StepSubtitle>
            </motion.div>

            {/* Global Error Banner */}
            <AnimatePresence>
                {errors.method && (
                    <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
                        style={{ background: "rgba(220, 38, 38, 0.08)", border: "1px solid rgba(220, 38, 38, 0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                        <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.4 }}>{errors.method}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase Tabs (for Two-Part plans) */}
            {plan && plan.phases.length > 1 && (
                <motion.div variants={itemVariants}>
                    <div style={{ display: "flex", gap: 10 }}>
                        {plan.phases.map((phase) => {
                            const isActive = activePhase === phase.phaseNumber;
                            const isPaid = phase.status === "paid";
                            const isLocked = phase.status === "locked";
                            return (
                                <button
                                    key={phase.phaseNumber}
                                    onClick={() => {
                                        setActivePhase(phase.phaseNumber);
                                        setBreakdown(phase.breakdown || []);
                                        setFinalAmount(phase.finalAmount || 0);
                                    }}
                                    style={{
                                        flex: 1, padding: "12px 14px", borderRadius: 12,
                                        border: `2px solid ${isActive ? GREEN : "rgba(31,58,45,0.12)"}`,
                                        background: isActive ? "rgba(31,58,45,0.04)" : "#fff",
                                        cursor: "pointer", textAlign: "left", transition: "all 0.25s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        {isPaid && <Check size={12} color={GREEN} strokeWidth={2.5} />}
                                        {isLocked && <Lock size={12} color="rgba(31,58,45,0.35)" />}
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: isActive ? GREEN : "rgba(31,58,45,0.5)" }}>
                                            Phase {phase.phaseNumber}
                                        </span>
                                    </div>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)" }}>
                                        {phase.monthsCovered} months · {isPaid ? "Paid" : isLocked ? "Locked" : phase.status}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* V2 Breakdown Panel */}
            <motion.div variants={itemVariants}>
                <V2BreakdownPanel
                    plan={plan} breakdown={breakdown} finalAmount={finalAmount}
                    loading={planLoading} trackLabel={trackLabel}
                />
            </motion.div>

            {/* Locked/Paid phase info */}
            {currentPhase?.status === "locked" && (
                <motion.div variants={itemVariants}>
                    <div style={{ padding: "14px 18px", background: "rgba(31,58,45,0.04)", border: "1px solid rgba(31,58,45,0.12)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                        <Lock size={18} color="rgba(31,58,45,0.4)" />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "rgba(31,58,45,0.55)" }}>
                            This phase is locked. It will unlock when Phase 1 is paid and the admin sets a due date.
                        </span>
                    </div>
                </motion.div>
            )}

            {currentPhase?.status === "paid" && (
                <motion.div variants={itemVariants}>
                    <div style={{ padding: "14px 18px", background: "rgba(31,58,45,0.04)", border: "1px solid rgba(31,58,45,0.12)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                        <Check size={18} color={GREEN} strokeWidth={2.5} />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: GREEN, fontWeight: 600 }}>
                            This phase is paid. No further action needed.
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Payment Method Selector */}
            {canSubmit && (
                <>
                    <motion.div variants={itemVariants}>
                        <FormCard>
                            <div>
                                <FieldLabel>Select Payment Method</FieldLabel>
                                {attempted && errors.method && <FieldError>{errors.method}</FieldError>}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    const selected = paymentMethod === m.value;
                                    return (
                                        <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                                            style={{
                                                padding: "14px 12px", borderRadius: 12,
                                                border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.12)"}`,
                                                background: selected ? "rgba(31,58,45,0.04)" : "#fff",
                                                cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                                            }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                                <Icon size={16} color={selected ? GREEN : "rgba(31,58,45,0.35)"} />
                                                <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 700, color: selected ? GREEN : "rgba(31,58,45,0.5)" }}>
                                                    {m.label}
                                                </span>
                                            </div>
                                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.4)" }}>
                                                {m.desc}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Bank Details */}
                            <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: "14px 16px", marginTop: 8 }}>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.8rem", fontWeight: 700, color: GREEN, margin: "0 0 10px" }}>Transfer to:</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: "1 1 200px" }}>
                                        {[
                                            ["Account Name", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                                            ["Account No", PAYMENT_CONFIG.BANK_DETAILS.accountNo],
                                            ["IFSC", PAYMENT_CONFIG.BANK_DETAILS.ifsc],
                                            ["Bank", PAYMENT_CONFIG.BANK_DETAILS.bank],
                                            ["UPI ID", PAYMENT_CONFIG.BANK_DETAILS.upiId]
                                        ].map(([label, val]) => (
                                            <div key={label} style={{ display: "flex", gap: 8 }}>
                                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.4)", minWidth: 90 }}>{label}:</span>
                                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: 700, color: GREEN }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ textAlign: "center", flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="UPI QR Code" style={{ width: 100, height: 100, borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)", objectFit: "contain" }} />
                                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.5rem", marginTop: 4, color: "rgba(31,58,45,0.5)" }}>Scan to Pay</p>
                                    </div>
                                </div>
                            </div>
                        </FormCard>
                    </motion.div>

                    {/* Partial amount (optional) — only for non-booking phases */}
                    {plan && !(plan.trackId === "booking" && !plan.chosenTrackId) && finalAmount > 0 && (
                        <motion.div variants={itemVariants}>
                            <FormCard>
                                <FieldLabel htmlFor="partial-amount">
                                    Amount you&apos;re paying now
                                </FieldLabel>
                                <FieldInput
                                    id="partial-amount"
                                    type="number"
                                    placeholder={`Full remaining: ₹${finalAmount.toLocaleString("en-IN")}`}
                                    value={partialAmount}
                                    onChange={(e) => setPartialAmount(e.target.value)}
                                    focused={focusedField === "partialAmount"}
                                    hasError={false}
                                    onFocus={() => setFocusedField("partialAmount")}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <p style={{ margin: "6px 0 0", fontSize: "0.62rem", fontFamily: "var(--font-mono, monospace)", color: "rgba(31,58,45,0.55)" }}>
                                    Leave blank to pay the full remaining balance of ₹{finalAmount.toLocaleString("en-IN")}.
                                    You can split this installment across multiple payments before its deadline.
                                </p>
                            </FormCard>
                        </motion.div>
                    )}

                    {/* Transaction ID */}
                    <motion.div variants={itemVariants}>
                        <FormCard>
                            <FieldLabel htmlFor="txn-id">Transaction / Reference ID</FieldLabel>
                            <FieldInput
                                id="txn-id" type="text"
                                placeholder="e.g. UTR123456789"
                                value={payment.transactionId}
                                onChange={(e) => updatePayment({ transactionId: e.target.value })}
                                focused={focusedField === "txnId"}
                                hasError={attempted && !!errors.transactionId}
                                onFocus={() => setFocusedField("txnId")}
                                onBlur={() => setFocusedField(null)}
                            />
                            {attempted && errors.transactionId && <FieldError>{errors.transactionId}</FieldError>}
                        </FormCard>
                    </motion.div>

                    {/* Screenshot Upload */}
                    <motion.div variants={itemVariants}>
                        <FormCard>
                            <ScreenshotUpload
                                screenshot={payment.screenshot}
                                onUpload={(f) => updatePayment({ screenshot: f })}
                                onRemove={() => { updatePayment({ screenshot: null }); setReceiptUrl(null); }}
                                onDeleteFromServer={deleteUploadedFile}
                                uploading={uploading}
                            />
                            {attempted && errors.screenshot && <FieldError>{errors.screenshot}</FieldError>}
                        </FormCard>
                    </motion.div>
                </>
            )}

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                {canSubmit && (
                    <NavButton onClick={handleSubmit} disabled={submitting || uploading}>
                        {submitting ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(216,181,106,0.3)", borderTopColor: GOLD }} />
                                {uploading ? "Uploading…" : "Submitting…"}
                            </>
                        ) : (
                            <><Upload size={16} /> Confirm Payment</>
                        )}
                    </NavButton>
                )}
            </motion.div>
        </motion.div>
    );
}
