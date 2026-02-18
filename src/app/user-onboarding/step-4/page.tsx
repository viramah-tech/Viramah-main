"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Settings2, Moon, Sun, Volume2, VolumeX } from "lucide-react";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

interface PreferenceOption {
    value: string;
    label: string;
    icon: React.ElementType;
    description: string;
}

const DIET_OPTIONS: PreferenceOption[] = [
    { value: "veg", label: "Vegetarian", icon: Settings2, description: "Plant-based meals only" },
    { value: "non-veg", label: "Non-Vegetarian", icon: Settings2, description: "All meal types" },
    { value: "vegan", label: "Vegan", icon: Settings2, description: "No animal products" },
];

const SLEEP_OPTIONS: PreferenceOption[] = [
    { value: "early", label: "Early Bird", icon: Sun, description: "Sleep before 10 PM" },
    { value: "late", label: "Night Owl", icon: Moon, description: "Sleep after midnight" },
    { value: "flexible", label: "Flexible", icon: Settings2, description: "No fixed schedule" },
];

const NOISE_OPTIONS: PreferenceOption[] = [
    { value: "quiet", label: "Quiet", icon: VolumeX, description: "Prefer silence" },
    { value: "moderate", label: "Moderate", icon: Volume2, description: "Some background noise" },
    { value: "social", label: "Social", icon: Volume2, description: "Love a lively environment" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

function PreferenceGroup({
    title,
    options,
    value,
    onChange,
}: {
    title: string;
    options: PreferenceOption[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p
                style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                    color: "rgba(31,58,45,0.55)",
                    fontWeight: 700,
                    margin: 0,
                }}
            >
                {title}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {options.map((opt) => {
                    const isSelected = value === opt.value;
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            style={{
                                padding: "16px 12px",
                                borderRadius: 12,
                                border: `2px solid ${isSelected ? GREEN : "rgba(31,58,45,0.12)"}`,
                                background: isSelected ? "rgba(31,58,45,0.06)" : "#fff",
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                boxShadow: isSelected ? "0 4px 16px rgba(31,58,45,0.1)" : "none",
                            }}
                        >
                            <Icon
                                size={20}
                                color={isSelected ? GREEN : "rgba(31,58,45,0.3)"}
                                style={{ marginBottom: 8, display: "block" }}
                            />
                            <span
                                style={{
                                    fontFamily: "var(--font-body, sans-serif)",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    color: isSelected ? GREEN : "rgba(31,58,45,0.7)",
                                    display: "block",
                                    marginBottom: 4,
                                }}
                            >
                                {opt.label}
                            </span>
                            <span
                                style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.6rem",
                                    color: "rgba(31,58,45,0.4)",
                                    letterSpacing: "0.03em",
                                    display: "block",
                                }}
                            >
                                {opt.description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function Step4Page() {
    const [preferences, setPreferences] = useState({
        dietary: "",
        sleep: "",
        noise: "",
    });

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(31,58,45,0.08)", border: "1px solid rgba(31,58,45,0.12)", marginBottom: 16 }}>
                    <Settings2 size={14} color={GREEN} />
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.3em", color: GREEN }}>
                        Lifestyle Preferences
                    </span>
                </div>
                <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: GREEN, lineHeight: 1.1, fontWeight: 400, marginBottom: 10 }}>
                    Tell us about yourself
                </h1>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(31,58,45,0.55)", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
                    Help us match you with compatible roommates and provide personalized services.
                </p>
            </motion.div>

            {/* Preferences Card */}
            <motion.div
                variants={itemVariants}
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px solid rgba(31,58,45,0.1)",
                    padding: 32,
                    boxShadow: "0 4px 24px rgba(31,58,45,0.07)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                }}
            >
                <PreferenceGroup
                    title="Dietary Preference"
                    options={DIET_OPTIONS}
                    value={preferences.dietary}
                    onChange={(v) => setPreferences({ ...preferences, dietary: v })}
                />
                <div style={{ height: 1, background: "rgba(31,58,45,0.08)" }} />
                <PreferenceGroup
                    title="Sleep Schedule"
                    options={SLEEP_OPTIONS}
                    value={preferences.sleep}
                    onChange={(v) => setPreferences({ ...preferences, sleep: v })}
                />
                <div style={{ height: 1, background: "rgba(31,58,45,0.08)" }} />
                <PreferenceGroup
                    title="Noise Preference"
                    options={NOISE_OPTIONS}
                    value={preferences.noise}
                    onChange={(v) => setPreferences({ ...preferences, noise: v })}
                />
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <Link href="/user-onboarding/step-3" style={{ textDecoration: "none" }}>
                    <SecondaryButton><ArrowLeft size={16} /> Back</SecondaryButton>
                </Link>
                <Link href="/user-onboarding/confirm" style={{ textDecoration: "none" }}>
                    <NavButton>Continue to Review <ArrowRight size={16} /></NavButton>
                </Link>
            </motion.div>
        </motion.div>
    );
}

function NavButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px",
                background: disabled ? "rgba(31,58,45,0.15)" : hovered ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)" : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                color: disabled ? "rgba(31,58,45,0.35)" : GOLD,
                border: "none", borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.7rem",
                textTransform: "uppercase", letterSpacing: "0.18em",
                cursor: disabled ? "not-allowed" : "pointer",
                transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered && !disabled ? "0 10px 28px rgba(31,58,45,0.3)" : "0 4px 14px rgba(31,58,45,0.18)",
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
