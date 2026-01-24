import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Skeleton className="h-10 w-[140px]" />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="shadow-none border-slate-800 bg-slate-900/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px] mb-1" />
                            <Skeleton className="h-3 w-[120px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts & Top Performers */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-none border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[250px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-none border-slate-800 bg-slate-900/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-[200px] mb-2" />
                        <Skeleton className="h-4 w-[150px]" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-9 w-9 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <Skeleton className="h-4 w-[40px]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
