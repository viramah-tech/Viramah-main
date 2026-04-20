"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import type { PersonalForm } from "@/context/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { apiPutForm } from "@/lib/api";
import { API } from "@/lib/apiEndpoints";
import { dataURLtoFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldHint, FieldError, FieldInput, PhotoUpload,
    NavButton, FormCard, StepBadge, StepTitle, StepSubtitle,
    SelectionButton, containerVariants, itemVariants, FieldTextarea,
    AvatarUpload,
} from "@/components/onboarding/FormComponents";

const ID_TYPES: Array<{ value: PersonalForm["idType"]; label: string }> = [
    { value: "aadhaar", label: "Aadhaar" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
    { value: "voter_id", label: "Voter ID" },
];

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
];

export default function Step1Page() {
    const router = useRouter();
    const { personal, setPersonal } = useOnboarding();
    const { refreshUser } = useAuth();

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [attempted, setAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!personal.fullName.trim()) errs.fullName = "Full name is required";
        if (!personal.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
        if (!personal.gender) errs.gender = "Please select your gender";
        if (!personal.addressLine1.trim()) errs.address = "Current address is required (As per documents )";
        if (personal.addressLine1.trim().length > 0 && personal.addressLine1.trim().length < 10) errs.address = "Address must be at least 10 characters";
        if (!personal.idNumber.trim()) errs.idNumber = "ID number is required";
        if (!personal.profilePhoto) errs.profilePhoto = "Profile photo is required";
        if (!personal.idFront) errs.idFront = "Front side of ID is required";
        if (!personal.idBack) errs.idBack = "Back side of ID is required";

        // Age validation
        if (personal.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(personal.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 14) {
                errs.dateOfBirth = "You must be at least 14 years old";
            }
        }

        // ID validation
        const cleanId = personal.idNumber.trim();
        if (personal.idType === "aadhaar" && !/^\d{12}$/.test(cleanId.replace(/\s/g, ""))) {
            errs.idNumber = "Aadhaar must be exactly 12 numeric digits";
        } else if (personal.idType === "passport" && !/^[A-Z0-9]{8,9}$/.test(cleanId)) {
            errs.idNumber = "Passport must be 8-9 uppercase alphanumeric characters";
        } else if (personal.idType === "driving_license" && !/^[A-Z0-9]{15,16}$/.test(cleanId)) {
            errs.idNumber = "Driving License must be 15-16 uppercase alphanumeric characters";
        } else if (personal.idType === "voter_id" && !/^[A-Z0-9]{10}$/.test(cleanId)) {
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

            // Map the frontend state fields to the backend schema names
            formData.append("fullName", personal.fullName);
            formData.append("dateOfBirth", personal.dateOfBirth);
            formData.append("gender", personal.gender);
            formData.append("address", personal.addressLine1); // Sent as 'address'
            formData.append("idType", personal.idType);
            formData.append("idNumber", personal.idNumber);

            // Append photos only if they are newly uploaded data: URLs
            if (personal.profilePhoto?.preview?.startsWith('data:')) {
                formData.append("profilePhoto", dataURLtoFile(personal.profilePhoto.preview, personal.profilePhoto.name));
            }
            if (personal.idFront?.preview?.startsWith('data:')) {
                formData.append("idFront", dataURLtoFile(personal.idFront.preview, personal.idFront.name));
            }
            if (personal.idBack?.preview?.startsWith('data:')) {
                formData.append("idBack", dataURLtoFile(personal.idBack.preview, personal.idBack.name));
            }

            // Send standard multipart/form-data PUT directly
            await apiPutForm(API.onboarding.personal, formData);

            // Backend automatically advances step; force a fresh read before navigating.
            await refreshUser({ force: true });

            router.push("/user-onboarding/step-2");
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

            setErrors({ idFront: message });
        } finally {
            setSubmitting(false);
        }
    };

    const idLabel = ID_TYPES.find((t) => t.value === personal.idType)?.label ?? "ID";

    return (
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <motion.div variants={itemVariants} style={{ textAlign: "center", paddingBottom: 8 }}>
                <StepBadge icon={Shield} label="Identity Verification" />
                <StepTitle>Let&apos;s verify your identity</StepTitle>
                <StepSubtitle>
                    We need to verify your identity to complete your room booking. Your data is encrypted and secure.
                </StepSubtitle>
            </motion.div>

            <motion.div variants={itemVariants}>
                <FormCard>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingBottom: 20, borderBottom: "1px solid rgba(31,58,45,0.1)" }}>
                        <AvatarUpload
                            label="Profile Photo"
                            file={personal.profilePhoto}
                            onUpload={(f) => setPersonal({ profilePhoto: f })}
                            onRemove={() => setPersonal({ profilePhoto: null })}
                        />
                        {attempted && errors.profilePhoto ? (
                            <FieldError>{errors.profilePhoto}</FieldError>
                        ) : (
                            <FieldHint>A clear passport-size photo of your face</FieldHint>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-name">Full Name (as per ID)</FieldLabel>
                        <FieldInput
                            id="s1-name"
                            type="text"
                            placeholder="e.g. Arjun Mehta"
                            value={personal.fullName}
                            onChange={(e) => setPersonal({ fullName: e.target.value })}
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

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-dob">Date of Birth</FieldLabel>
                        <FieldInput
                            id="s1-dob"
                            type="date"
                            value={personal.dateOfBirth}
                            onChange={(e) => setPersonal({ dateOfBirth: e.target.value })}
                            focused={focusedField === "dob"}
                            hasError={attempted && !!errors.dateOfBirth}
                            onFocus={() => setFocusedField("dob")}
                            onBlur={() => setFocusedField(null)}
                        />
                        {attempted && errors.dateOfBirth && <FieldError>{errors.dateOfBirth}</FieldError>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>Gender</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                            {GENDER_OPTIONS.map((g) => (
                                <SelectionButton
                                    key={g.value}
                                    label={g.label}
                                    selected={personal.gender === g.value}
                                    onClick={() => setPersonal({ gender: g.value as "male" | "female" | "other" })}
                                />
                            ))}
                        </div>
                        {attempted && errors.gender && <FieldError>{errors.gender}</FieldError>}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-address">Address (as per document)</FieldLabel>
                        <FieldTextarea
                            id="s1-address"
                            placeholder="Address as mentioned on your ID document"
                            value={personal.addressLine1}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPersonal({ addressLine1: e.target.value })}
                            focused={focusedField === "address"}
                            hasError={attempted && !!errors.address}
                            onFocus={() => setFocusedField("address")}
                            onBlur={() => setFocusedField(null)}
                            rows={3}
                        />
                        {attempted && errors.address ? (
                            <FieldError>{errors.address}</FieldError>
                        ) : (
                            <FieldHint>Enter the address exactly as it appears on your ID document</FieldHint>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>ID Type</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                            {ID_TYPES.map((type) => (
                                <SelectionButton
                                    key={type.value}
                                    label={type.label}
                                    selected={personal.idType === type.value}
                                    onClick={() => setPersonal({ idType: type.value })}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-idnum">{idLabel} Number</FieldLabel>
                        <FieldInput
                            id="s1-idnum"
                            type="text"
                            placeholder={personal.idType === "aadhaar" ? "XXXX XXXX XXXX" : `Enter ${idLabel} number`}
                            value={personal.idNumber}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (personal.idType !== "aadhaar") val = val.toUpperCase();
                                setPersonal({ idNumber: val });
                            }}
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

                    <div style={{ paddingTop: 20, borderTop: "1px solid rgba(31,58,45,0.1)", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                            <p style={{ fontFamily: "var(--font-body, sans-serif)", fontSize: "0.9rem", fontWeight: 600, color: "#1F3A2D", marginBottom: 4 }}>
                                Upload ID Photos
                            </p>
                            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "0.65rem", color: "rgba(31,58,45,0.45)", letterSpacing: "0.03em" }}>
                                Please upload clear photos of your ID. Make sure all details are visible.
                            </p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <PhotoUpload
                                    label="Front Side"
                                    file={personal.idFront}
                                    onUpload={(f) => setPersonal({ idFront: f })}
                                    onRemove={() => setPersonal({ idFront: null })}
                                />
                                {attempted && errors.idFront && <FieldError>{errors.idFront}</FieldError>}
                            </div>
                            <div>
                                <PhotoUpload
                                    label="Back Side"
                                    file={personal.idBack}
                                    onUpload={(f) => setPersonal({ idBack: f })}
                                    onRemove={() => setPersonal({ idBack: null })}
                                />
                                {attempted && errors.idBack && <FieldError>{errors.idBack}</FieldError>}
                            </div>
                        </div>
                    </div>
                </FormCard>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "flex-end" }}>
                <NavButton onClick={handleContinue} disabled={submitting}>
                    {submitting ? "Saving..." : "Continue to Emergency Info"}
                    {!submitting && <ArrowRight size={16} />}
                </NavButton>
            </motion.div>
        </motion.div>
    );
}
