"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    id: number;
    label: string;
    description?: string;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-sand-dark" />

                {/* Progress Line Fill */}
                <motion.div
                    className="absolute top-5 left-0 h-[2px] bg-terracotta-raw"
                    initial={{ width: "0%" }}
                    animate={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                />

                {steps.map((step) => {
                    const isCompleted = step.id < currentStep;
                    const isActive = step.id === currentStep;
                    const isPending = step.id > currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative z-10"
                        >
                            {/* Step Circle */}
                            <motion.div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                    isCompleted && "bg-terracotta-raw border-terracotta-raw",
                                    isActive && "bg-white border-terracotta-raw shadow-lg shadow-terracotta-raw/20",
                                    isPending && "bg-sand-light border-sand-dark"
                                )}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-white" />
                                ) : (
                                    <span className={cn(
                                        "font-mono text-sm font-bold",
                                        isActive ? "text-terracotta-raw" : "text-charcoal/40"
                                    )}>
                                        {step.id}
                                    </span>
                                )}
                            </motion.div>

                            {/* Step Label */}
                            <div className="mt-3 text-center">
                                <span className={cn(
                                    "font-body text-xs font-medium block",
                                    isActive ? "text-terracotta-raw" : isCompleted ? "text-charcoal" : "text-charcoal/40"
                                )}>
                                    {step.label}
                                </span>
                                {step.description && (
                                    <span className="font-mono text-[10px] text-charcoal/40 block mt-0.5">
                                        {step.description}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
