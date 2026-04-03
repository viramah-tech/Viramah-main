"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Check, ArrowRight, Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

// ── Brand palette ────────────────────────────────────────────────
const BRAND_GREEN = "#1F3A2D";
const BRAND_GOLD = "#D8B56A";
const BRAND_CREAM = "#F6F4EF";

// ── Animation variants ──────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 28, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};
const cardVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.97 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

// ── Types ────────────────────────────────────────────────────────
interface VerificationState {
    verified: boolean;
    verifiedAt: string | null;
    masked: string;
    otpSent: boolean;
    loading: boolean;
    cooldown: number;
    error: string;
    success: string;
}

// ── 6-Digit OTP Input Component ─────────────────────────────────
function OtpInput({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (val: string) => void;
    disabled: boolean;
}) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, char: string) => {
        if (!/^\d?$/.test(char)) return;
        const arr = value.split("");
        while (arr.length < 6) arr.push("");
        arr[index] = char;
        const newVal = arr.join("").slice(0, 6);
        onChange(newVal);
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        onChange(pasted);
        const focusIdx = Math.min(pasted.length, 5);
        inputRefs.current[focusIdx]?.focus();
    };

    return (
        <div style={{ display: "flex", gap: "clamp(4px, 1.5vw, 8px)", justifyContent: "center" }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={disabled}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    autoFocus={i === 0}
                    style={{
                        width: "clamp(36px, 12vw, 48px)",
                        height: "clamp(44px, 14vw, 56px)",
                        textAlign: "center",
                        fontSize: "clamp(1.1rem, 4vw, 1.5rem)",
                        fontFamily: "var(--font-mono, monospace)",
                        fontWeight: 700,
                        color: BRAND_GREEN,
                        background: disabled ? "rgba(31,58,45,0.04)" : "#fff",
                        border: `2px solid ${value[i] ? BRAND_GOLD : "rgba(31,58,45,0.15)"}`,
                        borderRadius: 10,
                        outline: "none",
                        transition: "all 0.2s ease",
                        caretColor: BRAND_GOLD,
                        opacity: disabled ? 0.5 : 1,
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = BRAND_GOLD;
                        e.target.style.boxShadow = `0 0 0 3px rgba(216,181,106,0.15)`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = value[i] ? BRAND_GOLD : "rgba(31,58,45,0.15)";
                        e.target.style.boxShadow = "none";
                    }}
                />
            ))}
        </div>
    );
}

// ── Countdown Timer ─────────────────────────────────────────────
function CooldownTimer({ seconds }: { seconds: number }) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return (
        <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.75rem",
            color: "rgba(31,58,45,0.5)",
            letterSpacing: "0.05em",
        }}>
            Resend in {mins > 0 ? `${mins}:` : ""}{String(secs).padStart(2, "0")}
        </span>
    );
}


export default function VerifyContactPage() {
    const { user, loading, isAuthenticated, refreshUser } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    // ── Email verification state ─────────────────────────────────
    const [emailState, setEmailState] = useState<VerificationState>({
        verified: false, verifiedAt: null, masked: "", otpSent: false,
        loading: false, cooldown: 0, error: "", success: "",
    });
    const [emailOtp, setEmailOtp] = useState("");

    // ── Phone number collection state (no OTP verification) ──────
    const [phoneInput, setPhoneInput] = useState("");
    const [phoneSaved, setPhoneSaved] = useState(false);
    const [phoneSaving, setPhoneSaving] = useState(false);
    const [existingPhone, setExistingPhone] = useState("");

    // ── Auth guard ───────────────────────────────────────────────
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    // ── Fetch initial verification status ────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const res = await apiFetch<{ data: {
                email: { address: string; verified: boolean; verifiedAt: string | null };
                phone: { number: string | null; hasPhone: boolean; verified: boolean; verifiedAt: string | null };
                allVerified: boolean;
            }}>("/api/public/verification/status");

            const d = res.data;
            setEmailState(prev => ({
                ...prev, verified: d.email.verified, verifiedAt: d.email.verifiedAt, masked: d.email.address,
            }));
            if (d.phone.hasPhone && d.phone.number) {
                setExistingPhone(d.phone.number);
                setPhoneSaved(true);
            }
        } catch {
            // Non-critical
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchStatus();
    }, [isAuthenticated, fetchStatus]);

    // ── Cooldown timer ───────────────────────────────────────────
    useEffect(() => {
        if (emailState.cooldown <= 0) return;
        const t = setInterval(() => setEmailState(p => ({ ...p, cooldown: Math.max(0, p.cooldown - 1) })), 1000);
        return () => clearInterval(t);
    }, [emailState.cooldown]);

    // ── Email: Send OTP ──────────────────────────────────────────
    const handleSendEmailOtp = async () => {
        setEmailState(p => ({ ...p, loading: true, error: "", success: "" }));
        try {
            const res = await apiFetch<{ message: string; data: { maskedEmail: string; expiresIn: number } }>(
                "/api/public/verification/email/send",
                { method: "POST" }
            );
            setEmailState(p => ({
                ...p, loading: false, otpSent: true, cooldown: 60,
                masked: res.data.maskedEmail, success: res.message,
            }));
            setEmailOtp("");
            showToast(res.message, "success");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to send code";
            setEmailState(p => ({ ...p, loading: false, error: msg }));
            showToast(msg, "error");
        }
    };

    // ── Email: Verify OTP ────────────────────────────────────────
    const handleVerifyEmail = async () => {
        if (emailOtp.length !== 6) return;
        setEmailState(p => ({ ...p, loading: true, error: "", success: "" }));
        try {
            await apiFetch("/api/public/verification/email/verify", {
                method: "POST", body: { otp: emailOtp },
            });
            setEmailState(p => ({
                ...p, loading: false, verified: true, verifiedAt: new Date().toISOString(),
                otpSent: false, success: "Email verified successfully!",
            }));
            showToast("Email verified! ✓", "success");
            await refreshUser();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            setEmailState(p => ({ ...p, loading: false, error: msg }));
            showToast(msg, "error");
        }
    };

    // ── Phone: Save number (no OTP) ──────────────────────────────
    const handleSavePhone = async () => {
        const cleaned = phoneInput.replace(/\D/g, "");
        if (cleaned.length < 10) {
            showToast("Please enter a valid 10-digit phone number", "error");
            return;
        }
        setPhoneSaving(true);
        try {
            // Use the phone send endpoint to save the phone number to the user profile
            // The OTP won't be verified, but the number gets stored
            await apiFetch("/api/public/verification/phone/send", {
                method: "POST", body: { phone: cleaned },
            });
            setPhoneSaved(true);
            setExistingPhone(`******${cleaned.slice(-4)}`);
            showToast("Phone number saved successfully", "success");
            await refreshUser();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to save phone number";
            showToast(msg, "error");
        } finally {
            setPhoneSaving(false);
        }
    };

    // ── Continue handler ─────────────────────────────────────────
    const canContinue = emailState.verified && phoneSaved;
    const handleContinue = () => {
        if (canContinue) {
            router.push("/user-onboarding/terms");
        }
    };

    // ── Loading / auth checks ────────────────────────────────────
    if (loading) return (
        <div style={{ minHeight: "100vh", background: BRAND_CREAM, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(31,58,45,0.5)" }}>Loading...</p>
        </div>
    );
    if (!isAuthenticated) return null;

    return (
        <div style={{ minHeight: "100vh", background: BRAND_CREAM }}>
            {/* ── Header ────────────────────────────────────────── */}
            <header style={{
                position: "sticky", top: 0, zIndex: 40,
                background: "rgba(246,244,239,0.92)", backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(31,58,45,0.1)", padding: "12px clamp(12px, 4vw, 24px)",
            }}>
                <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "rgba(31,58,45,0.5)" }}>
                        <ArrowLeft size={16} />
                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em" }} className="hidden sm:block">
                            Back
                        </span>
                    </Link>
                    <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                        <div style={{ width: 32, height: 32 }}>
                            <img src="/logo.png" alt="Viramah Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1rem", color: BRAND_GREEN, letterSpacing: "0.05em" }} className="hidden sm:block">
                            VIRAMAH
                        </span>
                    </Link>
                </div>
            </header>

            {/* ── Main Content ──────────────────────────────────── */}
            <main style={{ maxWidth: 660, margin: "0 auto", padding: "clamp(24px, 6vw, 48px) clamp(12px, 4vw, 24px) 120px" }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {/* Title */}
                    <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: "clamp(24px, 6vw, 40px)" }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            background: `linear-gradient(135deg, ${BRAND_GREEN}, #2a4d3a)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px",
                            boxShadow: "0 8px 32px rgba(31,58,45,0.2)",
                        }}>
                            <Shield size={24} color={BRAND_GOLD} />
                        </div>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem",
                            textTransform: "uppercase", letterSpacing: "0.35em", color: BRAND_GOLD, marginBottom: 10,
                        }}>
                            Account Verification
                        </p>
                        <h1 style={{
                            fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                            color: BRAND_GREEN, lineHeight: 1.15, fontWeight: 400, margin: "0 0 12px",
                        }}>
                            Verify your contact details
                        </h1>
                        <p style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                            color: "rgba(46,42,38,0.55)", maxWidth: 440, margin: "0 auto",
                        }}>
                            Verify your email and provide your phone number to continue with onboarding.
                        </p>
                    </motion.div>

                    {/* ── Progress indicator ─────────────────────── */}
                    <motion.div variants={itemVariants} style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 36,
                    }}>
                        <StepDot done={emailState.verified} label="Email" />
                        <div style={{ width: "clamp(20px, 8vw, 40px)", height: 2, background: emailState.verified ? BRAND_GREEN : "rgba(31,58,45,0.12)", transition: "background 0.5s" }} />
                        <StepDot done={phoneSaved} label="Phone" />
                        <div style={{ width: "clamp(20px, 8vw, 40px)", height: 2, background: canContinue ? BRAND_GREEN : "rgba(31,58,45,0.12)", transition: "background 0.5s" }} />
                        <StepDot done={canContinue} label="Done" />
                    </motion.div>

                    {/* ── Cards ──────────────────────────────────── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* EMAIL CARD — Full OTP verification */}
                        <motion.div variants={cardVariants}>
                            <VerificationCard
                                icon={<Mail size={20} color={emailState.verified ? "#fff" : BRAND_GOLD} />}
                                title="Email Address"
                                subtitle={user?.email || emailState.masked}
                                verified={emailState.verified}
                                verifiedAt={emailState.verifiedAt}
                            >
                                {!emailState.verified && (
                                    <div style={{ marginTop: 20 }}>
                                        {!emailState.otpSent ? (
                                            <ActionButton
                                                onClick={handleSendEmailOtp}
                                                loading={emailState.loading}
                                                disabled={emailState.loading}
                                            >
                                                {emailState.loading ? "Sending..." : "Send Verification Code"}
                                            </ActionButton>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                                <OtpInput value={emailOtp} onChange={setEmailOtp} disabled={emailState.loading} />

                                                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: "column", alignItems: "center" }}>
                                                    <ActionButton
                                                        onClick={handleVerifyEmail}
                                                        loading={emailState.loading}
                                                        disabled={emailState.loading || emailOtp.length !== 6}
                                                        variant="primary"
                                                    >
                                                        {emailState.loading ? "Verifying..." : "Verify Code"}
                                                    </ActionButton>

                                                    <button
                                                        onClick={handleSendEmailOtp}
                                                        disabled={emailState.cooldown > 0 || emailState.loading}
                                                        style={{
                                                            display: "flex", alignItems: "center", gap: 6,
                                                            padding: "10px 18px", border: `1.5px solid rgba(31,58,45,0.15)`,
                                                            borderRadius: 10, background: "none", cursor: emailState.cooldown > 0 ? "not-allowed" : "pointer",
                                                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem",
                                                            color: emailState.cooldown > 0 ? "rgba(31,58,45,0.3)" : BRAND_GREEN,
                                                            textTransform: "uppercase", letterSpacing: "0.1em",
                                                            opacity: emailState.cooldown > 0 ? 0.6 : 1,
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        <RefreshCw size={12} />
                                                        {emailState.cooldown > 0 ? <CooldownTimer seconds={emailState.cooldown} /> : "Resend"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <AnimatePresence>
                                            {emailState.error && (
                                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    style={{
                                                        fontFamily: "var(--font-body, sans-serif)", fontSize: "0.8rem",
                                                        color: "#c0392b", textAlign: "center", marginTop: 8,
                                                        padding: "8px 12px", borderRadius: 8,
                                                        background: "rgba(192,57,43,0.06)",
                                                    }}>
                                                    {emailState.error}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </VerificationCard>
                        </motion.div>

                        {/* PHONE CARD — Simple number collection, no OTP */}
                        <motion.div variants={cardVariants}>
                            <VerificationCard
                                icon={<Phone size={20} color={phoneSaved ? "#fff" : BRAND_GOLD} />}
                                title="Phone Number"
                                subtitle={phoneSaved ? existingPhone : "Add your phone number"}
                                verified={phoneSaved}
                                verifiedAt={null}
                                badgeLabel={phoneSaved ? "Saved" : "Required"}
                            >
                                {!phoneSaved && (
                                    <div style={{ marginTop: 20 }}>
                                        <label style={{
                                            display: "block", fontFamily: "var(--font-mono, monospace)",
                                            fontSize: "0.6rem", textTransform: "uppercase",
                                            letterSpacing: "0.2em", color: "rgba(31,58,45,0.5)",
                                            marginBottom: 8, fontWeight: 700,
                                        }}>
                                            Enter your mobile number
                                        </label>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                                            <span style={{
                                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem",
                                                color: BRAND_GREEN, padding: "12px 10px",
                                                background: "rgba(31,58,45,0.04)", border: "1.5px solid rgba(31,58,45,0.12)",
                                                borderRadius: 10, flexShrink: 0,
                                            }}>+91</span>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                placeholder="9876543210"
                                                value={phoneInput}
                                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                style={{
                                                    flex: 1, minWidth: 0, padding: "12px 12px",
                                                    fontFamily: "var(--font-body, sans-serif)", fontSize: "0.95rem",
                                                    color: BRAND_GREEN, background: "#fff",
                                                    border: "1.5px solid rgba(31,58,45,0.15)", borderRadius: 10,
                                                    outline: "none", transition: "all 0.2s",
                                                }}
                                                onFocus={(e) => { e.target.style.borderColor = BRAND_GREEN; e.target.style.boxShadow = "0 0 0 3px rgba(31,58,45,0.08)"; }}
                                                onBlur={(e) => { e.target.style.borderColor = "rgba(31,58,45,0.15)"; e.target.style.boxShadow = "none"; }}
                                            />
                                        </div>

                                        <ActionButton
                                            onClick={handleSavePhone}
                                            loading={phoneSaving}
                                            disabled={phoneSaving || phoneInput.replace(/\D/g, "").length < 10}
                                        >
                                            {phoneSaving ? "Saving..." : "Save Phone Number"}
                                        </ActionButton>
                                    </div>
                                )}
                            </VerificationCard>
                        </motion.div>
                    </div>

                    {/* ── Continue button ────────────────────────── */}
                    <motion.div variants={itemVariants} style={{ marginTop: 36 }}>
                        <AnimatePresence>
                            {canContinue && (
                                <motion.div
                                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <div style={{
                                        textAlign: "center", marginBottom: 20, padding: "16px 24px",
                                        background: "rgba(46,107,79,0.06)", borderRadius: 12,
                                        border: "1px solid rgba(46,107,79,0.15)",
                                    }}>
                                        <div style={{
                                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: "50%",
                                                background: "#2E6B4F", display: "flex", alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <Check size={14} color="#fff" strokeWidth={3} />
                                            </div>
                                            <span style={{
                                                fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem",
                                                color: "#2E6B4F", fontWeight: 600,
                                            }}>
                                                Contact details confirmed
                                            </span>
                                        </div>
                                    </div>

                                    <ContinueButton onClick={handleContinue}>
                                        Continue to Onboarding <ArrowRight size={16} />
                                    </ContinueButton>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!canContinue && (
                            <p style={{
                                textAlign: "center", fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.6rem", color: "rgba(31,58,45,0.35)", letterSpacing: "0.05em", marginTop: 8,
                            }}>
                                {!emailState.verified
                                    ? "Verify your email to continue"
                                    : "Add your phone number to continue"}
                            </p>
                        )}
                    </motion.div>

                    {/* ── Security note ──────────────────────────── */}
                    <motion.div variants={itemVariants} style={{
                        textAlign: "center", marginTop: 32, padding: "16px",
                        borderTop: "1px solid rgba(31,58,45,0.08)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <Shield size={12} color="rgba(31,58,45,0.3)" />
                            <span style={{
                                fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                                color: "rgba(31,58,45,0.35)", letterSpacing: "0.05em",
                            }}>
                                Your data is encrypted and secure
                            </span>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}


// ═══════════════════════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════════════════════

function StepDot({ done, label }: { done: boolean; label: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <motion.div
                animate={{
                    background: done ? BRAND_GREEN : "rgba(31,58,45,0.08)",
                    borderColor: done ? BRAND_GREEN : "rgba(31,58,45,0.2)",
                    scale: done ? 1.05 : 1,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid",
                }}
            >
                {done ? (
                    <Check size={14} color={BRAND_GOLD} strokeWidth={2.5} />
                ) : (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(31,58,45,0.2)" }} />
                )}
            </motion.div>
            <span style={{
                fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem",
                textTransform: "uppercase", letterSpacing: "0.15em",
                color: done ? BRAND_GREEN : "rgba(31,58,45,0.35)", fontWeight: 600,
            }}>
                {label}
            </span>
        </div>
    );
}

function VerificationCard({
    icon, title, subtitle, verified, verifiedAt, badgeLabel, children,
}: {
    icon: React.ReactNode; title: string; subtitle: string;
    verified: boolean; verifiedAt: string | null;
    badgeLabel?: string;
    children?: React.ReactNode;
}) {
    return (
        <div style={{
            background: "#fff", borderRadius: 16, padding: "clamp(16px, 4vw, 28px)",
            border: `1.5px solid ${verified ? "rgba(46,107,79,0.25)" : "rgba(31,58,45,0.1)"}`,
            boxShadow: verified
                ? "0 4px 24px rgba(46,107,79,0.08)"
                : "0 2px 16px rgba(31,58,45,0.04)",
            transition: "all 0.4s ease",
            position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: verified
                    ? "linear-gradient(90deg, #2E6B4F, #4a9a6f)"
                    : `linear-gradient(90deg, ${BRAND_GREEN}, ${BRAND_GOLD})`,
                opacity: verified ? 1 : 0.4,
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: verified
                            ? "linear-gradient(135deg, #2E6B4F, #3d8a64)"
                            : `linear-gradient(135deg, rgba(31,58,45,0.08), rgba(31,58,45,0.04))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "all 0.4s ease",
                    }}>
                        {icon}
                    </div>
                    <div>
                        <h3 style={{
                            fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem",
                            fontWeight: 600, color: BRAND_GREEN, margin: "0 0 4px",
                        }}>{title}</h3>
                        <p style={{
                            fontFamily: "var(--font-mono, monospace)", fontSize: "0.75rem",
                            color: "rgba(31,58,45,0.45)", margin: 0, letterSpacing: "0.02em",
                        }}>{subtitle}</p>
                    </div>
                </div>

                <motion.div
                    animate={{ scale: verified ? 1 : 0.95, opacity: 1 }}
                    style={{
                        padding: "6px 14px", borderRadius: 20,
                        background: verified ? "rgba(46,107,79,0.08)" : "rgba(216,181,106,0.1)",
                        border: `1px solid ${verified ? "rgba(46,107,79,0.2)" : "rgba(216,181,106,0.25)"}`,
                        display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                    }}
                >
                    {verified ? (
                        <Check size={12} color="#2E6B4F" strokeWidth={2.5} />
                    ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND_GOLD, animation: "pulse 2s infinite" }} />
                    )}
                    <span style={{
                        fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                        textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700,
                        color: verified ? "#2E6B4F" : BRAND_GOLD,
                    }}>
                        {badgeLabel || (verified ? "Verified" : "Pending")}
                    </span>
                </motion.div>
            </div>

            {verified && verifiedAt && (
                <p style={{
                    fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem",
                    color: "rgba(31,58,45,0.35)", marginTop: 12, marginBottom: 0,
                    letterSpacing: "0.05em",
                }}>
                    Verified on {new Date(verifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
            )}

            {children}

            <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    );
}

function ActionButton({
    children, onClick, loading, disabled, variant = "secondary",
}: {
    children: React.ReactNode; onClick: () => void;
    loading?: boolean; disabled?: boolean; variant?: "primary" | "secondary";
}) {
    const [hovered, setHovered] = useState(false);
    const isPrimary = variant === "primary";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 24px", width: isPrimary ? undefined : "100%",
                background: isPrimary
                    ? (hovered ? `linear-gradient(135deg, #2a4d3a, ${BRAND_GREEN})` : `linear-gradient(135deg, ${BRAND_GREEN}, #162b1e)`)
                    : (hovered ? "rgba(31,58,45,0.06)" : "rgba(31,58,45,0.03)"),
                color: isPrimary ? BRAND_GOLD : BRAND_GREEN,
                border: isPrimary ? "none" : "1.5px solid rgba(31,58,45,0.15)",
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)", fontWeight: 700,
                fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.15em",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transform: hovered && !disabled ? "translateY(-1px)" : "translateY(0)",
                boxShadow: isPrimary && hovered ? "0 8px 24px rgba(31,58,45,0.25)" : "none",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {loading && <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />}
            {children}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}

function ContinueButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "16px 24px",
                background: hovered
                    ? `linear-gradient(135deg, #2a4d3a, ${BRAND_GREEN})`
                    : `linear-gradient(135deg, ${BRAND_GREEN}, #162b1e)`,
                color: BRAND_GOLD, border: "none", borderRadius: 12,
                fontFamily: "var(--font-mono, monospace)", fontWeight: 700,
                fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.2em",
                cursor: "pointer",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered ? "0 12px 36px rgba(31,58,45,0.3)" : "0 4px 16px rgba(31,58,45,0.15)",
                transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}
