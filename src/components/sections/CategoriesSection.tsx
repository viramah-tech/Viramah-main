import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
    { label: "Community", count: "4 Spaces" },
    { label: "Quiet Zones", count: "3 Spaces" },
    { label: "Fitness", count: "2 Spaces" },
    { label: "Dining", count: "1 Space" },
    { label: "Events", count: "Weekly" },
];

export function CategoriesSection() {
    return (
        <section className="py-24 bg-sand-light border-y border-sand-dark/50">
            <Container>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                    {CATEGORIES.map((cat, idx) => (
                        <Link
                            key={idx}
                            href="#"
                            className="group flex flex-col gap-4 p-6 border border-charcoal/10 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-xs opacity-50">0{idx + 1}</span>
                                <ArrowRight className="w-4 h-4 -rotate-45 opacity-0 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-300" />
                            </div>
                            <div className="mt-auto">
                                <h3 className="font-display text-2xl">{cat.label}</h3>
                                <span className="text-sm opacity-60">{cat.count}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </section>
    );
}
