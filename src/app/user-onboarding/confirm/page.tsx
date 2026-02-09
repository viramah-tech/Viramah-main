"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, CreditCard, Home, Shield } from "lucide-react";

export default function ConfirmPage() {
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
                    Please review your information before proceeding to payment.
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
                            <span className="font-body text-sm font-medium text-charcoal block">Identity Verified</span>
                            <span className="font-mono text-[10px] text-charcoal/50">Step 1 Complete</span>
                        </div>
                        <Check className="w-5 h-5 text-sage-muted ml-auto" />
                    </div>
                    <div className="pl-13 space-y-1 ml-13">
                        <p className="font-body text-sm text-charcoal/70">Arjun Mehta</p>
                        <p className="font-mono text-xs text-charcoal/50">Aadhaar: XXXX-XXXX-1234</p>
                    </div>
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
                    <div className="space-y-1">
                        <p className="font-body text-sm text-charcoal/70">Rajesh Mehta (Father)</p>
                        <p className="font-mono text-xs text-charcoal/50">+91 98XXX XXXXX</p>
                    </div>
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
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="font-body text-sm text-charcoal/70">Room 201 • Single Occupancy</p>
                            <p className="font-mono text-sm text-terracotta-raw">₹8,500/mo</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="font-body text-sm text-charcoal/70">Full Board Mess</p>
                            <p className="font-mono text-sm text-gold">₹4,500/mo</p>
                        </div>
                        <div className="border-t border-sand-dark pt-2 flex justify-between">
                            <p className="font-body text-sm font-medium text-charcoal">Total Monthly</p>
                            <p className="font-mono text-sm font-bold text-charcoal">₹13,000</p>
                        </div>
                    </div>
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
                    <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-sand-dark/50 font-mono text-xs text-charcoal/70">Vegetarian</span>
                        <span className="px-3 py-1 rounded-full bg-sand-dark/50 font-mono text-xs text-charcoal/70">Early Bird</span>
                        <span className="px-3 py-1 rounded-full bg-sand-dark/50 font-mono text-xs text-charcoal/70">Quiet</span>
                    </div>
                </div>
            </div>

            {/* Payment Section */}
            {/* <div className="bg-gradient-to-br from-terracotta-raw to-terracotta-soft rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-display text-xl">Booking Payment</span>
                </div>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <span className="font-body opacity-80">Security Deposit</span>
                        <span className="font-mono">₹5,000</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-body opacity-80">First Month Rent</span>
                        <span className="font-mono">₹12,000</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 flex justify-between">
                        <span className="font-body font-medium">Total Due</span>
                        <span className="font-display text-2xl">₹17,000</span>
                    </div>
                </div>
                <p className="font-mono text-[10px] opacity-60">
                    Payment will be processed via Razorpay. Your booking is not confirmed until payment is complete.
                </p>
            </div> */}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Link href="/user-onboarding/step-4">
                    <Button variant="secondary" size="lg" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
                <Link href="/student/dashboard">
                    <Button size="lg" className="gap-2 bg-sage-muted hover:bg-sage-muted/90">
                        <Home className="w-4 h-4" />
                        Enter Dashboard
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
