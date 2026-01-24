"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import { Role } from "@/lib/constants"

export async function registerStaff(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string

    if (!email || !password || !fullName) {
        return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" }
    }

    const supabase = createAdminClient()

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (authError) {
        console.error("Registration Auth Error:", authError)
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "ไม่สามารถสร้างผู้ใช้งานได้" }
    }

    // 2. Insert into Profiles with ROLE.STAFF
    // Using Admin Client ensures we bypass RLS for this initial setup
    const { error: profileError } = await supabase
        .from("profiles")
        .insert({
            id: authData.user.id,
            full_name: fullName,
            role: Role.STAFF, // Enforced Role
            created_at: new Date().toISOString(),
        })

    if (profileError) {
        console.error("Registration Profile Error:", profileError)
        // Optional: Delete auth user if profile creation fails? 
        // For now, return error.
        return { error: "สร้างโปรไฟล์ไม่สำเร็จ: " + profileError.message }
    }

    // Success
    return { success: true }
}
