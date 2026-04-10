import React from "react";
import { Shield, Info } from "lucide-react";

interface BillLine {
  label: string;
  amount: number;
}

interface DeductionCredit {
  amount: number;
  description?: string;
}

interface BookingBill {
  totalPayable: number;
  breakdown: BillLine[];
}

interface RoomRentBreakdown {
  tenure: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  gstAmount: number;
}

interface OptionalService {
  total: number;
}

interface FullTenureBill {
  roomRent: RoomRentBreakdown;
  mess?: OptionalService | null;
  transport?: OptionalService | null;
  deductions?: {
    securityDeposit?: { label?: string; amount?: number };
    referralCredits?: DeductionCredit[];
    otherCredits?: DeductionCredit[];
  };
  totalAfterDeductions: number;
}

interface ProjectedFinalBill {
  fullTenure?: FullTenureBill;
}

export interface DisplayBillsData {
  bookingBill?: BookingBill;
  projectedFinalBill?: ProjectedFinalBill;
}

interface DualBillProps {
  bookingData: DisplayBillsData | null;
}

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export const DualBillDisplay: React.FC<DualBillProps> = ({ bookingData }) => {
  if (!bookingData) return null;

  const { bookingBill, projectedFinalBill } = bookingData;

  if (!bookingBill || !projectedFinalBill || !projectedFinalBill.fullTenure) return null;
  const ft = projectedFinalBill.fullTenure;
  const messTotal = ft.mess?.total ?? 0;
  const transportTotal = ft.transport?.total ?? 0;
  
  if (!ft?.roomRent) return null;

  const formatCurrency = (val: unknown) => {
    const num = Number(val);
    if (val === null || val === undefined || Number.isNaN(num)) return "0";
    return Number(val).toLocaleString();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
      {/* Booking Amount Bill - Top */}
      <div style={{ 
        background: "#fff", 
        border: `1px solid rgba(31,58,45,0.1)`, 
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
          {bookingBill?.breakdown?.map((item: BillLine, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.95rem" }}>{item.label}</span>
              <span style={{ fontWeight: 500, color: GREEN, fontSize: "0.95rem" }}>₹{formatCurrency(item.amount)}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px dashed rgba(31,58,45,0.2)", margin: "16px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: GREEN, fontSize: "1.1rem" }}>Total Payable Now</span>
            <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.3rem" }}>₹{formatCurrency(bookingBill.totalPayable)}</span>
          </div>
        </div>
      </div>

      {/* Projected Final Bill - Bottom */}
      <div style={{ 
        background: "rgba(31,58,45,0.02)", 
        border: `1px solid rgba(216,181,106,0.3)`, 
        borderRadius: 16, 
        padding: 20 
      }}>
        <h3 style={{ margin: "0 0 16px 0", color: GREEN, fontFamily: "var(--font-heading, sans-serif)", fontSize: "1.1rem",  display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={18} color={GOLD} />
          Projected Final Bill (Full Tenure)
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>
          <i>This is an estimate. You will choose your payment track (Full Tenure / Half Yearly) after room confirmation.</i>
        </p>
        
        {/* Room Rent */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Room Rent ({ft.roomRent.tenure} months)</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Base Rent</span>
            <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{formatCurrency(ft.roomRent.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
            <span style={{ fontSize: "0.9rem" }}>Discount ({ft.roomRent.discountPercent}%)</span>
            <span style={{ fontSize: "0.9rem" }}>-₹{formatCurrency(ft.roomRent.discountAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>GST ({ft.roomRent.gstAmount ? '18%' : '0%'})</span>
            <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{formatCurrency(ft.roomRent.gstAmount || 0)}</span>
          </div>
        </div>

        {/* Services */}
        {(messTotal > 0 || transportTotal > 0) && (
           <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
             <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Selected Services</h4>
             {messTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Mess (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{formatCurrency(messTotal)}</span>
                </div>
             )}
             {transportTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Transport (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{formatCurrency(transportTotal)}</span>
                </div>
             )}
           </div>
        )}

        {/* Explicit Deduction Display */}
        <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
          <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Deductions & Credits</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{ft.deductions?.securityDeposit?.label || 'Security Deposit'}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{formatCurrency(ft.deductions?.securityDeposit?.amount || 15000)}</span>
          </div>
          {ft.deductions?.referralCredits?.map((cred: DeductionCredit, idx: number) => (
             <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
               <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || 'Referral Credit'}</span>
               <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{formatCurrency(cred.amount)}</span>
             </div>
          ))}
          {ft.deductions?.otherCredits?.map((cred: DeductionCredit, idx: number) => (
             <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
               <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || 'Other Credit'}</span>
               <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{formatCurrency(cred.amount)}</span>
             </div>
          ))}
        </div>

        <div style={{ borderTop: `1px dashed rgba(216,181,106,0.5)`, margin: "16px 0" }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "12px 16px", borderRadius: 8, border: `1px solid rgba(31,58,45,0.1)` }}>
          <span style={{ fontWeight: 600, color: GREEN, fontSize: "1rem" }}>Projected Final Amount</span>
          <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.2rem" }}>₹{formatCurrency(ft.totalAfterDeductions)}</span>
        </div>
      </div>
    </div>
  );
};
