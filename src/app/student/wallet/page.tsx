"use client";

import { useAuth } from "@/context/AuthContext";
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, Receipt } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function WalletPage() {
    const { user, refreshUser } = useAuth();

    const paymentDetails = user?.paymentDetails || [];
    const grandTotal = user?.paymentSummary?.grandTotal || {};
    const remainingDue = grandTotal.remaining || 0;
    const totalPaid = grandTotal.paid || grandTotal.received || 0;
    const totalPackage = grandTotal.total || 0;
    const basePriceSum = grandTotal.basePrice || Math.round(totalPackage / 1.18);
    const gstAmountSum = grandTotal.gstAmount || (totalPackage - basePriceSum);

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <PageHeader
                    title="Student Digital Ledger"
                    subtitle="Track rent payments, security deposits, GST breakdown, and transaction receipts"
                    badge="ENCRYPTED LEDGER"
                    action={
                        <button
                            onClick={() => refreshUser({ force: true })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-900/15 text-[#1F3A2D] font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 text-[#1F3A2D]" /> Sync Ledger
                        </button>
                    }
                />

                {/* Overall Package with GST Banner */}
                <div className="p-6 rounded-2xl bg-[#1F3A2D] text-white shadow-md flex items-center justify-between flex-wrap gap-4 border border-emerald-900/20">
                    <div>
                        <span className="font-mono text-xs text-[#D8B56A] uppercase font-bold tracking-wider block mb-1">
                            Overall Package Summary
                        </span>
                        <h3 className="font-serif text-2xl font-bold text-white m-0">
                            Total Payable: ₹{totalPackage.toLocaleString("en-IN")}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 m-0 font-mono">
                            Base: ₹{basePriceSum.toLocaleString("en-IN")} + 18% GST: ₹{gstAmountSum.toLocaleString("en-IN")}
                        </p>
                    </div>

                    <div className="text-right">
                        <span className="font-mono text-xs text-white/60 uppercase block">Ledger Status</span>
                        <span className={`font-mono text-sm font-bold uppercase ${remainingDue <= 0 ? "text-emerald-400" : "text-amber-300"}`}>
                            {remainingDue <= 0 ? "FULLY PAID" : `DUES REMAINING: ₹${remainingDue.toLocaleString("en-IN")}`}
                        </span>
                    </div>
                </div>

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
                        value={`₹${(user?.paymentSummary?.securityDeposit?.total || 15000).toLocaleString("en-IN")}`}
                        subtext="Refundable deposit held"
                        icon={ShieldCheck}
                        color="#1F3A2D"
                    />
                </div>

                {/* Transactions History Table */}
                <div>
                    <span className="font-mono text-xs font-bold text-emerald-900/50 uppercase tracking-wider block mb-3">
                        Verified Payment Receipts
                    </span>

                    <div className="bg-white rounded-2xl border border-emerald-900/10 overflow-hidden shadow-sm">
                        {paymentDetails.length === 0 ? (
                            <div className="p-12 text-center text-xs text-emerald-900/50">
                                No payment receipts found.
                            </div>
                        ) : (
                            <div className="divide-y divide-emerald-900/5">
                                {paymentDetails.map((tx: any, idx: number) => (
                                    <div key={idx} className="p-4 flex items-center justify-between flex-wrap gap-2 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#1F3A2D] block capitalize">
                                                    {tx.category || tx.paymentType || "Payment"}
                                                </span>
                                                <span className="text-[0.68rem] text-emerald-900/50 font-mono">
                                                    {tx.transactionId || tx.paymentId} · {tx.method}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-right font-mono">
                                            <span className="font-bold text-emerald-700 block">
                                                +₹{(tx.amounts?.totalAmount || tx.amount || 0).toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-[0.65rem] text-emerald-900/40 capitalize">
                                                {tx.status || "approved"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
