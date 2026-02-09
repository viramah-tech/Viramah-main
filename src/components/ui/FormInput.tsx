"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, hint, className, type, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = props.value !== undefined && props.value !== "";
        // Date, time, datetime inputs always show placeholder, so label should stay floated
        const isDateTimeInput = type === "date" || type === "time" || type === "datetime-local";
        const shouldFloat = isFocused || hasValue || isDateTimeInput;

        return (
            <div className="relative w-full">
                {/* Floating Label */}
                <motion.label
                    className={cn(
                        "absolute left-4 pointer-events-none font-body transition-colors duration-200",
                        shouldFloat
                            ? `text-[11px] top-2 font-medium ${isFocused ? "text-terracotta-raw" : "text-charcoal/70"}`
                            : "text-sm top-1/2 -translate-y-1/2 text-charcoal/50"
                    )}
                    animate={{
                        y: shouldFloat ? 0 : "-50%",
                        scale: shouldFloat ? 0.85 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {label}
                </motion.label>

                {/* Input Field */}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        "w-full h-14 px-4 pt-5 pb-2 rounded-xl border-2 bg-white font-body text-sm text-charcoal",
                        "transition-all duration-300 outline-none",
                        "focus:border-terracotta-raw focus:shadow-lg focus:shadow-terracotta-raw/10",
                        error
                            ? "border-red-400"
                            : isFocused
                                ? "border-terracotta-raw"
                                : "border-sand-dark hover:border-charcoal/30",
                        className
                    )}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    {...props}
                />

                {/* Hint or Error */}
                {(error || hint) && (
                    <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "block mt-1.5 px-1 font-mono text-[11px]",
                            error ? "text-red-500" : "text-charcoal/50"
                        )}
                    >
                        {error || hint}
                    </motion.span>
                )}
            </div>
        );
    }
);

FormInput.displayName = "FormInput";
