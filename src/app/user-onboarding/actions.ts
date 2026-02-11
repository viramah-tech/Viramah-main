'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ===================== STEP 1: KYC =====================

export async function saveKYCData(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const fullName = formData.get('fullName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const idType = formData.get('idType') as string
    const idNumber = formData.get('idNumber') as string

    // Split full name into first/last
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const { error } = await supabase
        .from('student_profiles')
        .update({
            first_name: firstName,
            last_name: lastName,
            dob: dateOfBirth || null,
            id_type: idType as 'aadhaar' | 'passport' | 'voter_id',
            id_number: idNumber || null,
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    redirect('/user-onboarding/step-2')
}

// ===================== STEP 1: File Upload =====================

export async function uploadIDDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated', path: null }

    const file = formData.get('file') as File
    const side = formData.get('side') as string // 'front' or 'back'

    if (!file) return { error: 'No file provided', path: null }

    const ext = file.name.split('.').pop()
    const filePath = `${user.id}/id-${side}.${ext}`

    const { error } = await supabase.storage
        .from('id-documents')
        .upload(filePath, file, { upsert: true })

    if (error) return { error: error.message, path: null }

    // Update profile with document path (use front side as primary)
    if (side === 'front') {
        await supabase
            .from('student_profiles')
            .update({ id_document_path: filePath })
            .eq('id', user.id)
    }

    return { error: null, path: filePath }
}

// ===================== STEP 2: Emergency Contact =====================

export async function saveEmergencyContact(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const name = formData.get('emergencyName') as string
    const phone = formData.get('emergencyPhone') as string
    const relation = formData.get('emergencyRelation') as string

    if (!name || !phone) return { error: 'Name and phone are required' }

    // Upsert emergency contact (delete old + insert new)
    await supabase
        .from('emergency_contacts')
        .delete()
        .eq('student_id', user.id)

    const { error } = await supabase
        .from('emergency_contacts')
        .insert({
            student_id: user.id,
            name,
            phone,
            relation: relation || null,
        })

    if (error) return { error: error.message }

    redirect('/user-onboarding/step-3')
}

// ===================== STEP 3: Room + Mess Selection =====================

export async function saveRoomSelection(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const roomId = formData.get('roomId') as string
    const messPackageId = formData.get('messPackageId') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string) || 0

    if (!roomId) return { error: 'No room selected' }

    // Cancel any existing requested booking
    await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('student_id', user.id)
        .eq('status', 'requested')

    // Create new booking
    const { error } = await supabase
        .from('bookings')
        .insert({
            student_id: user.id,
            room_id: parseInt(roomId),
            mess_package_id: messPackageId ? parseInt(messPackageId) : null,
            start_date: new Date().toISOString().split('T')[0],
            total_amount: totalAmount,
            status: 'requested',
        })

    if (error) return { error: error.message }

    redirect('/user-onboarding/step-4')
}

// ===================== STEP 4: Preferences =====================

export async function savePreferences(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const dietary = formData.get('dietary') as string
    const sleep = formData.get('sleep') as string
    const noise = formData.get('noise') as string

    const { error } = await supabase
        .from('student_profiles')
        .update({
            dietary_preference: dietary as 'veg' | 'non-veg' | 'vegan' || null,
            sleep_schedule: sleep as 'early' | 'late' | 'flexible' || null,
            noise_level: noise as 'quiet' | 'moderate' | 'social' || null,
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    redirect('/user-onboarding/confirm')
}

// ===================== CONFIRM: Finalize Onboarding =====================

export async function finalizeOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Mark onboarding as complete
    const { error } = await supabase
        .from('student_profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

    if (error) return { error: error.message }

    // Log the activity
    await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'onboarding_completed',
        details: { completed_at: new Date().toISOString() },
    })

    redirect('/student/dashboard')
}

// ===================== HELPERS =====================

export async function getOnboardingData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const [profileRes, contactRes, bookingRes] = await Promise.all([
        supabase
            .from('student_profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
        supabase
            .from('emergency_contacts')
            .select('*')
            .eq('student_id', user.id)
            .limit(1)
            .single(),
        supabase
            .from('bookings')
            .select('*, rooms(*), mess_packages(*)')
            .eq('student_id', user.id)
            .eq('status', 'requested')
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
    ])

    return {
        profile: profileRes.data,
        emergencyContact: contactRes.data,
        booking: bookingRes.data,
    }
}
