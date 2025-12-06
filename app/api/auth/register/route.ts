import { NextRequest, NextResponse } from "next/server"
import { sanitizeEmail, sanitizeInput } from "@/lib/sanitize"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Sanitize inputs
    const email = sanitizeEmail(body.email)
    const name = sanitizeInput(body.name || "")
    const password = body.password

    // Validate password
    if (!password || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        },
        { status: 400 }
      )
    }

    // TODO: Create user in Firebase Auth
    // TODO: Create user document in Firestore
    // TODO: Log registration action

    return NextResponse.json(
      {
        success: true,
        message: "Registration endpoint ready for Firebase integration",
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 400 }
    )
  }
}
