"use client";

import { useAuth } from "@/context/AuthContext";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function WalletPage() {
    const { user, refreshUser } = useAuth();

    const paymentDetails = user?.paymentDetails || [];
    const grandTotal = user?.paymentSummary?.grandTotal || {};
    const remainingDue = grandTotal.remaining || 0;
    const totalPaid = grandTotal.received || 0;

    return (
        <div className="min-h-screen bg-[#F4F6F4] p-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Student Digital Ledger"
                    subtitle="Track rent payments, security deposits, and transaction receipts"
                    badge="ENCRYPTED LEDGER"
                    action={
                        <button
                            onClick={() => refreshUser()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-[#1F3A2D]" /> Sync Ledger
                        </button>
                    }
                />

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Total Paid To Date"
                        value={`₹${totalPaid.toLocaleString("en-IN")}`}
                        subtext="Verified payment receipts"
                        icon={Wallet}
                        color="#10b981"
                    />
                    <StatCard
                        label="Remaining Due"
                        value={`₹${remainingDue.toLocaleString("en-IN")}`}
                        subtext={remainingDue <= 0 ? "Fully Paid" : "Pending balance"}
                        icon={CreditCard}
                        color={remainingDue <= 0 ? "#10b981" : "#ef4444"}
                    />
                    <StatCard
                        label="Security Deposit"
                        value={`₹${(user?.paymentSummary?.securityDeposit?.received || 10000).toLocaleString("en-IN")}`}
                        subtext="Refundable deposit held"
                        icon={ShieldCheck}
                        color="#1F3A2D"
                    />
                </div>

                {/* Transactions History Table */}
                <div>
                    <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block mb-3">
                        Payment Transaction History
                    </span>

                    <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-900/5 border-b border-emerald-900/10 text-[0.72rem] font-bold text-emerald-900/60 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Date</th>
                                    <th className="py-3.5 px-6">Payment Category</th>
                                    <th className="py-3.5 px-6">Amount</th>
                                    <th className="py-3.5 px-6">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-900/5">
                                {paymentDetails.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-xs text-emerald-900/50">
                                            No payment transactions recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    paymentDetails.map((tx: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-emerald-50/40 transition-all text-xs">
                                            <td className="py-4 px-6 font-mono text-emerald-900/60">
                                                {new Date(tx.paidAt || tx.reviewedAt || Date.now()).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="py-4 px-6 font-semibold text-[#1F3A2D] capitalize">
                                                {tx.paymentType?.replace(/_/g, " ") || tx.category || "Booking Fee"}
                                            </td>
                                            <td className="py-4 px-6 font-mono font-bold text-emerald-800">
                                                ₹{Number(tx.amounts?.totalAmount || tx.amount || 0).toLocaleString("en-IN")}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 rounded-full text-[0.68rem] font-bold uppercase bg-emerald-500/10 text-emerald-800">
                                                    {tx.status || "APPROVED"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
