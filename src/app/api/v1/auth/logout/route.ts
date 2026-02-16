import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth } from "@/backend/middleware/auth.middleware";
import { signOut } from "@/backend/services/auth/session.service";

const POST = withErrorHandler(withAuth(async () => {
    await signOut();
    return NextResponse.json({ success: true });
}));

export { POST };
