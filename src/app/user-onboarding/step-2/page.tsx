"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Phone, Users } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import type { GuardianForm } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiPutForm } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { dataURLtoFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldHint, FieldError, FieldInput, PhotoUpload,
    NavButton, SecondaryButton, FormCard, StepBadge, StepTitle,
    StepSubtitle, SelectionButton, containerVariants, itemVariants,
} from "@/components/onboarding/FormComponents";

const GREEN = "#1F3A2D";
const GOLD = "#D8B56A";

const RELATIONS = ["Father", "Mother", "Guardian", "Other"];
const ID_TYPES: Array<{ value: GuardianForm["idType"]; label: string }> = [
    { value: "aadhaar", label: "Aadhaar" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
];

export default function Step2Page() {
    const router = useRouter();
    const { guardian, setGuardian } = useOnboarding();
    const { refreshUser } = useAuth();

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Step access restrictions removed - users can move freely
    // useEffect(() => {
    //     if (!canAccessStep("guardian_details")) {
    //         router.replace("/user-onboarding/step-1");
    //     }
    // }, [canAccessStep, router]);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!guardian.fullName.trim()) errs.fullName = "Emergency contact name is required";
        if (!guardian.phone.trim()) errs.phone = "Phone number is required";
        if (!guardian.relation) errs.relation = "Please select a relationship";
        if (!guardian.idNumber.trim()) errs.idNumber = "Guardian ID number is required";
        if (!guardian.idFront) errs.idFront = "Front side of guardian ID is required";
        if (!guardian.idBack) errs.idBack = "Back side of guardian ID is required";

        // Phone validation
        const cleanPhone = guardian.phone.replace(/\D/g, "");
        if (!/^\d{10}$/.test(cleanPhone)) {
            errs.phone = "Phone number must be exactly 10 numeric digits";
        }

        if (!guardian.alternatePhone.trim()) {
            errs.alternatePhone = "Alternate phone number is required";
        } else {
            const cleanAltPhone = guardian.alternatePhone.replace(/\D/g, "");
            if (!/^\d{10}$/.test(cleanAltPhone)) {
                errs.alternatePhone = "Alternate phone must be exactly 10 numeric digits";
            }
        }

        // Parent ID validation
        const cleanId = guardian.idNumber.trim();
        if (guardian.idType === "aadhaar" && !/^\d{12}$/.test(cleanId.replace(/\s/g, ""))) {
            errs.idNumber = "Aadhaar must be exactly 12 numeric digits";
        } else if (guardian.idType === "passport" && !/^[A-Z0-9]{8,9}$/.test(cleanId)) {
            errs.idNumber = "Passport must be 8-9 uppercase alphanumeric characters";
        } else if (guardian.idType === "driving_license" && !/^[A-Z0-9]{15,16}$/.test(cleanId)) {
            errs.idNumber = "Driving License must be 15-16 uppercase alphanumeric characters";
        } else if (guardian.idType === "voter_id" && !/^[A-Z0-9]{10}$/.test(cleanId)) {
            errs.idNumber = "Voter ID must be exactly 10 uppercase alphanumeric characters";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleContinue = async () => {
        setAttempted(true);
        if (!validate()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("fullName", guardian.fullName);
            formData.append("relation", guardian.relation);
            formData.append("phone", guardian.phone);
            formData.append("alternatePhone", guardian.alternatePhone);
            formData.append("idType", guardian.idType);
            formData.append("idNumber", guardian.idNumber);

            // Backend expects `guardianIdFront` and `guardianIdBack` for files
            if (guardian.idFront?.preview?.startsWith('data:')) {
                formData.append("guardianIdFront", dataURLtoFile(guardian.idFront.preview, guardian.idFront.name));
            }
            if (guardian.idBack?.preview?.startsWith('data:')) {
                formData.append("guardianIdBack", dataURLtoFile(guardian.idBack.preview, guardian.idBack.name));
            }

            await apiPutForm(API.onboarding.guardian, formData);
            
            // Sync with backend to advance the step before navigation guard runs.
            await refreshUser({ force: true });

            router.push("/user-onboarding/step-3");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save. Please try again.";
            const stepFromError = message.match(/current step:\s*([a-z_]+)/i)?.[1]?.toLowerCase();
            const stepPathMap: Record<string, string> = {
                compliance: "/user-onboarding/terms",
                verification: "/verify-contact",
                personal_details: "/user-onboarding/step-1",
                guardian_details: "/user-onboarding/step-2",
                room_selection: "/user-onboarding/step-3",
                review: "/user-onboarding/step-4",
                booking_payment: "/user-onboarding/deposit",
                final_payment: "/user-onboarding/payment-breakdown",
                completed: "/student/dashboard",
            };

            if (/requires step/i.test(message) && stepFromError && stepPathMap[stepFromError]) {
                router.push(stepPathMap[stepFromError]);
                return;
            }

            setErrors({ fullName: message }); // Display as global/form error
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        router.replace("/user-onboarding/step-1");
    };

    const parentIdLabel = ID_TYPES.find((t) => t.value === guardian.idType)?.label ?? "ID";

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
                            value={guardian.fullName}
                            onChange={(e) => setGuardian({ fullName: e.target.value })}
                            focused={focusedField === "name"}
                            hasError={attempted && !!errors.fullName}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.fullName && <FieldError>{errors.fullName}</FieldError>}
                    </div>

                    {/* Phone */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-phone">Emergency Contact Phone</FieldLabel>
                        <FieldInput
                            id="s2-phone"
                            type="tel"
                            placeholder="+91 98XXX XXXXX"
                            value={guardian.phone}
                            onChange={(e) => setGuardian({ phone: e.target.value })}
                            focused={focusedField === "phone"}
                            hasError={attempted && !!errors.phone}
                            onFocus={() => setFocusedField("phone")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.phone ? (
                            <FieldError>{errors.phone}</FieldError>
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
                                    selected={guardian.relation === rel}
                                    onClick={() => setGuardian({ relation: rel })}
                                />
                            ))}
                        </div>
                        {attempted && errors.relation && <FieldError>{errors.relation}</FieldError>}
                    </div>

                    {/* Alternate Phone */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s2-alt">
                            Alternate Phone
                        </FieldLabel>
                        <FieldInput
                            id="s2-alt"
                            type="tel"
                            placeholder="+91 98XXX XXXXX"
                            value={guardian.alternatePhone}
                            onChange={(e) => setGuardian({ alternatePhone: e.target.value })}
                            focused={focusedField === "alt"}
                            onFocus={() => setFocusedField("alt")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.alternatePhone && <FieldError>{errors.alternatePhone}</FieldError>}
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
                                    selected={guardian.idType === type.value}
                                    onClick={() => setGuardian({ idType: type.value })}
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
                            value={guardian.idNumber}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (guardian.idType !== "aadhaar") val = val.toUpperCase();
                                setGuardian({ idNumber: val });
                            }}
                            focused={focusedField === "pidnum"}
                            hasError={attempted && !!errors.idNumber}
                            onFocus={() => setFocusedField("pidnum")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.idNumber && <FieldError>{errors.idNumber}</FieldError>}
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
                                    file={guardian.idFront}
                                    onUpload={(f) => setGuardian({ idFront: f })}
                                    onRemove={() => setGuardian({ idFront: null })}
                                />
                                {attempted && errors.idFront && <FieldError>{errors.idFront}</FieldError>}
                            </div>
                            <div>
                                <PhotoUpload
                                    label="Back Side"
                                    file={guardian.idBack}
                                    onUpload={(f) => setGuardian({ idBack: f })}
                                    onRemove={() => setGuardian({ idBack: null })}
                                />
                                {attempted && errors.idBack && <FieldError>{errors.idBack}</FieldError>}
                            </div>
                        </div>
                    </div>
                </FormCard>
            </motion.div>

            {/* Navigation */}
            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between" }}>
                <SecondaryButton onClick={handleBack}>
                    <ArrowLeft size={16} /> Back
                </SecondaryButton>
                <NavButton onClick={handleContinue} disabled={submitting}>
                    {submitting ? "Saving..." : "Continue to Room Selection"}
                    {!submitting && <ArrowRight size={16} />}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
