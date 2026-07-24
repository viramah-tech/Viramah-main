"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, ArrowRight, Upload, X, CheckCircle2, AlertCircle, 
  RefreshCw, Copy, Check, Info, FileText, Wallet, 
  Eye, ChevronRight, Printer
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { uploadPaymentProof } from "@/lib/uploadFile";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";
import { openReceiptWindow } from "@/lib/generateReceiptHtml";
import Image from "next/image";

export default function StudentPaymentPage() {
    const { user } = useAuth();
    const { summary, payments, isLoading, error, refetch } = useBookingStatus();

    const [amount, setAmount] = useState<string>("");
    const [transactionId, setTransactionId] = useState("");
    const [receipt, setReceipt] = useState<{ name: string; preview: string; file: File } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [upgrading, setUpgrading] = useState(false);
    const [paymentCategory, setPaymentCategory] = useState<string>("room_rent");
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [dragActive, setDragActive] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);

    const roomRent = summary?.roomRent;
    const isHalfPlan = roomRent?.selectedPlan === "half";
    const canUpgrade = isHalfPlan && (roomRent?.remaining ?? 0) > 0;

    // Auto-select category with remaining dues
    useEffect(() => {
        if (summary) {
            if ((summary.roomRent?.remaining ?? 0) > 0) {
                setPaymentCategory("room_rent");
            } else if ((summary.fines?.remaining ?? 0) > 0) {
                setPaymentCategory("fine");
            } else if ((summary.messFee?.remaining ?? 0) > 0) {
                setPaymentCategory("mess");
            } else if ((summary.transportFee?.remaining ?? 0) > 0) {
                setPaymentCategory("transport");
            }
        }
    }, [summary]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleUpgradePlan = async () => {
        if (!confirm("Are you sure you want to upgrade to the Full Payment Plan? You will get a higher discount, but the remaining balance will be due.")) return;
        
        setUpgrading(true);
        setActionError(null);
        setActionMessage(null);
        try {
            await apiFetch("/api/payment/upgrade-plan", {
                method: "POST",
            });
            setActionMessage("Successfully upgraded to the Full Payment Plan!");
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to upgrade payment plan");
        } finally {
            setUpgrading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setReceipt({
                    name: file.name,
                    preview: reader.result as string,
                    file,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setReceipt({
                    name: file.name,
                    preview: reader.result as string,
                    file,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionError(null);
        setActionMessage(null);

        if (!amount || Number(amount) <= 0) {
            setActionError("Please enter a valid amount.");
            return;
        }
        if (!transactionId.trim()) {
            setActionError("Please enter the UTR/Transaction ID.");
            return;
        }
        if (!receipt) {
            setActionError("Please upload the payment screenshot.");
            return;
        }

        setSubmitting(true);
        try {
            const proofUrl = await uploadPaymentProof(receipt.preview, receipt.name);
            
            await apiFetch(API.payment.final, {
                method: "POST",
                body: {
                    category: paymentCategory,
                    method: "bank_transfer",
                    transactionId: transactionId.trim(),
                    proofUrl,
                    amount: parseFloat(Number(amount).toFixed(2)),
                },
            });

            setActionMessage("Payment request submitted successfully for verification.");
            setAmount("");
            setTransactionId("");
            setReceipt(null);
            await refetch();
        } catch (err) {
            setActionError(err instanceof Error ? err.message : "Failed to submit payment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = (p: any) => {
        setPaymentCategory(p.category || "room_rent");
        setAmount(String(p.amount));
        document.getElementById("payment-form-section")?.scrollIntoView({ behavior: "smooth" });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-[#1F3A2D] gap-4">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span className="font-mono text-sm tracking-wider uppercase">Loading ledger details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
                <AlertCircle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-bold text-red-800">Connection Error</h3>
                    <p className="text-red-700/80 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const hasDues = (summary?.grandTotal?.remaining ?? 0) > 0;
    const pendingRentPayments = payments.filter(p => p.status === "pending");
    const totalPendingAmount = pendingRentPayments.reduce((sum, p) => sum + p.amount, 0);

    const getActiveRemaining = () => {
        if (paymentCategory === "room_rent") return summary?.roomRent?.remaining ?? 0;
        if (paymentCategory === "fine") return summary?.fines?.remaining ?? 0;
        if (paymentCategory === "mess") return summary?.messFee?.remaining ?? 0;
        if (paymentCategory === "transport") return summary?.transportFee?.remaining ?? 0;
        return summary?.grandTotal?.remaining ?? 0;
    };
    const activeRemaining = getActiveRemaining();

    const categoriesList = [
        {
            key: "room_rent",
            label: "Room Rent",
            icon: CreditCard,
            colorClass: "bg-emerald-500",
            textColor: "text-emerald-700",
            borderColor: "border-emerald-100",
            bgLight: "bg-emerald-50/40",
            total: summary?.roomRent?.total ?? 0,
            paid: summary?.roomRent?.paid ?? 0,
            remaining: summary?.roomRent?.remaining ?? 0,
        },
        {
            key: "mess",
            label: "Mess Fee",
            icon: Info,
            colorClass: "bg-amber-500",
            textColor: "text-amber-700",
            borderColor: "border-amber-100",
            bgLight: "bg-amber-50/40",
            total: summary?.messFee?.total ?? 0,
            paid: summary?.messFee?.paid ?? 0,
            remaining: summary?.messFee?.remaining ?? 0,
        },
        {
            key: "transport",
            label: "Transport Fee",
            icon: Info,
            colorClass: "bg-indigo-500",
            textColor: "text-indigo-700",
            borderColor: "border-indigo-100",
            bgLight: "bg-indigo-50/40",
            total: summary?.transportFee?.total ?? 0,
            paid: summary?.transportFee?.paid ?? 0,
            remaining: summary?.transportFee?.remaining ?? 0,
        },
        {
            key: "fine",
            label: "Fines & Penalties",
            icon: AlertCircle,
            colorClass: "bg-rose-500",
            textColor: "text-rose-700",
            borderColor: "border-rose-100",
            bgLight: "bg-rose-50/40",
            total: summary?.fines?.total ?? 0,
            paid: summary?.fines?.paid ?? 0,
            remaining: summary?.fines?.remaining ?? 0,
        }
    ].filter(cat => cat.total > 0);

    const paymentOptions = categoriesList
        .filter(cat => cat.remaining > 0)
        .map(cat => ({ value: cat.key, label: `${cat.label} (₹${cat.remaining.toLocaleString('en-IN')} pending)` }));

    const filteredPayments = payments.filter(p => {
        if (activeTab === "all") return true;
        return p.status === activeTab;
    });

    const totalRequired = summary?.totalRequired ?? 0;
    const totalPaid = summary?.totalPaid ?? 0;
    const paidPct = totalRequired ? Math.round((totalPaid / totalRequired) * 100) : 0;

    const categoryDetailsMap: Record<string, { label: string; textClass: string; bgClass: string }> = {
        room_rent: { label: "Room Rent", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
        fine: { label: "Fines", textClass: "text-rose-700", bgClass: "bg-rose-50" },
        mess: { label: "Mess Fee", textClass: "text-amber-700", bgClass: "bg-amber-50" },
        transport: { label: "Transport Fee", textClass: "text-indigo-700", bgClass: "bg-indigo-50" },
        booking: { label: "Booking Payment", textClass: "text-blue-700", bgClass: "bg-blue-50" },
    };

    const handlePrintReceipt = (p: any) => {
        const catLabel = categoryDetailsMap[p.category || "room_rent"]?.label || p.category || "Payment";
        const dateSettled = p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : "-";
        const dateSubmitted = p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) : "-";

        const formattedTxns = (payments || []).map((tx: any) => ({
            date: tx.uploadedAt ? new Date(tx.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
            category: tx.category || tx.paymentType,
            paymentType: tx.paymentType,
            method: tx.method,
            transactionId: tx.transactionId,
            receiptNumber: tx.receiptNumber,
            status: tx.status,
            amount: tx.amount,
            rejectionReason: tx.rejectionReason,
        }));

        const success = openReceiptWindow({
            payerName: user?.basicInfo?.fullName || "Student",
            userId: user?.basicInfo?.userId || "-",
            email: user?.basicInfo?.email || "-",
            phone: user?.basicInfo?.phone || "-",
            roomNumber: (user as any)?.roomNumber || (user as any)?.roomAllocation?.roomNumber || "Allocated Room",
            roomType: (user as any)?.roomType || "Standard Co-Living",
            paymentPlan: summary?.roomRent?.selectedPlan === "half" ? "Half Payment Plan" : "Full Payment Plan",
            description: `${catLabel} Settlement`,
            transactionId: p.transactionId || "-",
            method: p.method || "-",
            amount: p.amount,
            status: p.status,
            rejectionReason: p.rejectionReason,
            receiptNo: `REC-${p._id ? p._id.slice(-6).toUpperCase() : '000000'}`,
            dateSubmitted,
            dateSettled,
            transactions: formattedTxns,
            isFullyPaid: summary?.isFullyPaid,
        });

        if (!success) {
            alert("Popup blocker prevented opening the receipt. Please allow popups for this site.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="font-display text-4xl text-[#1F3A2D] font-medium tracking-tight">Payments</h1>
                <p className="text-charcoal/60 mt-2 font-body text-sm font-light">
                    Track your transaction history, check outstanding balances, and submit proof of payments.
                </p>
            </motion.div>

            {/* Notifications */}
            <AnimatePresence>
                {actionError && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{actionError}</span>
                    </motion.div>
                )}
                {actionMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3 text-sm"
                    >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>{actionMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Unified Progress Ledger Header */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-[#1F3A2D] to-[#14261F] text-sand-light rounded-3xl p-6 sm:p-8 border border-sand-dark/15 shadow-xl relative overflow-hidden"
            >
                {/* Background decorative vector */}
                <div className="absolute right-0 bottom-0 opacity-[0.03] translate-x-12 translate-y-12 select-none pointer-events-none">
                    <Wallet className="w-72 h-72" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-4 flex-1">
                        <div>
                            <span className="font-mono text-[10px] tracking-[0.2em] text-[#D8B56A] uppercase font-bold">Overall billing progress</span>
                            <h2 className="text-2xl font-display font-medium text-white mt-1">Payment Status Summary</h2>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-sand-light/70 font-mono">
                                <span>{paidPct}% OF TOTAL COMPLETED</span>
                                <span>₹{totalPaid.toLocaleString('en-IN')} / ₹{totalRequired.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="w-full bg-sand-light/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${paidPct}%` }} 
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="bg-[#D8B56A] h-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-4 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 text-center md:text-left">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-mono tracking-wider text-sand-light/40 uppercase">Billed</span>
                            <div className="text-sm sm:text-base font-bold font-mono">₹{totalRequired.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase">Paid</span>
                            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">₹{totalPaid.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-mono tracking-wider text-[#D8B56A] uppercase">Dues</span>
                            <div className="text-sm sm:text-base font-bold font-mono text-[#D8B56A]">₹{(summary?.grandTotal?.remaining ?? 0).toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Category Ledger breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoriesList.map((cat) => {
                    const pct = cat.total ? Math.round((cat.paid / cat.total) * 100) : 0;
                    return (
                        <motion.div 
                            key={cat.key}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="bg-white border border-sand-dark rounded-2xl p-5 flex flex-col justify-between hover:border-[#1F3A2D]/20 transition-all shadow-sm"
                        >
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`p-2 rounded-xl ${cat.bgLight} border border-sand-dark`}>
                                            <cat.icon className={`w-5 h-5 ${cat.textColor}`} />
                                        </div>
                                        <span className="font-display font-medium text-charcoal">{cat.label}</span>
                                    </div>
                                    {cat.remaining > 0 ? (
                                        <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase">Pending Due</span>
                                    ) : (
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Settled</span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-charcoal/40 font-mono text-[9px] uppercase tracking-wider block">Billed Total</span>
                                        <span className="font-bold font-mono text-charcoal/80">₹{cat.total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-charcoal/40 font-mono text-[9px] uppercase tracking-wider block">Remaining Balance</span>
                                        <span className={`font-bold font-mono ${cat.remaining > 0 ? 'text-[#D8B56A]' : 'text-charcoal/30'}`}>
                                            ₹{cat.remaining.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-sand-dark/60 mt-4">
                                <div className="w-full bg-sand-light/50 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full ${cat.colorClass} rounded-full`} style={{ width: `${pct}%` }} />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-charcoal/50 font-mono">
                                    <span>{pct}% Completed</span>
                                    {cat.remaining > 0 && (
                                        <button 
                                            onClick={() => {
                                                setPaymentCategory(cat.key);
                                                setAmount(String(cat.remaining));
                                                document.getElementById("payment-form-section")?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="text-xs font-semibold text-[#1F3A2D] hover:underline flex items-center gap-0.5"
                                        >
                                            Quick Pay <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Plan Upgrade Promo */}
            {canUpgrade && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-gradient-to-r from-[#D8B56A]/10 to-[#D8B56A]/5 border border-[#D8B56A]/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                    <div className="space-y-1">
                        <h4 className="font-display font-medium text-[#8f6d23] text-lg flex items-center gap-2">
                            <Info className="w-5 h-5 text-[#D8B56A]" /> Save 15% More on Room Rent
                        </h4>
                        <p className="text-xs text-[#8f6d23]/80 font-body max-w-xl">
                            You are currently on the Part Payment plan. Switch to the Full Payment plan to unlock an additional 15% discount on your remaining dues.
                        </p>
                    </div>
                    <button 
                        onClick={handleUpgradePlan}
                        disabled={upgrading}
                        className="py-2.5 px-5 bg-[#1F3A2D] text-sand-light font-bold text-xs rounded-xl shadow-md hover:bg-[#1a3227] transition-all disabled:opacity-50 shrink-0 font-mono tracking-wider uppercase"
                    >
                        {upgrading ? "Switching..." : "Upgrade Now"}
                    </button>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Forms and Details */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Bank & Transfer details */}
                    <div className="bg-white border border-sand-dark rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-sand-dark pb-3">
                            <h3 className="font-display font-medium text-charcoal flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-[#1F3A2D]" /> Direct Bank Transfer
                            </h3>
                        </div>

                        <div className="space-y-3.5 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-2xl bg-sand-light/20 border border-sand-dark/50">
                                    <span className="text-[10px] font-mono text-charcoal/40 block uppercase tracking-wider">Bank Name</span>
                                    <span className="font-bold text-xs text-charcoal">{PAYMENT_CONFIG.BANK_DETAILS.bank}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-sand-light/20 border border-sand-dark/50 flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-mono text-charcoal/40 block uppercase tracking-wider">IFSC Code</span>
                                        <span className="font-mono font-bold text-charcoal text-xs">{PAYMENT_CONFIG.BANK_DETAILS.ifsc}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(PAYMENT_CONFIG.BANK_DETAILS.ifsc, "ifsc")}
                                        className="text-charcoal/30 hover:text-[#1F3A2D]"
                                    >
                                        {copiedField === "ifsc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-2xl bg-sand-light/20 border border-sand-dark/50">
                                <div>
                                    <span className="text-[10px] font-mono text-charcoal/40 block uppercase tracking-wider">Account Number</span>
                                    <span className="font-mono font-bold text-charcoal">{PAYMENT_CONFIG.BANK_DETAILS.accountNo}</span>
                                </div>
                                <button 
                                    onClick={() => handleCopy(PAYMENT_CONFIG.BANK_DETAILS.accountNo, "acc")}
                                    className="p-2 text-charcoal/40 hover:text-[#1F3A2D] transition-colors rounded-lg hover:bg-sand-light"
                                >
                                    {copiedField === "acc" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="flex justify-between items-center p-3 rounded-2xl bg-sand-light/20 border border-sand-dark/50">
                                <div>
                                    <span className="text-[10px] font-mono text-charcoal/40 block uppercase tracking-wider">Account Holder Name</span>
                                    <span className="font-mono font-bold text-charcoal text-xs">{PAYMENT_CONFIG.BANK_DETAILS.accountName}</span>
                                </div>
                                <button 
                                    onClick={() => handleCopy(PAYMENT_CONFIG.BANK_DETAILS.accountName, "holder")}
                                    className="p-2 text-charcoal/40 hover:text-[#1F3A2D] transition-colors rounded-lg hover:bg-sand-light"
                                >
                                    {copiedField === "holder" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Submission Form */}
                    {hasDues && (
                        <div id="payment-form-section" className="bg-white border border-sand-dark rounded-3xl p-6 space-y-5">
                            <h3 className="font-display font-medium text-charcoal text-lg">Submit Payment Proof</h3>
                            
                            <form onSubmit={handleSubmitPayment} className="space-y-4">
                                {paymentOptions.length > 1 && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider font-bold">Select Dues Category</label>
                                        <select
                                            value={paymentCategory}
                                            onChange={(e) => {
                                                setPaymentCategory(e.target.value);
                                                setAmount("");
                                            }}
                                            className="w-full px-4 py-3 rounded-xl bg-sand-light/20 border border-sand-dark text-sm text-charcoal font-medium focus:outline-none focus:border-[#1F3A2D]"
                                        >
                                            {paymentOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider font-bold">Amount Transferred (₹)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount paid"
                                            min="1"
                                            max={activeRemaining}
                                            className="w-full px-4 py-3 rounded-xl bg-sand-light/20 border border-sand-dark text-sm text-charcoal font-mono focus:outline-none focus:border-[#1F3A2D]"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setAmount(String(activeRemaining))} 
                                            className="absolute right-3 top-2 px-2.5 py-1 bg-sand-light hover:bg-[#1F3A2D]/5 rounded-lg text-[10px] font-mono font-bold text-[#1F3A2D] border border-sand-dark/60 transition-all"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-charcoal/40 font-body">Maximum remaining due for this category: ₹{activeRemaining.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider font-bold">Transaction ID (UTR)</label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter UTR reference number"
                                        className="w-full px-4 py-3 rounded-xl bg-sand-light/20 border border-sand-dark text-sm text-charcoal font-mono focus:outline-none focus:border-[#1F3A2D]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono text-charcoal/40 uppercase tracking-wider font-bold">Payment Screenshot Receipt</label>
                                    
                                    {receipt ? (
                                        <div className="relative w-full rounded-2xl overflow-hidden border border-sand-dark bg-sand-light/10 p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 bg-white rounded-lg border border-sand-dark overflow-hidden">
                                                    <img src={receipt.preview} alt="Receipt Preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="max-w-[200px] truncate text-xs font-mono text-charcoal/70">
                                                    {receipt.name}
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setReceipt(null)}
                                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                            className={`w-full rounded-2xl border-2 border-dashed ${dragActive ? 'border-[#1F3A2D] bg-[#1F3A2D]/5' : 'border-sand-dark bg-sand-light/10'} hover:border-[#1F3A2D] hover:bg-sand-light/20 transition-all p-6 text-center cursor-pointer`}
                                        >
                                            <input 
                                                type="file" 
                                                id="receipt-file" 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                                className="hidden" 
                                            />
                                            <label htmlFor="receipt-file" className="cursor-pointer space-y-2.5 flex flex-col items-center">
                                                <div className="p-3 bg-white rounded-xl shadow-sm border border-sand-dark">
                                                    <Upload className="w-5 h-5 text-charcoal/40" />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-[#1F3A2D] hover:underline block">Choose screenshot receipt</span>
                                                    <span className="text-[10px] text-charcoal/40 block mt-0.5">Drag and drop here, or select from device</span>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 bg-[#1F3A2D] hover:bg-[#15271e] text-sand-light font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 font-mono tracking-wider uppercase mt-6"
                                >
                                    {submitting ? "Submitting details..." : "Submit Transaction Proof"}
                                    {!submitting && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Side: Payment History / Status */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Status filter tabs */}
                    <div className="bg-white border border-sand-dark rounded-3xl p-5 space-y-4">
                        <div className="flex justify-between items-center border-b border-sand-dark pb-3">
                            <h3 className="font-display font-medium text-charcoal text-base">Transaction Records</h3>
                            <button 
                                onClick={refetch}
                                className="text-charcoal/40 hover:text-charcoal p-1.5 hover:bg-sand-light rounded-lg transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs container */}
                        <div className="flex bg-sand-light/50 p-1 rounded-xl border border-sand-dark text-[10px] font-mono font-bold text-charcoal/60 uppercase tracking-wide">
                            {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                                        activeTab === tab 
                                            ? 'bg-white text-[#1F3A2D] shadow-sm font-bold' 
                                            : 'hover:text-[#1F3A2D]'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Records List */}
                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                            {filteredPayments.length === 0 ? (
                                <div className="text-center py-12 text-charcoal/30">
                                    <FileText className="w-8 h-8 mx-auto stroke-1" />
                                    <span className="text-[10px] font-mono uppercase tracking-wider block mt-2">No records found</span>
                                </div>
                            ) : (
                                filteredPayments.map((p) => {
                                    const catDetail = categoryDetailsMap[p.category || "room_rent"] || { label: p.category || "Other", textClass: "text-charcoal/80", bgClass: "bg-sand-light" };
                                    return (
                                        <div 
                                            key={p._id}
                                            className={`border rounded-2xl p-4 space-y-3 transition-colors ${
                                                p.status === 'approved' 
                                                    ? 'bg-emerald-50/10 border-emerald-100 hover:border-emerald-200' 
                                                    : p.status === 'rejected'
                                                        ? 'bg-rose-50/10 border-rose-100 hover:border-rose-200'
                                                        : 'bg-amber-50/10 border-amber-100 hover:border-amber-200'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${catDetail.bgClass} ${catDetail.textClass}`}>
                                                        {catDetail.label}
                                                    </span>
                                                    <div className="text-lg font-bold font-mono text-charcoal mt-1">₹{p.amount.toLocaleString('en-IN')}</div>
                                                </div>

                                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                                    p.status === 'approved' 
                                                        ? 'bg-emerald-100/60 text-emerald-700 border border-emerald-200' 
                                                        : p.status === 'rejected' 
                                                            ? 'bg-rose-100/60 text-rose-700 border border-rose-200'
                                                            : 'bg-amber-100/60 text-amber-700 border border-amber-200 animate-pulse'
                                                }`}>
                                                    {p.status === 'pending' ? 'Reviewing' : p.status}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-[10px] font-mono text-charcoal/50 border-t border-dashed border-sand-dark/60 pt-3">
                                                <div className="flex justify-between">
                                                    <span>UTR REFERENCE</span>
                                                    <span className="font-bold text-charcoal">{p.transactionId}</span>
                                                </div>
                                                {p.uploadedAt && (
                                                    <div className="flex justify-between">
                                                        <span>DATE SUBMITTED</span>
                                                        <span>{new Date(p.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                                {p.status === 'approved' && p.approvedAt && (
                                                    <div className="flex justify-between text-emerald-700 font-bold">
                                                        <span>DATE SETTLED</span>
                                                        <span>{new Date(p.approvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                )}
                                                {p.status === 'approved' && (
                                                    <div className="flex justify-end pt-3 border-t border-dashed border-sand-dark/40 mt-3">
                                                        <button
                                                            onClick={() => handlePrintReceipt(p)}
                                                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1F3A2D] hover:bg-[#15271e] text-[#F6F4EF] hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md active:scale-95"
                                                        >
                                                            <Printer className="w-4 h-4" />
                                                            Print Receipt
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rejection Detail */}
                                            {p.status === 'rejected' && (
                                                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl space-y-2 mt-2">
                                                    <div className="text-[10px] font-mono text-rose-700 font-bold flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> REJECTION REASON:
                                                    </div>
                                                    <p className="text-xs text-rose-600/90 font-body leading-relaxed">{p.rejectionReason || 'No reason specified by accountant.'}</p>
                                                    <button
                                                        onClick={() => handleRetry(p)}
                                                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-colors"
                                                    >
                                                        Correct and Retry
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Scanner Modal Overlay Removed */}
        </div>
    );
}
