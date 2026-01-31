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
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">จัดการบุคลากร</h1>
                    <p className="text-slate-500">เพิ่ม ลบ แก้ไข ข้อมูลสมาชิกในระบบ</p>
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <Skeleton className="h-10 w-64 bg-slate-100" />
                    <Skeleton className="h-10 w-32 bg-slate-100" />
                </div>
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="border-slate-200 hover:bg-slate-50">
                            <TableHead className="text-slate-500"><Skeleton className="h-4 w-20 bg-slate-100" /></TableHead>
                            <TableHead className="text-slate-500"><Skeleton className="h-4 w-32 bg-slate-100" /></TableHead>
                            <TableHead className="text-slate-500"><Skeleton className="h-4 w-24 bg-slate-100" /></TableHead>
                            <TableHead className="text-slate-500"><Skeleton className="h-4 w-16 bg-slate-100" /></TableHead>
                            <TableHead className="text-right text-slate-500"><Skeleton className="h-4 w-12 ml-auto bg-slate-100" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i} className="border-slate-200 hover:bg-slate-50">
                                <TableCell><Skeleton className="h-10 w-10 rounded-full bg-slate-100" /></TableCell>
                                <TableCell>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-slate-100" />
                                        <Skeleton className="h-3 w-48 bg-slate-100" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-5 w-24 bg-slate-100" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-16 rounded-full bg-slate-100" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8 bg-slate-100" />
                                        <Skeleton className="h-8 w-8 bg-slate-100" />
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
