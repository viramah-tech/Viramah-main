"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Shield, Phone, Home, Check, Pencil,
    Plus, CreditCard, AlertTriangle,
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { useAuth } from "@/context/AuthContext";
import {
    NavButton, SecondaryButton, StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface BackendRoomType {
    _id: string;
    name: string;
    displayName?: string;
    capacity?: number;
    basePrice?: number;
    discountedPrice?: number;
    pricing?: {
        original?: number;
        discounted?: number;
    };
}

// ── Review Section Card ──────────────────────────────────────

function ReviewCard({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    onEdit,
    children,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
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
    const { personal, guardian, room, canAccessStep } = useOnboarding();
    const { user, refreshUser } = useAuth();
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [rooms, setRooms] = useState<BackendRoomType[]>([]);

    const compliance = user?.compliance ?? null;

    const refreshUserNonBlocking = async () => {
        try {
            await Promise.race([
                refreshUser(),
                new Promise((resolve) => setTimeout(resolve, 1500)),
            ]);
        } catch {
            // Non-fatal: navigation should proceed even if background refresh fails.
        }
    };

    // Step access restrictions removed - users can move freely
    // useEffect(() => {
    //     if (!canAccessStep("review")) {
    //         router.replace("/user-onboarding/step-3");
    //     }
    // }, [canAccessStep, router]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await apiFetch<{ data: { rooms?: BackendRoomType[]; roomTypes?: BackendRoomType[] } }>(API.rooms.list);
                const fetchedRooms = res?.data?.rooms ?? res?.data?.roomTypes ?? [];
                setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : []);
            } catch (err) {
                console.error("Failed to fetch rooms:", err);
            }
        };
        fetchRooms();
    }, []);

    // Step access restrictions removed - users can move freely
    // if (!canAccessStep("review")) return null;

    const selectedRoom = rooms.find((r) => r._id === room.roomTypeId);
    const backendMonthlyRoomPrice = Number(
        selectedRoom?.pricing?.discounted ??
        selectedRoom?.discountedPrice ??
        selectedRoom?.basePrice ??
        0
    );

    const paymentSummaryObj =
        user?.paymentSummary && typeof user.paymentSummary === "object"
            ? (user.paymentSummary as Record<string, unknown>)
            : null;

    const readSummaryTotal = (key: string): number => {
        const entry = paymentSummaryObj?.[key];
        if (entry && typeof entry === "object") {
            const total = (entry as { total?: unknown }).total;
            if (typeof total === "number") return total;
        }
        return 0;
    };

    const roomRentTotal = readSummaryTotal("roomRent");
    const messTotal = readSummaryTotal("messFee");
    const transportTotal = readSummaryTotal("transportFee");
    const grandTotal = readSummaryTotal("grandTotal");
    const registrationFeeTotal = readSummaryTotal("registrationFee");
    const securityDepositTotal = readSummaryTotal("securityDeposit");

    const handleConfirm = async () => {
        setSubmitting(true);
        setError("");
        try {
            await apiFetch(API.onboarding.confirm, { method: "POST" });
            // Force a fresh read of user state before navigating so the guard sees booking_payment step.
            await refreshUser({ force: true });
            router.replace("/user-onboarding/deposit");
            return;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to proceed. Please try again.";
            // Allow if already completed (idempotent)
            if (!message.toLowerCase().includes("already") && !message.toLowerCase().includes("completed")) {
                setError(message);
            } else {
                // Non-blocking fallback for already-confirmed state.
                void refreshUser({ force: true });
                router.replace("/user-onboarding/deposit");
                return;
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Check} label="Review &amp; Confirm" />
                <StepTitle>Review &amp; Confirm</StepTitle>
                <StepSubtitle>
                    Review your information before proceeding to payment.
                </StepSubtitle>
            </motion.div>

            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Shield}
                    iconBg="rgba(31,58,45,0.08)"
                    iconColor={GREEN}
                    title="Personal Details"
                    subtitle="Step 1 — Identity Verification"
                    onEdit={() => router.push("/user-onboarding/step-1")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        <DetailRow label="Name" value={personal.fullName || "—"} />
                        <DetailRow label="Date of Birth" value={personal.dateOfBirth || "—"} />
                        <DetailRow label="ID Type" value={ID_LABELS[personal.idType] || personal.idType} />
                        <DetailRow label="ID Number" value={personal.idNumber || "—"} mono />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            {personal.idFront && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)", position: "relative" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={personal.idFront.preview} alt="ID Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            {personal.idBack && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)", position: "relative" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={personal.idBack.preview} alt="ID Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </ReviewCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Phone}
                    iconBg="rgba(216,181,106,0.12)"
                    iconColor={GOLD}
                    title="Emergency Contact"
                    subtitle="Step 2 — Guardian Details"
                    onEdit={() => router.push("/user-onboarding/step-2")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        <DetailRow label="Contact Name" value={guardian.fullName || "—"} />
                        <DetailRow label="Phone" value={guardian.phone || "—"} mono />
                        <DetailRow label="Relationship" value={guardian.relation || "—"} />
                        {guardian.alternatePhone && (
                            <DetailRow label="Alternate Phone" value={guardian.alternatePhone} mono />
                        )}
                        <div style={{ height: 1, background: "rgba(31,58,45,0.08)", margin: "8px 0" }} />
                        <DetailRow label="Guardian ID Type" value={ID_LABELS[guardian.idType] || guardian.idType} />
                        <DetailRow label="Guardian ID Number" value={guardian.idNumber || "—"} mono />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            {guardian.idFront && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={guardian.idFront.preview} alt="Guardian ID Front" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                            {guardian.idBack && (
                                <div style={{ width: 60, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(31,58,45,0.15)" }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={guardian.idBack.preview} alt="Guardian ID Back" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            )}
                        </div>
                    </div>
                </ReviewCard>
            </motion.div>

            <motion.div variants={itemVariants}>
                <ReviewCard
                    icon={Home}
                    iconBg="rgba(31,58,45,0.08)"
                    iconColor={GREEN}
                    title="Room Selected"
                    subtitle="Step 3 — Room & Services"
                    onEdit={() => router.push("/user-onboarding/step-3")}
                >
                    <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 2 }}>
                        {selectedRoom ? (
                            <>
                                <DetailRow
                                    label="Room"
                                    value={`${selectedRoom.displayName || selectedRoom.name}${selectedRoom.capacity ? ` (${selectedRoom.capacity} Seater)` : ""}`}
                                />
                                <DetailRow
                                    label="Room Rent"
                                    value={roomRentTotal > 0 ? `${inr(roomRentTotal)} total` : backendMonthlyRoomPrice > 0 ? `${inr(backendMonthlyRoomPrice)}/mo` : "—"}
                                    mono
                                />
                                {(room.includeMess || room.includeTransport) && (
                                    <>
                                        <div style={{ height: 1, background: "rgba(31,58,45,0.08)", margin: "8px 0" }} />
                                        {room.includeTransport && (
                                            <DetailRow label="Daily Transport" value={transportTotal > 0 ? `${inr(transportTotal)} total` : "Included"} mono />
                                        )}
                                        {room.includeMess && (
                                            <DetailRow label="Mess Amount" value={messTotal > 0 ? `${inr(messTotal)} total` : "Included"} mono />
                                        )}
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

            {(room.includeMess || room.includeTransport) && (
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
                            {room.includeTransport && (
                                <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(31,58,45,0.07)", border: "1px solid rgba(31,58,45,0.12)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: GREEN, letterSpacing: "0.05em" }}>
                                    Daily Transport — {transportTotal > 0 ? `${inr(transportTotal)} total` : "Included"}
                                </span>
                            )}
                            {room.includeMess && (
                                <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(31,58,45,0.07)", border: "1px solid rgba(31,58,45,0.12)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: GREEN, letterSpacing: "0.05em" }}>
                                    Mess Amount — {messTotal > 0 ? `${inr(messTotal)} total` : "Included"}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

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
                        Total Payable
                    </p>
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        {inr(grandTotal)}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.4)", margin: "6px 0 0" }}>
                        Room {roomRentTotal > 0 ? inr(roomRentTotal) : "—"}
                        {(messTotal > 0 || transportTotal > 0) && ` + Add-ons ${inr(messTotal + transportTotal)}`}
                        {(registrationFeeTotal > 0 || securityDepositTotal > 0) && ` + Fees ${inr(registrationFeeTotal + securityDepositTotal)}`}
                    </p>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(216,181,106,0.15)", border: "1px solid rgba(216,181,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={20} color={GOLD} strokeWidth={2.5} />
                </div>
            </motion.div>

            {error && (
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#c0392b", textAlign: "center" }}>
                    {error}
                </p>
            )}

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
                        {compliance ? (
                            compliance.termsAccepted && compliance.privacyPolicyAccepted ? (
                                <>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Check size={14} color="#16a34a" />
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: "rgba(31,58,45,0.8)" }}>
                                            <strong>Terms &amp; Conditions</strong> accepted
                                            {compliance.termsAcceptedAt && <> on <em>{new Date(compliance.termsAcceptedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</em></>}
                                            {compliance.termsVersion && <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.4)", marginLeft: 6 }}>({compliance.termsVersion})</span>}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Check size={14} color="#16a34a" />
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.83rem", color: "rgba(31,58,45,0.8)" }}>
                                            <strong>Privacy Policy</strong> accepted
                                            {compliance.privacyAcceptedAt && <> on <em>{new Date(compliance.privacyAcceptedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</em></>}
                                            {compliance.privacyVersion && <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.4)", marginLeft: 6 }}>({compliance.privacyVersion})</span>}
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

            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/step-3")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleConfirm} disabled={submitting}>
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
