import "dotenv/config"
import express, { type Express, type Request, type Response } from "express"
import cookieParser from "cookie-parser"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
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
let appPromise: Promise<Express> | null = null

async function setupApp(): Promise<Express> {
  if (appInstance) {
    return appInstance
  }

  const app: Express = express()

  // Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(corsMiddleware())

  // Connect to database with timeout protection
  // Wrap in try-catch to handle connection errors gracefully
  try {
    await connectDB()
  } catch (error) {
    console.error("Failed to connect to database:", error)
    // Don't throw here - allow the app to start but log the error
    // The app can still handle requests, but database operations will fail
    // This is better than crashing the entire serverless function
    // In serverless, we'll retry on the next request
  }

  // Apollo GraphQL Server - optimized for serverless
  apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
    // Optimize for serverless: disable features that add overhead
    introspection: process.env.NODE_ENV !== "production",
    // Reduce startup time by not waiting for schema validation
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
    // Continue anyway - GraphQL endpoint will fail but other routes work
  }

  // GraphQL endpoint with optional auth
  app.use(
    "/graphql",
    optional,
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({
        user: (req as any).user,
        req,
        res,
      }),
    }),
  )

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  })

  // Error handler
  app.use(errorHandler)

  appInstance = app
  return app
}

// For Vercel: export handler that initializes app on first request
// Vercel serverless functions need a default export
export default async function handler(req: Request, res: Response) {
  // Set a maximum timeout for the entire handler (50 seconds for Pro plan, 25 for Hobby)
  // This prevents the function from hanging indefinitely
  const MAX_HANDLER_TIMEOUT = 25000 // 25 seconds (safe margin for 30s Hobby plan)
  
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      console.error("[Handler] Request timeout after", MAX_HANDLER_TIMEOUT, "ms")
      res.status(504).json({
        success: false,
        error: "Request timeout - the operation took too long",
        code: "TIMEOUT",
      })
    }
  }, MAX_HANDLER_TIMEOUT)

  try {
    // Initialize app with timeout protection
    if (!appPromise) {
      appPromise = Promise.race([
        setupApp(),
        new Promise<Express>((_, reject) =>
          setTimeout(() => reject(new Error("App setup timeout after 15 seconds")), 15000)
        ),
      ])
    }
    
    const app = await appPromise
    
    // Clear the timeout once we have the app
    clearTimeout(timeoutId)
    
    // Express apps are callable functions - invoke directly
    // Wrap in a Promise to ensure Vercel waits for the response to complete
    return new Promise<void>((resolve, reject) => {
      // Set a new timeout for the actual request handling
      const requestTimeout = setTimeout(() => {
        if (!res.headersSent) {
          console.error("[Handler] Request processing timeout")
          res.status(504).json({
            success: false,
            error: "Request processing timeout",
            code: "TIMEOUT",
          })
          resolve() // Resolve to prevent hanging
        }
      }, 20000) // 20 seconds for request processing
      
      // Handle response completion via 'finish' event
      res.once('finish', () => {
        clearTimeout(requestTimeout)
        resolve()
      })
      res.once('close', () => {
        clearTimeout(requestTimeout)
        resolve() // Handle connection close
      })
      
      // Create a next callback to handle errors
      const next = (err?: any) => {
        if (err) {
          clearTimeout(requestTimeout)
          reject(err)
        }
        // Don't resolve here - wait for response to finish
      }
      
      // Call Express app as a function (Express apps are callable)
      app(req, res, next)
    })
  } catch (error) {
    clearTimeout(timeoutId)
    console.error("[Handler Error]:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        code: "INTERNAL_ERROR",
      })
    }
    // Don't re-throw in serverless - let the response be sent
    // Re-throwing can cause Vercel to show an error page instead of JSON
  }
}

// For local development: start the server if not in Vercel environment
if (process.env.VERCEL !== "1" && !process.env.VERCEL_ENV) {
  setupApp()
    .then((app) => {
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`)
        console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
      })
    })
    .catch(console.error)
}
