"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    CheckCircle2, AlertCircle, Clock, RefreshCw, 
    Home, FileCheck, Key, ArrowRight 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function MoveInChecklistPage() {
    const { user, refreshUser, loading } = useAuth();
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshUser({ force: true });
        } catch (error) {
            console.error("Refresh failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Derived states
    const paymentsClear = user?.paymentSummary?.isFullyPaid === true; // Or we can assume true since they are here
    const docsVerified = user?.verification?.documentVerified === true;
    const roomAssigned = user?.roomDetails?.status === "assigned" || user?.roomDetails?.roomNumber != null;
    const isCheckedIn = user?.roomDetails?.status === "checked_in";

    useEffect(() => {
        if (!loading && isCheckedIn) {
            // Already checked in, teleport to dashboard
            router.replace("/student/dashboard");
        }
    }, [loading, isCheckedIn, router]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "100px 0" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(31,58,45,0.5)" }}>LOADING...</span>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                maxWidth: 800,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 28,
            }}
        >
            {/* Header Text */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", marginTop: 20 }}>
                <span style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: GOLD,
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 12
                }}>
                    Next Steps
                </span>
                <h1 style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: "clamp(2rem, 5vw, 3.2rem)",
                    color: GREEN,
                    lineHeight: 1.1,
                    margin: 0,
                    fontWeight: 400,
                }}>
                    Prepare for Move-In
                </h1>
                <p style={{
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "0.95rem",
                    color: "rgba(31,58,45,0.6)",
                    maxWidth: 500,
                    margin: "14px auto 0",
                    lineHeight: 1.5,
                }}>
                    You're almost home! Complete these final steps before checking in entirely and gaining access to your community dashboard.
                </p>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    style={{
                        marginTop: 20,
                        background: "rgba(31,58,45,0.06)",
                        border: "1px solid rgba(31,58,45,0.1)",
                        borderRadius: 999,
                        padding: "8px 16px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.65rem",
                        color: GREEN,
                        cursor: isRefreshing ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        transition: "all 0.2s"
                    }}
                >
                    <RefreshCw size={14} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
                    {isRefreshing ? "SYNCING..." : "SYNC STATUS"}
                </button>
            </motion.div>

            {/* Steps Container */}
            <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* 1. Payment Clearance */}
                <StepCard
                    icon={<Home size={22} />}
                    title="Account Balance Cleared"
                    desc="Your payments have been successfully processed and approved."
                    status="completed"
                />

                {/* 2. Document Verification */}
                <StepCard
                    icon={<FileCheck size={22} />}
                    title="Document Verification"
                    desc="Our administration team is reviewing your uploaded ID proofs."
                    status={docsVerified ? "completed" : "pending"}
                />

                {/* 3. Room Allocation */}
                <StepCard
                    icon={<Home size={22} />}
                    title="Room Allocation"
                    desc={roomAssigned && user?.roomDetails?.roomNumber 
                        ? `You have been allocated Room ${user.roomDetails.roomNumber}.` 
                        : "Your physical room is being prepared and assigned."}
                    status={roomAssigned ? "completed" : "pending"}
                />

                {/* 4. Physical Move-in */}
                <StepCard
                    icon={<Key size={22} />}
                    title="Property Check-In"
                    desc="Visit the property manager on-site to collect your room keys and activate your portal."
                    status="pending"
                    highlight={paymentsClear && docsVerified && roomAssigned}
                />
            </motion.div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </motion.div>
    );
}

function StepCard({ icon, title, desc, status, highlight = false }: { icon: React.ReactNode, title: string, desc: string, status: "completed" | "pending", highlight?: boolean }) {
    const isCompleted = status === "completed";
    
    return (
        <div style={{
            background: highlight ? "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)" : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: highlight ? `1.5px solid ${GOLD}` : "1px solid rgba(31,58,45,0.1)",
            borderRadius: 20,
            padding: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 20,
            boxShadow: highlight ? "0 12px 30px rgba(31,58,45,0.2)" : "0 4px 14px rgba(31,58,45,0.03)",
            transition: "all 0.3s ease",
            transform: highlight ? "scale(1.02)" : "none",
        }}>
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: highlight ? "rgba(216,181,106,0.15)" : isCompleted ? "rgba(31,58,45,0.08)" : "rgba(31,58,45,0.03)",
                color: highlight ? GOLD : isCompleted ? GREEN : "rgba(31,58,45,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>
                {isCompleted ? <CheckCircle2 size={24} /> : icon}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{
                    margin: 0,
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: highlight ? "#fff" : GREEN
                }}>
                    {title}
                </h3>
                <p style={{
                    margin: 0,
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                    color: highlight ? "rgba(246,244,239,0.8)" : "rgba(31,58,45,0.6)"
                }}>
                    {desc}
                </p>
                {highlight && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, color: GOLD, fontSize: "0.8rem", fontWeight: 600, fontFamily: "var(--font-mono, monospace)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Action Required <ArrowRight size={14} />
                    </div>
                )}
            </div>

            <div style={{
                padding: "6px 12px",
                borderRadius: 999,
                background: isCompleted ? "rgba(31,58,45,0.08)" : "rgba(216,181,106,0.15)",
                display: "flex",
                alignItems: "center",
                gap: 6
            }}>
                {isCompleted ? (
                    <><CheckCircle2 size={12} color={GREEN} /><span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GREEN, fontWeight: 700 }}>VERIFIED</span></>
                ) : (
                    <><Clock size={12} color="#9a7a3a" /><span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "#9a7a3a", fontWeight: 700 }}>PENDING</span></>
                )}
            </div>
        </div>
    );
}
