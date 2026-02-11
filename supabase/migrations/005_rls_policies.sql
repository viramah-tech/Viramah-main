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
