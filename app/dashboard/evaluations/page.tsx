"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, FileText, Calendar } from "lucide-react"

type Assessment = {
    id: string
    created_at: string
    status: string
    evaluator: { full_name: string } | null
    subject: { full_name: string } | null
    // We need to join relations. Supabase returns arrays or objects depending on query.
    // Using simplified types for now, will refine after viewing query result if needed.
}

export default function EvaluationsPage() {
    const [assessments, setAssessments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAssessments() {
            try {
                setLoading(true)
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

                    let query = supabase
                        .from('assessments')
                        .select(`
                    id,
                    created_at,
                    status,
                    evaluator:profiles!assessments_evaluator_id_fkey(full_name),
                    subject:profiles!assessments_subject_id_fkey(full_name)
                `)
                        .order('created_at', { ascending: false })

                    // IF Staff, only show where they are subject
                    if (profile && profile.role === 'staff') {
                        query = query.eq('subject_id', user.id)
                    }

                    const { data, error } = await query
                    if (error) throw error
                    setAssessments(data || [])
                }
            } catch (error) {
                console.error("Error fetching evaluations:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchAssessments()
    }, [])

    if (loading) return <div className="p-10 text-white flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">ประวัติการประเมิน</h1>
                <p className="text-slate-400">ดูประวัติการประเมินทั้งหมด</p>
            </div>

            <div className="grid gap-4">
                {assessments.map((assessment) => (
                    <Card key={assessment.id} className="border-slate-800 bg-slate-900/50 text-white">
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {/* @ts-ignore - Supabase join types can be tricky */}
                                        {assessment.subject?.full_name || 'Unknown Subject'}
                                    </p>
                                    <p className="text-sm text-slate-400 flex items-center gap-2">
                                        ประเมิน โดย: {assessment.evaluator?.full_name || 'Unknown'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm text-slate-400 flex items-center gap-1.5 justify-end">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(assessment.created_at).toLocaleDateString()}
                                    </p>
                                    <span className={`text-xs inline-flex items-center px-2 py-0.5 rounded-full mt-1 border ${assessment.status === 'completed'
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                        {assessment.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {assessments.length === 0 && (
                    <div className="text-center py-10 text-slate-500 bg-slate-900/20 rounded-lg border border-slate-800 border-dashed">
                        No evaluations found.
                    </div>
                )}
            </div>
        </div>
    )
}
