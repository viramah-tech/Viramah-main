/**
 * Viramah Enquiry Webhook — Google Apps Script
 *
 * HOW TO DEPLOY:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Delete any existing code and paste this entire file
 * 3. Click Deploy → Manage deployments → edit → New version → Deploy
 * 4. Copy the deployment URL → GOOGLE_SHEET_WEBHOOK_URL in .env / Amplify
 */

const SHEET_NAME  = "Enquiries"; // Sheet tab name
const EMAIL_COL   = 3;           // Column C = Email (1-indexed). Adjust if your layout differs.

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
    let data = {};

    // 1. Try JSON body (doPost)
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (_) {}
    }
    // 2. Merge query params (covers doGet fallback & any extra fields)
    if (e.parameter) {
      data = Object.assign({}, e.parameter, data);
    }

    const email = (data.email || "").trim().toLowerCase();
    if (!email) {
      return json({ success: false, error: "Email is required." });
    }

    const sheet = getOrCreateSheet();

    // ── Duplicate check ──────────────────────────────────────────
    if (isDuplicate(sheet, email)) {
      return json({
        success:   false,
        duplicate: true,
        message:   "already_enquired",
      });
    }

    // ── Save new lead ────────────────────────────────────────────
    sheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      data.fullName    || "",
      data.email       || "",
      data.mobile      || "",
      data.city        || "",
      data.state       || "",
      data.country     || "",
      data.role        || "",
      data.submittedAt || "",
      data.sourcePage  || "",
      data.ip          || "",
    ]);

    return json({ success: true, message: "Lead saved." });

  } catch (err) {
    return json({ success: false, error: err.message });
  }
}

// ── Check if the email already exists in the sheet ───────────────
function isDuplicate(sheet, email) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false; // Only header row — no leads yet

  // Get all values in the Email column (column C = index 3)
  const emailRange    = sheet.getRange(2, EMAIL_COL, lastRow - 1, 1);
  const existingEmails = emailRange.getValues().flat();

  return existingEmails.some(
    (e) => String(e).trim().toLowerCase() === email
  );
}

// ── Get the Enquiries sheet, create it with headers if missing ────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "Timestamp", "Full Name", "Email", "Mobile",
      "City", "State", "Country", "Role", "Submitted At", "Source Page", "IP"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  return sheet;
}

// ── Helper: return JSON response ──────────────────────────────────
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
