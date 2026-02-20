"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Droplets, Wifi, Sparkles, MoreHorizontal,
    Wrench, CheckCircle2, Clock, AlertCircle,
    Plus, X, ChevronDown, Send, ArrowLeft,
    Home, Thermometer, Lock, Tv, Wind
} from "lucide-react";
import Link from "next/link";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Category Definitions ──────────────────────────────────
const CATEGORIES = [
    {
        id: "electricity",
        label: "Electricity",
        icon: Zap,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        description: "Power outlets, lighting, fans, switches",
        issues: ["Fan not working", "Light bulb fused", "Power outlet not working", "Tripping breaker", "AC not cooling", "Other"],
    },
    {
        id: "plumber",
        label: "Plumber",
        icon: Droplets,
        color: "#3b82f6",
        bg: "rgba(59,130,246,0.1)",
        description: "Taps, pipes, drainage, water supply",
        issues: ["Tap leaking", "Drain blocked", "No hot water", "Toilet not flushing", "Low water pressure", "Other"],
    },
    {
        id: "wifi",
        label: "WiFi / Internet",
        icon: Wifi,
        color: "#8b5cf6",
        bg: "rgba(139,92,246,0.1)",
        description: "Connectivity, router, slow speeds",
        issues: ["No internet connection", "Slow speed", "WiFi dropping frequently", "Cannot connect to network", "Other"],
    },
    {
        id: "housekeeping",
        label: "Housekeeping",
        icon: Sparkles,
        color: "#10b981",
        bg: "rgba(16,185,129,0.1)",
        description: "Room cleaning, linen, common areas",
        issues: ["Room not cleaned", "Linen replacement needed", "Common area dirty", "Pest issue", "Waste not collected", "Other"],
    },
    {
        id: "carpentry",
        label: "Carpentry",
        icon: Wrench,
        color: "#d97706",
        bg: "rgba(217,119,6,0.1)",
        description: "Furniture, doors, windows, locks",
        issues: ["Door not closing properly", "Window latch broken", "Furniture damaged", "Lock issue", "Wardrobe problem", "Other"],
    },
    {
        id: "ac_heating",
        label: "AC / Heating",
        icon: Thermometer,
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
        description: "Air conditioning, heating, ventilation",
        issues: ["AC not cooling", "AC making noise", "Remote not working", "Heating issue", "Ventilation blocked", "Other"],
    },
    {
        id: "security",
        label: "Security / Lock",
        icon: Lock,
        color: "#6b7280",
        bg: "rgba(107,114,128,0.1)",
        description: "Door locks, keys, access cards",
        issues: ["Key not working", "Lock jammed", "Access card issue", "Door not locking", "Other"],
    },
    {
        id: "other",
        label: "Other",
        icon: MoreHorizontal,
        color: GREEN,
        bg: "rgba(31,58,45,0.08)",
        description: "Any other maintenance issue",
        issues: ["General maintenance", "Other"],
    },
];

// ── Mock Past Requests ────────────────────────────────────
const PAST_REQUESTS = [
    {
        id: "MR-001",
        category: "Electricity",
        issue: "Light bulb fused in room",
        status: "resolved",
        date: "Feb 10, 2026",
        resolvedDate: "Feb 11, 2026",
        priority: "normal",
    },
    {
        id: "MR-002",
        category: "Housekeeping",
        issue: "Room not cleaned for 2 days",
        status: "resolved",
        date: "Feb 12, 2026",
        resolvedDate: "Feb 12, 2026",
        priority: "normal",
    },
    {
        id: "MR-003",
        category: "Electricity",
        issue: "Fan not working in room",
        status: "resolved",
        date: "Feb 15, 2026",
        resolvedDate: "Feb 16, 2026",
        priority: "normal",
    },
    {
        id: "MR-004",
        category: "Plumber",
        issue: "Tap leaking in bathroom",
        status: "in_progress",
        date: "Feb 18, 2026",
        resolvedDate: null,
        priority: "high",
    },
];

const STATUS_CONFIG = {
    resolved: { label: "Resolved", icon: CheckCircle2, color: "#1F3A2D", bg: "rgba(31,58,45,0.08)", border: "rgba(31,58,45,0.15)" },
    in_progress: { label: "In Progress", icon: Clock, color: "#9a7a3a", bg: "rgba(216,181,106,0.12)", border: "rgba(216,181,106,0.3)" },
    pending: { label: "Pending", icon: AlertCircle, color: "#c0392b", bg: "rgba(192,57,43,0.08)", border: "rgba(192,57,43,0.2)" },
};

const PRIORITY_CONFIG = {
    high: { label: "High", color: "#c0392b", bg: "rgba(192,57,43,0.08)" },
    normal: { label: "Normal", color: "rgba(31,58,45,0.5)", bg: "rgba(31,58,45,0.06)" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

export default function MaintenancePage() {
    const [showForm, setShowForm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<string>("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"normal" | "high">("normal");
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");

    const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory);

    const handleSubmit = () => {
        if (!selectedCategory || !selectedIssue) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setShowForm(false);
            setSelectedCategory(null);
            setSelectedIssue("");
            setDescription("");
            setPriority("normal");
        }, 2500);
    };

    const openCount = PAST_REQUESTS.filter((r) => r.status !== "resolved").length;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 900, margin: "0 auto" }}
        >
            {/* ── Header ── */}
            <motion.div variants={itemVariants}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "rgba(31,58,45,0.07)", border: "1px solid rgba(31,58,45,0.12)", marginBottom: 12 }}>
                            <Wrench size={13} color={GREEN} />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.3em", color: GREEN }}>
                                Maintenance
                            </span>
                        </div>
                        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", color: GREEN, lineHeight: 1.1, fontWeight: 400, margin: 0 }}>
                            Maintenance Requests
                        </h1>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", color: "rgba(31,58,45,0.5)", marginTop: 6 }}>
                            Report any issues in your room or common areas. We&apos;ll get it fixed.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setActiveTab("new"); }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "12px 22px",
                            background: "linear-gradient(135deg, #1F3A2D, #162b1e)",
                            color: GOLD, border: "none", borderRadius: 10,
                            fontFamily: "var(--font-mono, monospace)", fontWeight: 700, fontSize: "0.68rem",
                            textTransform: "uppercase", letterSpacing: "0.15em",
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(31,58,45,0.2)",
                        }}
                    >
                        <Plus size={16} /> New Request
                    </button>
                </div>

                {/* Stats bar */}
                <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
                    {[
                        { label: "Total Requests", value: PAST_REQUESTS.length },
                        { label: "Resolved", value: PAST_REQUESTS.filter(r => r.status === "resolved").length },
                        { label: "Open", value: openCount },
                    ].map((s) => (
                        <div key={s.label} style={{
                            padding: "10px 18px",
                            borderRadius: 10,
                            background: "#fff",
                            border: "1px solid rgba(31,58,45,0.08)",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}>
                            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.4rem", color: GREEN }}>{s.value}</span>
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(31,58,45,0.45)" }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Category Grid ── */}
            <motion.div variants={itemVariants}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(31,58,45,0.45)", fontWeight: 700 }}>
                    Select a Category
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 12 }}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <motion.button
                                key={cat.id}
                                whileHover={{ y: -3 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => { setSelectedCategory(cat.id); setSelectedIssue(""); setShowForm(true); }}
                                style={{
                                    background: "#fff",
                                    borderRadius: 14,
                                    border: `1.5px solid ${selectedCategory === cat.id ? cat.color : "rgba(31,58,45,0.08)"}`,
                                    padding: "18px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    boxShadow: selectedCategory === cat.id ? `0 4px 16px ${cat.color}25` : "0 2px 8px rgba(31,58,45,0.04)",
                                    transition: "all 0.25s ease",
                                }}
                            >
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={20} color={cat.color} />
                                </div>
                                <div>
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", fontWeight: 600, color: GREEN, margin: 0 }}>{cat.label}</p>
                                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)", margin: "3px 0 0", lineHeight: 1.4 }}>{cat.description}</p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Request History ── */}
            <motion.div variants={itemVariants}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(31,58,45,0.45)", fontWeight: 700 }}>
                    Request History
                </span>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", overflow: "hidden", marginTop: 12, boxShadow: "0 2px 8px rgba(31,58,45,0.04)" }}>
                    {PAST_REQUESTS.slice().reverse().map((req, i, arr) => {
                        const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
                        const pri = PRIORITY_CONFIG[req.priority as keyof typeof PRIORITY_CONFIG];
                        const StatusIcon = cfg.icon;
                        const catData = CATEGORIES.find(c => c.label === req.category);
                        const CatIcon = catData?.icon ?? Wrench;
                        return (
                            <div key={req.id} style={{
                                padding: "18px 22px",
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                borderBottom: i < arr.length - 1 ? "1px solid rgba(31,58,45,0.06)" : "none",
                            }}>
                                <div style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 11,
                                    background: catData?.bg ?? "rgba(31,58,45,0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <CatIcon size={18} color={catData?.color ?? GREEN} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: GREEN }}>{req.category}</span>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.35)" }}>{req.id}</span>
                                        {req.priority === "high" && (
                                            <span style={{ padding: "2px 8px", borderRadius: 999, background: pri.bg, fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: pri.color, fontWeight: 700 }}>
                                                HIGH
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.78rem", color: "rgba(31,58,45,0.5)", margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{req.issue}</p>
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.57rem", color: "rgba(31,58,45,0.3)" }}>
                                        Raised: {req.date}{req.resolvedDate ? ` · Resolved: ${req.resolvedDate}` : ""}
                                    </span>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 5,
                                    padding: "5px 12px",
                                    borderRadius: 999,
                                    background: cfg.bg,
                                    border: `1px solid ${cfg.border}`,
                                    flexShrink: 0,
                                }}>
                                    <StatusIcon size={12} color={cfg.color} />
                                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── New Request Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <>
                        {/* Backdrop — covers only the content area (right of sidebar) and centers the modal with flexbox */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowForm(false); setSubmitted(false); }}
                            style={{
                                position: "fixed",
                                top: 0,
                                bottom: 0,
                                left: 272,   /* start after the sidebar */
                                right: 0,
                                background: "rgba(10,20,15,0.5)",
                                backdropFilter: "blur(6px)",
                                zIndex: 50,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {/* Modal — stop click propagation so clicking inside doesn't close */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: "min(560px, calc(100% - 48px))",
                                    maxHeight: "90vh",
                                    overflowY: "auto",
                                    background: "#fff",
                                    borderRadius: 20,
                                    boxShadow: "0 24px 80px rgba(10,20,15,0.3)",
                                    zIndex: 51,
                                    padding: 32,
                                    position: "relative",
                                }}
                            >
                                {submitted ? (
                                    /* Success State */
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ textAlign: "center", padding: "20px 0" }}
                                    >
                                        <div style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: "50%",
                                            background: "rgba(31,58,45,0.08)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 20px",
                                        }}>
                                            <CheckCircle2 size={36} color={GREEN} />
                                        </div>
                                        <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.8rem", color: GREEN, margin: "0 0 8px" }}>Request Submitted!</h2>
                                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", color: "rgba(31,58,45,0.55)", margin: 0 }}>
                                            Our team will attend to your request shortly. You&apos;ll be notified once it&apos;s resolved.
                                        </p>
                                        <div style={{ marginTop: 20, padding: "12px 20px", borderRadius: 10, background: "rgba(31,58,45,0.05)", border: "1px solid rgba(31,58,45,0.1)" }}>
                                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: GREEN, letterSpacing: "0.05em" }}>
                                                Reference: MR-00{PAST_REQUESTS.length + 1}
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <>
                                        {/* Modal Header */}
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                                            <div>
                                                <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.5rem", color: GREEN, margin: 0 }}>New Request</h2>
                                                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.4)", margin: "4px 0 0", letterSpacing: "0.05em" }}>
                                                    Fill in the details below
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setShowForm(false)}
                                                style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(31,58,45,0.12)", background: "rgba(31,58,45,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <X size={16} color={GREEN} />
                                            </button>
                                        </div>

                                        {/* Category Select */}
                                        <div style={{ marginBottom: 20 }}>
                                            <label style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.5)", display: "block", marginBottom: 10 }}>
                                                Category *
                                            </label>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                                                {CATEGORIES.map((cat) => {
                                                    const Icon = cat.icon;
                                                    const isSelected = selectedCategory === cat.id;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => { setSelectedCategory(cat.id); setSelectedIssue(""); }}
                                                            style={{
                                                                padding: "10px 6px",
                                                                borderRadius: 10,
                                                                border: `1.5px solid ${isSelected ? cat.color : "rgba(31,58,45,0.1)"}`,
                                                                background: isSelected ? cat.bg : "#fff",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            <Icon size={18} color={isSelected ? cat.color : "rgba(31,58,45,0.4)"} />
                                                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: isSelected ? cat.color : "rgba(31,58,45,0.5)", textAlign: "center", lineHeight: 1.2 }}>
                                                                {cat.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Issue Select */}
                                        {selectedCat && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ marginBottom: 20 }}
                                            >
                                                <label style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.5)", display: "block", marginBottom: 10 }}>
                                                    Issue Type *
                                                </label>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                    {selectedCat.issues.map((issue) => (
                                                        <button
                                                            key={issue}
                                                            onClick={() => setSelectedIssue(issue)}
                                                            style={{
                                                                padding: "8px 14px",
                                                                borderRadius: 999,
                                                                border: `1.5px solid ${selectedIssue === issue ? GREEN : "rgba(31,58,45,0.12)"}`,
                                                                background: selectedIssue === issue ? "rgba(31,58,45,0.07)" : "#fff",
                                                                fontFamily: "var(--font-body, sans-serif)",
                                                                fontSize: "0.78rem",
                                                                color: selectedIssue === issue ? GREEN : "rgba(31,58,45,0.6)",
                                                                fontWeight: selectedIssue === issue ? 600 : 400,
                                                                cursor: "pointer",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            {issue}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Description */}
                                        <div style={{ marginBottom: 20 }}>
                                            <label style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.5)", display: "block", marginBottom: 10 }}>
                                                Description (optional)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Describe the issue in detail..."
                                                rows={3}
                                                style={{
                                                    width: "100%",
                                                    padding: "12px 14px",
                                                    borderRadius: 10,
                                                    border: "1.5px solid rgba(31,58,45,0.12)",
                                                    fontFamily: "var(--font-body, sans-serif)",
                                                    fontSize: "0.85rem",
                                                    color: GREEN,
                                                    background: "rgba(246,244,239,0.5)",
                                                    resize: "vertical",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                            />
                                        </div>

                                        {/* Priority */}
                                        <div style={{ marginBottom: 28 }}>
                                            <label style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.5)", display: "block", marginBottom: 10 }}>
                                                Priority
                                            </label>
                                            <div style={{ display: "flex", gap: 10 }}>
                                                {(["normal", "high"] as const).map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => setPriority(p)}
                                                        style={{
                                                            padding: "8px 18px",
                                                            borderRadius: 8,
                                                            border: `1.5px solid ${priority === p ? (p === "high" ? "#c0392b" : GREEN) : "rgba(31,58,45,0.12)"}`,
                                                            background: priority === p ? (p === "high" ? "rgba(192,57,43,0.07)" : "rgba(31,58,45,0.06)") : "#fff",
                                                            fontFamily: "var(--font-mono, monospace)",
                                                            fontSize: "0.65rem",
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.1em",
                                                            color: priority === p ? (p === "high" ? "#c0392b" : GREEN) : "rgba(31,58,45,0.4)",
                                                            fontWeight: 700,
                                                            cursor: "pointer",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        {p === "high" ? "High" : "Normal"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!selectedCategory || !selectedIssue}
                                            style={{
                                                width: "100%",
                                                padding: "14px",
                                                borderRadius: 10,
                                                background: (!selectedCategory || !selectedIssue) ? "rgba(31,58,45,0.1)" : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                                                color: (!selectedCategory || !selectedIssue) ? "rgba(31,58,45,0.3)" : GOLD,
                                                border: "none",
                                                fontFamily: "var(--font-mono, monospace)",
                                                fontWeight: 700,
                                                fontSize: "0.72rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.18em",
                                                cursor: (!selectedCategory || !selectedIssue) ? "not-allowed" : "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8,
                                                boxShadow: (!selectedCategory || !selectedIssue) ? "none" : "0 4px 16px rgba(31,58,45,0.2)",
                                                transition: "all 0.25s ease",
                                            }}
                                        >
                                            <Send size={15} /> Submit Request
                                        </button>
                                    </>
                                )}
                            </motion.div>
                            {/* ↑ end modal */}
                        </motion.div>
                        {/* ↑ end backdrop */}
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

