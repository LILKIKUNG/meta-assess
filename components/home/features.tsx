import { Zap, Shield, BarChart3 } from "lucide-react";

export function Features() {
    const features = [
        {
            icon: BarChart3,
            title: "ระบบประเมินผลการปฎิบัติงานรายบุคคล",
            description: "ข้อมูลเชิงลึกที่ขับเคลื่อนด้วยข้อมูลเกี่ยวกับการประเมินผลการปฏิบัติงานของพนักงาน พร้อมด้วยตัวชี้วัดการให้คะแนน",
            color: "text-blue-400",
        },
        {
            icon: Shield,
            title: "ระบบจัดการประเมินผล",
            description: "การควบคุมการเข้าถึงตามบทบาท (RBAC) ช่วยให้มั่นใจได้ถึงความเป็นส่วนตัวของข้อมูลสำหรับทุกระดับในองค์กร",
            color: "text-indigo-400",
        },
        {
            icon: Zap,
            title: "เวิร์กโฟลว์อัตโนมัติ",
            description: "วงจรการประเมินที่คล่องตัว ช่วยลดภาระงานด้านบริหารลง 40%",
            color: "text-slate-300",
        },
    ];

    return (
        <div className="relative z-10 container mx-auto px-4 py-16 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="group p-8 rounded-2xl bg-slate-900/20 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 transition-all duration-300"
                    >
                        <div className="mb-4 inline-flex p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-slate-700 transition-colors">
                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-100 transition-colors">
                            {feature.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
