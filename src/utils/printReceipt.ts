"use client";

/**
 * printReceipt.ts — Receipt printing utility for the resident-facing app.
 * Generates a styled print window with Viramah branding.
 */

interface PrintReceiptData {
  type: "payment" | "deposit";
  amount: number;
  transactionId?: string;
  date: string;
  status: string;
  // Payment-specific
  paymentId?: string;
  paymentMode?: string;
  installmentNumber?: number;
  breakdown?: Record<string, any>;
  depositCredited?: number;
  // Deposit-specific
  roomType?: string;
  depositAmount?: number;
  registrationFee?: number;
  advanceAmount?: number;
  totalPaidAtDeposit?: number;
}

const inr = (n: number | null | undefined) =>
  n != null ? `₹${Math.round(n).toLocaleString("en-IN")}` : "—";

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export function printReceipt(data: PrintReceiptData) {
  const isPayment = data.type === "payment";
  const title = isPayment ? "Payment Receipt" : "Deposit Receipt";

  let breakdownHtml = "";
  if (isPayment && data.breakdown) {
    const b = data.breakdown;
    const rows: [string, string][] = [];
    if (b.roomMonthly) rows.push(["Monthly Base Rent", inr(b.roomMonthly)]);
    if (b.discountRate) rows.push([`Discount (${Math.round((b.discountRate ?? 0) * 100)}%)`, `−${inr(b.roomMonthly - b.discountedMonthlyBase)}`]);
    if (b.discountedMonthlyWithGST) rows.push(["Monthly (incl. GST)", inr(b.discountedMonthlyWithGST)]);
    if (b.roomRentTotal) rows.push([`Room Rent (× ${b.installmentMonths || "—"} months)`, inr(b.roomRentTotal)]);
    if (b.securityDeposit > 0) rows.push(["Security Deposit", inr(b.securityDeposit)]);
    if (b.registrationFee > 0) rows.push(["Registration Fee", inr(b.registrationFee)]);
    if (b.transportTotal > 0) rows.push(["Transport", inr(b.transportTotal)]);
    if (b.messTotal > 0) rows.push([`Mess Fee${b.messIsLumpSum ? " (Lump Sum)" : ""}`, inr(b.messTotal)]);
    if (b.referralDeduction > 0) rows.push(["Referral Deduction", `−${inr(b.referralDeduction)}`]);
    if (b.depositCredited > 0) rows.push(["Deposit Credited", `−${inr(b.depositCredited)}`]);
    rows.push(["Total Amount", inr(data.amount)]);

    breakdownHtml = `
      <table class="breakdown">
        <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          ${rows.map(([l, v], i) => `
            <tr class="${i === rows.length - 1 ? "total-row" : ""}">
              <td>${l}</td>
              <td style="text-align:right">${v}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } else if (!isPayment) {
    const rows: [string, string][] = [
      ["Security Deposit", inr(data.depositAmount ?? 15000)],
    ];
    if ((data.registrationFee ?? 0) > 0) rows.push(["Registration Fee (Non-refundable)", inr(data.registrationFee)]);
    if ((data.advanceAmount ?? 0) > 0) rows.push(["Advance Payment", inr(data.advanceAmount)]);
    rows.push(["Total Paid", inr(data.totalPaidAtDeposit ?? data.amount)]);

    breakdownHtml = `
      <table class="breakdown">
        <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          ${rows.map(([l, v], i) => `
            <tr class="${i === rows.length - 1 ? "total-row" : ""}">
              <td>${l}</td>
              <td style="text-align:right">${v}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  const modeLabel = data.paymentMode === "full" ? "Full Tenure (40% Discount)"
    : data.paymentMode === "half" ? "Half Yearly (25% Discount)"
    : data.paymentMode === "deposit" ? "Deposit Only"
    : "—";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} — VIRAMAH</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      color: #1F3A2D;
      background: #fff;
      padding: 40px;
      max-width: 700px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1F3A2D;
      padding-bottom: 20px;
      margin-bottom: 28px;
    }
    .brand h1 {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #1F3A2D;
      letter-spacing: 2px;
    }
    .brand p {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #9a7a3a;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-top: 4px;
    }
    .receipt-type {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #9a7a3a;
      border: 2px solid #D8B56A;
      padding: 6px 16px;
      border-radius: 4px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
      background: #f8f7f4;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid rgba(31,58,45,0.08);
    }
    .meta-item label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(31,58,45,0.45);
      display: block;
      margin-bottom: 4px;
    }
    .meta-item span {
      font-size: 13px;
      font-weight: 600;
    }
    .meta-item.mono span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .breakdown {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .breakdown th {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(31,58,45,0.5);
      border-bottom: 2px solid rgba(31,58,45,0.12);
      padding: 8px 0;
      text-align: left;
    }
    .breakdown td {
      padding: 10px 0;
      font-size: 13px;
      border-bottom: 1px solid rgba(31,58,45,0.06);
    }
    .breakdown .total-row td {
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #1F3A2D;
      border-bottom: none;
      padding-top: 12px;
    }
    .status-badge {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 4px;
    }
    .status-approved, .status-active { background: rgba(22,163,74,0.1); color: #16a34a; }
    .status-pending, .status-pending_approval { background: rgba(245,158,11,0.1); color: #d97706; }
    .status-rejected, .status-expired { background: rgba(220,38,38,0.08); color: #dc2626; }
    .status-converted { background: rgba(22,163,74,0.1); color: #16a34a; }
    .amount-highlight {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      color: #1F3A2D;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(31,58,45,0.1);
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: rgba(31,58,45,0.4);
      letter-spacing: 1px;
    }
    .footer p { margin-bottom: 4px; }
    @media print {
      body { padding: 20px; }
      @page { margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>VIRAMAH</h1>
      <p>Student Living</p>
    </div>
    <span class="receipt-type">${title}</span>
  </div>

  <div class="amount-highlight">${inr(data.amount)}</div>

  <div class="meta-grid">
    ${data.paymentId ? `<div class="meta-item mono"><label>${isPayment ? "Payment ID" : "Hold ID"}</label><span>${data.paymentId}</span></div>` : ""}
    <div class="meta-item mono">
      <label>Transaction ID</label>
      <span>${data.transactionId || "N/A"}</span>
    </div>
    <div class="meta-item">
      <label>Date</label>
      <span>${fmtDate(data.date)}</span>
    </div>
    <div class="meta-item">
      <label>Status</label>
      <span class="status-badge status-${data.status}">${data.status.replace("_", " ")}</span>
    </div>
    ${data.paymentMode ? `<div class="meta-item"><label>Payment Plan</label><span>${modeLabel}</span></div>` : ""}
    ${data.roomType ? `<div class="meta-item"><label>Room Type</label><span>${data.roomType}</span></div>` : ""}
    ${isPayment && data.installmentNumber ? `<div class="meta-item"><label>Installment</label><span>#${data.installmentNumber}</span></div>` : ""}
  </div>

  ${breakdownHtml}

  <div class="footer">
    <p>This is a computer-generated receipt and does not require a signature.</p>
    <p>VIRAMAH Student Living Pvt Ltd · Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=800,height=900");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }
}

export type { PrintReceiptData };
