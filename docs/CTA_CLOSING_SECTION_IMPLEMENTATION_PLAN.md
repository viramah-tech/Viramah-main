# CTA Closing Section — Implementation Plan

**Target file:** `src/components/sections/ClosingSection.tsx`
**CSS file:** `src/styles/cta-section.css` (new)
**Design reference:** `ctasection.html`

---

## 1. Overview

Replace the current gradient terracotta `ClosingSection` with the pulp-paper / debossed card CTA design from `ctasection.html`, fully adapted to Viramah's brand tokens and Next.js patterns.

Key design traits to carry over:
- Off-white sand paper background (`--pulp-bg` → `--sand-light` / `--cream-warm`)
- Debossed inset `box-shadow` card
- Grain texture overlay (already global — no extra work needed)
- IBM Plex Mono labels (mapped to `font-mono` / `JetBrains Mono`)
- Two-column grid (headline + meta/coordinates), stacked on mobile
- Staggered scroll-reveal entrance animations
- Subtle mouse-tilt parallax (desktop only)
- Stamped ink-black button with terracotta hover

---

## 2. Design → Brand Token Mapping

| HTML variable         | Viramah CSS token          | Value                  |
|-----------------------|----------------------------|------------------------|
| `--pulp-bg`           | `--cream-warm`             | `#FBF7F0`              |
| `--ink-black`         | `--ink-black` / `--charcoal` | `#1a1a1a` / `#2E2A26` |
| `--accent-clay`       | `--terracotta-raw`         | `#C07A5A`              |
| `--pulp-fiber`        | `--pulp-shadow`            | `#d1cdc1`              |
| `font-mono`           | `JetBrains Mono`           | (already loaded)       |
| Display font          | `DM Serif Display`         | (already loaded)       |

---

## 3. Step-by-Step Implementation

### Step 1 — Create `src/styles/cta-section.css`

Extracted and adapted CSS from `ctasection.html`:

```css
/* -------------------------------------------------- */
/* CTA / Closing Section                              */
/* -------------------------------------------------- */

.cta-section-wrapper {
  padding: 4rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--cream-warm);
  position: relative;
  overflow: hidden;
}

/* Main debossed card */
.cta-pulp-card {
  position: relative;
  width: 100%;
  max-width: 1100px;
  background: var(--cream-warm);
  padding: 6rem 4rem;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: end;

  box-shadow:
    inset 2px 2px 5px rgba(0, 0, 0, 0.05),
    inset -2px -2px 5px rgba(255, 255, 255, 0.8),
    0.5px 0.5px 0px rgba(0, 0, 0, 0.1);

  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  transform-style: preserve-3d;
  will-change: transform;
}

.cta-pulp-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.08;
  pointer-events: none;
  border-radius: 4px;
}

/* Fiber accent line */
.cta-fiber-line {
  position: absolute;
  right: -5%;
  top: 10%;
  width: 50%;
  height: 80%;
  pointer-events: none;
  opacity: 0.07;
  border-left: 1px solid var(--charcoal);
  transform: rotate(5deg);
}

/* Decorative dot cluster */
.cta-dots {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.cta-dot {
  width: 6px;
  height: 6px;
  background: var(--terracotta-raw);
  border-radius: 50%;
  opacity: 0.35;
}

/* Mono label */
.cta-mono-label {
  font-family: var(--font-mono), "JetBrains Mono", monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--terracotta-raw);
  display: block;
  margin-bottom: 1.25rem;
}

/* Headline */
.cta-headline {
  font-family: var(--font-display), "DM Serif Display", serif;
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 700;
  line-height: 0.95;
  color: var(--charcoal);
  letter-spacing: -0.04em;
  margin-bottom: 1.75rem;
}

/* Description */
.cta-description {
  font-size: 1.05rem;
  line-height: 1.65;
  color: #4a4a4a;
  max-width: 380px;
  margin-bottom: 2.5rem;
}

/* Stamped button */
.cta-stamped-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.1rem 2.25rem;
  background: var(--charcoal);
  color: var(--cream-warm);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.06em;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.cta-stamped-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  background: var(--terracotta-raw);
}

.cta-stamped-btn:active {
  transform: translateY(1px);
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.25);
}

/* Secondary ghost button */
.cta-ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.1rem 2.25rem;
  background: transparent;
  color: var(--charcoal);
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.06em;
  border-radius: 2px;
  border: 1px solid var(--charcoal);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.cta-ghost-btn:hover {
  background: var(--charcoal);
  color: var(--cream-warm);
}

/* Availability badge */
.cta-availability {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono), "JetBrains Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--charcoal);
  opacity: 0.6;
  margin-top: 1.5rem;
}

.cta-availability-dot {
  width: 6px;
  height: 6px;
  background: #6db779;
  border-radius: 50%;
  animation: ctaPulse 2s ease-in-out infinite;
}

@keyframes ctaPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

/* ---------------------------------- */
/* Responsive                         */
/* ---------------------------------- */

@media (max-width: 900px) {
  .cta-pulp-card {
    grid-template-columns: 1fr;
    padding: 3.5rem 2rem;
    gap: 2rem;
  }

  .cta-headline {
    font-size: clamp(2.5rem, 10vw, 3.5rem);
  }

  .cta-fiber-line {
    display: none;
  }

  .cta-meta {
    text-align: left !important;
  }

  .cta-dots {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .cta-section-wrapper {
    padding: 2.5rem 1rem;
  }

  .cta-pulp-card {
    padding: 2.5rem 1.5rem;
  }

  .cta-btn-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .cta-stamped-btn,
  .cta-ghost-btn {
    width: 100%;
    justify-content: center;
  }
}

/* ---------------------------------- */
/* Parallax tilt — disable on touch   */
/* ---------------------------------- */

@media (hover: none) {
  .cta-pulp-card {
    transition: none !important;
    transform: none !important;
  }
}
```

---

### Step 2 — Import CSS in `globals.css`

Add to the top import block:

```css
@import "./cta-section.css";
```

---

### Step 3 — Rewrite `ClosingSection.tsx`

Full replacement component:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ScheduleVisitModal } from "@/components/ui/ScheduleVisitModal";

export function ClosingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Mouse tilt parallax — desktop only
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const xAxis = (window.innerWidth / 2 - e.pageX) / 55;
      const yAxis = (window.innerHeight / 2 - e.pageY) / 55;
      card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = "rotateY(0deg) rotateX(0deg)";
    };

    // Only attach on non-touch devices
    const mq = window.matchMedia("(hover: hover)");
    if (mq.matches) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const revealClass = (delay: string) =>
    `transition-all duration-1000 ease-smooth ${
      isVisible
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-8"
    }`;

  return (
    <>
      <section ref={sectionRef} className="cta-section-wrapper">
        <div ref={cardRef} className="cta-pulp-card">
          <div className="cta-fiber-line" aria-hidden="true" />

          {/* Left — Primary content */}
          <div className="cta-content">
            <span
              className="cta-mono-label"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.9s cubic-bezier(0.23,1,0.32,1) 0.1s",
              }}
            >
              Admissions // 2025.AUG
            </span>

            <h2
              className="cta-headline"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.2s",
              }}
            >
              Ready to <br />rest?
            </h2>

            <p
              className="cta-description"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.3s",
              }}
            >
              Applications for the upcoming academic year are now open.
              Spaces are limited — secure yours before the intake closes.
            </p>

            <div
              className="cta-btn-group flex flex-wrap gap-3"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(20px)",
                transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.4s",
              }}
            >
              <Link href="/signup" className="cta-stamped-btn">
                APPLY NOW
              </Link>
              <button
                className="cta-ghost-btn"
                onClick={() => setIsModalOpen(true)}
              >
                SCHEDULE A VISIT
              </button>
            </div>

            <div
              className="cta-availability"
              style={{
                opacity: isVisible ? 0.6 : 0,
                transition: "opacity 1s cubic-bezier(0.23,1,0.32,1) 0.55s",
              }}
            >
              <span className="cta-availability-dot" />
              Accepting applications
            </div>
          </div>

          {/* Right — Meta / coordinates */}
          <div
            className="cta-meta"
            style={{
              textAlign: "right",
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s cubic-bezier(0.23,1,0.32,1) 0.5s",
            }}
          >
            <div className="cta-dots">
              <div className="cta-dot" />
              <div className="cta-dot" />
              <div className="cta-dot" />
            </div>
            <span className="cta-mono-label" style={{ marginBottom: 0 }}>
              Viramah // Est. 2024
            </span>
          </div>
        </div>
      </section>

      <ScheduleVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
```

---

### Step 4 — Add `ease-smooth` to Tailwind config / globals.css

The `ease-smooth` custom easing is already defined in `globals.css` under `@theme`:

```css
--ease-smooth: cubic-bezier(0.23, 1, 0.32, 1);
```

It is already mapped, so Tailwind utility `ease-smooth` is available.

---

## 4. Bug-Fixing Checklist

| # | Issue | Fix |
|---|-------|-----|
| 1 | **Tilt on touch devices** — parallax transform fires on scroll via touch, causing jittery card movement | Guard `mousemove` listener with `window.matchMedia("(hover: hover)")` (already in plan above) |
| 2 | **SSR mismatch** — `window` access during server render | All `window` calls live inside `useEffect`, safe for Next.js SSR |
| 3 | **`transform-style: preserve-3d` flicker on Safari** | Add `will-change: transform` and `backface-visibility: hidden` to `.cta-pulp-card` |
| 4 | **Stagger delay on repeated navigation** — `isVisible` stays `true` after hydration; animations replay only on first visit | The `IntersectionObserver` calls `disconnect()` after triggering — correct behaviour |
| 5 | **Font mismatch** — HTML uses `IBM Plex Mono`, project uses `JetBrains Mono` | CSS fallback chain: `var(--font-mono), "JetBrains Mono", monospace` handles it |
| 6 | **`opacity: 0` button flicker** — original HTML hard-coded `opacity: 0` on button as inline style | Replaced with React state-driven inline styles; no static hidden elements |
| 7 | **Grain overlay `z-index: 9999`** — already applied globally in `globals.css` via `body::before`; do not duplicate | Do **not** re-add `.pulp-overlay` inside the component |
| 8 | **`ScheduleVisitModal` import** — already present in old `ClosingSection.tsx`; preserve it | Kept in the new component |
| 9 | **Button accessible name** — `<button>` without visible text fallback on icon-only views | Both buttons have full text labels; no issue |
| 10 | **Color contrast** — `#4a4a4a` on `#FBF7F0` background | Contrast ratio ≈ 7.5:1 — passes WCAG AA |

---

## 5. Responsiveness Specification

| Breakpoint | Layout | Notes |
|------------|--------|-------|
| `≥ 900px` (desktop) | 2-column grid (`1fr 1fr`) | Tilt parallax enabled |
| `640px – 900px` (tablet) | Single column, full-width card | Meta block left-aligned, fiber line hidden |
| `< 640px` (mobile) | Single column, reduced padding | Button group stacks vertically, both buttons full-width |
| Touch devices (any size) | Parallax disabled via `(hover: none)` media query | Prevents jank from touchmove |

---

## 6. File Change Summary

| File | Action |
|------|--------|
| `src/styles/cta-section.css` | **Create** new CSS module |
| `src/styles/globals.css` | **Add** `@import "./cta-section.css";` |
| `src/components/sections/ClosingSection.tsx` | **Replace** existing implementation |

No changes required to `page.tsx`, `Footer.tsx`, `Navigation.tsx`, or any other file.

---

## 7. Implementation Order

1. Create `src/styles/cta-section.css`
2. Import it in `globals.css`
3. Rewrite `ClosingSection.tsx`
4. Verify in browser — check desktop tilt, mobile stack, scroll animation, modal open/close
