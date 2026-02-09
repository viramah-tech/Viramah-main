import { Container } from "@/components/layout/Container";

export function DifferenceSection() {
    return (
        <section className="py-32 bg-sand-light text-center">
            <Container>
                <div className="max-w-4xl mx-auto flex flex-col gap-8 items-center" data-reveal>
                    <div className="w-px h-24 bg-terracotta-raw opacity-30" />
                    <blockquote className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight text-terracotta-raw">
                        "We build spaces that pause the chaos of the city, giving you the room to build yourself."
                    </blockquote>
                    <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-50 mt-4">
                        The Viramah Promise
                    </span>
                </div>
            </Container>
        </section>
    );
}
