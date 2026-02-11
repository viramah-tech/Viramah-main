"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export function FilterBar() {
    return (
        <div className="flex top-[70px] z-40 w-full backdrop-blur-md border-b border-sand-dark py-4 transition-all">
            <div className="mx-auto w-full max-w-[var(--container-max)] px-5 md:px-10 lg:px-20 flex flex-col md:flex-row gap-4 justify-between items-center">

                {/* Filters Group */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                    <Button variant="secondary" className="bg-white whitespace-nowrap gap-2">
                        Location <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="bg-white whitespace-nowrap gap-2">
                        Date <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="bg-white whitespace-nowrap gap-2">
                        Room Type <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" className="bg-white whitespace-nowrap gap-2">
                        Price Range <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                        <SlidersHorizontal className="w-4 h-4" /> More Filters
                    </Button>
                    <div className="h-6 w-px bg-charcoal/10 mx-2 hidden md:block" />
                    <span className="font-mono text-xs opacity-50 whitespace-nowrap">
                        12 Spaces Available
                    </span>
                </div>
            </div>
        </div>
    );
}
