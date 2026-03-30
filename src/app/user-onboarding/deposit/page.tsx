"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Camera, Upload, Check, X, AlertCircle,
  Shield, Clock, Banknote, ChevronDown, ChevronUp, RefreshCw, Trash2, Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { uploadFile, deleteUploadedFile } from "@/lib/uploadFile";
import { useOnboarding } from "@/context/OnboardingContext";
import { usePricingConfig } from "@/hooks/usePricingConfig";
import {
  FieldLabel, FieldInput, FieldError, NavButton,
  StepBadge, StepTitle, StepSubtitle, FormCard,
  containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG, ROOM_TYPE_MAP } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface BreakdownPayload {
  discountedMonthlyWithGST: number;
  discountRate: number;
  tenureMonths: number;
  installmentMonths: number;
  finalAmount: number;
  installment2?: number;
}

interface PreviewData {
  installment1: number;
  installment2: number;
  breakdown: BreakdownPayload;
  breakdown2: BreakdownPayload | null;
}

// ── ReceiptUpload ─────────────────────────────────────────────────────────────

function ReceiptUpload({
  file, onUpload, onRemove, onDeleteFromServer
}: {
  file: { name: string; preview: string } | null;
  onUpload: (f: { name: string; preview: string }) => void;
  onRemove: () => void;
  onDeleteFromServer?: (fileUrl: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => onUpload({ name: f.name, preview: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  const isServerFile = file?.preview && !file.preview.startsWith("data:");

  const handleRemove = async () => {
    if (isServerFile && onDeleteFromServer && file) {
      setDeleting(true);
      try {
        await onDeleteFromServer(file.preview);
      } catch (err) {
        console.error("Failed to delete from server:", err);
      } finally {
        setDeleting(false);
      }
    }
    onRemove();
  };

  return (
    <div>
      <FieldLabel>Payment Receipt / Screenshot</FieldLabel>
      <div style={{ marginTop: 8 }}>
        {file ? (
          <div style={{ position: "relative", maxWidth: 300, borderRadius: 12, overflow: "hidden", border: `2px solid ${GREEN}` }}>
            <img src={file.preview} alt="Receipt" style={{ width: "100%", height: "auto", display: "block" }} />
            <button
              onClick={handleRemove}
              disabled={deleting}
              title={isServerFile ? "Delete from server" : "Remove"}
              style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: isServerFile ? "rgba(192,57,43,0.95)" : "rgba(255,255,255,0.95)", border: "none", cursor: deleting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
            >
              {deleting ? (
                <Loader2 size={14} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
              ) : isServerFile ? (
                <Trash2 size={13} color="#fff" />
              ) : (
                <X size={14} color={GREEN} />
              )}
            </button>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(31,58,45,0.85)", backdropFilter: "blur(8px)", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={12} color={GOLD} />
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: GOLD }}>{file.name}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              width: "100%", maxWidth: 300, aspectRatio: "4/3", borderRadius: 12,
              border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
              background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.25s ease",
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", boxShadow: "0 2px 8px rgba(31,58,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
            </div>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: hovered ? GREEN : "rgba(31,58,45,0.4)" }}>Upload payment receipt</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.3)" }}>JPG, PNG, or PDF</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Payment Mode Card ──────────────────────────────────────────────────────────

function ModeCard({
  mode, selected, preview, loading, onClick,
}: {
  mode: "full" | "half";
  selected: boolean;
  preview: PreviewData | null;
  loading: boolean;
  onClick: () => void;
}) {
  const isFull = mode === "full";
  const title = isFull ? "Full Tenure" : "Half Yearly";
  const discount = isFull ? "40% off" : "25% off";
  const desc = isFull ? "Pay once for all 11 months" : "Pay in 2 installments";

  const Skeleton = () => (
    <span style={{
      display: "inline-block", width: 80, height: 12, borderRadius: 4,
      background: selected ? "rgba(216,181,106,0.2)" : "rgba(31,58,45,0.1)",
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "18px 16px", borderRadius: 16, textAlign: "left",
        border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.12)"}`,
        background: selected ? "rgba(31,58,45,0.04)" : "#fff",
        cursor: "pointer", transition: "all 0.2s",
        boxShadow: selected ? "0 4px 16px rgba(31,58,45,0.12)" : "none",
        display: "flex", flexDirection: "column", gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 700, color: selected ? GREEN : "rgba(31,58,45,0.6)" }}>
          {title}
        </span>
        <span style={{
          fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", fontWeight: 700,
          padding: "2px 8px", borderRadius: 99,
          background: selected ? "rgba(31,58,45,0.1)" : "rgba(31,58,45,0.06)",
          color: selected ? GREEN : "rgba(31,58,45,0.45)",
        }}>
          {discount}
        </span>
      </div>
      <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.45)", margin: 0 }}>{desc}</p>

      {/* Live amounts */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
          <Skeleton /><Skeleton />
        </div>
      ) : preview ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
          {isFull ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.5)" }}>Total (incl. deposit)</span>
              <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.15rem", color: selected ? GREEN : "rgba(31,58,45,0.7)" }}>
                {inr(preview.installment1)}
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.5)" }}>Installment 1 (6 mo)</span>
                <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.1rem", color: selected ? GREEN : "rgba(31,58,45,0.7)" }}>
                  {inr(preview.installment1)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.4)" }}>Installment 2 (5 mo, later)</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "rgba(31,58,45,0.5)" }}>
                  {inr(preview.installment2)}
                </span>
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* Selection indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          border: `2px solid ${selected ? GREEN : "rgba(31,58,45,0.2)"}`,
          background: selected ? GREEN : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {selected && <Check size={10} color={GOLD} strokeWidth={3} />}
        </div>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: selected ? GREEN : "rgba(31,58,45,0.35)", fontWeight: selected ? 700 : 400 }}>
          {selected ? "Selected" : "Select this plan"}
        </span>
      </div>
    </button>
  );
}

// ── Mini Timeline ─────────────────────────────────────────────────────────────

function MiniTimeline() {
  const items = [
    { icon: "✅", label: "Days 1–7", desc: "Full refund eligible" },
    { icon: "⏳", label: "Days 8–21", desc: "Complete payment to confirm room" },
    { icon: "❌", label: "Day 22+", desc: "Room released, deposit forfeited" },
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DepositPage() {
  const router = useRouter();
  const { state } = useOnboarding();
  const { config: pricingConfig, loading: pricingLoading } = usePricingConfig();
  const depositAmount = pricingConfig.securityDeposit;
  const roomTypeName = (state as Record<string, any>)?.step3?.selectedRoom?.title || "Your Selected Room";
  const frontendRoomId = (state as Record<string, any>)?.step3?.selectedRoom?.id;
  const backendRoomIdFromState = (state as Record<string, any>)?.step3?.selectedRoom?.backendId;

  // Payment mode state — MUST be chosen before proceeding
  const [paymentMode, setPaymentMode] = useState<"full" | "half" | null>(null);
  const [fullPreview, setFullPreview] = useState<PreviewData | null>(null);
  const [halfPreview, setHalfPreview] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [resolvedRoomTypeId, setResolvedRoomTypeId] = useState<string | null>(null);

  // Form state
  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Fetch price previews for both modes on mount
  const fetchPreviews = useCallback(async () => {
    // Resolve real MongoDB _id
    let roomTypeId = backendRoomIdFromState || resolvedRoomTypeId;
    
    if (!roomTypeId) {
      const backendName = frontendRoomId ? ROOM_TYPE_MAP[frontendRoomId] : null;
      if (!backendName) return;
      try {
        const roomsRes = await apiFetch<{ data: { roomTypes: Array<{ _id: string; name: string }> } }>("/api/public/rooms");
        const match = roomsRes.data.roomTypes.find((r) => r.name === backendName);
        if (!match) return;
        roomTypeId = match._id;
        setResolvedRoomTypeId(match._id);
      } catch { return; }
    } else {
      setResolvedRoomTypeId(roomTypeId);
    }
    
    setPreviewLoading(true);
    try {
      const [fullRes, halfRes] = await Promise.allSettled([
        apiFetch<{ data: PreviewData }>(`/api/public/payments/calculate-preview?roomTypeId=${roomTypeId}&paymentMode=full`),
        apiFetch<{ data: PreviewData }>(`/api/public/payments/calculate-preview?roomTypeId=${roomTypeId}&paymentMode=half`),
      ]);
      if (fullRes.status === "fulfilled" && fullRes.value?.data) {
        setFullPreview(fullRes.value.data as unknown as PreviewData);
      }
      if (halfRes.status === "fulfilled" && halfRes.value?.data) {
        setHalfPreview(halfRes.value.data as unknown as PreviewData);
      }
    } finally {
      setPreviewLoading(false);
    }
  }, [frontendRoomId, resolvedRoomTypeId]);

  useEffect(() => { fetchPreviews(); }, [fetchPreviews]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!paymentMode) errs.mode = "Please select a payment plan to continue";
    if (!transactionId.trim()) {
      errs.transactionId = "Transaction / Reference ID is required";
    }
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
      let receiptUrl = "";
      if (receipt) {
        receiptUrl = await uploadFile("receipt", receipt.preview, receipt.name);
      }

      if (!resolvedRoomTypeId) {
        setGlobalError("Room not resolved yet — please wait a moment and try again.");
        setSubmitting(false);
        return;
      }

      await apiFetch("/api/public/deposits/initiate", {
        method: "POST",
        body: {
          roomTypeId: resolvedRoomTypeId,
          paymentMode,
          transactionId: transactionId.trim(),
          receiptUrl,
        },
      });

      router.push("/user-onboarding/deposit-status");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const activePreview = paymentMode === "full" ? fullPreview : halfPreview;

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
        <StepTitle>Reserve your room</StepTitle>
        <StepSubtitle>
          Pay a {inr(depositAmount)} security deposit to hold your room. Choose your payment plan first — it's locked in at this stage.
        </StepSubtitle>
      </motion.div>

      {/* Step 1: Payment Mode Selection */}
      <motion.div variants={itemVariants}>
        <FormCard>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 4px" }}>
              Step 1 — Choose your payment plan
            </p>
            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: "rgba(31,58,45,0.5)", margin: 0 }}>
              This cannot be changed after deposit submission.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {(["full", "half"] as const).map((mode) => (
              <ModeCard
                key={mode}
                mode={mode}
                selected={paymentMode === mode}
                preview={mode === "full" ? fullPreview : halfPreview}
                loading={previewLoading}
                onClick={() => setPaymentMode(mode)}
              />
            ))}
          </div>
          {attempted && errors.mode && (
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "#dc2626", marginTop: 8 }}>
              {errors.mode}
            </p>
          )}

          {/* Reload preview  */}
          {!previewLoading && !fullPreview && !halfPreview && frontendRoomId && (
            <button
              onClick={fetchPreviews}
              style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.5)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <RefreshCw size={12} /> Retry loading prices
            </button>
          )}
        </FormCard>
      </motion.div>

      {/* Deposit Amount Card — shown once mode is selected */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 100%)",
              borderRadius: 16, padding: "24px 28px",
              boxShadow: "0 8px 32px rgba(31,58,45,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(216,181,106,0.6)", margin: 0 }}>
                  Security Deposit
                </p>
                <p style={{ fontFamily: "var(--font-display, serif)", fontSize: "2.8rem", color: GOLD, margin: "4px 0 0", lineHeight: 1 }}>
                  {inr(depositAmount)}
                </p>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(246,244,239,0.5)", margin: "6px 0 0" }}>
                  {roomTypeName} · Refundable within 7 days of approval
                </p>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(216,181,106,0.15)", border: "1px solid rgba(216,181,106,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Shield size={20} color={GOLD} />
              </div>
            </div>

            {/* Plan summary */}
            <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.5)" }}>
                  Your plan
                </span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: GOLD, fontWeight: 700 }}>
                  {paymentMode === "full" ? "Full Tenure — 40% discount" : "Half Yearly — 25% discount"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.5)" }}>
                  This deposit will be
                </span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.67rem", color: "#86efac" }}>
                  credited against your {paymentMode === "full" ? "total" : "Installment 1"}
                </span>
              </div>
              {activePreview && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.5)" }}>
                    {paymentMode === "full" ? "Total payable (after deposit)" : "Inst. 1 payable (after deposit)"}
                  </span>
                  <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1.2rem", color: GOLD }}>
                    {inr(activePreview.installment1 - depositAmount > 0 ? activePreview.installment1 - depositAmount : activePreview.installment1)}
                  </span>
                </div>
              )}
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(246,244,239,0.35)", margin: "4px 0 0" }}>
                ⚠ Plan is locked after submission. Contact support to change.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.4 }}>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2: Deposit proof form — shown once mode selected */}
      <AnimatePresence>
        {paymentMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Bank Details */}
            <FormCard>
              <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: "0 0 14px" }}>
                Step 2 — Transfer {inr(depositAmount)} to:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" }}>
                  {[
                    ["Account Name", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                    ["Account No", PAYMENT_CONFIG.BANK_DETAILS.accountNo],
                    ["IFSC", PAYMENT_CONFIG.BANK_DETAILS.ifsc],
                    ["Bank", PAYMENT_CONFIG.BANK_DETAILS.bank],
                    ["UPI ID", PAYMENT_CONFIG.BANK_DETAILS.upiId],
                  ].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 100 }}>{label}:</span>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <img src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="UPI QR Code" style={{ width: 120, height: 120, borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)", objectFit: "contain" }} />
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", marginTop: 6, color: "rgba(31,58,45,0.5)" }}>Scan to Pay</p>
                </div>
              </div>
            </FormCard>

            {/* Proof Form */}
            <div style={{ marginTop: 16 }}>
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

                <ReceiptUpload file={receipt} onUpload={setReceipt} onRemove={() => setReceipt(null)} onDeleteFromServer={deleteUploadedFile} />
                {attempted && errors.receipt && <FieldError>{errors.receipt}</FieldError>}
              </FormCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
        <NavButton onClick={handleSubmit} disabled={submitting || !paymentMode}>
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
