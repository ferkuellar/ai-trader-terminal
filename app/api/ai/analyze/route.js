import { NextResponse } from "next/server";
import { buildTradingAnalysisPrompt } from "@/lib/ai-prompt";
import { parseJsonObjectFromText, validateAnalysisPayload } from "@/lib/ai-validation";

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is missing in .env.local" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const prompt = buildTradingAnalysisPrompt(body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API ${response.status}: ${errText.slice(0, 300)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const textBlock = data.content?.find((block) => block.type === "text");
    if (!textBlock?.text) {
      return NextResponse.json({ error: "Anthropic response had no text content" }, { status: 502 });
    }

    const analysis = validateAnalysisPayload(parseJsonObjectFromText(textBlock.text));
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
