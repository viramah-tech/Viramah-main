"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Camera, Upload, Check, X, AlertCircle, ArrowRight, Shield, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/uploadFile";
import { useOnboarding } from "@/context/OnboardingContext";
import BookingTimeline from "@/components/BookingTimeline";
import {
  FieldLabel, FieldInput, FieldError, NavButton,
  StepBadge, StepTitle, StepSubtitle, FormCard,
  containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── File Upload Component (reuses confirm page pattern) ──────────────────────

function ReceiptUpload({
  file,
  onUpload,
  onRemove,
}: {
  file: { name: string; preview: string } | null;
  onUpload: (f: { name: string; preview: string }) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => onUpload({ name: f.name, preview: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  return (
    <div>
      <FieldLabel>Payment Receipt / Screenshot</FieldLabel>
      <div style={{ marginTop: 8 }}>
        {file ? (
          <div style={{ position: "relative", maxWidth: 300, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}` }}>
            <img src={file.preview} alt="Receipt" style={{ width: "100%", height: "auto", display: "block" }} />
            <button
              onClick={onRemove}
              style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              <X size={14} color={GREEN} />
            </button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(31,58,45,0.85)", backdropFilter: "blur(8px)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={12} color={GOLD} />
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>
                {file.name}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: "100%",
              maxWidth: 300,
              aspectRatio: "4/3",
              borderRadius: 12,
              border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
              background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(31,58,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
            </div>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>
              Upload payment receipt
            </span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.3)" }}>
              JPG, PNG, or PDF
            </span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
    </div>
  );
}

// ── Mini Timeline Strip ──────────────────────────────────────────────────────

function MiniTimeline() {
  const items = [
    { icon: "✅", label: "Days 1–7", desc: "Full refund eligible" },
    { icon: "⏳", label: "Days 8–21", desc: "Complete payment to confirm" },
    { icon: "❌", label: "Day 22+", desc: "Room released" },
  ];

  return (
    <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: "16px 18px", border: "1px solid rgba(31,58,45,0.08)" }}>
      <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 12px" }}>
        After admin approval of your deposit:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>{item.icon}</span>
            <div>
              <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.8rem", fontWeight: 600, color: GREEN }}>{item.label} </span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>— {item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DepositPage() {
  const router = useRouter();
  const { state } = useOnboarding();
  const roomTypeName = (state as Record<string, any>)?.step3?.selectedRoom?.title || "Your Selected Room";

  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!transactionId.trim()) errs.transactionId = "Transaction / Reference ID is required";
    if (transactionId.trim().length < 4) errs.transactionId = "Must be at least 4 characters";
    if (!receipt) errs.receipt = "Payment receipt is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setAttempted(true);
    if (!validate()) return;

    setSubmitting(true);
    setGlobalError(null);
    try {
      // Upload receipt
      let receiptUrl = "";
      if (receipt) {
        receiptUrl = await uploadFile("deposit-receipt", receipt.preview, receipt.name);
      }

      // POST to backend — roomTypeId from onboarding context
      const roomTypeId =
        (state as Record<string, any>)?.step3?.selectedRoom?._id ||
        (state as Record<string, any>)?.step3?.selectedRoom?.id;

      if (!roomTypeId) {
        setGlobalError("Room selection not found. Please go back and select a room.");
        return;
      }

      await apiFetch("/api/public/deposits/initiate", {
        method: "POST",
        body: { roomTypeId, transactionId: transactionId.trim(), receiptUrl },
      });

      router.push("/user-onboarding/deposit-status");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 32 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
        <StepBadge icon={CreditCard} label="Security Deposit" />
        <StepTitle>Pay ₹15,000 Deposit</StepTitle>
        <StepSubtitle>
          This one-time security deposit reserves your room. It's fully refundable within 7 days of approval.
        </StepSubtitle>
      </motion.div>

      {/* Amount Card */}
      <motion.div
        variants={itemVariants}
        style={{
          background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
        }}
      >
        <div>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "rgba(216,181,106,0.6)", margin: 0 }}>
            Security Deposit
          </p>
          <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.8rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
            ₹15,000
          </p>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.5)", margin: "6px 0 0" }}>
            {roomTypeName} · Refundable within 7 days
          </p>
        </div>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(216,181,106,0.15)", border: "1px solid rgba(216,181,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Shield size={20} color={GOLD} />
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={itemVariants}>
        <MiniTimeline />
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}
          >
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.4 }}>
              {globalError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bank Details */}
      <motion.div variants={itemVariants}>
        <FormCard>
          <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: "0 0 14px" }}>
            Transfer ₹15,000 to:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Account Name", "VIRAMAH Student Living Pvt Ltd"],
              ["Account No", "1234 5678 9012 3456"],
              ["IFSC", "SBIN0001234"],
              ["UPI", "viramah@ybl"],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 90 }}>{label}:</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
              </div>
            ))}
          </div>
        </FormCard>
      </motion.div>

      {/* Proof Form */}
      <motion.div variants={itemVariants}>
        <FormCard>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FieldLabel htmlFor="deposit-txn-id">Transaction / Reference ID</FieldLabel>
            <FieldInput
              id="deposit-txn-id"
              type="text"
              placeholder="e.g. UTR123456789 or UPI reference"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              focused={focused === "txnId"}
              hasError={attempted && !!errors.transactionId}
              onFocus={() => setFocused("txnId")}
              onBlur={() => setFocused(null)}
            />
            {attempted && errors.transactionId && <FieldError>{errors.transactionId}</FieldError>}
          </div>

          <div style={{ height: 1, background: "rgba(31,58,45,0.08)" }} />

          <ReceiptUpload
            file={receipt}
            onUpload={setReceipt}
            onRemove={() => setReceipt(null)}
          />
          {attempted && errors.receipt && <FieldError>{errors.receipt}</FieldError>}
        </FormCard>
      </motion.div>

      {/* Submit */}
      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
        <NavButton onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(216,181,106,0.3)", borderTopColor: GOLD }}
              />
              Submitting…
            </>
          ) : (
            <>
              <Upload size={16} />
              Submit Deposit Proof
            </>
          )}
        </NavButton>
      </motion.div>
    </motion.div>
  );
}
