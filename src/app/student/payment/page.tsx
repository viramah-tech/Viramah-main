"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, Upload, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useBookingStatus } from "@/hooks/useBookingStatus";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { uploadPaymentProof } from "@/lib/uploadFile";
import { FieldLabel, FieldInput, FieldError } from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";
import Image from "next/image";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export default function StudentPaymentPage() {
    const { token } = useAuth();
    const { summary, payments, isLoading, error, refetch } = useBookingStatus();

    const [amount, setAmount] = useState<string>("");
    const [transactionId, setTransactionId] = useState("");
    const [receipt, setReceipt] = useState<{ name: string; preview: string; file: File } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [upgrading, setUpgrading] = useState(false);

    const roomRent = summary?.roomRent;
    const isHalfPlan = roomRent?.selectedPlan === "half";
    const canUpgrade = isHalfPlan && (roomRent?.remaining ?? 0) > 0;

    const handleUpgradePlan = async () => {
        if (!confirm("Are you sure you want to upgrade to the Full Payment Plan? You will get a higher discount, but the remaining balance will be due.")) return;
        
        setUpgrading(true);
        setActionError(null);
        setActionMessage(null);
        try {
            await apiFetch("/api/payment/upgrade-plan", {
                method: "POST",
                token,
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
                token,
                body: {
                    category: "room_rent",
                    method: "upi",
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

    if (isLoading) {
        return <div style={{ padding: 40, textAlign: "center", color: GREEN }}>Loading payment details...</div>;
    }

    if (error) {
        return <div style={{ padding: 40, color: "red" }}>{error}</div>;
    }

    const hasDues = (roomRent?.remaining ?? 0) > 0;
    const pendingRentPayments = payments.filter(p => p.category === "room_rent" && p.status === "pending");
    const totalPendingAmount = pendingRentPayments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 40 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.5rem", color: GREEN, margin: "0 0 8px 0" }}>
                    Payments
                </h1>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(31,58,45,0.6)", margin: 0 }}>
                    Manage your room rent and other dues.
                </p>
            </motion.div>

            {actionError && (
                <div style={{ marginTop: 20, background: "rgba(220,38,38,0.1)", padding: 16, borderRadius: 12, display: "flex", gap: 10, color: "#dc2626", alignItems: "center" }}>
                    <AlertCircle size={20} />
                    <span>{actionError}</span>
                </div>
            )}
            {actionMessage && (
                <div style={{ marginTop: 20, background: "rgba(22,163,74,0.1)", padding: 16, borderRadius: 12, display: "flex", gap: 10, color: "#16a34a", alignItems: "center" }}>
                    <CheckCircle2 size={20} />
                    <span>{actionMessage}</span>
                </div>
            )}

            {/* Room Rent Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(31,58,45,0.1)" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ margin: "0 0 4px 0", fontSize: "1.2rem", color: GREEN }}>Room Rent Ledger</h2>
                        <span style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Current Plan: <strong style={{ color: GOLD }}>{roomRent?.selectedPlan === "full" ? "Full Payment" : "Part Payment"}</strong>
                        </span>
                    </div>
                    <CreditCard size={28} color={GREEN} style={{ opacity: 0.5 }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                    <div style={{ background: "rgba(31,58,45,0.03)", padding: 16, borderRadius: 12 }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Rent</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: GREEN }}>₹{roomRent?.total?.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "rgba(31,58,45,0.03)", padding: 16, borderRadius: 12 }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Paid</span>
                        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#16a34a" }}>₹{roomRent?.paid?.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "rgba(216,181,106,0.1)", padding: 16, borderRadius: 12, border: `1px solid ${GOLD}` }}>
                        <span style={{ fontSize: "0.75rem", color: "#9a7a3a", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Remaining Due</span>
                        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: GOLD }}>₹{roomRent?.remaining?.toLocaleString()}</div>
                    </div>
                </div>

                {/* Pending display */}
                {totalPendingAmount > 0 && (
                    <div style={{ marginTop: 16, padding: "10px 16px", background: "rgba(31,58,45,0.03)", borderRadius: 8, fontSize: "0.85rem", color: "rgba(31,58,45,0.6)", display: "flex", justifyContent: "space-between" }}>
                        <span>Pending Verification</span>
                        <span style={{ fontWeight: 600 }}>₹{totalPendingAmount.toLocaleString()}</span>
                    </div>
                )}

                {/* Upgrade Banner */}
                {canUpgrade && (
                    <div style={{ marginTop: 20, background: "linear-gradient(135deg, #1F3A2D, #2a4d3a)", borderRadius: 12, padding: 20, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                        <div>
                            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", color: GOLD }}>Upgrade to Full Plan</h3>
                            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", maxWidth: 400 }}>
                                You are currently on the Part Payment plan ({roomRent?.halfPaymentDiscountPct}% off). 
                                Switch to the Full Payment plan to get {roomRent?.fullPaymentDiscountPct}% off your total room rent!
                            </p>
                        </div>
                        <button
                            onClick={handleUpgradePlan}
                            disabled={upgrading}
                            style={{
                                background: GOLD,
                                color: GREEN,
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                cursor: upgrading ? "not-allowed" : "pointer",
                                opacity: upgrading ? 0.7 : 1,
                            }}
                        >
                            {upgrading ? "Upgrading..." : "Upgrade Plan Now"}
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Payment Form */}
            {hasDues && (
                <motion.form
                    onSubmit={handleSubmitPayment}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(31,58,45,0.1)" }}
                >
                    <h3 style={{ margin: "0 0 20px 0", fontSize: "1.1rem", color: GREEN }}>Make a Payment</h3>

                    {/* Bank Details */}
                    <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: 16, border: "1px dashed rgba(31,58,45,0.1)", marginBottom: 20 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: GREEN, margin: "0 0 12px 0" }}>Transfer via UPI:</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                            <Image src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="QR Code" width={80} height={80} style={{ borderRadius: 8 }} />
                            <div>
                                <div style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>UPI ID:</div>
                                <div style={{ fontSize: "1rem", color: GREEN, fontWeight: 700 }}>{PAYMENT_CONFIG.BANK_DETAILS.upiId}</div>
                                <div style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", marginTop: 4 }}>{PAYMENT_CONFIG.BANK_DETAILS.accountName}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <FieldLabel htmlFor="payment-amount">Amount (₹)</FieldLabel>
                            <FieldInput
                                id="payment-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount to pay"
                                min="1"
                                max={roomRent.remaining}
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button type="button" onClick={() => setAmount(String(roomRent.remaining))} style={{ fontSize: "0.75rem", background: "rgba(31,58,45,0.05)", border: "none", padding: "4px 10px", borderRadius: 20, cursor: "pointer", color: GREEN }}>
                                    Pay Full Remaining (₹{roomRent.remaining?.toLocaleString()})
                                </button>
                            </div>
                        </div>

                        <div>
                            <FieldLabel htmlFor="payment-txn">Transaction UTR Number</FieldLabel>
                            <FieldInput
                                id="payment-txn"
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="e.g. 123456789012"
                            />
                        </div>

                        <div>
                            <FieldLabel>Payment Screenshot</FieldLabel>
                            {receipt ? (
                                <div style={{ position: "relative", width: "fit-content", marginTop: 8 }}>
                                    <Image src={receipt.preview} alt="Receipt" width={160} height={100} unoptimized style={{ height: 100, width: "auto", borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)" }} />
                                    <button type="button" onClick={() => setReceipt(null)} style={{ position: "absolute", top: -8, right: -8, background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, background: "rgba(31,58,45,0.03)", border: "2px dashed rgba(31,58,45,0.2)", borderRadius: 12, cursor: "pointer", marginTop: 8 }}>
                                    <Upload size={20} color={GREEN} />
                                    <span style={{ fontSize: "0.85rem", color: GREEN }}>Upload Screenshot</span>
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                                </label>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: GREEN,
                                color: "#fff",
                                border: "none",
                                padding: "14px",
                                borderRadius: 8,
                                fontWeight: 600,
                                fontSize: "1rem",
                                cursor: submitting ? "not-allowed" : "pointer",
                                opacity: submitting ? 0.7 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                marginTop: 8
                            }}
                        >
                            {submitting ? "Submitting..." : "Submit Payment"}
                            {!submitting && <ArrowRight size={18} />}
                        </button>
                    </div>
                </motion.form>
            )}

            {/* Pending Payments List */}
            {pendingRentPayments.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(31,58,45,0.1)" }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: GREEN }}>Pending Payments</h3>
                        <button onClick={refetch} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "rgba(31,58,45,0.5)" }}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {pendingRentPayments.map((p) => (
                            <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "rgba(216,181,106,0.05)", borderRadius: 12, border: "1px dashed rgba(216,181,106,0.3)" }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: GREEN, fontSize: "1.1rem" }}>₹{p.amount.toLocaleString()}</div>
                                    <div style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.5)", marginTop: 2 }}>UTR: {p.transactionId}</div>
                                </div>
                                <div style={{ background: "rgba(216,181,106,0.15)", color: GOLD, padding: "6px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    Under Review
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
