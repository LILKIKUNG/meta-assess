"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Database, Users, LogOut, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const [profile, setProfile] = useState<{ full_name: string, role: string } | null>(null)

    useEffect(() => {
        const getProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
                if (data) setProfile(data)
            }
        }
        getProfile()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push("/login")
    }

    const navItems = [
        {
            title: "ภาพรวม",
            href: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "จัดการเกณฑ์ประเมิน",
            href: "/dashboard/admin/criteria",
            icon: Database,
        },
        {
            title: "จัดการสมาชิก",
            href: "/dashboard/admin/members",
            icon: Users,
        },
        {
            title: "ตรวจสอบการประเมิน",
            href: "/dashboard/evaluations",
            icon: ClipboardList,
        },
        {
            title: "บุคลากร",
            href: "/dashboard/users",
            icon: Users,
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <div className="flex items-center gap-2.5 font-bold text-lg text-white">
                        <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                            <Activity className="h-4 w-4" />
                        </div>
                        <span>ระบบประเมิน</span>
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {navItems.filter(item => {
                        if (item.href.includes('admin') && profile?.role !== 'admin') return false
                        return true
                    }).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-blue-600/10 text-blue-500"
                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-800 bg-slate-900/50 mb-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Loading...'}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{profile?.role || ''}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {/* Mobile Header */}
                <header className="h-16 border-b border-slate-800 flex items-center px-6 md:hidden bg-slate-950">
                    <div className="flex items-center gap-2.5 font-bold text-lg text-white">
                        <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                            <Activity className="h-4 w-4" />
                        </div>
                        <span>ระบบประเมินบุคลากร</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-950 text-slate-50">
                    {children}
                </main>
            </div>
        </div>
    )
}
