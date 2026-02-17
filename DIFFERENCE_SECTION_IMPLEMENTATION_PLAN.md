# 🪨 DIFFERENCE SECTION — "Basalt Bifurcation" Implementation Plan

---

## 📋 Executive Summary

This plan adapts the standalone `difrence section.html` prototype (a dark-themed "Basalt Bifurcation" before/after image comparison slider) into the existing **Viramah Next.js website**, replacing the current `DifferenceSection.tsx` (a basic 3-column image grid with no interactivity).

The new section features:
- **Interactive before/after comparison sliders** with mouse-driven bifurcation line
- **Dark theme contrast** against the site's light sand palette
- **Touch-friendly mobile support** (the prototype only has `onmousemove`)
- **Scroll-reveal entrance animations** using Framer Motion
- **Next.js `<Image>` optimization** instead of raw `<img>` tags
- **Full responsive layout** across 4 breakpoints

---

## 🔍 PHASE 1: Prototype Analysis

### 1.1 — What the Prototype Does

| Feature | Implementation | Notes |
|---|---|---|
| **Dark background** | `--basalt-dark: #0a0a0b` | Full dark theme — contrasts heavily with Viramah's `--sand-light` |
| **2-column grid** | `grid-template-columns: repeat(2, 1fr)` | 600px tall "monolith" cards |
| **Before/After slider** | `clip-path: inset(0 var(--split) 0 0)` on before image | CSS variable `--split` controlled by JS |
| **Bifurcation line** | Absolutely positioned `1px` white line with glow | Follows mouse position |
| **Mouse interaction** | `onmousemove` → calculates `%` → sets `--split` | No touch support |
| **Mouse leave reset** | Snaps back to 50% with `0.8s` transition | Smooth return animation |
| **Labels** | "PRIMARY_STATE" / "MUTATED_STATE" overlays | Glassmorphism-style tags |
| **Entry animation** | CSS `@keyframes reveal` with staggered delays | `opacity + translateY` |
| **Grain overlay** | `body::before` with SVG noise texture | Already exists in Viramah globals |
| **Fonts** | Inter + Space Mono | Already in Viramah as `--font-body` + `--font-mono` |

### 1.2 — Design Token Mapping (Prototype → Viramah)

| Prototype Token | Value | Viramah Equivalent | Maps To |
|---|---|---|---|
| `--basalt-dark` | `#0a0a0b` | `--charcoal` | `#2E2A26` (close but not identical — we'll use a darker variant) |
| `--basalt-grey` | `#1c1c1e` | `--ink` | `#1C1C1C` ✅ exact match |
| `--bifurcation-line` | `#ffffff` | — | Keep as `#fff` (for dark bg contrast) |
| `--accent-glow` | `rgba(255,255,255,0.15)` | — | Keep as-is |
| `--easing` | `cubic-bezier(0.23, 1, 0.32, 1)` | `--ease-smooth` | ✅ exact match |
| `font-family: Inter` | — | `var(--font-body)` | ✅ |
| `font-family: Space Mono` | — | `var(--font-mono)` | ✅ (JetBrains Mono, similar concept) |

### 1.3 — Available Images

Located in `public/diffrence section images/`:

| Image | File | Use |
|---|---|---|
| Before | `before.jpg` (63KB) | The "before" image for the slider |
| After 1 | `after (1).jpg` (102KB) | "After" image for monolith 1 |
| After 2 | `after (2).jpg` (41KB) | "After" image for monolith 2 |

**Key Decision**: The prototype uses 2 monolith cards. We have 1 before + 2 after images = perfect for 2 comparison sliders:
- **Monolith 1**: `before.jpg` ↔ `after (1).jpg`
- **Monolith 2**: `before.jpg` ↔ `after (2).jpg`

---

## 🔍 PHASE 2: Audit — Issues in the Prototype

### 2.1 — Issues Found

| # | Issue | Severity | Category | Details |
|---|---|---|---|---|
| 1 | **No touch/mobile support** | 🔴 Critical | Mobile | `onmousemove` doesn't fire on touch devices — slider is completely broken on mobile |
| 2 | **Fixed 600px height** | 🟡 Medium | Responsive | `height: 600px` overflows or wastes space on different viewports |
| 3 | **Grid collapses at 900px only** | 🟡 Medium | Responsive | Single breakpoint too aggressive — no tablet intermediate state |
| 4 | **External Unsplash images** | 🟡 Medium | Performance | Uses remote URLs. Must use local Next.js-optimized `<Image>` |
| 5 | **Inline event handlers** | 🟠 Low | React | `onmousemove="handleSplit(event, this)"` — not React-compatible |
| 6 | **No accessibility** | 🟡 Medium | A11y | No `aria-label`, no keyboard control, cursor set to `crosshair` globally |
| 7 | **No `prefers-reduced-motion`** | 🟡 Medium | A11y | Animations play regardless of user preference |
| 8 | **Labels are disconnected** | 🟠 Low | UX | "PRIMARY_STATE" / "MUTATED_STATE" are technical — should be "BEFORE" / "AFTER" for Viramah |
| 9 | **Header content is prototype-specific** | 🟡 Medium | Content | "Basalt Bifurcation" title needs to be replaced with Viramah content |
| 10 | **No scroll-triggered reveal** | 🟠 Low | UX | Entrance animation plays on page load, not when scrolled into view |
| 11 | **`clip-path` CSS variable transition** | 🟡 Medium | Browser | `clip-path` with CSS variables doesn't animate in all browsers — need JS fallback |
| 12 | **Quote section removed** | 🟡 Medium | Content | Current DifferenceSection has a quote block — need to preserve or integrate it |
| 13 | **Dark section contrast transition** | 🟠 Low | Visual | Abrupt jump from light (`--sand-light`) to dark (`--basalt-dark`) — needs smooth transition |
| 14 | **Card hover on mobile** | 🟠 Low | Mobile | `.monolith:hover { translateY(-10px) }` doesn't work properly on touch |
| 15 | **z-index conflicts** | 🟠 Low | Stacking | Label `z-index: 4` + fissure `z-index: 3` could conflict with global grain overlay (`z-index: 9999`) |

---

## 🔧 PHASE 3: Issue → Fix Mapping (All 15 Issues)

---

### Issue #1 — No touch/mobile support 🔴

**Root Cause**: Prototype only uses `onmousemove`. Touch devices fire `touchstart`, `touchmove`, `touchend` — not mouse events.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Implement both mouse AND touch event handlers using React refs:

```tsx
// React-compatible approach:
const handlePointerMove = useCallback((e: React.PointerEvent, cardRef: RefObject) => {
  const rect = cardRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = ((rect.width - x) / rect.width) * 100;
  const constrained = Math.min(Math.max(percentage, 0), 100);
  // Set CSS variable on the card
  cardRef.current.style.setProperty('--split', `${constrained}%`);
}, []);

// On the element:
<div
  onPointerMove={(e) => handlePointerMove(e, cardRef)}
  onPointerLeave={() => resetSplit(cardRef)}
  style={{ touchAction: 'pan-y' }} // Allow vertical scroll, capture horizontal
/>
```

**Why `PointerEvent`?** — `PointerEvent` unifies mouse and touch into a single API. Works on all modern browsers.

---

### Issue #2 — Fixed 600px height 🟡

**Root Cause**: `height: 600px` is hardcoded. On a 375px phone, that's taller than the viewport (667px minus nav).

**File**: `src/styles/difference-section.css`
**Fix**: Use responsive heights:

```css
.monolith { height: clamp(350px, 50vh, 600px); }

@media (max-width: 767px)  { .monolith { height: 55vw; } }    /* Aspect-ratio driven */
@media (min-width: 768px) and (max-width: 1024px) { .monolith { height: 450px; } }
```

---

### Issue #3 — Single breakpoint at 900px 🟡

**Root Cause**: Only `@media (max-width: 900px)` exists — jumps from 2-col to 1-col with no intermediate.

**File**: `src/styles/difference-section.css`
**Fix**: Use the consistent breakpoint system:

```css
@media (max-width: 767px) { /* 1 column, full width */ }
@media (min-width: 768px) and (max-width: 1024px) { /* 2 columns, tighter gap */ }
@media (min-width: 1025px) { /* 2 columns, full gap */ }
```

---

### Issue #4 — External Unsplash images 🟡

**Root Cause**: Prototype uses remote URLs. These need local Next.js `<Image>` for optimization.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Use local images with `next/image`:

```tsx
// For the "after" layer (background):
<Image src="/diffrence section images/after (1).jpg" alt="After" fill className="diff-image-after" />

// For the "before" layer (clipped):
<Image src="/diffrence section images/before.jpg" alt="Before" fill className="diff-image-before" />
```

**Note**: The `clip-path` approach works with `<Image fill>` since both the before and after images are absolutely positioned.

---

### Issue #5 — Inline event handlers 🟠

**Root Cause**: `onmousemove="handleSplit(event, this)"` is vanilla HTML — not valid React/JSX.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Use React `onPointerMove` with refs (covered in Issue #1).

---

### Issue #6 — No accessibility 🟡

**Root Cause**: No semantic markup, no ARIA labels, no keyboard control.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**:

```tsx
<div
  role="slider"
  aria-label="Before and after comparison slider"
  aria-valuenow={splitPercent}
  aria-valuemin={0}
  aria-valuemax={100}
  tabIndex={0}
  onKeyDown={handleKeyboard} // Arrow keys adjust --split by 5%
>
```

---

### Issue #7 — No `prefers-reduced-motion` 🟡

**Root Cause**: No media query guard on animations.

**File**: `src/styles/difference-section.css`
**Fix**:

```css
@media (prefers-reduced-motion: reduce) {
  .monolith { transition: none !important; }
  .monolith-wrap { animation: none !important; opacity: 1; transform: none; }
  .diff-fissure { box-shadow: none; }
}
```

---

### Issue #8 — Labels are technical 🟠

**Root Cause**: "PRIMARY_STATE" / "MUTATED_STATE" are prototype labels.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Replace with contextual Viramah content:

```
"PRIMARY_STATE" → "BEFORE"
"MUTATED_STATE" → "AFTER_VIRAMAH"
```

---

### Issue #9 — Header content is prototype-specific 🟡

**Root Cause**: "Basalt Bifurcation" is the prototype name, not the actual section title.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Use the existing quote from the current `DifferenceSection`:

```
Title: "Our Transformation" (or the existing quote)
Meta: "The Viramah Promise" + section index
```

---

### Issue #10 — Animations play on page load 🟠

**Root Cause**: CSS `animation` on `.monolith-wrap` plays immediately, even when off-screen.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Use Framer Motion `whileInView` for scroll-triggered entrance:

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: index * 0.2 }}
>
```

---

### Issue #11 — `clip-path` CSS variable transition 🟡

**Root Cause**: `clip-path: inset(0 var(--split) 0 0)` — CSS transitions don't animate custom properties in all browsers.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: On mouse leave, use `requestAnimationFrame` to smoothly interpolate `--split` back to 50%:

```tsx
const resetSplit = (ref: RefObject<HTMLDivElement>) => {
  // Read current value, animate to 50%
  const el = ref.current;
  if (!el) return;
  el.style.transition = 'clip-path 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
  el.style.setProperty('--split', '50%');
  setTimeout(() => { el.style.transition = 'none'; }, 800);
};
```

Or alternatively, apply `clip-path` directly in JS rather than through CSS variables.

---

### Issue #12 — Quote section from current component 🟡

**Root Cause**: Current `DifferenceSection` has a beautiful quote block that would be lost.

**File**: `src/components/sections/DifferenceSection.tsx`
**Fix**: Integrate the quote as the section header, replacing the prototype's "Basalt Bifurcation":

```tsx
// Keep the quote above the comparison grid
<h2>"We build spaces that rest the chaos of the city..."</h2>
<p>The Viramah Promise</p>
```

---

### Issue #13 — Light-to-dark contrast transition 🟠

**Root Cause**: Going from `bg-sand-light` (hero section) to `bg-#0a0a0b` (dark section) is jarring.

**File**: `src/styles/difference-section.css`
**Fix**: Use a gradient fade at the top of the section:

```css
.diff-section::before {
  content: "";
  position: absolute;
  top: -80px;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, var(--sand-light), var(--diff-bg));
  pointer-events: none;
}
```

---

### Issue #14 — Card hover on mobile 🟠

**Root Cause**: `translateY(-10px)` on hover sticks on touch.

**File**: `src/styles/difference-section.css`
**Fix**: Guard behind `@media (hover: hover)`:

```css
@media (hover: hover) and (pointer: fine) {
  .monolith:hover { transform: translateY(-10px); }
}
```

---

### Issue #15 — z-index conflicts 🟠

**Root Cause**: Internal z-indexes (labels `z:4`, fissure `z:3`) are relative to the monolith card. Since `.monolith` has `overflow: hidden`, they create their own stacking context — no conflict with the global grain overlay (`z-index: 9999`).

**Fix**: ✅ No change needed — `overflow: hidden` isolates the stacking context.

---

### 📊 Issue Resolution Summary

| # | Issue | Fix Location | Fix Type | Status |
|---|---|---|---|---|
| 1 | No touch support | `DifferenceSection.tsx` | `PointerEvent` API | 🔧 Ready |
| 2 | Fixed 600px height | `difference-section.css` | `clamp()` + responsive | 🔧 Ready |
| 3 | Single breakpoint | `difference-section.css` | 3-breakpoint system | 🔧 Ready |
| 4 | External images | `DifferenceSection.tsx` | Next.js `<Image>` | 🔧 Ready |
| 5 | Inline event handlers | `DifferenceSection.tsx` | React `onPointerMove` | 🔧 Ready |
| 6 | No accessibility | `DifferenceSection.tsx` | ARIA + keyboard | 🔧 Ready |
| 7 | No reduced motion | `difference-section.css` | `@media` query | 🔧 Ready |
| 8 | Technical labels | `DifferenceSection.tsx` | Content update | 🔧 Ready |
| 9 | Prototype header | `DifferenceSection.tsx` | Viramah content | 🔧 Ready |
| 10 | No scroll-triggered reveal | `DifferenceSection.tsx` | Framer Motion `whileInView` | 🔧 Ready |
| 11 | clip-path transition | `DifferenceSection.tsx` | JS interpolation | 🔧 Ready |
| 12 | Preserve quote block | `DifferenceSection.tsx` | Integrate in header | 🔧 Ready |
| 13 | Dark contrast transition | `difference-section.css` | Gradient fade | 🔧 Ready |
| 14 | Card hover on mobile | `difference-section.css` | `@media (hover: hover)` | 🔧 Ready |
| 15 | z-index conflicts | — | Already isolated | ✅ No change |

---

## 📁 PHASE 4: File Changes Required

### 4.1 — Files to Create

| File | Purpose |
|---|---|
| `src/styles/difference-section.css` | Dedicated stylesheet for the section |

### 4.2 — Files to Modify

| File | Changes | Complexity |
|---|---|---|
| `src/components/sections/DifferenceSection.tsx` | Complete rewrite — interactive slider, PointerEvent, Framer Motion | 🔴 High |
| `src/styles/globals.css` | Import `difference-section.css` | 🟢 Low |

### 4.3 — Files NOT Modified

- `page.tsx` — Already imports `<DifferenceSection />`, no changes needed
- `Navigation.tsx` — Already responsive
- `layout.tsx` — Fonts already available

---

## 🎨 PHASE 5: Design Decisions

### 5.1 — Color Adaptation

The prototype uses a full dark theme. We need to make this work within Viramah's warm palette:

| Element | Prototype | Viramah Adaptation |
|---|---|---|
| Section background | `#0a0a0b` | `var(--charcoal)` (`#2E2A26`) — warmer dark brown, fits brand |
| Card background | `#1c1c1e` | `var(--ink)` (`#1C1C1C`) — maintain contrast |
| Text color | `#e0e0e0` | `var(--sand-light)` (`#F3EDE2`) — warm off-white |
| Bifurcation line | `#ffffff` | `var(--champagne-gold)` (`#D8B56A`) — luxury gold accent |
| Label background | `rgba(0,0,0,0.6)` | `rgba(46,42,38, 0.7)` — warm charcoal |
| Label border | `rgba(255,255,255,0.1)` | `rgba(243,237,226, 0.15)` — sand-tinted |
| Fissure glow | `rgba(255,255,255,0.4)` | `rgba(216,181,106, 0.4)` — golden glow |

### 5.2 — Content Mapping

| Prototype | Viramah |
|---|---|
| "Basalt Bifurcation" | "We build spaces that rest the chaos of the city..." (existing quote) |
| "[ GRID_SYSTEM_V.01 ]" | "[ THE_VIRAMAH_DIFFERENCE ]" |
| "EST. REF_0992-X" | "EST. SINCE_2024" |
| "PRIMARY_STATE" | "BEFORE" |
| "MUTATED_STATE" | "AFTER_VIRAMAH" |
| "CORE_STRATA_01" | "Living Space" |
| "CORE_STRATA_02" | "Community Area" |
| "// 001" | "// 001" (keep) |
| "BIFURCATION" (on fissure) | "COMPARE" |

### 5.3 — Typography Mapping

| Element | Prototype Font | Viramah Font | Variable |
|---|---|---|---|
| Section title | Inter 800 | DM Serif Display | `var(--font-display)` |
| Meta text | Space Mono | JetBrains Mono | `var(--font-mono)` |
| Labels | Space Mono | JetBrains Mono | `var(--font-mono)` |
| Card titles | Inter 800 | Inter 800 | `var(--font-body)` |

---

## ⚙️ PHASE 6: CSS — `difference-section.css`

### 6.1 — Complete Stylesheet

```css
/* ===========================================
   DIFFERENCE SECTION — "Basalt Bifurcation"
   Viramah Design System Adaptation
   =========================================== */

/* ── Section Variables ─────────────────────── */
.diff-section {
  --diff-bg: var(--charcoal);
  --diff-card-bg: var(--ink);
  --diff-text: var(--sand-light);
  --diff-accent: var(--champagne-gold);
  --diff-border: rgba(243, 237, 226, 0.08);
  --diff-glow: rgba(216, 181, 106, 0.35);
  --diff-easing: var(--ease-smooth);
}

/* ── Section Layout ────────────────────────── */
.diff-section {
  position: relative;
  background-color: var(--diff-bg);
  color: var(--diff-text);
  padding: 6rem 2rem;
  overflow: hidden;
}

/* Top gradient fade from light to dark */
.diff-section::before {
  content: "";
  position: absolute;
  top: -80px;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, var(--sand-light), var(--diff-bg));
  pointer-events: none;
}

.diff-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Header ────────────────────────────────── */
.diff-header {
  margin-bottom: 5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--diff-border);
  padding-bottom: 2rem;
}

.diff-header-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5vw, 5rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--diff-text);
  max-width: 650px;
}

.diff-header-meta {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(243, 237, 226, 0.4);
  text-align: right;
}

/* ── Grid ──────────────────────────────────── */
.diff-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
}

/* ── Monolith Card ─────────────────────────── */
.diff-monolith {
  position: relative;
  height: clamp(380px, 45vh, 600px);
  background: var(--diff-card-bg);
  overflow: hidden;
  border: 1px solid var(--diff-border);
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
  cursor: col-resize;
  transition: transform 0.6s var(--diff-easing);
}

.diff-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  user-select: none;
  touch-action: pan-y;
}

/* ── Images ────────────────────────────────── */
.diff-image-after {
  position: absolute !important;
  inset: 0;
  object-fit: cover;
  filter: saturate(1.1) contrast(1.05);
}

.diff-image-before {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  clip-path: inset(0 var(--split, 50%) 0 0);
  z-index: 2;
}

.diff-image-before img,
.diff-image-before > span { /* Next.js Image wrapper */
  width: 100% !important;
  height: 100% !important;
}

.diff-image-before-img {
  position: absolute !important;
  inset: 0;
  object-fit: cover;
  filter: grayscale(0.8) contrast(1.1) brightness(0.85);
}

/* ── Fissure / Bifurcation Line ────────────── */
.diff-fissure {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(100% - var(--split, 50%));
  width: 2px;
  background: var(--diff-accent);
  z-index: 3;
  box-shadow: 0 0 20px var(--diff-glow);
  pointer-events: none;
  transition: left 0s linear;
}

.diff-fissure::after {
  content: "COMPARE";
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) rotate(-90deg);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.4em;
  white-space: nowrap;
  color: var(--diff-accent);
  background: var(--diff-card-bg);
  padding: 4px 10px;
  border: 1px solid var(--diff-border);
}

/* ── Labels ────────────────────────────────── */
.diff-labels {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  right: 1.25rem;
  display: flex;
  justify-content: space-between;
  z-index: 4;
  pointer-events: none;
}

.diff-label-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.4rem 0.8rem;
  background: rgba(46, 42, 38, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid var(--diff-border);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--diff-text);
}

/* ── Card Info (below card) ────────────────── */
.diff-info {
  margin-top: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.diff-card-title {
  font-family: var(--font-body);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--diff-text);
}

.diff-card-index {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: rgba(243, 237, 226, 0.35);
}

/* ── Promise subtitle ──────────────────────── */
.diff-promise {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgba(243, 237, 226, 0.45);
  text-align: center;
  margin-top: 0.75rem;
}

/* =============================================
   RESPONSIVE
   ============================================= */

/* ── ALL PHONES (< 768px) ──────────────────── */
@media (max-width: 767px) {
  .diff-section {
    padding: 4rem 5vw;
  }

  .diff-section::before {
    top: -40px;
    height: 40px;
  }

  .diff-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .diff-header-title {
    font-size: clamp(1.8rem, 7vw, 3rem);
    max-width: 100%;
  }

  .diff-header-meta {
    text-align: left;
  }

  .diff-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .diff-monolith {
    height: 65vw;
    min-height: 250px;
    max-height: 400px;
  }

  .diff-label-tag {
    font-size: 0.55rem;
    padding: 0.3rem 0.6rem;
  }

  .diff-fissure::after {
    font-size: 0.5rem;
    bottom: 1rem;
  }

  .diff-card-title {
    font-size: 1.1rem;
  }
}

/* ── XS PHONES (< 375px) ──────────────────── */
@media (max-width: 374px) {
  .diff-header-title {
    font-size: 1.6rem;
  }

  .diff-monolith {
    height: 70vw;
  }

  .diff-labels {
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
  }

  .diff-label-tag {
    font-size: 0.5rem;
    padding: 0.25rem 0.5rem;
  }
}

/* ── TABLET (768px – 1024px) ───────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .diff-grid {
    gap: 2rem;
  }

  .diff-monolith {
    height: clamp(350px, 35vh, 450px);
  }

  .diff-header-title {
    font-size: clamp(2rem, 4vw, 3.5rem);
  }
}

/* ── HOVER-CAPABLE ONLY ────────────────────── */
@media (hover: hover) and (pointer: fine) {
  .diff-monolith:hover {
    transform: translateY(-8px);
  }
}

/* ── TOUCH DEVICES ─────────────────────────── */
@media (hover: none) {
  .diff-monolith {
    cursor: default;
  }
}

/* ── PREFERS REDUCED MOTION ────────────────── */
@media (prefers-reduced-motion: reduce) {
  .diff-monolith {
    transition: none !important;
  }

  .diff-fissure {
    box-shadow: none !important;
  }
}
```

---

## ⚙️ PHASE 7: Component — `DifferenceSection.tsx`

### 7.1 — Architecture

```
DifferenceSection (client component)
├── Section Header (quote + meta)
├── Comparison Grid
│   ├── ComparisonCard[0] (before.jpg ↔ after (1).jpg)
│   │   ├── After Image (background layer)
│   │   ├── Before Image (clipped overlay)
│   │   ├── Fissure Line
│   │   ├── Labels ("BEFORE" / "AFTER_VIRAMAH")
│   │   └── Info (title + index)
│   └── ComparisonCard[1] (before.jpg ↔ after (2).jpg)
└── Promise subtitle
```

### 7.2 — Data Structure

```tsx
interface ComparisonItem {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  title: string;
  index: string;
}

const COMPARISONS: ComparisonItem[] = [
  {
    beforeSrc: "/diffrence section images/before.jpg",
    afterSrc: "/diffrence section images/after (1).jpg",
    beforeAlt: "Before Viramah — original space",
    afterAlt: "After Viramah — modern living transformation",
    title: "Living Space",
    index: "// 001",
  },
  {
    beforeSrc: "/diffrence section images/before.jpg",
    afterSrc: "/diffrence section images/after (2).jpg",
    beforeAlt: "Before Viramah — original area",
    afterAlt: "After Viramah — enhanced community area",
    title: "Community Area",
    index: "// 002",
  },
];
```

### 7.3 — Key Interaction Logic

```tsx
// ── Pointer handler (mouse + touch unified) ──
const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, index: number) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = ((rect.width - x) / rect.width) * 100;
  const constrained = Math.min(Math.max(percentage, 0), 100);

  // Update refs (no re-render needed!)
  const card = cardRefs.current[index];
  if (!card) return;
  const before = card.querySelector('.diff-image-before') as HTMLElement;
  const fissure = card.querySelector('.diff-fissure') as HTMLElement;
  if (before) before.style.clipPath = `inset(0 ${constrained}% 0 0)`;
  if (fissure) fissure.style.left = `${100 - constrained}%`;
};

// ── Reset on leave ──
const handlePointerLeave = (index: number) => {
  const card = cardRefs.current[index];
  if (!card) return;
  const before = card.querySelector('.diff-image-before') as HTMLElement;
  const fissure = card.querySelector('.diff-fissure') as HTMLElement;

  if (before) {
    before.style.transition = 'clip-path 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    before.style.clipPath = 'inset(0 50% 0 0)';
  }
  if (fissure) {
    fissure.style.transition = 'left 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    fissure.style.left = '50%';
  }
  setTimeout(() => {
    if (before) before.style.transition = 'none';
    if (fissure) fissure.style.transition = 'none';
  }, 800);
};
```

### 7.4 — Keyboard Accessibility

```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  const card = cardRefs.current[index];
  if (!card) return;
  // Get current split percentage, adjust by 5%
  const before = card.querySelector('.diff-image-before') as HTMLElement;
  if (!before) return;

  const current = parseFloat(before.style.clipPath.match(/\d+/)?.[1] || '50');
  let next = current;
  if (e.key === 'ArrowLeft') next = Math.max(0, current - 5);
  if (e.key === 'ArrowRight') next = Math.min(100, current + 5);

  before.style.clipPath = `inset(0 ${next}% 0 0)`;
  const fissure = card.querySelector('.diff-fissure') as HTMLElement;
  if (fissure) fissure.style.left = `${100 - next}%`;
};
```

---

## ✅ PHASE 8: Testing Checklist

### 8.1 — Device Matrix

| # | Device | Resolution | Test Focus |
|---|---|---|---|
| 1 | iPhone SE | 375×667 | Touch slider, 1-column layout |
| 2 | iPhone 14 | 390×844 | Standard mobile |
| 3 | Samsung Galaxy | 360×800 | Android touch |
| 4 | iPad Mini | 768×1024 | Tablet breakpoint edge |
| 5 | iPad Air | 820×1180 | 2-column on tablet |
| 6 | Desktop | 1440×900 | Full experience |

### 8.2 — Test Cases

| # | Test | Mobile | Tablet | Desktop |
|---|---|---|---|---|
| 1 | Slider follows finger/mouse | ⬜ Touch | ⬜ Touch | ⬜ Mouse |
| 2 | Slider resets on leave/touchend | ⬜ | ⬜ | ⬜ |
| 3 | Grid changes columns correctly | ⬜ 1col | ⬜ 2col | ⬜ 2col |
| 4 | Card heights responsive | ⬜ | ⬜ | ⬜ |
| 5 | Labels readable at all sizes | ⬜ | ⬜ | ⬜ |
| 6 | No horizontal scroll | ⬜ | ⬜ | ⬜ |
| 7 | Scroll-reveal animates into view | ⬜ | ⬜ | ⬜ |
| 8 | Reduced motion: no animations | ⬜ | ⬜ | ⬜ |
| 9 | Hover lift only on desktop | ⬜ None | ⬜ None | ⬜ Lifts |
| 10 | Keyboard arrows adjust slider | — | — | ⬜ |
| 11 | Light→dark gradient smooth | ⬜ | ⬜ | ⬜ |
| 12 | Images load optimized (Next.js) | ⬜ | ⬜ | ⬜ |
| 13 | Gold fissure line visible | ⬜ | ⬜ | ⬜ |
| 14 | Vertical scroll not blocked by slider | ⬜ | ⬜ | ⬜ |

---

## 📋 PHASE 9: Execution Order

| Step | Task | File | Est. Time |
|---|---|---|---|
| 1 | Create `difference-section.css` with all styles + responsive + accessibility | `difference-section.css` | 8 min |
| 2 | Import CSS in `globals.css` | `globals.css` | 1 min |
| 3 | Rewrite `DifferenceSection.tsx` — data, PointerEvent, Framer Motion, a11y | `DifferenceSection.tsx` | 15 min |
| 4 | Test at 375px, 768px, 1440px | — | 5 min |
| 5 | Fix visual issues | Both files | 5 min |
| 6 | `npm run build` verification | — | 3 min |

**Total Estimated Time: ~37 minutes**

---

## ⚠️ Risks

| Risk | Impact | Mitigation |
|---|---|---|
| PointerEvent not supported on older iOS | Low | iOS 13+ supports it — covers 99%+ of users |
| `clip-path: inset()` performance on low-end phones | Medium | Clipping is GPU-composited — generally fast. Fallback: reduce animation |
| `backdrop-filter: blur()` on labels causes lag | Low | Scoped to small elements — negligible impact |
| Dark section feels disconnected from brand | Medium | Gradient fade + warm `--charcoal` instead of pure black + gold accents |
| `touch-action: pan-y` conflicts with scroll | Low | Only captures horizontal gesture — vertical scroll passes through |

---

## 🚀 Ready to Execute?

**Say "Go" to start the Difference Section implementation.**
