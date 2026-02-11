# Viramah Website - Project Analysis Report

> **Document Updated:** February 10, 2026
> **Purpose:** Detailed architectural analysis of the full-stack Viramah application, including routing, data models, and feature implementation status.
> **Note:** For potential errors and integration gaps, see [ERROR_ANALYSIS.md](./ERROR_ANALYSIS.md).

---

## 1. Executive Summary

Viramah is a **premium student living platform** designed as a high-performance web application.

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind_CSS 4.
- **Backend:** Supabase (Auth, DB, Storage, Edge Functions).
- **Architecture:** Server-side data fetching with client-side interactivity.
- **Status:** Full-stack integration complete (Auth, DB, Storage, RPC).

---

## 2. Technical Architecture

### Tech Stack

| Component | Technology | Version | Role |
|---|---|---|---|
| **Framework** | Next.js | 16.1.6 | App Router, Server Actions, Server Components |
| **UI Library** | React | 19.2.3 | Component structure, state management |
| **Styling** | Tailwind CSS | 4.0 alpha | Utility-first styling with custom tokens |
| **Animation** | Framer Motion | 12.33.0 | Page transitions, micro-interactions |
| **Backend** | Supabase | - | Auth, Postgres DB, Storage, Realtime |
| **Ops** | TypeScript | 5.3+ | Type safety across full stack (including DB types) |

### Folder Structure

```bash
src/
├── app/                  # App Router: Pages & API routes
│   ├── (auth)/           # Route groups for auth pages
│   ├── student/          # Protected Student Portal
│   ├── parent/           # Protected Parent Portal
│   ├── user-onboarding/  # Multi-step booking flow
│   ├── actions/          # Server Actions (Mutations)
│   └── api/              # Route Handlers (REST endpoints)
├── components/           # UI Components
│   ├── ui/               # Reusable primitives (Buttons, Cards)
│   ├── sections/         # Landing page sections
│   └── layout/           # Navbar, Footer, Sidebar
├── lib/                  # Utilities & Config
│   └── supabase/         # Client initialization (Client/Server/Middleware)
├── types/                # TypeScript Interfaces
│   └── database.ts       # Generated Supabase types
└── proxy.ts              # Transition Middleware (Access Control)
```

---

## 3. Core Features & Implementation

### A. Authentication & Security

- **Flow:** Email/Password + Google OAuth via Supabase Auth.
- **Protection:** `src/proxy.ts` (Next.js Middleware) intercepts requests:
  - Validates session token via `supabase.auth.getUser()`.
  - Redirects unauthenticated users to `/login`.
  - Redirects authenticated users away from public auth pages.
- **RBAC:** Role-Based Access Control (Student vs Parent vs Admin) enforced at:
  - **Middleware level:** Route guards.
  - **Database level:** Row Level Security (RLS) policies.

### B. User Onboarding Flow

A 4-step wizard at `/user-onboarding/*`:

1. **KYC:** Identity verification (Name, DOB, ID Type).
2. **Documents:** File upload to `id-documents` bucket (Private).
3. **Room Selection:** Filterable room browser with real-time availability check.
4. **Preferences:** Lifestyle choices (Dietary, Sleep, Noise).

**Data persistence:** Every step saves incrementally to `student_profiles` or `bookings` tables to prevent data loss.

### C. Student Portal (`/student`)

- **Dashboard:** Real-time widget view of wallet balance, upcoming events, and notifications.
- **Smart Wallet:**
  - Atomic balance updates via Postgres RPC `topup_wallet`.
  - Transaction history log.
  - Integration prevented double-spending via database constraints.
- **Room Services:** Placeholder for future Canteen/Laundry ordering.

### D. Parent Portal (`/parent`)

- **Linked Students:** Parents can view profiles of their children via `parent_student_links`.
- **Visit Management:**
  - Schedule visits with strict slot management.
  - Waitlist/Approval workflow status tracking.
- **Activity Feed:** View logs of student check-ins/outs (Security feature).

---

## 4. Backend Schema Design

The database is normalized to 3NF standards.

### Tables Overview

1. **Identity:**
    - `users`: Core auth record.
    - `profiles`: Extended metadata (Student/Parent specific).
    - `links`: Graph relationship for Parent-Student connection.
2. **Inventory & Booking:**
    - `rooms`: Capacity, pricing, amenities (JSONB).
    - `bookings`: Links User -> Room + Mess Package + Date Range.
3. **Financials:**
    - `wallets`: User balance.
    - `transactions`: Immutable ledger of all money movement.
4. **System:**
    - `notifications`: In-app alert queue.
    - `logs`: Audit trail for security actions.

### API Strategy

- **Fetch:** Direct database queries in Server Components (efficient, cached).
- **Mutate:** Server Actions in `src/app/actions/`.
- **Realtime:** Supabase Subscriptions (ready to enable for Notifications).

---

*For analysis of integration gaps, ID mismatches, and potential runtime errors, refer to the [Error Analysis Report](./ERROR_ANALYSIS.md).*
