"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { X, AlertCircle } from "lucide-react"

interface EvaluationDetailModalProps {
    assessmentId: string | null
    isOpen: boolean
    onClose: () => void
}

type ScoreDetail = {
    score_id: string
    score: number
    criteria_title: string
    criteria_weight: number
    criteria_desc: string
}

type AssessmentDetail = {
    id: string
    evaluator_name: string
    subject_name: string
    status: string
    created_at: string
}

export function EvaluationDetailModal({ assessmentId, isOpen, onClose }: EvaluationDetailModalProps) {
    const [loading, setLoading] = useState(true)
    const [scores, setScores] = useState<ScoreDetail[]>([])
    const [details, setDetails] = useState<AssessmentDetail | null>(null)
    // const [unauthorized, setUnauthorized] = useState(false) // Removed to use direct close logic
    const { toast } = useToast()

    useEffect(() => {
        if (!isOpen || !assessmentId) {
            setScores([])
            setDetails(null)
            setLoading(true)
            return
        }

        const fetchData = async () => {
            setLoading(true)
            // setUnauthorized(false)
            try {
                const supabase = createClient()

                // 1. Security Check: Validate Current User
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error("Unauthorized: No session found")

                // Get User Role
                const { data: currentUserProfile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                // 2. Fetch Assessment Basic Info & Participants
                const { data: assessment, error: assessmentError } = await supabase
                    .from('assessments')
                    .select(`
                        id, 
                        status, 
                        created_at, 
                        evaluator_id, 
                        subject_id,
                        evaluator:profiles!assessments_evaluator_id_fkey(full_name),
                        subject:profiles!assessments_subject_id_fkey(full_name)
                    `)
                    .eq('id', assessmentId)
                    .single()

                if (assessmentError || !assessment) throw new Error("Assessment not found")

                // 3. Security Check: Logic Validation
                const isAdmin = currentUserProfile?.role === 'admin'
                const isSupervisor = currentUserProfile?.role === 'supervisor'
                const isOwner = user.id === assessment.subject_id
                const isEvaluator = user.id === assessment.evaluator_id

                if (!isAdmin && !isSupervisor && !isOwner && !isEvaluator) {
                    throw new Error("Access Denied: You do not have permission to view this evaluation.")
                }

                // Map Details
                setDetails({
                    id: assessment.id,
                    // @ts-ignore
                    evaluator_name: assessment.evaluator?.full_name || 'Unknown',
                    // @ts-ignore
                    subject_name: assessment.subject?.full_name || 'Unknown',
                    status: assessment.status,
                    created_at: assessment.created_at
                })

                // 4. Fetch Scores (Breakdown)
                const { data: scoreData, error: scoreError } = await supabase
                    .from('scores')
                    .select(`
                        id,
                        score,
                        criteria:criterion_id (
                            title,
                            weight,
                            description
                        )
                    `)
                    .eq('assessment_id', assessmentId)

                if (scoreError) throw scoreError

                const mappedScores = scoreData.map((s: any) => ({
                    score_id: s.id,
                    score: s.score,
                    criteria_title: s.criteria?.title || 'Unknown Criteria',
                    criteria_weight: s.criteria?.weight || 0,
                    criteria_desc: s.criteria?.description || ''
                }))

                setScores(mappedScores)

            } catch (error: any) {
                console.error("Detail Fetch Error:", error)
                toast({
                    variant: "destructive",
                    title: "Access Denied or Error",
                    description: error.message || "Failed to load details.",
                })
                onClose() // Force close on error/security fail
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [isOpen, assessmentId, onClose, toast])

    // Helper for Progress Color
    const getProgressColor = (score: number) => {
        if (score >= 16) return "bg-emerald-500" // Excellent (>= 80%)
        if (score >= 10) return "bg-orange-500"    // Good/Fair (>= 50%)
        return "bg-red-500"                   // Poor (< 50%)
        // Implementation note: Shadcn Progress component usually uses a single indicator color class. 
        // We might need to override it via className or use inline styles if the component structure is strict.
        // Assuming standard tailwind Override works on the indicator if we pass strict class.
    }

    const totalScore = scores.reduce((sum, item) => sum + item.score, 0)

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl bg-white border-slate-200 text-slate-900 max-h-[85vh] p-0 gap-0 flex flex-col overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-white pr-12">
                    <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span>ผลการประเมิน</span>
                            {!loading && scores.length > 0 && (
                                <span className="text-base font-normal text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                    คะแนนรวม: {totalScore} / 100
                                </span>
                            )}
                        </div>
                        {!loading && details && (
                            <Badge variant={details.status === 'completed' ? 'default' : 'secondary'}
                                className={details.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : ''}>
                                {details.status}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        รายละเอียดคะแนนรายข้อ
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                    {loading ? (
                        <div className="space-y-6 py-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-32 bg-slate-100" />
                                <Skeleton className="h-5 w-24 bg-slate-100" />
                            </div>
                            <Skeleton className="h-px w-full bg-slate-200" />
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-48 bg-slate-100" />
                                        <Skeleton className="h-4 w-12 bg-slate-100" />
                                    </div>
                                    <Skeleton className="h-3 w-full bg-slate-100" />
                                </div>
                            ))}
                        </div>
                    ) : details ? (
                        <div className="space-y-6 py-4">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div>
                                    <p className="text-slate-500 mb-1">ผู้ถูกประเมิน</p>
                                    <p className="font-medium text-slate-900 text-base">{details.subject_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 mb-1">ผู้ประเมิน</p>
                                    <p className="font-medium text-slate-900 text-base">{details.evaluator_name}</p>
                                </div>
                            </div>

                            {/* Scodes List */}
                            <div className="space-y-6">
                                {scores.length > 0 ? (
                                    scores.map((item) => (
                                        <div key={item.score_id} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h4 className="font-medium text-slate-700">{item.criteria_title}</h4>
                                                    {item.criteria_desc && <p className="text-xs text-slate-500">{item.criteria_desc}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-lg font-bold ${item.score >= 16 ? 'text-emerald-500' :
                                                        item.score >= 10 ? 'text-orange-500' :
                                                            'text-red-500'
                                                        }`}>{item.score}</span>
                                                    <span className="text-xs text-slate-500 ml-1">/ 20</span>
                                                </div>
                                            </div>
                                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-in-out ${getProgressColor(item.score)}`}
                                                    style={{ width: `${(item.score / 20) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        ยังไม่มีคะแนนบันทึก
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="p-6 pt-0 sm:justify-end bg-white">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="bg-slate-100 text-slate-900 hover:bg-slate-200 w-full sm:w-auto">
                            ปิด
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
