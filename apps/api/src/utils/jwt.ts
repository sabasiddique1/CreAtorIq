import jwt from "jsonwebtoken"
import type { User } from "@engagement-nexus/types"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-key"
const JWT_EXPIRES_IN = "24h"
const REFRESH_TOKEN_EXPIRES_IN = "7d"

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function generateRefreshToken(user: User): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  })
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload
  } catch (error) {
    return null
  }
}
