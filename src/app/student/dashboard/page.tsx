"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Wallet, UtensilsCrossed, Dumbbell, Bell, Calendar,
    ArrowRight, TrendingUp, Wrench, ChevronRight,
    Zap, Droplets, Wifi, Sparkles, MoreHorizontal,
    Clock, CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { mockUser } from "@/lib/auth";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Quick Actions ──────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: "Add Funds", href: "/student/wallet", icon: Wallet, bg: "#1F3A2D", fg: GOLD },
    { label: "Order Food", href: "/student/canteen", icon: UtensilsCrossed, bg: "#D8B56A", fg: "#1F3A2D" },
    { label: "Amenities", href: "/student/amenities", icon: Dumbbell, bg: "rgba(31,58,45,0.1)", fg: "#1F3A2D" },
    { label: "Maintenance", href: "/student/maintenance", icon: Wrench, bg: "rgba(216,181,106,0.15)", fg: "#9a7a3a" },
];

// ── Stats ──────────────────────────────────────────────────
const STATS = [
    { label: "Wallet Balance", value: "₹2,450", sub: "+₹500 this week", icon: Wallet, trend: "up" },
    { label: "Meals This Week", value: "12", sub: "4 pending", icon: UtensilsCrossed, trend: "neutral" },
    { label: "Gym Sessions", value: "4", sub: "2 booked ahead", icon: Dumbbell, trend: "up" },
    { label: "Open Requests", value: "1", sub: "In progress", icon: Wrench, trend: "warn" },
];

// ── Notifications ──────────────────────────────────────────
const NOTIFICATIONS = [
    { text: "Your laundry is ready for pickup", time: "2 hours ago", type: "info" },
    { text: "Rent reminder: Due in 5 days", time: "Yesterday", type: "warn" },
    { text: "Maintenance request #MR-003 resolved", time: "2 days ago", type: "success" },
];

// ── Events ─────────────────────────────────────────────────
const EVENTS = [
    { title: "Yoga Session", time: "6:00 AM", day: "Tomorrow", tag: "Wellness" },
    { title: "Community Dinner", time: "7:30 PM", day: "Saturday", tag: "Social" },
    { title: "Study Group", time: "4:00 PM", day: "Sunday", tag: "Academic" },
];

// ── Recent Maintenance ─────────────────────────────────────
const RECENT_MAINTENANCE = [
    { id: "MR-003", type: "Electrician", issue: "Fan not working in room", status: "resolved", date: "2 days ago" },
    { id: "MR-004", type: "Plumber", issue: "Tap leaking in bathroom", status: "in_progress", date: "Today" },
];

const STATUS_CONFIG = {
    resolved: { label: "Resolved", icon: CheckCircle2, color: "#1F3A2D", bg: "rgba(31,58,45,0.08)" },
    in_progress: { label: "In Progress", icon: Clock, color: "#D8B56A", bg: "rgba(216,181,106,0.12)" },
    pending: { label: "Pending", icon: AlertCircle, color: "#c0392b", bg: "rgba(192,57,43,0.08)" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

export default function StudentDashboard() {
    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 28 }}
        >
            {/* ── Welcome Header ── */}
            <motion.div variants={itemVariants}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.3em",
                            color: GOLD,
                            fontWeight: 700,
                        }}>
                            {greeting()}
                        </span>
                        <h1 style={{
                            fontFamily: "var(--font-display, serif)",
                            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                            color: GREEN,
                            lineHeight: 1.1,
                            marginTop: 4,
                            fontWeight: 400,
                        }}>
                            Welcome back, {mockUser.name.split(" ")[0]}
                        </h1>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)",
                            fontSize: "0.9rem",
                            color: "rgba(31,58,45,0.5)",
                            marginTop: 6,
                        }}>
                            Here&apos;s what&apos;s happening at Viramah today.
                        </p>
                    </div>
                    {/* Date badge */}
                    <div style={{
                        padding: "8px 16px",
                        borderRadius: 999,
                        background: "#fff",
                        border: "1px solid rgba(31,58,45,0.1)",
                        boxShadow: "0 2px 12px rgba(31,58,45,0.06)",
                    }}>
                        <span style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.65rem",
                            color: "rgba(31,58,45,0.5)",
                            letterSpacing: "0.05em",
                        }}>
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div variants={itemVariants}>
                <SectionLabel>Quick Actions</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginTop: 12 }}>
                    {QUICK_ACTIONS.map((action) => {
                        const Icon = action.icon;
                        const isHovered = hoveredAction === action.label;
                        return (
                            <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                                <motion.div
                                    onMouseEnter={() => setHoveredAction(action.label)}
                                    onMouseLeave={() => setHoveredAction(null)}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: "#fff",
                                        borderRadius: 16,
                                        border: `1.5px solid ${isHovered ? "rgba(31,58,45,0.2)" : "rgba(31,58,45,0.08)"}`,
                                        padding: "20px 16px",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 10,
                                        cursor: "pointer",
                                        boxShadow: isHovered ? "0 8px 24px rgba(31,58,45,0.1)" : "0 2px 8px rgba(31,58,45,0.04)",
                                        transition: "border-color 0.25s, box-shadow 0.25s",
                                    }}
                                >
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: action.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Icon size={22} color={action.fg} />
                                    </div>
                                    <span style={{
                                        fontFamily: "var(--font-body, sans-serif)",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        color: GREEN,
                                        textAlign: "center",
                                    }}>
                                        {action.label}
                                    </span>
                                    <ArrowRight size={14} color={isHovered ? GOLD : "rgba(31,58,45,0.25)"} style={{ transition: "color 0.2s" }} />
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Stats Row ── */}
            <motion.div variants={itemVariants}>
                <SectionLabel>Overview</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 12 }}>
                    {STATS.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} style={{
                                background: "#fff",
                                borderRadius: 16,
                                border: "1px solid rgba(31,58,45,0.08)",
                                padding: "20px",
                                boxShadow: "0 2px 8px rgba(31,58,45,0.04)",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                    <span style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.58rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.2em",
                                        color: "rgba(31,58,45,0.45)",
                                        fontWeight: 700,
                                    }}>
                                        {stat.label}
                                    </span>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        background: "rgba(31,58,45,0.06)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Icon size={15} color={GREEN} />
                                    </div>
                                </div>
                                <div style={{
                                    fontFamily: "var(--font-display, serif)",
                                    fontSize: "2rem",
                                    color: GREEN,
                                    lineHeight: 1,
                                    marginBottom: 6,
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    {stat.trend === "up" && <TrendingUp size={11} color="#1F3A2D" />}
                                    {stat.trend === "warn" && <AlertCircle size={11} color={GOLD} />}
                                    <span style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.6rem",
                                        color: stat.trend === "warn" ? "#9a7a3a" : "rgba(31,58,45,0.4)",
                                    }}>
                                        {stat.sub}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Two Column: Notifications + Events ── */}
            <motion.div variants={itemVariants} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {/* Notifications */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", padding: 24, boxShadow: "0 2px 8px rgba(31,58,45,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(31,58,45,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Bell size={16} color={GREEN} />
                            </div>
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN }}>Notifications</span>
                        </div>
                        <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(31,58,45,0.08)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GREEN, fontWeight: 700 }}>
                            3 new
                        </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {NOTIFICATIONS.map((n, i) => (
                            <div key={i} style={{
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: "rgba(246,244,239,0.7)",
                                border: "1px solid rgba(31,58,45,0.07)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                    <div style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: n.type === "success" ? GREEN : n.type === "warn" ? GOLD : "rgba(31,58,45,0.3)",
                                        marginTop: 5,
                                        flexShrink: 0,
                                    }} />
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: GREEN, margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                                </div>
                                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)", paddingLeft: 14 }}>{n.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Events */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", padding: 24, boxShadow: "0 2px 8px rgba(31,58,45,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(216,181,106,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Calendar size={16} color={GOLD} />
                        </div>
                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN }}>Upcoming Events</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {EVENTS.map((event, i) => (
                            <div key={i} style={{
                                padding: "12px 14px",
                                borderRadius: 10,
                                background: "rgba(246,244,239,0.7)",
                                border: "1px solid rgba(31,58,45,0.07)",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                            }}>
                                <div style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 10,
                                    background: "rgba(216,181,106,0.12)",
                                    border: "1px solid rgba(216,181,106,0.25)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "#9a7a3a", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                                        {event.day.slice(0, 3).toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN, margin: 0 }}>{event.title}</p>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)" }}>{event.time} · {event.day}</span>
                                </div>
                                <span style={{
                                    padding: "3px 8px",
                                    borderRadius: 999,
                                    background: "rgba(31,58,45,0.07)",
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.55rem",
                                    color: GREEN,
                                    letterSpacing: "0.05em",
                                }}>
                                    {event.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Recent Maintenance Requests ── */}
            <motion.div variants={itemVariants}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <SectionLabel>Recent Maintenance</SectionLabel>
                    <Link href="/student/maintenance" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: GOLD, letterSpacing: "0.05em" }}>View all</span>
                        <ChevronRight size={12} color={GOLD} />
                    </Link>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", overflow: "hidden", boxShadow: "0 2px 8px rgba(31,58,45,0.04)" }}>
                    {RECENT_MAINTENANCE.map((req, i) => {
                        const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
                        const StatusIcon = cfg.icon;
                        return (
                            <div key={req.id} style={{
                                padding: "16px 20px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                borderBottom: i < RECENT_MAINTENANCE.length - 1 ? "1px solid rgba(31,58,45,0.07)" : "none",
                            }}>
                                <div style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    background: "rgba(31,58,45,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Wrench size={16} color={GREEN} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN }}>{req.type}</span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.35)" }}>{req.id}</span>
                                    </div>
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", margin: "2px 0 0" }}>{req.issue}</p>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        padding: "4px 10px",
                                        borderRadius: 999,
                                        background: cfg.bg,
                                    }}>
                                        <StatusIcon size={11} color={cfg.color} />
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                                    </div>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.35)" }}>{req.date}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Raise New Request CTA ── */}
            <motion.div variants={itemVariants}>
                <Link href="/student/maintenance" style={{ textDecoration: "none" }}>
                    <motion.div
                        whileHover={{ y: -3 }}
                        style={{
                            background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
                            borderRadius: 16,
                            padding: "24px 28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            boxShadow: "0 8px 28px rgba(31,58,45,0.2)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{
                                width: 48,
                                height: 48,
                                borderRadius: 12,
                                background: "rgba(216,181,106,0.15)",
                                border: "1px solid rgba(216,181,106,0.25)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Plus size={22} color={GOLD} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                                    Raise a Maintenance Request
                                </p>
                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.5)", margin: "4px 0 0", letterSpacing: "0.03em" }}>
                                    Electricity · Plumbing · WiFi · Housekeeping · More
                                </p>
                            </div>
                        </div>
                        <ArrowRight size={20} color={GOLD} />
                    </motion.div>
                </Link>
            </motion.div>
        </motion.div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "rgba(31,58,45,0.45)",
            fontWeight: 700,
        }}>
            {children}
        </span>
    );
}
