import { NextRequest, NextResponse } from "next/server"
import { sanitizeMessage } from "@/lib/sanitize"
import { validateSupportMessage } from "@/lib/validation"
import { createApiResponse } from "@/lib/security"
import { sendSupportMessage } from "@/lib/openrouter"

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

    // Validate message
    const validation = validateSupportMessage(body.message)
    if (!validation.valid) {
      return NextResponse.json(
        createApiResponse(false, undefined, validation.error),
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedMessage = sanitizeMessage(body.message)

    // Call OpenRouter with support model
    try {
      const aiResponse = await sendSupportMessage([
        {
          role: "user",
          content: sanitizedMessage,
        },
      ])

      const assistantMessage =
        aiResponse.choices[0]?.message.content || "Unable to generate response"

      return NextResponse.json(
        createApiResponse(true, {
          response: assistantMessage,
          tokensUsed: aiResponse.usage.total_tokens,
        }),
        { status: 200 }
      )
    } catch (aiError) {
      console.error("OpenRouter error:", aiError)
      // Fallback response if AI fails
      return NextResponse.json(
        createApiResponse(true, {
          response:
            "Thank you for contacting support. Our team will review your message and get back to you shortly.",
          tokensUsed: 0,
        }),
        { status: 200 }
      )
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Support request failed"
    return NextResponse.json(createApiResponse(false, undefined, message), {
      status: 400,
    })
  }
}
