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
