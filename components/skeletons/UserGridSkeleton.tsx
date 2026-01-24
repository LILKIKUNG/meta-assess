import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UserGridSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-slate-800 bg-slate-900/50">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-[150px]" />
                            <Skeleton className="h-3 w-[100px]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-[40px]" /> {/* Label 'แผนก:' */}
                                <Skeleton className="h-4 w-[120px]" /> {/* Value */}
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end gap-2">
                            <Skeleton className="h-9 w-[110px]" /> {/* Button 1 (sm=h-9) */}
                            <Skeleton className="h-9 w-[80px]" />  {/* Button 2 (sm=h-9) */}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
