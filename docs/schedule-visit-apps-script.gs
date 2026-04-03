/**
 * Viramah Schedule Visit Webhook — Google Apps Script
 * ===================================================
 *
 * HOW TO DEPLOY:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete ALL existing code and paste this entire file
 * 3. Click the floppy disk icon (Save) or Ctrl+S
 * 4. Click Deploy → New deployment (NOT "Manage deployments")
 * 5. Click the gear icon next to "Select type" → choose "Web app"
 * 6. Set:
 *      - Description: "Viramah Schedule Visit v2"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"   ← CRITICAL! Not "Anyone with Google account"
 * 7. Click Deploy → Authorize access → choose your Google account
 * 8. On the "Google hasn't verified this app" screen:
 *      → Click "Advanced" → "Go to Viramah (unsafe)" → Allow
 * 9. Copy the Web app URL (ends in /exec)
 * 10. Set GOOGLE_SHEET_SCHEDULE_VISIT_URL in your hosting env vars (Vercel/Amplify)
 * 11. REDEPLOY your Next.js app (env vars are baked at build time)
 *
 * IMPORTANT: Every time you edit this code, you must create a NEW deployment
 * (Deploy → New deployment), not just save. The old URL keeps running old code.
 *
 * TEST: Paste this in your browser (replace YOUR_URL):
 *   YOUR_URL?fullName=Test&email=test@test.com&mobile=9999999999&visitDate=2026-04-10&timeSlot=10:00 AM&guests=1
 *   → Should return {"success":true,...} and add a row to the sheet.
 *
 * SHEET COLUMNS:
 *   A: Timestamp | B: Full Name | C: Email | D: Mobile
 *   E: Visit Date | F: Time Slot | G: Guests | H: Submitted At
 *   I: Source Page | J: IP | K: Status
 */

// ── Configuration ───────────────────────────────────────────────
var CONFIG = {
  sheetName: "Schedule Visits",
  emailCol: 3,       // Column C
  dateCol: 5,        // Column E
  totalCols: 11,     // A through K
};

// ── Entry Points ────────────────────────────────────────────────
// Apps Script calls doGet for GET requests, doPost for POST.
// Our Next.js route sends GET with query params (most reliable).

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

// ── Core Request Handler ────────────────────────────────────────
function handleRequest(e) {
  try {
    // 1. Extract data from all possible sources
    var data = extractData(e);

    // 2. Validate required fields
    var email = sanitize(data.email).toLowerCase();
    var visitDate = sanitize(data.visitDate);

    if (!email) {
      return jsonResponse({ success: false, error: "Email is required." });
    }
    if (!visitDate) {
      return jsonResponse({ success: false, error: "Visit date is required." });
    }

    // 3. Get or create the sheet
    var sheet = getOrCreateSheet();

    // 4. Check for duplicate (same email + same date)
    if (isDuplicate(sheet, email, visitDate)) {
      return jsonResponse({
        success: false,
        duplicate: true,
        message: "already_scheduled",
      });
    }

    // 5. Append the new booking
    var timestamp = Utilities.formatDate(
      new Date(),
      "Asia/Kolkata",
      "dd MMM yyyy, hh:mm a"
    );

    sheet.appendRow([
      timestamp,                          // A: Timestamp
      sanitize(data.fullName),            // B: Full Name
      email,                              // C: Email
      sanitize(data.mobile),              // D: Mobile
      visitDate,                          // E: Visit Date
      sanitize(data.timeSlot),            // F: Time Slot
      sanitize(data.guests) || "1",       // G: Guests
      sanitize(data.submittedAt),         // H: Submitted At
      sanitize(data.sourcePage),          // I: Source Page
      sanitize(data.ip),                  // J: IP
      "Pending",                          // K: Status
    ]);

    // 6. Auto-resize columns for readability
    try { sheet.autoResizeColumns(1, CONFIG.totalCols); } catch (_) {}

    return jsonResponse({
      success: true,
      message: "Visit scheduled successfully.",
      booking: {
        name: sanitize(data.fullName),
        email: email,
        date: visitDate,
        time: sanitize(data.timeSlot),
      },
    });

  } catch (err) {
    // Log error for debugging in Apps Script dashboard
    Logger.log("ERROR: " + err.message + "\n" + err.stack);
    return jsonResponse({
      success: false,
      error: "Server error: " + err.message,
    });
  }
}

// ── Extract data from request (query params + POST body) ────────
function extractData(e) {
  var data = {};

  // Source 1: Query parameters (most reliable — survives redirects)
  if (e && e.parameter) {
    var params = e.parameter;
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        data[key] = params[key];
      }
    }
  }

  // Source 2: POST JSON body (may be available in doPost)
  if (e && e.postData && e.postData.contents) {
    try {
      var bodyData = JSON.parse(e.postData.contents);
      for (var key in bodyData) {
        if (bodyData.hasOwnProperty(key)) {
          // POST body overwrites query params (more authoritative)
          data[key] = bodyData[key];
        }
      }
    } catch (_) {
      // Not valid JSON — ignore, query params are enough
    }
  }

  return data;
}

// ── Sanitize input ──────────────────────────────────────────────
function sanitize(val) {
  if (val === undefined || val === null) return "";
  return String(val).trim();
}

// ── Duplicate check (same email + same visit date) ──────────────
function isDuplicate(sheet, email, visitDate) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Only header row exists

  // Read email and date columns in one batch (faster than cell-by-cell)
  var range = sheet.getRange(2, CONFIG.emailCol, lastRow - 1, CONFIG.dateCol - CONFIG.emailCol + 1);
  var values = range.getValues();

  for (var i = 0; i < values.length; i++) {
    var rowEmail = String(values[i][0]).trim().toLowerCase();
    var rowDate = String(values[i][CONFIG.dateCol - CONFIG.emailCol]).trim();
    if (rowEmail === email && rowDate === visitDate) {
      return true;
    }
  }
  return false;
}

// ── Get or create the "Schedule Visits" sheet tab ───────────────
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);
    var headers = [
      "Timestamp", "Full Name", "Email", "Mobile",
      "Visit Date", "Time Slot", "Guests", "Submitted At",
      "Source Page", "IP", "Status"
    ];
    sheet.appendRow(headers);

    // Style the header row — Viramah brand
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1F3A2D");
    headerRange.setFontColor("#D8B56A");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);

    // Set column widths for better readability
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 160); // Full Name
    sheet.setColumnWidth(3, 200); // Email
    sheet.setColumnWidth(5, 120); // Visit Date
    sheet.setColumnWidth(6, 100); // Time Slot
  }

  return sheet;
}

// ── Return JSON response with proper CORS-safe content type ─────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
