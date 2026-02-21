"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────
interface FormState {
    fullName: string;
    mobile: string;
    email: string;
    city: string;
    state: string;
    country: string;
}

const INITIAL_FORM: FormState = {
    fullName: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    country: "",
};

// ── Animation Variants ───────────────────────────────────────
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.35, delay: 0.1 } },
};

const panelVariants = {
    hidden: { scale: 0.88, opacity: 0, y: 24 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
    },
    exit: {
        scale: 0.92,
        opacity: 0,
        y: 16,
        transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
    },
};

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.07, delayChildren: 0.25 },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
    },
};

// ── FieldLabel ───────────────────────────────────────────────
function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                color: "#6b5526",
                fontWeight: 700,
            }}
        >
            {children}
        </label>
    );
}

// ── FieldInput ───────────────────────────────────────────────
interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    focused?: boolean;
}

const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
    ({ focused, style, ...props }, ref) => (
        <input
            ref={ref}
            {...props}
            style={{
                background: "transparent",
                border: "none",
                borderBottom: focused
                    ? "1.5px solid #b5934a"
                    : "1px solid rgba(45,43,40,0.2)",
                padding: "6px 0",
                paddingLeft: focused ? 8 : 0,
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "1rem",
                color: "#2d2b28",
                outline: "none",
                transition: "all 0.3s ease",
                width: "100%",
                ...style,
            }}
        />
    )
);
FieldInput.displayName = "FieldInput";

// ── SubmitButton ─────────────────────────────────────────────
function SubmitButton({ loading }: { loading: boolean }) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    return (
        <button
            id="enquiry-submit-btn"
            type="submit"
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                background: loading ? "#2d2b28" : hovered ? "#2d2b28" : "#1F3A2D",
                color: "#D8B56A",
                border: "none",
                padding: "12px 28px",
                fontFamily: "var(--font-mono, monospace)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.7rem",
                cursor: loading ? "wait" : "pointer",
                transform: loading ? "none" : pressed
                    ? "translate(2px, 2px)"
                    : hovered
                        ? "translate(-3px, -3px)"
                        : "translate(0, 0)",
                boxShadow: loading ? "none" : pressed
                    ? "none"
                    : hovered
                        ? "6px 6px 0px #b5934a"
                        : "4px 4px 0px #6b5526",
                transition: "all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)",
                opacity: loading ? 0.8 : 1,
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}
        >
            {loading ? (
                <>
                    <span className="animate-pulse">Dispatching...</span>
                </>
            ) : (
                "Send Dispatch"
            )}
        </button>
    );
}

// ── Main Component ───────────────────────────────────────────
export function EnquiryModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Helper — only returning users can manually close
    const closeModal = () => {
        setIsOpen(false);
    };

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            const t = setTimeout(() => firstInputRef.current?.focus(), 600);
            return () => clearTimeout(t);
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpen]);

    // Global open trigger + Escape key
    useEffect(() => {
        const onOpenEvent = () => setIsOpen(true);
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("viramah:open-enquiry", onOpenEvent);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("viramah:open-enquiry", onOpenEvent);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const handleChange = (field: keyof FormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycby42eCgxXVf4aeSPiR7caKIxwQhoXlL7x8e5VdWEbphhpfYzo8ObIrcmUqgLl0Sl4Zo/exec";

        try {
            // Perceived performance optimization: 
            // We start the fetch but don't wait more than 1s for the UI to transition.
            // Google Apps Script can be slow, but no-cors dispatches immediately.
            const fetchPromise = fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            // If it takes longer than 1.2s, we move to success state anyway 
            // as the request is likely already in flight.
            await Promise.race([
                fetchPromise,
                new Promise((resolve) => setTimeout(resolve, 1200))
            ]);

            setIsSubmitting(false);
            localStorage.setItem("viramah_enquiry_data_submitted", "true");
            setSubmitted(true);

            setTimeout(() => {
                setSubmitted(false);
                setForm(INITIAL_FORM);
                setIsOpen(false);
            }, 2500);
        } catch (error) {
            console.error("Submission failed:", error);
            setIsSubmitting(false);
            alert("Something went wrong. Please try again.");
        }
    };

    const rivets = ["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"];

    return (
        <>
            {/* ── Vertical Side Trigger Button ─────────────── */}
            <motion.button
                id="enquiry-trigger-btn"
                aria-label="Open enquiry form"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(true)}
                className="fixed right-0 top-1/2 z-[998]"
                style={{ transform: "translateY(-50%)" }}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
            >
                <div
                    style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                        background: "linear-gradient(180deg, #1F3A2D 0%, #2a4d3a 100%)",
                        color: "#D8B56A",
                        padding: "22px 14px",
                        borderRadius: "10px 0 0 10px",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        boxShadow: "-4px 0 24px rgba(0,0,0,0.3), inset 1px 0 0 rgba(255,255,255,0.08)",
                        border: "1px solid rgba(216,181,106,0.25)",
                        borderRight: "none",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    {/* Glowing dot */}
                    <span
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#D8B56A",
                            display: "inline-block",
                            boxShadow: "0 0 8px #D8B56A",
                            flexShrink: 0,
                        }}
                    />
                    Enquire Now
                </div>
            </motion.button>

            {/* ── Modal Overlay + Panel ─────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop — clickable only for returning users */}
                        <motion.div
                            key="enquiry-backdrop"
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 z-[999]"
                            style={{
                                background: "rgba(10, 20, 15, 0.85)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                cursor: "pointer",
                            }}
                            onClick={closeModal}
                            aria-hidden="true"
                        />

                        {/* Centered Modal Panel */}
                        <div
                            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
                            style={{ pointerEvents: "none" }}
                        >
                            <motion.aside
                                key="enquiry-panel"
                                role="dialog"
                                aria-modal="true"
                                aria-label="Enquiry Form"
                                variants={panelVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                style={{
                                    width: "min(480px, 100%)",
                                    maxHeight: "90vh",
                                    background: "#e8e2d6",
                                    boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(181,147,74,0.15)",
                                    overflowY: "auto",
                                    borderRadius: 4,
                                    pointerEvents: "all",
                                    position: "relative",
                                }}
                            >
                                {/* Grain texture */}
                                <div
                                    aria-hidden="true"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        pointerEvents: "none",
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
                                        opacity: 0.12,
                                        zIndex: 0,
                                    }}
                                />

                                {/* Brass corner rivets */}
                                {rivets.map((pos, i) => (
                                    <div
                                        key={i}
                                        aria-hidden="true"
                                        className={`absolute ${pos} w-3 h-3 rounded-full z-10`}
                                        style={{
                                            background: "radial-gradient(circle at 30% 30%, #e2c07d, #b5934a, #6b5526)",
                                            boxShadow: "1px 2px 4px rgba(0,0,0,0.4), inset -1px -1px 2px rgba(0,0,0,0.3)",
                                        }}
                                    />
                                ))}

                                {/* Panel Content */}
                                <div className="relative z-10 flex flex-col p-6 md:p-8">

                                    {/* Header row */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>

                                            <h2
                                                style={{
                                                    fontFamily: "var(--font-display, serif)",
                                                    fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
                                                    color: "#2d2b28",
                                                    lineHeight: 1.1,
                                                    fontWeight: 400,
                                                }}
                                            >
                                                Welcome to Viramah
                                            </h2>

                                        </div>

                                        {/* Close button */}
                                        <motion.button
                                            onClick={closeModal}
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            aria-label="Close enquiry form"
                                            style={{
                                                background: "transparent",
                                                border: "1px solid rgba(107,85,38,0.3)",
                                                borderRadius: "50%",
                                                width: 36,
                                                height: 36,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                color: "#6b5526",
                                                flexShrink: 0,
                                                marginLeft: 16,
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </motion.button>

                                    </div>

                                    {/* ── Success / Form ─────────────────────── */}
                                    <AnimatePresence mode="wait">
                                        {submitted ? (
                                            /* Success State */
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex-1 flex flex-col items-center justify-center text-center gap-6"
                                            >
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                    style={{
                                                        width: 72,
                                                        height: 72,
                                                        borderRadius: "50%",
                                                        background: "#1F3A2D",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D8B56A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                </motion.div>
                                                <div>
                                                    <h3
                                                        style={{
                                                            fontFamily: "var(--font-display, serif)",
                                                            fontSize: "1.8rem",
                                                            color: "#2d2b28",
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        Dispatch Sent!
                                                    </h3>
                                                    <p
                                                        style={{
                                                            fontFamily: "var(--font-mono, monospace)",
                                                            fontSize: "0.75rem",
                                                            color: "#6b5526",
                                                            letterSpacing: "0.1em",
                                                        }}
                                                    >
                                                        Our team will reach out to you shortly.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Form */
                                            <motion.form
                                                key="form"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                onSubmit={handleSubmit}
                                                className="flex flex-col gap-4"
                                            >
                                                {/* Full Name */}
                                                <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                                                    <FieldLabel htmlFor="enquiry-fullname">Full Name</FieldLabel>
                                                    <FieldInput
                                                        ref={firstInputRef}
                                                        id="enquiry-fullname"
                                                        type="text"
                                                        placeholder="e.g. Arjun Mehta"
                                                        value={form.fullName}
                                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                                        focused={focusedField === "fullName"}
                                                        onFocus={() => setFocusedField("fullName")}
                                                        onBlur={() => setFocusedField(null)}
                                                        required
                                                    />
                                                </motion.div>

                                                {/* Mobile + Email */}
                                                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-mobile">Mobile No.</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-mobile"
                                                            type="tel"
                                                            placeholder="+91 ··· ··· ····"
                                                            value={form.mobile}
                                                            onChange={(e) => handleChange("mobile", e.target.value)}
                                                            focused={focusedField === "mobile"}
                                                            onFocus={() => setFocusedField("mobile")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-email">Email Address</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-email"
                                                            type="email"
                                                            placeholder="hello@domain.com"
                                                            value={form.email}
                                                            onChange={(e) => handleChange("email", e.target.value)}
                                                            focused={focusedField === "email"}
                                                            onFocus={() => setFocusedField("email")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                </motion.div>

                                                {/* City + State + Country */}
                                                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-city">City</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-city"
                                                            type="text"
                                                            placeholder="Mumbai"
                                                            value={form.city}
                                                            onChange={(e) => handleChange("city", e.target.value)}
                                                            focused={focusedField === "city"}
                                                            onFocus={() => setFocusedField("city")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-state">State</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-state"
                                                            type="text"
                                                            placeholder="Maharashtra"
                                                            value={form.state}
                                                            onChange={(e) => handleChange("state", e.target.value)}
                                                            focused={focusedField === "state"}
                                                            onFocus={() => setFocusedField("state")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-country">Country</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-country"
                                                            type="text"
                                                            placeholder="India"
                                                            value={form.country}
                                                            onChange={(e) => handleChange("country", e.target.value)}
                                                            focused={focusedField === "country"}
                                                            onFocus={() => setFocusedField("country")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                </motion.div>


                                                {/* Bottom divider */}
                                                <div
                                                    style={{
                                                        height: 1,
                                                        margin: "8px 0",
                                                        background: "linear-gradient(90deg, transparent, rgba(181,147,74,0.3), transparent)",
                                                    }}
                                                />

                                                {/* Submit row */}
                                                <motion.div variants={itemVariants} className="flex justify-between items-center">


                                                    <SubmitButton loading={isSubmitting} />
                                                </motion.div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.aside>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
