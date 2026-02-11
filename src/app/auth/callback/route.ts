import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/student/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // After exchanging code, get the user and check their role
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Check if user exists in our users table
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (dbUser) {
                    // Redirect based on role
                    const redirectPath = dbUser.role === 'parent'
                        ? '/parent/dashboard'
                        : dbUser.role === 'admin'
                            ? '/admin/dashboard'
                            : '/student/dashboard'
                    return NextResponse.redirect(`${origin}${redirectPath}`)
                } else {
                    // New user — create entry and redirect to onboarding
                    // Default role is 'student', can be changed later
                    await supabase.from('users').insert({
                        id: user.id,
                        email: user.email!,
                        role: 'student',
                    })

                    await supabase.from('student_profiles').insert({
                        id: user.id,
                    })

                    // Create wallet for the student
                    await supabase.from('wallets').insert({
                        id: user.id,
                    })

                    return NextResponse.redirect(`${origin}/user-onboarding/step-1`)
                }
            }
        }
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
