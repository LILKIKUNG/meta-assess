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
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
    const supabase = createClient()
    const router = useRouter()
    const { toast } = useToast()

    // Mode State: 'login' | 'register'
    const [mode, setMode] = useState<'login' | 'register'>('login')

    // Login State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userName, setUserName] = useState("")

    // Register State
    const [regName, setRegName] = useState("")
    const [regEmail, setRegEmail] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [isRegistering, setIsRegistering] = useState(false)
    const [regError, setRegError] = useState<string | null>(null)

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
                toast({
                    variant: "destructive",
                    title: "ไม่สามารถเข้าสู่ระบบได้",
                    description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่",
                })
                return
            }

            if (data.user) {
                setUserName(data.user.email?.split('@')[0] || 'User')
                toast({
                    className: "bg-emerald-500 text-white border-emerald-600",
                    title: "เข้าสู่ระบบสำเร็จ",
                    description: `ยินดีต้อนรับคุณ ${data.user.email?.split('@')[0]}`,
                })
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1000)
            }
        } catch (error) {
            console.error("Unexpected error:", error)
            toast({
                variant: "destructive",
                title: "เกิดข้อผิดพลาด",
                description: "โปรดลองใหม่อีกครั้งในภายหลัง",
            })
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
                toast({
                    variant: "destructive",
                    title: "ลงทะเบียนไม่สำเร็จ",
                    description: result.error,
                })
            } else if (result?.success) {
                toast({
                    className: "bg-emerald-500 text-white border-emerald-600",
                    title: "ลงทะเบียนสำเร็จ",
                    description: "กรุณาเข้าสู่ระบบด้วยบัญชีใหม่ของคุณ",
                })
                setRegError(null)
                // Auto switch to login after delay
                setTimeout(() => {
                    setMode('login')
                    setEmail(regEmail) // Pre-fill login email
                    setPassword("")
                }, 2000)
            }
        } catch (error) {
            setRegError("เกิดข้อผิดพลาดที่ไม่คาดคิด")
            toast({
                variant: "destructive",
                title: "ข้อผิดพลาด",
                description: "เกิดปัญหาในการเชื่อมต่อระบบ",
            })
        } finally {
            setIsRegistering(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-100 blur-[120px] rounded-full pointer-events-none opacity-60" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-orange-100 blur-[100px] rounded-full pointer-events-none opacity-60" />

            <Card className="w-full max-w-sm border-slate-200 bg-white text-slate-900 shadow-xl relative z-10 duration-200">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="flex justify-center mb-6">
                        <div className="group rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 shadow-sm transition-transform hover:scale-105">
                            <MonitorCheck className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-semibold tracking-tight text-slate-900">
                        {mode === 'login' ? 'เว็บประเมินบุคลากร' : 'ลงทะเบียนบุคลากรใหม่'}
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-xs uppercase tracking-wider font-medium">
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
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="รหัสผ่าน"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold shadow-lg shadow-red-900/20 border-0"
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
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="อีเมลองค์กร"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="password"
                                    placeholder="กำหนดรหัสผ่าน"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    className="h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus-visible:ring-red-600 focus-visible:border-red-600 transition-all font-medium"
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
                                className="w-full h-11 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white font-semibold shadow-lg shadow-slate-900/20 border-0"
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
                <CardFooter className="flex flex-col space-y-4 text-center text-sm text-slate-500 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                        {mode === 'login' ? (
                            <>
                                ยังไม่มีบัญชี?
                                <button
                                    onClick={() => setMode('register')}
                                    className="text-red-600 hover:text-red-500 font-medium transition-colors hover:underline"
                                >
                                    ลงทะเบียนบุคลากรใหม่
                                </button>
                            </>
                        ) : (
                            <>
                                มีบัญชีอยู่แล้ว?
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-slate-600 hover:text-slate-500 font-medium transition-colors hover:underline"
                                >
                                    กลับไปหน้าเข้าสู่ระบบ
                                </button>
                            </>
                        )}
                    </div>
                </CardFooter>
            </Card>

            <div className="absolute bottom-6 text-center text-xs text-slate-500">
                &copy; ระบบประเมินทรัพยากรบุคคล 2026 สงวนลิขสิทธิ์ทุกประการ
            </div>
        </div>
    )
}
