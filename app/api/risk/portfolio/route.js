import { buildPortfolioRiskDashboard } from "@/lib/portfolio-risk-dashboard";
import {
  validatePortfolioRiskDashboard,
  validatePortfolioRiskInput,
} from "@/lib/portfolio-risk-validation";

export async function POST(request) {
  try {
    const body = await request.json();
    validatePortfolioRiskInput(body);

    const portfolioRisk = buildPortfolioRiskDashboard(body);
    validatePortfolioRiskDashboard(portfolioRisk);

    return Response.json({ portfolioRisk });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown portfolio risk error";
    const status = message.includes("output.") ? 500 : 400;
    return Response.json({ error: message }, { status });
  }
}
