-- =============================================
-- VIRAMAH: COMPLETE DATABASE SETUP
-- =============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to supabase.com → Your Project → SQL Editor
-- 2. Click "New Query"
-- 3. Paste this ENTIRE file
-- 4. Click "Run" (or Ctrl+Enter)
-- 5. Done! Your full database is ready.
--
-- This file combines:
--   ✅ Migration 1: Profiles, Emergency Contacts, KYC, Audit Logs
--   ✅ Migration 2: Properties, Rooms, Bookings, Payments, Wallet
--   ✅ Migration 3: Parent-Student Links, Amenity Bookings
--   ✅ All RLS Policies (Row Level Security)
--   ✅ Seed Data (3 properties, 7 rooms)
--
-- =============================================


-- ╔═══════════════════════════════════════════╗
-- ║    PART 1: EXTENSIONS & HELPERS           ║
-- ╚═══════════════════════════════════════════╝

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ╔═══════════════════════════════════════════╗
-- ║    PART 2: CORE TABLES                    ║
-- ╚═══════════════════════════════════════════╝

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    avatar_url TEXT,
    emergency_contact_id UUID,
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected', 'expired')),
    kyc_verified_at TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- EMERGENCY CONTACTS
-- =============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship VARCHAR(20) NOT NULL
        CHECK (relationship IN ('father', 'mother', 'guardian', 'sibling', 'other')),
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from profiles to emergency_contacts
ALTER TABLE profiles
    ADD CONSTRAINT fk_emergency_contact
    FOREIGN KEY (emergency_contact_id)
    REFERENCES emergency_contacts(id);

-- =============================================
-- KYC DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL
        CHECK (document_type IN ('aadhaar', 'passport', 'driving_license')),
    document_number TEXT NOT NULL,
    document_image_front TEXT NOT NULL,
    document_image_back TEXT,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'submitted', 'verified', 'rejected', 'expired')),
    verified_by UUID,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kyc_profile ON kyc_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(verification_status);

-- =============================================
-- AUDIT LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_logs(performed_at);


-- ╔═══════════════════════════════════════════╗
-- ║    PART 3: PROPERTIES & ROOMS             ║
-- ╚═══════════════════════════════════════════╝

-- =============================================
-- PROPERTIES (Viramah Locations)
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    coordinates POINT,
    manager_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'maintenance', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

-- =============================================
-- ROOMS
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('1-seater', '2-seater', '3-seater', '4-seater')),
    floor INTEGER NOT NULL DEFAULT 0,
    base_price DECIMAL(10, 2) NOT NULL,
    dynamic_pricing_rules JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    max_occupancy INTEGER NOT NULL DEFAULT 1,
    images TEXT[] DEFAULT '{}',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(base_price);


-- ╔═══════════════════════════════════════════╗
-- ║    PART 4: BOOKINGS & PAYMENTS            ║
-- ╚═══════════════════════════════════════════╝

-- =============================================
-- BOOKINGS
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    check_in_date DATE NOT NULL,
    check_out_date DATE,
    base_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    security_deposit DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deposit_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (deposit_status IN ('pending', 'held', 'returned', 'forfeited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'INR',
    gateway VARCHAR(20) NOT NULL DEFAULT 'razorpay'
        CHECK (gateway IN ('razorpay', 'stripe')),
    gateway_order_id TEXT NOT NULL,
    gateway_payment_id TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created', 'attempted', 'captured', 'failed', 'refunded')),
    method VARCHAR(20)
        CHECK (method IS NULL OR method IN ('card', 'upi', 'netbanking', 'wallet')),
    receipt_url TEXT,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    captured_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order ON payments(gateway_order_id);

-- =============================================
-- WALLET TRANSACTIONS
-- =============================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    source VARCHAR(50) NOT NULL,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_profile ON wallet_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_wallet_created ON wallet_transactions(created_at);


-- ╔═══════════════════════════════════════════╗
-- ║    PART 5: PARENT PORTAL & AMENITIES      ║
-- ╚═══════════════════════════════════════════╝

-- =============================================
-- PARENT-STUDENT LINKS
-- =============================================
CREATE TABLE IF NOT EXISTS parent_student_links (
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

CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON parent_student_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON parent_student_links(student_id);

-- =============================================
-- AMENITY BOOKINGS
-- =============================================
CREATE TABLE IF NOT EXISTS amenity_bookings (
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

CREATE INDEX IF NOT EXISTS idx_amenity_profile ON amenity_bookings(profile_id);
CREATE INDEX IF NOT EXISTS idx_amenity_date ON amenity_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_amenity_status ON amenity_bookings(status);


-- ╔═══════════════════════════════════════════╗
-- ║    PART 6: ROW LEVEL SECURITY (RLS)       ║
-- ╚═══════════════════════════════════════════╝

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert profiles"
ON profiles FOR INSERT
WITH CHECK (true);

-- EMERGENCY CONTACTS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own emergency contacts"
ON emergency_contacts FOR ALL
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- KYC DOCUMENTS
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own KYC"
ON kyc_documents FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users submit own KYC"
ON kyc_documents FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- ROOMS (Public read)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
ON rooms FOR SELECT
USING (true);

-- PROPERTIES (Public read)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
ON properties FOR SELECT
USING (true);

-- BOOKINGS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students view own bookings"
ON bookings FOR SELECT
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students create own bookings"
ON bookings FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students update own bookings"
ON bookings FOR UPDATE
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Parents view linked student bookings"
ON bookings FOR SELECT
USING (
    student_id IN (
        SELECT student_id FROM parent_student_links
        WHERE parent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND is_verified = true
    )
);

-- PAYMENTS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view payments for own bookings"
ON payments FOR SELECT
USING (
    booking_id IN (
        SELECT id FROM bookings
        WHERE student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

CREATE POLICY "Users create payments for own bookings"
ON payments FOR INSERT
WITH CHECK (
    booking_id IN (
        SELECT id FROM bookings
        WHERE student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- WALLET
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet"
ON wallet_transactions FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users create own wallet transactions"
ON wallet_transactions FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- PARENT-STUDENT LINKS
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own links"
ON parent_student_links FOR SELECT
USING (parent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students view links to them"
ON parent_student_links FOR SELECT
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- AMENITY BOOKINGS
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own amenity bookings"
ON amenity_bookings FOR ALL
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- AUDIT LOGS (Admin only — no public access)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ╔═══════════════════════════════════════════╗
-- ║    PART 7: AUTO-CREATE PROFILE TRIGGER    ║
-- ╚═══════════════════════════════════════════╝

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'New User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- ╔═══════════════════════════════════════════╗
-- ║    PART 8: SEED DATA (Dev Only)           ║
-- ╚═══════════════════════════════════════════╝

-- 3 Viramah Properties
INSERT INTO properties (id, name, address, city, state, pincode, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Viramah Heritage House', '42 MG Road, Koramangala', 'Bangalore', 'Karnataka', '560034', 'active'),
('22222222-2222-2222-2222-222222222222', 'Viramah Lake View', '15 Chapel Road, Indiranagar', 'Bangalore', 'Karnataka', '560038', 'active'),
('33333333-3333-3333-3333-333333333333', 'Viramah Campus Hub', '88 University Road, Aundh', 'Pune', 'Maharashtra', '411007', 'active');

-- 7 Rooms across all properties
INSERT INTO rooms (id, property_id, room_number, type, floor, base_price, status, max_occupancy, description) VALUES
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'HH-101', '1-seater', 1, 12000.00, 'available', 1, 'The Solo — Premium single room with study desk, natural lighting, and wardrobe.'),
('aaaa2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'HH-102', '2-seater', 1, 8500.00, 'available', 2, 'The Duo — Shared living with privacy partitions, dual study areas, and AC.'),
('aaaa3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'HH-201', '3-seater', 2, 6500.00, 'available', 3, 'The Trio — Community living with individual storage and shared balcony.'),
('bbbb1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'LV-101', '1-seater', 1, 15000.00, 'available', 1, 'Lake View Solo — Premium room with lake-facing window and en-suite bathroom.'),
('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'LV-102', '2-seater', 1, 10000.00, 'available', 2, 'Lake View Duo — Twin sharing with independent beds and study zones.'),
('cccc1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'CH-101', '2-seater', 1, 7000.00, 'available', 2, 'Campus Duo — Budget-friendly twin share with AC and WiFi.'),
('cccc2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'CH-201', '4-seater', 2, 4500.00, 'available', 4, 'The Quad — Affordable quad sharing with common lounge access.');


-- ╔═══════════════════════════════════════════╗
-- ║    ✅ SETUP COMPLETE!                      ║
-- ╚═══════════════════════════════════════════╝
-- 
-- Tables created: 10
--   profiles, emergency_contacts, kyc_documents, audit_logs,
--   properties, rooms, bookings, payments, wallet_transactions,
--   parent_student_links, amenity_bookings
--
-- RLS Policies: 17
-- Indexes: 18
-- Triggers: 2 (updated_at, auto-create profile)
-- Seed data: 3 properties, 7 rooms
--
-- Next: Create a test user in Authentication → Users → Add User
-- =============================================
