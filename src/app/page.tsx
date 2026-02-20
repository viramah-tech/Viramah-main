import { Navigation } from "@/components/layout/Navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { RoomCard } from "@/components/ui/RoomCard";
// import { RealitySection } from "@/components/sections/RealitySection";
import { AmenitiesSection } from "@/components/sections/AmenitiesSection";
import { DifferenceSection } from "@/components/sections/DifferenceSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { LifeAtViramahSection } from "@/components/sections/LifeAtViramahSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { FounderSection } from "@/components/sections/FounderSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { ClosingSection } from "@/components/sections/ClosingSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyViramahSection } from "@/components/sections/WhyViramahSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viramah | Next Generation Student Living in India",
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
                title="Studio 1-Seater"
                type="1 SEATER · STUDIO"
                price="₹17,749"
                image="/placeholder-1.jpg"
              />
              <RoomCard
                title="Studio 2-Seater"
                type="2 SEATER · STUDIO"
                price="₹14,999"
                image="/placeholder-2.jpg"
                className="md:translate-y-20" // Stagger effect
              />
              <RoomCard
                title="1BHK 4-Seater"
                type="4 SEATER · 1BHK"
                price="₹9,090"
                image="/placeholder-3.jpg"
              />
            </div>
          </div>
        </Container>
      </section>



      <CategoriesSection />
      <AmenitiesSection />
      <LifeAtViramahSection />
      <CommunitySection />
      <FounderSection />
      <FAQSection />
      <AudienceSection />
      <ClosingSection />

      <Footer />
    </main>
  );
}
