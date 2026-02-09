"use client";

import { motion } from "framer-motion";
import { Wrench, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AmenitiesPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                {/* Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-gold/20 rounded-full animate-pulse" />
                    <div className="relative w-full h-full bg-ivory border-2 border-gold/40 rounded-full flex items-center justify-center">
                        <Wrench className="w-10 h-10 text-gold" />
                    </div>
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-terracotta-raw" />
                </div>

                {/* Text */}
                <h1 className="font-display text-4xl text-charcoal mb-4">
                    Coming Soon
                </h1>
                <p className="font-body text-charcoal/60 mb-8">
                    We&apos;re working hard to bring you the amenities booking system.
                    Book gym slots, laundry, and other facilities — all from one place.
                </p>

                {/* Back Link */}
                <Link
                    href="/student/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta-raw text-white rounded-full font-body text-sm font-medium hover:bg-terracotta-raw/90 transition-colors"
                >
                    Back to Dashboard
                </Link>

                {/* Decorative */}
                <p className="font-mono text-xs text-charcoal/40 mt-8 uppercase tracking-widest">
                    Stay tuned for updates
                </p>
            </motion.div>
        </div>
    );
}
