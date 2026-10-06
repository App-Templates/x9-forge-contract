/**
 * cap-ricerca contracts — sub-path `@x9-forge/contracts/capability/ricerca` (v1.28.0, Phase 54).
 *
 * Budgeted, goal-driven web research in cascades for any agent the capability is attached to. The agent's
 * configuration (budget never exceeded, models, research parameters, source rule) and its day-by-day spend live here.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca (server), services/cap-lab and services/cap-food (callers),
 * forge-v2 agent management (control panel), enterprise-adoption ea-core (caller, after its migration).
 *
 * STRICT (internal boundary, R-14): no `.passthrough()`.
 */
export { CapabilityAgentIdSchema, AgentConfigVersionSchema, AgentTimeZoneSchema, ResearchBudgetSchema, ResearchModelsSchema, ResearchEffortSchema, ResearchParamsSchema, SourceRuleSchema, ResearchAgentConfigSchema, type ResearchBudget, type ResearchModels, type ResearchParams, type SourceRule, type ResearchAgentConfig, } from "./agent-config.cjs";
export { ResearchIdSchema, WebUrlSchema, ResearchRequestSchema, ResearchStateSchema, ResearchSourceSchema, ResearchFindingSchema, ResearchCostSchema, ResearchResultSchema, type ResearchRequest, type ResearchState, type ResearchSource, type ResearchFinding, type ResearchCost, type ResearchResult, } from "./research.cjs";
export { AgentDaySchema, SpendingCapabilitySchema, AgentSpendDaySchema, type SpendingCapability, type AgentSpendDay } from "./spend.cjs";
export { RICERCA_TOOLS, RicercaToolErrorSchema, ResearchStartInputSchema, ResearchStartOutputSchema, ResearchStatusInputSchema, ResearchStatusOutputSchema, ResearchResultInputSchema, ResearchResultOutputSchema, type RicercaToolName, type RicercaToolError, type ResearchStartInput, type ResearchStartOutput, type ResearchStatusInput, type ResearchStatusOutput, type ResearchResultInput, type ResearchResultOutput, } from "./tools.cjs";
//# sourceMappingURL=index.d.ts.map