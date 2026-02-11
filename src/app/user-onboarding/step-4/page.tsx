"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, Settings2, Moon, Sun, Volume2, VolumeX, Loader2 } from "lucide-react";
import { savePreferences } from "../actions";

interface PreferenceOption {
    value: string;
    label: string;
    icon: React.ElementType;
    description: string;
}

const DIET_OPTIONS: PreferenceOption[] = [
    { value: "veg", label: "Vegetarian", icon: Settings2, description: "Plant-based meals only" },
    { value: "non-veg", label: "Non-Vegetarian", icon: Settings2, description: "All meal types" },
    { value: "vegan", label: "Vegan", icon: Settings2, description: "No animal products" },
];

const SLEEP_OPTIONS: PreferenceOption[] = [
    { value: "early", label: "Early Bird", icon: Sun, description: "Sleep before 10 PM" },
    { value: "late", label: "Night Owl", icon: Moon, description: "Sleep after midnight" },
    { value: "flexible", label: "Flexible", icon: Settings2, description: "No fixed schedule" },
];

const NOISE_OPTIONS: PreferenceOption[] = [
    { value: "quiet", label: "Quiet", icon: VolumeX, description: "Prefer silence" },
    { value: "moderate", label: "Moderate", icon: Volume2, description: "Some background noise is fine" },
    { value: "social", label: "Social", icon: Volume2, description: "Love a lively environment" },
];

export default function Step3Page() {
    const router = useRouter();
    const [preferences, setPreferences] = useState({
        dietary: "",
        sleep: "",
        noise: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const PreferenceGroup = ({
        title,
        options,
        value,
        onChange
    }: {
        title: string;
        options: PreferenceOption[];
        value: string;
        onChange: (v: string) => void;
    }) => (
        <div className="space-y-3">
            <label className="font-body text-sm font-medium text-charcoal/70 block">
                {title}
            </label>
            <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${value === opt.value
                            ? "border-terracotta-raw bg-terracotta-raw/10"
                            : "border-sand-dark hover:border-charcoal/30"
                            }`}
                    >
                        <opt.icon className={`w-5 h-5 mb-2 ${value === opt.value ? "text-terracotta-raw" : "text-charcoal/40"
                            }`} />
                        <span className={`font-body text-sm font-medium block ${value === opt.value ? "text-terracotta-raw" : "text-charcoal"
                            }`}>
                            {opt.label}
                        </span>
                        <span className="font-mono text-[10px] text-charcoal/50 block mt-1">
                            {opt.description}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta-raw/10 mb-4">
                    <Settings2 className="w-4 h-4 text-terracotta-raw" />
                    <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">
                        Lifestyle Preferences
                    </span>
                </div>
                <h1 className="font-display text-4xl text-charcoal mb-2">
                    Tell us about yourself
                </h1>
                <p className="font-body text-charcoal/60 max-w-md mx-auto">
                    Help us match you with compatible roommates and provide personalized services.
                </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-sand-dark p-8 shadow-lg shadow-charcoal/5 space-y-8">
                <PreferenceGroup
                    title="Dietary Preference"
                    options={DIET_OPTIONS}
                    value={preferences.dietary}
                    onChange={(v) => setPreferences({ ...preferences, dietary: v })}
                />

                <PreferenceGroup
                    title="Sleep Schedule"
                    options={SLEEP_OPTIONS}
                    value={preferences.sleep}
                    onChange={(v) => setPreferences({ ...preferences, sleep: v })}
                />

                <PreferenceGroup
                    title="Noise Preference"
                    options={NOISE_OPTIONS}
                    value={preferences.noise}
                    onChange={(v) => setPreferences({ ...preferences, noise: v })}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <p className="font-body text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <Link href="/user-onboarding/step-3">
                    <Button variant="secondary" size="lg" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
                <Button
                    size="lg"
                    className="gap-2"
                    disabled={isLoading}
                    onClick={async () => {
                        setIsLoading(true);
                        setError(null);
                        try {
                            const fd = new FormData();
                            fd.append('dietary', preferences.dietary);
                            fd.append('sleep', preferences.sleep);
                            fd.append('noise', preferences.noise);
                            const result = await savePreferences(fd);
                            if (result?.error) setError(result.error);
                        } catch {
                            // redirect() throws, expected
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                    ) : (
                        <>Continue to Review<ArrowRight className="w-4 h-4" /></>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}
