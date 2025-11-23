export interface ActivityEvent {
  _id: string
  creatorId?: string
  creator?: {
    _id: string
    displayName: string
    niche: string
  }
  userId?: string
  user?: {
    _id: string
    name: string
    email: string
    role: string
  }
  eventType: string
  metadata: Record<string, any>
  createdAt: string
}

export interface ActivityStats {
  byEventType: Array<{ _id: string; count: number }>
  timeline: Array<{ _id: { year: number; month: number; day: number }; count: number }>
}

