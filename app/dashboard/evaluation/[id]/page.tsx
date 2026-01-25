"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type Criterion = {
    id: string
    title: string
    weight: number
    description: string
}

type Profile = {
    id: string
    full_name: string
    department: string
    role: string
}

export default function EvaluationPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [subject, setSubject] = useState<Profile | null>(null)
    const [criteria, setCriteria] = useState<Criterion[]>([])
    const [scores, setScores] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)
                const supabase = createClient()

                // 1. Fetch Subject (Person being evaluated)
                const { data: subjectData, error: subjectError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (subjectError) throw subjectError
                setSubject(subjectData)

                // 2. Fetch Criteria
                const { data: criteriaData, error: criteriaError } = await supabase
                    .from('criteria')
                    .select('*')
                    .order('weight', { ascending: false })

                if (criteriaError) throw criteriaError
                if (criteriaData) {
                    setCriteria(criteriaData)
                    // Initialize scores with 5 (midpoint) or 0
                    const initialScores: Record<string, number> = {}
                    criteriaData.forEach(c => {
                        initialScores[c.id] = 5
                    })
                    setScores(initialScores)
                }

            } catch (err: any) {
                console.error("Error fetching data:", err)
                setError(err.message)
                toast({
                    variant: "destructive",
                    title: "ไม่สามารถโหลดแบบประเมิน",
                    description: "ไม่พบข้อมูลผู้ถูกประเมิน หรือระบบมีปัญหา",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    const handleScoreChange = (id: string, value: number[]) => {
        setScores(prev => ({
            ...prev,
            [id]: value[0]
        }))
    }

    const handleSubmit = async () => {
        try {
            setSubmitting(true)
            const supabase = createClient()

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("You must be logged in to evaluate.")

            // 1. Create Assessment
            const { data: assessment, error: assessmentError } = await supabase
                .from('assessments')
                .insert({
                    evaluator_id: user.id,
                    subject_id: params.id,
                    status: 'completed'
                })
                .select()
                .single()

            if (assessmentError) throw assessmentError

            // 2. Create Scores
            const scoreInserts = criteria.map(c => ({
                assessment_id: assessment.id,
                criterion_id: c.id,
                score: scores[c.id]
            }))

            const { error: scoreError } = await supabase
                .from('scores')
                .insert(scoreInserts)

            if (scoreError) throw scoreError



            toast({
                title: "ส่งแบบประเมินสำเร็จ",
                description: "ข้อมูลสมาชิกถูกบันทึกเรียบร้อยแล้ว",
                className: "bg-emerald-500 text-white border-emerald-600"
            })

            // Delay redirect as requested
            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)

        } catch (err: any) {
            console.error("Submission error:", err)
            toast({
                title: "Error",
                description: err.message || "Error submitting evaluation",
                variant: "destructive"
            })
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-white">
                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-10 w-24 bg-slate-800" />
                </div>
                <div>
                    <Skeleton className="h-9 w-48 mb-2 bg-slate-800" />
                    <Skeleton className="h-5 w-64 bg-slate-800" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-32 bg-slate-800" />
                                    <Skeleton className="h-6 w-16 bg-slate-800" />
                                </div>
                                <Skeleton className="h-4 w-full bg-slate-800" />
                            </div>
                            <Skeleton className="h-10 w-full bg-slate-800" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    if (error) return <div className="p-10 text-red-500">Error: {error}</div>
    if (!subject) return <div className="p-10 text-white">Subject not found.</div>

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-white">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" className="p-0 text-slate-400 hover:text-white" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> กลับ
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">ประเมินพนักงาน</h1>
                <p className="text-slate-400">
                    ประเมินคุณ <span className="text-blue-400 font-semibold">{subject.full_name}</span> ({subject.department})
                </p>
            </div>

            <div className="space-y-6">
                {criteria.map((c) => (
                    <Card key={c.id} className="border-slate-800 bg-slate-900/50 text-white">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{c.title}</CardTitle>
                                <span className="text-sm font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">น้ำหนัก: {c.weight}%</span>
                            </div>
                            <CardDescription>{c.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>คะแนน: {scores[c.id]} / 10</span>
                                </div>
                                <Slider
                                    defaultValue={[5]}
                                    max={10}
                                    step={1}
                                    value={[scores[c.id]]}
                                    onValueChange={(val: number[]) => handleScoreChange(c.id, val)}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-slate-500 px-1">
                                    <span>แย่ (0)</span>
                                    <span>ดีมาก (10)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex justify-end pt-4">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-500 text-white w-full md:w-auto"
                    >
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        ส่งการประเมิน
                    </Button>
                </div>
            </div>
        </div>
    )
}
