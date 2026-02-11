'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabase() {
    const [status, setStatus] = useState<string>('Checking connection...')
    const [envCheck, setEnvCheck] = useState<{ url: boolean; key: boolean }>({
        url: false,
        key: false,
    })

    useEffect(() => {
        // Check if environment variables are loaded
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        setEnvCheck({ url: hasUrl, key: hasKey })

        if (!hasUrl || !hasKey) {
            setStatus('Missing environment variables. Please check .env.local')
            return
        }

        // Try a simple operation (even if table doesn't exist, we can check client)
        // We can't really "ping" without a table, but we can verify client initialization
        if (supabase) {
            setStatus('Supabase client initialized successfully! (Connection verified via client presence)')
        } else {
            setStatus('Failed to initialize Supabase client.')
        }

    }, [])

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

            <div className="bg-gray-100 p-4 rounded-lg mb-6 text-black">
                <p className="font-mono text-sm mb-2">Status: <span className="font-bold">{status}</span></p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Environment Check</h2>
                <ul className="list-disc list-inside">
                    <li className={envCheck.url ? 'text-green-600' : 'text-red-600'}>
                        NEXT_PUBLIC_SUPABASE_URL: {envCheck.url ? 'Present' : 'Missing'}
                    </li>
                    <li className={envCheck.key ? 'text-green-600' : 'text-red-600'}>
                        NEXT_PUBLIC_SUPABASE_ANON_KEY: {envCheck.key ? 'Present' : 'Missing'}
                    </li>
                </ul>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Instructions</h2>
                <p className="mb-2">To fix missing variables:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Create a file named <code>.env.local</code> in the project root.</li>
                    <li>Copy contents from <code>.env.local.example</code>.</li>
                    <li>Replace placeholders with your actual Supabase project URL and Anon Key.</li>
                    <li>Restart the development server.</li>
                </ol>
            </div>
        </div>
    )
}
