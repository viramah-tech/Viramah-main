import { API } from "@/lib/apiEndpoints";
import { apiPostForm } from "@/lib/api";

/** DocType values accepted by the backend upload service. */
export type DocType =
    | "profile_photo"
    | "id_front"
    | "id_back"
    | "guardian_id_front"
    | "guardian_id_back";

/** Convert a base64 data URL (FileReader result) to a `File`. */
export function dataURLtoFile(dataUrl: string, filename: string): File {
    // Guard: if this is a server URL (already uploaded), skip conversion
    if (!dataUrl || !dataUrl.startsWith("data:")) {
        throw new Error(
            `Expected a data URL but received "${dataUrl?.substring(0, 50) || "(empty)"}". ` +
            "Please re-select the file and try again."
        );
    }

    const commaIndex = dataUrl.indexOf(",");
    if (commaIndex === -1) {
        throw new Error("Invalid data URL format. Please re-select the file and try again.");
    }

    const header = dataUrl.substring(0, commaIndex);
    const base64 = dataUrl.substring(commaIndex + 1);
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";

    let bytes: string;
    try {
        bytes = atob(base64);
    } catch {
        throw new Error(
            "Failed to decode the file data. The file may be corrupted. " +
            "Please remove it and upload again."
        );
    }

    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
}

interface DocumentUploadResult {
    url: string;
    docType: DocType;
}

/**
 * Upload a document (photo / ID scan) — backend routes to S3 and returns the final URL.
 * Use this before any onboarding PUT that needs a file URL as input.
 */
export async function uploadDocument(
    dataUrl: string,
    filename: string,
    docType: DocType
): Promise<string> {
    const file = dataURLtoFile(dataUrl, filename);
    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);
    const result = await apiPostForm<DocumentUploadResult>(API.upload.document, form);
    return result.url;
}

interface PaymentProofUploadResult {
    url: string;
}

/** Upload a payment receipt/proof. Returns the URL to pass as `proofUrl`. */
export async function uploadPaymentProof(dataUrl: string, filename: string): Promise<string> {
    const file = dataURLtoFile(dataUrl, filename);
    const form = new FormData();
    form.append("file", file);
    const result = await apiPostForm<PaymentProofUploadResult>(API.upload.paymentProof, form);
    return result.url;
}
