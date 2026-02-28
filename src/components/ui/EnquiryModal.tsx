"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
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

// ── Location Data ──────────────────────────────────────────
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
    "India": {
        "Uttar Pradesh": ["Vrindavan", "Mathura", "Agra", "Noida", "Lucknow", "Kanpur", "Ghaziabad", "Varanasi", "Prayagraj", "Meerut", "Aligarh", "Bareilly", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Muzaffarnagar", "Firozabad", "Loni", "Maunath Bhanjan", "Hapur", "Amroha", "Hardoi", "Sambhal", "Modinagar", "Unnao", "Jaunpur", "Bulandshahr", "Khurs", "Gonda", "Mainpuri", "Mirzapur", "Etah", "Sultanpur", "Lakhimpur", "Badaun", "Azamgarh", "Sitapur", "Bahraich", "Fatehpur", "Rampur"],
        "Delhi": ["New Delhi", "NCR", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Rohini", "Dwarka", "Janakpuri", "Saket", "Vasant Kunj", "Connaught Place", "Okhla", "Lajpat Nagar", "Karol Bagh", "Pitampura", "Chanakyapuri", "Hauz Khas", "Delhi Cantt", "Civil Lines"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur", "Akola", "Jalgaon", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Malegaon", "Nanded", "Ichalkaranji", "Jalna", "Bhusawal", "Ratnagiri", "Sangli", "Satara", "Wardha", "Yavatmal", "Beed", "Gondia"],
        "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Davanagere", "Bellary", "Gulbarga", "Shimoga", "Tumkur", "Bijapur", "Raichur", "Bidar", "Hospet", "Hassan", "Udupi", "Karwar", "Chikmagalur", "Mandya", "Bagalkot", "Gadag", "Gokak", "Kolar"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Nadiad", "Gandhidham", "Anand", "Morbi", "Mahesana", "Surendranagar", "Bharuch", "Navsari", "Vapi", "Valsad", "Porbandar", "Godhra", "Patan", "Kalol", "Botad", "Jetpur"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukkudi", "Nagercoil", "Thanjavur", "Kancheepuram", "Dindigul", "Hosur", "Sivakasi", "Cuddalore", "Kumbakonam", "Karaikudi", "Neyveli", "Nagapattinam", "Pudukkottai"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Maheshtala", "Rajpur Sonarpur", "Gopalpur", "Bhatpara", "Panihati", "Kamarhati", "Bardhaman", "Kulti", "Bally", "Barasat", "Haldia", "Malda", "Kharagpur", "Habra", "Berhampore", "Shantipur", "Dankuni"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Churu", "Jhunjhunu", "Barmer", "Jaisalmer", "Mount Abu", "Chittorgarh", "Tonk", "Kishangarh", "Beawar", "Hanumangarh", "Dholpur"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda", "Jagtial", "Mancherial", "Kothagudem"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh", "Mandsaur", "Khargone"],
        "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Sonipat", "Rohtak", "Panchkula", "Yamunanagar", "Sirsa", "Rewari", "Bhiwani", "Bahadurgarh", "Jind", "Thanesar", "Palwal", "Kaithal", "Hansi", "Fatehabad"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali", "Bathinda", "Hoshiarpur", "Pathankot", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Sangrur"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chhapra", "Danapur", "Saharsa", "Hajipur", "Sasaram", "Dehri", "Siwan", "Bettiah", "Motihari"],
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Anantapur", "Kadapa", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Chittoor", "Hindupur", "Proddatur"],
        "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Malappuram", "Kasaragod", "Manjeri", "Thalassery", "Ponnani", "Vatakara", "Kanhangad", "Payyanur"],
        "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dhubri", "Diphu", "North Lakhimpur", "Karimganj"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Bawanipatna", "Keonjhar", "Paradip"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Dhamtari", "Raigarh", "Mahasamund", "Durg"],
        "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Sahibganj", "Chaibasa"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Kashipur", "Rudrapur", "Rishikesh", "Pithoragarh", "Kichha", "Kotdwar"],
        "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Kullu", "Baddi", "Una", "Chamba", "Hamirpur"],
        "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Quepem", "Canacona"],
        "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Sopore", "Kathua", "Poonch", "Rajouri"],
    },
    "United States": {
        "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Oakland", "Long Beach", "Irvine", "Santa Ana", "Anaheim", "Riverside", "Stockton"],
        "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany", "New Rochelle", "Mount Vernon", "Schenectady", "Utica"],
        "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Laredo", "Lubbock", "Garland", "Irving"],
        "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "St. Petersburg", "Hialeah", "Port St. Lucie", "Fort Lauderdale", "Cape Coral", "Pembroke Pines"],
    },
    "United Kingdom": {
        "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", "Bristol", "Leicester", "Coventry", "Nottingham", "Newcastle", "Southampton", "Reading"],
        "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling"],
        "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Bangor", "St Davids"],
    },
    "United Arab Emirates": {
        "Dubai": ["Dubai City", "Jebel Ali", "Hatta", "Al Awir"],
        "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Al Ruwais", "Zayed City"],
        "Sharjah": ["Sharjah City", "Khor Fakkan", "Kalba", "Dibba Al-Hisn"],
        "Ajman": ["Ajman City"],
        "Ras Al Khaimah": ["Ras Al Khaimah City"],
        "Fujairah": ["Fujairah City"],
    },
    "Other": {
        "International": ["Other City"],
    }
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

// ── FancySelect ──────────────────────────────────────────────
interface FancySelectProps {
    id: string;
    label: string;
    value: string;
    options: string[];
    placeholder: string;
    onChange: (val: string) => void;
    onFocus: () => void;
    onBlur: () => void;
    focused: boolean;
    disabled?: boolean;
}

function FancySelect({ id, label, value, options, placeholder, onChange, onFocus, onBlur, focused, disabled }: FancySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        const updateCoords = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        if (isOpen) {
            updateCoords();
            window.addEventListener('resize', updateCoords);
            window.addEventListener('scroll', updateCoords, true);
        }
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords, true);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Check if the click was on the portal'd menu
                const menu = document.getElementById(`${id}-menu`);
                if (menu && menu.contains(event.target as Node)) return;

                setIsOpen(false);
                onBlur();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onBlur, id]);

    const dropdownMenu = (
        <AnimatePresence>
            {isOpen && (
                <motion.ul
                    id={`${id}-menu`}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        zIndex: 9999,
                        background: "#1F3A2D",
                        maxHeight: "280px",
                        overflowY: "auto",
                        borderRadius: "4px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        border: "1px solid rgba(216,181,106,0.2)",
                        marginTop: "0",
                        padding: "6px"
                    }}
                >
                    {options.map((opt) => (
                        <motion.li
                            key={opt}
                            whileHover={{ background: "rgba(216,181,106,0.15)", color: "#D8B56A" }}
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                                onBlur();
                            }}
                            style={{
                                padding: "12px 14px",
                                fontSize: "0.85rem",
                                fontFamily: "var(--font-mono, monospace)",
                                color: "#F6F4EF",
                                cursor: "pointer",
                                borderRadius: "2px",
                                transition: "all 0.2s ease",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}
                        >
                            {opt}
                            {value === opt && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </motion.li>
                    ))}
                </motion.ul>
            )}
        </AnimatePresence>
    );

    return (
        <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <div
                id={id}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onFocus={onFocus}
                tabIndex={disabled ? -1 : 0}
                style={{
                    background: "transparent",
                    borderBottom: focused || isOpen
                        ? "1.5px solid #b5934a"
                        : "1px solid rgba(45,43,40,0.2)",
                    padding: "6px 0",
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "0.95rem",
                    color: value ? "#2d2b28" : "rgba(45,43,40,0.4)",
                    cursor: disabled ? "not-allowed" : "pointer",
                    outline: "none",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: disabled ? 0.5 : 1,
                    minHeight: "38px"
                }}
            >
                <span className="flex-1 truncate">{value || placeholder}</span>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: "#b5934a", marginLeft: 8 }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </motion.svg>
            </div>

            {typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
        </div>
    );
}

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
function SubmitButton({ loading, text = "Send Dispatch" }: { loading: boolean, text?: string }) {
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
                justifyContent: "center",
                width: "100%",
                gap: "10px"
            }}
        >
            {loading ? (
                <span className="animate-pulse">Processing...</span>
            ) : (
                text
            )}
        </button>
    );
}

// ── Main Component ───────────────────────────────────────────
export function EnquiryModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    // Helper — only returning users can manually close
    const closeModal = () => setIsOpen(false);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Reset state if opened fresh
            if (isSubmitted) {
                setIsSubmitted(false);
                setForm(INITIAL_FORM);
            }
            const t = setTimeout(() => firstInputRef.current?.focus(), 600);
            return () => clearTimeout(t);
        } else {
            document.body.style.overflow = "";
        }
    }, [isOpen, isSubmitted]);

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
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "country") { next.state = ""; next.city = ""; }
            if (field === "state") { next.city = ""; }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const result = await response.json();

            // ── Duplicate email detected (409) ────────────────────
            if (response.status === 409 && result.duplicate) {
                setIsSubmitting(false);
                setIsDuplicate(true);

                setIsSubmitted(true);

                setTimeout(() => {
                    setIsSubmitted(false);
                    setIsDuplicate(false);
                    setIsOpen(false);
                }, 5000);
                return;
            }

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Submission failed. Please try again.");
            }

            // Success!!
            setIsSubmitting(false);
            localStorage.setItem("viramah_enquiry_data_submitted", "true");
            setIsDuplicate(false);

            setIsSubmitted(true);

            // Hide and reset after a moment
            setTimeout(() => {
                setIsSubmitted(false);
                setForm(INITIAL_FORM);
                setIsOpen(false);
            }, 4000);

        } catch (error) {
            console.error("Submission failed:", error);
            setIsSubmitting(false);
            alert((error instanceof Error ? error.message : "Something went wrong.") + "\nOr call us directly: +91 8679001662");
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
                                            {!isSubmitted && (
                                                <h2
                                                    style={{
                                                        fontFamily: "var(--font-display, serif)",
                                                        fontSize: "clamp(1.5rem, 6vw, 2.4rem)",
                                                        color: "#2d2b28",
                                                        lineHeight: 1.1,
                                                        fontWeight: 400,
                                                    }}
                                                >
                                                    Welcome to Viramah
                                                </h2>
                                            )}
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
                                        {isSubmitted ? (
                                            /* Success / Duplicate State */
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
                                                        background: isDuplicate ? "#7C5C1A" : "#1F3A2D",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {isDuplicate ? (
                                                        /* Inbox / mail icon for duplicate */
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D8B56A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                                            <polyline points="22,6 12,13 2,6" />
                                                        </svg>
                                                    ) : (
                                                        /* Tick icon for success */
                                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D8B56A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
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
                                                        {isDuplicate ? "Already Enquired!" : "Enquiry Sent!"}
                                                    </h3>
                                                    <p
                                                        style={{
                                                            fontFamily: "var(--font-mono, monospace)",
                                                            fontSize: "0.72rem",
                                                            color: "#6b5526",
                                                            letterSpacing: "0.08em",
                                                            lineHeight: 1.8,
                                                        }}
                                                    >
                                                        {isDuplicate ? (
                                                            <>
                                                                We already have your enquiry on file.<br />
                                                                Check your inbox for the confirmation<br />
                                                                email we sent you earlier.
                                                            </>
                                                        ) : (
                                                            <>
                                                                Check your inbox for a confirmation<br />
                                                                email &amp; the Viramah brochure.<br />
                                                                Our team will call within 24 hrs.
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            /* Form Step */
                                            <motion.form
                                                key="details-step"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
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
                                                        placeholder="Name"
                                                        value={form.fullName}
                                                        onChange={(e) => handleChange("fullName", e.target.value)}
                                                        focused={focusedField === "fullName"}
                                                        onFocus={() => setFocusedField("fullName")}
                                                        onBlur={() => setFocusedField(null)}
                                                        required
                                                    />
                                                </motion.div>


                                                {/* Mobile + Email */}
                                                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <FieldLabel htmlFor="enquiry-mobile">Mobile No</FieldLabel>
                                                        <FieldInput
                                                            id="enquiry-mobile"
                                                            type="tel"
                                                            placeholder="Mobile No"
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
                                                            placeholder="Email"
                                                            value={form.email}
                                                            onChange={(e) => handleChange("email", e.target.value)}
                                                            focused={focusedField === "email"}
                                                            onFocus={() => setFocusedField("email")}
                                                            onBlur={() => setFocusedField(null)}
                                                            required
                                                        />
                                                    </div>
                                                </motion.div>

                                                {/* Country + State + City */}
                                                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                    <FancySelect
                                                        id="enquiry-country"
                                                        label="Country"
                                                        value={form.country}
                                                        options={Object.keys(LOCATION_DATA).sort((a, b) => a.localeCompare(b))}
                                                        placeholder="Select"
                                                        onChange={(val) => handleChange("country", val)}
                                                        onFocus={() => setFocusedField("country")}
                                                        onBlur={() => setFocusedField(null)}
                                                        focused={focusedField === "country"}
                                                    />

                                                    <FancySelect
                                                        id="enquiry-state"
                                                        label="State"
                                                        value={form.state}
                                                        options={form.country ? Object.keys(LOCATION_DATA[form.country] || {}).sort((a, b) => a.localeCompare(b)) : []}
                                                        placeholder="Select"
                                                        onChange={(val) => handleChange("state", val)}
                                                        onFocus={() => setFocusedField("state")}
                                                        onBlur={() => setFocusedField(null)}
                                                        focused={focusedField === "state"}
                                                        disabled={!form.country}
                                                    />

                                                    <FancySelect
                                                        id="enquiry-city"
                                                        label="City"
                                                        value={form.city}
                                                        options={form.country && form.state ? ([...(LOCATION_DATA[form.country]?.[form.state] || [])].sort((a, b) => a.localeCompare(b))) : []}
                                                        placeholder="Select"
                                                        onChange={(val) => handleChange("city", val)}
                                                        onFocus={() => setFocusedField("city")}
                                                        onBlur={() => setFocusedField(null)}
                                                        focused={focusedField === "city"}
                                                        disabled={!form.state}
                                                    />
                                                </motion.div>


                                                {/* Bottom divider */}
                                                <div
                                                    style={{
                                                        height: 1,
                                                        margin: "8px 0",
                                                        background: "linear-gradient(90deg, transparent, rgba(181,147,74,0.3), transparent)",
                                                    }}
                                                />

                                                {/* Submit Button */}
                                                <motion.div variants={itemVariants} className="mt-2">
                                                    <SubmitButton loading={isSubmitting} text="Enquire Now" />
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
