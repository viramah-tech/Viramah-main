"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Tag, Clock, CheckCircle, AlertTriangle, ArrowRight,
} from "lucide-react";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// ── Pricing data (server-authoritative constants mirrored here for display) ───

const GST_RATE = 0.12;
const DISCOUNT_FULL = 0.40;
const DISCOUNT_HALF = 0.25;
const SECURITY_DEPOSIT = 15_000;
const REGISTRATION_FEE = 1_000;
const TENURE_MONTHS = 11;
const INST1_MONTHS = 6;
const INST2_MONTHS = 5;

// Monthly base prices (pre-GST, pre-discount) — from official tariff plan
const ROOM_TYPES = [
  { id: "nexus", name: "Nexus 1 BHK", beds: 4, baseMonthly: 13_527 },
  { id: "collective", name: "Collective 1 BHK", beds: 3, baseMonthly: 18_587 },
  { id: "axis", name: "Axis Studio", beds: 2, baseMonthly: 21_563 },
  { id: "studio", name: "Axis Plus Studio", beds: 1, baseMonthly: 24_538 },
];

const ADD_ONS = [
  { name: "Transport", monthly: 2_000, annual: 22_000, note: "Campus shuttle — 11 months" },
  { name: "Mess (monthly)", monthly: 2_200, annual: 24_200, note: "Per month × 11" },
  { name: "Mess (lump sum)", monthly: null, annual: 19_000, note: "Full tenure only — saves ₹5,200" },
];

function calcRoom(baseMonthly: number, mode: "full" | "half") {
  const discountRate = mode === "full" ? DISCOUNT_FULL : DISCOUNT_HALF;
  const discountedBase = Math.round(baseMonthly * (1 - discountRate));
  const gst = Math.round(discountedBase * GST_RATE);
  const monthlyTotal = discountedBase + gst;
  const totalRoomRent = monthlyTotal * TENURE_MONTHS;
  if (mode === "full") {
    const roomRent1 = totalRoomRent;
    const inst1 = roomRent1 + SECURITY_DEPOSIT + REGISTRATION_FEE;
    return { discountedBase, gst, monthlyTotal, roomRent1, inst1, inst2: 0, discountRate };
  } else {
    const roomRent1 = Math.round(totalRoomRent * 0.60);
    const inst1 = roomRent1 + SECURITY_DEPOSIT + REGISTRATION_FEE;
    const inst2 = totalRoomRent - roomRent1;
    return { discountedBase, gst, monthlyTotal, roomRent1, inst1, inst2, discountRate };
  }
}

// ── Room Pricing Column ────────────────────────────────────────────────────────

function RoomColumn({ room }: { room: typeof ROOM_TYPES[0] }) {
  const full = calcRoom(room.baseMonthly, "full");
  const half = calcRoom(room.baseMonthly, "half");
  const savings = half.inst1 + half.inst2 - full.inst1;

  return (
    <div style={{ flex: 1, minWidth: 220, borderRadius: 16, border: `1.5px solid rgba(31,58,45,0.1)`, overflow: "hidden", background: "#fff" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1F3A2D, #162b1e)", padding: "14px 16px" }}>
        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(216,181,106,0.6)", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0 }}>
          {room.beds} {room.beds === 1 ? "bed" : "beds"}
        </p>
        <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.95rem", fontWeight: 700, color: GOLD, margin: "3px 0 0", lineHeight: 1.2 }}>
          {room.name}
        </p>
        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(246,244,239,0.5)", margin: "4px 0 0" }}>
          Base: {inr(room.baseMonthly)}/mo · GST 12%
        </p>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Half Yearly */}
        <div>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: GOLD, fontWeight: 700, marginBottom: 6 }}>
            60% Payment — 25% off
          </div>
          {[
            ["Discounted rent", inr(half.discountedBase) + "/mo"],
            ["GST (12%)", "+" + inr(half.gst) + "/mo"],
            ["Monthly total", inr(half.monthlyTotal) + "/mo"],
            ["First Payment (60%)", inr(half.roomRent1)],
            ["+ Security deposit", inr(SECURITY_DEPOSIT)],
            ["+ Admin fee", inr(REGISTRATION_FEE)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 4, padding: "3px 0", borderBottom: "1px solid rgba(31,58,45,0.06)" }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.5)" }}>{l}</span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: GREEN, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 2px", padding: "6px 0", background: "rgba(31,58,45,0.04)", borderRadius: 8, paddingLeft: 8, paddingRight: 8 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", fontWeight: 700, color: GREEN }}>60% Payment Total</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: 700, color: GREEN }}>{inr(half.inst1)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.5)" }}>Remaining (40%, later)</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.65)" }}>{inr(half.inst2)}</span>
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(31,58,45,0.08)" }} />

        {/* Full Tenure */}
        <div>
          <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#16a34a", fontWeight: 700, marginBottom: 6 }}>
            Full Tenure — 40% off
          </div>
          {[
            ["Discounted rent", inr(full.discountedBase) + "/mo"],
            ["GST (12%)", "+" + inr(full.gst) + "/mo"],
            ["Monthly total", inr(full.monthlyTotal) + "/mo"],
            ["Room rent × 11 mo", inr(full.roomRent1)],
            ["+ Security deposit", inr(SECURITY_DEPOSIT)],
            ["+ Admin fee", inr(REGISTRATION_FEE)],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", gap: 4, padding: "3px 0", borderBottom: "1px solid rgba(31,58,45,0.06)" }}>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.5)" }}>{l}</span>
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: GREEN, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 0", padding: "6px 8px", background: "rgba(22,163,74,0.07)", borderRadius: 8 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", fontWeight: 700, color: "#15803d" }}>Grand Total</span>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: 700, color: "#15803d" }}>{inr(full.inst1)}</span>
          </div>

          <div style={{ marginTop: 6, padding: "6px 8px", background: "rgba(216,181,106,0.1)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "#92400e" }}>
              ✨ Full pay saves {inr(Math.abs(savings))} vs 60% plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Worked Example ─────────────────────────────────────────────────────────────

function WorkedExample() {
  const [mode, setMode] = useState<"full" | "half">("half");
  const room = ROOM_TYPES[3]; // Axis Plus Studio ₹24,538
  const calc = calcRoom(room.baseMonthly, mode);

  const rows = mode === "half"
    ? [
        ["Base rent", inr(room.baseMonthly)],
        ["25% discount", `−${inr(room.baseMonthly - calc.discountedBase)}`],
        ["Discounted rent", inr(calc.discountedBase)],
        ["GST (12%)", `+${inr(calc.gst)}`],
        ["Monthly total", inr(calc.monthlyTotal)],
        ["60% of room rent", inr(calc.roomRent1)],
        ["+ Security deposit", inr(SECURITY_DEPOSIT)],
        ["+ Admin fee", inr(REGISTRATION_FEE)],
        ["Installment 1", inr(calc.inst1)],
        ["Remaining (40%)", inr(calc.inst2)],
      ]
    : [
        ["Base rent", inr(room.baseMonthly)],
        ["40% discount", `−${inr(room.baseMonthly - calc.discountedBase)}`],
        ["Discounted rent", inr(calc.discountedBase)],
        ["GST (12%)", `+${inr(calc.gst)}`],
        ["Monthly total", inr(calc.monthlyTotal)],
        ["× 11 months", inr(calc.roomRent1)],
        ["+ Security deposit", inr(SECURITY_DEPOSIT)],
        ["+ Admin fee", inr(REGISTRATION_FEE)],
        ["Grand Total", inr(calc.inst1)],
      ];

  return (
    <div style={{ background: "linear-gradient(135deg, #1F3A2D, #162b1e)", borderRadius: 20, padding: "28px 32px" }}>
      <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(216,181,106,0.6)", margin: "0 0 6px" }}>
        Worked Example — {room.name}
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(["half", "full"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${mode === m ? GOLD : "rgba(216,181,106,0.2)"}`, background: mode === m ? "rgba(216,181,106,0.12)" : "transparent", color: mode === m ? GOLD : "rgba(216,181,106,0.4)", fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", cursor: "pointer", transition: "all 0.2s" }}>
            {m === "half" ? "60% Payment" : "Full Tenure"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rows.map(([label, val], i) => {
          const isTotal = label.startsWith("Installment 1") || label === "Grand Total" || label === "Installment 2 (5 mo)";
          const isDivider = label.startsWith("Installment 1") || label === "Grand Total";
          return (
            <div key={i}>
              {isDivider && <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: isTotal ? GOLD : "rgba(246,244,239,0.5)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: isTotal ? "0.78rem" : "0.67rem", fontWeight: isTotal ? 700 : 400, color: isTotal ? GOLD : "rgba(246,244,239,0.75)" }}>{val}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Accept Button ──────────────────────────────────────────────────────────────

function AcceptButton({ onClick }: { onClick: () => void }) {
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <button
      onClick={countdown === 0 ? onClick : undefined}
      disabled={countdown > 0}
      style={{
        width: "100%", padding: "18px 28px", borderRadius: 16,
        background: countdown > 0 ? "rgba(31,58,45,0.35)" : `linear-gradient(135deg, ${GREEN}, #2d5440)`,
        border: "none", cursor: countdown > 0 ? "not-allowed" : "pointer",
        color: countdown > 0 ? "rgba(246,244,239,0.45)" : GOLD,
        fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", fontWeight: 700,
        transition: "all 0.4s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: countdown === 0 ? "0 8px 32px rgba(31,58,45,0.35)" : "none",
      }}
    >
      {countdown > 0 ? (
        <>
          <Clock size={18} />
          Please read — continuing in {countdown}…
        </>
      ) : (
        <>
          <CheckCircle size={18} />
          I have read and accept all terms — Continue to Register
          <ArrowRight size={18} />
        </>
      )}
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TermsAndPricingPage() {
  const router = useRouter();

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", JSON.stringify({ accepted: true, acceptedAt: new Date().toISOString() }));
    router.push("/user-onboarding");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f3ec", fontFamily: "var(--font-body, sans-serif)" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1F3A2D 0%, #162b1e 60%, #0f1f14 100%)", padding: "60px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(216,181,106,0.6)", margin: "0 0 12px" }}>
            Terms & Pricing
          </p>
          <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", color: GOLD, margin: 0, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
            Know what you pay.<br />Before you sign.
          </h1>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.78rem", color: "rgba(246,244,239,0.5)", margin: "18px 0 0", lineHeight: 1.7 }}>
            Full pricing, GST breakdown, discount calculations, and policy — all in one place.
            Review and accept to begin your registration.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* ── Section 1: Pricing Table ─────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1.3rem", fontWeight: 700, color: GREEN, margin: "0 0 8px" }}>
            Room Pricing
          </h2>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)", marginBottom: 24 }}>
            All prices include GST (12%). Discounts applied on base rent only. Add-ons priced separately.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {ROOM_TYPES.map((room) => <RoomColumn key={room.id} room={room} />)}
          </div>
        </div>

        {/* ── Section 2: Add-ons ───────────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1.3rem", fontWeight: 700, color: GREEN, margin: "0 0 8px" }}>
            Optional Add-ons
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {ADD_ONS.map((addon) => (
              <div key={addon.name} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(31,58,45,0.1)" }}>
                <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.88rem", fontWeight: 700, color: GREEN, margin: "0 0 4px" }}>{addon.name}</p>
                {addon.monthly && <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", color: "rgba(31,58,45,0.65)", margin: "0 0 3px" }}>{inr(addon.monthly)}/month</p>}
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.68rem", fontWeight: 700, color: GREEN, margin: "0 0 4px" }}>{inr(addon.annual)} total</p>
                <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.58rem", color: "rgba(31,58,45,0.4)", margin: 0 }}>{addon.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 3: Worked Example ────────────────────────── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1.3rem", fontWeight: 700, color: GREEN, margin: "0 0 8px" }}>
            How Your Discount Is Calculated
          </h2>
          <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.5)", marginBottom: 20 }}>
            Toggle between plans to see the exact calculation for Axis Plus Studio.
          </p>
          <WorkedExample />
        </div>

        {/* ── Section 4: Referral Policy ───────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ background: "#fff", borderRadius: 18, padding: "24px 28px", border: "1.5px solid rgba(31,58,45,0.1)", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(31,58,45,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Tag size={22} color={GREEN} />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", fontWeight: 700, color: GREEN, margin: "0 0 6px" }}>Referral Policy</h3>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "rgba(31,58,45,0.55)", margin: "0 0 6px", lineHeight: 1.7 }}>
                When a friend joins using your referral code, <strong>you both get ₹1,000 off</strong>.<br />
                Applied after all other discount calculations. Cannot be combined with multiple codes.
              </p>
              <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.62rem", color: "rgba(31,58,45,0.4)", margin: 0 }}>
                Your referral code is shown in your dashboard after registration.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 5: Deposit & Cancellation Policy ─────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ background: "rgba(217,119,6,0.06)", borderRadius: 18, padding: "24px 28px", border: "1.5px solid rgba(217,119,6,0.25)", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(217,119,6,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={22} color="#b45309" />
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "1rem", fontWeight: 700, color: "#92400e", margin: "0 0 10px" }}>Deposit & Cancellation Policy</h3>
              {[
                "₹15,000 security deposit is required to hold your room.",
                "Full refund if you cancel within 7 days of deposit approval.",
                "No refund after 7 days — the deposit is forfeited.",
                "You have 21 days from deposit approval to complete your full payment.",
                "After 21 days without payment, your room is released to the next applicant.",
                "Payment mode (Full / 60% Payment) is selected at deposit time and cannot be changed.",
              ].map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#b45309", flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", color: "#78350f", margin: 0, lineHeight: 1.6 }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Accept Button ─────────────────────────────────────── */}
        <AcceptButton onClick={handleAccept} />
      </div>
    </div>
  );
}
