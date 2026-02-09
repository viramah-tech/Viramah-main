import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <Container>
                    <div className="max-w-4xl">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw">
                            About Viramah
                        </span>
                        <h1 className="font-display text-6xl md:text-8xl mt-4 mb-8 text-charcoal">
                            Redefining Student Living
                        </h1>
                        <p className="text-xl max-w-2xl opacity-70">
                            We are building spaces that honour the student journey. Where architecture meets ambition.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <Container>
                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="w-full lg:w-1/2">
                            <h2 className="font-display text-4xl mb-6">The Mission</h2>
                            <p className="text-lg opacity-80 mb-6">
                                Viramah was born from a simple observation: student housing is often an afterthought. We believe your environment shapes your future.
                            </p>
                            <p className="text-lg opacity-80">
                                Our mission is to create sanctuaries that balance privacy with community, giving you the space to pause, reflect, and grow.
                            </p>
                        </div>
                        <div className="w-full lg:w-1/2 bg-terracotta-soft/20 rounded-3xl min-h-[400px]" />
                    </div>
                </Container>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-sand-dark/30">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl">How It Works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Select Your Space", desc: "Choose from our curated 1, 2, or 3 seater rooms." },
                            { step: "02", title: "Apply & Verify", desc: "Simple digital application and verification process." },
                            { step: "03", title: "Move In", desc: "Arrive to a fully furnished, ready-to-live sanctuary." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm">
                                <span className="font-display text-6xl text-terracotta-raw/20 block mb-4">{item.step}</span>
                                <h3 className="font-display text-2xl mb-2">{item.title}</h3>
                                <p className="opacity-70">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Values Grid */}
            <section className="py-24 bg-white">
                <Container>
                    <h2 className="font-display text-4xl mb-12">Our Values</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {["Privacy First", "Design Led", "Community Driven", "Transparent", "Safe & Secure", "Sustainable"].map((val, idx) => (
                            <div key={idx} className="p-8 border border-charcoal/10 rounded-xl flex items-center justify-center text-center hover:bg-sand-light transition-colors">
                                <span className="font-display text-xl">{val}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <section className="py-32 bg-terracotta-raw text-white text-center">
                <Container>
                    <h2 className="font-display text-5xl mb-8">Join the movement</h2>
                    <Button size="lg" className="bg-white text-terracotta-raw hover:bg-white/90">
                        View Available Rooms
                    </Button>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
