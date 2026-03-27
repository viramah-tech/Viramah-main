"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.09, delayChildren: 0.15 },
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

const PERKS = [
    "Private & shared room options",
    "24/7 community amenities",
    "Curated resident events",
    "All-inclusive pricing",
];

export default function SignUpPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const { signup, user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

    // ── Validation helpers ──────────────────────────────────
    const nameError = touched.name && name.trim().length > 0 && name.trim().length < 2
        ? "Name must be at least 2 characters" : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailError = touched.email && email.length > 0 && !emailRegex.test(email)
        ? "Enter a valid email address" : "";

    const passwordChecks = {
        minLength: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        notName: !name.trim() || password.toLowerCase() !== name.trim().toLowerCase(),
        notEmail: !email.trim() || password.toLowerCase() !== email.trim().toLowerCase(),
    };
    const passedChecks = Object.values(passwordChecks).filter(Boolean).length;
    const passwordStrength = password.length === 0 ? 0 : Math.min(passedChecks, 6);
    const strengthLabel = passwordStrength <= 2 ? "Weak" : passwordStrength <= 4 ? "Fair" : "Strong";
    const strengthColor = passwordStrength <= 2 ? "#c0392b" : passwordStrength <= 4 ? "#D9B44A" : "#2E6B4F";

    const passwordError = touched.password && password.length > 0
        ? (!passwordChecks.minLength ? "Password must be at least 8 characters"
            : !passwordChecks.notName ? "Password must not be the same as your name"
                : !passwordChecks.notEmail ? "Password must not be the same as your email"
                    : "")
        : "";

    const passwordsMatch = password && confirmPassword && password === confirmPassword;
    const confirmError = touched.confirm && confirmPassword.length > 0 && !passwordsMatch
        ? "Passwords don't match" : "";

    const canSubmit = name.trim().length >= 2
        && emailRegex.test(email)
        && passwordChecks.minLength && passwordChecks.notName && passwordChecks.notEmail
        && passwordsMatch
        && !submitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Mark all fields as touched to show any remaining errors
        setTouched({ name: true, email: true, password: true, confirm: true });
        if (!canSubmit) {
            let msg = "";
            if (name.trim().length < 2) msg = "Name must be at least 2 characters";
            else if (!emailRegex.test(email)) msg = "Enter a valid email address";
            else if (!passwordChecks.minLength) msg = "Password must be at least 8 characters";
            else if (!passwordChecks.notName) msg = "Password must not be the same as your name";
            else if (!passwordChecks.notEmail) msg = "Password must not be the same as your email";
            else if (!passwordsMatch) msg = "Passwords don't match";
            setError(msg);
            showToast(msg, "error");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await signup(name, email, password);
            showToast("Account created successfully! Redirecting...", "success");
            router.push("/user-onboarding/terms");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
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
                <div aria-hidden="true" style={{ position: "absolute", top: "-120px", right: "-120px", width: 400, height: 400, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.12)" }} />
                <div aria-hidden="true" style={{ position: "absolute", top: "-60px", right: "-60px", width: 250, height: 250, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.08)" }} />
                <div aria-hidden="true" style={{ position: "absolute", bottom: "80px", left: "-80px", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(216,181,106,0.07)" }} />

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
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.35em", color: "#D8B56A", marginBottom: 20 }}>
                        Join the Community
                    </p>
                    <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2.2rem, 3.5vw, 3rem)", color: "#F6F4EF", lineHeight: 1.15, fontWeight: 400, marginBottom: 36 }}>
                        Begin your<br />Viramah journey.
                    </h2>

                    {/* Perks list */}
                    <div className="flex flex-col gap-4">
                        {PERKS.map((perk, i) => (
                            <motion.div
                                key={perk}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                className="flex items-center gap-3"
                            >
                                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(216,181,106,0.15)", border: "1px solid rgba(216,181,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Check size={11} color="#D8B56A" strokeWidth={2.5} />
                                </div>
                                <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", color: "rgba(246,244,239,0.65)" }}>
                                    {perk}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="relative z-10"
                >
                    <div style={{ height: 1, background: "linear-gradient(90deg, rgba(216,181,106,0.3), transparent)", marginBottom: 20 }} />
                    <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "1rem", color: "rgba(246,244,239,0.4)", fontStyle: "italic" }}>
                        "A place where every resident feels at home."
                    </p>
                </motion.div>
            </div>

            {/* ── Right Panel — Form ────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-sand-light relative overflow-y-auto">
                {/* Mobile logo */}
                <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
                    <div className="w-8 h-8">
                        <img src="/logo.png" alt="Viramah" className="w-full h-full object-contain" />
                    </div>
                    <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.1rem", color: "#1F3A2D" }}>VIRAMAH</span>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-[420px] py-16 lg:py-0"
                >
                    {/* Heading */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "#b5934a", marginBottom: 10 }}>
                            New Resident
                        </p>
                        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2rem, 4vw, 2.6rem)", color: "#1F3A2D", lineHeight: 1.1, fontWeight: 400 }}>
                            Create your account
                        </h1>
                        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(46,42,38,0.55)", marginTop: 8 }}>
                            Join hundreds of residents living the Viramah way
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
                        {/* Full Name */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <AuthLabel htmlFor="signup-name">Full Name</AuthLabel>
                            <AuthInput
                                id="signup-name"
                                type="text"
                                placeholder="e.g. Arjun Mehta"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                focused={focusedField === "name"}
                                onFocus={() => setFocusedField("name")}
                                onBlur={() => { setFocusedField(null); markTouched("name"); }}
                                required
                                style={nameError ? { borderColor: "#c07a5a" } : undefined}
                            />
                            {nameError && <FieldHint text={nameError} type="error" />}
                        </motion.div>

                        {/* Email */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <AuthLabel htmlFor="signup-email">Email Address</AuthLabel>
                            <AuthInput
                                id="signup-email"
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
                            {emailError && <FieldHint text={emailError} type="error" />}
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <AuthLabel htmlFor="signup-password">Password</AuthLabel>
                            <div className="relative">
                                <AuthInput
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 8 characters"
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
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(46,42,38,0.4)", display: "flex", alignItems: "center" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Password strength meter */}
                            {password.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    <div style={{ display: "flex", gap: 4, height: 4 }}>
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} style={{
                                                flex: 1,
                                                borderRadius: 2,
                                                background: passwordStrength >= i ? strengthColor : "rgba(46,42,38,0.1)",
                                                transition: "background 0.3s ease",
                                            }} />
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: strengthColor, fontWeight: 600, letterSpacing: "0.05em" }}>
                                            {strengthLabel}
                                        </span>
                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <PasswordRule passed={passwordChecks.minLength} text="8+ chars" />
                                            <PasswordRule passed={passwordChecks.hasUpper} text="A-Z" />
                                            <PasswordRule passed={passwordChecks.hasNumber} text="0-9" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {passwordError && <FieldHint text={passwordError} type="error" />}
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <AuthLabel htmlFor="signup-confirm">Confirm Password</AuthLabel>
                            <div className="relative">
                                <AuthInput
                                    id="signup-confirm"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    focused={focusedField === "confirm"}
                                    onFocus={() => setFocusedField("confirm")}
                                    onBlur={() => { setFocusedField(null); markTouched("confirm"); }}
                                    required
                                    style={{
                                        paddingRight: 44,
                                        borderColor: confirmPassword
                                            ? passwordsMatch
                                                ? "#4a7c59"
                                                : "#c07a5a"
                                            : undefined,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(46,42,38,0.4)", display: "flex", alignItems: "center" }}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {confirmError && <FieldHint text={confirmError} type="error" />}
                            {passwordsMatch && <FieldHint text="Passwords match" type="success" />}
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={itemVariants} className="mt-2">
                            <PrimaryButton disabled={submitting}>
                                {submitting ? "Creating account..." : "Create Account"}
                                {!submitting && <ArrowRight size={16} />}
                            </PrimaryButton>
                        </motion.div>

                        {/* Terms */}
                        <motion.p
                            variants={itemVariants}
                            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(46,42,38,0.4)", textAlign: "center", letterSpacing: "0.03em", lineHeight: 1.6 }}
                        >
                            By creating an account you agree to our{" "}
                            <Link href="#" style={{ color: "#b5934a", textDecoration: "none" }}>Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="#" style={{ color: "#b5934a", textDecoration: "none" }}>Privacy Policy</Link>
                        </motion.p>

                        {/* Divider */}
                        <motion.div variants={itemVariants} className="flex items-center gap-4">
                            <div style={{ flex: 1, height: 1, background: "rgba(46,42,38,0.12)" }} />
                            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(46,42,38,0.35)" }}>or</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(46,42,38,0.12)" }} />
                        </motion.div>

                        {/* Google */}
                        <motion.div variants={itemVariants}>
                            <GoogleButton />
                        </motion.div>
                    </form>

                    {/* Footer */}
                    <motion.p
                        variants={itemVariants}
                        style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "rgba(46,42,38,0.5)", textAlign: "center", marginTop: 28 }}
                    >
                        Already a member?{" "}
                        <Link href="/login" style={{ color: "#1F3A2D", fontWeight: 600, textDecoration: "none" }}>
                            Sign in
                        </Link>
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

// ── Sub-components ───────────────────────────────────────────

function FieldHint({ text, type }: { text: string; type: "error" | "success" }) {
    const color = type === "error" ? "#c07a5a" : "#4a7c59";
    return (
        <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.6rem",
            color,
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: 4,
        }}>
            {type === "success" && <Check size={10} strokeWidth={3} />}
            {text}
        </span>
    );
}

function PasswordRule({ passed, text }: { passed: boolean; text: string }) {
    return (
        <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "0.55rem",
            color: passed ? "#4a7c59" : "rgba(46,42,38,0.35)",
            letterSpacing: "0.03em",
            transition: "color 0.2s ease",
        }}>
            {passed ? "✓" : "○"} {text}
        </span>
    );
}

function AuthLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(46,42,38,0.55)", fontWeight: 700 }}
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
                opacity: disabled ? 0.7 : 1,
                background: hovered ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)" : "linear-gradient(135deg, #1F3A2D, #162b1e)",
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
                boxShadow: hovered ? "0 12px 30px rgba(31,58,45,0.35)" : "0 4px 16px rgba(31,58,45,0.2)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}

function GoogleButton() {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            type="button"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "13px 24px",
                background: hovered ? "#fff" : "rgba(255,255,255,0.7)",
                border: "1.5px solid rgba(46,42,38,0.15)",
                borderRadius: 10,
                fontFamily: "var(--font-body, sans-serif)",
                fontWeight: 500,
                fontSize: "0.9rem",
                color: "#2d2b28",
                cursor: "pointer",
                boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.25s ease",
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
        </button>
    );
}
