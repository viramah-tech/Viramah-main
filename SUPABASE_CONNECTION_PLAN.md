# Viramah — Supabase Full Connection Plan

> **Generated:** 2026-02-16
> **Goal:** Connect EVERY feature in the website to Supabase — zero hardcoded data, zero mock arrays.

---

## Root Cause: Why Sign-In Was Broken (Infinite Loader)

### The Problem Chain

```
BROWSER (localStorage)               MIDDLEWARE (cookies)
┌──────────────────┐                 ┌──────────────────┐
│ Supabase JS v2   │                 │ Next.js Edge     │
│ stores session   │                 │ reads session    │
│ in localStorage  │─── MISMATCH ───│ from cookies     │
│ ✅ Has token     │                 │ ❌ No cookie     │
└──────────────────┘                 └──────────────────┘
```

**`@supabase/supabase-js` v2 stores sessions in `localStorage` by default.**
The middleware uses `getSupabaseTokenFromCookies()` which looks for `sb-*-auth-token` cookies.
These cookies are **never set** because the browser client doesn't use cookie storage.

**Result:** After successful `signInWithPassword()`:
1. Browser: ✅ session exists in `localStorage`
2. `router.push("/student/dashboard")` fires
3. Middleware: ❌ reads cookies → no token found → redirects to `/login?redirect=...`
4. Login page: AuthProvider's `onAuthStateChange` sees `SIGNED_IN` → `fetchProfile()` → `isAuthenticated = true`
5. Middleware catches `/login` + authenticated user... but it can't see the token either
6. **Infinite redirect loop** or the login page just sits with `isSubmitting = true` forever

### The Fix (Applied Below)

Replace the cookie-based middleware with **JWT decode** — the token exists in `localStorage`, and the `AuthProvider` already handles the full auth flow. The middleware should decode the JWT from the Authorization header or simply trust the client redirect for initial navigation.

---

## Supabase Connection Map — Every Feature

### Legend
- ✅ = Connected and working
- ⚠️ = Partially connected (has issues)  
- ❌ = Not connected (mock/hardcoded data)
- 🔧 = Needs to be built

---

## 1. Authentication

| Feature | File | DB Table | Status | Fix |
|---------|------|----------|--------|-----|
| Sign Up (email/password) | `signup/page.tsx` + `useAuth.tsx` | `auth.users` + `profiles` (trigger) | ⚠️ Profile fetch may fail if trigger hasn't run | Already fixed |
| Sign In (email/password) | `login/page.tsx` + `useAuth.tsx` | `auth.users` | ⚠️ BROKEN — infinite loader | **FIX BELOW** |
| Google OAuth | `useAuth.tsx` | `auth.users` | ⚠️ Redirect loop | **FIX BELOW** |
| Sign Out | `useAuth.tsx` | N/A | ✅ Works | — |
| Session restore (page refresh) | `useAuth.tsx` `initAuth()` | `auth.users` + `profiles` | ⚠️ Depends on localStorage | Works once middleware is fixed |
| Forgot Password | `forgot-password/page.tsx` + API | `auth.users` | ✅ Connected | — |
| Reset Password | `reset-password/page.tsx` | `auth.users` | ✅ Connected | — |
| Middleware route protection | `middleware.ts` | `auth.users` | ⚠️ BROKEN — cookie mismatch | **FIX BELOW** |
| AuthGuard (client) | `AuthGuard.tsx` | N/A (uses context) | ✅ Works | — |

---

## 2. User Onboarding (5 Steps)

| Feature | File | DB Table | Status | Fix |
|---------|------|----------|--------|-----|
| Step 1: KYC Identity | `user-onboarding/step-1` | `kyc_documents`, `profiles` | ❌ Pure UI, no DB | 🔧 Create API + connect |
| Step 2: Emergency Contact | `user-onboarding/step-2` | `emergency_contacts` | ❌ Pure UI, no DB | 🔧 Create API + connect |
| Step 3: Room Selection | `user-onboarding/step-3` | `rooms` | ❌ Uses `MOCK_ROOMS` array | 🔧 Fetch real rooms |
| Step 3: Mess Package | `user-onboarding/step-3` | (new: `mess_subscriptions`?) | ❌ Hardcoded packages | 🔧 Store selection |
| Step 4: Preferences | `user-onboarding/step-4` | `profiles.preferences` (JSONB) | ❌ Pure UI, no DB | 🔧 Save to profile |
| Step 5: Confirm & Review | `user-onboarding/confirm` | All above | ❌ Hardcoded dummy data | 🔧 Read from context |
| Cross-step data persistence | N/A | N/A | ❌ Each step has isolated `useState` | 🔧 Create `OnboardingContext` |
| File uploads (ID photos) | `step-1`, `step-2` | Supabase Storage | ❌ Only `FileReader` preview | 🔧 Upload to storage |

---

## 3. Student Portal

| Feature | File | DB Table | Status | Fix |
|---------|------|----------|--------|-----|
| Dashboard — greeting + name | `student/dashboard` | `profiles` | ✅ Via `useAuth` | — |
| Dashboard — wallet balance | `student/dashboard` | `wallet_transactions` | ⚠️ API exists, needs auth fix | Works once sign-in is fixed |
| Dashboard — active bookings | `student/dashboard` | `bookings` | ⚠️ API exists, needs auth fix | Works once sign-in is fixed |
| Dashboard — KYC status | `student/dashboard` | `profiles.kyc_status` | ✅ Via `useAuth` | — |
| Dashboard — community events | `student/dashboard` | N/A | ❌ Hardcoded `2` | 🔧 Create events table or keep static |
| Dashboard — recent transactions | `student/dashboard` | `wallet_transactions` | ⚠️ Wired but needs auth | Works once sign-in is fixed |
| Wallet page | `student/wallet` | `wallet_transactions` | ❌ Need to check | 🔧 Wire up |
| Canteen page | `student/canteen` | N/A | ❌ Need to check | 🔧 Wire up |
| Amenities page | `student/amenities` | `amenity_bookings` | ❌ Need to check | 🔧 Wire up |
| Settings page | `student/settings` | `profiles` | ❌ Need to check | 🔧 Wire up |

---

## 4. Parent Portal

| Feature | File | DB Table | Status | Fix |
|---------|------|----------|--------|-----|
| Dashboard — parent name | `parent/dashboard` | `profiles` | ✅ Via `useAuth` | — |
| Dashboard — linked student | `parent/dashboard` | `parent_student_links` | ❌ Hardcoded "No student linked" | 🔧 Fetch linked students |
| Dashboard — next visit | `parent/dashboard` | N/A (new table needed?) | ❌ Hardcoded "Not Scheduled" | 🔧 Create visits system |
| Dashboard — alerts | `parent/dashboard` | N/A | ❌ Hardcoded "None" | 🔧 Create notifications |
| Dashboard — account status | `parent/dashboard` | `profiles.kyc_status` | ✅ Via `useAuth` | — |
| Dashboard — recent activity | `parent/dashboard` | `audit_logs` or similar | ❌ Hardcoded empty | 🔧 Fetch activity |
| Schedule visit page | `parent/visit` | N/A | ❌ Need to check | 🔧 Wire up |

---

## 5. Public Pages

| Feature | File | DB Table | Status | Fix |
|---------|------|----------|--------|-----|
| Rooms listing | `rooms/page.tsx` | `rooms` + `properties` | ✅ Connected via `useRooms` hook | — |
| Room cards (public) | `RoomCard.tsx` | `rooms` | ✅ Rendered from API data | — |
| Homepage | `page.tsx` | N/A (static) | ✅ No DB needed | — |
| About pages | `about/`, `about-us/` | N/A (static) | ✅ No DB needed | — |
| Community page | `community/` | N/A (static) | ✅ No DB needed | — |
| Events page | `events/` | N/A (static or future DB) | ❌ Need to check | 🔧 Optional |

---

## 6. API Routes

| Endpoint | Method | Status | Fix |
|----------|--------|--------|-----|
| `/api/v1/health` | GET | ✅ Working | — |
| `/api/v1/rooms` | GET | ✅ Fetches from Supabase | — |
| `/api/v1/rooms/[id]` | GET | ✅ Fetches from Supabase | — |
| `/api/v1/auth/forgot-password` | POST | ✅ Sends reset email | — |
| `/api/v1/auth/otp/send` | POST | ⚠️ Needs Twilio config | Optional |
| `/api/v1/auth/otp/verify` | POST | ⚠️ Needs Twilio config | Optional |
| `/api/v1/auth/logout` | POST | ⚠️ Need to check | — |
| `/api/v1/student/dashboard` | GET | ⚠️ Auth dependency | Works once sign-in fixed |
| `/api/v1/student/wallet` | GET | ❌ Need to check | 🔧 Wire up |
| `/api/v1/user/profile` | GET/PATCH | ⚠️ Auth dependency | Works once sign-in fixed |
| `/api/v1/user/kyc` | POST | ❌ Not implemented | 🔧 Build |
| `/api/v1/bookings` | GET/POST | ⚠️ Auth dependency | 🔧 Wire to onboarding |
| `/api/v1/bookings/[id]` | GET/PATCH | ⚠️ Auth dependency | — |
| `/api/v1/bookings/[id]/cancel` | POST | ⚠️ Auth dependency | — |
| `/api/v1/payments/order` | POST | ⚠️ Needs Razorpay | Optional |
| `/api/v1/payments/verify` | POST | ⚠️ Needs Razorpay | Optional |
| `/api/v1/payments/webhook` | POST | ⚠️ Needs Razorpay | Optional |

---

## Implementation Priority Order

### Phase 1: Fix Sign-In (IMMEDIATE)
1. Fix middleware — JWT decode instead of cookie-based `getUser()`
2. Fix login redirect flow
3. Fix AuthGuard loading state
4. Test signup → onboarding → dashboard flow

### Phase 2: Onboarding Context + API Wiring
1. Create `OnboardingContext` for cross-step data persistence
2. Create API: `POST /api/v1/user/kyc` — save KYC data + upload ID photos
3. Create API: `POST /api/v1/user/emergency-contact` — save emergency contacts
4. Wire Step 3 to real rooms from Supabase (replace `MOCK_ROOMS`)
5. Wire Step 4 to save preferences to `profiles.preferences`
6. Wire Confirm page to read from context (not hardcoded)
7. Create booking on confirmation

### Phase 3: Student Portal Full Wiring
1. Wire wallet page to `wallet_transactions`
2. Wire canteen page (if applicable)
3. Wire amenities page to `amenity_bookings`
4. Wire settings page to `profiles` PATCH

### Phase 4: Parent Portal Full Wiring
1. Wire "linked student" to `parent_student_links`
2. Wire visit scheduling
3. Wire activity feed

---

## Database Tables Summary

| Table | Used By | Records (Seed) | Notes |
|-------|---------|-----------------|-------|
| `profiles` | Auth, Dashboard, Settings | Auto-created on signup | Has `preferences` JSONB column |
| `emergency_contacts` | Onboarding Step 2 | 0 | FK to `profiles.id` |
| `kyc_documents` | Onboarding Step 1 | 0 | Stores document type, number, file URLs |
| `audit_logs` | Security, Activity feed | 0 | Tracks user actions |
| `properties` | Room listing | 3 (seed) | 3 Viramah properties |
| `rooms` | Room listing, Onboarding Step 3 | 7 (seed) | Linked to `properties` |
| `bookings` | Dashboard, Booking flow | 0 | Core booking logic |
| `payments` | Payment flow | 0 | Razorpay integration |
| `wallet_transactions` | Wallet, Dashboard | 0 | Credit/debit tracking |
| `parent_student_links` | Parent portal | 0 | Links parent ↔ student profiles |
| `amenity_bookings` | Amenities page | 0 | Pool, gym, etc. bookings |
