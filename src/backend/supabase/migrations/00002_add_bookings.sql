-- =============================================
-- VIRAMAH: Properties & Rooms + Bookings
-- Migration: 00002_add_bookings.sql
-- Description: Properties, rooms, bookings, payments, wallet
-- =============================================

-- =============================================
-- PROPERTIES (Viramah Locations)
-- =============================================
CREATE TABLE properties (
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

CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);

-- =============================================
-- ROOMS
-- =============================================
CREATE TABLE rooms (
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

CREATE INDEX idx_rooms_property ON rooms(property_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_price ON rooms(base_price);

-- =============================================
-- BOOKINGS
-- =============================================
CREATE TABLE bookings (
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

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE payments (
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

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_gateway_order ON payments(gateway_order_id);

-- =============================================
-- WALLET TRANSACTIONS
-- =============================================
CREATE TABLE wallet_transactions (
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

CREATE INDEX idx_wallet_profile ON wallet_transactions(profile_id);
CREATE INDEX idx_wallet_created ON wallet_transactions(created_at);
