import { NextResponse } from "next/server";
import {
  buildCryptoWatchlistPrompt,
  normalizeWatchlistTokens,
} from "@/lib/crypto-watchlist-prompt";
import { parseJsonObjectFromText } from "@/lib/ai-validation";
import { validateCryptoWatchlistPayload } from "@/lib/crypto-watchlist-validation";

const MAX_WATCHLIST_TOKENS = 25;

export async function POST(request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body?.tokens)) {
      return NextResponse.json({ error: "tokens must be an array" }, { status: 400 });
    }

    let tokens;
    try {
      tokens = normalizeWatchlistTokens(body.tokens);
    } catch (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (tokens.length < 2) {
      return NextResponse.json(
        { error: "At least 2 tokens are required" },
        { status: 400 }
      );
    }
    if (tokens.length > MAX_WATCHLIST_TOKENS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_WATCHLIST_TOKENS} tokens per request` },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const prompt = buildCryptoWatchlistPrompt({
      tokens,
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
        max_tokens: 6000,
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

    const watchlist = validateCryptoWatchlistPayload(parseJsonObjectFromText(textBlock.text), {
      tokens,
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Crypto watchlist request failed" }, { status: 500 });
  }
}
