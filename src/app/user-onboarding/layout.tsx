"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";

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
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-all ${isCompleted
                                ? "bg-terracotta-raw text-white"
                                : isActive
                                    ? "bg-white border-2 border-terracotta-raw text-terracotta-raw shadow-sm"
                                    : "bg-sand-light border border-sand-dark text-charcoal/40"
                                }`}
                        >
                            {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.id}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-4 h-[2px] mx-1 ${isCompleted ? "bg-terracotta-raw" : "bg-sand-dark"
                                }`} />
                        )}
                    </div>
                );
            })}
            <span className="ml-3 font-mono text-xs text-charcoal/60 hidden sm:block">
                {steps.find(s => s.id === currentStep)?.label}
            </span>
        </div>
    );
}

// Full expanded stepper
function ExpandedStepper({ steps, currentStep }: { steps: typeof BOOKING_STEPS; currentStep: number }) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-4 left-0 right-0 h-[2px] bg-sand-dark z-0" />

                {/* Progress Line Fill */}
                <motion.div
                    className="absolute top-4 left-0 h-[2px] bg-terracotta-raw z-0"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            {/* Background mask to cover the line */}
                            <div className="absolute top-0 w-10 h-10 rounded-full bg-ivory" />

                            {/* Circle */}
                            <motion.div
                                className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isCompleted
                                    ? "bg-terracotta-raw border-terracotta-raw"
                                    : isActive
                                        ? "bg-ivory border-terracotta-raw shadow-md shadow-terracotta-raw/20"
                                        : "bg-ivory border-sand-dark"
                                    }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isActive ? 1.05 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4 text-white" />
                                ) : (
                                    <span className={`font-mono text-xs font-bold ${isActive ? "text-terracotta-raw" : "text-charcoal/40"
                                        }`}>
                                        {step.id}
                                    </span>
                                )}
                            </motion.div>

                            <div className="mt-2 text-center">
                                <span className={`font-body text-[11px] font-medium block ${isActive ? "text-terracotta-raw" : isCompleted ? "text-charcoal" : "text-charcoal/40"
                                    }`}>
                                    {step.label}
                                </span>
                                <span className="font-mono text-[9px] text-charcoal/40 block">
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

export default function RoomBookingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const currentStep = getStepFromPath(pathname);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50;
            setIsScrolled(scrolled);
            if (scrolled && isExpanded) {
                setIsExpanded(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isExpanded]);

    // Reset to expanded when page changes
    useEffect(() => {
        setIsExpanded(true);
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-sand-light">
            {/* Header */}
            <motion.header
                className="sticky top-0 z-40 bg-ivory border-b border-sand-dark/50 shadow-sm"
                initial={false}
                animate={{
                    paddingTop: isScrolled && !isExpanded ? "8px" : "16px",
                    paddingBottom: isScrolled && !isExpanded ? "8px" : "16px",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-charcoal/60 hover:text-terracotta-raw transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:block">Back to Home</span>
                        </Link>

                        {/* Center: Compact stepper when scrolled */}
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

                        <div className="flex items-center gap-3">
                            {/* Expand/Collapse toggle */}
                            {isScrolled && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 rounded-lg hover:bg-sand-light transition-colors"
                                    title={isExpanded ? "Minimize" : "Expand"}
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4 text-charcoal/60" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-charcoal/60" />
                                    )}
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg border border-gold bg-white flex items-center justify-center">
                                    <span className="font-display text-xs text-terracotta-raw">V</span>
                                </div>
                                <span className="font-display text-base text-ink hidden sm:block">VIRAMAH</span>
                            </div>
                        </div>
                    </div>

                    {/* Expanded Progress Stepper */}
                    <AnimatePresence>
                        {(!isScrolled || isExpanded) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: "auto", opacity: 1, marginTop: 20 }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="overflow-visible pt-1"
                            >
                                <ExpandedStepper steps={BOOKING_STEPS} currentStep={currentStep} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-10 pb-24">
                {children}
            </main>

            {/* Footer Note */}
            <footer className="fixed bottom-0 left-0 right-0 bg-ivory/90 backdrop-blur-md border-t border-sand-dark/30 py-2.5 z-30">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-charcoal/40">
                        Your data is encrypted and secure
                    </span>
                    <span className="font-mono text-[10px] text-charcoal/40">
                        Step {currentStep} of 5
                    </span>
                </div>
            </footer>
        </div>
    );
}
