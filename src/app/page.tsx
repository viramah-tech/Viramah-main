import { Navigation } from "@/components/layout/Navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { RoomCard } from "@/components/ui/RoomCard";
// import { RealitySection } from "@/components/sections/RealitySection";
import { DifferenceSection } from "@/components/sections/DifferenceSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyViramahSection } from "@/components/sections/WhyViramahSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Metadata } from "next";
import dynamic from "next/dynamic";

// Skeleton placeholder for lazy-loaded sections (prevents CLS)
const SectionSkeleton = () => (
  <div className="w-full animate-pulse" style={{ minHeight: '400px' }}>
    <div className="h-full bg-sand-dark/20 rounded-lg" />
  </div>
);

// Dynamic imports for below-the-fold sections
const CategoriesSection = dynamic(() => import("@/components/sections/CategoriesSection").then((mod) => mod.CategoriesSection), { ssr: true, loading: () => <SectionSkeleton /> });
const AmenitiesSection = dynamic(() => import("@/components/sections/AmenitiesSection").then((mod) => mod.AmenitiesSection), { ssr: true, loading: () => <SectionSkeleton /> });
const LifeAtViramahSection = dynamic(() => import("@/components/sections/LifeAtViramahSection").then((mod) => mod.LifeAtViramahSection), { ssr: true, loading: () => <SectionSkeleton /> });
const CommunitySection = dynamic(() => import("@/components/sections/CommunitySection").then((mod) => mod.CommunitySection), { ssr: true, loading: () => <SectionSkeleton /> });
const FoodSection = dynamic(() => import("@/components/sections/FoodSection").then((mod) => mod.FoodSection), { ssr: true, loading: () => <SectionSkeleton /> });
const FounderSection = dynamic(() => import("@/components/sections/FounderSection").then((mod) => mod.FounderSection), { ssr: true, loading: () => <SectionSkeleton /> });
const AudienceSection = dynamic(() => import("@/components/sections/AudienceSection").then((mod) => mod.AudienceSection), { ssr: true, loading: () => <SectionSkeleton /> });
const ClosingSection = dynamic(() => import("@/components/sections/ClosingSection").then((mod) => mod.ClosingSection), { ssr: true, loading: () => <SectionSkeleton /> });



export const metadata: Metadata = {
  title: "Viramah stay",
  description: "Experience premium student living at Viramah. Modern hostel with high-speed WiFi, gaming zone, and nutritious food. The ultimate PG alternative for students.",
  openGraph: {
    title: "Viramah | Premium Student Living Reimagined",
    description: "Modern hostel with high-speed WiFi, gaming zone, nutritious food, and a thriving community. The ultimate PG alternative for students in India.",
    url: "https://viramahstay.com",
  },
  keywords: [
    "best hostel for students in India",
    "hostel that feels like home",
    "modern youth hostel India",
    "hostel with gaming zone",
    "premium yet affordable hostel",
    "safe and respectful hostel",
    "next generation hostel India"
  ]
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is included in the rent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our all-inclusive rent covers your premium furnished stay, high-speed WiFi, daily housekeeping, 24/7 security, In-House Mess with 3 meals a day (Breakfast, Supper & Dinner), and full access to all community spaces like the gaming zone, gym, and library."
                }
              },
              {
                "@type": "Question",
                "name": "Is food available?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! We serve 3 wholesome meals a day — Breakfast, Supper, and Dinner — through our In-House Quality Mess. We also have a 24x7 Canteen, Self Pantry Services, and a Restaurant on-site."
                }
              },
              {
                "@type": "Question",
                "name": "What security measures are in place?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "We have 2-layer round-the-clock security with continuous 24x7 CCTV surveillance monitoring of all common areas and residential zones."
                }
              },
              {
                "@type": "Question",
                "name": "What is the booking process?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Select your preferred living type, schedule a visit or take a virtual tour, submit your basic documents, and pay the security deposit to lock your space."
                }
              }
            ]
          })
        }}
      />
      <Navigation />

      {/* Terra-inspired Hero Section with Scroll Gallery */}
      <HeroSection />
      <WhyViramahSection />

      <DifferenceSection />

      {/* Rooms Showcase Section */}
      <section className="py-16 md:py-28 bg-sand-light">
        <Container>
          <div className="flex flex-col gap-10 md:gap-16">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 md:mb-6">Curated Spaces</h2>
                <p className="text-base md:text-lg opacity-70">
                  Designed for focus, comfort, and community. Choose the space that fits your rhythm.
                </p>
              </div>
              <Link href="/rooms" className="">
                <button className="border-b border-charcoal pb-1 uppercase tracking-widest font-mono text-xs hover:text-terracotta-raw hover:border-terracotta-raw transition-colors">
                  View All Spaces
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-start">

              <RoomCard
                title="VIRAMAH COLLECTIVE"
                type="3 SEATER"
                price="₹12,490"
                originalPrice="₹20,817"
                tag="Limited"
                featured
                amenities={["650 Sq Ft", "Community Pick", "High-Speed WiFi", "Study Desk", "Kitchen", "3 Meals", "2 Bean Bags"]}
                images={[
                  "/room images/3 seater/room 1.png",
                  "/room images/3 seater/room 2.png",
                  "/room images/3 seater/study tables.webp",
                  "/room images/3 seater/toilet.webp",
                ]}
              />
              <RoomCard
                title="VIRAMAH NEXUS"
                type="4 SEATER"
                price="₹9,090"
                originalPrice="₹15,150"
                tag="Limited"
                featured
                amenities={["650 Sq Ft", "Shared Space", "High-Speed WiFi", "Study Desk", "Economy", "3 Meals", "2 Bean Bags"]}
                images={[
                  "/room images/4 seater/room 1.webp",
                  "/room images/4 seater/room 2.webp",
                  "/room images/4 seater/study tables.webp",
                  "/room images/4 seater/toilet.webp",
                ]}
                className=""
              />
              <RoomCard
                title="VIRAMAH AXIS"
                type="2 SEATER"
                price="₹14,490"
                originalPrice="₹24,150"
                tag="Best Value"
                amenities={["450 Sq Ft", "High-Speed WiFi", "Study Desk", "Essential Living", "3 Meals", "1 Bean Bag"]}
                images={[
                  "/room images/2 seater/bed + table.png",
                  "/room images/2 seater/cuboard + beds.png",
                  "/room images/2 seater/cuboard.png",
                  "/room images/2 seater/toilet .png.jpeg",
                ]}
              />

            </div>
          </div>
        </Container>
      </section>



      <CategoriesSection />
      <AmenitiesSection />
      <LifeAtViramahSection />
      <CommunitySection />
      <FoodSection />
      <FounderSection />
      <AudienceSection />
      <FAQSection />
      <ClosingSection />

      <Footer />
    </main>
  );
}
