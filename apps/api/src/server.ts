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

  // Connect to database
  // Wrap in try-catch to handle connection errors gracefully
  try {
    await connectDB()
  } catch (error) {
    console.error("Failed to connect to database:", error)
    // Don't throw here - allow the app to start but log the error
    // The app can still handle requests, but database operations will fail
    // This is better than crashing the entire serverless function
  }

  // Apollo GraphQL Server
  apolloServer = new ApolloServer<GraphQLContext>({
    typeDefs,
    resolvers,
  })

  await apolloServer.start()

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
  try {
    if (!appPromise) {
      appPromise = setupApp()
    }
    const app = await appPromise
    
    // Express apps are callable functions - invoke directly
    // Wrap in a Promise to ensure Vercel waits for the response to complete
    return new Promise<void>((resolve, reject) => {
      // Handle response completion via 'finish' event
      res.once('finish', () => resolve())
      res.once('close', () => resolve()) // Handle connection close
      
      // Create a next callback to handle errors
      const next = (err?: any) => {
        if (err) {
          reject(err)
        }
        // Don't resolve here - wait for response to finish
      }
      
      // Call Express app as a function (Express apps are callable)
      app(req, res, next)
    })
  } catch (error) {
    console.error("[Handler Error]:", error)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      })
    }
    throw error // Re-throw to let Vercel know the function failed
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
