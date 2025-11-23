export interface CreatorProfile {
  _id: string
  userId: string
  displayName: string
  bio: string
  avatarUrl?: string
  primaryPlatform: string
  niche: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatorData {
  creator: CreatorProfile
  totalSubscribers: number
  subscribersByTier: { T1: number; T2: number; T3: number }
  recentContent: Array<{
    _id: string
    title: string
    type: string
    status: string
    isPremium: boolean
    createdAt: string
  }>
  latestSentimentTrend?: {
    overallSentimentScore: number
    positiveCount: number
    negativeCount: number
    neutralCount?: number
    topKeywords: string[]
  }
  suggestedIdeas: Array<{
    _id: string
    title: string
    description: string
    ideaType: string
    status: string
    createdAt: string
  }>
}

