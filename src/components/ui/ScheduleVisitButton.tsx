"use client";

import { useScheduleVisit } from "@/context/ScheduleVisitContext";

interface ScheduleVisitButtonProps {
    className?: string;
    variant?: "gold" | "dark" | "outline";
    label?: string;
    rounded?: boolean;
}

export function ScheduleVisitButton({
    className = "",
    variant = "gold",
    label = "Schedule a Visit",
    rounded = false,
}: ScheduleVisitButtonProps) {
    const { openScheduleVisit } = useScheduleVisit();

    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: rounded ? "10px 24px" : "14px 30px",
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        border: "none",
        borderRadius: rounded ? "9999px" : "0px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        textDecoration: "none",
    };

    const styles: Record<string, React.CSSProperties> = {
        gold: { ...base, background: "#D8B56A", color: "#0f2018" },
        dark: { ...base, background: "#1a3328", color: "#F6F4EF" },
        outline: {
            ...base,
            background: "transparent",
            color: "#F6F4EF",
            border: "1px solid rgba(246,244,239,0.35)",
        },
    };

    return (
        <button
            onClick={openScheduleVisit}
            className={className}
            style={styles[variant]}
            onMouseEnter={(e) => {
                if (variant === "gold")
                    (e.currentTarget as HTMLButtonElement).style.background = "#e8c97a";
                if (variant === "dark")
                    (e.currentTarget as HTMLButtonElement).style.background = "#0f2018";
                if (variant === "outline") {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#D8B56A";
                    (e.currentTarget as HTMLButtonElement).style.color = "#D8B56A";
                }
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                if (variant === "gold")
                    (e.currentTarget as HTMLButtonElement).style.background = "#D8B56A";
                if (variant === "dark")
                    (e.currentTarget as HTMLButtonElement).style.background = "#1a3328";
                if (variant === "outline") {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                        "rgba(246,244,239,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#F6F4EF";
                }
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
        >
            {/* Calendar icon */}
            <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {label}
        </button>
    );
}
