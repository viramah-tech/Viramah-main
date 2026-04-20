"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

type Step = "email" | "otp" | "password";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
    },
};

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const { showToast } = useToast();

    // Auto-redirect after success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => router.replace("/login"), 3000);
            return () => clearTimeout(timer);
        }
    }, [success, router]);

    // ── Step 1: Send OTP ────────────────────────────────────
    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        setError("");
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await apiFetch<{ data: { maskedEmail: string } }>("/api/public/auth/forgot-password/send-otp", {
                method: "POST",
                body: { email },
            });
            setMaskedEmail(res.data.maskedEmail);
            setStep("otp");
            showToast("OTP sent to your email", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to send OTP.";
            setError(message);
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── OTP Input Handlers ──────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    // ── Step 2: Verify OTP ──────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            setError("Please enter the complete 6-digit code.");
            return;
        }
        setSubmitting(true);
        try {
            await apiFetch("/api/public/auth/forgot-password/verify-otp", {
                method: "POST",
                body: { email, otp: otpCode },
            });
            setStep("password");
            showToast("OTP verified successfully", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Invalid OTP.";
            setError(message);
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step 3: Reset Password ──────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await apiFetch("/api/public/auth/forgot-password/reset", {
                method: "POST",
                body: { email, newPassword },
            });
            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to reset password.";
            setError(message);
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-sand-light p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center w-full max-w-[420px] p-8 md:p-12 rounded-2xl bg-white shadow-xl shadow-black/5"
                >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                        <CheckCircle2 size={56} color="#1F3A2D" strokeWidth={1.5} />
                    </div>
                    <h2
                        style={{
                            fontFamily: "var(--font-display, serif)",
                            fontSize: "2rem",
                            color: "#1F3A2D",
                            marginBottom: 12,
                        }}
                    >
                        Password Reset
                    </h2>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(46,42,38,0.6)", marginBottom: 32, lineHeight: 1.6 }}>
                        Your password has been securely updated. You will be redirected to the login page momentarily.
                    </p>
                    <Link href="/login" style={{ textDecoration: "none" }}>
                        <PrimaryButton>Back to Login</PrimaryButton>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* ── Left Panel — Brand Visual (Matches Login) ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-14"
                style={{ background: "linear-gradient(160deg, #1F3A2D 0%, #0f2018 60%, #162b1e 100%)" }}
            >
                {/* Grain overlay */}
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                        opacity: 0.06,
                        pointerEvents: "none",
                    }}
                />

                {/* Decorative circles */}
                <div aria-hidden="true" style={{ position: "absolute", top: "-120px", right: "-120px", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.12)" }} />
                <div aria-hidden="true" style={{ position: "absolute", top: "-60px", right: "-60px", width: 250, height: 250, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.08)" }} />
                <div aria-hidden="true" style={{ position: "absolute", bottom: "80px", left: "-80px", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.07)" }} />

                <div aria-hidden="true" />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="relative z-10"
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                        <div style={{ width: 40, height: 40 }}>
                            <Image src="/logo.png" alt="Viramah Logo" width={40} height={40} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.4rem", color: "#F6F4EF", letterSpacing: "0.05em" }}>
                            VIRAMAH
                        </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.35em", color: "#D8B56A", marginBottom: 20 }}>
                        Account Recovery
                    </p>
                    <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2.2rem, 3.5vw, 3rem)", color: "#F6F4EF", lineHeight: 1.15, fontWeight: 400, marginBottom: 24 }}>
                        Regain access <br /> to your portal.
                    </h2>
                    <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.95rem", color: "rgba(246,244,239,0.55)", lineHeight: 1.7, maxWidth: 360 }}>
                        We'll help you securely reset your password so you can get back to managing your stay.
                    </p>
                </motion.div>
                <div aria-hidden="true" />
            </div>

            {/* ── Right Panel — Form ────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 bg-sand-light relative min-h-[100dvh]">

                {/* Back to login floating top-left on mobile */}
                <div className="absolute top-6 left-6 lg:hidden z-20">
                    <Link
                        href="/login"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em",
                            color: "rgba(46,42,38,0.5)",
                            textDecoration: "none",
                        }}
                    >
                        <ArrowLeft size={14} /> Login
                    </Link>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[420px] pb-12"
                >
                    {/* PC Back to Login */}
                    <motion.div variants={itemVariants} className="hidden lg:block mb-10">
                        <Link
                            href="/login"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.7rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.15em",
                                color: "rgba(46,42,38,0.5)",
                                textDecoration: "none",
                            }}
                        >
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </motion.div>

                    {/* Logo + heading */}
                    <motion.div variants={itemVariants} className="mb-8">
                        {/* Logo visible only on mobile (desktop has left panel) */}
                        <div className="flex lg:hidden items-center gap-3 mb-8">
                            <div className="w-8 h-8">
                                <Image src="/logo.png" alt="Viramah Logo" width={32} height={32} className="w-full h-full object-contain" />
                            </div>
                            <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.15rem", color: "#1F3A2D", letterSpacing: "0.08em" }}>
                                VIRAMAH
                            </span>
                        </div>

                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#b5934a", marginBottom: 12 }}>
                            {step === "email" ? "Account Recovery" : step === "otp" ? "Verify Identity" : "New Password"}
                        </p>
                        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "#1F3A2D", lineHeight: 1.1, fontWeight: 400 }}>
                            {step === "email" ? "Reset your password" : step === "otp" ? "Verification code" : "Set new password"}
                        </h1>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(46,42,38,0.55)", marginTop: 12, lineHeight: 1.5 }}>
                            {step === "email"
                                ? "Enter the email address associated with your account."
                                : step === "otp"
                                    ? `We sent a 6-digit code to ${maskedEmail}`
                                    : "Choose a strong password for your account."}
                        </p>
                    </motion.div>

                    {/* Error Box */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-red-50 border border-red-100"
                        >
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626" }}>
                                {error}
                            </span>
                        </motion.div>
                    )}

                    <div className="w-full">
                        {/* ── Step 1: Email ────────────────────────────────── */}
                        {step === "email" && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                onSubmit={handleSendOtp}
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <AuthLabel htmlFor="reset-email">Email Address</AuthLabel>
                                    <AuthInput
                                        id="reset-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField("email")}
                                        onBlur={() => setFocusedField(null)}
                                        focused={focusedField === "email"}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mt-2">
                                    <PrimaryButton disabled={submitting}>
                                        {submitting ? "Sending..." : "Send Reset Link"}
                                        {!submitting && <ArrowRight size={16} />}
                                    </PrimaryButton>
                                </div>
                            </motion.form>
                        )}

                        {/* ── Step 2: OTP ──────────────────────────────────── */}
                        {step === "otp" && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 100, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                onSubmit={handleVerifyOtp}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex flex-col gap-2 w-full">
                                    <AuthLabel htmlFor="otp-0">Enter 6-Digit Code</AuthLabel>
                                    <div className="flex gap-2 sm:gap-3 w-full justify-between">
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={(el) => { otpRefs.current[i] = el; }}
                                                id={`otp-${i}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                                onPaste={i === 0 ? handleOtpPaste : undefined}
                                                autoFocus={i === 0}
                                                onFocus={() => setFocusedField(`otp-${i}`)}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono outline-none transition-all duration-200"
                                                style={{
                                                    background: focusedField === `otp-${i}` ? "#fff" : "rgba(255,255,255,0.6)",
                                                    color: "#2d2b28",
                                                    borderWidth: "1.5px",
                                                    borderStyle: "solid",
                                                    borderColor: focusedField === `otp-${i}` || digit ? "#1F3A2D" : "rgba(46,42,38,0.15)",
                                                    borderRadius: 10,
                                                    boxShadow: focusedField === `otp-${i}` ? "0 0 0 4px rgba(31,58,45,0.08)" : "none",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <PrimaryButton disabled={submitting}>
                                        {submitting ? "Verifying..." : "Verify Code"}
                                        {!submitting && <ArrowRight size={16} />}
                                    </PrimaryButton>
                                </div>

                                <p style={{ textAlign: "center", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "rgba(46,42,38,0.5)" }}>
                                    Didn't receive the code?{" "}
                                    <button
                                        type="button"
                                        onClick={() => { setOtp(Array(6).fill("")); setError(""); handleSendOtp(); }}
                                        style={{ background: "none", border: "none", color: "#D8B56A", fontWeight: 600, cursor: "pointer", fontSize: "inherit" }}
                                    >
                                        Resend
                                    </button>
                                </p>
                            </motion.form>
                        )}

                        {/* ── Step 3: New Password ─────────────────────────── */}
                        {step === "password" && (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 100, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                onSubmit={handleResetPassword}
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-2">
                                    <AuthLabel htmlFor="new-password">New Password</AuthLabel>
                                    <div className="relative">
                                        <AuthInput
                                            id="new-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            onFocus={() => setFocusedField("newPassword")}
                                            onBlur={() => setFocusedField(null)}
                                            focused={focusedField === "newPassword"}
                                            required
                                            autoFocus
                                            minLength={8}
                                            style={{ paddingRight: 44 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((v) => !v)}
                                            style={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "rgba(46,42,38,0.4)",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <AuthLabel htmlFor="confirm-password">Confirm Password</AuthLabel>
                                    <div className="relative">
                                        <AuthInput
                                            id="confirm-password"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onFocus={() => setFocusedField("confirmPassword")}
                                            onBlur={() => setFocusedField(null)}
                                            focused={focusedField === "confirmPassword"}
                                            required
                                            minLength={8}
                                            style={{ paddingRight: 44, ...(confirmPassword && newPassword !== confirmPassword ? { borderColor: "#ef4444" } : {}) }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((v) => !v)}
                                            style={{
                                                position: "absolute",
                                                right: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: "rgba(46,42,38,0.4)",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: 2, fontFamily: "var(--font-body, sans-serif)" }}>
                                            Passwords do not match
                                        </p>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <PrimaryButton disabled={submitting}>
                                        {submitting ? "Resetting..." : "Reset Password"}
                                        {!submitting && <ArrowRight size={16} />}
                                    </PrimaryButton>
                                </div>
                            </motion.form>
                        )}
                    </div>

                    {/* Step indicator */}
                    <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
                        {(["email", "otp", "password"] as Step[]).map((s, i) => (
                            <div
                                key={s}
                                style={{
                                    width: step === s ? 24 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    background: step === s ? "#1F3A2D" : i < ["email", "otp", "password"].indexOf(step) ? "#D8B56A" : "rgba(31,58,45,0.12)",
                                    transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                                }}
                            />
                        ))}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────────

function AuthLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(46,42,38,0.55)",
                fontWeight: 700,
            }}
        >
            {children}
        </label>
    );
}

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    focused?: boolean;
}

function AuthInput({ focused, style, ...props }: AuthInputProps) {
    return (
        <input
            {...props}
            style={{
                width: "100%",
                background: focused ? "#fff" : "rgba(255,255,255,0.6)",
                borderWidth: "1.5px",
                borderStyle: "solid",
                borderColor: focused ? "#1F3A2D" : "rgba(46,42,38,0.15)",
                borderRadius: 10,
                padding: "13px 16px",
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "0.95rem",
                color: "#2d2b28",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: focused ? "0 0 0 4px rgba(31,58,45,0.08)" : "none",
                ...style,
            }}
        />
    );
}

function PrimaryButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="submit"
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "15px 24px",
                background: hovered && !disabled
                    ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)"
                    : disabled
                        ? "rgba(31,58,45,0.6)"
                        : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                color: "#F6F4EF",
                border: "none",
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                cursor: disabled ? "not-allowed" : "pointer",
                transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered && !disabled
                    ? "0 12px 30px rgba(31,58,45,0.35)"
                    : disabled
                        ? "none"
                        : "0 4px 16px rgba(31,58,45,0.2)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}
