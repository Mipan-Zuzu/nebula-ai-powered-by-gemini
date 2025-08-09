import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Google Generative AI API key not configured" }, { status: 500 })
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: prompt,
      maxTokens: 500,
    })

    return NextResponse.json({ text })
  } catch (error) {
    console.error("Error generating text:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
