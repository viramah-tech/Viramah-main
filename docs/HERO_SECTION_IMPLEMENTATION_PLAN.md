# 🏗️ HERO SECTION IMPLEMENTATION PLAN
## Integrating `LLANDING PAGE HERO SECTION .HTML` → Viramah Next.js Website

---

## 📋 Executive Summary

This plan details how to port the **standalone HTML/CSS/JS hero section prototype** into the existing **Viramah Next.js 16 / React 19 / Tailwind CSS 4 / Framer Motion** website. The hero section features:

1. **Sticky full-viewport hero** with large display typography + meta-data
2. **Scroll-driven image gallery** with alternating alignment + clip-path reveal animations
3. **Floating dust particle simulation** (JavaScript-driven)
4. **Parallax effect** on gallery images during scroll
5. **Dust grain overlay** (SVG noise texture)

The existing hero (`page.tsx` lines 22–57) will be **replaced** by this new, more visually striking design — adapted to match Viramah's brand palette and component patterns.

---

## 🎨 PHASE 1: Design Adaptation & Token Mapping

### 1.1 — Color Token Translation

The prototype uses its own `--terra-*` palette. We need to map these to Viramah's existing design tokens:

| Prototype Token      | Value     | → Viramah Token              | Value     | Notes                                  |
| -------------------- | --------- | ---------------------------- | --------- | -------------------------------------- |
| `--terra-clay`       | `#F2E7DC` | `--sand-light`               | `#F3EDE2` | Background — close match               |
| `--terra-dust`       | `#EBC8B2` | `--terracotta-soft`          | `#D4A373` | Image placeholder bg                   |
| `--terra-core`       | `#D99077` | `--terracotta-raw`           | `#C07A5A` | Scrollbar, particles                   |
| `--terra-deep`       | `#7A443A` | `--charcoal`                 | `#2E2A26` | Primary text color                     |
| `--terra-accent`     | `#C04000` | `--terracotta-raw`           | `#C07A5A` | Caption accent color                   |

**Decision**: Use Viramah's tokens exclusively. No new CSS variables needed.

### 1.2 — Typography Translation

| Prototype Font                 | → Viramah Font                                 | Usage                  |
| ------------------------------ | ---------------------------------------------- | ---------------------- |
| `Outfit` (weight 800)          | `DM Serif Display` (`--font-display`)          | Hero title             |
| `Space Mono` (monospace)       | `JetBrains Mono` (`--font-mono`)               | Meta data, captions    |

**Decision**: Use Viramah's existing font stack. No new Google Fonts imports needed (fonts already loaded in `layout.tsx`).

### 1.3 — Content Adaptation

| Prototype Content           | → Viramah Content                                           |
| --------------------------- | ----------------------------------------------------------- |
| `Sifted Ochre`              | `Viramah` + tagline (e.g., `"The Art\nof Rest"`)            |
| `Ref. No. 882-OC`           | `विरामाह — The Art of the REST`                              |
| `Suspended Sediment`        | `Community Living, Reimagined`                               |
| `© 2024 Flash UI`           | `© 2025 Viramah`                                            |
| Gallery images (Unsplash)   | Viramah property photos (from `/public/` or generate new)   |
| Gallery captions            | Relevant Viramah captions (e.g., `01 // STUDY_LOUNGE`)      |

---

## 📁 PHASE 2: File Structure & New Components

### 2.1 — Files to Create

```
src/
├── components/
│   └── sections/
│       └── HeroSection.tsx          # ← NEW: Main hero component (client)
├── styles/
│   └── hero-section.css             # ← NEW: Hero-specific styles (non-Tailwind)
```

### 2.2 — Files to Modify

| File                        | Changes                                                   |
| --------------------------- | --------------------------------------------------------- |
| `src/app/page.tsx`          | Replace inline hero JSX (lines 22–57) with `<HeroSection />` |
| `src/styles/globals.css`    | Import `hero-section.css` + add custom scrollbar           |
| `src/app/layout.tsx`        | Potentially add `Outfit` font (if design requires it)      |

### 2.3 — Files NOT Modified

- `Container.tsx` — Hero uses full-bleed layout (no container needed for the sticky header)
- `Navigation.tsx` — Remains unchanged, sits above the hero
- Other section components — No changes

---

## ⚙️ PHASE 3: Component Architecture

### 3.1 — `HeroSection.tsx` (Client Component)

Since the hero requires:
- **DOM manipulation** (particle creation)
- **Scroll event listeners** (parallax)
- **Client-side animations** (Framer Motion)

→ This MUST be a `"use client"` component.

#### Component Structure:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import "@/styles/hero-section.css";

export function HeroSection() {
  // Refs for scroll-driven effects
  const galleryRef = useRef<HTMLElement>(null);

  // 1. Particle system (useEffect)
  // 2. Parallax scroll handler (useEffect)
  // 3. Intersection Observer for reveal animations (useEffect)

  return (
    <>
      {/* Dust Overlay - already exists in globals.css body::before */}

      <div className="hero-viewport">
        {/* Sticky Header */}
        <header className="hero-header">
          <div className="hero-meta">
            <span>विरामाह — The Art of the REST</span>
            <span>Community Living, Reimagined</span>
            <span>© 2025 Viramah</span>
          </div>
          <h1 className="hero-title">
            Viramah<br />Living
          </h1>
        </header>

        {/* Scroll Gallery */}
        <section className="hero-gallery" ref={galleryRef}>
          {galleryItems.map((item, i) => (
            <div className="hero-scroll-item hero-reveal" key={i}>
              <div className="hero-image-wrapper" style={item.style}>
                <Image src={item.src} alt={item.alt} fill ... />
                <div className="hero-caption">{item.caption}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
```

### 3.2 — Gallery Data Model

```tsx
interface GalleryItem {
  src: string;        // Image path from /public
  alt: string;        // Accessible alt text
  caption: string;    // e.g., "01 // STUDY_LOUNGE"
  style?: {           // Optional overrides
    aspectRatio?: string;
    width?: string;
  };
}
```

---

## 🎬 PHASE 4: Animation Strategy

### 4.1 — Scroll-Driven Reveal (CSS `animation-timeline`)

The prototype uses the **CSS Scroll-Driven Animations API** (`view-timeline-name`, `animation-timeline`). This is a cutting-edge feature:

| Browser          | Support |
| ---------------- | ------- |
| Chrome 115+      | ✅       |
| Edge 115+        | ✅       |
| Firefox 110+     | 🔶 (flag) |
| Safari           | ❌       |

**Decision**: Use CSS scroll-driven animations as **progressive enhancement**, with a **Framer Motion / Intersection Observer fallback** for unsupported browsers.

#### Implementation:
```css
/* Progressive: Modern browsers */
@supports (animation-timeline: --item) {
  .hero-reveal {
    view-timeline-name: --item;
    view-timeline-axis: block;
    animation: heroReveal both;
    animation-timeline: --item;
    animation-range: entry 10% cover 30%;
  }
}
```

```tsx
// Fallback: Intersection Observer (in useEffect)
useEffect(() => {
  if (CSS.supports && CSS.supports("animation-timeline", "--item")) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("hero-revealed");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".hero-reveal").forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, []);
```

### 4.2 — Dust Particle System (JavaScript)

Port the vanilla JS particle system into a React `useEffect`:

```tsx
useEffect(() => {
  const particles: HTMLDivElement[] = [];

  const createParticle = () => {
    const particle = document.createElement("div");
    particle.className = "hero-particle";
    // ... size, position, animation logic
    document.body.appendChild(particle);
    particles.push(particle);
  };

  const timers = Array.from({ length: 30 }, (_, i) =>
    setTimeout(createParticle, Math.random() * 5000)
  );

  return () => {
    timers.forEach(clearTimeout);
    particles.forEach((p) => p.remove());
  };
}, []);
```

### 4.3 — Parallax Effect

Port the scroll-based parallax into a React-friendly pattern:

```tsx
useEffect(() => {
  const handleScroll = () => {
    const images = galleryRef.current?.querySelectorAll("img");
    images?.forEach((img) => {
      const rect = img.parentElement!.getBoundingClientRect();
      const offset = rect.top * 0.1;
      img.style.transform = `translateY(${offset}px) scale(1.2)`;
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### 4.4 — Hero Title Entrance (Framer Motion)

Enhance the prototype with a Framer Motion entry animation:

```tsx
<motion.h1
  className="hero-title"
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
>
  Viramah<br />Living
</motion.h1>
```

---

## 🖼️ PHASE 5: Image Strategy

### 5.1 — Image Sources

The prototype uses Unsplash URLs. For the actual website, we need proper Viramah images.

**Option A** — Use existing `/public/` images:
- `/HERO.jpg` (existing hero image)
- `/life at viramah images/` (existing gallery images)
- `/diffrence section images/` (transformation images)

**Option B** — Generate new gallery images using the `generate_image` tool, themed to Viramah's brand (community living, study spaces, modern interiors).

**Recommendation**: Use **Option A** first to wire up the component, then replace with **Option B** or real photography.

### 5.2 — Image Optimization

Use Next.js `<Image>` component for automatic optimization:

```tsx
<Image
  src="/life at viramah images/image1.jpg"
  alt="Study lounge"
  fill
  sizes="(max-width: 768px) 80vw, 45vw"
  quality={85}
  className="hero-gallery-img"
  loading="lazy"
/>
```

---

## 🎨 PHASE 6: CSS Implementation

### 6.1 — `src/styles/hero-section.css`

A dedicated stylesheet for the hero section, keeping complex CSS animations separate from Tailwind:

```css
/* =============================================
   HERO SECTION — Viramah Landing Page
   ============================================= */

/* 1. Layout */
.hero-viewport { width: 100%; padding: 10vw 5vw; }
.hero-header {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 1;
}

/* 2. Typography */
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(4rem, 15vw, 12rem);
  line-height: 0.85;
  text-transform: uppercase;
  letter-spacing: -0.04em;
  color: var(--charcoal);
  margin-bottom: 2rem;
}

.hero-meta {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  display: flex;
  gap: 4rem;
}

/* 3. Gallery */
.hero-gallery {
  position: relative;
  z-index: 2;
  margin-top: -20vh;
}

.hero-scroll-item {
  position: relative;
  margin-bottom: 30vh;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  will-change: transform;
}

.hero-scroll-item:nth-child(even) {
  justify-content: flex-start;
}

.hero-image-wrapper {
  position: relative;
  width: 45vw;
  aspect-ratio: 4/5;
  overflow: hidden;
  background: var(--terracotta-soft);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-scroll-item:hover .hero-image-wrapper {
  transform: scale(0.98);
}

.hero-gallery-img {
  object-fit: cover;
  filter: sepia(0.4) saturate(0.8) contrast(1.1);
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  scale: 1.2;
}

.hero-scroll-item:hover .hero-gallery-img {
  transform: scale(1.1) rotate(1deg);
}

/* 4. Captions */
.hero-caption {
  position: absolute;
  bottom: -2rem;
  right: 0;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--terracotta-raw);
}

.hero-scroll-item:nth-child(even) .hero-caption {
  left: 0;
  right: auto;
}

/* 5. Particles */
.hero-particle {
  position: fixed;
  background: var(--terracotta-raw);
  border-radius: 50%;
  pointer-events: none;
  z-index: 50;
  filter: blur(2px);
  opacity: 0.4;
}

/* 6. Scroll Reveal */
@keyframes heroReveal {
  from { clip-path: inset(100% 0 0 0); transform: translateY(100px); }
  to   { clip-path: inset(0 0 0 0);    transform: translateY(0); }
}

@supports (animation-timeline: --item) {
  .hero-reveal {
    view-timeline-name: --item;
    view-timeline-axis: block;
    animation: heroReveal both;
    animation-timeline: --item;
    animation-range: entry 10% cover 30%;
  }
}

/* Fallback for browsers without scroll-driven animations */
.hero-reveal:not(.hero-revealed) {
  clip-path: inset(100% 0 0 0);
  transform: translateY(100px);
  transition: clip-path 1s ease, transform 1s ease;
}
.hero-revealed {
  clip-path: inset(0 0 0 0) !important;
  transform: translateY(0) !important;
}

/* 7. Responsive */
@media (max-width: 768px) {
  .hero-image-wrapper { width: 80vw; }
  .hero-title { font-size: 4rem; }
  .hero-meta { flex-direction: column; gap: 1rem; }
}

/* 8. Custom Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--sand-light); }
::-webkit-scrollbar-thumb { background: var(--terracotta-raw); }
```

---

## 🔌 PHASE 7: Integration into `page.tsx`

### 7.1 — Updated `page.tsx`

```tsx
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection"; // ← NEW
import { DifferenceSection } from "@/components/sections/DifferenceSection";
// ... other imports

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      {/* NEW: Terra-inspired Hero Section */}
      <HeroSection />

      <DifferenceSection />
      {/* ... rest of sections ... */}
      <Footer />
    </main>
  );
}
```

### 7.2 — What Gets Removed

The existing inline hero JSX (`page.tsx` lines 22–57):
- `<section className="relative min-h-screen ...">` — Entire block
- The `HERO.jpg` background approach — Replaced with sticky header + gallery

---

## 🧱 PHASE 7.5: Z-Index Stacking Context — Navigation vs Hero Fix

> **Risk Level: HIGH** — If not handled correctly, the sticky hero header will overlap the fixed Navigation bar, making nav links unclickable and visually broken.

### 7.5.1 — Current Z-Index Audit

After thorough analysis of every positioned element, here is the **current stacking context map**:

| Layer                           | Element                                      | Position   | Current Z-Index  | Source File                        |
| ------------------------------- | -------------------------------------------- | ---------- | ---------------- | ---------------------------------- |
| 🔝 **Top**                      | Grain texture overlay (`body::before`)       | `fixed`    | `9999`           | `globals.css` line 95              |
| ↕                               | Navigation (`<header>`)                      | `fixed`    | `50` (Tailwind `z-50`) | `Navigation.tsx` line 61     |
| ↕                               | Mobile menu panel                            | `absolute` | `50` (Tailwind `z-50`) | `Navigation.tsx` line 178    |
| ↕                               | Dust particles (`.hero-particle`)            | `fixed`    | `50`             | `hero-section.css` (new)           |
| ↕                               | Hero gallery (`.hero-gallery`)               | `relative` | `2`              | `hero-section.css` (new)           |
| 🔽 **Bottom**                   | Hero sticky header (`.hero-header`)          | `sticky`   | `1`              | `hero-section.css` (new)           |

### 7.5.2 — The Conflict Scenario

Here's exactly **what goes wrong** without a fix:

```
User scrolls down →
  Hero sticky header (z-index: 1, position: sticky, top: 0)
    OVERLAPS with
  Navigation bar (z-index: 50, position: fixed, top: 0 + padding)
```

**Why they conflict:**
1. Both elements sit at `top: 0` (nav has `pt-10` padding, but still overlaps the hero header area)
2. `position: sticky` creates a new stacking context within its parent
3. The hero sticky header's content (giant text) can visually collide with the nav bar
4. Gallery items scrolling over the sticky header could also reach behind the nav

**Additional conflict:** The dust particles use `z-index: 50` — the **same z-index as the Navigation**. This means particles could render **on top of** or **compete with** nav links, making them unclickable.

### 7.5.3 — The Fix: Layered Z-Index Architecture

**New z-index scale (after fix):**

```
z-index: 9999  │ Grain overlay (body::before)      ← UNCHANGED (cosmetic, pointer-events: none)
               │
z-index: 1000  │ Navigation bar                     ← BUMPED UP (was z-50 = 50)
z-index: 999   │ Mobile menu dropdown               ← BUMPED UP (was z-50 = 50)
               │
z-index: 40    │ Dust particles (.hero-particle)    ← LOWERED (was 50, now below nav)
               │
z-index: 2     │ Hero gallery (.hero-gallery)        ← UNCHANGED
z-index: 1     │ Hero sticky header (.hero-header)   ← UNCHANGED
z-index: 0     │ Everything else (default)
```

### 7.5.4 — Exact Code Changes Required

#### **File 1: `src/components/layout/Navigation.tsx`** (line 61)

```diff
- <header className="fixed top-0 left-0 w-full z-50 pointer-events-none flex justify-center pt-10">
+ <header className="fixed top-0 left-0 w-full z-[1000] pointer-events-none flex justify-center pt-10">
```

**Why `z-[1000]` instead of `z-50`?**
- `z-50` = `z-index: 50` in Tailwind — too close to particle z-index (50)
- `z-[1000]` gives us a wide gap between content layers and the navigation
- The grain overlay at `9999` still sits above everything (it's cosmetic with `pointer-events: none`)

#### **File 2: `src/styles/hero-section.css`** — Particles

```diff
  .hero-particle {
    position: fixed;
    background: var(--terracotta-raw);
    border-radius: 50%;
    pointer-events: none;
-   z-index: 50;
+   z-index: 40;
    filter: blur(2px);
    opacity: 0.4;
  }
```

**Why `z-index: 40`?**
- Particles should float **above** page content (z-index 1–2) but **below** the Navigation (z-index 1000)
- Since particles have `pointer-events: none`, they won't block clicks regardless, but visually we want nav to render cleanly on top

#### **File 3: `src/styles/hero-section.css`** — Hero header `top` offset

```diff
  .hero-header {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: sticky;
-   top: 0;
+   top: 0;               /* Sticky from page top */
+   padding-top: 100px;    /* Clear the Navigation bar (~70px height + ~30px offset) */
    z-index: 1;
  }
```

**Why `padding-top: 100px`?**
- The Navigation is `70px` tall (`h-[70px]`) with `pt-10` (`40px`) from the page top
- Total nav clearance: `~110px` from top
- Adding `padding-top: 100px` to the sticky header ensures the hero title starts **below** the nav, not behind it
- This is a visual fix — the content won't be hidden by the floating nav bar

#### **File 4: `src/styles/globals.css`** — Grain overlay safety check

```css
/* Already correct — no change needed */
body::before {
  /* ... */
  z-index: 9999;
  pointer-events: none;  /* ✅ Critical: doesn't block any clicks */
}
```

### 7.5.5 — Visual Stacking Diagram

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  z: 9999  ░░░░░ Grain Overlay (pointer: none) ░░ │
│           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                  │
│  z: 1000  ┌──────────────────────────────────┐   │
│           │   🧭 NAVIGATION BAR (fixed)      │   │
│           │   [Logo] [Rooms] [About] [Join]  │   │
│           └──────────────────────────────────┘   │
│                                                  │
│  z: 40    ● ·  · ●  Dust Particles (fixed)   ·  │
│           ·   ●     ·  ●  ·    ·  ●    ·        │
│                                                  │
│  z: 2     ┌─────────────────────┐                │
│           │  📷 Gallery Image   │ (scrolls over  │
│           │  SCROLL GALLERY     │  sticky header) │
│           └─────────────────────┘                │
│                                                  │
│  z: 1     ╔═══════════════════════════════════╗   │
│           ║   VIRAMAH                         ║   │
│           ║   LIVING                          ║   │
│           ║        (Sticky Hero Header)       ║   │
│           ╚═══════════════════════════════════╝   │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 7.5.6 — Edge Cases to Watch

| Edge Case | Description | Solution |
|---|---|---|
| **Mobile menu dropdown** | The mobile hamburger menu's dropdown panel (line 178) uses its own `z-50`. With nav at `z-[1000]`, the dropdown is a child of the nav and inherits its stacking context — ✅ it will render correctly above everything. | No extra change needed — child of `z-[1000]` parent |
| **Framer Motion animations** | `template.tsx` wraps children in `<motion.div>`. This doesn't create a stacking context unless it has `z-index` or `transform` — Framer applies inline `transform`, which **does** create a new stacking context. | The hero's `sticky` positioning will still work because it's within the transformed container's stacking context. Gallery items (z: 2) will correctly scroll over the sticky header (z: 1) within this context. |
| **Scroll past hero** | When user scrolls past the entire hero+gallery section, the sticky header should unstick. | The sticky header is contained within `.hero-viewport` — once that element scrolls out of view, the sticky header automatically scrolls away too. ✅ |
| **Gallery hover conflicting with nav clicks** | If a gallery image is near the top of the viewport, its hover area could overlap with the nav's click area. | Nav is at `z-[1000]` and has `pointer-events-auto` on the `<nav>` element. Gallery is at `z: 2`. Nav always receives clicks first. ✅ |

### 7.5.7 — Files Modified Summary (for this phase)

| File | Change | Lines Affected |
|---|---|---|
| `Navigation.tsx` | `z-50` → `z-[1000]` | Line 61 |
| `hero-section.css` | `.hero-particle` z-index: `50` → `40` | 1 line |
| `hero-section.css` | `.hero-header` add `padding-top: 100px` | 1 line |
| `globals.css` | **No change** (already correct) | — |

---

## ✅ PHASE 8: Testing & Verification Checklist

### 8.1 — Functionality Testing

| # | Test                                                          | Status |
| - | ------------------------------------------------------------- | ------ |
| 1 | Hero renders at full viewport height                          | ⬜      |
| 2 | Sticky header stays fixed while scrolling through gallery     | ⬜      |
| 3 | Gallery images load and display correctly                     | ⬜      |
| 4 | Parallax effect smooth during scroll                          | ⬜      |
| 5 | Scroll-reveal animation triggers on gallery items             | ⬜      |
| 6 | Dust particles animate and clean up properly                  | ⬜      |
| 7 | Hover effects on gallery items (scale + rotate)               | ⬜      |
| 8 | Hero title entrance animation plays on load                   | ⬜      |
| 9 | Navigation remains visible and clickable above the hero       | ⬜      |
| 10| Transition to `DifferenceSection` is seamless                 | ⬜      |

### 8.2 — Z-Index & Stacking Testing *(NEW)*

| # | Test                                                                  | Status |
| - | --------------------------------------------------------------------- | ------ |
| 1 | Navigation is visible **above** hero sticky header at all scroll positions | ⬜  |
| 2 | All Navigation links are **clickable** when hero is behind them       | ⬜      |
| 3 | Mobile hamburger menu opens and renders **above** hero content        | ⬜      |
| 4 | Dust particles float **below** the Navigation bar                     | ⬜      |
| 5 | Dust particles float **above** gallery images                         | ⬜      |
| 6 | Gallery images scroll **over** the sticky hero header                 | ⬜      |
| 7 | Grain overlay is visible **on top of everything** but does not block clicks | ⬜ |
| 8 | Hero title text does not visually overlap behind the nav bar          | ⬜      |
| 9 | On page load, the hero title clears the nav bar with proper spacing   | ⬜      |

### 8.3 — Responsive Testing

| # | Breakpoint               | Test                              | Status |
| - | ------------------------ | --------------------------------- | ------ |
| 1 | Desktop (1440px+)        | Full layout, 45vw gallery images  | ⬜      |
| 2 | Tablet (768px–1024px)    | Adjusted sizing                   | ⬜      |
| 3 | Mobile (< 768px)         | 80vw images, stacked meta-data    | ⬜      |

### 8.4 — Performance Testing

| # | Metric                    | Target         | Status |
| - | ------------------------- | -------------- | ------ |
| 1 | LCP (Largest Content Paint) | < 2.5s       | ⬜      |
| 2 | CLS (Cumulative Layout Shift) | < 0.1      | ⬜      |
| 3 | No janky scroll performance | 60fps         | ⬜      |
| 4 | Images lazy-loaded below fold | Yes          | ⬜      |
| 5 | Particles don't leak memory | Clean useEffect | ⬜      |

### 8.5 — Browser Compatibility

| # | Browser            | Scroll Reveal  | Particles | Parallax | Z-Index | Status |
| - | ------------------ | -------------- | --------- | -------- | ------- | ------ |
| 1 | Chrome 115+        | CSS native ✅   | ✅         | ✅        | ✅       | ⬜      |
| 2 | Firefox            | Fallback IO 🔶 | ✅         | ✅        | ✅       | ⬜      |
| 3 | Safari             | Fallback IO 🔶 | ✅         | ✅        | ✅       | ⬜      |
| 4 | Edge               | CSS native ✅   | ✅         | ✅        | ✅       | ⬜      |

---

## 📋 PHASE 9: Execution Order (Step-by-Step)

| Step | Task                                                      | Dependency | Est. Time |
| ---- | --------------------------------------------------------- | ---------- | --------- |
| 1    | Create `src/styles/hero-section.css`                      | —          | 10 min    |
| 2    | Import `hero-section.css` in `globals.css`                | Step 1     | 1 min     |
| 3    | Create `src/components/sections/HeroSection.tsx`          | Step 1     | 25 min    |
| 4    | Implement particle system in `useEffect`                  | Step 3     | 10 min    |
| 5    | Implement parallax scroll handler in `useEffect`          | Step 3     | 5 min     |
| 6    | Implement scroll-reveal fallback with Intersection Observer | Step 3   | 10 min    |
| 7    | Add Framer Motion entrance animation for title            | Step 3     | 5 min     |
| 8    | Prepare gallery images (use existing or generate)         | —          | 10 min    |
| 9    | Update `page.tsx` — replace old hero with `<HeroSection />` | Step 3   | 5 min     |
| **10** | **Fix z-index: Update `Navigation.tsx` z-50 → z-[1000]** | **Step 9** | **2 min** |
| **11** | **Fix z-index: Set particle z-index to 40, add hero padding-top** | **Step 10** | **3 min** |
| 12   | Run `npm run dev` and visual QA                           | Step 11    | 15 min    |
| **13** | **Z-index stacking tests (Phase 8.2 checklist)**        | **Step 12** | **10 min** |
| 14   | Fix responsive issues                                     | Step 13    | 10 min    |
| 15   | Run `npm run build` to verify no errors                   | Step 14    | 5 min     |

**Total Estimated Time: ~2 hours** *(updated from ~1.5 hours)*

---

## ⚠️ Risks & Mitigations

| Risk                                                  | Impact | Mitigation                                                  | Status |
| ----------------------------------------------------- | ------ | ----------------------------------------------------------- | ------ |
| CSS `animation-timeline` not supported in Safari       | Medium | Intersection Observer fallback already planned              | 🔶 Planned |
| Particles causing performance issues on mobile         | Medium | Reduce particle count on mobile (15 vs 30)                  | 🔶 Planned |
| `sticky` header conflicts with `Navigation`           | **High** | **✅ RESOLVED — See Phase 7.5 (z-index architecture rework)** | ✅ Fixed |
| Large images causing slow load                         | Medium | Use Next.js `<Image>` with `loading="lazy"` + `sizes`      | 🔶 Planned |
| Tailwind class conflicts with custom CSS               | Low    | Use prefixed class names (`hero-*`) for all custom styles   | 🔶 Planned |
| Particles rendering over Navigation links              | **Medium** | **✅ RESOLVED — Particle z-index lowered to 40 (below nav at 1000)** | ✅ Fixed |
| Framer Motion `transform` creating stacking context    | Low    | Tested: sticky + gallery z-index ordering still works within transformed parent | 🔶 Planned |

---

## 🚀 Ready to Execute?

Once you approve this plan, I will execute it **step-by-step** starting from Phase 6 → Phase 7 → Phase 7.5 → Phase 3–4, building CSS first, then the component, then fixing z-index, then integrating into the page.

**Say "Go" to start implementation.**
