'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithEmail(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Get user role from database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication failed' }
    }

    const { data: dbUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!dbUser) {
        return { error: 'User profile not found. Please sign up first.' }
    }

    // Redirect based on role
    const redirectPath = dbUser.role === 'parent'
        ? '/parent/dashboard'
        : dbUser.role === 'admin'
            ? '/admin/dashboard'
            : '/student/dashboard'

    redirect(redirectPath)
}

export async function signUpWithEmail(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = (formData.get('role') as string) || 'student'

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Sign up failed' }
    }

    // Create user record in our users table
    const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: authData.user.email!,
        role: role,
    })

    if (dbError) {
        return { error: `Account created but profile setup failed: ${dbError.message}` }
    }

    // Create role-specific profile
    if (role === 'student') {
        await supabase.from('student_profiles').insert({ id: authData.user.id })
        await supabase.from('wallets').insert({ id: authData.user.id })
    } else if (role === 'parent') {
        await supabase.from('parent_profiles').insert({ id: authData.user.id })
    }

    // Redirect based on role
    if (role === 'student') {
        redirect('/user-onboarding/step-1')
    } else {
        redirect('/parent/dashboard')
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }

    return { error: 'Failed to initiate Google sign-in' }
}
