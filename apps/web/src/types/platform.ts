export interface PlatformStats {
  totalUsers: number
  totalCreators: number
  totalSubscribers: number
  totalContentItems: number
  totalCommentBatches: number
  totalSentimentSnapshots: number
  usersByRole: {
    ADMIN?: number
    CREATOR?: number
    SUBSCRIBER_T1?: number
    SUBSCRIBER_T2?: number
    SUBSCRIBER_T3?: number
  }
}

export interface SubscriberProfile {
  _id: string
  userId: string
  creatorId: string
  tier: string
  creator: {
    _id: string
    displayName: string
    niche: string
  }
}

