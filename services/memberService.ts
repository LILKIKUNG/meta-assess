import { createAdminClient } from "@/lib/supabase-admin"
import { Role } from "@/lib/constants"

export type CreateMemberData = {
    email: string
    password: string
    fullName: string
    role: Role
    department: string
}

export type UpdateMemberData = {
    fullName: string
    role: Role
    department: string | null
    password?: string
}

export async function createMember(data: CreateMemberData) {
    const supabaseAdmin = createAdminClient()
    const { email, password, fullName, role, department } = data

    // 1. Create Auth User
    console.log("[createMember] 1. Creating Auth User...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, role, department }
    })

    if (authError) {
        console.error("[createMember] Auth Error:", authError)
        throw authError
    }

    if (!authData.user?.id) {
        console.error("[createMember] No User ID returned!")
        throw new Error("Failed to create user: No ID returned")
    }

    const userId = authData.user.id
    console.log("[createMember] 2. Auth Success. User ID:", userId)

    // 2. Create Profile
    const profilePayload = {
        id: userId,
        full_name: fullName,
        role,
        department
    }
    console.log('[createMember] DATA TO INSERT:', JSON.stringify(profilePayload, null, 2))

    const { error: profileError } = await supabaseAdmin
        .from('profiles') // Ensure this matches existing table name
        .insert(profilePayload)
        .select()
        .single()

    if (profileError) {
        console.error("[createMember] Profile Insert Failed:", profileError)
        // Rollback Auth User
        await supabaseAdmin.auth.admin.deleteUser(userId)
        throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    console.log("[createMember] 3. Profile Created Successfully.")
    return { success: true, userId, profile: profilePayload }
}

export async function updateMember(id: string, data: UpdateMemberData) {
    const supabaseAdmin = createAdminClient()
    const { fullName, role, department, password } = data

    // 1. Update Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name: fullName,
            role,
            department
        })
        .eq('id', id)

    if (profileError) throw profileError

    // 2. Update Auth (if password provided)
    if (password && password.trim() !== "") {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            password: password
        })
        if (authError) throw authError
    }

    // Update metadata as well to keep in sync
    await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: { full_name: fullName, role, department }
    })

    return { success: true }
}

export async function deleteMember(id: string) {
    const supabaseAdmin = createAdminClient()

    // Delete from Auth (Cascade triggers deletion in public.profiles via DB foreign key usually, 
    // but explicit delete is also fine if configured that way. Code assumed Cascade or Auth-first)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) throw error

    return { success: true }
}
