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

// Dynamic imports for below-the-fold sections
const CategoriesSection = dynamic(() => import("@/components/sections/CategoriesSection").then((mod) => mod.CategoriesSection), { ssr: true });
const AmenitiesSection = dynamic(() => import("@/components/sections/AmenitiesSection").then((mod) => mod.AmenitiesSection), { ssr: true });
const LifeAtViramahSection = dynamic(() => import("@/components/sections/LifeAtViramahSection").then((mod) => mod.LifeAtViramahSection), { ssr: true });
const CommunitySection = dynamic(() => import("@/components/sections/CommunitySection").then((mod) => mod.CommunitySection), { ssr: true });
const FoodSection = dynamic(() => import("@/components/sections/FoodSection").then((mod) => mod.FoodSection), { ssr: true });
const FounderSection = dynamic(() => import("@/components/sections/FounderSection").then((mod) => mod.FounderSection), { ssr: true });
const AudienceSection = dynamic(() => import("@/components/sections/AudienceSection").then((mod) => mod.AudienceSection), { ssr: true });
const ClosingSection = dynamic(() => import("@/components/sections/ClosingSection").then((mod) => mod.ClosingSection), { ssr: true });


export const metadata: Metadata = {
  title: "Viramah stay",
  description: "Experience premium student living at Viramah. Modern hostel with high-speed WiFi, gaming zone, and nutritious food. The ultimate PG alternative for Gen Z and working professionals.",
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
                price="₹11,499"
                tag="Limited"
                featured
                amenities={["650 Sq Ft", "Community Pick", "High-Speed WiFi", "Study Desk", "Kitchen", "3 Meals"]}
                images={[
                  "/room images/3 seater/room 1.png",
                  "/room images/3 seater/room 2.png",
                  "/room images/3 seater/study tables.webp",
                  "/room images/3 seater/toilet.webp",
                ]}
              />
              <RoomCard
                title="VIRAMAH NEXUS+"
                type="4 SEATER"
                price="₹9,090"
                tag="Limited"
                featured
                amenities={["650 Sq Ft", "Shared Space", "High-Speed WiFi", "Study Desk", "Economy", "3 Meals"]}
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
                price="₹12,499"
                tag="Best Value"
                amenities={["450 Sq Ft", "High-Speed WiFi", "Study Desk", "Essential Living", "3 Meals"]}
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
