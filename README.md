<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind">
</p>

<h1 align="center">🏠 Viramah</h1>

<p align="center">
  <strong>विरामाह — The Art of the Pause</strong>
  <br>
  <em>A premium student living platform designed for the modern Indian journey</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## ✨ Overview

Viramah is an intentional community-living platform that connects students with premium accommodations. The platform features a beautiful, responsive UI with smooth animations and a comprehensive booking flow.

### 🎯 Current Status

| Module | Status |
|--------|--------|
| Landing Page | ✅ Complete |
| User Onboarding | ✅ Complete |
| Student Portal | ✅ Complete |
| Parent Portal | ✅ Complete |
| Authentication | 🚧 In Progress |
| Backend Integration | 📋 Planned |

---

## 🚀 Features

### 🏡 Landing Page

- Hero section with stunning visuals
- Interactive room search with filters
- Room showcase with premium cards
- Community and lifestyle sections
- Founder story and value proposition

### 👤 User Onboarding (4-Step Flow)

1. **Identity Verification** — Name, DOB, ID upload with photo preview
2. **Emergency Contacts** — Guardian details with document upload
3. **Room Selection** — Interactive room browser with filters, sorting, and mess package selection
4. **Lifestyle Preferences** — Dietary, sleep, and noise preferences

### 📱 Student Portal

- **Dashboard** — Quick stats, upcoming events, wallet overview
- **Wallet** — Balance card, transaction history
- **Canteen** — Food ordering (coming soon)
- **Amenities** — Gym, laundry booking (coming soon)
- **Settings** — Profile management, notifications, security

### 👨‍👩‍👧 Parent Portal

- **Dashboard** — Child status, activity monitoring, quick stats
- **Visit Scheduling** — Date/time slot booking with purpose tracking

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Supabase](https://supabase.com/) (planned) |

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/viramah-tech/Viramah-main.git

# Navigate to project directory
cd viramah-website

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication
│   ├── user-onboarding/   # 4-step booking wizard
│   │   ├── step-1/        # Identity verification
│   │   ├── step-2/        # Emergency contacts
│   │   ├── step-3/        # Room selection
│   │   ├── step-4/        # Preferences
│   │   └── confirm/       # Booking review
│   ├── student/           # Student portal
│   │   ├── dashboard/
│   │   ├── wallet/
│   │   ├── canteen/
│   │   ├── amenities/
│   │   └── settings/
│   └── parent/            # Parent portal
│       ├── dashboard/
│       └── visit/
├── components/
│   ├── layout/            # Navigation, Footer, Container
│   ├── sections/          # Landing page sections
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
└── styles/                # Global styles
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `terracotta-raw` | Primary | CTAs, accents, brand |
| `terracotta-soft` | Secondary | Gradients, highlights |
| `gold` | Accent | Secondary actions |
| `sage-muted` | Success | Success states |
| `charcoal` | Text | Primary text |
| `sand-light` | Background | Page backgrounds |
| `sand-dark` | Border | Borders, dividers |

### Typography

- **Display** — Headings, brand text
- **Body** — Paragraph content
- **Mono** — Labels, metadata, tracking

---

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

### Landing Page
>
> Hero section with discovery search

### Room Selection
>
> Interactive room cards with filters and sorting

### Student Dashboard
>
> Quick stats and upcoming events

### Parent Portal
>
> Child monitoring and visit scheduling

</details>

---

## 🗺 Roadmap

### Phase 1: Frontend (✅ Complete)

- [x] Landing page with all sections
- [x] User onboarding flow
- [x] Student portal pages
- [x] Parent portal pages
- [x] Responsive design
- [x] Animations and transitions

### Phase 2: Backend (🚧 In Progress)

- [ ] Supabase project setup
- [ ] User authentication (Email + Google OAuth)
- [ ] Database schema implementation
- [ ] API routes for CRUD operations

### Phase 3: Payments & Features

- [ ] Room booking with payments
- [ ] Wallet top-up integration
- [ ] Canteen ordering system
- [ ] Amenity booking

### Phase 4: Admin & Operations

- [ ] Admin dashboard
- [ ] Manager portal
- [ ] Maintenance tracking
- [ ] Analytics and reporting

---

## 📄 Documentation

- [Project Analysis](./docs/PROJECT_ANALYSIS.md) — Detailed technical breakdown
- [Implementation Plan](./docs/implementation_plan.md) — Development roadmap

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary software owned by Viramah Technologies.

---

## 👥 Team

**Viramah Technologies**

---

<p align="center">
  <strong>विरामाह</strong> — For the life you are building, a place to breathe.
</p>
