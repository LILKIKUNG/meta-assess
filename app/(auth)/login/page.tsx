"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MonitorCheck, Loader2, CheckCircle2, UserPlus, LogIn } from "lucide-react"

import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { registerStaff } from "@/app/actions/register"

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()

    // Mode State: 'login' | 'register'
    const [mode, setMode] = useState<'login' | 'register'>('login')

    // Login State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [shake, setShake] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [userName, setUserName] = useState("")

    // Register State
    const [regName, setRegName] = useState("")
    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [isRegistering, setIsRegistering] = useState(false)
    const [regError, setRegError] = useState<string | null>(null)
    const [regSuccess, setRegSuccess] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error("Login error:", error.message)
                setShake(true)
                setTimeout(() => setShake(false), 500)
                return
            }

            if (data.user) {
                setUserName(data.user.email?.split('@')[0] || 'User')
                setShowSuccess(true)
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1500)
            }
        } catch (error) {
            console.error("Unexpected error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsRegistering(true)
        setRegError(null)

        const formData = new FormData()
        formData.append("fullName", regName)
        formData.append("email", regEmail)
        formData.append("password", regPassword)

        try {
            const result = await registerStaff(null, formData)

            if (result?.error) {
                setRegError(result.error)
            } else if (result?.success) {
                setRegSuccess(true)
                setRegError(null)
                // Auto switch to login after delay
                setTimeout(() => {
                    setMode('login')
                    setEmail(regEmail) // Pre-fill login email
                    setRegSuccess(false)
                }, 2000)
            }
        } catch (error) {
            setRegError("เกิดข้อผิดพลาดที่ไม่คาดคิด")
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-30" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none opacity-30" />

            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">ยินดีต้อนรับคุณ {userName}!</span>
                </div>
            )}

            {regSuccess && mode === 'register' && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-50">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ</span>
                </div>
            )}

            <Card className={`w-full max-w-sm border-slate-800 bg-slate-900/60 text-slate-50 backdrop-blur-md shadow-2xl relative z-10 duration-200 ${shake ? 'animate-shake border-red-500/50' : ''}`}>
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <div className="group rounded-xl bg-slate-950/50 p-3 ring-1 ring-white/10 shadow-lg transition-transform hover:scale-105">
                            <MonitorCheck className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-semibold tracking-tight text-white">
                        {mode === 'login' ? 'เว็บประเมินบุคลากร' : 'ลงทะเบียนพนักงานใหม่'}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs uppercase tracking-wider font-medium">
                        {mode === 'login' ? 'เข้าสู่ระบบของคุณ' : 'สร้างบัญชีเพื่อเริ่มต้นใช้งาน'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="อีเมล"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="รหัสผ่าน"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/20 border-0"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>กำลังเข้าสู่ระบบ...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        เข้าสู่ระบบ <LogIn className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <Input
                                    type="text"
                                    placeholder="ชื่อ-นามสกุล"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    className="h-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="อีเมลองค์กร"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    className="h-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="กำหนดรหัสผ่าน"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className="h-11 bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 transition-all font-medium"
                                    required
                                />
                            </div>

                            {regError && (
                                <div className="text-red-400 text-xs text-center p-2 bg-red-950/20 rounded-lg border border-red-900/50">
                                    {regError}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isRegistering}
                                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-900/20 border-0"
                            >
                                {isRegistering ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>กำลังบันทึกข้อมูล...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        ลงทะเบียน <UserPlus className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 text-center text-sm text-slate-400 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                        {mode === 'login' ? (
                            <>
                                ยังไม่มีบัญชี?
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors hover:underline"
                                >
                                    ลงทะเบียนพนักงานใหม่
                                </button>
                            </>
                        ) : (
                            <>
                                มีบัญชีอยู่แล้ว?
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors hover:underline"
                                >
                                    กลับไปหน้าเข้าสู่ระบบ
                                </button>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <div className="absolute bottom-6 text-center text-xs text-slate-600">
                &copy; ระบบประเมินทรัพยากรบุคคล 2026 สงวนลิขสิทธิ์ทุกประการ
            </div>
        </div>
    )
}
