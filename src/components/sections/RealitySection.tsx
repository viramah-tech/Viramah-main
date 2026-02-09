import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function RealitySection() {
    return (
        <section className="py-24 bg-sand-dark relative overflow-hidden">
            <Container>
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    {/* Image Side (Left) */}
                    <div className="w-full lg:w-1/2" data-reveal>
                        <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
                            <div className="absolute inset-0 bg-charcoal/10 rounded-[2rem] transform rotate-3" />
                            <div className="absolute inset-0 bg-white rounded-[2rem] overflow-hidden shadow-2xl">
                                {/* Placeholder for Image */}
                                <div className="w-full h-full bg-sand-light flex items-center justify-center">
                                    <span className="font-mono opacity-30">[REALITY IMAGE]</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Side (Right) */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-6" data-reveal>
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-terracotta-raw">
                            The Reality
                        </span>
                        <h2 className="text-5xl lg:text-6xl leading-[1.1]">
                            Student living shouldn't be a compromise.
                        </h2>
                        <p className="text-lg opacity-70 max-w-lg">
                            Cramped rooms, poor hygiene, and zero community. The standard for student housing has been too low for too long. We're here to change that.
                        </p>
                        <div className="pt-4">
                            <Button variant="secondary">Read Our Philosophy</Button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
