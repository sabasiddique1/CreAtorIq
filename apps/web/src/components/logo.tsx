import Image from "next/image"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const imageSize = {
    sm: 64,
    md: 96,
    lg: 144,
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/app-logo-creatiq.png"
        alt="Creatiq Logo"
        width={imageSize[size]}
        height={imageSize[size]}
        className="object-contain"
        style={{ width: imageSize[size], height: imageSize[size] }}
        priority
        unoptimized
      />
    </div>
  )
}

