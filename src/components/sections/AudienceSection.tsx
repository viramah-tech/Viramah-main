import { Container } from "@/components/layout/Container";

export function AudienceSection() {
    return (
        <section className="py-24 bg-white border-t border-sand-dark/50">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    <div>
                        <h3 className="font-display text-2xl mb-4">The Creator</h3>
                        <p className="opacity-70">
                            For those who need a studio, not just a bedroom. Ample desk space, high-speed internet, and inspiring surroundings.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-display text-2xl mb-4">The Scholar</h3>
                        <p className="opacity-70">
                            Quiet zones, library access, and an environment that respects the need for deep work and focus.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-display text-2xl mb-4">The Connector</h3>
                        <p className="opacity-70">
                            Common areas designed for collaboration. Events that spark ideas. A network of ambitious peers.
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
}
