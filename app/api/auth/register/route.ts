import { NextRequest, NextResponse } from "next/server"
import { sanitizeEmail, sanitizeInput } from "@/lib/sanitize"
import { validateEmail, validatePassword, validateUsername } from "@/lib/validation"
import { createApiResponse, logSecurityEvent, generateSecureId } from "@/lib/security"

// Placeholder user database (in production, use Firestore)
const users: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate inputs
    const usernameValidation = validateUsername(body.username)
    if (!usernameValidation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, usernameValidation.error),
        { status: 400 }
      )
    }

    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, emailValidation.error),
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, passwordValidation.error),
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(body.email)
    const sanitizedUsername = sanitizeInput(body.username)

    // Check if user already exists
    if (users[sanitizedEmail]) {
      logSecurityEvent({
        eventType: "REGISTRATION_FAILED_USER_EXISTS",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { email: sanitizedEmail },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "Email already registered"),
        { status: 409 }
      )
    }

    // Create new user
    const userId = generateSecureId()
    const hashedPassword = Buffer.from(body.password).toString("base64")

    const newUser = {
      id: userId,
      email: sanitizedEmail,
      name: sanitizedUsername,
      password: hashedPassword, // In production, use bcrypt/Argon2
      role: "user" as const,
      plan: "free" as const,
      status: "active" as const,
      quotaUsed: 0,
      quotaLimit: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    users[sanitizedEmail] = newUser

    // Generate token
    const token = Buffer.from(
      JSON.stringify({
        uid: userId,
        email: sanitizedEmail,
        role: "user",
      })
    ).toString("base64")

    logSecurityEvent({
      eventType: "REGISTRATION_SUCCESS",
      userId,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: { email: sanitizedEmail },
      severity: "low",
    })

    return NextResponse.json(
      createApiResponse(true, {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          plan: newUser.plan,
          quotaUsed: newUser.quotaUsed,
          quotaLimit: newUser.quotaLimit,
        },
      }),
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed"
    logSecurityEvent({
      eventType: "REGISTRATION_ERROR",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: { error: message },
      severity: "medium",
    })

    return NextResponse.json(
      createApiResponse(false, undefined, message),
      { status: 400 }
    )
  }
}
