export const TIER_COLORS = {
  T1: "bg-blue-500/20 text-blue-400",
  T2: "bg-purple-500/20 text-purple-400",
  T3: "bg-yellow-500/20 text-yellow-400",
} as const

export const TIER_HIERARCHY: Record<string, string[]> = {
  T1: ["T1"],
  T2: ["T1", "T2"],
  T3: ["T1", "T2", "T3"],
} as const

