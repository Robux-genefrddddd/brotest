/**
 * Input validation utilities
 */

import { sanitizeInput } from "./sanitize"

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateEmail(email: string): ValidationResult {
  const sanitized = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: "Invalid email format" }
  }

  if (sanitized.length > 254) {
    return { valid: false, error: "Email is too long" }
  }

  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter",
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one lowercase letter",
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one number",
    }
  }

  if (!/[!@#$%^&*]/.test(password)) {
    return {
      valid: false,
      error: "Password must contain at least one special character (!@#$%^&*)",
    }
  }

  return { valid: true }
}

export function validateUsername(username: string): ValidationResult {
  const sanitized = username.trim()

  if (sanitized.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" }
  }

  if (sanitized.length > 50) {
    return { valid: false, error: "Username must be at most 50 characters" }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
    return {
      valid: false,
      error: "Username can only contain letters, numbers, hyphens, and underscores",
    }
  }

  return { valid: true }
}

export function validateMessage(message: string): ValidationResult {
  const sanitized = message.trim()

  if (sanitized.length === 0) {
    return { valid: false, error: "Message cannot be empty" }
  }

  if (sanitized.length > 10000) {
    return { valid: false, error: "Message is too long (max 10000 characters)" }
  }

  try {
    sanitizeInput(sanitized)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid message content",
    }
  }
}

export function validateLicenseKey(key: string): ValidationResult {
  const sanitized = key.trim()

  if (sanitized.length < 10) {
    return { valid: false, error: "Invalid license key format" }
  }

  if (sanitized.length > 100) {
    return { valid: false, error: "Invalid license key format" }
  }

  if (!/^[A-Z0-9\-]+$/.test(sanitized)) {
    return {
      valid: false,
      error: "License key contains invalid characters",
    }
  }

  return { valid: true }
}

export function validateConversationTitle(title: string): ValidationResult {
  const sanitized = title.trim()

  if (sanitized.length === 0) {
    return { valid: false, error: "Title cannot be empty" }
  }

  if (sanitized.length > 200) {
    return { valid: false, error: "Title is too long (max 200 characters)" }
  }

  try {
    sanitizeInput(sanitized)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid title content",
    }
  }
}

export function validateSupportMessage(message: string): ValidationResult {
  const sanitized = message.trim()

  if (sanitized.length === 0) {
    return { valid: false, error: "Support message cannot be empty" }
  }

  if (sanitized.length > 5000) {
    return {
      valid: false,
      error: "Support message is too long (max 5000 characters)",
    }
  }

  try {
    sanitizeInput(sanitized)
    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Invalid message content",
    }
  }
}

export function validateUrl(url: string): ValidationResult {
  try {
    const parsed = new URL(url)
    const allowedProtocols = ["http:", "https:"]

    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: "Invalid URL protocol" }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }
}
