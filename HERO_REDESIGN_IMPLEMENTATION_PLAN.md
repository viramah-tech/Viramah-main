# 🔄 HERO SECTION — "Tensile Ceramic Loop" Redesign Plan

---

## 📋 Executive Summary

**Goal**: Replace the current **scroll-driven sticky hero + vertical gallery** with a new design based on `new hero.html` — a **horizontal auto-scrolling marquee** ("Tensile Ceramic Loop") with image tiles, hover overlays, edge fade masks, and decorative tension wires. This eliminates the long vertical scroll and presents Viramah's spaces in a compact, always-moving carousel.

---

## 🏗️ PHASE 1: REMOVAL — What Gets Deleted

### 1.1 — Current Hero Features to Remove

| Feature | Location | Action |
|---|---|---|
| **Sticky `100vh` header** | CSS `.hero-header { position: sticky }` | Replace with standard positioned header |
| **Scroll gallery** (`.hero-gallery`) | TSX + CSS | **Remove entirely** — replaced by marquee |
| **Parallax effect** | TSX `useEffect` — scroll listener | **Remove** |
| **Edge-fade vignette** | TSX `useEffect` — rAF loop | **Remove** |
| **Scroll reveal animation** | CSS `@keyframes heroReveal` + TSX IO fallback | **Remove** |
| **Dust particles** | TSX `createParticle` + CSS `.hero-particle` | **Keep** (works with new design too) |
| **Gallery End Marker** | CSS + TSX `.hero-gallery-end` | **Remove** |
| **Image wrapper shadows/vignettes** | CSS `.hero-img-entering/exiting/visible` | **Remove** |

### 1.2 — CSS Classes to Remove

```
.hero-header (sticky behavior)
.hero-gallery, .hero-scroll-item
.hero-image-wrapper (old shadow/vignette states)
.hero-gallery-img
.hero-caption
.hero-reveal, .hero-reveal-fallback, .hero-revealed
@keyframes heroReveal
.hero-gallery-end, .hero-gallery-end-title, .hero-gallery-end-meta
.hero-img-entering, .hero-img-exiting, .hero-img-visible
```

### 1.3 — TSX Code to Remove

```
- Parallax useEffect (scroll listener)
- Edge-fade vignette useEffect (rAF loop)
- Scroll reveal fallback useEffect (IntersectionObserver)
- GALLERY_ITEMS data array
- Gallery JSX (map over items)
- Gallery end marker JSX
```

---

## 🔍 PHASE 2: PROTOTYPE ANALYSIS — `new hero.html`

### 2.1 — What the Prototype Does

| Feature | Implementation |
|---|---|
| **Marquee carousel** | CSS `@keyframes marquee` — `translateX(0)` → `translateX(-50%)` infinite loop |
| **4 image tiles** | Fixed `420×560px`, duplicated in JS for seamless loop |
| **Hover: lift + scale** | `translateY(-15px) scale(1.02)` + shadow increase |
| **Hover: image zoom** | `transform: scale(1.1)` on img |
| **Hover: overlay reveal** | Frosted glass gradient slides up with title/meta |
| **Pause on hover** | `animation-play-state: paused` |
| **Tensile wires** | 2 horizontal lines at 15% from top/bottom |
| **Anchor dots** | 2 small circles at wire endpoints |
| **Edge masks** | Left/right gradient masks (150px) for fade-out effect |
| **Header** | Small mono text: "Kinetic Archive / Vol. 01" |
| **Footer blurbs** | 2 description items below marquee |
| **Mouse parallax** | Subtle track shift based on cursor position |

### 2.2 — Design Token Mapping

| Prototype | Value | Viramah |
|---|---|---|
| `--ceramic-bg: #fdfdfc` | Section bg | `var(--cream-warm)` or `var(--sand-light)` |
| `--ceramic-glaze: #ffffff` | Tile bg | `#ffffff` (keep) |
| `--ceramic-shadow` | `rgba(0,0,0,0.04)` | Keep — subtle |
| `--tensile-stroke: #e2e2e0` | Wire color | `var(--sand-dark)` |
| `--ink-primary: #1a1a1a` | Text | `var(--charcoal)` |
| `--ink-secondary: #717170` | Muted | `rgba(46, 42, 38, 0.5)` |
| `--loop-speed: 40s` | Marquee speed | Keep 40s or adjust |
| Geist font | Display | `var(--font-body)` (Inter — similar feel) |
| JetBrains Mono | Mono | `var(--font-mono)` ✅ match |

### 2.3 — Content Mapping

| Prototype | Viramah |
|---|---|
| "Kinetic Archive / Vol. 01" | "VIRAMAH SPACES / VOL. 01" |
| "[ LATENCY: 0.002MS ]" | "[ EST. 2024 — HYDERABAD ]" |
| "Spec: 044-A" → "Obsidian Glaze" | "LIVING_SPACE" → "Living Space" |
| "Spec: 082-C" → "Tensile Flow" | "THE_COMMONS" → "Common Area" |
| "Spec: 019-F" → "Porous Light" | "RECREATION" → "Gaming Zone" |
| "Spec: 112-K" → "Vitreous Depth" | "AQUATICS" → "Swimming Pool" |
| Footer "Materiality" | "The Promise" |
| Footer "Continuity" | "The Experience" |

### 2.4 — Images to Use

| Tile | Image Path | Size |
|---|---|---|
| Living Space | `/diffrence section images/after (1).jpg` | Available |
| Common Area | `/life at viramah images/common area.jpg` | 361KB |
| Gaming Zone | `/life at viramah images/gaming zone.jpg` | 2.2MB |
| Swimming Pool | `/life at viramah images/swiming pool.jpg` | 149KB |

---

## 🔴 PHASE 3: BUG AUDIT — Issues in the Prototype

| # | Issue | Severity | Category | Fix |
|---|---|---|---|---|
| 1 | **No touch support** — hover overlays don't work on mobile | 🔴 Critical | Mobile | Always show overlay on touch, `@media (hover: none)` |
| 2 | **Fixed tile dimensions** (420×560px) — too wide on phones | 🔴 Critical | Responsive | Responsive widths: `65vw` phone, `40vw` tablet, `420px` desktop |
| 3 | **External Unsplash images** | 🟡 Medium | Performance | Next.js `<Image>` with local files |
| 4 | **JS DOM duplication** (`innerHTML + innerHTML`) | 🟡 Medium | React | Duplicate in data array, not DOM manipulation |
| 5 | **Mouse parallax on track conflicts with marquee animation** | 🟠 Low | UX | Apply parallax to the `.stage` container instead |
| 6 | **No `prefers-reduced-motion`** | 🟡 Medium | A11y | Pause marquee, disable hover transforms |
| 7 | **Hover stuck on mobile** — tile stays lifted after tap | 🟡 Medium | Mobile | `@media (hover: hover)` guard |
| 8 | **Edge masks use fixed 150px** — too wide on phones | 🟠 Low | Responsive | `clamp(40px, 10vw, 150px)` |
| 9 | **No ARIA labels** | 🟡 Medium | A11y | `role="region"`, `aria-label`, `aria-roledescription="carousel"` |
| 10 | **`cursor: crosshair`** — unusual, confusing | 🟠 Low | UX | Use `cursor: grab` instead |
| 11 | **Footer blurbs are outside section** — won't be in hero | 🟠 Low | Structure | Move inside hero section or omit |
| 12 | **Anchors are decorative only** — need `aria-hidden` | 🟠 Low | A11y | Add `aria-hidden="true"` |
| 13 | **Need to preserve "Viramah Living" title** | 🟡 Medium | Content | Keep existing hero title above marquee |
| 14 | **Marquee stops abruptly at viewport edge** — needs smooth mask | ✅ Good | Already in prototype | Edge masks handle this |
| 15 | **No keyboard interaction** — can't pause/navigate marquee | 🟠 Low | A11y | Focus pause, left/right arrow nudge |

---

## 📊 PHASE 3.5: Issue → Fix Mapping

### Issue #1 — No touch support 🔴

**Fix**: `@media (hover: none)` — always show tile overlay, reduce opacity of gradient:
```css
@media (hover: none) {
    .hero-tile-overlay { opacity: 1; transform: translateY(0); }
    .hero-tile { cursor: default; }
}
```

### Issue #2 — Fixed tile dimensions 🔴

**Fix**: Responsive tile widths:
```css
.hero-tile {
    width: clamp(280px, 30vw, 420px);
    height: clamp(360px, 40vw, 560px);
}
@media (max-width: 767px) {
    .hero-tile { width: 65vw; height: 80vw; margin: 0 12px; }
}
@media (min-width: 768px) and (max-width: 1024px) {
    .hero-tile { width: 40vw; height: 50vw; }
}
```

### Issue #3 — External images

**Fix**: Next.js `<Image>` with `fill` + `sizes` prop.

### Issue #4 — JS DOM duplication

**Fix**: In React, just render 2× the data array:
```tsx
const DOUBLED_TILES = [...TILES, ...TILES]; // seamless loop
```

### Issue #5 — Mouse parallax conflicts

**Fix**: Apply parallax to the `.stage` wrapper, not the track:
```tsx
const handleMouseMove = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 5;
    stageRef.current.style.transform = `translate(${x}px, ${y}px)`;
};
```

### Issues #6, #7 — Reduced motion + hover guards

**Fix**: CSS media queries:
```css
@media (prefers-reduced-motion: reduce) {
    .hero-marquee { animation: none !important; }
}
@media (hover: hover) and (pointer: fine) {
    .hero-tile:hover { transform: translateY(-15px) scale(1.02); }
}
```

### Issue #8 — Fixed edge masks

**Fix**: `width: clamp(40px, 10vw, 150px)` instead of `150px`.

---

## 📁 PHASE 4: File Changes

### 4.1 — Files to Modify

| File | Changes | Complexity |
|---|---|---|
| `src/styles/hero-section.css` | **Major rewrite** — remove scroll gallery styles, add marquee + tiles + responsive | 🔴 High |
| `src/components/sections/HeroSection.tsx` | **Major rewrite** — remove scroll gallery, add marquee carousel | 🔴 High |

### 4.2 — No New Files Needed

The hero section already has its own CSS file and component. We're rewriting in-place.

---

## 🎨 PHASE 5: New Design Structure

### 5.1 — Layout (Top to Bottom)

```
┌──────────────────────────────────────────────────┐
│  .hero-viewport                                   │
│  ┌────────────────────────────────────────────┐   │
│  │  .hero-header (title + meta + subtitle)    │   │
│  │  "Viramah Living" + mono meta              │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │  .hero-stage (marquee container)           │   │
│  │  ┌──wire─────────────────────────wire──┐   │   │
│  │  │  ● [anchor]              [anchor] ● │   │   │
│  │  │                                     │   │   │
│  │  │  ← [TILE] [TILE] [TILE] [TILE] ←   │   │   │
│  │  │     (auto-scrolling marquee)        │   │   │
│  │  │                                     │   │   │
│  │  └──wire─────────────────────────wire──┘   │   │
│  │  [mask-left]              [mask-right]     │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │  .hero-footer-blurbs (optional 2-col)      │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### 5.2 — Tile Data

```tsx
const MARQUEE_TILES = [
  {
    src: "/diffrence section images/after (1).jpg",
    alt: "Viramah — modern living space transformation",
    meta: "LIVING_SPACE",
    title: "Living Space",
  },
  {
    src: "/life at viramah images/common area.jpg",
    alt: "Viramah — community common area",
    meta: "THE_COMMONS",
    title: "Common Area",
  },
  {
    src: "/life at viramah images/gaming zone.jpg",
    alt: "Viramah — recreation gaming zone",
    meta: "RECREATION",
    title: "Gaming Zone",
  },
  {
    src: "/life at viramah images/swiming pool.jpg",
    alt: "Viramah — swimming pool wellness",
    meta: "AQUATICS",
    title: "Swimming Pool",
  },
];
```

---

## 📱 PHASE 6: RESPONSIVE DESIGN

### 6.1 — Breakpoint Strategy

| Breakpoint | Tile Width | Tile Height | Gap | Masks | Title Size |
|---|---|---|---|---|---|
| XS (<375px) | `70vw` | `85vw` | `10px` | `30px` | `2.8rem` |
| Phone (375–767px) | `65vw` | `80vw` | `12px` | `40px` | `3.5rem` |
| Tablet (768–1024px) | `38vw` | `48vw` | `20px` | `80px` | `5rem` |
| Desktop (1025+) | `clamp(320px, 28vw, 420px)` | `clamp(420px, 36vw, 560px)` | `30px` | `150px` | `clamp(4rem, 15vw, 12rem)` |

### 6.2 — Mobile Adaptations

| Feature | Desktop | Mobile |
|---|---|---|
| Marquee speed | `40s` | `25s` (fewer pixels to traverse) |
| Hover overlay | On hover | Always visible (reduced opacity) |
| Mouse parallax | Active | Disabled |
| Tile lift on hover | `-15px` | None |
| Edge masks | `150px` | `30-40px` |
| Hero title | Full sticky header | Compact, non-sticky |
| Tensile wires | Visible | Hidden on XS, thinner on phone |
| Anchor dots | Visible | Hidden |
| Particles | 30 | 8-15 (already handled) |

---

## ✅ PHASE 7: Testing Checklist

| # | Test | XS | Phone | Tablet | Desktop |
|---|---|---|---|---|---|
| 1 | Marquee scrolls smoothly | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | Marquee loops seamlessly | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | Tiles are correct size | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | Hover lift works | — | — | — | ⬜ |
| 5 | Overlay visible on touch | ⬜ | ⬜ | — | — |
| 6 | Edge masks fade properly | ⬜ | ⬜ | ⬜ | ⬜ |
| 7 | No horizontal overflow | ⬜ | ⬜ | ⬜ | ⬜ |
| 8 | Reduced motion: no marquee | ⬜ | ⬜ | ⬜ | ⬜ |
| 9 | Images load optimized | ⬜ | ⬜ | ⬜ | ⬜ |
| 10 | Title readable | ⬜ | ⬜ | ⬜ | ⬜ |
| 11 | `npm run build` passes | ⬜ | ⬜ | ⬜ | ⬜ |

---

## 📋 PHASE 8: Execution Order

| Step | Task | File |
|---|---|---|
| **1** | Rewrite `hero-section.css` — remove scroll gallery, add marquee | `src/styles/hero-section.css` |
| **2** | Rewrite `HeroSection.tsx` — remove scroll effects, add marquee | `src/components/sections/HeroSection.tsx` |
| **3** | Test at 375px, 768px, 1440px | Browser |
| **4** | `npm run build` verification | Terminal |

**Estimated Time: ~25 minutes**

---

## 🚀 Ready to Execute?

**Say "Go" to start the Hero Section redesign.**
