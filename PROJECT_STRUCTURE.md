# Viramah Website - Project Structure

```
viramah-website/
├── 📁 public/                          # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── 📁 src/
│   │
│   ├── 📁 app/                         # Next.js App Router
│   │   │
│   │   ├── ─────────────────────────── # PUBLIC PAGES
│   │   ├── page.tsx                    # Landing page ⭐
│   │   ├── loading.tsx                 # Vellum displacement loader ⭐
│   │   ├── layout.tsx                  # Root layout
│   │   ├── template.tsx                # Page transitions
│   │   │
│   │   ├── 📁 rooms/
│   │   │   └── page.tsx                # /rooms - Public room listing
│   │   ├── 📁 about/
│   │   │   └── page.tsx                # /about - Static info
│   │   ├── 📁 about-us/
│   │   │   └── page.tsx                # /about-us - Team info
│   │   ├── 📁 community/
│   │   │   └── page.tsx                # /community - Community info
│   │   ├── 📁 events/
│   │   │   └── page.tsx                # /events - Events listing
│   │   ├── 📁 login/
│   │   │   └── page.tsx                # /login - Role-based auth ⭐
│   │   │
│   │   ├── ─────────────────────────── # STUDENT PORTAL (Authenticated)
│   │   ├── 📁 student/
│   │   │   ├── layout.tsx              # Student layout (sidebar/header)
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── page.tsx            # /student/dashboard
│   │   │   ├── 📁 wallet/
│   │   │   │   └── page.tsx            # /student/wallet
│   │   │   ├── 📁 amenities/
│   │   │   │   └── page.tsx            # /student/amenities
│   │   │   ├── 📁 canteen/
│   │   │   │   └── page.tsx            # /student/canteen
│   │   │   └── 📁 settings/
│   │   │       └── page.tsx            # /student/settings
│   │   │
│   │   ├── ─────────────────────────── # PARENT PORTAL
│   │   ├── 📁 parent/
│   │   │   ├── layout.tsx              # Parent layout
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── page.tsx            # /parent/dashboard
│   │   │   └── 📁 visit/
│   │   │       └── page.tsx            # /parent/visit
│   │   │
│   │   ├── ─────────────────────────── # ROOM BOOKING FLOW (Pre-student KYC)
│   │   ├── 📁 room-booking/
│   │   │   ├── layout.tsx              # Booking flow layout
│   │   │   ├── 📁 step-1/
│   │   │   │   └── page.tsx            # Identity verification
│   │   │   ├── 📁 step-2/
│   │   │   │   └── page.tsx            # Emergency info
│   │   │   ├── 📁 step-3/
│   │   │   │   └── page.tsx            # Preferences
│   │   │   └── 📁 confirm/
│   │   │       └── page.tsx            # Booking & payment
│   │   │
│   │   ├── ─────────────────────────── # API ROUTES
│   │   └── 📁 api/
│   │       └── route.ts                # API placeholder
│   │
│   ├── 📁 components/
│   │   ├── 📁 layout/                  # Shared layout components
│   │   │   ├── Container.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx          # Navbar with gear + clock ⭐
│   │   │
│   │   ├── 📁 search/
│   │   │   ├── FilterBar.tsx
│   │   │   └── SearchBar.tsx           # Pneumatic search ⭐
│   │   │
│   │   ├── 📁 sections/                # Landing page sections
│   │   │   ├── AudienceSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── ClosingSection.tsx
│   │   │   ├── CommunitySection.tsx
│   │   │   ├── DifferenceSection.tsx
│   │   │   ├── FounderSection.tsx
│   │   │   ├── LifeAtViramahSection.tsx
│   │   │   └── RealitySection.tsx
│   │   │
│   │   ├── 📁 ui/                      # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── RoomCard.tsx            # 3D isometric room ⭐
│   │   │
│   │   ├── 📁 student/                 # Student-specific components
│   │   │   └── index.ts                # (placeholder)
│   │   │
│   │   ├── 📁 parent/                  # Parent-specific components
│   │   │   └── index.ts                # (placeholder)
│   │   │
│   │   └── 📁 room-booking/            # Booking flow components
│   │       └── index.ts                # (placeholder)
│   │
│   ├── 📁 lib/                         # Utilities
│   │   ├── utils.ts                    # cn() helper
│   │   ├── supabase.ts                 # Supabase client (placeholder)
│   │   └── auth.ts                     # Session, role checking, RLS helpers
│   │
│   ├── 📁 hooks/                       # Custom React hooks
│   │   └── (empty)
│   │
│   ├── 📁 styles/
│   │   └── globals.css                 # CSS variables, Tailwind, grain
│   │
│   └── 📁 types/                       # TypeScript types
│       └── index.ts                    # Role definitions, models, props
│
├── middleware.ts                       # Role-based routing & protection
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## Routes Overview

### Public Pages (No Auth Required)
| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, sections |
| `/rooms` | Room listings |
| `/about` | About Viramah |
| `/about-us` | Team info |
| `/community` | Community info |
| `/events` | Events listing |
| `/login` | Role-based authentication |

### Student Portal (Auth: Student Role)
| Route | Description |
|-------|-------------|
| `/student/dashboard` | Home dashboard |
| `/student/wallet` | Wallet & payments |
| `/student/amenities` | Amenities booking |
| `/student/canteen` | Canteen interface |
| `/student/settings` | Profile & settings |

### Parent Portal (Auth: Parent Role)
| Route | Description |
|-------|-------------|
| `/parent/dashboard` | Parent dashboard |
| `/parent/visit` | Schedule visits |

### Room Booking Flow (Pre-Student KYC)
| Route | Description |
|-------|-------------|
| `/room-booking/step-1` | Identity verification |
| `/room-booking/step-2` | Emergency info |
| `/room-booking/step-3` | Preferences |
| `/room-booking/confirm` | Booking & payment |

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Route protection by role |
| `src/lib/auth.ts` | Session & role utilities |
| `src/lib/supabase.ts` | Supabase client |
| `src/types/index.ts` | Type definitions |
