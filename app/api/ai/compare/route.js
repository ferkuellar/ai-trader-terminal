import { NextResponse } from "next/server";
import { buildCryptoComparePrompt, normalizeCryptoToken } from "@/lib/crypto-compare-prompt";
import { parseJsonObjectFromText } from "@/lib/ai-validation";
import { validateCryptoComparePayload } from "@/lib/crypto-compare-validation";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body?.tokenA || !body?.tokenB) {
      return NextResponse.json({ error: "tokenA and tokenB are required" }, { status: 400 });
    }

    let tokenA;
    let tokenB;
    try {
      tokenA = normalizeCryptoToken(body.tokenA);
      tokenB = normalizeCryptoToken(body.tokenB);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (tokenA === tokenB) {
      return NextResponse.json({ error: "tokenA and tokenB must be different" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const prompt = buildCryptoComparePrompt({
      tokenA,
      tokenB,
      market: body?.market ?? {},
      context: body?.context ?? {},
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
        max_tokens: 4000,
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

    const comparison = validateCryptoComparePayload(parseJsonObjectFromText(textBlock.text), {
      tokenA,
      tokenB,
    });

    return NextResponse.json({ comparison });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Crypto compare request failed" }, { status: 500 });
  }
}
