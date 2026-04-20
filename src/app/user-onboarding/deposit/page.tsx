"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Upload, Check, X, AlertCircle,
  Loader2, Trash2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { uploadPaymentProof } from "@/lib/uploadFile";
import { useAuth } from "@/context/AuthContext";
import {
  FieldLabel, FieldInput, FieldError, NavButton,
  StepBadge, StepTitle, StepSubtitle, FormCard,
  SelectionButton
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

type BookingPricing = {
  registrationFee: number;
  securityDeposit: number;
  minimumAmount: number;
  suggestedAmount: number;
};

const FALLBACK_PRICING: BookingPricing = {
  registrationFee: 1000,
  securityDeposit: 15000,
  minimumAmount: 1000,
  suggestedAmount: 16000,
};

const formatINR = (n: number) =>
  `₹${Math.round(n).toLocaleString("en-IN")}`;

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
            <Image
              src={file.preview}
              alt="Receipt"
              width={1200}
              height={900}
              unoptimized
              style={{ width: "100%", height: "auto", display: "block" }}
            />
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
              <Upload size={22} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookingFeePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "bank_transfer" | "cash">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState(String(FALLBACK_PRICING.suggestedAmount));
  const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [pricing, setPricing] = useState<BookingPricing>(FALLBACK_PRICING);

  useEffect(() => {
    let active = true;

    const fetchPricing = async () => {
      try {
        const res = await apiFetch<{
          data?: {
            pricing?: {
              registrationFee?: number;
              securityDeposit?: number;
              bookingPayment?: {
                minimumAmount?: number;
                suggestedAmount?: number;
              };
            };
          };
        }>(API.pricing.get);

        const backend = res?.data?.pricing;
        if (!active || !backend) return;

        const nextPricing: BookingPricing = {
          registrationFee: backend.registrationFee ?? FALLBACK_PRICING.registrationFee,
          securityDeposit: backend.securityDeposit ?? FALLBACK_PRICING.securityDeposit,
          minimumAmount: backend.bookingPayment?.minimumAmount ?? FALLBACK_PRICING.minimumAmount,
          suggestedAmount: backend.bookingPayment?.suggestedAmount ?? FALLBACK_PRICING.suggestedAmount,
        };

        setPricing(nextPricing);
        setAmount((prev) => {
          const current = Number(prev || 0);
          const shouldSyncToSuggested = !prev || Number.isNaN(current) || current === FALLBACK_PRICING.suggestedAmount;
          return shouldSyncToSuggested ? String(nextPricing.suggestedAmount) : prev;
        });
      } catch {
        // Keep fallback values when pricing config fetch fails.
      }
    };

    void fetchPricing();
    return () => {
      active = false;
    };
  }, []);

  // Keep only auth guard; onboarding pages remain freely navigable.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const amountNum = Number(amount) || 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!Number.isFinite(amountNum) || amountNum < pricing.minimumAmount) {
      errs.amount = `Minimum booking amount is ${formatINR(pricing.minimumAmount)}`;
    }
    if (!transactionId.trim()) errs.transactionId = "Transaction ID is required";
    if (!receipt) errs.receipt = "Please upload your payment receipt";
    return errs;
  };

  const handleSubmit = async () => {
    setAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    setGlobalError(null);
    try {
      // 1. Upload proof image to get a URL
      let proofUrl = receipt!.preview;
      if (proofUrl.startsWith("data:")) {
        proofUrl = await uploadPaymentProof(proofUrl, receipt!.name);
      }

      // 2. Submit booking payment to backend
      await apiFetch(API.payment.booking, {
        method: "POST",
        body: {
          method: paymentMethod,
          transactionId: transactionId.trim(),
          proofUrl,
          amount: parseFloat(amountNum.toFixed(2)),
        },
      });

      // 3. Refresh user to get updated onboarding step before navigating to ensure guard doesn't bounce back.
      await refreshUser({ force: true });

      router.replace("/user-onboarding/payment-status");
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUploadedFile = async () => {
    // No backend delete endpoint exists yet for payment-proof files.
    // Keep this as a safe no-op so UI can remove preview without runtime crashes.
    return;
  };

  const errors = attempted ? validate() : {};

  if (authLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "80px 0" }}>
        <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)" }}>
          Loading...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ textAlign: "center", paddingBottom: 8 }}>
        <StepBadge icon={CreditCard} label="Booking Fee" />
        <StepTitle>Reserve your room</StepTitle>
        <StepSubtitle>
          Pay the booking fee to hold your room. Your payment will be reviewed by our team.
        </StepSubtitle>
      </div>

      {/* Booking Fee Breakdown */}
      <FormCard>
        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 14px" }}>
          Payment Breakdown
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>Security Deposit (Refundable)</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", fontWeight: 600, color: GREEN }}>{formatINR(pricing.securityDeposit)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>Registration Fee (Non-Refundable)</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.9rem", fontWeight: 600, color: GREEN }}>{formatINR(pricing.registrationFee)}</span>
          </div>
          <div style={{ height: 1, background: "rgba(31,58,45,0.08)", margin: "4px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", fontWeight: 700, color: GREEN }}>Suggested Total</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.1rem", fontWeight: 700, color: GREEN }}>{formatINR(pricing.suggestedAmount)}</span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <FieldLabel htmlFor="booking-amount">Amount to Pay (₹)</FieldLabel>
          <FieldInput
            id="booking-amount"
            type="number"
            inputMode="numeric"
            min={pricing.minimumAmount}
            step={500}
            placeholder={`e.g. ${pricing.suggestedAmount}`}
            value={amount}
            onChange={(e) => setAmount((e.target as HTMLInputElement).value)}
            focused={focused === "amount"}
            hasError={attempted && !!errors.amount}
            onFocus={() => setFocused("amount")}
            onBlur={() => setFocused(null)}
          />
          {attempted && errors.amount && <FieldError>{errors.amount}</FieldError>}
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)", margin: "2px 0 0" }}>
            Minimum booking amount: {formatINR(pricing.minimumAmount)}
          </p>
        </div>
      </FormCard>

      {/* Payment Method Details */}
      <FormCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: 0 }}>
            Payment Method
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <SelectionButton label="UPI" selected={paymentMethod === "upi"} onClick={() => setPaymentMethod("upi")} />
            <SelectionButton label="Bank" selected={paymentMethod === "bank_transfer"} onClick={() => setPaymentMethod("bank_transfer")} />
            <SelectionButton label="Cash" selected={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")} />
          </div>
        </div>

        {paymentMethod === "upi" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" }}>
              {([
                ["Account Name", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                ["UPI ID",       PAYMENT_CONFIG.BANK_DETAILS.upiId],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 100 }}>{label}:</span>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Image
                src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH}
                alt="UPI QR Code"
                width={120}
                height={120}
                style={{ borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)", objectFit: "contain" }}
              />
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", marginTop: 6, color: "rgba(31,58,45,0.5)" }}>Scan to Pay</p>
            </div>
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {([
              ["Account Name",   PAYMENT_CONFIG.BANK_DETAILS.accountName],
              ["Account No",     PAYMENT_CONFIG.BANK_DETAILS.accountNo],
              ["IFSC",           PAYMENT_CONFIG.BANK_DETAILS.ifsc],
              ["Bank",           PAYMENT_CONFIG.BANK_DETAILS.bank],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", minWidth: 100 }}>{label}:</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.72rem", fontWeight: 700, color: GREEN }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {paymentMethod === "cash" && (
          <div style={{ padding: "12px", background: "rgba(216,181,106,0.1)", borderRadius: 8, border: "1px dashed rgba(216,181,106,0.4)" }}>
            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: GREEN, margin: 0, textAlign: "center" }}>
              Please deposit the cash at our office. Upload the official Cash Receipt image below as proof of payment.
            </p>
          </div>
        )}
      </FormCard>

      {/* Proof Form */}
      <FormCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FieldLabel htmlFor="booking-txn-id">Transaction / Reference ID</FieldLabel>
          <FieldInput
            id="booking-txn-id"
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
          onDeleteFromServer={deleteUploadedFile}
        />
        {attempted && errors.receipt && <FieldError>{errors.receipt}</FieldError>}
      </FormCard>

      {/* Global error */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}
          >
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: "#dc2626", lineHeight: 1.4 }}>{globalError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            <><Upload size={16} /> Submit Booking Proof — {formatINR(amountNum)}</>
          )}
        </NavButton>
      </div>
    </div>
  );
}
