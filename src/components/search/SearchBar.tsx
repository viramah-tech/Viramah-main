"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Home, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSegment {
    id: string;
    label: string;
    systemCode: string;
    icon: React.ElementType;
    placeholder: string;
    value: string;
    unit?: string;
}

const SEGMENTS: SearchSegment[] = [
    { id: "location", label: "LOCATION", systemCode: "SYS.GEO_LOC", icon: MapPin, placeholder: "City, College, or Area", value: "" },
    { id: "room", label: "ROOM TYPE", systemCode: "SYS.TYPE_SELECT", icon: Home, placeholder: "1 Seater", value: "", unit: "" },
    { id: "duration", label: "DURATION", systemCode: "SYS.TIME_SPAN", icon: Calendar, placeholder: "Academic Year", value: "" },
    { id: "budget", label: "BUDGET", systemCode: "SYS.VAL_RANGE", icon: Wallet, placeholder: "Essential", value: "" },
];

export function SearchBar() {
    const [activeSegment, setActiveSegment] = useState<string | null>(null);
    const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

    return (
        <div className="w-full max-w-[1000px] h-[90px] rounded-2xl flex items-center p-2 gap-1 relative z-20 border border-sand-dark/60 bg-white/40 backdrop-blur-sm shadow-[0_4px_20px_rgba(142,77,62,0.06)]">
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
                        className={cn(
                            "relative h-full flex flex-col justify-center px-6 rounded-xl cursor-text transition-colors duration-300 border border-transparent",
                            isActive ? "bg-white/60 border-sand-dark shadow-[inset_0_0_15px_rgba(0,0,0,0.04)]" : "hover:bg-white/30"
                        )}
                        style={{
                            flex: isActive ? 1.8 : isHovered ? 1.4 : 1,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                        }}
                    >

                        {/* Pneumatic Rib Divider */}
                        {index > 0 && (
                            <div
                                className="absolute left-0 top-[15%] h-[70%] w-[3px] opacity-50"
                                style={{
                                    background: "repeating-linear-gradient(to bottom, var(--sand-dark), var(--sand-dark) 2px, transparent 2px, transparent 4px)"
                                }}
                            />
                        )}

                        {/* Label */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                                "font-mono text-[10px] font-bold tracking-widest uppercase transition-colors duration-300",
                                isActive ? "text-terracotta-raw" : "text-charcoal/60"
                            )}>
                                {segment.label}
                            </span>
                        </div>

                        {/* Input Area */}
                        <div className="flex items-center gap-2">
                            <segment.icon className={cn(
                                "w-4 h-4 transition-colors duration-300",
                                isActive ? "text-terracotta-raw" : "text-charcoal/40"
                            )} />
                            <input
                                type="text"
                                placeholder={segment.placeholder}
                                className="w-full bg-transparent border-none outline-none font-body text-sm text-charcoal placeholder:text-charcoal/40"
                            />
                            {segment.unit && (
                                <span className="font-mono text-xs text-charcoal/40">{segment.unit}</span>
                            )}
                        </div>

                        {/* Animated Meter Line */}
                        <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-sand-dark/50 overflow-hidden rounded-full">
                            <motion.div
                                className="h-full bg-terracotta-raw"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: isActive ? 1 : 0 }}
                                transition={{ duration: 0.5, ease: [0.25, 1.5, 0.5, 1] }}
                                style={{ transformOrigin: "left" }}
                            />
                        </div>
                    </motion.div>
                );
            })}

            {/* Search Button */}
            <motion.button
                whileHover={{ width: 90, scale: 0.98 }}
                whileTap={{ scale: 0.95, rotate: 2 }}
                className="h-full w-[74px] bg-terracotta-raw rounded-xl flex items-center justify-center text-white shrink-0 hover:bg-terracotta-raw/90 transition-colors duration-300 shadow-lg shadow-terracotta-raw/20 relative overflow-hidden"
            >
                <Search className="w-6 h-6 relative z-10" />
                {/* Click flash effect */}
                <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ y: "100%" }}
                    whileTap={{ y: 0 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.button>
        </div>
    );
}
