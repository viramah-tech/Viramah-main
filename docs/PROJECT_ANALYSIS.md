# Viramah Website - Project Analysis Report

> **Document Created:** February 10, 2026  
> **Purpose:** Comprehensive analysis of current frontend implementation to inform backend and authentication planning

---

## Executive Summary

Viramah is a **premium student living platform** built as a Next.js 16 application with React 19 and Tailwind CSS 4. The current implementation is a **complete frontend-only MVP** with sophisticated UI/UX design, mock data, and placeholder authentication. The project is ready for backend integration with Supabase.

### Current Status: ✅ Frontend Complete | ⏳ Backend Pending

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.1.6 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.33.0 |
| Icons | Lucide React | 0.563.0 |
| Language | TypeScript | 5.x |
| Database (Planned) | Supabase | Not configured |

### Package Dependencies

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.33.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "tailwind-merge": "^3.4.0"
  }
}
```

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Loading animation
│   ├── template.tsx              # Page template
│   ├── login/                    # Authentication
│   ├── user-onboarding/          # 4-step booking flow
│   │   ├── layout.tsx            # Onboarding layout with stepper
│   │   ├── step-1/               # Identity verification
│   │   ├── step-2/               # Emergency contacts
│   │   ├── step-3/               # Room selection
│   │   ├── step-4/               # Lifestyle preferences
│   │   └── confirm/              # Booking confirmation
│   ├── student/                  # Student portal
│   │   ├── layout.tsx            # Portal layout
│   │   ├── dashboard/            # Main dashboard
│   │   ├── wallet/               # Wallet management
│   │   ├── canteen/              # Food ordering (placeholder)
│   │   ├── amenities/            # Amenity booking (placeholder)
│   │   └── settings/             # Profile settings
│   ├── parent/                   # Parent portal
│   │   ├── layout.tsx            # Portal layout
│   │   ├── dashboard/            # Parent dashboard
│   │   └── visit/                # Visit scheduling
│   ├── rooms/                    # Room browsing
│   ├── about-us/                 # About page
│   ├── community/                # Community page
│   └── events/                   # Events page
├── components/
│   ├── layout/                   # Layout components
│   │   ├── Navigation.tsx        # Main navigation
│   │   ├── Footer.tsx            # Site footer
│   │   ├── Container.tsx         # Content container
│   │   └── PortalNav.tsx         # Portal sidebar navigation
│   ├── sections/                 # Landing page sections
│   │   ├── RealitySection.tsx
│   │   ├── DifferenceSection.tsx
│   │   ├── CategoriesSection.tsx
│   │   ├── LifeAtViramahSection.tsx
│   │   ├── CommunitySection.tsx
│   │   ├── FounderSection.tsx
│   │   ├── AudienceSection.tsx
│   │   └── ClosingSection.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx            # Button variants
│   │   ├── FormInput.tsx         # Form input with floating labels
│   │   └── RoomCard.tsx          # Room display card
│   ├── search/                   # Search components
│   │   └── SearchBar.tsx         # Discovery search
│   ├── student/                  # Student portal components
│   └── parent/                   # Parent portal components
├── lib/
│   ├── auth.ts                   # Authentication utilities (mock)
│   ├── supabase.ts               # Supabase client (placeholder)
│   └── utils.ts                  # Utility functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript definitions
└── styles/                       # Global styles
```

---

## Feature Analysis

### 1. Landing Page (`/`)

**Status:** ✅ Fully Implemented

The landing page is a premium, visually rich marketing page with:

| Section | Description | Data Source |
|---------|-------------|-------------|
| **Hero** | Full-screen hero with background image, tagline, and value proposition | Static |
| **Search Bar** | City, date range, and room type selection | Static options |
| **Reality Section** | Problem/solution messaging | Static |
| **Difference Section** | Key differentiators | Static |
| **Categories Section** | Room type showcase | Static |
| **Life at Viramah** | Lifestyle features | Static |
| **Community Section** | Community values | Static |
| **Founder Section** | Founder story | Static |
| **Audience Section** | Target audience | Static |
| **Closing CTA** | Call to action | Static |
| **Rooms Showcase** | 3 room cards (Solo, Duo, Tribe) | Static mock data |

**Components Used:**

- `Navigation` - Main site navigation with hover animations
- `Footer` - Site footer with links
- `SearchBar` - Discovery search interface
- `RoomCard` - Room display cards
- 8 section components

---

### 2. Login Page (`/login`)

**Status:** ✅ UI Complete | ⚠️ No Real Authentication

**Features:**

- Role selection (Student / Parent)
- Email & password form inputs
- "Continue with Google" button (non-functional)
- "Forgot Password" link (non-functional)
- Conditional redirect based on role:
  - Student → `/user-onboarding/step-1`
  - Parent → `/parent/dashboard`

**Current Behavior:**

```typescript
// No actual authentication - just navigation
const getRedirectPath = () => {
    if (selectedRole === "student") return "/user-onboarding/step-1";
    if (selectedRole === "parent") return "/parent/dashboard";
    return "/login";
};
```

**Backend Requirements:**

- [ ] Email/password authentication
- [ ] Google OAuth integration
- [ ] Role-based session management
- [ ] Password reset flow

---

### 3. User Onboarding Flow (`/user-onboarding/*`)

**Status:** ✅ UI Complete | ⚠️ No Data Persistence

A 4-step wizard for new student registration with a shared layout featuring:

- Progress stepper with animated transitions
- Auto-minimizing header on scroll
- Collapsible stepper toggle

#### Step 1: Identity Verification (`/user-onboarding/step-1`)

| Field | Type | Validation |
|-------|------|------------|
| Full Name | Text | None |
| Date of Birth | Date | None |
| ID Type | Select | Aadhaar, Passport, Voter ID |
| ID Number | Text | None |
| ID Front Photo | File Upload | Client-side preview |
| ID Back Photo | File Upload | Client-side preview |

**Note:** Photos are read as base64 for preview only. No upload to server.

#### Step 2: Emergency Contacts (`/user-onboarding/step-2`)

| Field | Type | Description |
|-------|------|-------------|
| Primary Contact Name | Text | Guardian/parent name |
| Primary Contact Phone | Text | Phone number |
| Relationship | Select | Father, Mother, Guardian, Other |
| Secondary Contact | Text | Optional backup contact |
| Parent ID Photo | File Upload | Client-side preview |

#### Step 3: Room Selection (`/user-onboarding/step-3`)

**This is the most complex page with premium UI.**

**Room Data (Mock):**

```typescript
interface Room {
    id: string;
    number: string;
    floor: number;
    type: "single" | "double" | "triple";
    price: number;
    securityDeposit: number;
    available: boolean;
    amenities: string[];
    size: number;
    facing: string;
    furniture: string[];
    image: string;
}
```

**Features:**

- Room type filters (Single, Double, Triple)
- Floor filters (1, 2, 3)
- Sorting (Price, Room Number, Floor)
- Premium room cards with:
  - Real images (Unsplash)
  - Badge overlays
  - Quick stats section
  - Hover effects
- Room detail modal
- Mess package selection:
  - Full Board (₹4,500)
  - Half Board (₹3,000)
  - No Mess (₹0)

#### Step 4: Lifestyle Preferences (`/user-onboarding/step-4`)

| Preference | Options |
|------------|---------|
| Dietary | Vegetarian, Non-Vegetarian, Vegan |
| Sleep Schedule | Early Bird, Night Owl, Flexible |
| Noise Preference | Quiet, Moderate, Social |

#### Confirmation Page (`/user-onboarding/confirm`)

Final review before booking submission.

**Backend Requirements:**

- [ ] Store user identity data
- [ ] File upload for ID photos
- [ ] Room booking API
- [ ] Transaction/payment integration
- [ ] Email confirmation

---

### 4. Student Portal (`/student/*`)

**Status:** ✅ UI Complete | ⚠️ Mock Data Only

Accessible via `PortalNav` sidebar with consistent layout.

#### Dashboard (`/student/dashboard`)

| Widget | Data | Status |
|--------|------|--------|
| Welcome message | User name | Mock: "Arjun Mehta" |
| Quick Actions | Add Funds, Order Food | Links work |
| Wallet Balance | ₹2,450 | Static |
| Upcoming Events | 2 events | Static mock |
| This Week Summary | 3 quick stats | Static |

```typescript
const mockUser: User = {
    id: "mock-user-1",
    email: "student@viramah.com",
    name: "Arjun Mehta",
    role: "student",
    isAuthenticated: true,
};
```

#### Wallet (`/student/wallet`)

| Feature | Status |
|---------|--------|
| Balance card | ✅ Display (static ₹2,450) |
| Add Funds button | ⚠️ Non-functional |
| Linked Cards button | ⚠️ Non-functional |
| Transaction history | ✅ Display (4 mock transactions) |

#### Canteen (`/student/canteen`)

**Status:** 🚧 Placeholder - "Coming Soon"

Displays a placeholder page indicating the canteen ordering system is under development.

#### Amenities (`/student/amenities`)

**Status:** 🚧 Placeholder - "Coming Soon"

Displays a placeholder page for gym, laundry, and facility booking.

#### Settings (`/student/settings`)

| Section | Features | Status |
|---------|----------|--------|
| Profile | Name, Email, Phone inputs | ✅ Form (mock data) |
| Notifications | Email, Push, SMS toggles | ✅ UI only |
| Security | Change Password button | ⚠️ Non-functional |

**Backend Requirements:**

- [ ] Real user data from database
- [ ] Wallet balance and transactions from payments table
- [ ] Real-time updates for events
- [ ] Profile update API
- [ ] Password change functionality

---

### 5. Parent Portal (`/parent/*`)

**Status:** ✅ UI Complete | ⚠️ Mock Data Only

#### Dashboard (`/parent/dashboard`)

| Widget | Description | Status |
|--------|-------------|--------|
| Welcome header | Parent greeting | Mock data |
| Child status card | Name, Room, Check-in status | Static |
| Quick stats | Next Visit, Alerts | Static |
| Recent activity | 3 activity items | Static mock |
| Quick actions | Schedule Visit, Add Funds | Links work |

```typescript
// Child data is hardcoded
<span className="font-body text-lg font-medium">Arjun Mehta</span>
<span className="font-mono text-xs">Room 204 • Block A</span>
```

#### Visit Scheduling (`/parent/visit`)

| Feature | Status |
|---------|--------|
| Date picker | ✅ Working UI |
| Time slot selection | ✅ 5 slots (10 AM - 4 PM) |
| Purpose input | ✅ Optional text |
| Scheduled visits display | ✅ Mock data |

**Backend Requirements:**

- [ ] Link parent to student accounts
- [ ] Real child data from database
- [ ] Visit booking API with slot availability
- [ ] Notification system for visit confirmations

---

## Authentication System

### Current Implementation (`src/lib/auth.ts`)

**Status:** ⚠️ Mock/Placeholder Only

```typescript
export type UserRole = "student" | "parent" | "admin" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
}

// Mock user - toggle role to test different portals
export const mockUser: User = {
    id: "mock-user-1",
    email: "student@viramah.com",
    name: "Arjun Mehta",
    role: "student",
    isAuthenticated: true,
};
```

### Placeholder Functions

| Function | Current Status |
|----------|----------------|
| `getSession()` | Returns mock user |
| `hasRole()` | Basic role check |
| `getRoleRedirect()` | Returns portal path |
| `hasCompletedOnboarding()` | Always returns `false` |

### Supabase Client (`src/lib/supabase.ts`)

```typescript
// Currently a placeholder
export const supabase = null; // Until Supabase is configured

// TODO: Configure with environment variables
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## UI Components

### Button (`src/components/ui/Button.tsx`)

Variants: `primary` (default), `secondary`
Sizes: `default`, `sm`, `lg`

### FormInput (`src/components/ui/FormInput.tsx`)

- Floating label animation
- **Recently fixed:** Proper handling for date/time inputs (label stays floated)
- Error and hint text support
- Focus states with terracotta accent

### RoomCard (`src/components/ui/RoomCard.tsx`)

Premium room display card with:

- Image with gradient overlay
- Type badge
- Price display
- Hover lift effect

---

## Design System

### Colors (Tailwind CSS Custom Properties)

| Token | Usage |
|-------|-------|
| `terracotta-raw` | Primary accent, CTAs |
| `terracotta-soft` | Gradients, highlights |
| `gold` | Secondary accent |
| `sage-muted` | Success states, nature |
| `charcoal` | Text primary |
| `ink` | Dark text |
| `ivory` | Light backgrounds |
| `sand-light` | Page backgrounds |
| `sand-dark` | Borders, dividers |

### Typography

- **Display:** Headings, brand text
- **Body:** Paragraph text
- **Mono:** Labels, metadata, uppercase tracking

### Animation Patterns

All animations use Framer Motion with:

- `initial={{ opacity: 0, y: 20 }}`
- `animate={{ opacity: 1, y: 0 }}`
- Staggered delays (0.1s, 0.2s, etc.)

---

## What Needs Backend Integration

### Priority 1: Core Authentication

- [ ] Supabase project setup
- [ ] Email/password authentication
- [ ] Google OAuth
- [ ] Session management
- [ ] Protected routes (middleware)
- [ ] Role-based access control

### Priority 2: User Management

- [ ] User profile storage
- [ ] Onboarding data persistence
- [ ] ID document upload to Supabase Storage
- [ ] Emergency contact storage

### Priority 3: Booking System

- [ ] Room inventory database
- [ ] Room availability checking
- [ ] Booking creation and management
- [ ] Security deposit tracking
- [ ] Payment integration (Razorpay/Stripe)

### Priority 4: Portal Features

- [ ] Wallet transactions database
- [ ] Visit scheduling with slot management
- [ ] Parent-student relationship linking
- [ ] Activity logging
- [ ] Notification system

### Priority 5: Coming Soon Features

- [ ] Canteen ordering system
- [ ] Amenity booking (gym, laundry)
- [ ] Real-time notifications
- [ ] Admin dashboard

---

## Database Schema Requirements (Suggested)

```sql
-- Core Tables
users (id, email, name, role, created_at, onboarding_complete)
profiles (user_id, date_of_birth, phone, id_type, id_number, id_front_url, id_back_url)
emergency_contacts (user_id, name, phone, relationship, is_primary)

-- Room Management
rooms (id, number, floor, type, price, security_deposit, available, amenities, size, facing)
bookings (id, user_id, room_id, start_date, end_date, status, mess_package)

-- Financial
wallets (user_id, balance)
transactions (id, wallet_id, type, amount, description, created_at)
payments (id, user_id, booking_id, amount, status, payment_method)

-- Parent Portal
parent_student_links (parent_id, student_id, relationship)
visits (id, parent_id, student_id, date, time_slot, purpose, status)

-- Activities
activity_logs (id, user_id, action, metadata, created_at)
notifications (id, user_id, type, message, read, created_at)
```

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OAuth (if using)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Payments (future)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Summary

The Viramah website has a **polished, production-ready frontend** with:

✅ **Complete:** Landing page, Login UI, User onboarding (4 steps), Student portal (5 pages), Parent portal (2 pages)

⚠️ **Needs Backend:** All data is mock, no authentication, no persistence

🚧 **Placeholders:** Canteen, Amenities, Payments, Admin portal

The codebase is well-structured and ready for Supabase integration. The next phase should focus on:

1. Setting up Supabase project
2. Implementing authentication
3. Creating database schema
4. Connecting frontend to real APIs

---

*This report was generated by analyzing the complete codebase structure, components, and implementation patterns.*
