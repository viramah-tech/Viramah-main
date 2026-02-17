# 📱 HERO SECTION — Responsive & Mobile-Friendly Implementation Plan

---

## 📋 Executive Summary

This plan addresses **17 specific responsive issues** across the Hero Section component, targeting **4 breakpoints** (small mobile, mobile, tablet, desktop). The current implementation has basic `@media` queries but has critical gaps: inline `vw` widths in JSX that override CSS media queries, no touch-friendly interactions, parallax causing jank on mobile, and layout issues at extreme viewports.

---

## 🔍 PHASE 1: Audit — Current State vs. Required State

### 1.1 — What's Already Responsive ✅

| Feature | Current Implementation | Status |
|---|---|---|
| Hero title font-size | `clamp(4rem, 15vw, 12rem)` + mobile override to `clamp(3rem, 12vw, 5rem)` | ✅ Works |
| Meta-data layout | `flex → column` at `768px` | ✅ Works |
| Particle count | `30` desktop / `15` mobile | ✅ Works |
| Gallery image width | CSS sets `85vw` at mobile | 🔶 Partially — **overridden by inline styles** |
| Subtitle font-size | `clamp(1rem, 2vw, 1.35rem)` + mobile `0.95rem` | ✅ Works |
| Gallery end marker title | `clamp(2rem, 5vw, 4rem)` | ✅ Works |

### 1.2 — What's Broken/Missing ❌

| # | Issue | Severity | Breakpoint | Details |
|---|---|---|---|---|
| 1 | **Inline `width` overrides CSS** | 🔴 Critical | Mobile | Gallery items have `style={{ width: "40vw" }}` in JSX — CSS `width: 85vw` at `@media (max-width: 768px)` is overridden because inline styles have higher specificity |
| 2 | **Inline `aspectRatio` fixed** | 🟡 Medium | Mobile | All items are `16/9` — on narrow screens, these become very short horizontally. Should be taller on mobile (e.g., `4/3` or `3/4`) |
| 3 | **Sticky header on mobile** | 🟡 Medium | Mobile | `position: sticky` + 100vh height wastes screen real estate on small phones. Users see nothing scrollable initially |
| 4 | **Hero title too large on small phones** | 🟡 Medium | <375px | `clamp(3rem, 12vw, 5rem)` at 320px = ~38px, which is fine, but line-height `0.85` + two lines causes very tight vertical spacing |
| 5 | **Parallax causes scroll jank on mobile** | 🔴 Critical | Mobile | `scroll` event listener computing transforms per frame on mobile GPUs causes jitter — should be disabled or heavily dampened |
| 6 | **No touch-friendly hover states** | 🟡 Medium | Touch devices | `.hero-scroll-item:hover` scale effects don't work on touch — `@media (hover: hover)` guard needed |
| 7 | **Gallery margin-bottom too large on mobile** | 🟠 Low | Mobile | `30vh` (CSS) → `20vh` (mobile query) still wastes lots of space on 667px viewport = 133px between items |
| 8 | **Meta-data gap too large** | 🟠 Low | Mobile | `gap: 0.75rem` in column mode is fine, but the third span `© 2025 Viramah` could be hidden on mobile to save space |
| 9 | **No `prefers-reduced-motion` support** | 🟡 Medium | All | Accessibility requirement — disable particles, parallax, and animations for users who prefer no motion |
| 10 | **Gallery end marker not responsive** | 🟠 Low | Mobile | `.hero-gallery-end-meta` stays `flex` with `gap: 3rem` — should stack or reduce gap on mobile |
| 11 | **Caption positioning on centered items** | 🟡 Medium | Mobile | At mobile, items are `justify-content: center`, but captions still position `right:0` / `left:0` based on `:nth-child(even)` — should be consistent |
| 12 | **Viewport padding too generous** | 🟠 Low | <400px | `padding: 0 4vw` at 375px = 15px each side — could use more horizontal breathing room |
| 13 | **No landscape phone handling** | 🟡 Medium | Landscape phones | 100vh sticky header in landscape mode (short viewport) leaves almost no room for content below nav |
| 14 | **Image `sizes` attribute mismatch** | 🟠 Low | All | `sizes="(max-width: 768px) 85vw"` but the CSS doesn't actually apply 85vw due to inline style override |
| 15 | **Gallery overlap with sticky header** | 🟠 Low | Mobile | `margin-top: -20vh` on gallery is excessive on mobile — brings images too close to the hero text |
| 16 | **Scroll-reveal animation on small screens** | 🟠 Low | Mobile | `translateY(100px)` reveal is too dramatic on small screens — should be reduced to 50px |
| 17 | **Hero padding-top fixed** | 🟡 Medium | Mobile | `padding-top: 100px` (mobile) doesn't account for the nav being `60px` when `scrolled` — small gap appears |

---

## 🎯 PHASE 2: Breakpoint Strategy

### 2.1 — Target Breakpoints

```
┌─────────────────────────────────────────────────────────────────┐
│  < 375px   │  375–767px  │  768–1024px  │  1025–1440px  │ >1440px │
│  XS Phone  │  Phone      │  Tablet      │  Desktop       │ Wide    │
│            │             │              │                │         │
│ "compact"  │ "mobile"    │ "tablet"     │ "default"      │ "wide"  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 — Responsive Values Per Breakpoint

| Property | XS (<375px) | Phone (375–767px) | Tablet (768–1024px) | Desktop (>1024px) |
|---|---|---|---|---|
| **Hero title font** | `2.8rem` | `clamp(3rem, 12vw, 5rem)` | `clamp(4rem, 12vw, 8rem)` | `clamp(4rem, 15vw, 12rem)` |
| **Hero title line-height** | `0.9` | `0.88` | `0.85` | `0.85` |
| **Gallery image width** | `90vw` | `85vw` | `55vw` | from inline (35–45vw) |
| **Gallery image aspect** | `4/3` | `4/3` | `16/9` | `16/9` (from inline) |
| **Gallery item spacing** | `12vh` | `15vh` | `25vh` | `30vh` |
| **Gallery overlap** | `-8vh` | `-10vh` | `-15vh` | `-20vh` |
| **Viewport padding** | `0 5vw` | `0 4vw` | `0 5vw` | `0 5vw` |
| **Sticky header height** | `auto (min-h-screen)` | `100vh` | `100vh` | `100vh` |
| **Particles** | `8` | `15` | `25` | `30` |
| **Parallax** | ❌ Off | ❌ Off | ✅ On (dampened 0.05) | ✅ On (0.1) |
| **Hover effects** | ❌ Off | ❌ Off | ✅ On | ✅ On |
| **Reveal translateY** | `40px` | `50px` | `80px` | `100px` |

---

## 📁 PHASE 3: File Changes Required

### 3.1 — Files to Modify

| File | Changes | Complexity |
|---|---|---|
| `src/styles/hero-section.css` | Major overhaul of responsive section, add new breakpoints, accessibility, touch queries | 🔴 High |
| `src/components/sections/HeroSection.tsx` | Remove inline width/aspect styles, add responsive particle count, conditional parallax, `prefers-reduced-motion` | 🟡 Medium |

### 3.2 — Files NOT Modified

- `globals.css` — No changes needed
- `Navigation.tsx` — Already responsive
- `page.tsx` — No changes needed

---

## 🔧 PHASE 3.5: Issue → Fix Mapping (All 17 Issues)

This section maps every issue from Phase 1.2 to its **exact fix** — which file, what to change, and why.

---

### Issue #1 — Inline `width` overrides CSS 🔴

**Root Cause**: Gallery items have `style={{ width: "40vw" }}` in JSX. Inline styles have higher specificity than any CSS class/selector, so `@media` rules can't override them.

**File**: `src/styles/hero-section.css`
**Fix**: Use `!important` in mobile media queries (legitimate use case for overriding inline styles):

```css
/* BEFORE (broken — CSS ignored due to inline style) */
@media (max-width: 768px) {
  .hero-image-wrapper { width: 85vw; }
}

/* AFTER (works — !important beats inline) */
@media (max-width: 767px) {
  .hero-image-wrapper { width: 85vw !important; }
}
@media (max-width: 374px) {
  .hero-image-wrapper { width: 90vw !important; }
}
@media (min-width: 768px) and (max-width: 1024px) {
  .hero-image-wrapper { width: 55vw !important; }
}
```

---

### Issue #2 — Inline `aspectRatio` fixed on mobile 🟡

**Root Cause**: All items use `aspectRatio: "16/9"` inline. On a 375px phone, a 85vw × 16:9 image = 319px × 180px — uncomfortably short and wide.

**File**: `src/styles/hero-section.css`
**Fix**: Override aspect ratio to `4/3` on phones:

```css
/* BEFORE — No override, stuck at 16:9 on all sizes */

/* AFTER */
@media (max-width: 767px) {
  .hero-image-wrapper {
    aspect-ratio: 4/3 !important; /* Taller images on phones */
  }
}
```

---

### Issue #3 — Sticky header wastes space on mobile 🟡

**Root Cause**: `.hero-header { height: 100vh; position: sticky; }` means the first full screen is just the title. On phones (667px viewport), users see no scrollable content cues.

**File**: `src/styles/hero-section.css`
**Fix**: Use `min-height: 100svh` + `height: auto` on mobile. `100svh` (small viewport height) accounts for Safari's collapsible address bar:

```css
/* BEFORE */
.hero-header { height: 100vh; }

/* AFTER — inside @media (max-width: 767px) */
.hero-header {
  height: auto;
  min-height: 100svh;
}
```

---

### Issue #4 — Title too tight on XS phones 🟡

**Root Cause**: `line-height: 0.85` with `clamp(3rem, 12vw, 5rem)` at 320px = two tightly packed lines. Letters collide vertically.

**File**: `src/styles/hero-section.css`
**Fix**: Increase line-height at each breakpoint:

```css
/* AFTER */
@media (max-width: 767px) {
  .hero-title {
    font-size: clamp(3rem, 14vw, 5rem);
    line-height: 0.88;
    margin-bottom: 1.5rem;
  }
}
@media (max-width: 374px) {
  .hero-title {
    font-size: 2.8rem;
    line-height: 0.9;
  }
}
```

---

### Issue #5 — Parallax causes scroll jank on mobile 🔴

**Root Cause**: `window.addEventListener("scroll", handleScroll)` fires per frame. `handleScroll` queries all `.hero-gallery-img` elements and mutates `transform` styles. Mobile GPUs struggle with this, causing visible jitter (~30fps instead of 60fps).

**File**: `src/components/sections/HeroSection.tsx`
**Fix**: Gate the entire parallax effect behind a mobile + reduced-motion check:

```tsx
// BEFORE
useEffect(() => {
  const handleScroll = () => { /* ... transform logic ... */ };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// AFTER
useEffect(() => {
  const isMobile = window.innerWidth < 768;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (isMobile || prefersReducedMotion) return; // ← Early exit, no listener

  const handleScroll = () => { /* ... same transform logic ... */ };
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

---

### Issue #6 — No touch-friendly hover states 🟡

**Root Cause**: CSS `:hover` sticks on touch devices — user taps an image, it gets "stuck" in the scaled-down hover state because there's no `mouseout` event on touch.

**File**: `src/styles/hero-section.css`
**Fix**: Move existing hover rules behind `@media (hover: hover)` and add explicit no-op for touch:

```css
/* BEFORE — base styles, applies to everything */
.hero-scroll-item:hover .hero-image-wrapper { transform: scale(0.98); }
.hero-scroll-item:hover .hero-gallery-img { transform: scale(1.1) rotate(1deg); }

/* AFTER — guarded by capability */
@media (hover: hover) and (pointer: fine) {
  .hero-scroll-item:hover .hero-image-wrapper { transform: scale(0.98); }
  .hero-scroll-item:hover .hero-gallery-img { transform: scale(1.1) rotate(1deg); }
}
@media (hover: none) {
  .hero-scroll-item:hover .hero-image-wrapper { transform: none; }
  .hero-scroll-item:hover .hero-gallery-img { transform: none; }
}
```

---

### Issue #7 — Gallery margin-bottom too large on mobile 🟠

**Root Cause**: `margin-bottom: 20vh` at 667px viewport = 133px between items. This creates excessive empty scrolling.

**File**: `src/styles/hero-section.css`
**Fix**: Reduce to `15vh` on phones:

```css
/* BEFORE */ .hero-scroll-item { margin-bottom: 20vh; } /* mobile query */
/* AFTER  */ .hero-scroll-item { margin-bottom: 15vh; } /* mobile query */
```

---

### Issue #8 — Meta-data gap / copyright on mobile 🟠

**Root Cause**: Three meta spans on mobile take up valuable vertical space. The `© 2025 Viramah` span adds no user value on small screens.

**File**: `src/styles/hero-section.css`
**Fix**: Hide the last span and reduce gap:

```css
/* AFTER — inside @media (max-width: 767px) */
.hero-meta {
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.6rem;
  margin-bottom: 1rem;
}
.hero-meta span:last-child {
  display: none; /* Hide © on mobile */
}
```

---

### Issue #9 — No `prefers-reduced-motion` support 🟡

**Root Cause**: Users with motion sensitivity or vestibular disorders see floating particles, parallax shifts, and clip-path reveals — which can cause discomfort.

**Files**: `src/styles/hero-section.css` + `src/components/sections/HeroSection.tsx`
**Fix (CSS)**: Disable all visual motion:

```css
@media (prefers-reduced-motion: reduce) {
  .hero-particle { display: none !important; }
  .hero-gallery-img { transition: none !important; scale: 1 !important; }
  .hero-image-wrapper { transition: none !important; }
  .hero-reveal, .hero-reveal-fallback {
    clip-path: none !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }
  .hero-revealed { clip-path: none !important; transform: none !important; }
}
```

**Fix (TSX)**: Skip particle creation and parallax listener:

```tsx
// In particle useEffect:
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) return;

// In parallax useEffect:
if (isMobile || prefersReducedMotion) return;
```

---

### Issue #10 — Gallery end marker not responsive 🟠

**Root Cause**: `.hero-gallery-end-meta { display: flex; gap: 3rem; }` stays horizontal on mobile — text wraps awkwardly on narrow screens.

**File**: `src/styles/hero-section.css`
**Fix**: Stack vertically on mobile:

```css
/* AFTER — inside @media (max-width: 767px) */
.hero-gallery-end {
  margin-top: 8vh;
  padding: 4vh 0;
}
.hero-gallery-end-meta {
  flex-direction: column;
  gap: 0.5rem;
}
```

---

### Issue #11 — Caption positioning on centered items 🟡

**Root Cause**: On mobile, gallery items are `justify-content: center`, but captions are absolutely positioned with `right: 0` (odd) and `left: 0` (even). This creates inconsistent caption placement relative to centered images.

**File**: `src/styles/hero-section.css`
**Fix**: Switch captions to `position: relative` on mobile, centered below the image:

```css
/* AFTER — inside @media (max-width: 767px) */
.hero-caption {
  position: relative;
  bottom: auto;
  right: auto;
  left: auto;
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.6rem;
}
.hero-scroll-item:nth-child(even) .hero-caption {
  left: auto;
  text-align: center;
}
```

---

### Issue #12 — Viewport padding on XS phones 🟠

**Root Cause**: `padding: 0 4vw` at 375px = 15px each side. At 320px (XS), it's even tighter.

**File**: `src/styles/hero-section.css`
**Fix**: Increase padding slightly on all phones to `5vw`:

```css
/* AFTER — inside @media (max-width: 767px) */
.hero-viewport { padding: 0 5vw 8vw 5vw; }
```

---

### Issue #13 — No landscape phone handling 🟡

**Root Cause**: `height: 100vh` sticky header in landscape mode (e.g., 667×375) = an extremely short viewport. The hero title + meta + subtitle might overflow.

**File**: `src/styles/hero-section.css`
**Fix**: Add a dedicated landscape media query:

```css
@media (max-height: 500px) and (orientation: landscape) {
  .hero-header {
    height: auto;
    min-height: 100svh;
    padding-top: 80px;
    padding-bottom: 2rem;
  }
  .hero-title {
    font-size: clamp(2.5rem, 8vh, 4rem);
  }
}
```

---

### Issue #14 — Image `sizes` attribute mismatch 🟠

**Root Cause**: `sizes="(max-width: 768px) 85vw, ..."` — breakpoints don't match actual CSS-applied widths (which use 767px and 374px breakpoints).

**File**: `src/components/sections/HeroSection.tsx`
**Fix**: Update `sizes` to match the actual responsive widths:

```tsx
// BEFORE
sizes="(max-width: 768px) 85vw, (max-width: 1024px) 55vw, 45vw"

// AFTER
sizes="(max-width: 374px) 90vw, (max-width: 767px) 85vw, (max-width: 1024px) 55vw, 45vw"
```

---

### Issue #15 — Gallery overlap with sticky header on mobile 🟠

**Root Cause**: `.hero-gallery { margin-top: -20vh; }` — at 667px viewport, this = -133px, pulling the first gallery image up into the sticky header's text area.

**File**: `src/styles/hero-section.css`
**Fix**: Reduce the negative overlap on smaller screens:

```css
/* AFTER — per breakpoint */
@media (max-width: 767px)  { .hero-gallery { margin-top: -10vh; } }
@media (min-width: 768px) and (max-width: 1024px) { .hero-gallery { margin-top: -15vh; } }
/* Desktop stays at -20vh (default) */
```

---

### Issue #16 — Scroll-reveal animation too dramatic on small screens 🟠

**Root Cause**: `@keyframes heroReveal { from { transform: translateY(100px); } }` — on a 667px viewport, 100px is ~15% of the screen height, making the reveal feel like a jarring "jump".

**File**: `src/styles/hero-section.css`
**Fix**: Override the `@keyframes` inside the mobile media query:

```css
/* AFTER — inside @media (max-width: 767px) */
@keyframes heroReveal {
  from { clip-path: inset(100% 0 0 0); transform: translateY(50px); }
  to   { clip-path: inset(0 0 0 0);    transform: translateY(0); }
}
.hero-reveal-fallback { transform: translateY(50px); }
```

---

### Issue #17 — Hero `padding-top` fixed value 🟡

**Root Cause**: `.hero-header { padding-top: 120px; }` (desktop) and `100px` (mobile). When scrolled, nav shrinks to 60px. The `100px` mobile padding may leave a gap.

**File**: `src/styles/hero-section.css`
**Fix**: Reduce mobile padding to `90px`:

```css
/* BEFORE */
@media (max-width: 768px) { .hero-header { padding-top: 100px; } }

/* AFTER */
@media (max-width: 767px) { .hero-header { padding-top: 90px; } }
```

---

### 📊 Issue Resolution Summary

| # | Issue | Fix Location | Fix Type | Status |
|---|---|---|---|---|
| 1 | Inline width overrides CSS | `hero-section.css` | `!important` in media queries | 🔧 Ready |
| 2 | Fixed aspect ratio on mobile | `hero-section.css` | `aspect-ratio: 4/3 !important` | 🔧 Ready |
| 3 | Sticky header wastes mobile space | `hero-section.css` | `height: auto; min-height: 100svh` | 🔧 Ready |
| 4 | Title too tight on XS | `hero-section.css` | `line-height: 0.88/0.9` per breakpoint | 🔧 Ready |
| 5 | Parallax jank on mobile | `HeroSection.tsx` | `if (isMobile) return` guard | 🔧 Ready |
| 6 | Hover stuck on touch | `hero-section.css` | `@media (hover: hover)` guard | 🔧 Ready |
| 7 | Gallery spacing too large | `hero-section.css` | `margin-bottom: 15vh` mobile | 🔧 Ready |
| 8 | Meta-data copyright wastes space | `hero-section.css` | `span:last-child { display: none }` | 🔧 Ready |
| 9 | No reduced motion support | Both files | CSS `@media` + TSX guards | 🔧 Ready |
| 10 | Gallery end not responsive | `hero-section.css` | `flex-direction: column` mobile | 🔧 Ready |
| 11 | Caption position inconsistent | `hero-section.css` | `position: relative` on mobile | 🔧 Ready |
| 12 | Viewport padding on XS | `hero-section.css` | `padding: 0 5vw` | 🔧 Ready |
| 13 | No landscape phone handler | `hero-section.css` | `@media (max-height: 500px)` | 🔧 Ready |
| 14 | Image `sizes` mismatch | `HeroSection.tsx` | Updated `sizes` attribute | 🔧 Ready |
| 15 | Gallery overlaps header on mobile | `hero-section.css` | `margin-top: -10vh` mobile | 🔧 Ready |
| 16 | Reveal animation too dramatic | `hero-section.css` | `translateY(50px)` mobile | 🔧 Ready |
| 17 | Padding-top gap with scrolled nav | `hero-section.css` | `padding-top: 90px` mobile | 🔧 Ready |

**All 17 issues have concrete, code-ready fixes. No issue is left unaddressed.**

---

## ⚙️ PHASE 4: CSS Changes — `hero-section.css`

### 4.1 — Remove Inline Style Dependency

The fundamental problem: gallery items have `style={{ width: "40vw", aspectRatio: "16/9" }}` which can't be overridden by CSS media queries. We solve this by:

**Strategy**: Keep inline styles for **desktop** (they provide per-item variation), but use CSS `!important` at mobile breakpoints OR move widths to CSS classes.

**Chosen Approach**: Use CSS custom properties + responsive override:

```css
/* Base: use inline values (desktop) */
.hero-image-wrapper {
  /* width and aspect-ratio come from inline styles on desktop */
}

/* Mobile: override ALL image wrappers to full-width */
@media (max-width: 767px) {
  .hero-image-wrapper {
    width: 85vw !important;
    aspect-ratio: 4/3 !important;
  }
}
```

**Why `!important`?** — This is one of the rare legitimate uses: we need to override inline styles at a specific breakpoint. The alternative (removing inline styles entirely) would require complex CSS class mapping.

### 4.2 — New Media Queries Structure

```
@media (max-width: 374px)          → XS Phone
@media (max-width: 767px)          → All Phones (includes XS overrides)
@media (min-width: 768px) and (max-width: 1024px) → Tablet
@media (hover: hover)              → Hover-capable devices only
@media (prefers-reduced-motion: reduce) → Accessibility
@media (max-height: 500px) and (orientation: landscape) → Landscape phones
```

### 4.3 — Full Mobile-First Responsive CSS

```css
/* ─────────────────────────────────────────────
   9. RESPONSIVE — Mobile-First Overhaul
   ───────────────────────────────────────────── */

/* ── ALL PHONES (< 768px) ────────────────── */
@media (max-width: 767px) {
  .hero-viewport {
    padding: 0 5vw 8vw 5vw;
  }

  .hero-header {
    padding-top: 90px;
    min-height: 100svh; /* Use small viewport height for mobile */
    height: auto;
  }

  .hero-title {
    font-size: clamp(3rem, 14vw, 5rem);
    line-height: 0.88;
    margin-bottom: 1.5rem;
  }

  .hero-meta {
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.6rem;
    margin-bottom: 1rem;
  }

  .hero-meta span:last-child {
    display: none; /* Hide © on mobile */
  }

  .hero-subtitle {
    font-size: 0.9rem;
    max-width: 100%;
    line-height: 1.5;
  }

  /* Gallery — Full width, taller images */
  .hero-gallery {
    margin-top: -10vh;
  }

  .hero-image-wrapper {
    width: 85vw !important;
    aspect-ratio: 4/3 !important;
  }

  .hero-scroll-item {
    justify-content: center !important;
    margin-bottom: 15vh;
  }

  .hero-caption {
    position: relative;
    bottom: auto;
    right: auto;
    left: auto;
    margin-top: 0.75rem;
    text-align: center;
    font-size: 0.6rem;
  }

  .hero-scroll-item:nth-child(even) .hero-caption {
    left: auto;
    text-align: center;
  }

  /* Gallery End */
  .hero-gallery-end {
    margin-top: 8vh;
    padding: 4vh 0;
  }

  .hero-gallery-end-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  /* Reduce scroll-reveal distance */
  @keyframes heroReveal {
    from {
      clip-path: inset(100% 0 0 0);
      transform: translateY(50px);
    }
    to {
      clip-path: inset(0 0 0 0);
      transform: translateY(0);
    }
  }

  .hero-reveal-fallback {
    transform: translateY(50px);
  }
}

/* ── XS PHONES (< 375px) ────────────────── */
@media (max-width: 374px) {
  .hero-title {
    font-size: 2.8rem;
    line-height: 0.9;
  }

  .hero-image-wrapper {
    width: 90vw !important;
  }

  .hero-subtitle {
    font-size: 0.85rem;
  }
}

/* ── TABLET (768px – 1024px) ─────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .hero-image-wrapper {
    width: 55vw !important;
  }

  .hero-title {
    font-size: clamp(4rem, 12vw, 8rem);
  }

  .hero-scroll-item {
    margin-bottom: 25vh;
  }

  .hero-gallery {
    margin-top: -15vh;
  }
}

/* ── HOVER-CAPABLE DEVICES ONLY ──────────── */
@media (hover: hover) and (pointer: fine) {
  .hero-scroll-item:hover .hero-image-wrapper {
    transform: scale(0.98);
  }

  .hero-scroll-item:hover .hero-gallery-img {
    transform: scale(1.1) rotate(1deg);
  }
}

/* Make hover effects no-ops on touch */
@media (hover: none) {
  .hero-scroll-item:hover .hero-image-wrapper {
    transform: none;
  }

  .hero-scroll-item:hover .hero-gallery-img {
    transform: none;
  }
}

/* ── LANDSCAPE PHONES ────────────────────── */
@media (max-height: 500px) and (orientation: landscape) {
  .hero-header {
    height: auto;
    min-height: 100svh;
    padding-top: 80px;
    padding-bottom: 2rem;
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vh, 4rem);
  }
}

/* ── PREFERS REDUCED MOTION ──────────────── */
@media (prefers-reduced-motion: reduce) {
  .hero-particle {
    display: none !important;
  }

  .hero-gallery-img {
    transition: none !important;
    scale: 1 !important;
  }

  .hero-image-wrapper {
    transition: none !important;
  }

  .hero-reveal,
  .hero-reveal-fallback {
    clip-path: none !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }

  .hero-revealed {
    clip-path: none !important;
    transform: none !important;
  }
}
```

---

## ⚙️ PHASE 5: Component Changes — `HeroSection.tsx`

### 5.1 — Conditional Parallax (Disable on Mobile)

```tsx
// ── Parallax Effect (desktop only) ─────────────────────
useEffect(() => {
  // Disable parallax on mobile — causes scroll jank
  const isMobile = window.innerWidth < 768;
  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (isMobile || prefersReducedMotion) return;

  const handleScroll = () => {
    if (!galleryRef.current) return;
    const images = galleryRef.current.querySelectorAll<HTMLImageElement>(
      ".hero-gallery-img"
    );
    images.forEach((img) => {
      const parent = img.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const offset = rect.top * 0.1;
      img.style.transform = `translateY(${offset}px) scale(1.2)`;
    });
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

### 5.2 — Responsive Particle Count

```tsx
useEffect(() => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return; // No particles for reduced motion

  const width = window.innerWidth;
  let particleCount = 30; // Desktop
  if (width < 375) particleCount = 8;       // XS phone
  else if (width < 768) particleCount = 15; // Phone
  else if (width < 1024) particleCount = 25; // Tablet

  for (let i = 0; i < particleCount; i++) {
    const timer = setTimeout(createParticle, Math.random() * 5000);
    timersRef.current.push(timer);
  }
  // ... cleanup
}, [createParticle]);
```

### 5.3 — Image `sizes` Attribute Fix

Update the `sizes` prop to match actual rendered sizes:

```tsx
sizes="(max-width: 374px) 90vw, (max-width: 767px) 85vw, (max-width: 1024px) 55vw, 45vw"
```

### 5.4 — Gallery Item Styles

Keep inline styles for desktop variation, CSS overrides at smaller breakpoints:

No change needed to the JSX — the `!important` in CSS will handle the override.

---

## ✅ PHASE 6: Testing Checklist

### 6.1 — Device Matrix

| # | Device | Resolution | Orientation | Test Focus |
|---|---|---|---|---|
| 1 | iPhone SE | 375×667 | Portrait | Smallest common phone |
| 2 | iPhone 12/13 | 390×844 | Portrait | Standard modern phone |
| 3 | iPhone 14 Pro Max | 430×932 | Portrait | Large phone |
| 4 | iPhone SE | 667×375 | **Landscape** | Landscape phone handling |
| 5 | Samsung Galaxy S21 | 360×800 | Portrait | Android popular phone |
| 6 | iPad Mini | 768×1024 | Portrait | Tablet breakpoint edge |
| 7 | iPad Air | 820×1180 | Portrait | Mid tablet |
| 8 | iPad Pro | 1024×1366 | Portrait | Large tablet / desktop edge |
| 9 | Desktop | 1440×900 | - | Standard desktop |
| 10 | Ultra-wide | 2560×1440 | - | Wide desktop |

### 6.2 — Responsive Test Cases

| # | Test | XS | Phone | Tablet | Desktop |
|---|---|---|---|---|---|
| 1 | Hero title readable and properly sized | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | Meta-data stacks vertically on phone | ⬜ | ⬜ | N/A | N/A |
| 3 | Gallery images fill width correctly | ⬜ 90vw | ⬜ 85vw | ⬜ 55vw | ⬜ inline |
| 4 | Gallery images use correct aspect ratio | ⬜ 4:3 | ⬜ 4:3 | ⬜ 16:9 | ⬜ 16:9 |
| 5 | Items centered on mobile | ⬜ | ⬜ | ⬜ | N/A |
| 6 | Captions centered below images on mobile | ⬜ | ⬜ | N/A | N/A |
| 7 | No horizontal scroll at any breakpoint | ⬜ | ⬜ | ⬜ | ⬜ |
| 8 | Navigation visible and clickable over hero | ⬜ | ⬜ | ⬜ | ⬜ |
| 9 | Parallax disabled on phone/tablet | ⬜ | ⬜ | ⬜ | N/A |
| 10 | Hover effects only on hover devices | ⬜ | ⬜ | ⬜ | ⬜ |
| 11 | Reduced motion: no particles/animations | ⬜ | ⬜ | ⬜ | ⬜ |
| 12 | Landscape phone: content fits viewport | N/A | ⬜ | N/A | N/A |
| 13 | Scroll reveal animation is proportionate | ⬜ 40px | ⬜ 50px | ⬜ 80px | ⬜ 100px |
| 14 | Transition to DifferenceSection is smooth | ⬜ | ⬜ | ⬜ | ⬜ |
| 15 | Gallery end marker stacks on mobile | ⬜ | ⬜ | N/A | N/A |

### 6.3 — Performance Targets

| # | Metric | Phone | Tablet | Desktop |
|---|---|---|---|---|
| 1 | Scroll FPS | ≥55 fps | ≥58 fps | ≥60 fps |
| 2 | LCP | < 3s (3G) | < 2.5s | < 2s |
| 3 | CLS | < 0.05 | < 0.05 | < 0.1 |
| 4 | DOM particles | ≤15 | ≤25 | ≤30 |

---

## 📋 PHASE 7: Execution Order

| Step | Task | File | Est. Time |
|---|---|---|---|
| 1 | Rewrite responsive section in `hero-section.css` — replace existing `@media` blocks with comprehensive mobile-first rules | `hero-section.css` | 10 min |
| 2 | Add `:hover` guard with `@media (hover: hover)` | `hero-section.css` | 3 min |
| 3 | Add `prefers-reduced-motion` rules | `hero-section.css` | 3 min |
| 4 | Add landscape phone handler | `hero-section.css` | 2 min |
| 5 | Move base hover styles behind `@media (hover: hover)` guard | `hero-section.css` | 2 min |
| 6 | Update parallax `useEffect` — disable on mobile + reduce motion | `HeroSection.tsx` | 3 min |
| 7 | Update particle `useEffect` — tier counts + reduce motion check | `HeroSection.tsx` | 3 min |
| 8 | Update Image `sizes` attribute | `HeroSection.tsx` | 1 min |
| 9 | Run `npm run dev` — test at 375px, 768px, 1440px | — | 10 min |
| 10 | Fix visual issues found during testing | Both files | 10 min |
| 11 | Run `npm run build` to verify | — | 3 min |

**Total Estimated Time: ~50 minutes**

---

## ⚠️ Risks

| Risk | Impact | Mitigation |
|---|---|---|
| `!important` overrides polluting future CSS | Low | Scoped to `.hero-image-wrapper` only, within breakpoint query |
| `100svh` not supported on older iOS (<15.4) | Low | Fallback: `height: 100vh` declared before `min-height: 100svh` |
| Reduced motion disabling particles leaves empty space | Low | Particles are cosmetic overlays — no visual gap without them |
| Gallery items all same width on mobile loses visual variety | Low | Acceptable trade-off: consistency > variety on small screens |

---

## 🚀 Ready to Execute?

**Say "Go" to start the responsive implementation.**
