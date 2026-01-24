"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function TestPublicData() {
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<any>(null)
    const [authStatus, setAuthStatus] = useState<string>("Checking...")

    useEffect(() => {
        async function check() {
            const supabase = createClient()

            // 1. Check Auth
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (user) {
                setAuthStatus(`Logged in as: ${user.email}`)
                console.log("TestPage: User found", user)
            } else {
                setAuthStatus(`Not logged in. Error: ${authError?.message || 'No session'}`)
                console.log("TestPage: No user", authError)
            }

            // 2. Fetch Data (Criteria) - Should verify RLS
            // Note: If RLS is set to 'admin only', execution might fail if not admin.
            // But if we want to test PUBLIC access, we'd need a public table.
            // For now, let's try fetch criteria and see if it returns [] or error
            const { data: criteria, error: dbError } = await supabase
                .from('criteria')
                .select('*')

            if (dbError) {
                setError(dbError)
            } else {
                setData(criteria)
            }
        }

        check()
    }, [])

    return (
        <div className="p-10 bg-black text-white min-h-screen font-mono">
            <h1 className="text-xl font-bold mb-4">Debug Console</h1>

            <div className="mb-6 border p-4 border-blue-800 rounded">
                <h2 className="text-blue-400 font-bold">1. Auth Status</h2>
                <p>{authStatus}</p>
            </div>

            <div className="mb-6 border p-4 border-green-800 rounded">
                <h2 className="text-green-400 font-bold">2. Data Fetch (Criteria Table)</h2>
                {error && <p className="text-red-500">Error: {JSON.stringify(error, null, 2)}</p>}
                {data && (
                    <pre className="text-xs bg-gray-900 p-2 overflow-auto max-h-60">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                )}
            </div>

            <div className="text-gray-500 text-sm">
                If Auth is "Not logged in" but you just logged in, then Cookies are not persisting.
            </div>
        </div>
    )
}
