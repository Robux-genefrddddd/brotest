import { NextRequest, NextResponse } from "next/server"
import { createApiResponse, logSecurityEvent } from "@/lib/security"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        createApiResponse(false, undefined, "Unauthorized"),
        { status: 401 }
      )
    }

    // TODO: Verify user is admin or founder
    // TODO: Fetch real stats from Firestore

    // Placeholder stats (in production, aggregate from Firestore)
    const stats = {
      totalUsers: 42,
      usersByPlan: {
        free: 28,
        classic: 10,
        pro: 4,
      },
      totalMessages: 1234,
      openTickets: 5,
      maintenanceMode: false,
    }

    logSecurityEvent({
      eventType: "ADMIN_DASHBOARD_ACCESSED",
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      details: { action: "Dashboard view" },
      severity: "low",
    })

    return NextResponse.json(
      createApiResponse(true, { stats }),
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard"
    logSecurityEvent({
      eventType: "ADMIN_DASHBOARD_ERROR",
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
