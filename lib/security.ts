/**
 * Security utilities for API protection
 * Includes rate limiting, CORS, authentication checks
 */

import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitStore: RateLimitStore = {}

/**
 * Rate limiter middleware
 * Limits requests per IP address
 */
export function createRateLimiter(maxRequests: number = 10, windowMs: number = 60000) {
  return (request: NextRequest) => {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const now = Date.now()
    const key = `${ip}`

    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
      return null
    }

    const record = rateLimitStore[key]

    if (now > record.resetTime) {
      record.count = 1
      record.resetTime = now + windowMs
      return null
    }

    record.count++

    if (record.count > maxRequests) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 }
      )
    }

    return null
  }
}

/**
 * Verify Firebase token from request headers
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)

  try {
    // Token verification will be done with Firebase Admin SDK
    // This is a placeholder - actual verification happens in the API route
    return token
  } catch {
    return null
  }
}

/**
 * Generate secure random string (for IDs, tokens, etc.)
 */
export function generateSecureId(length: number = 32): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    result += charset[randomIndex]
  }

  return result
}

/**
 * Hash password using crypto (for demonstration)
 * In production, use bcrypt or Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  // This is a placeholder
  // In production, use: bcrypt.hash(password, 10) or Argon2
  return Buffer.from(password).toString("base64")
}

/**
 * Verify password hash
 */
export async function verifyPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  // This is a placeholder
  // In production, use: bcrypt.compare(password, hash) or Argon2
  return Buffer.from(password).toString("base64") === hash
}

/**
 * Generate CORS headers
 */
export function getCORSHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  }
}

/**
 * Validate request origin
 */
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3000",
    "https://vania.app",
  ]

  return allowedOrigins.includes(origin)
}

/**
 * Create secure API response
 */
export function createApiResponse<T = unknown>(
  success: boolean,
  data?: T,
  error?: string
) {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Log security event
 */
export interface SecurityEvent {
  timestamp: Date
  eventType: string
  userId?: string
  ipAddress?: string
  details: Record<string, unknown>
  severity: "low" | "medium" | "high" | "critical"
}

export function logSecurityEvent(event: Omit<SecurityEvent, "timestamp">): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  }

  // In production, send to logging service (e.g., Sentry, LogRocket)
  console.log("[SECURITY EVENT]", JSON.stringify(fullEvent, null, 2))
}

/**
 * Validate request method
 */
export function validateRequestMethod(
  request: NextRequest,
  allowedMethods: string[]
): boolean {
  return allowedMethods.includes(request.method)
}

/**
 * Check if IP is in blocklist (simple implementation)
 */
const ipBlocklist: Set<string> = new Set()

export function isIPBlocked(ip: string): boolean {
  return ipBlocklist.has(ip)
}

export function blockIP(ip: string): void {
  ipBlocklist.add(ip)
}

export function unblockIP(ip: string): void {
  ipBlocklist.delete(ip)
}
