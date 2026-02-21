# Viramah Website: Comprehensive Optimization Plan

This document outlines a non-destructive optimization strategy for the Viramah website. The goal is to maximize performance, responsiveness, and Core Web Vitals (CWV) without altering the current visuals, user flow, or core functionality.

## Phase 1: Image & Asset Optimization
*Goal: Reduce LCP (Largest Contentful Paint) and overall payload size.*

- [ ] **Standardize Image Qualities**: 
    - Update `next.config.ts` to include common quality ranges (e.g., `[75, 85, 95]`) to resolve Next.js quality warnings.
- [ ] **Sizes Attribute Audit**: 
    - Ensure all `next/image` components have accurate `sizes` attributes (e.g., `(max-width: 768px) 100vw, 33vw`) to prevent mobile devices from downloading desktop-sized assets.
- [ ] **Priority Loading**: 
    - Apply `priority={true}` to the first two images in the `HeroSection` and the main site logo in `Navigation` to boost LCP.
- [ ] **WebP/Avif Enforcement**: 
    - Verify that all static images are served in modern formats (avif/webp) via Next.js's built-in optimizer.
- [ ] **SVG Minification**: 
    - Audit `public/` and inline SVG components to ensure they are minified and don't contain unnecessary metadata.

## Phase 2: Code Splitting & Dynamic Loading
*Goal: Reduce initial bundle size and improve FID (First Input Delay).*

- [ ] **Below-the-Fold Dynamic Imports**: 
    - Use `next/dynamic` for sections that are not immediately visible on page load:
        - `FAQSection`
        - `CommunitySection`
        - `FounderSection`
        - `AudienceSection`
        - `ClosingSection`
- [ ] **Component-Level Lazy Loading**:
    - Ensure the `EnquiryModal` is only loaded and hydrated when requested or after the initial page transition.
- [ ] **Library Optimization**:
    - Verify that `lucide-react` icons are being imported individually to enable tree-shaking and reduce the main bundle size.

## Phase 3: Animation & Rendering Performance
*Goal: Ensure 60FPS smoothness even on lower-end devices.*

- [ ] **Throttling & Debouncing**:
    - Ensure all parallax and scroll-linked animations (e.g., in `HeroSection`, `AmenitiesSection`) are throttled to 60fps and paused when the tab is inactive or a modal is open.
- [ ] **GPU Offloading**:
    - Add `translateZ(0)` or `will-change: transform` to complex `framer-motion` components to force hardware acceleration.
- [ ] **Layout Shift Mitigation (CLS)**:
    - Set explicit aspect-ratio placeholders for all images and interactive cards (like `RoomCard`) to prevent layout shifts during content hydration.

## Phase 4: SEO & Infrastructure Cleanup
*Goal: Improve discoverability and resolve developer console warnings.*

- [ ] **MetadataBase Configuration**:
    - Set the `metadataBase` property in `src/app/layout.tsx` to correctly resolve absolute URLs for Open Graph and Twitter images.
- [ ] **Structured Data (JSON-LD)**:
    - Implement `LocalBusiness` and `Product` schemas to help search engines understand Viramah's offerings and locations.
- [ ] **Typescript Strictness**:
    - Run `npm run type-check` and resolve any non-critical type errors or `any` usages to ensure long-term stability and easier future optimizations.

## Phase 5: Build & Deployment Tuning
*Goal: Minimize cold starts and maximize global performance.*

- [ ] **Standardize Next.js Config**:
    - Ensure `compress: true` and `reactCompiler: true` are fully utilized in `next.config.ts`.
- [ ] **Static Export (Optional)**:
    - Evaluate if certain marketing-only pages can be moved to static generation (SSG) to reduce server load and TTFB (Time to First Byte).
- [ ] **Bundle Analysis**:
    - Use `@next/bundle-analyzer` to perform a final audit of the production build to catch any remaining "bloat".

---
**Status**: Initial Draft Created  
**Scope**: Site-wide (All Pages & Components)  
**Constraints**: Visual Integrity & Functional Flow Must be Preserved.
