"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";

const BOOKING_STEPS = [
    { id: 1, label: "Agreements", description: "Terms & Policies" },
    { id: 2, label: "Identity", description: "Personal Details" },
    { id: 3, label: "Guardian", description: "Contact Info" },
    { id: 4, label: "Room", description: "Select & Add-ons" },
    { id: 5, label: "Review", description: "Verify Details" },
];

/** UI step number (for the visual stepper). Post-review flows render without the stepper. */
function getStepFromPath(pathname: string): number {
    if (pathname.includes("/terms")) return 1;
    if (pathname.includes("/step-1")) return 2;
    if (pathname.includes("/step-2")) return 3;
    if (pathname.includes("/step-3")) return 4;
    if (pathname.includes("/step-4")) return 5;
    if (pathname.includes("/confirm")) return 5;
    if (pathname.includes("/deposit")) return 6;            // booking payment (post-stepper)
    if (pathname.includes("/payment-breakdown")) return 7;  // final payment
    if (pathname.includes("/payment-status")) return 8;     // post-flow
    return 1;
}

// Compact stepper for scrolled state
function CompactStepper({ steps, currentStep }: { steps: typeof BOOKING_STEPS; currentStep: number }) {
    return (
        <div className="flex items-center gap-1 sm:gap-2">
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                return (
                    <div key={step.id} className="flex items-center">
                        <div
                            className="w-5 h-5 sm:w-7 sm:h-7 text-[0.55rem] sm:text-[0.65rem]"
                            style={{
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
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
                            {isCompleted ? <Check size={12} className="w-2.5 h-2.5 sm:w-3 sm:h-3" strokeWidth={2.5} /> : step.id}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className="w-2 sm:w-4 mx-0.5 sm:mx-1"
                                style={{
                                    height: 2,
                                    background: isCompleted ? "#1F3A2D" : "rgba(31,58,45,0.12)",
                                    transition: "background 0.3s",
                                }}
                            />
                        )}
                    </div>
                );
            })}
            <span
                className="ml-1 sm:ml-2.5 text-[0.6rem] sm:text-[0.65rem] tracking-widest uppercase font-mono text-[#1F3A2D] truncate max-w-[80px] sm:max-w-none"
            >
                {steps.find((s) => s.id === currentStep)?.label}
            </span>
        </div>
    );
}

// Full expanded stepper
function ExpandedStepper({ steps, currentStep }: { steps: typeof BOOKING_STEPS; currentStep: number }) {
    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    position: "relative",
                    flexWrap: "nowrap",
                }}
            >
                {/* Track background */}
                <div
                    className="top-3 sm:top-4"
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "rgba(31,58,45,0.1)",
                        zIndex: 0,
                    }}
                />
                {/* Track fill */}
                <motion.div
                    className="top-3 sm:top-4"
                    style={{
                        position: "absolute",
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
                        <div
                            key={step.id}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                                zIndex: 10,
                                flex: "1 1 0",
                                minWidth: 0,
                            }}
                        >
                            {/* BG mask */}
                            <div
                                className="w-8 h-8 sm:w-10 sm:h-10"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    borderRadius: "50%",
                                    background: "#F6F4EF",
                                }}
                            />
                            <motion.div
                                className="w-6 h-6 sm:w-8 sm:h-8"
                                style={{
                                    position: "relative",
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
                                    flexShrink: 0,
                                }}
                                initial={{ scale: 0.85 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                {isCompleted ? (
                                    <Check size={14} className="w-3 h-3 sm:w-3.5 sm:h-3.5" color="#D8B56A" strokeWidth={2.5} />
                                ) : (
                                    <span
                                        className="text-[0.5rem] sm:text-[0.65rem]"
                                        style={{
                                            fontFamily: "var(--font-mono, monospace)",
                                            fontWeight: 700,
                                            color: isActive ? "#1F3A2D" : "rgba(31,58,45,0.3)",
                                        }}
                                    >
                                        {step.id}
                                    </span>
                                )}
                            </motion.div>

                            <div className="mt-2 text-center px-0 sm:px-1">
                                <span
                                    className="block text-[9px] sm:text-[11px] md:text-[12px] whitespace-normal sm:whitespace-nowrap leading-[1.1] sm:leading-tight break-words"
                                    style={{
                                        fontFamily: "var(--font-body, sans-serif)",
                                        fontWeight: 600,
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
                                    className="hidden sm:block mt-0.5"
                                    style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.55rem",
                                        color: "rgba(31,58,45,0.35)",
                                        whiteSpace: "nowrap",
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
    const router = useRouter();
    const { loading, isAuthenticated } = useAuth();
    const uiStep = getStepFromPath(pathname);
    const isPostFlow = uiStep >= 6; // deposit, payment-breakdown, payment-status
    const [isScrolled, setIsScrolled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    // Keep only auth guard; page-to-page onboarding navigation remains unrestricted.
    useEffect(() => {
        if (loading) return;
        if (!isAuthenticated) {
            router.replace("/login");
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY;
                    setIsScrolled((prev) => {
                        const isScrolledNow = prev ? y > 10 : y > 50;
                        if (isScrolledNow && isExpanded) setIsExpanded(false);
                        return isScrolledNow;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isExpanded]);

    // Reset stepper expansion on route change (prev-state pattern — see React docs: "Storing info from previous renders")
    const [prevPathname, setPrevPathname] = useState(pathname);
    if (prevPathname !== pathname) {
        setPrevPathname(pathname);
        setIsExpanded(true);
    }
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#F6F4EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(31,58,45,0.5)" }}>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <OnboardingProvider>
        <div
            style={{ minHeight: "100vh", background: "#F6F4EF" }}
        >
            {/* Header */}
            <motion.header
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
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
                <div className="px-3 sm:px-6" style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div className="flex items-center justify-between relative">
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
                            className="hover:text-[#1F3A2D] z-10"
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
                        <AnimatePresence>
                            {!isPostFlow && isScrolled && !isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 0.25 } }}
                                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15, delay: 0 } }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
                                >
                                    <CompactStepper steps={BOOKING_STEPS} currentStep={uiStep} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Right: logo + toggle */}
                        <div className="flex items-center gap-3 z-10">
                            {!isPostFlow && isScrolled && (
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
                                    { }
                                    <Image src="/logo.png" alt="Viramah Logo" width={32} height={32} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
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

                    {/* Expanded stepper (terms pre-step + main 5 steps) */}
                    <AnimatePresence>
                        {!isPostFlow && (!isScrolled || isExpanded) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 24, transition: { duration: 0.35, delay: 0.15, ease: "easeOut" } }}
                                exit={{ height: 0, opacity: 0, marginTop: 0, transition: { duration: 0.25, delay: 0, ease: "easeIn" } }}
                                style={{ overflow: "hidden" }}
                            >
                                <ExpandedStepper steps={BOOKING_STEPS} currentStep={uiStep} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="px-4 sm:px-6" style={{ maxWidth: 760, margin: "0 auto", paddingTop: isPostFlow ? 80 : 180, paddingBottom: 100 }}>
                {children}
            </main>

            {/* Footer bar */}
            <footer
                className="px-4 sm:px-6"
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(246,244,239,0.92)",
                    backdropFilter: "blur(16px)",
                    borderTop: "1px solid rgba(31,58,45,0.1)",
                    paddingTop: 10,
                    paddingBottom: 10,
                    zIndex: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    maxWidth: "100%",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Lock size={11} className="w-2.5 sm:w-3 h-2.5 sm:h-3" color="rgba(31,58,45,0.4)" />
                    <span
                        className="text-[9px] sm:text-[10px] tracking-tight sm:tracking-widest"
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            color: "rgba(31,58,45,0.4)",
                        }}
                    >
                        Your data is encrypted and secure
                    </span>
                </div>
                <span
                    className="text-[9px] sm:text-[10px] tracking-tight sm:tracking-[0.1em] whitespace-nowrap ml-2"
                    style={{
                        fontFamily: "var(--font-mono, monospace)",
                        color: "rgba(31,58,45,0.4)",
                    }}
                >
                    {isPostFlow ? "Booking Submitted" : `Step ${uiStep} of 5`}
                </span>
            </footer>
        </div>
        </OnboardingProvider>
    );
}
