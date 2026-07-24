"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Bus,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
  ShieldCheck,
  Building,
  CreditCard,
  Banknote,
  ArrowRight
} from "lucide-react";

import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_BASE = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl.replace(/\/$/, "")}/api`;

interface TransportStop {
  _id: string;
  name: string;
  pickupTime: string;
  dropTime: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  isActive: boolean;
}

const BANK_DETAILS = PAYMENT_CONFIG.BANK_DETAILS;

export default function StudentTransportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stops, setStops] = useState<TransportStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedStop, setSelectedStop] = useState<TransportStop | null>(null);
  const [isConfirmingModalOpen, setIsConfirmingModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active pass state from user object
  const activePass = user?.transportPass?.status === "active" ? user.transportPass : null;

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    try {
      setLoadingStops(true);
      const res = await fetch(`${API_BASE}/transport/stops`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Only show active, non-deleted stops
        setStops(data.data.filter((s: TransportStop) => s.isActive !== false));
      }
    } catch (err) {
      console.error("Failed to load transport stops:", err);
    } finally {
      setLoadingStops(false);
    }
  };

  const handleOpenBooking = (stop: TransportStop) => {
    setSelectedStop(stop);
    setIsConfirmingModalOpen(true);
    setActionMessage(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedStop) return;
    try {
      setSubmitting(true);
      setActionMessage(null);
      const res = await fetch(`${API_BASE}/transport/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          stopId: selectedStop._id,
          billingCycle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({
          type: "success",
          text: `Transport pass booked! Fee has been added to your ledger. Proceed to pay via Bank Transfer / Cash.`,
        });
        setIsConfirmingModalOpen(false);
        // Navigate after brief delay or reload
        setTimeout(() => {
          router.push("/student/payment");
        }, 1500);
      } else {
        setActionMessage({
          type: "error",
          text: data.error?.message || data.message || "Failed to book transport pass.",
        });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Network error occurred while booking pass." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPass = async () => {
    if (!confirm("Are you sure you want to cancel your transport pass subscription?")) return;
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/transport/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error?.message || "Failed to cancel pass");
      }
    } catch (err) {
      alert("Error cancelling transport pass.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1200, margin: "0 auto", color: GREEN, fontFamily: "var(--font-body, sans-serif)" }}>
      {/* Top Banner Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${GREEN}15`, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN }}>
            <Bus size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-heading, serif)", fontSize: "1.75rem", fontWeight: 700, margin: 0, color: GREEN }}>
              Travel & Bus Service Booking
            </h1>
            <p style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.6)", margin: 0 }}>
              Select a drop point below. Fees can be paid via Bank Transfer, UPI, or Cash at Viramah Accounts counter.
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div style={{
          marginBottom: 24,
          padding: "16px 20px",
          borderRadius: 16,
          fontSize: "0.88rem",
          fontWeight: 600,
          background: actionMessage.type === "success" ? "#f0fdf4" : "#fef2f2",
          color: actionMessage.type === "success" ? "#166534" : "#991b1b",
          border: `1px solid ${actionMessage.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>{actionMessage.text}</span>
          <button
            onClick={() => router.push("/student/payment")}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: GREEN,
              color: "#fff",
              border: "none",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Pay Now
          </button>
        </div>
      )}

      {/* Active Pass Card (If Subscribed) */}
      {activePass && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: 36,
            background: "linear-gradient(135deg, #1F3A2D 0%, #15271E 100%)",
            color: "#fff",
            borderRadius: 24,
            padding: "28px 32px",
            boxShadow: "0 20px 40px rgba(31,58,45,0.25)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, borderRadius: "50%", background: `${GOLD}15`, pointerEvents: "none" }} />
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: `${GOLD}30`, color: GOLD, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                <CheckCircle2 size={14} /> ACTIVE TRANSPORT PASS
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, margin: "0 0 6px", fontFamily: "var(--font-heading, serif)", color: "#fff" }}>
                {activePass.stopName}
              </h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={15} color={GOLD} /> Valid Until: {activePass.validUntil ? new Date(activePass.validUntil).toLocaleDateString("en-IN") : "Active"}
              </p>
            </div>

            <div style={{ textTransform: "capitalize", textAlign: "right" }}>
              <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", display: "block" }}>
                Subscribed Rate
              </span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: GOLD, fontFamily: "var(--font-mono, monospace)" }}>
                ₹{activePass.feeAmount?.toLocaleString("en-IN")} <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>/ {activePass.billingCycle}</span>
              </span>
              {(() => {
                const isTransportPaid = (user?.paymentSummary?.transportFee?.paid || 0) > 0 ||
                  (user?.paymentSummary?.transportFee?.total > 0 && user?.paymentSummary?.transportFee?.remaining === 0);
                
                return (
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end", alignItems: "center" }}>
                    {!isTransportPaid && (
                      <button
                        onClick={() => router.push("/student/payment")}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 10,
                          background: GOLD,
                          color: GREEN,
                          border: "none",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Pay Fee
                      </button>
                    )}

                    {isTransportPaid ? (
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#86efac", background: "rgba(134,239,172,0.15)", padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(134,239,172,0.3)" }}>
                        Paid ✓ (Contact admin to cancel)
                      </span>
                    ) : (
                      <button
                        onClick={handleCancelPass}
                        disabled={submitting}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.2)",
                          background: "rgba(255,255,255,0.1)",
                          color: "#ff8888",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Cancel Pass
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}

      {/* Plan Selector & Billing Cycle Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Available Drop Points</h2>
          <p style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.6)", margin: "4px 0 0" }}>Prices are set according to each drop point</p>
        </div>

        {/* Toggle Switch */}
        <div style={{ display: "flex", alignItems: "center", background: "#EAE6DF", padding: 4, borderRadius: 14, border: "1px solid rgba(31,58,45,0.1)" }}>
          <button
            onClick={() => setBillingCycle("monthly")}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: "0.82rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: billingCycle === "monthly" ? GREEN : "transparent",
              color: billingCycle === "monthly" ? "#fff" : GREEN,
              transition: "all 0.2s"
            }}
          >
            Monthly Rates
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              fontSize: "0.82rem",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: billingCycle === "yearly" ? GREEN : "transparent",
              color: billingCycle === "yearly" ? "#fff" : GREEN,
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            Yearly Rates <span style={{ background: GOLD, color: GREEN, padding: "2px 6px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 800 }}>SAVE</span>
          </button>
        </div>
      </div>

      {/* Bus Stops Grid */}
      {loadingStops ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(31,58,45,0.5)" }}>
          Loading drop points...
        </div>
      ) : stops.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", background: "#F9F8F6", borderRadius: 20, border: "1px dashed rgba(31,58,45,0.2)" }}>
          <Bus size={36} color="rgba(31,58,45,0.3)" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0, fontWeight: 600, color: GREEN }}>No drop points currently available</p>
          <p style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.5)", margin: "4px 0 0" }}>Check back soon for updated routes</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {stops.map((stop) => {
            const price = billingCycle === "yearly" ? stop.yearlyPrice : stop.monthlyPrice;
            const isCurrentActiveStop = activePass && activePass.stopId === stop._id && activePass.billingCycle === billingCycle;

            return (
              <motion.div
                key={stop._id}
                whileHover={{ y: -4 }}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  border: isCurrentActiveStop ? `2px solid ${GREEN}` : "1px solid rgba(31,58,45,0.12)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative"
                }}
              >
                {isCurrentActiveStop && (
                  <span style={{ position: "absolute", top: 16, right: 16, background: `${GREEN}15`, color: GREEN, padding: "4px 10px", borderRadius: 8, fontSize: "0.7rem", fontWeight: 700 }}>
                    Active Stop ✓
                  </span>
                )}

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${GOLD}25`, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN }}>
                      <MapPin size={18} />
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: GREEN }}>{stop.name}</h3>
                  </div>

                  {stop.description && (
                    <p style={{ fontSize: "0.8rem", color: "rgba(31,58,45,0.65)", margin: "0 0 16px", lineHeight: 1.4 }}>
                      {stop.description}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: 16, padding: "10px 14px", background: "#F9F8F6", borderRadius: 12, marginBottom: 20, fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(31,58,45,0.7)" }}>
                      <Clock size={14} color={GREEN} /> Pickup: <span style={{ fontWeight: 700, color: GREEN }}>{stop.pickupTime}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(31,58,45,0.7)" }}>
                      Return: <span style={{ fontWeight: 700, color: GREEN }}>{stop.dropTime}</span>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(31,58,45,0.08)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "rgba(31,58,45,0.45)", display: "block" }}>
                      {billingCycle === "yearly" ? "Yearly Price" : "Monthly Price"}
                    </span>
                    <span style={{ fontSize: "1.35rem", fontWeight: 800, color: GREEN, fontFamily: "var(--font-mono, monospace)" }}>
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(stop)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      background: GREEN,
                      color: "#fff",
                      border: "none",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "transform 0.15s"
                    }}
                  >
                    Book Pass <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Booking Confirmation & Bank/Cash Payment Guidance Modal */}
      <AnimatePresence>
        {isConfirmingModalOpen && selectedStop && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(31,58,45,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 24, padding: 32, maxWidth: 520, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: GREEN }}>Confirm Pass Booking</h3>
                <button onClick={() => setIsConfirmingModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(31,58,45,0.4)" }}>
                  <X size={20} />
                </button>
              </div>

              {/* Selected Stop Summary */}
              <div style={{ background: "#F9F8F6", borderRadius: 16, padding: 18, marginBottom: 20, border: "1px solid rgba(31,58,45,0.1)" }}>
                <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "rgba(31,58,45,0.5)", margin: "0 0 4px" }}>Selected Drop Point</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 12px", color: GREEN }}>{selectedStop.name}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, borderTop: "1px solid rgba(31,58,45,0.1)", paddingTop: 12, fontSize: "0.8rem" }}>
                  <div>
                    <span style={{ color: "rgba(31,58,45,0.5)", display: "block" }}>Billing Plan</span>
                    <span style={{ fontWeight: 700, textTransform: "capitalize", color: GREEN }}>{billingCycle} Pass</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "rgba(31,58,45,0.5)", display: "block" }}>Fee Amount</span>
                    <span style={{ fontWeight: 800, color: GREEN, fontFamily: "var(--font-mono, monospace)", fontSize: "1.05rem" }}>
                      ₹{(billingCycle === "yearly" ? selectedStop.yearlyPrice : selectedStop.monthlyPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Guidance (Bank Transfer / Cash) */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: GREEN, margin: "0 0 10px" }}>
                  How to Pay for Your Transport Pass:
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Bank Details Box */}
                  <div style={{ padding: 14, borderRadius: 14, background: `${GREEN}08`, border: `1px solid ${GREEN}20`, fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: GREEN, marginBottom: 6 }}>
                      <Building size={16} /> Method 1: Bank Transfer / UPI
                    </div>
                    <div style={{ color: "rgba(31,58,45,0.75)", lineHeight: 1.5 }}>
                      <div>Bank Name: <strong>{BANK_DETAILS.bank}</strong></div>
                      <div>Account Name: <strong>{BANK_DETAILS.accountName}</strong></div>
                      <div>Account Number: <strong>{BANK_DETAILS.accountNo}</strong></div>
                      <div>IFSC Code: <strong>{BANK_DETAILS.ifsc}</strong></div>
                      {BANK_DETAILS.upiId && <div>UPI ID: <strong>{BANK_DETAILS.upiId}</strong></div>}
                    </div>
                    <p style={{ fontSize: "0.72rem", color: "rgba(31,58,45,0.6)", margin: "6px 0 0", italic: true }}>
                      *After booking, submit your UTR / transaction proof on the Payments page.
                    </p>
                  </div>

                  {/* Cash Box */}
                  <div style={{ padding: 14, borderRadius: 14, background: "#fff", border: "1px solid rgba(31,58,45,0.12)", fontSize: "0.78rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: GREEN }}>
                      <Banknote size={16} /> Method 2: Cash Payment
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.7)", margin: "4px 0 0" }}>
                      You can pay in cash directly at the Viramah Stay Accounts Counter.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setIsConfirmingModalOpen(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(31,58,45,0.2)", background: "none", color: GREEN, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: GREEN, color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {submitting ? "Processing..." : "Confirm & Update Fee"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
