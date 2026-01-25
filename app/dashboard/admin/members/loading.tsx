import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function MembersLoading() {
    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">จัดการบุคลากร</h1>
                    <p className="text-slate-400">เพิ่ม ลบ แก้ไข ข้อมูลสมาชิกในระบบ</p>
                </div>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-900/50">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <Skeleton className="h-10 w-64 bg-slate-800" />
                    <Skeleton className="h-10 w-32 bg-slate-800" />
                </div>
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-800 hover:bg-slate-900">
                            <TableHead className="text-slate-400"><Skeleton className="h-4 w-20 bg-slate-800" /></TableHead>
                            <TableHead className="text-slate-400"><Skeleton className="h-4 w-32 bg-slate-800" /></TableHead>
                            <TableHead className="text-slate-400"><Skeleton className="h-4 w-24 bg-slate-800" /></TableHead>
                            <TableHead className="text-slate-400"><Skeleton className="h-4 w-16 bg-slate-800" /></TableHead>
                            <TableHead className="text-right text-slate-400"><Skeleton className="h-4 w-12 ml-auto bg-slate-800" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i} className="border-slate-800 hover:bg-slate-900/50">
                                <TableCell><Skeleton className="h-10 w-10 rounded-full bg-slate-800" /></TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-slate-800" />
                                        <Skeleton className="h-3 w-48 bg-slate-800" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-24 bg-slate-800" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full bg-slate-800" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8 bg-slate-800" />
                                        <Skeleton className="h-8 w-8 bg-slate-800" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
