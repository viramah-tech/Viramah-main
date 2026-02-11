import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { SearchBar } from "@/components/search/SearchBar";
import { RoomCard } from "@/components/ui/RoomCard";
import { RealitySection } from "@/components/sections/RealitySection";
import { DifferenceSection } from "@/components/sections/DifferenceSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { LifeAtViramahSection } from "@/components/sections/LifeAtViramahSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { FounderSection } from "@/components/sections/FounderSection";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { ClosingSection } from "@/components/sections/ClosingSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 overflow-hidden">
        {/* Hero Background Image */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 40%, var(--sand-light) 95%), url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=2000')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(10%) contrast(95%)',
          }}
        />

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw opacity-70 block mb-6">
              विरामाह — The Art of the Pause
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.1] text-terracotta-raw mb-6">
              For the life you are building, a place to breathe.
            </h1>
            <p className="font-body text-xl max-w-lg text-charcoal/80">
              An intentional community-living experience designed for the modern Indian journey.
            </p>
          </div>
        </Container>
      </section>


      <RealitySection />
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
              <button className="hidden md:block border-b border-charcoal pb-1 uppercase tracking-widest font-mono text-xs hover:text-terracotta-raw hover:border-terracotta-raw transition-colors">
                View All Rooms
              </button>
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
      <LifeAtViramahSection />
      <CommunitySection />
      <FounderSection />
      <AudienceSection />
      <ClosingSection />

      <Footer />
    </main>
  );
}
