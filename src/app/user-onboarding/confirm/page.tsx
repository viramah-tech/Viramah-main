"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    CreditCard, ArrowLeft, Upload, X, Building2, Banknote,
    Check, AlertCircle, Camera, Shield, Tag, Lock, Info,
    KeyRound,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/uploadFile";
import type { UploadedFile } from "@/context/OnboardingContext";
import {
    FieldLabel, FieldInput, FieldError, NavButton, SecondaryButton,
    StepBadge, StepTitle, StepSubtitle, FormCard,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number | null | undefined) =>
    n == null ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── Types ──────────────────────────────────────────────────────────────────────

type PaymentModeType = "full" | "half" | "deposit";

/**
 * Real shape returned by GET /api/public/payments/calculate-preview
 * → data.breakdown (inst1)
 */
interface LiveBreakdown {
    roomMonthly: number;
    discountedMonthlyBase: number;
    monthlyGST: number;
    discountedMonthlyWithGST: number;
    roomRentTotal: number;
    registrationFee: number;
    securityDeposit: number;
    transportMonthly: number;
    transportTotal: number;
    messMonthly: number;
    messTotal: number;
    messIsLumpSum: boolean;
    discountRate: number;
    gstRate: number;
    tenureMonths: number;
    installmentMonths: number;
    subtotal: number;
    flatFees: number;
    referralDeduction: number;
    depositCredited: number;
    finalAmount: number;
    _totalFinalAmount?: number;
}

interface FullPreviewResponse {
    breakdown: LiveBreakdown;
    breakdown2: LiveBreakdown | null;
    installment1: number;
    installment2: number;
    paymentMode: "full" | "half";
    schedule: Array<{ installment: number; amount: number; dueDate: string }>;
}

// ── Payment Method Card ────────────────────────────────────────────────────────

function PaymentMethodCard({
    icon: Icon, title, description, selected, onClick,
}: {
    icon: React.ElementType; title: string; description: string; selected: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1, padding: "20px 16px", borderRadius: 16,
                border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.12)"}`,
                background: selected ? "rgba(31,58,45,0.04)" : "#fff",
                textAlign: "left", cursor: "pointer", transition: "all 0.25s ease",
                boxShadow: selected ? "0 4px 16px rgba(31,58,45,0.1)" : "none",
                display: "flex", alignItems: "center", gap: 14,
            }}
        >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: selected ? "rgba(31,58,45,0.1)" : "rgba(31,58,45,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={22} color={selected ? GREEN : "rgba(31,58,45,0.35)"} />
            </div>
            <div style={{ flex: 1 }}>
                <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: selected ? GREEN : "rgba(31,58,45,0.7)", display: "block" }}>{title}</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", letterSpacing: "0.05em" }}>{description}</span>
            </div>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.2)"}`, background: selected ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selected && <Check size={12} color={GOLD} strokeWidth={3} />}
            </div>
        </button>
    );
}

// ── Screenshot Upload ──────────────────────────────────────────────────────────

function ScreenshotUpload({
    screenshot, onUpload, onRemove,
}: {
    screenshot: UploadedFile | null; onUpload: (f: UploadedFile) => void; onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hovered, setHovered] = useState(false);
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            const reader = new FileReader();
            reader.onload = () => onUpload({ name: f.name, preview: reader.result as string });
            reader.readAsDataURL(f);
        }
    };
    return (
        <div>
            <FieldLabel>Payment Screenshot / Receipt</FieldLabel>
            <div style={{ marginTop: 8 }}>
                {screenshot ? (
                    <div style={{ position: "relative", maxWidth: 300, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}` }}>
                        <img src={screenshot.preview} alt="Screenshot" style={{ width: "100%", height: "auto", display: "block" }} />
                        <button onClick={onRemove} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                            <X size={14} color={GREEN} />
                        </button>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(31,58,45,0.85)", backdropFilter: "blur(8px)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                            <Check size={12} color={GOLD} />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>{screenshot.name}</span>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => inputRef.current?.click()} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                        style={{ width: "100%", maxWidth: 300, aspectRatio: "4/3", borderRadius: 12, border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`, background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.25s ease" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(31,58,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Camera size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
                        </div>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>Upload payment screenshot</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.3)" }}>JPG, PNG, or PDF</span>
                    </button>
                )}
            </div>
            <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: "none" }} />
        </div>
    );
}

// ── Skeleton Row ───────────────────────────────────────────────────────────────

function SkeletonRow({ wide }: { wide?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "inline-block", width: wide ? 160 : 120, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />
            <span style={{ display: "inline-block", width: 72, height: 10, borderRadius: 3, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s infinite" }} />
        </div>
    );
}

// ── Deposit-Only Invoice Panel ─────────────────────────────────────────────────

function DepositInvoicePanel() {
    const row = (label: string, value: string, opts?: { faint?: boolean; green?: boolean; amber?: boolean }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: opts?.faint ? "rgba(246,244,239,0.3)" : "rgba(246,244,239,0.55)", flex: 1, lineHeight: 1.5 }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: opts?.green ? 700 : 400, color: opts?.green ? "#86efac" : opts?.amber ? GOLD : "rgba(246,244,239,0.75)", whiteSpace: "nowrap" }}>{value}</span>
        </div>
    );
    return (
        <div style={{ background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 8px 32px rgba(31,58,45,0.25)" }}>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: "0 0 4px" }}>
                Payment Summary — Room Reservation
            </p>
            <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.4rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>₹16,000</p>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(216,181,106,0.4)", marginBottom: 2 }}>Breakdown</div>
                {row("Security Deposit", "₹15,000")}
                {row("  └ Refundable within 7 days of approval", "", { faint: true })}
                {row("  └ Non-refundable after 7 days", "", { faint: true })}
                {row("Registration Fee", "₹1,000")}
                {row("  └ Non-refundable under any circumstances", "", { faint: true })}

                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: GOLD, fontWeight: 700, letterSpacing: "0.05em" }}>Total Due Now</span>
                    <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.2rem", color: GOLD }}>₹16,000</span>
                </div>
            </div>

            {/* Amber policy notice */}
            <div style={{ marginTop: 18, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                    <AlertCircle size={13} color="#d97706" />
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#d97706", fontWeight: 700 }}>Please Read Before Proceeding</span>
                </div>
                {[
                    "Your room will be HELD for 21 days.",
                    "You must complete full payment within 21 days.",
                    "Days 1–7: ₹15,000 refundable if you cancel.",
                    "After day 7: ₹15,000 is NON-REFUNDABLE.",
                    "After day 21: Room released. No refund.",
                    "₹1,000 registration fee: NEVER refundable.",
                    "After paying now, you will return here to choose Full Tenure or Half Yearly.",
                ].map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, marginTop: 4 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "#d97706", flexShrink: 0, marginTop: 1 }}>•</span>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "#92400e", lineHeight: 1.5 }}>{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Deposit Confirmation Modal ─────────────────────────────────────────────────

function DepositConfirmModal({ onConfirm, onClose, loading }: { onConfirm: () => void; onClose: () => void; loading: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,25,20,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ background: "#fff", borderRadius: 20, maxWidth: 440, width: "100%", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.18)", position: "relative" }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, display: "flex" }}>
                    <X size={18} color="rgba(31,58,45,0.4)" />
                </button>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(31,58,45,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                        <KeyRound size={26} color={GREEN} />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.5rem", color: GREEN, fontWeight: 400, margin: "0 0 12px" }}>Confirm Room Reservation</h2>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "rgba(31,58,45,0.65)", lineHeight: 1.6, margin: 0 }}>
                        You are about to pay <strong>₹16,000</strong> to reserve this room.
                    </p>
                </div>
                <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                    {[
                        ["Security Deposit", "₹15,000", "Refundable within 7 days of admin approval"],
                        ["Registration Fee", "₹1,000", "Non-refundable under any circumstances"],
                    ].map(([label, amount, note]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div>
                                <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", fontWeight: 600, color: GREEN, display: "block" }}>{label}</span>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.45)" }}>{note}</span>
                            </div>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, flexShrink: 0, marginLeft: 12 }}>{amount}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: "1px solid rgba(31,58,45,0.1)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN }}>Total</span>
                        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.1rem", color: GREEN }}>₹16,000</span>
                    </div>
                </div>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.5)", textAlign: "center", marginBottom: 16, lineHeight: 1.5 }}>
                    You will have 21 days to complete your full payment. Do you confirm?
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(31,58,45,0.15)", background: "#fff", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: "rgba(31,58,45,0.6)", cursor: "pointer" }}>
                        Go Back
                    </button>
                    <button
                        onClick={onConfirm} disabled={loading}
                        style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", background: loading ? "rgba(31,58,45,0.4)" : GREEN, fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 700, color: GOLD, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                    >
                        {loading ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(216,181,106,0.3)", borderTopColor: GOLD }} />Reserving…</>
                        ) : "Yes, Reserve My Room"}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Invoice Panel ─────────────────────────────────────────────────────────────

function InvoicePanel({
    paymentMode, breakdown, breakdown2, installment1, installment2,
    loading, apiError,
}: {
    paymentMode: "full" | "half";
    breakdown: LiveBreakdown | null;
    breakdown2: LiveBreakdown | null;
    installment1: number | null;
    installment2: number | null;
    loading: boolean;
    apiError: boolean;
}) {
    const discountPct = breakdown ? Math.round(breakdown.discountRate * 100) : (paymentMode === "full" ? 40 : 25);

    const row = (label: string, value: string | null, opts?: { deduct?: boolean; highlight?: boolean; faint?: boolean }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: opts?.highlight ? "#86efac" : opts?.faint ? "rgba(246,244,239,0.3)" : "rgba(246,244,239,0.5)", flex: 1 }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: opts?.highlight ? 700 : 400, color: opts?.highlight ? "#86efac" : "rgba(246,244,239,0.75)", whiteSpace: "nowrap" }}>
                {value == null ? "—" : `${opts?.deduct ? "−" : ""}${value}`}
            </span>
        </div>
    );

    return (
        <div style={{ background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 8px 32px rgba(31,58,45,0.25)" }}>
            {/* Header */}
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: "0 0 4px" }}>
                {paymentMode === "full" ? "Full Tenure Payment" : "Split Payment — Installment 1"}
            </p>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    <SkeletonRow wide /><SkeletonRow /><SkeletonRow wide /><SkeletonRow /><SkeletonRow />
                </div>
            ) : apiError ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "12px 14px", background: "rgba(220,38,38,0.12)", borderRadius: 10 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "#f87171" }}>
                        Unable to load pricing. Please refresh.
                    </span>
                </div>
            ) : breakdown ? (
                <>
                    {/* Big amount */}
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.4rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        {inr(installment1)}
                    </p>

                    {/* Breakdown lines */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, marginTop: 16, display: "flex", flexDirection: "column", gap: 7 }}>
                        {/* Section: Base calc */}
                        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(216,181,106,0.4)", marginBottom: 4 }}>
                            Base Calculation
                        </div>
                        {row(`Monthly base rent`, inr(breakdown.roomMonthly))}
                        {row(`${discountPct}% discount applied`, inr(breakdown.roomMonthly - breakdown.discountedMonthlyBase), { deduct: true, faint: true })}
                        {row(`Discounted monthly rent`, inr(breakdown.discountedMonthlyBase))}
                        {row(`GST (${Math.round((breakdown.gstRate ?? 0.12) * 100)}% on discounted rent)`, inr(breakdown.monthlyGST))}
                        {row(`Monthly total (post-discount + GST)`, inr(breakdown.discountedMonthlyWithGST))}

                        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />

                        {/* Section: Tenure total */}
                        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(216,181,106,0.4)", marginBottom: 4 }}>
                            Tenure Total
                        </div>
                        {row(`Room rent × ${breakdown.installmentMonths} months`, inr(breakdown.roomRentTotal))}
                        {breakdown.securityDeposit > 0 && (breakdown.depositCredited ?? 0) > 0
                            ? row(`Security deposit (already paid separately)`, inr(breakdown.securityDeposit), { faint: true })
                            : breakdown.securityDeposit > 0
                                ? row(`Security deposit (one-time)`, inr(breakdown.securityDeposit))
                                : null}
                        {row(`Registration / Admin fee`, inr(breakdown.registrationFee))}
                        {breakdown.transportTotal > 0 && row(`Transport (₹${inr(breakdown.transportMonthly)}/mo × ${breakdown.installmentMonths})`, inr(breakdown.transportTotal))}
                        {breakdown.messTotal > 0 && row(
                            breakdown.messIsLumpSum ? `Mess fee (lump sum)` : `Mess fee (₹${inr(breakdown.messMonthly)}/mo × ${breakdown.installmentMonths})`,
                            inr(breakdown.messTotal)
                        )}

                        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />

                        {/* Section: Deductions */}
                        {(breakdown.referralDeduction > 0 || breakdown.depositCredited > 0) && (
                            <>
                                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(216,181,106,0.4)", marginBottom: 4 }}>
                                    Deductions
                                </div>
                                {breakdown.referralDeduction > 0 && row(`Referral bonus`, inr(breakdown.referralDeduction), { deduct: true, highlight: true })}
                                {breakdown.depositCredited > 0 && row(`Deposit already paid`, inr(breakdown.depositCredited), { deduct: true, highlight: true })}
                                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "6px 0" }} />
                            </>
                        )}

                        {/* Total */}
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: GOLD, fontWeight: 700, letterSpacing: "0.05em" }}>
                                {paymentMode === "full" ? "Total Payable" : "Installment 1"}
                            </span>
                            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.2rem", color: GOLD }}>
                                {inr(installment1)}
                            </span>
                        </div>

                        {/* Installment 2 summary (half mode) */}
                        {paymentMode === "half" && breakdown2 && installment2 != null && installment2 > 0 && (
                            <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.4)" }}>
                                        Installment 2 ({breakdown2.installmentMonths} months — due later)
                                    </span>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "rgba(246,244,239,0.65)" }}>
                                        {inr(installment2)}
                                    </span>
                                </div>
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(246,244,239,0.3)", margin: "4px 0 0" }}>
                                    No flat fees or referral deduction on installment 2.
                                </p>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(246,244,239,0.3)", marginTop: 12 }}>
                    Select a room to load pricing.
                </p>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ConfirmPage() {
    const router = useRouter();
    const { state, updatePayment, markStepComplete, canAccessStep, setStatus } = useOnboarding();
    const { token } = useAuth();
    const { payment = { method: "" as const, transactionId: "", screenshot: null }, step3 = { selectedRoom: null, addOns: [] } } = state;

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Invoice state
    const [breakdown, setBreakdown] = useState<LiveBreakdown | null>(null);
    const [breakdown2, setBreakdown2] = useState<LiveBreakdown | null>(null);
    const [installment1, setInstallment1] = useState<number | null>(null);
    const [installment2, setInstallment2] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState(false);

    const [paymentMode, setPaymentMode] = useState<PaymentModeType>("full");
    const [modeLockedFromDeposit, setModeLockedFromDeposit] = useState(false);
    const [holdPaymentMode, setHoldPaymentMode] = useState<"full" | "half" | null>(null);
    const [hasActiveHold, setHasActiveHold] = useState(false);
    const [showDepositConfirmModal, setShowDepositConfirmModal] = useState(false);
    const [depositSubmitting, setDepositSubmitting] = useState(false);

    const [referralCode, setReferralCode] = useState("");
    const [referralFocused, setReferralFocused] = useState(false);
    // Resolved MongoDB ObjectId for the selected room (looked up once on mount)
    const [resolvedRoomTypeId, setResolvedRoomTypeId] = useState<string | null>(null);

    // Map frontend room IDs to backend RoomType.name values (mirrors step-3)
    const ROOM_TYPE_MAP: Record<string, string> = {
        "nexus-plus":    "NEXUS",
        "collective-plus": "COLLECTIVE",
        "axis":          "AXIS",
        "studio":        "AXIS+",
    };


    // Access guard
    useEffect(() => {
        if (!canAccessStep(5)) {
            setRedirecting(true);
            router.replace("/user-onboarding/step-4");
        }
    }, [canAccessStep, router]);

    useEffect(() => {
        const fetchHold = async () => {
            try {
                const res = await apiFetch<{ data: { hold: { paymentMode?: string; status?: string } | null } }>(
                    "/api/public/deposits/status"
                );
                const hold = res?.data?.hold;
                if (hold?.status === "active" || hold?.status === "pending_approval") {
                    setHasActiveHold(true);
                    if (hold?.paymentMode && (hold.paymentMode === "full" || hold.paymentMode === "half")) {
                        const savedMode = hold.paymentMode as "full" | "half";
                        setPaymentMode(savedMode);
                        setHoldPaymentMode(savedMode);
                        setModeLockedFromDeposit(true);
                    } else if (hold.paymentMode === "deposit") {
                        // User used deposit-only mode — they need to choose full/half now
                        setHasActiveHold(true);
                        setPaymentMode("full"); // default to full
                        setModeLockedFromDeposit(false); // allow selection
                    }
                }
            } catch {
                // No deposit — user hasn't done a holds flow, mode stays user-selectable
            }
        };
        fetchHold();
    }, []);

    // Fetch live price preview whenever paymentMode or referralCode changes
    const fetchPreview = useCallback(async (mode: "full" | "half", code?: string) => {
        // step3.selectedRoom.id is a frontend string like 'nexus-plus', NOT a MongoDB _id.
        // We need to resolve the real ObjectId from the backend rooms list.
        let roomTypeId = resolvedRoomTypeId;
        if (!roomTypeId) {
            const frontendId = (step3.selectedRoom as Record<string, any>)?.id;
            if (!frontendId) { setPreviewError(true); return; }
            const backendName = ROOM_TYPE_MAP[frontendId];
            if (!backendName) { setPreviewError(true); return; }
            try {
                const roomsRes = await apiFetch<{ data: { roomTypes: Array<{ _id: string; name: string }> } }>("/api/public/rooms");
                const match = roomsRes.data.roomTypes.find((r) => r.name === backendName);
                if (!match) { setPreviewError(true); return; }
                roomTypeId = match._id;
                setResolvedRoomTypeId(match._id);
            } catch {
                setPreviewError(true); return;
            }
        }
        setPreviewLoading(true);
        setPreviewError(false);
        try {
            const params = new URLSearchParams({ roomTypeId, paymentMode: mode });
            if (code) params.set("referralCode", code);
            const res = await apiFetch<{ data: FullPreviewResponse }>(
                `/api/public/payments/calculate-preview?${params}`
            );
            const d = res?.data as unknown as FullPreviewResponse;
            if (d?.breakdown) {
                setBreakdown(d.breakdown);
                setBreakdown2(d.breakdown2 ?? null);
                setInstallment1(d.installment1 ?? null);
                setInstallment2(d.installment2 ?? null);
            } else {
                setPreviewError(true);
            }
        } catch {
            setPreviewError(true);
        } finally {
            setPreviewLoading(false);
        }
    }, [step3.selectedRoom, resolvedRoomTypeId]);

    useEffect(() => {
        // Only fetch preview for full/half modes — deposit mode uses static DepositInvoicePanel
        if (paymentMode === "deposit") return;
        fetchPreview(paymentMode);
    }, [paymentMode, fetchPreview]);

    if (redirecting) return null;

    const hasDepositCredit = (breakdown?.depositCredited ?? 0) > 0;

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!payment.method) errs.method = "Please select a payment method";
        if (!payment.transactionId.trim()) errs.transactionId = "Transaction ID is required";
        if (payment.transactionId.trim().length < 4) errs.transactionId = "Transaction ID must be at least 4 characters";
        if (!payment.screenshot) errs.screenshot = "Payment screenshot is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Called when Deposit mode confirm modal is confirmed
    const handleDepositSubmit = async () => {
        setDepositSubmitting(true);
        setErrors({});
        try {
            let receiptUrl = "";
            if (payment.screenshot) {
                receiptUrl = await uploadFile("receipt", payment.screenshot.preview, payment.screenshot.name);
            }
            await apiFetch("/api/public/deposits/initiate", {
                method: "POST",
                token,
                body: {
                    roomTypeId: resolvedRoomTypeId,
                    paymentMode: "deposit",
                    transactionId: payment.transactionId,
                    receiptUrl,
                },
            });
            router.push("/user-onboarding/deposit-status");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Deposit submission failed. Please try again.";
            setErrors({ method: message });
            setShowDepositConfirmModal(false);
        } finally {
            setDepositSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        setAttempted(true);
        if (!validate()) return;

        // Deposit-only mode: show confirmation modal first
        if (paymentMode === "deposit") {
            // Need resolvedRoomTypeId for the API call — resolve it now if not yet done
            if (!resolvedRoomTypeId) {
                const frontendId = (step3.selectedRoom as Record<string, any>)?.id;
                if (frontendId) {
                    const backendName = ROOM_TYPE_MAP[frontendId];
                    if (backendName) {
                        try {
                            const roomsRes = await apiFetch<{ data: { roomTypes: Array<{ _id: string; name: string }> } }>("/api/public/rooms");
                            const match = roomsRes.data.roomTypes.find((r) => r.name === backendName);
                            if (match) setResolvedRoomTypeId(match._id);
                        } catch { /* ignore */ }
                    }
                }
            }
            setShowDepositConfirmModal(true);
            return;
        }

        setSubmitting(true);
        setErrors({});
        try {
            try {
                await apiFetch("/api/public/onboarding/confirm", { method: "POST", token });
            } catch (confirmErr) {
                const msg = confirmErr instanceof Error ? confirmErr.message : "";
                if (!msg.toLowerCase().includes("already") && !msg.toLowerCase().includes("completed")) throw confirmErr;
            }

            let receiptUrl = "";
            if (payment.screenshot) {
                receiptUrl = await uploadFile("receipt", payment.screenshot.preview, payment.screenshot.name);
            }

            await apiFetch("/api/public/payments/initiate", {
                method: "POST",
                token,
                body: {
                    paymentMode,
                    ...(referralCode.trim() ? { referralCode: referralCode.trim().toUpperCase() } : {}),
                    paymentMethod: payment.method,
                    description: `Onboarding payment - ${step3.selectedRoom?.title || "Room"}`,
                    transactionId: payment.transactionId,
                    receiptUrl,
                },
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


    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={CreditCard} label="Payment" />
                <StepTitle>Complete your payment</StepTitle>
                <StepSubtitle>Review your invoice, upload payment proof, and confirm your booking.</StepSubtitle>
            </motion.div>
            {/* Active Hold Banner — shown when returning user has already done deposit-only */}
            <AnimatePresence>
                {hasActiveHold && (
                    <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.22)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Shield size={18} color="#16a34a" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", fontWeight: 700, color: "#15803d", margin: 0 }}>
                                    ✅ Your ₹16,000 deposit is confirmed
                                </p>
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "#16a34a", margin: "3px 0 0", opacity: 0.8 }}>
                                    Your ₹15,000 security deposit will be applied to your payment below. Choose how you want to pay the balance.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {hasDepositCredit && (
                    <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} style={{ overflow: "hidden" }}>
                        <div style={{ background: "rgba(22,163,74,0.08)", border: "1.5px solid rgba(22,163,74,0.22)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Shield size={18} color="#16a34a" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", fontWeight: 700, color: "#15803d", margin: 0 }}>
                                    {inr(breakdown?.depositCredited)} security deposit credited
                                </p>
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "#16a34a", margin: "3px 0 0", opacity: 0.8 }}>
                                    Your earlier ₹15,000 deposit has been applied against this payment.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Payment Mode + Referral Card */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 12px" }}>
                        Payment Plan
                    </p>

                    {/* 3-card grid — hide Deposit card when user already has an active hold */}
                    <div style={{ display: "grid", gridTemplateColumns: hasActiveHold ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 14 }}>
                        {/* Full Payment */}
                        <button
                            key="full"
                            onClick={() => !modeLockedFromDeposit && setPaymentMode("full")}
                            disabled={modeLockedFromDeposit}
                            style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${paymentMode === "full" ? GREEN : "rgba(31,58,45,0.12)"}`, background: paymentMode === "full" ? "rgba(31,58,45,0.04)" : "#fff", cursor: modeLockedFromDeposit ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.2s", opacity: modeLockedFromDeposit && paymentMode !== "full" ? 0.4 : 1 }}
                        >
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: paymentMode === "full" ? GREEN : "rgba(31,58,45,0.5)", display: "block" }}>Full Payment</span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)" }}>Pay all 11 months now (40% off)</span>
                        </button>

                        {/* Half / Split Pay */}
                        <button
                            key="half"
                            onClick={() => !modeLockedFromDeposit && setPaymentMode("half")}
                            disabled={modeLockedFromDeposit}
                            style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${paymentMode === "half" ? GREEN : "rgba(31,58,45,0.12)"}`, background: paymentMode === "half" ? "rgba(31,58,45,0.04)" : "#fff", cursor: modeLockedFromDeposit ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.2s", opacity: modeLockedFromDeposit && paymentMode !== "half" ? 0.4 : 1 }}
                        >
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: paymentMode === "half" ? GREEN : "rgba(31,58,45,0.5)", display: "block" }}>Split Pay</span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)" }}>Pay 6 months now, 5 later (25% off)</span>
                        </button>

                        {/* Deposit-Only Card — only shown when user has NO active hold */}
                        {!hasActiveHold && (
                            <button
                                key="deposit"
                                onClick={() => setPaymentMode("deposit")}
                                style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${paymentMode === "deposit" ? "#d97706" : "rgba(31,58,45,0.12)"}`, background: paymentMode === "deposit" ? "rgba(245,158,11,0.04)" : "#fff", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                    <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: paymentMode === "deposit" ? "#d97706" : "rgba(31,58,45,0.5)" }}>🔒 Secure Room Now</span>
                                </div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)", display: "block", marginBottom: 8 }}>Pay ₹16,000 deposit now, choose plan later</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: paymentMode === "deposit" ? "#d97706" : "rgba(31,58,45,0.5)" }}>✅ Room held for 21 days</span>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: paymentMode === "deposit" ? "#d97706" : "rgba(31,58,45,0.5)" }}>✅ ₹15,000 refundable within 7 days</span>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(220,38,38,0.65)" }}>❌ ₹1,000 reg fee non-refundable</span>
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Deposit mode policy reminder */}
                    {paymentMode === "deposit" && !hasActiveHold && (
                        <div style={{ padding: "10px 12px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, marginBottom: 12 }}>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "#92400e", lineHeight: 1.5, display: "block" }}>
                                You will choose your full payment plan (Full Tenure or Half Yearly) when you return to complete payment. Your room rent will be calculated then.
                            </span>
                        </div>
                    )}

                    {/* Locked notice (for full/half locked from prior deposit) */}
                    {modeLockedFromDeposit && (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 12px", background: "rgba(31,58,45,0.04)", borderRadius: 10, marginBottom: 12 }}>
                            <Lock size={13} color="rgba(31,58,45,0.45)" />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.5)" }}>
                                Payment mode was set during deposit submission. Contact support to change.
                            </span>
                        </div>
                    )}

                    {/* Referral Code — hidden when deposit mode selected */}
                    {!modeLockedFromDeposit && paymentMode !== "deposit" && (
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <Tag size={14} color="rgba(31,58,45,0.4)" style={{ flexShrink: 0 }} />
                            <FieldInput
                                id="referral-code"
                                type="text"
                                placeholder="Referral code (optional, e.g. VIR-ABCDEF)"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                focused={referralFocused}
                                hasError={false}
                                onFocus={() => setReferralFocused(true)}
                                onBlur={() => {
                                    setReferralFocused(false);
                                    fetchPreview(paymentMode, referralCode.trim() || undefined);
                                }}
                            />
                            {previewLoading && (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(31,58,45,0.1)", borderTopColor: GREEN, flexShrink: 0 }} />
                            )}
                        </div>
                    )}
                </FormCard>
            </motion.div>

            {/* Invoice Panel — deposit mode gets static panel; full/half get live server-sourced panel */}
            <motion.div variants={itemVariants}>
                {paymentMode === "deposit" ? (
                    <DepositInvoicePanel />
                ) : (
                    <InvoicePanel
                        paymentMode={paymentMode as "full" | "half"}
                        breakdown={breakdown}
                        breakdown2={breakdown2}
                        installment1={installment1}
                        installment2={installment2}
                        loading={previewLoading}
                        apiError={previewError}
                    />
                )}
            </motion.div>

            {/* Payment Method */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <div>
                        <FieldLabel>Select Payment Method</FieldLabel>
                        {attempted && errors.method && <FieldError>{errors.method}</FieldError>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <PaymentMethodCard icon={Building2} title="Bank Transfer" description="NEFT / IMPS / UPI"
                            selected={payment.method === "bank_transfer"} onClick={() => updatePayment({ method: "bank_transfer" })} />
                        <PaymentMethodCard icon={Banknote} title="Cash" description="In-person at office"
                            selected={payment.method === "cash_deposit"} onClick={() => updatePayment({ method: "cash_deposit" })} />

                    </div>

                    {/* Bank Details */}
                    <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: "14px 16px", marginTop: 8 }}>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.8rem", fontWeight: 700, color: GREEN, margin: "0 0 10px" }}>Transfer to:</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {[["Account Name", "VIRAMAH Student Living Pvt Ltd"], ["Account No", "1234 5678 9012 3456"], ["IFSC", "SBIN0001234"], ["UPI", "viramah@ybl"]].map(([label, val]) => (
                                <div key={label} style={{ display: "flex", gap: 8 }}>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.4)", minWidth: 90 }}>{label}:</span>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: 700, color: GREEN }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </FormCard>
            </motion.div>

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

            {/* Screenshot */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <ScreenshotUpload
                        screenshot={payment.screenshot}
                        onUpload={(f) => updatePayment({ screenshot: f })}
                        onRemove={() => updatePayment({ screenshot: null })}
                    />
                    {attempted && errors.screenshot && <FieldError>{errors.screenshot}</FieldError>}
                </FormCard>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.back()}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(216,181,106,0.3)", borderTopColor: GOLD }} />
                            Submitting…
                        </>
                    ) : (
                        <><Upload size={16} /> Confirm Payment</>
                    )}
                </NavButton>
            </motion.div>
            {/* Referral fetch on blur fix for paymentMode type */}

            {/* Deposit Confirm Modal */}
            <AnimatePresence>
                {showDepositConfirmModal && (
                    <DepositConfirmModal
                        onConfirm={handleDepositSubmit}
                        onClose={() => setShowDepositConfirmModal(false)}
                        loading={depositSubmitting}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
