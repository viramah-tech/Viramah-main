"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wrench, CheckCircle2, Clock, AlertCircle, Plus, X, Send, Upload,
    Monitor, HardHat, Zap, MoreHorizontal, ChevronDown, Image as ImageIcon,
    User, MessageSquare, ShieldCheck, Sparkles, RefreshCw
} from "lucide-react";
import { apiGet, apiPostForm } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Department Definitions ──────────────────────────────────
const DEPARTMENTS = [
    {
        id: "software",
        label: "Software",
        icon: Monitor,
        color: "#7c3aed",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.2)",
        description: "App issues, login problems, portal bugs",
        issues: ["Portal not loading", "Login issue", "Payment page error", "App crash", "Data not showing", "Other"],
    },
    {
        id: "civil",
        label: "Civil",
        icon: HardHat,
        color: "#d97706",
        bg: "rgba(217,119,6,0.08)",
        border: "rgba(217,119,6,0.2)",
        description: "Construction, plumbing, furniture, doors",
        issues: ["Wall crack", "Leaking pipe", "Broken furniture", "Door/window issue", "Bathroom problem", "Other"],
    },
    {
        id: "electric",
        label: "Electric",
        icon: Zap,
        color: "#2563eb",
        bg: "rgba(37,99,235,0.08)",
        border: "rgba(37,99,235,0.2)",
        description: "Wiring, power, switches, fans, AC",
        issues: ["Fan not working", "Light fused", "Power outlet dead", "AC issue", "Switch broken", "Other"],
    },
    {
        id: "other",
        label: "Other",
        icon: MoreHorizontal,
        color: "#4b5563",
        bg: "rgba(75,85,99,0.08)",
        border: "rgba(75,85,99,0.2)",
        description: "WiFi, housekeeping, security, general",
        issues: ["WiFi issue", "Room not cleaned", "Lock problem", "Pest issue", "General complaint", "Other"],
    },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
    pending: { label: "Pending", icon: AlertCircle, color: "#dc2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)" },
    assigned: { label: "Assigned", icon: User, color: "#d97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)" },
    in_progress: { label: "In Progress", icon: Clock, color: "#2563eb", bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.2)" },
    resolved: { label: "Resolved", icon: CheckCircle2, color: GREEN, bg: "rgba(31,58,45,0.08)", border: "rgba(31,58,45,0.2)" },
    closed: { label: "Closed", icon: CheckCircle2, color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: "High", color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
    urgent: { label: "Urgent", color: "#b91c1c", bg: "rgba(185,28,28,0.12)" },
    normal: { label: "Normal", color: "rgba(31,58,45,0.6)", bg: "rgba(31,58,45,0.06)" },
};

interface MaintenanceRequest {
    _id: string;
    ticketId: string;
    department: string;
    issueTitle: string;
    description: string;
    priority: string;
    status: string;
    images: string[];
    assignedTo: string;
    adminNotes: string;
    createdAt: string;
    resolvedAt: string | null;
    statusHistory: { status: string; note: string; updatedBy: string; timestamp: string }[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

export default function StudentMaintenancePage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [selectedIssue, setSelectedIssue] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"normal" | "high">("normal");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedTicketId, setSubmittedTicketId] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Detail view
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const selectedDept = DEPARTMENTS.find((d) => d.id === selectedDepartment);

    // Fetch requests
    const fetchRequests = useCallback(async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const data = await apiGet<MaintenanceRequest[]>(API.maintenance.studentRequests);
            setRequests(data || []);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(() => fetchRequests(true), 3000);
        return () => clearInterval(interval);
    }, [fetchRequests]);

    // Image upload handlers
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = 3 - imageFiles.length;
        const newFiles = files.slice(0, remaining);

        setImageFiles((prev) => [...prev, ...newFiles]);

        newFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImagePreviews((prev) => [...prev, ev.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (idx: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== idx));
        setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    // Submit handler
    const handleSubmit = async () => {
        if (!selectedDepartment || !selectedIssue) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("department", selectedDepartment);
            formData.append("issueTitle", selectedIssue);
            formData.append("description", description);
            formData.append("priority", priority);
            imageFiles.forEach((file) => formData.append("images", file));

            const result = await apiPostForm<MaintenanceRequest>(API.maintenance.create, formData);
            setSubmittedTicketId(result.ticketId);
            setSubmitted(true);
            fetchRequests();

            setTimeout(() => {
                setSubmitted(false);
                setShowForm(false);
                resetForm();
            }, 2500);
        } catch (err) {
            console.error("Submit error:", err);
            alert("Failed to submit request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedDepartment(null);
        setSelectedIssue("");
        setDescription("");
        setPriority("normal");
        setImageFiles([]);
        setImagePreviews([]);
    };

    const openCount = requests.filter((r) => r.status !== "resolved" && r.status !== "closed").length;

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-8 max-w-5xl mx-auto"
            >
                {/* ── Header ── */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-serif text-3xl font-bold text-[#1F3A2D] m-0">
                                    Maintenance & Support Portal
                                </h1>
                            </div>
                            <p className="text-emerald-900/60 text-sm m-0">
                                Report room or facility issues with photo attachments and track live resolution progress
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => fetchRequests(false)}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-semibold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 text-[#1F3A2D] ${isRefreshing ? "animate-spin" : ""}`} />
                            </button>

                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F3A2D] text-[#D8B56A] font-bold text-xs shadow-md hover:bg-[#162b1e] transition-all"
                            >
                                <Plus className="w-4 h-4" /> Raise New Ticket
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total Requests", value: requests.length, color: "#1F3A2D" },
                            { label: "Resolved Issues", value: requests.filter(r => r.status === "resolved" || r.status === "closed").length, color: "#10b981" },
                            { label: "Open Tickets", value: openCount, color: openCount > 0 ? "#f59e0b" : "#1F3A2D" },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex items-center justify-between"
                            >
                                <div>
                                    <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-1">
                                        {s.label}
                                    </span>
                                    <span className="font-serif text-2xl font-bold" style={{ color: s.color }}>
                                        {s.value}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-900/5 flex items-center justify-center border border-emerald-900/10">
                                    <Wrench className="w-5 h-5 text-[#1F3A2D]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ── Department Grid ── */}
                <motion.div variants={itemVariants}>
                    <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block mb-3">
                        Select Department to Raise Ticket
                    </span>
                    <div className="grid grid-cols-4 gap-4">
                        {DEPARTMENTS.map((dept) => {
                            const Icon = dept.icon;
                            const isSelected = selectedDepartment === dept.id;
                            return (
                                <motion.button
                                    key={dept.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => { setSelectedDepartment(dept.id); setSelectedIssue(""); setShowForm(true); }}
                                    className={`p-5 rounded-2xl bg-white text-left transition-all shadow-sm border ${
                                        isSelected ? "border-[#1F3A2D] ring-2 ring-[#1F3A2D]/10" : "border-emerald-900/10 hover:border-emerald-900/30"
                                    }`}
                                >
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                                        style={{ backgroundColor: dept.bg }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: dept.color }} />
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0 mb-1">
                                        {dept.label}
                                    </h3>
                                    <p className="text-xs text-emerald-900/60 m-0 leading-relaxed">
                                        {dept.description}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Request History ── */}
                <motion.div variants={itemVariants}>
                    <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block mb-3">
                        Your Ticket History
                    </span>
                    <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-sm">
                        {loading ? (
                            <div className="p-12 text-center text-emerald-900/50 text-sm">
                                Loading your maintenance requests...
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="p-12 text-center text-emerald-900/50 text-sm">
                                No maintenance requests logged yet. Click &quot;Raise New Ticket&quot; to report an issue.
                            </div>
                        ) : (
                            requests.map((req, i) => {
                                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                                const pri = PRIORITY_CONFIG[req.priority] || PRIORITY_CONFIG.normal;
                                const StatusIcon = cfg.icon;
                                const deptData = DEPARTMENTS.find(d => d.id === req.department);
                                const DeptIcon = deptData?.icon ?? Wrench;
                                const isExpanded = expandedId === req._id;

                                return (
                                    <div key={req._id} className="border-b border-emerald-900/5 last:border-b-0">
                                        <div
                                            onClick={() => setExpandedId(isExpanded ? null : req._id)}
                                            className={`p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-emerald-50/40 ${
                                                isExpanded ? "bg-emerald-50/60" : ""
                                            }`}
                                        >
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: deptData?.bg || "rgba(31,58,45,0.06)" }}
                                            >
                                                <DeptIcon className="w-5 h-5" style={{ color: deptData?.color || GREEN }} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-sm text-[#1F3A2D]">{req.issueTitle}</span>
                                                    <span className="font-mono text-xs text-emerald-900/40">{req.ticketId}</span>
                                                    {req.priority !== "normal" && (
                                                        <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold" style={{ backgroundColor: pri.bg, color: pri.color }}>
                                                            {pri.label.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-emerald-900/60 m-0 truncate">
                                                    {deptData?.label || req.department} · {req.description || "No detailed description"}
                                                </p>
                                                <span className="font-mono text-[0.65rem] text-emerald-900/40 mt-1 block">
                                                    Submitted: {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                                    {req.resolvedAt ? ` · Resolved: ${new Date(req.resolvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                            </div>

                                            <ChevronDown className={`w-4 h-4 text-emerald-900/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                        </div>

                                        {/* Expanded Detail */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden bg-emerald-50/20"
                                                >
                                                    <div className="p-5 pt-2 flex flex-col gap-4 border-t border-emerald-900/5">
                                                        {/* Images */}
                                                        {req.images && req.images.length > 0 && (
                                                            <div>
                                                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                                                    Uploaded Photos (S3 Direct)
                                                                </span>
                                                                <div className="flex gap-3 flex-wrap">
                                                                    {req.images.map((url, idx) => (
                                                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                                                                            <img
                                                                                src={url}
                                                                                alt={`Photo ${idx + 1}`}
                                                                                className="w-24 h-24 object-cover rounded-xl border border-emerald-900/10 shadow-sm group-hover:scale-105 transition-all"
                                                                            />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Admin notes */}
                                                        {req.adminNotes && (
                                                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                                                <div className="flex items-center gap-2 mb-1 text-amber-800 font-bold text-xs">
                                                                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                                                                    Maintenance Team Response
                                                                </div>
                                                                <p className="text-xs text-amber-900 m-0 leading-relaxed">
                                                                    {req.adminNotes}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {req.assignedTo && (
                                                            <div className="flex items-center gap-2 text-xs text-emerald-900/60 font-medium">
                                                                <User className="w-3.5 h-3.5 text-emerald-700" />
                                                                Assigned Technician: <strong className="text-[#1F3A2D]">{req.assignedTo}</strong>
                                                            </div>
                                                        )}

                                                        {/* Timeline */}
                                                        {req.statusHistory && req.statusHistory.length > 0 && (
                                                            <div>
                                                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                                                    Status History Timeline
                                                                </span>
                                                                <div className="space-y-3">
                                                                    {req.statusHistory.map((entry, idx) => {
                                                                        const sCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
                                                                        return (
                                                                            <div key={idx} className="flex items-start gap-3">
                                                                                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: sCfg.color }} />
                                                                                <div>
                                                                                    <span className="font-bold text-xs" style={{ color: sCfg.color }}>
                                                                                        {sCfg.label}
                                                                                    </span>
                                                                                    <span className="font-mono text-[0.65rem] text-emerald-900/40 ml-2">
                                                                                        {new Date(entry.timestamp).toLocaleString("en-IN")}
                                                                                    </span>
                                                                                    {entry.note && (
                                                                                        <p className="text-xs text-emerald-900/70 m-0 mt-0.5">
                                                                                            {entry.note}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* ── New Request Modal ── */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowForm(false); setSubmitted(false); }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-xl w-full border border-emerald-900/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {submitted ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h2 className="font-serif text-2xl font-bold text-[#1F3A2D] mb-2">
                                        Ticket Submitted!
                                    </h2>
                                    <p className="text-xs text-emerald-900/60 m-0 mb-4">
                                        Our maintenance team has received your request and will attend to it shortly.
                                    </p>
                                    <div className="inline-block px-4 py-2 rounded-xl bg-emerald-900/5 border border-emerald-900/10 font-mono text-xs font-bold text-[#1F3A2D]">
                                        Ticket ID: {submittedTicketId}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="font-serif text-xl font-bold text-[#1F3A2D] m-0">
                                                Raise Maintenance Request
                                            </h2>
                                            <p className="text-xs text-emerald-900/60 m-0 mt-1">
                                                Provide issue details and attach photos for the maintenance team
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowForm(false)}
                                            className="w-8 h-8 rounded-xl bg-emerald-900/5 hover:bg-emerald-900/10 flex items-center justify-center text-emerald-900/60 transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Department Select */}
                                    <div className="mb-5">
                                        <label className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                            Department *
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {DEPARTMENTS.map((dept) => {
                                                const Icon = dept.icon;
                                                const isSelected = selectedDepartment === dept.id;
                                                return (
                                                    <button
                                                        key={dept.id}
                                                        onClick={() => { setSelectedDepartment(dept.id); setSelectedIssue(""); }}
                                                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                                                            isSelected ? "border-[#1F3A2D] bg-[#1F3A2D]/5 font-bold" : "border-emerald-900/10 hover:border-emerald-900/20 bg-white"
                                                        }`}
                                                    >
                                                        <Icon className="w-5 h-5" style={{ color: dept.color }} />
                                                        <span className="text-xs text-[#1F3A2D]">{dept.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Issue Select */}
                                    {selectedDept && (
                                        <div className="mb-5">
                                            <label className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                                Issue Type *
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDept.issues.map((issue) => (
                                                    <button
                                                        key={issue}
                                                        onClick={() => setSelectedIssue(issue)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                            selectedIssue === issue ? "bg-[#1F3A2D] text-white border-[#1F3A2D]" : "bg-white text-emerald-900/70 border-emerald-900/15"
                                                        }`}
                                                    >
                                                        {issue}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="mb-5">
                                        <label className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                            Detailed Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Explain the issue (room location, specific problem)..."
                                            className="w-full p-3 rounded-xl border border-emerald-900/15 text-xs text-[#1F3A2D] focus:outline-none focus:border-[#1F3A2D]"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="mb-5">
                                        <label className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                            Upload Photos (Max 3 - Goes directly to AWS S3)
                                        </label>
                                        <div className="flex gap-3 flex-wrap">
                                            {imagePreviews.map((preview, idx) => (
                                                <div key={idx} className="relative w-20 h-20">
                                                    <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-emerald-900/15" />
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-md"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {imageFiles.length < 3 && (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-20 h-20 rounded-xl border-2 border-dashed border-emerald-900/20 hover:border-emerald-900/40 bg-emerald-900/5 flex flex-col items-center justify-center gap-1 text-emerald-900/50 transition-all"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    <span className="text-[0.6rem] font-semibold">Add Photo</span>
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Priority */}
                                    <div className="mb-6">
                                        <label className="font-mono text-[0.65rem] font-bold text-emerald-900/50 uppercase tracking-wider block mb-2">
                                            Priority Level
                                        </label>
                                        <div className="flex gap-3">
                                            {(["normal", "high"] as const).map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setPriority(p)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border uppercase transition-all ${
                                                        priority === p
                                                            ? p === "high" ? "bg-red-500/10 text-red-600 border-red-500/30" : "bg-[#1F3A2D] text-white border-[#1F3A2D]"
                                                            : "bg-white text-emerald-900/60 border-emerald-900/15"
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!selectedDepartment || !selectedIssue || submitting}
                                        className="w-full py-3.5 rounded-xl bg-[#1F3A2D] text-[#D8B56A] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#162b1e] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        {submitting ? "Uploading to S3 & Creating Ticket..." : "Submit Ticket"}
                                    </button>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
