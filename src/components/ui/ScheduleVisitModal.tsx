"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────
interface FormState {
    fullName: string;
    mobile: string;
    email: string;
    guests: string;
}

const INITIAL_FORM: FormState = {
    fullName: "",
    mobile: "",
    email: "",
    guests: "1",
};

// ── Time Slots ───────────────────────────────────────────────
const TIME_SLOTS = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
    "7:00 PM",
    "8:00 PM",
];

// ── FOMO: Deterministic "Filling Fast" slots per day ─────────
// Uses a simple hash so all users see the same red slots for a
// given date, but different slots each day.
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + ch;
        hash |= 0; // Convert to 32-bit int
    }
    return Math.abs(hash);
}

function getFomoSlotIndices(dateStr: string): Set<number> {
    const seed = hashCode(dateStr + "viramah-fomo-2026");
    // Pick 3 or 4 indices from 0..11
    const count = 3 + (seed % 2); // 3 or 4
    const indices = new Set<number>();
    let s = seed;
    while (indices.size < count) {
        s = hashCode(String(s) + "slot");
        indices.add(s % TIME_SLOTS.length);
    }
    return indices;
}

// ── Date helpers ─────────────────────────────────────────────
const START_DATE = new Date(2026, 2, 27); // March 27, 2026
const DAYS_AHEAD = 14;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getAvailableDates(): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveStart = today > START_DATE ? today : START_DATE;
    const dates: Date[] = [];
    for (let i = 0; i < DAYS_AHEAD; i++) {
        const d = new Date(effectiveStart);
        d.setDate(effectiveStart.getDate() + i);
        dates.push(d);
    }
    return dates;
}

// ── Animation Variants ───────────────────────────────────────
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.18 } },
};

const panelVariants = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
    exit: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
    },
};

// ── Styles ────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.3em",
    color: "#6b5526",
    fontWeight: 700,
};

const inputStyle = (focused: boolean): React.CSSProperties => ({
    background: "transparent",
    border: "none",
    borderBottom: focused ? "1.5px solid #b5934a" : "1px solid rgba(45,43,40,0.2)",
    padding: "6px 0",
    paddingLeft: focused ? 8 : 0,
    fontFamily: "var(--font-body, sans-serif)",
    fontSize: "1rem",
    color: "#2d2b28",
    outline: "none",
    transition: "all 0.3s ease",
    width: "100%",
});

// ── Main Component ───────────────────────────────────────────
export function ScheduleVisitModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);
    const dateScrollRef = useRef<HTMLDivElement>(null);

    const dates = getAvailableDates();
    const fomoSlots = selectedDate ? getFomoSlotIndices(selectedDate) : new Set<number>();

    // Global open trigger + Escape key
    useEffect(() => {
        const onOpen = () => {
            setIsOpen(true);
            setStep(1);
            setSelectedDate("");
            setSelectedSlot("");
            setForm(INITIAL_FORM);
            setIsSubmitted(false);
            setIsDuplicate(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("viramah:open-schedule-visit", onOpen);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("viramah:open-schedule-visit", onOpen);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpen]);

    // Focus first input when entering step 3
    useEffect(() => {
        if (step === 3 && isOpen) {
            const t = setTimeout(() => firstInputRef.current?.focus(), 300);
            return () => clearTimeout(t);
        }
    }, [step, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsDuplicate(false);

        try {
            const response = await fetch("/api/schedule-visit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    visitDate: selectedDate,
                    timeSlot: selectedSlot,
                }),
            });

            const result = await response.json();

            // ── Duplicate check (409) ─────────────────────────────
            if (response.status === 409 && result.duplicate) {
                setIsSubmitting(false);
                setIsDuplicate(true);
                setIsSubmitted(true);

                setTimeout(() => {
                    setIsSubmitted(false);
                    setIsDuplicate(false);
                    setIsOpen(false);
                }, 6000);
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Something went wrong.");
            }

            setIsSubmitting(false);
            setIsSubmitted(true);

            setTimeout(() => {
                setIsSubmitted(false);
                setIsOpen(false);
            }, 4000);
        } catch (error) {
            console.error("Schedule visit failed:", error);
            setIsSubmitting(false);
            alert(
                (error instanceof Error ? error.message : "Something went wrong.") +
                "\nOr call us directly: +91 8679001662"
            );
        }
    };

    const rivets = ["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"];

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="sv-backdrop"
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed inset-0 z-[999]"
                        style={{
                            background: "rgba(10, 20, 15, 0.8)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            cursor: "pointer",
                        }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Centered Modal */}
                    <div
                        className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                        style={{ pointerEvents: "none" }}
                    >
                        <motion.aside
                            key="sv-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Schedule a Visit"
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{
                                width: "min(540px, 100%)",
                                maxHeight: "92vh",
                                background: "#e8e2d6",
                                boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(181,147,74,0.15)",
                                overflowY: "auto",
                                borderRadius: 4,
                                pointerEvents: "all",
                                position: "relative",
                            }}
                        >
                            {/* Grain texture */}
                            <div
                                aria-hidden="true"
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    pointerEvents: "none",
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                                    opacity: 0.12,
                                    zIndex: 0,
                                }}
                            />

                            {/* Brass corner rivets */}
                            {rivets.map((pos, i) => (
                                <div
                                    key={i}
                                    aria-hidden="true"
                                    className={`absolute ${pos} w-3 h-3 rounded-full z-10`}
                                    style={{
                                        background: "radial-gradient(circle at 30% 30%, #e2c07d, #b5934a, #6b5526)",
                                        boxShadow: "1px 2px 4px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(0,0,0,0.3)",
                                    }}
                                />
                            ))}

                            {/* Panel Content */}
                            <div className="relative z-10 flex flex-col p-6 md:p-8">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        {!isSubmitted && (
                                            <>
                                                <h2
                                                    style={{
                                                        fontFamily: "var(--font-display, serif)",
                                                        fontSize: "clamp(1.5rem, 6vw, 2.2rem)",
                                                        color: "#2d2b28",
                                                        lineHeight: 1.1,
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Schedule a Visit
                                                </h2>
                                                <p
                                                    style={{
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontSize: "0.65rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.2em",
                                                        color: "#6b5526",
                                                        marginTop: "0.5rem",
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    {step === 1
                                                        ? "Step 1 — Pick a Date"
                                                        : step === 2
                                                            ? "Step 2 — Choose a Time Slot"
                                                            : "Step 3 — Your Details"}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Close button */}
                                    <motion.button
                                        onClick={() => setIsOpen(false)}
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        aria-label="Close schedule visit"
                                        style={{
                                            background: "transparent",
                                            border: "1px solid rgba(107,85,38,0.3)",
                                            borderRadius: "50%",
                                            width: 36,
                                            height: 36,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "#6b5526",
                                            flexShrink: 0,
                                            marginLeft: 16,
                                        }}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </motion.button>
                                </div>

                                {/* Progress Steps */}
                                {!isSubmitted && (
                                    <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
                                        {[1, 2, 3].map((s) => (
                                            <div
                                                key={s}
                                                style={{
                                                    flex: 1,
                                                    height: 3,
                                                    borderRadius: 2,
                                                    background: s <= step ? "#D8B56A" : "rgba(45,43,40,0.12)",
                                                    transition: "background 0.3s ease",
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <AnimatePresence mode="wait">
                                    {isSubmitted ? (
                                        /* ── Success State ── */
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "3rem 1rem",
                                                gap: "1.5rem",
                                                textAlign: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: "50%",
                                                    background: isDuplicate ? "#7C5C1A" : "#1F3A2D",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {isDuplicate ? (
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D8B56A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                                        <polyline points="22,6 12,13 2,6" />
                                                    </svg>
                                                ) : (
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D8B56A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                            <h3
                                                style={{
                                                    fontFamily: "var(--font-display, serif)",
                                                    fontSize: "1.8rem",
                                                    color: "#2d2b28",
                                                    fontWeight: 400,
                                                }}
                                            >
                                                {isDuplicate ? "Already Scheduled!" : "Visit Scheduled!"}
                                            </h3>
                                            <p
                                                style={{
                                                    fontFamily: "var(--font-body, sans-serif)",
                                                    fontSize: "0.9rem",
                                                    color: "rgba(45,43,40,0.6)",
                                                    maxWidth: 280,
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {isDuplicate ? (
                                                    <>We already have your visit scheduled for this date. Check your email for confirmation or call us to modify.</>
                                                ) : (
                                                    <>Our team will confirm your visit shortly. We look forward to welcoming you to Viramah.</>
                                                )}
                                            </p>
                                            <div
                                                style={{
                                                    fontFamily: "var(--font-mono, monospace)",
                                                    fontSize: "0.7rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.15em",
                                                    color: "#6b5526",
                                                    background: "rgba(216,181,106,0.15)",
                                                    padding: "8px 16px",
                                                    borderRadius: 2,
                                                }}
                                            >
                                                {selectedDate} — {selectedSlot}
                                            </div>
                                        </motion.div>
                                    ) : step === 1 ? (
                                        /* ── Step 1: Date Selection ── */
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <p style={{
                                                ...labelStyle,
                                                marginBottom: 12,
                                            }}>
                                                Select your preferred date
                                            </p>

                                            <div
                                                ref={dateScrollRef}
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    overflowX: "auto",
                                                    paddingBottom: 12,
                                                    scrollSnapType: "x mandatory",
                                                    WebkitOverflowScrolling: "touch",
                                                    msOverflowStyle: "none",
                                                    scrollbarWidth: "none",
                                                }}
                                            >
                                                {dates.map((d) => {
                                                    const ds = getDateString(d);
                                                    const isSelected = selectedDate === ds;
                                                    const isToday = getDateString(new Date()) === ds;
                                                    return (
                                                        <button
                                                            key={ds}
                                                            onClick={() => {
                                                                setSelectedDate(ds);
                                                                setSelectedSlot("");
                                                            }}
                                                            style={{
                                                                scrollSnapAlign: "start",
                                                                flexShrink: 0,
                                                                width: 76,
                                                                padding: "14px 8px",
                                                                borderRadius: 4,
                                                                border: isSelected
                                                                    ? "1.5px solid #D8B56A"
                                                                    : "1px solid rgba(45,43,40,0.12)",
                                                                background: isSelected
                                                                    ? "linear-gradient(135deg, #1F3A2D, #2a4d3a)"
                                                                    : "rgba(255,255,255,0.5)",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontFamily: "var(--font-mono, monospace)",
                                                                    fontSize: "0.55rem",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.2em",
                                                                    color: isSelected ? "#D8B56A" : "rgba(45,43,40,0.5)",
                                                                }}
                                                            >
                                                                {DAY_NAMES[d.getDay()]}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontFamily: "var(--font-display, serif)",
                                                                    fontSize: "1.5rem",
                                                                    color: isSelected ? "#F6F4EF" : "#2d2b28",
                                                                    lineHeight: 1,
                                                                }}
                                                            >
                                                                {d.getDate()}
                                                            </span>
                                                            <span
                                                                style={{
                                                                    fontFamily: "var(--font-mono, monospace)",
                                                                    fontSize: "0.55rem",
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: "0.15em",
                                                                    color: isSelected ? "rgba(246,244,239,0.7)" : "rgba(45,43,40,0.4)",
                                                                }}
                                                            >
                                                                {MONTH_NAMES[d.getMonth()]}
                                                            </span>
                                                            {isToday && (
                                                                <span
                                                                    style={{
                                                                        fontFamily: "var(--font-mono, monospace)",
                                                                        fontSize: "0.5rem",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.1em",
                                                                        color: "#D8B56A",
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    Today
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => selectedDate && setStep(2)}
                                                disabled={!selectedDate}
                                                style={{
                                                    width: "100%",
                                                    marginTop: 20,
                                                    padding: "14px 28px",
                                                    background: selectedDate ? "#1F3A2D" : "rgba(45,43,40,0.1)",
                                                    color: selectedDate ? "#D8B56A" : "rgba(45,43,40,0.3)",
                                                    border: "none",
                                                    fontFamily: "var(--font-mono, monospace)",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.2em",
                                                    fontSize: "0.7rem",
                                                    cursor: selectedDate ? "pointer" : "not-allowed",
                                                    transition: "all 0.3s ease",
                                                    boxShadow: selectedDate ? "4px 4px 0px #6b5526" : "none",
                                                }}
                                            >
                                                Continue →
                                            </button>
                                        </motion.div>
                                    ) : step === 2 ? (
                                        /* ── Step 2: Time Slot Grid ── */
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                                <p style={labelStyle}>
                                                    Available time slots
                                                </p>
                                                <button
                                                    onClick={() => setStep(1)}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontSize: "0.6rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.15em",
                                                        color: "#6b5526",
                                                        cursor: "pointer",
                                                        textDecoration: "underline",
                                                        textUnderlineOffset: 3,
                                                    }}
                                                >
                                                    ← Change Date
                                                </button>
                                            </div>

                                            {/* Selected date badge */}
                                            <div
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    background: "rgba(216,181,106,0.12)",
                                                    padding: "6px 12px",
                                                    borderRadius: 2,
                                                    marginBottom: 16,
                                                    fontFamily: "var(--font-mono, monospace)",
                                                    fontSize: "0.65rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.15em",
                                                    color: "#6b5526",
                                                }}
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                    <line x1="16" y1="2" x2="16" y2="6" />
                                                    <line x1="8" y1="2" x2="8" y2="6" />
                                                    <line x1="3" y1="10" x2="21" y2="10" />
                                                </svg>
                                                {selectedDate}
                                            </div>

                                            {/* Slots Grid */}
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(3, 1fr)",
                                                    gap: 10,
                                                    marginBottom: 20,
                                                }}
                                            >
                                                {TIME_SLOTS.map((slot, i) => {
                                                    const isFomo = fomoSlots.has(i);
                                                    const isSelected = selectedSlot === slot;

                                                    return (
                                                        <button
                                                            key={slot}
                                                            disabled={isFomo}
                                                            onClick={() => !isFomo && setSelectedSlot(slot)}
                                                            style={{
                                                                padding: "12px 8px",
                                                                borderRadius: 3,
                                                                border: isFomo
                                                                    ? "1px solid rgba(185, 64, 64, 0.3)"
                                                                    : isSelected
                                                                        ? "1.5px solid #D8B56A"
                                                                        : "1px solid rgba(45,43,40,0.12)",
                                                                background: isFomo
                                                                    ? "rgba(185, 64, 64, 0.08)"
                                                                    : isSelected
                                                                        ? "linear-gradient(135deg, #1F3A2D, #2a4d3a)"
                                                                        : "rgba(255,255,255,0.5)",
                                                                cursor: isFomo ? "not-allowed" : "pointer",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: 4,
                                                                transition: "all 0.2s ease",
                                                                position: "relative",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontFamily: "var(--font-mono, monospace)",
                                                                    fontSize: "0.75rem",
                                                                    fontWeight: 600,
                                                                    color: isFomo
                                                                        ? "#b94040"
                                                                        : isSelected
                                                                            ? "#D8B56A"
                                                                            : "#2d2b28",
                                                                    letterSpacing: "0.05em",
                                                                }}
                                                            >
                                                                {slot}
                                                            </span>

                                                            {isFomo ? (
                                                                <span
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 4,
                                                                        fontFamily: "var(--font-mono, monospace)",
                                                                        fontSize: "0.5rem",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.12em",
                                                                        color: "#b94040",
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {/* Pulsing red dot */}
                                                                    <motion.span
                                                                        animate={{
                                                                            scale: [1, 1.4, 1],
                                                                            opacity: [1, 0.6, 1],
                                                                        }}
                                                                        transition={{
                                                                            duration: 1.5,
                                                                            repeat: Infinity,
                                                                            ease: "easeInOut",
                                                                        }}
                                                                        style={{
                                                                            width: 5,
                                                                            height: 5,
                                                                            borderRadius: "50%",
                                                                            background: "#b94040",
                                                                            display: "inline-block",
                                                                        }}
                                                                    />
                                                                    Filling Fast
                                                                </span>
                                                            ) : isSelected ? (
                                                                <span
                                                                    style={{
                                                                        fontFamily: "var(--font-mono, monospace)",
                                                                        fontSize: "0.5rem",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.12em",
                                                                        color: "rgba(246,244,239,0.6)",
                                                                    }}
                                                                >
                                                                    Selected
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        fontFamily: "var(--font-mono, monospace)",
                                                                        fontSize: "0.5rem",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.12em",
                                                                        color: "rgba(45,43,40,0.35)",
                                                                    }}
                                                                >
                                                                    Available
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Legend */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 16,
                                                    marginBottom: 20,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                {[
                                                    { color: "rgba(45,43,40,0.15)", label: "Available" },
                                                    { color: "#D8B56A", label: "Selected" },
                                                    { color: "#b94040", label: "Filling Fast" },
                                                ].map(({ color, label }) => (
                                                    <div
                                                        key={label}
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            fontFamily: "var(--font-mono, monospace)",
                                                            fontSize: "0.55rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.15em",
                                                            color: "rgba(45,43,40,0.5)",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: 2,
                                                                background: color,
                                                                display: "inline-block",
                                                            }}
                                                        />
                                                        {label}
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => selectedSlot && setStep(3)}
                                                disabled={!selectedSlot}
                                                style={{
                                                    width: "100%",
                                                    padding: "14px 28px",
                                                    background: selectedSlot ? "#1F3A2D" : "rgba(45,43,40,0.1)",
                                                    color: selectedSlot ? "#D8B56A" : "rgba(45,43,40,0.3)",
                                                    border: "none",
                                                    fontFamily: "var(--font-mono, monospace)",
                                                    fontWeight: 700,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.2em",
                                                    fontSize: "0.7rem",
                                                    cursor: selectedSlot ? "pointer" : "not-allowed",
                                                    transition: "all 0.3s ease",
                                                    boxShadow: selectedSlot ? "4px 4px 0px #6b5526" : "none",
                                                }}
                                            >
                                                Continue →
                                            </button>
                                        </motion.div>
                                    ) : (
                                        /* ── Step 3: User Details Form ── */
                                        <motion.div
                                            key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                                <p style={labelStyle}>
                                                    Your details
                                                </p>
                                                <button
                                                    onClick={() => setStep(2)}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontSize: "0.6rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.15em",
                                                        color: "#6b5526",
                                                        cursor: "pointer",
                                                        textDecoration: "underline",
                                                        textUnderlineOffset: 3,
                                                    }}
                                                >
                                                    ← Change Slot
                                                </button>
                                            </div>

                                            {/* Selected date + time badge */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    marginBottom: 20,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontSize: "0.6rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.12em",
                                                        color: "#6b5526",
                                                        background: "rgba(216,181,106,0.12)",
                                                        padding: "5px 10px",
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    📅 {selectedDate}
                                                </span>
                                                <span
                                                    style={{
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontSize: "0.6rem",
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.12em",
                                                        color: "#6b5526",
                                                        background: "rgba(216,181,106,0.12)",
                                                        padding: "5px 10px",
                                                        borderRadius: 2,
                                                    }}
                                                >
                                                    🕐 {selectedSlot}
                                                </span>
                                            </div>

                                            <form onSubmit={handleSubmit}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
                                                    {/* Full Name */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <label style={labelStyle}>Full Name</label>
                                                        <input
                                                            ref={firstInputRef}
                                                            type="text"
                                                            required
                                                            minLength={2}
                                                            value={form.fullName}
                                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                            onFocus={() => setFocusedField("fullName")}
                                                            onBlur={() => setFocusedField(null)}
                                                            placeholder="Your full name"
                                                            style={inputStyle(focusedField === "fullName")}
                                                        />
                                                    </div>

                                                    {/* Mobile */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <label style={labelStyle}>Mobile Number</label>
                                                        <input
                                                            type="tel"
                                                            required
                                                            minLength={7}
                                                            value={form.mobile}
                                                            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                                            onFocus={() => setFocusedField("mobile")}
                                                            onBlur={() => setFocusedField(null)}
                                                            placeholder="+91 XXXXX XXXXX"
                                                            style={inputStyle(focusedField === "mobile")}
                                                        />
                                                    </div>

                                                    {/* Email */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <label style={labelStyle}>Email Address</label>
                                                        <input
                                                            type="email"
                                                            required
                                                            value={form.email}
                                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                            onFocus={() => setFocusedField("email")}
                                                            onBlur={() => setFocusedField(null)}
                                                            placeholder="you@email.com"
                                                            style={inputStyle(focusedField === "email")}
                                                        />
                                                    </div>

                                                    {/* Guests */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <label style={labelStyle}>Number of Visitors</label>
                                                        <select
                                                            value={form.guests}
                                                            onChange={(e) => setForm({ ...form, guests: e.target.value })}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                borderBottom: "1px solid rgba(45,43,40,0.2)",
                                                                padding: "6px 0",
                                                                fontFamily: "var(--font-body, sans-serif)",
                                                                fontSize: "1rem",
                                                                color: "#2d2b28",
                                                                outline: "none",
                                                                cursor: "pointer",
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <option value="1">1 Person</option>
                                                            <option value="2">2 People</option>
                                                            <option value="3">3 People</option>
                                                            <option value="4">4 People</option>
                                                            <option value="5">5+ People</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Submit */}
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    style={{
                                                        width: "100%",
                                                        padding: "14px 28px",
                                                        background: isSubmitting ? "#2d2b28" : "#1F3A2D",
                                                        color: "#D8B56A",
                                                        border: "none",
                                                        fontFamily: "var(--font-mono, monospace)",
                                                        fontWeight: 700,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.2em",
                                                        fontSize: "0.7rem",
                                                        cursor: isSubmitting ? "wait" : "pointer",
                                                        transition: "all 0.3s ease",
                                                        boxShadow: isSubmitting ? "none" : "4px 4px 0px #6b5526",
                                                        opacity: isSubmitting ? 0.8 : 1,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        gap: 10,
                                                    }}
                                                >
                                                    {isSubmitting ? (
                                                        <span className="animate-pulse">Scheduling...</span>
                                                    ) : (
                                                        "Schedule My Visit"
                                                    )}
                                                </button>
                                            </form>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.aside>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
