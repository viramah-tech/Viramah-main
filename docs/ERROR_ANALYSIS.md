# Viramah Website - Error & Gap Analysis

> **Document Created:** February 10, 2026
> **Purpose:** Detailed breakdown of critical integration gaps, potential runtime errors, and deployment risks in the current codebase.

---

## 🚨 Critical Functional Errors (Must Fix)

These errors will cause the application to crash or fail during standard user flows.

### 1. Room Booking ID Mismatch (Foreign Key Violation)

**Severity:** Critical
**Location:** `src/app/user-onboarding/step-3/page.tsx` vs `supabase/migrations/002_rooms_and_bookings.sql`

- **The Issue:**
  - The **Frontend** uses hardcoded mock data with string IDs (e.g., `'101'`, `'201'`).
  - The **Backend** `rooms` table defines `id` as `BIGSERIAL` (integer) and is currently **empty**.
- **The Error:**
  - When a user submits a booking, the Server Action `saveRoomSelection` tries to insert `room_id: 101`.
  - PostgreSQL rejects this because ID `101` violates the Foreign Key constraint `bookings_room_id_fkey` (key (room_id)=(101) is not present in table "rooms").
- **Resolution:**
    1. **Seed Database:** Populate `rooms` table with data matching the frontend mock structure.
    2. **Frontend Update:** Refactor `Step3Page` to fetch rooms via a Server Action or Supabase Client instead of using `MOCK_ROOMS`.

### 2. Mess Package ID Mismatch

**Severity:** Critical
**Location:** `src/app/user-onboarding/step-3/page.tsx` vs `supabase/migrations/002_rooms_and_bookings.sql`

- **The Issue:**
  - **Frontend:** Uses string IDs `'full'` and `'partial'`.
  - **Backend:** `mess_packages.id` is `BIGSERIAL` (integer).
- **The Error:**
  - `parseInt('full')` returns `NaN`.
  - Database insertion fails: `mess_package_id` must be an integer.
- **Resolution:**
  - Seed `mess_packages` with IDs `1` (Full Board) and `2` (Partial Board).
  - Update frontend to send `1` or `2`.

### 3. Missing Parent-Student Links

**Severity:** Major (Blocker for Parent Portal)
**Location:** `src/app/actions/dashboard.ts` -> `getLinkedStudents`

- **The Issue:**
  - The Parent Dashboard relies on the `parent_student_links` table to find which students belong to a parent.
  - There is **no UI or flow** to create these links.
- **The Result:**
  - A logged-in parent sees an empty dashboard (`getLinkedStudents` returns `[]`).
  - `scheduleVisit` fails because it cannot verify the relationship.
- **Resolution:**
  - **Short Term:** Manually insert links in Supabase Dashboard.
  - **Long Term:** Build an "Invite Student" or "Enter Student Code" flow for parents.

---

## ⚠️ Potential Runtime & Logic Errors

These may not crash the app immediately but will cause incorrect behavior.

### 4. Middleware / Proxy Conflicts

**Severity:** Moderate
**Location:** `src/proxy.ts`

- **The Risk:** Next.js 16 changed middleware conventions. We currently use `src/proxy.ts`. If any old `middleware.ts` file remains or is reintroduced, Next.js will throw a "Duplicate Middleware" build error.
- **Status:** Resolved (Audit confirmed `middleware.ts` removal), but developers must be aware to only edit `proxy.ts`.

### 5. Google OAuth in Production

**Severity:** High (Deployment)
**Location:** `src/app/auth/actions.ts`

- **The Risk:** `signInWithOAuth` redirects to `http://localhost:3000/auth/callback` by default if not strictly configured.
- **The Error:** In production (Vercel), this will redirect users back to `localhost`, breaking the login flow.
- **Resolution:**
  - Use `process.env.NEXT_PUBLIC_SITE_URL` for the redirect URL.
  - Whitelist the production domain in Supabase Auth settings.
  - Whitelist the standard Supabase callback URL in Google Cloud Console.

### 6. Storage Bucket Permissions

**Severity:** Moderate
**Location:** `supabase/migrations/006_storage_buckets.sql`

- **The Risk:** If a user tries to upload a file *before* their `users` table record is fully committed (race condition in signup flow), the RLS policy checking `auth.uid()` might fail if the session isn't fully established.
- **Status:** Unlikely due to the `await` patterns in `actions.ts`, but worth monitoring.

### 7. Wallet Top-Up Concurrency

**Severity:** Low (Edge Case)
**Location:** `src/app/actions/dashboard.ts` -> `topUpWallet`

- **The Risk:** While we use an RPC `topup_wallet` for atomicity, extremely rapid double-clicks on the frontend "Add Funds" button could trigger two requests.
- **Resolution:** Ensure the frontend button has a `disabled={isSubmitting}` state (Currently implemented ✅).

---

## 🛠 Deployment & Environment Errors

### 8. Missing Environment Variables

**Severity:** Critical
**Check:** `src/app/test-supabase/page.tsx`

- **Required Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Optional, for admin scripts)
- **Consequence:** App will render but all data fetching and auth will fail silently or throw 500 errors.

### 9. Unapplied Migrations

**Severity:** Critical

- **The Risk:** If the 6 migration files in `supabase/migrations/` are not run on the production database, tables will be missing.
- **Consequence:** Immediate 500 errors on all pages.

---

## ✅ Summary of Action Items

1. [ ] **Run Seed Script:** Fixes Errors #1 and #2 (Room/Mess IDs).
2. [ ] **Manual Data Entry:** Fixes Error #3 (Parent Links) for testing.
3. [ ] **Config Check:** Verify env vars in Vercel/Production (Error #8).
4. [ ] **Migration Check:** Confirm all tables exist in production DB (Error #9).
