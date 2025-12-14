import mongoose from "mongoose"

let isConnected = false
let connectionPromise: Promise<void> | null = null

export async function connectDB(): Promise<void> {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise
  }

  // Start new connection with timeout
  connectionPromise = (async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/engagement-nexus"
      
      // Optimize for serverless: use connection pooling and shorter timeouts
      const options = {
        serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
        socketTimeoutMS: 10000, // 10 second socket timeout
        connectTimeoutMS: 10000, // 10 second connection timeout
        maxPoolSize: 1, // Serverless: keep pool small
        minPoolSize: 1,
      }

      // Add timeout wrapper to prevent hanging
      const connectWithTimeout = Promise.race([
        mongoose.connect(mongoUri, options),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("MongoDB connection timeout after 10 seconds")), 10000)
        ),
      ])

      await connectWithTimeout
      isConnected = true
      
      // Handle connection events for serverless
      mongoose.connection.on("disconnected", () => {
        isConnected = false
        connectionPromise = null
      })
    } catch (error) {
      isConnected = false
      connectionPromise = null
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
  })()

  return connectionPromise
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) {
    return
  }

  try {
    await mongoose.disconnect()
    isConnected = false
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
