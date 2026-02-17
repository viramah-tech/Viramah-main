# 🧱 CATEGORIES SECTION — "Bas-Relief Index" Implementation Plan

---

## 📋 Executive Summary

Adapts the `category.html` prototype (a **neumorphic "bas-relief" category tile grid** with extruded shadow effects, mouse-parallax lighting, and pressed-inset hover states) into the existing `CategoriesSection.tsx` (currently a basic 5-column grid of links).

### Key Design Features
- **Neumorphic shadows** — tiles appear extruded from the surface (light/dark shadow pair)
- **Pressed hover effect** — shadows invert on hover creating a "bas-relief" press-in illusion
- **Mouse-parallax lighting** — cursor position shifts shadow direction globally
- **Accent color transition** — title turns accent color on hover
- **Arrow icon rotation** — rotates 45° on hover
- **Sculpted divider line** — inset shadow line separator
- **Light theme** — contrasts with preceding dark sections

---

## 🔍 Issues Found & Fixes

| # | Issue | Severity | Fix |
|---|---|---|---|
| 1 | **Mouse parallax not touch-friendly** | 🔴 | Skip on touch — use static shadows |
| 2 | **Prototype content generic** | 🟡 | Map to Viramah categories |
| 3 | **No `prefers-reduced-motion`** | 🟡 | CSS `@media` guard |
| 4 | **Hover stuck on mobile** | 🟡 | `@media (hover: hover)` guard |
| 5 | **`auto-fit` grid can create orphan columns** | 🟠 | Use explicit responsive columns |
| 6 | **No scroll-reveal** | 🟠 | Framer Motion `whileInView` |
| 7 | **No accessibility** | 🟡 | ARIA labels, focus-visible |
| 8 | **Inline styles from JS** | 🟠 | React state + CSS variables |
| 9 | **Grain overlay duplicated** | ✅ | Already in globals |
| 10 | **Fixed aspect ratio 1/1.1** | 🟠 | Adjust for mobile |
| 11 | **Color tokens don't match Viramah** | 🟡 | Map to design system |
| 12 | **No dark→light transition** | 🟠 | Gradient `::before` |

---

## 🎨 Design Token Mapping

| Prototype | Value | Viramah |
|---|---|---|
| `--bg-base: #dcdcdc` | Tile/section bg | `var(--sand-light)` (`#F3EDE2`) — warmer |
| `--shadow-dark: #b8b8b8` | Dark shadow | `var(--sand-dark)` (`#E8E2D9`) |
| `--shadow-light: #ffffff` | Light shadow | `#ffffff` (keep pure white) |
| `--accent: #ff4d00` | Hover accent | `var(--terracotta-raw)` (`#C07A5A`) |
| `--text-main: #1a1a1a` | Text | `var(--charcoal)` (`#2E2A26`) |

## 📁 Files

| File | Action |
|---|---|
| `src/styles/categories-section.css` | **Create** |
| `src/styles/globals.css` | **Modify** — add import |
| `src/components/sections/CategoriesSection.tsx` | **Rewrite** |

---

## 🚀 Ready
