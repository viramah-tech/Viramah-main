import { createServerClient } from "@/backend/lib/supabase/server";
import { APIError } from "@/backend/lib/errors";

/**
 * Get wallet balance for a student.
 */
export async function getWalletBalance(profileId: string): Promise<number> {
    const supabase = createServerClient();

    const { data: transactions } = await supabase
        .from("wallet_transactions")
        .select("balance_after")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (!transactions || transactions.length === 0) {
        return 0;
    }

    return transactions[0].balance_after;
}

/**
 * Get wallet transaction history.
 */
export async function getWalletTransactions(profileId: string, limit: number = 20) {
    const supabase = createServerClient();

    const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(limit);

    return (data ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balance_after,
        source: t.source,
        description: t.description,
        createdAt: t.created_at,
    }));
}

/**
 * Add funds to student wallet.
 */
export async function addToWallet(
    profileId: string,
    amount: number,
    source: string,
    description: string
): Promise<{ newBalance: number }> {
    if (amount <= 0) {
        throw new APIError("VALIDATION_ERROR", "Amount must be positive", 400);
    }

    const currentBalance = await getWalletBalance(profileId);
    const newBalance = currentBalance + amount;

    const supabase = createServerClient();

    await supabase
        .from("wallet_transactions")
        .insert({
            profile_id: profileId,
            type: "credit",
            amount,
            balance_after: newBalance,
            source,
            description,
        });

    return { newBalance };
}
