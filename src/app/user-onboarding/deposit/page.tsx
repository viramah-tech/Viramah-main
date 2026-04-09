"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Upload, Check, X, AlertCircle,
  Clock, Trash2, Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { uploadFile, deleteUploadedFile } from "@/lib/uploadFile";
import { useOnboarding } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import {
  FieldLabel, FieldInput, FieldError, NavButton,
  StepBadge, StepTitle, StepSubtitle, FormCard,
  containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

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

// --- Countdown timer hook ---
function usePriceLockCountdown(expiryIso: string | null) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!expiryIso) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiryIso).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [expiryIso]);

  if (secondsLeft === null) return null;
  const m = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const s = (secondsLeft % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: secondsLeft === 0 };
}

export default function BookingFeePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { state, setBookingId } = useOnboarding();

  const [localBookingId,   setLocalBookingId]   = useState<string | null>(null);
  const [priceLockExpiry,  setPriceLockExpiry]   = useState<string | null>(null);
  const [initiating,       setInitiating]        = useState(true);
  const [initError,        setInitError]         = useState<string | null>(null);

  const [transactionId, setTransactionId] = useState("");
  const [receipt,       setReceipt]       = useState<{ name: string; preview: string } | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [globalError,   setGlobalError]  = useState<string | null>(null);
  const [attempted,     setAttempted]    = useState(false);
  const [focused,       setFocused]      = useState<string | null>(null);

  const countdown = usePriceLockCountdown(priceLockExpiry);

  // Initiate booking on mount
  useEffect(() => {
    const initiate = async () => {
      try {
        // If we already have a bookingId from context, just fetch the timer
        if (state.bookingId) {
          const res = await apiFetch<{ data: { timers: { priceLockExpiry: string } } }>(
            `/api/v1/bookings/${state.bookingId}/timer`,
            { token }
          );
          setLocalBookingId(state.bookingId);
          setPriceLockExpiry(res.data?.timers?.priceLockExpiry ?? null);
          return;
        }

        const roomTypeId = state.step3?.selectedRoom?.backendId;
        if (!roomTypeId) {
          setInitError("Room not selected. Please go back to step 3.");
          return;
        }

        const addOnsEnabled = {
          mess:      !!(state.step3?.addOns?.find((a) => a.id === "mess" && a.enabled)),
          transport: !!(state.step3?.addOns?.find((a) => a.id === "transport" && a.enabled)),
        };

        const res = await apiFetch<{ data: { booking: { _id: string; timers: { priceLockExpiry: string } } } }>(
          "/api/v1/bookings",
          {
            method: "POST",
            token,
            body: { roomTypeId, addOns: addOnsEnabled },
          }
        );

        const b = res.data.booking;
        setLocalBookingId(b._id);
        setBookingId(b._id);
        setPriceLockExpiry(b.timers?.priceLockExpiry ?? null);
      } catch (e) {
        // If already has active booking (409), fetch existing status
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("already have an active booking") || (e as any)?.status === 409) {
          try {
            const statusRes = await apiFetch<{ data: { booking: { _id: string; timers: { priceLockExpiry: string } } } }>(
              "/api/v1/bookings/my-booking",
              { token }
            );
            const existing = statusRes.data?.booking;
            if (existing) {
              setLocalBookingId(existing._id);
              setBookingId(existing._id);
              setPriceLockExpiry(existing.timers?.priceLockExpiry ?? null);
              return;
            }
          } catch {}
        }
        setInitError(msg || "Failed to initiate booking");
      } finally {
        setInitiating(false);
      }
    };
    initiate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!transactionId.trim()) errs.transactionId = "Transaction ID is required";
    if (!receipt) errs.receipt = "Please upload your payment receipt";
    return errs;
  };

  const handleSubmit = async () => {
    setAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length) return;
    if (!localBookingId) { setGlobalError("Booking not ready. Please refresh."); return; }

    setSubmitting(true);
    setGlobalError(null);
    try {
      let receiptUrl = receipt!.preview;
      if (receiptUrl.startsWith("data:")) {
        receiptUrl = await uploadFile("receipt", receiptUrl, receipt!.name);
      }

      await apiFetch(`/api/v1/bookings/${localBookingId}/pay`, {
        method: "POST",
        token,
        body: {
          transactionId: transactionId.trim(),
          receiptUrl,
          paymentMethod: "UPI",
        },
      });

      router.push("/user-onboarding/deposit-status");
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const errors = attempted ? validate() : {};

  if (initiating) {
    return (
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "80px 0" }}
      >
        <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)" }}>
          Preparing your booking...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    );
  }

  if (initError) {
    return (
      <motion.div
        variants={containerVariants} initial="hidden" animate="visible"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}
      >
        <AlertCircle size={32} color="#dc2626" />
        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", color: "#dc2626", textAlign: "center" }}>
          {initError}
        </p>
        <button
          onClick={() => router.back()}
          style={{ padding: "10px 24px", borderRadius: 10, border: `1.5px solid ${GREEN}`, background: "transparent", color: GREEN, cursor: "pointer", fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem" }}
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants} initial="hidden" animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
        <StepBadge icon={CreditCard} label="Booking Fee" />
        <StepTitle>Reserve your room</StepTitle>
        <StepSubtitle>
          Pay the one-time booking fee to hold your room. Your payment plan is selected after approval.
        </StepSubtitle>
      </motion.div>

      {/* Price Lock Timer */}
      {countdown && (
        <motion.div variants={itemVariants}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            background: countdown.expired ? "rgba(220,38,38,0.07)" : "rgba(216,181,106,0.1)",
            border: `1px solid ${countdown.expired ? "rgba(220,38,38,0.25)" : "rgba(216,181,106,0.3)"}`,
            borderRadius: 12,
          }}>
            <Clock size={18} color={countdown.expired ? "#dc2626" : GOLD} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(31,58,45,0.5)", margin: "0 0 2px" }}>
                {countdown.expired ? "Price lock expired" : "Price locked for"}
              </p>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.4rem", fontWeight: 700, color: countdown.expired ? "#dc2626" : GREEN, margin: 0 }}>
                {countdown.expired ? "—" : countdown.display}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Breakdown */}
      <motion.div variants={itemVariants}>
        <FormCard>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 14px" }}>
            Booking fee breakdown
          </p>
          {([
            ["Security Deposit (refundable)", "₹15,000"],
            ["Registration Fee", "₹1,000"],
            ["GST on Registration (18%)", "₹180"],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(31,58,45,0.06)" }}>
              <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.82rem", color: "rgba(31,58,45,0.65)" }}>{label}</span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.82rem", fontWeight: 700, color: GREEN }}>{val}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
            <span style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 700, color: GREEN }}>Total</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1rem", fontWeight: 700, color: GREEN }}>₹16,180</span>
          </div>
        </FormCard>
      </motion.div>

      {/* Bank Details */}
      <motion.div variants={itemVariants}>
        <FormCard>
          <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: "0 0 14px" }}>
            Transfer ₹16,180 to:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px" }}>
              {([
                ["Account Name", PAYMENT_CONFIG.BANK_DETAILS.accountName],
                ["Account No",   PAYMENT_CONFIG.BANK_DETAILS.accountNo],
                ["IFSC",         PAYMENT_CONFIG.BANK_DETAILS.ifsc],
                ["Bank",         PAYMENT_CONFIG.BANK_DETAILS.bank],
                ["UPI ID",       PAYMENT_CONFIG.BANK_DETAILS.upiId],
              ] as [string, string][]).map(([label, val]) => (
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
      </motion.div>

      {/* Proof Form */}
      <motion.div variants={itemVariants}>
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
      </motion.div>

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
      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
        <NavButton onClick={handleSubmit} disabled={submitting || countdown?.expired === true}>
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
            <><Upload size={16} /> Submit Booking Proof</>
          )}
        </NavButton>
      </motion.div>
    </motion.div>
  );
}
