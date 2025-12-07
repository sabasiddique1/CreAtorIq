// @ts-nocheck
import mongoose, { Schema, type Document } from "mongoose"

export interface ContentViewDocument extends Document {
  userId: mongoose.Types.ObjectId
  contentItemId: mongoose.Types.ObjectId
  viewedAt: Date
}

const contentViewSchema = new Schema<ContentViewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentItemId: {
      type: Schema.Types.ObjectId,
      ref: "ContentItem",
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: false,
  },
)

contentViewSchema.index({ userId: 1, contentItemId: 1 }, { unique: true })
contentViewSchema.index({ contentItemId: 1 })

export const ContentViewModel = mongoose.model<ContentViewDocument>("ContentView", contentViewSchema)

