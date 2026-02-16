import { createServerClient } from "@/backend/lib/supabase/server";
import { APIError } from "@/backend/lib/errors";
import type { KycStatus, IdDocumentType } from "@/backend/types/database/enums";

/**
 * Submit KYC documents for verification.
 */
export async function submitKycDocuments(
    profileId: string,
    documentType: IdDocumentType,
    documentNumber: string,
    documentImageFront: string,
    documentImageBack?: string
): Promise<{ id: string; status: KycStatus }> {
    const supabase = createServerClient();

    // Check if KYC already submitted
    const { data: existing } = await supabase
        .from("kyc_documents")
        .select("id, verification_status")
        .eq("profile_id", profileId)
        .single();

    if (existing && existing.verification_status === "verified") {
        throw new APIError("KYC_ALREADY_SUBMITTED", "KYC documents already verified", 400);
    }

    // TODO: Encrypt document_number before storage
    const { data: doc, error } = await supabase
        .from("kyc_documents")
        .upsert({
            profile_id: profileId,
            document_type: documentType,
            document_number: documentNumber,
            document_image_front: documentImageFront,
            document_image_back: documentImageBack ?? null,
            verification_status: "submitted",
            submitted_at: new Date().toISOString(),
        })
        .select("id, verification_status")
        .single();

    if (error || !doc) {
        throw new APIError("INTERNAL_ERROR", "Failed to submit KYC documents", 500);
    }

    // Update profile KYC status
    await supabase
        .from("profiles")
        .update({ kyc_status: "submitted" })
        .eq("id", profileId);

    return { id: doc.id, status: doc.verification_status };
}

/**
 * Get current KYC status for a profile.
 */
export async function getKycStatus(profileId: string): Promise<{ status: KycStatus; submittedAt: string | null }> {
    const supabase = createServerClient();

    const { data: profile } = await supabase
        .from("profiles")
        .select("kyc_status, kyc_verified_at")
        .eq("id", profileId)
        .single();

    if (!profile) {
        throw new APIError("NOT_FOUND", "Profile not found", 404);
    }

    return {
        status: profile.kyc_status,
        submittedAt: profile.kyc_verified_at,
    };
}
