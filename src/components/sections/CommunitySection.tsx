import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export function CommunitySection() {
    return (
        <section className="py-20 bg-cream-warm text-charcoal">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="w-full">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-charcoal/5">
                            <Image
                                src="/communities.jpg"
                                alt="Viramah Community - People gathering and connecting"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                quality={95}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-8">
                        <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
                            Not Just Tenants
                        </span>
                        <h2 className="text-5xl lg:text-7xl">A Community of Builders</h2>
                        <p className="text-xl max-w-lg opacity-80">
                            Viramah is home to artists, founders, and scholars. Our spaces are curated to foster connection without forcing it.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link href="/community">
                                <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-terracotta-raw">
                                    Meet the Members
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
