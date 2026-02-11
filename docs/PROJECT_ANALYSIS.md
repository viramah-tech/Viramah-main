# Viramah Website - Project Analysis Report

> **Document Updated:** February 10, 2026
> **Purpose:** Comprehensive analysis of the current full-stack implementation, including routing, backend structure, and critical integration gaps.

---

## Executive Summary

Viramah is a **premium student living platform** built on Next.js 16 with Supabase as the backend. The project has evolved from a frontend-only MVP to a **integrated full-stack application**.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions/RPC).
- **Current Status:** ✅ Backend Integration Complete | ⚠️ Critical Data Seeding Gaps

---

## 1. Project Structure & Routing Analysis

### App Router Structure (`src/app`)

| Route | Access | Purpose | Implementation Status |
|---|---|---|---|
| `/` | Public | Landing page | ✅ Fully Implemented |
| `/login` | Public | Auth entry point | ✅ Integrated with Supabase Auth |
| `/auth/callback` | Public | OAuth callback handler | ✅ Handles code exchange & role redirects |
| `/user-onboarding/*` | Protected | 4-step registration | ✅ UI + Server Actions wired |
| `/student/*` | Protected | Student portal | ✅ Connected to real DB data |
| `/parent/*` | Protected | Parent portal | ✅ Connected to real DB data |
| `/api/*` | Public | API endpoints | 🚧 Placeholder only |
| `/test-supabase` | Public | Debugging tool | ✅ Env var & client checker |

### Routing & Middleware Logic (`src/proxy.ts` + `lib/supabase/middleware.ts`)

The project uses Next.js 16's `proxy.ts` convention (replacing `middleware.ts`) to handle session management and route protection.

- **Global Middleware:** Runs on all routes except static assets.
- **Session Refresh:** Calls `supabase.auth.getUser()` to refresh auth tokens.
- **Route Guards:**
  - Redirects **unauthenticated** users from `/student`, `/parent`, `/admin`, `/user-onboarding` to `/login`.
  - Redirects **authenticated** users from `/login` to `/student/dashboard`.

---

## 2. Backend Architecture (Supabase)

### Database Schema (14 Tables)

The schema is fully defined across 6 migration files.

1. **Identity:** `users`, `student_profiles`, `parent_profiles`, `parent_student_links`, `emergency_contacts`.
2. **Inventory:** `rooms` (BIGSERIAL ID), `mess_packages` (BIGSERIAL ID).
3. **Operations:** `bookings`, `visit_slots`, `visit_requests`.
4. **Financial:** `wallets` (Atomic RPC updates), `transactions`, `payments`.
5. **System:** `notifications`, `activity_logs`.

### Access Control (RLS)

- **Row Level Security** is enabled on ALL tables.
- **Policies:** strictly scoped to `auth.uid()` or linked parent/student relationships.
- **Storage:** 2 buckets (`id-documents`, `profile-photos`) with private/folder-scoped access.

---

## 3. Server Actions & API Status

All mutations are handled via Server Actions in `src/app/actions/`.

| Action Module | Key Functions | Status | Potential Issues |
|---|---|---|---|
| **Onboarding** | `saveKYCData`, `uploadIDDocument`, `saveRoomSelection` | ✅ Wired | **CRITICAL:** ID Mismatch (see below) |
| **Dashboard** | `getWalletData`, `topUpWallet` (RPC) | ✅ Wired | None |
| **Visits** | `scheduleVisit`, `getVisitRequests` | ✅ Wired | None |
| **Parent** | `getLinkedStudents`, `getStudentActivityForParent` | ✅ Wired | Relies on manual DB linking |
| **Notifications** | `getNotifications` | ✅ Wired | None |

---

## 4. Critical Integration Gaps & Potential Errors

The following issues exist **right now** and will cause runtime errors if not addressed before full usage.

### 🚨 1. Room ID Mismatch (User Onboarding Step 3)

- **The Issue:** The frontend at `src/app/user-onboarding/step-3/page.tsx` uses **MOCK DATA** with string IDs (e.g., `"101"`, `"201"`).
- **The Backend:** The `rooms` table uses `BIGSERIAL` (integers) and is currently **EMPTY**.
- **The Error:** When a user selects Room "101", the server action `saveRoomSelection` attempts to insert `room_id: 101`. This triggers a **Foreign Key Violation** (`insert or update on table "bookings" violates foreign key constraint`) because ID 101 does not exist in the `rooms` table.
- **Fix Required:**
    1. Create a seed script to populate the `rooms` table.
    2. Update the frontend to fetch **real room data** from Supabase instead of using `MOCK_ROOMS`.

### 🚨 2. Mess Package ID Mismatch

- **The Issue:** Frontend uses string IDs `"full"` and `"partial"`.
- **The Backend:** `mess_packages` table uses `BIGSERIAL` (integers).
- **The Error:** `parseInt("full")` results in `NaN`. The database insert will fail or behave unpredictably.
- **Fix Required:** Fetch real mess packages from DB and use their numeric IDs.

### ⚠️ 3. Environment Variables in Production

- **The Potential Error:** Deployment will fail auth flows if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set in the production environment.
- **Google OAuth:** Requires adding the production domain to authorized redirect URIs in Supabase and Google Cloud Console.

### ⚠️ 4. Missing Parent-Student Links

- **The Issue:** There is currently no UI for a parent to "claim" or "link" a student.
- **The Result:** A new parent user will see an empty dashboard (`getLinkedStudents` returns `[]`).
- **Fix Required:** Admin tool or invite flow to create rows in `parent_student_links`.

---

## 5. Deployment Checklist

1. **Environment:** Set up `.env.local` (or Vercel env vars).
2. **Migrations:** Run all 6 SQL migrations in Supabase Studio.
3. **Seeding:** Run a SQL script to populate `rooms` and `mess_packages` to resolve data mismatch.
4. **Storage:** Ensure `id-documents` and `profile-photos` buckets exist.
5. **OAuth:** Configure Google Auth provider in Supabase.

---

**Next Immediate Step:** Fix the Room/Mess Package data flow (Gap #1 and #2) to resolve the FK violation error.
