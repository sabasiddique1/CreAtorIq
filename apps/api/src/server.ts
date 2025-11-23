import "dotenv/config"
import express, { type Express } from "express"
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

async function startServer() {
  const app: Express = express()

  // Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(corsMiddleware())

  // Connect to database
  await connectDB()

  // Apollo GraphQL Server
  const apolloServer = new ApolloServer<GraphQLContext>({
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

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`)
  })
}

startServer().catch(console.error)
