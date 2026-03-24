"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import type { UploadedFile } from "@/context/OnboardingContext";

// ── Design Tokens ────────────────────────────────────────────
const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

// ── FieldLabel ───────────────────────────────────────────────

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.25em",
                color: "rgba(31,58,45,0.55)",
                fontWeight: 700,
            }}
        >
            {children}
        </label>
    );
}

// ── FieldHint ────────────────────────────────────────────────

export function FieldHint({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.6rem",
                color: "rgba(31,58,45,0.35)",
                letterSpacing: "0.03em",
            }}
        >
            {children}
        </span>
    );
}

// ── FieldError ───────────────────────────────────────────────

export function FieldError({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.6rem",
                color: "#c0392b",
                letterSpacing: "0.03em",
            }}
        >
            {children}
        </span>
    );
}

// ── FieldInput ───────────────────────────────────────────────

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    focused?: boolean;
    hasError?: boolean;
}

export function FieldInput({ focused, hasError, style, ...props }: FieldInputProps) {
    return (
        <input
            {...props}
            style={{
                width: "100%",
                background: focused ? "#fff" : "rgba(246,244,239,0.7)",
                border: `1.5px solid ${hasError ? "#c0392b" : focused ? GREEN : "rgba(31,58,45,0.15)"}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "0.9rem",
                color: "#1a2e1f",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: focused ? `0 0 0 4px ${hasError ? "rgba(192,57,43,0.07)" : "rgba(31,58,45,0.07)"}` : "none",
                boxSizing: "border-box",
                ...style,
            }}
        />
    );
}

// ── PhotoUpload ──────────────────────────────────────────────

export function PhotoUpload({
    label,
    file,
    onUpload,
    onRemove,
}: {
    label: string;
    file: UploadedFile | null;
    onUpload: (file: UploadedFile) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [hovered, setHovered] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpload({ name: selectedFile.name, preview: reader.result as string });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <div style={{ flex: 1 }}>
            <span
                style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.25em",
                    color: "rgba(31,58,45,0.5)",
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 700,
                }}
            >
                {label}
            </span>
            {file ? (
                <div
                    style={{
                        position: "relative",
                        aspectRatio: "3/2",
                        borderRadius: 12,
                        overflow: "hidden",
                        border: `2px solid ${GREEN}`,
                    }}
                >
                    <img src={file.preview} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                        onClick={onRemove}
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.95)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        }}
                    >
                        <X size={14} color={GREEN} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        width: "100%",
                        aspectRatio: "3/2",
                        borderRadius: 12,
                        border: `2px dashed ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
                        background: hovered ? "rgba(31,58,45,0.04)" : "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "all 0.25s ease",
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#fff",
                            boxShadow: "0 2px 8px rgba(31,58,45,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Upload size={18} color={hovered ? GREEN : "rgba(31,58,45,0.35)"} />
                    </div>
                    <span
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.65rem",
                            color: hovered ? GREEN : "rgba(31,58,45,0.4)",
                            letterSpacing: "0.05em",
                        }}
                    >
                        Click to upload
                    </span>
                </button>
            )}
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
        </div>
    );
}

// ── NavButton (Primary CTA) ─────────────────────────────────

export function NavButton({
    children,
    disabled,
    onClick,
}: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                background: disabled
                    ? "rgba(31,58,45,0.15)"
                    : hovered
                        ? "linear-gradient(135deg, #2a4d3a, #1F3A2D)"
                        : "linear-gradient(135deg, #1F3A2D, #162b1e)",
                color: disabled ? "rgba(31,58,45,0.35)" : GOLD,
                border: "none",
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                cursor: disabled ? "not-allowed" : "pointer",
                transform: hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered && !disabled ? "0 10px 28px rgba(31,58,45,0.3)" : "0 4px 14px rgba(31,58,45,0.18)",
                transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
            }}
        >
            {children}
        </button>
    );
}

// ── SecondaryButton (Back / Outline) ─────────────────────────

export function SecondaryButton({
    children,
    onClick,
}: {
    children: React.ReactNode;
    onClick?: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 24px",
                background: hovered ? "rgba(31,58,45,0.06)" : "transparent",
                color: GREEN,
                border: `1.5px solid ${hovered ? GREEN : "rgba(31,58,45,0.2)"}`,
                borderRadius: 10,
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                cursor: "pointer",
                transition: "all 0.25s ease",
            }}
        >
            {children}
        </button>
    );
}

// ── Motion Variants ──────────────────────────────────────────

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

export const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

// ── Section Header Badge ─────────────────────────────────────

export function StepBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: "rgba(31,58,45,0.08)",
                border: "1px solid rgba(31,58,45,0.12)",
                marginBottom: 16,
            }}
        >
            <Icon size={14} color={GREEN} />
            <span
                style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.3em",
                    color: GREEN,
                }}
            >
                {label}
            </span>
        </div>
    );
}

// ── Section Title ────────────────────────────────────────────

export function StepTitle({ children }: { children: React.ReactNode }) {
    return (
        <h1
            style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(2rem, 4vw, 2.8rem)",
                color: GREEN,
                lineHeight: 1.1,
                fontWeight: 400,
                marginBottom: 10,
            }}
        >
            {children}
        </h1>
    );
}

// ── Section Subtitle ─────────────────────────────────────────

export function StepSubtitle({ children }: { children: React.ReactNode }) {
    return (
        <p
            style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "0.9rem",
                color: "rgba(31,58,45,0.55)",
                maxWidth: 420,
                margin: "0 auto",
                lineHeight: 1.6,
            }}
        >
            {children}
        </p>
    );
}

// ── Form Card Wrapper ────────────────────────────────────────

export function FormCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid rgba(31,58,45,0.1)",
                padding: 32,
                boxShadow: "0 4px 24px rgba(31,58,45,0.07)",
                display: "flex",
                flexDirection: "column",
                gap: 24,
            }}
        >
            {children}
        </div>
    );
}

// ── Selection Button (for ID types, relationships, etc.) ─────

export function SelectionButton({
    label,
    selected,
    onClick,
    accentColor = GREEN,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
    accentColor?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: "12px 8px",
                borderRadius: 10,
                border: `2px solid ${selected ? accentColor : "rgba(31,58,45,0.15)"}`,
                background: selected
                    ? accentColor === GOLD
                        ? "rgba(216,181,106,0.08)"
                        : "rgba(31,58,45,0.06)"
                    : "#fff",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: selected
                    ? accentColor === GOLD
                        ? "#9a7a3a"
                        : GREEN
                    : "rgba(31,58,45,0.45)",
                cursor: "pointer",
                fontWeight: selected ? 700 : 400,
                transition: "all 0.2s ease",
            }}
        >
            {label}
        </button>
    );
}
