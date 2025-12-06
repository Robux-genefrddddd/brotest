import { NextRequest, NextResponse } from "next/server"
import { sanitizeInput } from "@/lib/sanitize"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get user ID from Firebase Auth header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Sanitize input
    const message = sanitizeInput(body.message)
    const ticketId = body.ticketId ? sanitizeInput(body.ticketId) : undefined

    // TODO: Create or update support ticket
    // TODO: Call OpenRouter with support model (amazon/nova-2-lite-v1:free)
    // TODO: Save support message to Firestore
    // TODO: Log action

    return NextResponse.json(
      {
        success: true,
        message: "Support endpoint ready for OpenRouter integration",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to send support message",
      },
      { status: 400 }
    )
  }
}
