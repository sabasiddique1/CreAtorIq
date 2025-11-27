import mongoose, { Schema, type Document } from "mongoose"

export interface ContentView {
  userId: string
  contentItemId: string
  viewedAt: Date
}

export interface ContentViewDocument extends ContentView, Document {}

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
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
)

// Compound index to prevent duplicate views and enable fast lookups
contentViewSchema.index({ userId: 1, contentItemId: 1 }, { unique: true })
contentViewSchema.index({ contentItemId: 1 })
contentViewSchema.index({ userId: 1, viewedAt: -1 })

export const ContentViewModel = mongoose.model<ContentViewDocument>("ContentView", contentViewSchema)

