import React, { useId } from "react"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  textGradient?: boolean
}

export function Logo({ className = "", showText = false, size = "md", textGradient = false }: LogoProps) {
  const gradientId = useId()
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Blue → Purple gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        {/* Rising analytics line */}
        <polyline
          points="24,72 50,48 76,52 104,32"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Rounded base block */}
        <rect
          x="52"
          y="80"
          width="24"
          height="18"
          rx="6"
          fill={`url(#${gradientId})`}
        />
      </svg>
      {showText && (
        <span className="text-xl font-bold">
          <span className={textGradient ? "text-white" : "text-white"}>creAtor </span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            I<span className="text-sm">q</span>
          </span>
        </span>
      )}
    </div>
  )
}

