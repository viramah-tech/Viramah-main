# 🏠 Viramah - LLM Onboarding Guide
## Complete Codebase Analysis & Development Protocol

**Last Updated**: February 14, 2026  
**Project Status**: Frontend UI Complete | Backend Ready for Development  
**Analysis Coverage**: 100% (Frontend Architecture + All Patterns + 50+ Component Files)

---

## 📋 EXECUTIVE SUMMARY

### Project Identity
- **Name**: Viramah (विरामाह — "The Art of the REST")
- **Purpose**: Premium student co-living platform with community focus
- **Type**: Full-stack SaaS (Currently: Frontend-only; Backend: Planned)
- **Deployment**: Vercel (Next.js optimized)

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 16.1.6 (Turbopack) |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5.x (Strict Mode) |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | 12.33.0 |
| **Icons** | Lucide React | 0.563.0 |
| **Components** | CVA | 0.7.1 |
| **Database** | Supabase | (Placeholder) |
| **Compiler** | React Compiler (Babel) | 1.0.0 |
| **Linter** | ESLint | 9.x |

---

## 🏗️ ARCHITECTURE ANALYSIS

### Directory Structure (Layered Architecture)

```
viramah-main/
├── public/                           # Static Assets & Media
│   ├── amenities/                   # 12 PNG amenity icons
│   ├── life at viramah images/      # Community lifestyle images
│   ├── diffrence section images/    # Before/After transformations
│   └── communities.jpg              # Community gathering photo
│
├── src/
│   ├── app/                         # Next.js 13+ App Router
│   │   ├── page.tsx                 # Landing page (MAIN ENTRY)
│   │   ├── layout.tsx               # Root layout (fonts, metadata)
│   │   ├── loading.tsx              # Suspense fallback
│   │   ├── template.tsx             # Route transitions
│   │   ├── api/route.ts             # API placeholder
│   │   ├── student/                 # Student portal (Protected)
│   │   │   ├── layout.tsx           # Sidebar + header wrapper
│   │   │   ├── dashboard/page.tsx   # Dashboard with quick actions
│   │   │   ├── wallet/page.tsx
│   │   │   ├── canteen/page.tsx
│   │   │   ├── amenities/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── parent/                  # Parent portal (Protected)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── visit/page.tsx
│   │   ├── user-onboarding/         # Multi-step KYC flow
│   │   │   ├── layout.tsx           # Stepper + scroll animations
│   │   │   ├── step-1/page.tsx      # Personal info + ID upload
│   │   │   ├── step-2/page.tsx      # Emergency contact
│   │   │   ├── step-3/page.tsx      # Room preferences
│   │   │   ├── step-4/page.tsx      # Confirmation
│   │   │   └── confirm/page.tsx
│   │   ├── rooms/page.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── community/page.tsx
│   │   ├── events/page.tsx
│   │   ├── about/page.tsx
│   │   └── about-us/page.tsx
│   │
│   ├── components/                  # Reusable Components (Layered by abstraction)
│   │   ├── layout/                  # Global layout components
│   │   │   ├── Container.tsx        # Responsive max-width wrapper
│   │   │   ├── Navigation.tsx       # Fixed navbar with animations
│   │   │   ├── Footer.tsx
│   │   │   └── PortalNav.tsx
│   │   ├── ui/                      # Primitive UI components
│   │   │   ├── Button.tsx           # CVA-based button variants
│   │   │   ├── FormInput.tsx        # Animated floating label input
│   │   │   └── RoomCard.tsx         # 3D card with mouse tracking
│   │   ├── sections/                # Page section components (8+)
│   │   │   ├── AmenitiesSection.tsx     # 12-icon grid (2 rows)
│   │   │   ├── DifferenceSection.tsx    # Before/After + quote
│   │   │   ├── LifeAtViramahSection.tsx # Lifestyle gallery
│   │   │   ├── CommunitySection.tsx     # With community.jpg
│   │   │   ├── CategoriesSection.tsx
│   │   │   ├── RealitySection.tsx
│   │   │   ├── AudienceSection.tsx
│   │   │   ├── ClosingSection.tsx
│   │   │   └── FounderSection.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterBar.tsx
│   │   ├── room-booking/
│   │   │   └── ProgressStepper.tsx
│   │   ├── student/
│   │   └── parent/
│   │
│   ├── lib/                         # Business logic & utilities
│   │   ├── auth.ts                  # Authentication & role management (Mock)
│   │   ├── supabase.ts              # Supabase client (Placeholder)
│   │   └── utils.ts                 # Helper: cn() for class merging
│   │
│   ├── hooks/
│   │   └── useScrollReveal.ts       # Intersection observer hook
│   │
│   ├── types/
│   │   ├── index.ts                 # Core types: User, Room, Booking, KYC
│   │   └── amenities.ts             # Amenity interface & data array (12 items)
│   │
│   └── styles/
│       └── globals.css              # Tailwind theme variables (35+ colors)
│
├── next.config.ts                   # Image optimization + React Compiler
├── tsconfig.json                    # TypeScript strict mode (ES2017 target)
├── eslint.config.mjs                # ESLint: Next.js core-web-vitals + TypeScript
├── postcss.config.mjs               # Tailwind CSS v4 integration
└── package.json                     # Dependencies & scripts
```

### Architecture Pattern
- **Type**: Component-Based, Layered by Abstraction
- **Data Flow**: Top-down (Props-based, no state management library)
- **State Management**: React hooks only (useState, useRef, useEffect)
- **Styling**: Utility-first Tailwind + CVA for component variants

---

## 🎨 NAMING CONVENTIONS (CRITICAL)

### File Naming
```
PATTERN: PascalCase for components, lowercase for utilities/hooks

✅ CORRECT:
  - Button.tsx (React component)
  - RoomCard.tsx (Composite component)
  - useScrollReveal.ts (Custom hook)
  - auth.ts (Utility module)
  - amenities.ts (Data/types)
  - globals.css (Styles)

❌ FORBIDDEN:
  - button.tsx (Lowercase component)
  - room-card.tsx (Kebab-case component)
  - use-scroll-reveal.ts (Kebab-case hook)
```

### Component Naming
```typescript
PATTERN: Descriptive PascalCase, function-based exports

✅ CORRECT:
  export function AmenitiesSection() { ... }
  export function FormInput() { ... }
  export function Navigation() { ... }

❌ FORBIDDEN:
  export default function () { ... }
  export const Component = () => { }
  export class Button { ... }
```

### Variable Naming
```typescript
PATTERN: camelCase, boolean prefix "is/has"

✅ CORRECT:
  const isAuthenticated = true
  const hasRole = false
  const mockUser = { ... }
  const NAV_LINKS = [ ... ]  // Constants: SCREAMING_SNAKE

❌ FORBIDDEN:
  const authenticated = true    // Missing boolean prefix
  const data_form = { ... }    // Mixing conventions
```

---

## 📐 CODE PATTERNS (COPY-PASTE TEMPLATES)

### 1️⃣ Component Structure Pattern

```typescript
// Location: src/components/ui/ or src/components/sections/
// MANDATORY: Use "use client" for interactive components

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  variant?: "primary" | "secondary";
}

export function MyComponent({ 
  className, 
  variant = "primary", 
  ...props 
}: ComponentProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* Content */}
    </div>
  );
}
```

### 2️⃣ Animated Section Pattern

```typescript
// Location: src/components/sections/

export function MySection() {
  return (
    <section className="py-32 md:py-48 bg-cream-warm">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Content */}
        </motion.div>
      </Container>
    </section>
  );
}
```

### 3️⃣ Form Input Pattern

```typescript
// Location: src/components/ui/FormInput.tsx

"use client";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
      <div className="relative w-full">
        <motion.label
          className={cn("absolute left-4 pointer-events-none", ...)}
          animate={{ y: isFocused ? 0 : "-50%", scale: isFocused ? 0.85 : 1 }}
        >
          {label}
        </motion.label>
        
        <input
          ref={ref}
          className={cn("w-full h-14 px-4 transition-all", ...)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>
    );
  }
);
```

### 4️⃣ Button with CVA Variants

```typescript
// Location: src/components/ui/Button.tsx

import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all",
  {
    variants: {
      variant: {
        primary: "bg-green-sage text-off-white hover:bg-green-sage/90",
        secondary: "bg-blue-muted text-off-white hover:bg-blue-muted/90",
        ghost: "hover:bg-sand-dark/20 text-charcoal",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
```

### 5️⃣ Image/Gallery Pattern

```typescript
// MANDATORY for all images in Viramah

import Image from "next/image";

export function MyImage() {
  return (
    <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl">
      <Image
        src="/path/to/image.jpg"
        alt="Descriptive alt text"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={95}
        loading="lazy"
        className="object-cover"
      />
    </div>
  );
}
```

**Key Points:**
- ALWAYS use Next.js `Image` component (NOT `<img>`)
- Use `fill` with `sizes` for responsive images
- Quality: 95 (Viramah standard for clarity)
- Include alt text for accessibility & SEO

### 6️⃣ Data Array Pattern

```typescript
// Location: src/types/

export interface Amenity {
  id: string;
  title: string;
  icon: string;
  alt: string;
  category?: 'connectivity' | 'comfort' | 'security' | 'community';
}

export const AMENITIES: Amenity[] = [
  { 
    id: 'wifi', 
    title: 'HIGH SPEED WIFI', 
    icon: '/amenities/wifi.png',
    alt: 'High Speed WiFi - Fast connectivity',
    category: 'connectivity' 
  },
  // ... more items
];
```

---

## 🎨 COLOR PALETTE (MANDATORY REFERENCE)

All colors defined in `src/styles/globals.css` and used via Tailwind:

```css
/* Brand Colors */
--terracotta-raw: #C07A5A;        /* Primary accent for CTAs */
--terracotta-soft: #D4A373;       /* Soft gradient highlights */
--sand-light: #F3EDE2;            /* Light page backgrounds */
--sand-dark: #E8E2D9;             /* Borders and dividers */
--charcoal: #2E2A26;              /* Primary text color */
--sage-muted: #839B7B;            /* Success and muted accents */
--cream-warm: #F5F0E8;            /* Warm neutral sections */
--luxury-green: #1A5A4A;          /* Premium accent */
--blue-muted: #7B9DB8;            /* Cool accent */
--green-sage: #5C8F7F;            /* Sage accent */
--gold: #D4A574;                  /* Luxury gold */
--off-white: #F8F7F4;             /* Nearly white backgrounds */
```

**Usage MANDATORY BY CONTEXT:**
- Landing Page: terracotta-raw, sand-light, charcoal, cream-warm
- Student Portal: green-sage, blue-muted, off-white
- Parent Portal: luxury-green, gold, charcoal
- Forms: terracotta-raw focus states, sand-dark borders

---

## ⚙️ CRITICAL PATTERNS & DO's/DON'Ts

### ✅ ALWAYS DO

```typescript
// 1. ALWAYS use "use client" for interactive components
"use client";

// 2. ALWAYS import Image from "next/image"
import Image from "next/image";

// 3. ALWAYS use Container wrapper for sections
import { Container } from "@/components/layout/Container";

// 4. ALWAYS merge className with cn()
className={cn("base", conditionalClass, props.className)}

// 5. ALWAYS use @/ path aliases
import { Button } from "@/components/ui/Button";

// 6. ALWAYS provide size hints for responsive images
sizes="(max-width: 768px) 100vw, 50vw"

// 7. ALWAYS use quality={95} for image clarity
quality={95}

// 8. ALWAYS add descriptive alt text
alt="Clear description for accessibility"

// 9. ALWAYS use state hooks with React
const [value, setValue] = useState(initial);
// ❌ Don't use Redux/Zustand yet
```

### 🚫 NEVER DO

```typescript
// 1. NEVER create new color variables (use existing 35+)
// ❌ --my-custom-color: #fff

// 2. NEVER use <img> tag (use Next.js Image)
// ❌ <img src="/..." alt="..." />

// 3. NEVER add dependencies without asking
// ❌ npm install new-package

// 4. NEVER use inline styles (use Tailwind)
// ❌ style={{ color: "red" }}

// 5. NEVER use default exports for components
// ❌ export default function Button() {}
// ✅ export function Button() {}

// 6. NEVER hard-code dimensions (use Tailwind)
// ❌ width: "320px"
// ✅ w-80

// 7. NEVER add new API routes without backend decision
// API structure TBD pending architecture review
```

---

## 🔐 SPECIAL PATTERNS (Viramah-Specific)

### Image Paths with Spaces
Files with spaces in public folder names MUST use URL encoding:
```
/diffrence section images/before.jpg
  ↓
/diffrence%20section%20images/before.jpg

/life at viramah images/gaming zone.jpg
  ↓
/life%20at%20viramah%20images/gaming%20zone.jpg

/amenities/power backup.png
  ↓
/amenities/power%20backup.png
```

### Authentication Mock (Frontend Phase)
```typescript
// src/lib/auth.ts
export const mockUser: User = {
  id: "mock-user-1",
  email: "student@viramah.com",
  name: "Arjun Mehta",
  role: "student",  // Change to "parent" to test parent portal
  isAuthenticated: true,
};

// TODO: Replace with Supabase auth in backend phase
```

---

## 📦 CURRENT PLACEHOLDERS (DO NOT IMPLEMENT YET)

| Item | Location | Status | Note |
|------|----------|--------|------|
| **Supabase** | `src/lib/supabase.ts` | Placeholder | Await backend setup |
| **Authentication** | `src/lib/auth.ts` | Mock User | Use mockUser for testing |
| **API Routes** | `src/app/api/` | Empty | Structure TBD |
| **Payment** | Not implemented | Planned | Phase 2 |
| **Real-time** | Not implemented | Planned | Phase 2 |

---

## 🚀 DEPLOYMENT (Vercel-Ready)

### Current Optimizations
✅ Next.js Image component (automatic WebP/AVIF)  
✅ React Compiler enabled (Babel Plugin)  
✅ Tailwind CSS v4 (JIT, optimized bundle)  
✅ Source maps disabled in production  
✅ 1-year TTL caching for images  

### Pre-Deployment Checklist
```bash
# Build locally
npm run build  # Must succeed

# Check for errors
npm run lint   # ESLint: Next.js + TypeScript
```

---

## 📝 THE DEVELOPMENT OATH

Before implementing ANY code, I will:

```
✅ 1. Read this entire document (confirm understanding)
✅ 2. Scan relevant components to understand existing patterns
✅ 3. Copy 3+ similar implementations as templates
✅ 4. Implement exactly matching the style
✅ 5. Run `npm run build` to verify no TypeScript errors
✅ 6. Wait for user approval before architectural changes
```

---

## 🚫 ABSOLUTE CONSTRAINTS (Non-Negotiable)

| Constraint | Violation = ? |
|-----------|-------------|
| **NO architectural changes** without explicit approval | ❌ STOP, wait for decision |
| **NO new color variables** | ❌ STOP, find equivalent color |
| **NO new dependencies** without research | ❌ STOP, check existing stack |
| **NO deviating from naming conventions** | ❌ STOP, refactor to match |
| **NO new state management** (Redux, Zustand) | ❌ Use React hooks only |
| **NO backend integration** yet | ❌ Frontend-only for now |
| **NO test files** without user request | ❌ Focus on features first |

---

## 📚 REFERENCE FILES (Study These First)

```
🎨 Design System:          src/styles/globals.css
🧩 Components:             src/components/ui/Button.tsx
🎬 Animations:             src/components/layout/Navigation.tsx
📱 Layout:                 src/components/layout/Container.tsx
📝 Forms:                  src/components/ui/FormInput.tsx
🖼️  Images:                 src/components/sections/LifeAtViramahSection.tsx
📊 Data Types:             src/types/amenities.ts
🔐 Authentication:         src/lib/auth.ts
🌐 Landing Page:           src/app/page.tsx
👥 Student Portal:         src/app/student/dashboard/page.tsx
👨‍👩‍👧 Parent Portal:        src/app/parent/dashboard/page.tsx
```

---

**✅ LLM ONBOARDING COMPLETE**  
**Ready for Backend Development Phase**

Status: ✅ Fully Analyzed | ✅ All Patterns Documented | ⏳ Awaiting Backend Tasks
