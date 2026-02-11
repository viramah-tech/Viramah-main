-- ============================================================
-- Migration 003: Wallets, Transactions, and Payments
-- Run this in Supabase SQL Editor AFTER migration 002
-- ============================================================

-- 1. Wallets: one per student
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Transactions: logs all wallet activity
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('topup', 'payment', 'refund')),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Payments: external payment tracking (e.g. Stripe)
CREATE TABLE IF NOT EXISTS public.payments (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id BIGINT REFERENCES public.bookings(id),
  amount NUMERIC NOT NULL,
  provider TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Wallet top-up RPC (atomic operation)
CREATE OR REPLACE FUNCTION public.topup_wallet(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  -- Update wallet balance
  UPDATE public.wallets
  SET balance = balance + p_amount, updated_at = now()
  WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO public.transactions (wallet_id, type, amount, description)
  VALUES (p_user_id, 'topup', p_amount, 'Wallet Top-Up');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Wallet payment RPC (atomic operation)
CREATE OR REPLACE FUNCTION public.wallet_payment(p_user_id UUID, p_amount NUMERIC, p_description TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check sufficient balance
  IF (SELECT balance FROM public.wallets WHERE id = p_user_id) < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  -- Deduct from wallet
  UPDATE public.wallets
  SET balance = balance - p_amount, updated_at = now()
  WHERE id = p_user_id;

  -- Log the transaction
  INSERT INTO public.transactions (wallet_id, type, amount, description)
  VALUES (p_user_id, 'payment', p_amount, p_description);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
