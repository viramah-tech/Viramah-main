"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, ArrowRight, Shield, Phone, Home, Check, Pencil,
    Plus, CreditCard, FileText, Lock, AlertTriangle,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { apiFetch } from "@/lib/api";
import {
    NavButton, SecondaryButton, StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants, FormCard, FieldLabel, FieldInput, FieldError, SelectionButton
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Review Section Card ──────────────────────────────────────

function ReviewCard({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    editStep,
    onEdit,
    children,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
    editStep: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 16,
                border: "1px solid rgba(31,58,45,0.1)",
                padding: 24,
                boxShadow: "0 2px 16px rgba(31,58,45,0.05)",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <Icon size={18} color={iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, margin: 0 }}>
                        {title}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", margin: 0, letterSpacing: "0.05em" }}>
                        {subtitle}
                    </p>
                </div>
                <button
                    onClick={onEdit}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid rgba(31,58,45,0.15)",
                        background: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "rgba(31,58,45,0.5)",
                        transition: "all 0.2s ease",
                    }}
                    className="hover:border-[#1F3A2D] hover:text-[#1F3A2D]"
                >
                    <Pencil size={11} /> Edit
                </button>
            </div>
            {children}
        </div>
    );
}

// ── Detail Row ───────────────────────────────────────────────

function DetailRow({ label, value, mono = false, highlight = false }: {
    label: string;
    value: string;
    mono?: boolean;
    highlight?: boolean;
}) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
            <span
                style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.65rem",
                    color: "rgba(31,58,45,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontFamily: mono ? "var(--font-mono, monospace)" : "var(--font-body, sans-serif)",
                    fontSize: mono ? "0.75rem" : "0.85rem",
                    color: highlight ? GREEN : "rgba(31,58,45,0.75)",
                    fontWeight: highlight ? 600 : 400,
                    letterSpacing: mono ? "0.03em" : 0,
                }}
            >
                {value}
            </span>
        </div>
    );
}

// ── ID Type Label Helper ─────────────────────────────────────

const ID_LABELS: Record<string, string> = {
    aadhaar: "Aadhaar",
    passport: "Passport",
    driving_license: "Driving License",
    voter_id: "Voter ID",
};

// ── Main Page ────────────────────────────────────────────────

export default function Step4Page() {
    const router = useRouter();
    const { state, updateStep4, markStepComplete, canAccessStep, getTotalCost, getAddOnsTotal, saveStepToBackend, saving } = useOnboarding();
    const { step1, step2, step3, step4 = { gender: "", address: "" } } = state;
    const [submitting, setSubmitting] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError] = useState("");
    const [redirecting, setRedirecting] = useState(false);
    const [agreements, setAgreements] = useState<{
        termsAccepted: boolean;
        termsAcceptedAt: string | null;
        termsVersion: string | null;
        privacyPolicyAccepted: boolean;
        privacyPolicyAcceptedAt: string | null;
        privacyPolicyVersion: string | null;
    } | null>(null);

    const fetchAgreements = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: { agreements: typeof agreements } }>("/api/public/auth/me");
            if (res?.data?.agreements) setAgreements(res.data.agreements);
        } catch { /* non-critical */ }
    }, []);

    useEffect(() => { fetchAgreements(); }, [fetchAgreements]);

    useEffect(() => {
        if (!canAccessStep(4)) {
            setRedirecting(true);
            router.replace("/user-onboarding/step-3");
        }
    }, [canAccessStep, router]);

    if (redirecting) {
        return null;
    }

    const enabledAddOns = step3.addOns.filter((a) => a.enabled);
    const totalCost = getTotalCost();

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!step4.gender) errs.gender = "Gender is required";
        if (!step4.address.trim()) errs.address = "Address is required";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirm = async () => {
        setAttempted(true);
        if (!validate()) return;
        
        setSubmitting(true);
        setError("");
        try {
            await saveStepToBackend(4, {
                gender: step4.gender,
                address: step4.address,
            });

            markStepComplete(4);
            router.push("/user-onboarding/confirm");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save. Please try again.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Check} label="Final Details & Review" />
                <StepTitle>Review &amp; Confirm</StepTitle>
                <StepSubtitle>
                    Please provide a few more details and review your information before proceeding to payment.
                </StepSubtitle>
            </motion.div>

            {/* Additional Details Form */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <h3 style={{ margin: 0, fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", color: GREEN }}>Additional Details</h3>
                        
                        {/* Gender */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <FieldLabel>Gender</FieldLabel>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                                <SelectionButton
                                    label="Male"
                                    selected={step4.gender === "male"}
                                    onClick={() => updateStep4({ gender: "male" })}
                                />
                                <SelectionButton
                                    label="Female"
                                    selected={step4.gender === "female"}
                                    onClick={() => updateStep4({ gender: "female" })}
                                />
                                <SelectionButton
                                    label="Other"
                                    selected={step4.gender === "other"}
                                    onClick={() => updateStep4({ gender: "other" })}
                                />
                            </div>
                            {attempted && errors.gender && <FieldError>{errors.gender}</FieldError>}
                        </div>

                        {/* Address */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <FieldLabel htmlFor="s4-address">Permanent Address</FieldLabel>
                            <textarea
                                id="s4-address"
                                placeholder="Enter your full permanent address"
                                value={step4.address}
                                onChange={(e) => updateStep4({ address: e.target.value })}
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: `1px solid ${attempted && errors.address ? "#e74c3c" : "rgba(31,58,45,0.15)"}`,
                                    background: "#fff",
                                    fontFamily: "var(--font-body, sans-serif)",
                                    fontSize: "0.85rem",
                                    color: GREEN,
                                    resize: "none",
                                    outline: "none",
                                    transition: "all 0.2s ease"
                                }}
                            />
                            {attempted && errors.address && <FieldError>{errors.address}</FieldError>}
                        </div>
                    </div>
                </FormCard>
            </motion.div>

            {/* Personal Details */}
            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Shield}
                    iconBg="rgba(31,58,45,0.08)"
                    iconColor={GREEN}
                    title="Personal Details"
                    subtitle="Step 1 — Identity Verification"
                    editStep="/user-onboarding/step-1"
                    onEdit={() => router.push("/user-onboarding/step-1")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        <DetailRow label="Name" value={step1.fullName || "—"} />
                        <DetailRow label="Date of Birth" value={step1.dateOfBirth || "—"} />
                        <DetailRow label="ID Type" value={ID_LABELS[step1.idType] || step1.idType} />
                        <DetailRow label="ID Number" value={step1.idNumber || "—"} mono />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            {step1.idFront && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    <img src={step1.idFront.preview} alt="ID Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            {step1.idBack && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    <img src={step1.idBack.preview} alt="ID Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </ReviewCard>
            </motion.div>

            {/* Emergency Details */}
            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Phone}
                    iconBg="rgba(216,181,106,0.12)"
                    iconColor={GOLD}
                    title="Emergency Contact"
                    subtitle="Step 2 — Guardian Details"
                    editStep="/user-onboarding/step-2"
                    onEdit={() => router.push("/user-onboarding/step-2")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        <DetailRow label="Contact Name" value={step2.emergencyName || "—"} />
                        <DetailRow label="Phone" value={step2.emergencyPhone || "—"} mono />
                        <DetailRow label="Relationship" value={step2.emergencyRelation || "—"} />
                        {step2.alternatePhone && (
                            <DetailRow label="Alternate Phone" value={step2.alternatePhone} mono />
                        )}
                        <div style={{ height: 1, background: "rgba(31,58,45,0.08)", margin: "8px 0" }} />
                        <DetailRow label="Guardian ID Type" value={ID_LABELS[step2.parentIdType] || step2.parentIdType} />
                        <DetailRow label="Guardian ID Number" value={step2.parentIdNumber || "—"} mono />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            {step2.parentIdFront && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    <img src={step2.parentIdFront.preview} alt="Guardian ID Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            {step2.parentIdBack && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    <img src={step2.parentIdBack.preview} alt="Guardian ID Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </ReviewCard>
            </motion.div>

            {/* Room Selection */}
            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Home}
                    iconBg="rgba(31,58,45,0.08)"
                    iconColor={GREEN}
                    title="Room Selected"
                    subtitle="Step 3 — Room & Services"
                    editStep="/user-onboarding/step-3"
                    onEdit={() => router.push("/user-onboarding/step-3")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        {step3.selectedRoom ? (
                            <>
                                <DetailRow label="Room" value={`${step3.selectedRoom.title} (${step3.selectedRoom.type})`} />
                                <DetailRow label="Room Rent" value={`${step3.selectedRoom.priceLabel}/mo`} mono />
                                {enabledAddOns.length > 0 && (
                                    <>
                                        <div style={{ height: 1, background: "rgba(31,58,45,0.08)", margin: "8px 0" }} />
                                        {enabledAddOns.map((addon) => (
                                            <DetailRow key={addon.id} label={addon.name} value={`₹${addon.price.toLocaleString()}/mo`} mono />
                                        ))}
                                    </>
                                )}
                            </>
                        ) : (
                            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.4)" }}>
                                No room selected
                            </p>
                        )}
                    </div>
                </ReviewCard>
            </motion.div>

            {/* Add-ons Summary */}
            {enabledAddOns.length > 0 && (
                <motion.div variants={itemVariants}>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            border: "1px solid rgba(31,58,45,0.1)",
                            padding: 24,
                            boxShadow: "0 2px 16px rgba(31,58,45,0.05)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(31,58,45,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Plus size={18} color={GREEN} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, margin: 0 }}>Add-on Services</p>
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", margin: 0 }}>Optional monthly services</p>
                            </div>
                        </div>
                        <div style={{ paddingLeft: 52, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {enabledAddOns.map((addon) => (
                                <span
                                    key={addon.id}
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: 999,
                                        background: "rgba(31,58,45,0.07)",
                                        border: "1px solid rgba(31,58,45,0.12)",
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.65rem",
                                        color: GREEN,
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    {addon.name} — ₹{addon.price.toLocaleString()}/mo
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Total Summary Banner */}
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
                        Monthly Total
                    </p>
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        ₹{totalCost.toLocaleString()}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.4)", margin: "6px 0 0" }}>
                        Room {step3.selectedRoom?.priceLabel ?? "—"}
                        {enabledAddOns.length > 0 && ` + Add-ons ₹${getAddOnsTotal().toLocaleString()}`}
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
                    <Check size={20} color={GOLD} strokeWidth={2.5} />
                </div>
            </motion.div>

            {/* Error */}
            {error && (
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#c0392b", textAlign: "center" }}>
                    {error}
                </p>
            )}

            {/* Agreements */}
            <motion.div variants={itemVariants}>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.1)", padding: 24, boxShadow: "0 2px 16px rgba(31,58,45,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(22,163,74,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Shield size={18} color="#16a34a" />
                        </div>
                        <div>
                            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, margin: 0 }}>Agreements &amp; Consents</p>
                            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", margin: 0 }}>Recorded at onboarding</p>
                        </div>
                    </div>
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 8 }}>
                        {agreements ? (
                            agreements.termsAccepted && agreements.privacyPolicyAccepted ? (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Check size={14} color="#16a34a" />
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: "rgba(31,58,45,0.8)" }}>
                                            <strong>Terms &amp; Conditions</strong> accepted
                                            {agreements.termsAcceptedAt && <> on <em>{new Date(agreements.termsAcceptedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</em></>}
                                            {agreements.termsVersion && <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.4)", marginLeft: 6 }}>({agreements.termsVersion})</span>}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Check size={14} color="#16a34a" />
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: "rgba(31,58,45,0.8)" }}>
                                            <strong>Privacy Policy</strong> accepted
                                            {agreements.privacyPolicyAcceptedAt && <> on <em>{new Date(agreements.privacyPolicyAcceptedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</em></>}
                                            {agreements.privacyPolicyVersion && <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.4)", marginLeft: 6 }}>({agreements.privacyPolicyVersion})</span>}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "rgba(217,119,6,0.06)", borderRadius: 8, border: "1px solid rgba(217,119,6,0.18)" }}>
                                    <AlertTriangle size={14} color="#d97706" />
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "#92400e" }}>Agreement record not available for this account.</span>
                                </div>
                            )
                        ) : (
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.35)" }}>Loading agreements…</span>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/step-3")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleConfirm} disabled={submitting || saving}>
                    {submitting ? "Saving..." : (
                        <>
                            <CreditCard size={16} />
                            Proceed to Payment
                        </>
                    )}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
