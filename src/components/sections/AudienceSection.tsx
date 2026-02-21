"use client";

import { motion } from "framer-motion";
import { EnquireNowButton } from "@/components/ui/EnquireNowButton";

const AUDIENCES = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        ),
        tag: "STUDENTS",
        title: "The Scholar",
        description:
            "Preparing for exams, placements, or your first startup? Viramah gives you silent study zones, high-speed Wi-Fi, and a community that pushes you to be your best.",
        perks: ["Dedicated study spaces", "24/7 Wi-Fi", "Exam-prep mindset"],
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
        ),
        tag: "PROFESSIONALS",
        title: "The Achiever",
        description:
            "New to the city, building your career? Skip the chaos of house-hunting. Move into a fully serviced home with like-minded professionals and focus on what matters.",
        perks: ["Premium furnished spaces", "Daily housekeeping", "Professional community"],
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                <circle cx="19" cy="8" r="3" />
                <path d="M22 20c0-3-1.8-5.5-4-6.3" />
            </svg>
        ),
        tag: "CREATORS",
        title: "The Builder",
        description:
            "Freelancers, founders, and creative minds thrive here. Collaborate in shared spaces, find your tribe, and build your next big thing from the comfort of Viramah.",
        perks: ["Co-working spaces", "Networking events", "Startup-friendly vibe"],
    },
];

const EASE = [0.23, 1, 0.32, 1] as [number, number, number, number];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: EASE },
    },
};

export function AudienceSection() {
    return (
        <section
            style={{
                background: "linear-gradient(160deg, #1a3328 0%, #0f2018 100%)",
                padding: "8rem 0",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Subtle radial glow */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 0%, rgba(216,181,106,0.06) 0%, transparent 70%)`,
                    pointerEvents: "none",
                }}
            />

            {/* Grain texture */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                    opacity: 0.04,
                    pointerEvents: "none",
                }}
            />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem", position: "relative", zIndex: 2 }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: EASE }}
                    style={{ marginBottom: "4rem", textAlign: "center" }}
                >
                    <p style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.35em",
                        color: "#D8B56A",
                        marginBottom: "1rem",
                        opacity: 0.8,
                    }}>
                        Who calls Viramah home
                    </p>
                    <h2 style={{
                        fontFamily: "var(--font-display, serif)",
                        fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
                        color: "#F6F4EF",
                        lineHeight: 1.1,
                        fontWeight: 400,
                    }}>
                        A Home for Every{" "}
                        <span style={{ color: "#D8B56A" }}>Ambition</span>
                    </h2>
                    <p style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.85rem",
                        color: "rgba(246,244,239,0.5)",
                        marginTop: "1rem",
                        maxWidth: 480,
                        marginInline: "auto",
                        lineHeight: 1.7,
                    }}>
                        We didn't find the perfect space for us, so we created it for you.

                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "1.5rem",
                        marginBottom: "4rem",
                    }}
                >
                    {AUDIENCES.map((audience, i) => (
                        <motion.div
                            key={audience.tag}
                            variants={cardVariants}
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(216,181,106,0.15)",
                                borderRadius: 2,
                                padding: "2.5rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.5rem",
                                backdropFilter: "blur(8px)",
                                position: "relative",
                                overflow: "hidden",
                                cursor: "default",
                            }}
                        >
                            {/* Top accent line */}
                            <div style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0,
                                height: 2,
                                background: i === 0
                                    ? "linear-gradient(to right, #D8B56A, transparent)"
                                    : i === 1
                                        ? "linear-gradient(to right, transparent, #D8B56A, transparent)"
                                        : "linear-gradient(to right, transparent, #D8B56A)",
                            }} />

                            {/* Tag + Icon row */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.58rem",
                                    letterSpacing: "0.3em",
                                    textTransform: "uppercase",
                                    color: "#D8B56A",
                                    border: "1px solid rgba(216,181,106,0.3)",
                                    padding: "4px 10px",
                                }}>
                                    {audience.tag}
                                </span>
                                <div style={{ color: "rgba(216,181,106,0.6)" }}>
                                    {audience.icon}
                                </div>
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontFamily: "var(--font-display, serif)",
                                fontSize: "1.9rem",
                                color: "#F6F4EF",
                                fontWeight: 400,
                                lineHeight: 1.1,
                            }}>
                                {audience.title}
                            </h3>

                            {/* Description */}
                            <p style={{
                                fontFamily: "var(--font-body, sans-serif)",
                                fontSize: "0.9rem",
                                color: "rgba(246,244,239,0.55)",
                                lineHeight: 1.75,
                                flex: 1,
                            }}>
                                {audience.description}
                            </p>

                            {/* Perks */}
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {audience.perks.map((perk) => (
                                    <li
                                        key={perk}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            fontFamily: "var(--font-mono, monospace)",
                                            fontSize: "0.65rem",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.15em",
                                            color: "rgba(246,244,239,0.45)",
                                        }}
                                    >
                                        <span style={{
                                            width: 4, height: 4, borderRadius: "50%",
                                            background: "#D8B56A",
                                            flexShrink: 0,
                                        }} />
                                        {perk}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}
                >

                </motion.div>
            </div>
        </section>
    );
}
