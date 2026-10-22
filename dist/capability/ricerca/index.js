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
export { CapabilityAgentIdSchema, AgentConfigVersionSchema, AgentTimeZoneSchema, CapabilityUsdSchema, CapabilityModelIdSchema, ResearchBudgetSchema, ResearchModelsSchema, ResearchEffortSchema, ResearchParamsSchema, SourceRuleSchema, ResearchAgentConfigSchema, } from "./agent-config.js";
export { ResearchIdSchema, WebUrlSchema, ResearchRequestSchema, ResearchStateSchema, ResearchSourceSchema, ResearchFindingSchema, ResearchCostSchema, ResearchResultSchema, } from "./research.js";
export { AgentDaySchema, SpendingCapabilitySchema, AgentSpendDaySchema } from "./spend.js";
export { RICERCA_TOOLS, RICERCA_INTERNAL_TOOLS, ResearchExecuteInputSchema, researchExecutePath, RicercaToolErrorSchema, ResearchStartInputSchema, ResearchStartOutputSchema, ResearchStatusInputSchema, ResearchStatusOutputSchema, ResearchResultInputSchema, ResearchResultOutputSchema, } from "./tools.js";
//# sourceMappingURL=index.js.map