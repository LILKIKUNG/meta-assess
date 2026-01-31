"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, AlertCircle, CheckCircle2, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton"
import { ErrorState } from "@/components/ui/error-state"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
    const { toast } = useToast()
    const [chartData, setChartData] = useState<{ name: string, score: number }[]>([])
    const [myAvgScore, setMyAvgScore] = useState(0)
    const [avgScore, setAvgScore] = useState(0)
    const [totalEvals, setTotalEvals] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)
    const [topPerformers, setTopPerformers] = useState<{ name: string, dept: string, score: number }[]>([])
    const [profile, setProfile] = useState<{ full_name: string, role: string } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showSkeleton, setShowSkeleton] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        if (isLoading) {
            timeoutId = setTimeout(() => setShowSkeleton(true), 200)
        } else {
            setShowSkeleton(false)
        }

        return () => clearTimeout(timeoutId)
    }, [isLoading])

    useEffect(() => {
        async function getData() {
            try {
                setIsLoading(true)
                setError(null)
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    // 1. Profile
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()
                    if (profileData) setProfile(profileData)

                    // 2. Stats (Admins see all, Users see relevant?)
                    // For simplicity, showing ALL assessments stats for demo
                    // In real app, filter based on RLS (which Supabase does)
                    let query = supabase
                        .from('assessments')
                        .select(`
                            id, 
                            created_at, 
                            subject_id,
                            status,
                            subject:profiles!assessments_subject_id_fkey(full_name, department),
                            scores (
                                score,
                                criteria (
                                    weight
                                )
                            )
                        `)
                        .order('created_at', { ascending: true })

                    // Filter removed to unlock "Top Scores" card for all roles (requested by user)
                    // if (profileData && profileData.role === 'staff') {
                    //    query = query.eq('subject_id', user.id)
                    // }

                    const { data: assessments } = await query

                    if (assessments) {
                        setTotalEvals(assessments.length)
                        setPendingCount(assessments.filter(a => a.status === 'pending').length)

                        let totalScoreSum = 0
                        let totalScoreCount = 0

                        // Personal Stats Calculation
                        let myTotalScore = 0
                        let myCount = 0

                        // Process for Chart (Group by Month) & Top Performers
                        const monthlyData: Record<string, { total: number, count: number }> = {}
                        const subjectScores: Record<string, { total: number, count: number, name: string, dept: string }> = {}

                        assessments.forEach(a => {
                            if (!a.scores || a.scores.length === 0) return

                            // Calculate Total Score (Sum of 5 items x 20 points = 100 max)
                            // No longer using weights.
                            const assessmentAvg = a.scores.reduce((acc, curr) => {
                                return acc + curr.score
                            }, 0)

                            if (a.scores.length > 0) {
                                totalScoreSum += assessmentAvg
                                totalScoreCount++

                                // Personal Score Check
                                if (a.subject_id === user.id) {
                                    myTotalScore += assessmentAvg
                                    myCount++
                                }

                                // Group by Subject for Top Performers
                                if (a.subject_id) {
                                    if (!subjectScores[a.subject_id]) {
                                        // @ts-ignore
                                        subjectScores[a.subject_id] = { total: 0, count: 0, name: a.subject?.full_name || 'Unknown', dept: a.subject?.department || '-' }
                                    }
                                    subjectScores[a.subject_id].total += assessmentAvg
                                    subjectScores[a.subject_id].count++
                                }
                            }

                            const month = new Date(a.created_at).toLocaleString('default', { month: 'short' })
                            if (!monthlyData[month]) monthlyData[month] = { total: 0, count: 0 }

                            monthlyData[month].total += assessmentAvg
                            monthlyData[month].count++
                        })

                        setAvgScore(totalScoreCount > 0 ? (totalScoreSum / totalScoreCount) : 0)
                        setMyAvgScore(myCount > 0 ? (myTotalScore / myCount) : 0)

                        const finalChartData = Object.keys(monthlyData).map(month => ({
                            name: month,
                            score: parseFloat((monthlyData[month].total / monthlyData[month].count).toFixed(1))
                        }))
                        setChartData(finalChartData)

                        // Top Performers Logic
                        const topList = Object.values(subjectScores)
                            .map(s => ({
                                name: s.name,
                                dept: s.dept,
                                score: s.total / s.count
                            }))
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5) // Top 5

                        setTopPerformers(topList)
                    }
                }
            } catch (error: any) {
                console.error("Error fetching dashboard data:", error)
                setError(error.message || "Failed to load dashboard data.")
                toast({
                    variant: "destructive",
                    title: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
                    description: "การเชื่อมต่อมีปัญหา กรุณารีเฟรชหน้าจอ",
                })
            } finally {
                setIsLoading(false)
            }
        }
        getData()
    }, [])

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
            {isLoading && showSkeleton ? (
                <DashboardSkeleton />
            ) : error ? (
                <ErrorState
                    title="Dashboard unavailable"
                    message={error}
                    onRetry={() => { setIsLoading(true); window.location.reload() }}
                />
            ) : !isLoading ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">ภาพรวม</h1>
                            <p className="text-slate-500">
                                คุณ, <span className="text-red-600 font-semibold">{profile?.full_name || 'Admin User'}</span>
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 border border-slate-200">
                                    {profile?.role || 'admin'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="shadow-none border-slate-200 bg-white text-slate-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">การประเมินผลรวม</CardTitle>
                                <BarChart3 className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{totalEvals}</div>
                                <p className="text-xs text-slate-500 mt-1">การประเมินเสร็จสมบูรณ์</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border-slate-200 bg-white text-slate-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">คะแนนเฉลี่ยของคุณ</CardTitle>
                                <Trophy className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{myAvgScore > 0 ? myAvgScore.toFixed(1) : "0.0"}</div>
                                <p className="text-xs text-slate-500 mt-1">จากผลการปฏิบัติงานทั้งหมด</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border-slate-200 bg-white text-slate-900">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">คะแนนเฉลี่ยรวม</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{avgScore.toFixed(1)}</div>
                                <p className="text-xs text-slate-500 mt-1">ค่าเฉลี่ยในวิทยาลัย</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4 shadow-none border-slate-200 bg-white text-slate-900">
                            <CardHeader>
                                <CardTitle className="text-slate-900">แนวโน้ม</CardTitle>
                                <CardDescription className="text-slate-500">ค่าเฉลี่ยของแต่ละเดือน</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a' }}
                                                itemStyle={{ color: '#0f172a' }}
                                                cursor={{ fill: '#f1f5f9' }}
                                            />
                                            <Bar dataKey="score" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3 shadow-none border-slate-200 bg-white text-slate-900">
                            <CardHeader>
                                <CardTitle className="text-slate-900">ผู้ที่ได้รับคะแนนสูงสุด</CardTitle>
                                <CardDescription className="text-slate-500">ลำดับคะแนน</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {topPerformers.length > 0 ? (
                                        topPerformers.map((p, i) => (
                                            <div key={i} className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none text-slate-900">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.dept}</p>
                                                </div>
                                                <div className="ml-auto font-bold text-sm text-emerald-600">{p.score.toFixed(1)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">No data available yet.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
