# Viramah — Complete Feature Inventory & Backend Updation Roadmap

> **Generated:** 2026-02-16  
> **Source:** `analyzation.md` (Deep Analysis Plan) × Actual Codebase Audit  
> **Goal:** Every feature extracted, every gap identified, complete roadmap to build a robust full-stack system.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Complete Feature Inventory](#2-complete-feature-inventory)  
3. [Backend Gap Analysis](#3-backend-gap-analysis)
4. [API Endpoint Master List](#4-api-endpoint-master-list)
5. [Database Schema Enhancements](#5-database-schema-enhancements)
6. [Frontend-Backend Integration Map](#6-frontend-backend-integration-map)
7. [Development Roadmap (Phases)](#7-development-roadmap-phases)
8. [Technical Architecture Decisions](#8-technical-architecture-decisions)
9. [Security & Compliance Checklist](#9-security--compliance-checklist)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Current State Audit

### 1.1 What EXISTS Today

| Layer | Status | Details |
|-------|--------|---------|
| **Frontend (Pages)** | ✅ Built | Landing, Login, Signup, Rooms, About, About-Us, Community, Events, Student Portal (Dashboard/Wallet/Canteen/Amenities/Settings), Parent Portal (Dashboard/Visit), User Onboarding (4-step wizard + confirm) |
| **Design System** | ✅ Mature | Tailwind 4 + CSS variables, 25+ color tokens, 3 font families, animation system (Framer Motion + CSS scroll reveal), CVA-based Button, FormInput, RoomCard components |
| **Backend Structure** | ⚠️ Scaffolded | `src/backend/` exists with config, lib, middleware, services, supabase, types — but many are **stubs/partial implementations** |
| **Database Schema** | ✅ Designed | `MASTER_SETUP.sql` — 11 tables, 17 RLS policies, 18 indexes, auto-profile trigger, seed data |
| **API Routes** | ⚠️ Partial | `src/app/api/v1/` has routes for auth/logout, auth/otp, bookings, payments (order/verify/webhook), rooms, user/kyc, user/profile, student/wallet, health |
| **Authentication** | ⚠️ Hybrid | `useAuth.tsx` context with Supabase auth (email/password + Google OAuth) is built; but route protection middleware (`proxy.ts`) is a **placeholder** |
| **Supabase Client** | ✅ Built | Browser client (`src/lib/supabase.ts`), Server client (`src/backend/lib/supabase/server.ts`), Admin client (`src/backend/lib/supabase/admin.ts`) |
| **Validation** | ✅ Built | Zod schemas for auth, booking, KYC, payment in `src/backend/lib/validation/schemas/` |
| **Error Handling** | ✅ Built | Custom error classes: `ApiError`, `AuthError`, `BookingError`, `PaymentError` + error middleware |
| **Services** | ⚠️ Partial | Auth (session, KYC, OTP), Booking (booking, availability, pricing), Payment (gateway, wallet) — but no Room service, no Communication service, no Parent service |
| **Frontend Hooks** | ⚠️ Partial | `useAuth`, `useApi`, `useRooms`, `useWallet`, `useBookings`, `useScrollReveal` |
| **State Management** | ❌ None | No global state. Context only for Auth. |
| **Real-time** | ❌ None | No WebSocket/Supabase Realtime subscriptions |
| **Testing** | ⚠️ Minimal | Vitest configured, a few validation tests exist |

### 1.2 What Does NOT Exist (Critical Gaps)

| Gap | Impact |
|-----|--------|
| **No route protection enforced** | Any user can access `/student/*`, `/parent/*` by URL |
| **No Communication/Messaging module** | Students can't contact managers |
| **No Review/Rating system** | No social proof on rooms |
| **No Admin Panel** | No property/user management dashboard |
| **No Notification system** | No email/SMS/in-app notifications |
| **No Document upload** | KYC images reference empty strings, no S3/storage integration |
| **No Canteen module backend** | Student canteen page has no data source |
| **No Events module backend** | Events page is static |
| **No Community module backend** | Community page is static |
| **No Parent monitoring backend** | Parent dashboard has no real data |
| **No Schedule Visit logic** | `ScheduleVisitModal.tsx` exists but submits nowhere |
| **No Search/Filter backend** | Room search is client-side mock data |
| **No Map/Location integration** | Properties have `coordinates POINT` column but no geocoding |

---

## 2. Complete Feature Inventory

### MODULE 1: Authentication & Identity (AUTH)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| AUTH-1 | Email/Password Sign Up | ✅ Built | ✅ Supabase Auth | - |
| AUTH-2 | Email/Password Sign In | ✅ Built | ✅ Supabase Auth | - |
| AUTH-3 | Google OAuth Sign In | ✅ Built | ✅ Supabase Auth | - |
| AUTH-4 | OTP Verification (Phone/Email) | ❌ No UI | ⚠️ Service exists, no Twilio wired | P1 |
| AUTH-5 | Password Reset / Forgot Password | ❌ No UI | ❌ Not implemented | P1 |
| AUTH-6 | Email Verification Flow | ❌ No UI | ❌ Not implemented | P1 |
| AUTH-7 | Session Management (Refresh, Expiry) | ⚠️ Basic | ⚠️ `session.service.ts` scaffolded | P2 |
| AUTH-8 | Role-Based Route Protection | ❌ Placeholder | ❌ `proxy.ts` is no-op | **P0** |
| AUTH-9 | Sign Out & Session Cleanup | ✅ Built | ✅ Works via Supabase | - |
| AUTH-10 | Auth State Persistence (Page Refresh) | ✅ Built | ✅ `persistSession: true` | - |

### MODULE 2: User Profile & KYC (USER)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| USER-1 | Profile Creation (Auto on signup) | ✅ DB Trigger | ✅ `handle_new_user()` trigger | - |
| USER-2 | Profile View/Edit | ⚠️ Settings page exists | ⚠️ API route exists, service partial | P1 |
| USER-3 | Avatar Upload | ❌ No upload UI | ❌ No storage integration | P2 |
| USER-4 | KYC Step 1: Identity (Aadhaar/Passport) | ✅ Onboarding UI | ⚠️ `kyc.service.ts` + validation exists | P1 |
| USER-5 | KYC Step 2: Emergency Contacts | ✅ Onboarding UI | ❌ No emergency contact API | P1 |
| USER-6 | KYC Step 3: Room Selection | ✅ Onboarding UI | ❌ Not connected to booking flow | P1 |
| USER-7 | KYC Step 4: Lifestyle Preferences | ✅ Onboarding UI | ❌ No preferences API | P2 |
| USER-8 | KYC Document Upload (Images) | ❌ No file upload | ❌ No S3/Supabase Storage | P1 |
| USER-9 | KYC Verification Status Tracking | ⚠️ Type exists | ⚠️ DB column exists | P2 |
| USER-10 | Notification Preferences | ❌ No UI | ❌ Not implemented | P3 |

### MODULE 3: Property & Room Discovery (ROOMS)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| ROOMS-1 | Room Listing (All rooms) | ✅ Rooms page | ✅ `GET /api/v1/rooms` | - |
| ROOMS-2 | Room Filtering (type, price, city) | ✅ FilterBar UI | ⚠️ Query params parsed but needs improvement | P1 |
| ROOMS-3 | Room Detail View | ❌ No detail page | ❌ No `GET /api/v1/rooms/[id]` route | P1 |
| ROOMS-4 | Room Search (Text search) | ⚠️ SearchBar UI | ❌ No backend search | P2 |
| ROOMS-5 | Room Comparison Tool | ❌ Not built | ❌ Not built | P3 |
| ROOMS-6 | Room Availability Calendar | ❌ Not built | ⚠️ `availability.service.ts` exists | P2 |
| ROOMS-7 | Favorite/Save Rooms | ❌ Not built | ❌ No favorites table | P3 |
| ROOMS-8 | Property Detail View | ❌ Not built | ❌ Not built | P2 |
| ROOMS-9 | Property Listing by City | ❌ Not built | ❌ Not built | P2 |
| ROOMS-10 | Map View with Locations | ❌ No map | ❌ No geocoding logic | P3 |
| ROOMS-11 | Virtual Room Tour | ❌ Not built | ❌ Not built | P4 |
| ROOMS-12 | Room Images Gallery | ⚠️ RoomCard has images | ❌ Images are empty arrays from seed | P2 |

### MODULE 4: Booking & Reservation (BOOK)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| BOOK-1 | Create Booking | ⚠️ Onboarding flow exists | ✅ `booking.service.ts` createBooking | P1 |
| BOOK-2 | View My Bookings | ⚠️ Dashboard shows mock | ✅ `getBookings()` service | P1 |
| BOOK-3 | Booking Detail View | ❌ Not built | ✅ `getBooking()` service | P1 |
| BOOK-4 | Cancel Booking | ❌ No cancel UI | ✅ `cancelBooking()` service | P2 |
| BOOK-5 | Booking Status Tracking | ❌ No status UI | ⚠️ Status column exists | P2 |
| BOOK-6 | Booking Confirmation (Email) | ❌ Not built | ❌ No email service wired | P2 |
| BOOK-7 | Booking Modification | ❌ Not built | ❌ Not built | P3 |
| BOOK-8 | 15-min Hold Expiration | ❌ No timer UI | ⚠️ `expiresAt` in metadata but no cron/cleanup | P2 |
| BOOK-9 | Contract/Agreement Generation | ❌ Not built | ❌ Not built | P3 |
| BOOK-10 | Booking Price Calculator | ❌ No preview UI | ✅ `pricing.service.ts` exists | P1 |

### MODULE 5: Payment & Wallet (PAY)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| PAY-1 | Create Payment Order (Razorpay) | ❌ No payment UI | ⚠️ `gateway.service.ts` + API route | P1 |
| PAY-2 | Payment Verification | ❌ Not wired | ⚠️ Verify route exists | P1 |
| PAY-3 | Payment Webhook Handler | ❌ N/A (backend) | ⚠️ Webhook route exists | P1 |
| PAY-4 | Wallet Balance View | ✅ Wallet page | ⚠️ `wallet.service.ts` exists | P1 |
| PAY-5 | Wallet Transaction History | ✅ Wallet page | ⚠️ API route exists | P1 |
| PAY-6 | Wallet Top-up | ❌ Not built | ❌ Not built | P2 |
| PAY-7 | Refund Processing | ❌ Not built | ❌ Not built | P3 |
| PAY-8 | Invoice/Receipt Generation | ❌ Not built | ❌ Not built | P3 |
| PAY-9 | Payment Method Management | ❌ Not built | ❌ Not built | P3 |
| PAY-10 | Security Deposit Management | ❌ Not built | ⚠️ DB columns exist | P2 |

### MODULE 6: Student Portal (STU)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| STU-1 | Dashboard (Overview Cards) | ✅ Page exists (mock data) | ❌ No dashboard API | **P0** |
| STU-2 | Active Booking Display | ⚠️ Mock data | ✅ Service exists | P1 |
| STU-3 | Quick Stats (Days left, Next payment) | ⚠️ Mock data | ❌ No aggregation API | P2 |
| STU-4 | Canteen Menu & Pre-order | ✅ Page exists (mock) | ❌ No canteen tables/API | P3 |
| STU-5 | Amenity Booking (Gym, Laundry, etc.) | ✅ Page exists (mock) | ⚠️ `amenity_bookings` table exists | P2 |
| STU-6 | Settings & Preferences | ✅ Page exists (mock) | ❌ No settings API | P2 |
| STU-7 | Support/Help Tickets | ❌ Not built | ❌ Not built | P3 |
| STU-8 | Announcements Feed | ❌ Not built | ❌ Not built | P3 |

### MODULE 7: Parent Portal (PAR)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| PAR-1 | Parent Dashboard | ✅ Page exists (mock) | ❌ No parent dashboard API | P1 |
| PAR-2 | Link to Student Account | ❌ No linking UI | ⚠️ `parent_student_links` table exists | P1 |
| PAR-3 | View Student Booking/Status | ❌ Mock data | ⚠️ RLS policy exists for cross-access | P1 |
| PAR-4 | Payment on Behalf of Student | ❌ Not built | ❌ Not built | P2 |
| PAR-5 | Schedule Visit | ✅ Visit page + Modal | ❌ No visit scheduling API/table | P2 |
| PAR-6 | Communication with Management | ❌ Not built | ❌ Not built | P3 |
| PAR-7 | Financial Reports View | ❌ Not built | ❌ Not built | P3 |

### MODULE 8: Communication & Notifications (COMM)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| COMM-1 | In-App Notifications Center | ❌ Not built | ❌ No notifications table | P2 |
| COMM-2 | Email Notifications (Transactional) | ❌ Not built | ❌ SendGrid not wired | P2 |
| COMM-3 | SMS Notifications (OTP, Alerts) | ❌ Not built | ❌ Twilio not wired | P2 |
| COMM-4 | Student ↔ Manager Messaging | ❌ Not built | ❌ No messaging tables | P3 |
| COMM-5 | Announcement Broadcasting | ❌ Not built | ❌ Not built | P3 |
| COMM-6 | Real-time Updates (Supabase Realtime) | ❌ Not built | ❌ No subscriptions | P3 |

### MODULE 9: Content & Media (CMS)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| CMS-1 | Property Image Management | ❌ Static assets only | ❌ No Supabase Storage | P2 |
| CMS-2 | Room Image Gallery | ⚠️ UI placeholder | ❌ Empty image arrays | P2 |
| CMS-3 | Review & Rating System | ❌ Not built | ❌ No reviews table | P3 |
| CMS-4 | Blog/Content Pages | ❌ Static about pages | ❌ No CMS backend | P4 |
| CMS-5 | Event Management (CRUD) | ✅ Events page (static) | ❌ No events table | P3 |
| CMS-6 | Community Posts | ✅ Community page (static) | ❌ No community tables | P3 |

### MODULE 10: Admin Panel (ADMIN)

| # | Feature | Frontend Status | Backend Status | Priority |
|---|---------|----------------|----------------|----------|
| ADMIN-1 | Admin Dashboard (Stats/Analytics) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-2 | User Management (View/Ban/Roles) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-3 | Property Management (CRUD) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-4 | Room Management (CRUD) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-5 | Booking Management (Approve/Reject) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-6 | KYC Verification (Approve/Reject) | ❌ Not built | ❌ Not built | P2 |
| ADMIN-7 | Payment Reports | ❌ Not built | ❌ Not built | P3 |
| ADMIN-8 | Content Moderation | ❌ Not built | ❌ Not built | P3 |
| ADMIN-9 | Audit Logs Viewer | ❌ Not built | ✅ `audit_logs` table exists | P3 |
| ADMIN-10 | System Settings | ❌ Not built | ❌ Not built | P4 |

---

## 3. Backend Gap Analysis

### 3.1 What's BUILT and WORKING ✅

```
Backend Services (src/backend/services/):
├── auth/
│   ├── session.service.ts     ─ Get/validate session from JWT
│   ├── kyc.service.ts         ─ Submit KYC, check status
│   └── otp.service.ts         ─ Generate/verify OTP (Twilio stub)
├── booking/
│   ├── booking.service.ts     ─ Create/Get/Cancel bookings
│   ├── availability.service.ts ─ Check room availability
│   └── pricing.service.ts     ─ Dynamic pricing calculation
└── payment/
    ├── gateway.service.ts     ─ Razorpay order creation/verification
    └── wallet.service.ts      ─ Wallet balance/transactions

API Routes (src/app/api/v1/):
├── auth/logout/route.ts       ─ POST sign out
├── auth/otp/send/route.ts     ─ POST send OTP
├── auth/otp/verify/route.ts   ─ POST verify OTP
├── bookings/route.ts          ─ GET list, POST create
├── bookings/[id]/route.ts     ─ GET single, PATCH cancel
├── payments/order/route.ts    ─ POST create Razorpay order
├── payments/verify/route.ts   ─ POST verify payment
├── payments/webhook/route.ts  ─ POST Razorpay webhook
├── rooms/route.ts             ─ GET list rooms (with filters)
├── user/profile/route.ts      ─ GET/PATCH profile
├── user/kyc/route.ts          ─ POST submit KYC
├── student/wallet/route.ts    ─ GET wallet balance + transactions
└── health/route.ts            ─ GET health check

Middleware (src/backend/middleware/):
├── auth.middleware.ts          ─ JWT extraction & validation
├── error.middleware.ts         ─ Centralized error handler
├── rate-limit.middleware.ts    ─ Redis-based rate limiting
└── rbac.middleware.ts          ─ Role-based access control

Infrastructure:
├── config/environment.ts       ─ Zod-validated env vars
├── lib/supabase/server.ts      ─ Server-side Supabase client
├── lib/supabase/admin.ts       ─ Admin Supabase client (service role)
├── lib/validation/schemas/*    ─ Zod schemas for all entities
└── lib/errors/*                ─ Custom error hierarchy
```

### 3.2 What's MISSING and NEEDS to be BUILT ❌

```
CRITICAL (P0):
├── Middleware route protection in Next.js middleware.ts
│   └── Enforce auth on /student/*, /parent/*, /admin/*
└── Student Dashboard data aggregation API
    └── Active booking, wallet balance, upcoming events, stats

HIGH PRIORITY (P1):
├── Services to build:
│   ├── room.service.ts          ─ Get room by ID, room detail with property
│   ├── profile.service.ts       ─ Full profile CRUD, preferences update
│   ├── emergency-contact.service.ts ─ CRUD for emergency contacts
│   └── parent.service.ts        ─ Link/unlink, view student data
│
├── API Routes to build:
│   ├── GET /api/v1/rooms/[id]              ─ Room detail
│   ├── GET /api/v1/rooms/[id]/availability ─ Availability calendar
│   ├── PATCH /api/v1/user/profile          ─ Update profile (connect existing)
│   ├── POST /api/v1/user/emergency-contact ─ Save emergency contacts
│   ├── PATCH /api/v1/user/preferences      ─ Save lifestyle preferences
│   ├── POST /api/v1/auth/forgot-password   ─ Trigger password reset
│   ├── POST /api/v1/auth/verify-email      ─ Email verification
│   ├── GET /api/v1/parent/dashboard        ─ Parent overview data
│   ├── POST /api/v1/parent/link            ─ Link to student
│   └── GET /api/v1/student/dashboard       ─ Student overview data
│
└── Frontend connections:
    ├── Wire onboarding steps to real APIs
    ├── Wire rooms page to real API (already partially done)
    ├── Wire student dashboard to real data
    └── Wire wallet page to real API

MEDIUM PRIORITY (P2):
├── Services:
│   ├── notification.service.ts    ─ In-app + email + SMS dispatch
│   ├── amenity-booking.service.ts ─ Amenity slot booking
│   ├── storage.service.ts         ─ File upload (Supabase Storage / S3)
│   ├── visit.service.ts           ─ Schedule parent visits
│   └── search.service.ts          ─ Full-text room/property search
│
├── API Routes:
│   ├── GET/POST /api/v1/amenities/bookings    ─ Amenity booking
│   ├── POST /api/v1/upload                     ─ File upload
│   ├── GET /api/v1/notifications               ─ User notifications
│   ├── POST /api/v1/parent/visit               ─ Schedule visit
│   └── GET /api/v1/properties                  ─ List properties
│
├── Database additions:
│   ├── notifications table
│   ├── visits table
│   └── user_favorites table
│
└── Frontend features:
    ├── Room detail page (/rooms/[id])
    ├── Forget password page
    ├── Notification center in Nav
    ├── Payment checkout flow UI
    └── Amenity booking modal

LOW PRIORITY (P3):
├── Services:
│   ├── messaging.service.ts     ─ Student ↔ Manager chat
│   ├── review.service.ts        ─ Room reviews & ratings
│   ├── event.service.ts         ─ Events CRUD
│   ├── community.service.ts     ─ Community posts
│   └── report.service.ts        ─ Admin analytics/reports
│
├── Database additions:
│   ├── messages table
│   ├── reviews table
│   ├── events table
│   ├── community_posts table
│   └── support_tickets table
│
└── Pages:
    ├── /admin/* (entire admin panel)
    ├── /student/support
    └── /rooms/compare
```

---

## 4. API Endpoint Master List

### Existing Endpoints (Verify & Harden)

| Method | Endpoint | Auth | Status |
|--------|----------|------|--------|
| `GET` | `/api/v1/health` | ❌ Public | ✅ Working |
| `GET` | `/api/v1/rooms` | ❌ Public | ✅ Working |
| `POST` | `/api/v1/auth/otp/send` | ❌ Public | ⚠️ Needs Twilio |
| `POST` | `/api/v1/auth/otp/verify` | ❌ Public | ⚠️ Needs Twilio |
| `POST` | `/api/v1/auth/logout` | ✅ Auth | ✅ Working |
| `GET` | `/api/v1/user/profile` | ✅ Auth | ⚠️ Partial |
| `PATCH` | `/api/v1/user/profile` | ✅ Auth | ⚠️ Partial |
| `POST` | `/api/v1/user/kyc` | ✅ Auth | ⚠️ Partial |
| `GET` | `/api/v1/bookings` | ✅ Auth | ✅ Working |
| `POST` | `/api/v1/bookings` | ✅ Auth | ✅ Working |
| `GET` | `/api/v1/bookings/[id]` | ✅ Auth | ✅ Working |
| `PATCH` | `/api/v1/bookings/[id]` | ✅ Auth | ✅ Working |
| `POST` | `/api/v1/payments/order` | ✅ Auth | ⚠️ Needs Razorpay key |
| `POST` | `/api/v1/payments/verify` | ✅ Auth | ⚠️ Needs Razorpay key |
| `POST` | `/api/v1/payments/webhook` | ❌ Webhook Secret | ⚠️ Needs Razorpay |
| `GET` | `/api/v1/student/wallet` | ✅ Auth | ⚠️ Partial |

### New Endpoints to Build

| Method | Endpoint | Auth | Module | Priority |
|--------|----------|------|--------|----------|
| `GET` | `/api/v1/rooms/[id]` | ❌ Public | ROOMS | P1 |
| `GET` | `/api/v1/rooms/[id]/availability` | ❌ Public | ROOMS | P2 |
| `GET` | `/api/v1/properties` | ❌ Public | ROOMS | P2 |
| `GET` | `/api/v1/properties/[id]` | ❌ Public | ROOMS | P2 |
| `GET` | `/api/v1/rooms/search` | ❌ Public | ROOMS | P2 |
| `POST` | `/api/v1/auth/forgot-password` | ❌ Public | AUTH | P1 |
| `POST` | `/api/v1/auth/reset-password` | ❌ Public | AUTH | P1 |
| `POST` | `/api/v1/auth/verify-email` | ❌ Public | AUTH | P1 |
| `POST` | `/api/v1/user/emergency-contact` | ✅ Auth | USER | P1 |
| `GET` | `/api/v1/user/emergency-contact` | ✅ Auth | USER | P1 |
| `PATCH` | `/api/v1/user/preferences` | ✅ Auth | USER | P2 |
| `POST` | `/api/v1/upload` | ✅ Auth | CMS | P2 |
| `DELETE` | `/api/v1/upload/[id]` | ✅ Auth | CMS | P3 |
| `GET` | `/api/v1/student/dashboard` | ✅ Student | STU | **P0** |
| `GET` | `/api/v1/student/amenities` | ✅ Student | STU | P2 |
| `POST` | `/api/v1/student/amenities/book` | ✅ Student | STU | P2 |
| `GET` | `/api/v1/parent/dashboard` | ✅ Parent | PAR | P1 |
| `POST` | `/api/v1/parent/link` | ✅ Parent | PAR | P1 |
| `DELETE` | `/api/v1/parent/link/[id]` | ✅ Parent | PAR | P2 |
| `GET` | `/api/v1/parent/student/[id]` | ✅ Parent | PAR | P1 |
| `POST` | `/api/v1/parent/visit` | ✅ Parent | PAR | P2 |
| `GET` | `/api/v1/notifications` | ✅ Auth | COMM | P2 |
| `PATCH` | `/api/v1/notifications/[id]/read` | ✅ Auth | COMM | P2 |
| `GET` | `/api/v1/admin/dashboard` | ✅ Admin | ADMIN | P2 |
| `GET` | `/api/v1/admin/users` | ✅ Admin | ADMIN | P2 |
| `PATCH` | `/api/v1/admin/users/[id]` | ✅ Admin | ADMIN | P2 |
| `GET` | `/api/v1/admin/bookings` | ✅ Admin | ADMIN | P2 |
| `PATCH` | `/api/v1/admin/bookings/[id]` | ✅ Admin | ADMIN | P2 |
| `GET` | `/api/v1/admin/kyc/pending` | ✅ Admin | ADMIN | P2 |
| `PATCH` | `/api/v1/admin/kyc/[id]/verify` | ✅ Admin | ADMIN | P2 |
| `POST` | `/api/v1/admin/properties` | ✅ Admin | ADMIN | P2 |
| `PATCH` | `/api/v1/admin/properties/[id]` | ✅ Admin | ADMIN | P2 |
| `POST` | `/api/v1/admin/rooms` | ✅ Admin | ADMIN | P2 |
| `PATCH` | `/api/v1/admin/rooms/[id]` | ✅ Admin | ADMIN | P2 |

---

## 5. Database Schema Enhancements

### 5.1 New Tables Required

```sql
-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL 
        CHECK (type IN ('booking_confirmed', 'payment_received', 'kyc_approved', 
                        'kyc_rejected', 'visit_scheduled', 'announcement', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(user_id, is_read);

-- =============================================
-- VISITS (Parent → Property)
-- =============================================
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    student_id UUID REFERENCES profiles(id),
    visit_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL 
        CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
    status VARCHAR(20) NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- USER FAVORITES (Saved Rooms)
-- =============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, room_id)
);

-- =============================================
-- REVIEWS & RATINGS
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    room_id UUID REFERENCES rooms(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    property_id UUID REFERENCES properties(id),
    image_url TEXT,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- SUPPORT TICKETS
-- =============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(30) NOT NULL 
        CHECK (category IN ('maintenance', 'billing', 'roommate', 'amenity', 'general')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
```

### 5.2 Columns to Add to Existing Tables

```sql
-- Add role column to profiles (currently stored in auth.users metadata only)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) 
    NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin', 'staff'));

-- Add wallet_balance to profiles for quick lookup
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10, 2) 
    NOT NULL DEFAULT 0.00;

-- Add phone number to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(15);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false;
```

---

## 6. Frontend-Backend Integration Map

### 6.1 Page → API Mapping

| Frontend Page | Current Data Source | Target API(s) | Integration Work |
|---------------|-------------------|---------------|------------------|
| **/** (Landing) | Static | None needed | - |
| **/login** | Supabase Auth direct | ✅ Already integrated | Wire forgot-password link |
| **/signup** | Supabase Auth direct | ✅ Already integrated | Add email verification redirect |
| **/rooms** | `useRooms()` → GET /api/v1/rooms | ✅ Partially integrated | Fix FilterBar → API params, add pagination |
| **/rooms/[id]** | ❌ DOES NOT EXIST | `GET /api/v1/rooms/[id]` | **Create page + route** |
| **/user-onboarding/step-1** | Local state only | `POST /api/v1/user/kyc` | Wire form submission |
| **/user-onboarding/step-2** | Local state only | `POST /api/v1/user/emergency-contact` | Wire form submission |
| **/user-onboarding/step-3** | Local state only | `GET /api/v1/rooms` + booking preview | Wire room selection to real data |
| **/user-onboarding/step-4** | Local state only | `PATCH /api/v1/user/preferences` | Wire form submission |
| **/user-onboarding/confirm** | Accumulated local state | `POST /api/v1/bookings` | Submit full booking |
| **/student/dashboard** | Mock data in component | `GET /api/v1/student/dashboard` | **Full rewrite to use real data** |
| **/student/wallet** | `useWallet()` hook | `GET /api/v1/student/wallet` | Already wired, verify data flow |
| **/student/canteen** | Mock data | Future canteen API | Static for now |
| **/student/amenities** | Mock amenity data | `GET/POST /api/v1/student/amenities` | Wire to amenity_bookings table |
| **/student/settings** | Mock data | `GET/PATCH /api/v1/user/profile` | Wire to real profile data |
| **/parent/dashboard** | Mock data | `GET /api/v1/parent/dashboard` | **Full rewrite to use real data** |
| **/parent/visit** | Modal UI only | `POST /api/v1/parent/visit` | Wire modal submission |
| **/about**, **/about-us** | Static content | None needed | - |
| **/community** | Static content | Future API | Static for now |
| **/events** | Static content | Future API | Static for now |

### 6.2 Component → Data Flow

```
┌─────────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  React Component │───→│  useApi Hook  │───→│  API Route     │───→│  Service      │
│  (Client Side)   │    │  or apiPost() │    │  (src/app/api) │    │  (src/backend)│
│                  │←───│              │←───│                │←───│              │
└─────────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
                                                                        │
                                                                        ▼
                                                                ┌──────────────┐
                                                                │  Supabase DB  │
                                                                │  (PostgreSQL) │
                                                                └──────────────┘
```

---

## 7. Development Roadmap (Phases)

### ✅ PHASE 0: Foundation & Security (Week 1) — COMPLETED
> **Theme:** Nothing works without auth and route protection.

| Task | File(s) to Create/Modify | Status |
|------|--------------------------|--------|
| ✅ Implement Next.js middleware for route protection | `src/middleware.ts` (new) | Done |
| ✅ Enforce auth on `/student/*`, `/parent/*`, `/admin/*` routes | `src/middleware.ts` | Done |
| ✅ Redirect unauthenticated users to `/login` | `src/middleware.ts` | Done |
| ✅ Redirect authenticated users away from `/login`, `/signup` | `src/middleware.ts` | Done |
| ✅ Client-side AuthGuard component with role enforcement | `src/components/auth/AuthGuard.tsx` | Done |
| ✅ Update Student layout to use AuthGuard | `src/app/student/layout.tsx` | Done |
| ✅ Update Parent layout to use AuthGuard | `src/app/parent/layout.tsx` | Done |
| ✅ Deprecate old `proxy.ts` | `src/proxy.ts` | Done |
| ✅ Verify `useAuth` provider wraps all pages | `src/app/layout.tsx`, `src/app/providers.tsx` | Verified |
| Test auth flow end-to-end (signup → login → dashboard) | Manual testing | Pending |

**Exit Criteria:** No protected page is accessible without authentication. Role-based redirects work.

---

### 🟠 PHASE 1: Core Data APIs (Week 2-3)
> **Theme:** Every frontend page gets real data instead of mocks.

#### 1A: Room Detail System
| Task | Files | Effort |
|------|-------|--------|
| Create `room.service.ts` (getById, getByProperty, search) | `src/backend/services/room/room.service.ts` | 3 hours |
| ✅ Create `GET /api/v1/rooms/[id]` route | `src/app/api/v1/rooms/[id]/route.ts` | Done |
| Create Room Detail page (`/rooms/[id]`) | `src/app/rooms/[id]/page.tsx` | 4-5 hours |
| Enhance `/rooms` page with real filters + pagination | Modify `src/app/rooms/page.tsx` | 3 hours |
| Wire `FilterBar` + `SearchBar` to API query params | Modify filter/search components | 2 hours |

#### 1B: User Profile & Onboarding Integration
| Task | Files | Effort |
|------|-------|--------|
| ✅ Build profile API (GET + PATCH with whitelist) | `src/app/api/v1/user/profile/route.ts` | Done |
| Build emergency contact API | `src/app/api/v1/user/emergency-contact/route.ts` | 2 hours |
| Build preferences API | `src/app/api/v1/user/preferences/route.ts` | 2 hours |
| Wire onboarding Step 1 → KYC API | Modify `src/app/user-onboarding/step-1/page.tsx` | 2 hours |
| Wire onboarding Step 2 → Emergency Contact API | Modify step-2 page | 2 hours |
| Wire onboarding Step 3 → Room Selection from real data | Modify step-3 page | 3 hours |
| Wire onboarding Step 4 → Preferences API | Modify step-4 page | 2 hours |
| Wire confirm page → Create Booking API | Modify confirm page | 3 hours |

#### 1C: Student Dashboard Integration
| Task | Files | Effort |
|------|-------|--------|
| ✅ Create student dashboard aggregation API | `src/app/api/v1/student/dashboard/route.ts` | Done |
| Replace mock data in student dashboard | Modify `src/app/student/dashboard/page.tsx` | 3 hours |
| Wire wallet page to real API | Verify `src/app/student/wallet/page.tsx` | 2 hours |
| Wire settings page to profile API | Modify `src/app/student/settings/page.tsx` | 3 hours |

#### 1D: Parent Portal Integration
| Task | Files | Effort |
|------|-------|--------|
| Create `parent.service.ts` | `src/backend/services/parent/parent.service.ts` | 3 hours |
| Create parent link/unlink API | `src/app/api/v1/parent/link/route.ts` | 2 hours |
| Create parent dashboard API | `src/app/api/v1/parent/dashboard/route.ts` | 3 hours |
| Replace mock data in parent dashboard | Modify dashboard page | 3 hours |

**Exit Criteria:** Student dashboard, parent dashboard, rooms, onboarding, and wallet all use real Supabase data.

---

### 🟡 PHASE 2: Payment & Booking Completion (Week 4-5)
> **Theme:** End-to-end booking with real payment.

| Task | Files | Effort |
|------|-------|--------|
| Integrate Razorpay SDK on frontend | Install razorpay, create payment component | 4 hours |
| Build payment checkout page/modal | New component | 5 hours |
| Wire `POST /api/v1/payments/order` to frontend | Connect service to UI | 3 hours |
| Implement payment verification callback | Connect verify route to UI | 3 hours |
| Build booking confirmation email (SendGrid) | `src/backend/services/notification/email.service.ts` | 3 hours |
| Build booking hold timer (15-min countdown UI) | New component | 2 hours |
| Implement hold expiration cron/cleanup | Supabase Edge Function or API cron | 3 hours |
| Wire booking cancel button to API | Modify booking detail UI | 2 hours |
| Build security deposit flow | Extend booking service | 3 hours |
| ✅ Build forgot password page & API | `src/app/forgot-password/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/api/v1/auth/forgot-password/route.ts` | Done |

**Exit Criteria:** A user can search rooms → select room → book → pay via Razorpay → receive confirmation. Password reset works.

---

### 🟢 PHASE 3: Storage, Notifications & Amenities (Week 6-7)
> **Theme:** Upload files, get notified, book amenities.

| Task | Files | Effort |
|------|-------|--------|
| Set up Supabase Storage buckets (avatars, kyc-docs, room-images) | Supabase dashboard + config | 2 hours |
| Build `storage.service.ts` (upload, delete, signed URLs) | `src/backend/services/storage/` | 4 hours |
| Build file upload API route | `src/app/api/v1/upload/route.ts` | 2 hours |
| Build image upload component (drag & drop) | `src/components/ui/FileUpload.tsx` | 4 hours |
| Wire KYC document upload to storage | Link onboarding → upload | 2 hours |
| Wire avatar upload to profile | Link settings → upload | 2 hours |
| Create notifications table (migration) | SQL migration | 1 hour |
| Build `notification.service.ts` | `src/backend/services/notification/` | 3 hours |
| Build notification API routes | `src/app/api/v1/notifications/route.ts` | 2 hours |
| Build notification bell component in Nav | Modify `Navigation.tsx` | 3 hours |
| Wire booking/payment events to notification creation | Call notification.service from other services | 2 hours |
| Build `amenity-booking.service.ts` | `src/backend/services/amenity/` | 3 hours |
| Build amenity booking API | `src/app/api/v1/student/amenities/route.ts` | 2 hours |
| Wire amenities page to real data | Modify amenities page | 3 hours |
| Wire Schedule Visit modal to API | Create visit API + modify modal | 3 hours |

**Exit Criteria:** File uploads work (KYC, avatar), notifications appear in-app, amenity booking functional.

---

### 🔵 PHASE 4: Admin Panel (Week 8-9)
> **Theme:** Management dashboard for property admins.

| Task | Files | Effort |
|------|-------|--------|
| Create admin layout with sidebar navigation | `src/app/admin/layout.tsx` | 3 hours |
| Build admin dashboard page (stats, charts) | `src/app/admin/dashboard/page.tsx` | 5 hours |
| Build user management page (list, search, actions) | `src/app/admin/users/page.tsx` | 4 hours |
| Build property management page (CRUD) | `src/app/admin/properties/page.tsx` | 5 hours |
| Build room management page (CRUD) | `src/app/admin/rooms/page.tsx` | 5 hours |
| Build booking management page | `src/app/admin/bookings/page.tsx` | 4 hours |
| Build KYC verification queue | `src/app/admin/kyc/page.tsx` | 4 hours |
| Build all admin API routes | `src/app/api/v1/admin/*` | 8 hours |
| Build admin RBAC middleware | Enhance `rbac.middleware.ts` | 2 hours |
| Build audit log viewer | `src/app/admin/audit/page.tsx` | 3 hours |

**Exit Criteria:** Admin can manage users, properties, rooms, bookings, and verify KYC documents.

---

### 🟣 PHASE 5: Polish & Advanced Features (Week 10-12)
> **Theme:** Social features, real-time, and production hardening.

| Task | Files | Effort |
|------|-------|--------|
| Build review & rating system (backend + frontend) | New service + UI | 6 hours |
| Build room comparison tool | New page | 4 hours |
| Build favorites/saved rooms feature | New service + UI components | 4 hours |
| Implement Supabase Realtime for notifications | Modify notification components | 3 hours |
| Implement Supabase Realtime for booking status | Modify booking components | 3 hours |
| Build messaging system (student ↔ manager) | New tables + service + UI | 10 hours |
| Build events management (admin CRUD + public display) | Events table + API + pages | 6 hours |
| Build community posts (user-generated content) | Community tables + API | 6 hours |
| Build invoice/receipt PDF generation | Backend service | 4 hours |
| SEO optimization (meta tags, sitemap, robots.txt) | Various | 3 hours |
| Performance optimization (ISR, caching, lazy loading) | Various | 4 hours |
| Error boundary + error pages (404, 500) | New error components | 3 hours |
| Rate limiting on all auth endpoints | Wire redis middleware | 2 hours |
| Map integration (Mapbox or Google Maps) | Map component + geocoding | 5 hours |
| End-to-end tests with Playwright | `tests/` directory | 8 hours |

**Exit Criteria:** Production-ready platform with social features, real-time updates, and comprehensive tests.

---

## 8. Technical Architecture Decisions

### 8.1 Decisions Already Made ✅

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 16 App Router | File-based routing, API routes, SSR/ISR |
| **Database** | Supabase (PostgreSQL) | Auth + DB + Storage + Realtime in one |
| **Payment** | Razorpay | Indian market leader, UPI support |
| **Styling** | Tailwind CSS 4 | Design tokens via CSS variables |
| **Hosting** | Vercel | Zero-config Next.js deployment |
| **Language** | TypeScript (strict) | Type safety across stack |
| **Validation** | Zod | Runtime schema validation |

### 8.2 Decisions to Make 🟡

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Real-time** | Supabase Realtime vs Pusher vs Socket.io | **Supabase Realtime** — already using Supabase, zero extra infra |
| **File Storage** | Supabase Storage vs S3 vs R2 | **Supabase Storage** — free tier, integrate with existing RLS |
| **Email** | SendGrid vs Resend vs Postmark | **Resend** — modern API, React Email templates, generous free tier |
| **SMS/OTP** | Twilio vs MSG91 vs Firebase Auth | **Supabase Phone Auth** — built-in, no extra vendor |
| **Search** | PostgreSQL `tsvector` vs Algolia vs Meilisearch | **PostgreSQL Full-Text Search** — no extra infra for MVP |
| **Cron Jobs** | Vercel Cron vs Supabase pg_cron vs QStash | **Vercel Cron** — 1 line in vercel.json |
| **State Management** | Context API vs Zustand vs Jotai | **Zustand** — lightweight, perfect for global notification/booking state |
| **Map Provider** | Google Maps vs Mapbox vs Leaflet | **Leaflet + OpenStreetMap** — free, no API key needed for MVP |

---

## 9. Security & Compliance Checklist

### 9.1 Authentication & Authorization Matrix

| Resource | Guest | Student | Parent | Admin |
|----------|-------|---------|--------|-------|
| View rooms | ✅ | ✅ | ✅ | ✅ |
| Book room | ❌ | ✅ | ❌ | ✅ |
| View own bookings | ❌ | ✅ | ✅ (linked) | ✅ (all) |
| Cancel booking | ❌ | ✅ (own) | ❌ | ✅ |
| View wallet | ❌ | ✅ | ✅ (linked) | ✅ |
| Submit KYC | ❌ | ✅ | ❌ | ❌ |
| Verify KYC | ❌ | ❌ | ❌ | ✅ |
| Manage properties | ❌ | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ❌ | ✅ |
| Schedule visit | ❌ | ❌ | ✅ | ✅ |
| Link to student | ❌ | ❌ | ✅ | ✅ |

### 9.2 Security Requirements

- [ ] All API routes validate JWT token via auth middleware
- [ ] All user inputs validated through Zod schemas
- [ ] RLS policies enforce data isolation at DB level
- [ ] Sensitive data (KYC docs) encrypted at rest
- [ ] PII fields (Aadhaar, passport) masked in API responses
- [ ] Rate limiting on auth endpoints (5 attempts/min)
- [ ] CSRF protection via Supabase token refresh
- [ ] Webhook signature verification for Razorpay
- [ ] Audit logging for admin actions
- [ ] Secure file upload with type/size validation
- [ ] CORS configured for production domain only

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
         ┌───────────┐
         │    E2E    │ ← Playwright (5-10 critical flows)
         │  Tests    │
        ┌┴───────────┴┐
        │ Integration  │ ← API route + service tests (Vitest)
        │   Tests      │
       ┌┴──────────────┴┐
       │   Unit Tests    │ ← Validation, utility functions (Vitest)
       │                 │
       └─────────────────┘
```

### 10.2 Test Coverage Targets

| Layer | Coverage Target | What to Test |
|-------|----------------|--------------|
| **Validation Schemas** | 100% | Every Zod schema, edge cases |
| **Services** | 80%+ | Business logic, error paths |
| **API Routes** | 80%+ | Auth checks, input validation, response shapes |
| **Components** | 60%+ | Rendering, user interactions, error states |
| **E2E** | Critical paths | Signup → Onboarding → Booking → Payment |

---

## Summary: Priority Execution Order

```
WEEK 1     → Phase 0: Auth + Route Protection (MUST DO FIRST)
WEEK 2-3   → Phase 1: Core APIs (rooms, profiles, dashboards)
WEEK 4-5   → Phase 2: Payments + Booking completion
WEEK 6-7   → Phase 3: Storage + Notifications + Amenities
WEEK 8-9   → Phase 4: Admin panel
WEEK 10-12 → Phase 5: Social features + Polish + Testing
```

**Total Estimated Effort:** ~250-300 hours (1 developer, ~10-12 weeks)

---

> **Next Step:** Start with **Phase 0** — Create `src/middleware.ts` for route protection. This is the single most critical blocker before any other backend work begins.
