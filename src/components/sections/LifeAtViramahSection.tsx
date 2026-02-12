import { Container } from "@/components/layout/Container";

export function LifeAtViramahSection() {
    return (
        <section className="py-32 bg-white">
            <Container>
                <div className="flex flex-col gap-16">
                    <div className="flex justify-between items-end">
                        <h2 className="text-5xl lg:text-7xl">Life at Viramah</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px] md:h-[400px]">
                        {/* Placeholder Images */}
                        <div className="bg-sand-dark/20 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors" />
                        </div>
                        <div className="bg-terracotta-soft/20 rounded-2xl md:col-span-2 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors" />
                        </div>
                        <div className="bg-sage-muted/20 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors" />
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
