import mongoose, { Schema, type Document } from "mongoose"
import type { SubscriberProfile } from "@engagement-nexus/types"

export interface SubscriberProfileDocument extends SubscriberProfile, Document {}

const subscriberProfileSchema = new Schema<SubscriberProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    tier: {
      type: String,
      enum: ["T1", "T2", "T3"],
      required: true,
    },
    joinedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
)

subscriberProfileSchema.index({ userId: 1, creatorId: 1 })
subscriberProfileSchema.index({ creatorId: 1 })

export const SubscriberProfileModel = mongoose.model<SubscriberProfileDocument>(
  "SubscriberProfile",
  subscriberProfileSchema,
)
