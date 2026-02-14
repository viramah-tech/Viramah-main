import { Container } from "@/components/layout/Container";
import Image from "next/image";

export function DifferenceSection() {
    return (
        <section className="py-40 md:py-56 bg-cream-warm">
            <Container>
                <div className="flex flex-col gap-20 items-center">
                    {/* Quote */}
                    <div className="text-center max-w-4xl">
                        
                        <h2 className="font-display text-5xl md:text-7xl leading-tight text-terracotta-raw mb-8">
                            "We build spaces that rest the chaos of the city, giving you the room to build yourself"
                        </h2>
                        <p className="font-mono text-xs tracking-widest uppercase text-charcoal/60">
                            The Viramah Promise
                        </p>
                    </div>

                    {/* Before & After Images */}
                    <div className="w-full">
                        <h3 className="text-4xl md:text-5xl font-display font-bold text-charcoal text-center mb-20">
                            Our Transformation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {/* Before */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl mb-6 bg-charcoal/5">
                                    <Image
                                        src="/diffrence%20section%20images/before.jpg"
                                        alt="Before - Original space"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        quality={95}
                                        loading="lazy"
                                        className="object-cover"
                                        priority={false}
                                    />
                                </div>
                                <h4 className="text-2xl font-semibold text-charcoal">Before Viramah</h4>
                                <p className="text-charcoal/70 mt-2">Original Space</p>
                            </div>

                            {/* After 1 */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl mb-6 bg-charcoal/5">
                                    <Image
                                        src="/diffrence%20section%20images/after%20(1).jpg"
                                        alt="After - Transformation view 1"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        quality={95}
                                        loading="lazy"
                                        className="object-cover"
                                        priority={false}
                                    />
                                </div>
                                <h4 className="text-2xl font-semibold text-charcoal">After Viramah</h4>
                                <p className="text-charcoal/70 mt-2">Modern Transformation</p>
                            </div>

                            {/* After 2 */}
                            <div className="flex flex-col items-center">
                                <div className="relative w-full h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl mb-6 bg-charcoal/5">
                                    <Image
                                        src="/diffrence%20section%20images/after%20(2).jpg"
                                        alt="After - Transformation view 2"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        quality={95}
                                        loading="lazy"
                                        className="object-cover"
                                        priority={false}
                                    />
                                </div>
                                <h4 className="text-2xl font-semibold text-charcoal">After Viramah</h4>
                                <p className="text-charcoal/70 mt-2">Enhanced Living Space</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
