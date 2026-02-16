import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/backend/middleware/error.middleware";
import { withAuth, AuthenticatedRequest } from "@/backend/middleware/auth.middleware";
import { getWalletBalance, getWalletTransactions, addToWallet } from "@/backend/services/payment/wallet.service";

// GET /api/v1/student/wallet — Get wallet balance and transactions
const GET = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const balance = await getWalletBalance(request.user.profileId);
    const transactions = await getWalletTransactions(request.user.profileId);

    return NextResponse.json({
        data: { balance, transactions },
    });
}));

// POST /api/v1/student/wallet — Add money to wallet
const POST = withErrorHandler(withAuth(async (request: AuthenticatedRequest) => {
    const body = await request.json();
    const { amount, source = "deposit" } = body;

    const result = await addToWallet(
        request.user.profileId,
        amount,
        source,
        `Wallet top-up via ${source}`
    );

    return NextResponse.json({ data: result });
}));

export { GET, POST };
