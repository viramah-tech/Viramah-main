import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col bg-charcoal">
            <Navigation />

            <div className="flex-1 flex items-center justify-center relative overflow-hidden pt-20">
                {/* Decorative background element */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
                />

                <Container>
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <span className="font-mono text-gold-antique tracking-[0.4em] uppercase text-xs mb-6">Error Code 404</span>

                        <h1 className="font-display text-8xl md:text-[12rem] text-cream-warm leading-none tracking-tighter mb-8">
                            STRAYING <br />
                            <span className="text-gold italic">AWAY?</span>
                        </h1>

                        <p className="font-body text-sand-light/60 max-w-md text-lg mb-12 leading-relaxed">
                            It seems the path you're looking for has faded into the mist.
                            Let's guide you back to the sanctuary.
                        </p>

                        <div className="flex flex-col md:flex-row gap-6">
                            <Link href="/">
                                <button className="px-10 py-4 bg-gold text-luxury-green font-mono font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gold-antique transition-all transform hover:-translate-y-1">
                                    Return Home
                                </button>
                            </Link>
                            <Link href="/rooms">
                                <button className="px-10 py-4 border border-gold/30 text-gold-antique font-mono font-bold uppercase tracking-widest text-xs rounded-full hover:bg-white/5 transition-all">
                                    Explore Spaces
                                </button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>

            <Footer />
        </main>
    );
}
