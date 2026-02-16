# LLM Onboarding Guide for Viramah

> **विरामाह — The Art of the Rest**
> A premium student living platform designed for the modern Indian journey.

---

## 🔒 The Architecture Oath

```
I, [LLM Identity], hereby affirm:

1. I have mapped the complete directory structure and will not create
   files outside established patterns without explicit human approval.

2. I have identified all existing abstractions and will use them
   rather than creating parallel implementations.

3. I understand the error handling flow and will not introduce
   new exception types without checking existing hierarchy.

4. I have noted the testing patterns and will write tests that
   match the existing style, coverage expectations, and mocking approaches.

5. I will not add dependencies without checking:
   - If functionality already exists in current dependencies
   - If the team has preference for specific libraries
   - Version compatibility with existing stack

6. I will not "clean up" or "optimize" existing code during
   feature implementation unless explicitly requested.

7. I will follow the exact code style detected:
   - Double quotes everywhere
   - 4-space indentation in TSX/TS files
   - Path alias @/* for src/* imports
   - Named exports for components, default exports for pages
   - Tailwind CSS utility classes with custom CSS variables
```

---

## 📋 Quick Reference

| Property              | Value                                                          |
|----------------------|----------------------------------------------------------------|
| **Language**          | TypeScript 5.x (strict mode)                                  |
| **Framework**         | Next.js 16.1.6 (App Router)                                   |
| **UI Library**        | React 19.2.3                                                   |
| **Styling**           | Tailwind CSS 4 (`@tailwindcss/postcss`) + CSS Variables        |
| **Animations**        | Framer Motion 12.33.0                                          |
| **Icons**             | Lucide React 0.563.0                                           |
| **Component Variants**| Class Variance Authority (CVA) + clsx + tailwind-merge         |
| **Fonts**             | DM Serif Display (display), Inter (body), JetBrains Mono (mono)|
| **Database**          | Supabase (placeholder — not yet configured)                    |
| **Package Manager**   | npm                                                            |
| **Deployment**        | Vercel                                                         |
| **Test Runner**       | None configured yet                                            |

---

## 🏗️ Architecture Overview

### Data Flow Architecture
**App Router (File-based Routing)** → No MVC/MVVM. Pure component-based with Next.js App Router conventions.

### Programming Paradigm
**Component-Oriented / Functional React** — All components are functional. No class components. State management is local (`useState`, `useEffect`). No global state management (no Redux, Zustand, etc.).

### Project Structure (Sacred — Do Not Modify)

```
viramah-website/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, metadata)
│   │   ├── template.tsx            # Page transition wrapper (Framer Motion)
│   │   ├── loading.tsx             # Global loading screen (animated)
│   │   ├── page.tsx                # Landing page (/)
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   ├── about/page.tsx          # About page
│   │   ├── about-us/page.tsx       # About Us page
│   │   ├── community/page.tsx      # Community page
│   │   ├── events/page.tsx         # Events page
│   │   ├── rooms/page.tsx          # Rooms listing page
│   │   ├── api/                    # API routes
│   │   ├── user-onboarding/        # 4-step onboarding wizard
│   │   │   ├── layout.tsx          # Onboarding layout with stepper
│   │   │   ├── step-1/page.tsx     # Identity verification
│   │   │   ├── step-2/page.tsx     # Emergency contacts
│   │   │   ├── step-3/page.tsx     # Room selection
│   │   │   ├── step-4/page.tsx     # Lifestyle preferences
│   │   │   └── confirm/page.tsx    # Booking review
│   │   ├── student/                # Student portal
│   │   │   ├── layout.tsx          # Student layout (sidebar + header)
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── wallet/page.tsx
│   │   │   ├── canteen/page.tsx
│   │   │   ├── amenities/page.tsx
│   │   │   └── settings/page.tsx
│   │   └── parent/                 # Parent portal
│   │       ├── layout.tsx          # Parent layout (sidebar + header)
│   │       ├── dashboard/page.tsx
│   │       └── visit/page.tsx
│   │
│   ├── components/                 # Shared components
│   │   ├── layout/                 # Structural / shell components
│   │   │   ├── Navigation.tsx      # Main navbar (floating, rounded, luxury-green)
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   ├── Container.tsx       # Max-width wrapper
│   │   │   └── PortalNav.tsx       # Sidebar for student/parent portals
│   │   ├── sections/               # Landing page section components
│   │   │   ├── DifferenceSection.tsx
│   │   │   ├── AmenitiesSection.tsx
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── LifeAtViramahSection.tsx
│   │   │   ├── CommunitySection.tsx
│   │   │   ├── FounderSection.tsx
│   │   │   ├── AudienceSection.tsx
│   │   │   ├── ClosingSection.tsx
│   │   │   └── RealitySection.tsx   # Currently commented out in page.tsx
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Button.tsx          # CVA-based button with variants
│   │   │   ├── FormInput.tsx       # Floating-label input (forwardRef)
│   │   │   ├── RoomCard.tsx        # 3D isometric room card
│   │   │   └── ScheduleVisitModal.tsx
│   │   ├── search/                 # Search-specific components
│   │   │   ├── SearchBar.tsx       # Multi-segment animated search
│   │   │   └── FilterBar.tsx       # Room filter controls
│   │   ├── room-booking/           # Booking flow components
│   │   │   ├── ProgressStepper.tsx
│   │   │   └── index.ts            # Barrel export
│   │   ├── student/                # Student-specific components
│   │   │   └── index.ts            # Barrel export (placeholder)
│   │   └── parent/                 # Parent-specific components
│   │       └── index.ts            # Barrel export (placeholder)
│   │
│   ├── lib/                        # Utility functions & configurations
│   │   ├── utils.ts                # cn() helper (clsx + twMerge)
│   │   ├── supabase.ts             # Supabase client (placeholder)
│   │   └── auth.ts                 # Auth types, mock user, session helpers
│   │
│   ├── hooks/                      # Custom React hooks
│   │   └── useScrollReveal.ts      # IntersectionObserver-based scroll reveal
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts                # Core types (User, Room, Booking, KYCData)
│   │   └── amenities.ts            # Amenity type + AMENITIES data constant
│   │
│   ├── styles/                     # Global styles
│   │   └── globals.css             # @theme, :root variables, base styles
│   │
│   └── proxy.ts                    # Route protection middleware (placeholder)
│
├── public/                         # Static assets
│   ├── HERO.jpg                    # Hero background (~11MB)
│   ├── logo.png / logo.svg         # Brand logos
│   ├── favicon.ico
│   ├── amenities/                  # Amenity icon images
│   ├── diffrence section images/   # Before/after transformation photos
│   ├── life at viramah images/     # Lifestyle section photos
│   └── communities.jpg             # Community section image
│
├── scripts/
│   └── content_audit.js            # Content auditing script
│
├── docs/                           # Documentation
│   ├── PROJECT_ANALYSIS.md
│   ├── ERROR_ANALYSIS.md
│   └── automated_audit.md
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── .gitignore
```

---

## 🎨 Design System — Color Palette (CSS Variables)

All colors are defined as CSS custom properties in `:root` (in `globals.css`) and mapped to Tailwind via `@theme`.

### How Colors Flow:

```
:root { --terracotta-raw: #C07A5A; }        ← Raw CSS variable
  ↓
@theme { --color-terracotta-raw: var(--terracotta-raw); }  ← Tailwind mapping
  ↓
className="text-terracotta-raw bg-terracotta-raw"          ← Usage in JSX
```

### Color Token Table

| Token               | CSS Variable          | Hex       | Usage                              |
|---------------------|-----------------------|-----------|------------------------------------|
| `terracotta-raw`    | `--terracotta-raw`    | `#C07A5A` | Primary brand, CTAs, active states |
| `terracotta-soft`   | `--terracotta-soft`   | `#D4A373` | Gradients, soft accents            |
| `sand-light`        | `--sand-light`        | `#F3EDE2` | Page backgrounds                   |
| `sand-dark`         | `--sand-dark`         | `#E8E2D9` | Borders, dividers                  |
| `charcoal`          | `--charcoal`          | `#2E2A26` | Primary text                       |
| `sage-muted`        | `--sage-muted`        | `#8B9474` | Legacy success accent              |
| `cream-warm`        | `--cream-warm`        | `#FBF7F0` | Card backgrounds, section bg       |
| `luxury-green`      | `--luxury-green`      | `#1F3A2D` | Navigation background              |
| `champagne-gold`    | `--champagne-gold`    | `#D8B56A` | Mobile nav accents                 |
| `off-white`         | `--off-white`         | `#F6F4EF` | Nav text, light surfaces           |
| `green-sage`        | `--green-sage`        | `#7A9D7B` | Primary button, CTA                |
| `blue-muted`        | `--blue-muted`        | `#6C8EA6` | Secondary button                   |
| `gold-antique`      | `--gold-antique`      | `#C2A75E` | Nav hover text                     |
| `mustard-muted`     | `--mustard-muted`     | `#D9B44A` | Accent                             |
| `ivory`             | `--ivory`             | `#F9F7F2` | Portal sidebar background          |
| `ivory-dark`        | `--ivory-dark`        | `#E6E2D3` | Deprecated / available             |
| `gold`              | `--gold`              | `#C5A059` | Clock accent, borders              |
| `gold-muted`        | `--gold-muted`        | `#D4B982` | Soft gold                          |
| `ink`               | `--ink`               | `#1C1C1C` | Dark text (portal)                 |
| `ink-black`         | `--ink-black`         | `#1a1a1a` | Loading screen text                |
| `pulp-base`         | `--pulp-base`         | `#f4f1ea` | Card system base                   |
| `pulp-shadow`       | `--pulp-shadow`       | `#d1cdc1` | Card neumorphic shadow             |
| `pulp-highlight`    | `--pulp-highlight`    | `#ffffff` | Card neumorphic highlight          |
| `card-accent`       | `--card-accent`       | `#4a5d4e` | Card accent (unused?)              |

### Easing Functions

| Token            | Value                                   | Usage                     |
|------------------|-----------------------------------------|---------------------------|
| `--ease-smooth`  | `cubic-bezier(0.23, 1, 0.32, 1)`       | General transitions       |
| `--ease-spring`  | `cubic-bezier(0.34, 1.56, 0.64, 1)`    | Bouncy / playful          |
| `--ease-mechanical` | `cubic-bezier(0.68, -0.6, 0.32, 1.6)` | Overshoot / mechanical    |

---

## 🔤 Typography System

Fonts are loaded in `src/app/layout.tsx` via `next/font/google` and assigned CSS variables:

| Font Family        | CSS Variable     | Tailwind Class  | Usage                                |
|--------------------|------------------|-----------------|--------------------------------------|
| DM Serif Display   | `--font-display` | `font-display`  | Headings, brand text, blockquotes    |
| Inter              | `--font-body`    | `font-body`     | Body text, paragraphs, form labels   |
| JetBrains Mono     | `--font-mono`    | `font-mono`     | Labels, metadata, tracking, codes    |

### Base Typography Rules (from `globals.css`)

```css
body { @apply bg-sand-light text-charcoal font-body antialiased; }
h1, h2, h3, blockquote { @apply font-display text-charcoal; }
```

### Heading Patterns (Copy from Existing Code)

```tsx
// Section heading (large, display)
<h2 className="text-5xl md:text-6xl mb-6">Curated Spaces</h2>

// Section subtitle
<p className="text-lg opacity-70">Description text here.</p>

// Section label (mono, uppercase)
<span className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
    Section Label
</span>

// Card header type indicator
<span className="font-mono text-[0.75rem] text-green-sage tracking-[2px] uppercase">
    1 SEATER
</span>

// Card large title
<h3 className="font-display text-[2.5rem] md:text-[3rem] text-charcoal leading-[0.9] uppercase tracking-[-2px]">
    The Solo
</h3>
```

---

## 🧩 Critical Patterns (Copy-Paste Templates)

### 1. Creating a New Landing Page Section

```tsx
// Location: src/components/sections/
// Pattern: Named export, import Container, use section wrapper
// See: AudienceSection.tsx, FounderSection.tsx for simple templates

import { Container } from "@/components/layout/Container";

export function NewSection() {
    return (
        <section className="py-24 bg-cream-warm border-t border-sand-dark/50">
            <Container>
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-5xl md:text-6xl mb-6">
                        Section Title
                    </h2>
                    <p className="text-lg opacity-70">
                        Section description.
                    </p>
                </div>
            </Container>
        </section>
    );
}
```

Then add it to `src/app/page.tsx`:

```tsx
import { NewSection } from "@/components/sections/NewSection";
// ...
<NewSection />
```

### 2. Creating a New UI Component

```tsx
// Location: src/components/ui/
// Pattern: Named export, use cn() from @/lib/utils, extend HTML attributes
// See: Button.tsx for CVA template, FormInput.tsx for forwardRef template

import { cn } from "@/lib/utils";

interface NewComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: "default" | "outlined";
}

export function NewComponent({ className, children, variant = "default", ...props }: NewComponentProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-sand-dark p-6",
                variant === "outlined" && "bg-transparent border-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
```

### 3. Creating a New Page (App Router)

```tsx
// Location: src/app/[route-name]/page.tsx
// Pattern: Default export, named function matching "PageNamePage"
// Server components by default; add "use client" ONLY if using hooks/interactivity
// See: login/page.tsx for client page, rooms/page.tsx for reference

// SERVER COMPONENT (default):
export default function NewPage() {
    return (
        <main className="min-h-screen flex flex-col">
            <Navigation />
            {/* Content */}
            <Footer />
        </main>
    );
}

// CLIENT COMPONENT (when using hooks/state):
"use client";
import { useState } from "react";
// ...
```

### 4. Creating a Student/Parent Portal Page

```tsx
// Location: src/app/student/[feature]/page.tsx or src/app/parent/[feature]/page.tsx
// Pattern: "use client" for interactive pages, layout.tsx handles sidebar
// The layout already provides PortalNav sidebar + sticky header
// See: student/dashboard/page.tsx, parent/visit/page.tsx

"use client";

export default function StudentFeaturePage() {
    return (
        <div>
            <h1 className="font-display text-3xl text-charcoal mb-8">Feature Name</h1>
            {/* Page content - p-8 padding already applied by layout */}
        </div>
    );
}
```

### 5. Adding a Client-Side Animation (Framer Motion)

```tsx
// Pattern: Import from "framer-motion", use motion.div
// Always add "use client" directive at top of file
// See: template.tsx for page transitions, RoomCard.tsx for motion values

"use client";

import { motion } from "framer-motion";

export function AnimatedComponent() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: "easeInOut", duration: 0.5 }}
        >
            Content
        </motion.div>
    );
}
```

### 6. Using the Button Component

```tsx
// The Button has 4 variants and 4 sizes defined via CVA
import { Button } from "@/components/ui/Button";

// Primary (default) — green-sage bg, white text
<Button>Apply Now</Button>

// Secondary — blue-muted bg
<Button variant="secondary">Learn More</Button>

// Ghost — transparent, text only
<Button variant="ghost">Cancel</Button>

// Link — underline style, mono uppercase
<Button variant="link">View All</Button>

// Sizes: "default" | "sm" | "lg" | "icon"
<Button size="lg">Large Button</Button>
```

### 7. Using the FormInput Component

```tsx
import { FormInput } from "@/components/ui/FormInput";

<FormInput
    label="Email Address"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={emailError}  // optional error message
    hint="We'll never share your email"  // optional hint
/>
```

### 8. Adding Images (Next.js Image Component)

```tsx
// Pattern: Use next/image Image component with fill + sizes
// See: DifferenceSection.tsx, LifeAtViramahSection.tsx

import Image from "next/image";

<div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
    <Image
        src="/path-to-image.jpg"
        alt="Descriptive alt text"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        quality={95}
        loading="lazy"
        className="object-cover"
    />
</div>
```

### 9. Adding a New Custom Hook

```tsx
// Location: src/hooks/
// Pattern: "use client" directive, named export starting with "use"
// See: useScrollReveal.ts

"use client";

import { useEffect, useRef, useState } from "react";

export function useCustomHook() {
    const [state, setState] = useState(false);
    // ...logic...
    return state;
}
```

### 10. Using the Container Component

```tsx
// The Container provides consistent max-width + horizontal padding
import { Container } from "@/components/layout/Container";

<Container>
    {/* Content here gets max-w-[var(--container-max)] px-5 md:px-10 lg:px-20 */}
</Container>

// With extra classes:
<Container className="relative z-10">
    {/* Merged via cn() */}
</Container>
```

---

## 📦 External Dependencies Analysis

### Core Framework
- **Next.js 16.1.6** — App Router, React Compiler enabled, image optimization configured
- **React 19.2.3** — Latest React with concurrent features

### Styling
- **Tailwind CSS 4** — via `@tailwindcss/postcss` (PostCSS plugin, NOT config file based)
- **clsx 2.1.1** — Conditional class construction
- **tailwind-merge 3.4.0** — Merges conflicting Tailwind classes
- **class-variance-authority 0.7.1** — Component variant APIs (Button)

### Animations
- **framer-motion 12.33.0** — React animation library (page transitions, cards, modals, hover effects)

### Icons
- **lucide-react 0.563.0** — Icon library (Search, MapPin, ArrowRight, etc.)

### Utilities
- **mini-svg-data-uri 1.4.4** — SVG to data URI (grain textures)

### Database (PLANNED)
- **Supabase** — Not yet installed. `src/lib/supabase.ts` exports `null` placeholder.

### DevOps
- **Vercel** — Deployment platform
- **ESLint 9** + `eslint-config-next` — Linting
- **TypeScript 5** — Strict mode

---

## 🔌 Internal Dependency Graph

```
src/app/page.tsx
├── @/components/layout/Navigation
├── @/components/layout/Footer
├── @/components/layout/Container
├── @/components/search/SearchBar
├── @/components/ui/RoomCard
├── @/components/sections/* (8 sections)
└── next/link

src/components/*
├── @/lib/utils (cn function) ← CRITICAL: used everywhere
├── @/components/layout/Container ← Used by all sections
├── @/components/ui/Button ← Used by ClosingSection, FilterBar
├── @/types/amenities ← Used by AmenitiesSection
├── framer-motion ← Used by client components
├── lucide-react ← Used for icons
└── next/image ← Used for optimized images

src/app/student/layout.tsx
├── @/components/layout/PortalNav
└── @/lib/auth (mockUser)

src/app/parent/layout.tsx
├── @/components/layout/PortalNav
└── @/lib/auth (mockUser)
```

### Circular Dependencies: ✅ NONE DETECTED
### Deep Coupling: ⚠️ Low concern — `cn()` utility is universally used (expected)
### Clear Abstraction Layers: ✅ Yes — layout/sections/ui/search separation is clean

---

## 🚫 Forbidden Actions

| Action | Reason |
|--------|--------|
| Do NOT use raw `className` string concatenation | Always use `cn()` from `@/lib/utils` |
| Do NOT add `tailwind.config.js` | Tailwind 4 uses `@theme` in CSS, NOT config file |
| Do NOT use `<img>` tag for content images | Use `next/image` `<Image>` component for optimization |
| Do NOT create new exception/error types | No error hierarchy exists yet; use standard patterns |
| Do NOT import from `node_modules` paths | Always use package name imports |
| Do NOT use relative imports across boundaries | Always use `@/*` path alias |
| Do NOT add global state management | No Redux/Zustand/Context pattern exists |
| Do NOT modify `layout.tsx` font loading | Font system is stable and correct |
| Do NOT use inline styles when Tailwind class exists | Inline styles only for dynamic values or CSS var refs |
| Do NOT create files outside existing folder patterns | See directory structure above |
| Do NOT install Supabase until explicitly asked | Placeholder exists; not ready for integration |

---

## 📐 Code Style Guide

### Quote Style
- **Double quotes** (`"`) everywhere — JSX attributes, imports, strings

### Indentation
- **4 spaces** — All TSX/TS files use 4-space indentation

### Import Ordering (EXACT pattern)
```tsx
// 1. "use client" directive (if needed, ALWAYS first line)
"use client";

// 2. Third-party/framework imports
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IconName } from "lucide-react";

// 3. Internal imports (using @/ path alias)
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";

// 4. Type imports (inline or separate)
import type { SomeType } from "@/types";
```

### Component Export Pattern
```tsx
// PAGES → default export, named function
export default function PageName() { ... }

// COMPONENTS → named export
export function ComponentName() { ... }

// UI PRIMITIVES (with forwardRef) → named const + displayName
const ComponentName = React.forwardRef<...>(...);
ComponentName.displayName = "ComponentName";
export { ComponentName };
```

### Props Interface Pattern
```tsx
// Always define interface above component
// Extend HTML attributes when appropriate
interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    variant?: "default" | "alt";
    children: React.ReactNode;
}
```

### Client vs Server Components
- **Server by default** — No directive needed for server components
- **"use client"** — ONLY when using: `useState`, `useEffect`, `useRef`, `framer-motion`, event handlers, browser APIs
- **Pattern**: Keep the `"use client"` boundary as low as possible. Sections that are pure markup (like `AudienceSection`, `FounderSection`) are server components.

### CSS Class Pattern
```tsx
// Use cn() for conditional classes
className={cn(
    "base-classes here",
    isActive && "active-classes",
    variant === "outlined" && "outlined-classes",
    className // always spread incoming className last
)}

// Use template literals only for dynamic inline styles
style={{
    backgroundImage: `url('/path.jpg')`,
    transform: `translateZ(${depth}px)`,
}}
```

### Comment Style
```tsx
// Single-line comments above the line they describe
// Use {/* JSX comments */} inside JSX

{/* Section Title */}
<h2>...</h2>

// TODO comments for planned work
// TODO: Implement with Supabase auth
```

### Blank Line Conventions
- 1 blank line between imports and component
- 1 blank line between interface and component
- 1 blank line between major JSX blocks
- No trailing blank lines in files

---

## 🎭 Animation Patterns

### Page Transitions (Global)
```tsx
// src/app/template.tsx — wraps ALL pages
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ease: "easeInOut", duration: 0.5 }}
>
```

### Scroll Reveal (CSS-based)
```tsx
// Uses data-reveal attribute + IntersectionObserver
// Defined in globals.css:
// [data-reveal] { opacity: 0; transform: translateY(30px); transition: all 1s; }
// [data-reveal="active"] { opacity: 1; transform: translateY(0); }

// Usage in hook: src/hooks/useScrollReveal.ts
```

### Interactive Card (3D Tilt via Motion Values)
```tsx
// See: RoomCard.tsx
// Uses useMotionValue + useSpring + useTransform for mouse-tracking 3D tilt
```

### Staggered Entrance (Mobile Menu)
```tsx
// Staggered children with delay
<motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.1 + i * 0.05 }}
>
```

### Standard Easing
- General: `ease: [0.23, 1, 0.32, 1]` (smooth deceleration)
- Spring: `type: "spring", stiffness: 400, damping: 30`

---

## 🔐 Authentication System (Current State)

### STATUS: PLACEHOLDER — Frontend-only mock authentication

```tsx
// src/lib/auth.ts
export type UserRole = "student" | "parent" | "admin" | "guest";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isAuthenticated: boolean;
}

// MOCK USER — Change role here to test different portals
export const mockUser: User = {
    id: "mock-user-1",
    email: "student@viramah.com",
    name: "Arjun Mehta",
    role: "student",
    isAuthenticated: true,
};
```

### Route Protection: `src/proxy.ts`
- Middleware placeholder — currently allows ALL routes
- Protected routes defined but NOT enforced: `/student`, `/parent`, `/admin`

### Login Flow
1. User selects role (student/parent) on `/login`
2. Student → redirects to `/user-onboarding/step-1`
3. Parent → redirects to `/parent/dashboard`
4. NO actual auth check happens

---

## 📊 Type System

### Core Types (`src/types/index.ts`)
```tsx
export type UserRole = 'student' | 'parent' | 'admin' | 'guest'

export interface User {
    id: string; email: string; name: string;
    role: UserRole; avatar?: string; createdAt: Date;
}

export interface Room {
    id: string; title: string;
    type: '1-seater' | '2-seater' | '3-seater';
    price: number; location: string;
    available: boolean; amenities: string[]; images: string[];
}

export interface Booking {
    id: string; userId: string; roomId: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    startDate: Date; endDate: Date; totalAmount: number;
}

export interface KYCData {
    step1: { fullName, dateOfBirth, idType, idNumber } | null;
    step2: { emergencyContactName, Phone, Relation } | null;
    step3: { dietaryPreference, sleepSchedule, noiseLevel } | null;
}
```

### Amenity Types (`src/types/amenities.ts`)
```tsx
export interface Amenity {
    id: string; title: string; icon: string; alt: string;
    category?: 'connectivity' | 'comfort' | 'security' | 'community';
}

export const AMENITIES: Amenity[] = [ /* 12 items */ ];
```

### ⚠️ Note: Duplicate `User` and `UserRole` types
- `src/types/index.ts` → Has `User` with `avatar` and `createdAt`
- `src/lib/auth.ts` → Has `User` with `isAuthenticated`
- **These are NOT the same interface.** Be careful which one you import.

---

## 🔍 Known Architectural Decisions

1. **No Testing Setup** — No test framework configured. Jest/Vitest not installed. No `__tests__` directories.
2. **Tailwind CSS v4** — Uses NEW `@theme` directive in CSS, NOT `tailwind.config.js`. Do NOT create a config file.
3. **React Compiler** — Enabled via `reactCompiler: true` in `next.config.ts` + babel plugin.
4. **Image Strategy** — `next/image` with WebP/AVIF formats, aggressive caching (1 year TTL). `unoptimized: false`.
5. **No API Routes** — `/api` directory exists but is effectively empty. Backend is planned, not implemented.
6. **Grain Texture** — Applied globally via `body::before` pseudo-element with SVG noise filter. Z-index 9999. This is intentional design.
7. **Neumorphic Cards** — RoomCard uses complex box-shadow system with `--pulp-*` variables for the neumorphic look.
8. **Floating Navigation** — Nav bar is `fixed`, centered, rounded-full, with `pointer-events-none` on the wrapper and `pointer-events-auto` on the nav itself.

---

## ⚠️ Common Pitfalls

1. **Forgetting "use client"** when using `useState`, `useEffect`, `framer-motion`, or event handlers → Next.js will throw a build error.

2. **Using `tailwind.config.js`** — This project uses Tailwind CSS 4 which configures via `@theme` in `globals.css`. DON'T create a config file.

3. **Importing the wrong `User` type** — `@/lib/auth` and `@/types/index` both export a `User` interface with different shapes.

4. **Breaking the grain overlay** — The `body::before` grain texture is at `z-index: 9999`. Using higher z-index will cover it; using `pointer-events: none` is already applied.

5. **Not using `cn()` for className merging** — Always use `cn()` from `@/lib/utils` for conditional classes. Never use string concatenation.

6. **Adding unused imports** — ESLint is configured. Unused imports WILL cause lint errors.

7. **`suppressHydrationWarning`** — Used on the clock component in Navigation to prevent hydration mismatch from `Date()` differences between server and client.

8. **Mobile responsiveness** — The project uses responsive Tailwind breakpoints (`md:`, `lg:`). Always test for mobile layouts. The Navigation has a mobile hamburger menu.

9. **Image paths with spaces** — Public folder has directories with spaces (e.g., `life at viramah images/`, `diffrence section images/`). URL-encode spaces as `%20` in `src` props.

---

## 🗃️ Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run content-audit` | Run `scripts/content_audit.js` |

---

## The Golden Rules

```
╔══════════════════════════════════════════════════════════════╗
║  1. READ THREE TIMES, WRITE ONCE                            ║
║  2. WHEN IN DOUBT, COPY THE PATTERN EXACTLY                 ║
║  3. NEW CODE MUST LOOK LIKE OLD CODE                        ║
║  4. ASK BEFORE ARCHITECTING, NEVER ASSUME                   ║
║  5. THE REPOSITORY IS SACRED — LEAVE NO TRACE OF YOUR PASSAGE ║
╚══════════════════════════════════════════════════════════════╝
```
