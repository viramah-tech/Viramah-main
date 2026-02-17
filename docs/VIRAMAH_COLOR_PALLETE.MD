  I'll update the prompt to make the navigation bar Luxury Deep Green to complement your logo. Here's the revised implementation:

---

# 🎨 Viramah Brand Color Implementation Prompt — NAVIGATION GREEN EDITION

## Strategic Rationale

**Navigation Bar: `#1F3A2D` (Luxury Deep Green)**
- Creates immediate brand recognition (logo color anchoring)
- Establishes premium, trust-worthy first impression
- Provides strong contrast for Champagne Gold accents and Off White text
- Differentiates from generic white/light navbars

**Complementary System:**
- Gold accents pop against dark green
- Off White text maintains readability
- Overall feel: Luxury hospitality (think premium hotel/resort branding)

---

## Implementation Commands

### 1. Update `src/styles/globals.css`

Replace the entire color system:

```css
:root {
  /* Primary Brand Colors */
  --champagne-gold: #D8B56A;
  --champagne-gold-light: #E8D39A;
  --champagne-gold-dark: #B8963F;
  
  /* Luxury Deep Green — NAVIGATION & PRIMARY DARK */
  --luxury-green: #1F3A2D;
  --luxury-green-light: #2A4A3A;
  --luxury-green-dark: #152A20;
  
  /* Neutral Foundation */
  --off-white: #F6F4EF;
  --off-white-dark: #E8E6E1;
  
  /* Text & Contrast */
  --charcoal: #2B2B2B;
  --charcoal-light: #4A4A4A;
  --charcoal-muted: #6B6B6B;
  
  /* Functional */
  --error: #C45B4A;
  --success: var(--luxury-green);
  --warning: var(--champagne-gold);
  
  /* Legacy compatibility */
  --terracotta-raw: var(--champagne-gold);
  --terracotta-soft: var(--champagne-gold-light);
  --sand-light: var(--off-white);
  --sand-dark: var(--off-white-dark);
  --sage-muted: var(--luxury-green);
  --ink: var(--charcoal);
  --gold: var(--champagne-gold);
}

@theme {
  /* Core Brand */
  --color-champagne-gold: var(--champagne-gold);
  --color-champagne-gold-light: var(--champagne-gold-light);
  --color-champagne-gold-dark: var(--champagne-gold-dark);
  --color-luxury-green: var(--luxury-green);
  --color-luxury-green-light: var(--luxury-green-light);
  --color-luxury-green-dark: var(--luxury-green-dark);
  --color-off-white: var(--off-white);
  --color-off-white-dark: var(--off-white-dark);
  --color-charcoal: var(--charcoal);
  --color-charcoal-light: var(--charcoal-light);
  --color-charcoal-muted: var(--charcoal-muted);
  
  /* Legacy */
  --color-terracotta-raw: var(--champagne-gold);
  --color-terracotta-soft: var(--champagne-gold-light);
  --color-sand-light: var(--off-white);
  --color-sand-dark: var(--off-white-dark);
  --color-sage-muted: var(--luxury-green);
  --color-ink: var(--charcoal);
  --color-gold: var(--champagne-gold);
}
```

---

### 2. Update `src/components/layout/Navigation.tsx`

**COMPLETE REWRITE — Green Navigation Bar**

```tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/community", label: "Community" },
  { href: "/events", label: "Events" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {/* Main Navigation Bar — LUXURY DEEP GREEN */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "bg-luxury-green border-b border-luxury-green-light",
          scrolled && "shadow-lg shadow-luxury-green-dark/20"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo — Left Side */}
            <Link href="/" className="flex items-center gap-3 group">
              {/* Logo Mark — Champagne Gold accent */}
              <div className="w-10 h-10 rounded-full bg-champagne-gold flex items-center justify-center">
                <span className="font-display text-luxury-green text-xl font-bold">
                  V
                </span>
              </div>
              {/* Logo Wordmark */}
              <div className="hidden sm:block">
                <span className="font-display text-xl text-off-white tracking-wide">
                  Viramah
                </span>
                <span className="block font-mono text-[10px] text-champagne-gold uppercase tracking-[0.2em]">
                  The Art of Rest
                </span>
              </div>
            </Link>

            {/* Desktop Navigation — Center */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-full",
                    "font-mono text-xs uppercase tracking-widest",
                    "text-off-white/80 hover:text-off-white",
                    "transition-colors duration-300",
                    "group"
                  )}
                >
                  {link.label}
                  {/* Hover indicator — Champagne Gold underline */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-champagne-gold group-hover:w-4/5 transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right Side — CTA + Clock */}
            <div className="flex items-center gap-4">
              {/* Time Display — India */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-luxury-green-light/50 border border-luxury-green-light">
                <Clock className="w-3.5 h-3.5 text-champagne-gold" />
                <span className="font-mono text-xs text-off-white">
                  {currentTime} IST
                </span>
              </div>

              {/* CTA Button — Champagne Gold */}
              <Button
                variant="primary"
                size="sm"
                className="hidden md:flex bg-champagne-gold text-luxury-green hover:bg-champagne-gold-light font-mono text-xs uppercase tracking-wider"
                asChild
              >
                <Link href="/login">Book Now</Link>
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full text-off-white hover:bg-luxury-green-light transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 z-40 bg-luxury-green md:hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-4 px-4 rounded-xl text-off-white font-mono text-sm uppercase tracking-widest hover:bg-luxury-green-light transition-colors border-b border-luxury-green-light"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4"
              >
                <Button
                  variant="primary"
                  className="w-full bg-champagne-gold text-luxury-green hover:bg-champagne-gold-light font-mono uppercase tracking-wider"
                  asChild
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    Book Your Stay
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

### 3. Update Page Layouts (Account for Fixed Nav Height)

#### `src/app/layout.tsx`

```tsx
// Increase top padding to account for taller green nav
<body className={cn("font-body antialiased bg-off-white")}>
  <Navigation />
  <main className="pt-16 md:pt-20"> {/* Was pt-4 for floating nav */}
    {children}
  </main>
</body>
```

#### `src/app/page.tsx` (Landing)

Remove the old floating nav spacer and adjust first section:

```tsx
// Remove: <div className="h-20" /> (old floating nav spacer)
// First section now starts naturally below fixed nav
<section className="min-h-screen bg-off-white pt-8">
  {/* Content */}
</section>
```

---

### 4. Update Other Components for Green Nav Harmony

#### `src/components/ui/Button.tsx` — New Variant for Dark Backgrounds

```tsx
// Add new variant for use on dark/green backgrounds
primaryOnDark: "bg-champagne-gold text-luxury-green hover:bg-champagne-gold-light shadow-md",

// Update existing to ensure contrast
primary: "bg-champagne-gold text-luxury-green hover:bg-champagne-gold-dark font-semibold",
```

#### `src/components/layout/Footer.tsx`

```tsx
// Footer should harmonize with green nav — use lighter or same green
<footer className="bg-luxury-green-dark text-off-white border-t border-luxury-green-light">
  {/* OR alternate: <footer className="bg-charcoal text-off-white"> for contrast */}
```

---

### 5. Update Portal Sidebars to Match

#### `src/app/student/layout.tsx` & `src/app/parent/layout.tsx`

```tsx
// Match navigation green for consistency
<aside className="w-[280px] bg-luxury-green text-off-white fixed ...">
  {/* Active state uses champagne gold */}
  <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-colors", 
    isActive ? "bg-champagne-gold text-luxury-green" : "text-off-white/70 hover:text-off-white hover:bg-luxury-green-light"
  )}>
```

---

## Visual Hierarchy — GREEN NAV EDITION

```
NAVIGATION:          bg-luxury-green (dominant, always visible)
├─ Logo:             bg-champagne-gold text-luxury-green
├─ Links:            text-off-white/80 hover:text-off-white + gold underline
├─ Time:             bg-luxury-green-light/50 border-luxury-green-light
└─ CTA:              bg-champagne-gold text-luxury-green

PAGE BACKGROUNDS:    bg-off-white (calm, neutral)
CARDS:               bg-off-white border-off-white-dark
PRIMARY ACTIONS:     bg-champagne-gold text-luxury-green
SECONDARY:           border-luxury-green text-luxury-green hover:bg-off-white-dark
TEXT HEADINGS:       text-charcoal
TEXT BODY:           text-charcoal-light
ACCENTS:             text-champagne-gold, text-luxury-green
```

---

## Color Psychology Validation

| Element | Color | Psychology |
|---------|-------|------------|
| **Green Nav** | `#1F3A2D` | Trust, stability, premium hospitality, nature |
| **Gold Accents** | `#D8B56A` | Luxury, excellence, warmth, aspiration |
| **Off White** | `#F6F4EF` | Cleanliness, calm, sophistication |
| **Charcoal Text** | `#2B2B2B` | Readability, grounding, modern |

**Brand Impression:** Premium eco-luxury student living (think: Aman Resorts, 1 Hotels, premium wellness)

---

## Verification Checklist

- [ ] Navigation is solid `#1F3A2D` (no transparency, no blur)
- [ ] Logo container is gold circle with green "V"
- [ ] Nav links are Off White with gold hover underline
- [ ] "Book Now" button is gold with green text (high contrast)
- [ ] Mobile menu matches desktop green
- [ ] Page content has `pt-16 md:pt-20` to clear fixed nav
- [ ] Portal sidebars match nav green
- [ ] Footer harmonizes (either darker green or charcoal)
- [ ] No green-on-green text (always gold or off-white on green)
- [ ] No gold-on-gold elements (maintain contrast)

---

Execute this to transform your brand presence into a cohesive, logo-aligned luxury experience.