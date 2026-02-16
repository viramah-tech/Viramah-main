-- =============================================
-- VIRAMAH: Initial Schema Migration
-- Migration: 00001_initial_schema.sql
-- Description: Core tables — profiles, emergency_contacts, kyc_documents
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE profiles (
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

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =============================================
-- EMERGENCY CONTACTS
-- =============================================
CREATE TABLE emergency_contacts (
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
CREATE TABLE kyc_documents (
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

CREATE INDEX idx_kyc_profile ON kyc_documents(profile_id);
CREATE INDEX idx_kyc_status ON kyc_documents(verification_status);

-- =============================================
-- AUDIT LOGS
-- =============================================
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_record ON audit_logs(record_id);
CREATE INDEX idx_audit_performed_at ON audit_logs(performed_at);
