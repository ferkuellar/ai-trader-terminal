import { validateTradeRisk } from "@/lib/risk-engine";
import {
  validateRiskEngineInput,
  validateRiskEngineOutput,
} from "@/lib/risk-engine-validation";

export async function POST(request) {
  try {
    const body = await request.json();
    validateRiskEngineInput(body);

    const validation = validateTradeRisk(body);
    validateRiskEngineOutput(validation);

    return Response.json({ validation });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown risk validation error";
    const status = message.includes("output.") ? 500 : 400;
    return Response.json({ error: message }, { status });
  }
}
