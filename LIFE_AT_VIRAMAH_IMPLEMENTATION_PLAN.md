# 🪨 LIFE AT VIRAMAH — "Slab Series" Gallery Implementation Plan

---

## 📋 Executive Summary

This plan adapts the `gallery.html` prototype (a dark, brutalist "Tectonic Slab" image gallery with 3D tilt effects, staggered scroll reveals, and a 12-column asymmetric grid) into the existing **`LifeAtViramahSection.tsx`** component, replacing the current basic 3-column equal-height grid.

The new section features:
- **12-column asymmetric "tectonic" grid** with varying card sizes (span-4/5/7/8/12)
- **3D tilt effect** on mouse move (perspective rotation)
- **Grayscale-to-color image reveal** on hover
- **Staggered scroll-triggered entrance** with `rotateX` perspective animation
- **Dark theme** with displacement gradient overlays
- **Full responsive layout** across 4 breakpoints
- **Touch-friendly mobile** with no 3D tilt (only reveal-on-scroll)

---

## 🔍 PHASE 1: Prototype Analysis

### 1.1 — What the Prototype Does

| Feature | Implementation | Notes |
|---|---|---|
| **12-column grid** | `grid-template-columns: repeat(12, 1fr)` | Cards span 4/5/7/8/12 columns |
| **3D tilt on hover** | JS `mousemove` → `perspective(1000px) rotateX(Xdeg) rotateY(Ydeg)` | Parallax-style tilt |
| **Grayscale→color** | CSS `filter: grayscale(100%)` → `grayscale(0%)` on hover | Image starts muted |
| **Scroll reveal** | IntersectionObserver → adds `.visible` class | `translateY(100px) rotateX(10deg)` → zero |
| **Displacement overlay** | `linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 50%)` | Bottom gradient for text readability |
| **Content overlay** | Label + title + stats, slides up on hover | `translateY(20px)` → `0` |
| **Grain texture** | Animated SVG noise with `@keyframes noise` | Already in Viramah globals |
| **Card heights** | Fixed per span: 600px (8/4), 500px (5/7), 700px (12) | Need responsive adaptation |
| **Dark background** | `#0a0a0a` | Full dark theme |

### 1.2 — Design Token Mapping (Prototype → Viramah)

| Prototype Token | Value | Viramah Equivalent |
|---|---|---|
| `--bg: #0a0a0a` | Background | `var(--charcoal)` (`#2E2A26`) — warm dark |
| `--slate-base: #1a1a1a` | Card bg | `var(--ink)` (`#1C1C1C`) ✅ |
| `--slate-edge: #333333` | Border | `rgba(243, 237, 226, 0.1)` — warm tint |
| `--accent: #ffffff` | Text | `var(--sand-light)` (`#F3EDE2`) — warm off-white |
| `--text-muted: #666666` | Labels | `rgba(243, 237, 226, 0.4)` — warm muted |
| `--transition` | `cubic-bezier(0.23, 1, 0.32, 1)` | `var(--ease-smooth)` ✅ exact match |
| Inter 900 | Title | `var(--font-body)` weight 900 |
| JetBrains Mono | Mono | `var(--font-mono)` ✅ exact match |

### 1.3 — Available Images

Located in `public/life at viramah images/`:

| Image | File | Size | Grid Assignment |
|---|---|---|---|
| Common Area | `common area.jpg` | 361KB | **span-8** (hero card, left) |
| Gaming Zone | `gaming zone.jpg` | 2.2MB | **span-7** (large, right) |
| Swimming Pool | `swiming pool.jpg` | 148KB | **span-5** (medium, left) |

**Note**: Only 3 images available vs 5 in prototype. We'll adapt the grid layout:
- Row 1: Common Area (**span-8**) + Gaming Zone (**span-4**)
- Row 2: Swimming Pool (**span-5**) + Gaming Zone alt (**span-7**)

Wait — we only have 3 images. Better layout:
- Row 1: Common Area (**span-8**) + Swimming Pool (**span-4**)
- Row 2: Gaming Zone (**span-12**, full-width panoramic)

This creates a strong visual hierarchy with 3 images.

---

## 🔍 PHASE 2: Audit — Issues in the Prototype

### 2.1 — Issues Found

| # | Issue | Severity | Category | Details |
|---|---|---|---|---|
| 1 | **No touch support for 3D tilt** | 🔴 Critical | Mobile | `mousemove` tilt doesn't work on touch devices |
| 2 | **Fixed pixel heights** | 🟡 Medium | Responsive | `600px`, `500px`, `700px` — overflow on phones |
| 3 | **Single breakpoint (900px)** | 🟡 Medium | Responsive | Jumps from 12-col grid to all-span-12, no tablet state |
| 4 | **External Unsplash images** | 🟡 Medium | Performance | Must use local Next.js `<Image>` |
| 5 | **Inline event handlers** | 🟠 Low | React | `mousemove` + `mouseleave` via vanilla JS — not React-compatible |
| 6 | **No accessibility** | 🟡 Medium | A11y | No alt text improvements, no keyboard focus, no ARIA landmarks |
| 7 | **No `prefers-reduced-motion`** | 🟡 Medium | A11y | 3D tilt + scroll animation + grain noise all play regardless |
| 8 | **Grain overlay duplicated** | 🟠 Low | Performance | Prototype has its own grain — Viramah already has one in `globals.css` |
| 9 | **Content is prototype-specific** | 🟡 Medium | Content | "Oblique Displacement", "MASS: 450KG" — needs Viramah content |
| 10 | **Hover effects stick on mobile** | 🟡 Medium | Mobile | Grayscale→color + translateY stuck on touch |
| 11 | **IntersectionObserver stagger bug** | 🟠 Low | UX | Uses `index` from observer callback which can be wrong for multiple entries |
| 12 | **Card border uses `box-shadow` hack** | 🟠 Low | Visual | `0 0 0 1px var(--slate-edge)` — should be proper `border` for consistency |
| 13 | **No light→dark transition** | 🟠 Low | Visual | Abrupt background change from preceding section |
| 14 | **Header meta hidden on mobile** | ✅ Good | Already handled | `display: none` at 900px |
| 15 | **`perspective: 2000px` on grid** | 🟠 Low | Performance | Establishes 3D context on parent — can cause paint issues on mobile |
| 16 | **Stats overlay not useful for Viramah** | 🟡 Medium | Content | "MASS: 450KG" makes no sense — replace with real amenity info |

---

## 🔧 PHASE 3: Issue → Fix Mapping (All 16 Issues)

---

### Issue #1 — No touch support for 3D tilt 🔴

**Root Cause**: `mousemove` listener on each card calculates `rotateX`/`rotateY` — this only fires on mouse devices.

**File**: `src/components/sections/LifeAtViramahSection.tsx`
**Fix**: 
- **Desktop**: Keep 3D tilt using `onPointerMove` (mouse only, guarded by `pointer: fine`)
- **Mobile**: Skip tilt entirely — use `@media (hover: none)` to disable transform

```tsx
const handleTilt = useCallback((e: React.PointerEvent<HTMLElement>, index: number) => {
  // Only tilt on non-touch devices
  if (window.matchMedia('(hover: none)').matches) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const rotateX = (y - rect.height / 2) / 50;
  const rotateY = (rect.width / 2 - x) / 50;
  e.currentTarget.style.transform = 
    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
}, []);
```

---

### Issue #2 — Fixed pixel heights 🟡

**File**: `src/styles/life-at-viramah-section.css`
**Fix**: Use responsive heights with `clamp()`:

```css
.slate-span-8  { grid-column: span 8; height: clamp(350px, 40vh, 600px); }
.slate-span-4  { grid-column: span 4; height: clamp(350px, 40vh, 600px); }
.slate-span-12 { grid-column: span 12; height: clamp(350px, 45vh, 700px); }

@media (max-width: 767px) {
  .slate-span-8, .slate-span-4, .slate-span-12 {
    grid-column: span 12;
    height: 55vw;
    min-height: 220px;
    max-height: 350px;
  }
}
```

---

### Issue #3 — Single breakpoint (900px) 🟡

**File**: `src/styles/life-at-viramah-section.css`
**Fix**: 3 breakpoints:

```css
@media (max-width: 767px)  { /* 1 column, all span-12 */ }
@media (min-width: 768px) and (max-width: 1024px) { /* Simplified spans: 6+6 */ }
@media (min-width: 1025px) { /* Full 12-column layout */ }
```

---

### Issue #4 — External images 🟡

**File**: `src/components/sections/LifeAtViramahSection.tsx`
**Fix**: Use local images with `next/image`:

```tsx
<Image src="/life at viramah images/common area.jpg" alt="Common Area" fill className="slate-img" />
```

---

### Issue #5 — Inline event handlers 🟠

**Fix**: React `onPointerMove` / `onPointerLeave` with `useCallback` (covered in #1).

---

### Issue #6 — No accessibility 🟡

**Fix**: 
- Add `role="group"` on the grid, `aria-label` on cards
- Ensure `alt` text is descriptive
- Focus outline on cards via `:focus-visible`

---

### Issue #7 — No `prefers-reduced-motion` 🟡

**Fix**:
```css
@media (prefers-reduced-motion: reduce) {
  .slate-item { transition: none !important; transform: none !important; opacity: 1 !important; }
  .slate-img { filter: none !important; transition: none !important; }
}
```

---

### Issue #8 — Grain overlay duplicated 🟠

**Fix**: ✅ Don't include grain — Viramah already has it in `globals.css body::before`.

---

### Issue #9 — Prototype content 🟡

**Fix**: Replace with Viramah-relevant content:

| Prototype | Viramah |
|---|---|
| "Slab Series" | "Life at Viramah" |
| "EXTRACTED / VOL.01" | "CURATED_SPACES / VOL. 01" |
| "Archive No. 129" | "THE_COMMONS" |
| "Oblique Displacement" | "Common Area" |
| "MASS: 450KG" | "CAPACITY: 50+" |
| "COORD: 40.71..." | "LOCATION: HYDERABAD" |

---

### Issue #10 — Hover effects stuck on mobile 🟡

**Fix**: Guard all hover styles behind `@media (hover: hover) and (pointer: fine)`.

---

### Issue #11 — IntersectionObserver stagger bug 🟠

**Fix**: Use Framer Motion `whileInView` with `custom` index for proper staggering (no IO needed).

---

### Issue #12 — Card border uses box-shadow hack 🟠

**Fix**: Use proper `border: 1px solid var(--slate-border)` instead.

---

### Issue #13 — No light→dark transition 🟠

**Fix**: Same approach as Difference Section — gradient `::before` pseudoelement.

---

### Issue #14 — Header meta hidden on mobile ✅

Already handled in prototype. Will preserve.

---

### Issue #15 — `perspective: 2000px` on grid 🟠

**Fix**: Remove from grid, apply `perspective(1000px)` only inline on individual cards during tilt interaction.

---

### Issue #16 — Stats overlay not useful 🟡

**Fix**: Replace with Viramah amenity stats:

```tsx
const GALLERY_ITEMS = [
  { label: "THE_COMMONS", title: "Common Area", stats: ["CAPACITY: 50+", "STATUS: ACTIVE"], ... },
  { label: "RECREATION", title: "Swimming Pool", stats: ["TEMP: 28°C", "ACCESS: DAILY"], ... },
  { label: "ENTERTAINMENT", title: "Gaming Zone", stats: ["CONSOLES: 4", "STATUS: LIVE"], ... },
];
```

---

### 📊 Issue Resolution Summary

| # | Issue | Fix Location | Status |
|---|---|---|---|
| 1 | No touch 3D tilt | TSX — `onPointerMove` guard | 🔧 Ready |
| 2 | Fixed heights | CSS — `clamp()` | 🔧 Ready |
| 3 | Single breakpoint | CSS — 3 breakpoints | 🔧 Ready |
| 4 | External images | TSX — Next.js `<Image>` | 🔧 Ready |
| 5 | Inline handlers | TSX — React events | 🔧 Ready |
| 6 | No a11y | TSX — ARIA + focus | 🔧 Ready |
| 7 | No reduced motion | CSS — `@media` | 🔧 Ready |
| 8 | Duplicate grain | Skip | ✅ No change |
| 9 | Prototype content | TSX — Viramah content | 🔧 Ready |
| 10 | Hover stuck mobile | CSS — `@media (hover)` | 🔧 Ready |
| 11 | IO stagger bug | TSX — Framer Motion | 🔧 Ready |
| 12 | Box-shadow border | CSS — proper border | 🔧 Ready |
| 13 | No gradient fade | CSS — `::before` | 🔧 Ready |
| 14 | Meta hidden mobile | — | ✅ Already done |
| 15 | Perspective on grid | CSS/TSX — per-card | 🔧 Ready |
| 16 | Stats content | TSX — Viramah data | 🔧 Ready |

---

## 📁 PHASE 4: File Changes Required

### 4.1 — Files to Create

| File | Purpose |
|---|---|
| `src/styles/life-at-viramah-section.css` | Dedicated stylesheet |

### 4.2 — Files to Modify

| File | Changes | Complexity |
|---|---|---|
| `src/components/sections/LifeAtViramahSection.tsx` | Complete rewrite — tectonic grid, 3D tilt, Framer Motion | 🔴 High |
| `src/styles/globals.css` | Import `life-at-viramah-section.css` | 🟢 Low |

---

## 🎨 PHASE 5: Design Decisions

### 5.1 — Color Adaptation

| Element | Prototype | Viramah |
|---|---|---|
| Section bg | `#0a0a0a` | `var(--charcoal)` (`#2E2A26`) |
| Card bg | `#1a1a1a` | `var(--ink)` (`#1C1C1C`) |
| Text | `#ffffff` | `var(--sand-light)` (`#F3EDE2`) |
| Border | `#333333` | `rgba(243, 237, 226, 0.1)` |
| Muted text | `#666666` | `rgba(243, 237, 226, 0.4)` |
| Hover border | `#ffffff` | `var(--champagne-gold)` (`#D8B56A`) |
| Hover shadow | black | warm charcoal with gold tint |

### 5.2 — Grid Layout (3 images)

```
Desktop (1025px+):
┌───────────────────────────┬───────────┐
│    Common Area (span-8)   │ Pool (4)  │
│        600px tall         │  600px    │
└───────────────────────────┴───────────┘
┌───────────────────────────────────────┐
│       Gaming Zone (span-12)           │
│            700px tall                 │
└───────────────────────────────────────┘

Tablet (768–1024px):
┌──────────────┬──────────────┐
│ Common (6)   │   Pool (6)   │
└──────────────┴──────────────┘
┌────────────────────────────┐
│     Gaming Zone (12)       │
└────────────────────────────┘

Mobile (<768px):
┌────────────────────────────┐
│     Common Area (12)       │
├────────────────────────────┤
│     Swimming Pool (12)     │
├────────────────────────────┤
│     Gaming Zone (12)       │
└────────────────────────────┘
```

### 5.3 — Content Mapping

| Prototype | Viramah |
|---|---|
| "Slab Series" | "Life at Viramah" |
| "EXTRACTED / VOL.01" | "CURATED_SPACES / VOL. 01" |
| "COORD: 40.71°N..." | "LOCATION: HYDERABAD, INDIA" |
| "MATERIAL: BRUTALIST SLATE" | "CONCEPT: MINDFUL_LIVING" |
| "REF: #000-88" | "REF: VRM-2024" |
| "Archive No. 129" | "THE_COMMONS" |
| "Oblique Displacement" | "Common Area" |
| "MASS/DENSITY/STATUS" | Contextual amenity info |

---

## ⚙️ PHASE 6: Data Structure

```tsx
interface GalleryItem {
  src: string;
  alt: string;
  label: string;       // e.g. "THE_COMMONS"
  title: string;       // e.g. "Common Area"
  stats: string[];     // e.g. ["CAPACITY: 50+", "STATUS: ACTIVE"]
  span: 4 | 8 | 12;   // Grid column span
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: "/life at viramah images/common area.jpg",
    alt: "Common area — the social hub of Viramah with shared seating and workspaces",
    label: "THE_COMMONS",
    title: "Common Area",
    stats: ["CAPACITY: 50+", "TYPE: SOCIAL_HUB", "STATUS: ACTIVE"],
    span: 8,
  },
  {
    src: "/life at viramah images/swiming pool.jpg",
    alt: "Swimming pool — aquatic facilities at Viramah for exercise and relaxation",
    label: "AQUATICS",
    title: "Swimming Pool",
    stats: ["TEMP: 28°C", "ACCESS: DAILY"],
    span: 4,
  },
  {
    src: "/life at viramah images/gaming zone.jpg",  // Note: no trailing space
    alt: "Gaming zone — entertainment and recreation at Viramah",
    label: "RECREATION_LAB",
    title: "Gaming Zone",
    stats: ["CONSOLES: 4+", "GENRE: ALL", "STATUS: LIVE"],
    span: 12,
  },
];
```

---

## ✅ PHASE 7: Testing Checklist

### 7.1 — Device Matrix

| # | Device | Resolution | Test Focus |
|---|---|---|---|
| 1 | iPhone SE | 375×667 | Full-width cards, no tilt |
| 2 | iPhone 14 | 390×844 | Touch reveal, vertical scroll |
| 3 | iPad Mini | 768×1024 | 6+6 grid, tablet breakpoint |
| 4 | Desktop | 1440×900 | Full 12-col grid, 3D tilt |

### 7.2 — Test Cases

| # | Test | Mobile | Tablet | Desktop |
|---|---|---|---|---|
| 1 | Grid columns correct | ⬜ 1col | ⬜ 2col | ⬜ Asymmetric |
| 2 | Card heights responsive | ⬜ | ⬜ | ⬜ |
| 3 | 3D tilt on hover | ⬜ None | ⬜ None | ⬜ Tilts |
| 4 | Grayscale→color on hover | ⬜ None | ⬜ None | ⬜ Works |
| 5 | Scroll reveal staggers | ⬜ | ⬜ | ⬜ |
| 6 | Images load optimized | ⬜ | ⬜ | ⬜ |
| 7 | Labels readable | ⬜ | ⬜ | ⬜ |
| 8 | Stats visible on hover | ⬜ Always | ⬜ Always | ⬜ Hover |
| 9 | Reduced motion: no animation | ⬜ | ⬜ | ⬜ |
| 10 | No horizontal scroll | ⬜ | ⬜ | ⬜ |
| 11 | Light→dark gradient smooth | ⬜ | ⬜ | ⬜ |

---

## 📋 PHASE 8: Execution Order

| Step | Task | File |
|---|---|---|
| 1 | Create `life-at-viramah-section.css` | `src/styles/life-at-viramah-section.css` |
| 2 | Import in `globals.css` | `src/styles/globals.css` |
| 3 | Rewrite `LifeAtViramahSection.tsx` | `src/components/sections/LifeAtViramahSection.tsx` |
| 4 | Test at 375px, 768px, 1440px | — |
| 5 | `npm run build` verification | — |

---

## ⚠️ Risks

| Risk | Impact | Mitigation |
|---|---|---|
| 3D tilt causes jank on low-end devices | Medium | Guard behind `@media (hover: hover)`, use `will-change: transform` |
| Only 3 images → grid feels sparse | Low | Full-width gaming zone card creates strong visual weight |
| `gaming zone .jpg` has space before extension | 🔴 | Must check exact filename — could cause 404 |
| 2.2MB gaming zone image is large | Medium | Next.js `<Image>` auto-resizes + serves WebP |
| Dark→dark transition with Difference Section | Low | Only matters if both sections visible simultaneously |

---

## 🚀 Ready to Execute?

**Say "Go" to start the Life at Viramah Section implementation.**
