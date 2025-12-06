import { NextRequest, NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/sanitize"
import { validateLicenseKey } from "@/lib/validation"
import { createApiResponse, logSecurityEvent } from "@/lib/security"

// Placeholder license database (in production, use Firestore)
const licenses: Record<string, any> = {
  "CLASSIC-001-ABC-123": {
    key: "CLASSIC-001-ABC-123",
    planTarget: "classic",
    status: "active",
    usageLimit: 1,
    usageCount: 0,
    createdAt: new Date(),
  },
  "PRO-001-DEF-456": {
    key: "PRO-001-DEF-456",
    planTarget: "pro",
    status: "active",
    usageLimit: 1,
    usageCount: 0,
    createdAt: new Date(),
  },
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        createApiResponse(false, undefined, "Unauthorized"),
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate license key format
    const validation = validateLicenseKey(body.licenseKey)
    if (!validation.valid) {
      logSecurityEvent({
        eventType: "LICENSE_VERIFICATION_FAILED_INVALID_FORMAT",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { licenseKey: body.licenseKey },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "Invalid license key format"),
        { status: 400 }
      )
    }

    const sanitizedKey = sanitizeInput(body.licenseKey)

    // Check if license exists and is active
    const license = licenses[sanitizedKey]

    if (!license) {
      logSecurityEvent({
        eventType: "LICENSE_VERIFICATION_FAILED_NOT_FOUND",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { licenseKey: sanitizedKey },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "License key not found"),
        { status: 404 }
      )
    }

    if (license.status !== "active") {
      logSecurityEvent({
        eventType: "LICENSE_VERIFICATION_FAILED_INACTIVE",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { licenseKey: sanitizedKey, status: license.status },
        severity: "medium",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, `License is ${license.status}`),
        { status: 403 }
      )
    }

    // Check usage limit
    if (license.usageCount >= license.usageLimit) {
      logSecurityEvent({
        eventType: "LICENSE_VERIFICATION_FAILED_USAGE_LIMIT",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        details: { licenseKey: sanitizedKey },
        severity: "low",
      })
      return NextResponse.json(
        createApiResponse(false, undefined, "License has reached usage limit"),
        { status: 403 }
      )
    }

    // Mark license as used
    license.usageCount++
    license.usedAt = new Date()
    license.status = license.usageCount >= license.usageLimit ? "used" : "active"

    logSecurityEvent({
      eventType: "LICENSE_VERIFICATION_SUCCESS",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: { licenseKey: sanitizedKey, newPlan: license.planTarget },
      severity: "low",
    })

    return NextResponse.json(
      createApiResponse(true, {
        newPlan: license.planTarget,
        message: `Successfully upgraded to ${license.planTarget} plan`,
      }),
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "License verification failed"
    logSecurityEvent({
      eventType: "LICENSE_VERIFICATION_ERROR",
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
