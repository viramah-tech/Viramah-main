"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

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

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const { login, user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

    // ── Field validation ──────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = touched.email && email.length > 0 && !emailRegex.test(email)
        ? "Enter a valid email address" : "";
    const passwordError = touched.password && password.length === 0
        ? "Password is required" : "";

    const getRedirectPath = async (u: {
        onboardingStatus: string;
        paymentStatus: string;
        documentVerificationStatus?: string;
        moveInStatus?: string;
    }): Promise<string> => {
        // Fully onboarded resident → student dashboard
        if (
            u.paymentStatus === "approved" &&
            u.documentVerificationStatus === "approved" &&
            u.moveInStatus === "completed"
        ) {
            return "/student/dashboard";
        }

        // Check for active deposit hold to determine routing
        if (u.onboardingStatus === "completed" || u.paymentStatus === "pending" || u.paymentStatus === "approved") {
            try {
                const holdRes = await apiFetch<{ data: { hold: { status?: string; paymentMode?: string } | null } }>(
                    "/api/public/deposits/status"
                );
                const hold = holdRes?.data?.hold;

                // Active deposit hold → deposit-status (user can complete payment when ready)
                if (hold?.status === "active") {
                    return "/user-onboarding/deposit-status";
                }
                // Pending approval → waiting for admin to approve deposit
                if (hold?.status === "pending_approval") {
                    return "/user-onboarding/deposit-status";
                }
                // Hold is converted/refunded/expired or no hold → check payment lifecycle
            } catch {
                // If deposit check fails, fall through to payment lifecycle
            }

            // No active deposit hold — check actual payment status
            if (u.paymentStatus === "pending" || u.paymentStatus === "approved") {
                return "/user-onboarding/payment-status";
            }
        }

        return "/user-onboarding/step-1";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ email: true, password: true });
        if (!emailRegex.test(email)) {
            const msg = "Enter a valid email address";
            setError(msg);
            showToast(msg, "error");
            return;
        }
        if (!password) {
            const msg = "Password is required";
            setError(msg);
            showToast(msg, "error");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const loggedInUser = await login(email, password);
            showToast("Login successful! Redirecting...", "success");
            const path = await getRedirectPath(loggedInUser);
            router.replace(path);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Login failed. Please try again.";
            setError(message);
            showToast(message, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left Panel — Brand Visual ─────────────────── */}
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
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-120px",
                        right: "-120px",
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        border: "1px solid rgba(216,181,106,0.12)",
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-60px",
                        right: "-60px",
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        border: "1px solid rgba(216,181,106,0.08)",
                    }}
                />
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: "80px",
                        left: "-80px",
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        border: "1px solid rgba(216,181,106,0.07)",
                    }}
                />

                {/* Spacer — keeps justify-between pushing copy to centre */}
                <div aria-hidden="true" />

                {/* Centre copy */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="relative z-10"
                >
                    {/* Logo + name grouped above the copy */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                        <div style={{ width: 40, height: 40 }}>
                            <img src="/logo.png" alt="Viramah Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.4rem", color: "#F6F4EF", letterSpacing: "0.05em" }}>
                            VIRAMAH
                        </span>
                    </div>
                    <p
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.65rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.35em",
                            color: "#D8B56A",
                            marginBottom: 20,
                        }}
                    >
                        विरामाह — The Art of REST
                    </p>
                    <h2
                        style={{
                            fontFamily: "var(--font-display, serif)",
                            fontSize: "clamp(2.2rem, 3.5vw, 3rem)",
                            color: "#F6F4EF",
                            lineHeight: 1.15,
                            fontWeight: 400,
                            marginBottom: 24,
                        }}
                    >
                        Your home,<br />away from home.
                    </h2>
                    <p
                        style={{
                            fontFamily: "var(--font-body, sans-serif)",
                            fontSize: "0.95rem",
                            color: "rgba(246,244,239,0.55)",
                            lineHeight: 1.7,
                            maxWidth: 360,
                        }}
                    >
                        Premium community living designed for the modern Indian journey — where comfort meets connection.
                    </p>
                </motion.div>

                {/* Bottom stat strip */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="relative z-10 flex gap-10"
                >
                    {[
                        { value: "500+", label: "Residents" },
                        { value: "12+", label: "Amenities" },
                        { value: "4.9", label: "Rating" },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div
                                style={{
                                    fontFamily: "var(--font-display, serif)",
                                    fontSize: "1.6rem",
                                    color: "#D8B56A",
                                    lineHeight: 1,
                                }}
                            >
                                {stat.value}
                            </div>
                            <div
                                style={{
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.6rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.2em",
                                    color: "rgba(246,244,239,0.4)",
                                    marginTop: 4,
                                }}
                            >
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ── Right Panel — Form ────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-sand-light relative">


                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[420px]"
                >
                    {/* Heading */}
                    <motion.div variants={itemVariants} className="mb-10">
                        {/* Logo + brand name above the heading */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                            <div style={{ width: 36, height: 36 }}>
                                <img src="/logo.png" alt="Viramah Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            </div>
                            <span
                                style={{
                                    fontFamily: "var(--font-display, serif)",
                                    fontSize: "1.15rem",
                                    color: "#1F3A2D",
                                    letterSpacing: "0.08em",
                                    fontWeight: 400,
                                }}
                            >
                                VIRAMAH
                            </span>
                        </div>

                        <p
                            style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.65rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.3em",
                                color: "#b5934a",
                                marginBottom: 10,
                            }}
                        >
                            Member Access
                        </p>
                        <h1
                            style={{
                                fontFamily: "var(--font-display, serif)",
                                fontSize: "clamp(2rem, 4vw, 2.6rem)",
                                color: "#1F3A2D",
                                lineHeight: 1.1,
                                fontWeight: 400,
                            }}
                        >
                            Welcome back
                        </h1>
                        <p
                            style={{
                                fontFamily: "var(--font-body, sans-serif)",
                                fontSize: "0.9rem",
                                color: "rgba(46,42,38,0.55)",
                                marginTop: 8,
                            }}
                        >
                            Sign in to access your Viramah portal
                        </p>
                    </motion.div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <motion.div variants={itemVariants} style={{
                                padding: "12px 16px",
                                borderRadius: 10,
                                background: "rgba(192,57,43,0.08)",
                                border: "1px solid rgba(192,57,43,0.2)",
                                fontFamily: "var(--font-body, sans-serif)",
                                fontSize: "0.85rem",
                                color: "#c0392b",
                            }}>
                                {error}
                            </motion.div>
                        )}
                        {/* Email */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <AuthLabel htmlFor="login-email">Email Address</AuthLabel>
                            <AuthInput
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                focused={focusedField === "email"}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => { setFocusedField(null); markTouched("email"); }}
                                required
                                style={emailError ? { borderColor: "#c07a5a" } : undefined}
                            />
                            {emailError && <LoginFieldHint text={emailError} />}
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <AuthLabel htmlFor="login-password">Password</AuthLabel>
                                <Link
                                    href="/forgot-password"
                                    style={{
                                        fontFamily: "var(--font-mono, monospace)",
                                        fontSize: "0.65rem",
                                        color: "#b5934a",
                                        textDecoration: "none",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <AuthInput
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    focused={focusedField === "password"}
                                    onFocus={() => setFocusedField("password")}
                                    onBlur={() => { setFocusedField(null); markTouched("password"); }}
                                    required
                                    style={{ paddingRight: 44, ...(passwordError ? { borderColor: "#c07a5a" } : {}) }}
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
                            {passwordError && <LoginFieldHint text={passwordError} />}
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={itemVariants} className="mt-2">
                            <PrimaryButton disabled={submitting}>
                                {submitting ? "Signing in..." : "Sign In"}
                                {!submitting && <ArrowRight size={16} />}
                            </PrimaryButton>
                        </motion.div>


                    </form>


                </motion.div>
            </div>
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────────

function LoginFieldHint({ text }: { text: string }) {
    return (
        <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6rem",
            color: "#c07a5a",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 4,
        }}>
            <AlertCircle size={10} strokeWidth={2.5} />
            {text}
        </span>
    );
}

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
                background: hovered
                    ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)"
                    : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                color: "#D8B56A",
                border: "none",
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                cursor: "pointer",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered
                    ? "0 12px 30px rgba(31,58,45,0.35)"
                    : "0 4px 16px rgba(31,58,45,0.2)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}


