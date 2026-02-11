"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FormInput } from "@/components/ui/FormInput";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Shield, Upload, X, Image } from "lucide-react";

interface UploadedFile {
    name: string;
    preview: string;
}

function PhotoUpload({
    label,
    file,
    onUpload,
    onRemove
}: {
    label: string;
    file: UploadedFile | null;
    onUpload: (file: UploadedFile) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpload({
                    name: selectedFile.name,
                    preview: reader.result as string,
                });
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    return (
        <div className="flex-1">
            <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-widest block mb-2">
                {label}
            </span>
            {file ? (
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden border-2 border-sage-muted bg-sage-muted/10">
                    <img
                        src={file.preview}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={onRemove}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                        <X className="w-4 h-4 text-charcoal" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-sand-dark hover:border-terracotta-raw bg-sand-light/50 hover:bg-terracotta-raw/5 transition-all flex flex-col items-center justify-center gap-2"
                >
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Upload className="w-5 h-5 text-charcoal/40" />
                    </div>
                    <span className="font-mono text-xs text-charcoal/50">Click to upload</span>
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}

export default function Step1Page() {
    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        idType: "aadhaar",
        idNumber: "",
    });

    const [idFront, setIdFront] = useState<UploadedFile | null>(null);
    const [idBack, setIdBack] = useState<UploadedFile | null>(null);

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
                    <Shield className="w-4 h-4 text-terracotta-raw" />
                    <span className="font-mono text-xs text-terracotta-raw uppercase tracking-widest">
                        Identity Verification
                    </span>
                </div>
                <h1 className="font-display text-4xl text-charcoal mb-2">
                    Let&apos;s verify your identity
                </h1>
                <p className="font-body text-charcoal/60 max-w-md mx-auto">
                    We need to verify your identity to complete your room booking. Your data is encrypted and secure.
                </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-sand-dark p-8 shadow-lg shadow-charcoal/5 space-y-6">
                <FormInput
                    label="Full Name (as per ID)"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    hint="Enter your name exactly as it appears on your ID"
                />

                <FormInput
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />

                <div className="space-y-2">
                    <label className="font-body text-sm font-medium text-charcoal/70 block">
                        ID Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {["aadhaar", "passport", "voter_id"].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, idType: type })}
                                className={`py-3 rounded-xl border-2 font-mono text-xs uppercase tracking-widest transition-all duration-300 ${formData.idType === type
                                    ? "border-terracotta-raw bg-terracotta-raw/10 text-terracotta-raw"
                                    : "border-sand-dark text-charcoal/60 hover:border-charcoal/30"
                                    }`}
                            >
                                {type.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <FormInput
                    label={`${formData.idType === "aadhaar" ? "Aadhaar" : formData.idType === "passport" ? "Passport" : "Voter ID"} Number`}
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    hint="This will be verified against government records"
                />

                {/* ID Photo Upload Section */}
                <div className="pt-4 border-t border-sand-dark">
                    <div className="flex items-center gap-2 mb-4">
                        <Image className="w-5 h-5 text-terracotta-raw" />
                        <span className="font-body text-sm font-medium text-charcoal">
                            Upload ID Photos
                        </span>
                    </div>
                    <p className="font-mono text-[11px] text-charcoal/50 mb-4">
                        Please upload clear photos of your ID. Make sure all details are visible.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <PhotoUpload
                            label="Front Side"
                            file={idFront}
                            onUpload={setIdFront}
                            onRemove={() => setIdFront(null)}
                        />
                        <PhotoUpload
                            label="Back Side"
                            file={idBack}
                            onUpload={setIdBack}
                            onRemove={() => setIdBack(null)}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-4">
                <Link href="/user-onboarding/step-2">
                    <Button size="lg" className="gap-2">
                        Continue to Emergency Info
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
