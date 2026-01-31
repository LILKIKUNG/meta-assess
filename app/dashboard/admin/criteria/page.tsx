"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"

type Criterion = {
    id: string
    title: string
    weight: number
    description: string
}

export default function CriteriaPage() {
    const [criteria, setCriteria] = useState<Criterion[]>([])
    const [loading, setLoading] = useState(true)
    const [newTitle, setNewTitle] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const [criterionToDelete, setCriterionToDelete] = useState<string | null>(null)

    const fetchCriteria = async () => {
        try {
            const supabase = createClient()
            setLoading(true)
            const { data, error } = await supabase
                .from('criteria')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            if (data) setCriteria(data)
        } catch (error) {
            console.error('Error fetching criteria:', error)
            toast({
                variant: "destructive",
                title: "ไม่สามารถโหลดเกณฑ์",
                description: "เกิดข้อผิดพลาดในการดึงข้อมูล",
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCriteria()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTitle) return

        try {
            const supabase = createClient()
            setIsSubmitting(true)
            const { error } = await supabase
                .from('criteria')
                .insert([
                    {
                        title: newTitle,
                        weight: 0,
                        description: newDesc
                    }
                ])
                .select()

            if (error) throw error

            setNewTitle("")
            setNewDesc("")
            fetchCriteria() // Refresh list
            toast({
                title: "สำเร็จ",
                description: "เกณฑ์ถูกเพิ่มสำเร็จแล้ว",
                className: "bg-emerald-500 text-white"
            })
        } catch (error) {
            console.error('Error creating criterion:', error)
            toast({
                title: "ข้อผิดพลาด",
                description: "ไม่สามารถเพิ่มเกณฑ์ได้",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        if (!criterionToDelete) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('criteria')
                .delete()
                .eq('id', criterionToDelete)

            if (error) throw error

            setCriteria(criteria.filter(c => c.id !== criterionToDelete))
            toast({
                title: "Deleted",
                description: "เกณฑ์ถูกลบสำเร็จแล้ว",
                className: "bg-emerald-500 text-white"
            })
        } catch (error) {
            console.error('Error deleting criterion:', error)
            toast({
                title: "Error",
                description: "Failed to delete criterion",
                variant: "destructive"
            })
        } finally {
            setCriterionToDelete(null)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 text-slate-900">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900">เกณฑ์การประเมิน</h1>
                <p className="text-slate-500"></p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Create Form */}
                <Card className="border-slate-200 bg-white text-slate-900 h-fit">
                    <CardHeader>
                        <CardTitle>เพิ่มเกณฑ์</CardTitle>
                        <CardDescription className="text-slate-500">กำหนดตัวชี้วัดใหม่สำหรับการประเมินผล</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">หัวข้อ</label>
                                <Input
                                    placeholder="หัวข้อ"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600"
                                />
                            </div>


                            <div className="space-y-2">
                                <label className="text-sm font-medium">คำอธิบาย</label>
                                <Input
                                    placeholder=""
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600"
                                />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-500 text-white">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                เพิ่ม
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">เกณฑ์ที่มีอยู่</h3>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-[76px] w-full rounded-lg" />
                            ))}
                        </div>
                    ) : criteria.length === 0 ? (
                        <p className="text-slate-500 italic">ยังไม่มีเกณฑ์</p>
                    ) : (
                        criteria.map((item) => (
                            <div key={item.id} className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-slate-900">{item.title}</h4>
                                    </div>
                                    {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCriterionToDelete(item.id)}
                                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <AlertDialog open={!!criterionToDelete} onOpenChange={(open: boolean) => !open && setCriterionToDelete(null)}>
                <AlertDialogContent className="bg-white border-slate-200 text-slate-900">
                    <AlertDialogHeader>
                        <AlertDialogTitle>คุณแน่ใจว่าต้องลบเกณฑ์นี้หรือไม่</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500">
                            ไม่สามารถกู้คืนข้อมูลได้
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white text-slate-900 hover:bg-slate-100 border-slate-200">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">ลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
