"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Clock, Upload, ArrowRight, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/uploadFile";
import { useAuth } from "@/context/AuthContext";
import { containerVariants, itemVariants, FieldLabel, FieldInput, FieldError } from "@/components/onboarding/FormComponents";
import { DualBillDisplay } from "@/components/onboarding/DualBillDisplay";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export default function InstallmentPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const installmentNumber = params.num as string;
  const { token } = useAuth();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInstallmentData = async () => {
      try {
        const bookingRes = await apiFetch<{ data: any }>("/api/v1/bookings/my-booking", { token });
        if (!bookingRes.data) throw new Error("No active booking found");
        
        const bId = bookingRes.data._id || bookingRes.data.bookingId;
        setBookingId(bId);

        const res = await apiFetch<{ data: any }>(`/api/v1/bookings/${bId}/installments/${installmentNumber}`, { token });
        setData(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load installment details");
      } finally {
        setLoading(false);
      }
    };
    fetchInstallmentData();
  }, [installmentNumber, token]);

  const validate = () => {
    const num = Number(amount);
    if (!num || num < 1000) return "Minimum payment amount is ₹1,000";
    if (data?.nextPayment?.maximumAmount && num > data.nextPayment.maximumAmount) {
      return `Amount cannot exceed remaining balance of ₹${data.nextPayment.maximumAmount.toLocaleString()}`;
    }
    if (!transactionId.trim()) return "Transaction ID is required";
    if (!receipt) return "Payment receipt is required";
    return null;
  };

  const handleSubmit = async () => {
    const errObj = validate();
    if (errObj) {
      setValidationError(errObj);
      return;
    }
    setValidationError(null);
    setSubmitting(true);

    try {
      let receiptUrl = receipt!.preview;
      if (receiptUrl.startsWith("data:")) {
        receiptUrl = await uploadFile("receipt", receiptUrl, receipt!.name);
      }

      await apiFetch(`/api/v1/bookings/${bookingId}/installments/${installmentNumber}/pay`, {
        method: "POST",
        token,
        body: {
          amount: Number(amount),
          utrNumber: transactionId.trim(),
          receiptUrl,
          paymentMethod: "UPI"
        }
      });
      
      // Reload page to show pending payment
      window.location.reload();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setReceipt({ name: f.name, preview: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: GREEN }}>Loading installment details...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#dc2626" }}>
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  const inst = data.currentInstallment;
  const isCompleted = inst.status === "COMPLETED";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", color: GREEN, margin: "0 0 8px 0" }}>
          Installment #{inst.number}
        </h1>
        <p style={{ color: "rgba(31,58,45,0.6)", margin: 0 }}>
          Pay the remaining balance for your room rent installment. You can make partial payments starting from ₹1,000.
        </p>
      </motion.div>

      {/* Progress & Summary */}
      <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: "0.9rem", color: "rgba(31,58,45,0.6)" }}>Status: <strong style={{ color: isCompleted ? "#16a34a" : GOLD }}>{inst.status.replace("_", " ")}</strong></span>
          {inst.dueDate && (
            <span style={{ fontSize: "0.9rem", color: "rgba(31,58,45,0.6)" }}>Due: <strong>{new Date(inst.dueDate).toLocaleDateString()}</strong></span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div style={{ height: 8, background: "rgba(31,58,45,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 12, position: "relative" }}>
           <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(inst.amountPaid / inst.totalAmount) * 100}%`, background: GREEN, borderRadius: 4 }} />
           {/* Pending payments progress (ghosted) */}
           {data.pendingPayments.map((p: any, idx: number) => {
              const previousTotal = inst.amountPaid + data.pendingPayments.slice(0, idx).reduce((sum: number, x: any) => sum + x.amount, 0);
              return (
                 <div key={idx} style={{ position: "absolute", left: `${(previousTotal / inst.totalAmount) * 100}%`, top: 0, bottom: 0, width: `${(p.amount / inst.totalAmount) * 100}%`, background: GOLD, opacity: 0.6 }} />
              );
           })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: GREEN }}>₹{inst.totalAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount Paid</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#16a34a" }}>₹{inst.amountPaid.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining</span>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: GOLD }}>₹{inst.amountRemaining.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Embedded History */}
      {(data.paymentHistory.length > 0 || data.pendingPayments.length > 0) && (
        <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(31,58,45,0.08)", padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", color: GREEN, fontSize: "1rem" }}>Past Payments for this Installment</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.paymentHistory.map((p: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(31,58,45,0.03)", borderRadius: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <CheckCircle2 color="#16a34a" size={18} />
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: GREEN }}>₹{p.amount.toLocaleString()} <span style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", fontWeight: 400 }}> via {p.method}</span></div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)" }}>Approved on {new Date(p.approvedAt).toLocaleDateString()} • Ref: {p.utrNumber}</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600, background: "rgba(22,163,74,0.1)", padding: "4px 8px", borderRadius: 12 }}>Approved</div>
              </div>
            ))}
            {data.pendingPayments.map((p: any, i: number) => (
              <div key={`pending-${i}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(216,181,106,0.05)", borderRadius: 8, border: "1px dashed rgba(216,181,106,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Clock color={GOLD} size={18} />
                  <div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 600, color: GREEN }}>₹{p.amount.toLocaleString()}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)" }}>Submitted on {new Date(p.paidAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: GOLD, fontWeight: 600, background: "rgba(216,181,106,0.15)", padding: "4px 8px", borderRadius: 12 }}>Pending Verification</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Partial Payment Input Form */}
      {!isCompleted && (
        <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${GOLD}`, padding: 24 }}>
          <h3 style={{ margin: "0 0 16px 0", color: GREEN, fontSize: "1.2rem" }}>Make a Payment</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Amount Input */}
            <div>
              <FieldLabel>Amount to Pay (₹)</FieldLabel>
              <FieldInput 
                type="number" 
                placeholder={`Max: ₹${data.nextPayment.maximumAmount}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              
              {/* Quick Select Chips */}
              {data.nextPayment.recommendedAmounts.length > 0 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {data.nextPayment.recommendedAmounts.map((rec: number, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setAmount(rec.toString())}
                      style={{ 
                        background: amount === rec.toString() ? GREEN : "rgba(31,58,45,0.05)", 
                        color: amount === rec.toString() ? "#fff" : GREEN,
                        border: `1px solid ${amount === rec.toString() ? GREEN : "rgba(31,58,45,0.1)"}`,
                        borderRadius: 20, padding: "6px 12px", fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s" 
                      }}
                    >
                      {idx === 0 ? `Pay Remaining (₹${rec.toLocaleString()})` : `₹${rec.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* UPI Bank Details */}
            <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: 16, border: "1px dashed rgba(31,58,45,0.1)" }}>
               <p style={{ fontSize: "0.85rem", fontWeight: 600, color: GREEN, margin: "0 0 12px 0" }}>Transfer to Viramah UPI:</p>
               <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                 <img src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="QR Code" style={{ width: 80, height: 80, borderRadius: 8 }} />
                 <div>
                    <div style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>UPI ID:</div>
                    <div style={{ fontSize: "1rem", color: GREEN, fontWeight: 700 }}>{PAYMENT_CONFIG.BANK_DETAILS.upiId}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", marginTop: 4 }}>Account Name: {PAYMENT_CONFIG.BANK_DETAILS.accountName}</div>
                 </div>
               </div>
            </div>

            {/* Proof Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldLabel>Transaction UTR Number</FieldLabel>
              <FieldInput 
                type="text" 
                placeholder="Ex: 23456789012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <FieldLabel>Payment Screenshot</FieldLabel>
              {receipt ? (
                <div style={{ position: "relative", width: "fit-content" }}>
                  <img src={receipt.preview} alt="Receipt" style={{ height: 100, borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)" }} />
                  <button onClick={() => setReceipt(null)} style={{ position: "absolute", top: -8, right: -8, background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: "rgba(31,58,45,0.05)", border: "2px dashed rgba(31,58,45,0.2)", borderRadius: 12, padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                >
                  <Upload size={20} color={GREEN} />
                  <span style={{ fontSize: "0.85rem", color: GREEN }}>Upload Screenshot</span>
                </button>
              )}
              <input type="file" accept="image/*,.pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
            </div>

            {validationError && (
              <div style={{ background: "rgba(220,38,38,0.1)", padding: "12px", borderRadius: 8, color: "#dc2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={16} /> {validationError}
              </div>
            )}

            <button
               onClick={handleSubmit}
               disabled={submitting}
               style={{
                 background: GREEN,
                 color: "#fff",
                 border: "none",
                 borderRadius: 8,
                 padding: "16px",
                 fontSize: "1rem",
                 fontWeight: 600,
                 cursor: submitting ? "not-allowed" : "pointer",
                 display: "flex",
                 alignItems: "center",
                 justifyContent: "center",
                 gap: 8,
                 marginTop: 8
               }}
            >
              {submitting ? "Submitting..." : "Submit Payment for Verification"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
