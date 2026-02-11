"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { GraduationCap, Users, ArrowRight, Chrome } from "lucide-react";

type RoleSelection = "student" | "parent" | null;

export default function SignUpPage() {
    const [selectedRole, setSelectedRole] = useState<RoleSelection>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const getRedirectPath = () => {
        if (selectedRole === "student") return "/user-onboarding/step-1";
        if (selectedRole === "parent") return "/parent/dashboard";
        return "/signup";
    };

    return (
        <div className="min-h-screen bg-sand-light flex items-center justify-center p-6">
            {/* Background Pattern */}
            <div className="fixed inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--terracotta-raw)_1px,_transparent_1px)] bg-[size:32px_32px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                        <div className="w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                            <img src="/logo.png" alt="Viramah Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-display text-2xl text-ink">VIRAMAH</span>
                    </Link>
                    <h1 className="font-display text-3xl text-charcoal">Create Account</h1>
                    <p className="font-body text-charcoal/60 mt-2">Join the Viramah community</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-3xl border border-sand-dark p-8 shadow-xl shadow-charcoal/5">
                    {/* Role Selection */}
                    <div className="mb-6">
                        <label className="font-mono text-xs text-charcoal/50 uppercase tracking-widest block mb-3">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSelectedRole("student")}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${selectedRole === "student"
                                    ? "border-terracotta-raw bg-terracotta-raw/5"
                                    : "border-sand-dark hover:border-charcoal/30"
                                    }`}
                            >
                                <GraduationCap className={`w-6 h-6 mb-2 ${selectedRole === "student" ? "text-terracotta-raw" : "text-charcoal/40"
                                    }`} />
                                <span className={`font-body text-sm font-medium block ${selectedRole === "student" ? "text-terracotta-raw" : "text-charcoal"
                                    }`}>
                                    Student
                                </span>
                                <span className="font-mono text-[10px] text-charcoal/50">
                                    Access your room &amp; services
                                </span>
                            </button>
                            <button
                                onClick={() => setSelectedRole("parent")}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${selectedRole === "parent"
                                    ? "border-terracotta-raw bg-terracotta-raw/5"
                                    : "border-sand-dark hover:border-charcoal/30"
                                    }`}
                            >
                                <Users className={`w-6 h-6 mb-2 ${selectedRole === "parent" ? "text-terracotta-raw" : "text-charcoal/40"
                                    }`} />
                                <span className={`font-body text-sm font-medium block ${selectedRole === "parent" ? "text-terracotta-raw" : "text-charcoal"
                                    }`}>
                                    Parent
                                </span>
                                <span className="font-mono text-[10px] text-charcoal/50">
                                    Monitor &amp; visit your child
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Form */}
                    <div className="space-y-4 mb-6">
                        <FormInput
                            label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <FormInput
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <FormInput
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FormInput
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <Link href={getRedirectPath()}>
                        <Button
                            size="lg"
                            className="w-full gap-2"
                            disabled={!selectedRole}
                        >
                            {selectedRole === "student" ? "Continue to Booking" : "Create Account"}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-sand-dark" />
                        <span className="font-mono text-[10px] text-charcoal/40 uppercase">or</span>
                        <div className="flex-1 h-px bg-sand-dark" />
                    </div>

                    {/* Google Sign Up */}
                    <Button variant="secondary" size="lg" className="w-full gap-3">
                        <Chrome className="w-5 h-5" />
                        Sign up with Google
                    </Button>
                </div>

                {/* Footer Links */}
                <div className="text-center mt-6">
                    <span className="font-body text-sm text-charcoal/60">
                        Already have an account?{" "}
                        <Link href="/login" className="text-terracotta-raw hover:underline font-medium">
                            Sign In
                        </Link>
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
