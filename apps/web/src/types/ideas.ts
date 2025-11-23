import type { SentimentSnapshot, CommentBatch } from "./sentiment"

export interface IdeaSuggestion {
  _id: string
  creatorId: string
  sourceSnapshotId: string
  title: string
  description: string
  ideaType: string
  tierTarget: string
  outline: string[]
  status: string
  createdAt: string
}

export interface SnapshotWithIdeas {
  snapshot: SentimentSnapshot
  batch: CommentBatch | null
  ideas: IdeaSuggestion[]
}

