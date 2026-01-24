"use server"

import { requireAdmin } from "@/lib/admin-auth"
import { revalidatePath } from "next/cache"
import { createMember, updateMember, deleteMember } from "@/services/memberService"
import { Role } from "@/lib/constants"

export async function createUser(formData: FormData) {
    // 1. Security Check
    try {
        await requireAdmin()
    } catch (e) {
        console.error("[CreateUser] unauthorized")
        throw e
    }

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const roleString = formData.get("role") as string
    const department = formData.get("department") as string

    if (!email || !password || !fullName || !roleString) {
        console.error("[CreateUser] Missing fields")
        throw new Error("Missing required fields")
    }

    // Cast or validate Role
    // Assuming the form provides valid role strings matching the Enum values
    const role = roleString as Role;

    try {
        await createMember({
            email,
            password,
            fullName,
            role,
            department
        })
        revalidatePath("/dashboard/admin/members")
        return { success: true }
    } catch (error) {
        // Log is already in service, but we can log top level if needed
        throw error
    }
}

export async function updateUser(id: string, formData: FormData) {
    await requireAdmin()

    const fullName = formData.get("fullName") as string
    const roleString = formData.get("role") as string
    const department = formData.get("department") as string
    const password = formData.get("password") as string

    const role = roleString as Role;

    try {
        await updateMember(id, {
            fullName,
            role,
            department: department || null, // Convert empty string to null if preferred, or keep as string
            password
        })
        revalidatePath("/dashboard/admin/members")
        return { success: true }
    } catch (error) {
        throw error
    }
}

export async function deleteUser(id: string) {
    await requireAdmin()

    try {
        await deleteMember(id)
        revalidatePath("/dashboard/admin/members")
        return { success: true }
    } catch (error) {
        throw error
    }
}
