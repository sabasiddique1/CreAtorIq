// @ts-nocheck
import mongoose, { Schema, type Document } from "mongoose"
import type { SentimentSnapshot } from "@engagement-nexus/types"

export interface SentimentSnapshotDocument extends SentimentSnapshot, Document {}

const sentimentSnapshotSchema = new Schema<SentimentSnapshotDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    commentBatchId: {
      type: Schema.Types.ObjectId,
      ref: "CommentBatch",
      required: true,
    },
    timeRangeStart: {
      type: Date,
      required: true,
    },
    timeRangeEnd: {
      type: Date,
      required: true,
    },
    overallSentimentScore: {
      type: Number,
      required: true,
      min: -1,
      max: 1,
    },
    positiveCount: {
      type: Number,
      default: 0,
    },
    negativeCount: {
      type: Number,
      default: 0,
    },
    neutralCount: {
      type: Number,
      default: 0,
    },
    topKeywords: {
      type: [String],
      default: [],
    },
    topRequests: {
      type: [String],
      default: [],
    },
    byTier: [
      {
        tier: { type: String, enum: ["T1", "T2", "T3"] },
        sentimentScore: Number,
        positiveCount: Number,
        negativeCount: Number,
      },
    ],
  },
  {
    timestamps: true,
  },
)

sentimentSnapshotSchema.index({ creatorId: 1 })
sentimentSnapshotSchema.index({ commentBatchId: 1 })
sentimentSnapshotSchema.index({ timeRangeStart: -1 })

export const SentimentSnapshotModel = mongoose.model<SentimentSnapshotDocument>(
  "SentimentSnapshot",
  sentimentSnapshotSchema,
)
