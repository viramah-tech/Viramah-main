/**
 * Standardized receipt HTML generator for all payment receipts across Viramah.
 * Used by: student/payment, payment-status, deposit-status pages.
 */

export interface ReceiptData {
  /** Student/payer full name */
  payerName: string;
  /** Viramah User ID */
  userId: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Payment description/category label (e.g. "Room Rent Settlement", "Booking Deposit Settlement") */
  description: string;
  /** Transaction ID / UTR reference */
  transactionId: string;
  /** Payment method (e.g. "UPI", "Bank Transfer") */
  method: string;
  /** Amount paid */
  amount: number;
  /** Receipt number (e.g. "REC-A1B2C3") */
  receiptNo: string;
  /** Date payment was submitted */
  dateSubmitted: string;
  /** Date payment was settled/approved */
  dateSettled: string;
}

/**
 * Generates a complete, self-contained HTML document for a payment receipt.
 * Opens in a new window and auto-triggers print.
 */
export function generateReceiptHtml(data: ReceiptData): string {
  const formattedAmount = `₹${data.amount.toLocaleString('en-IN')}`;

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${data.transactionId || data.receiptNo}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #2E2A26;
            margin: 40px;
            line-height: 1.5;
            background-color: #faf9f6;
        }
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #E8E5DF;
            border-radius: 24px;
            padding: 45px;
            background: #fff;
            box-shadow: 0 10px 30px rgba(31,58,45,0.03);
            position: relative;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #1F3A2D;
            padding-bottom: 25px;
            margin-bottom: 30px;
        }
        .logo-section h1 {
            font-family: Georgia, serif;
            color: #1F3A2D;
            margin: 0;
            font-size: 32px;
            letter-spacing: 0.5px;
            font-weight: normal;
        }
        .logo-section p {
            margin: 6px 0 0 0;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #D8B56A;
            font-weight: bold;
        }
        .receipt-title {
            text-align: right;
        }
        .receipt-title h2 {
            margin: 0;
            color: #1F3A2D;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .receipt-title p {
            margin: 6px 0 0 0;
            font-family: monospace;
            font-size: 11px;
            color: #7A7570;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 50px;
            margin-bottom: 40px;
        }
        .details-block h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #7A7570;
            border-bottom: 1px solid #E8E5DF;
            padding-bottom: 8px;
            margin-bottom: 14px;
            font-weight: bold;
        }
        .details-block p {
            margin: 6px 0;
            font-size: 13.5px;
        }
        .details-block .value {
            font-weight: 700;
            color: #1F3A2D;
        }
        .table-section {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .table-section th {
            background: #F6F4EF;
            color: #1F3A2D;
            text-align: left;
            padding: 14px 18px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border-bottom: 1px solid #E8E5DF;
            font-weight: bold;
        }
        .table-section td {
            padding: 18px;
            font-size: 14px;
            border-bottom: 1px solid #E8E5DF;
            color: #2E2A26;
        }
        .amount-row td {
            font-size: 18px;
            font-weight: bold;
            color: #1F3A2D;
            background: #fdfdfb;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 75px;
            color: rgba(16, 185, 129, 0.08);
            border: 6px double rgba(16, 185, 129, 0.08);
            padding: 8px 25px;
            font-weight: 800;
            text-transform: uppercase;
            pointer-events: none;
            border-radius: 16px;
            letter-spacing: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 11px;
            color: #7A7570;
            border-top: 1px dashed #E8E5DF;
            padding-top: 25px;
            line-height: 1.6;
        }
        @media print {
            body {
                margin: 0;
                background-color: #fff;
            }
            .receipt-container {
                border: none;
                box-shadow: none;
                padding: 0;
            }
            .watermark {
                color: rgba(16, 185, 129, 0.12) !important;
                border-color: rgba(16, 185, 129, 0.12) !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none;
            }
        }
        .print-btn-container {
            text-align: right;
            margin-bottom: 20px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .print-btn {
            background: #1F3A2D;
            color: #F6F4EF;
            border: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
            letter-spacing: 0.5px;
        }
        .print-btn:hover {
            background: #15271e;
        }
    </style>
</head>
<body>
    <div class="print-btn-container no-print">
        <button class="print-btn" onclick="window.print()">Print Receipt / Save PDF</button>
    </div>
    <div class="receipt-container">
        <div class="watermark">PAID</div>
        <div class="header">
            <div class="logo-section">
                <h1>VIRAMAH</h1>
                <p>Premium Student Living</p>
            </div>
            <div class="receipt-title">
                <h2>PAYMENT RECEIPT</h2>
                <p>Receipt No: ${data.receiptNo}</p>
            </div>
        </div>

        <div class="details-grid">
            <div class="details-block">
                <h3>PAID BY</h3>
                <p><span class="value">${data.payerName}</span></p>
                <p>User ID: ${data.userId}</p>
                <p>Email: ${data.email}</p>
                <p>Phone: ${data.phone}</p>
            </div>
            <div class="details-block">
                <h3>PAID TO</h3>
                <p><span class="value">VIRAMAH STAY</span></p>
                <p>Premium Student Living</p>
                <p>Krishna Valley, Jait, Vrindavan</p>
                <p>Uttar Pradesh, India — 281406</p>
            </div>
        </div>

        <table class="table-section">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Transaction Ref (UTR)</th>
                    <th>Payment Method</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${data.description}</td>
                    <td><code style="font-family: monospace; font-size: 13px; font-weight: bold; color: #1F3A2D;">${data.transactionId || "-"}</code></td>
                    <td style="text-transform: uppercase;">${data.method || "-"}</td>
                    <td style="text-align: right; font-weight: bold;">${formattedAmount}</td>
                </tr>
                <tr class="amount-row">
                    <td colspan="3" style="text-align: right; font-weight: bold; border-top: 2px solid #1F3A2D;">Total Paid:</td>
                    <td style="text-align: right; font-weight: bold; border-top: 2px solid #1F3A2D;">${formattedAmount}</td>
                </tr>
            </tbody>
        </table>

        <div class="details-grid" style="margin-bottom: 20px;">
            <div class="details-block">
                <h3>TRANSACTION TIMELINE</h3>
                <p>Submitted: <span class="value">${data.dateSubmitted}</span></p>
                <p>Settled/Approved: <span class="value">${data.dateSettled}</span></p>
            </div>
            <div class="details-block" style="text-align: right; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end;">
                <div style="border-top: 1px solid #2E2A26; width: 180px; padding-top: 6px; font-size: 11px; text-align: center; color: #7A7570;">
                    Authorized Signatory
                    <br><span style="font-weight: bold; color: #1F3A2D; font-family: Georgia, serif;">VIRAMAH ACCOUNTS</span>
                </div>
            </div>
        </div>

        <div class="footer">
            This is a computer-generated document and does not require a physical signature.<br>
            Thank you for choosing Viramah Stay! For queries, contact support@viramahstay.com
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

/**
 * Opens a new browser window and writes the receipt HTML to it.
 * Returns false if popup was blocked.
 */
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
