import mongoose, { Schema, type Document } from "mongoose"
import type { IdeaSuggestion } from "@engagement-nexus/types"

export interface IdeaSuggestionDocument extends IdeaSuggestion, Document {}

const ideaSuggestionSchema = new Schema<IdeaSuggestionDocument>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "CreatorProfile",
      required: true,
    },
    sourceSnapshotId: {
      type: Schema.Types.ObjectId,
      ref: "SentimentSnapshot",
      required: true,
    },
    tierTarget: {
      type: String,
      enum: ["T1", "T2", "T3", "all"],
      default: "all",
    },
    ideaType: {
      type: String,
      enum: ["video", "mini-course", "live_qa", "community_challenge"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    outline: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["new", "saved", "implemented"],
      default: "new",
    },
  },
  {
    timestamps: true,
  },
)

ideaSuggestionSchema.index({ creatorId: 1 })
ideaSuggestionSchema.index({ status: 1 })

export const IdeaSuggestionModel = mongoose.model<IdeaSuggestionDocument>("IdeaSuggestion", ideaSuggestionSchema)
