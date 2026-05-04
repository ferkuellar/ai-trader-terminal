export function parseJsonObjectFromText(text) {
  const clean = String(text || "").replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export function validateAnalysisPayload(payload) {
  const verdicts = new Set(["TRADE", "PASS", "WAIT"]);
  const biases = new Set(["bullish", "bearish", "neutral"]);

  if (!payload || typeof payload !== "object") {
    throw new Error("AI response was not an object");
  }
  if (!biases.has(payload.bias)) {
    throw new Error("AI response has invalid bias");
  }
  if (!verdicts.has(payload.verdict)) {
    throw new Error("AI response has invalid verdict");
  }
  if (!payload.setup || typeof payload.setup !== "object") {
    throw new Error("AI response is missing setup");
  }
  if (!payload.confluence || typeof payload.confluence !== "object") {
    throw new Error("AI response is missing confluence");
  }

  return payload;
}
