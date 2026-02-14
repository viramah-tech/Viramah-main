# Image Integration & Vercel Deployment Guide

## Overview
All images from the public folder subfolders have been integrated into the Viramah website sections. The integration is optimized for Vercel deployment with high-quality image delivery.

## Image Organization

### 1. **Amenities Section** (`/public/amenities/`)
11 high-quality JPG images integrated into the amenities showcase:
- `ac.jpg` - AC Units (Climate controlled comfort)
- `cafe.jpg` - 24x7 Cafe (Convenient dining)
- `common ares.jpg` - Common Areas (Social spaces)
- `coworking space.jpg` - Co-working Space (Professional workstations)
- `front desk.jpg` - Front Desk (24x7 assistance)
- `gym.jpg` - Gym (Fitness facilities)
- `high speed wifi.jpg` - High Speed WiFi (Fast connectivity)
- `library.jpg` - Library (Quiet study spaces)
- `power backup.jpg` - Power Backup (Uninterrupted supply)
- `secure lockers.jpg` - Secure Lockers (Safe storage)
- `water dispencer.jpg` - Water Dispensers (Clean drinking water)

**Component:** `src/components/sections/AmenitiesSection.tsx`
**Features:**
- Responsive grid layout (2-4 columns based on screen size)
- Full-size image display (aspect-square)
- Hover effects with subtle scale and shadow transitions
- Quality: 90% with lazy loading
- Optimized `sizes` attribute for responsive images

### 2. **Difference Section** (`/public/diffrence section images/`)
Before/After transformation images showcasing Viramah's improvements:
- `before.jpg` - Original space
- `after (1).jpg` - Transformation view 1
- `after (2).jpg` - Transformation view 2

**Component:** `src/components/sections/DifferenceSection.tsx`
**Features:**
- 3-column grid (responsive to 1 column on mobile)
- Quote section with transformation visuals
- Labeled "Before", "After - View 1", "After - View 2"
- Quality: 90% with lazy loading
- Equal aspect-square display

### 3. **Life at Viramah Section** (`/public/life at viramah images/`)
3 showcase images of Viramah facilities and lifestyle:
- `common area.jpg` - Social hub with comfortable seating
- `gaming zone .jpg` - Entertainment and recreation space
- `swiming pool.jpg` - Aquatic facilities

**Component:** `src/components/sections/LifeAtViramahSection.tsx`
**Features:**
- 3-column grid layout with consistent height (300px mobile, 350px desktop)
- Overlay gradient text labels for each space
- Hover effects with scale transformation
- Quality: 90% with lazy loading
- Overlay text: "Common Area", "Gaming Zone", "Swimming Pool"

## Technical Optimizations for Vercel

### Next.js Image Configuration
Located in `next.config.ts`:

```typescript
images: {
  formats: ["image/webp", "image/avif"],  // Modern formats for smaller file sizes
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],  // Device breakpoints
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // Content image sizes
  minimumCacheTTL: 60 * 60 * 24 * 365,  // 1-year cache for immutable images
  compress: true,  // Automatic compression
  productionBrowserSourceMaps: false,  // Reduce bundle size
}
```

### Image Component Best Practices Used

1. **`fill` property**: Used for flexible sizing with aspect-ratio containers
2. **`sizes` attribute**: Responsive image hints for different screen sizes
3. **`quality={90}`**: High quality while maintaining file size
4. **`loading="lazy"`**: Lazy loading images below the fold
5. **Alt text**: Descriptive alt text for accessibility and SEO
6. **No blur placeholder**: Using `quality={90}` provides sufficient performance

### Performance Features

✅ **Automatic Format Conversion**: Images served as WebP/AVIF to browsers that support them
✅ **Responsive Images**: Different image sizes served based on device screen size
✅ **Lazy Loading**: Images only load when approaching viewport
✅ **Caching**: 1-year cache for immutable images (max Vercel caching)
✅ **Compression**: Automatic optimization by Next.js Image component
✅ **No CLS (Cumulative Layout Shift)**: Fixed aspect ratios prevent layout shifts

## File References in Components

### Amenities (amenities.ts)
```typescript
export const AMENITIES: Amenity[] = [
  { id: 'wifi', title: 'HIGH SPEED WIFI', icon: '/amenities/high speed wifi.jpg', ... },
  { id: 'power', title: 'POWER BACKUP', icon: '/amenities/power backup.jpg', ... },
  // ... more amenities
];
```

### Difference Section
```typescript
<Image src="/diffrence section images/before.jpg" alt="Before - Original space" />
<Image src="/diffrence section images/after (1).jpg" alt="After - Transformation one" />
<Image src="/diffrence section images/after (2).jpg" alt="After - Transformation two" />
```

### Life at Viramah
```typescript
<Image src="/life at viramah images/common area.jpg" alt="Common Area - Social hub" />
<Image src="/life at viramah images/gaming zone .jpg" alt="Gaming Zone - Entertainment" />
<Image src="/life at viramah images/swiming pool.jpg" alt="Swimming Pool - Aquatic facilities" />
```

## Image Quality & Clarity

All images maintain:
- **90% quality setting** for crisp, clear display
- **Responsive sizing**: Scaled appropriately for each breakpoint
- **High resolution**: Original images preserved at source resolution
- **Lazy loading**: No impact on initial page load performance
- **Modern formats**: WebP/AVIF formats reduce file size by 25-35%

## Vercel Deployment Checklist

✅ Images stored in `/public` folder (static files)
✅ Using Next.js `Image` component (optimal delivery)
✅ Image format conversion enabled in config
✅ Lazy loading implemented
✅ Responsive sizes configured
✅ Long cache TTL set for performance
✅ All alt text descriptive and SEO-friendly
✅ No external image CDN needed (Vercel handles optimization)

## Responsive Breakpoints

- **Mobile** (< 640px): 1-2 column grids, full-width images
- **Tablet** (640px - 1024px): 2-3 column grids
- **Desktop** (> 1024px): 3-6 column grids with optimal spacing

## Performance Metrics Expected

- **LCP (Largest Contentful Paint)**: < 2.5s with optimized images
- **FID (First Input Delay)**: < 100ms (not affected by images)
- **CLS (Cumulative Layout Shift)**: 0 (fixed aspect ratios)
- **Image Load Time**: < 500ms for hero, < 300ms for secondary images

## Maintenance Notes

1. **Image Naming**: Files contain spaces (e.g., "high speed wifi.jpg", "common ares.jpg") - ensure these are not renamed
2. **Path Cases**: Image paths are case-sensitive on Vercel (production Linux environment)
3. **Optimization**: Current JPGs are acceptable quality; convert to WebP if file size becomes an issue
4. **Updates**: Replace images in-place that maintain the same filename to leverage Vercel's cache

## Browser Support

- **WebP**: Chrome, Firefox, Edge, Safari 14+
- **AVIF**: Chrome 85+, Opera 71+
- **Fallback JPEG**: All browsers
- **Vercel CDN**: Automatic format selection based on browser

---

**Last Updated**: February 14, 2026
**Sections Integrated**: 3 (Amenities, Difference, Life at Viramah)
**Total Images**: 17
**Optimization Status**: ✅ Vercel-Ready
