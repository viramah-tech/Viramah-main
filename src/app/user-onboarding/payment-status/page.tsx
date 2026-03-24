"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Shield, CheckCircle2, Home, Phone, Mail } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth, type AuthUser } from "@/context/AuthContext";
import { useSocket } from "@/hooks/useSocket";
import { containerVariants, itemVariants } from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const STATUS_MAP = {
    pending: {
        icon: Clock,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Payment Under Review",
        subtitle: "We've received your payment proof and it's being verified by our team.",
        badge: "Pending Verification",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    payment_submitted: {
        icon: Clock,
        iconColor: GOLD,
        iconBg: "rgba(216,181,106,0.15)",
        title: "Payment Under Review",
        subtitle: "We've received your payment proof and it's being verified by our team.",
        badge: "Pending Verification",
        badgeBg: "rgba(216,181,106,0.12)",
        badgeColor: "#9a7a3a",
        badgeBorder: "rgba(216,181,106,0.3)",
    },
    move_in_approved: {
        icon: Home,
        iconColor: GREEN,
        iconBg: "rgba(31,58,45,0.1)",
        title: "Move-in Approved!",
        subtitle: "Your room is ready. Welcome to the VIRAMAH community!",
        badge: "Approved",
        badgeBg: "rgba(31,58,45,0.08)",
        badgeColor: GREEN,
        badgeBorder: "rgba(31,58,45,0.2)",
    },
};

export default function PaymentStatusPage() {
    const { state, setStatus } = useOnboarding();
    const { user, updateUser } = useAuth();

    // Map backend paymentStatus to onboarding status
    useEffect(() => {
        if (user?.paymentStatus === "approved") {
            setStatus("move_in_approved");
        } else if (user?.paymentStatus === "rejected") {
            setStatus("pending");
        }
    }, [user?.paymentStatus, setStatus]);

    // Real-time: listen for user updates (payment status changes)
    const handleSocketEvent = useCallback((event: string, data: unknown) => {
        if (event === "user:updated" && data) {
            updateUser(data as Partial<AuthUser>);
        }
    }, [updateUser]);
    useSocket(user?._id, handleSocketEvent);

    const statusKey = state.status === "pending" ? "payment_submitted" : state.status;
    const status = STATUS_MAP[statusKey] || STATUS_MAP.payment_submitted;
    const StatusIcon = status.icon;

    const isMoveInApproved = state.status === "move_in_approved";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 28,
                paddingBottom: 32,
                minHeight: "60vh",
                justifyContent: "center",
            }}
        >
            {/* Status Icon */}
            <motion.div variants={itemVariants} style={{ textAlign: "center" }}>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: status.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: `0 8px 32px ${status.iconBg}`,
                    }}
                >
                    <StatusIcon size={36} color={status.iconColor} />
                </motion.div>

                {/* Badge */}
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 16px",
                        borderRadius: 999,
                        background: status.badgeBg,
                        border: `1px solid ${status.badgeBorder}`,
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: status.badgeColor,
                        }}
                    />
                    <span
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.62rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            color: status.badgeColor,
                            fontWeight: 700,
                        }}
                    >
                        {status.badge}
                    </span>
                </div>

                <h1
                    style={{
                        fontFamily: "var(--font-display, serif)",
                        fontSize: "clamp(2rem, 4vw, 2.8rem)",
                        color: GREEN,
                        lineHeight: 1.1,
                        fontWeight: 400,
                        marginBottom: 10,
                    }}
                >
                    {status.title}
                </h1>
                <p
                    style={{
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "0.9rem",
                        color: "rgba(31,58,45,0.55)",
                        maxWidth: 420,
                        margin: "0 auto",
                        lineHeight: 1.6,
                    }}
                >
                    {status.subtitle}
                </p>
            </motion.div>

            {/* Timeline Steps */}
            <motion.div
                variants={itemVariants}
                style={{
                    background: "#fff",
                    borderRadius: 20,
                    border: "1px solid rgba(31,58,45,0.1)",
                    padding: 32,
                    boxShadow: "0 4px 24px rgba(31,58,45,0.07)",
                }}
            >
                <p
                    style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.62rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.25em",
                        color: "rgba(31,58,45,0.55)",
                        fontWeight: 700,
                        marginBottom: 20,
                    }}
                >
                    What happens next
                </p>

                {[
                    {
                        step: "1",
                        title: "Payment Verification",
                        desc: "Our team verifies your payment proof (24-48 hours)",
                        done: state.status === "move_in_approved",
                        active: state.status === "payment_submitted" || state.status === "pending",
                    },
                    {
                        step: "2",
                        title: "Document Review",
                        desc: "KYC and identity documents are reviewed",
                        done: state.status === "move_in_approved",
                        active: false,
                    },
                    {
                        step: "3",
                        title: "Move-in Approval",
                        desc: "Room assignment confirmed and dashboard access granted",
                        done: state.status === "move_in_approved",
                        active: false,
                    },
                ].map((item, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            gap: 16,
                            paddingBottom: i < 2 ? 20 : 0,
                            marginBottom: i < 2 ? 20 : 0,
                            borderBottom: i < 2 ? "1px solid rgba(31,58,45,0.06)" : "none",
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: item.done ? GREEN : item.active ? "rgba(216,181,106,0.15)" : "rgba(31,58,45,0.06)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                border: item.active ? `2px solid ${GOLD}` : "none",
                            }}
                        >
                            {item.done ? (
                                <CheckCircle2 size={16} color={GOLD} />
                            ) : (
                                <span
                                    style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        color: item.active ? GOLD : "rgba(31,58,45,0.3)",
                                    }}
                                >
                                    {item.step}
                                </span>
                            )}
                        </div>
                        <div>
                            <p
                                style={{
                                    fontFamily: "var(--font-body, sans-serif)",
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: item.done || item.active ? GREEN : "rgba(31,58,45,0.4)",
                                    margin: 0,
                                }}
                            >
                                {item.title}
                            </p>
                            <p
                                style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.65rem",
                                    color: "rgba(31,58,45,0.4)",
                                    margin: "4px 0 0",
                                    letterSpacing: "0.03em",
                                }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Dashboard access notice */}
            {!isMoveInApproved && (
                <motion.div
                    variants={itemVariants}
                    style={{
                        background: "rgba(31,58,45,0.04)",
                        border: "1px solid rgba(31,58,45,0.1)",
                        borderRadius: 12,
                        padding: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                    }}
                >
                    <Shield size={20} color="rgba(31,58,45,0.4)" />
                    <div>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 600, color: GREEN, margin: 0 }}>
                            Dashboard access is restricted
                        </p>
                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", margin: "4px 0 0" }}>
                            Your student dashboard will be enabled after admin verification and move-in approval.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Move-in approved CTA */}
            {isMoveInApproved && (
                <motion.div
                    variants={itemVariants}
                    style={{ textAlign: "center" }}
                >
                    <a
                        href="/student/dashboard"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "14px 32px",
                            background: "linear-gradient(135deg, #1F3A2D, #162b1e)",
                            color: GOLD,
                            border: "none",
                            borderRadius: 10,
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            textDecoration: "none",
                            boxShadow: "0 4px 14px rgba(31,58,45,0.18)",
                            transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                        }}
                    >
                        <Home size={16} />
                        Go to Dashboard
                    </a>
                </motion.div>
            )}

            {/* Contact Info */}
            <motion.div
                variants={itemVariants}
                style={{
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(31,58,45,0.35)" }}>
                    Need help? Contact us
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                    <a href="tel:+919876543210" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                        <Phone size={14} color="rgba(31,58,45,0.4)" />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>+91 98765 43210</span>
                    </a>
                    <a href="mailto:support@viramah.com" style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
                        <Mail size={14} color="rgba(31,58,45,0.4)" />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>support@viramah.com</span>
                    </a>
                </div>
            </motion.div>
        </motion.div>
    );
}
