"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Upload, X } from "lucide-react";

// ── Design tokens ──────────────────────────────────────────
const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";
const PARCHMENT = "#F6F4EF";

interface UploadedFile {
    name: string;
    preview: string;
}

function PhotoUpload({
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};

export default function Step1Page() {
    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        idType: "aadhaar",
        idNumber: "",
    });
    const [idFront, setIdFront] = useState<UploadedFile | null>(null);
    const [idBack, setIdBack] = useState<UploadedFile | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const ID_TYPES = [
        { value: "aadhaar", label: "Aadhaar" },
        { value: "passport", label: "Passport" },
        { value: "voter_id", label: "Voter ID" },
    ];

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
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
                    <Shield size={14} color={GREEN} />
                    <span
                        style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "0.6rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.3em",
                            color: GREEN,
                        }}
                    >
                        Identity Verification
                    </span>
                </div>
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
                    Let's verify your identity
                </h1>
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
                    We need to verify your identity to complete your room booking. Your data is encrypted and secure.
                </p>
            </motion.div>

            {/* Main Form Card */}
            <motion.div
                variants={itemVariants}
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
                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <FieldLabel htmlFor="s1-name">Full Name (as per ID)</FieldLabel>
                    <FieldInput
                        id="s1-name"
                        type="text"
                        placeholder="e.g. Arjun Mehta"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        focused={focusedField === "name"}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                    />
                    <FieldHint>Enter your name exactly as it appears on your ID</FieldHint>
                </div>

                {/* Date of Birth */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <FieldLabel htmlFor="s1-dob">Date of Birth</FieldLabel>
                    <FieldInput
                        id="s1-dob"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        focused={focusedField === "dob"}
                        onFocus={() => setFocusedField("dob")}
                        onBlur={() => setFocusedField(null)}
                    />
                </div>

                {/* ID Type */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <FieldLabel>ID Type</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        {ID_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, idType: type.value })}
                                style={{
                                    padding: "12px 8px",
                                    borderRadius: 10,
                                    border: `2px solid ${formData.idType === type.value ? GREEN : "rgba(31,58,45,0.15)"}`,
                                    background: formData.idType === type.value ? "rgba(31,58,45,0.06)" : "#fff",
                                    fontFamily: "var(--font-mono, monospace)",
                                    fontSize: "0.65rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.15em",
                                    color: formData.idType === type.value ? GREEN : "rgba(31,58,45,0.45)",
                                    cursor: "pointer",
                                    fontWeight: formData.idType === type.value ? 700 : 400,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ID Number */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <FieldLabel htmlFor="s1-idnum">
                        {formData.idType === "aadhaar" ? "Aadhaar" : formData.idType === "passport" ? "Passport" : "Voter ID"} Number
                    </FieldLabel>
                    <FieldInput
                        id="s1-idnum"
                        type="text"
                        placeholder={formData.idType === "aadhaar" ? "XXXX XXXX XXXX" : "Enter ID number"}
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        focused={focusedField === "idnum"}
                        onFocus={() => setFocusedField("idnum")}
                        onBlur={() => setFocusedField(null)}
                    />
                    <FieldHint>This will be verified against government records</FieldHint>
                </div>

                {/* ID Photo Upload */}
                <div
                    style={{
                        paddingTop: 20,
                        borderTop: "1px solid rgba(31,58,45,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontFamily: "var(--font-body, sans-serif)",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: GREEN,
                                marginBottom: 4,
                            }}
                        >
                            Upload ID Photos
                        </p>
                        <p
                            style={{
                                fontFamily: "var(--font-mono, monospace)",
                                fontSize: "0.65rem",
                                color: "rgba(31,58,45,0.45)",
                                letterSpacing: "0.03em",
                            }}
                        >
                            Please upload clear photos of your ID. Make sure all details are visible.
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <PhotoUpload label="Front Side" file={idFront} onUpload={setIdFront} onRemove={() => setIdFront(null)} />
                        <PhotoUpload label="Back Side" file={idBack} onUpload={setIdBack} onRemove={() => setIdBack(null)} />
                    </div>
                </div>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href="/user-onboarding/step-2" style={{ textDecoration: "none" }}>
                    <NavButton>
                        Continue to Emergency Info
                        <ArrowRight size={16} />
                    </NavButton>
                </Link>
            </motion.div>
        </motion.div>
    );
}

// ── Shared sub-components ────────────────────────────────────

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
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

function FieldHint({ children }: { children: React.ReactNode }) {
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

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    focused?: boolean;
}

function FieldInput({ focused, style, ...props }: FieldInputProps) {
    return (
        <input
            {...props}
            style={{
                width: "100%",
                background: focused ? "#fff" : "rgba(246,244,239,0.7)",
                border: `1.5px solid ${focused ? GREEN : "rgba(31,58,45,0.15)"}`,
                borderRadius: 10,
                padding: "12px 14px",
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "0.9rem",
                color: "#1a2e1f",
                outline: "none",
                transition: "all 0.25s ease",
                boxShadow: focused ? "0 0 0 4px rgba(31,58,45,0.07)" : "none",
                boxSizing: "border-box",
                ...style,
            }}
        />
    );
}

function NavButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            disabled={disabled}
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
