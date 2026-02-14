"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ScheduleVisitModal } from "@/components/ui/ScheduleVisitModal";

export function ClosingSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <section className="py-32 relative overflow-hidden bg-gradient-to-b from-terracotta-soft to-terracotta-raw text-white text-center">
                <Container>
                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none">
                            Ready to rest?
                        </h2>
                        <p className="text-xl opacity-90 max-w-lg">
                            Applications for the upcoming academic year are now open. Spaces are limited.
                        </p>
                        <div className="flex gap-4 mt-8">
                            <Link href="/signup">
                                <Button size="lg" className="bg-cream-warm text-terracotta-raw hover:bg-cream-warm/90 shadow-2xl">
                                    Apply Now
                                </Button>
                            </Link>
                            <Button 
                                size="lg" 
                                variant="secondary" 
                                className="border-white text-white hover:bg-white/10"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Schedule a Visit
                            </Button>
                        </div>
                    </div>
                </Container>

            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl opacity-30" />
            </div>
            </section>

            {/* Schedule Visit Modal */}
            <ScheduleVisitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
