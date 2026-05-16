# CODEX MEMORY - AI TRADER TERMINAL

You are working inside:

github.com/ferkuellar/ai-trader-terminal

This project is a crypto intelligence terminal built with Next.js.

It is NOT a trading execution bot.

The system must analyze crypto markets, evaluate risk, build scenarios, generate reports, and support human decision-making.

Never implement:
- live trade execution
- automatic buy/sell orders
- exchange private key handling
- wallet access
- leverage execution
- hidden financial advice
- guaranteed signals

Always preserve:
- server-side secrets only
- structured outputs
- deterministic risk validation
- explainable AI analysis
- audit documentation
- clean modular architecture

---

## Product Identity

AI Trader Terminal is a professional crypto intelligence platform.

Its purpose is to answer:

1. What is happening in the market?
2. Why is it happening?
3. What scenarios are possible?
4. What validates or invalidates each scenario?
5. What are the risks?

The platform should behave like:

- crypto research terminal
- risk analysis system
- market structure intelligence layer
- portfolio exposure assistant
- AI analyst dashboard

It must not behave like:

- signal seller
- auto-trading bot
- prediction oracle
- hype generator

---

## Architecture Direction

Preferred structure:

```txt
src/
  lib/
    agents/
      types.ts
      market-data-analyst.ts
      technical-analyst.ts
      market-structure-analyst.ts
      sentiment-analyst.ts
      bull-researcher.ts
      bear-researcher.ts
      risk-manager.ts
      portfolio-analyst.ts
      research-manager.ts

    orchestration/
      crypto-analysis-orchestrator.ts

    prompts/
      global-rules.ts
      agent-prompts.ts

    reports/
      crypto-report-builder.ts

    validation/
      agent-output-validator.ts

    adapters/
      market-data-provider.ts
      local-state-adapter.ts

    config/
      app-config.ts

docs/
  audits/
```

Do not force this structure if equivalent folders already exist. Reuse existing structure when possible.

---

## Multi-Agent Design

Adapt the best concept from TradingAgents:

- specialized analysts
- bullish researcher
- bearish researcher
- risk manager
- research manager
- structured synthesis

But redesign it for crypto intelligence.

Do not copy stock-trading execution behavior.

Main agents:

### MarketDataAnalyst

Reads normalized market data and evaluates data quality.

### TechnicalAnalyst

Evaluates RSI, MACD, EMA/SMA, ATR, Bollinger Bands, VWAP, volume, volatility, momentum.

### MarketStructureAnalyst

Evaluates BOS, CHoCH, HH/HL/LH/LL, support, resistance, liquidity zones, supply/demand.

### SentimentAnalyst

Uses sentiment/news data only if available. Never invent sentiment.

### BullResearcher

Builds the strongest bullish case with triggers, confirmations, invalidations, and risks.

### BearResearcher

Builds the strongest bearish case with triggers, confirmations, invalidations, and risks.

### RiskManager

Reviews all assumptions. Penalizes weak data, overconfidence, leverage risk, volatility risk, and liquidity trap risk.

### PortfolioAnalyst

Evaluates exposure, concentration, correlation, and portfolio fragility when portfolio data exists.

### ResearchManager

Synthesizes all outputs into the final structured report.

---

## Orchestration Flow

Use this order:

```txt
MarketDataAnalyst
↓
TechnicalAnalyst
↓
MarketStructureAnalyst
↓
SentimentAnalyst
↓
BullResearcher
↓
BearResearcher
↓
RiskManager
↓
PortfolioAnalyst
↓
ResearchManager
```

Main function target:

```ts
runCryptoMultiAgentAnalysis(input)
```

Expected return:

```ts
{
  finalReport,
  agentTrace
}
```

`agentTrace` is for internal audit/debugging.

---

## Output Rules

Every final report must include:

- symbol
- timeframe
- market bias
- confidence level
- executive summary
- market context
- technical view
- structure view
- bullish scenario
- bearish scenario
- neutral scenario
- risk assessment
- data quality warning
- disclaimer

Never produce direct trading commands.

Use this disclaimer:

```txt
Educational and research-oriented analysis only. Not financial advice.
```

---

## Global AI Rules

- Never hallucinate market data.
- Never guarantee predictions.
- Never say "buy now" or "sell now".
- Never recommend leverage.
- Always include risk.
- Always include invalidation.
- Always separate facts, assumptions, and interpretations.
- If data is missing, state it clearly.
- Keep outputs structured and JSON-compatible when possible.

---

## Design Patterns

Use patterns only when useful.

### Singleton

Use for:

- config
- logger
- environment validator

### Observer

Use for:

- alerts
- watchlist changes
- portfolio risk changes
- market condition events

### Factory

Use for:

- agent creation
- AI provider creation
- market data provider creation
- report generator creation

### Strategy

Use for:

- scoring models
- risk models
- analysis styles
- timeframe logic

### Decorator

Use for:

- logging wrappers
- validation wrappers
- retry wrappers
- caching wrappers

### Builder

Use for:

- final report construction
- scenario matrix construction
- AI prompt payload construction

### Facade

Use for:

- simplified access to analysis subsystem

### Adapter

Use for:

- local JSON storage
- future Binance public data
- CoinGecko
- DefiLlama
- database migration

---

## Platform Patterns

The system should support:

### Automation

Automated analysis refresh, watchlist scoring, risk validation, report generation, and alert preparation.

### Adoption Map

Track modules as:

- planned
- prototype
- local functional
- validated
- production-ready
- deprecated

### Autoprovisioning

Support future provisioning of:

- watchlists
- analysis profiles
- user risk profiles
- report templates
- data providers

### Tagging Strategy

Every asset, report, alert, snapshot, and portfolio item should support metadata:

- symbol
- timeframe
- risk_level
- strategy_type
- market_regime
- source
- confidence_level
- created_at
- updated_at

### Maturity Model

Classify modules:

- Level 0: prototype
- Level 1: local functional
- Level 2: tested
- Level 3: documented/auditable
- Level 4: production-ready
- Level 5: scalable/multi-user-ready

### Deprovisioning

Detect and remove:

- dead components
- unused API routes
- obsolete mocks
- duplicate logic
- abandoned utilities
- unclear files

Document removals before deleting.

### Continuous Improvement

Every phase must include:

- initial audit
- technical plan
- created files
- modified files
- implementation summary
- validation
- risks
- final audit
- suggested commit

Audit file pattern:

```txt
docs/audits/auditoria-fase-<name>.md
```

### Optimization

Priority order:

1. correctness
2. security
3. maintainability
4. observability
5. performance
6. UI polish

Do not optimize prematurely.

---

## Security Rules

Never expose:

- ANTHROPIC_API_KEY
- OpenAI keys
- exchange private keys
- wallet keys
- secret endpoints

AI calls requiring secrets must stay server-side.

The browser receives only sanitized results.

---

## API Route Rules

When modifying API routes:

- validate request input
- handle errors safely
- return structured JSON
- avoid leaking stack traces
- never expose env vars
- preserve existing contracts unless intentionally refactoring

Preferred endpoint behavior:

```txt
/api/analyze
-> runs multi-agent analysis

/api/risk
-> runs deterministic risk validation

/api/score
-> ranks assets

/api/compare
-> compares assets

/api/portfolio
-> evaluates portfolio exposure
```

---

## Validation Rules

Before coding:

1. inspect existing structure
2. identify current API routes
3. identify current risk engine
4. identify current AI provider logic
5. avoid duplicate logic

After coding:

1. run npm run lint
2. run npm run build
3. test affected API/UI flow
4. update audit documentation
5. suggest commit message

Never claim validation passed unless commands were executed.

---

## Documentation Rules

Every meaningful phase must create/update:

```txt
docs/audits/auditoria-fase-<name>.md
```

The audit must include:

1. initial audit
2. technical plan
3. files created
4. files modified
5. implementation
6. validation
7. risks
8. final audit
9. suggested commit

---

## Current Priority

Build the crypto multi-agent intelligence layer first.

Do not add:

- LangGraph
- vector memory
- database migration
- paid auth
- SaaS billing
- live trading
- autonomous execution

Current target:

```txt
input -> agents -> risk review -> research manager -> final report
```

Keep the system clean, auditable, and extendable.

---

# Extended Platform Memory - AI Trader Terminal (Operating System Layer)

This system is not only a codebase.

It is evolving into a crypto intelligence platform with operational, analytical, and continuous improvement capabilities.

The following platform-level patterns must be integrated progressively.

---

## Automation

The system must automate repetitive intelligence workflows:

- watchlist analysis refresh
- scenario generation
- risk validation
- portfolio exposure analysis
- report generation
- alert preparation

Automation must be:

- deterministic where possible
- auditable
- idempotent
- safe, with no destructive side effects

Never automate:

- trade execution
- account control
- financial decisions

---

## Adoption Map

Maintain a clear adoption map of system components.

Each module must be classified as:

- planned
- prototype
- local functional
- validated
- production-ready
- deprecated

Example:

```json
{
  "multi_agent_engine": "local_functional",
  "risk_engine": "validated",
  "portfolio_engine": "prototype",
  "alert_system": "planned"
}
```

This map must guide:

- development priorities
- refactoring decisions
- production readiness

---

## Autoprovisioning

The system must support controlled provisioning of:

- watchlists
- analysis profiles
- risk profiles
- report templates
- data providers
- alert configurations

Provisioning must:

- follow validated schemas
- include default safe values
- include audit logs
- avoid uncontrolled creation

Do not over-engineer infrastructure early.

Design clean interfaces first.

---

## Routing Strategy

Define how analysis flows through the system.

Routing must be:

- explicit
- deterministic
- debuggable

Example routing:

```txt
input -> normalize data -> select agents -> run analysis -> validate outputs -> synthesize report -> return result
```

Future routing must support:

- different analysis modes, such as fast vs deep
- different risk profiles
- different user contexts
- multi-asset batch analysis

Never allow hidden or implicit routing.

---

## Maturity Model

Every module must be classified:

- Level 0: prototype
- Level 1: local functional
- Level 2: tested
- Level 3: documented and auditable
- Level 4: production-ready
- Level 5: scalable / multi-user

A module cannot move forward unless:

- behavior is predictable
- outputs are validated
- risks are documented

---

## Deprovisioning (Critical)

The system must actively identify and remove:

- unused components
- dead API routes
- obsolete logic
- duplicate modules
- abandoned experiments
- unclear utilities

Before removing:

- document what is being removed
- confirm no dependencies
- define rollback path

Never keep ghost logic in the system.

---

## Continuous Improvement System

Every development phase must include:

1. Initial audit
2. Technical plan
3. Implementation
4. Validation
5. Risk analysis
6. Final audit

All phases must produce:

```txt
docs/audits/auditoria-fase-<name>.md
```

The system must improve through:

- structured iteration
- measurable changes
- documented decisions
- removal of weak assumptions

---

## Optimization

Optimization must follow strict order:

1. correctness
2. security
3. clarity
4. maintainability
5. observability
6. performance

Never optimize prematurely.

Never sacrifice clarity for micro-performance gains.

---

## Reference Values (Baselines)

Define system reference values for decision consistency.

Examples:

- max risk per position
- max portfolio exposure
- acceptable volatility range
- minimum reward/risk ratio
- max acceptable drawdown
- acceptable AI response latency
- acceptable API error rate

These must be:

- configurable
- centralized
- not hardcoded across the codebase

---

## Operational Change Control

Any change that affects system behavior must be documented.

Each change must include:

- what changed
- why it changed
- impacted modules
- impacted APIs
- potential risks
- validation performed

This applies to:

- logic changes
- risk rules
- analysis models
- scoring systems
- routing behavior

---

## Ecosystem Change Points

Clearly define where changes can occur in the system:

- data ingestion layer
- analysis layer (agents)
- risk validation layer
- orchestration layer
- report generation layer
- API layer
- UI layer

No hidden side effects between layers.

Changes must be isolated and traceable.

---

## Final Principle

This system must evolve as:

- modular
- auditable
- deterministic where possible
- explainable
- risk-aware
- continuously improving

Not as:

- experimental chaos
- black-box AI
- signal generator
- uncontrolled system
