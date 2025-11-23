import mongoose, { Schema, type Document } from "mongoose"
import type { ActivityEvent } from "@engagement-nexus/types"

export interface ActivityEventDocument extends ActivityEvent, Document {}

const activityEventSchema = new Schema<ActivityEventDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    eventType: {
      type: String,
      enum: [
        "USER_LOGIN",
        "USER_REGISTER",
        "USER_LOGOUT",
        "CREATOR_PROFILE_CREATED",
        "CREATOR_PROFILE_UPDATED",
        "SUBSCRIBER_JOINED",
        "SUBSCRIBER_LEFT",
        "CONTENT_CREATED",
        "CONTENT_PUBLISHED",
        "CONTENT_UPDATED",
        "CONTENT_DELETED",
        "BATCH_ANALYZED",
        "IDEAS_GENERATED",
        "COMMENT_BATCH_IMPORTED",
        "SENTIMENT_ANALYZED",
      ],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

activityEventSchema.index({ creatorId: 1 })
activityEventSchema.index({ userId: 1 })
activityEventSchema.index({ eventType: 1 })
activityEventSchema.index({ createdAt: -1 })
activityEventSchema.index({ creatorId: 1, createdAt: -1 })

export const ActivityEventModel = mongoose.model<ActivityEventDocument>("ActivityEvent", activityEventSchema)
