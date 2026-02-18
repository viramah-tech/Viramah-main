"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Shield, Home } from "lucide-react";
import { useState } from "react";

interface Detail {
    label: string;
    mono: boolean;
    highlight?: boolean;
}

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};


const SUMMARY_ITEMS: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    step: string;
    details?: Detail[];
    tags?: string[];
}[] = [
        {
            icon: Shield,
            iconBg: "rgba(31,58,45,0.08)",
            iconColor: GREEN,
            title: "Identity Verified",
            step: "Step 1 Complete",
            details: [
                { label: "Arjun Mehta", mono: false },
                { label: "Aadhaar: XXXX-XXXX-1234", mono: true },
            ],
        },
        {
            icon: () => <span style={{ fontSize: "1.1rem" }}>📞</span>,
            iconBg: "rgba(216,181,106,0.12)",
            iconColor: GOLD,
            title: "Emergency Contact",
            step: "Step 2 Complete",
            details: [
                { label: "Rajesh Mehta (Father)", mono: false },
                { label: "+91 98XXX XXXXX", mono: true },
            ],
        },
        {
            icon: Home,
            iconBg: "rgba(31,58,45,0.08)",
            iconColor: GREEN,
            title: "Room Selected",
            step: "Step 3 Complete",
            details: [
                { label: "Room 201 · Single Occupancy", mono: false },
                { label: "₹8,500/mo + Full Board ₹4,500/mo", mono: true },
                { label: "Total: ₹13,000/month", mono: false, highlight: true },
            ],
        },
        {
            icon: () => <span style={{ fontSize: "1.1rem" }}>⚙️</span>,
            iconBg: "rgba(31,58,45,0.06)",
            iconColor: GREEN,
            title: "Preferences Set",
            step: "Step 4 Complete",
            tags: ["Vegetarian", "Early Bird", "Quiet"],
        },
    ];


export default function ConfirmPage() {
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(31,58,45,0.08)", border: "1px solid rgba(31,58,45,0.12)", marginBottom: 16 }}>
                    <Check size={14} color={GREEN} />
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.3em", color: GREEN }}>
                        Almost Done
                    </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: GREEN, lineHeight: 1.1, fontWeight: 400, marginBottom: 10 }}>
                    Review & Confirm
                </h1>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(31,58,45,0.55)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
                    Please review your information before completing your booking.
                </p>
            </motion.div>

            {/* Summary Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {SUMMARY_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            style={{
                                background: "#fff",
                                borderRadius: 16,
                                border: "1px solid rgba(31,58,45,0.1)",
                                padding: 24,
                                boxShadow: "0 2px 16px rgba(31,58,45,0.05)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: item.details || item.tags ? 16 : 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={18} color={item.iconColor} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, margin: 0 }}>{item.title}</p>
                                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", margin: 0, letterSpacing: "0.05em" }}>{item.step}</p>
                                </div>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(31,58,45,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Check size={13} color={GREEN} strokeWidth={2.5} />
                                </div>
                            </div>

                            {item.details && (
                                <div style={{ paddingLeft: 52, display: "flex", flexDirection: "column", gap: 4 }}>
                                    {item.details.map((d, j) => (
                                        <p
                                            key={j}
                                            style={{
                                                fontFamily: d.mono ? "var(--font-mono, monospace)" : "var(--font-body, sans-serif)",
                                                fontSize: d.mono ? "0.7rem" : "0.85rem",
                                                color: d.highlight ? GREEN : "rgba(31,58,45,0.6)",
                                                fontWeight: d.highlight ? 600 : 400,
                                                margin: 0,
                                                letterSpacing: d.mono ? "0.03em" : 0,
                                            }}
                                        >
                                            {d.label}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {item.tags && (
                                <div style={{ paddingLeft: 52, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {item.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: 999,
                                                background: "rgba(31,58,45,0.07)",
                                                border: "1px solid rgba(31,58,45,0.12)",
                                                fontFamily: "var(--font-mono, monospace)",
                                                fontSize: "0.65rem",
                                                color: GREEN,
                                                letterSpacing: "0.05em",
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Total Summary Banner */}
            <motion.div
                variants={itemVariants}
                style={{
                    background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
                    borderRadius: 16,
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
                }}
            >
                <div>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: 0 }}>
                        Monthly Total
                    </p>
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.2rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                        ₹13,000
                    </p>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.4)", margin: "6px 0 0" }}>
                        Room ₹8,500 + Mess ₹4,500 · Security deposit ₹17,000 (refundable)
                    </p>
                </div>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: "rgba(216,181,106,0.15)",
                        border: "1px solid rgba(216,181,106,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Check size={20} color={GOLD} strokeWidth={2.5} />
                </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <Link href="/user-onboarding/step-4" style={{ textDecoration: "none" }}>
                    <SecondaryButton><ArrowLeft size={16} /> Back</SecondaryButton>
                </Link>
                <Link href="/student/dashboard" style={{ textDecoration: "none" }}>
                    <ConfirmButton>
                        <Home size={16} />
                        Confirm Booking
                    </ConfirmButton>
                </Link>
            </motion.div>
        </motion.div>
    );
}

function ConfirmButton({ children }: { children: React.ReactNode }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px",
                background: hovered ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)" : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                color: GOLD,
                border: "none", borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.18em",
                cursor: "pointer",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered ? "0 12px 32px rgba(31,58,45,0.35)" : "0 4px 14px rgba(31,58,45,0.18)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}

function SecondaryButton({ children }: { children: React.ReactNode }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px",
                background: hovered ? "rgba(31,58,45,0.06)" : "transparent",
                color: GREEN,
                border: `1.5px solid ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.15em",
                cursor: "pointer",
                transition: "all 0.25s ease",
            }}
        >
            {children}
        </button>
    );
}
