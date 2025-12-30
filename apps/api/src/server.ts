import "dotenv/config"
import express, { type Express, type Request, type Response } from "express"
import cookieParser from "cookie-parser"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import mongoose from "mongoose"
import { connectDB } from "./db/index.js"
import { corsMiddleware } from "./middleware/cors.js"
import { optional } from "./middleware/auth.js"
import { errorHandler } from "./middleware/error-handler.js"
import { typeDefs } from "./graphql/schema.js"
import { resolvers, type GraphQLContext } from "./graphql/resolvers.js"

const PORT = process.env.PORT || 3001

// Initialize Apollo Server (will be started in setupApp)
let apolloServer: ApolloServer<GraphQLContext> | null = null
let appInstance: Express | null = null
let servicesInitializing = false

// Initialize app synchronously - routes must be available immediately
function createApp(): Express {
  if (appInstance) {
    return appInstance
  }

  const app: Express = express()

  // CORS must be first to handle preflight requests
  app.use(corsMiddleware())

  // Handle Vercel rewrites - strip /api prefix if present (before other middleware)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      req.url = req.url.replace('/api', '')
    }
    next()
  })

  // Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())

  // Health check endpoint - MUST be first and work immediately
  app.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      apollo: apolloServer ? "ready" : "not ready"
    })
  })

  // GraphQL endpoint - check if Apollo is ready before handling
  app.use("/graphql", optional, (req, res, next) => {
    if (!apolloServer) {
      return res.status(503).json({
        success: false,
        error: "GraphQL server is not ready yet. Please try again in a moment.",
        code: "SERVICE_UNAVAILABLE",
      })
    }
    
    // Apollo is ready, use the middleware
    const middleware = expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({
        user: (req as any).user,
        req,
        res,
      }),
    })
    
    return middleware(req, res, next)
  })

  // Error handler
  app.use(errorHandler)

  appInstance = app
  return app
}

// Initialize async services in background (non-blocking)
async function initializeServices(): Promise<void> {
  if (servicesInitializing) {
    return // Already initializing
  }
  
  servicesInitializing = true
  
  try {
    // Connect to database with timeout protection
    try {
      await connectDB()
    } catch (error) {
      console.error("Failed to connect to database:", error)
      // Don't throw - allow app to continue
    }

    // Apollo GraphQL Server - optimized for serverless
    if (!apolloServer) {
      apolloServer = new ApolloServer<GraphQLContext>({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== "production",
        stopOnTerminationSignals: false,
      })

      // Start Apollo with timeout protection
      try {
        await Promise.race([
          apolloServer.start(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Apollo Server startup timeout")), 10000)
          ),
        ])
      } catch (error) {
        console.error("Failed to start Apollo Server:", error)
        apolloServer = null // Mark as failed
      }
    }
  } finally {
    servicesInitializing = false
  }
}

// For Vercel: export handler that initializes app on first request
// Vercel serverless functions need a default export
export default async function handler(req: Request, res: Response) {
  try {
    // Get or create app (synchronous - returns immediately)
    const app = createApp()
    
    // Start services initialization in background (non-blocking)
    if (!servicesInitializing && !apolloServer) {
      initializeServices().catch(console.error)
    }
    
    // Handle the request with Express
    // Use a Promise wrapper to ensure Vercel waits for response
    return new Promise<void>((resolve) => {
      // Set timeout for request processing (25 seconds)
      const requestTimeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error("[Handler] Request processing timeout")
          res.status(504).json({
            success: false,
            error: "Request processing timeout",
            code: "TIMEOUT",
          })
        }
        resolve()
      }, 25000)
      
      // Handle response completion
      const cleanup = () => {
        clearTimeout(requestTimeout)
        resolve()
      }
      
      res.once('finish', cleanup)
      res.once('close', cleanup)
      
      // Handle errors
      const next = (err?: any) => {
        if (err) {
          console.error("[Handler] Express error:", err)
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              error: err.message || "Internal server error",
              code: "INTERNAL_ERROR",
            })
          }
          cleanup()
        }
      }
      
      // Invoke Express app
      app(req, res, next)
    })
  } catch (error) {
    console.error("[Handler Error]:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_ERROR",
      })
    }
  }
}

// For local development: start the server if not in Vercel environment
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
  const app = createApp()
  initializeServices()
    .then(() => {
      app.listen(PORT, () => {
        // Server started
      })
    })
    .catch(console.error)
}
