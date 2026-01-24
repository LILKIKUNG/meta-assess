import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

interface ErrorStateProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function ErrorState({
    title = "Something went wrong",
    message = "There was an error loading the data. Please try again.",
    onRetry
}: ErrorStateProps) {
    return (
        <Card className="border-red-900/50 bg-red-900/10 text-red-200 w-full max-w-md mx-auto mt-10">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-red-900/20 text-red-500">
                        <AlertCircle className="h-8 w-8" />
                    </div>
                </div>
                <CardTitle className="text-xl text-red-400">{title}</CardTitle>
                <CardDescription className="text-red-300/80">
                    {message}
                </CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
            {onRetry && (
                <CardFooter className="flex justify-center pb-6">
                    <Button
                        variant="outline"
                        className="border-red-800 text-red-400 hover:bg-red-950 hover:text-red-300 hover:border-red-700 gap-2"
                        onClick={onRetry}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
