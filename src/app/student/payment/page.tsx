"use client";

import { useAuth } from "@/context/AuthContext";
import { CreditCard, CheckCircle2, AlertCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function StudentPaymentPage() {
    const { user } = useAuth();

    const summary = user?.paymentSummary || {};
    const grandTotal = summary.grandTotal || {};
    const totalAmount = grandTotal.total || 0;
    const receivedAmount = grandTotal.received || 0;
    const remainingDue = grandTotal.remaining || 0;
    const isFullyPaid = summary.isFullyPaid || remainingDue <= 0;

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Student Rent & Dues"
                    subtitle="View rent breakdown, installment schedule, and complete pending payments"
                    badge="PAYMENT PORTAL"
                />

                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Total Rent Package"
                        value={`₹${totalAmount.toLocaleString("en-IN")}`}
                        subtext="Annual / Semester fee"
                        icon={CreditCard}
                        color="#1F3A2D"
                    />
                    <StatCard
                        label="Total Paid"
                        value={`₹${receivedAmount.toLocaleString("en-IN")}`}
                        subtext="Received & verified"
                        icon={CheckCircle2}
                        color="#10b981"
                    />
                    <StatCard
                        label="Remaining Dues"
                        value={`₹${remainingDue.toLocaleString("en-IN")}`}
                        subtext={isFullyPaid ? "All dues cleared" : "Action required"}
                        icon={AlertCircle}
                        color={isFullyPaid ? "#10b981" : "#ef4444"}
                    />
                </div>

                {/* Detailed Payment Breakdown Card */}
                <div className="p-6 rounded-2xl bg-white border border-emerald-900/10 shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[#1F3A2D] mb-4">
                        Package Item Breakdown
                    </h3>

                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/40 border border-emerald-900/5">
                            <div>
                                <span className="font-bold text-[#1F3A2D] block">Room Rent & Amenities</span>
                                <span className="text-emerald-900/50">{user?.roomDetails?.roomType?.displayName || "Selected Room Package"}</span>
                            </div>
                            <span className="font-mono font-bold text-[#1F3A2D] text-sm">
                                ₹{(summary.roomRent?.total || 0).toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/40 border border-emerald-900/5">
                            <div>
                                <span className="font-bold text-[#1F3A2D] block">Security Deposit (Refundable)</span>
                                <span className="text-emerald-900/50">Held securely until move-out</span>
                            </div>
                            <span className="font-mono font-bold text-[#1F3A2D] text-sm">
                                ₹{(summary.securityDeposit?.total || 10000).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    {!isFullyPaid && (
                        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                            <div>
                                <span className="font-bold text-amber-900 text-xs block">Pending Payment Due</span>
                                <span className="text-amber-800 text-[0.72rem]">Complete your installment payment to maintain active reservation</span>
                            </div>
                            <Link
                                href="/user-onboarding/payment-breakdown"
                                className="px-5 py-2.5 rounded-xl bg-[#1F3A2D] text-[#D8B56A] font-bold text-xs shadow-md hover:bg-[#162b1e] transition-all flex items-center gap-1 shrink-0"
                            >
                                Pay Dues Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
