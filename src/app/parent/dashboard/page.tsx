"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    User,
    Calendar,
    CreditCard,
    ArrowRight,
    CheckCircle,
    AlertCircle
} from "lucide-react";

export default function ParentDashboard() {
    const { user } = useAuth();
    const firstName = user?.fullName?.split(" ")[0] ?? "Parent";

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">
                    Parent Portal
                </span>
                <h1 className="font-display text-4xl text-charcoal mt-1">
                    Welcome, {firstName}
                </h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Monitor your child&apos;s stay at Viramah
                </p>
            </motion.div>

            {/* Child Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-terracotta-soft/30 flex items-center justify-center">
                        <User className="w-8 h-8 text-terracotta-raw" />
                    </div>
                    <div className="flex-1">
                        <span className="font-body text-lg font-medium text-charcoal block">Linked Student</span>
                        <span className="font-mono text-xs text-charcoal/50">No student linked yet</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-muted/20">
                        <CheckCircle className="w-4 h-4 text-sage-muted" />
                        <span className="font-mono text-xs text-sage-muted">Active</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <Calendar className="w-6 h-6 text-terracotta-raw mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">
                        Next Visit
                    </span>
                    <span className="font-display text-2xl text-charcoal">Not Scheduled</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <AlertCircle className="w-6 h-6 text-sage-muted mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">
                        Alerts
                    </span>
                    <span className="font-display text-2xl text-charcoal">None</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <User className="w-6 h-6 text-gold mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">
                        Account Status
                    </span>
                    <span className="font-display text-2xl text-charcoal capitalize">{user?.kycStatus ?? "Pending"}</span>
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    <div className="py-8 text-center">
                        <p className="font-body text-sm text-charcoal/50">No recent activity. Link a student to view their updates.</p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
            >
                <Link
                    href="/parent/visit"
                    className="group bg-terracotta-raw rounded-2xl p-6 text-white hover:-translate-y-1 transition-transform"
                >
                    <Calendar className="w-6 h-6 mb-3" />
                    <span className="font-body font-medium block">Schedule a Visit</span>
                    <ArrowRight className="w-4 h-4 mt-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                    href="/student/wallet"
                    className="group bg-gold rounded-2xl p-6 text-white hover:-translate-y-1 transition-transform"
                >
                    <CreditCard className="w-6 h-6 mb-3" />
                    <span className="font-body font-medium block">Add Funds to Wallet</span>
                    <ArrowRight className="w-4 h-4 mt-2 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </div>
    );
}
