"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { ArrowLeft, Send, CheckCircle2, Loader2 } from "lucide-react";

type PageState = "form" | "success";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageState, setPageState] = useState<PageState>("form");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/v1/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong. Please try again.");
                setIsSubmitting(false);
                return;
            }

            setPageState("success");
        } catch {
            setError("Network error. Please check your connection.");
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
                        {pageState === "form" ? "Reset Password" : "Check Your Email"}
                    </h1>
                    <p className="font-body text-charcoal/60 mt-2">
                        {pageState === "form"
                            ? "Enter your email and we'll send you a reset link"
                            : "We've sent you a password reset link"
                        }
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-sand-dark p-8 shadow-xl shadow-charcoal/5">
                    {pageState === "form" ? (
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

                            {/* Email Input */}
                            <div className="mb-6">
                                <FormInput
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full gap-2"
                                disabled={!email || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Send Reset Link
                                    </>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="font-body text-charcoal/80 mb-2">
                                We&apos;ve sent a password reset link to:
                            </p>
                            <p className="font-mono text-sm text-terracotta-raw mb-6">
                                {email}
                            </p>
                            <p className="font-body text-sm text-charcoal/50">
                                Didn&apos;t receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => { setPageState("form"); setError(null); }}
                                    className="text-terracotta-raw hover:underline font-medium"
                                >
                                    try again
                                </button>
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 font-body text-sm text-charcoal/60 hover:text-terracotta-raw transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
