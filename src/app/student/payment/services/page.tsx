"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Upload, ArrowRight, UtensilsCrossed, Bus, CheckCircle2, Phone, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { uploadFile } from "@/lib/uploadFile";
import { useAuth } from "@/context/AuthContext";
import { containerVariants, itemVariants, FieldLabel, FieldInput } from "@/components/onboarding/FormComponents";
import { PAYMENT_CONFIG } from "@/config/paymentConfig";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

export default function ServicePaymentsPage() {
  const { token } = useAuth();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Form State
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState<{ name: string; preview: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const bookingRes = await apiFetch<{ data: any }>("/api/v1/bookings/my-booking", { token });
        if (!bookingRes.data) throw new Error("No active booking found");
        
        const bId = bookingRes.data._id || bookingRes.data.bookingId;
        setBookingId(bId);

        const res = await apiFetch<{ data: { availableServices: any[] } }>(`/api/v1/bookings/${bId}/services`, { token });
        setServices(res.data.availableServices || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [token]);

  const activeService = services.find((s) => s.service === selectedService);

  const validate = () => {
    const num = Number(amount);
    if (!num || num <= 0) return "Please enter a valid amount";
    if (activeService && num > activeService.amountDue) {
      return `Amount cannot exceed remaining balance of ₹${activeService.amountDue.toLocaleString()}`;
    }
    if (!transactionId.trim()) return "Transaction ID is required";
    if (!receipt) return "Payment receipt is required";
    return null;
  };

  const handleSubmit = async () => {
    const errObj = validate();
    if (errObj) {
      setValidationError(errObj);
      return;
    }
    setValidationError(null);
    setSubmitting(true);

    try {
      let receiptUrl = receipt!.preview;
      if (receiptUrl.startsWith("data:")) {
        receiptUrl = await uploadFile("receipt", receiptUrl, receipt!.name);
      }

      await apiFetch(`/api/v1/bookings/${bookingId}/services/${selectedService}/pay`, {
        method: "POST",
        token,
        body: {
          amount: Number(amount),
          utrNumber: transactionId.trim(),
          receiptUrl,
          paymentMethod: "UPI"
        }
      });
      
      setSelectedService(null);
      setAmount("");
      setTransactionId("");
      setReceipt(null);
      
      // Reload silently
      const res = await apiFetch<{ data: { availableServices: any[] } }>(`/api/v1/bookings/${bookingId}/services`, { token });
      setServices(res.data.availableServices);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setReceipt({ name: f.name, preview: reader.result as string });
      reader.readAsDataURL(f);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "100px 0", color: GREEN }}>Loading active services...</div>;

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", color: "#dc2626" }}>
        <AlertCircle size={32} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: "2rem", color: GREEN, margin: "0 0 8px 0" }}>
          Service Payments
        </h1>
        <p style={{ color: "rgba(31,58,45,0.6)", margin: 0 }}>
          Manage your payments for active value-added services like Mess and Transport.
        </p>
      </motion.div>

      {services.length === 0 ? (
        <motion.div variants={itemVariants} style={{ background: "#fff", borderRadius: 16, padding: "40px 20px", textAlign: "center", border: "1px solid rgba(31,58,45,0.08)" }}>
           <p style={{ color: "rgba(31,58,45,0.5)", margin: 0 }}>No active services found requiring payment.</p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {services.map((svc) => (
            <motion.div key={svc.service} variants={itemVariants} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${selectedService === svc.service ? GOLD : "rgba(31,58,45,0.08)"}`, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(31,58,45,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {svc.service.toUpperCase() === "MESS" ? <UtensilsCrossed color={GREEN} /> : <Bus color={GREEN} />}
                    </div>
                    <div>
                       <h3 style={{ margin: 0, color: GREEN, fontSize: "1.1rem" }}>{svc.label}</h3>
                       <p style={{ margin: 0, color: "rgba(31,58,45,0.5)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total: ₹{svc.totalAmount.toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "rgba(31,58,45,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining Balance</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: GREEN }}>₹{svc.amountDue.toLocaleString()}</div>
                 </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(31,58,45,0.1)", paddingTop: 16 }}>
                <div>
                   <span style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>Status: </span>
                   <strong style={{ fontSize: "0.85rem", color: svc.amountDue === 0 ? "#16a34a" : GOLD }}>{svc.status.replace("_", " ")}</strong>
                </div>
                
                {svc.amountDue > 0 && selectedService !== svc.service && (
                  <button 
                    onClick={() => { setSelectedService(svc.service); setAmount(svc.amountDue.toString()); }}
                    style={{ background: GREEN, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}
                  >
                    Make a Payment
                  </button>
                )}
                
                {selectedService === svc.service && (
                  <button 
                    onClick={() => setSelectedService(null)}
                    style={{ background: "transparent", color: "rgba(31,58,45,0.6)", border: "1px solid rgba(31,58,45,0.2)", borderRadius: 8, padding: "8px 20px", fontSize: "0.9rem", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Payment Form Slide Down */}
      <AnimatePresence>
        {selectedService && activeService && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", marginTop: 24 }}
          >
             <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${GOLD}`, padding: 24 }}>
                <h3 style={{ margin: "0 0 16px 0", color: GREEN, fontSize: "1.2rem" }}>Pay for {activeService.label}</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <FieldLabel>Amount to Pay (₹)</FieldLabel>
                    <FieldInput 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div style={{ background: "rgba(31,58,45,0.03)", borderRadius: 12, padding: 16, border: "1px dashed rgba(31,58,45,0.1)" }}>
                     <p style={{ fontSize: "0.85rem", fontWeight: 600, color: GREEN, margin: "0 0 12px 0" }}>Transfer via UPI:</p>
                     <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                       <img src={PAYMENT_CONFIG.QR_CODE_IMAGE_PATH} alt="QR" style={{ width: 80, height: 80, borderRadius: 8 }} />
                       <div>
                          <div style={{ fontSize: "0.85rem", color: "rgba(31,58,45,0.6)" }}>UPI ID:</div>
                          <div style={{ fontSize: "1rem", color: GREEN, fontWeight: 700 }}>{PAYMENT_CONFIG.BANK_DETAILS.upiId}</div>
                       </div>
                     </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FieldLabel>Transaction UTR Number</FieldLabel>
                    <FieldInput 
                      type="text" 
                      placeholder="Ex: 23456789012"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FieldLabel>Payment Screenshot</FieldLabel>
                    {receipt ? (
                      <div style={{ position: "relative", width: "fit-content" }}>
                        <img src={receipt.preview} alt="Receipt" style={{ height: 100, borderRadius: 8, border: "2px solid rgba(31,58,45,0.1)" }} />
                        <button onClick={() => setReceipt(null)} style={{ position: "absolute", top: -8, right: -8, background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyItems: "center" }}>
                           <X size={14} style={{ margin: "auto" }}/>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ background: "rgba(31,58,45,0.05)", border: "2px dashed rgba(31,58,45,0.2)", borderRadius: 12, padding: "20px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                      >
                        <Upload size={20} color={GREEN} />
                        <span style={{ fontSize: "0.85rem", color: GREEN }}>Upload Screenshot</span>
                      </button>
                    )}
                    <input type="file" accept="image/*,.pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
                  </div>

                  {validationError && (
                    <div style={{ background: "rgba(220,38,38,0.1)", padding: "12px", borderRadius: 8, color: "#dc2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <AlertCircle size={16} /> {validationError}
                    </div>
                  )}

                  <button
                     onClick={handleSubmit}
                     disabled={submitting}
                     style={{
                       background: GREEN,
                       color: "#fff",
                       border: "none",
                       borderRadius: 8,
                       padding: "16px",
                       fontSize: "1rem",
                       fontWeight: 600,
                       cursor: submitting ? "not-allowed" : "pointer",
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                       gap: 8,
                       marginTop: 8
                     }}
                  >
                    {submitting ? "Submitting..." : "Submit Payment for Verification"}
                    {!submitting && <ArrowRight size={18} />}
                  </button>

                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
