"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
import { PUBLIC_API, V1_API } from "@/lib/apiEndpoints";
import {
  FieldLabel, FieldInput, FieldError, NavButton,
  StepBadge, StepTitle, StepSubtitle, FormCard,
  SelectionButton
} from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";
import { DualBillDisplay, type DisplayBillsData } from "@/components/onboarding/DualBillDisplay";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const DEBUG_ONBOARDING = process.env.NEXT_PUBLIC_DEBUG_ONBOARDING === "1";

const debugLog = (...args: unknown[]) => {
  if (DEBUG_ONBOARDING) {
    console.info("[onboarding/deposit]", ...args);
  }
};

interface BookingRecord {
  _id?: string;
  bookingId?: string;
  timers?: {
    priceLockExpiry?: string | null;
  };
  displayBills?: DisplayBillsData;
  selections?: {
    roomTypeId?: string;
    mess?: { selected?: boolean };
    transport?: { selected?: boolean };
  };
}

interface RoomTypeRecord {
  _id: string;
  name: string;
}

const getErrorStatus = (err: unknown): number | undefined => {
  if (!err || typeof err !== "object") return undefined;
  const status = (err as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error) return err.message;
  return fallback;
};

const pickBooking = (payload: unknown): BookingRecord | null => {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;

  if (obj.booking && typeof obj.booking === "object") {
    return obj.booking as BookingRecord;
  }

  if (obj.data && typeof obj.data === "object") {
    const dataObj = obj.data as Record<string, unknown>;
    if (dataObj.booking && typeof dataObj.booking === "object") {
      return dataObj.booking as BookingRecord;
    }
    return dataObj as BookingRecord;
  }

  return obj as BookingRecord;
};

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
  const { token, loading: authLoading } = useAuth();
  const { state, setBookingId, hydrating: contextHydrating } = useOnboarding();

  const [localBookingId,   setLocalBookingId]   = useState<string | null>(null);
  const [priceLockExpiry,  setPriceLockExpiry]   = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingRecord | null>(null);
  const [billsData, setBillsData] = useState<DisplayBillsData | null>(null);
  const [initiating,       setInitiating]        = useState(true);
  const [initError,        setInitError]         = useState<string | null>(null);
  const [initLog,          setInitLog]           = useState<string[]>([]); // For debugging visibility

  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [receipt,       setReceipt]       = useState<{ name: string; preview: string } | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [globalError,   setGlobalError]  = useState<string | null>(null);
  const [attempted,     setAttempted]    = useState(false);
  const [focused,       setFocused]      = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const countdown = usePriceLockCountdown(priceLockExpiry);
  const initLock = useRef<string | null>(null);
  const selectedAddOns = useMemo(() => state.step3?.addOns ?? [], [state.step3?.addOns]);
  const selectedRoomId = state.step3?.selectedRoom?.id ?? "";
  const selectedRoomBackendId = state.step3?.selectedRoom?.backendId ?? "";
  const addOnSignature = selectedAddOns
    .map((a) => `${a.id}:${a.enabled ? 1 : 0}`)
    .join("|");

  // Initiate booking on mount
  useEffect(() => {
    const initiate = async () => {
      if (contextHydrating || authLoading) return;
      
      const runKey = `${token || "no-token"}_${state.bookingId || "none"}_${selectedRoomId}_${selectedRoomBackendId}_${addOnSignature}`;
      if (initLock.current === runKey) return;
      initLock.current = runKey;

      setInitiating(true);
      setInitError(null);
      const log = (msg: string) => {
        setInitLog(prev => [...prev.slice(-3), msg]);
        debugLog(msg);
      };

      try {
        debugLog("init_start", {
          hasToken: !!token,
          contextHydrating,
          authLoading,
          selectedRoomId,
          selectedRoomBackendId,
          hasBookingId: !!state.bookingId,
        });
        log("Synchronizing booking...");

        // Helper: fetch fresh bill data from backend
        const fetchBills = async (bookingId: string) => {
          try {
            log("Fetching bill data...");
            const billRes = await apiFetch<{ data: { bookingBill?: unknown; projectedFinalBill?: unknown } }>(V1_API.bookings.bills(bookingId), { token });
            if (billRes.data) {
              setBillsData(billRes.data as DisplayBillsData);
              debugLog("bills_fetched", { bookingId, hasBills: true });
            }
          } catch (billErr) {
            debugLog("bills_fetch_error", billErr);
            // Fall back to embedded displayBills on the booking doc
          }
        };
        
        let currentBooking: BookingRecord | null = null;
        let currentBookingId: string | null = state.bookingId || localBookingId;

        // Resolve target backend ID in case it's missing from context
        let targetRid = selectedRoomBackendId;
        if (!targetRid && selectedRoomId) {
             const MAP: Record<string, string> = { "nexus-plus": "NEXUS", "collective-plus": "COLLECTIVE", "axis": "AXIS", "studio": "AXIS+" };
             const bn = MAP[selectedRoomId];
             if (bn) {
               try {
                 const rr = await apiFetch<{ data: { roomTypes: RoomTypeRecord[] } }>(PUBLIC_API.rooms.list);
                 targetRid = rr.data?.roomTypes?.find((r) => r.name === bn)?._id ?? "";
               } catch (e) {}
             }
        }
        
        const checkMismatch = (b: BookingRecord) => {
            if (!targetRid) return false;
            // Room type mismatch
            if (b.selections?.roomTypeId !== targetRid) return true;
            
            // Add on mismatch
            const uiMess = !!selectedAddOns.find((a) => (a.id === "mess" || a.id === "lunch") && a.enabled);
            const uiTransport = !!selectedAddOns.find((a) => a.id === "transport" && a.enabled);
            const backendMess = !!b.selections?.mess?.selected;
            const backendTransport = !!b.selections?.transport?.selected;
            
            return uiMess !== backendMess || uiTransport !== backendTransport;
        };

        // 1. Resolve existing booking by ID
        if (currentBookingId) {
          try {
            log(`Checking booking ref ${currentBookingId.slice(-4)}...`);
            const res = await apiFetch<{ data: unknown }>(V1_API.bookings.byId(currentBookingId), { token });
            currentBooking = pickBooking(res.data);
            if (currentBooking) {
              if (checkMismatch(currentBooking)) {
                log("Room or add-ons changed. Syncing booking...");
                currentBooking = null; // Force recreation
              } else {
                setBookingData(currentBooking);
                setLocalBookingId(currentBookingId);
                setPriceLockExpiry(currentBooking.timers?.priceLockExpiry ?? null);
                await fetchBills(currentBookingId!);
              }
            }
          } catch (e: unknown) {
             if (getErrorStatus(e) === 404) {
               log("Stale session found. Clearing...");
               setBookingId(""); 
               currentBookingId = null;
             }
          }
        }

        // 2. Fallback to active booking discovery
        if (!currentBooking) {
          try {
            log("Discovering active session...");
            const sRes = await apiFetch<{ data: unknown }>(V1_API.bookings.myBooking, { token });
            const sBooking = pickBooking(sRes.data);
            if (sBooking && (sBooking._id || sBooking.bookingId)) {
               if (checkMismatch(sBooking)) {
                 log("Active session mismatch. Re-syncing...");
                 currentBooking = null;
               } else {
                 currentBooking = sBooking;
                 const bId = currentBooking._id || currentBooking.bookingId;
                 if (bId) {
                   setLocalBookingId(bId);
                   setBookingId(bId);
                   setBookingData(currentBooking);
                   setPriceLockExpiry(currentBooking.timers?.priceLockExpiry ?? null);
                   await fetchBills(bId);
                 }
               }
            }
          } catch {}
        }

        // 3. Last Resort: Create new booking
        if (!currentBooking) {
           let rid = selectedRoomBackendId;
          
          // Recovery for missing backendId
           if (!rid && selectedRoomId) {
             log("Resolving room details...");
             const MAP: Record<string, string> = { "nexus-plus": "NEXUS", "collective-plus": "COLLECTIVE", "axis": "AXIS", "studio": "AXIS+" };
             const bn = MAP[selectedRoomId];
             if (bn) {
               const rr = await apiFetch<{ data: { roomTypes: RoomTypeRecord[] } }>(PUBLIC_API.rooms.list);
               rid = rr.data?.roomTypes?.find((r) => r.name === bn)?._id ?? "";
               debugLog("room_resolved_by_name", { selectedRoomId, backendName: bn, resolvedRoomTypeId: rid || null });
             }
          }

          if (!rid) {
            // Patient check: maybe hydration is lagging
            if (contextHydrating) return;
            // Short wait for state to settle
            await new Promise(r => setTimeout(r, 600));
            rid = selectedRoomBackendId;
          }

          if (!rid) {
            throw new Error(`Room synchronization failed. Please go back to Step 3 and click 'Continue' again to re-sync.`);
          }

          log("Finalizing booking...");
          try {
            const addOns = {
              mess: !!selectedAddOns.find((a) => (a.id === "mess" || a.id === "lunch") && a.enabled),
              transport: !!selectedAddOns.find((a) => a.id === "transport" && a.enabled),
            };
            const cRes = await apiFetch<{ data: unknown }>(V1_API.bookings.base, {
              method: "POST", token, body: { roomTypeId: rid, addOns }
            });
            const b = pickBooking(cRes.data);
            if (b) {
               const bId = b._id || b.bookingId;
               if (bId) {
                 setLocalBookingId(bId);
                 setBookingId(bId);
                 setBookingData(b);
                 setPriceLockExpiry(b.timers?.priceLockExpiry ?? null);
                 await fetchBills(bId);
               }
            }
           } catch (e: unknown) {
             if (getErrorStatus(e) === 409) {
                log("Resolving conflict...");
               const sRes = await apiFetch<{ data: unknown }>(V1_API.bookings.myBooking, { token });
               const ex = pickBooking(sRes.data);
                if (ex) {
                  const exId = ex._id || ex.bookingId;
                  if (exId) {
                    setLocalBookingId(exId);
                    setBookingId(exId);
                    setBookingData(ex);
                    setPriceLockExpiry(ex.timers?.priceLockExpiry ?? null);
                    await fetchBills(exId);
                  }
                }
             } else throw e;
          }
        }
      } catch (err: unknown) {
        console.error("Init Error:", err);
        debugLog("init_error", err);
        setInitError(getErrorMessage(err, "Initialization failed."));
      } finally {
        setInitiating(false);
      }
    };

    initiate();
  }, [
    contextHydrating,
    authLoading,
    token,
    state.bookingId,
    localBookingId,
    selectedRoomId,
    selectedRoomBackendId,
    addOnSignature,
    selectedAddOns,
    setBookingId,
  ]);

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

      await apiFetch(V1_API.bookings.pay(localBookingId), {
        method: "POST",
        token,
        body: {
          transactionId: transactionId.trim(),
          receiptUrl,
          paymentMethod,
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "80px 0" }}>
        <Loader2 size={32} color={GREEN} style={{ animation: "spin 1s linear infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.7)", fontWeight: 600 }}>
            Initializing booking...
          </span>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", color: "rgba(31,58,45,0.35)", textAlign: "center", maxWidth: 250 }}>
            {initLog[initLog.length - 1] || "Connecting to server..."}
          </span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" }}>
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
      </div>
    );
  }

  // Add a unique key to the container to force a clean re-animation when booking data is loaded
  const displayKey = bookingData?._id || (initiating ? 'loading' : 'empty');

  return (
    <div key={displayKey} style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ textAlign: "center", paddingBottom: 8 }}>
        <StepBadge icon={CreditCard} label="Booking Fee" />
        <StepTitle>Reserve your room</StepTitle>
        <StepSubtitle>
          Pay the one-time booking fee to hold your room. Your payment plan is selected after approval.
        </StepSubtitle>
      </div>

      {/* Price Lock Timer — only while actively counting and payment form visible */}
      {countdown && !countdown.expired && showPaymentForm && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
            background: "rgba(216,181,106,0.1)",
            border: "1px solid rgba(216,181,106,0.3)",
            borderRadius: 12,
          }}>
            <Clock size={18} color={GOLD} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(31,58,45,0.5)", margin: "0 0 2px" }}>
                Price locked for
              </p>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "1.4rem", fontWeight: 700, color: GREEN, margin: 0 }}>
                {countdown.display}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div>
        {(billsData || bookingData?.displayBills || localBookingId) ? (
          <DualBillDisplay bookingId={localBookingId || undefined} bookingData={billsData || bookingData?.displayBills || null} />
        ) : (
          <FormCard>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(31,58,45,0.4)", fontWeight: 700, margin: "0 0 14px" }}>
              Loading bill data...
            </p>
          </FormCard>
        )}
      </div>

      {/* Pay Booking Amount Button / Payment Form */}
      {!showPaymentForm ? (
        <div>
          <button
            onClick={() => setShowPaymentForm(true)}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 12,
              background: GREEN, border: 'none', color: '#fff',
              fontFamily: 'var(--font-body, sans-serif)', fontSize: '1rem',
              fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(31,58,45,0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            <CreditCard size={18} />
            Pay Booking Amount — ₹16,000
          </button>
          <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.58rem', color: 'rgba(31,58,45,0.4)', textAlign: 'center', marginTop: 8 }}>
            Click to reveal payment details and submit your proof
          </p>
        </div>
      ) : (
        <>
          {/* Payment Method Details */}
          <div>
            <FormCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", fontWeight: 700, color: GREEN, margin: 0 }}>
                  Payment Method
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <SelectionButton label="UPI" selected={paymentMethod === "UPI"} onClick={() => setPaymentMethod("UPI")} />
                  <SelectionButton label="Bank" selected={paymentMethod === "BANK_TRANSFER"} onClick={() => setPaymentMethod("BANK_TRANSFER")} />
                  <SelectionButton label="Cash" selected={paymentMethod === "CASH"} onClick={() => setPaymentMethod("CASH")} />
                </div>
              </div>
              
              {paymentMethod === "UPI" && (
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
                    <img src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="UPI QR Code" style={{ width: 120, height: 120, borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)", objectFit: "contain" }} />
                    <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.55rem", marginTop: 6, color: "rgba(31,58,45,0.5)" }}>Scan to Pay</p>
                  </div>
                </div>
              )}

              {paymentMethod === "BANK_TRANSFER" && (
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

              {paymentMethod === "CASH" && (
                <div style={{ padding: "12px", background: "rgba(216,181,106,0.1)", borderRadius: 8, border: "1px dashed rgba(216,181,106,0.4)" }}>
                  <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.85rem", color: GREEN, margin: 0, textAlign: "center" }}>
                    Please deposit the cash at our office. Upload the official Cash Receipt image below as proof of payment.
                  </p>
                </div>
              )}
            </FormCard>
          </div>

          {/* Proof Form */}
          <div>
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
          </div>

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
                <><Upload size={16} /> Submit Booking Proof — ₹16,000</>
              )}
            </NavButton>
          </div>
        </>
      )}
    </div>
  );
}
