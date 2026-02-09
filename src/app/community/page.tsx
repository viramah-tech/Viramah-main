import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function CommunityPage() {
    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            <section className="pt-40 pb-20 text-center">
                <Container>
                    <h1 className="font-display text-6xl md:text-8xl text-terracotta-raw">
                        Members, not tenants.
                    </h1>
                    <p className="mt-8 text-xl opacity-70 max-w-2xl mx-auto">
                        Viramah isn't just a place to sleep. It's a network of ambitious minds, creative souls, and future leaders.
                    </p>
                </Container>
            </section>

            <section className="py-20 bg-white">
                <Container>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="aspect-video bg-sand-dark rounded-2xl" />
                        <div>
                            <h2 className="font-display text-4xl mb-6">Our Philosophy</h2>
                            <p className="text-lg opacity-80 mb-6">
                                We curate our community to ensure diversity of thought and background. When you live at Viramah, you live with people who inspire you.
                            </p>
                            <Button>Apply for Membership</Button>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-24 bg-sand-dark/20">
                <Container>
                    <h2 className="font-display text-4xl mb-12 text-center">Community Perks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {["Weekly Dinners", "Mentorship", "Workspace Access", "Alumni Network"].map((perk, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:-translate-y-1 transition-transform">
                                <h3 className="font-display text-2xl mb-2">{perk}</h3>
                                <p className="opacity-60 text-sm">Exclusive access for all Viramah members.</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
