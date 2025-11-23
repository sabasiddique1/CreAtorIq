import type { Request, Response, NextFunction } from "express"
import { verifyAccessToken, type JwtPayload } from "../utils/jwt.js"

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" })
    return
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    res.status(401).json({ error: "Unauthorized: Invalid token" })
    return
  }

  req.user = payload
  next()
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" })
      return
    }

    next()
  }
}

export function optional(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "")

  if (token) {
    const payload = verifyAccessToken(token)
    if (payload) {
      req.user = payload
    }
  }

  next()
}
