import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoaderProps {
  className?: string
  size?: "sm" | "default" | "lg" | "xl"
}

export function Loader({ className, size = "default" }: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
    </div>
  )
}

