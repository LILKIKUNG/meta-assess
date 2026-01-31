import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";

export function Hero() {
    return (
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center pt-20 pb-16 md:pt-32 md:pb-24">
            {/* Badge/Pill */}
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium uppercase tracking-wider animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Activity className="h-3.5 w-3.5" />
                <span>Technical College V1.0</span>
            </div>

            {/* Main Headline - High Visual Weight */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 max-w-5xl leading-[1.1] animate-in fade-in slide-in-from-bottom-5 duration-1000 fill-mode-both">
                ระบบประเมิน <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-red-800 to-red-600">
                    บุคลากรวิทยาลัยเทคนิคบัวใหญ่
                </span>
            </h1>

            {/* Subheadline - Secondary Weight */}
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 fill-mode-both">
                ระบบประเมินผลการปฎิบัติงานรายบุคคลที่ช่วยให้องค์กรสามารถประเมินผลการปฎิบัติงานของบุคลากรได้อย่างมีประสิทธิภาพ
            </p>

            {/* CTA Buttons - Tertiary Weight */}
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-300 fill-mode-both">
                <Link href="/login">
                    <Button size="lg" className="h-14 px-8 text-base bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-lg shadow-red-500/25">
                        เข้าสู่หน้าล็อคอิน <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>

            </div>
        </div>
    );
}
