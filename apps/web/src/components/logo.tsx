import Image from "next/image"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  textGradient?: boolean
}

export function Logo({ className = "", showText = false, size = "md", textGradient = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const imageSize = {
    sm: 24,
    md: 32,
    lg: 48,
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/app-logo.png"
        alt="CreatorIQ Logo"
        width={imageSize[size]}
        height={imageSize[size]}
        className={`${sizeClasses[size]} object-contain`}
        priority
        unoptimized
      />
      {showText && (
        <span className="text-xl font-bold font-highlight">
          <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Creatiq
          </span>
        </span>
      )}
    </div>
  )
}

