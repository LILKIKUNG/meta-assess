"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import { Search, Mail, Shield, User, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserGridSkeleton } from "@/components/skeletons/UserGridSkeleton"
import { ErrorState } from "@/components/ui/error-state"
import { useToast } from "@/components/ui/use-toast"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Profile = {
    id: string
    full_name: string
    role: string
    department: string
    email?: string // Join with auth.users if possible, but RLS might restrict. 
    // For now, profiles usually don't have email unless we duplicated it.
    // We'll just show role/dept/name.
}

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
    const [showSkeleton, setShowSkeleton] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { toast } = useToast()
    const [userToReset, setUserToReset] = useState<{ id: string, name: string } | null>(null)

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        if (loading) {
            timeoutId = setTimeout(() => setShowSkeleton(true), 200)
        } else {
            setShowSkeleton(false)
        }

        return () => clearTimeout(timeoutId)
    }, [loading])

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                setError(null)
                const supabase = createClient()

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('full_name', { ascending: true })

                if (error) throw error
                if (data) setUsers(data)

                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
                    if (profile) setCurrentUserRole(profile.role)
                }

            } catch (error: any) {
                console.error('Error fetching users:', error)
                setError(error.message || "Failed to load employees.")
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    const confirmReset = async () => {
        if (!userToReset) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('assessments')
                .delete()
                .eq('subject_id', userToReset.id)

            if (error) throw error

            toast({
                title: "ล้างข้อมูลสำเร็จ",
                description: `ข้อมูลสมาชิก ${userToReset.name} ถูกล้างเรียบร้อยแล้ว`,
                className: "bg-emerald-500 text-white border-emerald-600"
            })
            setUserToReset(null)
        } catch (err: any) {
            console.error("Error resetting scores:", err)
            toast({
                title: "Error",
                description: err.message || "Failed to reset scores",
                variant: "destructive"
            })
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">รายชื่อพนักงาน</h1>
                    <p className="text-slate-400">จัดการและดูข้อมูลพนักงาน</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="ค้นหาพนักงาน..."
                        className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading && showSkeleton ? (
                <UserGridSkeleton />
            ) : error ? (
                <ErrorState
                    title="Could not load employees"
                    message={error}
                    onRetry={() => { setLoading(true); window.location.reload() }}
                />
            ) : !loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in zoom-in-95 duration-500">
                    {users.map((user) => (
                        <Card key={user.id} className="border-slate-800 bg-slate-900/50 text-white hover:bg-slate-900/80 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold border border-blue-600/30">
                                    {user.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <CardTitle className="text-base truncate">{user.full_name}</CardTitle>
                                    <CardDescription className="text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                                        {user.role === 'admin' ? <Shield className="h-3 w-3 text-amber-500" /> : <User className="h-3 w-3" />}
                                        {user.role}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-slate-400 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between">
                                        <span>แผนก:</span>
                                        <span className="text-white font-medium">{user.department || '-'}</span>
                                    </div>
                                    {/* Email is typically in auth.users, assume checking profile only for now */}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-2">
                                    {currentUserRole === 'admin' && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setUserToReset({ id: user.id, name: user.full_name })}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            ล้างประวัติคะแนน
                                        </Button>
                                    )}
                                    {(currentUserRole === 'admin' || currentUserRole === 'supervisor') && (
                                        <Link href={`/dashboard/evaluation/${user.id}`}>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white">ประเมิน</Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {users.length === 0 && !loading && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            No users found.
                        </div>
                    )}
                </div>
            ) : null}

            <AlertDialog open={!!userToReset} onOpenChange={(open: boolean) => !open && setUserToReset(null)}>
                <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>คุณแน่ใจใช่ไหมที่จะล้างประวัติ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            การกระทำนี้ไม่สามารถยกเลิกได้ ประวัติคะแนนทั้งหมดของ {userToReset?.name} จะถูกลบอย่างถาวร
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-slate-800 text-white hover:bg-slate-700 border-slate-700">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmReset} className="bg-red-600 text-white hover:bg-red-700">ยืนยัน</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

