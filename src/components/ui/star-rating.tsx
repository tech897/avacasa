import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showNumber?: boolean
  className?: string
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showNumber = false,
  className 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const isFilled = index < Math.floor(rating)
          const isHalfFilled = index === Math.floor(rating) && rating % 1 !== 0
          
          return (
            <div key={index} className="relative">
              <Star 
                className={cn(
                  sizeClasses[size],
                  "text-gray-300"
                )}
                fill="currentColor"
              />
              {(isFilled || isHalfFilled) && (
                <Star 
                  className={cn(
                    sizeClasses[size],
                    "absolute top-0 left-0 text-yellow-400",
                    isHalfFilled && "overflow-hidden"
                  )}
                  fill="currentColor"
                  style={isHalfFilled ? { 
                    clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` 
                  } : undefined}
                />
              )}
            </div>
          )
        })}
      </div>
      {showNumber && (
        <span className={cn("text-gray-600 font-medium", textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
} 