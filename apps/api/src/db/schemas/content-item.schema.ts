// @ts-nocheck
import mongoose, { Schema, type Document } from "mongoose"
import type { ContentItem } from "@engagement-nexus/types"

export interface ContentItemDocument extends ContentItem, Document {}

const contentItemSchema = new Schema<ContentItemDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "course", "post", "live_session"],
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    requiredTier: {
      type: String,
      enum: ["T1", "T2", "T3", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    description: {
      type: String,
      default: "",
    },
    contentUrl: {
      type: String,
      default: null,
    },
    contentBody: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

contentItemSchema.index({ creatorId: 1 })
contentItemSchema.index({ status: 1 })

export const ContentItemModel = mongoose.model<ContentItemDocument>("ContentItem", contentItemSchema)
