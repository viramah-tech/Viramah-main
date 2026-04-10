"use client";

import React, { useState, useEffect } from "react";
import { Shield, Info } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { V1_API } from "@/lib/apiEndpoints";

// ── Types ────────────────────────────────────────────────────────────────────

interface BillLine {
  label: string;
  amount: number;
  type?: string;
}

interface DeductionCredit {
  amount: number;
  description?: string;
}

interface BookingBill {
  totalPayable: number;
  breakdown: BillLine[];
  securityDeposit?: { amount?: number; gstAmount?: number; total?: number };
  registrationFee?: { baseAmount?: number; gstAmount?: number; total?: number };
}

/**
 * RoomRent comes from the backend with BOTH legacy and new field names.
 * We accept all of them and resolve in the component.
 */
interface RoomRentRaw {
  tenure: number;
  // New canonical fields (from calculateProjectedFinalBill)
  baseMonthly?: number | null;
  discountedBase?: number | null;
  gstPerMonth?: number | null;
  monthlyTotal?: number | null;
  total?: number | null;
  // Legacy compat fields
  subtotal?: number | null;
  discountPercent?: number | null;
  discountAmount?: number | null;
  discountedSubtotal?: number | null;
  gstRate?: number | null;
  gstAmount?: number | null;
}

interface OptionalService {
  total: number;
}

interface FullTenureBill {
  roomRent: RoomRentRaw;
  discountPercent?: number;
  mess?: OptionalService | null;
  transport?: OptionalService | null;
  deductions?: {
    securityDeposit?: { label?: string; amount?: number };
    referralCredits?: DeductionCredit[];
    otherCredits?: DeductionCredit[];
  };
  grandTotal?: number | null;
  totalAfterDeductions?: number | null;
}

interface ProjectedFinalBill {
  fullTenure?: FullTenureBill;
}

export interface DisplayBillsData {
  bookingBill?: BookingBill;
  projectedFinalBill?: ProjectedFinalBill;
}

interface DualBillProps {
  bookingId?: string;
  bookingData?: DisplayBillsData | null;
}

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Safe currency formatter — treats null/undefined/NaN as 0 */
const fmt = (val: unknown): string => {
  const num = Number(val);
  if (val === null || val === undefined || Number.isNaN(num)) return "0";
  return Math.round(num).toLocaleString("en-IN");
};

/** Pick first non-null/undefined number from candidates */
const pick = (...vals: (number | null | undefined)[]): number => {
  for (const v of vals) {
    if (v !== null && v !== undefined && !Number.isNaN(Number(v))) return Number(v);
  }
  return 0;
};

// ── Component ────────────────────────────────────────────────────────────────

export const DualBillDisplay: React.FC<DualBillProps> = ({ bookingId, bookingData: initialData }) => {
  const [data, setData] = useState<DisplayBillsData | null>(initialData || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    if (!bookingId) {
      if (initialData) setData(initialData);
      return;
    }

    const fetchLiveBills = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
        const res = await apiFetch<{ data: { bookingBill?: unknown; projectedFinalBill?: unknown } }>(
          V1_API.bookings.bills(bookingId),
          { token }
        );
        if (active) {
          if (res.data) {
            setData(res.data as DisplayBillsData);
          } else if (initialData) {
            setData(initialData);
          }
        }
      } catch (err) {
        console.error("[DualBillDisplay] Failed to fetch live bills:", err);
        if (active && initialData) {
          setData(initialData);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchLiveBills();

    return () => { active = false; };
  }, [bookingId, initialData]);

  if (loading && !data) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "rgba(31,58,45,0.6)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.85rem" }}>
        Loading live bill data from backend...
      </div>
    );
  }

  if (!data) return null;

  const { bookingBill, projectedFinalBill } = data;

  // ── Booking Bill Normalization ───────────────────────────────────────────
  // Always show ₹16,000 (15000 security + 1000 registration). No GST.
  // Filter out any historic TAX/GST breakdown items from old DB records.
  const FIXED_BOOKING_TOTAL = 16000;
  const normalizedBreakdown: BillLine[] = (bookingBill?.breakdown && bookingBill.breakdown.length > 0)
    ? bookingBill.breakdown.filter((item) => {
      const t = (item as { type?: string }).type;
      // Exclude any tax/GST items — there is NO GST on booking amount
      if (t === "TAX" || t === "GST") return false;
      // Also exclude items whose label contains "GST" (catches old formats)
      if (item.label?.toLowerCase().includes("gst")) return false;
      return true;
    })
    : [
      { label: "Security Deposit (Refundable)", amount: 15000 },
      { label: "Registration Fee (Non-Refundable)", amount: 1000 },
    ];

  // ── Projected Bill Normalization ────────────────────────────────────────
  const ft = projectedFinalBill?.fullTenure;
  const rr = ft?.roomRent;
  const hasProjectedData = ft && rr;

  // Resolve room rent values from either new or legacy field names
  const tenure = rr?.tenure ?? 11;
  const baseMonthly = pick(rr?.baseMonthly);
  const baseRentSubtotal = pick(rr?.subtotal, baseMonthly * tenure);

  // Discount — lives on fullTenure top-level, NOT inside roomRent
  const discountPct = pick(ft?.discountPercent, rr?.discountPercent, 40);
  const discountAmount = pick(rr?.discountAmount, Math.round(baseRentSubtotal * discountPct / 100));

  const gstAmount = pick(rr?.gstAmount);
  const messTotal = ft?.mess?.total ?? 0;
  const transportTotal = ft?.transport?.total ?? 0;
  const totalAfterDeductions = pick(ft?.totalAfterDeductions);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>

      {/* ── Booking Amount Bill ── */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(31,58,45,0.1)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}>
        <div style={{ background: GREEN, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={20} color={GOLD} />
          <h3 style={{ margin: 0, color: "#fff", fontFamily: "var(--font-heading, sans-serif)", fontSize: "1.1rem" }}>
            Payment Required Now
          </h3>
        </div>
        <div style={{ padding: 20 }}>
          {normalizedBreakdown.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.95rem" }}>{item.label}</span>
              <span style={{ fontWeight: 500, color: GREEN, fontSize: "0.95rem" }}>₹{fmt(item.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px dashed rgba(31,58,45,0.2)", margin: "16px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: GREEN, fontSize: "1.1rem" }}>Total Payable Now</span>
            <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.3rem" }}>₹{fmt(FIXED_BOOKING_TOTAL)}</span>
          </div>
        </div>
      </div>

      {/* ── Projected Final Bill ── */}
      {hasProjectedData && (
        <div style={{
          background: "rgba(31,58,45,0.02)",
          border: "1px solid rgba(216,181,106,0.3)",
          borderRadius: 16,
          padding: 20
        }}>
          <h3 style={{
            margin: "0 0 16px 0", color: GREEN,
            fontFamily: "var(--font-heading, sans-serif)", fontSize: "1.1rem",
            display: "flex", alignItems: "center", gap: 8
          }}>
            <Info size={18} color={GOLD} />
            Projected Final Bill (Full Tenure)
          </h3>
          <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>
            <i>This is an estimate. You will choose your payment track (Full Tenure / Half Yearly) after room confirmation.</i>
          </p>

          {/* Room Rent */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Room Rent ({tenure} months)</h4>

            {/* Base Rent */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Base Rent</span>
              <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{fmt(baseRentSubtotal)}</span>
            </div>

            {/* Discount */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
              <span style={{ fontSize: "0.9rem" }}>Discount ({discountPct}%)</span>
              <span style={{ fontSize: "0.9rem" }}>-₹{fmt(discountAmount)}</span>
            </div>

            {/* GST */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>GST (12%)</span>
              <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{fmt(gstAmount)}</span>
            </div>
          </div>

          {/* Services */}
          {(messTotal > 0 || transportTotal > 0) && (
            <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
              <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Selected Services</h4>
              {messTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Mess (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{fmt(messTotal)}</span>
                </div>
              )}
              {transportTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Transport (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{fmt(transportTotal)}</span>
                </div>
              )}
            </div>
          )}

          {/* Deductions */}
          <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
            <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Deductions &amp; Credits</h4>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                {ft?.deductions?.securityDeposit?.label || "Security Deposit"}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                -₹{fmt(ft?.deductions?.securityDeposit?.amount || 15000)}
              </span>
            </div>
            {ft?.deductions?.referralCredits?.map((cred: DeductionCredit, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || "Referral Credit"}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{fmt(cred.amount)}</span>
              </div>
            ))}
            {ft?.deductions?.otherCredits?.map((cred: DeductionCredit, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || "Other Credit"}</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{fmt(cred.amount)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px dashed rgba(216,181,106,0.5)", margin: "16px 0" }} />

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#fff", padding: "12px 16px", borderRadius: 8,
            border: "1px solid rgba(31,58,45,0.1)"
          }}>
            <span style={{ fontWeight: 600, color: GREEN, fontSize: "1rem" }}>Projected Final Amount</span>
            <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.2rem" }}>₹{fmt(totalAfterDeductions)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
