"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute("data-reveal", "active");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            }
        );

        const elements = document.querySelectorAll("[data-reveal]");
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []); // Run once on mount

    return ref;
}
