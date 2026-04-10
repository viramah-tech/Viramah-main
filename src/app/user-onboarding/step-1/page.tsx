"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { uploadFile, deleteUploadedFile } from "@/lib/uploadFile";
import {
    FieldLabel, FieldHint, FieldError, FieldInput, PhotoUpload,
    NavButton, FormCard, StepBadge, StepTitle, StepSubtitle,
    SelectionButton, containerVariants, itemVariants, FieldTextarea,
    AvatarUpload,
} from "@/components/onboarding/FormComponents";

const ID_TYPES = [
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
        if (!step1.gender) errs.gender = "Please select your gender";
        if (!step1.address.trim()) errs.address = "Current address is required";
        if (step1.address.trim().length > 0 && step1.address.trim().length < 10) errs.address = "Address must be at least 10 characters";
        if (!step1.idNumber.trim()) errs.idNumber = "ID number is required";
        if (!step1.profilePhoto) errs.profilePhoto = "Profile photo is required";
        if (!step1.idFront) errs.idFront = "Front side of ID is required";
        if (!step1.idBack) errs.idBack = "Back side of ID is required";

        // Age validation
        if (step1.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(step1.dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                errs.dateOfBirth = "You must be at least 18 years old";
            }
        }

        // ID validation
        const cleanId = step1.idNumber.trim();
        if (step1.idType === "aadhaar" && !/^\d{12}$/.test(cleanId.replace(/\s/g, ""))) {
            errs.idNumber = "Aadhaar must be exactly 12 numeric digits";
        } else if (step1.idType === "passport" && !/^[A-Z0-9]{8,9}$/.test(cleanId)) {
            errs.idNumber = "Passport must be 8-9 uppercase alphanumeric characters";
        } else if (step1.idType === "driving_license" && !/^[A-Z0-9]{15,16}$/.test(cleanId)) {
            errs.idNumber = "Driving License must be 15-16 uppercase alphanumeric characters";
        } else if (step1.idType === "voter_id" && !/^[A-Z0-9]{10}$/.test(cleanId)) {
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
            // Upload profile photo + ID images to S3 in parallel
            const isNewProfilePhoto = step1.profilePhoto?.preview?.startsWith("data:");
            const [profilePhotoUrl, idProofUrl, addressProofUrl] = await Promise.all([
                isNewProfilePhoto && step1.profilePhoto
                    ? uploadFile("photo", step1.profilePhoto.preview, step1.profilePhoto.name)
                    : Promise.resolve(step1.profilePhoto?.preview || ""),
                step1.idFront?.preview?.startsWith("data:")
                    ? uploadFile("document", step1.idFront.preview, step1.idFront.name)
                    : Promise.resolve(step1.idFront?.preview || ""),
                step1.idBack?.preview?.startsWith("data:")
                    ? uploadFile("document", step1.idBack.preview, step1.idBack.name)
                    : Promise.resolve(step1.idBack?.preview || ""),
            ]);

            // Save KYC data (text fields + document URLs + photo URL) to backend
            await saveStepToBackend(1, {
                fullName: step1.fullName,
                dateOfBirth: step1.dateOfBirth,
                gender: step1.gender,
                address: step1.address,
                idType: step1.idType,
                idNumber: step1.idNumber,
                idProof: idProofUrl,
                addressProof: addressProofUrl,
                photo: profilePhotoUrl,
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
        <motion.div variants={containerVariants} initial={false} animate="visible" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
                    {/* Profile Photo */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            paddingBottom: 20,
                            borderBottom: "1px solid rgba(31,58,45,0.1)",
                        }}
                    >
                        <AvatarUpload
                            label="Profile Photo"
                            file={step1.profilePhoto}
                            onUpload={(f) => updateStep1({ profilePhoto: f })}
                            onRemove={() => updateStep1({ profilePhoto: null })}
                            onDeleteFromServer={deleteUploadedFile}
                        />
                        {attempted && errors.profilePhoto ? (
                            <FieldError>{errors.profilePhoto}</FieldError>
                        ) : (
                            <FieldHint>A clear passport-size photo of your face</FieldHint>
                        )}
                    </div>

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

                    {/* Gender */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <FieldLabel>Gender</FieldLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                            {GENDER_OPTIONS.map((g) => (
                                <SelectionButton
                                    key={g.value}
                                    label={g.label}
                                    selected={step1.gender === g.value}
                                    onClick={() => updateStep1({ gender: g.value })}
                                />
                            ))}
                        </div>
                        {attempted && errors.gender && <FieldError>{errors.gender}</FieldError>}
                    </div>

                    {/* Address */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <FieldLabel htmlFor="s1-address">Current Address</FieldLabel>
                        <FieldTextarea
                            id="s1-address"
                            placeholder="Full address including city, state, and PIN code"
                            value={step1.address}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateStep1({ address: e.target.value })}
                            focused={focusedField === "address"}
                            hasError={attempted && !!errors.address}
                            onFocus={() => setFocusedField("address")}
                            onBlur={() => setFocusedField(null)}
                            rows={3}
                        />
                        {attempted && errors.address ? (
                            <FieldError>{errors.address}</FieldError>
                        ) : (
                            <FieldHint>Include flat/house number, street, city, state, and PIN code</FieldHint>
                        )}
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
                            onChange={(e) => {
                                let val = e.target.value;
                                if (step1.idType !== "aadhaar") val = val.toUpperCase();
                                updateStep1({ idNumber: val });
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
                                    onDeleteFromServer={deleteUploadedFile}
                                />
                                {attempted && errors.idFront && <FieldError>{errors.idFront}</FieldError>}
                            </div>
                            <div>
                                <PhotoUpload
                                    label="Back Side"
                                    file={step1.idBack}
                                    onUpload={(f) => updateStep1({ idBack: f })}
                                    onRemove={() => updateStep1({ idBack: null })}
                                    onDeleteFromServer={deleteUploadedFile}
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
