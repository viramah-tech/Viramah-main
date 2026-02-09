import { Container } from "./Container";

export function Footer() {
    return (
        <footer className="bg-sand-dark py-20 text-charcoal">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="font-display text-2xl">VIRAMAH</div>
                    <div className="font-mono text-sm opacity-60">
                        © {new Date().getFullYear()} Viramah. All rights reserved.
                    </div>
                </div>
            </Container>
        </footer>
    );
}
