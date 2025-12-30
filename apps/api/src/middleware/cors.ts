import cors from "cors"
import type { Request, Response, NextFunction } from "express"

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map(origin => origin.trim())
  .filter(origin => origin.length > 0)

// Check if origin matches Vercel preview URL pattern
function isVercelPreviewUrl(origin: string): boolean {
  // Vercel preview URLs pattern: *.vercel.app
  // Examples: 
  // - https://project-name.vercel.app (production)
  // - https://project-name-abc123.vercel.app (preview)
  // - https://project-name-abc123-sabasiddique1s-projects.vercel.app (preview with team)
  return /^https?:\/\/.*\.vercel\.app$/.test(origin)
}

export function corsMiddleware() {
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      try {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true)
        }
        
        // Check if origin is in allowed list (exact match)
        if (ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true)
        }
        
        // Allow Vercel preview URLs (for preview deployments)
        if (isVercelPreviewUrl(origin)) {
          console.log(`CORS: Allowing Vercel URL: ${origin}`)
          return callback(null, true)
        }
        
        // Block if not in allowed list
        console.warn(`CORS: Blocked origin ${origin}. Allowed origins: ${ALLOWED_ORIGINS.join(", ")}, or any *.vercel.app`)
        callback(new Error(`CORS: Origin ${origin} not allowed`))
      } catch (error) {
        console.error("CORS middleware error:", error)
        // Re-throw to let cors library handle it
        callback(error as Error)
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Type"],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 200,
  }

  return cors(corsOptions)
}
