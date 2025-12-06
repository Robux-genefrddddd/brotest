/**
 * OpenRouter API integration for AI responses
 */

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: Array<{
    message: OpenRouterMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatRequestOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

const OPENROUTER_BASE_URL = "https://openrouter.io/api/v1"

const DEFAULT_MODELS = {
  CHAT: "gpt-3.5-turbo",
  SUPPORT: "amazon/nova-2-lite-v1:free",
}

/**
 * Send a chat message to OpenRouter
 */
export async function sendChatMessage(
  messages: OpenRouterMessage[],
  options: ChatRequestOptions = {}
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured")
  }

  const model = options.model || DEFAULT_MODELS.CHAT
  const temperature = options.temperature ?? 0.7
  const maxTokens = options.maxTokens ?? 2000

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${error}`)
    }

    const data = (await response.json()) as OpenRouterResponse
    return data
  } catch (error) {
    throw new Error(
      `Failed to communicate with OpenRouter: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Send a support request using the support model
 */
export async function sendSupportMessage(
  messages: OpenRouterMessage[],
  options: ChatRequestOptions = {}
): Promise<OpenRouterResponse> {
  return sendChatMessage(messages, {
    ...options,
    model: options.model || DEFAULT_MODELS.SUPPORT,
  })
}

/**
 * Estimate token count for a message (rough approximation)
 * OpenRouter charges per token, so this helps estimate costs
 */
export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4)
}
