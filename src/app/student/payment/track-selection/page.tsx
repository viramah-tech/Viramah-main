"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertCircle, Calendar, Star, Info } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { containerVariants, itemVariants } from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export default function TrackSelectionPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<"FULL_TENURE" | "HALF_YEARLY" | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await apiFetch<{ data: any }>("/api/v1/bookings/my-booking", { token });
        if (!res.data) throw new Error("No active booking found");
        
        // Ensure dual bills exist
        if (!res.data.displayBills?.projectedFinalBill) {
          throw new Error("Billing data not available");
        }
        
        // If track is already selected, redirect
        if (["TRACK_SELECTED", "PARTIALLY_PAID", "FULLY_PAID"].includes(res.data.status)) {
          router.replace("/student/payment/installment/1");
          return;
        }

        setBooking(res.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [token, router]);

  const handleSelectTrack = async (track: "FULL_TENURE" | "HALF_YEARLY") => {
    setSelectedTrack(track);
  };

  const handleConfirm = async () => {
    if (!selectedTrack) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/bookings/${booking._id}/select-track`, {
        method: "POST",
        token,
        body: { track: selectedTrack }
      });
      router.push("/student/payment/installment/1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save selection");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: GREEN }}>Loading payment options...</div>;
  }

  if (error || !booking) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#dc2626" }}>
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  const { fullTenure, halfYearly } = booking.displayBills.projectedFinalBill;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      
      <motion.div variants={itemVariants} style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", color: GREEN, marginBottom: 8 }}>Choose Your Payment Plan</h1>
        <p style={{ fontFamily: "var(--font-body, sans-serif)", color: "rgba(31,58,45,0.6)" }}>Select the plan that works best for you and complete your registration.</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 32 }}>
        
        {/* Full Tenure Card */}
        <motion.div 
          variants={itemVariants}
          onClick={() => handleSelectTrack("FULL_TENURE")}
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `2px solid ${selectedTrack === "FULL_TENURE" ? GOLD : "rgba(31,58,45,0.1)"}`,
            padding: 24,
            cursor: "pointer",
            position: "relative",
            boxShadow: selectedTrack === "FULL_TENURE" ? "0 8px 24px rgba(216,181,106,0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
            transition: "all 0.2s"
          }}
        >
          {selectedTrack === "FULL_TENURE" && (
            <div style={{ position: "absolute", top: -12, right: 24, background: GOLD, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={14} /> Selected
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(216,181,106,0.1)", p: 8, borderRadius: 8, padding: 10 }}>
              <Star size={24} color={GOLD} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: GREEN, fontSize: "1.2rem" }}>Full Tenure</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#16a34a", fontWeight: 600 }}>Save ₹{(fullTenure.roomRent?.baseMonthly * 11 - fullTenure.totalAfterDeductions).toLocaleString()}</p>
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 700, color: GREEN, fontFamily: "var(--font-heading, sans-serif)" }}>
              ₹{fullTenure.totalAfterDeductions.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "rgba(31,58,45,0.5)" }}> / year</span>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>
              <CheckCircle2 size={16} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
              Highest discount applied ({fullTenure.discountPercent}%)
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>
              <CheckCircle2 size={16} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
              No further rent payments for 11 months
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>
              <CheckCircle2 size={16} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
              Includes -₹15,000 Security Deposit Credit
            </li>
          </ul>
        </motion.div>

        {/* Half Yearly Card */}
        <motion.div 
          variants={itemVariants}
          onClick={() => handleSelectTrack("HALF_YEARLY")}
          style={{
            background: "#fff",
            borderRadius: 16,
            border: `2px solid ${selectedTrack === "HALF_YEARLY" ? GREEN : "rgba(31,58,45,0.1)"}`,
            padding: 24,
            cursor: "pointer",
            position: "relative",
            boxShadow: selectedTrack === "HALF_YEARLY" ? "0 8px 24px rgba(31,58,45,0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
            transition: "all 0.2s"
          }}
        >
          {selectedTrack === "HALF_YEARLY" && (
            <div style={{ position: "absolute", top: -12, right: 24, background: GREEN, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle2 size={14} /> Selected
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "rgba(31,58,45,0.05)", p: 8, borderRadius: 8, padding: 10 }}>
              <Calendar size={24} color={GREEN} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: GREEN, fontSize: "1.2rem" }}>Half Yearly</h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(31,58,45,0.5)" }}>Split into 2 payments</p>
            </div>
          </div>
          
          <div style={{ marginBottom: 20, display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 700, color: GREEN, fontFamily: "var(--font-heading, sans-serif)", lineHeight: 1 }}>
              ₹{halfYearly.firstInstallment.totalAmount.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.9rem", color: "rgba(31,58,45,0.5)", marginTop: 6 }}>Due now</span>
            
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(31,58,45,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
               <span style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.7)" }}>2nd Installment</span>
               <span style={{ fontSize: "0.95rem", color: GREEN, fontWeight: 600 }}>₹{halfYearly.secondInstallment.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
             <li style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>
              <CheckCircle2 size={16} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
              Lower initial upfront cost
            </li>
            <li style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.9rem", color: "rgba(31,58,45,0.7)" }}>
              <CheckCircle2 size={16} color={GREEN} style={{ marginTop: 2, flexShrink: 0 }} />
              2nd installment due {halfYearly.secondInstallment.dueDate ? new Date(halfYearly.secondInstallment.dueDate).toLocaleDateString() : 'later'}
            </li>
          </ul>
        </motion.div>

      </div>

      <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button
          onClick={handleConfirm}
          disabled={!selectedTrack || submitting}
          style={{
            background: !selectedTrack ? "rgba(31,58,45,0.2)" : GREEN,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "16px 32px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: !selectedTrack || submitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            transition: "all 0.2s"
          }}
        >
          {submitting ? "Confirming..." : "Confirm & Proceed"}
          {!submitting && <ArrowRight size={18} />}
        </button>
      </motion.div>
    </motion.div>
  );
}
