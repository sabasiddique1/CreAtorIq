import type { Request, Response, NextFunction } from "express"

export interface ApiError extends Error {
  status?: number
  code?: string
}

export class ValidationError extends Error implements ApiError {
  status = 400
  code = "VALIDATION_ERROR"

  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class UnauthorizedError extends Error implements ApiError {
  status = 401
  code = "UNAUTHORIZED"

  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error implements ApiError {
  status = 403
  code = "FORBIDDEN"

  constructor(message = "Forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends Error implements ApiError {
  status = 404
  code = "NOT_FOUND"

  constructor(message = "Not found") {
    super(message)
    this.name = "NotFoundError"
  }
}

export function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void {
  console.error("[Error]:", err.message)

  const status = err.status || 500
  const message = err.message || "Internal server error"
  const code = err.code || "INTERNAL_ERROR"

  res.status(status).json({
    success: false,
    error: message,
    code,
  })
}
