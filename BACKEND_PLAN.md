# 🏗️ Viramah Platform — Comprehensive Backend Development Plan

**Infrastructure:** Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
**Date:** February 2026 | **Version:** 1.1 *(Updated: Maintenance Request System added)*

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Database Schema Strategy](#2-database-schema-strategy)
3. [Authentication & Authorization Design](#3-authentication--authorization-design)
4. [Inquiry Gatekeeping Mechanism](#4-inquiry-gatekeeping-mechanism)
5. [Multi-Step Onboarding Data Flow](#5-multi-step-onboarding-data-flow)
6. [Approval Workflow System](#6-approval-workflow-system)
7. [Wallet & Payment Integration Architecture](#7-wallet--payment-integration-architecture)
8. [Canteen Order Lifecycle Design](#8-canteen-order-lifecycle-design)
9. [Amenities Booking Management](#9-amenities-booking-management)
10. [**Maintenance Request System *(New)***](#10-maintenance-request-system)
11. [Admin, Staff & Management Cross-Domain Access Planning](#11-admin-staff--management-cross-domain-access-planning)
12. [Scalability & Performance Strategy](#12-scalability--performance-strategy)
13. [Bug Fixing & Monitoring Strategy](#13-bug-fixing--monitoring-strategy)
14. [Security Enhancements](#14-security-enhancements)
15. [Future-Proofing Considerations](#15-future-proofing-considerations)
16. [Implementation Priority Roadmap](#implementation-priority-roadmap)

---

## 1. System Architecture Overview

### Core Philosophy

The Viramah backend follows a **layered, event-driven architecture** built entirely on Supabase primitives. Every module is designed with **role isolation**, **audit traceability**, and **future multi-domain extensibility** as first-class concerns.

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  Resident App  │  Admin Portal*  │  Sales Portal*  │  Mgmt Portal*  │
│                │  (future domain)│  (future domain)│  (future domain)│
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / JWT
┌────────────────────────▼────────────────────────────────────┐
│                  SUPABASE EDGE LAYER                        │
│   Edge Functions (business logic, payment hooks, webhooks)  │
│   Row-Level Security Policies (data isolation per role)     │
│   PostgREST API (auto-generated, RLS-enforced)              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  DATABASE LAYER                             │
│   PostgreSQL (primary data store)                           │
│   Supabase Realtime (live subscriptions)                    │
│   Supabase Storage (KYC documents, ID photos)               │
└─────────────────────────────────────────────────────────────┘
```

> *Future portals (Admin, Sales, Management) will connect to the **same Supabase project** using service-role-scoped API keys with dedicated RLS policies — no separate database needed.

---

## 2. Database Schema Strategy

### Design Principles

- **Normalized structure** with clear foreign key relationships
- **Soft deletes** on all critical tables (never hard-delete user data)
- **Audit columns** (`created_at`, `updated_at`, `created_by`) on every table
- **Status enums** for all lifecycle states (inquiry, onboarding, approval, orders)
- **UUID primary keys** throughout to prevent enumeration attacks

### Core Table Groups

#### Group A — Identity & Access

| Table | Purpose |
|---|---|
| `users` | Core user identity, linked to Supabase Auth |
| `user_roles` | Role assignments (resident, admin, canteen_staff, sales_agent) |
| `user_sessions` | Extended session metadata, device tracking |
| `device_fingerprints` | Device-based inquiry gating |

#### Group B — Inquiry System

| Table | Purpose |
|---|---|
| `inquiries` | Raw inquiry submissions |
| `inquiry_dedup_index` | Normalized email + phone for fast duplicate detection |

#### Group C — Onboarding

| Table | Purpose |
|---|---|
| `onboarding_drafts` | Step-by-step draft state (JSON blob per step) |
| `residential_kyc` | Step 1 personal details |
| `parental_kyc` | Step 2 guardian details |
| `room_selections` | Step 3 room + mess + lunchbox flag |
| `resident_preferences` | Step 4 lifestyle preferences |
| `onboarding_submissions` | Final submission record linking all steps |
| `approval_records` | Admin approval decisions with timestamps and notes |

#### Group D — Resident Operations

| Table | Purpose |
|---|---|
| `wallet_accounts` | One wallet per user, current balance |
| `wallet_transactions` | Immutable ledger of every credit event |
| `payment_intents` | PhonePe payment initiation records |
| `payment_confirmations` | Verified payment callbacks |
| `canteen_menu` | Daily menu items managed by staff |
| `canteen_orders` | Order records with room mapping and status |
| `canteen_order_items` | Line items per order |
| `amenities` | Amenity definitions (gym, laundry, etc.) |
| `amenity_slots` | Available booking windows per amenity |
| `amenity_bookings` | User booking records |

#### Group G — Maintenance System *(New)*

| Table | Purpose |
|---|---|
| `maintenance_categories` | Category definitions (Electricity, Plumber, WiFi, Housekeeping, Carpentry, AC, Security, Other) |
| `maintenance_requests` | Core request record — user, category, issue type, description, priority, status |
| `maintenance_assignments` | Links a request to a specific staff member with assignment timestamp |
| `maintenance_status_history` | Immutable log of every status transition for a request |
| `maintenance_comments` | Threaded comments between resident and management staff on a request |
| `maintenance_attachments` | Optional photo/video evidence uploaded by resident (Supabase Storage paths) |

#### Group E — Notifications & Events

| Table | Purpose |
|---|---|
| `notifications` | Per-user notification records |
| `notification_preferences` | User-level channel preferences |
| `events` | Hostel events for the week |

#### Group F — Settings & Audit

| Table | Purpose |
|---|---|
| `profile_updates` | Audit log of all profile change requests |
| `audit_log` | System-wide immutable event log |

---

## 3. Authentication & Authorization Design

### Authentication Strategy

Supabase Auth handles all authentication. The platform uses **email + password** as the primary method, with **Google OAuth** as a secondary option. JWT tokens issued by Supabase carry the user's role claims.

### Role Taxonomy

```
SUPER_ADMIN          → Full system access (future admin domain)
ADMIN                → Approval workflows, room management
SALES_AGENT          → Read-only inquiry access (future sales domain)
CANTEEN_STAFF        → Order management access
AMENITY_MANAGER      → Slot and booking management
MAINTENANCE_STAFF    → View, claim, update, and resolve maintenance requests
RESIDENT             → Standard user access (post-approval)
PENDING_RESIDENT     → Authenticated but onboarding incomplete
```

### Role Assignment Flow

1. User signs up → assigned `PENDING_RESIDENT` role automatically
2. Onboarding submitted → role remains `PENDING_RESIDENT`, approval flag set to `awaiting`
3. Admin approves → role upgraded to `RESIDENT`, dashboard access unlocked
4. Staff roles are assigned manually by `SUPER_ADMIN` only

### Session Management

- JWT expiry set to **1 hour** with **refresh token rotation**
- Refresh tokens expire after **7 days of inactivity**
- Device fingerprint stored at login for anomaly detection
- Concurrent session limit enforced at the application layer via Edge Functions

### KYC Completion Gate

A **database function** checks three conditions before any dashboard API call is permitted:

1. `onboarding_submissions.status = 'approved'`
2. `users.kyc_complete = true`
3. `user_roles.role = 'RESIDENT'`

This check is enforced at the **RLS policy level**, not just the frontend — meaning even direct API calls will be blocked if these conditions aren't met.

---

## 4. Inquiry Gatekeeping Mechanism

### Device-Based Gating Logic

The inquiry gate uses a **multi-signal device fingerprint** composed of:

- Browser `navigator` properties (user agent, language, platform)
- Screen resolution and timezone
- A persistent `localStorage` token generated on first visit
- A **server-side cookie** (`HttpOnly`, `SameSite=Strict`) as a secondary signal

The fingerprint hash is stored in the `device_fingerprints` table. On every visit, the frontend checks this hash against the database before rendering the inquiry form. If a match exists, the gate is bypassed.

### Duplicate Prevention Logic

Before any inquiry is written to the database, a Supabase **Edge Function** performs:

1. Normalize the submitted email (lowercase, trim whitespace)
2. Normalize the phone number (strip formatting, enforce E.164 format)
3. Query the `inquiry_dedup_index` table for either match
4. If **either** the email **or** phone already exists → return a `200 OK` with a `duplicate: true` flag (do not expose that the record exists for privacy)
5. If no match → insert into both `inquiries` and `inquiry_dedup_index` atomically using a **database transaction**

### Cross-Domain Sales Portal Readiness

The `inquiries` table will have RLS policies that allow `SALES_AGENT` role reads. When the Sales Portal is deployed on its own domain, it will use a **Supabase service key scoped to read-only on the inquiries table** — no schema changes needed.

---

## 5. Multi-Step Onboarding Data Flow

### Draft-First Architecture

Each onboarding step saves data as a **draft** before final submission. This prevents data loss if the user navigates away or the session expires.

```
User completes Step N
        ↓
Edge Function: Validate step data
        ↓
Upsert into onboarding_drafts (step_number, data JSON, user_id)
        ↓
Update onboarding_progress.last_completed_step = N
        ↓
Return success → Frontend advances to Step N+1
```

### Step-Specific Data Handling

**Step 1 & 2 (KYC):**
- ID document photos uploaded to **Supabase Storage** in a private bucket
- Storage paths stored in the KYC tables (never public URLs)
- Signed URLs generated on-demand with **15-minute expiry** for admin review

**Step 3 (Room Selection):**
- Room availability checked with a **pessimistic lock** (database-level `SELECT FOR UPDATE`) to prevent double-booking during concurrent selections
- Lunchbox flag triggers a computed `additional_charge` field set to ₹3,000
- Room is **soft-reserved** (not confirmed) until onboarding is approved

**Step 5 (Review & Submit):**
- A single Edge Function aggregates all draft data
- Performs a **final validation pass** across all steps
- Writes to `onboarding_submissions` with `status = 'pending_review'`
- Triggers a **database webhook** that notifies the admin portal in real-time via Supabase Realtime

### Transactional Integrity

The final submission uses a **PostgreSQL transaction** wrapping:

1. Insert into `onboarding_submissions`
2. Copy draft data into permanent KYC/preference tables
3. Update `users.onboarding_complete = true`
4. Insert a notification record for the admin
5. If any step fails → full rollback, user sees an error and can retry

---

## 6. Approval Workflow System

### Approval State Machine

```
pending_review → under_review → approved
                             ↘ rejected (with reason)
                             ↘ needs_revision (with specific fields flagged)
```

### Workflow Mechanics

- Admin sees all `pending_review` submissions in their portal (via RLS-filtered query)
- Admin can transition status to `under_review` to claim the submission (prevents two admins reviewing simultaneously)
- On **`approved`**:
  - `users.kyc_complete` set to `true`
  - `user_roles.role` updated to `RESIDENT`
  - Room reservation converted from soft-reserved to confirmed
  - Welcome notification sent to the resident
- On **`rejected`**:
  - Reason stored in `approval_records`
  - Resident notified with the rejection reason
  - Resident can re-submit after corrections
- On **`needs_revision`**:
  - Specific fields flagged in `approval_records.flagged_fields` (JSON array)
  - Resident redirected to the relevant onboarding step to correct only those fields

### Audit Trail

Every approval state transition is logged in the `audit_log` table with:

- Admin user ID
- Timestamp
- Previous state
- New state
- Optional notes

---

## 7. Wallet & Payment Integration Architecture

### Ledger-Based Design

The wallet system uses a **double-entry ledger approach** — the wallet balance is never stored as a mutable number that gets incremented/decremented. Instead:

- `wallet_accounts.balance` is a **computed view** derived from summing all confirmed credit transactions for that user
- Every credit event creates an **immutable row** in `wallet_transactions`
- Balance is recalculated on read (cached with a short TTL for performance)
- This makes the balance **tamper-evident** — any discrepancy between the computed sum and the cached balance triggers an alert

### PhonePe Payment Flow

```
1. User initiates "Add Funds" → Frontend calls Edge Function
2. Edge Function creates a payment_intents record (status: initiated)
3. Edge Function calls PhonePe API to create a payment order
4. PhonePe returns a payment URL → sent to frontend
5. User completes payment on PhonePe
6. PhonePe sends webhook to Supabase Edge Function endpoint
7. Edge Function verifies webhook signature (HMAC-SHA256)
8. Edge Function checks payment_intents for idempotency (already processed?)
9. If valid and not duplicate → insert wallet_transactions record
10. Update payment_confirmations with PhonePe transaction ID
11. Realtime event pushed to frontend → balance updates live
```

### Idempotency Handling

- Every payment intent has a **unique idempotency key** (UUID generated server-side)
- PhonePe webhook handler checks `payment_confirmations` for the transaction ID before processing
- If already processed → return `200 OK` immediately (PhonePe may retry webhooks)
- Database `UNIQUE` constraint on `payment_confirmations.phonepay_transaction_id` as a hard safety net

### Fraud Prevention Design

- **No server-side balance manipulation** — only the payment webhook Edge Function can credit the wallet
- The webhook endpoint is protected by **IP allowlisting** (PhonePe's known IP ranges) + HMAC signature verification
- Any direct database write to `wallet_transactions` outside the Edge Function is blocked by RLS
- Suspicious patterns (e.g., multiple payment intents in rapid succession) trigger a rate-limit flag

---

## 8. Canteen Order Lifecycle Design

### Order State Machine

```
cart → placed → confirmed → preparing → ready → delivered → completed
                                                           ↘ cancelled
```

### Order Processing Flow

1. User selects items from today's menu (fetched from `canteen_menu` filtered by date)
2. Order total computed **server-side** (never trust client-submitted totals)
3. Wallet balance checked — if insufficient, order is rejected before placement
4. Wallet deducted **atomically** with order creation (single transaction)
5. Order appears in Canteen Staff Portal (via Realtime subscription)
6. Staff updates status through their portal
7. Status changes propagate to resident via Realtime notification

### Room Mapping

- Each order record stores `room_number` derived from the resident's approved room selection
- Canteen staff see orders grouped by floor/room for efficient delivery routing

### Refund Logic

- If an order is cancelled before `preparing` status → wallet credit issued automatically
- Cancellations after `preparing` → requires admin approval for refund
- All refunds create a new `wallet_transactions` record (never modify existing records)

---

## 9. Amenities Booking Management

### Slot Architecture

- Each amenity has a configurable **slot template** (e.g., gym: 6 AM–10 PM in 1-hour slots)
- Slots are **pre-generated** daily by a scheduled Edge Function (runs at midnight)
- Each slot record tracks: `amenity_id`, `date`, `start_time`, `end_time`, `capacity`, `booked_count`

### Conflict Prevention Logic

- Booking uses **optimistic locking** with a `version` column on slot records
- When a user books: read current `booked_count` and `version`, then update with `WHERE version = :read_version`
- If the update affects 0 rows → another booking occurred simultaneously → return "slot full" error
- `booked_count` is validated against `capacity` at the database level via a **CHECK constraint**

### Cancellation & Availability

- Cancellations decrement `booked_count` and mark the booking as `cancelled`
- Cancelled slots become immediately available for re-booking
- Management portal can mark amenities as unavailable (maintenance mode) which blocks all new bookings for that amenity

---

## 10. Maintenance Request System

> **This module is directly integrated with the Management Portal** hosted on a separate domain. All maintenance requests raised by residents are visible, assignable, and resolvable exclusively through that portal.

### Supported Categories

| Category | Scope |
|---|---|
| **Electricity** | Power outlets, lighting, fans, switches, AC, tripping breakers |
| **Plumber** | Taps, pipes, drainage, water supply, hot water |
| **WiFi / Internet** | Connectivity, router issues, slow speeds, network drops |
| **Housekeeping** | Room cleaning, linen replacement, pest control, waste collection |
| **Carpentry** | Furniture, doors, windows, locks, wardrobes |
| **AC / Heating** | Air conditioning, heating units, ventilation |
| **Security / Lock** | Door locks, keys, access cards |
| **Other** | Any issue not covered above |

### Request Lifecycle State Machine

```
submitted → assigned → in_progress → resolved
         ↘ unassigned (if no staff available)
                    ↘ on_hold (parts/access needed)
                               ↘ escalated → resolved
                                           ↘ rejected (with reason)
```

### Resident Submission Flow

1. Resident selects a **category** from the maintenance page
2. Selects a specific **issue type** from the category's predefined list
3. Optionally adds a **free-text description** and **priority** (Normal / High)
4. Optionally uploads **photo evidence** (stored in a private Supabase Storage bucket)
5. Submits → Edge Function validates and inserts into `maintenance_requests` with `status = 'submitted'`
6. A **unique reference ID** (e.g., `MR-0042`) is generated and returned to the resident
7. A **Realtime event** is fired → Management Portal receives the new request instantly
8. Resident receives an **in-app notification** confirming submission

### Management Portal Assignment Flow

1. Management Portal (separate domain) subscribes to `maintenance_requests` via Supabase Realtime
2. New requests appear in a live queue, filterable by category, priority, and status
3. A `MAINTENANCE_STAFF` user **claims** a request → inserts into `maintenance_assignments`, status transitions to `assigned`
4. Only one staff member can be assigned per request at a time (enforced by a `UNIQUE` constraint on `maintenance_assignments.request_id` where `active = true`)
5. Staff updates status to `in_progress` when work begins
6. Staff can add **comments** (visible to the resident) at any stage
7. On completion → status set to `resolved`, `resolved_at` timestamp recorded
8. Resident receives a **push/in-app notification** that the request is resolved

### Priority & SLA Tracking

| Priority | Target Resolution Time | Escalation Trigger |
|---|---|---|
| **High** | 4 hours | Auto-escalate to ADMIN if unresolved after 6 hours |
| **Normal** | 24 hours | Auto-escalate to ADMIN if unresolved after 36 hours |

- A **scheduled Edge Function** runs every 30 minutes to check SLA breaches
- Breached requests are automatically transitioned to `escalated` status
- An escalation notification is sent to the `ADMIN` role
- Escalation events are logged in `maintenance_status_history` with `triggered_by = 'system'`

### Status History & Audit

- Every status transition writes an **immutable row** to `maintenance_status_history`:
  - `request_id`, `from_status`, `to_status`, `changed_by` (user ID or `'system'`), `changed_at`, `note`
- This gives management a full timeline of every request — useful for SLA reporting and dispute resolution
- The `audit_log` table also captures all management-side actions (assignment, comments, resolution)

### Resident Visibility Rules (RLS)

- Residents can **only read their own requests** — RLS policy: `WHERE user_id = auth.uid()`
- Residents can **create** new requests but **cannot modify** status, assignment, or other residents' data
- Residents can **read comments** on their own requests
- Residents **cannot** see staff assignment details (staff name/ID is hidden from the resident-facing API)

### Management Portal Access Rules (RLS)

- `MAINTENANCE_STAFF` role can **read all requests** across all residents (filtered by `hostel_id`)
- `MAINTENANCE_STAFF` can **update status** and **insert comments** only on requests assigned to them
- `ADMIN` role can **read, reassign, and override** any request
- `SUPER_ADMIN` has full access including bulk operations and reporting queries
- All management access is via a **dedicated system user** on the management portal domain — the resident app's anon key cannot reach these endpoints

### Attachment Handling

- Photos/videos uploaded by residents go to a **private Supabase Storage bucket** (`maintenance-attachments`)
- Storage paths are stored in `maintenance_attachments` — never public URLs
- Management staff access attachments via **signed URLs** with a 30-minute expiry, generated on-demand by an Edge Function
- Residents can view their own attachment signed URLs (15-minute expiry)

### Cross-Domain Realtime Integration

- The Management Portal subscribes to a **Supabase Realtime channel** filtered to `maintenance_requests` changes
- New submissions, priority escalations, and resident comments appear **live** in the management dashboard without polling
- The resident app subscribes to status changes on **their own requests only** (`WHERE user_id = auth.uid()`)
- Comment threads use Realtime for live back-and-forth between resident and staff

### Reporting & Analytics (Management Portal)

- Management portal can query aggregate views:
  - Total open requests by category
  - Average resolution time by category and staff member
  - SLA breach rate by week/month
  - Most common issue types (for preventive maintenance planning)
- These queries run against **read-optimized materialized views** refreshed every 15 minutes
- No raw table access for reporting — all analytics go through dedicated PostgreSQL functions to prevent accidental data exposure

---

## 11. Admin, Staff & Management Cross-Domain Access Planning

### Architecture Principle

All portals (current and future) connect to the **same Supabase project**. There is no data duplication. Access control is enforced entirely through **RLS policies and role-scoped API keys**.

### Access Matrix

| Portal | Domain | Supabase Key Type | Data Access |
|---|---|---|---|
| Resident App | viramah.com | Anon key + user JWT | Own data only |
| Admin Portal | admin.viramah.com | Service key (scoped) | All resident data, approvals, maintenance oversight |
| **Management Portal** | **manage.viramah.com** | **Service key (scoped)** | **Maintenance requests, assignments, comments, attachments** |
| Sales Portal | sales.viramah.com | Service key (read-only) | Inquiries only |
| Canteen Portal | canteen.viramah.com | Service key (scoped) | Orders, menu |
| Amenity Portal | staff.viramah.com | Service key (scoped) | Slots, bookings |

### Key Scoping Strategy

- Service keys for future portals will be **Supabase service role keys with RLS still enforced** (not the master service key)
- Each portal's backend will authenticate using a **dedicated system user** with the appropriate role
- This means RLS policies apply even to service key requests — no accidental data leakage

### Realtime Cross-Portal Events

| Portal | Realtime Subscription | Filter |
|---|---|---|
| Admin Portal | `onboarding_submissions` | `status = 'pending_review'` |
| Management Portal | `maintenance_requests` | `hostel_id = :hostel` |
| Management Portal | `maintenance_comments` | `request_id IN (assigned requests)` |
| Canteen Portal | `canteen_orders` | `hostel_id = :hostel` |
| Resident App | `maintenance_requests` | `user_id = auth.uid()` |
| Resident App | `maintenance_comments` | `request_id IN (own requests)` |

- All subscriptions are **filtered by role and scope** at the Realtime channel level — no cross-resident data leakage
- Management Portal uses a **server-side Realtime connection** (not browser-based) for reliability

---

## 12. Scalability & Performance Strategy

### Database Performance

- **Indexes** on all foreign keys, status columns, and frequently-filtered fields (email, phone, room_number, date)
- **Partial indexes** for active records (e.g., `WHERE status = 'pending_review'`) to keep admin queries fast
- **Materialized views** for dashboard summary data (wallet balance, booking counts) refreshed on a short interval
- **Connection pooling** via Supabase's built-in PgBouncer in transaction mode

### Edge Function Performance

- Edge Functions kept **stateless and idempotent** — safe to retry on failure
- Heavy computations (e.g., balance recalculation) offloaded to **PostgreSQL functions** running server-side
- Edge Functions use **streaming responses** for large data payloads

### Caching Strategy

- Wallet balance cached in a `wallet_balance_cache` table with a `last_computed_at` timestamp
- Cache invalidated on every new `wallet_transactions` insert via a **PostgreSQL trigger**
- Today's canteen menu cached at the Edge Function level with a 5-minute TTL
- Amenity slot availability cached with a 30-second TTL (acceptable staleness for UX)

### Realtime Optimization

- Realtime subscriptions scoped to **specific rows** (e.g., `user_id = :current_user`) to avoid broadcasting unnecessary data
- High-frequency updates (order status) use **Postgres NOTIFY** directly rather than full row replication

---

## 13. Bug Fixing & Monitoring Strategy

### Observability Stack

- **Supabase Dashboard Logs** for query performance, slow queries, and error rates
- **Edge Function logs** streamed to an external log aggregator (e.g., Logflare, which Supabase natively supports)
- **Custom `audit_log` table** as an application-level event store for business logic tracing
- **Database-level error tracking** via PostgreSQL's `pg_stat_statements` extension

### Error Classification System

All errors are classified into three tiers:

| Tier | Type | Response |
|---|---|---|
| **P0 — Critical** | Payment failure, wallet corruption, auth bypass | Immediate alert, auto-rollback, block operation |
| **P1 — High** | Onboarding submission failure, approval workflow stuck | Alert within 5 minutes, manual intervention |
| **P2 — Medium** | Duplicate inquiry not caught, slot booking conflict | Logged, reviewed in daily digest |

### Proactive Bug Prevention

- **Database constraints as the last line of defense** — UNIQUE, CHECK, NOT NULL, and FOREIGN KEY constraints enforce data integrity even if application logic fails
- **Idempotent Edge Functions** — every function can be safely re-run without side effects
- **Automated regression tests** run against a Supabase staging project before any schema migration is applied to production
- **Schema migrations versioned** using Supabase CLI migration files — no manual schema changes in production

### Incident Response Workflow

1. Alert triggered (via log aggregator or Supabase alert)
2. Identify affected users from `audit_log`
3. Assess data integrity using ledger reconciliation queries
4. Apply fix to staging → verify → apply to production
5. Post-incident: add a database constraint or Edge Function guard to prevent recurrence

---

## 14. Security Enhancements

### A. Data Protection

- All KYC documents stored in **private Supabase Storage buckets** — never publicly accessible
- Signed URLs for document access expire in **15 minutes**
- Sensitive fields (phone numbers, ID numbers) encrypted at rest using **PostgreSQL's `pgcrypto` extension**
- PII fields masked in logs — Edge Functions strip sensitive data before logging
- Database backups encrypted and retained for **30 days**

### B. Role Isolation

- **RLS policies are the primary access control mechanism** — not application-level checks
- Every table has an explicit `DENY ALL` default policy; access is granted only through specific `ALLOW` policies
- Roles are stored in a **separate `user_roles` table** (not in the JWT claims alone) — JWT claims are verified against the database on sensitive operations
- Admin and staff roles can only be assigned by `SUPER_ADMIN` — no self-elevation possible

### C. API Protection

- All Edge Function endpoints require a **valid JWT** (no unauthenticated access to any business logic)
- The inquiry submission endpoint is the only unauthenticated endpoint — protected by **rate limiting** and **CAPTCHA verification**
- API responses never expose internal IDs, stack traces, or database error messages to the client
- **CORS policies** configured per-domain — the resident app cannot call admin-scoped endpoints

### D. Payment Validation

- PhonePe webhook endpoint validates **HMAC-SHA256 signature** on every request — unsigned requests are rejected with `401`
- Payment amounts are validated server-side against the `payment_intents` record — the client cannot specify the amount to credit
- A **reconciliation job** runs nightly comparing PhonePe transaction records against `wallet_transactions` — any discrepancy triggers a P0 alert
- No wallet credit occurs without a corresponding `payment_confirmations` record

### E. Rate Limiting

| Endpoint | Limit |
|---|---|
| Inquiry submission | 3 attempts per IP per hour |
| Authentication (failed logins) | 5 per account per 15 minutes → temporary lock |
| Wallet top-up initiation | 10 per user per day |
| Canteen order placement | 20 per user per day |
| Maintenance request submission | 10 per user per day |
| Maintenance attachment upload | 5 files per request, max 10 MB each |

All rate limits enforced at the **Edge Function layer** using a `rate_limit_counters` table with TTL-based expiry.

### F. Fraud Detection

- **Velocity checks**: Multiple payment intents from the same user within 60 seconds → flag and require re-authentication
- **Amount anomaly detection**: Payment amounts significantly above historical average → flag for manual review
- **Device anomaly**: Login from a new device after onboarding approval → send verification email
- **Wallet balance reconciliation**: Automated nightly job verifies that `SUM(wallet_transactions)` equals `wallet_accounts.balance` for every user — any mismatch triggers an immediate P0 alert and freezes the affected wallet pending investigation

---

## 15. Future-Proofing Considerations

### Multi-Hostel Expansion

- All tables include a `hostel_id` foreign key from day one — even if only one hostel exists initially
- This allows the platform to onboard additional hostel properties without schema changes
- RLS policies will filter by `hostel_id` automatically once multi-tenancy is activated

### Admin & Sales Portal Readiness

- The database schema, RLS policies, and role taxonomy are designed to support these portals **without any schema migration** when they launch
- Only new RLS `ALLOW` policies and a new system user per portal are needed

### API Versioning

- Edge Functions are organized by version prefix (`/v1/`, `/v2/`) from the start
- Breaking changes are deployed as new versions — old versions deprecated with a sunset notice

### Notification Channel Expansion

- The notification system is built on a **channel-agnostic design** — currently supports in-app notifications
- Email (via Supabase's built-in email or Resend) and SMS (via Twilio) can be added by implementing new channel handlers without changing the core notification table structure

### PhonePe → Multi-Gateway Readiness

- The payment layer is abstracted behind an Edge Function interface
- Swapping or adding payment gateways (Razorpay, Stripe) requires only a new gateway adapter — the wallet ledger and idempotency logic remain unchanged

---

## Implementation Priority Roadmap

| Phase | Scope | Priority |
|---|---|---|
| **Phase 1** | Auth, Inquiry Gatekeeping, User Table, RLS foundation | 🔴 Critical |
| **Phase 2** | Onboarding flow, KYC storage, Draft saving, Approval workflow | 🔴 Critical |
| **Phase 3** | Wallet system, PhonePe integration, Ledger design | 🔴 Critical |
| **Phase 4** | Canteen ordering, Menu management, Order lifecycle | 🟠 High |
| **Phase 5** | Amenities booking, Slot management | 🟠 High |
| **Phase 5.5** | **Maintenance Request System** — DB schema, RLS, Edge Functions, SLA scheduler, Realtime | 🟠 **High** |
| **Phase 6** | Notifications, Events, Dashboard aggregations | 🟡 Medium |
| **Phase 7** | Settings, Profile management, Audit logging | 🟡 Medium |
| **Phase 8** | Cross-domain portal access — Admin, Sales, **Management Portal** RLS & Realtime | 🟢 Planned |
| **Phase 9** | Multi-hostel `hostel_id` activation, API versioning | 🟢 Future |

---

*This plan is designed to be handed directly to a backend developer or implementation team. Every section maps to a concrete Supabase feature set and can be implemented incrementally without architectural rework.*

---

### Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | Feb 2026 | Initial plan — Auth, Onboarding, Wallet, Canteen, Amenities, Security |
| 1.1 | Feb 2026 | Added Section 10: Maintenance Request System with Management Portal cross-domain integration, SLA tracking, escalation logic, attachment handling, and Realtime subscriptions |
