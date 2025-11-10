import mongoose, { Schema, type Document } from "mongoose"
import type { SubscriptionTier } from "@engagement-nexus/types"

export interface SubscriptionTierDocument extends SubscriptionTier, Document {}

const subscriptionTierSchema = new Schema<SubscriptionTierDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    benefits: {
      type: [String],
      default: [],
    },
    stripePriceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

subscriptionTierSchema.index({ creatorId: 1 })

export const SubscriptionTierModel = mongoose.model<SubscriptionTierDocument>(
  "SubscriptionTier",
  subscriptionTierSchema,
)
