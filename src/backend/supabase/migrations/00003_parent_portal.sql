-- =============================================
-- VIRAMAH: Parent Portal & Amenity Bookings
-- Migration: 00003_parent_portal.sql
-- =============================================

-- =============================================
-- PARENT-STUDENT LINKS
-- =============================================
CREATE TABLE parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id),
    student_id UUID NOT NULL REFERENCES profiles(id),
    relationship VARCHAR(20) NOT NULL
        CHECK (relationship IN ('father', 'mother', 'guardian')),
    access_level VARCHAR(20) NOT NULL DEFAULT 'view_only'
        CHECK (access_level IN ('full', 'financial_only', 'view_only')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    UNIQUE(parent_id, student_id)
);

CREATE INDEX idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX idx_parent_links_student ON parent_student_links(student_id);

-- =============================================
-- AMENITY BOOKINGS
-- =============================================
CREATE TABLE amenity_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    amenity_id TEXT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot_start TIMESTAMPTZ NOT NULL,
    time_slot_end TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'booked'
        CHECK (status IN ('booked', 'completed', 'cancelled', 'no-show')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_amenity_profile ON amenity_bookings(profile_id);
CREATE INDEX idx_amenity_date ON amenity_bookings(booking_date);
CREATE INDEX idx_amenity_status ON amenity_bookings(status);
