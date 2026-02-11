"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, Loader2, X } from "lucide-react";
import { getWalletData, topUpWallet } from "@/app/actions/dashboard";

interface Transaction {
    id: number;
    type: 'topup' | 'payment' | 'refund';
    amount: number;
    description: string | null;
    created_at: string;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");
    const [isTopping, setIsTopping] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        const data = await getWalletData();
        if (data) {
            setBalance(data.balance);
            setTransactions(data.transactions as Transaction[]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (!amount || amount <= 0) { setError("Enter a valid amount"); return; }

        setIsTopping(true);
        setError(null);
        const fd = new FormData();
        fd.append("amount", String(amount));
        const result = await topUpWallet(fd);
        if (result.error) {
            setError(result.error);
        } else {
            setShowTopUp(false);
            setTopUpAmount("");
            await loadData();
        }
        setIsTopping(false);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) {
            return `Today, ${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`;
        }
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-terracotta-raw" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="font-display text-4xl text-charcoal">Wallet</h1>
                <p className="font-body text-charcoal/60 mt-2">Manage your payments and transactions</p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-terracotta-raw to-terracotta-soft rounded-3xl p-8 text-white"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <span className="font-mono text-xs opacity-70 uppercase tracking-widest">Available Balance</span>
                        <div className="font-display text-5xl mt-2">₹{balance.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-white" />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <Button
                        variant="secondary"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-2"
                        onClick={() => setShowTopUp(true)}
                    >
                        <Plus className="w-4 h-4" />Add Funds
                    </Button>
                </div>
            </motion.div>

            {/* Top-Up Modal */}
            {showTopUp && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-sand-dark p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-body font-medium text-charcoal">Add Funds</h3>
                        <button onClick={() => setShowTopUp(false)} className="p-1 rounded-full hover:bg-sand-light">
                            <X className="w-4 h-4 text-charcoal/50" />
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {QUICK_AMOUNTS.map(amt => (
                            <button
                                key={amt}
                                onClick={() => setTopUpAmount(String(amt))}
                                className={`py-3 rounded-xl border-2 font-mono text-sm transition-all ${topUpAmount === String(amt)
                                        ? "border-terracotta-raw bg-terracotta-raw/10 text-terracotta-raw"
                                        : "border-sand-dark text-charcoal/60 hover:border-charcoal/30"
                                    }`}
                            >
                                ₹{amt.toLocaleString()}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Custom amount..."
                            className="flex-1 px-4 py-3 rounded-xl border border-sand-dark font-mono text-sm focus:outline-none focus:border-terracotta-raw"
                        />
                        <Button
                            onClick={handleTopUp}
                            disabled={isTopping}
                            className="gap-2"
                        >
                            {isTopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {isTopping ? "Adding..." : "Add"}
                        </Button>
                    </div>
                    {error && <p className="font-body text-sm text-red-500">{error}</p>}
                </motion.div>
            )}

            {/* Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Recent Transactions</h2>
                {transactions.length === 0 ? (
                    <div className="py-8 text-center">
                        <Wallet className="w-12 h-12 text-charcoal/10 mx-auto mb-3" />
                        <p className="font-body text-charcoal/50 text-sm">No transactions yet</p>
                        <p className="font-mono text-[10px] text-charcoal/40 mt-1">Top up your wallet to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-sand-light/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "topup" || tx.type === "refund" ? "bg-sage-muted/20" : "bg-terracotta-raw/10"
                                    }`}>
                                    {tx.type === "topup" || tx.type === "refund"
                                        ? <ArrowDownLeft className="w-5 h-5 text-sage-muted" />
                                        : <ArrowUpRight className="w-5 h-5 text-terracotta-raw" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <span className="font-body text-sm font-medium text-charcoal block">
                                        {tx.description || tx.type}
                                    </span>
                                    <span className="font-mono text-[10px] text-charcoal/50">{formatDate(tx.created_at)}</span>
                                </div>
                                <span className={`font-mono text-sm font-medium ${tx.type === "topup" || tx.type === "refund" ? "text-sage-muted" : "text-charcoal"
                                    }`}>
                                    {tx.type === "topup" || tx.type === "refund" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
