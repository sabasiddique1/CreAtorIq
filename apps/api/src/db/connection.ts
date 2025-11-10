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
    process.exit(1)
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
    process.exit(1)
  }
}
