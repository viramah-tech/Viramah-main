"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Lock } from "lucide-react";

const BOOKING_STEPS = [
    { id: 1, label: "Identity", description: "KYC Verification" },
    { id: 2, label: "Emergency", description: "Contact Info" },
    { id: 3, label: "Room", description: "Select Room" },
    { id: 4, label: "Preferences", description: "Room Setup" },
    { id: 5, label: "Confirm", description: "Review" },
];

function getStepFromPath(pathname: string): number {
    if (pathname.includes("step-1")) return 1;
    if (pathname.includes("step-2")) return 2;
    if (pathname.includes("step-3")) return 3;
    if (pathname.includes("step-4")) return 4;
    if (pathname.includes("confirm")) return 5;
    return 1;
}

// Compact stepper for scrolled state
function CompactStepper({ steps, currentStep }: { steps: typeof BOOKING_STEPS; currentStep: number }) {
    return (
        <div className="flex items-center gap-2">
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.65rem",
                                fontFamily: "var(--font-mono, monospace)",
                                fontWeight: 700,
                                transition: "all 0.3s",
                                background: isCompleted
                                    ? "#1F3A2D"
                                    : isActive
                                        ? "#fff"
                                        : "rgba(31,58,45,0.06)",
                                border: isActive
                                    ? "2px solid #1F3A2D"
                                    : isCompleted
                                        ? "2px solid #1F3A2D"
                                        : "2px solid rgba(31,58,45,0.15)",
                                color: isCompleted ? "#D8B56A" : isActive ? "#1F3A2D" : "rgba(31,58,45,0.3)",
                            }}
                        >
                            {isCompleted ? <Check size={12} strokeWidth={2.5} /> : step.id}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                style={{
                                    width: 16,
                                    height: 2,
                                    margin: "0 4px",
                                    background: isCompleted ? "#1F3A2D" : "rgba(31,58,45,0.12)",
                                    transition: "background 0.3s",
                                }}
                            />
                        )}
                    </div>
                );
            })}
            <span
                style={{
                    marginLeft: 10,
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.65rem",
                    color: "#1F3A2D",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                }}
                className="hidden sm:block"
            >
                {steps.find((s) => s.id === currentStep)?.label}
            </span>
        </div>
    );
}

// Full expanded stepper
function ExpandedStepper({ steps, currentStep }: { steps: typeof BOOKING_STEPS; currentStep: number }) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Track background */}
                <div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "rgba(31,58,45,0.1)",
                        zIndex: 0,
                    }}
                />
                {/* Track fill */}
                <motion.div
                    style={{
                        position: "absolute",
                        top: 16,
                        left: 0,
                        height: 2,
                        background: "linear-gradient(90deg, #1F3A2D, #D8B56A)",
                        zIndex: 0,
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            {/* BG mask */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    width: 40,
                                    height: 40,
                                    borderRadius: "50%",
                                    background: "#F6F4EF",
                                }}
                            />
                            <motion.div
                                style={{
                                    position: "relative",
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "2px solid",
                                    borderColor: isCompleted
                                        ? "#1F3A2D"
                                        : isActive
                                            ? "#1F3A2D"
                                            : "rgba(31,58,45,0.2)",
                                    background: isCompleted
                                        ? "#1F3A2D"
                                        : isActive
                                            ? "#fff"
                                            : "#F6F4EF",
                                    boxShadow: isActive
                                        ? "0 0 0 4px rgba(31,58,45,0.1), 0 4px 12px rgba(31,58,45,0.15)"
                                        : "none",
                                    transition: "all 0.3s",
                                }}
                                initial={{ scale: 0.85 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                {isCompleted ? (
                                    <Check size={14} color="#D8B56A" strokeWidth={2.5} />
                                ) : (
                                    <span
                                        style={{
                                            fontFamily: "var(--font-mono, monospace)",
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            color: isActive ? "#1F3A2D" : "rgba(31,58,45,0.3)",
                                        }}
                                    >
                                        {step.id}
                                    </span>
                                )}
                            </motion.div>

                            <div className="mt-2 text-center">
                                <span
                                    style={{
                                        fontFamily: "var(--font-body, sans-serif)",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        display: "block",
                                        color: isActive
                                            ? "#1F3A2D"
                                            : isCompleted
                                                ? "#1F3A2D"
                                                : "rgba(31,58,45,0.35)",
                                    }}
                                >
                                    {step.label}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.55rem",
                                        color: "rgba(31,58,45,0.35)",
                                        display: "block",
                                    }}
                                >
                                    {step.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function RoomBookingLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const currentStep = getStepFromPath(pathname);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(scrolled);
            if (scrolled && isExpanded) setIsExpanded(false);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isExpanded]);

    useEffect(() => {
        setIsExpanded(true);
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div
            style={{ minHeight: "100vh", background: "#F6F4EF" }}
        >
            {/* Header */}
            <motion.header
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 40,
                    background: "rgba(246,244,239,0.92)",
                    backdropFilter: "blur(16px)",
                    borderBottom: "1px solid rgba(31,58,45,0.1)",
                    boxShadow: "0 2px 20px rgba(31,58,45,0.06)",
                }}
                initial={false}
                animate={{
                    paddingTop: isScrolled && !isExpanded ? 8 : 16,
                    paddingBottom: isScrolled && !isExpanded ? 8 : 16,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
                    <div className="flex items-center justify-between">
                        {/* Back link */}
                        <Link
                            href="/"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "rgba(31,58,45,0.5)",
                                textDecoration: "none",
                                transition: "color 0.2s",
                            }}
                            className="hover:text-[#1F3A2D]"
                        >
                            <ArrowLeft size={16} />
                            <span
                                style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.6rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.2em",
                                }}
                                className="hidden sm:block"
                            >
                                Back to Home
                            </span>
                        </Link>

                        {/* Compact stepper when scrolled */}
                        <AnimatePresence mode="wait">
                            {isScrolled && !isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex-1 flex justify-center"
                                >
                                    <CompactStepper steps={BOOKING_STEPS} currentStep={currentStep} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Right: logo + toggle */}
                        <div className="flex items-center gap-3">
                            {isScrolled && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    style={{
                                        padding: "6px 8px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(31,58,45,0.15)",
                                        background: "none",
                                        cursor: "pointer",
                                        color: "rgba(31,58,45,0.5)",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                    title={isExpanded ? "Minimize" : "Expand"}
                                >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            )}
                            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                <div style={{ width: 32, height: 32 }}>
                                    <img src="/logo.png" alt="Viramah Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                </div>
                                <span
                                    style={{
                                        fontFamily: "var(--font-display, serif)",
                                        fontSize: "1rem",
                                        color: "#1F3A2D",
                                        letterSpacing: "0.05em",
                                    }}
                                    className="hidden sm:block"
                                >
                                    VIRAMAH
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Expanded stepper */}
                    <AnimatePresence>
                        {(!isScrolled || isExpanded) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 24 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                style={{ overflow: "visible" }}
                            >
                                <ExpandedStepper steps={BOOKING_STEPS} currentStep={currentStep} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* Main Content */}
            <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 100px" }}>
                {children}
            </main>

            {/* Footer bar */}
            <footer
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(246,244,239,0.92)",
                    backdropFilter: "blur(16px)",
                    borderTop: "1px solid rgba(31,58,45,0.1)",
                    padding: "10px 24px",
                    zIndex: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    maxWidth: "100%",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Lock size={11} color="rgba(31,58,45,0.4)" />
                    <span
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            color: "rgba(31,58,45,0.4)",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Your data is encrypted and secure
                    </span>
                </div>
                <span
                    style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.6rem",
                        color: "rgba(31,58,45,0.4)",
                        letterSpacing: "0.1em",
                    }}
                >
                    Step {currentStep} of 5
                </span>
            </footer>
        </div>
    );
}
