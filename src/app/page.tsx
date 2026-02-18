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
                  View All Rooms
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <RoomCard
                title="The Solo"
                type="1 SEATER"
                price="₹25,000"
                image="/placeholder-1.jpg"
              />
              <RoomCard
                title="The Duo"
                type="2 SEATER"
                price="₹18,000"
                image="/placeholder-2.jpg"
                className="md:translate-y-20" // Stagger effect
              />
              <RoomCard
                title="The Tribe"
                type="3 SEATER"
                price="₹15,000"
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
