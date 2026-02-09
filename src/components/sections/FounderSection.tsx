import { Container } from "@/components/layout/Container";

export function FounderSection() {
    return (
        <section className="py-32 bg-sand-light relative">
            <Container>
                <div className="max-w-3xl mx-auto flex flex-col gap-8 text-center items-center">
                    <div className="w-20 h-20 rounded-full bg-sand-dark mb-4" /> {/* Founder Avatar Placeholder */}

                    <blockquote className="font-display text-3xl md:text-4xl text-charcoal">
                        "We realized that the environment you sleep in dictates the quality of the work you wake up to do. Viramah is our answer to that."
                    </blockquote>

                    <div className="flex flex-col gap-1">
                        <cite className="font-display text-lg not-italic text-terracotta-raw">
                            Akshat & Co-Founder
                        </cite>
                        <span className="font-mono text-xs opacity-50 uppercase tracking-widest">
                            Founders, Viramah
                        </span>
                    </div>
                </div>
            </Container>
        </section>
    );
}
