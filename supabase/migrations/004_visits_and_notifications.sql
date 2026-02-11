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
