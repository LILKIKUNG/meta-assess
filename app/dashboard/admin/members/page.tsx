import { createClient } from "@/lib/supabase-server"
import { requireAdmin } from "@/lib/admin-auth"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MembersClient } from "./members-client"

export default async function MembersPage() {
    // 1. Security Check (Server-Side)
    await requireAdmin()

    const supabase = createClient()

    // 2. Fetch Data
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    console.log('--- RAW DATA FROM DB ---')
    console.log(JSON.stringify(profiles, null, 2))
    console.log('--- END RAW DATA ---')

    if (error) {
        console.error("Error fetching profiles:", error)
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">จัดการบุคลากร</h1>
                    <p className="text-slate-400">เพิ่ม ลบ แก้ไข ข้อมูลสมาชิกในระบบ</p>
                </div>
            </div>

            <MembersClient initialProfiles={profiles || []} />
        </div>
    )
}
