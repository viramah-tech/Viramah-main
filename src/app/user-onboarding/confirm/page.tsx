"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, Home, Shield, Loader2 } from "lucide-react";
import { finalizeOnboarding } from "../actions";

export default function ConfirmPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFinalize = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await finalizeOnboarding();
            if (result?.error) setError(result.error);
        } catch {
            // redirect() throws, expected
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 pb-20"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-muted/20 mb-4">
                    <Check className="w-4 h-4 text-sage-muted" />
                    <span className="font-mono text-xs text-sage-muted uppercase tracking-widest">
                        Almost Done
                    </span>
                </div>
                <h1 className="font-display text-4xl text-charcoal mb-2">
                    Review & Confirm
                </h1>
                <p className="font-body text-charcoal/60 max-w-md mx-auto">
                    Please review your information before proceeding to your dashboard.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4">
                {/* Identity Summary */}
                <div className="bg-white rounded-2xl border border-sand-dark p-6 shadow-lg shadow-charcoal/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-terracotta-raw/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-terracotta-raw" />
                        </div>
                        <div>
                            <span className="font-body text-sm font-medium text-charcoal block">Identity Verification</span>
                            <span className="font-mono text-[10px] text-charcoal/50">Step 1 Complete</span>
                        </div>
                        <Check className="w-5 h-5 text-sage-muted ml-auto" />
                    </div>
                    <p className="font-mono text-xs text-charcoal/50">KYC data submitted</p>
                </div>

                {/* Emergency Summary */}
                <div className="bg-white rounded-2xl border border-sand-dark p-6 shadow-lg shadow-charcoal/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                            <span className="font-display text-lg text-gold">📞</span>
                        </div>
                        <div>
                            <span className="font-body text-sm font-medium text-charcoal block">Emergency Contact</span>
                            <span className="font-mono text-[10px] text-charcoal/50">Step 2 Complete</span>
                        </div>
                        <Check className="w-5 h-5 text-sage-muted ml-auto" />
                    </div>
                    <p className="font-mono text-xs text-charcoal/50">Emergency contact saved</p>
                </div>

                {/* Room Selection Summary */}
                <div className="bg-white rounded-2xl border border-sand-dark p-6 shadow-lg shadow-charcoal/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-terracotta-raw/20 flex items-center justify-center">
                            <Home className="w-5 h-5 text-terracotta-raw" />
                        </div>
                        <div>
                            <span className="font-body text-sm font-medium text-charcoal block">Room Selected</span>
                            <span className="font-mono text-[10px] text-charcoal/50">Step 3 Complete</span>
                        </div>
                        <Check className="w-5 h-5 text-sage-muted ml-auto" />
                    </div>
                    <p className="font-mono text-xs text-charcoal/50">Room booking request submitted</p>
                </div>

                {/* Preferences Summary */}
                <div className="bg-white rounded-2xl border border-sand-dark p-6 shadow-lg shadow-charcoal/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sage-muted/20 flex items-center justify-center">
                            <span className="font-display text-lg">⚙️</span>
                        </div>
                        <div>
                            <span className="font-body text-sm font-medium text-charcoal block">Preferences Set</span>
                            <span className="font-mono text-[10px] text-charcoal/50">Step 4 Complete</span>
                        </div>
                        <Check className="w-5 h-5 text-sage-muted ml-auto" />
                    </div>
                    <p className="font-mono text-xs text-charcoal/50">Lifestyle preferences saved</p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="font-body text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Link href="/user-onboarding/step-4">
                    <Button variant="secondary" size="lg" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
                <Button
                    size="lg"
                    className="gap-2 bg-sage-muted hover:bg-sage-muted/90"
                    disabled={isLoading}
                    onClick={handleFinalize}
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Finalizing...</>
                    ) : (
                        <><Home className="w-4 h-4" />Enter Dashboard</>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
