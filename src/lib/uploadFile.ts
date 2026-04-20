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
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const bytes = atob(base64);
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
