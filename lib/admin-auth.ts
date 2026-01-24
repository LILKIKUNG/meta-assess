import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Strict Check: Verify role from Database (Profiles table), NOT just Metadata
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role ? profile.role.toLowerCase() : ''

    if (error || !profile || role !== 'admin') {
        console.error("Unauthorized access attempt by:", user.id, "Role:", role)
        redirect("/dashboard")
    }

    return user
}
