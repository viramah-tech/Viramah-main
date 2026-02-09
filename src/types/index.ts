// Type Definitions

// User roles
export type UserRole = 'student' | 'parent' | 'admin' | 'guest'

// User type
export interface User {
    id: string
    email: string
    name: string
    role: UserRole
    avatar?: string
    createdAt: Date
}

// Room type
export interface Room {
    id: string
    title: string
    type: '1-seater' | '2-seater' | '3-seater'
    price: number
    location: string
    available: boolean
    amenities: string[]
    images: string[]
}

// Booking type
export interface Booking {
    id: string
    userId: string
    roomId: string
    status: 'pending' | 'confirmed' | 'cancelled'
    startDate: Date
    endDate: Date
    totalAmount: number
}

// KYC type
export interface KYCData {
    step1: {
        fullName: string
        dateOfBirth: string
        idType: 'aadhaar' | 'passport' | 'voter_id'
        idNumber: string
    } | null
    step2: {
        emergencyContactName: string
        emergencyContactPhone: string
        emergencyContactRelation: string
    } | null
    step3: {
        dietaryPreference: 'veg' | 'non-veg' | 'vegan'
        sleepSchedule: 'early' | 'late' | 'flexible'
        noiseLevel: 'quiet' | 'moderate' | 'social'
    } | null
}
