// @ts-nocheck
import mongoose, { Schema, type Document } from "mongoose"
import type { User } from "@engagement-nexus/types"

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "CREATOR", "SUBSCRIBER_T1", "SUBSCRIBER_T2", "SUBSCRIBER_T3"],
      default: "SUBSCRIBER_T1",
    },
  },
  {
    timestamps: true,
  },
)

userSchema.index({ email: 1 })

export const UserModel = mongoose.model<UserDocument>("User", userSchema)
