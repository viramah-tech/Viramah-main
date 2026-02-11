-- ============================================================
-- Migration 001: Users, Profiles, and Emergency Contacts
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Users table: stores all user accounts and roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Student Profiles: extended data for student users
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  dob DATE,
  phone TEXT,
  address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  id_type TEXT CHECK (id_type IN ('aadhaar', 'passport', 'voter_id')),
  id_number TEXT,
  id_document_path TEXT,
  photo_path TEXT,
  dietary_preference TEXT CHECK (dietary_preference IN ('veg', 'non-veg', 'vegan')),
  sleep_schedule TEXT CHECK (sleep_schedule IN ('early', 'late', 'flexible')),
  noise_level TEXT CHECK (noise_level IN ('quiet', 'moderate', 'social')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Parent Profiles: extended data for parent users
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Emergency Contacts: linked to a student
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Parent-Student Links: many-to-many between parents and students
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.parent_profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_student ON public.emergency_contacts(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_parent ON public.parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_links_student ON public.parent_student_links(student_id);
-- ============================================================
-- Migration 002: Rooms, Mess Packages, and Bookings
-- Run this in Supabase SQL Editor AFTER migration 001
-- ============================================================

-- 1. Rooms: all rentable rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('1-seater', '2-seater', '3-seater')),
  capacity INT NOT NULL DEFAULT 1,
  description TEXT,
  location TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  price_per_month NUMERIC NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Mess Packages: meal plans
CREATE TABLE IF NOT EXISTS public.mess_packages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Bookings: room bookings by students
CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  room_id BIGINT REFERENCES public.rooms(id),
  mess_package_id BIGINT REFERENCES public.mess_packages(id),
  start_date DATE NOT NULL,
  end_date DATE,
  total_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_student ON public.bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON public.bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON public.rooms(is_available);
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
-- ============================================================
-- Migration 004: Visits, Notifications, and Activity Logs
-- Run this in Supabase SQL Editor AFTER migration 003
-- ============================================================

-- 1. Visit Slots: pre-defined available time slots
CREATE TABLE IF NOT EXISTS public.visit_slots (
  id BIGSERIAL PRIMARY KEY,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Visit Requests: student-requested visits
CREATE TABLE IF NOT EXISTS public.visit_requests (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_relation TEXT,
  visit_date DATE NOT NULL,
  slot_id BIGINT REFERENCES public.visit_slots(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Notifications: messages/alerts for users
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Activity Logs: audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visit_requests_student ON public.visit_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_visit_requests_slot ON public.visit_requests(slot_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
-- ============================================================
-- Migration 005: Row-Level Security Policies
-- Run this in Supabase SQL Editor AFTER all previous migrations
-- ============================================================

-- ==================== USERS ====================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_self" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ==================== STUDENT PROFILES ====================
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_select_self" ON public.student_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "student_insert_self" ON public.student_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "student_update_self" ON public.student_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow parents to view their linked student's profile
CREATE POLICY "student_select_parent" ON public.student_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.student_id = student_profiles.id
        AND parent_student_links.parent_id = auth.uid()
    )
  );

-- ==================== PARENT PROFILES ====================
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_select_self" ON public.parent_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "parent_insert_self" ON public.parent_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "parent_update_self" ON public.parent_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ==================== EMERGENCY CONTACTS ====================
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select_owner" ON public.emergency_contacts
  FOR SELECT USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.student_id = emergency_contacts.student_id
        AND parent_student_links.parent_id = auth.uid()
    )
  );

CREATE POLICY "contacts_insert_self" ON public.emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "contacts_update_self" ON public.emergency_contacts
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "contacts_delete_self" ON public.emergency_contacts
  FOR DELETE USING (auth.uid() = student_id);

-- ==================== PARENT-STUDENT LINKS ====================
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "link_select_parent" ON public.parent_student_links
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "link_select_student" ON public.parent_student_links
  FOR SELECT USING (auth.uid() = student_id);

-- ==================== ROOMS (Public Read) ====================
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rooms_select_public" ON public.rooms
  FOR SELECT TO authenticated USING (true);

-- Admin-only insert/update/delete will be handled by service role key

-- ==================== MESS PACKAGES (Public Read) ====================
ALTER TABLE public.mess_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mess_select_public" ON public.mess_packages
  FOR SELECT TO authenticated USING (true);

-- ==================== BOOKINGS ====================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_owner" ON public.bookings
  FOR SELECT USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.student_id = bookings.student_id
        AND parent_student_links.parent_id = auth.uid()
    )
  );

CREATE POLICY "bookings_insert_self" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "bookings_update_self" ON public.bookings
  FOR UPDATE USING (auth.uid() = student_id);

-- ==================== WALLETS ====================
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets_select_self" ON public.wallets
  FOR SELECT USING (auth.uid() = id);

-- Updates done via RPC (SECURITY DEFINER), so no direct update policy needed

-- ==================== TRANSACTIONS ====================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trans_select_self" ON public.transactions
  FOR SELECT USING (
    auth.uid() = wallet_id
  );

-- Inserts done via RPC (SECURITY DEFINER)

-- ==================== PAYMENTS ====================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_self" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- ==================== VISIT SLOTS (Public Read) ====================
ALTER TABLE public.visit_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visit_slots_select_public" ON public.visit_slots
  FOR SELECT TO authenticated USING (true);

-- ==================== VISIT REQUESTS ====================
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_select_owner" ON public.visit_requests
  FOR SELECT USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.parent_student_links
      WHERE parent_student_links.student_id = visit_requests.student_id
        AND parent_student_links.parent_id = auth.uid()
    )
  );

CREATE POLICY "visits_insert_self" ON public.visit_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "visits_update_self" ON public.visit_requests
  FOR UPDATE USING (auth.uid() = student_id);

-- ==================== NOTIFICATIONS ====================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_self" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notif_update_self" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================== ACTIVITY LOGS ====================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_select_self" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);
-- ============================================================
-- Migration 006: Storage Buckets & Policies
-- Run this in Supabase SQL Editor AFTER all previous migrations
-- ============================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', false)
ON CONFLICT (id) DO NOTHING;

-- ==================== ID DOCUMENTS POLICIES ====================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "id_docs_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own documents
CREATE POLICY "id_docs_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own documents
CREATE POLICY "id_docs_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own documents
CREATE POLICY "id_docs_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'id-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ==================== PROFILE PHOTOS POLICIES ====================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "photos_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anyone authenticated to view profile photos (public within app)
CREATE POLICY "photos_select_all" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos');

-- Allow users to update their own photos
CREATE POLICY "photos_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own photos
CREATE POLICY "photos_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
