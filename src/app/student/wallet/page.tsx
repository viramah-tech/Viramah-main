"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from "lucide-react";

const TRANSACTIONS = [
    { type: "credit", label: "Added Funds", amount: 2000, date: "Today, 2:30 PM" },
    { type: "debit", label: "Canteen - Lunch", amount: 150, date: "Today, 1:00 PM" },
    { type: "debit", label: "Laundry Service", amount: 200, date: "Yesterday" },
    { type: "credit", label: "Refund - Gym Slot", amount: 100, date: "Feb 5" },
];

export default function WalletPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="font-display text-4xl text-charcoal">Wallet</h1>
                <p className="font-body text-charcoal/60 mt-2">
                    Manage your payments and transactions
                </p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-terracotta-raw to-terracotta-soft rounded-3xl p-8 text-white"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <span className="font-mono text-xs opacity-70 uppercase tracking-widest">Available Balance</span>
                        <div className="font-display text-5xl mt-2">₹2,450</div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Wallet className="w-7 h-7 text-white" />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Funds
                    </Button>
                    <Button variant="secondary" className="bg-white/20 border-white/30 text-white hover:bg-white/30 gap-2">
                        <CreditCard className="w-4 h-4" />
                        Linked Cards
                    </Button>
                </div>
            </motion.div>

            {/* Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl border border-sand-dark p-6"
            >
                <h2 className="font-body font-medium text-charcoal mb-4">Recent Transactions</h2>
                <div className="space-y-3">
                    {TRANSACTIONS.map((tx, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-sand-light/50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "credit" ? "bg-sage-muted/20" : "bg-terracotta-raw/10"
                                }`}>
                                {tx.type === "credit"
                                    ? <ArrowDownLeft className="w-5 h-5 text-sage-muted" />
                                    : <ArrowUpRight className="w-5 h-5 text-terracotta-raw" />
                                }
                            </div>
                            <div className="flex-1">
                                <span className="font-body text-sm font-medium text-charcoal block">{tx.label}</span>
                                <span className="font-mono text-[10px] text-charcoal/50">{tx.date}</span>
                            </div>
                            <span className={`font-mono text-sm font-medium ${tx.type === "credit" ? "text-sage-muted" : "text-charcoal"
                                }`}>
                                {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
