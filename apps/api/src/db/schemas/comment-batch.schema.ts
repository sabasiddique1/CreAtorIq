import mongoose, { Schema, type Document } from "mongoose"
import type { CommentBatch } from "@engagement-nexus/types"

export interface CommentBatchDocument extends CommentBatch, Document {}

const commentBatchSchema = new Schema<CommentBatchDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    source: {
      type: String,
      enum: ["YouTube", "CSV_UPLOAD", "MANUAL_PASTE"],
      required: true,
    },
    rawComments: [
      {
        author: String,
        text: String,
        timestamp: Date,
        platform: String,
        tier: String,
      },
    ],
    importedAt: {
      type: Date,
      default: () => new Date(),
    },
    linkedContentItemId: {
      type: Schema.Types.ObjectId,
      ref: "ContentItem",
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

commentBatchSchema.index({ creatorId: 1 })
commentBatchSchema.index({ importedAt: -1 })

export const CommentBatchModel = mongoose.model<CommentBatchDocument>("CommentBatch", commentBatchSchema)
