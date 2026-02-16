"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { Lock, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PageState = "loading" | "form" | "success" | "error";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageState, setPageState] = useState<PageState>("loading");
    const router = useRouter();

    // On mount, check if we have a valid session from the magic link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setPageState("form");
            } else {
                // Listen for the auth event from the magic link
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                    if (event === "PASSWORD_RECOVERY") {
                        setPageState("form");
                    }
                });

                // Give it a moment, then show error if no session
                setTimeout(() => {
                    setPageState((prev) => prev === "loading" ? "error" : prev);
                }, 3000);

                return () => {
                    subscription.unsubscribe();
                };
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Use Supabase client directly to update password
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) {
                setError(updateError.message);
                setIsSubmitting(false);
                return;
            }

            setPageState("success");

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-sand-light flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--terracotta-raw)_1px,_transparent_1px)] bg-[size:32px_32px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                            <img src="/logo.png" alt="Viramah Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-display text-2xl text-ink">VIRAMAH</span>
                    </Link>
                    <h1 className="font-display text-3xl text-charcoal">
                        {pageState === "success" ? "Password Updated" : "New Password"}
                    </h1>
                    <p className="font-body text-charcoal/60 mt-2">
                        {pageState === "form" && "Choose a strong password for your account"}
                        {pageState === "success" && "Redirecting you to sign in..."}
                        {pageState === "loading" && "Verifying your reset link..."}
                        {pageState === "error" && "This reset link may have expired"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-sand-dark p-8 shadow-xl shadow-charcoal/5">
                    {pageState === "loading" && (
                        <div className="flex flex-col items-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw mb-4" />
                            <p className="font-mono text-xs text-charcoal/50 uppercase tracking-widest">
                                Verifying...
                            </p>
                        </div>
                    )}

                    {pageState === "error" && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-600" />
                            </div>
                            <p className="font-body text-charcoal/80 mb-4">
                                This password reset link has expired or is invalid.
                            </p>
                            <Link href="/forgot-password">
                                <Button size="lg" className="w-full">
                                    Request a New Reset Link
                                </Button>
                            </Link>
                        </div>
                    )}

                    {pageState === "form" && (
                        <form onSubmit={handleSubmit}>
                            {/* Error Display */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200"
                                >
                                    <p className="font-body text-sm text-red-600">{error}</p>
                                </motion.div>
                            )}

                            <div className="space-y-4 mb-6">
                                <FormInput
                                    label="New Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <FormInput
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            {/* Password strength hint */}
                            <p className="font-mono text-[10px] text-charcoal/40 mb-4">
                                At least 6 characters. Use a mix of letters, numbers, and symbols.
                            </p>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full gap-2"
                                disabled={!password || !confirmPassword || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    {pageState === "success" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="font-body text-charcoal/80 mb-2">
                                Your password has been updated successfully!
                            </p>
                            <p className="font-body text-sm text-charcoal/50 mb-6">
                                You will be redirected to sign in shortly...
                            </p>
                            <Link href="/login">
                                <Button variant="secondary" size="lg" className="w-full">
                                    Go to Sign In Now
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
