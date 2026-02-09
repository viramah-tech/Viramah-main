import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

export function CommunitySection() {
    return (
        <section className="py-32 bg-terracotta-raw text-white">
            <Container>
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="w-full lg:w-1/2">
                        <div className="aspect-square bg-white/10 rounded-2xl p-8 relative overflow-hidden">
                            {/* Decorative Pattern or Image */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex flex-col gap-8">
                        <span className="font-mono text-xs tracking-[0.2em] uppercase opacity-60">
                            Not Just Tenants
                        </span>
                        <h2 className="text-5xl lg:text-7xl">A Community of Builders</h2>
                        <p className="text-xl max-w-lg opacity-80">
                            Viramah is home to artists, founders, and scholars. Our spaces are curated to foster connection without forcing it.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-terracotta-raw">
                                Meet the Members
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
