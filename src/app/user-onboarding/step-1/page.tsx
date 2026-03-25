"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { uploadFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldHint, FieldError, FieldInput, PhotoUpload,
    NavButton, FormCard, StepBadge, StepTitle, StepSubtitle,
    SelectionButton, containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const ID_TYPES = [
    { value: "aadhaar", label: "Aadhaar" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
];

export default function Step1Page() {
    const router = useRouter();
    const { state, updateStep1, markStepComplete, saveStepToBackend, saving } = useOnboarding();
    const { step1 } = state;

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!step1.fullName.trim()) errs.fullName = "Full name is required";
        if (!step1.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
        if (!step1.idNumber.trim()) errs.idNumber = "ID number is required";
        if (!step1.idFront) errs.idFront = "Front side of ID is required";
        if (!step1.idBack) errs.idBack = "Back side of ID is required";

        // Aadhaar: 12 digits
        if (step1.idType === "aadhaar" && step1.idNumber.replace(/\s/g, "").length !== 12) {
            errs.idNumber = "Aadhaar must be 12 digits";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleContinue = async () => {
        setAttempted(true);
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Upload ID images to S3
            const [idProofUrl, addressProofUrl] = await Promise.all([
                step1.idFront
                    ? uploadFile("document", step1.idFront.preview, step1.idFront.name)
                    : Promise.resolve(""),
                step1.idBack
                    ? uploadFile("document", step1.idBack.preview, step1.idBack.name)
                    : Promise.resolve(""),
            ]);

            // Save KYC data (text fields + document URLs) to backend
            await saveStepToBackend(1, {
                fullName: step1.fullName,
                dateOfBirth: step1.dateOfBirth,
                idType: step1.idType,
                idNumber: step1.idNumber,
                idProof: idProofUrl,
                addressProof: addressProofUrl,
                photo: idProofUrl, // Use front as photo fallback
            });

            markStepComplete(1);
            router.push("/user-onboarding/step-2");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save. Please try again.";
            setErrors({ idFront: message });
        } finally {
            setSubmitting(false);
        }
    };

    const idLabel = ID_TYPES.find((t) => t.value === step1.idType)?.label ?? "ID";

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Shield} label="Identity Verification" />
                <StepTitle>Let&apos;s verify your identity</StepTitle>
                <StepSubtitle>
                    We need to verify your identity to complete your room booking. Your data is encrypted and secure.
                </StepSubtitle>
            </motion.div>

            {/* Main Form Card */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    {/* Full Name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-name">Full Name (as per ID)</FieldLabel>
                        <FieldInput
                            id="s1-name"
                            type="text"
                            placeholder="e.g. Arjun Mehta"
                            value={step1.fullName}
                            onChange={(e) => updateStep1({ fullName: e.target.value })}
                            focused={focusedField === "name"}
                            hasError={attempted && !!errors.fullName}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.fullName ? (
                            <FieldError>{errors.fullName}</FieldError>
                        ) : (
                            <FieldHint>Enter your name exactly as it appears on your ID</FieldHint>
                        )}
                    </div>

                    {/* Date of Birth */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-dob">Date of Birth</FieldLabel>
                        <FieldInput
                            id="s1-dob"
                            type="date"
                            value={step1.dateOfBirth}
                            onChange={(e) => updateStep1({ dateOfBirth: e.target.value })}
                            focused={focusedField === "dob"}
                            hasError={attempted && !!errors.dateOfBirth}
                            onFocus={() => setFocusedField("dob")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.dateOfBirth && <FieldError>{errors.dateOfBirth}</FieldError>}
                    </div>

                    {/* ID Type */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>ID Type</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                            {ID_TYPES.map((type) => (
                                <SelectionButton
                                    key={type.value}
                                    label={type.label}
                                    selected={step1.idType === type.value}
                                    onClick={() => updateStep1({ idType: type.value })}
                                />
                            ))}
                        </div>
                    </div>

                    {/* ID Number */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-idnum">{idLabel} Number</FieldLabel>
                        <FieldInput
                            id="s1-idnum"
                            type="text"
                            placeholder={step1.idType === "aadhaar" ? "XXXX XXXX XXXX" : `Enter ${idLabel} number`}
                            value={step1.idNumber}
                            onChange={(e) => updateStep1({ idNumber: e.target.value })}
                            focused={focusedField === "idnum"}
                            hasError={attempted && !!errors.idNumber}
                            onFocus={() => setFocusedField("idnum")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.idNumber ? (
                            <FieldError>{errors.idNumber}</FieldError>
                        ) : (
                            <FieldHint>This will be verified against government records</FieldHint>
                        )}
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
                                    color: "#1F3A2D",
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
                            <div>
                                <PhotoUpload
                                    label="Front Side"
                                    file={step1.idFront}
                                    onUpload={(f) => updateStep1({ idFront: f })}
                                    onRemove={() => updateStep1({ idFront: null })}
                                />
                                {attempted && errors.idFront && <FieldError>{errors.idFront}</FieldError>}
                            </div>
                            <div>
                                <PhotoUpload
                                    label="Back Side"
                                    file={step1.idBack}
                                    onUpload={(f) => updateStep1({ idBack: f })}
                                    onRemove={() => updateStep1({ idBack: null })}
                                />
                                {attempted && errors.idBack && <FieldError>{errors.idBack}</FieldError>}
                            </div>
                        </div>
                    </div>
                </FormCard>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
                <NavButton onClick={handleContinue} disabled={submitting || saving}>
                    {submitting ? "Saving..." : "Continue to Emergency Info"}
                    {!submitting && <ArrowRight size={16} />}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
