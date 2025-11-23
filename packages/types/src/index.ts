// User & Authentication Types
export type UserRole = "ADMIN" | "CREATOR" | "SUBSCRIBER_T1" | "SUBSCRIBER_T2" | "SUBSCRIBER_T3"

export interface User {
  _id: string
  email: string
  passwordHash: string
  name: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface CreatorProfile {
  _id: string
  userId: string
  displayName: string
  bio: string
  avatarUrl?: string
  primaryPlatform: "YouTube" | "Twitch" | "Other"
  niche: string
  createdAt: Date
  updatedAt: Date
}

export interface SubscriberProfile {
  _id: string
  userId: string
  creatorId: string
  tier: "T1" | "T2" | "T3"
  joinedAt: Date
}

export interface SubscriptionTier {
  _id: string
  creatorId: string
  name: string
  pricePerMonth: number
  benefits: string[]
  stripePriceId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ContentItem {
  _id: string
  creatorId: string
  title: string
  type: "video" | "course" | "post" | "live_session"
  isPremium: boolean
  requiredTier?: "T1" | "T2" | "T3"
  status: "draft" | "published"
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CommentBatch {
  _id: string
  creatorId: string
  source: "YouTube" | "CSV_UPLOAD" | "MANUAL_PASTE"
  rawComments: Array<{
    author: string
    text: string
    timestamp?: Date
    platform?: string
    tier?: string
  }>
  importedAt: Date
  linkedContentItemId?: string
}

export interface SentimentSnapshot {
  _id: string
  creatorId: string
  commentBatchId: string
  timeRangeStart: Date
  timeRangeEnd: Date
  overallSentimentScore: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  topKeywords: string[]
  topRequests: string[]
  byTier?: Array<{
    tier: "T1" | "T2" | "T3"
    sentimentScore: number
    positiveCount: number
    negativeCount: number
  }>
  createdAt: Date
}

export interface IdeaSuggestion {
  _id: string
  creatorId: string
  sourceSnapshotId: string
  tierTarget: "T1" | "T2" | "T3" | "all"
  ideaType: "video" | "mini-course" | "live_qa" | "community_challenge"
  title: string
  description: string
  outline: string[]
  status: "new" | "saved" | "implemented"
  createdAt: Date
}

export interface ActivityEvent {
  _id: string
  creatorId?: string
  userId?: string
  eventType:
    | "USER_LOGIN"
    | "USER_REGISTER"
    | "USER_LOGOUT"
    | "CREATOR_PROFILE_CREATED"
    | "CREATOR_PROFILE_UPDATED"
    | "SUBSCRIBER_JOINED"
    | "SUBSCRIBER_LEFT"
    | "CONTENT_CREATED"
    | "CONTENT_PUBLISHED"
    | "CONTENT_UPDATED"
    | "CONTENT_DELETED"
    | "BATCH_ANALYZED"
    | "IDEAS_GENERATED"
    | "COMMENT_BATCH_IMPORTED"
    | "SENTIMENT_ANALYZED"
  metadata: Record<string, any>
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthContext {
  user?: User
  tokens?: AuthTokens
}
