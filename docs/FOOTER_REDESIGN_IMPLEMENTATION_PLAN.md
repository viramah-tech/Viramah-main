# Footer Redesign — Implementation Plan

**Target file:** `src/components/layout/Footer.tsx`
**CSS file:** `src/styles/footer-section.css` (new)
**Design reference:** `footer.html`

---

## 1. Overview

Replace the current light sand `Footer` with the dark woven-texture footer from `footer.html`, fully adapted to Viramah's brand tokens, content, and Next.js patterns.

Key design traits to carry over:
- Near-black background (`--bg-base → --luxury-green` deep dark)
- Woven grid overlay via CSS `linear-gradient` + SVG `feTurbulence` distortion filter
- Animated horizontal and vertical "thread" accent lines
- 3-column grid: **Brand / Mission** | **Navigation** | **System/Legal**
- Monospace nav section labels in accent color
- Link hover: slide-right translate + underline reveal animation
- Bottom bar: copyright + live UTC clock (mono) + social icon cluster
- Social icons: circular border, gold hover with lift shadow
- Staggered scroll-reveal entrance (IntersectionObserver)

---

## 2. Design → Brand Token Mapping

| HTML variable       | Viramah token          | Value        |
|---------------------|------------------------|--------------|
| `--bg-base #0a0a0b` | `--luxury-green`       | `#1F3A2D`    |
| `--accent-primary`  | `--champagne-gold`     | `#D8B56A`    |
| `--text-main`       | `--cream-warm`         | `#FBF7F0`    |
| `--text-muted`      | `cream-warm` @ 50%     | rgba(251,247,240,0.5) |
| `--thread-dim`      | cream-warm @ 4%        | rgba(251,247,240,0.04) |
| `--thread-bright`   | cream-warm @ 15%       | rgba(251,247,240,0.15) |
| logo gradient       | plain `--cream-warm`   | (no gradient needed) |
| `font-mono`         | `JetBrains Mono`       | already loaded |

---

## 3. Step-by-Step Implementation

### Step 1 — Create `src/styles/footer-section.css`

```css
/* -------------------------------------------------- */
/* Footer — Woven Dark                                */
/* -------------------------------------------------- */

.woven-footer {
  position: relative;
  background: var(--luxury-green);
  color: var(--cream-warm);
  font-family: var(--font-body), "Inter", sans-serif;
  padding: 7rem 8vw 4rem 8vw;
  overflow: hidden;
  border-top: 1px solid rgba(251, 247, 240, 0.06);
}

/* Woven grid texture overlay */
.woven-footer::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.35;
  pointer-events: none;
  background-image:
    linear-gradient(90deg, rgba(251,247,240,0.04) 1px, transparent 1px),
    linear-gradient(0deg,  rgba(251,247,240,0.04) 1px, transparent 1px);
  background-size: 24px 24px;
  filter: url(#rough-fiber-footer);
}

/* Animated horizontal thread */
.footer-thread-h {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--champagne-gold), transparent);
  width: 100%;
  left: 0;
  z-index: 2;
  opacity: 0.25;
  pointer-events: none;
  animation: footerWeaveH 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Animated vertical thread */
.footer-thread-v {
  position: absolute;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--champagne-gold), transparent);
  height: 100%;
  top: 0;
  right: 15%;
  z-index: 2;
  opacity: 0.15;
  pointer-events: none;
  animation: footerWeaveV 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes footerWeaveH {
  0%, 100% { transform: translateY(0px)   scaleX(0.8); opacity: 0; }
  50%       { transform: translateY(400px) scaleX(1.2); opacity: 0.3; }
}

@keyframes footerWeaveV {
  0%, 100% { transform: translateX(0px)    scaleY(0.8); opacity: 0; }
  50%       { transform: translateX(-200px) scaleY(1.2); opacity: 0.2; }
}

/* ---- Content grid ---- */
.footer-grid {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 80px;
}

/* Brand column */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.footer-logo {
  font-family: var(--font-display), "DM Serif Display", serif;
  font-weight: 700;
  font-size: 2.5rem;
  letter-spacing: -0.04em;
  color: var(--cream-warm);
  line-height: 1;
}

.footer-mission {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(251, 247, 240, 0.55);
  max-width: 380px;
}

.footer-contact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: rgba(251, 247, 240, 0.6);
}

.footer-contact a {
  color: rgba(251, 247, 240, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-contact a:hover {
  color: var(--champagne-gold);
}

/* Nav column */
.footer-nav-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-nav-label {
  font-family: var(--font-mono), "JetBrains Mono", monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--champagne-gold);
}

.footer-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-nav-list a {
  text-decoration: none;
  color: rgba(251, 247, 240, 0.8);
  font-size: 0.97rem;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  display: inline-block;
  width: fit-content;
}

/* Underline reveal on hover */
.footer-nav-list a::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--champagne-gold);
  transition: width 0.4s ease;
}

.footer-nav-list a:hover {
  color: var(--cream-warm);
  transform: translateX(8px);
}

.footer-nav-list a:hover::after {
  width: 100%;
}

/* ---- Bottom bar ---- */
.footer-bottom {
  margin-top: 80px;
  padding-top: 32px;
  border-top: 1px solid rgba(251, 247, 240, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 10;
  flex-wrap: wrap;
  gap: 24px;
}

.footer-meta {
  font-family: var(--font-mono), "JetBrains Mono", monospace;
  font-size: 0.72rem;
  color: rgba(251, 247, 240, 0.4);
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-clock {
  color: var(--champagne-gold);
}

/* Social icon cluster */
.footer-socials {
  display: flex;
  gap: 16px;
}

.footer-social-btn {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(251, 247, 240, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: rgba(251, 247, 240, 0.7);
  text-decoration: none;
  background: transparent;
  cursor: pointer;
}

.footer-social-btn:hover {
  background: var(--champagne-gold);
  border-color: var(--champagne-gold);
  color: var(--luxury-green);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(216, 181, 106, 0.25);
}

/* ---- Scroll reveal ---- */
.footer-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.85s cubic-bezier(0.23, 1, 0.32, 1),
              transform 0.85s cubic-bezier(0.23, 1, 0.32, 1);
}

.footer-reveal.footer-reveal-active {
  opacity: 1;
  transform: translateY(0);
}

/* ---------------------------------------- */
/* Responsive — Tablet (≤ 900px)            */
/* ---------------------------------------- */

@media (max-width: 900px) {
  .woven-footer {
    padding: 5rem 6vw 3rem 6vw;
  }

  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-mission {
    max-width: 100%;
  }

  .footer-thread-v {
    display: none;
  }
}

/* ---------------------------------------- */
/* Responsive — Mobile (≤ 640px)            */
/* ---------------------------------------- */

@media (max-width: 640px) {
  .woven-footer {
    padding: 4rem 5vw 2.5rem 5vw;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-brand {
    grid-column: auto;
  }

  .footer-logo {
    font-size: 2rem;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 56px;
  }

  .footer-meta {
    flex-direction: column;
    gap: 8px;
  }
}
```

---

### Step 2 — Import CSS in `globals.css`

```css
@import "./footer-section.css";
```

---

### Step 3 — Rewrite `Footer.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function Footer() {
    const [utcTime, setUtcTime] = useState("00:00:00");
    const footerRef = useRef<HTMLElement>(null);

    // Live UTC clock
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = String(now.getUTCHours()).padStart(2, "0");
            const m = String(now.getUTCMinutes()).padStart(2, "0");
            const s = String(now.getUTCSeconds()).padStart(2, "0");
            setUtcTime(`${h}:${m}:${s} UTC`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    // Staggered scroll-reveal
    useEffect(() => {
        const footer = footerRef.current;
        if (!footer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("footer-reveal-active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05 }
        );

        footer.querySelectorAll(".footer-reveal").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* SVG filter for woven texture distortion */}
            <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
                <defs>
                    <filter id="rough-fiber-footer">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                    </filter>
                </defs>
            </svg>

            <footer ref={footerRef} className="woven-footer">
                {/* Thread accent lines */}
                <div className="footer-thread-h" style={{ top: "20%" }} aria-hidden="true" />
                <div className="footer-thread-h" style={{ top: "65%", animationDelay: "-5s" }} aria-hidden="true" />
                <div className="footer-thread-v" aria-hidden="true" />

                {/* Main grid */}
                <div className="footer-grid">
                    {/* Brand column */}
                    <div className="footer-brand footer-reveal">
                        <div className="footer-logo">Viramah.</div>
                        <p className="footer-mission">
                            Premium student living reimagined — where comfort, community,
                            and craft come together. Every space designed with intention.
                        </p>
                        <div className="footer-contact">
                            <span>
                                <a href="mailto:info@viramah.com">info@viramah.com</a>
                            </span>
                            <span>
                                <a href="tel:+911234567890">+91 12345 67890</a>
                            </span>
                        </div>
                    </div>

                    {/* Navigation column */}
                    <div className="footer-nav-col footer-reveal" style={{ transitionDelay: "0.1s" }}>
                        <span className="footer-nav-label">Navigate</span>
                        <ul className="footer-nav-list">
                            <li><Link href="/rooms">Living Options</Link></li>
                            <li><Link href="/community">Community</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/visit">Book a Visit</Link></li>
                            <li><Link href="/signup">Apply Now</Link></li>
                        </ul>
                    </div>

                    {/* Legal / system column */}
                    <div className="footer-nav-col footer-reveal" style={{ transitionDelay: "0.2s" }}>
                        <span className="footer-nav-label">Legal</span>
                        <ul className="footer-nav-list">
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/support">Support</Link></li>
                            <li><Link href="/login">Login / Register</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="footer-bottom footer-reveal" style={{ transitionDelay: "0.3s" }}>
                    <div className="footer-meta">
                        <span>&copy; {new Date().getFullYear()} Viramah</span>
                        <span className="footer-clock">{utcTime}</span>
                        <span>Premium Student Living</span>
                    </div>

                    <div className="footer-socials">
                        <a href="#" aria-label="Instagram" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
                        </a>
                        <a href="#" aria-label="Facebook" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a2 2 0 0 1 2-2h2z"/></svg>
                        </a>
                        <a href="#" aria-label="Twitter / X" className="footer-social-btn">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43.36a9.09 9.09 0 0 1-2.88 1.1A4.48 4.48 0 0 0 16.11 0c-2.5 0-4.5 2.01-4.5 4.5 0 .35.04.69.1 1.02A12.94 12.94 0 0 1 3 1.64a4.48 4.48 0 0 0-.61 2.27c0 1.57.8 2.96 2.02 3.77A4.48 4.48 0 0 1 2 7.14v.06c0 2.2 1.57 4.03 3.88 4.45a4.48 4.48 0 0 1-2.03.08c.57 1.78 2.23 3.08 4.19 3.12A9.05 9.05 0 0 1 1 19.54a12.94 12.94 0 0 0 7.03 2.06c8.44 0 13.07-7 13.07-13.07 0-.2 0-.39-.01-.58A9.32 9.32 0 0 0 23 3z"/></svg>
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
```

---

## 4. Bug-Fixing Checklist

| # | Issue | Fix |
|---|-------|-----|
| 1 | **SVG filter ID collision** — `footer.html` uses `id="rough-fiber"`; the global grain overlay in `globals.css` body::before also uses an inline SVG filter. If IDs match across two inline SVGs in the same document, the wrong filter is applied. | Use a unique ID: `rough-fiber-footer` in both the JSX `<defs>` and the CSS `filter: url(#rough-fiber-footer)` |
| 2 | **`setInterval` leak** — if Footer unmounts (SPA navigation), the clock interval keeps ticking. | Return `clearInterval(id)` in the `useEffect` cleanup (already in plan above) |
| 3 | **SSR hydration mismatch** — `new Date()` called on server gives one time, client gives another. | Clock state initialised as `"00:00:00"` and only updated in `useEffect` (client-only). Copyright year uses `new Date().getFullYear()` which is fine — it's the same value on server and client. |
| 4 | **`observer.observe` on unmounted elements** — reveal observer may fire after component unmounts on fast navigations. | `return () => observer.disconnect()` in cleanup covers this. |
| 5 | **`transitionDelay` inline style on server** — React serialises numbers as strings correctly, no issue. | N/A — confirmed safe. |
| 6 | **`h1/h2/h3` global colour override** — `globals.css` applies `@apply font-display text-charcoal` to all `h3`. Old footer used `<h3>` for nav labels; replaced with `<span class="footer-nav-label">` and `<div class="footer-logo">` so the global rule doesn't darken labels. | Replaced `<h3>` with `<span>` and `<div>` in the new implementation. |
| 7 | **`Container` wrapper removed** — old footer wrapped content in `<Container>`. New design uses `padding: 7rem 8vw` on the footer directly, matching the reference. | Removed `Container` import entirely. |
| 8 | **Animation `filter: url(#rough-fiber-footer)` on the `::before` pseudo-element** — pseudo-elements cannot reference inline SVG filters directly in some browsers if the SVG is not in the DOM before the CSS is parsed. | SVG `<defs>` is rendered at the top of the `<footer>`, before CSS pseudo-elements apply, so the filter ID is always available. |
| 9 | **`transform: translateX(8px)` on nav links breaks layout flow** — `display: inline-block` required; `width: fit-content` on `<a>` prevents the underline from stretching full column width. | Both already set in `.footer-nav-list a` (carried from reference). |
| 10 | **Touch device hover state stuck** — `translateX(8px)` on links with `:hover` can get "stuck" pressed on touch. | Pure CSS `:hover` only fires on actual hover — on touch it triggers then releases cleanly. No JS needed. |

---

## 5. Responsiveness Specification

| Breakpoint | Layout | Notes |
|------------|--------|-------|
| `≥ 900px` | 3-column grid (`2fr 1fr 1fr`) | All thread animations visible |
| `640px – 900px` | 2-column grid; brand spans full row | Vertical thread line hidden; padding reduced |
| `< 640px` | Single column stack | Logo smaller; bottom bar stacks vertically; meta list stacks |

---

## 6. File Change Summary

| File | Action |
|------|--------|
| `src/styles/footer-section.css` | **Create** |
| `src/styles/globals.css` | **Add** `@import "./footer-section.css";` |
| `src/components/layout/Footer.tsx` | **Replace** existing implementation |

---

## 7. Implementation Order

1. Create `src/styles/footer-section.css`
2. Add import in `globals.css`
3. Rewrite `Footer.tsx`
4. Verify: thread animations, clock ticking, reveal stagger, mobile stack, social hover
