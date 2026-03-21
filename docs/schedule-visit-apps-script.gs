/**
 * Viramah Schedule Visit Webhook — Google Apps Script
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Delete any existing code and paste this entire file
 * 3. Click Deploy → Manage deployments → New deployment
 * 4. Select "Web app" → Execute as "Me" → Access "Anyone"
 * 5. Click Deploy → Copy the deployment URL
 * 6. Paste the URL into GOOGLE_SHEET_SCHEDULE_VISIT_URL in .env / Amplify
 *
 * SHEET COLUMNS:
 *   A: Timestamp | B: Full Name | C: Email | D: Mobile
 *   E: Visit Date | F: Time Slot | G: Guests | H: Submitted At
 *   I: Source Page | J: IP
 */

const SHEET_NAME = "Schedule Visits"; // Sheet tab name
const EMAIL_COL  = 3;                 // Column C = Email (1-indexed)
const DATE_COL   = 5;                 // Column E = Visit Date

// ── doPost — primary entry point ─────────────────────────────────
function doPost(e) {
  return handleRequest(e);
}

// ── doGet — fallback (POST→GET redirect from Node.js / Lambda) ───
function doGet(e) {
  return handleRequest(e);
}

// ── Core handler ─────────────────────────────────────────────────
function handleRequest(e) {
  try {
    var data = {};

    // 1. Try JSON body (doPost)
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) {}
    }
    // 2. Merge query params (covers doGet fallback & any extra fields)
    if (e.parameter) {
      data = Object.assign({}, e.parameter, data);
    }

    var email = (data.email || "").trim().toLowerCase();
    if (!email) {
      return json({ success: false, error: "Email is required." });
    }

    var visitDate = (data.visitDate || "").trim();
    if (!visitDate) {
      return json({ success: false, error: "Visit date is required." });
    }

    var sheet = getOrCreateSheet();

    // ── Duplicate check (same email + same date) ──────────────────
    if (isDuplicate(sheet, email, visitDate)) {
      return json({
        success:   false,
        duplicate: true,
        message:   "already_scheduled",
      });
    }

    // ── Save new booking ──────────────────────────────────────────
    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.fullName    || "",
      data.email       || "",
      data.mobile      || "",
      data.visitDate   || "",
      data.timeSlot    || "",
      data.guests      || "1",
      data.submittedAt || "",
      data.sourcePage  || "",
      data.ip          || "",
    ]);

    return json({ success: true, message: "Visit scheduled." });

  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

// ── Check if the email + date already exists in the sheet ─────────
function isDuplicate(sheet, email, visitDate) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Only header row — no bookings yet

  var emailRange = sheet.getRange(2, EMAIL_COL, lastRow - 1, 1);
  var dateRange  = sheet.getRange(2, DATE_COL, lastRow - 1, 1);

  var existingEmails = emailRange.getValues().flat();
  var existingDates  = dateRange.getValues().flat();

  for (var i = 0; i < existingEmails.length; i++) {
    if (
      String(existingEmails[i]).trim().toLowerCase() === email &&
      String(existingDates[i]).trim() === visitDate
    ) {
      return true;
    }
  }
  return false;
}

// ── Get the Schedule Visits sheet, create it with headers if missing ─
function getOrCreateSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    var headers = [
      "Timestamp", "Full Name", "Email", "Mobile",
      "Visit Date", "Time Slot", "Guests", "Submitted At",
      "Source Page", "IP"
    ];
    sheet.appendRow(headers);

    // Bold + freeze the header row — Viramah brand colors
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1F3A2D");
    headerRange.setFontColor("#D8B56A");
    sheet.setFrozenRows(1);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

// ── Helper: return JSON response ──────────────────────────────────
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
