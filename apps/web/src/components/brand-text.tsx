
interface BrandTextProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
}

export function BrandText({ className = "", size = "md" }: BrandTextProps) {
  return (
    <span className={`font-bold ${sizeClasses[size]} font-highlight ${className}`}>
      <span className="text-foreground">creAtor </span>
      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        I<span className="text-[0.7em]">q</span>
      </span>
    </span>
  )
}

