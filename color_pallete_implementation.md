## VIRAMAH Color Migration Strategy

### Phase 1: Color Token Mapping Architecture

Your current system uses semantic CSS variables. Here's the precise mapping from your existing variables to the new strategic palette:

| Current Variable | New Strategic Color | Hex Value | 3R Mapping |
|------------------|---------------------|-----------|------------|
| `--sand-light` | **Warm Sand Beige** | `#F3EDE2` | Recline |
| `--charcoal` | **Charcoal Brown-Black** | `#2E2A26` | Reset |
| `--terracotta-raw` | **Muted Terracotta** | `#C07A5A` | Spiritual/Community |
| *(likely missing)* | **Muted Dusty Blue** | `#6C8EA6` | Reset Calm |
| *(likely missing)* | **Deep Sage Green** | `#7A9D7B` | Rise Energy |
| *(likely missing)* | **Warm Cream Tint** | `#FBF7F0` | Community Light |
| *(likely missing)* | **Soft Antique Gold** | `#C2A75E` | Premium Detail |
| *(likely missing)* | **Muted Mustard** | `#D9B44A` | Attention |

### Phase 2: Implementation Layers (Zero-Breakage Approach)

#### Layer 1: CSS Variable Redefinition (globals.css)
**Risk Level: ZERO** — Only changes values, not variable names or structure.

Update your `@theme` block to inject new hex values into existing variable names. This ensures every component using `--sand-light` automatically receives the new `#F3EDE2` without touching component code.

**Critical Constraint**: Maintain your current variable naming convention to prevent breaking 53 existing files.

#### Layer 2: Tailwind Class Mapping Verification
**Risk Level: LOW** — Audit existing utility classes.

Your components likely use classes like:
- `bg-sand-light` → maps to `--sand-light` (now `#F3EDE2`)
- `text-charcoal` → maps to `--charcoal` (now `#2E2A26`)
- `border-terracotta-raw` → maps to `--terracotta-raw` (now `#C07A5A`)

**Action**: Run a regex search across all `.tsx` files to identify hardcoded hex values or rgb() values that bypass your design system. Replace any found with semantic class names.

#### Layer 3: New Accent Integration (Additive Only)
**Risk Level: ZERO** — New colors don't affect existing components.

Introduce four new CSS variables for the missing strategic colors:
- `--blue-muted` → `#6C8EA6`
- `--green-sage` → `#7A9D7B`
- `--cream-warm` → `#FBF7F0`
- `--gold-antique` → `#C2A75E`
- `--mustard-muted` → `#D9B44A`

These extend your system without breaking existing usage. They become available immediately for new components or selective refactoring.

### Phase 3: Component-Level Color Strategy

#### High-Impact, Zero-Risk Updates
Update these components first for maximum visual impact with zero functional risk:

1. **Layout.tsx / Root Layout**: Background color (`--sand-light` → `#F3EDE2`)
2. **Navigation**: Background and text colors
3. **Hero Section**: Background gradient using new beige base
4. **Footer**: Background (`--charcoal` → `#2E2A26`)
5. **RoomCard**: Background and border colors
6. **Button variants**: Update CVA variants to map to new strategic colors

#### Color Application Rules by Component Type

**Layout Components** (Structure):
- Backgrounds: Warm Sand Beige (`#F3EDE2`)
- Text: Charcoal Brown-Black (`#2E2A26`)
- Subtle borders: Warm Cream Tint (`#FBF7F0`)

**Interactive Components** (Buttons, Links):
- Primary: Deep Sage Green (`#7A9D7B`) — Rise Energy
- Secondary: Muted Dusty Blue (`#6C8EA6`) — Reset Calm
- Tertiary/Outline: Charcoal with Warm Cream border
- Hover states: Shift 10% lighter or add Soft Antique Gold accent

**Content Components** (Cards, Sections):
- Card backgrounds: Warm Cream Tint (`#FBF7F0`)
- Elevation/shadows: Use opacity variations of Charcoal
- Highlight accents: Muted Terracotta (`#C07A5A`) for community elements

**Typography**:
- Headings: Charcoal Brown-Black (`#2E2A26`)
- Body text: Charcoal at 85% opacity
- Subheadings/Labels: Muted Dusty Blue (`#6C8EA6`)
- Links: Deep Sage Green (`#7A9D7B`) with Soft Antique Gold hover

### Phase 4: Animation & Motion Preservation

**Critical**: Color transitions must respect existing Framer Motion configurations.

Your current animations likely use:
- `transition-colors` or `transition-all` in Tailwind
- Framer Motion's `animate` props with color values

**Strategy**:
1. **CSS Transitions**: Ensure all color-changing elements have `transition-colors duration-300` or similar. The new palette has similar saturation levels, so timing feels identical.
2. **Framer Motion**: If any animations hardcode color values (e.g., `animate={{ backgroundColor: "#fff" }}`), these must be updated to use CSS variables or new hex values.
3. **Gradient Animations**: If you have animated gradients, ensure the new colors blend similarly (all your new colors are muted, so they blend more smoothly than neon alternatives).

### Phase 5: Verification Checklist

Before deployment, verify:

- [ ] No pure black (`#000000`) or pure white (`#FFFFFF`) remain except in specific high-contrast accessibility cases
- [ ] All 53 source files still compile without TypeScript errors
- [ ] No visual regression in Framer Motion animations (check hover states, page transitions)
- [ ] Button CVA variants render correctly with new colors
- [ ] RoomCard components maintain their layout and shadow integrity
- [ ] Navigation remains sticky/functional with new background colors
- [ ] FormInput components maintain focus states and accessibility
- [ ] Dark mode (if implemented) maps correctly — or confirm dark mode is out of scope

### Phase 6: Rollback Strategy

Since this is a color-only change:
1. **Git checkpoint**: Commit current state before any changes
2. **Variable backup**: Comment out old color values above new ones in globals.css during transition
3. **Feature flag**: If using any runtime theming, implement a quick toggle to switch between old and new palettes for stakeholder review

---

## Implementation Priority Queue

**Day 1 (Foundation)**:
- Update `globals.css` with new hex values for existing variables
- Add new CSS variables for missing accents
- Verify layout.tsx renders correctly

**Day 2 (Components)**:
- Update Button CVA variants
- Update RoomCard backgrounds and borders
- Update Navigation and Footer

**Day 3 (Polish)**:
- Audit for hardcoded colors in component files
- Verify all animations still function
- Check responsive behavior (colors should work at all breakpoints)

**Day 4 (Testing)**:
- Cross-browser color consistency check
- Accessibility contrast verification (WCAG AA compliance)
- Mobile color rendering verification

---

## Key Constraints Reminder

1. **No tailwind.config.js edits** — Work within `@theme` in globals.css only
2. **Server Components remain Server Components** — Don't add "use client" just for colors
3. **Preserve CVA patterns** — Update variant definitions, not the CVA structure itself
4. **Mock data remains mock** — Don't touch Supabase client or auth placeholders
5. **Font system intact** — DM Serif Display, Inter, JetBrains Mono remain unchanged

