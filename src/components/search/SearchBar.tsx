"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Home, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSegment {
    id: string;
    label: string;
    icon: React.ElementType;
    placeholder: string;
    unit?: string;
}

const SEGMENTS: SearchSegment[] = [
    { id: "location", label: "LOCATION", icon: MapPin, placeholder: "City, College, or Area" },
    { id: "room", label: "ROOM TYPE", icon: Home, placeholder: "1 Seater, 2 Seater…" },
    { id: "duration", label: "DURATION", icon: Calendar, placeholder: "Academic Year" },
    { id: "budget", label: "BUDGET", icon: Wallet, placeholder: "₹10k – ₹30k / mo" },
];

export function SearchBar() {
    const [activeSegment, setActiveSegment] = useState<string | null>(null);
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    return (
        <div
            className="w-full max-w-[1020px] h-auto md:h-[88px] flex flex-col md:flex-row items-stretch p-2 gap-1 relative z-20"
            style={{
                background: "rgba(15, 31, 24, 0.85)",
                border: "1px solid rgba(197,160,89,0.2)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(197,160,89,0.06)",
            }}
        >
            {SEGMENTS.map((segment, index) => {
                const isActive = activeSegment === segment.id;
                const isHovered = hoveredSegment === segment.id;

                return (
                    <motion.div
                        key={segment.id}
                        layout
                        onHoverStart={() => setHoveredSegment(segment.id)}
                        onHoverEnd={() => setHoveredSegment(null)}
                        onFocus={() => setActiveSegment(segment.id)}
                        onBlur={() => setActiveSegment(null)}
                        onClick={() => setActiveSegment(segment.id)}
                        style={{
                            flexGrow: isActive ? 2 : isHovered ? 1.4 : 1,
                            background: isActive
                                ? "rgba(197,160,89,0.07)"
                                : isHovered
                                    ? "rgba(197,160,89,0.04)"
                                    : "transparent",
                            borderRight: index < SEGMENTS.length - 1
                                ? "1px solid rgba(197,160,89,0.12)"
                                : "none",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "relative w-full md:w-auto h-[68px] md:h-full flex flex-col justify-center px-5 cursor-text transition-colors duration-300",
                        )}
                    >
                        {/* Mobile top divider */}
                        {index > 0 && (
                            <div
                                className="md:hidden absolute top-0 left-4 right-4 h-px"
                                style={{ background: "rgba(197,160,89,0.15)" }}
                            />
                        )}

                        {/* Label row */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <segment.icon
                                className="w-3 h-3 transition-colors duration-300"
                                style={{ color: isActive ? "var(--gold)" : "rgba(197,160,89,0.35)" }}
                            />
                            <span
                                className="font-mono text-[9px] font-bold tracking-[0.22em] uppercase transition-colors duration-300"
                                style={{ color: isActive ? "var(--gold)" : "rgba(243,237,226,0.4)" }}
                            >
                                {segment.label}
                            </span>
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder={segment.placeholder}
                            className="w-full bg-transparent border-none outline-none font-body text-sm"
                            style={{
                                color: "var(--cream-warm)",
                            }}
                            onFocus={() => setActiveSegment(segment.id)}
                            onBlur={() => setActiveSegment(null)}
                        />

                        {/* Active gold underline */}
                        <div
                            className="absolute bottom-2 left-5 right-5 h-px overflow-hidden"
                            style={{ background: "rgba(197,160,89,0.12)" }}
                        >
                            <motion.div
                                className="h-full"
                                style={{ background: "var(--gold)" }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: isActive ? 1 : 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 1.5, 0.5, 1] }}
                            />
                        </div>
                    </motion.div>
                );
            })}

            {/* Search Button */}
            <motion.button
                whileHover={{ scale: 0.97 }}
                whileTap={{ scale: 0.94 }}
                className="w-full md:w-[72px] h-[60px] md:h-auto flex items-center justify-center shrink-0 gap-2 relative overflow-hidden font-mono font-bold text-xs tracking-widest"
                style={{
                    background: "var(--gold)",
                    color: "var(--luxury-green)",
                }}
            >
                <Search className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                <span className="md:hidden relative z-10">SEARCH</span>

                {/* Shimmer on hover */}
                <motion.div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)" }}
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                />
            </motion.button>
        </div>
    );
}
