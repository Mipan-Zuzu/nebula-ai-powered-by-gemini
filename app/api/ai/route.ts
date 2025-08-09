import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": "AIzaSyCtZoYBatwZ5ve8KmF-0edsBx8nAxHwtCE",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: text,
                },
              ],
            },
          ],
        }),
      },
    )

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error.message })
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response"

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get AI response" })
  }
}
