import mongoose from "mongoose"

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log("MongoDB already connected")
    return
  }

  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/engagement-nexus"
    await mongoose.connect(mongoUri)
    isConnected = true
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    // In serverless environments, don't exit the process - throw instead
    // This allows Vercel to handle the error gracefully
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      throw error
    } else {
      // Only exit in non-serverless environments (local dev)
      process.exit(1)
    }
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
    console.log("MongoDB disconnected")
  } catch (error) {
    console.error("MongoDB disconnection failed:", error)
    // In serverless environments, don't exit the process - throw instead
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      throw error
    } else {
      // Only exit in non-serverless environments (local dev)
      process.exit(1)
    }
  }
}
