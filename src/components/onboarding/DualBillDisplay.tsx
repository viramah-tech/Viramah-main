import React from "react";
import { Shield, Clock, Info } from "lucide-react";

interface DualBillProps {
  bookingData: any; // We can type this later. Passed from booking.displayBills
}

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export const DualBillDisplay: React.FC<DualBillProps> = ({ bookingData }) => {
  if (!bookingData) return null;

  const { bookingBill, projectedFinalBill } = bookingData;

  if (!bookingBill || !projectedFinalBill) return null;
  const ft = projectedFinalBill.fullTenure;

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
          {bookingBill.breakdown.map((item: any, idx: number) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.95rem" }}>{item.label}</span>
              <span style={{ fontWeight: 500, color: GREEN, fontSize: "0.95rem" }}>₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px dashed rgba(31,58,45,0.2)", margin: "16px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: GREEN, fontSize: "1.1rem" }}>Total Payable Now</span>
            <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.3rem" }}>₹{bookingBill.totalPayable.toLocaleString()}</span>
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
            <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{ft.roomRent.subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
            <span style={{ fontSize: "0.9rem" }}>Discount ({ft.roomRent.discountPercent}%)</span>
            <span style={{ fontSize: "0.9rem" }}>-₹{ft.roomRent.discountAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>GST ({ft.roomRent.gstAmount ? '18%' : '0%'})</span>
            <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{(ft.roomRent.gstAmount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Services */}
        {(ft.mess?.total > 0 || ft.transport?.total > 0) && (
           <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
             <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Selected Services</h4>
             {ft.mess?.total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Mess (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{ft.mess.total.toLocaleString()}</span>
                </div>
             )}
             {ft.transport?.total > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "rgba(31,58,45,0.7)", fontSize: "0.9rem" }}>Transport (Lump sum)</span>
                  <span style={{ color: GREEN, fontSize: "0.9rem" }}>₹{ft.transport.total.toLocaleString()}</span>
                </div>
             )}
           </div>
        )}

        {/* Explicit Deduction Display */}
        <div style={{ marginBottom: 16, paddingTop: 16, borderTop: "1px solid rgba(31,58,45,0.1)" }}>
          <h4 style={{ margin: "0 0 10px 0", color: GREEN, fontSize: "0.95rem" }}>Deductions & Credits</h4>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{ft.deductions.securityDeposit.label}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{ft.deductions.securityDeposit.amount.toLocaleString()}</span>
          </div>
          {ft.deductions.referralCredits?.map((cred: any, idx: number) => (
             <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
               <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || 'Referral Credit'}</span>
               <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{cred.amount.toLocaleString()}</span>
             </div>
          ))}
          {ft.deductions.otherCredits?.map((cred: any, idx: number) => (
             <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, color: "#16a34a" }}>
               <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cred.description || 'Other Credit'}</span>
               <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>-₹{cred.amount.toLocaleString()}</span>
             </div>
          ))}
        </div>

        <div style={{ borderTop: `1px dashed rgba(216,181,106,0.5)`, margin: "16px 0" }}></div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "12px 16px", borderRadius: 8, border: `1px solid rgba(31,58,45,0.1)` }}>
          <span style={{ fontWeight: 600, color: GREEN, fontSize: "1rem" }}>Projected Final Amount</span>
          <span style={{ fontWeight: 700, color: GREEN, fontSize: "1.2rem" }}>₹{ft.totalAfterDeductions.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
