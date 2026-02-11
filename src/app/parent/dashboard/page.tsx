"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getLinkedStudents, getStudentActivityForParent, getNotifications } from "@/app/actions/dashboard";
import {
    User,
    Calendar,
    CreditCard,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Bell,
    Loader2
} from "lucide-react";

interface LinkedStudent {
    id: string;
    name: string;
    relationship: string;
    booking: {
        room_id: number | null;
        rooms: { name: string; type: string } | null;
        status: string;
    } | null;
}

interface ActivityLog {
    id: number;
    action: string;
    details: Record<string, unknown>;
    created_at: string;
}

interface Notification {
    id: number;
    type: string | null;
    title: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function ParentDashboard() {
    const { user } = useAuth();
    const [students, setStudents] = useState<LinkedStudent[]>([]);
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        const [s, a, n] = await Promise.all([
            getLinkedStudents(),
            getStudentActivityForParent(),
            getNotifications(),
        ]);
        setStudents(s as LinkedStudent[]);
        setActivities(a as ActivityLog[]);
        setNotifications(n as Notification[]);
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return `Today, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
        }
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">Parent Portal</span>
                <h1 className="font-display text-4xl text-charcoal mt-1">
                    Welcome, {user?.name?.split(" ")[0] || "there"}
                </h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Monitor your child&apos;s stay at Viramah
                </p>
            </motion.div>

            {/* Linked Students */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                {students.length > 0 ? (
                    <div className="space-y-3">
                        {students.map(student => (
                            <div key={student.id} className="bg-white rounded-2xl border border-sand-dark p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-terracotta-soft/30 flex items-center justify-center">
                                        <User className="w-8 h-8 text-terracotta-raw" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-body text-lg font-medium text-charcoal block">{student.name}</span>
                                        <span className="font-mono text-xs text-charcoal/50">
                                            {student.booking?.rooms
                                                ? `${student.booking.rooms.name} • ${student.booking.rooms.type}`
                                                : "No room assigned yet"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-muted/20">
                                        <CheckCircle className="w-4 h-4 text-sage-muted" />
                                        <span className="font-mono text-xs text-sage-muted">
                                            {student.booking?.status === 'confirmed' ? 'Checked In' : student.booking?.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-sand-dark p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-sand-light flex items-center justify-center">
                                <User className="w-8 h-8 text-charcoal/20" />
                            </div>
                            <div>
                                <span className="font-body text-lg font-medium text-charcoal block">No linked students</span>
                                <span className="font-mono text-xs text-charcoal/50">Students will appear here once they link their account</span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <Calendar className="w-6 h-6 text-terracotta-raw mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">Students</span>
                    <span className="font-display text-2xl text-charcoal">{students.length}</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <Bell className="w-6 h-6 text-gold mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">Notifications</span>
                    <span className="font-display text-2xl text-charcoal">{unreadCount} unread</span>
                </div>
                <div className="bg-white rounded-2xl border border-sand-dark p-6">
                    <AlertCircle className="w-6 h-6 text-sage-muted mb-3" />
                    <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block">Alerts</span>
                    <span className="font-display text-2xl text-charcoal">None</span>
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Recent Activity</h2>
                {activities.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="font-body text-sm text-charcoal/50">No recent activity</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-sand-light/50">
                                <div>
                                    <span className="font-body text-sm text-charcoal block">{item.action.replace(/_/g, ' ')}</span>
                                    <span className="font-mono text-[10px] text-charcoal/50">{formatDate(item.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
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
                    href="#"
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
