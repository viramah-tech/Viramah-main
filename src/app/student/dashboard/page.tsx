"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Wallet, UtensilsCrossed, Dumbbell, Wrench, Bus, FileCheck, CreditCard,
    AlertCircle, CheckCircle2, ChevronRight, User, Bell, Sparkles, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const GOLD = "#D8B56A";
const GREEN = "#1F3A2D";

const QUICK_ACTIONS = [
    { label: "Add Funds", href: "/student/wallet", icon: Wallet, bg: "bg-[#1F3A2D]", fg: "text-[#D8B56A]" },
    { label: "Mess & Menu", href: "/student/canteen", icon: UtensilsCrossed, bg: "bg-[#D8B56A]", fg: "text-[#1F3A2D]" },
    { label: "Amenities", href: "/student/amenities", icon: Dumbbell, bg: "bg-[#1F3A2D]/10", fg: "text-[#1F3A2D]" },
    { label: "Maintenance", href: "/student/maintenance", icon: Wrench, bg: "bg-[#D8B56A]/20", fg: "text-[#9a7a3a]" },
    { label: "Transport", href: "/student/transport", icon: Bus, bg: "bg-emerald-500/10", fg: "text-emerald-800" },
    { label: "Documents", href: "/student/documents", icon: FileCheck, bg: "bg-[#1F3A2D]", fg: "text-white" },
];

export default function StudentDashboardPage() {
    const { user, refreshUser } = useAuth();

    // Fetch maintenance requests count
    const { data: maintenanceData, isLoading: loadingMaintenance, refetch: refetchMaintenance } = useQuery({
        queryKey: ["student-maintenance-requests"],
        queryFn: () => apiGet<any[]>(API.maintenance.studentRequests),
    });

    // Fetch today's mess menu
    const { data: messMenuData } = useQuery({
        queryKey: ["today-mess-menu"],
        queryFn: () => apiGet<any>(API.mess.todayMenu),
    });

    const openMaintenanceCount = (maintenanceData || []).filter(
        (r) => r.status !== "resolved" && r.status !== "closed"
    ).length;

    const remainingDue = user?.paymentSummary?.grandTotal?.remaining || 0;
    const isFullyPaid = user?.paymentSummary?.isFullyPaid || remainingDue <= 0;

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                {/* Header */}
                <PageHeader
                    title={`Welcome back, ${user?.basicInfo?.fullName?.split(" ")[0] || "Student"}!`}
                    subtitle={`Room ${user?.roomNumber || user?.roomDetails?.roomNumber || "Unassigned"} · ${user?.basicInfo?.userId || "ID"}`}
                    badge="ACTIVE RESIDENT"
                    action={
                        <button
                            onClick={() => { refreshUser(); refetchMaintenance(); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-[#1F3A2D]" /> Sync Dashboard
                        </button>
                    }
                />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Payment Status"
                        value={isFullyPaid ? "Fully Paid" : `₹${remainingDue.toLocaleString("en-IN")}`}
                        subtext={isFullyPaid ? "No pending rent dues" : "Outstanding balance"}
                        icon={CreditCard}
                        color={isFullyPaid ? "#10b981" : "#ef4444"}
                    />
                    <StatCard
                        label="Open Maintenance Tickets"
                        value={loadingMaintenance ? "..." : openMaintenanceCount}
                        subtext={openMaintenanceCount > 0 ? "Under resolution" : "All issues resolved"}
                        icon={Wrench}
                        color={openMaintenanceCount > 0 ? "#f59e0b" : "#1F3A2D"}
                    />
                    <StatCard
                        label="Document Verification"
                        value={user?.verification?.documentVerificationStatus?.toUpperCase() || "VERIFIED"}
                        subtext="KYC compliance status"
                        icon={FileCheck}
                        color="#1F3A2D"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block mb-3">
                        Quick Actions
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm hover:border-emerald-900/30 hover:shadow-md transition-all flex flex-col items-center gap-2 text-center group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.fg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-xs text-[#1F3A2D]">
                                        {action.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Live Section Rows: Today's Menu & Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Today's Mess Menu Card */}
                    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <UtensilsCrossed className="w-5 h-5 text-[#1F3A2D]" />
                                    <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Today&apos;s Mess Menu</h3>
                                </div>
                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/40 uppercase bg-emerald-900/5 px-2.5 py-1 rounded-full">
                                    FRESH TODAY
                                </span>
                            </div>

                            {messMenuData ? (
                                <div className="space-y-3 text-xs text-emerald-900/80">
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Breakfast:</strong>
                                        {messMenuData.breakfast || "Aloo Paratha, Curd, Tea/Coffee"}
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Lunch:</strong>
                                        {messMenuData.lunch || "Paneer Butter Masala, Dal Makhani, Rice, Roti"}
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Dinner:</strong>
                                        {messMenuData.dinner || "Mix Veg, Dal Tadka, Jeera Rice, Gulab Jamun"}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-xs text-emerald-900/80">
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Breakfast (8:00 AM - 10:00 AM):</strong>
                                        Puri Bhaji, Sprouted Moong, Tea & Coffee
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Lunch (12:30 PM - 2:30 PM):</strong>
                                        Shahi Paneer, Chana Dal, Jeera Rice, Chapati, Salad
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-900/5">
                                        <strong className="text-[#1F3A2D] block mb-1">Dinner (8:00 PM - 10:00 PM):</strong>
                                        Veg Kolhapuri, Dal Fry, Steamed Rice, Phulka, Sweet
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/student/canteen"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F3A2D] hover:underline mt-4"
                        >
                            View Weekly Schedule & Polls <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Maintenance Quick Status Card */}
                    <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-[#1F3A2D]" />
                                    <h3 className="font-serif text-lg font-bold text-[#1F3A2D] m-0">Recent Maintenance Requests</h3>
                                </div>
                                <span className="font-mono text-[0.65rem] font-bold text-emerald-900/40 uppercase bg-emerald-900/5 px-2.5 py-1 rounded-full">
                                    LIVE S3
                                </span>
                            </div>

                            {loadingMaintenance ? (
                                <LoadingSkeleton count={3} />
                            ) : (maintenanceData || []).length === 0 ? (
                                <div className="p-8 text-center text-xs text-emerald-900/50">
                                    No maintenance requests. All room amenities in good standing!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(maintenanceData || []).slice(0, 3).map((req: any) => (
                                        <div key={req._id} className="p-3 rounded-xl border border-emerald-900/5 flex items-center justify-between">
                                            <div>
                                                <span className="font-semibold text-xs text-[#1F3A2D] block">{req.issueTitle}</span>
                                                <span className="font-mono text-[0.65rem] text-emerald-900/40">{req.ticketId} · {req.department?.toUpperCase()}</span>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase bg-emerald-500/10 text-emerald-800">
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/student/maintenance"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#1F3A2D] hover:underline mt-4"
                        >
                            Go to Maintenance Portal <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
