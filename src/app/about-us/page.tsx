import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function AboutUsPage() {
    return (
        <main className="min-h-screen flex flex-col bg-sand-light">
            <Navigation />

            <section className="pt-40 pb-20">
                <Container>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw">
                        The Story
                    </span>
                    <h1 className="font-display text-6xl mt-4 max-w-2xl">
                        From a shared problem to a shared solution.
                    </h1>
                </Container>
            </section>

            {/* Timeline Section */}
            <section className="py-20 bg-white border-y border-sand-dark/50">
                <Container>
                    <h2 className="font-display text-4xl mb-16">Our Journey</h2>
                    <div className="flex flex-col gap-12 border-l border-terracotta-raw/30 pl-8 ml-4 md:ml-20">
                        {[
                            { year: "2023", title: "The Idea", desc: "Frustrated by local PG options, we sketched the first version of Viramah on a napkin." },
                            { year: "2024", title: "First Location", desc: "Launched our pilot space in North Campus with 12 beds." },
                            { year: "2025", title: "Expansion", desc: "Growing to 3 locations and building the community app." },
                            { year: "2026", title: "The Future", desc: "Redefining student living across the country." }
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-sand-light border-2 border-terracotta-raw" />
                                <span className="font-mono text-terracotta-raw font-bold mb-2 block">{item.year}</span>
                                <h3 className="font-display text-2xl mb-2">{item.title}</h3>
                                <p className="opacity-70 max-w-md">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-terracotta-raw text-white">
                <Container>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        {[
                            { val: "3", label: "Locations" },
                            { val: "100+", label: "Happy Residents" },
                            { val: "24/7", label: "Support" },
                            { val: "4.9", label: "Avg Rating" }
                        ].map((stat, idx) => (
                            <div key={idx}>
                                <span className="font-display text-6xl block mb-2">{stat.val}</span>
                                <span className="font-mono text-xs uppercase tracking-widest opacity-70">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            <Footer />
        </main>
    );
}
