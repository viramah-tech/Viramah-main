import { z } from "zod";

export const kycSubmitSchema = z.object({
    documentType: z.enum(["aadhaar", "passport", "driving_license"]),
    documentNumber: z.string().min(6, "Document number is too short").max(20),
    documentImageFront: z.string().min(1, "Front image is required"),
    documentImageBack: z.string().optional(),
});
