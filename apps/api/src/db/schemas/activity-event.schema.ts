import mongoose, { Schema, type Document } from "mongoose"
import type { ActivityEvent } from "@engagement-nexus/types"

export interface ActivityEventDocument extends ActivityEvent, Document {}

const activityEventSchema = new Schema<ActivityEventDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    eventType: {
      type: String,
      enum: ["SUBSCRIBER_JOINED", "CONTENT_PUBLISHED", "BATCH_ANALYZED", "IDEAS_GENERATED"],
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
activityEventSchema.index({ createdAt: -1 })

export const ActivityEventModel = mongoose.model<ActivityEventDocument>("ActivityEvent", activityEventSchema)
