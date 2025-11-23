export interface SentimentSnapshot {
  _id: string
  creatorId: string
  commentBatchId: string
  overallSentimentScore: number
  positiveCount: number
  negativeCount: number
  neutralCount: number
  topKeywords: string[]
  topRequests: string[]
  createdAt: string
}

export interface CommentBatch {
  _id: string
  source: string
  rawComments: Array<{
    text: string
    author?: string
    timestamp?: string
  }>
  importedAt: string
  creatorId?: string
  linkedContentItemId?: string
}

