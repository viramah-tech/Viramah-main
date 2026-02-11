// TypeScript types matching the Supabase database schema
// These provide type safety when querying with supabase-js

export type UserRole = 'student' | 'parent' | 'admin'

// ==================== TABLE TYPES ====================

export interface DbUser {
    id: string // UUID
    email: string
    role: UserRole
    created_at: string
    updated_at: string
}

export interface DbStudentProfile {
    id: string // UUID, references users.id
    first_name: string | null
    last_name: string | null
    dob: string | null // ISO date
    phone: string | null
    address: string | null
    verified: boolean
    id_type: 'aadhaar' | 'passport' | 'voter_id' | null
    id_number: string | null
    id_document_path: string | null
    photo_path: string | null
    dietary_preference: 'veg' | 'non-veg' | 'vegan' | null
    sleep_schedule: 'early' | 'late' | 'flexible' | null
    noise_level: 'quiet' | 'moderate' | 'social' | null
    onboarding_completed: boolean
    created_at: string
    updated_at: string
}

export interface DbParentProfile {
    id: string // UUID, references users.id
    full_name: string | null
    phone: string | null
    created_at: string
    updated_at: string
}

export interface DbEmergencyContact {
    id: number
    student_id: string // UUID
    name: string
    relation: string | null
    phone: string
    email: string | null
    created_at: string
}

export interface DbParentStudentLink {
    id: number
    parent_id: string // UUID
    student_id: string // UUID
    relationship: string | null
    created_at: string
}

export interface DbRoom {
    id: number
    name: string
    type: '1-seater' | '2-seater' | '3-seater' | null
    capacity: number
    description: string | null
    location: string | null
    features: Record<string, unknown>
    amenities: string[]
    images: string[]
    price_per_month: number
    is_available: boolean
    created_at: string
    updated_at: string
}

export interface DbMessPackage {
    id: number
    name: string
    description: string | null
    price: number
    is_active: boolean
    created_at: string
}

export interface DbBooking {
    id: number
    student_id: string // UUID
    room_id: number | null
    mess_package_id: number | null
    start_date: string // ISO date
    end_date: string | null
    total_amount: number
    status: 'requested' | 'confirmed' | 'cancelled'
    created_at: string
    updated_at: string
}

export interface DbWallet {
    id: string // UUID, references users.id
    balance: number
    updated_at: string
}

export interface DbTransaction {
    id: number
    wallet_id: string // UUID
    type: 'topup' | 'payment' | 'refund'
    amount: number
    description: string | null
    created_at: string
}

export interface DbPayment {
    id: number
    user_id: string // UUID
    booking_id: number | null
    amount: number
    provider: string | null
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    metadata: Record<string, unknown>
    created_at: string
}

export interface DbVisitSlot {
    id: number
    slot_start: string // ISO datetime
    slot_end: string // ISO datetime
    capacity: number
    created_at: string
}

export interface DbVisitRequest {
    id: number
    student_id: string // UUID
    guest_name: string
    guest_relation: string | null
    visit_date: string // ISO date
    slot_id: number | null
    status: 'pending' | 'approved' | 'declined'
    created_at: string
    updated_at: string
}

export interface DbNotification {
    id: number
    user_id: string // UUID
    type: string | null
    title: string | null
    message: string
    is_read: boolean
    created_at: string
}

export interface DbActivityLog {
    id: number
    user_id: string // UUID
    action: string
    details: Record<string, unknown>
    created_at: string
}

// ==================== DATABASE SCHEMA MAP ====================
// This maps table names to their types for use with supabase-js

export interface Database {
    public: {
        Tables: {
            users: {
                Row: DbUser
                Insert: Omit<DbUser, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
                Update: Partial<Omit<DbUser, 'id'>>
            }
            student_profiles: {
                Row: DbStudentProfile
                Insert: Partial<DbStudentProfile> & { id: string }
                Update: Partial<Omit<DbStudentProfile, 'id'>>
            }
            parent_profiles: {
                Row: DbParentProfile
                Insert: Partial<DbParentProfile> & { id: string }
                Update: Partial<Omit<DbParentProfile, 'id'>>
            }
            emergency_contacts: {
                Row: DbEmergencyContact
                Insert: Omit<DbEmergencyContact, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbEmergencyContact, 'id'>>
            }
            parent_student_links: {
                Row: DbParentStudentLink
                Insert: Omit<DbParentStudentLink, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbParentStudentLink, 'id'>>
            }
            rooms: {
                Row: DbRoom
                Insert: Omit<DbRoom, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
                Update: Partial<Omit<DbRoom, 'id'>>
            }
            mess_packages: {
                Row: DbMessPackage
                Insert: Omit<DbMessPackage, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbMessPackage, 'id'>>
            }
            bookings: {
                Row: DbBooking
                Insert: Omit<DbBooking, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
                Update: Partial<Omit<DbBooking, 'id'>>
            }
            wallets: {
                Row: DbWallet
                Insert: Partial<DbWallet> & { id: string }
                Update: Partial<Omit<DbWallet, 'id'>>
            }
            transactions: {
                Row: DbTransaction
                Insert: Omit<DbTransaction, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbTransaction, 'id'>>
            }
            payments: {
                Row: DbPayment
                Insert: Omit<DbPayment, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbPayment, 'id'>>
            }
            visit_slots: {
                Row: DbVisitSlot
                Insert: Omit<DbVisitSlot, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbVisitSlot, 'id'>>
            }
            visit_requests: {
                Row: DbVisitRequest
                Insert: Omit<DbVisitRequest, 'id' | 'created_at' | 'updated_at'> & { id?: number; created_at?: string; updated_at?: string }
                Update: Partial<Omit<DbVisitRequest, 'id'>>
            }
            notifications: {
                Row: DbNotification
                Insert: Omit<DbNotification, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbNotification, 'id'>>
            }
            activity_logs: {
                Row: DbActivityLog
                Insert: Omit<DbActivityLog, 'id' | 'created_at'> & { id?: number; created_at?: string }
                Update: Partial<Omit<DbActivityLog, 'id'>>
            }
        }
    }
}
