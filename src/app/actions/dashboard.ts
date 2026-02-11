'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ===================== WALLET =====================

export async function getWalletData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [walletRes, txRes] = await Promise.all([
        supabase.from('wallets').select('*').eq('id', user.id).single(),
        supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20),
    ])

    return {
        balance: walletRes.data?.balance ?? 0,
        transactions: txRes.data ?? [],
    }
}

export async function topUpWallet(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const amount = parseFloat(formData.get('amount') as string)
    if (!amount || amount <= 0) return { error: 'Invalid amount' }

    // Call the topup_wallet RPC function defined in migrations
    const { error } = await supabase.rpc('topup_wallet', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: `Wallet top-up: ₹${amount}`,
    })

    if (error) return { error: error.message }

    revalidatePath('/student/wallet')
    return { error: null }
}

// ===================== VISIT REQUESTS =====================

export async function getVisitRequests() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Check user role
    const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (dbUser?.role === 'parent') {
        // Parent sees visits they created
        const { data } = await supabase
            .from('visit_requests')
            .select('*')
            .eq('student_id', user.id) // Note: for parents, we need linked students
            .order('visit_date', { ascending: false })
            .limit(10)

        // Actually get linked students, then get visits
        const { data: links } = await supabase
            .from('parent_student_links')
            .select('student_id')
            .eq('parent_id', user.id)

        const studentIds = links?.map(l => l.student_id) ?? []
        if (studentIds.length === 0) return []

        const { data: visits } = await supabase
            .from('visit_requests')
            .select('*')
            .in('student_id', studentIds)
            .order('visit_date', { ascending: false })
            .limit(10)

        return visits ?? []
    }

    // Student sees their own visit requests
    const { data } = await supabase
        .from('visit_requests')
        .select('*')
        .eq('student_id', user.id)
        .order('visit_date', { ascending: false })
        .limit(10)

    return data ?? []
}

export async function scheduleVisit(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const visitDate = formData.get('visitDate') as string
    const guestName = formData.get('guestName') as string
    const guestRelation = formData.get('guestRelation') as string
    const purpose = formData.get('purpose') as string

    if (!visitDate || !guestName) return { error: 'Date and guest name are required' }

    // For parent role, we need to find the linked student
    const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    let studentId = user.id

    if (dbUser?.role === 'parent') {
        const { data: link } = await supabase
            .from('parent_student_links')
            .select('student_id')
            .eq('parent_id', user.id)
            .limit(1)
            .single()

        if (!link) return { error: 'No linked student found' }
        studentId = link.student_id
    }

    const { error } = await supabase
        .from('visit_requests')
        .insert({
            student_id: studentId,
            guest_name: guestName,
            guest_relation: guestRelation || null,
            visit_date: visitDate,
            status: 'pending',
        })

    if (error) return { error: error.message }

    // Notify the student
    await supabase.from('notifications').insert({
        user_id: studentId,
        type: 'visit',
        title: 'Visit Request',
        message: `${guestName} has requested to visit on ${visitDate}`,
    })

    revalidatePath('/parent/visit')
    return { error: null }
}

// ===================== PARENT DASHBOARD =====================

export async function getLinkedStudents() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id, relationship')
        .eq('parent_id', user.id)

    if (!links || links.length === 0) return []

    const studentIds = links.map(l => l.student_id)

    const { data: profiles } = await supabase
        .from('student_profiles')
        .select('id, first_name, last_name')
        .in('id', studentIds)

    const { data: bookings } = await supabase
        .from('bookings')
        .select('student_id, room_id, rooms(name, type), status')
        .in('student_id', studentIds)
        .in('status', ['requested', 'confirmed'])

    return (profiles ?? []).map(p => ({
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Student',
        relationship: links.find(l => l.student_id === p.id)?.relationship || 'Child',
        booking: bookings?.find(b => b.student_id === p.id) || null,
    }))
}

export async function getStudentActivityForParent() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: links } = await supabase
        .from('parent_student_links')
        .select('student_id')
        .eq('parent_id', user.id)

    if (!links || links.length === 0) return []

    const studentIds = links.map(l => l.student_id)

    const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .in('user_id', studentIds)
        .order('created_at', { ascending: false })
        .limit(10)

    return data ?? []
}

// ===================== NOTIFICATIONS =====================

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    return data ?? []
}

export async function markNotificationRead(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const notificationId = parseInt(formData.get('notificationId') as string)

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { error: null }
}

export async function markAllNotificationsRead() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) return { error: error.message }
    revalidatePath('/')
    return { error: null }
}
