import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { submitKycDocuments, getKycStatus } from "@/backend/services/auth/kyc.service";
import { kycSubmitSchema } from "@/backend/lib/validation";

// POST /api/v1/user/kyc — Submit KYC documents
const POST = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();
    const validated = kycSubmitSchema.parse(body);

    const result = await submitKycDocuments(
        request.user.profileId,
        validated.documentType,
        validated.documentNumber,
        validated.documentImageFront,
        validated.documentImageBack
    );

    return NextResponse.json({ data: result }, { status: 201 });
}));

// GET /api/v1/user/kyc — Get KYC status
const GET = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const status = await getKycStatus(request.user.profileId);
    return NextResponse.json({ data: status });
}));

export { POST, GET };
