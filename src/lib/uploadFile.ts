import { PUBLIC_API } from "@/lib/apiEndpoints";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Convert a base64 data URL to a File object.
 */
function dataURLtoFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    const bytes = atob(base64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
}

/**
 * Upload a file to the backend S3 endpoint.
 * @param type - "document" | "photo" | "receipt"
 * @param dataUrl - base64 data URL from FileReader
 * @param filename - original file name
 * @returns The S3 URL of the uploaded file
 */
export async function uploadFile(
    type: "document" | "photo" | "receipt",
    dataUrl: string,
    filename: string
): Promise<string> {
    const file = dataURLtoFile(dataUrl, filename);
    const formData = new FormData();
    formData.append(type, file);

    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("viramah_token")
            : null;

    const uploadPath =
        type === "document"
            ? PUBLIC_API.upload.document
            : type === "photo"
                ? PUBLIC_API.upload.photo
                : PUBLIC_API.upload.receipt;

    const res = await fetch(`${API_BASE}${uploadPath}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        credentials: "include",
    });

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (parseError) {
        console.error(`[uploadFile] JSON Parse Error for ${API_BASE}${uploadPath}:`, text.substring(0, 100));
        throw new Error(`Upload failed to parse JSON from ${API_BASE}...`);
    }

    if (!res.ok) {
        throw new Error(data?.message || `Upload failed (${res.status})`);
    }

    return data.data.url;
}

/**
 * Delete an uploaded file from S3 and clear DB references.
 * @param fileUrl - The full S3 URL of the file to delete
 */
export async function deleteUploadedFile(fileUrl: string): Promise<void> {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("viramah_token")
            : null;

    const res = await fetch(`${API_BASE}${PUBLIC_API.upload.file}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fileUrl }),
        credentials: "include",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Delete failed (${res.status})`);
    }
}
