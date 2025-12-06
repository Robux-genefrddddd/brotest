/**
 * Security utilities for input sanitization and validation
 * Prevents XSS, NoSQL injection, and SQL injection attacks
 */

const DANGEROUS_PATTERNS = [
  "$ne",
  "$or",
  "$and",
  "$gt",
  "$lt",
  "$exists",
  "$regex",
  "==",
  "--",
  "/*",
  "*/",
]

const DANGEROUS_CHARACTERS = /[<>{}();:"'*$`]/g

const MAX_INPUT_LENGTH = 10000

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string")
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Check length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH}`)
  }

  // Check for dangerous patterns (case-insensitive)
  const lowerInput = sanitized.toLowerCase()
  for (const pattern of DANGEROUS_PATTERNS) {
    if (lowerInput.includes(pattern.toLowerCase())) {
      throw new Error(`Input contains forbidden pattern: ${pattern}`)
    }
  }

  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")

  // Remove control characters and normalize
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "")

  // Normalize unicode
  sanitized = sanitized.normalize("NFD")

  return sanitized
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new Error("Email must be a string")
  }

  const trimmed = email.trim().toLowerCase()

  if (!isValidEmail(trimmed)) {
    throw new Error("Invalid email format")
  }

  if (trimmed.length > 254) {
    throw new Error("Email exceeds maximum length")
  }

  return trimmed
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    throw new Error("URL must be a string")
  }

  try {
    const parsed = new URL(url)
    const allowedProtocols = ["http:", "https:"]

    if (!allowedProtocols.includes(parsed.protocol)) {
      throw new Error("Invalid URL protocol")
    }

    return parsed.toString()
  } catch (error) {
    throw new Error("Invalid URL")
  }
}

/**
 * Sanitize JSON input
 */
export function sanitizeJSON(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    throw new Error("Input must be an object")
  }

  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(input)) {
    // Sanitize key
    const sanitizedKey = sanitizeInput(key)

    // Sanitize value based on type
    if (typeof value === "string") {
      sanitized[sanitizedKey] = sanitizeInput(value)
    } else if (typeof value === "number") {
      sanitized[sanitizedKey] = value
    } else if (typeof value === "boolean") {
      sanitized[sanitizedKey] = value
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map((item) =>
        typeof item === "string" ? sanitizeInput(item) : item
      )
    } else if (value === null) {
      sanitized[sanitizedKey] = null
    } else {
      throw new Error(`Unsupported value type for key: ${key}`)
    }
  }

  return sanitized
}
