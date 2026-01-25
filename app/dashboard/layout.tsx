"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, LayoutDashboard, Database, Users, LogOut, ClipboardList, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NavItems } from "./nav-items"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

                <div className="flex-1 py-6 px-4 overflow-y-auto">
                    <NavItems
                        items={navItems}
                        pathname={pathname}
                        role={profile?.role}
                    />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-800 bg-slate-900/50 mb-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            {profile ? (
                                <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
                            ) : (
                                <Skeleton className="h-4 w-32 mb-1" />
                            )}
                            {profile ? (
                                <p className="text-xs text-slate-500 truncate capitalize">{profile.role}</p>
                            ) : (
                                <Skeleton className="h-3 w-16" />
                            )}
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
                <header className="h-16 border-b border-slate-800 flex items-center px-6 md:hidden bg-slate-950 gap-4">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-white">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 bg-slate-950 border-r-slate-800 p-0 flex flex-col text-white">
                            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                                <div className="flex items-center gap-2.5 font-bold text-lg text-white">
                                    <div className="rounded-lg bg-blue-600 p-1.5 text-white">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <span>ระบบประเมิน</span>
                                </div>
                            </div>

                            <div className="flex-1 py-6 px-4 overflow-y-auto">
                                <NavItems
                                    items={navItems}
                                    pathname={pathname}
                                    role={profile?.role}
                                    onNavigate={() => setIsMobileMenuOpen(false)}
                                />
                            </div>

                            <div className="p-4 border-t border-slate-800">
                                <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-800 bg-slate-900/50 mb-4">
                                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                                        {profile?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        {profile ? (
                                            <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
                                        ) : (
                                            <Skeleton className="h-4 w-32 mb-1" />
                                        )}
                                        {profile ? (
                                            <p className="text-xs text-slate-500 truncate capitalize">{profile.role}</p>
                                        ) : (
                                            <Skeleton className="h-3 w-16" />
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20 gap-2"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false)
                                        handleLogout()
                                    }}
                                >
                                    <LogOut className="h-4 w-4" />
                                    ออกจากระบบ
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

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
