import { Container } from "@/components/layout/Container";
import Image from "next/image";

export function LifeAtViramahSection() {
    return (
        <section className="py-32 bg-cream-warm">
            <Container>
                <div className="flex flex-col gap-16">
                    <div className="flex justify-between items-end">
                        <h2 className="text-5xl lg:text-7xl font-display text-charcoal">Life at Viramah</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 auto-rows-[300px] md:auto-rows-[350px]">
                        {/* Common Area - Left */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <Image
                                src="/life at viramah images/common area.jpg"
                                alt="Common Area - Social hub of Viramah"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                quality={90}
                                loading="lazy"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-semibold text-lg md:text-xl">Common Area</p>
                        </div>

                        {/* Gaming Zone - Center Large */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group md:col-span-1">
                            <Image
                                src="/life at viramah images/gaming zone .jpg"
                                alt="Gaming Zone - Entertainment and recreation at Viramah"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                quality={90}
                                loading="lazy"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-semibold text-lg md:text-xl">Gaming Zone</p>
                        </div>

                        {/* Swimming Pool - Right */}
                        <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                            <Image
                                src="/life at viramah images/swiming pool.jpg"
                                alt="Swimming Pool - Aquatic facilities at Viramah"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                quality={90}
                                loading="lazy"
                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
                            <p className="absolute bottom-4 left-4 text-white font-semibold text-lg md:text-xl">Swimming Pool</p>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
