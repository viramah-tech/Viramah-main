"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Wallet,
    UtensilsCrossed,
    Bell,
    Calendar,
    ArrowRight,
    TrendingUp,
    Loader2
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getWalletData, getNotifications } from "@/app/actions/dashboard";

interface QuickAction {
    label: string;
    href: string;
    icon: React.ElementType;
    color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { label: "Add Funds", href: "/student/wallet", icon: Wallet, color: "bg-terracotta-raw" },
    { label: "Order Food", href: "/student/canteen", icon: UtensilsCrossed, color: "bg-gold" }
];

const UPCOMING_EVENTS = [
    { title: "Yoga Session", time: "6:00 AM", day: "Tomorrow" },
    { title: "Community Dinner", time: "7:30 PM", day: "Saturday" },
];

interface Notification {
    id: number;
    title: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        const [walletData, notifData] = await Promise.all([
            getWalletData(),
            getNotifications(),
        ]);
        setBalance(walletData?.balance ?? 0);
        setNotifications((notifData as Notification[]).slice(0, 5));
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return `${Math.round((today.getTime() - d.getTime()) / 3600000)}h ago`;
        }
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">
                    {greeting()}
                </span>
                <h1 className="font-display text-4xl text-charcoal mt-1">
                    Welcome back, {user?.name?.split(" ")[0] || "there"}
                </h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Here&apos;s what&apos;s happening at Viramah today.
                </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="grid grid-cols-3 gap-4"
            >
                {QUICK_ACTIONS.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group bg-white rounded-2xl border border-sand-dark p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                            <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-body text-sm font-medium text-charcoal block">
                            {action.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-charcoal/30 mt-2 group-hover:text-terracotta-raw group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Wallet Balance</span>
                    <div className="flex items-end gap-2 mt-2">
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-charcoal/30" />
                        ) : (
                            <>
                                <span className="font-display text-3xl text-charcoal">₹{(balance ?? 0).toLocaleString("en-IN")}</span>
                                <TrendingUp className="w-4 h-4 text-sage-muted mb-1" />
                            </>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Meals This Week</span>
                    <span className="font-display text-3xl text-charcoal block mt-2">—</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Gym Sessions</span>
                    <span className="font-display text-3xl text-charcoal block mt-2">—</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest">Community Events</span>
                    <span className="font-display text-3xl text-charcoal block mt-2">—</span>
                </div>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-white rounded-2xl border border-sand-dark p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-5 h-5 text-terracotta-raw" />
                        <span className="font-body font-medium text-charcoal">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-terracotta-raw/10 font-mono text-[10px] text-terracotta-raw">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {isLoading ? (
                        <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-charcoal/20" /></div>
                    ) : notifications.length === 0 ? (
                        <div className="py-6 text-center">
                            <p className="font-body text-sm text-charcoal/50">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map(n => (
                                <div key={n.id} className={`p-3 rounded-xl border ${n.is_read ? "bg-white border-sand-dark/20" : "bg-sand-light/50 border-sand-dark/30"}`}>
                                    <p className="font-body text-sm text-charcoal">{n.title || n.message}</p>
                                    <span className="font-mono text-[10px] text-charcoal/50">{formatDate(n.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Events */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white rounded-2xl border border-sand-dark p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-gold" />
                        <span className="font-body font-medium text-charcoal">Upcoming Events</span>
                    </div>
                    <div className="space-y-3">
                        {UPCOMING_EVENTS.map((event, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-sand-light/50 border border-sand-dark/30">
                                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                                    <span className="font-mono text-xs text-gold">{event.day.slice(0, 3)}</span>
                                </div>
                                <div>
                                    <p className="font-body text-sm font-medium text-charcoal">{event.title}</p>
                                    <span className="font-mono text-[10px] text-charcoal/50">{event.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
