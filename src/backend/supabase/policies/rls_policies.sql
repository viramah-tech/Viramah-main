-- =============================================
-- VIRAMAH: Row Level Security Policies
-- All tables MUST have RLS enabled
-- =============================================

-- =============================================
-- PROFILES RLS
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- EMERGENCY CONTACTS RLS
-- =============================================
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own emergency contacts"
ON emergency_contacts FOR ALL
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =============================================
-- KYC DOCUMENTS RLS
-- =============================================
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

-- Users can view/submit their own KYC
CREATE POLICY "Users view own KYC"
ON kyc_documents FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users submit own KYC"
ON kyc_documents FOR INSERT
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =============================================
-- ROOMS RLS (Public read)
-- =============================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available rooms"
ON rooms FOR SELECT
USING (true);

-- =============================================
-- PROPERTIES RLS (Public read)
-- =============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active properties"
ON properties FOR SELECT
USING (true);

-- =============================================
-- BOOKINGS RLS
-- =============================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Students see own bookings
CREATE POLICY "Students view own bookings"
ON bookings FOR SELECT
USING (
    student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Students create own bookings
CREATE POLICY "Students create own bookings"
ON bookings FOR INSERT
WITH CHECK (
    student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Students update own pending/confirmed bookings
CREATE POLICY "Students update own bookings"
ON bookings FOR UPDATE
USING (
    student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
);

-- Parents see linked students' bookings
CREATE POLICY "Parents view linked student bookings"
ON bookings FOR SELECT
USING (
    student_id IN (
        SELECT student_id FROM parent_student_links
        WHERE parent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND is_verified = true
    )
);

-- =============================================
-- PAYMENTS RLS
-- =============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view payments for own bookings"
ON payments FOR SELECT
USING (
    booking_id IN (
        SELECT id FROM bookings
        WHERE student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
);

-- =============================================
-- WALLET RLS
-- =============================================
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet"
ON wallet_transactions FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =============================================
-- PARENT-STUDENT LINKS RLS
-- =============================================
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own links"
ON parent_student_links FOR SELECT
USING (parent_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students view links to them"
ON parent_student_links FOR SELECT
USING (student_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =============================================
-- AUDIT LOGS RLS (Admin only)
-- =============================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- No public access — only service_role can read audit logs
