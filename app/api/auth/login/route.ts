import { NextRequest, NextResponse } from "next/server"
import { sanitizeEmail, sanitizeInput } from "@/lib/sanitize"
import { validateEmail, validatePassword } from "@/lib/validation"
import { createApiResponse, logSecurityEvent } from "@/lib/security"

// Placeholder user database (in production, use Firestore)
const users: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate and sanitize inputs
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      logSecurityEvent({
        eventType: "LOGIN_FAILED_INVALID_EMAIL",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { email: body.email },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "Invalid email format"),
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(body.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, "Invalid password format"),
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeEmail(body.email)

    // In production, verify against Firebase or database
    // This is a placeholder implementation
    const user = users[sanitizedEmail]

    if (!user) {
      logSecurityEvent({
        eventType: "LOGIN_FAILED_USER_NOT_FOUND",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { email: sanitizedEmail },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "Invalid credentials"),
        { status: 401 }
      )
    }

    // In production, use Firebase Auth or bcrypt comparison
    if (user.password !== Buffer.from(body.password).toString("base64")) {
      logSecurityEvent({
        eventType: "LOGIN_FAILED_INVALID_PASSWORD",
        userId: user.id,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { email: sanitizedEmail },
        severity: "medium",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "Invalid credentials"),
        { status: 401 }
      )
    }

    // Generate token (in production, use Firebase tokens)
    const token = Buffer.from(
      JSON.stringify({
        uid: user.id,
        email: sanitizedEmail,
        role: user.role,
      })
    ).toString("base64")

    logSecurityEvent({
      eventType: "LOGIN_SUCCESS",
      userId: user.id,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: { email: sanitizedEmail },
      severity: "low",
    })

    return NextResponse.json(
      createApiResponse(true, {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          quotaUsed: user.quotaUsed || 0,
          quotaLimit: user.quotaLimit || 10,
        },
      }),
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed"
    logSecurityEvent({
      eventType: "LOGIN_ERROR",
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
