"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
    ArrowRight, ArrowLeft, Home, Check, Bus, UtensilsCrossed,
    ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/context/OnboardingContext";
import { ROOMS, type RoomType } from "@/data/rooms";
import {
    NavButton, SecondaryButton, StepBadge, StepTitle, StepSubtitle,
    containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Selectable Room Card (reuses exact rooms page design) ────

function SelectableRoomCard({
    room,
    isSelected,
    onSelect,
}: {
    room: RoomType;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["2deg", "-2deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-2deg", "2deg"]);

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) / rect.width);
        y.set((event.clientY - rect.top - rect.height / 2) / rect.height);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    function prevImg(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentImg((i) => (i - 1 + room.images.length) % room.images.length);
    }

    function nextImg(e: React.MouseEvent) {
        e.stopPropagation();
        setCurrentImg((i) => (i + 1) % room.images.length);
    }

    const hasImages = room.images.length > 0;

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative w-full rounded-[6px] overflow-hidden",
                room.featured ? "bg-[#fdf8ee]" : "bg-[#f7f1e8]",
                isSelected
                    ? "shadow-[0_0_0_3px_#1F3A2D,0_0_30px_rgba(31,58,45,0.25)]"
                    : room.featured
                        ? "shadow-[0_0_0_2px_#D8B56A,0_0_30px_rgba(216,181,106,0.35),-12px_-12px_40px_rgba(255,255,255,0.6),16px_16px_50px_rgba(0,0,0,0.28)]"
                        : "shadow-[-12px_-12px_40px_rgba(255,255,255,0.6),16px_16px_50px_rgba(0,0,0,0.28),inset_1px_1px_2px_rgba(255,255,255,0.8),inset_-1px_-1px_2px_rgba(0,0,0,0.12)]",
                "hover:z-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
            )}
            onClick={onSelect}
        >
            {/* Selected indicator */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: GREEN, boxShadow: "0 4px 14px rgba(31,58,45,0.4)" }}
                >
                    <Check size={18} color={GOLD} strokeWidth={2.5} />
                </motion.div>
            )}

            {/* Featured ribbon */}
            {room.featured && (
                <div className="absolute top-0 right-0 z-30 overflow-hidden" style={{ width: 120, height: 120, pointerEvents: "none" }}>
                    <div
                        style={{
                            position: "absolute", top: 28, right: -32, width: 140,
                            background: "linear-gradient(135deg, #D8B56A, #c9a04f)",
                            color: "#1a3328", fontSize: "0.58rem",
                            fontFamily: "var(--font-mono, monospace)", fontWeight: 800,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            textAlign: "center", padding: "5px 0",
                            transform: "rotate(45deg)", boxShadow: "0 3px 14px rgba(0,0,0,0.25)",
                        }}
                    >
                        Popular
                    </div>
                </div>
            )}

            {/* Tag */}
            {room.tag && (
                <div
                    className="absolute top-4 left-4 z-20 px-3 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] font-bold rounded-[3px]"
                    style={{
                        background: room.featured ? "#D8B56A" : "var(--luxury-green)",
                        color: room.featured ? "#1a3328" : "var(--gold)",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                    }}
                >
                    {room.tag}
                </div>
            )}

            <div className="relative w-full h-full flex flex-col" style={{ transform: "translateZ(20px)" }}>
                {/* Image carousel */}
                {hasImages && (
                    <div className="relative w-full h-[260px] sm:h-[340px] md:h-[300px] overflow-hidden shrink-0">
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                background: "linear-gradient(110deg, #1e3529 30%, #2a4a38 50%, #1e3529 70%)",
                                backgroundSize: "200% 100%",
                                animation: "tileShimmer 1.6s ease-in-out infinite",
                            }}
                        />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImg}
                                className="w-full h-full relative"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <Image
                                    src={room.images[currentImg]}
                                    alt={`${room.title} – photo ${currentImg + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                                <div className="absolute top-3 right-14 z-10 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                    <span className="font-mono text-white/80 text-[0.55rem] tracking-widest">{currentImg + 1} / {room.images.length}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {room.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImg}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/45 hover:bg-black/70 text-white rounded-full text-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextImg}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/45 hover:bg-black/70 text-white rounded-full text-lg transition-all duration-200 z-20 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
                                >
                                    <ChevronRightIcon size={16} />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                    {room.images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                                            className={cn(
                                                "rounded-full transition-all duration-300",
                                                i === currentImg ? "bg-white w-4 h-1.5" : "bg-white/45 w-1.5 h-1.5"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-4 px-5 py-5">
                    <div>
                        <span className="font-mono text-[0.65rem] text-green-sage tracking-[2px] uppercase block mb-1.5 opacity-70">
                            {room.type}
                        </span>
                        <h3 className="font-display text-[1.8rem] md:text-[2rem] text-charcoal leading-[0.9] uppercase tracking-[-1.5px]">
                            {room.title.split(" ").map((word, i) => (
                                <span key={i}>
                                    {word}
                                    {i < room.title.split(" ").length - 1 && <br />}
                                </span>
                            ))}
                        </h3>
                    </div>

                    {/* Amenities */}
                    {room.amenities.length > 0 && (
                        <div className="pt-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-charcoal/60 hover:text-charcoal transition-colors"
                            >
                                Amenities
                                <motion.span animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.25 }} className="text-[0.8rem] leading-none ml-0.5">
                                    {"\u203A"}
                                </motion.span>
                            </button>
                            <motion.div
                                initial={false}
                                animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? 10 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{ overflow: "hidden" }}
                            >
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {room.amenities.map((a) => (
                                        <div key={a} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-luxury-green/30" />
                                            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-charcoal/50">{a}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-between items-end pt-1 border-t border-black/6 mt-auto">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[0.58rem] text-charcoal/35 uppercase tracking-widest">Krishna Valley, Vrindavan</span>
                            <span className="font-mono text-[0.58rem] text-charcoal/40">Starting from</span>
                            {room.originalPrice && (
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[0.78rem] line-through" style={{ color: "#b94040", opacity: 0.75 }}>{room.originalPrice}</span>
                                    <span className="font-mono text-[0.55rem] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm" style={{ background: "#2e7d4f", color: "#fff" }}>{room.discount}</span>
                                </div>
                            )}
                            <span className="font-display text-[1.7rem] text-charcoal leading-tight">
                                {room.priceLabel}
                                <span className="font-mono text-[0.58rem] text-charcoal/40 ml-1">/mo</span>
                            </span>
                        </div>
                        <div
                            className="px-4 py-2.5 rounded-[4px] font-mono text-[0.62rem] uppercase tracking-[0.15em] font-bold transition-all"
                            style={{
                                background: isSelected ? GREEN : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                                color: GOLD,
                                boxShadow: isSelected ? "0 4px 16px rgba(31,58,45,0.3)" : "0 2px 8px rgba(31,58,45,0.2)",
                            }}
                        >
                            {isSelected ? "Selected" : "Select Room"}
                        </div>
                    </div>
                    <span className="font-mono text-[0.72rem] text-charcoal/40 leading-[1.5]">Including Mess &amp; All Amenities*</span>
                </div>
            </div>
        </motion.div>
    );
}

// ── Add-on Toggle Card ───────────────────────────────────────

function AddOnCard({
    icon: Icon,
    name,
    price,
    description,
    enabled,
    onToggle,
}: {
    icon: React.ElementType;
    name: string;
    price: number;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            style={{
                flex: 1,
                padding: "20px 16px",
                borderRadius: 16,
                border: `2px solid ${enabled ? GREEN : "rgba(31,58,45,0.12)"}`,
                background: enabled ? "rgba(31,58,45,0.04)" : "#fff",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: enabled ? "0 4px 16px rgba(31,58,45,0.1)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: enabled ? "rgba(31,58,45,0.1)" : "rgba(31,58,45,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Icon size={20} color={enabled ? GREEN : "rgba(31,58,45,0.35)"} />
                    </div>
                    <div>
                        <span
                            style={{
                                fontFamily: "var(--font-body, sans-serif)",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: enabled ? GREEN : "rgba(31,58,45,0.7)",
                                display: "block",
                            }}
                        >
                            {name}
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
                </div>
                <div style={{ textAlign: "right" }}>
                    <span
                        style={{
                            fontFamily: "var(--font-display, serif)",
                            fontSize: "1.2rem",
                            color: enabled ? GREEN : "rgba(31,58,45,0.5)",
                        }}
                    >
                        ₹{price.toLocaleString()}
                    </span>
                    <span
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.55rem",
                            color: "rgba(31,58,45,0.4)",
                            display: "block",
                        }}
                    >
                        /month
                    </span>
                </div>
            </div>
            {/* Toggle indicator */}
            <div
                style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: enabled ? GREEN : "rgba(31,58,45,0.15)",
                    padding: 2,
                    transition: "background 0.25s ease",
                    alignSelf: "flex-end",
                }}
            >
                <motion.div
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: enabled ? GOLD : "#fff",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}
                />
            </div>
        </button>
    );
}

// ── Main Page ────────────────────────────────────────────────

export default function Step3Page() {
    const router = useRouter();
    const { state, updateStep3, toggleAddOn, markStepComplete, canAccessStep, getTotalCost, getAddOnsTotal } = useOnboarding();
    const { step3 } = state;
    const [error, setError] = useState("");

    if (!canAccessStep(3)) {
        router.replace("/user-onboarding/step-2");
        return null;
    }

    const handleSelectRoom = (room: RoomType) => {
        updateStep3({
            selectedRoom: {
                id: room.id,
                title: room.title,
                type: room.type,
                price: room.price,
                priceLabel: room.priceLabel,
                originalPrice: room.originalPrice,
            },
        });
        setError("");
    };

    const handleContinue = () => {
        if (!step3.selectedRoom) {
            setError("Please select a room to continue");
            return;
        }
        markStepComplete(3);
        router.push("/user-onboarding/step-4");
    };

    const totalCost = getTotalCost();
    const addOnsTotal = getAddOnsTotal();

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Home} label="Room Selection" />
                <StepTitle>Choose your room</StepTitle>
                <StepSubtitle>
                    Select the room type that best fits your lifestyle. Each room includes all amenities.
                </StepSubtitle>
            </motion.div>

            {/* Room Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                {ROOMS.map((room) => (
                    <motion.div key={room.id} variants={itemVariants}>
                        <SelectableRoomCard
                            room={room}
                            isSelected={step3.selectedRoom?.id === room.id}
                            onSelect={() => handleSelectRoom(room)}
                        />
                    </motion.div>
                ))}
            </div>

            {error && (
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#c0392b", textAlign: "center" }}>
                    {error}
                </p>
            )}

            {/* Add-on Services */}
            {step3.selectedRoom && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                    style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                    <div style={{ textAlign: "center" }}>
                        <p
                            style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.62rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.25em",
                                color: "rgba(31,58,45,0.55)",
                                fontWeight: 700,
                                marginBottom: 6,
                            }}
                        >
                            Optional Add-ons
                        </p>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "rgba(31,58,45,0.5)" }}>
                            Enhance your stay with optional services
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <AddOnCard
                            icon={Bus}
                            name="Daily Transport"
                            price={2500}
                            description="Campus shuttle service"
                            enabled={step3.addOns.find((a) => a.id === "transport")?.enabled ?? false}
                            onToggle={() => toggleAddOn("transport")}
                        />
                        <AddOnCard
                            icon={UtensilsCrossed}
                            name="Lunch Add-on"
                            price={1500}
                            description="Packed lunch delivery"
                            enabled={step3.addOns.find((a) => a.id === "lunch")?.enabled ?? false}
                            onToggle={() => toggleAddOn("lunch")}
                        />
                    </div>
                </motion.div>
            )}

            {/* Cost Summary */}
            {step3.selectedRoom && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
                        borderRadius: 16,
                        padding: "24px 28px",
                        boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
                    }}
                >
                    <p
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.25em",
                            color: "rgba(216,181,106,0.6)",
                            margin: 0,
                            marginBottom: 16,
                        }}
                    >
                        Cost Breakdown
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "rgba(246,244,239,0.6)" }}>
                                {step3.selectedRoom.title} ({step3.selectedRoom.type})
                            </span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", color: "rgba(246,244,239,0.9)" }}>
                                {step3.selectedRoom.priceLabel}/mo
                            </span>
                        </div>

                        {step3.addOns.filter((a) => a.enabled).map((addon) => (
                            <div key={addon.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem", color: "rgba(246,244,239,0.6)" }}>
                                    {addon.name}
                                </span>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem", color: "rgba(246,244,239,0.9)" }}>
                                    ₹{addon.price.toLocaleString()}/mo
                                </span>
                            </div>
                        ))}

                        <div style={{ height: 1, background: "rgba(246,244,239,0.15)", margin: "8px 0" }} />

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 500, color: "rgba(246,244,239,0.8)" }}>
                                Monthly Total
                            </span>
                            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", color: GOLD, lineHeight: 1 }}>
                                ₹{totalCost.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/step-2")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleContinue} disabled={!step3.selectedRoom}>
                    Continue to Review <ArrowRight size={16} />
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
