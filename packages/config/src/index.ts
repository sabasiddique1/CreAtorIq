// Remove trailing slash to prevent double slashes in URLs
const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
export const API_BASE_URL = rawUrl.replace(/\/+$/, "")

export const ROLES = {
  ADMIN: "ADMIN",
  CREATOR: "CREATOR",
  SUBSCRIBER_T1: "SUBSCRIBER_T1",
  SUBSCRIBER_T2: "SUBSCRIBER_T2",
  SUBSCRIBER_T3: "SUBSCRIBER_T3",
} as const

export const TIERS = {
  T1: "T1",
  T2: "T2",
  T3: "T3",
} as const

export const PLATFORMS = ["YouTube", "Twitch", "Other"] as const

export const IDEA_TYPES = ["video", "mini-course", "live_qa", "community_challenge"] as const

export const EVENT_TYPES = ["SUBSCRIBER_JOINED", "CONTENT_PUBLISHED", "BATCH_ANALYZED", "IDEAS_GENERATED"] as const
