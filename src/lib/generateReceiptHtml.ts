/**
 * Standardized receipt HTML generator for all payment receipts across Viramah.
 * Provides a 100% visual and structural match to the admin portal standard fee receipt.
 */

export interface ReceiptTransaction {
  date?: string;
  category?: string;
  paymentType?: string;
  method?: string;
  transactionId?: string;
  receiptNumber?: string;
  status?: string;
  amount?: number;
  rejectionReason?: string;
}

export interface ReceiptData {
  payerName: string;
  userId: string;
  email: string;
  phone: string;
  roomNumber?: string;
  roomType?: string;
  paymentPlan?: string;
  description: string;
  transactionId: string;
  method: string;
  amount: number;
  status?: string;
  rejectionReason?: string;
  receiptNo: string;
  dateSubmitted: string;
  dateSettled?: string;
  transactions?: ReceiptTransaction[];
  isFullyPaid?: boolean;
}

function numberToWordsINR(num: number): string {
  if (!num || num === 0) return 'Zero Rupees Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }
  
  return `Rupees ${inWords(Math.floor(num)).trim()} Only`;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function generateReceiptHtml(data: ReceiptData): string {
  const formattedAmount = formatCurrency(data.amount);
  const amountWords = numberToWordsINR(data.amount);
  const currentDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  
  const statusStr = (data.status || 'pending').toLowerCase();
  const isApproved = ['approved', 'completed', 'confirmed', 'paid'].includes(statusStr);
  const isRejected = ['rejected', 'cancelled', 'failed', 'declined', 'revoked'].includes(statusStr);

  const overallPaid = data.isFullyPaid || isApproved;

  const statusBadgeHtml = isApproved
    ? '<span style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">CONFIRMED & VERIFIED ✓</span>'
    : isRejected
    ? `<span style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">REJECTED ✗</span>`
    : '<span style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:10px; text-transform:uppercase;">PENDING ⏳</span>';

  const txnRowsHtml = (data.transactions && data.transactions.length > 0)
    ? data.transactions.map((tx) => {
        const txSt = (tx.status || 'pending').toLowerCase();
        const txApp = ['approved', 'completed', 'confirmed', 'paid'].includes(txSt);
        const txRej = ['rejected', 'cancelled', 'failed', 'declined', 'revoked'].includes(txSt);

        const badge = txApp
          ? '<span style="background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:9px; text-transform:uppercase;">APPROVED ✓</span>'
          : txRej
          ? `<span style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:9px; text-transform:uppercase;">REJECTED ✗</span>`
          : '<span style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:9px; text-transform:uppercase;">PENDING ⏳</span>';

        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; border: 1px solid #d1d5db;">${tx.date || data.dateSubmitted || '—'}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; text-transform: capitalize;">${(tx.category || tx.paymentType || 'Payment').replace(/_/g, ' ')}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; text-transform: uppercase; font-weight: 500;">${tx.method || data.method || '—'}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db; font-family: monospace; font-size: 11px;">${tx.transactionId || tx.receiptNumber || data.transactionId || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #d1d5db;">
              ${badge}
              ${txRej && tx.rejectionReason ? `<div style="color:#dc2626; font-size:9px; margin-top:2px;">(${tx.rejectionReason})</div>` : ''}
            </td>
            <td style="padding: 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-family: monospace; ${txRej ? 'text-decoration: line-through; color: #b91c1c;' : ''}">
              ₹${(tx.amount || 0).toLocaleString('en-IN')}
            </td>
          </tr>
        `;
      }).join('')
    : `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; border: 1px solid #d1d5db;">${data.dateSubmitted || currentDateStr}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-transform: capitalize;">${data.description}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-transform: uppercase; font-weight: 500;">${data.method || '—'}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db; font-family: monospace; font-size: 11px;">${data.transactionId || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #d1d5db;">
          ${statusBadgeHtml}
          ${isRejected && data.rejectionReason ? `<div style="color:#dc2626; font-size:9px; margin-top:2px;">(${data.rejectionReason})</div>` : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; font-family: monospace; ${isRejected ? 'text-decoration: line-through; color: #b91c1c;' : ''}">
          ${formattedAmount}
        </td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Standard Fee Receipt - ${data.receiptNo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #fff;
            margin: 0;
            padding: 32px 24px;
        }
        .receipt-card {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 32px;
            background: #fff;
            position: relative;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #111827;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }
        .logo-box {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo-box img {
            width: 48px;
            height: 48px;
            object-fit: contain;
        }
        .brand-name {
            font-size: 26px;
            font-weight: 800;
            color: #1F3A2D;
            letter-spacing: -0.5px;
            line-height: 1;
        }
        .brand-tagline {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #D8B56A;
            margin-top: 3px;
        }
        .brand-address {
            font-size: 11px;
            color: #4b5563;
            margin-top: 4px;
        }
        .badge-box {
            display: inline-block;
            padding: 4px 10px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 16px;
            background: #fafafa;
        }
        .grid-section-title {
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }
        .grid-content p {
            font-size: 12px;
            color: #374151;
            margin-bottom: 4px;
        }
        .payment-box {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 20px;
            background: #fafafa;
            margin-bottom: 24px;
        }
        .table-log {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 24px;
        }
        .table-log th {
            background: #f3f4f6;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: bold;
            padding: 10px 8px;
            border: 1px solid #d1d5db;
            text-align: left;
            color: #374151;
        }
        .stamp-seal {
            border: 2px solid ${overallPaid ? '#15803d' : '#1F3A2D'};
            color: ${overallPaid ? '#15803d' : '#1F3A2D'};
            background: ${overallPaid ? '#f0fdf4' : '#f9fafb'};
            border-radius: 8px;
            padding: 8px 16px;
            text-align: center;
            transform: rotate(-3deg);
            display: inline-block;
        }
        @media print {
            body { padding: 0; background: #fff; }
            .receipt-card { border: none; padding: 0; }
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div style="text-align: right; max-width: 800px; margin: 0 auto 16px;" class="no-print">
        <button onclick="window.print()" style="background: #1F3A2D; color: #fff; border: none; padding: 10px 22px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px; shadow: 0 4px 12px rgba(0,0,0,0.1);">
          🖨️ Print / Save PDF Receipt
        </button>
    </div>

    <div class="receipt-card">
        <!-- Header Section -->
        <div class="header">
            <div class="logo-box">
                <img src="/logo.png" alt="Viramah Logo" onerror="this.style.display='none'" />
                <div>
                    <div class="brand-name">VIRAMAH STAY</div>
                    <div class="brand-tagline">Luxury Student Living & Managed Residences</div>
                    <div class="brand-address">Krishna Valley, Jait, Vrindavan, Uttar Pradesh – 281406</div>
                    <div class="brand-address">Email: contact@viramahstay.com | Web: viramahstay.com</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div class="badge-box">Standard Fee Receipt</div>
                <div style="font-size: 12px; font-weight: 600; color: #111827;">Receipt No: <span style="font-family: monospace; font-weight: bold; color: #111827;">${data.receiptNo}</span></div>
                <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Date: ${currentDateStr}</div>
            </div>
        </div>

        <!-- Resident & Accommodation Details Grid -->
        <div class="summary-grid">
            <div class="grid-content">
                <div class="grid-section-title">Received From (Resident Name)</div>
                <p style="font-weight: bold; font-size: 14px; color: #111827; margin-bottom: 6px;">${data.payerName}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Student ID:</span> ${data.userId}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Phone:</span> ${data.phone || 'N/A'}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Email:</span> ${data.email || 'N/A'}</p>
            </div>
            <div class="grid-content" style="border-left: 1px solid #e5e7eb; padding-left: 16px;">
                <div class="grid-section-title">Room & Occupancy Details</div>
                <p style="font-weight: bold; font-size: 14px; color: #111827; margin-bottom: 6px;">Room ${data.roomNumber || 'Allocated Room'}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Room Type:</span> ${data.roomType || 'Standard Co-Living'}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Payment Plan:</span> ${data.paymentPlan || 'Standard Plan'}</p>
                <p><span style="font-weight: 600; color: #4b5563;">Overall Account:</span> 
                  <span style="font-weight: bold; color: ${overallPaid ? '#15803d' : '#b45309'}; margin-left: 4px;">
                    ${overallPaid ? 'Fully Paid ✓' : 'Partially Paid / Pending'}
                  </span>
                </p>
            </div>
        </div>

        <!-- Clean Payment Summary Box -->
        <div class="payment-box">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <div>
                    <span style="font-size: 10px; font-family: monospace; color: #6b7280; text-transform: uppercase;">Payment Description / Purpose:</span>
                    <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 2px; letter-spacing: 0.5px;">RESIDENCE & ACCOMMODATION PAYMENT</h3>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 10px; font-family: monospace; color: #15803d; font-weight: bold; text-transform: uppercase;">Status</span>
                    <div style="margin-top: 3px;">${statusBadgeHtml}</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                <span style="font-size: 13px; font-weight: bold; color: #111827; text-transform: uppercase;">TOTAL AMOUNT RECEIVED</span>
                <span style="font-size: 24px; font-family: monospace; font-weight: 800; color: #1F3A2D;">${formattedAmount}</span>
            </div>

            <div style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 12px;">
                <span style="font-size: 10px; font-family: monospace; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 2px;">Amount Received in Words:</span>
                <span style="font-weight: bold; color: #111827; font-size: 13px;">${amountWords}</span>
            </div>
        </div>

        <!-- Transaction Records Table -->
        <div>
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px;">
                Payment Transactions History Log
            </div>
            <table class="table-log">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Payment Mode</th>
                        <th>Txn ID / Ref</th>
                        <th>Status</th>
                        <th style="text-align: right;">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${txnRowsHtml}
                </tbody>
            </table>
        </div>

        <!-- Footer & Stamp Section -->
        <div style="border-top: 1px solid #d1d5db; padding-top: 16px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 4px;">Terms & Conditions:</p>
                <ol style="font-size: 9px; color: #6b7280; padding-left: 14px; line-height: 1.5;">
                    <li>Receipt is valid subject to realization of online funds transfer / cash.</li>
                    <li>Security deposit refund is governed by the Leave & License Agreement terms.</li>
                    <li>This is an official computer-generated receipt from Viramah Stay Administration.</li>
                </ol>
            </div>

            <div style="text-align: right;">
                <div class="stamp-seal">
                    <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${overallPaid ? 'PAID & VERIFIED' : 'AUTHORIZED'}</div>
                    <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 2px;">Viramah Stay Accounts</div>
                    <div style="font-size: 8px; font-family: monospace; margin-top: 2px;">${currentDateStr}</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; border-top: 1px dashed #e5e7eb; padding-top: 10px;">
            Official Fee Receipt • VIRAMAH STAY • Computer Generated Document
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;
}

export function openReceiptWindow(data: ReceiptData): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    return false;
  }
  const html = generateReceiptHtml(data);
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}
