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
      <section className="py-20 md:py-32 bg-sand-light">
        <Container>
          <div className="flex flex-col gap-16">
            <div className="flex justify-between items-end">
              <div className="max-w-xl">
                <h2 className="text-5xl md:text-6xl mb-6">Curated Spaces</h2>
                <p className="text-lg opacity-70">
                  Designed for focus, comfort, and community. Choose the space that fits your rhythm.
                </p>
              </div>
              <Link href="/rooms" className="hidden md:block">
                <button className="border-b border-charcoal pb-1 uppercase tracking-widest font-mono text-xs hover:text-terracotta-raw hover:border-terracotta-raw transition-colors">
                  View All Spaces
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">

              <RoomCard
                title="VIRAMAH COLLECTIVE"
                type="3 SEATER"
                price="₹11,499"
                image="/placeholder-1.jpg"

              />
              <RoomCard
                title="VIRAMAH NEXUS+"
                type="4 SEATER"
                price="₹9,090"
                image="/placeholder-3.jpg"
                className="md:translate-y-20"
              />
              <RoomCard
                title="VIRAMAH AXIS"
                type="2 SEATER · STUDIO"
                price="₹12,499"
                image="/placeholder-2.jpg"

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
