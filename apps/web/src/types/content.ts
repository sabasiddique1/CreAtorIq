export interface ContentItem {
  _id: string
  creatorId: string
  title: string
  type: string
  status: string
  isPremium: boolean
  requiredTier?: string
  description?: string
  contentUrl?: string
  contentBody?: string
  createdAt: string
  updatedAt?: string
  creator?: {
    _id: string
    displayName: string
    niche: string
  }
}

