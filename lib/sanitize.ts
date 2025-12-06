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
  "$gte",
  "$lte",
  "$exists",
  "$regex",
  "$where",
  "$function",
  "==",
  "--",
  "/*",
  "*/",
  "<!--",
  "-->",
  "<script",
  "javascript:",
  "onerror",
  "onload",
  "onclick",
]

const DANGEROUS_CHARACTERS_REGEX = /[<>{}();"'*$`\n\r]/g

const MAX_INPUT_LENGTH = 10000
const MAX_MESSAGE_LENGTH = 15000
const MAX_EMAIL_LENGTH = 254

/**
 * Sanitize user input to prevent injection attacks
 * Encodes dangerous characters and validates against injection patterns
 */
export function sanitizeInput(input: unknown, maxLength: number = MAX_INPUT_LENGTH): string {
  if (typeof input !== "string") {
    throw new Error("Input must be a string")
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Check length
  if (sanitized.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength}`)
  }

  // Check for dangerous patterns (case-insensitive)
  const lowerInput = sanitized.toLowerCase()
  for (const pattern of DANGEROUS_PATTERNS) {
    if (lowerInput.includes(pattern.toLowerCase())) {
      throw new Error(`Input contains forbidden pattern: ${pattern}`)
    }
  }

  // Check for repeated dangerous characters (potential attack pattern)
  if (/<{2,}|>{2,}|&{2,}/.test(sanitized)) {
    throw new Error("Input contains suspicious character patterns")
  }

  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")

  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "")

  // Normalize unicode
  sanitized = sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  return sanitized
}

/**
 * Sanitize message input (allows newlines for chat)
 */
export function sanitizeMessage(input: unknown, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (typeof input !== "string") {
    throw new Error("Message must be a string")
  }

  // Trim whitespace but preserve intentional newlines
  let sanitized = input.trim()

  // Check length
  if (sanitized.length > maxLength) {
    throw new Error(`Message exceeds maximum length of ${maxLength}`)
  }

  // Check for dangerous patterns (case-insensitive)
  const lowerInput = sanitized.toLowerCase()
  for (const pattern of DANGEROUS_PATTERNS) {
    if (lowerInput.includes(pattern.toLowerCase())) {
      throw new Error(`Message contains forbidden pattern: ${pattern}`)
    }
  }

  // Encode HTML special characters (but preserve formatting)
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")

  // Remove control characters except newline and tab
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  // Normalize unicode
  sanitized = sanitized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  return sanitized
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new Error("Email must be a string")
  }

  const trimmed = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email format")
  }

  if (trimmed.length > MAX_EMAIL_LENGTH) {
    throw new Error("Email exceeds maximum length")
  }

  // Check for suspicious patterns in email
  const dangersInEmail = DANGEROUS_PATTERNS.some((p) =>
    trimmed.toLowerCase().includes(p.toLowerCase())
  )

  if (dangersInEmail) {
    throw new Error("Email contains invalid characters")
  }

  return trimmed
}

/**
 * Validate email format without sanitization
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= MAX_EMAIL_LENGTH
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
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
  } catch {
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
      // Validate number range to prevent overflow
      if (typeof value !== "number" || !isFinite(value)) {
        throw new Error(`Invalid number value for key: ${key}`)
      }
      sanitized[sanitizedKey] = value
    } else if (typeof value === "boolean") {
      sanitized[sanitizedKey] = value
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizeInput(item)
        }
        if (typeof item === "number" || typeof item === "boolean") {
          return item
        }
        if (item === null) {
          return null
        }
        throw new Error("Unsupported array item type")
      })
    } else if (value === null) {
      sanitized[sanitizedKey] = null
    } else {
      throw new Error(`Unsupported value type for key: ${key}`)
    }
  }

  return sanitized
}

/**
 * Escape string for use in regex safely
 */
export function escapeRegexString(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
