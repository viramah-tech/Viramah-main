"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bus, Check, Home, UtensilsCrossed } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
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

interface RoomData {
    _id: string;
    name: string;
    rawName: string;
    capacity: number;
    features?: string[];
    monthlyPrice: number;
    availableSeats: number;
    isActive: boolean;
}

interface RoomApiRaw {
    _id: string;
    name: string;
    displayName?: string;
    capacity?: number;
    bedsPerRoom?: number;
    features?: string[];
    basePrice?: number;
    discountedPrice?: number;
    monthlyPrice?: number;
    price?: number;
    availableRooms?: number;
    availableSeats?: number;
    isActive?: boolean;
    pricing?: {
        original?: number;
        discounted?: number;
    };
}

interface PricingConfigRaw {
    tenureMonths?: number;
    registrationFee?: number;
    securityDeposit?: number;
    mess?: {
        monthlyFee?: number;
        annualDiscountedPrice?: number;
    };
    transport?: {
        monthlyFee?: number;
    };
}

interface PricingView {
    tenureMonths: number;
    registrationFee: number;
    securityDeposit: number;
    messMonthly: number;
    messLumpSum: number;
    transportMonthly: number;
}

const FALLBACK_PRICING: PricingView = {
    tenureMonths: 11,
    registrationFee: 1000,
    securityDeposit: 15000,
    messMonthly: 2000,
    messLumpSum: 19900,
    transportMonthly: 2000,
};

const readNumber = (...values: unknown[]) => {
    for (const value of values) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
    }
    return 0;
};

export default function Step3Page() {
    const router = useRouter();
    const { room, setRoom } = useOnboarding();
    const { refreshUser } = useAuth();

    const [rooms, setRooms] = useState<RoomData[]>([]);
    const [pricing, setPricing] = useState<PricingView>(FALLBACK_PRICING);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(room?.roomTypeId || null);
    const [includeMess, setIncludeMess] = useState<boolean>(room?.includeMess ?? false);
    const [includeTransport, setIncludeTransport] = useState<boolean>(room?.includeTransport ?? false);
    const [paymentPlan, setPaymentPlan] = useState<"full" | "half">("full");

    // Step access restrictions removed - users can move freely
    // useEffect(() => {
    //     if (!canAccessStep("room_selection")) {
    //         router.replace("/user-onboarding/step-2");
    //     }
    // }, [canAccessStep, router]);

    useEffect(() => {
        const normalizePricing = (raw: PricingConfigRaw | null | undefined): PricingView => {
            if (!raw) return FALLBACK_PRICING;

            const tenureMonths = raw.tenureMonths ?? FALLBACK_PRICING.tenureMonths;
            const registrationFee = raw.registrationFee ?? FALLBACK_PRICING.registrationFee;
            const securityDeposit = raw.securityDeposit ?? FALLBACK_PRICING.securityDeposit;
            const messMonthly = raw.mess?.monthlyFee ?? FALLBACK_PRICING.messMonthly;
            const messLumpSum = raw.mess?.annualDiscountedPrice ?? messMonthly * tenureMonths;
            const transportMonthly = raw.transport?.monthlyFee ?? FALLBACK_PRICING.transportMonthly;

            return {
                tenureMonths,
                registrationFee,
                securityDeposit,
                messMonthly,
                messLumpSum,
                transportMonthly,
            };
        };

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                const [roomResult, pricingResult] = await Promise.allSettled([
                    apiFetch<{ data?: { rooms?: RoomApiRaw[]; roomTypes?: RoomApiRaw[] } }>(API.rooms.list),
                    apiFetch<{ data?: { pricing?: PricingConfigRaw } | PricingConfigRaw }>(API.pricing.get),
                ]);

                const roomRes = roomResult.status === "fulfilled" ? roomResult.value : null;
                const pricingRes = pricingResult.status === "fulfilled" ? pricingResult.value : null;

                const rawRooms = roomRes?.data?.rooms ?? roomRes?.data?.roomTypes ?? [];
                const safeRooms = Array.isArray(rawRooms)
                    ? rawRooms.map((item) => ({
                          _id: item._id,
                          rawName: item.name,
                          name: item.displayName || item.name,
                          capacity: Number(item.capacity ?? item.bedsPerRoom ?? 0),
                          // RoomTypes: use basePrice (rack rate) as the source of truth.
                          monthlyPrice: readNumber(
                              item.basePrice,
                              item.pricing?.original,
                              item.monthlyPrice,
                              item.price
                          ),
                          availableSeats: Number(item.availableSeats ?? item.availableRooms ?? 0),
                          isActive: item.isActive !== false,
                          features: Array.isArray(item.features) ? item.features : [],
                      }))
                    : [];

                const rawPricing =
                    (pricingRes?.data as { pricing?: PricingConfigRaw } | undefined)?.pricing ||
                    (pricingRes?.data as PricingConfigRaw | undefined) ||
                    null;

                setRooms(safeRooms);
                setPricing(normalizePricing(rawPricing));

                if (roomResult.status === "rejected") {
                    throw roomResult.reason;
                }

                if (pricingResult.status === "rejected") {
                    console.warn("step-3 pricing fallback applied:", pricingResult.reason);
                }
            } catch (fetchErr) {
                console.error("step-3 fetch failed:", fetchErr);
                setError("Unable to load room options right now. Please try again.");
                setPricing(FALLBACK_PRICING);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const selectedRoom = useMemo(
        () => rooms.find((item) => item._id === selectedRoomId) || null,
        [rooms, selectedRoomId]
    );

    const FULL_DISCOUNT_PCT = 40;
    const HALF_DISCOUNT_PCT = 25;

    const cost = useMemo(() => {
        if (!selectedRoom) {
            return {
                roomRentMonthly: 0,
                roomRentRaw: 0,
                discountPct: 0,
                discountValue: 0,
                roomRentDiscounted: 0,
                messTotal: 0,
                transportTotal: 0,
                totalPayable: 0,
            };
        }

        const roomRentMonthly = selectedRoom.monthlyPrice;
        const roomRentRaw = roomRentMonthly * pricing.tenureMonths;
        const discountPct = paymentPlan === "full" ? FULL_DISCOUNT_PCT : HALF_DISCOUNT_PCT;
        const discountValue = Math.round(roomRentRaw * (discountPct / 100));
        const roomRentDiscounted = roomRentRaw - discountValue;
        const messTotal = includeMess
            ? pricing.messLumpSum > 0
                ? pricing.messLumpSum
                : pricing.messMonthly * pricing.tenureMonths
            : 0;
        const transportTotal = includeTransport ? pricing.transportMonthly * pricing.tenureMonths : 0;

        return {
            roomRentMonthly,
            roomRentRaw,
            discountPct,
            discountValue,
            roomRentDiscounted,
            messTotal,
            transportTotal,
            totalPayable:
                pricing.registrationFee +
                pricing.securityDeposit +
                roomRentDiscounted +
                messTotal +
                transportTotal,
        };
    }, [selectedRoom, includeMess, includeTransport, pricing, paymentPlan]);

    const handleContinue = async () => {
        if (!selectedRoomId) {
            setError("Please select a room to continue.");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await apiFetch(API.onboarding.room, {
                method: "PUT",
                body: {
                    roomTypeId: selectedRoomId,
                    includeMess,
                    includeTransport,
                    paymentPlan,
                },
            });

            // Force a fresh user fetch before navigating to ensure step guard sees new currentStep.
            await refreshUser({ force: true });

            setRoom({
                roomTypeId: selectedRoomId,
                includeMess,
                includeTransport,
            });

            router.replace("/user-onboarding/step-4");
        } catch (saveErr) {
            const message = saveErr instanceof Error ? saveErr.message : "Failed to save selection.";
            const status =
                typeof saveErr === "object" &&
                saveErr !== null &&
                "status" in saveErr &&
                typeof (saveErr as { status?: unknown }).status === "number"
                    ? (saveErr as { status: number }).status
                    : undefined;
            const currentStep = message.match(/current step:\s*([a-z_]+)/i)?.[1]?.toLowerCase();
            const stepPathMap: Record<string, string> = {
                compliance: "/user-onboarding/terms",
                verification: "/verify-contact",
                personal_details: "/user-onboarding/step-1",
                guardian_details: "/user-onboarding/step-2",
                room_selection: "/user-onboarding/step-3",
                review: "/user-onboarding/step-4",
                booking_payment: "/user-onboarding/deposit",
                final_payment: "/user-onboarding/payment-breakdown",
                completed: "/student/dashboard",
            };
            const canAutoForward =
                currentStep === "review" ||
                currentStep === "booking_payment" ||
                currentStep === "final_payment" ||
                currentStep === "completed";

            // If backend has already advanced past room selection, treat this as an idempotent continue.
            if (
                status === 403 &&
                /room_selection/i.test(message) &&
                canAutoForward
            ) {
                setRoom({
                    roomTypeId: selectedRoomId,
                    includeMess,
                    includeTransport,
                });

                if (currentStep === "booking_payment") {
                    router.push("/user-onboarding/deposit");
                } else if (currentStep === "final_payment" || currentStep === "completed") {
                    router.push("/user-onboarding/payment-status");
                } else {
                    router.push("/user-onboarding/step-4");
                }
                return;
            }

            if (/requires step/i.test(message) && currentStep && stepPathMap[currentStep]) {
                router.push(stepPathMap[currentStep]);
                return;
            }

            console.error("step-3 save failed:", saveErr);

            setError(message || "Failed to save selection.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push("/user-onboarding/step-2");
    };

    if (loading) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "1rem", color: GREEN }}>Loading rooms...</p>
            </motion.div>
        );
    }

    if (!rooms.length) {
        return (
            <motion.div variants={containerVariants} initial={false} animate="visible" style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "0.95rem", color: "#b91c1c", marginBottom: 16 }}>
                    {error || "No active room options available."}
                </p>
                <NavButton onClick={() => window.location.reload()}>Try Again</NavButton>
            </motion.div>
        );
    }

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 6 }}>
                <StepBadge icon={Home} label="Room Selection" />
                <StepTitle>Choose your room</StepTitle>
                <StepSubtitle>Select room and optional services for your {pricing.tenureMonths}-month tenure.</StepSubtitle>
            </motion.div>

            {error && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: "1px solid #ef4444",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.72rem",
                        letterSpacing: "0.04em",
                    }}
                >
                    {error}
                </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {rooms.map((roomEntry) => (
                    <RoomCard
                        key={roomEntry._id}
                        room={roomEntry}
                        tenureMonths={pricing.tenureMonths}
                        selected={selectedRoomId === roomEntry._id}
                        onSelect={() => setSelectedRoomId(roomEntry._id)}
                    />
                ))}
            </motion.div>

            {selectedRoom && (
                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
                    <AddOnCard
                        icon={UtensilsCrossed}
                        title="Meal Plan"
                        description="3 meals daily"
                        enabled={includeMess}
                        onToggle={() => setIncludeMess((prev) => !prev)}
                        amount={pricing.messLumpSum > 0 ? pricing.messLumpSum : pricing.messMonthly * pricing.tenureMonths}
                        amountLabel="full tenure"
                    />
                    <AddOnCard
                        icon={Bus}
                        title="Daily Transport"
                        description="Campus shuttle"
                        enabled={includeTransport}
                        onToggle={() => setIncludeTransport((prev) => !prev)}
                        amount={pricing.transportMonthly * pricing.tenureMonths}
                        amountLabel={`${pricing.tenureMonths} months`}
                    />
                </motion.div>
            )}

            {selectedRoom && (
                <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <motion.button
                        type="button"
                        onClick={() => setPaymentPlan("full")}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                            borderRadius: 14,
                            border: `2px solid ${paymentPlan === "full" ? GREEN : "rgba(31,58,45,0.12)"}`,
                            background: paymentPlan === "full" ? "rgba(31,58,45,0.06)" : "#fff",
                            padding: 16,
                            cursor: "pointer",
                            textAlign: "center",
                        }}
                    >
                        <p style={{
                            margin: 0,
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.58rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: paymentPlan === "full" ? GOLD : "rgba(31,58,45,0.5)",
                        }}>
                            Full Payment
                        </p>
                        <p style={{
                            margin: "6px 0 4px 0",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: GREEN,
                        }}>
                            {FULL_DISCOUNT_PCT}% Off
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: "0.78rem",
                            color: "rgba(31,58,45,0.55)",
                        }}>
                            Pay ₹{(Math.round(selectedRoom.monthlyPrice * pricing.tenureMonths * (1 - FULL_DISCOUNT_PCT / 100))).toLocaleString()} total
                        </p>
                    </motion.button>

                    <motion.button
                        type="button"
                        onClick={() => setPaymentPlan("half")}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                            borderRadius: 14,
                            border: `2px solid ${paymentPlan === "half" ? GREEN : "rgba(31,58,45,0.12)"}`,
                            background: paymentPlan === "half" ? "rgba(31,58,45,0.06)" : "#fff",
                            padding: 16,
                            cursor: "pointer",
                            textAlign: "center",
                        }}
                    >
                        <p style={{
                            margin: 0,
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.58rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: paymentPlan === "half" ? GOLD : "rgba(31,58,45,0.5)",
                        }}>
                            Part Payment
                        </p>
                        <p style={{
                            margin: "6px 0 4px 0",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: GREEN,
                        }}>
                            {HALF_DISCOUNT_PCT}% Off
                        </p>
                        <p style={{
                            margin: 0,
                            fontSize: "0.78rem",
                            color: "rgba(31,58,45,0.55)",
                        }}>
                            Pay 60% now, 40% later
                        </p>
                    </motion.button>
                </motion.div>
            )}

            {selectedRoom && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: "linear-gradient(135deg, #1F3A2D 0%, #15281d 100%)",
                        borderRadius: 14,
                        padding: 20,
                        color: "#fff",
                    }}
                >
                    <h4
                        style={{
                            margin: "0 0 14px 0",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.62rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            color: GOLD,
                        }}
                    >
                        Payment Summary
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
                        <CostItem label={`${selectedRoom.name} (${pricing.tenureMonths} months)`} amount={cost.roomRentRaw} />
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#4ade80" }}>
                            <span>{paymentPlan === "full" ? "Full Payment" : "Part Payment"} Discount ({cost.discountPct}%)</span>
                            <span>- ₹{cost.discountValue.toLocaleString()}</span>
                        </div>
                        <CostItem label="Discounted Room Rent" amount={cost.roomRentDiscounted} />
                        {includeMess && <CostItem label="Mess Fee" amount={cost.messTotal} />}
                        {includeTransport && <CostItem label="Transport Fee" amount={cost.transportTotal} />}

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 8, paddingTop: 8 }}>
                            <CostItem label="Registration Fee" amount={pricing.registrationFee} subtle />
                            <CostItem label="Security Deposit" amount={pricing.securityDeposit} subtle />
                        </div>

                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: 8, paddingTop: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: GOLD }}>
                                <span>Total Payable</span>
                                <span>₹{cost.totalPayable.toLocaleString()}</span>
                            </div>
                            {paymentPlan === "half" && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
                                    <span>Pay Now (60%)</span>
                                    <span>₹{Math.round(cost.roomRentDiscounted * 0.6).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <SecondaryButton onClick={handleBack}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleContinue} disabled={!selectedRoomId || submitting}>
                    {submitting ? (
                        "Saving..."
                    ) : (
                        <>
                            Continue to Review <ArrowRight size={16} />
                        </>
                    )}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}

function RoomCard({
    room,
    tenureMonths,
    selected,
    onSelect,
}: {
    room: RoomData;
    tenureMonths: number;
    selected: boolean;
    onSelect: () => void;
}) {
    const canSelect = room.isActive && room.availableSeats > 0;
    const previewFeatures = Array.isArray(room.features) ? room.features : [];

    return (
        <motion.button
            type="button"
            disabled={!canSelect}
            onClick={onSelect}
            whileHover={canSelect ? { scale: 1.01 } : {}}
            whileTap={canSelect ? { scale: 0.99 } : {}}
            style={{
                width: "100%",
                textAlign: "left",
                borderRadius: 14,
                border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.1)"}`,
                background: selected ? "#ffffff" : "rgba(255,255,255,0.8)",
                padding: 16,
                cursor: canSelect ? "pointer" : "not-allowed",
                opacity: canSelect ? 1 : 0.55,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
            }}
        >
            <div
                style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.2)"}`,
                    background: selected ? GREEN : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                    flexShrink: 0,
                }}
            >
                {selected && <Check size={13} color="#fff" strokeWidth={3} />}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "1rem", color: GREEN }}>{room.rawName}</h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "rgba(31,58,45,0.6)" }}>
                            {room.name} � {room.availableSeats} seats available
                        </p>
                    </div>
                    {!canSelect && (
                        <span
                            style={{
                                background: "#fef2f2",
                                border: "1px solid #fecaca",
                                color: "#b91c1c",
                                borderRadius: 999,
                                padding: "4px 10px",
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.55rem",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                            }}
                        >
                            Full
                        </span>
                    )}
                </div>

                {previewFeatures.length > 0 && (
                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
                        {previewFeatures.slice(0, 4).map((feature, index) => (
                            <div key={`${room._id}-feature-${index}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.76rem", color: "rgba(31,58,45,0.75)" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: GREEN }} />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 12, display: "flex", gap: 18 }}>
                    <PriceTile label="Per Month" amount={room.monthlyPrice} color={GREEN} />
                    <PriceTile label={`${tenureMonths} Months`} amount={room.monthlyPrice * tenureMonths} color={GOLD} />
                </div>
            </div>
        </motion.button>
    );
}

function AddOnCard({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    amount,
    amountLabel,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    amount: number;
    amountLabel: string;
}) {
    return (
        <motion.button
            type="button"
            onClick={onToggle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
                borderRadius: 12,
                border: `2px solid ${enabled ? GREEN : "rgba(31,58,45,0.12)"}`,
                background: enabled ? "#fff" : "rgba(255,255,255,0.8)",
                padding: 14,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 10,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: enabled ? GREEN : "rgba(31,58,45,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={18} color={enabled ? "#fff" : GREEN} />
                </div>
                <div
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `2px solid ${enabled ? GREEN : "rgba(31,58,45,0.2)"}`,
                        background: enabled ? GREEN : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {enabled && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
            </div>

            <div>
                <h4 style={{ margin: 0, color: GREEN, fontSize: "0.9rem" }}>{title}</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.76rem", color: "rgba(31,58,45,0.55)" }}>
                    {description}
                </p>
            </div>

            <p style={{ margin: 0, color: enabled ? GOLD : "rgba(31,58,45,0.6)", fontWeight: 700, fontSize: "0.9rem" }}>
                ₹{amount.toLocaleString()} <span style={{ fontWeight: 500, fontSize: "0.72rem" }}>({amountLabel})</span>
            </p>
        </motion.button>
    );
}

function PriceTile({ label, amount, color }: { label: string; amount: number; color: string }) {
    return (
        <div>
            <p
                style={{
                    margin: 0,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.56rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(31,58,45,0.5)",
                }}
            >
                {label}
            </p>
            <p style={{ margin: "3px 0 0 0", fontSize: "1.05rem", fontWeight: 700, color }}>
                ₹{amount.toLocaleString()}
            </p>
        </div>
    );
}

function CostItem({ label, amount, subtle = false }: { label: string; amount: number; subtle?: boolean }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", color: subtle ? "rgba(255,255,255,0.75)" : "#fff" }}>
            <span>{label}</span>
            <span>₹{amount.toLocaleString()}</span>
        </div>
    );
}
