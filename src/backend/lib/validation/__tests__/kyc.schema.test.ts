import { describe, it, expect } from "vitest";
import { kycSubmitSchema } from "@/backend/lib/validation/schemas/kyc.schema";

describe("KYC Validation Schema", () => {
    it("validates correct Aadhaar submission", () => {
        const result = kycSubmitSchema.parse({
            documentType: "aadhaar",
            documentNumber: "123456789012",
            documentImageFront: "https://storage.example.com/front.jpg",
        });
        expect(result.documentType).toBe("aadhaar");
    });

    it("validates correct passport submission with back image", () => {
        const result = kycSubmitSchema.parse({
            documentType: "passport",
            documentNumber: "A12345678",
            documentImageFront: "data:image/png;base64,abc123",
            documentImageBack: "data:image/png;base64,def456",
        });
        expect(result.documentImageBack).toBe("data:image/png;base64,def456");
    });

    it("accepts driving_license as document type", () => {
        const result = kycSubmitSchema.parse({
            documentType: "driving_license",
            documentNumber: "DL-1234567890",
            documentImageFront: "https://storage.example.com/dl.jpg",
        });
        expect(result.documentType).toBe("driving_license");
    });

    it("rejects invalid document type", () => {
        expect(() =>
            kycSubmitSchema.parse({
                documentType: "voter_id",
                documentNumber: "ABC123",
                documentImageFront: "url",
            })
        ).toThrow();
    });

    it("rejects document number shorter than 6 chars", () => {
        expect(() =>
            kycSubmitSchema.parse({
                documentType: "aadhaar",
                documentNumber: "123",
                documentImageFront: "url",
            })
        ).toThrow();
    });

    it("rejects empty front image", () => {
        expect(() =>
            kycSubmitSchema.parse({
                documentType: "aadhaar",
                documentNumber: "123456789012",
                documentImageFront: "",
            })
        ).toThrow();
    });

    it("documentImageBack is optional", () => {
        const result = kycSubmitSchema.parse({
            documentType: "aadhaar",
            documentNumber: "123456789012",
            documentImageFront: "https://image.url",
        });
        expect(result.documentImageBack).toBeUndefined();
    });
});
