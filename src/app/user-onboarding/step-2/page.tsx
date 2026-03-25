"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Phone, Users } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { uploadFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldHint, FieldError, FieldInput, PhotoUpload,
    NavButton, SecondaryButton, FormCard, StepBadge, StepTitle,
    StepSubtitle, SelectionButton, containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];
const ID_TYPES = [
    { value: "aadhaar", label: "Aadhaar" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
];

export default function Step2Page() {
    const router = useRouter();
    const { state, updateStep2, markStepComplete, canAccessStep, saveStepToBackend, saving } = useOnboarding();
    const { step2 } = state;

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Enforce step order
    if (!canAccessStep(2)) {
        router.replace("/user-onboarding/step-1");
        return null;
    }

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!step2.emergencyName.trim()) errs.emergencyName = "Emergency contact name is required";
        if (!step2.emergencyPhone.trim()) errs.emergencyPhone = "Phone number is required";
        if (!step2.emergencyRelation) errs.emergencyRelation = "Please select a relationship";
        if (!step2.parentIdNumber.trim()) errs.parentIdNumber = "Guardian ID number is required";
        if (!step2.parentIdFront) errs.parentIdFront = "Front side of guardian ID is required";
        if (!step2.parentIdBack) errs.parentIdBack = "Back side of guardian ID is required";

        // Phone validation
        const phoneDigits = step2.emergencyPhone.replace(/\D/g, "");
        if (step2.emergencyPhone && phoneDigits.length < 10) {
            errs.emergencyPhone = "Please enter a valid phone number";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleContinue = async () => {
        setAttempted(true);
        if (!validate()) return;

        setSubmitting(true);
        try {
            // Upload parent/guardian ID photos to S3
            const [parentIdFrontUrl, parentIdBackUrl] = await Promise.all([
                step2.parentIdFront
                    ? uploadFile("document", step2.parentIdFront.preview, step2.parentIdFront.name)
                    : Promise.resolve(""),
                step2.parentIdBack
                    ? uploadFile("document", step2.parentIdBack.preview, step2.parentIdBack.name)
                    : Promise.resolve(""),
            ]);

            await saveStepToBackend(2, {
                name: step2.emergencyName,
                phone: step2.emergencyPhone,
                relation: step2.emergencyRelation,
                alternatePhone: step2.alternatePhone,
                parentIdType: step2.parentIdType,
                parentIdNumber: step2.parentIdNumber,
                parentIdFront: parentIdFrontUrl,
                parentIdBack: parentIdBackUrl,
            });

            markStepComplete(2);
            router.push("/user-onboarding/step-3");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save. Please try again.";
            setErrors({ emergencyName: message });
        } finally {
            setSubmitting(false);
        }
    };

    const parentIdLabel = ID_TYPES.find((t) => t.value === step2.parentIdType)?.label ?? "ID";

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Phone} label="Emergency Contact" />
                <StepTitle>Emergency contact details</StepTitle>
                <StepSubtitle>
                    Please provide emergency contact information. We&apos;ll only use this in case of emergencies.
                </StepSubtitle>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    {/* Emergency Name */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-name">Emergency Contact Name</FieldLabel>
                        <FieldInput
                            id="s2-name"
                            type="text"
                            placeholder="Parent or guardian name"
                            value={step2.emergencyName}
                            onChange={(e) => updateStep2({ emergencyName: e.target.value })}
                            focused={focusedField === "name"}
                            hasError={attempted && !!errors.emergencyName}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.emergencyName && <FieldError>{errors.emergencyName}</FieldError>}
                    </div>

                    {/* Phone */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-phone">Emergency Contact Phone</FieldLabel>
                        <FieldInput
                            id="s2-phone"
                            type="tel"
                            placeholder="+91 98XXX XXXXX"
                            value={step2.emergencyPhone}
                            onChange={(e) => updateStep2({ emergencyPhone: e.target.value })}
                            focused={focusedField === "phone"}
                            hasError={attempted && !!errors.emergencyPhone}
                            onFocus={() => setFocusedField("phone")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.emergencyPhone ? (
                            <FieldError>{errors.emergencyPhone}</FieldError>
                        ) : (
                            <FieldHint>Include country code (+91)</FieldHint>
                        )}
                    </div>

                    {/* Relationship */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>Relationship</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                            {RELATIONS.map((rel) => (
                                <SelectionButton
                                    key={rel}
                                    label={rel}
                                    selected={step2.emergencyRelation === rel}
                                    onClick={() => updateStep2({ emergencyRelation: rel })}
                                />
                            ))}
                        </div>
                        {attempted && errors.emergencyRelation && <FieldError>{errors.emergencyRelation}</FieldError>}
                    </div>

                    {/* Alternate Phone */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-alt">
                            Alternate Phone <span style={{ opacity: 0.5, fontWeight: 400 }}>(Optional)</span>
                        </FieldLabel>
                        <FieldInput
                            id="s2-alt"
                            type="tel"
                            placeholder="+91 98XXX XXXXX"
                            value={step2.alternatePhone}
                            onChange={(e) => updateStep2({ alternatePhone: e.target.value })}
                            focused={focusedField === "alt"}
                            onFocus={() => setFocusedField("alt")}
                            onBlur={() => setFocusedField(null)}
                        />
                    </div>
                </FormCard>
            </motion.div>

            {/* Guardian ID Card */}
            <motion.div variants={itemVariants}>
                <FormCard>
                    {/* Section header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: "rgba(216,181,106,0.15)",
                                border: "1px solid rgba(216,181,106,0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Users size={18} color={GOLD} />
                        </div>
                        <div>
                            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, margin: 0 }}>
                                Parent / Guardian ID Verification
                            </p>
                            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", color: "rgba(31,58,45,0.45)", margin: 0, letterSpacing: "0.05em" }}>
                                Required for student safety
                            </p>
                        </div>
                    </div>

                    {/* Parent ID Type */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>ID Type</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                            {ID_TYPES.map((type) => (
                                <SelectionButton
                                    key={type.value}
                                    label={type.label}
                                    selected={step2.parentIdType === type.value}
                                    onClick={() => updateStep2({ parentIdType: type.value })}
                                    accentColor={GOLD}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Parent ID Number */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-pidnum">{parentIdLabel} Number</FieldLabel>
                        <FieldInput
                            id="s2-pidnum"
                            type="text"
                            placeholder="Parent/Guardian ID number"
                            value={step2.parentIdNumber}
                            onChange={(e) => updateStep2({ parentIdNumber: e.target.value })}
                            focused={focusedField === "pidnum"}
                            hasError={attempted && !!errors.parentIdNumber}
                            onFocus={() => setFocusedField("pidnum")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.parentIdNumber && <FieldError>{errors.parentIdNumber}</FieldError>}
                    </div>

                    {/* Photo Upload */}
                    <div style={{ paddingTop: 20, borderTop: "1px solid rgba(31,58,45,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: GREEN, marginBottom: 4 }}>
                                Upload Parent/Guardian ID Photos
                            </p>
                            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)" }}>
                                Please upload clear photos. Make sure all details are visible.
                            </p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <PhotoUpload
                                    label="Front Side"
                                    file={step2.parentIdFront}
                                    onUpload={(f) => updateStep2({ parentIdFront: f })}
                                    onRemove={() => updateStep2({ parentIdFront: null })}
                                />
                                {attempted && errors.parentIdFront && <FieldError>{errors.parentIdFront}</FieldError>}
                            </div>
                            <div>
                                <PhotoUpload
                                    label="Back Side"
                                    file={step2.parentIdBack}
                                    onUpload={(f) => updateStep2({ parentIdBack: f })}
                                    onRemove={() => updateStep2({ parentIdBack: null })}
                                />
                                {attempted && errors.parentIdBack && <FieldError>{errors.parentIdBack}</FieldError>}
                            </div>
                        </div>
                    </div>
                </FormCard>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={() => router.push("/user-onboarding/step-1")}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleContinue} disabled={submitting || saving}>
                    {submitting ? "Saving..." : "Continue to Room Selection"}
                    {!submitting && <ArrowRight size={16} />}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
