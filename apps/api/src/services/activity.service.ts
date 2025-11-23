import { ActivityEventModel } from "../db/index.js"
import type { ActivityEventDocument } from "../db/schemas/activity-event.schema.js"

export type ActivityEventType =
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

interface LogActivityParams {
  eventType: ActivityEventType
  userId?: string
  creatorId?: string
  metadata?: Record<string, any>
}

export class ActivityService {
  static async logActivity(params: LogActivityParams): Promise<ActivityEventDocument> {
    const activity = await ActivityEventModel.create({
      eventType: params.eventType,
      userId: params.userId || null,
      creatorId: params.creatorId || null,
      metadata: params.metadata || {},
    })
    return activity
  }

  static async getActivities(filters?: {
    userId?: string
    creatorId?: string
    eventType?: ActivityEventType
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<ActivityEventDocument[]> {
    const query: any = {}

    if (filters?.userId) {
      query.userId = filters.userId
    }
    if (filters?.creatorId) {
      query.creatorId = filters.creatorId
    }
    if (filters?.eventType) {
      query.eventType = filters.eventType
    }
    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {}
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate
      }
    }

    const activities = await ActivityEventModel.find(query)
      .populate("userId", "name email role")
      .populate("creatorId", "displayName niche")
      .sort({ createdAt: -1 })
      .limit(filters?.limit || 100)

    return activities
  }

  static async getActivityStats(startDate?: Date, endDate?: Date) {
    const query: any = {}
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = startDate
      }
      if (endDate) {
        query.createdAt.$lte = endDate
      }
    }

    const stats = await ActivityEventModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ])

    const timeline = await ActivityEventModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    return {
      byEventType: stats,
      timeline,
    }
  }
}

