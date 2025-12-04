import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics.";

    const model = google("gemini-2.5-flash"); // Lite also works

    const result = streamText({
      model,
      prompt,
    });

    // ⭐ THIS is the correct streaming return method
    return result.toTextStreamResponse();
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Something went wrong",
      }),
      { status: 500 }
    );
  }
}
