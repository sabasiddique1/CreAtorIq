// @ts-nocheck
import mongoose, { Schema, type Document } from "mongoose"
import type { CreatorProfile } from "@engagement-nexus/types"

export interface CreatorProfileDocument extends CreatorProfile, Document {}

const creatorProfileSchema = new Schema<CreatorProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    primaryPlatform: {
      type: String,
      enum: ["YouTube", "Twitch", "Other"],
      default: "YouTube",
    },
    niche: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Unique index on userId (removed duplicate - unique: true already creates an index)
creatorProfileSchema.index({ userId: 1 }, { unique: true })

export const CreatorProfileModel = mongoose.model<CreatorProfileDocument>("CreatorProfile", creatorProfileSchema)
