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
